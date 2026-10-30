"""Admin authentication: scrypt password hashes and Redis-backed sessions in an httpOnly cookie."""

import hashlib
import hmac
import secrets

import redis
from fastapi import Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from .cache import r
from .config import COOKIE_SECURE, SESSION_COOKIE, SESSION_TTL_SECONDS
from .db import get_db
from .models import User

_SCRYPT = {"n": 2**14, "r": 8, "p": 1}


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, **_SCRYPT)
    return f"scrypt${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, salt_hex, digest_hex = stored.split("$")
    except ValueError:
        return False
    if scheme != "scrypt":
        return False
    digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), **_SCRYPT)
    return hmac.compare_digest(digest.hex(), digest_hex)


def _session_key(token: str) -> str:
    # Only a hash of the cookie value is used as the Redis key.
    return "session:" + hashlib.sha256(token.encode()).hexdigest()


def start_session(response: Response, user: User) -> None:
    token = secrets.token_urlsafe(32)
    r.set(_session_key(token), str(user.id), ex=SESSION_TTL_SECONDS)
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_TTL_SECONDS,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/",
    )


def end_session(request: Request, response: Response) -> None:
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        try:
            r.delete(_session_key(token))
        except redis.RedisError:
            pass
    response.delete_cookie(SESSION_COOKIE, path="/")


def require_admin(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not signed in")
    try:
        user_id = r.get(_session_key(token))
    except redis.RedisError:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Session store unavailable")
    user = db.get(User, int(user_id)) if user_id else None
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired")
    return user


def client_ip(request: Request) -> str:
    # Requests arrive through the Next.js proxy, which appends the visitor's address last.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"
