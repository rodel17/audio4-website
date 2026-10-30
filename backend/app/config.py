import os
from pathlib import Path


def _flag(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes"}


DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://audio4:audio4@localhost:5432/audio4")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Uploaded images live here (a Docker volume in compose).
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads"))
MAX_UPLOAD_BYTES = 5 * 1024 * 1024

# First admin account, created on first start. Leave the password empty to have one generated and logged.
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
ADMIN_NAME = os.getenv("ADMIN_NAME", "Administrator")

SESSION_COOKIE = "a4d_session"
SESSION_TTL_SECONDS = int(os.getenv("SESSION_DAYS", "7")) * 24 * 3600
# Set to true when the site is served over HTTPS.
COOKIE_SECURE = _flag("COOKIE_SECURE")

# How long public API responses stay cached in Redis. Admin saves clear the cache immediately.
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "300"))

CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]

# Optional SMTP settings for inquiry emails. Without SMTP_HOST, emails are skipped.
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "")
SMTP_STARTTLS = _flag("SMTP_STARTTLS", True)
