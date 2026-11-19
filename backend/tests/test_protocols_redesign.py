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




def test_sacral_open_sp_evening_not_emotional_authority():
    """Alex case: Generator/MG Sacral + open Solar Plexus must not say Emotional Authority."""
    natal = _mg_natal(authority="Sacral")
    assert "Solar_Plexus" in natal["undefined_centers"]
    overlay = {
        "newly_defined_centers": ["Head"],
        "bridged_channels": [],
        "weekly_macro_theme": {"summary": "Sun in Gate 50 Line 4 / Earth in Gate 3 Line 4"},
    }
    # Steady energy so we don't take Hyper anti-stim evening branch
    ind = derive_today_indication(natal, {}, overlay)
    # Force Steady if needed by rebuilding with indication override
    if ind.get("energy_label") in ("Hyper", "Charged"):
        ind = dict(ind)
        ind["energy_label"] = "Steady"
        ind["energy_level"] = 3
    proto = build_protocol(
        natal,
        overlay,
        ["Omega-3", "Magnesium Glycinate", "Zinc"],
        indication=ind,
        transit={},
    )
    evening = proto["daily_plan"]["evening"][0]
    blob = f"{evening.get('item','')} {evening.get('why','')} {evening.get('dose_hint','')}"
    assert "Emotional Authority" not in blob, blob
    assert "Emotional Authority / open Solar Plexus" not in blob
    print("PASS: Sacral + open SP evening lead is not Emotional Authority")


def test_emotional_auth_may_get_wave_evening_lead():
    natal = _mg_natal(
        authority="Emotional (Solar Plexus)",
        defined_centers=["Sacral", "Solar_Plexus", "Throat", "G"],
        undefined_centers=["Head", "Ajna", "Heart", "Root", "Spleen"],
    )
    overlay = {
        "newly_defined_centers": [],
        "bridged_channels": [],
        "weekly_macro_theme": {"summary": "Sun in Gate 50 Line 4 / Earth in Gate 3 Line 4"},
    }
    ind = derive_today_indication(natal, {}, overlay)
    if ind.get("energy_label") in ("Hyper", "Charged"):
        ind = dict(ind)
        ind["energy_label"] = "Steady"
        ind["energy_level"] = 3
    proto = build_protocol(natal, overlay, ["Zinc"], indication=ind, transit={})
    evening = proto["daily_plan"]["evening"][0]
    blob = f"{evening.get('item','')} {evening.get('why','')}"
    assert "emotional crest" in blob.lower() or "Emotional Authority" in blob, blob
    assert "Emotional Authority / open Solar Plexus" not in blob
    print("PASS: Emotional authority may get wave evening lead")




def test_evening_only_magnesium_not_morning_breakfast():
    """Owned Magnesium must not appear at breakfast AND evening bed time the same day."""
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
    proto = _proto(natal, overlay, inventory=["Magnesium Glycinate"])
    morning = proto["daily_plan"]["morning"][0]
    midday = proto["daily_plan"]["midday"][0]
    evening = proto["daily_plan"]["evening"][0]
    kit = proto["daily_plan"]["baseline_kit"]

    def _is_mag(row):
        return "magnesium" in f"{row.get('item', '')} {row.get('matched_as', '')}".lower()

    rows = [r for r in (morning, midday, evening, *kit) if _is_mag(r)]
    whens = [str(r.get("when") or "").lower() for r in rows]
    has_morningish = any(("breakfast" in w) or w.startswith("morning") for w in whens)
    has_eveningish = any(
        ("before bed" in w) or ("wind-down" in w) or w == "evening" or "60–90" in w
        for w in whens
    )
    assert not (has_morningish and has_eveningish), f"dual magnesium times: {rows}"
    # Timed lead + Baseline kit must not both list it
    timed = [r for r in (morning, midday, evening) if _is_mag(r)]
    kit_mag = [r for r in kit if _is_mag(r)]
    if timed:
        assert not kit_mag, f"timed + baseline kit duplicate: {timed} {kit_mag}"
    print("PASS: magnesium not at conflicting morning+evening times / not duplicated")



def test_magnesium_not_duplicated_timed_lead_and_baseline_kit():
    """A day's plan shows Magnesium at most once (timed lead OR Baseline kit, not both)."""
    natal = _mg_natal()
    overlays = [
        {
            "newly_defined_centers": ["Head", "Ajna"],
            "bridged_channels": [
                {"gates": [4, 63], "name": "Logic", "centers": ["Head", "Ajna"]}
            ],
            "weekly_macro_theme": {
                "summary": "Sun in Gate 50 Line 4 / Earth in Gate 3 Line 4",
            },
        },
        {
            "newly_defined_centers": ["Spleen"],
            "bridged_channels": [
                {"gates": [28, 38], "name": "Struggle", "centers": ["Spleen", "Root"]}
            ],
            "weekly_macro_theme": {
                "summary": "Sun in Gate 28 Line 1 / Earth in Gate 27 Line 1",
            },
        },
        {
            "newly_defined_centers": ["Root", "Solar_Plexus"],
            "bridged_channels": [
                {"gates": [19, 49], "name": "Synthesis", "centers": ["Root", "Solar_Plexus"]}
            ],
            "weekly_macro_theme": {
                "summary": "Sun in Gate 19 Line 2 / Earth in Gate 33 Line 2",
            },
        },
    ]
    inventory = ["Magnesium Glycinate", "Omega-3", "Zinc"]

    def _is_mag(row: dict | None) -> bool:
        if not row:
            return False
        blob = f"{row.get('item', '')} {row.get('matched_as', '')} {row.get('name', '')}".lower()
        return "magnesium" in blob

    for overlay in overlays:
        proto = _proto(natal, overlay, inventory)
        morning = proto["daily_plan"]["morning"][0]
        midday = proto["daily_plan"]["midday"][0]
        evening = proto["daily_plan"]["evening"][0]
        kit = proto["daily_plan"]["baseline_kit"]
        timed_mag = [r for r in (morning, midday, evening) if _is_mag(r)]
        kit_mag = [r for r in kit if _is_mag(r)]
        assert len(timed_mag) <= 1, f"magnesium in multiple timed slots: {timed_mag}"
        if timed_mag:
            assert not kit_mag, (
                f"magnesium in timed lead and Baseline kit: timed={timed_mag} kit={kit_mag}"
            )
        # Dual clock times banned: breakfast/morning label + evening bed time same day
        all_mag = timed_mag + kit_mag
        whens = [str(r.get("when") or "").lower() for r in all_mag]
        has_morningish = any(
            ("breakfast" in w) or w.startswith("morning") or "on waking" in w
            for w in whens
        )
        has_eveningish = any(
            ("before bed" in w) or ("wind-down" in w) or w == "evening" or "60–90" in w
            for w in whens
        )
        assert not (has_morningish and has_eveningish), (
            f"magnesium at two clock times: {all_mag}"
        )
    print("PASS: magnesium not duplicated across timed lead + Baseline kit")


def test_baseline_kit_keeps_daylight_and_caffeine():
    natal = _mg_natal()
    overlay = {
        "newly_defined_centers": ["Head"],
        "bridged_channels": [],
        "weekly_macro_theme": {"summary": "Sun in Gate 1 Line 1 / Earth in Gate 2 Line 1"},
    }
    # Evening lead will often take Magnesium when it is the only evening bank hit
    proto = _proto(natal, overlay, inventory=["Magnesium Glycinate"])
    kit_items = [x["item"].lower() for x in proto["daily_plan"]["baseline_kit"]]
    assert any("daylight" in k for k in kit_items)
    assert any("caffeine" in k for k in kit_items)
    print("PASS: Baseline kit still has daylight + caffeine rows")


if __name__ == "__main__":
    test_sacral_open_sp_evening_not_emotional_authority()
    test_emotional_auth_may_get_wave_evening_lead()
    test_weekly_theme_uses_sun_earth_summary()
    test_two_days_different_hero_or_timed_leads()
    test_hero_not_locked_to_daylight_caffeine_magnesium()
    test_indication_embedded_and_matches_derive()
    test_evening_only_magnesium_not_morning_breakfast()
    test_magnesium_not_duplicated_timed_lead_and_baseline_kit()
    test_baseline_kit_keeps_daylight_and_caffeine()
    print("ALL OK")
