"""Full Human Design chart + transit composite calculation."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from zoneinfo import ZoneInfo

from timezonefinder import TimezoneFinder

from .channels import active_channels, defined_centers, hanging_gates
from .ephemeris import datetime_to_jd, find_design_jd, positions_at
from .mandala import GateLine, longitude_to_gate_line
from .type_authority import (
    derive_authority,
    derive_definition,
    derive_profile,
    derive_strategy,
    derive_type,
)

_TF = TimezoneFinder()

PLANET_ORDER = [
    "Sun", "Earth", "Moon", "North_Node", "South_Node",
    "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
    "Uranus", "Neptune", "Pluto",
]


def local_birth_to_utc(
    year: int, month: int, day: int,
    hour: int, minute: int, second: int,
    lat: float, lon: float,
) -> datetime:
    """Convert local civil birth time at lat/lon to exact UTC using IANA TZDB."""
    tz_name = _TF.timezone_at(lat=lat, lng=lon)
    if not tz_name:
        tz_name = _TF.closest_timezone_at(lat=lat, lng=lon)
    if not tz_name:
        raise ValueError(f"Could not resolve timezone for ({lat}, {lon})")
    tz = ZoneInfo(tz_name)
    local = datetime(year, month, day, hour, minute, second, tzinfo=tz)
    return local.astimezone(timezone.utc), tz_name


def _activations(positions: dict, color: str) -> list[dict]:
    rows = []
    for name in PLANET_ORDER:
        pos = positions[name]
        gate, line = longitude_to_gate_line(pos.longitude)
        rows.append({
            "planet": name,
            "longitude": round(pos.longitude, 6),
            "gate": gate,
            "line": line,
            "label": f"{gate}.{line}",
            "color": color,
        })
    return rows


def calculate_chart(
    year: int, month: int, day: int,
    hour: int, minute: int, second: int = 0,
    lat: float = 0.0, lon: float = 0.0,
    birth_utc: datetime | None = None,
    timezone_name: str | None = None,
) -> dict[str, Any]:
    """Compute complete natal Human Design chart."""
    if birth_utc is None:
        birth_utc, timezone_name = local_birth_to_utc(
            year, month, day, hour, minute, second, lat, lon
        )
    else:
        if birth_utc.tzinfo is None:
            birth_utc = birth_utc.replace(tzinfo=timezone.utc)
        else:
            birth_utc = birth_utc.astimezone(timezone.utc)

    pers_jd = datetime_to_jd(birth_utc)
    design_jd = find_design_jd(pers_jd, target_arc=88.0)

    personality = positions_at(pers_jd)
    design = positions_at(design_jd)

    pers_act = _activations(personality, "personality")
    des_act = _activations(design, "design")

    all_gates: set[int] = {a["gate"] for a in pers_act + des_act}
    channels = active_channels(all_gates)
    defined = defined_centers(channels)
    hd_type = derive_type(defined, channels)
    authority = derive_authority(defined, channels, hd_type)
    strategy = derive_strategy(hd_type)
    definition = derive_definition(defined, channels)

    sun_p = next(a for a in pers_act if a["planet"] == "Sun")
    sun_d = next(a for a in des_act if a["planet"] == "Sun")
    profile = derive_profile(sun_p["line"], sun_d["line"])

    # Design datetime for transparency
    design_dt = _jd_to_datetime(design_jd)

    return {
        "birth_utc": birth_utc.isoformat(),
        "design_utc": design_dt.isoformat(),
        "timezone": timezone_name,
        "lat": lat,
        "lon": lon,
        "personality": pers_act,
        "design": des_act,
        "activated_gates": sorted(all_gates),
        "channels": channels,
        "defined_centers": sorted(defined),
        "undefined_centers": sorted(set(_all_centers()) - defined),
        "hanging_gates": hanging_gates(all_gates),
        "type": hd_type,
        "strategy": strategy,
        "authority": authority,
        "definition": definition,
        "profile": profile,
        "sun_personality": sun_p["label"],
        "sun_design": sun_d["label"],
        "personality_jd": pers_jd,
        "design_jd": design_jd,
        "design_solar_arc_check": _arc_check(pers_jd, design_jd),
    }


def _all_centers() -> set[str]:
    return {
        "Head", "Ajna", "Throat", "G", "Heart",
        "Solar_Plexus", "Sacral", "Spleen", "Root",
    }


def _jd_to_datetime(jd: float) -> datetime:
    year, month, day, hour = swe_revjul(jd)
    h = int(hour)
    m = int((hour - h) * 60)
    s = int(round((((hour - h) * 60) - m) * 60))
    if s == 60:
        s = 0
        m += 1
    return datetime(year, month, day, h, m, s, tzinfo=timezone.utc)


def swe_revjul(jd: float) -> tuple[int, int, int, float]:
    import swisseph as swe
    y, m, d, h = swe.revjul(jd, swe.GREG_CAL)
    return int(y), int(m), int(d), float(h)


def _arc_check(pers_jd: float, design_jd: float) -> float:
    from .ephemeris import sun_longitude
    arc = (sun_longitude(pers_jd) - sun_longitude(design_jd)) % 360.0
    return round(arc, 6)


def calculate_transits(when: datetime | None = None) -> dict[str, Any]:
    """Current planetary positions mapped to gates/lines."""
    when = when or datetime.now(timezone.utc)
    if when.tzinfo is None:
        when = when.replace(tzinfo=timezone.utc)
    jd = datetime_to_jd(when.astimezone(timezone.utc))
    positions = positions_at(jd)
    activations = _activations(positions, "transit")
    gates = {a["gate"] for a in activations}
    return {
        "at_utc": when.astimezone(timezone.utc).isoformat(),
        "activations": activations,
        "activated_gates": sorted(gates),
        "channels": active_channels(gates),
        "sun_earth": {
            "sun": next(a for a in activations if a["planet"] == "Sun"),
            "earth": next(a for a in activations if a["planet"] == "Earth"),
        },
    }


def overlay_transits(natal: dict[str, Any], transit: dict[str, Any]) -> dict[str, Any]:
    """Composite: natal + current transits → bridged channels, newly defined centers."""
    natal_gates = set(natal["activated_gates"])
    transit_gates = set(transit["activated_gates"])
    composite_gates = natal_gates | transit_gates

    natal_channels = natal["channels"]
    natal_defined = set(natal["defined_centers"])
    composite_channels = active_channels(composite_gates)
    composite_defined = defined_centers(composite_channels)

    # Bridged: channels that become complete only with transit gates
    natal_keys = {frozenset(c["gates"]) for c in natal_channels}
    bridged = [
        c for c in composite_channels
        if frozenset(c["gates"]) not in natal_keys
        and (
            (c["gates"][0] in natal_gates and c["gates"][1] in transit_gates)
            or (c["gates"][1] in natal_gates and c["gates"][0] in transit_gates)
            or (c["gates"][0] in transit_gates and c["gates"][1] in transit_gates)
        )
    ]
    # Prefer hanging-gate bridges (personal conditioning)
    hanging = natal.get("hanging_gates", [])
    missing = {h["missing"] for h in hanging}
    personal_bridges = [
        c for c in bridged
        if c["gates"][0] in missing or c["gates"][1] in missing
        or (c["gates"][0] in natal_gates) ^ (c["gates"][1] in natal_gates)
    ]

    newly_defined = sorted(composite_defined - natal_defined)

    sun = transit["sun_earth"]["sun"]
    earth = transit["sun_earth"]["earth"]
    weekly_theme = {
        "sun_gate": sun["label"],
        "earth_gate": earth["label"],
        "summary": f"Sun in Gate {sun['gate']} Line {sun['line']} / Earth in Gate {earth['gate']} Line {earth['line']}",
    }

    return {
        "bridged_channels": personal_bridges or bridged,
        "newly_defined_centers": newly_defined,
        "composite_defined_centers": sorted(composite_defined),
        "weekly_macro_theme": weekly_theme,
        "transit_gates": sorted(transit_gates),
    }
