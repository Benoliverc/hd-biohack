"""Derive Today energy + preferred space from natal × transit overlay (no self-ask)."""

from __future__ import annotations

from typing import Any

from ..hd.channels import MOTORS, active_channels, defined_centers
from .rules import PreferredSpace, compute_main_action

ENERGY_LABELS = {
    1: "Drained",
    2: "Low",
    3: "Steady",
    4: "Charged",
    5: "Hyper",
}

SPACE_LABELS = {
    "people": "People",
    "alone": "Alone",
    "nature": "Nature",
    "focus": "Focus corner",
    "out": "Out & about",
}


def _as_set(values: Any) -> set[str]:
    if not values:
        return set()
    return {str(v) for v in values}


def _bridges(overlay: dict[str, Any] | None) -> list[dict[str, Any]]:
    raw = (overlay or {}).get("bridged_channels") or []
    out: list[dict[str, Any]] = []
    for b in raw:
        if isinstance(b, dict):
            out.append(b)
    return out


def _bridge_centers(bridges: list[dict[str, Any]]) -> set[str]:
    centers: set[str] = set()
    for b in bridges:
        centers |= _as_set(b.get("centers"))
    return centers


def _motor_bridges(bridges: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [b for b in bridges if _as_set(b.get("centers")) & MOTORS]


def _quiet_sky(newly: set[str], bridges: list[dict[str, Any]]) -> bool:
    return not newly and not bridges


def _energy_band(
    *,
    hd_type: str,
    natal_defined: set[str],
    newly: set[str],
    bridges: list[dict[str, Any]],
) -> tuple[int, list[str]]:
    """First-match energy banding. Returns (level 1–5, drivers)."""
    drivers: list[str] = []
    motor_new = newly & MOTORS
    sacral_borrowed = "Sacral" in newly
    root_borrowed = "Root" in newly
    sp_borrowed = "Solar_Plexus" in newly
    heart_borrowed = "Heart" in newly
    sacral_natal = "Sacral" in natal_defined
    projector_like = hd_type in ("Projector", "Reflector")

    # Hyper (5)
    if len(motor_new) >= 2 and "Root" in motor_new:
        drivers.append("multiple motors newly defined including Root")
        return 5, drivers
    if sacral_borrowed and root_borrowed:
        drivers.append("temporary Sacral + Root via overlay")
        return 5, drivers
    if sp_borrowed and root_borrowed:
        drivers.append("temporary Solar Plexus + Root via overlay")
        return 5, drivers

    # Charged (4) — after Hyper pairs ruled out
    if sacral_borrowed:
        drivers.append("temporary Sacral via bridge — borrowed energy, not a Type change")
        return 4, drivers
    if heart_borrowed:
        drivers.append("temporary Heart (Ego) via overlay — borrowed willpower")
        return 4, drivers

    motor_bridge_list = _motor_bridges(bridges)
    if len(motor_bridge_list) >= 2:
        drivers.append(f"{len(motor_bridge_list)} personal motor bridges active")
        return 4, drivers

    if hd_type in ("Generator", "Manifesting Generator") and sacral_natal:
        for b in bridges:
            if "Sacral" in _as_set(b.get("centers")):
                drivers.append("personal bridge into defined Sacral")
                return 4, drivers

    # Drained (1)
    if root_borrowed and not sacral_borrowed and (not sacral_natal or projector_like):
        drivers.append("Root pressure without Sacral fuel")
        return 1, drivers

    # Low (2)
    if newly and newly <= {"Head", "Ajna"}:
        drivers.append("mind-only newly defined (Head/Ajna)")
        return 2, drivers
    if projector_like and _quiet_sky(newly, bridges):
        drivers.append(f"{hd_type} with quiet personal sky")
        return 2, drivers

    # Steady (3)
    if newly:
        drivers.append("mild overlay — no extreme motor pattern")
    else:
        drivers.append("no strong personal conditioning spike")
    return 3, drivers


def _preferred_space(
    *,
    hd_type: str,
    natal_defined: set[str],
    newly: set[str],
    bridges: list[dict[str, Any]],
) -> tuple[PreferredSpace, list[str]]:
    """First-match preferred space. Returns (space, drivers)."""
    drivers: list[str] = []
    bridge_centers = _bridge_centers(bridges)
    g_open = "G" not in natal_defined
    sp_open = "Solar_Plexus" not in natal_defined

    if hd_type == "Reflector":
        drivers.append("Reflector → sample the wider field")
        return "out", drivers

    if "G" in newly or (g_open and "G" in bridge_centers):
        drivers.append("G center conditioning → nature / direction reset")
        return "nature", drivers

    if newly & {"Head", "Ajna"}:
        drivers.append("Head/Ajna newly defined → focus corner")
        return "focus", drivers

    if "Solar_Plexus" in newly and sp_open:
        drivers.append("Solar Plexus borrowed (natal open) → alone")
        return "alone", drivers

    if "Solar_Plexus" in natal_defined and "Solar_Plexus" in bridge_centers:
        drivers.append("defined Solar Plexus + bridge → people")
        return "people", drivers

    if "Root" in newly and "Sacral" not in newly:
        drivers.append("Root newly without Sacral → nature")
        return "nature", drivers

    if "Sacral" in newly or "Sacral" in bridge_centers:
        drivers.append("Sacral borrow/bridge → out & about")
        return "out", drivers

    if "Throat" in bridge_centers:
        drivers.append("Throat personal bridge → people")
        return "people", drivers

    if hd_type == "Projector" and _quiet_sky(newly, bridges):
        drivers.append("Projector quiet sky → alone")
        return "alone", drivers

    if hd_type == "Manifestor":
        drivers.append("Manifestor → alone / protected window")
        return "alone", drivers

    if hd_type in ("Generator", "Manifesting Generator"):
        drivers.append(f"{hd_type} default → focus corner")
        return "focus", drivers

    drivers.append("default focus corner")
    return "focus", drivers


def _no_natal_indication(transit: dict[str, Any] | None) -> dict[str, Any]:
    """Transit-safe Steady/Charged only — never claim personal bridges."""
    transit = transit or {}
    gates = set(transit.get("activated_gates") or [])
    transit_defined = defined_centers(active_channels(gates)) if gates else set()
    motor_hit = transit_defined & {"Sacral", "Heart"}
    if motor_hit:
        energy = 4
        drivers = [f"sky motors active ({', '.join(sorted(motor_hit))}) — save a chart for personal overlay"]
    else:
        energy = 3
        drivers = ["sky-only reading — save a natal chart for personal Energy + Space"]

    space: PreferredSpace = "focus"
    text, why, micro = compute_main_action(
        energy,
        space,
        natal=None,
        transit=transit,
        overlay=None,
    )
    why = (
        f"{why.rstrip('.')} · Chart weather only (no natal) — "
        "not biometric or medical. Save a natal chart for personal bridges."
    )
    return {
        "energy_level": energy,
        "energy_label": ENERGY_LABELS[energy],
        "preferred_space": space,
        "preferred_space_label": SPACE_LABELS[space],
        "main_action_text": text,
        "main_action_why": why,
        "main_action_micro": micro,
        "drivers": drivers,
        "has_natal": False,
        "save_chart_cta": True,
        "disclaimer": "Chart weather from today's sky — not how you feel, not medical advice.",
    }


def derive_today_indication(
    natal: dict[str, Any] | None,
    transit: dict[str, Any] | None,
    overlay: dict[str, Any] | None,
) -> dict[str, Any]:
    """
    Pure function: natal × today transit overlay → energy, space, main action.

    No LLM, no Protocol generate, no Type/Authority mutation claims.
    """
    if not natal:
        return _no_natal_indication(transit)

    natal_defined = _as_set(natal.get("defined_centers"))
    newly = _as_set((overlay or {}).get("newly_defined_centers"))
    bridges = _bridges(overlay)
    hd_type = str(natal.get("type") or "")

    energy, energy_drivers = _energy_band(
        hd_type=hd_type,
        natal_defined=natal_defined,
        newly=newly,
        bridges=bridges,
    )
    space, space_drivers = _preferred_space(
        hd_type=hd_type,
        natal_defined=natal_defined,
        newly=newly,
        bridges=bridges,
    )

    text, why, micro = compute_main_action(
        energy,
        space,
        natal=natal,
        transit=transit,
        overlay=overlay,
    )

    # Reinforce temporary/borrowed language when Sacral is newly defined
    if "Sacral" in newly:
        if "Generator today" in why or "you are a Generator" in why.lower():
            why = why.replace("you are a Generator today", "temporary Sacral energy")
        if "borrowed" not in why.lower() and "temporary" not in why.lower():
            why = f"{why.rstrip('.')} · Temporary/borrowed Sacral — not a Type change."

    drivers = energy_drivers + [d for d in space_drivers if d not in energy_drivers]
    return {
        "energy_level": energy,
        "energy_label": ENERGY_LABELS[energy],
        "preferred_space": space,
        "preferred_space_label": SPACE_LABELS[space],
        "main_action_text": text,
        "main_action_why": why,
        "main_action_micro": micro,
        "drivers": drivers,
        "has_natal": True,
        "save_chart_cta": False,
        "disclaimer": "Chart weather from your design × today's sky — not biometric or medical advice.",
    }
