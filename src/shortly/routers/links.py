"""Routes for creating and managing short links."""

from __future__ import annotations

import io
from datetime import UTC, datetime
from typing import Annotated

import qrcode
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import delete, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from shortly.config import get_settings
from shortly.deps import (
    CurrentUser,
    DBSession,
    OptionalUser,
    rate_limit,
)
from shortly.models.link import Link
from shortly.schemas.link import LinkCreate, LinkOut, LinkStats, LinkUpdate
from shortly.services import analytics
from shortly.services.shortener import (
    AliasAlreadyExistsError,
    create_link,
    get_link_by_code,
)

router = APIRouter(prefix="/api/links", tags=["links"])

shorten_rate_limit = rate_limit("shorten", "rate_limit_shorten_per_minute")


def _to_out(link: Link) -> LinkOut:
    settings = get_settings()
    short_url = f"{settings.app_base_url.rstrip('/')}/{link.code}"
    return LinkOut(
        id=link.id,
        code=link.code,
        target_url=link.target_url,
        short_url=short_url,
        is_custom=link.is_custom,
        is_active=link.is_active,
        has_password=link.password_hash is not None,
        expires_at=link.expires_at,
        created_at=link.created_at,
        updated_at=link.updated_at,
    )


@router.post(
    "",
    response_model=LinkOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(shorten_rate_limit)],
)
async def shorten(
    payload: LinkCreate,
    db: DBSession,
    user: OptionalUser,
) -> LinkOut:
    """Create a new short link.

    Authentication is optional: anonymous callers can shorten URLs but won't be
    able to manage them later. Authenticated callers own the resulting link.
    """
    try:
        link = await create_link(db, payload=payload, owner_id=user.id if user else None)
    except AliasAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Alias {exc.args[0]!r} is already taken",
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return _to_out(link)


async def _purge_expired_links(db: AsyncSession, owner_id: int) -> None:
    """Hard-delete any of this owner's links whose ``expires_at`` is in the past.

    Called on dashboard reads so stale entries drop off automatically without
    requiring the user to clean up by hand. Cascades remove their click rows.
    """
    now = datetime.now(UTC)
    stmt = delete(Link).where(
        Link.owner_id == owner_id,
        Link.expires_at.is_not(None),
        Link.expires_at <= now,
    )
    await db.execute(stmt)
    await db.commit()


@router.get("", response_model=list[LinkOut])
async def list_my_links(
    db: DBSession,
    user: CurrentUser,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[LinkOut]:
    await _purge_expired_links(db, user.id)
    stmt = (
        select(Link)
        .where(Link.owner_id == user.id)
        .order_by(desc(Link.created_at))
        .limit(limit)
        .offset(offset)
    )
    rows = (await db.scalars(stmt)).all()
    return [_to_out(link) for link in rows]


@router.get("/{code}", response_model=LinkOut)
async def get_link(code: str, db: DBSession) -> LinkOut:
    link = await get_link_by_code(db, code)
    if link is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
    return _to_out(link)


@router.patch("/{code}", response_model=LinkOut)
async def update_link(
    code: str,
    payload: LinkUpdate,
    db: DBSession,
    user: CurrentUser,
) -> LinkOut:
    link = await get_link_by_code(db, code)
    if link is None or link.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")

    if payload.target_url is not None:
        link.target_url = str(payload.target_url)
    if payload.is_active is not None:
        link.is_active = payload.is_active
    if payload.expires_at is not None:
        link.expires_at = payload.expires_at

    await db.commit()
    await db.refresh(link)
    return _to_out(link)


@router.delete("/{code}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_link(code: str, db: DBSession, user: CurrentUser) -> None:
    link = await get_link_by_code(db, code)
    if link is None or link.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
    await db.delete(link)
    await db.commit()


@router.get("/{code}/stats", response_model=LinkStats)
async def link_stats(code: str, db: DBSession, user: CurrentUser) -> LinkStats:
    link = await get_link_by_code(db, code)
    if link is None or link.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
    return await analytics.compute_stats(db, link)


@router.get("/{code}/qr")
async def link_qr(code: str, db: DBSession) -> StreamingResponse:
    """Return a PNG QR code for the short URL."""
    link = await get_link_by_code(db, code)
    if link is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
    settings = get_settings()
    short_url = f"{settings.app_base_url.rstrip('/')}/{link.code}"
    img = qrcode.make(short_url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")
