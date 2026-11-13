"""Deterministic Main action for Today check-in (no LLM, no Protocol generate)."""

from __future__ import annotations

from dataclasses import dataclass, field
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

TYPE_SLUG = {
    "Generator": "Generator",
    "Manifesting Generator": "ManifestingGenerator",
    "Manifestor": "Manifestor",
    "Projector": "Projector",
    "Reflector": "Reflector",
}


def _type_slug(hd_type: str) -> str:
    return TYPE_SLUG.get(hd_type, "generic")


def _part(key: str, **params: Any) -> dict[str, Any]:
    out: dict[str, Any] = {"key": key}
    clean = {k: v for k, v in params.items() if v is not None and v != ""}
    if clean:
        out["params"] = clean
    return out


@dataclass
class MainActionResult:
    text: str
    why: str
    micro: str
    action_key: str
    action_params: dict[str, Any] = field(default_factory=dict)
    why_parts: list[dict[str, Any]] = field(default_factory=list)
    micro_key: str = ""


def _type_strategy(natal: dict[str, Any] | None) -> tuple[str, str]:
    if not natal:
        return "", ""
    return str(natal.get("type") or ""), str(natal.get("strategy") or "")


def _word_count(text: str) -> int:
    return len([w for w in text.replace("—", " ").replace("-", " ").split() if w.strip()])


def _sun_theme_label(transit: dict[str, Any] | None) -> tuple[str | None, int | None, int | None]:
    transit = transit or {}
    sun_earth = transit.get("sun_earth")
    if not isinstance(sun_earth, dict):
        return None, None, None
    sun = sun_earth.get("sun") or {}
    gate = sun.get("gate")
    line = sun.get("line")
    if gate is not None and line is not None:
        return f"Gate {gate} · line {line}", gate, line
    raw = str(sun.get("label") or "").strip()
    if raw and "." in raw and raw.replace(".", "").isdigit():
        g, ln = raw.split(".", 1)
        try:
            return f"Gate {g} · line {ln}", int(g), int(ln)
        except ValueError:
            return f"Gate {g} · line {ln}", None, None
    if raw:
        return raw, None, None
    return "today's Sun", None, None


def sky_bullet_one(
    transit: dict[str, Any] | None,
    overlay: dict[str, Any] | None,
) -> str | None:
    """Mirror the first Today sky bullet (informational, not medical). For Why, not Main."""
    text, _part = sky_bullet_one_part(transit, overlay)
    return text


def sky_bullet_one_part(
    transit: dict[str, Any] | None,
    overlay: dict[str, Any] | None,
) -> tuple[str | None, dict[str, Any] | None]:
    transit = transit or {}
    overlay = overlay or {}
    label, gate, line = _sun_theme_label(transit)
    if label is not None:
        return (
            f"Notice the Sun theme ({label}) — let it colour your day without forcing it.",
            _part("today.why.sunTheme", label=label, gate=gate, line=line),
        )
    newly = overlay.get("newly_defined_centers") or []
    if newly:
        centers = ", ".join(str(c).replace("_", " ") for c in newly[:3])
        return (
            f"Temporary energy in {centers} — expect unfamiliar pressure; "
            "don't over-identify.",
            _part("today.why.tempEnergy", centers=centers),
        )
    bridged = overlay.get("bridged_channels") or []
    if bridged and isinstance(bridged[0], dict):
        name = bridged[0].get("name") or "a bridge"
        return (
            f"A bridge may be active ({name}) — watch who/what feels magnetic today.",
            _part("today.why.bridgeActive", name=name),
        )
    return None, None


def _notice_part(transit: dict[str, Any] | None) -> tuple[str | None, dict[str, Any] | None]:
    from .novelty import gate_line

    sg, sl = gate_line(transit, "Sun")
    mg, ml = gate_line(transit, "Moon")
    if sg is None and mg is None:
        return None, None
    from .novelty import sky_notice_sun_moon

    notice = sky_notice_sun_moon(transit)
    if not notice:
        return None, None
    return (
        f"{notice} — colour the day without forcing it.",
        _part(
            "today.why.noticeSunMoon",
            sun_gate=sg,
            sun_line=sl,
            moon_gate=mg,
            moon_line=ml,
        ),
    )


def _sky_why_bits(
    transit: dict[str, Any] | None,
    overlay: dict[str, Any] | None,
) -> tuple[list[str], list[dict[str, Any]]]:
    """HD / sky mechanics for the collapsed Why — never the Main action line."""
    bits: list[str] = []
    parts: list[dict[str, Any]] = []
    notice, notice_part = _notice_part(transit)
    if notice and notice_part:
        bits.append(notice)
        parts.append(notice_part)
    sky, sky_part = sky_bullet_one_part(transit, overlay)
    if sky and sky_part:
        # Skip redundant Sun-theme bullet when compact notice already names Sun.
        if notice and "Sun " in notice and "Sun theme" in sky:
            pass
        else:
            bits.append(sky)
            parts.append(sky_part)
    return bits, parts


def compute_main_action(
    energy_level: int,
    preferred_space: str,
    *,
    natal: dict[str, Any] | None = None,
    transit: dict[str, Any] | None = None,
    overlay: dict[str, Any] | None = None,
    cached_top_action: str | None = None,
) -> MainActionResult:
    """
    Return MainActionResult (text, why, micro, plus stable i18n keys).

    main_action_text is a plain doable sentence (≤20 words) — no gate/Sacral/Strategy soup.
    HD mechanics and sky clauses live in main_action_why (collapsed Why in the UI).
    Space micro-move is separate for its own UI line.
    Deterministic only — never calls Protocol generate or an LLM.
    English template wording is unchanged; keys let the frontend localize.
    """
    if energy_level < ENERGY_MIN or energy_level > ENERGY_MAX:
        raise ValueError(f"energy_level must be {ENERGY_MIN}–{ENERGY_MAX}")
    if preferred_space not in SPACE_MICRO:
        raise ValueError("preferred_space must be people|alone|nature|focus|out")

    hd_type, strategy = _type_strategy(natal)
    slug = _type_slug(hd_type)
    micro = SPACE_MICRO[preferred_space]
    micro_key = f"today.spaceMicro.{preferred_space}"
    battery = TYPE_BATTERY.get(hd_type, "Protect your energy map today.")
    battery_key = f"today.battery.{slug}" if hd_type in TYPE_SLUG else "today.battery.generic"
    why_bits, why_parts = _sky_why_bits(transit, overlay)

    def _front(english: str, key: str, **params: Any) -> None:
        why_bits.insert(0, english)
        why_parts.insert(0, _part(key, **params))

    def _append(english: str, key: str, **params: Any) -> None:
        why_bits.append(english)
        why_parts.append(_part(key, **params))

    action_params: dict[str, Any] = {}
    if energy_level <= 2:
        primary = TYPE_RECOVER_TEXT.get(hd_type, GENERIC_RECOVER)
        action_key = f"today.move.recover.{slug}" if hd_type in TYPE_RECOVER_TEXT else "today.move.recover.generic"
        _front(f"Protect and recover — {battery}", "today.why.protectRecover", battery_key=battery_key)
        recover_mech = TYPE_RECOVER_WHY.get(hd_type)
        if recover_mech:
            _append(recover_mech, f"today.why.recover.{slug}")
    elif energy_level == 3:
        sky = sky_bullet_one(transit, overlay)
        if sky:
            primary = "Follow today's sky cue — one clear focus, then stop."
            action_key = "today.move.steady.skyCue"
            _front("Follow today's sky cue as your OS guide.", "today.why.followSkyCue")
        elif cached_top_action:
            # Keep cached focus plain; mechanics stay in Why.
            cached = cached_top_action.strip().rstrip(".")
            words = cached.split()
            primary = (
                " ".join(words[:MAIN_ACTION_MAX_WORDS]).rstrip(".,;") + "."
                if len(words) > MAIN_ACTION_MAX_WORDS
                else cached + "."
            )
            action_key = "today.move.steady.cached"
            _front("Lean on your last protocol focus (read-only).", "today.why.cachedFocus")
        elif strategy:
            primary = TYPE_STEADY_TEXT.get(hd_type, GENERIC_STEADY)
            action_key = f"today.move.steady.{slug}" if hd_type in TYPE_STEADY_TEXT else "today.move.steady.generic"
            _front(
                f"Run your {hd_type or 'chart'} operating system — Strategy: {strategy}.",
                "today.why.runTypeStrategy",
                type=hd_type or "chart",
                strategy=strategy,
            )
        else:
            primary = GENERIC_STEADY
            action_key = "today.move.steady.generic"
            _front("Keep the day simple — no natal overlay yet.", "today.why.simpleNoNatal")
    else:
        if energy_level == 5:
            primary = HYPER_TEXT
            action_key = "today.move.hyper"
            _front(
                f"Use surplus carefully; avoid more stimulation. {battery}",
                "today.why.hyperBattery",
                battery_key=battery_key,
            )
            _append(HYPER_NOTE, "today.why.hyperNote")
        else:
            primary = TYPE_SURPLUS_TEXT.get(hd_type, GENERIC_SURPLUS)
            action_key = f"today.move.surplus.{slug}" if hd_type in TYPE_SURPLUS_TEXT else "today.move.surplus.generic"
            _front(
                f"Use surplus carefully, Strategy-aligned. {battery}",
                "today.why.surplusBattery",
                battery_key=battery_key,
            )
        surplus_mech = TYPE_SURPLUS_WHY.get(hd_type)
        if surplus_mech:
            _append(surplus_mech, f"today.why.surplus.{slug}")
        if strategy and hd_type:
            _append(f"Strategy: {strategy}.", "today.why.strategy", strategy=strategy)

    text = primary.rstrip(".") + "."
    # Soft enforce ≤20 words (templates are designed under the cap).
    if _word_count(text) > MAIN_ACTION_MAX_WORDS:
        words = text.replace("—", " ").split()
        text = " ".join(words[:MAIN_ACTION_MAX_WORDS]).rstrip(".,;") + "."

    # Why is mechanics + sky — do not restate Energy/Space chip labels.
    # Dedupe while preserving order.
    seen: set[str] = set()
    ordered: list[str] = []
    ordered_parts: list[dict[str, Any]] = []
    for bit, part in zip(why_bits, why_parts):
        key = bit.strip().lower()
        if not key or key in seen:
            continue
        seen.add(key)
        ordered.append(bit.strip().rstrip(".") + ".")
        ordered_parts.append(part)
    why = " ".join(ordered)
    return MainActionResult(
        text=text,
        why=why,
        micro=micro,
        action_key=action_key,
        action_params=action_params,
        why_parts=ordered_parts,
        micro_key=micro_key,
    )
