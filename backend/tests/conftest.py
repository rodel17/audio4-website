"""Test setup.

The tests wipe and re-seed a database and flush a Redis database, so they only run against
disposable ones given by TEST_DATABASE_URL (its name must contain "test") and TEST_REDIS_URL
(a non-zero Redis database number). The environment is set here, before the app is imported,
because app.config reads it at import time.
"""

import os
import tempfile
from urllib.parse import urlparse

import pytest

TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL", "")
TEST_REDIS_URL = os.environ.get("TEST_REDIS_URL", "redis://localhost:6379/15")

if "test" not in urlparse(TEST_DATABASE_URL).path:
    pytest.exit(
        "Set TEST_DATABASE_URL to a disposable database whose name contains 'test', "
        "e.g. postgresql+psycopg://audio4:audio4@localhost:5432/audio4_test",
        returncode=2,
    )
if urlparse(TEST_REDIS_URL).path.strip("/") in ("", "0"):
    pytest.exit("TEST_REDIS_URL must use a non-zero Redis database, e.g. redis://localhost:6379/15", returncode=2)

ADMIN_EMAIL = "admin@test.local"
ADMIN_PASSWORD = "test-password-123"

os.environ.update(
    DATABASE_URL=TEST_DATABASE_URL,
    REDIS_URL=TEST_REDIS_URL,
    UPLOAD_DIR=tempfile.mkdtemp(prefix="audio4-test-uploads-"),
    ADMIN_EMAIL=ADMIN_EMAIL,
    ADMIN_PASSWORD=ADMIN_PASSWORD,
    COOKIE_SECURE="false",
    SMTP_HOST="",  # never send real email from tests
)

from fastapi.testclient import TestClient  # noqa: E402

from app import init_db  # noqa: E402
from app.cache import r  # noqa: E402
from app.db import Base, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def database():
    """Fresh schema with the sample catalog and the test admin, once per test run."""
    Base.metadata.drop_all(engine)
    init_db.main()
    yield
    engine.dispose()


@pytest.fixture(autouse=True)
def clean_redis():
    """Each test starts with no cache, sessions or rate-limit counters."""
    r.flushdb()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def admin(client):
    """A client signed in as the admin."""
    res = client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert res.status_code == 200, res.text
    return client


def png_upload(size: int = 64) -> dict:
    data = b"\x89PNG\r\n\x1a\n" + b"\x00" * (size - 8)
    return {"file": ("photo.png", data, "image/png")}
