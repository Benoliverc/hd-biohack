"""Nominatim geocoding with DB cache and custom user-agent."""
from __future__ import annotations

import time
from typing import Any

import httpx
from sqlalchemy.orm import Session

from ..config import get_settings
from ..models import GeocodeCache

_last_call = 0.0

# Offline seed so V1 works even when Nominatim blocks datacenter IPs
SEED_CITIES: dict[str, dict[str, Any]] = {
    "montreal, canada": {
        "display_name": "Montreal, Quebec, Canada",
        "lat": 45.5017,
        "lon": -73.5673,
    },
    "montreal": {
        "display_name": "Montreal, Quebec, Canada",
        "lat": 45.5017,
        "lon": -73.5673,
    },
    "ulm, germany": {
        "display_name": "Ulm, Baden-Württemberg, Germany",
        "lat": 48.4011,
        "lon": 9.9876,
    },
    "hong kong": {
        "display_name": "Hong Kong",
        "lat": 22.3193,
        "lon": 114.1694,
    },
    "new york, usa": {
        "display_name": "New York, New York, United States",
        "lat": 40.7128,
        "lon": -74.0060,
    },
    "london, uk": {
        "display_name": "London, England, United Kingdom",
        "lat": 51.5074,
        "lon": -0.1278,
    },
    "bangkok, thailand": {
        "display_name": "Bangkok, Thailand",
        "lat": 13.7563,
        "lon": 100.5018,
    },
}


def _rate_limit() -> None:
    global _last_call
    elapsed = time.time() - _last_call
    if elapsed < 1.05:
        time.sleep(1.05 - elapsed)
    _last_call = time.time()


def seed_geocode_cache(db: Session) -> None:
    for key, data in SEED_CITIES.items():
        existing = db.query(GeocodeCache).filter(GeocodeCache.query_key == key).first()
        if existing:
            continue
        db.add(
            GeocodeCache(
                query_key=key,
                display_name=data["display_name"],
                lat=data["lat"],
                lon=data["lon"],
                raw={"source": "seed"},
            )
        )
    db.commit()


def geocode_city(query: str, db: Session) -> dict:
    key = query.strip().lower()
    cached = db.query(GeocodeCache).filter(GeocodeCache.query_key == key).first()
    if cached:
        return {
            "display_name": cached.display_name,
            "lat": cached.lat,
            "lon": cached.lon,
            "cached": True,
        }

    # Fuzzy seed match (substring)
    for seed_key, data in SEED_CITIES.items():
        if seed_key in key or key in seed_key:
            row = GeocodeCache(
                query_key=key,
                display_name=data["display_name"],
                lat=data["lat"],
                lon=data["lon"],
                raw={"source": "seed-fuzzy", "matched": seed_key},
            )
            db.add(row)
            db.commit()
            return {
                "display_name": row.display_name,
                "lat": row.lat,
                "lon": row.lon,
                "cached": False,
            }

    settings = get_settings()
    _rate_limit()
    headers = {
        "User-Agent": settings.nominatim_user_agent,
        "Accept": "application/json",
    }
    params = {"q": query, "format": "json", "limit": 1}
    try:
        with httpx.Client(timeout=20) as client:
            r = client.get(
                "https://nominatim.openstreetmap.org/search",
                params=params,
                headers=headers,
            )
            if r.status_code == 403:
                raise ValueError(
                    "Nominatim returned 403 (often blocked from cloud IPs). "
                    "Pass lat/lon in the request, or use a seeded city name "
                    "(e.g. Montreal, Canada / Hong Kong / London, UK)."
                )
            r.raise_for_status()
            results = r.json()
    except httpx.HTTPError as e:
        raise ValueError(f"Geocoding failed: {e}") from e

    if not results:
        raise ValueError(f"Could not geocode: {query}")

    hit = results[0]
    lat = float(hit["lat"])
    lon = float(hit["lon"])
    display = hit.get("display_name") or query
    row = GeocodeCache(
        query_key=key,
        display_name=display,
        lat=lat,
        lon=lon,
        raw={"source": "nominatim", "place_id": hit.get("place_id")},
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {
        "display_name": row.display_name,
        "lat": row.lat,
        "lon": row.lon,
        "cached": False,
    }
