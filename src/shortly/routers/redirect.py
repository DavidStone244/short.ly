"""The public redirect endpoint that powers the short.ly/<code> URLs."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse

from shortly.deps import DBSession, client_ip, rate_limit
from shortly.schemas.link import LinkPasswordVerify
from shortly.security import verify_password
from shortly.services import analytics
from shortly.services.shortener import (
    LinkExpiredError,
    LinkNotFoundError,
    PasswordRequiredError,
    get_link_by_code,
    resolve_for_redirect,
)

router = APIRouter(tags=["redirect"])

redirect_rate_limit = rate_limit("redirect", "rate_limit_per_minute")


@router.get("/{code}", include_in_schema=False, dependencies=[Depends(redirect_rate_limit)])
async def follow(code: str, request: Request, db: DBSession) -> RedirectResponse:
    try:
        link = await resolve_for_redirect(db, code)
    except LinkNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found") from exc
    except LinkExpiredError as exc:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Link has expired") from exc
    except PasswordRequiredError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This link is password-protected. POST /api/links/{code}/unlock first.",
        ) from exc

    await analytics.record_click(
        db,
        link=link,
        ip_address=client_ip(request),
        user_agent=request.headers.get("user-agent"),
        referrer=request.headers.get("referer"),
    )
    return RedirectResponse(url=link.target_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@router.post("/api/links/{code}/unlock", tags=["links"])
async def unlock_password_protected(
    code: str,
    payload: LinkPasswordVerify,
    request: Request,
    db: DBSession,
    _rl: Annotated[None, Depends(redirect_rate_limit)],
) -> dict[str, str]:
    """Verify a password and return the target URL for password-protected links."""
    link = await get_link_by_code(db, code)
    if link is None or not link.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
    if link.password_hash is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This link is not password-protected",
        )
    if not verify_password(payload.password, link.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )
    await analytics.record_click(
        db,
        link=link,
        ip_address=client_ip(request),
        user_agent=request.headers.get("user-agent"),
        referrer=request.headers.get("referer"),
    )
    return {"target_url": link.target_url}
