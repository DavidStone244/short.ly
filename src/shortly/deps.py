"""Reusable FastAPI dependencies."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shortly.config import Settings, get_settings
from shortly.database import get_db
from shortly.models.user import User
from shortly.ratelimit import RateLimiter, get_rate_limiter
from shortly.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

DBSession = Annotated[AsyncSession, Depends(get_db)]
SettingsDep = Annotated[Settings, Depends(get_settings)]
LimiterDep = Annotated[RateLimiter, Depends(get_rate_limiter)]


async def get_current_user(
    db: DBSession,
    token: Annotated[str | None, Depends(oauth2_scheme)],
) -> User:
    """Resolve the current user from a Bearer token."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = await db.scalar(select(User).where(User.id == int(payload["sub"])))
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")
    return user


async def get_optional_user(
    db: DBSession,
    token: Annotated[str | None, Depends(oauth2_scheme)],
) -> User | None:
    """Resolve the current user if a token is present; otherwise return ``None``."""
    if not token:
        return None
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        return None
    user: User | None = await db.scalar(select(User).where(User.id == int(payload["sub"])))
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalUser = Annotated["User | None", Depends(get_optional_user)]


def client_ip(request: Request) -> str:
    """Best-effort client IP extraction (respects ``X-Forwarded-For``)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def rate_limit(scope: str, limit_attr: str) -> Callable[..., Awaitable[None]]:
    """Build a dependency that enforces a fixed-window rate limit per IP."""

    async def _dep(
        request: Request,
        limiter: LimiterDep,
        settings: SettingsDep,
    ) -> None:
        limit = int(getattr(settings, limit_attr))
        identifier = client_ip(request)
        result = await limiter.hit(scope, identifier, limit)
        if not result.allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded",
                headers={"Retry-After": str(max(result.reset_at - 1, 1))},
            )

    return _dep
