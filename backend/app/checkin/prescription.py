"""Today transit → moment → Move + kit slot (deterministic, no LLM).

Commercial rules (not UI copy):
- Never map a gate/center/transit directly to a supplement or dose.
- Move is free; live kit rotation is Pro.
- Dose text only when already on the kit inventory notes row.
"""
from __future__ import annotations

from typing import Any, Literal

from .rules import MAIN_ACTION_MAX_WORDS, _word_count

Moment = Literal[
    "mental_pressure",
    "emotional_wave",
    "borrowed_fuel",
    "quiet_sky",
    "surplus",
    "recover",
]

WhenSlot = Literal["morning", "midday", "evening"]

MOMENTS: tuple[Moment, ...] = (
    "mental_pressure",
    "emotional_wave",
    "borrowed_fuel",
    "quiet_sky",
    "surplus",
    "recover",
)

# Human noun for empty/Free kit placeholder (i18n keys map from these).
MOMENT_NOUN: dict[Moment, Literal["calm", "focus", "recovery"]] = {
    "mental_pressure": "focus",
    "emotional_wave": "calm",
    "borrowed_fuel": "recovery",
    "quiet_sky": "calm",
    "surplus": "focus",
    "recover": "recovery",
}

MOMENT_WHEN: dict[Moment, WhenSlot] = {
    "mental_pressure": "morning",
    "emotional_wave": "midday",
    "borrowed_fuel": "morning",
    "quiet_sky": "evening",
    "surplus": "morning",
    "recover": "evening",
}

# Soft siblings for Pro down-ranking (never ban a type forever).
MOMENT_SIBLINGS: dict[Moment, tuple[Moment, ...]] = {
    "surplus": ("surplus", "borrowed_fuel"),
    "borrowed_fuel": ("borrowed_fuel", "surplus"),
    "recover": ("recover", "quiet_sky"),
    "quiet_sky": ("quiet_sky", "recover", "mental_pressure"),
    "mental_pressure": ("mental_pressure", "quiet_sky"),
    "emotional_wave": ("emotional_wave", "quiet_sky"),
}

# Driver-specific Move lines — plain English, ≤20 words, no HD jargon.
# First entry is the Free / default pick; later entries rotate under Pro history.
MOMENT_MOVES: dict[Moment, tuple[str, ...]] = {
    "surplus": (
        "Skip the extra coffee. Take a 20-minute walk before you stack more inputs.",
        "Channel the charge into one clear move — then leave the rest alone.",
        "One deliberate start only. Skip stacking stimulants on top of the sky.",
    ),
    "recover": (
        "Protect your battery — fewer inputs, slower pace, one soft reset.",
        "Rest first. Only say yes to what clearly lights you up.",
        "Change rooms before forcing output. Keep the day short.",
    ),
    "borrowed_fuel": (
        "Treat the energy as borrowed — one yes, then a real pause.",
        "Use the temporary charge once, then put the battery back.",
        "One clear move on borrowed fuel — then stop before you invent more.",
    ),
    "mental_pressure": (
        "Park open questions on paper. One focus window, then stop.",
        "Skip the extra coffee. Walk twenty minutes before more inputs.",
        "Single-task one hard thing. Leave the rest of the list alone.",
    ),
    "emotional_wave": (
        "Don't decide at the crest — wait for the wave to settle.",
        "Breathe before you reply. Feel it through before you choose.",
        "Skip the extra coffee on a wave day. Soften the edges first.",
    ),
    "quiet_sky": (
        "Keep the day simple — one clear focus, then leave margin.",
        "No spike today — protect quiet and skip stacking more noise.",
        "Run a light day. One errand or one focus, then stop.",
    ),
}

HISTORY_WINDOW_DAYS = 14
# Prefer a sibling when primary completion rate is below this and sibling is above.
DOWNRANK_PRIMARY_MAX = 0.30
DOWNRANK_SIBLING_MIN = 0.45


def _as_set(values: Any) -> set[str]:
    if not values:
        return set()
    return {str(v) for v in values}


def pick_dominant_moment(
    *,
    hd_type: str,
    natal_defined: set[str],
    newly: set[str],
    bridges: list[dict[str, Any]],
    energy_level: int,
) -> Moment:
    """Same priority order as `_energy_band` first-match — never maps to a drug."""
    from ..hd.channels import MOTORS

    motor_new = newly & MOTORS
    sacral_borrowed = "Sacral" in newly
    root_borrowed = "Root" in newly
    sp_borrowed = "Solar_Plexus" in newly
    heart_borrowed = "Heart" in newly
    sacral_natal = "Sacral" in natal_defined
    projector_like = hd_type in ("Projector", "Reflector")
    quiet = (not newly) and (not bridges)

    # 1. Hyper / Root-without-Sacral
    if len(motor_new) >= 2 and "Root" in motor_new:
        return "surplus"
    if sacral_borrowed and root_borrowed:
        return "surplus"
    if sp_borrowed and root_borrowed:
        return "surplus"
    if root_borrowed and not sacral_borrowed and (not sacral_natal or projector_like):
        return "recover"

    # 2. Borrowed motor
    if sacral_borrowed or heart_borrowed:
        return "borrowed_fuel"
    motor_bridges = [
        b for b in bridges if _as_set(b.get("centers")) & MOTORS
    ]
    if len(motor_bridges) >= 2:
        return "borrowed_fuel"
    if hd_type in ("Generator", "Manifesting Generator") and sacral_natal:
        for b in bridges:
            if "Sacral" in _as_set(b.get("centers")):
                return "borrowed_fuel"

    # Emotional wave (Solar Plexus borrow) — after motors, before mind-only
    if sp_borrowed:
        return "emotional_wave"

    # 3. Mind-only overlay
    if newly and newly <= {"Head", "Ajna"}:
        return "mental_pressure"

    # Quiet sky
    if projector_like and quiet:
        return "quiet_sky"
    if quiet and energy_level <= 3:
        return "quiet_sky"

    # 4. Else energy / Sun-theme band (moment still from the six)
    if energy_level >= 5:
        return "surplus"
    if energy_level == 4:
        return "surplus" if not sacral_borrowed else "borrowed_fuel"
    if energy_level <= 2:
        return "recover"
    return "quiet_sky"


def _cap_words(text: str) -> str:
    t = text.strip().rstrip(".") + "."
    if _word_count(t) <= MAIN_ACTION_MAX_WORDS:
        return t
    words = t.replace("—", " ").split()
    return " ".join(words[:MAIN_ACTION_MAX_WORDS]).rstrip(".,;") + "."


def _history_rates(
    history: list[dict[str, Any]] | None,
) -> dict[str, tuple[int, int]]:
    """moment → (done_count, seen_count) from today-move:* completions."""
    rates: dict[str, list[int]] = {}
    for row in history or []:
        item_id = str(row.get("item_id") or "")
        if not item_id.startswith("today-move:"):
            continue
        parts = item_id.split(":")
        if len(parts) < 2:
            continue
        moment = parts[1]
        if moment not in MOMENTS:
            continue
        bucket = rates.setdefault(moment, [0, 0])
        bucket[1] += 1
        if row.get("done"):
            bucket[0] += 1
    return {k: (v[0], v[1]) for k, v in rates.items()}


def _completion_rate(done: int, seen: int) -> float:
    if seen <= 0:
        return 0.5  # neutral — no penalty for never offered
    return done / seen


def select_moment_with_history(
    primary: Moment,
    *,
    history: list[dict[str, Any]] | None,
    pro: bool,
    day_key: str,
) -> Moment:
    """Pro adaptive ranking after ~14 days; Free always keeps primary."""
    if not pro:
        return primary
    rates = _history_rates(history)
    total_seen = sum(seen for _, seen in rates.values())
    if total_seen < HISTORY_WINDOW_DAYS:
        return primary
    siblings = MOMENT_SIBLINGS.get(primary, (primary,))
    primary_rate = _completion_rate(*rates.get(primary, (0, 0)))
    best = primary
    best_rate = primary_rate
    for sib in siblings:
        rate = _completion_rate(*rates.get(sib, (0, 0)))
        if rate > best_rate + 1e-9:
            best = sib
            best_rate = rate
        elif abs(rate - best_rate) < 1e-9 and sib != best:
            # Stable tie-break on day_key
            import hashlib

            digest = hashlib.sha256(f"{day_key}|moment|{sib}|{best}".encode()).hexdigest()
            if int(digest[:8], 16) % 2 == 0:
                best = sib
    if best != primary:
        if primary_rate <= DOWNRANK_PRIMARY_MAX and best_rate >= DOWNRANK_SIBLING_MIN:
            return best
        if primary_rate < best_rate - 0.25:
            return best
    return primary


def select_move_text(
    moment: Moment,
    *,
    history: list[dict[str, Any]] | None,
    pro: bool,
    day_key: str,
) -> str:
    """Pick a Move line for the moment; Pro may prefer finished lifestyle variants."""
    options = MOMENT_MOVES[moment]
    if not pro or len(options) == 1:
        return _cap_words(options[0])
    rates = _history_rates(history)
    # Variant index stored as today-move:{moment}:{idx} optional; fall back to day hash.
    # Prefer variants whose parent moment has higher completion when we have history.
    import hashlib

    digest = int(
        hashlib.sha256(f"{day_key}|move|{moment}".encode()).hexdigest()[:8], 16
    )
    if sum(seen for _, seen in rates.values()) >= HISTORY_WINDOW_DAYS:
        # Completed moments prefer index 0; ignored moments rotate off index 0.
        rate = _completion_rate(*rates.get(moment, (0, 0)))
        if rate >= 0.5:
            idx = 0
        else:
            idx = digest % len(options)
            if idx == 0 and rate < DOWNRANK_PRIMARY_MAX and len(options) > 1:
                idx = 1 + (digest % (len(options) - 1))
    else:
        idx = digest % len(options)
    return _cap_words(options[idx])


def _slot_from_kit_when(when_text: str | None, fallback: WhenSlot) -> WhenSlot:
    raw = (when_text or "").lower()
    if any(w in raw for w in ("evening", "bed", "night", "wind-down", "wind down")):
        return "evening"
    if any(w in raw for w in ("midday", "afternoon", "lunch", "noon")):
        return "midday"
    if any(w in raw for w in ("morning", "breakfast", "am", "wake")):
        return "morning"
    return fallback


def pick_kit_for_moment(
    *,
    moment: Moment,
    when: WhenSlot,
    owned_names: list[str],
    inventory_notes: dict[str, str] | None,
    energy_label: str,
    preferred_space: str,
    focus_centers: list[str] | None,
    day_key: str,
    avoid_supplement_ids: set[str] | None = None,
) -> dict[str, Any] | None:
    """One owned-kit item tagged to today's moment. Never invents a dose."""
    if not owned_names:
        return None
    from ..biohack.kit_variety import pick_kit_lead

    # Salt day_key so Today kit rotation is offset from Protocols morning/midday/evening
    # leads that share the same HKT day (they still also avoid via kit_supplement_id).
    hit = pick_kit_lead(
        owned_names,
        slot=when,
        energy_label=energy_label or "Steady",
        preferred_space=preferred_space or "focus",
        focus_centers=list(focus_centers or []),
        signal_source=None,
        day_key=f"{day_key}|today",
        avoid_supplement_ids=avoid_supplement_ids,
    )
    if not hit:
        return None
    matched = str(hit.get("matched_as") or hit.get("item") or "")
    notes_map = {k.lower(): v for k, v in (inventory_notes or {}).items()}
    dose = ""
    for key, val in notes_map.items():
        if not val or not str(val).strip():
            continue
        if key == matched.lower() or matched.lower() in key or key in matched.lower():
            dose = str(val).strip()
            break
        # Also match by display item name
        item = str(hit.get("item") or "").lower()
        if key in item or item in key:
            dose = str(val).strip()
            break
    slot = _slot_from_kit_when(str(hit.get("when") or ""), when)
    return {
        "name": str(hit.get("item") or matched),
        "matched_as": matched,
        "dose": dose,  # empty unless kit row notes already carry it
        "kit_supplement_id": str(hit.get("kit_supplement_id") or ""),
        "kit_action_id": str(hit.get("kit_action_id") or ""),
        "when": slot,
        "moment_chip": hit.get("moment_chip"),
        "why": str(hit.get("why") or ""),
    }


def build_prescription(
    *,
    natal: dict[str, Any] | None,
    transit: dict[str, Any] | None,
    overlay: dict[str, Any] | None,
    energy_level: int,
    energy_label: str,
    preferred_space: str,
    day_key: str,
    owned_names: list[str] | None = None,
    inventory_notes: dict[str, str] | None = None,
    biohacking_unlocked: bool = False,
    history: list[dict[str, Any]] | None = None,
    avoid_supplement_ids: set[str] | None = None,
) -> dict[str, Any]:
    """
    Three-line Today prescription: Move + From your kit + When.

    Free / empty kit → kit line is a placeholder (never silently omitted).
    Pro + kit → live rotated item; dose only from inventory notes.
    """
    natal = natal or {}
    overlay = overlay or {}
    hd_type = str(natal.get("type") or "")
    natal_defined = _as_set(natal.get("defined_centers"))
    newly = _as_set(overlay.get("newly_defined_centers"))
    bridges_raw = overlay.get("bridged_channels") or []
    bridges = [b for b in bridges_raw if isinstance(b, dict)]

    primary = pick_dominant_moment(
        hd_type=hd_type,
        natal_defined=natal_defined,
        newly=newly,
        bridges=bridges,
        energy_level=energy_level,
    )
    moment = select_moment_with_history(
        primary,
        history=history,
        pro=bool(biohacking_unlocked),
        day_key=day_key,
    )
    move_text = select_move_text(
        moment,
        history=history,
        pro=bool(biohacking_unlocked),
        day_key=day_key,
    )
    when: WhenSlot = MOMENT_WHEN[moment]
    noun = MOMENT_NOUN[moment]
    owned = [str(n).strip() for n in (owned_names or []) if str(n).strip()]

    kit_item: dict[str, Any] | None = None
    show_live_kit = bool(biohacking_unlocked) and bool(owned)
    if show_live_kit:
        kit_item = pick_kit_for_moment(
            moment=moment,
            when=when,
            owned_names=owned,
            inventory_notes=inventory_notes,
            energy_label=energy_label,
            preferred_space=preferred_space,
            focus_centers=list(newly) or list(natal_defined)[:2],
            day_key=day_key,
            avoid_supplement_ids=avoid_supplement_ids,
        )
        if kit_item and kit_item.get("when") in ("morning", "midday", "evening"):
            when = kit_item["when"]  # type: ignore[assignment]

    placeholder = not show_live_kit or kit_item is None

    return {
        "moment": moment,
        "moment_primary": primary,
        "moment_noun": noun,
        "when": when,
        "move_text": move_text,
        "move_item_id": f"today-move:{moment}",
        "kit_placeholder": placeholder,
        "kit_item": None
        if placeholder
        else {
            "name": kit_item["name"],
            "dose": kit_item.get("dose") or "",
            "kit_supplement_id": kit_item.get("kit_supplement_id") or "",
            "item_id": f"today-kit:{kit_item.get('kit_supplement_id') or kit_item['name']}",
        },
    }


def attach_prescription(
    indication: dict[str, Any],
    *,
    natal: dict[str, Any] | None,
    transit: dict[str, Any] | None,
    overlay: dict[str, Any] | None,
    day_key: str,
    owned_names: list[str] | None = None,
    inventory_notes: dict[str, str] | None = None,
    biohacking_unlocked: bool = False,
    history: list[dict[str, Any]] | None = None,
    avoid_supplement_ids: set[str] | None = None,
    replace_main_action: bool = True,
) -> dict[str, Any]:
    """Merge prescription into an indication payload. Mutates a shallow copy."""
    out = dict(indication)
    rx = build_prescription(
        natal=natal,
        transit=transit,
        overlay=overlay,
        energy_level=int(out.get("energy_level") or 3),
        energy_label=str(out.get("energy_label") or "Steady"),
        preferred_space=str(out.get("preferred_space") or "focus"),
        day_key=day_key,
        owned_names=owned_names,
        inventory_notes=inventory_notes,
        biohacking_unlocked=biohacking_unlocked,
        history=history,
        avoid_supplement_ids=avoid_supplement_ids,
    )
    if replace_main_action and rx.get("move_text"):
        out["main_action_text"] = rx["move_text"]
    out["moment"] = rx["moment"]
    out["moment_noun"] = rx["moment_noun"]
    out["when_slot"] = rx["when"]
    out["move_item_id"] = rx["move_item_id"]
    out["kit_placeholder"] = rx["kit_placeholder"]
    out["kit_item"] = rx["kit_item"]
    return out
