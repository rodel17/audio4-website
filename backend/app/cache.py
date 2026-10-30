"""Redis helpers: response caching and rate limiting.

Public responses are cached under a version number. Any admin save bumps the version,
which makes every older cache entry unreachable at once (they then expire on their own).
"""

import json
import logging
from collections.abc import Callable
from typing import Any

import redis

from .config import CACHE_TTL_SECONDS, REDIS_URL

log = logging.getLogger(__name__)

r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

_VERSION_KEY = "cache:version"


def _version() -> str:
    return r.get(_VERSION_KEY) or "0"


def cached(key: str, build: Callable[[], Any]) -> Any:
    """Return the cached JSON value for `key`, building and storing it on a miss.

    If Redis is unavailable the value is built directly, so the site keeps working.
    """
    try:
        full_key = f"cache:{_version()}:{key}"
        hit = r.get(full_key)
        if hit is not None:
            return json.loads(hit)
    except redis.RedisError:
        log.warning("Redis unavailable; serving %s uncached", key)
        return build()
    value = build()
    try:
        r.set(full_key, json.dumps(value, default=str), ex=CACHE_TTL_SECONDS)
    except redis.RedisError:
        pass
    return value


def invalidate() -> None:
    """Drop all cached public responses (call after any content or catalog change)."""
    try:
        r.incr(_VERSION_KEY)
    except redis.RedisError:
        log.warning("Redis unavailable; cache not invalidated")


def hit_rate_limit(bucket: str, limit: int, window_seconds: int) -> bool:
    """Count one attempt in `bucket`; True when the limit for the window is exceeded."""
    key = f"ratelimit:{bucket}"
    try:
        count = r.incr(key)
        if count == 1:
            r.expire(key, window_seconds)
        return count > limit
    except redis.RedisError:
        # Fail open: an outage shouldn't block customers from sending inquiries.
        return False
