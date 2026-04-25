"""Shared pytest fixtures for short.ly."""

from __future__ import annotations

import os
from collections.abc import AsyncIterator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# Force test settings before anything imports the app.
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["REDIS_URL"] = ""
os.environ["SECRET_KEY"] = "test-secret-key-please-change"
os.environ["APP_BASE_URL"] = "http://testserver"

from shortly import database, ratelimit
from shortly.config import get_settings
from shortly.database import Base, get_db
from shortly.main import create_app


@pytest_asyncio.fixture
async def engine() -> AsyncIterator[None]:
    """Create an in-memory SQLite engine and tables for each test."""
    get_settings.cache_clear()
    database.reset_engine()
    ratelimit.reset_rate_limiter()

    test_engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    sessionmaker = async_sessionmaker(test_engine, expire_on_commit=False)
    database._engine = test_engine  # type: ignore[attr-defined]
    database._sessionmaker = sessionmaker  # type: ignore[attr-defined]
    try:
        yield
    finally:
        await test_engine.dispose()
        database.reset_engine()
        ratelimit.reset_rate_limiter()


@pytest_asyncio.fixture
async def db_session(engine: None) -> AsyncIterator[AsyncSession]:
    sm = database.get_sessionmaker()
    async with sm() as session:
        yield session


@pytest_asyncio.fixture
async def client(engine: None) -> AsyncIterator[AsyncClient]:
    app = create_app(get_settings())

    async def _override_db() -> AsyncIterator[AsyncSession]:
        sm = database.get_sessionmaker()
        async with sm() as session:
            yield session

    app.dependency_overrides[get_db] = _override_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        # Manually invoke the lifespan-equivalent table creation since ASGITransport
        # does not run the lifespan by default.
        yield c


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"
