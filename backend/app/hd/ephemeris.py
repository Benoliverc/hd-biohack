"""Swiss Ephemeris wrappers: natal planets, Design 88° solar arc, current transits."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import swisseph as swe

EPHE_PATH = Path(__file__).resolve().parents[2] / "data" / "ephemeris"

# Body ids
PLANETS = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mercury": swe.MERCURY,
    "Venus": swe.VENUS,
    "Mars": swe.MARS,
    "Jupiter": swe.JUPITER,
    "Saturn": swe.SATURN,
    "Uranus": swe.URANUS,
    "Neptune": swe.NEPTUNE,
    "Pluto": swe.PLUTO,
    "North_Node": swe.TRUE_NODE,  # True Node commonly used in HD
}

FLAGS = swe.FLG_SWIEPH | swe.FLG_SPEED


def init_ephemeris() -> None:
    EPHE_PATH.mkdir(parents=True, exist_ok=True)
    swe.set_ephe_path(str(EPHE_PATH))


@dataclass
class PlanetPosition:
    name: str
    longitude: float
    latitude: float = 0.0
    speed: float = 0.0


def datetime_to_jd(dt: datetime) -> float:
    """Convert timezone-aware UTC datetime to Julian Day (UT)."""
    if dt.tzinfo is None:
        raise ValueError("datetime must be timezone-aware (UTC)")
    utc = dt.astimezone(timezone.utc)
    hour = utc.hour + utc.minute / 60.0 + utc.second / 3600.0 + utc.microsecond / 3.6e9
    return swe.julday(utc.year, utc.month, utc.day, hour, swe.GREG_CAL)


def _calc_lon(jd: float, body: int) -> PlanetPosition:
    result, ret = swe.calc_ut(jd, body, FLAGS)
    if ret < 0:
        # Fallback to Moshier if file missing
        result, ret = swe.calc_ut(jd, body, swe.FLG_MOSEPH | swe.FLG_SPEED)
    lon, lat, dist, lon_speed = result[0], result[1], result[2], result[3]
    return PlanetPosition(name="", longitude=lon % 360.0, latitude=lat, speed=lon_speed)


def sun_longitude(jd: float) -> float:
    return _calc_lon(jd, swe.SUN).longitude


def find_design_jd(personality_jd: float, target_arc: float = 88.0, tol: float = 1e-8) -> float:
    """Iterative root-find: JD when Sun longitude = natal_sun − 88° (solar arc).

    Uses binary search over ~80–100 days before birth (Sun moves ~1°/day).
    """
    natal_sun = sun_longitude(personality_jd)
    target = (natal_sun - target_arc) % 360.0

    # Bracket: Sun travels ~1°/day → search 70–100 days back
    lo = personality_jd - 100.0
    hi = personality_jd - 70.0

    def anglediff(jd: float) -> float:
        """Signed shortest difference sun(jd) − target in (−180, 180]."""
        d = (sun_longitude(jd) - target + 180.0) % 360.0 - 180.0
        return d

    # Expand bracket if needed
    for _ in range(20):
        if anglediff(lo) * anglediff(hi) <= 0:
            break
        lo -= 10
        hi = min(hi + 5, personality_jd - 60)

    for _ in range(80):
        mid = (lo + hi) / 2.0
        if abs(anglediff(mid)) < tol:
            return mid
        if anglediff(lo) * anglediff(mid) <= 0:
            hi = mid
        else:
            lo = mid
    return (lo + hi) / 2.0


def positions_at(jd: float) -> dict[str, PlanetPosition]:
    """Personality/Design set: all planets + Earth + South Node."""
    out: dict[str, PlanetPosition] = {}
    for name, body in PLANETS.items():
        pos = _calc_lon(jd, body)
        pos.name = name
        out[name] = pos

    # Earth = Sun opposite
    sun = out["Sun"]
    out["Earth"] = PlanetPosition(
        name="Earth",
        longitude=(sun.longitude + 180.0) % 360.0,
        speed=sun.speed,
    )
    # South Node = North Node opposite
    nn = out["North_Node"]
    out["South_Node"] = PlanetPosition(
        name="South_Node",
        longitude=(nn.longitude + 180.0) % 360.0,
        speed=nn.speed,
    )
    return out


init_ephemeris()
