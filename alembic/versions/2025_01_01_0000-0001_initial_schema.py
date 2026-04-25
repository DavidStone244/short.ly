"""initial schema

Revision ID: 0001
Revises:
Create Date: 2025-01-01 00:00:00

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_superuser", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "links",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("target_url", sa.String(length=2048), nullable=False),
        sa.Column("is_custom", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("owner_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["owner_id"], ["users.id"], ondelete="CASCADE", name="fk_links_owner_id_users"
        ),
        sa.UniqueConstraint("code", name="uq_links_code"),
    )
    op.create_index("ix_links_code", "links", ["code"], unique=True)
    op.create_index("ix_links_owner_id", "links", ["owner_id"])

    op.create_table(
        "clicks",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("link_id", sa.BigInteger(), nullable=False),
        sa.Column(
            "occurred_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column("referrer", sa.String(length=2048), nullable=True),
        sa.Column("country", sa.String(length=2), nullable=True),
        sa.Column("device_family", sa.String(length=64), nullable=True),
        sa.Column("browser_family", sa.String(length=64), nullable=True),
        sa.Column("os_family", sa.String(length=64), nullable=True),
        sa.ForeignKeyConstraint(
            ["link_id"], ["links.id"], ondelete="CASCADE", name="fk_clicks_link_id_links"
        ),
    )
    op.create_index("ix_clicks_link_id", "clicks", ["link_id"])
    op.create_index("ix_clicks_occurred_at", "clicks", ["occurred_at"])


def downgrade() -> None:
    op.drop_index("ix_clicks_occurred_at", table_name="clicks")
    op.drop_index("ix_clicks_link_id", table_name="clicks")
    op.drop_table("clicks")
    op.drop_index("ix_links_owner_id", table_name="links")
    op.drop_index("ix_links_code", table_name="links")
    op.drop_table("links")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
