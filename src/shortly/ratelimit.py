"""Simple Redis-backed fixed-window rate limiter.

Falls back to an in-process counter when Redis is not configured (useful for
tests and local development without a Redis server). The implementation is
intentionally minimal: a fixed-window counter keyed by ``"<scope>:<id>"`` with
a 60-second TTL. For production-grade limiting you'd switch to a token-bucket
or sliding-window algorithm.
"""

from __future__ import annotations

import time
from collections import defaultdict
from dataclasses import dataclass
from typing import Protocol

import redis.asyncio as redis_async

from shortly.config import get_settings


@dataclass(slots=True)
class RateLimitResult:
    allowed: bool
    remaining: int
    reset_at: int


class RateLimiter(Protocol):
    async def hit(self, scope: str, identifier: str, limit: int) -> RateLimitResult: ...


class _InMemoryRateLimiter:
    """Naive in-process limiter. Single-process only — fine for tests."""

    def __init__(self) -> None:
        self._buckets: dict[str, tuple[int, float]] = defaultdict(lambda: (0, 0.0))

    async def hit(self, scope: str, identifier: str, limit: int) -> RateLimitResult:
        key = f"{scope}:{identifier}"
        now = time.time()
        window = 60
        count, window_start = self._buckets[key]
        if now - window_start >= window:
            count = 0
            window_start = now
        count += 1
        self._buckets[key] = (count, window_start)
        reset_at = int(window_start + window)
        if count > limit:
            return RateLimitResult(allowed=False, remaining=0, reset_at=reset_at)
        return RateLimitResult(allowed=True, remaining=limit - count, reset_at=reset_at)


class _RedisRateLimiter:
    def __init__(self, client: redis_async.Redis) -> None:
        self._client = client

    async def hit(self, scope: str, identifier: str, limit: int) -> RateLimitResult:
        key = f"ratelimit:{scope}:{identifier}"
        pipe = self._client.pipeline()
        pipe.incr(key, 1)
        pipe.expire(key, 60, nx=True)
        pipe.ttl(key)
        count, _expire_set, ttl = await pipe.execute()
        ttl_int = int(ttl) if ttl and int(ttl) > 0 else 60
        reset_at = int(time.time()) + ttl_int
        count_int = int(count)
        if count_int > limit:
            return RateLimitResult(allowed=False, remaining=0, reset_at=reset_at)
        return RateLimitResult(allowed=True, remaining=limit - count_int, reset_at=reset_at)


_limiter: RateLimiter | None = None


def get_rate_limiter() -> RateLimiter:
    """Return the configured rate limiter, building it on first use."""
    global _limiter
    if _limiter is not None:
        return _limiter

    settings = get_settings()
    if settings.redis_url and not settings.is_test:
        client: redis_async.Redis = redis_async.from_url(
            settings.redis_url,
            decode_responses=True,
        )
        _limiter = _RedisRateLimiter(client)
    else:
        _limiter = _InMemoryRateLimiter()
    return _limiter


def reset_rate_limiter() -> None:
    """Reset the cached limiter. Used in tests."""
    global _limiter
    _limiter = None
