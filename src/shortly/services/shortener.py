"""Business logic for creating and resolving short links."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from shortly import base62
from shortly.config import get_settings
from shortly.models.link import Link
from shortly.schemas.link import LinkCreate
from shortly.security import hash_password


class AliasAlreadyExistsError(Exception):
    """Raised when a requested custom alias is already in use."""


class LinkNotFoundError(Exception):
    """Raised when a short code does not resolve to a link."""


class LinkExpiredError(Exception):
    """Raised when a link has expired or been deactivated."""


class PasswordRequiredError(Exception):
    """Raised when a protected link is accessed without (or with the wrong) password."""


async def create_link(
    db: AsyncSession,
    *,
    payload: LinkCreate,
    owner_id: int | None = None,
) -> Link:
    """Create a new short link.

    Strategy:
    * If ``custom_alias`` is provided, insert with that code; rely on the unique
      constraint to surface conflicts.
    * Otherwise insert without a code, flush to get the auto-incremented ``id``,
      then derive the Base62 code from ``id + offset``.
    """
    settings = get_settings()
    target = str(payload.target_url)
    expires_at = _normalize_expiry(payload.expires_at)
    password_hash = hash_password(payload.password) if payload.password else None

    if payload.custom_alias:
        link = Link(
            code=payload.custom_alias,
            target_url=target,
            is_custom=True,
            owner_id=owner_id,
            expires_at=expires_at,
            password_hash=password_hash,
        )
        db.add(link)
        try:
            await db.commit()
        except IntegrityError as exc:
            await db.rollback()
            raise AliasAlreadyExistsError(payload.custom_alias) from exc
        await db.refresh(link)
        return link

    link = Link(
        code="",  # placeholder, replaced after we get the id
        target_url=target,
        is_custom=False,
        owner_id=owner_id,
        expires_at=expires_at,
        password_hash=password_hash,
    )
    db.add(link)
    await db.flush()
    link.code = base62.encode_id(
        link.id,
        offset=settings.short_code_id_offset,
        min_length=settings.short_code_min_length,
    )
    await db.commit()
    await db.refresh(link)
    return link


async def get_link_by_code(db: AsyncSession, code: str) -> Link | None:
    """Return the link with the given short code, or ``None`` if not found."""
    result = await db.execute(select(Link).where(Link.code == code))
    return result.scalar_one_or_none()


async def resolve_for_redirect(db: AsyncSession, code: str) -> Link:
    """Return a link suitable for redirect or raise a domain error."""
    link = await get_link_by_code(db, code)
    if link is None or not link.is_active:
        raise LinkNotFoundError(code)
    if link.expires_at is not None:
        expires = link.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=UTC)
        if expires <= datetime.now(UTC):
            raise LinkExpiredError(code)
    if link.password_hash:
        raise PasswordRequiredError(code)
    return link


def _normalize_expiry(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)
    if value <= datetime.now(UTC):
        raise ValueError("expires_at must be in the future")
    return value
