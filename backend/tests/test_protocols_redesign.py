"""P0 Protocols redesign: sky-led hero + timed variance + weekly theme fix."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.biohack.rules import build_protocol
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


def _proto(natal, overlay, inventory=None, transit=None):
    indication = derive_today_indication(natal, transit or {}, overlay)
    return build_protocol(
        natal,
        overlay,
        inventory or ["Omega-3", "Magnesium Glycinate", "Zinc"],
        indication=indication,
        transit=transit or {},
    )


def test_weekly_theme_uses_sun_earth_summary():
    natal = _mg_natal()
    overlay = {
        "newly_defined_centers": ["Head"],
        "bridged_channels": [],
        "weekly_macro_theme": {
            "sun_gate": "50.4",
            "earth_gate": "3.4",
            "summary": "Sun in Gate 50 Line 4 / Earth in Gate 3 Line 4",
        },
    }
    proto = _proto(natal, overlay)
    theme = proto["weekly_plan"]["theme"]
    assert "Sun in Gate 50" in theme
    assert "Earth in Gate 3" in theme
    assert "operating system" not in theme.lower()
    print("PASS: weekly theme uses summary")


def test_two_days_different_hero_or_timed_leads():
    natal = _mg_natal()
    inventory = ["Omega-3", "Magnesium Glycinate", "Zinc"]

    # Day A: Logic bridge — Head/Ajna temporary (mind weather)
    overlay_a = {
        "newly_defined_centers": ["Head", "Ajna"],
        "bridged_channels": [
            {"gates": [4, 63], "name": "Logic", "centers": ["Head", "Ajna"]}
        ],
        "weekly_macro_theme": {
            "summary": "Sun in Gate 50 Line 4 / Earth in Gate 3 Line 4",
        },
    }
    # Day B: Struggle bridge — Spleen in the weather
    overlay_b = {
        "newly_defined_centers": ["Spleen"],
        "bridged_channels": [
            {"gates": [28, 38], "name": "Struggle", "centers": ["Spleen", "Root"]}
        ],
        "weekly_macro_theme": {
            "summary": "Sun in Gate 28 Line 1 / Earth in Gate 27 Line 1",
        },
    }

    a = _proto(natal, overlay_a, inventory)
    b = _proto(natal, overlay_b, inventory)

    hero_a = a["summary"]["headline"]
    hero_b = b["summary"]["headline"]
    leads_a = (
        a["daily_plan"]["morning"][0]["item"],
        a["daily_plan"]["midday"][0]["item"],
        a["daily_plan"]["evening"][0]["item"],
    )
    leads_b = (
        b["daily_plan"]["morning"][0]["item"],
        b["daily_plan"]["midday"][0]["item"],
        b["daily_plan"]["evening"][0]["item"],
    )

    assert hero_a != hero_b or leads_a != leads_b, (
        f"Expected variance; hero_a={hero_a!r} hero_b={hero_b!r} "
        f"leads_a={leads_a!r} leads_b={leads_b!r}"
    )
    print(f"PASS variance: hero_a={hero_a!r}")
    print(f"  leads_a={leads_a}")
    print(f"  hero_b={hero_b!r}")
    print(f"  leads_b={leads_b}")


def test_hero_not_locked_to_daylight_caffeine_magnesium():
    natal = _mg_natal()
    overlay = {
        "newly_defined_centers": ["Head", "Ajna"],
        "bridged_channels": [
            {"gates": [4, 63], "name": "Logic", "centers": ["Head", "Ajna"]}
        ],
        "weekly_macro_theme": {
            "summary": "Sun in Gate 50 Line 4 / Earth in Gate 3 Line 4",
        },
    }
    proto = _proto(natal, overlay)
    leads = [
        proto["daily_plan"]["morning"][0]["item"].lower(),
        proto["daily_plan"]["midday"][0]["item"].lower(),
        proto["daily_plan"]["evening"][0]["item"].lower(),
    ]
    # Permanent old trio must not occupy all three lead slots
    is_old_trio = (
        "daylight" in leads[0]
        and "caffeine" in leads[1]
        and "magnesium" in leads[2]
    )
    assert not is_old_trio, f"Lead trio still locked: {leads}"
    kit_items = [x["item"].lower() for x in proto["daily_plan"]["baseline_kit"]]
    assert any("daylight" in k for k in kit_items)
    assert any("caffeine" in k for k in kit_items)
    print("PASS: hero leads not permanent Daylight/Caffeine/Magnesium")


def test_indication_embedded_and_matches_derive():
    natal = _mg_natal()
    overlay = {
        "newly_defined_centers": ["Spleen"],
        "bridged_channels": [
            {"gates": [28, 38], "name": "Struggle", "centers": ["Spleen", "Root"]}
        ],
        "weekly_macro_theme": {"summary": "Sun in Gate 28 Line 1 / Earth in Gate 27 Line 1"},
    }
    ind = derive_today_indication(natal, {}, overlay)
    proto = build_protocol(natal, overlay, ["Zinc"], indication=ind)
    assert proto["indication"]["energy_label"] == ind["energy_label"]
    assert proto["indication"]["preferred_space"] == ind["preferred_space"]
    assert proto["summary"]["headline"] == ind["main_action_text"]
    print("PASS: embedded indication matches derive")


if __name__ == "__main__":
    test_weekly_theme_uses_sun_earth_summary()
    test_two_days_different_hero_or_timed_leads()
    test_hero_not_locked_to_daylight_caffeine_magnesium()
    test_indication_embedded_and_matches_derive()
    print("ALL OK")
