"""Deterministic biohacking / supplement protocol engine (no personal health data)."""
from __future__ import annotations

from typing import Any


# Center → stack suggestions (generic informational mapping)
CENTER_STACKS: dict[str, dict[str, list[dict]]] = {
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


def _prioritize_inventory(items: list[dict], owned: set[str]) -> list[dict]:
    def score(it: dict) -> tuple[int, str]:
        name = it["name"].lower()
        owned_hit = any(o in name or name in o for o in owned)
        return (0 if owned_hit else 1, it["name"])

    return sorted(items, key=score)


def build_protocol(
    natal: dict[str, Any],
    overlay: dict[str, Any],
    inventory_names: list[str] | None = None,
) -> dict[str, Any]:
    owned = {n.lower() for n in (inventory_names or [])}
    undefined = set(natal.get("undefined_centers", []))
    newly = set(overlay.get("newly_defined_centers", []))
    focus_centers = sorted(undefined | newly | set(natal.get("defined_centers", [])) )

    # Weight open centers + newly defined more heavily
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
        morning.extend(stack["morning"])
        midday.extend(stack["midday"])
        evening.extend(stack["evening"])
        if stack.get("adjust"):
            adjusts.append(f"{center}: {stack['adjust']}")

    # Transit-specific daily directive from bridged channels
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
        return _prioritize_inventory(out, owned)

    return {
        "disclaimer": (
            "For informational and energetic optimization purposes only; not medical advice. "
            "Consult a qualified clinician before changing supplements or lifestyle protocols."
        ),
        "weekly_theme": weekly,
        "focus_centers": priority[:4],
        "what_to_adjust_this_week": adjusts,
        "morning_stack": dedupe(morning),
        "midday_stack": dedupe(midday),
        "evening_stack": dedupe(evening),
        "daily_directive": daily_directive,
        "inventory_prioritized": bool(owned),
        "source": "deterministic_rules",
    }
