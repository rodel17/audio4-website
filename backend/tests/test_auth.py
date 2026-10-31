"""Admin sign-in, sessions and rate limiting."""

import pytest

from .conftest import ADMIN_EMAIL, ADMIN_PASSWORD


@pytest.mark.parametrize(
    "method,path",
    [
        ("GET", "/api/auth/me"),
        ("GET", "/api/admin/dashboard"),
        ("GET", "/api/admin/products"),
        ("GET", "/api/admin/inquiries"),
        ("PUT", "/api/admin/content/site"),
        ("POST", "/api/admin/uploads"),
    ],
)
def test_admin_endpoints_require_sign_in(client, method, path):
    assert client.request(method, path).status_code == 401


def test_wrong_password_is_rejected(client):
    res = client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert res.status_code == 401


def test_sign_in_sets_an_http_only_session_cookie(client):
    res = client.post("/api/auth/login", json={"email": ADMIN_EMAIL.upper(), "password": ADMIN_PASSWORD})
    assert res.status_code == 200
    assert res.json()["email"] == ADMIN_EMAIL
    cookie = res.headers["set-cookie"].lower()
    assert "a4d_session=" in cookie and "httponly" in cookie and "samesite=lax" in cookie
    assert client.get("/api/auth/me").status_code == 200


def test_sign_out_ends_the_session(admin):
    assert admin.post("/api/auth/logout").status_code == 200
    assert admin.get("/api/auth/me").status_code == 401


def test_repeated_failed_sign_ins_are_rate_limited(client):
    statuses = [
        client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}).status_code
        for _ in range(11)
    ]
    assert statuses[:10] == [401] * 10
    assert statuses[10] == 429
