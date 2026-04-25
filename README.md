# short.ly

An industry-standard URL shortener built with **FastAPI**, **PostgreSQL**, **Redis**, and
**SQLAlchemy 2.0** (async). It supports anonymous and authenticated shortening, custom
aliases, link expiration, password-protected links, click analytics, QR-code generation,
and per-IP rate limiting.

```
POST /api/links              -> shorten a URL (auth optional)
GET  /{code}                 -> 307 redirect to the original URL
GET  /api/links/{code}       -> link metadata
GET  /api/links/{code}/stats -> click analytics (auth required, owner only)
GET  /api/links/{code}/qr    -> PNG QR code for the short URL
POST /api/links/{code}/unlock -> verify password for password-protected links
POST /api/auth/register      -> create an account
POST /api/auth/login         -> exchange credentials for a JWT
```

## Quick start

```bash
# 1. Spin up Postgres + Redis + API
docker compose up --build

# 2. Browse the interactive docs
open http://localhost:8000/docs

# 3. Shorten a link
curl -X POST http://localhost:8000/api/links \
     -H 'Content-Type: application/json' \
     -d '{"target_url": "https://en.wikipedia.org/wiki/URL_shortening"}'
```

## Local development (without Docker)

```bash
# Use uv (recommended) or pip
uv sync --extra dev          # or: pip install -e ".[dev]"
cp .env.example .env

# Bring up Postgres + Redis (via docker compose), then:
alembic upgrade head
uvicorn shortly.main:app --reload
```

## Architecture

```
src/shortly/
├── main.py             FastAPI factory + lifespan
├── config.py           Pydantic settings (env-driven)
├── database.py         Async SQLAlchemy engine, session, declarative base
├── deps.py             Reusable FastAPI dependencies (auth, rate limit, db)
├── security.py         Password hashing (bcrypt) + JWT helpers
├── base62.py           Compact, URL-safe ID encoding
├── ratelimit.py        Redis (or in-memory) fixed-window rate limiter
├── models/             ORM models (User, Link, Click)
├── schemas/            Pydantic request/response schemas
├── services/           Domain services (shortener, analytics)
└── routers/            HTTP endpoints (auth, links, redirect)
```

### How short codes are generated

Each link gets a primary-key auto-increment ID. We add a configurable offset
(`SHORT_CODE_ID_OFFSET`, default 10 000) and Base62-encode the result to produce
a compact `[0-9A-Za-z]+` code. Because IDs are unique by construction, codes
never collide and we never have to retry on conflict. Custom aliases bypass this
path and are stored verbatim, with a unique constraint on the column to surface
collisions cleanly via a `409`.

### Click analytics

Redirects log a `Click` row asynchronously. We parse the User-Agent for
device / browser / OS family, capture the `Referer` and remote IP, and store
everything in the `clicks` table. The `/api/links/{code}/stats` endpoint returns
totals, unique-visitor counts, top referrers/browsers/OS, and a 30-day daily
histogram.

### Rate limiting

A simple Redis-backed fixed-window limiter is keyed by client IP. Two windows
are exposed: a global `rate_limit_per_minute` (used by the redirect path) and
a tighter `rate_limit_shorten_per_minute` for write traffic. In tests the
limiter falls back to an in-process counter so we don't need Redis running.

## Running tests

```bash
uv run pytest                # or: pytest
uv run ruff check src tests
uv run mypy src
```

Tests use an in-memory SQLite database and the in-process rate limiter, so they
run with no external services.

## Deployment notes

- Run `alembic upgrade head` as part of your deploy step (the Dockerfile is
  ready for this; `docker compose` runs it automatically before `uvicorn`).
- Set `SECRET_KEY` to a long, random string. Never reuse the development value.
- Front the API with a reverse proxy that sets `X-Forwarded-For` so the
  rate limiter and click analytics record the real client IP.
- For high write traffic, move click logging onto a background worker queue
  (Celery / RQ / Arq) and have the redirect path enqueue events instead of
  writing directly to Postgres.

## License

MIT
