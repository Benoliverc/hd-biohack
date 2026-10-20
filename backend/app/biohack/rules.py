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


def _build_actionable_plans(
    natal: dict[str, Any],
    overlay: dict[str, Any],
    owned: set[str],
    focus_centers: list[str],
    morning_stack: list[dict],
    midday_stack: list[dict],
    evening_stack: list[dict],
    adjusts: list[str],
) -> tuple[dict, dict, dict]:
    """Practical daily/weekly plans + summary (informational, not medical)."""
    hd_type = natal.get("type") or ""
    authority = natal.get("authority") or ""
    strategy = natal.get("strategy") or ""
    defined = set(natal.get("defined_centers", []))
    undefined = set(natal.get("undefined_centers", []))
    open_root = "Root" in undefined
    open_sp = "Solar_Plexus" in undefined or "Emotional" in authority
    sacral_def = "Sacral" in defined
    ajna_open = "Ajna" in undefined or "Head" in undefined

    morning: list[dict] = []
    midday: list[dict] = []
    evening: list[dict] = []
    do: list[str] = []
    dont: list[str] = []

    # Core morning behaviors (always)
    morning.append(
        _plan_item(
            "Within 30 min of waking",
            "Daylight + short walk",
            "5–15 min outdoors if possible",
            "Resets direction/energy map for the day — especially useful if G or Root are noisy.",
            owned,
            1,
            track_inventory=False,
        )
    )
    morning.append(
        _plan_item(
            "With breakfast",
            "Protein-forward meal",
            "Palm-sized protein + whole food",
            "Steady fuel for Sacral response or Projector focus without crash.",
            owned,
            2,
            track_inventory=False,
        )
    )

    # Inventory-aware stacks first
    prio = 3
    for it in morning_stack[:4]:
        morning.append(
            _plan_item(
                "With breakfast",
                it["name"],
                "As on your label / clinician guidance",
                it.get("note", "From your chart focus this week."),
                owned,
                prio,
            )
        )
        prio += 1

    if open_root or "Root" in focus_centers:
        morning.append(
            _plan_item(
                "Morning",
                "Electrolytes",
                "1 serving in water",
                "Open or busy Root amplifies hurry — minerals help you not ride other people's urgency.",
                owned,
                prio,
            )
        )

    # Midday
    midday.append(
        _plan_item(
            "By early afternoon",
            "Caffeine cutoff",
            "Last coffee/tea ~6–8h before bed",
            "Protects sleep when Root or emotional weather is loud.",
            owned,
            1,
            track_inventory=False,
        )
    )
    if ajna_open or "Ajna" in focus_centers or "Head" in focus_centers:
        midday.append(
            _plan_item(
                "Midday work block",
                "Single-task window (25–50 min)",
                "One focus, phone face-down",
                "Open Head/Ajna soak up mental pressure — fewer tabs = clearer battery.",
                owned,
                2,
                track_inventory=False,
            )
        )
    prio = 3
    for it in midday_stack[:3]:
        midday.append(
            _plan_item(
                "Midday / around training",
                it["name"],
                "As on your label",
                it.get("note", "Transit-weighted midday support."),
                owned,
                prio,
            )
        )
        prio += 1

    # Evening
    evening.append(
        _plan_item(
            "60–90 min before bed",
            "Magnesium Glycinate",
            "Per label (often evening)",
            "Downshift for Root pressure and sleep quality — prefer what you already own.",
            owned,
            1,
        )
    )
    if open_sp or "Solar_Plexus" in focus_centers:
        evening.append(
            _plan_item(
                "Evening",
                "No big decisions on the emotional crest",
                "Sleep on it; re-check tomorrow",
                "Emotional Authority / open Solar Plexus — truth isn't in the peak of the wave.",
                owned,
                2,
                track_inventory=False,
            )
        )
    evening.append(
        _plan_item(
            "Evening",
            "No late stimulants",
            "Skip coffee, energy drinks, heavy pre-workout",
            "Lets the nervous system finish the day's loop.",
            owned,
            3,
            track_inventory=False,
        )
    )
    prio = 4
    for it in evening_stack[:3]:
        if "magnesium" in it["name"].lower() and any("magnesium" in x["item"].lower() for x in evening):
            continue
        evening.append(
            _plan_item(
                "Evening wind-down",
                it["name"],
                "As on your label",
                it.get("note", "Evening transit support."),
                owned,
                prio,
            )
        )
        prio += 1

    # Do / Don't by type
    do.append(f"Follow Strategy: {strategy or 'your chart strategy'}.")
    do.append(f"Decide with Authority: {authority or "your body's yes"} — not the mind's wishlist.")
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
    if open_root:
        dont.append("Stack afternoon/evening caffeine when you feel other people's urgency.")
    if adjusts:
        do.append(adjusts[0].split(": ", 1)[-1] if ": " in adjusts[0] else adjusts[0])

    # Weekly
    habits: list[dict] = []
    emphasize: list[str] = []
    pause: list[str] = []
    theme_bits = []
    weekly_macro = overlay.get("weekly_macro_theme") or {}
    if isinstance(weekly_macro, dict) and weekly_macro.get("theme"):
        theme_bits.append(str(weekly_macro["theme"]))
    theme_bits.append(f"{hd_type} operating system + open-center hygiene")
    theme = " · ".join(theme_bits[:2])

    if sacral_def:
        habits.append(
            {
                "cadence": "2–3x/week",
                "action": "Strength or Zone-2 session only after a Sacral yes",
                "why": "Defined Sacral recovers well when you don't force starts.",
            }
        )
    if hd_type == "Projector":
        habits.append(
            {
                "cadence": "Daily",
                "action": "Earlier wind-down + one invitation-only deep-work block",
                "why": "Projectors succeed with rest and recognition, not all-day output.",
            }
        )
        habits.append(
            {
                "cadence": "This week",
                "action": "Schedule social recovery after peopled days",
                "why": "Open centers soak energy — alone time clears what isn't yours.",
            }
        )
    if hd_type == "Manifestor":
        habits.append(
            {
                "cadence": "Daily",
                "action": "Inform-before-act reminder (text/Slack before big moves)",
                "why": "Reduces resistance without asking permission.",
            }
        )
    habits.append(
        {
            "cadence": "Daily",
            "action": "Morning daylight + protein breakfast",
            "why": "Simple battery baseline for every Type.",
        }
    )
    if open_root or open_sp:
        habits.append(
            {
                "cadence": "Daily",
                "action": "Hard caffeine cutoff by early afternoon",
                "why": "Open Root / emotional wave sleep better without late stims.",
            }
        )

    # Prefer inventory names in emphasize
    for it in morning_stack + evening_stack:
        name = it["name"]
        if _inv_hit(name, owned) and name not in emphasize:
            emphasize.append(name)
    for it in morning_stack + midday_stack:
        name = it["name"]
        if not _inv_hit(name, owned) and "stimulant" not in name.lower():
            if name not in emphasize and len(emphasize) < 5:
                emphasize.append(f"{name} (consider adding)")
    pause.append("Late caffeine / stim stacking")
    if hd_type == "Projector":
        pause.append("All-day focus stacks to match Generator peers")
    if open_sp:
        pause.append("Big decisions at the emotional peak")

    daily_plan = {
        "morning": morning,
        "midday": midday,
        "evening": evening,
        "do": do,
        "dont": dont,
    }
    weekly_plan = {
        "theme": theme,
        "habits": habits,
        "supplements_to_emphasize": emphasize[:6],
        "supplements_to_pause_or_reduce": pause,
    }

    # Summary
    focus_lbl = ", ".join(c.replace("_", " ") for c in focus_centers[:3]) or "steady centers"
    top_actions = []
    if morning:
        top_actions.append(f"Morning: {morning[0]['item']} ({morning[0]['when']}).")
    if midday:
        top_actions.append(f"Midday: {midday[0]['item']}.")
    if evening:
        top_actions.append(f"Evening: {evening[0]['item']}.")
    while len(top_actions) < 3 and do:
        cand = do[len(top_actions) - 0] if len(top_actions) < len(do) else do[-1]
        if cand not in top_actions:
            top_actions.append(cand)
        else:
            break
    top_actions = top_actions[:3]

    battery = {
        "Generator": "Your battery fills when you respond — not when you push.",
        "Manifesting Generator": "Your battery likes speed after a Sacral yes, then informing.",
        "Manifestor": "Your battery likes protected initiation windows, not constant availability.",
        "Projector": "Your battery is recognition + rest, not Sacral stamina.",
        "Reflector": "Your battery is the room you're in — change place before forcing output.",
    }.get(hd_type, "Protect your energy map today.")

    summary = {
        "headline": f"Today: run your {hd_type or 'chart'} OS — focus {focus_lbl}.",
        "in_short": (
            f"{battery} Decide with {authority or 'your Authority'} "
            f"({strategy or 'Strategy'}). One focus: keep open centers from borrowing urgency."
        ),
        "top_actions": top_actions,
    }
    return summary, daily_plan, weekly_plan


def build_protocol(
    natal: dict[str, Any],
    overlay: dict[str, Any],
    inventory_names: list[str] | None = None,
) -> dict[str, Any]:
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
    summary, daily_plan, weekly_plan = _build_actionable_plans(
        natal, overlay, owned, focus, morning_d, midday_d, evening_d, adjusts
    )

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
        "labels": {
            "natal_baseline": "Standard care for your chart (permanent)",
            "transit_weekly": "This week's transit adjustments (temporary)",
            "transit_daily": "Today's micro-adjustment (temporary)",
        },
    }
