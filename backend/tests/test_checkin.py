"""Today check-in Main action rules + upsert (no LLM / no Protocol generate)."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.checkin.rules import SPACE_MICRO, compute_main_action, sky_bullet_one


def test_recover_not_push():
    text, why, micro = compute_main_action(
        1,
        "alone",
        natal={"type": "Generator", "strategy": "To Respond"},
    )
    assert "Protect" in text or "rest" in text.lower() or "Downshift" in text or "Sacral" in text
    assert "push" not in text.lower() or "skip forced" in text.lower()
    assert " · " not in text
    assert micro == SPACE_MICRO["alone"]
    assert "20 minutes without chat" in micro
    assert "Drained" in why or "protect" in why.lower()
    print("PASS: Drained → recover-oriented; micro separate")


def test_hyper_no_stim_stack():
    text, why, micro = compute_main_action(
        5,
        "out",
        natal={"type": "Projector", "strategy": "Wait for the Invitation"},
    )
    assert "stimulant" in text.lower() or "stimulant" in why.lower()
    assert "stacked" in text.lower() or "overloading" in text.lower()
    assert "Hyper" in why
    assert " · " not in text
    assert micro == SPACE_MICRO["out"]
    assert "errands" in micro.lower()
    print("PASS: Hyper → anti-stim / anti-stack; micro separate")


def test_steady_prefers_sky():
    transit = {"sun_earth": {"sun": {"gate": 12, "line": 3}, "earth": {"gate": 11, "line": 3}}}
    text, why, micro = compute_main_action(
        3,
        "nature",
        natal={"type": "Manifestor", "strategy": "To Inform"},
        transit=transit,
        overlay={},
        cached_top_action="Morning: Magnesium (evening). should not win",
    )
    assert "Sun theme" in text and "12.3" in text
    assert "Magnesium" not in text
    assert "Steady" in why
    assert " · " not in text
    assert micro == SPACE_MICRO["nature"]
    assert "outdoors" in micro.lower() or "Walk" in micro
    print("PASS: Steady prefers sky over cached protocol; micro separate")


def test_steady_falls_back_to_cached_protocol():
    text, why, micro = compute_main_action(
        3,
        "people",
        natal={"type": "Generator", "strategy": "To Respond"},
        transit={},
        overlay={},
        cached_top_action="Morning: Protein-forward breakfast (on waking).",
    )
    assert "Protein-forward" in text
    assert "protocol" in why.lower() or "Steady" in why
    assert " · " not in text
    assert micro == SPACE_MICRO["people"]
    print("PASS: Steady uses cached top_action when no sky")


def test_no_chart_generic():
    text, why, micro = compute_main_action(2, "focus", natal=None)
    assert " · " not in text
    assert "wall" in micro.lower() or "entrance" in micro.lower()
    assert text
    assert why
    print("PASS: No chart still yields generic recover + separate space micro")


def test_sky_bullet_helper():
    b = sky_bullet_one(
        {"sun_earth": {"sun": {"gate": 1, "line": 1}, "earth": {}}},
        None,
    )
    assert b and "1.1" in b
    print("PASS: sky_bullet_one")


def test_space_enum_complete():
    for space in ("people", "alone", "nature", "focus", "out"):
        text, _, micro = compute_main_action(3, space, natal={"type": "Reflector"})
        assert " · " not in text
        assert micro == SPACE_MICRO[space]
    print("PASS: all preferred_space micros returned separately")


def test_drained_mg_battery_no_speed_tension():
    text, why, _ = compute_main_action(
        1,
        "alone",
        natal={"type": "Manifesting Generator", "strategy": "To Respond"},
    )
    assert "Downshift" in text or "rest" in text.lower()
    assert "likes speed" not in why.lower()
    print("PASS: Drained MG why avoids 'likes speed' tension")


if __name__ == "__main__":
    test_recover_not_push()
    test_hyper_no_stim_stack()
    test_steady_prefers_sky()
    test_steady_falls_back_to_cached_protocol()
    test_no_chart_generic()
    test_sky_bullet_helper()
    test_space_enum_complete()
    test_drained_mg_battery_no_speed_tension()
    print("ALL checkin unit tests passed")
