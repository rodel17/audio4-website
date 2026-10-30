"""Create tables and seed a fresh database. Run once before starting the server:

    python -m app.init_db
"""

import json
import logging
import secrets
from pathlib import Path

from sqlalchemy import func, select

from . import models  # noqa: F401  (registers the tables)
from .auth import hash_password
from .config import ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, UPLOAD_DIR
from .db import Base, SessionLocal, engine
from .models import Category, Product, Service, User

log = logging.getLogger("init_db")

SEED_FILE = Path(__file__).with_name("seed_data.json")


def seed_catalog(db) -> None:
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    by_slug: dict[str, Category] = {}
    for i, c in enumerate(data["categories"]):
        cat = Category(slug=c["slug"], name=c["name"], description=c["description"], icon=c["icon"], sort_order=i)
        db.add(cat)
        by_slug[cat.slug] = cat
    for i, p in enumerate(data["products"]):
        db.add(
            Product(
                slug=p["slug"], name=p["name"], category=by_slug[p["category"]], summary=p["summary"],
                description=p["description"], highlights=p["highlights"], specs=p["specs"],
                images=[], featured=bool(p.get("featured")), published=True, sort_order=i,
            )
        )
    for i, s in enumerate(data["services"]):
        db.add(Service(slug=s["slug"], name=s["name"], summary=s["summary"], includes=s["includes"], icon=s["icon"], sort_order=i))
    log.info("Seeded %d categories, %d products, %d services", len(data["categories"]), len(data["products"]), len(data["services"]))


def ensure_admin(db) -> None:
    if db.scalar(select(func.count()).select_from(User)):
        return
    password = ADMIN_PASSWORD or secrets.token_urlsafe(12)
    db.add(User(email=ADMIN_EMAIL.lower(), name=ADMIN_NAME, password_hash=hash_password(password)))
    if ADMIN_PASSWORD:
        log.info("Created admin account %s", ADMIN_EMAIL)
    else:
        log.warning("Created admin account %s with generated password: %s  (change it by setting ADMIN_PASSWORD before first start)", ADMIN_EMAIL, password)


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if not db.scalar(select(func.count()).select_from(Category)):
            seed_catalog(db)
        ensure_admin(db)
        db.commit()


if __name__ == "__main__":
    main()
