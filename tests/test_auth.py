"""Tests for user registration, login, and authenticated link management."""

from __future__ import annotations

from httpx import AsyncClient


async def _register_and_login(client: AsyncClient, email: str = "user@example.com") -> str:
    resp = await client.post(
        "/api/auth/register",
        json={"email": email, "password": "supersecret"},
    )
    assert resp.status_code == 201, resp.text

    login = await client.post(
        "/api/auth/login",
        data={"username": email, "password": "supersecret"},
    )
    assert login.status_code == 200, login.text
    return login.json()["access_token"]


async def test_register_returns_user(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/auth/register",
        json={"email": "alice@example.com", "password": "supersecret"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "alice@example.com"
    assert body["is_active"] is True
    assert "id" in body


async def test_duplicate_registration_returns_409(client: AsyncClient) -> None:
    payload = {"email": "dup@example.com", "password": "supersecret"}
    assert (await client.post("/api/auth/register", json=payload)).status_code == 201
    second = await client.post("/api/auth/register", json=payload)
    assert second.status_code == 409


async def test_login_with_wrong_password_returns_401(client: AsyncClient) -> None:
    await client.post(
        "/api/auth/register",
        json={"email": "bob@example.com", "password": "rightpass"},
    )
    resp = await client.post(
        "/api/auth/login",
        data={"username": "bob@example.com", "password": "WRONG"},
    )
    assert resp.status_code == 401


async def test_authenticated_user_can_list_their_links(client: AsyncClient) -> None:
    token = await _register_and_login(client, email="owner@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    create = await client.post(
        "/api/links",
        json={"target_url": "https://example.com/owned"},
        headers=headers,
    )
    assert create.status_code == 201

    listing = await client.get("/api/links", headers=headers)
    assert listing.status_code == 200
    items = listing.json()
    assert len(items) == 1
    assert items[0]["target_url"] == "https://example.com/owned"


async def test_listing_requires_auth(client: AsyncClient) -> None:
    resp = await client.get("/api/links")
    assert resp.status_code == 401


async def test_owner_can_delete_their_link(client: AsyncClient) -> None:
    token = await _register_and_login(client, email="del@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    create = await client.post(
        "/api/links",
        json={"target_url": "https://example.com/del"},
        headers=headers,
    )
    code = create.json()["code"]

    delete = await client.delete(f"/api/links/{code}", headers=headers)
    assert delete.status_code == 204

    follow = await client.get(f"/{code}", follow_redirects=False)
    assert follow.status_code == 404


async def test_non_owner_cannot_modify_link(client: AsyncClient) -> None:
    owner_token = await _register_and_login(client, email="owner2@example.com")
    create = await client.post(
        "/api/links",
        json={"target_url": "https://example.com/owned2"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    code = create.json()["code"]

    other_token = await _register_and_login(client, email="other@example.com")
    resp = await client.delete(
        f"/api/links/{code}",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert resp.status_code == 404


async def test_stats_endpoint_reflects_clicks(client: AsyncClient) -> None:
    token = await _register_and_login(client, email="stats@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    create = await client.post(
        "/api/links",
        json={"target_url": "https://example.com/stats"},
        headers=headers,
    )
    code = create.json()["code"]

    for _ in range(3):
        await client.get(f"/{code}", follow_redirects=False)

    stats = await client.get(f"/api/links/{code}/stats", headers=headers)
    assert stats.status_code == 200
    body = stats.json()
    assert body["code"] == code
    assert body["total_clicks"] >= 1  # at least one click was logged
