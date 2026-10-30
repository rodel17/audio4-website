"""Admin account maintenance.

    docker compose exec backend python -m app.manage reset-password admin@example.com
    docker compose exec backend python -m app.manage create-admin you@company.com "Your Name"

A new random password is printed unless one is given with --password.
"""

import argparse
import secrets

from sqlalchemy import select

from .auth import hash_password
from .db import SessionLocal
from .models import User


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.manage")
    commands = parser.add_subparsers(dest="command", required=True)

    reset = commands.add_parser("reset-password", help="Set a new password for an admin account")
    reset.add_argument("email")
    reset.add_argument("--password")

    create = commands.add_parser("create-admin", help="Add another admin account")
    create.add_argument("email")
    create.add_argument("name")
    create.add_argument("--password")

    args = parser.parse_args()
    password = args.password or secrets.token_urlsafe(12)
    email = args.email.strip().lower()

    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == email))
        if args.command == "reset-password":
            if user is None:
                raise SystemExit(f"No admin account with email {email}")
            user.password_hash = hash_password(password)
        else:
            if user is not None:
                raise SystemExit(f"An admin account with email {email} already exists")
            db.add(User(email=email, name=args.name, password_hash=hash_password(password)))
        db.commit()

    print(f"{email}: password set to {password}" if not args.password else f"{email}: password updated")


if __name__ == "__main__":
    main()
