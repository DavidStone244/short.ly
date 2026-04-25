"""Tests for shortening, redirecting, and managing links."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from httpx import AsyncClient


async def test_shorten_anonymous_creates_link(client: AsyncClient) -> None:
    resp = await client.post("/api/links", json={"target_url": "https://example.com/foo"})
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["target_url"] == "https://example.com/foo"
    assert len(body["code"]) >= 6
    assert body["short_url"].endswith(body["code"])
    assert body["is_custom"] is False
    assert body["has_password"] is False


async def test_shorten_with_custom_alias(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/links",
        json={"target_url": "https://example.com/", "custom_alias": "my-alias"},
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["code"] == "my-alias"
    assert resp.json()["is_custom"] is True


async def test_shorten_duplicate_alias_returns_409(client: AsyncClient) -> None:
    payload = {"target_url": "https://example.com/", "custom_alias": "dup-alias"}
    first = await client.post("/api/links", json=payload)
    assert first.status_code == 201
    second = await client.post("/api/links", json=payload)
    assert second.status_code == 409


async def test_reserved_alias_rejected(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/links",
        json={"target_url": "https://example.com/", "custom_alias": "api"},
    )
    assert resp.status_code == 422


async def test_invalid_alias_chars_rejected(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/links",
        json={"target_url": "https://example.com/", "custom_alias": "bad alias!"},
    )
    assert resp.status_code == 422


async def test_redirect_returns_307(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/links",
        json={"target_url": "https://example.com/landing"},
    )
    code = resp.json()["code"]

    follow = await client.get(f"/{code}", follow_redirects=False)
    assert follow.status_code == 307
    assert follow.headers["location"] == "https://example.com/landing"


async def test_redirect_404_for_unknown_code(client: AsyncClient) -> None:
    resp = await client.get("/does-not-exist", follow_redirects=False)
    assert resp.status_code == 404


async def test_expired_link_returns_410(client: AsyncClient) -> None:
    future = (datetime.now(UTC) + timedelta(seconds=1)).isoformat()
    resp = await client.post(
        "/api/links",
        json={"target_url": "https://example.com/", "expires_at": future},
    )
    assert resp.status_code == 201
    code = resp.json()["code"]

    # Manually expire by patching the database row through the link model.
    from shortly.database import get_sessionmaker
    from shortly.services.shortener import get_link_by_code

    sm = get_sessionmaker()
    async with sm() as session:
        link = await get_link_by_code(session, code)
        assert link is not None
        link.expires_at = datetime.now(UTC) - timedelta(seconds=1)
        await session.commit()

    follow = await client.get(f"/{code}", follow_redirects=False)
    assert follow.status_code == 410


async def test_password_protected_link_blocks_redirect(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/links",
        json={"target_url": "https://example.com/", "password": "hunter2"},
    )
    code = resp.json()["code"]

    follow = await client.get(f"/{code}", follow_redirects=False)
    assert follow.status_code == 401

    wrong = await client.post(f"/api/links/{code}/unlock", json={"password": "nope"})
    assert wrong.status_code == 401

    correct = await client.post(f"/api/links/{code}/unlock", json={"password": "hunter2"})
    assert correct.status_code == 200
    assert correct.json()["target_url"] == "https://example.com/"


async def test_qr_endpoint_returns_png(client: AsyncClient) -> None:
    resp = await client.post("/api/links", json={"target_url": "https://example.com/"})
    code = resp.json()["code"]
    qr = await client.get(f"/api/links/{code}/qr")
    assert qr.status_code == 200
    assert qr.headers["content-type"] == "image/png"
    assert qr.content[:8] == b"\x89PNG\r\n\x1a\n"


async def test_health_endpoint(client: AsyncClient) -> None:
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
