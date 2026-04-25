"""User registration and login routes."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from shortly.config import get_settings
from shortly.deps import DBSession
from shortly.models.user import User
from shortly.schemas.token import Token
from shortly.schemas.user import UserCreate, UserOut
from shortly.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: DBSession) -> User:
    user = User(email=payload.email.lower(), hashed_password=hash_password(payload.password))
    db.add(user)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        ) from exc
    await db.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(
    db: DBSession,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    settings = get_settings()
    email = form_data.username.lower()
    user = await db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    token = create_access_token(user.id)
    return Token(access_token=token, expires_in=settings.access_token_expire_minutes * 60)
