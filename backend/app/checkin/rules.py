"""Deterministic Main action for Today check-in (no LLM, no Protocol generate)."""

from __future__ import annotations

from typing import Any, Literal

PreferredSpace = Literal["people", "alone", "nature", "focus", "out"]

ENERGY_MIN = 1
ENERGY_MAX = 5
MAIN_ACTION_MAX_WORDS = 20

SPACE_MICRO: dict[str, str] = {
    "alone": "Carve 20 minutes without chat.",
    "people": "Have your highest-leverage conversation earlier today.",
    "nature": "Walk outdoors briefly before screens pile up.",
    "focus": "Work with your back to a wall / one entrance.",
    "out": "Batch errands near natural thresholds (commute, lunch).",
}

# Plain-English Main action (≤20 words). HD jargon lives in Why.
TYPE_RECOVER_TEXT: dict[str, str] = {
    "Generator": "Rest first. Only say yes to what clearly lights you up.",
    "Manifesting Generator": "Slow down. One clear yes at a time, then pause.",
    "Manifestor": "Guard quiet time. Tell only who must know, then rest.",
    "Projector": "Rest and wait. Don't chase or give unsolicited advice.",
    "Reflector": "Change rooms before forcing output today.",
}

TYPE_STEADY_TEXT: dict[str, str] = {
    "Generator": "Respond to what shows up — one focus, then stop.",
    "Manifesting Generator": "Respond, then inform — one focus, then stop.",
    "Manifestor": "Inform first, then start one clear move.",
    "Projector": "Wait for a real invitation before you lean in.",
    "Reflector": "Sample the right room — don't lock big decisions yet.",
}

TYPE_SURPLUS_TEXT: dict[str, str] = {
    "Generator": "Use extra energy on one clear yes — not a longer list.",
    "Manifesting Generator": "Channel the charge into one clear yes, then inform.",
    "Manifestor": "Spend surplus on one informed start — then leave margin.",
    "Projector": "Offer guidance only where you're invited — not more volume.",
    "Reflector": "Use the high day to sample the right room — don't rush.",
}

GENERIC_RECOVER = "Protect your battery today — fewer inputs, slower pace."
GENERIC_STEADY = "Run a simple day — one clear focus, then stop."
GENERIC_SURPLUS = "Use the extra energy on one deliberate move — then rest."
HYPER_TEXT = "Skip stimulants. Channel the charge into one deliberate move."

TYPE_BATTERY: dict[str, str] = {
    "Generator": "Your battery fills when you respond — not when you push.",
    "Manifesting Generator": "Your battery needs a Sacral yes first — then inform — not constant acceleration.",
    "Manifestor": "Your battery likes protected initiation windows, not constant availability.",
    "Projector": "Your battery is recognition + rest, not Sacral stamina.",
    "Reflector": "Your battery is the room you're in — change place before forcing output.",
}

TYPE_RECOVER_WHY: dict[str, str] = {
    "Generator": "Protect Sacral rest — only respond to what clearly lights you up; skip forced starts.",
    "Manifesting Generator": "Downshift: one Sacral yes at a time, inform, then rest between bursts.",
    "Manifestor": "Guard a quiet initiation window — inform only who must know, then recover.",
    "Projector": "Prioritise rest and recognition hygiene — no chasing, no unsolicited advice.",
    "Reflector": "Change the room before forcing output — sample a calmer place today.",
}

TYPE_SURPLUS_WHY: dict[str, str] = {
    "Generator": "Use surplus to respond to one clear Sacral yes — not a longer to-do list.",
    "Manifesting Generator": "Channel the charge into one Sacral yes, then inform before you accelerate.",
    "Manifestor": "Spend surplus on one informed initiation — then protect the recovery gap.",
    "Projector": "Offer guidance only where you're invited — let recognition, not volume, lead.",
    "Reflector": "Use the high day to sample the right room — don't lock big decisions yet.",
}

HYPER_NOTE = "Skip extra stimulants and stacked commitments — ride the charge without overloading."


def _type_strategy(natal: dict[str, Any] | None) -> tuple[str, str]:
    if not natal:
        return "", ""
    return str(natal.get("type") or ""), str(natal.get("strategy") or "")


def _word_count(text: str) -> int:
    return len([w for w in text.replace("—", " ").replace("-", " ").split() if w.strip()])


def sky_bullet_one(
    transit: dict[str, Any] | None,
    overlay: dict[str, Any] | None,
) -> str | None:
    """Mirror the first Today sky bullet (informational, not medical). For Why, not Main."""
    transit = transit or {}
    overlay = overlay or {}
    sun_earth = transit.get("sun_earth")
    if isinstance(sun_earth, dict):
        sun = sun_earth.get("sun") or {}
        gate = sun.get("gate")
        line = sun.get("line")
        if gate is not None and line is not None:
            label = f"Gate {gate} · line {line}"
        else:
            raw = str(sun.get("label") or "").strip()
            if raw and "." in raw and raw.replace(".", "").isdigit():
                g, ln = raw.split(".", 1)
                label = f"Gate {g} · line {ln}"
            else:
                label = raw or "today's Sun"
        return f"Notice the Sun theme ({label}) — let it colour your day without forcing it."
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


def _sky_why_bits(
    transit: dict[str, Any] | None,
    overlay: dict[str, Any] | None,
) -> list[str]:
    """HD / sky mechanics for the collapsed Why — never the Main action line."""
    bits: list[str] = []
    from .novelty import sky_notice_sun_moon

    notice = sky_notice_sun_moon(transit)
    if notice:
        bits.append(f"{notice} — colour the day without forcing it.")
    sky = sky_bullet_one(transit, overlay)
    if sky:
        # Skip redundant Sun-theme bullet when compact notice already names Sun.
        if notice and "Sun " in notice and "Sun theme" in sky:
            pass
        else:
            bits.append(sky)
    return bits


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

    main_action_text is a plain doable sentence (≤20 words) — no gate/Sacral/Strategy soup.
    HD mechanics and sky clauses live in main_action_why (collapsed Why in the UI).
    Space micro-move is separate for its own UI line.
    Deterministic only — never calls Protocol generate or an LLM.
    """
    if energy_level < ENERGY_MIN or energy_level > ENERGY_MAX:
        raise ValueError(f"energy_level must be {ENERGY_MIN}–{ENERGY_MAX}")
    if preferred_space not in SPACE_MICRO:
        raise ValueError("preferred_space must be people|alone|nature|focus|out")

    hd_type, strategy = _type_strategy(natal)
    micro = SPACE_MICRO[preferred_space]
    battery = TYPE_BATTERY.get(hd_type, "Protect your energy map today.")
    why_bits = _sky_why_bits(transit, overlay)

    if energy_level <= 2:
        primary = TYPE_RECOVER_TEXT.get(hd_type, GENERIC_RECOVER)
        why_bits.insert(0, f"Protect and recover — {battery}")
        recover_mech = TYPE_RECOVER_WHY.get(hd_type)
        if recover_mech:
            why_bits.append(recover_mech)
    elif energy_level == 3:
        sky = sky_bullet_one(transit, overlay)
        if sky:
            primary = "Follow today's sky cue — one clear focus, then stop."
            why_bits.insert(0, "Follow today's sky cue as your OS guide.")
        elif cached_top_action:
            # Keep cached focus plain; mechanics stay in Why.
            cached = cached_top_action.strip().rstrip(".")
            words = cached.split()
            primary = (
                " ".join(words[:MAIN_ACTION_MAX_WORDS]).rstrip(".,;") + "."
                if len(words) > MAIN_ACTION_MAX_WORDS
                else cached + "."
            )
            why_bits.insert(0, "Lean on your last protocol focus (read-only).")
        elif strategy:
            primary = TYPE_STEADY_TEXT.get(hd_type, GENERIC_STEADY)
            why_bits.insert(
                0,
                f"Run your {hd_type or 'chart'} operating system — Strategy: {strategy}.",
            )
        else:
            primary = GENERIC_STEADY
            why_bits.insert(0, "Keep the day simple — no natal overlay yet.")
    else:
        if energy_level == 5:
            primary = HYPER_TEXT
            why_bits.insert(0, f"Use surplus carefully; avoid more stimulation. {battery}")
            why_bits.append(HYPER_NOTE)
        else:
            primary = TYPE_SURPLUS_TEXT.get(hd_type, GENERIC_SURPLUS)
            why_bits.insert(0, f"Use surplus carefully, Strategy-aligned. {battery}")
        surplus_mech = TYPE_SURPLUS_WHY.get(hd_type)
        if surplus_mech:
            why_bits.append(surplus_mech)
        if strategy and hd_type:
            why_bits.append(f"Strategy: {strategy}.")

    text = primary.rstrip(".") + "."
    # Soft enforce ≤20 words (templates are designed under the cap).
    if _word_count(text) > MAIN_ACTION_MAX_WORDS:
        words = text.replace("—", " ").split()
        text = " ".join(words[:MAIN_ACTION_MAX_WORDS]).rstrip(".,;") + "."

    # Why is mechanics + sky — do not restate Energy/Space chip labels.
    # Dedupe while preserving order.
    seen: set[str] = set()
    ordered: list[str] = []
    for bit in why_bits:
        key = bit.strip().lower()
        if not key or key in seen:
            continue
        seen.add(key)
        ordered.append(bit.strip().rstrip(".") + ".")
    why = " ".join(ordered)
    return text, why, micro
