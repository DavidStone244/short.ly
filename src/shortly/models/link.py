"""Short link model."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shortly.database import Base, TimestampMixin

if TYPE_CHECKING:
    from shortly.models.click import Click
    from shortly.models.user import User


class Link(Base, TimestampMixin):
    """A single shortened URL.

    The ``code`` column stores the public Base62 short code. For codes derived
    from the auto-increment ID we set ``code`` after insert; for custom aliases
    the caller supplies the value directly.
    """

    __tablename__ = "links"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        autoincrement=True,
    )
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    target_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)

    owner_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    owner: Mapped[User | None] = relationship("User", back_populates="links", lazy="joined")
    clicks: Mapped[list[Click]] = relationship(
        "Click",
        back_populates="link",
        cascade="all, delete-orphan",
        lazy="noload",
    )

    def __repr__(self) -> str:
        return f"<Link id={self.id} code={self.code!r} target={self.target_url!r}>"
