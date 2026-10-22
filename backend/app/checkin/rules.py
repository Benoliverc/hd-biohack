"""Deterministic Main action for Today check-in (no LLM, no Protocol generate)."""

from __future__ import annotations

from typing import Any, Literal

PreferredSpace = Literal["people", "alone", "nature", "focus", "out"]

ENERGY_MIN = 1
ENERGY_MAX = 5

SPACE_MICRO: dict[str, str] = {
    "alone": "Carve 20 minutes without chat.",
    "people": "Have your highest-leverage conversation earlier today.",
    "nature": "Walk outdoors briefly before screens pile up.",
    "focus": "Work with your back to a wall / one entrance.",
    "out": "Batch errands near natural thresholds (commute, lunch).",
}

TYPE_BATTERY: dict[str, str] = {
    "Generator": "Your battery fills when you respond — not when you push.",
    "Manifesting Generator": "Your battery needs a Sacral yes first — then inform — not constant acceleration.",
    "Manifestor": "Your battery likes protected initiation windows, not constant availability.",
    "Projector": "Your battery is recognition + rest, not Sacral stamina.",
    "Reflector": "Your battery is the room you're in — change place before forcing output.",
}

# Energy 1–2: protect / recover (no "push" sky framing)
TYPE_RECOVER: dict[str, str] = {
    "Generator": "Protect Sacral rest today — only respond to what clearly lights you up; skip forced starts.",
    "Manifesting Generator": "Downshift: one Sacral yes at a time, inform, then rest between bursts.",
    "Manifestor": "Guard a quiet initiation window — inform only who must know, then recover.",
    "Projector": "Prioritise rest and recognition hygiene — no chasing, no unsolicited advice.",
    "Reflector": "Change the room before forcing output — sample a calmer place today.",
}

# Energy 4–5: use surplus carefully, Strategy-aligned
TYPE_SURPLUS: dict[str, str] = {
    "Generator": "Use surplus to respond to one clear Sacral yes — not a longer to-do list.",
    "Manifesting Generator": "Channel the charge into one Sacral yes, then inform before you accelerate.",
    "Manifestor": "Spend surplus on one informed initiation — then protect the recovery gap.",
    "Projector": "Offer guidance only where you're invited — let recognition, not volume, lead.",
    "Reflector": "Use the high day to sample the right room — don't lock big decisions yet.",
}

GENERIC_RECOVER = "Protect your battery today — fewer inputs, slower pace, no forced push."
GENERIC_STEADY = "Run a simple operating day — one clear focus, then stop."
GENERIC_SURPLUS = "Use the extra energy on one deliberate move — then leave margin."
HYPER_NOTE = "Skip extra stimulants and stacked commitments — ride the charge without overloading."


def _type_strategy(natal: dict[str, Any] | None) -> tuple[str, str]:
    if not natal:
        return "", ""
    return str(natal.get("type") or ""), str(natal.get("strategy") or "")


def sky_bullet_one(
    transit: dict[str, Any] | None,
    overlay: dict[str, Any] | None,
) -> str | None:
    """Mirror the first Today sky bullet (informational, not medical)."""
    transit = transit or {}
    overlay = overlay or {}
    sun_earth = transit.get("sun_earth")
    if isinstance(sun_earth, dict):
        sun = sun_earth.get("sun") or {}
        gate = sun.get("gate")
        line = sun.get("line")
        if gate is not None and line is not None:
            label = f"{gate}.{line}"
        else:
            label = str(sun.get("label") or "").strip() or "today's Sun"
        return f"Notice the Sun theme ({label}) — let it color your day without forcing it."
    newly = overlay.get("newly_defined_centers") or []
    if newly:
        centers = ", ".join(str(c).replace("_", " ") for c in newly[:3])
        return (
            f"Temporary energy in {centers} — expect unfamiliar pressure; "
            "don't over-identify."
        )
    bridged = overlay.get("bridged_channels") or []
    if bridged and isinstance(bridged[0], dict):
        name = bridged[0].get("name") or "a bridge"
        return f"A bridge may be active ({name}) — watch who/what feels magnetic today."
    return None


def compute_main_action(
    energy_level: int,
    preferred_space: str,
    *,
    natal: dict[str, Any] | None = None,
    transit: dict[str, Any] | None = None,
    overlay: dict[str, Any] | None = None,
    cached_top_action: str | None = None,
) -> tuple[str, str, str]:
    """
    Return (main_action_text, main_action_why, main_action_micro).

    main_action_text is the title only — space micro-move is separate for its own UI line.
    Deterministic only — never calls Protocol generate or an LLM.
    """
    if energy_level < ENERGY_MIN or energy_level > ENERGY_MAX:
        raise ValueError(f"energy_level must be {ENERGY_MIN}–{ENERGY_MAX}")
    if preferred_space not in SPACE_MICRO:
        raise ValueError("preferred_space must be people|alone|nature|focus|out")

    hd_type, strategy = _type_strategy(natal)
    micro = SPACE_MICRO[preferred_space]
    battery = TYPE_BATTERY.get(hd_type, "Protect your energy map today.")

    if energy_level <= 2:
        primary = TYPE_RECOVER.get(hd_type, GENERIC_RECOVER)
        why = f"Energy is {['', 'Drained', 'Low'][energy_level]} — protect and recover. {battery}"
    elif energy_level == 3:
        sky = sky_bullet_one(transit, overlay)
        if sky:
            primary = sky
            why = "Steady energy — follow today's sky cue as your OS guide."
        elif cached_top_action:
            primary = cached_top_action.strip()
            why = "Steady energy — lean on your last protocol focus (read-only)."
        elif strategy:
            primary = f"Follow Strategy: {strategy} — one clear focus, then stop."
            why = f"Steady energy — run your {hd_type or 'chart'} operating system."
        else:
            primary = GENERIC_STEADY
            why = "Steady energy — keep the day simple without a natal overlay yet."
    else:
        primary = TYPE_SURPLUS.get(hd_type, GENERIC_SURPLUS)
        if strategy and hd_type:
            primary = f"{primary.rstrip('.')} (Strategy: {strategy})."
        if energy_level == 5:
            primary = f"{primary.rstrip('.')}. {HYPER_NOTE}"
            why = f"Hyper energy — use surplus carefully; avoid more stimulation. {battery}"
        else:
            why = f"Charged energy — use surplus carefully, Strategy-aligned. {battery}"

    text = primary.rstrip(".") + "."
    why = f"{why.rstrip('.')} · Space: {preferred_space.replace('focus', 'focus corner').replace('out', 'out & about')}."
    return text, why, micro
