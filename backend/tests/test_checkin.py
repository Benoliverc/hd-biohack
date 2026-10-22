"""HD-derived Today indication + Main action (no LLM / no Protocol / no self-ask)."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.checkin.derive import derive_today_indication
from app.checkin.rules import SPACE_MICRO, compute_main_action, sky_bullet_one


def _natal(**kwargs):
    base = {
        "type": "Generator",
        "strategy": "To Respond",
        "defined_centers": ["Sacral", "Root"],
        "undefined_centers": ["Head", "Ajna", "Throat", "G", "Heart", "Solar_Plexus", "Spleen"],
        "activated_gates": [5, 14],
        "hanging_gates": [],
        "channels": [],
    }
    base.update(kwargs)
    return base


def test_ac2_sacral_bridge_charged_temporary_language():
    natal = _natal(
        type="Projector",
        strategy="Wait for the Invitation",
        defined_centers=["Ajna", "Throat"],
        undefined_centers=["Sacral", "Root", "Head", "G", "Heart", "Solar_Plexus", "Spleen"],
    )
    overlay = {
        "newly_defined_centers": ["Sacral"],
        "bridged_channels": [
            {"gates": [34, 20], "name": "Charisma", "centers": ["Sacral", "Throat"]}
        ],
    }
    ind = derive_today_indication(natal, {"sun_earth": {"sun": {"gate": 1, "line": 1}}}, overlay)
    assert ind["energy_level"] in (4, 5)
    assert "Generator today" not in ind["main_action_why"].lower()
    assert "borrowed" in ind["main_action_why"].lower() or "temporary" in ind["main_action_why"].lower()
    assert ind["has_natal"] is True
    print("PASS AC2: Sacral bridge → Charged/Hyper + temporary language")


def test_ac3_root_without_sacral_drained():
    natal = _natal(
        type="Projector",
        strategy="Wait for the Invitation",
        defined_centers=["Ajna"],
        undefined_centers=["Sacral", "Root", "Head", "Throat", "G", "Heart", "Solar_Plexus", "Spleen"],
    )
    overlay = {"newly_defined_centers": ["Root"], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["energy_level"] == 1
    assert ind["energy_label"] == "Drained"
    text = ind["main_action_text"].lower()
    assert "protect" in text or "rest" in text or "downshift" in text or "quiet" in text
    print("PASS AC3: Root newly, Sacral open Projector → Drained + protect")


def test_ac4_mind_only_low_focus():
    natal = _natal(
        type="Manifestor",
        strategy="To Inform",
        defined_centers=["Throat", "Heart"],
        undefined_centers=["Head", "Ajna", "Sacral", "Root", "G", "Solar_Plexus", "Spleen"],
    )
    overlay = {"newly_defined_centers": ["Head", "Ajna"], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["energy_level"] == 2
    assert ind["preferred_space"] == "focus"
    print("PASS AC4: Head/Ajna only → Low + focus")


def test_ac5_reflector_space_out():
    natal = _natal(
        type="Reflector",
        strategy="Wait a Lunar Cycle",
        defined_centers=[],
        undefined_centers=[
            "Head", "Ajna", "Throat", "G", "Heart",
            "Solar_Plexus", "Sacral", "Spleen", "Root",
        ],
    )
    overlay = {"newly_defined_centers": [], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["preferred_space"] == "out"
    print("PASS AC5: Reflector → out")


def test_ac6_hyper_anti_stim():
    natal = _natal(
        type="Projector",
        defined_centers=["Ajna"],
        undefined_centers=["Sacral", "Root", "Head", "Throat", "G", "Heart", "Solar_Plexus", "Spleen"],
    )
    overlay = {
        "newly_defined_centers": ["Sacral", "Root"],
        "bridged_channels": [],
    }
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["energy_level"] == 5
    blob = (ind["main_action_text"] + " " + ind["main_action_why"]).lower()
    assert "stimulant" in blob or "stacked" in blob or "overloading" in blob
    print("PASS AC6: Hyper → anti-stim / anti-stack")


def test_ac7_no_natal_safe():
    transit = {
        "activated_gates": [5, 15],  # Sacral–G channel possible
        "sun_earth": {"sun": {"gate": 5, "line": 1}, "earth": {"gate": 35, "line": 1}},
    }
    ind = derive_today_indication(None, transit, None)
    assert ind["energy_level"] in (3, 4)
    assert ind["has_natal"] is False
    assert ind["save_chart_cta"] is True
    assert "Generator today" not in ind["main_action_why"]
    print("PASS AC7: no natal → safe Steady/Charged + CTA")


def test_space_priority_g_nature():
    natal = _natal(
        type="Generator",
        defined_centers=["Sacral"],
        undefined_centers=["G", "Head", "Ajna", "Throat", "Heart", "Solar_Plexus", "Spleen", "Root"],
    )
    overlay = {"newly_defined_centers": ["G"], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["preferred_space"] == "nature"
    print("PASS: G newly → nature")


def test_space_sp_borrowed_alone():
    natal = _natal(
        type="Generator",
        defined_centers=["Sacral"],
        undefined_centers=["Solar_Plexus", "G", "Head", "Ajna", "Throat", "Heart", "Spleen", "Root"],
    )
    overlay = {"newly_defined_centers": ["Solar_Plexus"], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["preferred_space"] == "alone"
    # SP borrow alone (no root) → Charged via... wait SP alone isn't sacral/heart.
    # Energy: not Hyper, not Charged sacral/heart, not drained, not mind-only → Steady
    assert ind["energy_level"] == 3
    print("PASS: SP borrowed natal-open → alone")


def test_hyper_two_motors_with_root():
    natal = _natal(
        type="Generator",
        defined_centers=["Throat"],
        undefined_centers=["Sacral", "Root", "Heart", "Solar_Plexus", "Head", "Ajna", "G", "Spleen"],
    )
    overlay = {"newly_defined_centers": ["Heart", "Root"], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["energy_level"] == 5
    print("PASS: |motor_new|>=2 with Root → Hyper")


def test_sp_root_hyper():
    natal = _natal(
        type="Projector",
        defined_centers=["Ajna"],
        undefined_centers=["Solar_Plexus", "Root", "Sacral", "Head", "Throat", "G", "Heart", "Spleen"],
    )
    overlay = {"newly_defined_centers": ["Solar_Plexus", "Root"], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["energy_level"] == 5
    print("PASS: SP + Root borrowed → Hyper")


def test_projector_quiet_low_alone():
    natal = _natal(
        type="Projector",
        defined_centers=["Ajna", "Throat"],
        undefined_centers=["Sacral", "Root", "Head", "G", "Heart", "Solar_Plexus", "Spleen"],
    )
    overlay = {"newly_defined_centers": [], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["energy_level"] == 2
    assert ind["preferred_space"] == "alone"
    print("PASS: Projector quiet → Low + alone")


def test_manifestor_alone():
    natal = _natal(
        type="Manifestor",
        defined_centers=["Throat", "Heart"],
        undefined_centers=["Sacral", "Root", "Head", "Ajna", "G", "Solar_Plexus", "Spleen"],
    )
    overlay = {"newly_defined_centers": [], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["preferred_space"] == "alone"
    print("PASS: Manifestor → alone")


def test_generator_default_focus():
    natal = _natal()
    overlay = {"newly_defined_centers": [], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["energy_level"] == 3
    assert ind["preferred_space"] == "focus"
    print("PASS: Generator quiet → Steady + focus")


def test_main_action_micro_separate():
    text, why, micro = compute_main_action(
        5,
        "out",
        natal={"type": "Projector", "strategy": "Wait for the Invitation"},
    )
    assert "stimulant" in text.lower() or "stimulant" in why.lower()
    assert " · " not in text or SPACE_MICRO["out"] not in text
    assert micro == SPACE_MICRO["out"]
    assert "errands" in micro.lower()
    print("PASS: main_action_micro on own field")


def test_sky_bullet_helper():
    b = sky_bullet_one(
        {"sun_earth": {"sun": {"gate": 1, "line": 1}, "earth": {}}},
        None,
    )
    assert b and "1.1" in b
    print("PASS: sky_bullet_one")


def test_page_load_shape_has_main():
    natal = _natal()
    ind = derive_today_indication(natal, {"sun_earth": {"sun": {"gate": 12, "line": 3}}}, {"newly_defined_centers": [], "bridged_channels": []})
    for key in (
        "energy_level",
        "preferred_space",
        "main_action_text",
        "main_action_why",
        "main_action_micro",
        "disclaimer",
    ):
        assert key in ind and ind[key] not in (None, "")
    print("PASS AC1 shape: Energy+Space+Main present without taps")


if __name__ == "__main__":
    test_ac2_sacral_bridge_charged_temporary_language()
    test_ac3_root_without_sacral_drained()
    test_ac4_mind_only_low_focus()
    test_ac5_reflector_space_out()
    test_ac6_hyper_anti_stim()
    test_ac7_no_natal_safe()
    test_space_priority_g_nature()
    test_space_sp_borrowed_alone()
    test_hyper_two_motors_with_root()
    test_sp_root_hyper()
    test_projector_quiet_low_alone()
    test_manifestor_alone()
    test_generator_default_focus()
    test_main_action_micro_separate()
    test_sky_bullet_helper()
    test_page_load_shape_has_main()
    print("ALL indication unit tests passed")
