"""FastAPI application factory and entry point."""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from shortly import __version__
from shortly.config import Settings, get_settings
from shortly.database import Base, get_engine
from shortly.routers import auth, links, redirect

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Initialize the database schema on startup (for non-prod environments).

    In production, schema management is handled by Alembic migrations
    (``alembic upgrade head`` runs as part of the deploy). For development
    and tests we create tables directly so ``uvicorn shortly.main:app`` works
    out of the box.
    """
    settings: Settings = app.state.settings
    if settings.environment in {"development", "test"}:
        engine = get_engine()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield


def create_app(settings: Settings | None = None) -> FastAPI:
    """Application factory."""
    settings = settings or get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=__version__,
        description="An industry-standard URL shortener.",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )
    app.state.settings = settings

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", tags=["meta"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "version": __version__}

    @app.get("/", tags=["meta"], include_in_schema=False)
    async def root() -> dict[str, str]:
        return {
            "name": settings.app_name,
            "version": __version__,
            "docs": "/docs",
        }

    app.include_router(auth.router)
    app.include_router(links.router)
    # NB: redirect.router includes a catch-all `/{code}` route, so it must be
    # registered last so that more specific routes (auth, links, meta) take
    # precedence.
    app.include_router(redirect.router)

    @app.exception_handler(ValueError)
    async def value_error_handler(_: Request, exc: ValueError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": str(exc)},
        )

    return app


app = create_app()
