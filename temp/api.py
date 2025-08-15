import os
import httpx
import logging

API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:8000')
API_KEY = os.getenv('API_KEY', 'your-strong-api-key')
HEADERS = {"X-API-KEY": API_KEY}

logger = logging.getLogger(__name__)

async def fetch_all_checkins():
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{API_BASE_URL}/checkins/", headers=HEADERS)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Failed to fetch checkins: {e}")
            return []

async def fetch_checkin_full(checkin_id: int):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{API_BASE_URL}/checkins/{checkin_id}/full", headers=HEADERS)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Failed to fetch checkin {checkin_id} full: {e}")
            return None

async def upsert_user(discord_user):
    """Upsert user in backend. discord_user is a discord.User object."""
    payload = {
        "discord_id": str(discord_user.id),
        "username": discord_user.name,
        "display_name": getattr(discord_user, 'display_name', None),
        "avatar_url": str(discord_user.avatar.url) if discord_user.avatar else None,
    }
    async with httpx.AsyncClient() as client:
        try:
            # Try to create
            resp = await client.post(f"{API_BASE_URL}/users/", json=payload, headers=HEADERS)
            if resp.status_code == 409:
                # Already exists, update
                user_id = resp.json().get('id')
                resp = await client.put(f"{API_BASE_URL}/users/{user_id}", json=payload, headers=HEADERS)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Failed to upsert user {discord_user.id}: {e}")
            return None

async def post_response(response_data):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(f"{API_BASE_URL}/responses/", json=response_data, headers=HEADERS)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Failed to post response: {e}")
            return None 