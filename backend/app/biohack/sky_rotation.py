"""Sky-rotated daily protocol — Daily Novelty Contract for timed leads.

Forces ≥1 visible HKT-day delta when today's natural lead fingerprint
matches yesterday's, without thrashing owned kit leads.
"""

from __future__ import annotations

import hashlib
from typing import Any

# Slot preference when forcing rotation: keep morning sticky (anti-whiplash).
_ROTATE_ORDER = ("midday", "evening", "morning")

# Behavior micros keyed by daily_signal.source — not supplements.
_NOVELTY_MICROS: dict[str, dict[str, list[tuple[str, str, str, str]]]] = {
    "moon_gate": {
        "morning": [
            (
                "On waking",
                "Moon-gate soft start — no feed for 10 min",
                "Water + light only",
                "New Moon gate — let the theme colour the morning before inputs.",
            ),
        ],
        "midday": [
            (
                "Midday",
                "Moon-gate pause — 3 breaths before the next yes",
                "Stand, breathe, then decide",
                "Novelty micro from today's Moon gate signal.",
            ),
            (
                "Midday",
                "Name the Moon theme out loud once",
                "One sentence, then back to work",
                "Anchor the new Moon gate without forcing a plan.",
            ),
        ],
        "evening": [
            (
                "Evening",
                "Moon-note · 5 lines, no fix",
                "Paper or notes app",
                "Close the Moon-gate day with notice, not optimization.",
            ),
        ],
    },
    "moon_line": {
        "midday": [
            (
                "Midday",
                "Line-shift check — same gate, new flavour",
                "2 min notice",
                "Moon line moved — keep the gate, change the angle.",
            ),
        ],
        "evening": [
            (
                "Evening",
                "Drop one tab that belongs to yesterday's line",
                "Close it for good tonight",
                "Line novelty — don't carry the old flavour into sleep.",
            ),
        ],
    },
    "sun_line": {
        "midday": [
            (
                "Midday",
                "Sun-line walk — 8 min outdoors",
                "No podcast",
                "Sun theme line-shift — body before more certainty.",
            ),
        ],
        "evening": [
            (
                "Evening",
                "Sun-line close — one sentence of theme",
                "Write it, leave it",
                "Weekly theme nuance without a new stack.",
            ),
        ],
    },
    "sun_gate": {
        "morning": [
            (
                "Morning",
                "New Sun gate — orient before tasks",
                "2 min quiet",
                "Weekly theme turn — orient, then respond.",
            ),
        ],
        "midday": [
            (
                "Midday",
                "Sun-gate single thread (25 min)",
                "One focus only",
                "New Sun gate — one thread beats a new supplement.",
            ),
        ],
        "evening": [
            (
                "Evening",
                "Sun-gate wind-down · no late research",
                "Screens down early",
                "Protect the new weekly theme from overnight noise.",
            ),
        ],
    },
    "hanging_pressure": {
        "midday": [
            (
                "Midday",
                "Hanging-pressure notice — no force-bridge",
                "Name the gate, don't chase it",
                "Sky pressing a hanging gate — information, not a to-do.",
            ),
        ],
        "evening": [
            (
                "Evening",
                "Release the chase — one breath for the open wire",
                "No outreach required",
                "Hanging pressure clears or peaks — don't manufacture the bridge.",
            ),
        ],
    },
    "conditioning": {
        "midday": [
            (
                "Midday",
                "Conditioning check — is this urgency yours?",
                "Body yes/no",
                "Bridges / temporary centers shifted — don't over-identify.",
            ),
        ],
        "evening": [
            (
                "Evening",
                "Aura hygiene after borrowed weather",
                "Solo 15 min before sleep",
                "Conditioning update — discharge before you call it identity.",
            ),
        ],
    },
    "continuity": {
        "midday": [
            (
                "Midday",
                "Continuity angle — same sky, new 10-min lens",
                "One fresh question only",
                "Same conditioning day — novelty is the angle, not a new stack.",
            ),
            (
                "Midday",
                "Open-center scan — what did you borrow this morning?",
                "Name one, drop one",
                "Day-N continuity — watch amplification, don't invent weather.",
            ),
        ],
        "evening": [
            (
                "Evening",
                "Day-N close — keep the theme, change the room",
                "Different chair / light",
                "Continuity novelty — same theme, different somatic set.",
            ),
        ],
        "morning": [
            (
                "Morning",
                "Same theme, softer start",
                "Protein before messages",
                "Continuity day — don't force a new protocol; soften the entry.",
            ),
        ],
    },
}


def bare_item_name(item: str) -> str:
    return item.replace(" (consider adding)", "").strip().lower()


def lead_fingerprint(morning: dict, midday: dict, evening: dict) -> str:
    return "|".join(
        bare_item_name(str(slot.get("item") or ""))
        for slot in (morning, midday, evening)
    )


def _behavior_item(when: str, item: str, dose_hint: str, why: str) -> dict[str, Any]:
    return {
        "when": when,
        "item": item,
        "dose_hint": dose_hint,
        "why": why,
        "in_inventory": False,
        "priority": 1,
    }


def _stable_index(key: str, n: int) -> int:
    if n <= 0:
        return 0
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return int(digest[:8], 16) % n


def _pick_micro(
    source: str,
    slot: str,
    signal_key: str,
    *,
    avoid: str | None,
) -> dict | None:
    pool_by_source = _NOVELTY_MICROS.get(source) or _NOVELTY_MICROS["continuity"]
    options = list(pool_by_source.get(slot) or [])
    if not options:
        options = list((_NOVELTY_MICROS["continuity"].get(slot) or []))
    if not options:
        return None
    avoid_b = bare_item_name(avoid or "")
    filtered = [o for o in options if bare_item_name(o[1]) != avoid_b]
    if not filtered:
        filtered = options
    when, item, dose, why = filtered[_stable_index(signal_key + ":" + slot, len(filtered))]
    return _behavior_item(when, item, dose, why)


def apply_sky_rotation(
    morning: dict,
    midday: dict,
    evening: dict,
    *,
    yesterday_fingerprint: str | None,
    daily_signal: dict[str, Any] | None,
    owned: set[str] | None = None,
) -> tuple[dict, dict, dict, dict[str, Any]]:
    """Return leads + meta. Rotates at most one non-kit slot when fingerprints match."""
    _ = owned  # reserved for future kit-safe swaps; behaviors only for now
    signal = daily_signal or {}
    source = str(signal.get("source") or "continuity")
    signal_key = str(signal.get("key") or "continuity:default")
    today_fp = lead_fingerprint(morning, midday, evening)
    y_fp = (yesterday_fingerprint or "").strip()
    slots = {"morning": dict(morning), "midday": dict(midday), "evening": dict(evening)}
    rotated_slot: str | None = None
    forced = bool(y_fp and y_fp == today_fp)

    if forced:
        for slot_name in _ROTATE_ORDER:
            cur = slots[slot_name]
            if cur.get("in_inventory"):
                continue
            micro = _pick_micro(
                source,
                slot_name,
                signal_key,
                avoid=str(cur.get("item") or ""),
            )
            if micro and bare_item_name(micro["item"]) != bare_item_name(
                str(cur.get("item") or "")
            ):
                slots[slot_name] = micro
                rotated_slot = slot_name
                break
        if rotated_slot is None:
            micro = _pick_micro(
                source,
                "midday",
                signal_key,
                avoid=str(slots["midday"].get("item") or ""),
            )
            if micro:
                slots["midday"] = micro
                rotated_slot = "midday"

    new_fp = lead_fingerprint(slots["morning"], slots["midday"], slots["evening"])
    novelty_micro = str(signal.get("body") or "").strip() or (
        "Notice today's sky signal — colour the day without forcing a new stack."
    )
    whats_new = {
        "chip": str(signal.get("headline") or "What's new vs yesterday"),
        "body": novelty_micro,
        "source": source,
        "key": signal_key,
        "rotated": rotated_slot is not None,
        "rotated_slot": rotated_slot,
        "forced_rotation": bool(forced and rotated_slot is not None),
        "lead_fingerprint": new_fp,
        "yesterday_lead_fingerprint": y_fp or None,
        "fingerprint_matched": forced,
    }
    return slots["morning"], slots["midday"], slots["evening"], whats_new
