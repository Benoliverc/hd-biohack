"""Geocoding: DB cache + seed cities + Nominatim + Open-Meteo fallback."""
from __future__ import annotations

import re
import time
import unicodedata
from typing import Any

import httpx
from sqlalchemy.orm import Session

from timezonefinder import TimezoneFinder

from ..config import get_settings
from ..models import GeocodeCache

_last_call = 0.0
_TF = TimezoneFinder()


def _timezone_at(lat: float, lon: float) -> str | None:
    """IANA timezone for coords; None if unresolved."""
    try:
        return _TF.timezone_at(lat=lat, lng=lon) or _TF.closest_timezone_at(lat=lat, lng=lon)
    except Exception:  # noqa: BLE001
        return None

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
    "ulm": {
        "display_name": "Ulm, Baden-Württemberg, Germany",
        "lat": 48.4011,
        "lon": 9.9876,
    },
    "hong kong": {
        "display_name": "Hong Kong",
        "lat": 22.3193,
        "lon": 114.1694,
    },
    "hong kong, china": {
        "display_name": "Hong Kong",
        "lat": 22.3193,
        "lon": 114.1694,
    },
    "hongkong": {
        "display_name": "Hong Kong",
        "lat": 22.3193,
        "lon": 114.1694,
    },
    "new york, usa": {
        "display_name": "New York, New York, United States",
        "lat": 40.7128,
        "lon": -74.0060,
    },
    "new york": {
        "display_name": "New York, New York, United States",
        "lat": 40.7128,
        "lon": -74.0060,
    },
    "london, uk": {
        "display_name": "London, England, United Kingdom",
        "lat": 51.5074,
        "lon": -0.1278,
    },
    "london": {
        "display_name": "London, England, United Kingdom",
        "lat": 51.5074,
        "lon": -0.1278,
    },
    "bangkok, thailand": {
        "display_name": "Bangkok, Thailand",
        "lat": 13.7563,
        "lon": 100.5018,
    },
    "bangkok": {
        "display_name": "Bangkok, Thailand",
        "lat": 13.7563,
        "lon": 100.5018,
    },
    "ghent, belgium": {
        "display_name": "Ghent, East Flanders, Belgium",
        "lat": 51.0543,
        "lon": 3.7174,
    },
    "ghent": {
        "display_name": "Ghent, East Flanders, Belgium",
        "lat": 51.0543,
        "lon": 3.7174,
    },
    "gent": {
        "display_name": "Ghent, East Flanders, Belgium",
        "lat": 51.0543,
        "lon": 3.7174,
    },
    "gent, belgium": {
        "display_name": "Ghent, East Flanders, Belgium",
        "lat": 51.0543,
        "lon": 3.7174,
    },
    "wetteren, belgium": {
        "display_name": "Wetteren, East Flanders, Belgium",
        "lat": 51.0053,
        "lon": 3.8835,
    },
    "wetteren": {
        "display_name": "Wetteren, East Flanders, Belgium",
        "lat": 51.0053,
        "lon": 3.8835,
    },
    "paris, france": {
        "display_name": "Paris, France",
        "lat": 48.8566,
        "lon": 2.3522,
    },
    "paris": {
        "display_name": "Paris, France",
        "lat": 48.8566,
        "lon": 2.3522,
    },
    "brussels, belgium": {
        "display_name": "Brussels, Belgium",
        "lat": 50.8503,
        "lon": 4.3517,
    },
    "brussels": {
        "display_name": "Brussels, Belgium",
        "lat": 50.8503,
        "lon": 4.3517,
    },
    "antwerp, belgium": {
        "display_name": "Antwerp, Belgium",
        "lat": 51.2194,
        "lon": 4.4025,
    },
    "antwerp": {
        "display_name": "Antwerp, Belgium",
        "lat": 51.2194,
        "lon": 4.4025,
    },
    "singapore": {
        "display_name": "Singapore",
        "lat": 1.3521,
        "lon": 103.8198,
    },
    "tokyo, japan": {
        "display_name": "Tokyo, Japan",
        "lat": 35.6762,
        "lon": 139.6503,
    },
    "tokyo": {
        "display_name": "Tokyo, Japan",
        "lat": 35.6762,
        "lon": 139.6503,
    },
    "sydney, australia": {
        "display_name": "Sydney, Australia",
        "lat": -33.8688,
        "lon": 151.2093,
    },
    "berlin, germany": {
        "display_name": "Berlin, Germany",
        "lat": 52.5200,
        "lon": 13.4050,
    },
    "berlin": {
        "display_name": "Berlin, Germany",
        "lat": 52.5200,
        "lon": 13.4050,
    },
    "amsterdam, netherlands": {
        "display_name": "Amsterdam, Netherlands",
        "lat": 52.3676,
        "lon": 4.9041,
    },
    "amsterdam": {
        "display_name": "Amsterdam, Netherlands",
        "lat": 52.3676,
        "lon": 4.9041,
    },
    "shanghai, china": {
        "display_name": "Shanghai, China",
        "lat": 31.2304,
        "lon": 121.4737,
    },
    "shanghai": {
        "display_name": "Shanghai, China",
        "lat": 31.2304,
        "lon": 121.4737,
    },
    "los angeles, usa": {
        "display_name": "Los Angeles, California, United States",
        "lat": 34.0522,
        "lon": -118.2437,
    },
    "los angeles": {
        "display_name": "Los Angeles, California, United States",
        "lat": 34.0522,
        "lon": -118.2437,
    },
}


def _normalize(text: str) -> str:
    """Lowercase, strip accents, collapse punctuation/whitespace."""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


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
            # Keep coords fresh from seed
            existing.display_name = data["display_name"]
            existing.lat = data["lat"]
            existing.lon = data["lon"]
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


def _cache_hit(db: Session, key: str) -> dict | None:
    cached = db.query(GeocodeCache).filter(GeocodeCache.query_key == key).first()
    if not cached:
        # also try normalized key if different
        norm = _normalize(key)
        if norm != key:
            cached = db.query(GeocodeCache).filter(GeocodeCache.query_key == norm).first()
    if cached:
        return {
            "display_name": cached.display_name,
            "lat": cached.lat,
            "lon": cached.lon,
            "cached": True,
            "source": "cache",
            "timezone": _timezone_at(cached.lat, cached.lon),
        }
    return None


def _match_seed(query: str) -> tuple[str, dict[str, Any]] | None:
    key = _normalize(query)
    if key in SEED_CITIES:
        return key, SEED_CITIES[key]
    city_token = key.split(",")[0].strip()
    # Exact city-token match (first comma segment)
    for seed_key, data in SEED_CITIES.items():
        seed_city = seed_key.split(",")[0].strip()
        if city_token == seed_city or key == seed_key:
            return seed_key, data
    # Prefix / contained whole seed key only (avoid "gh" ⊂ "shanghai")
    for seed_key, data in SEED_CITIES.items():
        seed_city = seed_key.split(",")[0].strip()
        if seed_key.startswith(key) or seed_city.startswith(city_token):
            if len(city_token) >= 2:
                return seed_key, data
        if seed_key in key and len(seed_key) >= 3:
            return seed_key, data
        if len(city_token) >= 4 and city_token in seed_key:
            return seed_key, data
    return None


def _store(db: Session, key: str, display: str, lat: float, lon: float, raw: dict) -> dict:
    existing = db.query(GeocodeCache).filter(GeocodeCache.query_key == key).first()
    if existing:
        existing.display_name = display
        existing.lat = lat
        existing.lon = lon
        existing.raw = raw
        db.commit()
        return {
            "display_name": display,
            "lat": lat,
            "lon": lon,
            "cached": True,
            "source": raw.get("source", "cache"),
            "timezone": _timezone_at(lat, lon),
        }
    row = GeocodeCache(
        query_key=key,
        display_name=display,
        lat=lat,
        lon=lon,
        raw=raw,
    )
    db.add(row)
    db.commit()
    return {
        "display_name": display,
        "lat": lat,
        "lon": lon,
        "cached": False,
        "source": raw.get("source", "unknown"),
        "timezone": _timezone_at(lat, lon),
    }


def _geocode_nominatim(query: str) -> dict | None:
    settings = get_settings()
    _rate_limit()
    headers = {
        "User-Agent": settings.nominatim_user_agent,
        "Accept": "application/json",
    }
    params = {"q": query, "format": "json", "limit": 1}
    try:
        with httpx.Client(timeout=15) as client:
            r = client.get(
                "https://nominatim.openstreetmap.org/search",
                params=params,
                headers=headers,
            )
            if r.status_code in (403, 429):
                return None
            r.raise_for_status()
            results = r.json()
    except httpx.HTTPError:
        return None
    if not results:
        return None
    hit = results[0]
    return {
        "display_name": hit.get("display_name") or query,
        "lat": float(hit["lat"]),
        "lon": float(hit["lon"]),
        "raw": {"source": "nominatim", "place_id": hit.get("place_id")},
    }


def _geocode_open_meteo(query: str) -> dict | None:
    """Free Open-Meteo geocoding — works from many cloud IPs where Nominatim 403s."""
    params = {"name": query, "count": 1, "language": "en", "format": "json"}
    try:
        with httpx.Client(timeout=15) as client:
            r = client.get("https://geocoding-api.open-meteo.com/v1/search", params=params)
            r.raise_for_status()
            data = r.json()
    except httpx.HTTPError:
        return None
    results = data.get("results") or []
    if not results:
        return None
    hit = results[0]
    parts = [hit.get("name"), hit.get("admin1"), hit.get("country")]
    display = ", ".join(p for p in parts if p)
    return {
        "display_name": display or query,
        "lat": float(hit["latitude"]),
        "lon": float(hit["longitude"]),
        "raw": {
            "source": "open-meteo",
            "id": hit.get("id"),
            "timezone": hit.get("timezone"),
            "country_code": hit.get("country_code"),
        },
    }


def _suggest_open_meteo(query: str, limit: int = 6) -> list[dict]:
    params = {"name": query, "count": limit, "language": "en", "format": "json"}
    try:
        with httpx.Client(timeout=12) as client:
            r = client.get("https://geocoding-api.open-meteo.com/v1/search", params=params)
            r.raise_for_status()
            data = r.json()
    except httpx.HTTPError:
        return []
    out: list[dict] = []
    for hit in data.get("results") or []:
        parts = [hit.get("name"), hit.get("admin1"), hit.get("country")]
        display = ", ".join(p for p in parts if p)
        lat_v = float(hit["latitude"])
        lon_v = float(hit["longitude"])
        out.append(
            {
                "display_name": display,
                "lat": lat_v,
                "lon": lon_v,
                "cached": False,
                "source": "open-meteo",
                "timezone": hit.get("timezone") or _timezone_at(lat_v, lon_v),
            }
        )
    return out


def suggest_cities(query: str, db: Session, limit: int = 8) -> list[dict]:
    """Autocomplete: seed/cache first, then Open-Meteo for free-text."""
    q = query.strip()
    if len(q) < 1:
        return []
    key = _normalize(q)
    seen: set[tuple[float, float]] = set()
    results: list[dict] = []

    def add(item: dict) -> None:
        coord = (round(item["lat"], 4), round(item["lon"], 4))
        if coord in seen:
            return
        seen.add(coord)
        results.append(item)

    # Seed matches — prefer prefix / word-start, avoid accidental mid-word hits (e.g. "gh" in "shanghai")
    def seed_score(seed_key: str, display: str) -> int:
        nk = seed_key
        nd = _normalize(display)
        if nk == key or nd == key:
            return 100
        if nk.startswith(key) or nd.startswith(key):
            return 80
        if any(part.startswith(key) for part in nk.replace(",", " ").split()):
            return 70
        if any(part.startswith(key) for part in nd.replace(",", " ").split()):
            return 60
        if len(key) >= 3 and (key in nk or key in nd):
            return 40
        return 0

    scored: list[tuple[int, dict]] = []
    for seed_key, data in SEED_CITIES.items():
        sc = seed_score(seed_key, data["display_name"])
        if sc:
            scored.append(
                (
                    sc,
                    {
                        "display_name": data["display_name"],
                        "lat": data["lat"],
                        "lon": data["lon"],
                        "cached": True,
                        "source": "seed",
                        "timezone": _timezone_at(data["lat"], data["lon"]),
                    },
                )
            )
    scored.sort(key=lambda x: (-x[0], x[1]["display_name"]))
    for _, item in scored:
        add(item)
        if len(results) >= limit:
            return results[:limit]

    # Cached rows — prefix / token start only (avoid "gh" matching "shanghai")
    rows = db.query(GeocodeCache).limit(200).all()
    cache_hits: list[tuple[int, object]] = []
    for row in rows:
        qk = _normalize(row.query_key)
        dn = _normalize(row.display_name)
        score = 0
        if qk.startswith(key) or dn.startswith(key):
            score = 80
        elif any(tok.startswith(key) for tok in qk.replace(",", " ").split()):
            score = 70
        elif any(tok.startswith(key) for tok in dn.replace(",", " ").split()):
            score = 60
        elif len(key) >= 4 and (key in qk or key in dn):
            score = 30
        if score:
            cache_hits.append((score, row))
    cache_hits.sort(key=lambda x: -x[0])
    for _, row in cache_hits:
        add(
            {
                "display_name": row.display_name,
                "lat": row.lat,
                "lon": row.lon,
                "cached": True,
                "source": "cache",
                "timezone": _timezone_at(row.lat, row.lon),
            }
        )
        if len(results) >= limit:
            return results[:limit]

    # Live Open-Meteo suggestions for free-text
    if len(q) >= 2:
        for item in _suggest_open_meteo(q, limit=limit):
            add(item)
            if len(results) >= limit:
                break

    return results[:limit]


def _parse_lat_lon(query: str) -> dict | None:
    """Accept 'lat, lon' or 'lat lon' pasted coordinates."""
    m = re.match(
        r"^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$",
        query.strip(),
    )
    if not m:
        return None
    lat, lon = float(m.group(1)), float(m.group(2))
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        return None
    return {
        "display_name": f"{lat:.5f}, {lon:.5f}",
        "lat": lat,
        "lon": lon,
        "raw": {"source": "manual-coords"},
    }


def geocode_city(query: str, db: Session) -> dict:
    key = _normalize(query)
    if not key:
        raise ValueError("City query is empty")

    coords = _parse_lat_lon(query)
    if coords:
        return _store(db, key, coords["display_name"], coords["lat"], coords["lon"], coords["raw"])

    hit = _cache_hit(db, key)
    if hit:
        return hit

    matched = _match_seed(query)
    if matched:
        seed_key, data = matched
        return _store(
            db,
            key,
            data["display_name"],
            data["lat"],
            data["lon"],
            {"source": "seed-fuzzy", "matched": seed_key},
        )

    # Prefer Open-Meteo (works from cloud); Nominatim often 403s
    remote = _geocode_open_meteo(query) or _geocode_nominatim(query)
    if remote:
        return _store(
            db,
            key,
            remote["display_name"],
            remote["lat"],
            remote["lon"],
            remote["raw"],
        )

    raise ValueError(
        f"Could not geocode '{query}'. Pick a suggestion, use a known city "
        "(Hong Kong, Ghent, Wetteren, Montreal…), or pass lat/lon."
    )


def list_seed_cities() -> list[dict]:
    """Unique seed places for UI quick-picks."""
    seen: set[tuple[float, float]] = set()
    out: list[dict] = []
    for data in SEED_CITIES.values():
        coord = (round(data["lat"], 4), round(data["lon"], 4))
        if coord in seen:
            continue
        seen.add(coord)
        out.append(
            {
                "display_name": data["display_name"],
                "lat": data["lat"],
                "lon": data["lon"],
                "cached": True,
                "source": "seed",
                "timezone": _timezone_at(data["lat"], data["lon"]),
            }
        )
    out.sort(key=lambda x: x["display_name"])
    return out
