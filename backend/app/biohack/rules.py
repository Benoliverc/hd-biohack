"""Deterministic biohacking / supplement protocol engine (no personal health data)."""
from __future__ import annotations

from typing import Any


# Center → transit-weighted stack suggestions (generic informational mapping)
CENTER_STACKS: dict[str, dict[str, list[dict] | str]] = {
    "Root": {
        "morning": [],
        "midday": [{"name": "Electrolytes", "note": "Steady adrenals under Root pressure"}],
        "evening": [
            {"name": "Magnesium Glycinate", "note": "Evening downregulation"},
            {"name": "Ashwagandha (cycle)", "note": "Pulse if Root is open or heavily transited"},
        ],
        "adjust": "Strict caffeine cutoff by early afternoon; favor grounding walks.",
    },
    "Solar_Plexus": {
        "morning": [{"name": "L-Theanine", "note": "Buffer nervous-system wave"}],
        "midday": [{"name": "Electrolytes", "note": "Gut-brain stability"}],
        "evening": [
            {"name": "NAC", "note": "Oxidative / emotional wave support"},
            {"name": "Taurine", "note": "Calm GABA tone"},
        ],
        "adjust": "Avoid stacking stimulants on high-wave days; breathwork before decisions.",
    },
    "Ajna": {
        "morning": [
            {"name": "Omega-3 / Krill", "note": "Neuroprotection"},
            {"name": "Lion's Mane", "note": "Optional cognitive support"},
        ],
        "midday": [{"name": "L-Theanine", "note": "Reduce over-analysis loops"}],
        "evening": [{"name": "Magnesium L-Threonate", "note": "Cognitive wind-down"}],
        "adjust": "Cap information intake; single-task windows.",
    },
    "Head": {
        "morning": [{"name": "B-Complex (pulse)", "note": "Methylation load awareness"}],
        "midday": [{"name": "L-Theanine", "note": "Quiet mental pressure"}],
        "evening": [{"name": "Magnesium", "note": "Release Head pressure"}],
        "adjust": "Journal open questions rather than forcing answers.",
    },
    "Sacral": {
        "morning": [{"name": "Protein-forward breakfast", "note": "Sustain sacral response energy"}],
        "midday": [{"name": "Creatine (optional)", "note": "Work capacity if training"}],
        "evening": [],
        "adjust": "Honor sacral yes/no; don't push past true fatigue.",
    },
    "Throat": {
        "morning": [{"name": "Hydration + electrolytes", "note": "Voice / expression support"}],
        "midday": [],
        "evening": [],
        "adjust": "Schedule expression (calls, writing) when Throat is clear.",
    },
    "Heart": {
        "morning": [{"name": "CoQ10 / Ubiquinol", "note": "Cellular energy"}],
        "midday": [{"name": "Astaxanthin", "note": "Mitochondrial support"}],
        "evening": [],
        "adjust": "Willpower is finite — one commitment window, then rest.",
    },
    "Spleen": {
        "morning": [{"name": "Vitamin D (if deficient)", "note": "Immune baseline"}],
        "midday": [],
        "evening": [{"name": "Zinc (pulse)", "note": "Immune / intuition support"}],
        "adjust": "Trust first instinct; don't override with mental noise.",
    },
    "G": {
        "morning": [],
        "midday": [{"name": "Outdoor light walk", "note": "Direction / identity reset"}],
        "evening": [],
        "adjust": "Protect place and people that feel like home.",
    },
}


# Natal baseline: permanent center status → emphasize / increase / decrease_or_pause
# action: emphasize | increase | decrease_or_pause
NATAL_CENTER_BASELINE: dict[str, dict[str, list[dict[str, str]]]] = {
    "Root": {
        "defined": [
            {
                "action": "emphasize",
                "name": "Steady electrolytes + protein pacing",
                "note": "Defined Root — consistent drive pulses; fuel evenly instead of crashing.",
            },
            {
                "action": "decrease_or_pause",
                "name": "All-day stimulant stacking",
                "note": "You already carry pressure — avoid amplifying with late caffeine.",
            },
        ],
        "open": [
            {
                "action": "emphasize",
                "name": "Magnesium Glycinate (evening)",
                "note": "Open Root amplifies hurry — prioritize downregulation you already own.",
            },
            {
                "action": "increase",
                "name": "Ashwagandha or Rhodiola (cycle, not both daily forever)",
                "note": "Pulse adaptogens when stress load is high; stop if wired-tired.",
            },
            {
                "action": "decrease_or_pause",
                "name": "Afternoon / evening caffeine",
                "note": "Open Root takes on others' urgency — hard cutoff protects sleep.",
            },
        ],
    },
    "Sacral": {
        "defined": [
            {
                "action": "emphasize",
                "name": "Protein-forward meals + recovery sleep",
                "note": "Defined Sacral — sustainable work energy when you respond correctly.",
            },
            {
                "action": "increase",
                "name": "Creatine / electrolytes around training days",
                "note": "Optional capacity support when Sacral says yes to effort.",
            },
            {
                "action": "decrease_or_pause",
                "name": "Pushing past true sacral fatigue with stimulants",
                "note": "Frustration + more coffee is a red flag — rest is part of Strategy.",
            },
        ],
        "open": [
            {
                "action": "emphasize",
                "name": "Scheduled rest + invitation-based workblocks",
                "note": "No consistent Sacral motor — do not live like a Generator.",
            },
            {
                "action": "decrease_or_pause",
                "name": "Pre-workout / high-stimulant stacks as lifestyle",
                "note": "Open Sacral can fake energy and crash; prefer sleep and pacing.",
            },
        ],
    },
    "Solar_Plexus": {
        "defined": [
            {
                "action": "emphasize",
                "name": "L-Theanine / electrolytes on wave days",
                "note": "Emotional Authority — support the wave; never decide at the peak.",
            },
            {
                "action": "increase",
                "name": "NAC or Taurine when wave is loud",
                "note": "Gut-brain buffering on heavy emotional weather.",
            },
            {
                "action": "decrease_or_pause",
                "name": "Extra coffee + big decisions same day",
                "note": "Stimulants sharpen the crest — wait for clarity instead.",
            },
        ],
        "open": [
            {
                "action": "emphasize",
                "name": "L-Theanine + breathwork after social load",
                "note": "Open Solar Plexus amplifies others' feelings — clear what isn't yours.",
            },
            {
                "action": "decrease_or_pause",
                "name": "Alcohol as emotional anesthetic",
                "note": "Worsens absorbed emotional noise and sleep quality.",
            },
        ],
    },
    "Spleen": {
        "defined": [
            {
                "action": "emphasize",
                "name": "Vitamin D / zinc sufficiency (test, don't megadose)",
                "note": "Defined Spleen — support consistent immune/instinct baseline.",
            },
            {
                "action": "decrease_or_pause",
                "name": "Ignoring first-instinct 'no' with more nootropics",
                "note": "Splenic hits are quiet — stimulants can drown them.",
            },
        ],
        "open": [
            {
                "action": "emphasize",
                "name": "Sleep + basic immune basics (D, zinc pulse if low)",
                "note": "Open Spleen samples fear/health vibes — stabilize the body first.",
            },
            {
                "action": "decrease_or_pause",
                "name": "Fear-driven supplement hopping",
                "note": "Open Spleen can chase every health scare — stick to a short list.",
            },
        ],
    },
    "Heart": {
        "defined": [
            {
                "action": "emphasize",
                "name": "CoQ10 / Ubiquinol",
                "note": "Defined Ego — cellular energy for willpower that is actually available.",
            },
            {
                "action": "decrease_or_pause",
                "name": "Over-committing then stacking stims to 'make will appear'",
                "note": "Promise only what Heart can sustain; rest after will windows.",
            },
        ],
        "open": [
            {
                "action": "emphasize",
                "name": "Astaxanthin / CoQ10 only if training hard",
                "note": "Open Ego — willpower is inconsistent; don't prove worth via grind.",
            },
            {
                "action": "decrease_or_pause",
                "name": "Pride-driven stimulant use to keep promises you regret",
                "note": "Re-negotiate commitments instead of forcing will.",
            },
        ],
    },
    "G": {
        "defined": [
            {
                "action": "emphasize",
                "name": "Morning outdoor light + place that feels like home",
                "note": "Defined G — protect consistent direction/identity environment.",
            },
        ],
        "open": [
            {
                "action": "emphasize",
                "name": "Daily outdoor light walk in a nourishing location",
                "note": "Open G — direction is environmental; change place before forcing purpose.",
            },
            {
                "action": "decrease_or_pause",
                "name": "Identity-crisis nootropic stacking",
                "note": "More focus drugs won't fix the wrong room or wrong people.",
            },
        ],
    },
    "Throat": {
        "defined": [
            {
                "action": "emphasize",
                "name": "Hydration + electrolytes before heavy expression days",
                "note": "Defined Throat wants to express — fuel voice/output sustainably.",
            },
        ],
        "open": [
            {
                "action": "emphasize",
                "name": "Hydration; speak when Strategy/Authority clear",
                "note": "Open Throat — don't force output; wait for correct timing.",
            },
            {
                "action": "decrease_or_pause",
                "name": "Stimulant-fueled over-talking / content marathons",
                "note": "Amplifies pressure to be heard without correct timing.",
            },
        ],
    },
    "Ajna": {
        "defined": [
            {
                "action": "emphasize",
                "name": "Omega-3 / Krill",
                "note": "Defined Ajna — support a consistent thinking style without frying it.",
            },
            {
                "action": "decrease_or_pause",
                "name": "High-dose daily nootropic cocktails",
                "note": "You already process reliably — more rarely equals clearer.",
            },
        ],
        "open": [
            {
                "action": "emphasize",
                "name": "L-Theanine + Omega-3",
                "note": "Open Ajna samples many mental frames — reduce loops, protect membranes.",
            },
            {
                "action": "increase",
                "name": "Lion's Mane or Mag L-Threonate (pulse)",
                "note": "Optional when cognitive load is high; cycle off weekly.",
            },
            {
                "action": "decrease_or_pause",
                "name": "Certainty-chasing stimulant + information binge",
                "note": "Open Ajna can over-analyze — pause input before adding focus drugs.",
            },
        ],
    },
    "Head": {
        "defined": [
            {
                "action": "emphasize",
                "name": "B-Complex (pulse) + question journaling",
                "note": "Defined Head — inspiration pressure is yours; capture questions on paper.",
            },
        ],
        "open": [
            {
                "action": "emphasize",
                "name": "Magnesium evening + L-Theanine",
                "note": "Open Head takes in others' questions — release pressure nightly.",
            },
            {
                "action": "decrease_or_pause",
                "name": "Late-night research + caffeine",
                "note": "Borrowed mental pressure loves midnight rabbit holes.",
            },
        ],
    },
}

TYPE_BASELINE: dict[str, list[dict[str, str]]] = {
    "Generator": [
        {
            "action": "emphasize",
            "name": "Respond-first day structure (no forced initiation before Sacral yes)",
            "note": "Type baseline — satisfaction over mental schedules.",
        },
    ],
    "Manifesting Generator": [
        {
            "action": "emphasize",
            "name": "Respond → inform → act; protein + electrolytes on multi-task days",
            "note": "MG baseline — speed is fine after Sacral yes and informing.",
        },
        {
            "action": "decrease_or_pause",
            "name": "Skipping meals / stim-only fuel while multitasking",
            "note": "MG burnout often looks like more coffee instead of food + inform.",
        },
    ],
    "Manifestor": [
        {
            "action": "emphasize",
            "name": "Protected initiation windows + inform rituals",
            "note": "Manifestor baseline — peace over people-pleasing schedules.",
        },
        {
            "action": "decrease_or_pause",
            "name": "Stimulants to push through anger/resistance",
            "note": "Anger signals skipped informing or control — fix process, not dose.",
        },
    ],
    "Projector": [
        {
            "action": "emphasize",
            "name": "Sleep depth + recognition-based work only",
            "note": "Projector baseline — success needs rest and invitations, not Generator hours.",
        },
        {
            "action": "decrease_or_pause",
            "name": "All-day focus stacks to match Generator peers",
            "note": "Bitterness risk — shorter guided output beats forced stamina.",
        },
    ],
    "Reflector": [
        {
            "action": "emphasize",
            "name": "Environment hygiene + lunar decision buffer",
            "note": "Reflector baseline — place and people are your 'stack'.",
        },
        {
            "action": "decrease_or_pause",
            "name": "Daily identity-fixing nootropics",
            "note": "You mirror surroundings — change room before changing chemistry.",
        },
    ],
}


def _prioritize_inventory(items: list[dict], owned: set[str]) -> list[dict]:
    def score(it: dict) -> tuple[int, str]:
        name = it["name"].lower()
        owned_hit = any(o in name or name in o for o in owned)
        return (0 if owned_hit else 1, it["name"])

    return sorted(items, key=score)


def _tag_inventory(items: list[dict], owned: set[str]) -> list[dict]:
    out = []
    for it in items:
        name = it["name"].lower()
        in_inv = any(o in name or name in o for o in owned)
        row = dict(it)
        row["in_inventory"] = in_inv
        if in_inv and "note" in row:
            row["note"] = f"{row['note']} · You already own something like this — prioritize it."
        out.append(row)
    return _prioritize_inventory(out, owned)


def build_natal_baseline(
    natal: dict[str, Any],
    inventory_names: list[str] | None = None,
) -> dict[str, Any]:
    """Permanent chart → standard care stack (separate from transit adjustments)."""
    owned = {n.lower() for n in (inventory_names or [])}
    defined = set(natal.get("defined_centers", []))
    undefined = set(natal.get("undefined_centers", []))
    hd_type = natal.get("type") or ""

    emphasize: list[dict] = []
    increase: list[dict] = []
    decrease: list[dict] = []
    by_center: list[dict] = []

    for center in (
        "Root", "Sacral", "Solar_Plexus", "Spleen", "Heart", "G", "Throat", "Ajna", "Head",
    ):
        status = "defined" if center in defined else "open"
        if center not in defined and center not in undefined:
            status = "defined" if center in defined else "open"
        rules = NATAL_CENTER_BASELINE.get(center, {}).get(status, [])
        by_center.append({"center": center, "status": status, "items": rules})
        for rule in rules:
            bucket = {
                "emphasize": emphasize,
                "increase": increase,
                "decrease_or_pause": decrease,
            }.get(rule["action"], emphasize)
            bucket.append(
                {
                    "action": rule["action"],
                    "name": rule["name"],
                    "note": rule["note"],
                    "center": center,
                    "center_status": status,
                }
            )

    for rule in TYPE_BASELINE.get(hd_type, []):
        bucket = {
            "emphasize": emphasize,
            "increase": increase,
            "decrease_or_pause": decrease,
        }.get(rule["action"], emphasize)
        bucket.append(
            {
                "action": rule["action"],
                "name": rule["name"],
                "note": rule["note"],
                "center": "Type",
                "center_status": hd_type,
            }
        )

    return {
        "label": "Standard care for your chart",
        "description": (
            "Natal baseline from permanent defined/open centers and Type — "
            "not the weekly transit overlay. Emphasize = core habits/compounds; "
            "Increase = lean into when life is demanding; Decrease or pause = common "
            "overuse patterns for this chart."
        ),
        "type": hd_type,
        "defined_centers": sorted(defined),
        "open_centers": sorted(undefined),
        "emphasize": _tag_inventory(emphasize, owned),
        "increase": _tag_inventory(increase, owned),
        "decrease_or_pause": _tag_inventory(decrease, owned),
        "by_center": by_center,
        "inventory_prioritized": bool(owned),
        "source": "deterministic_natal_baseline",
    }



def _inv_hit(name: str, owned: set[str]) -> bool:
    n = name.lower()
    return any(o in n or n in o for o in owned)


def _plan_item(
    when: str,
    item: str,
    dose_hint: str,
    why: str,
    owned: set[str],
    priority: int,
    *,
    track_inventory: bool = True,
) -> dict:
    """track_inventory=False for behaviors (walks, cutoffs) — never 'consider adding'."""
    if not track_inventory:
        return {
            "when": when,
            "item": item,
            "dose_hint": dose_hint,
            "why": why,
            "in_inventory": False,
            "priority": priority,
        }
    in_inv = _inv_hit(item, owned)
    display = item if in_inv else f"{item} (consider adding)"
    return {
        "when": when,
        "item": display,
        "dose_hint": dose_hint,
        "why": why,
        "in_inventory": in_inv,
        "priority": priority,
    }


def _slot_from_stack(
    when: str,
    stack_items: list[dict],
    owned: set[str],
    why_fallback: str,
    priority: int = 1,
    *,
    moment: dict | None = None,
    avoid_ids: set[str] | None = None,
) -> dict | None:
    """Prefer a rotated, moment-fit kit lead; else owned stack hit; else first stack item."""
    if not stack_items and not owned:
        return None
    ctx = moment or {}
    if owned:
        from .kit_variety import pick_kit_lead

        kit_hit = pick_kit_lead(
            owned,
            slot=str(ctx.get("slot") or when.split()[0].lower() or "morning"),
            energy_label=str(ctx.get("energy_label") or "Steady"),
            preferred_space=str(ctx.get("preferred_space") or "focus"),
            focus_centers=list(ctx.get("focus_centers") or []),
            signal_source=ctx.get("signal_source"),
            day_key=str(ctx.get("day_key") or "1970-01-01"),
            avoid_supplement_ids=avoid_ids,
        )
        if kit_hit:
            return kit_hit
    if not stack_items:
        return None
    owned_hits = [it for it in stack_items if _inv_hit(it["name"], owned)]
    # Rotate among owned stack hits across HKT days when bank missed.
    if len(owned_hits) > 1 and ctx.get("day_key"):
        import hashlib

        key = f"stack|{ctx.get('day_key')}|{when}|{','.join(sorted(owned))}"
        idx = int(hashlib.sha256(key.encode()).hexdigest()[:8], 16) % len(owned_hits)
        pick = owned_hits[idx]
    else:
        pick = owned_hits[0] if owned_hits else stack_items[0]
    return _plan_item(
        when,
        pick["name"],
        "As on your label / clinician guidance",
        pick.get("note") or why_fallback,
        owned,
        priority,
    )


def _pick_timed_supports(
    natal: dict[str, Any],
    overlay: dict[str, Any],
    owned: set[str],
    focus_centers: list[str],
    morning_stack: list[dict],
    midday_stack: list[dict],
    evening_stack: list[dict],
    energy_label: str,
    preferred_space: str,
    *,
    day_key: str = "1970-01-01",
    signal_source: str | None = None,
) -> tuple[dict, dict, dict]:
    """One Morning / Midday / Evening lead from energy × bridge × owned inventory.

    Always-on daylight / caffeine / magnesium are NOT the permanent lead trio —
    they live in baseline_kit instead. Kit leads rotate by HKT day + moment fit.
    """
    undefined = set(natal.get("undefined_centers", []))
    defined = set(natal.get("defined_centers", []))
    newly = set(overlay.get("newly_defined_centers", []))
    focus = set(focus_centers) | newly
    open_sp = "Solar_Plexus" in undefined or "Emotional" in (natal.get("authority") or "")
    sacral_def = "Sacral" in defined
    hd_type = natal.get("type") or ""
    bridges = overlay.get("bridged_channels") or []
    bridge = bridges[0] if bridges else None
    bridge_name = str(bridge.get("name") or "") if isinstance(bridge, dict) else ""
    bridge_centers = set(bridge.get("centers") or []) if isinstance(bridge, dict) else set()
    used_kit_ids: set[str] = set()

    def _moment(slot: str) -> dict:
        return {
            "slot": slot,
            "energy_label": energy_label,
            "preferred_space": preferred_space,
            "focus_centers": list(focus_centers) + list(focus),
            "signal_source": signal_source,
            "day_key": day_key,
        }

    def _note_kit(row: dict | None) -> dict | None:
        if row and row.get("kit_supplement_id"):
            used_kit_ids.add(str(row["kit_supplement_id"]))
        return row

    def _kit_slot(when: str, stack_items: list[dict], why: str, slot: str) -> dict | None:
        return _slot_from_stack(
            when,
            stack_items,
            owned,
            why,
            moment=_moment(slot),
            avoid_ids=used_kit_ids,
        )

    # ── Morning ──────────────────────────────────────────────────────────
    morning: dict | None = None
    if energy_label in ("Drained", "Low"):
        morning = _plan_item(
            "On waking",
            "Quiet start — protein + no messages first",
            "Eat before Slack / news",
            f"{energy_label} weather — protect the first hour so open centers don't borrow urgency.",
            owned,
            1,
            track_inventory=False,
        )
    elif "Spleen" in focus or "Spleen" in bridge_centers:
        morning = _kit_slot(
            "Morning",
            morning_stack,
            "Splenic weather is quiet — support instinct, don't override with tabs.",
            "morning",
        )
        if morning is None or not morning.get("in_inventory"):
            # Prefer Zinc/D from evening/morning spleen stacks if owned
            zincish = [
                it
                for it in (morning_stack + evening_stack)
                if any(k in it["name"].lower() for k in ("zinc", "vitamin d", "vitamin d3"))
            ]
            hit = _kit_slot("Morning", zincish, "Immune / intuition pulse.", "morning")
            if hit and hit.get("in_inventory"):
                morning = hit
            else:
                morning = _plan_item(
                    "Before noon",
                    "Protein + short alone walk — don't open Slack first",
                    "10–15 min, phone away",
                    "Spleen/instinct weather — take the hit before the feed fills your Head.",
                    owned,
                    1,
                    track_inventory=False,
                )
    elif focus & {"Head", "Ajna"} or bridge_centers & {"Head", "Ajna"}:
        morning = _kit_slot(
            "With breakfast",
            morning_stack,
            "Quiet Head/Ajna pressure before the day's certainty loops open.",
            "morning",
        )
        if morning is None:
            morning = _plan_item(
                "Morning",
                "Fewer tabs before noon — one open question only",
                "Journal or park the rest",
                f"{bridge_name or 'Mind'} bridge wants certainty — don't feed it with more inputs.",
                owned,
                1,
                track_inventory=False,
            )
    elif "Root" in focus or "Root" in bridge_centers:
        morning = _kit_slot(
            "Morning",
            [it for it in (morning_stack + midday_stack) if "electrolyte" in it["name"].lower()]
            or morning_stack,
            "Open or busy Root amplifies hurry — minerals before other people's urgency.",
            "morning",
        )
        if morning is None:
            morning = _plan_item(
                "Morning",
                "Grounding walk before messages",
                "5–10 min outdoors or hallway",
                "Root weather — move the body before you take on the room's hurry.",
                owned,
                1,
                track_inventory=False,
            )
    if morning is None:
        morning = _kit_slot(
            "With breakfast",
            morning_stack,
            "From your chart focus this week.",
            "morning",
        )
    if morning is None:
        if sacral_def:
            morning = _plan_item(
                "With breakfast",
                "Protein-forward meal",
                "Palm-sized protein + whole food",
                "Steady fuel for Sacral response without a crash.",
                owned,
                1,
                track_inventory=False,
            )
        else:
            morning = _plan_item(
                "Morning",
                "Short alone reset before the day opens",
                "5–10 min, no feed",
                f"{hd_type or 'Your'} Type OS — clear borrowed noise before you engage.",
                owned,
                1,
                track_inventory=False,
            )

        morning = _note_kit(morning)

    # ── Midday ───────────────────────────────────────────────────────────
    midday: dict | None = None
    if energy_label == "Hyper" or preferred_space == "focus":
        midday = _plan_item(
            "Midday work block",
            "Single-task window (25–50 min) · phone face-down",
            "One focus only",
            f"{energy_label} / {preferred_space} — fewer tabs keeps temporary definition from looping.",
            owned,
            1,
            track_inventory=False,
        )
    elif preferred_space in ("out", "nature") or "G" in focus:
        midday = _plan_item(
            "Midday",
            "Outdoor light walk",
            "10–20 min",
            "Direction / identity reset — match Out & about weather with real sky.",
            owned,
            1,
            track_inventory=False,
        )
    elif focus & {"Head", "Ajna"} or bridge_centers & {"Head", "Ajna"}:
        midday = _kit_slot(
            "Midday",
            midday_stack,
            "Reduce over-analysis loops while the mind channel is bridged.",
            "midday",
        )
        if midday is None:
            midday = _plan_item(
                "Midday work block",
                "Single-task window (25–50 min)",
                "One focus, phone face-down",
                "Open Head/Ajna soak mental pressure — certainty comes from one thread.",
                owned,
                1,
                track_inventory=False,
            )
    if midday is None:
        midday = _kit_slot(
            "Midday / around training",
            midday_stack,
            "Transit-weighted midday support.",
            "midday",
        )
    if midday is None:
        if hd_type in ("Generator", "Manifesting Generator"):
            midday = _plan_item(
                "Midday",
                "One Sacral check-in before the next block",
                "Body yes/no, then inform if MG",
                "Respond first — don't initiate from a mental to-do crest.",
                owned,
                1,
                track_inventory=False,
            )
        elif hd_type == "Projector":
            midday = _plan_item(
                "Midday",
                "Invitation-only deep-work block",
                "One recognized window",
                "Projector battery is recognition + rest, not all-day output.",
                owned,
                1,
                track_inventory=False,
            )
        else:
            midday = _plan_item(
                "Midday",
                "Protect one initiation / inform window",
                "Then leave it",
                "Keep the day's move sharp — not a full stack.",
                owned,
                1,
                track_inventory=False,
            )

        midday = _note_kit(midday)

    # ── Evening ──────────────────────────────────────────────────────────
    evening: dict | None = None
    if energy_label in ("Hyper", "Charged"):
        mag = _kit_slot(
            "60–90 min before bed",
            [it for it in evening_stack if "magnesium" in it["name"].lower()] or evening_stack,
            "Downshift after a high-motor day.",
            "evening",
        )
        if mag and mag.get("in_inventory"):
            evening = dict(mag)
            evening["when"] = "Evening wind-down"
            evening["item"] = str(mag.get("item") or "").replace(" (consider adding)", "")
            evening["why"] = (
                f"{energy_label} anti-stim — use what you own; skip extra stim stacks."
            )
            evening["in_inventory"] = True
        else:
            evening = _plan_item(
                "Evening",
                "No stim stack · early wind-down",
                "Skip coffee, pre-workout, late research tabs",
                f"{energy_label} weather — let motors finish the loop without borrowed fuel.",
                owned,
                1,
                track_inventory=False,
            )
    elif open_sp or "Solar_Plexus" in focus:
        evening = _plan_item(
            "Evening",
            "No big decisions on the emotional crest",
            "Sleep on it; re-check tomorrow",
            "Emotional Authority / open Solar Plexus — truth isn't in the peak of the wave.",
            owned,
            1,
            track_inventory=False,
        )
    else:
        evening = _kit_slot(
            "Evening wind-down",
            evening_stack,
            "Evening transit support.",
            "evening",
        )
        if evening is None:
            evening = _plan_item(
                "Evening",
                "Early wind-down · no late research tabs",
                "Screens down before the second wind",
                "Close the day's loop before open centers soak overnight noise.",
                owned,
                1,
                track_inventory=False,
            )

    evening = _note_kit(evening)
    return morning, midday, evening


def _build_actionable_plans(
    natal: dict[str, Any],
    overlay: dict[str, Any],
    owned: set[str],
    focus_centers: list[str],
    morning_stack: list[dict],
    midday_stack: list[dict],
    evening_stack: list[dict],
    adjusts: list[str],
    indication: dict[str, Any] | None = None,
    *,
    day_key: str = "1970-01-01",
) -> tuple[dict, dict, dict]:
    """Sky-led daily plan: indication hero + 3 timed supports + demoted baseline kit."""
    hd_type = natal.get("type") or ""
    authority = natal.get("authority") or ""
    strategy = natal.get("strategy") or ""
    undefined = set(natal.get("undefined_centers", []))
    open_root = "Root" in undefined
    open_sp = "Solar_Plexus" in undefined or "Emotional" in authority

    ind = indication or {}
    energy_label = str(ind.get("energy_label") or "Steady")
    preferred_space = str(ind.get("preferred_space") or "focus")
    preferred_space_label = str(ind.get("preferred_space_label") or preferred_space)
    hero_title = str(ind.get("main_action_text") or "").strip()
    hero_why = str(ind.get("main_action_why") or "").strip()
    hero_micro = str(ind.get("main_action_micro") or "").strip()
    if not hero_title:
        hero_title = f"Run today's move with {authority or 'your Authority'}"
    if not hero_why:
        hero_why = (
            f"Decide with {authority or 'your Authority'} "
            f"({strategy or 'Strategy'}). Keep open centers from borrowing urgency."
        )

    daily_signal = ind.get("daily_signal") if isinstance(ind.get("daily_signal"), dict) else {}
    signal_source = str(daily_signal.get("source") or "") or None
    morning, midday, evening = _pick_timed_supports(
        natal,
        overlay,
        owned,
        focus_centers,
        morning_stack,
        midday_stack,
        evening_stack,
        energy_label,
        preferred_space,
        day_key=day_key,
        signal_source=signal_source,
    )

    # Demoted always-on hygiene — not the hero lead trio
    baseline_kit = [
        _plan_item(
            "Within 30 min of waking",
            "Daylight + short walk",
            "5–15 min outdoors if possible",
            "Baseline kit — resets direction when G or Root are noisy.",
            owned,
            10,
            track_inventory=False,
        ),
        _plan_item(
            "By early afternoon",
            "Caffeine cutoff",
            "Last coffee/tea ~6–8h before bed",
            "Baseline kit — protects sleep when Root or emotional weather is loud.",
            owned,
            10,
            track_inventory=False,
        ),
        _plan_item(
            "60–90 min before bed",
            "Magnesium Glycinate",
            "Per label (often evening)",
            "Baseline kit — prefer what you already own; skip if evening lead already covers it.",
            owned,
            10,
        ),
    ]

    do: list[str] = []
    dont: list[str] = []
    # One Strategy/Authority line, not three clones
    do.append(
        f"Follow Strategy ({strategy or 'your chart strategy'}) · "
        f"decide with Authority ({authority or "your body's yes"})."
    )
    if hd_type in ("Generator", "Manifesting Generator"):
        do.append("Only start work that gets a clear Sacral yes (sounds/body response).")
        dont.append("Initiate from FOMO or a mental to-do list before something responds.")
    elif hd_type == "Projector":
        do.append("Protect sleep and wait for recognition before giving heavy advice.")
        dont.append("Match Generator work hours with stimulants.")
    elif hd_type == "Manifestor":
        do.append("Inform the people affected before you initiate.")
        dont.append("Push through anger with more caffeine instead of informing.")
    elif hd_type == "Reflector":
        do.append("Change room/people before changing your stack on a low day.")
        dont.append("Make identity-level decisions in one afternoon.")

    # Space-aware Do/Don't (max 3 each)
    if preferred_space == "alone":
        do.append("Keep social initiation optional — Alone weather first.")
        dont.append("Fill the calendar to match other people's pace.")
    elif preferred_space == "focus":
        do.append("Single-task the main move — Focus corner over multitasking.")
        dont.append("Context-switch every notification during the lead block.")
    elif preferred_space == "out":
        do.append("Take the inform / walk move outdoors when you can.")
    elif preferred_space == "people":
        do.append("One clear conversation beats three half-present ones.")
    elif preferred_space == "nature":
        do.append("Get sky / trees before another indoor loop.")

    if open_root:
        dont.append("Stack afternoon/evening caffeine when you feel other people's urgency.")
    if open_sp and "emotional crest" not in " ".join(dont).lower():
        dont.append("Big decisions at the emotional peak.")
    if adjusts:
        bit = adjusts[0].split(": ", 1)[-1] if ": " in adjusts[0] else adjusts[0]
        if bit not in do and len(do) < 3:
            do.append(bit)

    do = do[:3]
    dont = dont[:3]

    # Weekly: 1 theme (Sun/Earth summary) + sky note only on the surface
    weekly_macro = overlay.get("weekly_macro_theme") or {}
    if isinstance(weekly_macro, dict) and weekly_macro.get("summary"):
        theme = str(weekly_macro["summary"])
    elif isinstance(weekly_macro, dict) and weekly_macro.get("theme"):
        theme = str(weekly_macro["theme"])
    else:
        theme = f"{hd_type} operating system + open-center hygiene"

    bridges = overlay.get("bridged_channels") or []
    sky_note = "Steady sky — follow Strategy and Authority."
    if bridges:
        b = bridges[0]
        gates = "-".join(str(g) for g in b.get("gates", []))
        sky_note = (
            f"Channel {gates} ({b.get('name')}) bridged involving "
            f"{', '.join(b.get('centers') or [])} — temporary conditioning; "
            f"don't over-identify."
        )
    newly = overlay.get("newly_defined_centers") or []
    if newly and not bridges:
        sky_note = (
            "Temporary definition in "
            + ", ".join(str(c).replace("_", " ") for c in newly[:3])
            + " — expect unfamiliar pressure."
        )

    weekly_plan = {
        "theme": theme,
        "sky_note": sky_note,
        "habits": [],  # P0: week surface is theme + sky only
        "supplements_to_emphasize": [],
        "supplements_to_pause_or_reduce": [],
    }

    daily_plan = {
        "morning": [morning],
        "midday": [midday],
        "evening": [evening],
        "do": do,
        "dont": dont,
        "baseline_kit": baseline_kit,
        "hero": {
            "title": hero_title,
            "why": hero_why,
            "micro": hero_micro,
        },
    }

    top_actions = [
        f"Morning: {morning['item']}",
        f"Midday: {midday['item']}",
        f"Evening: {evening['item']}",
    ]

    summary = {
        "headline": hero_title,
        "in_short": hero_why,
        "micro": hero_micro,
        "top_actions": top_actions,
        "energy_label": energy_label,
        "preferred_space": preferred_space,
        "preferred_space_label": preferred_space_label,
    }
    return summary, daily_plan, weekly_plan


def build_protocol(
    natal: dict[str, Any],
    overlay: dict[str, Any],
    inventory_names: list[str] | None = None,
    indication: dict[str, Any] | None = None,
    transit: dict[str, Any] | None = None,
    yesterday_lead_fingerprint: str | None = None,
) -> dict[str, Any]:
    from ..checkin import derive_today_indication
    from .sky_rotation import apply_sky_rotation, lead_fingerprint

    owned = {n.lower() for n in (inventory_names or [])}
    undefined = set(natal.get("undefined_centers", []))
    newly = set(overlay.get("newly_defined_centers", []))

    # Weight open centers + newly defined more heavily (transit adjustments)
    priority = list(newly) + [c for c in undefined if c not in newly]
    if not priority:
        priority = list(natal.get("defined_centers", []))[:3]

    morning: list[dict] = []
    midday: list[dict] = []
    evening: list[dict] = []
    adjusts: list[str] = []

    for center in priority[:4]:
        stack = CENTER_STACKS.get(center)
        if not stack:
            continue
        morning.extend(stack["morning"])  # type: ignore[arg-type]
        midday.extend(stack["midday"])  # type: ignore[arg-type]
        evening.extend(stack["evening"])  # type: ignore[arg-type]
        if stack.get("adjust"):
            adjusts.append(f"{center}: {stack['adjust']}")

    bridges = overlay.get("bridged_channels", [])
    daily_directive = "Steady day — follow Strategy and Authority."
    if bridges:
        b = bridges[0]
        gates = "-".join(str(g) for g in b["gates"])
        daily_directive = (
            f"Channel {gates} ({b['name']}) is bridged today involving "
            f"{', '.join(b['centers'])}. Expect temporary conditioning on open centers; "
            f"favor the evening wind-down stack and pause extra stimulants."
        )

    weekly = overlay.get("weekly_macro_theme", {})

    def dedupe(items: list[dict]) -> list[dict]:
        seen = set()
        out = []
        for it in items:
            k = it["name"].lower()
            if k in seen:
                continue
            seen.add(k)
            out.append(it)
        return _tag_inventory(out, owned)

    natal_baseline = build_natal_baseline(natal, inventory_names)

    morning_d = dedupe(morning)
    midday_d = dedupe(midday)
    evening_d = dedupe(evening)
    focus = priority[:4]

    if indication is None:
        indication = derive_today_indication(natal, transit or {}, overlay)

    from ..checkin.novelty import hkt_today
    from .kit_variety import empty_kit_fact_cta, pick_kit_fact

    day_key = str((indication or {}).get("day") or hkt_today().isoformat())
    summary, daily_plan, weekly_plan = _build_actionable_plans(
        natal,
        overlay,
        owned,
        focus,
        morning_d,
        midday_d,
        evening_d,
        adjusts,
        indication=indication,
        day_key=day_key,
    )
    kit_fact = pick_kit_fact(inventory_names or [], day_key=day_key)
    kit_fact_cta = None if kit_fact or owned else empty_kit_fact_cta()
    # Align week sky_note with directive when bridges exist
    if daily_directive and weekly_plan.get("sky_note"):
        weekly_plan["sky_note"] = daily_directive if bridges else weekly_plan["sky_note"]

    # Sky-rotated daily protocol — Daily Novelty Contract for timed leads
    morning_lead = daily_plan["morning"][0]
    midday_lead = daily_plan["midday"][0]
    evening_lead = daily_plan["evening"][0]
    natural_fp = lead_fingerprint(morning_lead, midday_lead, evening_lead)
    daily_signal = (indication or {}).get("daily_signal") if isinstance(indication, dict) else None
    morning_lead, midday_lead, evening_lead, whats_new = apply_sky_rotation(
        morning_lead,
        midday_lead,
        evening_lead,
        yesterday_fingerprint=yesterday_lead_fingerprint,
        daily_signal=daily_signal if isinstance(daily_signal, dict) else None,
        owned=owned,
    )
    daily_plan["morning"] = [morning_lead]
    daily_plan["midday"] = [midday_lead]
    daily_plan["evening"] = [evening_lead]
    daily_plan["whats_new"] = whats_new
    daily_plan["kit_fact"] = kit_fact
    daily_plan["kit_fact_cta"] = kit_fact_cta
    summary["top_actions"] = [
        f"Morning: {morning_lead['item']}",
        f"Midday: {midday_lead['item']}",
        f"Evening: {evening_lead['item']}",
    ]

    return {
        "disclaimer": (
            "For informational and energetic optimization purposes only; not medical advice. "
            "Consult a qualified clinician before changing supplements or lifestyle protocols."
        ),
        "summary": summary,
        "daily_plan": daily_plan,
        "weekly_plan": weekly_plan,
        "natal_baseline": natal_baseline,
        "weekly_theme": weekly,
        "focus_centers": focus,
        "what_to_adjust_this_week": adjusts,
        "morning_stack": morning_d,
        "midday_stack": midday_d,
        "evening_stack": evening_d,
        "daily_directive": daily_directive,
        "inventory_prioritized": bool(owned),
        "source": "deterministic_rules",
        "indication": indication,
        "whats_new": whats_new,
        "kit_fact": kit_fact,
        "kit_fact_cta": kit_fact_cta,
        "lead_fingerprint": whats_new.get("lead_fingerprint") or natural_fp,
        "natural_lead_fingerprint": natural_fp,
        "labels": {
            "natal_baseline": "Standard care for your chart (permanent)",
            "transit_weekly": "This week's transit adjustments (temporary)",
            "transit_daily": "Today's micro-adjustment (temporary)",
        },
    }
