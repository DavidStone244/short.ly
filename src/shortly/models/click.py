"""Click event model used for analytics."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shortly.database import Base

if TYPE_CHECKING:
    from shortly.models.link import Link


class Click(Base):
    """A single redirect event for a short link."""

    __tablename__ = "clicks"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        autoincrement=True,
    )
    link_id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("links.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
        nullable=False,
    )
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(512), nullable=True)
    referrer: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    country: Mapped[str | None] = mapped_column(String(2), nullable=True)
    device_family: Mapped[str | None] = mapped_column(String(64), nullable=True)
    browser_family: Mapped[str | None] = mapped_column(String(64), nullable=True)
    os_family: Mapped[str | None] = mapped_column(String(64), nullable=True)

    link: Mapped[Link] = relationship("Link", back_populates="clicks")
