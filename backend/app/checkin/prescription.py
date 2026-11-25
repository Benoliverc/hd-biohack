"""Today transit → moment → Move + kit slot (deterministic, no LLM).

Commercial rules (not UI copy):
- Never map a gate/center/transit directly to a supplement or dose.
- Move is free; live kit rotation is Pro.
- Dose text only when already on the kit inventory notes row.
"""
from __future__ import annotations

from datetime import date, timedelta
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
        "Skip the extra coffee. Take a 20-minute walk before you add more.",
        "Put that extra energy into one task. Then leave the rest for later.",
        "Start only one thing. Don't add coffee or extra tasks on top.",
        "Go for a walk or stretch. Don't use the extra energy to take on more work.",
        "Do one useful thing with the extra energy. Then pause before you start another.",
    ),
    "recover": (
        "Slow down today. Do less, take breaks, and keep the day easy.",
        "Rest first. Only say yes to what you really want to do.",
        "If work feels stuck, change rooms. Keep the day short.",
        "Take a real break before you push again. Keep plans light today.",
        "Sit quietly for a few minutes. Come back only when you feel ready.",
    ),
    "borrowed_fuel": (
        "You may feel extra energy today. Use it once, then take a real break.",
        "Do one thing with this extra energy. Then stop and rest.",
        "Use the extra energy for one clear task. Then stop before you pile on more.",
        "Finish one thing while you feel up. Then rest, even if you want to keep going.",
        "Do the one thing in front of you. Then stop before you add more.",
    ),
    "mental_pressure": (
        "Write down what's on your mind. Focus on one thing, then stop.",
        "Skip the extra coffee. Take a twenty-minute walk before you add more.",
        "Pick one hard thing and finish that. Leave the rest of the list.",
        "Close extra tabs and chats. Work on one question only.",
        "Step outside for a short walk before you try to solve everything.",
    ),
    "emotional_wave": (
        "Don't make a big decision while feelings are high. Wait until you feel steadier.",
        "Take a breath before you reply. Wait until you feel steadier to choose.",
        "Skip the extra coffee when you feel up and down. Slow down first.",
        "Give yourself time before you answer or decide. Sleep on anything important.",
        "Take a short walk or sit still until the strong feeling eases a little.",
    ),
    "quiet_sky": (
        "Keep today simple. Do one main thing, then leave some free time.",
        "Keep today quiet. Don't add extra plans or noise.",
        "Have a light day. Do one errand or one task, then stop.",
        "Don't fill the empty space. Enjoy a slower day with one simple plan.",
        "Do the one thing that matters. Leave the afternoon open.",
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


def _norm_move_text(text: str) -> str:
    return " ".join(_cap_words(text).lower().split())


def prior_move_texts(
    history: list[dict[str, Any]] | None,
    day_key: str,
) -> list[str]:
    """Earlier-day offered Move labels for this person (from completion history)."""
    out: list[str] = []
    for row in history or []:
        if not str(row.get("item_id") or "").startswith("today-move:"):
            continue
        day = str(row.get("day") or "")
        if day and day >= day_key:
            continue
        label = str(row.get("label") or "").strip()
        if label:
            out.append(label)
    return out


def sky_changed_from_payload(payload: dict[str, Any] | None) -> bool:
    """True when vs-yesterday / the daily signal shows the sky itself moved."""
    if not payload:
        return True
    sky_fields = {"moon", "sun", "hanging", "bridge", "centers"}
    vs = payload.get("vs_yesterday") or []
    if any(isinstance(d, dict) and str(d.get("field") or "") in sky_fields for d in vs):
        return True
    daily = payload.get("daily_signal") or {}
    if isinstance(daily, dict):
        source = str(daily.get("source") or "")
        quiet = bool(daily.get("quiet"))
        if source and source != "continuity" and not quiet:
            return True
    return False


RECENT_MOVE_WINDOW_DAYS = 7


def _served_move_days(
    history: list[dict[str, Any]] | None,
    day_key: str,
    *,
    window_days: int = RECENT_MOVE_WINDOW_DAYS,
) -> dict[str, str]:
    """Normalized Move headline -> most recent earlier day this person was served it."""
    try:
        floor = (date.fromisoformat(day_key) - timedelta(days=window_days)).isoformat()
    except ValueError:
        floor = ""
    out: dict[str, str] = {}
    for row in history or []:
        if not str(row.get("item_id") or "").startswith("today-move:"):
            continue
        day = str(row.get("day") or "")
        if not day or day >= day_key or (floor and day < floor):
            continue
        label = str(row.get("label") or "").strip()
        if not label:
            continue
        norm = _norm_move_text(label)
        if day > out.get(norm, ""):
            out[norm] = day
    return out


def _served_today(
    history: list[dict[str, Any]] | None,
    day_key: str,
    moment: str,
) -> str | None:
    """Headline already served for this moment on the current novelty day (same-day stability)."""
    best_day = ""
    best: str | None = None
    for row in history or []:
        if str(row.get("item_id") or "") != f"today-move:{moment}":
            continue
        day = str(row.get("day") or "")
        label = str(row.get("label") or "").strip()
        if day and day >= day_key and label and day >= best_day:
            best_day, best = day, label
    return best


def select_move_text(
    moment: Moment,
    *,
    history: list[dict[str, Any]] | None,
    pro: bool,
    day_key: str,
    user_key: str | None = None,
    avoid_texts: list[str] | None = None,
    avoid_today_texts: list[str] | None = None,
    prior_texts: list[str] | None = None,
    sky_changed: bool = False,
    concrete: tuple[str, str] | None = None,
) -> tuple[str, str]:
    """Pick the Move headline for this person; returns (english_text, i18n_key).

    Account path (user_key set):
    - Same novelty day: keep the headline already served for this moment.
    - Sky changed: lead with this person's already-generated concrete action (the
      Space line in Why this) unless it was their last headline, even when another
      account has the same accurate action. Otherwise a moment line they have not had
      lately, preferring one no other account was served in the window; if all were,
      the one others saw longest ago, but never a generic line another account already
      has today. With nothing fresh left, the line this person saw longest ago (never
      yesterday's).
    - Sky unchanged: keep the last headline when it is still a candidate; never
      invent a new sentence for unchanged signals.
    Without a concrete action the moment lines rotate on this person's history.
    Free / no-salt legacy path is unchanged.
    """
    import hashlib

    options = MOMENT_MOVES[moment]
    others = [t for t in (avoid_texts or []) if t]
    other_blocked = {_norm_move_text(t) for t in others} if sky_changed else set()
    # avoid_texts arrive oldest-first; a higher rank means another account saw it more recently.
    other_rank = {_norm_move_text(t): i for i, t in enumerate(others)} if sky_changed else {}

    # Legacy path (no account salt, no avoidance): keep Free default and Pro hash.
    if not user_key and not other_blocked and not (sky_changed and (history or prior_texts)):
        if not pro or len(options) == 1:
            return _cap_words(options[0]), f"today.move.moment.{moment}.0"
        rates = _history_rates(history)
        digest = int(
            hashlib.sha256(f"{day_key}|move|{moment}".encode()).hexdigest()[:8], 16
        )
        if sum(seen for _, seen in rates.values()) >= HISTORY_WINDOW_DAYS:
            rate = _completion_rate(*rates.get(moment, (0, 0)))
            if rate >= 0.5:
                idx = 0
            else:
                idx = digest % len(options)
                if idx == 0 and rate < DOWNRANK_PRIMARY_MAX and len(options) > 1:
                    idx = 1 + (digest % (len(options) - 1))
        else:
            idx = digest % len(options)
        return _cap_words(options[idx]), f"today.move.moment.{moment}.{idx}"

    salt = f"{day_key}|move|{moment}|{user_key or ''}"
    digest = int(hashlib.sha256(salt.encode()).hexdigest()[:8], 16)
    # Candidates: concrete action first, then moment lines in this person's salted order.
    order = [(digest + i) % len(options) for i in range(len(options))]
    cands: list[tuple[str, str, bool]] = []
    if concrete and str(concrete[0] or "").strip():
        cands.append((_cap_words(concrete[0]), str(concrete[1] or ""), True))
    cands.extend(
        (_cap_words(options[i]), f"today.move.moment.{moment}.{i}", False) for i in order
    )
    by_norm = {_norm_move_text(text): (text, key) for text, key, _ in cands}

    today = _served_today(history, day_key, moment)
    if today and _norm_move_text(today) in by_norm:
        return by_norm[_norm_move_text(today)]

    served = _served_move_days(history, day_key)
    if prior_texts is not None:
        for text in prior_texts:
            served.setdefault(_norm_move_text(text), "0000-00-00")

    if not sky_changed:
        if served:
            latest = max(served.values())
            for text, key, _ in cands:
                if served.get(_norm_move_text(text)) == latest:
                    return text, key
        # No earlier headline to keep: this person's salted moment line.
        idx = order[0]
        return _cap_words(options[idx]), f"today.move.moment.{moment}.{idx}"

    def fresh(c: tuple[str, str, bool]) -> bool:
        return _norm_move_text(c[0]) not in served

    concrete_c = cands[0] if cands and cands[0][2] else None
    latest_day = max(served.values()) if served else ""
    yesterday_norms = {n for n, d in served.items() if d == latest_day}
    # The sky moved: this person's own concrete action leads unless it was their last
    # headline. Another account having the same accurate action is not a reason to drop it.
    if concrete_c and _norm_move_text(concrete_c[0]) not in yesterday_norms:
        return concrete_c[0], concrete_c[1]
    # Generic moment lines only below here. Another account already has this line today.
    today_blocked = {_norm_move_text(t) for t in (avoid_today_texts or []) if t}
    eligible = [c for c in cands if not c[2] and fresh(c)]
    # Prefer a generic line no other account was served lately.
    for c in eligible:
        if _norm_move_text(c[0]) not in other_blocked:
            return c[0], c[1]
    open_today = [c for c in eligible if _norm_move_text(c[0]) not in today_blocked]
    if open_today:
        # Every eligible line was served to someone else lately: take the one seen longest ago.
        text, key, _ = min(open_today, key=lambda c: other_rank.get(_norm_move_text(c[0]), -1))
        return text, key
    # Nothing fresh is free today: the line this person saw longest ago (never yesterday's),
    # skipping lines another account already has today when possible.
    pool = [
        c for c in cands
        if _norm_move_text(c[0]) not in today_blocked
        and _norm_move_text(c[0]) not in yesterday_norms
    ] or [c for c in cands if _norm_move_text(c[0]) not in yesterday_norms] or cands
    text, key, _ = min(pool, key=lambda c: served.get(_norm_move_text(c[0]), ""))
    return text, key


def _slot_from_kit_when(when_text: str | None, fallback: WhenSlot) -> WhenSlot:
    raw = (when_text or "").lower()
    if any(w in raw for w in ("evening", "bed", "night", "wind-down", "wind down")):
        return "evening"
    if any(w in raw for w in ("midday", "afternoon", "lunch", "noon")):
        return "midday"
    if any(w in raw for w in ("morning", "breakfast", "am", "wake")):
        return "morning"
    return fallback


def _norm_name(s: str) -> str:
    return " ".join(str(s or "").lower().replace("_", " ").replace("-", " ").split())


def _name_in_usual(name: str, usual_norm: set[str]) -> bool:
    if not usual_norm or not name:
        return False
    n = _norm_name(name)
    if n in usual_norm:
        return True
    return any(u in n or n in u for u in usual_norm if len(u) >= 4)


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
    """One owned-kit item tagged to today's moment. Never invents a dose.

    Scores bank actions across the Move slot and other dayparts, then picks the
    best-fitting action — not the first hit in a morning-first fallback list.
    A weak morning exception must not beat a stronger evening-primary action.
    Callers that prefer ad-hoc should pass a non-usual owned_names subset.
    """
    if not owned_names:
        return None
    from ..biohack.kit_variety import pick_kit_lead

    # Salt day_key so Today kit rotation is offset from Protocols morning/midday/evening
    # leads that share the same HKT day (they still also avoid via kit_supplement_id).
    slot_order: list[WhenSlot] = [when]
    for fallback in ("morning", "evening", "midday"):
        if fallback != when and fallback not in slot_order:
            slot_order.append(fallback)  # type: ignore[arg-type]

    # Tie-break: Move slot first, then evening-primary banks over midday/morning.
    slot_rank = {when: 4, "evening": 3, "midday": 2, "morning": 1}

    candidates: list[tuple[int, int, WhenSlot, dict[str, Any]]] = []
    for slot in slot_order:
        hit_slot = pick_kit_lead(
            owned_names,
            slot=slot,
            energy_label=energy_label or "Steady",
            preferred_space=preferred_space or "focus",
            focus_centers=list(focus_centers or []),
            signal_source=None,
            day_key=f"{day_key}|today",
            avoid_supplement_ids=avoid_supplement_ids,
        )
        if not hit_slot:
            continue
        score = int(hit_slot.get("moment_score") or 0)
        candidates.append((score, int(slot_rank.get(slot, 0)), slot, hit_slot))

    if not candidates:
        return None

    # Prefer any positive moment fit across slots over zero-score slot-legal leftovers.
    scored = [c for c in candidates if c[0] > 0]
    pool = scored if scored else candidates
    _score, _rank, _slot, hit = max(pool, key=lambda c: (c[0], c[1]))
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


def _usual_norm_set(usual_names: list[str] | None) -> set[str]:
    return {_norm_name(n) for n in (usual_names or []) if str(n).strip()}


def _split_adhoc_owned(
    owned: list[str], usual_norm: set[str]
) -> tuple[list[str], list[str]]:
    """Return (adhoc_owned, usual_owned) preserving order."""
    if not usual_norm:
        return owned, []
    adhoc: list[str] = []
    usual: list[str] = []
    for n in owned:
        if _name_in_usual(n, usual_norm):
            usual.append(n)
        else:
            adhoc.append(n)
    return adhoc, usual


def _build_usual_delta(
    *,
    natal: dict[str, Any],
    energy_label: str,
    usual_owned: list[str],
    usual_when_by_name: dict[str, str] | None,
    moment_when: WhenSlot,
) -> dict[str, Any] | None:
    """Quiet ease / time-shift note against usual. Never shame; never invent doses."""
    if not usual_owned:
        return None
    usual_norm = _usual_norm_set(usual_owned)
    when_map = {
        _norm_name(k): v
        for k, v in (usual_when_by_name or {}).items()
        if v in ("morning", "midday", "evening")
    }

    # Ease: Natal decrease_or_pause that names a usual compound, or Low/Drained weather.
    try:
        from ..biohack.rules import build_natal_baseline
    except Exception:
        build_natal_baseline = None  # type: ignore[assignment]
    if build_natal_baseline is not None:
        baseline = build_natal_baseline(natal, inventory_names=usual_owned)
        for row in baseline.get("decrease_or_pause") or []:
            if not isinstance(row, dict):
                continue
            name = str(row.get("name") or "")
            note = str(row.get("note") or "")
            if not _name_in_usual(f"{name} {note}", usual_norm):
                continue
            # Pick a matching usual display name for the note.
            display = next(
                (u for u in usual_owned if _name_in_usual(u, {_norm_name(name)}) or _name_in_usual(name, {_norm_name(u)})),
                usual_owned[0],
            )
            return {
                "kind": "ease",
                "name": display,
                "text": "Quiet day for this usual item — ease if it fits. Not medical advice.",
            }

    if energy_label in ("Low", "Drained") and usual_owned:
        return {
            "kind": "ease",
            "name": usual_owned[0],
            "text": "Sky is quieter — easing a usual item is fine today.",
        }

    # Time-shift: usual_when set and today's Move slot differs, and bank allows the new slot.
    for u in usual_owned:
        uw = when_map.get(_norm_name(u))
        if not uw or uw == moment_when:
            continue
        # Confirm bank has a legal action in moment_when for this item.
        from ..biohack.kit_variety import pick_kit_lead

        hit = pick_kit_lead(
            [u],
            slot=moment_when,
            energy_label=energy_label or "Steady",
            preferred_space="focus",
            focus_centers=[],
            signal_source=None,
            day_key="usual-shift-probe",
        )
        if not hit:
            continue
        return {
            "kind": "time_shift",
            "name": u,
            "from_when": uw,
            "to_when": moment_when,
            "text": f"Usual is {uw}; today a {moment_when} window also fits.",
        }
    return None


def _kit_item_id(kit_item: dict[str, Any]) -> str:
    return f"today-kit:{kit_item.get('kit_supplement_id') or kit_item['name']}"


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
    usual_names: list[str] | None = None,
    usual_when_by_name: dict[str, str] | None = None,
    user_key: str | None = None,
    avoid_move_texts: list[str] | None = None,
    avoid_move_texts_today: list[str] | None = None,
    sky_changed: bool = False,
    concrete_action: tuple[str, str] | None = None,
    pinned_kit_item_ids: set[str] | None = None,
) -> dict[str, Any]:
    """
    Three-line Today prescription: Move + From your kit + When.

    Free / empty kit → kit line is a placeholder (never silently omitted).
    Pro + kit → live rotated item; dose only from inventory notes.
    When a usual list exists, prefer owned weather-fit items that are not usual.
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
    move_text, move_key = select_move_text(
        moment,
        history=history,
        pro=bool(biohacking_unlocked),
        day_key=day_key,
        user_key=user_key,
        avoid_texts=avoid_move_texts,
        avoid_today_texts=avoid_move_texts_today,
        sky_changed=sky_changed,
        concrete=concrete_action,
    )
    when: WhenSlot = MOMENT_WHEN[moment]
    noun = MOMENT_NOUN[moment]
    owned = [str(n).strip() for n in (owned_names or []) if str(n).strip()]
    usual_norm = _usual_norm_set(usual_names)
    has_usual = bool(usual_norm)
    adhoc_owned, usual_owned = _split_adhoc_owned(owned, usual_norm)

    kit_item: dict[str, Any] | None = None
    kit_usual_applies = False
    show_live_kit = bool(biohacking_unlocked) and bool(owned)
    focus = list(newly) or list(natal_defined)[:2]
    if show_live_kit:
        # Prefer ad-hoc (not usual) when a usual list exists.
        pick_pool = adhoc_owned if has_usual else owned
        # Today's pick is pinned once ticked (while it is still on the shelf), so a later
        # add or remove cannot swap a completed pick out of view.
        if pinned_kit_item_ids:
            for name in owned:
                hit = pick_kit_for_moment(
                    moment=moment,
                    when=when,
                    owned_names=[name],
                    inventory_notes=inventory_notes,
                    energy_label=energy_label,
                    preferred_space=preferred_space,
                    focus_centers=focus,
                    day_key=day_key,
                )
                if hit and _kit_item_id(hit) in pinned_kit_item_ids:
                    kit_item = hit
                    break
        if pick_pool and kit_item is None:
            kit_item = pick_kit_for_moment(
                moment=moment,
                when=when,
                owned_names=pick_pool,
                inventory_notes=inventory_notes,
                energy_label=energy_label,
                preferred_space=preferred_space,
                focus_centers=focus,
                day_key=day_key,
                avoid_supplement_ids=avoid_supplement_ids,
            )
        if kit_item is None and has_usual:
            # Do not re-pitch a usual-only cupboard as today's pick.
            kit_usual_applies = True
        elif kit_item is None and not has_usual:
            # Inventory-only path unchanged: try full owned pool (already did).
            pass
        if kit_item and kit_item.get("when") in ("morning", "midday", "evening"):
            when = kit_item["when"]  # type: ignore[assignment]

    placeholder = not show_live_kit or kit_item is None
    usual_delta = None
    if show_live_kit and has_usual:
        usual_delta = _build_usual_delta(
            natal=natal,
            energy_label=energy_label,
            usual_owned=usual_owned or [n for n in owned if _name_in_usual(n, usual_norm)],
            usual_when_by_name=usual_when_by_name,
            moment_when=when,
        )

    return {
        "moment": moment,
        "moment_primary": primary,
        "moment_noun": noun,
        "when": when,
        "move_text": move_text,
        "move_key": move_key,
        "move_item_id": f"today-move:{moment}",
        "kit_placeholder": placeholder,
        "kit_usual_applies": bool(kit_usual_applies),
        "usual_delta": usual_delta,
        "kit_item": None
        if placeholder
        else {
            "name": kit_item["name"],
            "dose": kit_item.get("dose") or "",
            "kit_supplement_id": kit_item.get("kit_supplement_id") or "",
            "item_id": _kit_item_id(kit_item),
            "why": kit_item.get("why") or "",
            "when": kit_item["when"]
            if kit_item.get("when") in ("morning", "midday", "evening")
            else None,
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
    usual_names: list[str] | None = None,
    usual_when_by_name: dict[str, str] | None = None,
    replace_main_action: bool = True,
    user_key: str | None = None,
    avoid_move_texts: list[str] | None = None,
    avoid_move_texts_today: list[str] | None = None,
    sky_changed: bool | None = None,
    pinned_kit_item_ids: set[str] | None = None,
) -> dict[str, Any]:
    """Merge prescription into an indication payload. Mutates a shallow copy."""
    out = dict(indication)
    changed = sky_changed_from_payload(out) if sky_changed is None else sky_changed
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
        usual_names=usual_names,
        usual_when_by_name=usual_when_by_name,
        user_key=user_key,
        avoid_move_texts=avoid_move_texts,
        avoid_move_texts_today=avoid_move_texts_today,
        sky_changed=changed,
        concrete_action=(
            (str(out.get("main_action_micro") or ""), str(out.get("main_action_micro_key") or ""))
            if out.get("main_action_micro")
            else None
        ),
        pinned_kit_item_ids=pinned_kit_item_ids,
    )
    if replace_main_action and rx.get("move_text"):
        out["main_action_text"] = rx["move_text"]
        if rx.get("move_key"):
            out["main_action_key"] = rx["move_key"]
            out["main_action_params"] = {}
    out["moment"] = rx["moment"]
    out["moment_noun"] = rx["moment_noun"]
    out["when_slot"] = rx["when"]
    out["move_item_id"] = rx["move_item_id"]
    out["kit_placeholder"] = rx["kit_placeholder"]
    out["kit_item"] = rx["kit_item"]
    out["kit_usual_applies"] = bool(rx.get("kit_usual_applies"))
    out["usual_delta"] = rx.get("usual_delta")
    return out
