from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import client_ip, end_session, require_admin, start_session, verify_password
from ..cache import hit_rate_limit
from ..db import get_db
from ..models import User
from ..schemas import LoginIn, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_out(user: User) -> dict:
    return UserOut(id=user.id, email=user.email, name=user.name).model_dump(by_alias=True)


@router.post("/login")
def login(data: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)) -> dict:
    email = data.email.strip().lower()
    if hit_rate_limit(f"login:{client_ip(request)}", limit=10, window_seconds=900) or hit_rate_limit(
        f"login:{email}", limit=10, window_seconds=900
    ):
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many sign-in attempts. Try again in 15 minutes.")
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    start_session(response, user)
    return _user_out(user)


@router.post("/logout")
def logout(request: Request, response: Response) -> dict:
    end_session(request, response)
    return {"ok": True}


@router.get("/me")
def me(user: User = Depends(require_admin)) -> dict:
    return _user_out(user)
