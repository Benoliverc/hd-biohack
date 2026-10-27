"""Protocols A — sky-rotated daily leads + Daily Novelty Contract."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.biohack.rules import build_protocol
from app.biohack.sky_rotation import (
    apply_sky_rotation,
    bare_item_name,
    lead_fingerprint,
)
from app.checkin import derive_today_indication


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


def _overlay_logic():
    return {
        "newly_defined_centers": ["Head", "Ajna"],
        "bridged_channels": [
            {"gates": [4, 63], "name": "Logic", "centers": ["Head", "Ajna"]}
        ],
        "weekly_macro_theme": {
            "summary": "Sun in Gate 50 Line 4 / Earth in Gate 3 Line 4",
        },
    }


def _behavior(item: str) -> dict:
    return {
        "when": "Midday",
        "item": item,
        "dose_hint": "now",
        "why": "test",
        "in_inventory": False,
        "priority": 1,
    }


def _kit(item: str) -> dict:
    return {
        "when": "Morning",
        "item": item,
        "dose_hint": "per label",
        "why": "kit",
        "in_inventory": True,
        "priority": 1,
    }


def test_fingerprint_stable():
    a = _behavior("Quiet start — protein + no messages first")
    b = _behavior("Moon-gate pause — 3 breaths before the next yes")
    c = _kit("Zinc")
    fp = lead_fingerprint(a, b, c)
    assert "quiet start" in fp
    assert "moon-gate pause" in fp
    assert "zinc" in fp
    assert bare_item_name("Zinc (consider adding)") == "zinc"
    print("PASS: fingerprint")


def test_force_rotation_when_fingerprint_matches():
    morning = _behavior("Quiet start — protein + no messages first")
    midday = _behavior("Single-task the main move")
    evening = _behavior("Early wind-down · no late research tabs")
    fp = lead_fingerprint(morning, midday, evening)
    signal = {
        "key": "moon_gate:50",
        "headline": "Moon enters Gate 50",
        "body": "New Moon gate — notice before optimizing.",
        "source": "moon_gate",
    }
    _m2, d2, _e2, meta = apply_sky_rotation(
        morning,
        midday,
        evening,
        yesterday_fingerprint=fp,
        daily_signal=signal,
        owned=set(),
    )
    new_fp = lead_fingerprint(_m2, d2, _e2)
    assert new_fp != fp, "expected forced rotation to change fingerprint"
    assert meta["forced_rotation"] is True
    assert meta["rotated_slot"] == "midday"
    assert not d2.get("in_inventory")
    print(f"PASS: forced rotation slot={meta['rotated_slot']} item={d2['item']!r}")


def test_no_force_when_fingerprint_differs():
    morning = _behavior("Quiet start — protein + no messages first")
    midday = _behavior("Single-task the main move")
    evening = _behavior("Early wind-down · no late research tabs")
    signal = {
        "key": "continuity:2",
        "headline": "Same conditioning, day 2",
        "body": "Watch amplification.",
        "source": "continuity",
    }
    m2, d2, e2, meta = apply_sky_rotation(
        morning,
        midday,
        evening,
        yesterday_fingerprint="totally|different|leads",
        daily_signal=signal,
        owned=set(),
    )
    assert meta["forced_rotation"] is False
    assert meta["rotated"] is False
    assert lead_fingerprint(m2, d2, e2) == lead_fingerprint(morning, midday, evening)
    assert meta["chip"]
    print("PASS: no force when already different")


def test_anti_whiplash_skips_kit_slots():
    morning = _kit("Zinc")
    midday = _kit("Omega-3")
    evening = _behavior("Early wind-down · no late research tabs")
    fp = lead_fingerprint(morning, midday, evening)
    signal = {
        "key": "conditioning:bridge",
        "headline": "Bridge shift",
        "body": "Temporary centers moved.",
        "source": "conditioning",
    }
    m2, d2, e2, meta = apply_sky_rotation(
        morning,
        midday,
        evening,
        yesterday_fingerprint=fp,
        daily_signal=signal,
        owned={"zinc", "omega-3"},
    )
    assert m2.get("in_inventory") is True
    assert d2.get("in_inventory") is True
    assert meta["rotated_slot"] == "evening"
    assert not e2.get("in_inventory")
    assert bare_item_name(e2["item"]) != bare_item_name(evening["item"])
    print(f"PASS: anti-whiplash kept kit, rotated evening → {e2['item']!r}")


def test_all_kit_still_forces_midday_behavior():
    morning = _kit("Zinc")
    midday = _kit("Omega-3")
    evening = _kit("Magnesium Glycinate")
    fp = lead_fingerprint(morning, midday, evening)
    signal = {
        "key": "continuity:3",
        "headline": "Same conditioning, day 3",
        "body": "Continuity — change the angle.",
        "source": "continuity",
    }
    m2, d2, e2, meta = apply_sky_rotation(
        morning,
        midday,
        evening,
        yesterday_fingerprint=fp,
        daily_signal=signal,
        owned={"zinc", "omega-3", "magnesium glycinate"},
    )
    assert meta["forced_rotation"] is True
    assert meta["rotated_slot"] == "midday"
    assert not d2.get("in_inventory")
    assert m2.get("in_inventory") and e2.get("in_inventory")
    print(f"PASS: all-kit forced midday behavior → {d2['item']!r}")


def test_build_protocol_surfaces_whats_new():
    natal = _mg_natal()
    overlay = _overlay_logic()
    ind = derive_today_indication(natal, {}, overlay)
    ind = {
        **ind,
        "daily_signal": {
            "key": "moon_gate:4",
            "headline": "Moon enters Gate 4",
            "body": "Mental pressure flavour shifted.",
            "source": "moon_gate",
        },
        "vs_yesterday": [{"field": "moon", "from": "4.1", "to": "4.2"}],
    }
    proto = build_protocol(
        natal,
        overlay,
        ["Omega-3", "Magnesium Glycinate", "Zinc"],
        indication=ind,
        yesterday_lead_fingerprint=None,
    )
    assert "whats_new" in proto
    assert proto["daily_plan"]["whats_new"]["chip"]
    assert proto["lead_fingerprint"]
    natural = proto["natural_lead_fingerprint"]
    proto2 = build_protocol(
        natal,
        overlay,
        ["Omega-3", "Magnesium Glycinate", "Zinc"],
        indication=ind,
        yesterday_lead_fingerprint=natural,
    )
    assert proto2["whats_new"]["fingerprint_matched"] is True
    assert proto2["whats_new"]["forced_rotation"] is True
    assert proto2["lead_fingerprint"] != natural
    print("PASS: build_protocol whats_new + forced rotation")


if __name__ == "__main__":
    test_fingerprint_stable()
    test_force_rotation_when_fingerprint_matches()
    test_no_force_when_fingerprint_differs()
    test_anti_whiplash_skips_kit_slots()
    test_all_kit_still_forces_midday_behavior()
    test_build_protocol_surfaces_whats_new()
    print("ALL OK")
