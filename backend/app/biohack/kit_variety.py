"""Kit-aware action bank + HKT daily fact rotation.

Moment tags reuse Protocols/checkin taxonomy: energy bands, preferred space,
focus centers, daily_signal.source, and light themes (sleep, focus, sacral_yes…).
"""

from __future__ import annotations

import hashlib
import re
import json
from functools import lru_cache
from pathlib import Path
from typing import Any

_DATA = Path(__file__).resolve().parent / "data"


def _stable_index(key: str, n: int) -> int:
    if n <= 0:
        return 0
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return int(digest[:8], 16) % n


def _norm(s: str) -> str:
    return " ".join(str(s or "").lower().replace("_", " ").replace("-", " ").split())


# Shared class words alone must not match Vitamin D3 ↔ Vitamin B12 / B-complex.
_GENERIC_TOKENS = frozenset(
    {
        "vitamin",
        "vitamins",
        "complex",
        "oil",
        "oils",
        "extract",
        "extracts",
        "acid",
        "acids",
        "supplement",
        "supplements",
        "capsules",
        "softgels",
        "powder",
        "liquid",
        "multi",
        "with",
        "and",
        "the",
        "for",
    }
)


def _is_form_token(t: str) -> bool:
    """Letter+digit forms: d3, b12, k2, mk7, b5, …"""
    return bool(re.fullmatch(r"[a-z]{1,3}\d+[a-z0-9]*", t or ""))


def _diff_tokens(toks: set[str], meaningful: set[str]) -> set[str]:
    return {
        t
        for t in toks
        if t not in meaningful
        and t not in _GENERIC_TOKENS
        and (len(t) >= 4 or _is_form_token(t))
    }


def _match_score(owned: str, alias: str) -> int:
    """Higher is better. 0 = no match. Prefers specific forms over bare mineral names."""
    o, a = _norm(owned), _norm(alias)
    if not o or not a:
        return 0
    if o == a:
        return 200
    # Phrase containment (len≥4) — 'omega 3' in 'omega-3 fish oil' etc.
    if len(a) >= 4 and a in o:
        return 120 + len(a)
    if len(o) >= 4 and o in a:
        return 110 + len(o)
    o_toks = [t for t in o.split() if t]
    a_toks = [t for t in a.split() if t]
    o_set, a_set = set(o_toks), set(a_toks)
    shared = o_set & a_set
    meaningful = {
        t
        for t in shared
        if t not in _GENERIC_TOKENS
        and (len(t) >= 4 or _is_form_token(t) or (len(t) >= 2 and t.isalnum() and t == a))
    }
    o_forms = {t for t in o_set if _is_form_token(t)}
    a_forms = {t for t in a_set if _is_form_token(t)}
    if o_forms and a_forms:
        if o_forms & a_forms:
            return 95
        return 0  # d3 vs b12 etc.
    if not meaningful:
        # Exact short alias equals a full owned token (b12, d3, nac, k2)
        if len(a) <= 3 and a in o_set:
            return 90
        if _is_form_token(a) and a in o_set:
            return 90
        if o_forms and any(f in a_set or f in a for f in o_forms):
            return 90
        return 0
    o_extra = _diff_tokens(o_set, meaningful)
    a_extra = _diff_tokens(a_set, meaningful)
    if o_extra and a_extra:
        return 0  # conflicting specific forms
    score = 40 + 15 * len(meaningful) + sum(len(t) for t in meaningful)
    if not o_extra and a_extra:
        # Owned is generic ('magnesium') matching a specific form — allowed but weaker
        score -= 20
    return score


def _names_match(owned: str, alias: str) -> bool:
    return _match_score(owned, alias) > 0


@lru_cache(maxsize=1)
def _load_actions() -> dict[str, Any]:
    path = _DATA / "supplement_actions.json"
    return json.loads(path.read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def _load_facts() -> dict[str, Any]:
    path = _DATA / "supplement_facts.json"
    return json.loads(path.read_text(encoding="utf-8"))


def library_stats() -> dict[str, float | int]:
    actions = _load_actions().get("supplements") or []
    facts = _load_facts().get("facts") or []
    n = len(actions)
    n_act = sum(len(s.get("actions") or []) for s in actions)
    n_fact = len(facts)
    return {
        "supplements": n,
        "actions": n_act,
        "facts": n_fact,
        "avg_actions": round(n_act / n, 2) if n else 0,
        "avg_facts": round(n_fact / n, 2) if n else 0,
    }


def match_owned_supplements(owned_names: list[str] | set[str]) -> list[dict[str, Any]]:
    """Return action-bank supplements; each owned name maps to its best match only."""
    owned = [str(x) for x in owned_names if str(x).strip()]
    if not owned:
        return []
    # owned_name → (score, supp)
    best: dict[str, tuple[int, dict[str, Any]]] = {}
    for supp in _load_actions().get("supplements") or []:
        aliases = [a for a in (list(supp.get("aliases") or []) + [supp.get("display") or ""]) if a]
        for o in owned:
            score = max((_match_score(o, a) for a in aliases), default=0)
            if score <= 0:
                continue
            prev = best.get(o)
            if prev is None or score > prev[0]:
                best[o] = (score, supp)
    # Dedupe by supplement id (two owned names may resolve to same bank entry)
    by_id: dict[str, dict[str, Any]] = {}
    for o, (_score, supp) in best.items():
        sid = str(supp.get("id") or "")
        row = dict(supp)
        row["matched_as"] = o
        if sid not in by_id:
            by_id[sid] = row
    return list(by_id.values())


def _moment_score(
    moments: dict[str, Any],
    *,
    slot: str,
    energy_label: str,
    preferred_space: str,
    focus_centers: list[str],
    signal_source: str | None,
) -> int:
    score = 0
    slots = {str(s).lower() for s in (moments.get("slots") or [])}
    if slot.lower() in slots:
        score += 4
    energies = {str(e) for e in (moments.get("energy") or [])}
    if energy_label and energy_label in energies:
        score += 3
    spaces = {str(s).lower() for s in (moments.get("space") or [])}
    if preferred_space and preferred_space.lower() in spaces:
        score += 2
    centers = {str(c).replace(" ", "_") for c in (moments.get("centers") or [])}
    focus = {str(c).replace(" ", "_") for c in focus_centers}
    if centers & focus:
        score += 3
    signals = {str(s) for s in (moments.get("signal") or [])}
    if signal_source and signal_source in signals:
        score += 2
    themes = {str(t) for t in (moments.get("themes") or [])}
    # Soft theme boosts from energy / space
    if energy_label in ("Hyper", "Charged") and ("motor" in themes or "calm" in themes):
        score += 1
    if energy_label in ("Low", "Drained") and ("recovery" in themes or "sleep" in themes):
        score += 1
    if preferred_space == "focus" and "focus" in themes:
        score += 1
    if preferred_space == "alone" and ("calm" in themes or "sleep" in themes):
        score += 1
    return score


def pick_kit_lead(
    owned_names: list[str] | set[str],
    *,
    slot: str,
    energy_label: str,
    preferred_space: str,
    focus_centers: list[str] | None = None,
    signal_source: str | None = None,
    day_key: str,
    avoid_supplement_ids: set[str] | None = None,
) -> dict[str, Any] | None:
    """Pick one moment-fit kit action for a timed slot; rotate across HKT days.

    Returns a plan-shaped dict (when/item/dose_hint/why/in_inventory/…) or None
    when the kit has no bank match for this slot context.
    """
    owned_list = [str(x) for x in owned_names if str(x).strip()]
    if not owned_list:
        return None
    focus = list(focus_centers or [])
    avoid = set(avoid_supplement_ids or [])
    matched = match_owned_supplements(owned_list)
    if not matched:
        return None

    candidates: list[tuple[int, str, dict[str, Any], dict[str, Any]]] = []
    for supp in matched:
        sid = str(supp.get("id") or "")
        if sid in avoid:
            continue
        for action in supp.get("actions") or []:
            moments = action.get("moments") or {}
            score = _moment_score(
                moments,
                slot=slot,
                energy_label=energy_label,
                preferred_space=preferred_space,
                focus_centers=focus,
                signal_source=signal_source,
            )
            # Allow off-slot actions at a discount so multi-item kits still rotate.
            slots = {str(s).lower() for s in (moments.get("slots") or [])}
            if slot.lower() not in slots:
                score = max(0, score - 2)
            candidates.append((score, sid, supp, action))

    if not candidates:
        return None

    # Qualified bank: positive moment fit, else any owned bank match for the slot.
    scored = [c for c in candidates if c[0] > 0]
    pool = scored if scored else candidates

    # Day-hash among distinct owned supplement ids first (anti B/Mag stack[0] sticky),
    # then pick the best-scoring action for that id. Same day_key → same lead.
    by_id: dict[str, list[tuple[int, str, dict[str, Any], dict[str, Any]]]] = {}
    for c in pool:
        by_id.setdefault(c[1], []).append(c)
    # Prefer ids that have a slot-fitting / higher-scoring action, but keep all
    # qualified ids in the rotation set when kit has 3+ so leads aren't stuck.
    id_best = {
        sid: max(rows, key=lambda r: (r[0], str(r[3].get("id") or "")))
        for sid, rows in by_id.items()
    }
    ranked_ids = sorted(
        id_best.keys(),
        key=lambda sid: (-id_best[sid][0], sid),
    )
    kit_fp = ",".join(sorted(_norm(x) for x in owned_list))
    rot_key = f"{day_key}|{slot}|{kit_fp}|{energy_label}|{preferred_space}"
    if len(ranked_ids) >= 3:
        # Wide rotation across the owned qualified bank.
        sid = ranked_ids[_stable_index(rot_key, len(ranked_ids))]
    elif len(ranked_ids) == 2:
        # Alternate by day hash between the two.
        sid = ranked_ids[_stable_index(rot_key, 2)]
    else:
        sid = ranked_ids[0]
    score, sid, supp, action = id_best[sid]

    display = str(supp.get("display") or action.get("line") or sid)
    # Prefer plain display name as item; line carries the moment flavour in why/when
    line = str(action.get("line") or display)
    # Keep item as the supplement name for "From your kit" badge clarity;
    # put the moment line into why if distinct.
    item_name = display
    why = str(action.get("why") or "")
    if line and line.lower() != display.lower():
        # Short plain line as item when it's still the same supplement lead-in
        item_name = line if display.lower() in line.lower() else display
        if why and line.lower() not in why.lower() and display.lower() in line.lower():
            pass
    # Sky/moment why — never "you already own" (badge carries that).
    if not why or "already own" in why.lower():
        bits = [energy_label] if energy_label else []
        if preferred_space:
            bits.append(preferred_space)
        if focus_centers:
            bits.append(str(focus_centers[0]).replace("_", " "))
        weather = " / ".join(bits[:2]) if bits else "today's sky"
        why = f"Matches today's {weather} weather."
    chip_bits = []
    if energy_label:
        chip_bits.append(energy_label)
    centers = list((action.get("moments") or {}).get("centers") or [])
    if focus_centers:
        for c in focus_centers:
            if c in centers or str(c).replace(" ", "_") in {
                str(x).replace(" ", "_") for x in centers
            }:
                chip_bits.append(str(c).replace("_", " "))
                break
    if not chip_bits and slot:
        chip_bits.append(slot.title())
    moment_chip = " · ".join(chip_bits[:2]) if chip_bits else None
    return {
        "when": str(action.get("when") or slot.title()),
        "item": item_name,
        "dose_hint": str(action.get("dose_hint") or "Per label / clinician guidance"),
        "why": why,
        "in_inventory": True,
        "priority": 1,
        "kit_supplement_id": sid,
        "kit_action_id": str(action.get("id") or ""),
        "matched_as": str(supp.get("matched_as") or display),
        "moment_chip": moment_chip,
    }


def pick_kit_fact(
    owned_names: list[str] | set[str],
    *,
    day_key: str,
) -> dict[str, Any] | None:
    """One HKT-day fact about a supplement already in kit; None if empty / no match."""
    owned_list = [str(x) for x in owned_names if str(x).strip()]
    if not owned_list:
        return None
    facts = _load_facts().get("facts") or []
    matched: list[dict[str, Any]] = []
    for fact in facts:
        aliases = list(fact.get("aliases") or []) + [fact.get("supplement") or ""]
        for o in owned_list:
            if any(_names_match(o, a) for a in aliases if a):
                matched.append(fact)
                break
    if not matched:
        return None
    kit_fp = ",".join(sorted(_norm(x) for x in owned_list))
    pick = matched[_stable_index(f"fact|{day_key}|{kit_fp}", len(matched))]
    body = str(pick.get("body") or "").strip()
    if len(body) > 140:
        cut = body[:137]
        if " " in cut:
            cut = cut.rsplit(" ", 1)[0]
        body = cut.rstrip(",;:") + "…"
    return {
        "supplement": str(pick.get("supplement") or ""),
        "body": body,
        "source_id": str(pick.get("id") or ""),
        "foot": str(_load_facts().get("fact_foot") or "Informational — not medical advice"),
    }


def empty_kit_fact_cta() -> str:
    return str(
        _load_facts().get("empty_kit_cta")
        or "Add what you own — Move can prefer your shelf"
    )


# Patterns that fail Ship Gate trust (disease / prescribe / diagnose).
_FACT_BANNED = re.compile(
    r"("
    r"cure|cures|treats?|treatment|prevents?|prevention|diagnose|diagnosis|"
    r"disease|cancer|diabetes|depression|prescri(?:be|ption)|mg|iu|"
    r"you should take|take \d"
    r")",
    re.I,
)


def fact_library_trust_violations() -> list[str]:
    """Return fact ids whose body trips the medical/prescribe grep gate."""
    bad: list[str] = []
    for fact in _load_facts().get("facts") or []:
        body = str(fact.get("body") or "")
        if _FACT_BANNED.search(body):
            bad.append(f"{fact.get('id')}: {body[:80]}")
    return bad


def clear_caches() -> None:
    _load_actions.cache_clear()
    _load_facts.cache_clear()
