"""Click recording and aggregation."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy import distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import InstrumentedAttribute
from user_agents import parse as parse_ua

from shortly.models.click import Click
from shortly.models.link import Link
from shortly.schemas.link import LinkStats


async def record_click(
    db: AsyncSession,
    *,
    link: Link,
    ip_address: str | None,
    user_agent: str | None,
    referrer: str | None,
) -> None:
    """Persist a click event for a link."""
    device_family: str | None = None
    browser_family: str | None = None
    os_family: str | None = None
    if user_agent:
        ua = parse_ua(user_agent)
        device_family = ua.device.family
        browser_family = ua.browser.family
        os_family = ua.os.family

    click = Click(
        link_id=link.id,
        ip_address=ip_address,
        user_agent=user_agent[:512] if user_agent else None,
        referrer=referrer[:2048] if referrer else None,
        device_family=device_family,
        browser_family=browser_family,
        os_family=os_family,
    )
    db.add(click)
    await db.commit()


async def compute_stats(db: AsyncSession, link: Link) -> LinkStats:
    """Aggregate analytics data for a single link."""
    total_q = select(func.count(Click.id)).where(Click.link_id == link.id)
    total = (await db.execute(total_q)).scalar_one()

    unique_q = select(func.count(distinct(Click.ip_address))).where(Click.link_id == link.id)
    unique_visitors = (await db.execute(unique_q)).scalar_one()

    last_q = select(func.max(Click.occurred_at)).where(Click.link_id == link.id)
    last_clicked_at_raw = (await db.execute(last_q)).scalar()
    last_clicked_at: datetime | None = (
        last_clicked_at_raw if isinstance(last_clicked_at_raw, datetime) else None
    )

    top_referrers = await _top_n(db, link.id, Click.referrer)
    top_browsers = await _top_n(db, link.id, Click.browser_family)
    top_os = await _top_n(db, link.id, Click.os_family)
    by_day = await _clicks_by_day(db, link.id)

    return LinkStats(
        code=link.code,
        total_clicks=int(total or 0),
        unique_visitors=int(unique_visitors or 0),
        last_clicked_at=last_clicked_at,
        top_referrers=top_referrers,
        top_browsers=top_browsers,
        top_os=top_os,
        clicks_by_day=by_day,
    )


async def _top_n(
    db: AsyncSession,
    link_id: int,
    column: InstrumentedAttribute[Any],
    limit: int = 5,
) -> list[tuple[str, int]]:
    stmt = (
        select(column, func.count(Click.id))
        .where(Click.link_id == link_id, column.isnot(None))
        .group_by(column)
        .order_by(func.count(Click.id).desc())
        .limit(limit)
    )
    rows = (await db.execute(stmt)).all()
    return [(str(row[0]), int(row[1])) for row in rows]


async def _clicks_by_day(
    db: AsyncSession,
    link_id: int,
    days: int = 30,
) -> list[tuple[str, int]]:
    cutoff = datetime.now(UTC) - timedelta(days=days)
    bucket = func.date(Click.occurred_at).label("day")
    stmt = (
        select(bucket, func.count(Click.id))
        .where(Click.link_id == link_id, Click.occurred_at >= cutoff)
        .group_by(bucket)
        .order_by(bucket)
    )
    rows = (await db.execute(stmt)).all()
    return [(str(row[0]), int(row[1])) for row in rows]
