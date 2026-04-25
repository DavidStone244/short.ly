"""Schemas for the link API."""

from __future__ import annotations

import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

CUSTOM_ALIAS_PATTERN = re.compile(r"^[A-Za-z0-9_-]{3,64}$")
RESERVED_ALIASES = frozenset(
    {
        "api",
        "auth",
        "docs",
        "openapi.json",
        "redoc",
        "health",
        "static",
        "admin",
        "favicon.ico",
    }
)


class LinkBase(BaseModel):
    target_url: HttpUrl


class LinkCreate(LinkBase):
    custom_alias: str | None = Field(default=None, description="Optional custom short code")
    expires_at: datetime | None = Field(default=None, description="Optional expiration timestamp")
    password: str | None = Field(
        default=None,
        min_length=4,
        max_length=128,
        description="Optional password required to follow this link",
    )

    @field_validator("custom_alias")
    @classmethod
    def _validate_alias(cls, value: str | None) -> str | None:
        if value is None:
            return None
        if value.lower() in RESERVED_ALIASES:
            raise ValueError(f"alias {value!r} is reserved")
        if not CUSTOM_ALIAS_PATTERN.fullmatch(value):
            raise ValueError(
                "custom_alias must be 3-64 chars of letters, digits, dashes or underscores",
            )
        return value


class LinkUpdate(BaseModel):
    target_url: HttpUrl | None = None
    is_active: bool | None = None
    expires_at: datetime | None = None


class LinkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    target_url: str
    short_url: str
    is_custom: bool
    is_active: bool
    has_password: bool
    expires_at: datetime | None
    created_at: datetime
    updated_at: datetime


class LinkPasswordVerify(BaseModel):
    password: str = Field(min_length=1, max_length=128)


class LinkStats(BaseModel):
    code: str
    total_clicks: int
    unique_visitors: int
    last_clicked_at: datetime | None
    top_referrers: list[tuple[str, int]]
    top_browsers: list[tuple[str, int]]
    top_os: list[tuple[str, int]]
    clicks_by_day: list[tuple[str, int]]
