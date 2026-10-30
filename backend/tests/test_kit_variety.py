"""Kit variety + daily fact library — rotation, membership, empty kit."""

from __future__ import annotations

import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.biohack.kit_variety import (
    clear_caches,
    empty_kit_fact_cta,
    fact_library_trust_violations,
    library_stats,
    match_owned_supplements,
    pick_kit_fact,
    pick_kit_lead,
)
from app.biohack.rules import build_protocol
from app.checkin import derive_today_indication

clear_caches()


def _mg_natal(**kwargs):
    base = {
        "type": "Manifesting Generator",
        "strategy": "To Respond",
        "authority": "Sacral",
        "defined_centers": ["Sacral", "Root", "Throat", "G"],
        "undefined_centers": ["Head", "Ajna", "Heart", "Solar_Plexus", "Spleen"],
        "activated_gates": [5, 14, 34, 20],
        "hanging_gates": [],
        "channels": [],
    }
    base.update(kwargs)
    return base


def _head_overlay():
    return {
        "newly_defined_centers": ["Head", "Ajna"],
        "bridged_channels": [
            {"gates": [4, 63], "name": "Logic", "centers": ["Head", "Ajna"]}
        ],
        "weekly_macro_theme": {
            "summary": "Sun in Gate 50 Line 4 / Earth in Gate 3 Line 4",
        },
    }


def test_library_size():
    stats = library_stats()
    assert stats["supplements"] >= 90
    assert stats["actions"] >= 100
    assert stats["facts"] >= 100
    print(
        f"PASS: library {stats['supplements']} supplements × "
        f"~{stats['avg_actions']} actions / ~{stats['avg_facts']} facts"
    )


def test_fact_only_for_kit_members():
    day = "2026-10-24"
    fact = pick_kit_fact(["Magnesium Glycinate", "Omega-3", "Creatine"], day_key=day)
    assert fact is not None
    assert fact["supplement"]
    assert fact["body"]
    assert fact["source_id"]
    # Must not invent for unknown-only kit
    assert pick_kit_fact(["Unobtainium Plasma"], day_key=day) is None
    print(f"PASS: fact for kit member → {fact['supplement']!r}")


def test_vitamin_d3_does_not_match_b12_or_b_complex():
    """Soft P1 UX: shared 'vitamin' token must not cross D3 ↔ B12 / B-complex."""
    from app.biohack.kit_variety import _match_score, _names_match

    assert _match_score("Vitamin D3", "vitamin b12") == 0
    assert not _names_match("Vitamin D3", "Vitamin B12")
    assert not _names_match("Vitamin D3", "vitamin b complex")
    assert not _names_match("Vitamin D3", "B-Complex")
    assert _names_match("Vitamin D3", "vitamin d3")
    assert _names_match("Vitamin D3", "vitamin d")
    assert _names_match("D3", "vitamin d3")
    for day_i in range(1, 15):
        day = f"2026-10-{day_i:02d}"
        fact = pick_kit_fact(["Vitamin D3"], day_key=day)
        assert fact is not None, day
        name = (fact.get("supplement") or "").lower()
        assert "b12" not in name and "b-complex" not in name and "b complex" not in name
        assert "d3" in name or name.startswith("vitamin d")
    print("PASS: D3 kit facts stay on D family across days")


def test_empty_kit_null_fact_and_cta():
    assert pick_kit_fact([], day_key="2026-10-24") is None
    assert pick_kit_fact([], day_key="2026-10-25") is None
    cta = empty_kit_fact_cta()
    assert "Add what you own" in cta
    assert "shelf" in cta.lower()
    natal = _mg_natal()
    overlay = _head_overlay()
    indication = derive_today_indication(natal, {}, overlay)
    indication = dict(indication)
    indication["day"] = "2026-10-24"
    proto = build_protocol(natal, overlay, [], indication=indication, transit={})
    assert proto.get("kit_fact") is None
    assert proto.get("kit_fact_cta")
    print("PASS: empty kit → null fact + CTA")


def test_fact_rotates_across_hkt_days():
    kit = ["Magnesium Glycinate", "Omega-3", "Vitamin D3", "Creatine", "Ashwagandha", "B-Complex"]
    bodies = []
    for i in range(14):
        day = (date(2026, 10, 1) + timedelta(days=i)).isoformat()
        fact = pick_kit_fact(kit, day_key=day)
        assert fact is not None
        bodies.append((fact["source_id"], fact["supplement"]))
    assert len(set(bodies)) >= 3, f"expected fact rotation, got {set(bodies)}"
    print(f"PASS: fact rotation {len(set(bodies))} distinct across 14 days")


def test_kit_lead_rotates_across_days():
    """Same multi-item kit must not lock the same lead every HKT day."""
    kit = ["B-Complex", "Omega-3", "Magnesium Glycinate", "Zinc", "Creatine", "L-Theanine"]
    leads = []
    for i in range(14):
        day = (date(2026, 10, 1) + timedelta(days=i)).isoformat()
        hit = pick_kit_lead(
            kit,
            slot="morning",
            energy_label="Steady",
            preferred_space="focus",
            focus_centers=["Head", "Ajna"],
            signal_source="sun_line",
            day_key=day,
        )
        assert hit is not None and hit.get("in_inventory")
        leads.append(hit.get("kit_supplement_id") or hit["item"])
    distinct = set(leads)
    assert len(distinct) >= 2, f"expected kit lead rotation, got {leads}"
    print(f"PASS: morning kit leads across 14 days → {len(distinct)} distinct ({distinct})")


def test_build_protocol_kit_variety_not_always_b():
    """B-heavy Head day: multi-item kit should not always surface B-Complex as the only kit lead."""
    natal = _mg_natal()
    overlay = _head_overlay()
    inventory = [
        "B-Complex",
        "Omega-3",
        "Magnesium Glycinate",
        "Zinc",
        "Creatine",
        "L-Theanine",
        "Vitamin D3",
        "Ashwagandha",
    ]
    kit_items = []
    for i in range(10):
        day = (date(2026, 10, 1) + timedelta(days=i)).isoformat()
        indication = derive_today_indication(natal, {}, overlay)
        indication = dict(indication)
        indication["day"] = day
        # Force steady/focus so Head stack path is reachable (not drained quiet-start)
        indication["energy_label"] = "Steady"
        indication["preferred_space"] = "focus"
        indication["preferred_space_label"] = "Focus corner"
        proto = build_protocol(
            natal, overlay, inventory, indication=indication, transit={}
        )
        assert proto.get("kit_fact") is not None
        assert proto["kit_fact"]["supplement"]
        # Collect any From-your-kit timed leads
        for slot in ("morning", "midday", "evening"):
            row = proto["daily_plan"][slot][0]
            if row.get("in_inventory"):
                kit_items.append(row["item"])
    assert kit_items, "expected at least one kit lead across days"
    # Not every kit lead should be B-complex
    b_only = all("b-complex" in x.lower() or "b complex" in x.lower() for x in kit_items)
    assert not b_only, f"kit leads stuck on B: {kit_items}"
    print(f"PASS: protocol kit leads varied sample={kit_items[:6]!r} …")


def test_plain_english_action_lines():
    hit = pick_kit_lead(
        ["Magnesium Glycinate", "Omega-3"],
        slot="evening",
        energy_label="Hyper",
        preferred_space="alone",
        focus_centers=["Root"],
        signal_source="continuity",
        day_key="2026-10-24",
    )
    assert hit is not None
    words = len(str(hit["item"]).split())
    assert words <= 16, f"action line too long ({words}): {hit['item']!r}"
    assert "consider adding" not in hit["item"].lower()
    print(f"PASS: plain line ({words} words) → {hit['item']!r}")


def test_match_aliases():
    hits = match_owned_supplements(["fish oil", "Mag Glycinate", "KSM-66"])
    ids = {h["id"] for h in hits}
    assert "omega3" in ids
    assert "magnesium_glycinate" in ids
    assert "ashwagandha" in ids
    print(f"PASS: alias match → {sorted(ids)}")



def test_fact_library_trust_grep_gate():
    clear_caches()
    bad = fact_library_trust_violations()
    assert bad == [], f"trust violations: {bad[:5]}"
    print("PASS: fact library trust grep gate clean")


def test_same_hkt_day_kit_lead_stable():
    """Anti-whiplash: Refresh same HKT day must not thrash owned lead."""
    kit = ["B-Complex", "Omega-3", "Magnesium Glycinate", "Zinc", "Creatine"]
    day = "2026-10-24"
    a = pick_kit_lead(
        kit,
        slot="morning",
        energy_label="Steady",
        preferred_space="focus",
        focus_centers=["Head", "Ajna"],
        signal_source="sun_line",
        day_key=day,
    )
    b = pick_kit_lead(
        kit,
        slot="morning",
        energy_label="Steady",
        preferred_space="focus",
        focus_centers=["Head", "Ajna"],
        signal_source="sun_line",
        day_key=day,
    )
    assert a is not None and b is not None
    assert a["kit_supplement_id"] == b["kit_supplement_id"]
    assert a["item"] == b["item"]
    fact_a = pick_kit_fact(kit, day_key=day)
    fact_b = pick_kit_fact(kit, day_key=day)
    assert fact_a == fact_b
    print(f"PASS: same-day stable lead={a['kit_supplement_id']!r} fact={fact_a['source_id']!r}")


def test_multi_item_not_stuck_on_b_or_mag():
    """With 3+ owned items, 3 distinct HKT moments must not all land on B or Mag only."""
    kit = ["B-Complex", "Omega-3", "Magnesium Glycinate", "Zinc", "Creatine", "L-Theanine"]
    moments = [
        ("2026-10-01", "Steady", "focus", ["Head", "Ajna"], "sun_line", "morning"),
        ("2026-10-02", "Hyper", "alone", ["Root"], "moon_gate", "evening"),
        ("2026-10-03", "Charged", "out", ["Sacral", "Root"], "conditioning", "midday"),
        ("2026-10-04", "Low", "focus", ["Spleen"], "continuity", "morning"),
        ("2026-10-05", "Steady", "nature", ["Heart"], "sun_gate", "midday"),
    ]
    ids = []
    for day, energy, space, focus, signal, slot in moments:
        hit = pick_kit_lead(
            kit,
            slot=slot,
            energy_label=energy,
            preferred_space=space,
            focus_centers=focus,
            signal_source=signal,
            day_key=day,
        )
        assert hit is not None
        ids.append(hit["kit_supplement_id"])
    sticky = {"b_complex", "magnesium_glycinate", "magnesium_threonate", "magnesium_citrate"}
    assert not set(ids) <= sticky, f"stuck on B/Mag only: {ids}"
    assert len(set(ids)) >= 2, f"expected variety across moments, got {ids}"
    print(f"PASS: multi-moment leads {ids}")


def test_fact_has_foot_and_owned_only():
    fact = pick_kit_fact(["Zinc"], day_key="2026-10-24")
    assert fact is not None
    assert "not medical advice" in (fact.get("foot") or "").lower()
    assert "zinc" in fact["supplement"].lower()
    print(f"PASS: fact foot + owned Zinc → {fact['source_id']}")



if __name__ == "__main__":
    test_library_size()
    test_fact_only_for_kit_members()
    test_empty_kit_null_fact_and_cta()
    test_fact_rotates_across_hkt_days()
    test_kit_lead_rotates_across_days()
    test_build_protocol_kit_variety_not_always_b()
    test_plain_english_action_lines()
    test_match_aliases()
    test_fact_library_trust_grep_gate()
    test_same_hkt_day_kit_lead_stable()
    test_multi_item_not_stuck_on_b_or_mag()
    test_fact_has_foot_and_owned_only()
