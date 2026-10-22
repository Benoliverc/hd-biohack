"""Dual-chart Bio-Sync scorer (You ↔ Friend). Pure functions — no I/O."""
from __future__ import annotations

from typing import Any, Iterable, Literal

from .channels import (
    CENTERS,
    CHANNELS,
    MOTORS,
    active_channels,
    defined_centers,
    hanging_gates as compute_hanging_gates,
)

ContextId = Literal["work", "life", "play"]
ProtocolId = Literal["emotional_wait", "yield_compromise", "solo_buffer"]

CONTEXT_LABELS: dict[str, str] = {
    "work": "Work & Co-Creation",
    "life": "Life & Intimacy",
    "play": "Play & Performance",
}

CONTEXT_WEIGHTS: dict[str, dict[str, float]] = {
    "work": {"voltage": 0.35, "flow": 0.45, "ease": 0.20},
    "life": {"voltage": 0.25, "flow": 0.35, "ease": 0.40},
    "play": {"voltage": 0.50, "flow": 0.35, "ease": 0.15},
}

ARCHETYPE_BLURBS: dict[str, str] = {
    "closed_loop": "All nine centers lit together — intense shared field; plan decompression.",
    "focused_radar": "Eight centers defined — sharp shared focus with one open breath-point.",
    "dynamic_eq": "High internal chemistry with two open centers left to breathe.",
    "open_field": "More open than closed in composite — exploratory, flexible, sensitive to setting.",
}

PROTOCOL_LABELS: dict[str, str] = {
    "emotional_wait": "Apply 24h Emotional Wait Rule",
    "yield_compromise": "Yield compromise channels to the defined holder",
    "solo_buffer": "30-min solo decompression buffer",
}

CENTER_HINTS: dict[str, str] = {
    "Head": "Amplifier: their mental pressure can feel like your question. Ask: is this mine?",
    "Ajna": "Amplifier: fixed opinions can land as certainty. Soften before deciding.",
    "Throat": "Amplifier: their expression may pull you to speak or act. Pause first.",
    "G": "Amplifier: their direction can feel like your identity. Check your own north.",
    "Heart": "Amplifier: willpower and worth themes intensify. Rest the Ego.",
    "Solar_Plexus": "Amplifier: you can feel their emotional wave more intensely. Ask: is this mine?",
    "Sacral": "Amplifier: borrowed work energy — respond, don't initiate from it.",
    "Spleen": "Amplifier: instinctive fear/alertness can spike. One breath before reacting.",
    "Root": "Amplifier: adrenal pressure rises. Shorten the list; don't force pace.",
}

HARMONIC_LINE_PAIRS = {frozenset({1, 4}), frozenset({2, 5}), frozenset({3, 6})}

SACRAL_TYPES = {"Generator", "Manifesting Generator"}
NON_SACRAL_TYPES = {"Projector", "Manifestor", "Reflector"}

DISCLAIMER = "Chart mechanics for awareness — not medical or relationship advice."


def clamp(n: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, n))


def _gate_set(chart: dict[str, Any]) -> set[int]:
    raw = chart.get("activated_gates") or []
    return {int(g) for g in raw}


def _defined_set(chart: dict[str, Any], gates: set[int] | None = None) -> set[str]:
    raw = chart.get("defined_centers")
    if raw is not None:
        return set(raw)
    g = gates if gates is not None else _gate_set(chart)
    return defined_centers(active_channels(g))


def _hanging(chart: dict[str, Any], gates: set[int] | None = None) -> list[dict]:
    raw = chart.get("hanging_gates")
    if isinstance(raw, list) and raw:
        return raw
    g = gates if gates is not None else _gate_set(chart)
    return compute_hanging_gates(g)


def _parse_profile(profile: str | None) -> tuple[int | None, int | None]:
    if not profile or "/" not in str(profile):
        return None, None
    try:
        a, b = str(profile).strip().split("/", 1)
        return int(a), int(b)
    except (TypeError, ValueError):
        return None, None


def profile_harmony(profile_a: str | None, profile_b: str | None) -> bool:
    """True once if identical, harmonic lines, or complementary RA↔LA (not Juxtaposition)."""
    if not profile_a or not profile_b:
        return False
    if profile_a == profile_b:
        return True
    p_a, d_a = _parse_profile(profile_a)
    p_b, d_b = _parse_profile(profile_b)
    if p_a is None or p_b is None:
        return False
    if frozenset({p_a, p_b}) in HARMONIC_LINE_PAIRS:
        return True
    if d_a is not None and d_b is not None and frozenset({d_a, d_b}) in HARMONIC_LINE_PAIRS:
        return True
    # Juxtaposition 4/1 does not get the RA/LA complementary bonus
    if profile_a == "4/1" or profile_b == "4/1":
        return False
    ra = {1, 2, 3}
    la = {4, 5, 6}
    a_ra, a_la = p_a in ra, p_a in la
    b_ra, b_la = p_b in ra, p_b in la
    return (a_ra and b_la) or (a_la and b_ra)


def _is_emotional(authority: str | None) -> bool:
    if not authority:
        return False
    a = authority.lower()
    return "emotional" in a or "solar plexus" in a


def _is_instant(authority: str | None) -> bool:
    if not authority:
        return False
    a = authority.lower()
    return a.startswith("sacral") or "splenic" in a or a == "spleen"


def authority_speed_gap(auth_a: str | None, auth_b: str | None) -> bool:
    return (_is_emotional(auth_a) and _is_instant(auth_b)) or (
        _is_emotional(auth_b) and _is_instant(auth_a)
    )


def sacral_asymmetry(type_a: str | None, type_b: str | None) -> bool:
    if not type_a or not type_b:
        return False
    a_sacral = type_a in SACRAL_TYPES
    b_sacral = type_b in SACRAL_TYPES
    a_non = type_a in NON_SACRAL_TYPES
    b_non = type_b in NON_SACRAL_TYPES
    return (a_sacral and b_non) or (b_sacral and a_non)


def classify_channel_roles(
    gates_a: set[int], gates_b: set[int]
) -> dict[str, list[dict[str, Any]]]:
    roles: dict[str, list[dict[str, Any]]] = {
        "electromagnetic": [],
        "companionship": [],
        "dominance": [],
        "compromise": [],
    }
    for g1, g2, name in CHANNELS:
        pair = {g1, g2}
        held_a = pair & gates_a
        held_b = pair & gates_b
        n_a, n_b = len(held_a), len(held_b)
        entry = {"channel": name, "gates": sorted(pair)}
        if n_a == 1 and n_b == 1 and held_a != held_b:
            roles["electromagnetic"].append(entry)
        elif n_a == 2 and n_b == 2:
            roles["companionship"].append(entry)
        elif (n_a == 2 and n_b == 0) or (n_b == 2 and n_a == 0):
            roles["dominance"].append({**entry, "holder": "self" if n_a == 2 else "friend"})
        elif (n_a == 2 and n_b == 1) or (n_b == 2 and n_a == 1):
            roles["compromise"].append(
                {**entry, "full": "self" if n_a == 2 else "friend"}
            )
        # else: both 0, or hanging-only (1+0) — unscored
    return roles


def split_bridge_locks(
    hanging_self: Iterable[dict], gates_friend: set[int]
) -> list[dict[str, Any]]:
    seen: set[int] = set()
    out: list[dict[str, Any]] = []
    for row in hanging_self:
        missing = row.get("missing")
        if missing is None:
            continue
        gate = int(missing)
        if gate in seen:
            continue
        if gate in gates_friend:
            seen.add(gate)
            out.append(
                {
                    "gate": gate,
                    "channel": row.get("channel") or "",
                    "held_by": "friend",
                    "missing_for": "self",
                }
            )
    return out


def conditioning_strip(
    defined_a: set[str], defined_b: set[str]
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for center in CENTERS:
        self_state = "defined" if center in defined_a else "open"
        friend_state = "defined" if center in defined_b else "open"
        if self_state == "defined" and friend_state == "defined":
            direction = "both_defined"
            hint = ""
        elif self_state == "open" and friend_state == "open":
            direction = "both_open"
            hint = ""
        elif self_state == "open" and friend_state == "defined":
            direction = "friend_to_self"
            hint = CENTER_HINTS.get(center, "Amplifier: notice what is theirs vs yours.")
        else:
            direction = "self_to_friend"
            hint = ""
        rows.append(
            {
                "center": center,
                "self": self_state,
                "friend": friend_state,
                "direction": direction,
                "hint": hint,
            }
        )
    return rows


def archetype_for(n_defined: int) -> dict[str, Any]:
    if n_defined == 9:
        aid, label = "closed_loop", "9-0 · Closed-Loop Reactor"
    elif n_defined == 8:
        aid, label = "focused_radar", "8-1 · Focused Radar"
    elif n_defined == 7:
        aid, label = "dynamic_eq", "7-2 · Dynamic Equilibrium"
    else:
        aid, label = "open_field", "6-3+ · Open-Field Explorers"
    return {
        "id": aid,
        "label": label,
        "composite_defined_count": n_defined,
        "blurb": ARCHETYPE_BLURBS[aid],
    }


def _weighted_fit(voltage: int, flow: int, ease: int, context: str) -> int:
    w = CONTEXT_WEIGHTS[context]
    raw = w["voltage"] * voltage + w["flow"] * flow + w["ease"] * ease
    return int(clamp(round(raw)))


def compute_soul_sync(
    chart_a: dict[str, Any],
    chart_b: dict[str, Any],
    context: str = "work",
    protocols: list[str] | None = None,
    *,
    self_meta: dict[str, Any] | None = None,
    friend_meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Score Bio-Sync between chart A (self) and chart B (friend)."""
    if context not in CONTEXT_WEIGHTS:
        raise ValueError(f"invalid context: {context}")
    enabled = list(protocols or [])

    gates_a = _gate_set(chart_a)
    gates_b = _gate_set(chart_b)
    defined_a = _defined_set(chart_a, gates_a)
    defined_b = _defined_set(chart_b, gates_b)
    hanging_a = _hanging(chart_a, gates_a)

    roles = classify_channel_roles(gates_a, gates_b)
    bridges = split_bridge_locks(hanging_a, gates_b)

    composite_gates = gates_a | gates_b
    composite_channels = active_channels(composite_gates)
    composite_defined = defined_centers(composite_channels)
    newly_motors = sorted(
        (composite_defined & MOTORS) - defined_a - defined_b
    )

    type_a = (self_meta or {}).get("type") or chart_a.get("type")
    type_b = (friend_meta or {}).get("type") or chart_b.get("type")
    profile_a = (self_meta or {}).get("profile") or chart_a.get("profile")
    profile_b = (friend_meta or {}).get("profile") or chart_b.get("profile")
    auth_a = (self_meta or {}).get("authority") or chart_a.get("authority")
    auth_b = (friend_meta or {}).get("authority") or chart_b.get("authority")

    # --- Voltage ---
    voltage_drivers: list[dict[str, Any]] = []
    voltage = 0
    for ch in roles["electromagnetic"]:
        voltage += 18
        voltage_drivers.append(
            {
                "kind": "electromagnetic",
                "channel": ch["channel"],
                "gates": ch["gates"],
                "pts": 18,
            }
        )
    for br in bridges:
        voltage += 15
        voltage_drivers.append(
            {
                "kind": "split_bridge",
                "channel": br["channel"],
                "gate": br["gate"],
                "pts": 15,
            }
        )
    for motor in newly_motors:
        voltage += 8
        voltage_drivers.append(
            {"kind": "new_motor", "center": motor, "pts": 8}
        )
    voltage = int(clamp(voltage))

    # --- Flow ---
    flow_drivers: list[dict[str, Any]] = []
    flow = 0
    if profile_harmony(profile_a, profile_b):
        flow += 25
        flow_drivers.append(
            {
                "kind": "profile_harmony",
                "profiles": [profile_a, profile_b],
                "pts": 25,
            }
        )
    for ch in roles["companionship"]:
        flow += 15
        flow_drivers.append(
            {
                "kind": "companionship",
                "channel": ch["channel"],
                "gates": ch["gates"],
                "pts": 15,
            }
        )
    for ch in roles["dominance"]:
        flow += 10
        flow_drivers.append(
            {
                "kind": "dominance",
                "channel": ch["channel"],
                "gates": ch["gates"],
                "pts": 10,
            }
        )
    shared = sorted(defined_a & defined_b)
    for center in shared:
        flow += 5
        flow_drivers.append(
            {"kind": "shared_center", "center": center, "pts": 5}
        )
    flow = int(clamp(flow))

    # --- Ease ---
    ease_drivers: list[dict[str, Any]] = []
    ease = 100
    compromise_count = len(roles["compromise"])
    for ch in roles["compromise"]:
        ease -= 18
        ease_drivers.append(
            {
                "kind": "compromise",
                "channel": ch["channel"],
                "gates": ch["gates"],
                "pts": -18,
            }
        )
    gap = authority_speed_gap(auth_a, auth_b)
    if gap:
        ease -= 15
        ease_drivers.append({"kind": "authority_gap", "pts": -15})
    nine_oh = len(composite_defined) == 9
    if nine_oh:
        ease -= 12
        ease_drivers.append({"kind": "nine_zero", "pts": -12})
    asym = sacral_asymmetry(type_a, type_b)
    if asym:
        ease -= 10
        ease_drivers.append({"kind": "sacral_asymmetry", "pts": -10})
    ease = int(clamp(ease))

    natural_fit = _weighted_fit(voltage, flow, ease, context)

    # --- Regulated ---
    avail = [
        {
            "id": "emotional_wait",
            "label": PROTOCOL_LABELS["emotional_wait"],
            "applicable": gap,
        },
        {
            "id": "yield_compromise",
            "label": PROTOCOL_LABELS["yield_compromise"],
            "applicable": compromise_count >= 1,
        },
        {
            "id": "solo_buffer",
            "label": PROTOCOL_LABELS["solo_buffer"],
            "applicable": voltage >= 60 or nine_oh,
        },
    ]
    applicable_ids = {p["id"] for p in avail if p["applicable"]}
    regulated_ease = ease
    for pid in enabled:
        if pid not in applicable_ids:
            continue
        if pid == "emotional_wait":
            regulated_ease += 10
        elif pid == "yield_compromise":
            regulated_ease += min(18, 9 * compromise_count)
        elif pid == "solo_buffer":
            regulated_ease += 8
    regulated_ease = int(clamp(regulated_ease))
    regulated_fit = _weighted_fit(voltage, flow, regulated_ease, context)

    self_out = {
        "id": (self_meta or {}).get("id"),
        "label": (self_meta or {}).get("label") or "Me",
        "type": type_a,
        "profile": profile_a,
        "authority": auth_a,
    }
    friend_out = {
        "id": (friend_meta or {}).get("id"),
        "label": (friend_meta or {}).get("label") or "Friend",
        "type": type_b,
        "profile": profile_b,
        "authority": auth_b,
    }

    return {
        "self": self_out,
        "friend": friend_out,
        "context": context,
        "context_label": CONTEXT_LABELS[context],
        "vectors": {
            "voltage": voltage,
            "flow": flow,
            "ease": ease,
            "voltage_drivers": voltage_drivers,
            "flow_drivers": flow_drivers,
            "ease_drivers": ease_drivers,
        },
        "natural_fit": natural_fit,
        "regulated_fit": regulated_fit,
        "regulated_ease": regulated_ease,
        "weights": dict(CONTEXT_WEIGHTS[context]),
        "archetype": archetype_for(len(composite_defined)),
        "split_bridges": bridges,
        "conditioning_strip": conditioning_strip(defined_a, defined_b),
        "channel_roles": roles,
        "available_protocols": avail,
        "disclaimer": DISCLAIMER,
    }
