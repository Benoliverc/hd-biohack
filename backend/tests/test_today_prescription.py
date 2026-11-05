"""PR1 — Transit → Moment → Move + kit slot (deterministic, no LLM)."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.checkin.derive import derive_today_indication
from app.checkin.prescription import (
    HISTORY_WINDOW_DAYS,
    MOMENT_MOVES,
    _word_count,
    build_prescription,
    pick_dominant_moment,
)
from app.checkin.rules import MAIN_ACTION_MAX_WORDS


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


def test_move_word_cap_all_templates():
    for moment, lines in MOMENT_MOVES.items():
        for line in lines:
            assert _word_count(line.rstrip(".") + ".") <= MAIN_ACTION_MAX_WORDS, (
                moment,
                line,
                _word_count(line.rstrip(".") + "."),
            )
    print("PASS: all Move templates ≤20 words")


def test_hyper_surplus_no_jargon():
    natal = _natal(
        type="Projector",
        defined_centers=["Ajna"],
        undefined_centers=["Sacral", "Root", "Head", "Throat", "G", "Heart", "Solar_Plexus", "Spleen"],
    )
    overlay = {"newly_defined_centers": ["Sacral", "Root"], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["moment"] == "surplus"
    assert ind["when_slot"] in ("morning", "midday", "evening")
    text = ind["main_action_text"].lower()
    for banned in ("sacral", "gate", "strategy", "projector", "authority"):
        assert banned not in text, text
    assert ind["kit_placeholder"] is True
    print("PASS: Hyper → surplus Move, no HD jargon, kit placeholder")


def test_root_without_sacral_recover():
    natal = _natal(
        type="Projector",
        strategy="Wait for the Invitation",
        defined_centers=["Ajna"],
        undefined_centers=["Sacral", "Root", "Head", "Throat", "G", "Heart", "Solar_Plexus", "Spleen"],
    )
    overlay = {"newly_defined_centers": ["Root"], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["energy_level"] == 1
    assert ind["moment"] == "recover"
    assert ind["moment_noun"] == "recovery"
    assert ind["when_slot"] == "evening"
    print("PASS: Root-without-Sacral → recover / evening")


def test_mind_only_mental_pressure():
    natal = _natal(
        type="Manifestor",
        strategy="To Inform",
        defined_centers=["Throat", "Heart"],
        undefined_centers=["Head", "Ajna", "Sacral", "Root", "G", "Solar_Plexus", "Spleen"],
    )
    overlay = {"newly_defined_centers": ["Head", "Ajna"], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["moment"] == "mental_pressure"
    assert ind["moment_noun"] == "focus"
    assert ind["when_slot"] == "morning"
    print("PASS: mind-only → mental_pressure / morning")


def test_borrowed_sacral_fuel():
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
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["moment"] == "borrowed_fuel"
    print("PASS: borrowed Sacral → borrowed_fuel")


def test_quiet_sky_projector():
    natal = _natal(
        type="Projector",
        strategy="Wait for the Invitation",
        defined_centers=["Ajna", "Throat"],
        undefined_centers=["Sacral", "Root", "Head", "G", "Heart", "Solar_Plexus", "Spleen"],
    )
    overlay = {"newly_defined_centers": [], "bridged_channels": []}
    ind = derive_today_indication(natal, {}, overlay)
    assert ind["moment"] == "quiet_sky"
    assert ind["moment_noun"] == "calm"
    print("PASS: quiet sky Projector → quiet_sky")


def test_no_natal_still_has_prescription():
    transit = {
        "activated_gates": [5, 15],
        "sun_earth": {"sun": {"gate": 5, "line": 1}, "earth": {"gate": 35, "line": 1}},
    }
    ind = derive_today_indication(None, transit, None)
    assert ind["has_natal"] is False
    assert ind["main_action_text"]
    assert ind["when_slot"]
    assert ind["kit_placeholder"] is True
    assert ind["kit_item"] is None
    print("PASS: no-natal still emits Move + When + kit placeholder")


def test_free_empty_kit_placeholder_visible():
    natal = _natal()
    rx = build_prescription(
        natal=natal,
        transit={},
        overlay={"newly_defined_centers": ["Head"], "bridged_channels": []},
        energy_level=2,
        energy_label="Low",
        preferred_space="focus",
        day_key="2026-11-06",
        owned_names=[],
        biohacking_unlocked=False,
    )
    assert rx["kit_placeholder"] is True
    assert rx["kit_item"] is None
    assert rx["moment_noun"] in ("calm", "focus", "recovery")
    print("PASS: Free / empty kit → placeholder, never omit")


def test_preview_as_free_forces_placeholder_even_with_kit():
    natal = _natal()
    overlay = {"newly_defined_centers": ["Head", "Ajna"], "bridged_channels": []}
    # Simulate API preview_as_free: biohacking_unlocked=False despite owned kit
    rx = build_prescription(
        natal=natal,
        transit={},
        overlay=overlay,
        energy_level=2,
        energy_label="Low",
        preferred_space="focus",
        day_key="2026-11-06",
        owned_names=["Magnesium Glycinate", "L-Theanine", "Omega-3"],
        inventory_notes={"Magnesium Glycinate": "200mg"},
        biohacking_unlocked=False,
    )
    assert rx["kit_placeholder"] is True
    assert rx["kit_item"] is None
    print("PASS: Preview as Free → kit placeholder despite owned kit")


def test_pro_kit_rotation_deterministic_and_varies():
    natal = _natal(
        type="Projector",
        defined_centers=["Ajna"],
        undefined_centers=["Sacral", "Root", "Head", "Throat", "G", "Heart", "Solar_Plexus", "Spleen"],
    )
    overlay = {"newly_defined_centers": ["Head", "Ajna"], "bridged_channels": []}
    owned = ["Magnesium Glycinate", "L-Theanine", "Lion's Mane", "Omega-3"]
    notes = {"Magnesium Glycinate": "200 mg evening"}
    a = build_prescription(
        natal=natal,
        transit={},
        overlay=overlay,
        energy_level=2,
        energy_label="Low",
        preferred_space="focus",
        day_key="2026-11-06",
        owned_names=owned,
        inventory_notes=notes,
        biohacking_unlocked=True,
    )
    b = build_prescription(
        natal=natal,
        transit={},
        overlay=overlay,
        energy_level=2,
        energy_label="Low",
        preferred_space="focus",
        day_key="2026-11-06",
        owned_names=owned,
        inventory_notes=notes,
        biohacking_unlocked=True,
    )
    assert a == b, "same inputs must be deterministic"
    assert a["kit_placeholder"] is False
    assert a["kit_item"] is not None
    # Dose only from kit notes when that item was picked
    if "magnesium" in (a["kit_item"]["name"] or "").lower():
        assert a["kit_item"]["dose"] == "200 mg evening"
    else:
        # Other items have no notes → empty dose (never invent)
        assert a["kit_item"]["dose"] == ""

    picks = set()
    for i in range(1, 15):
        day = f"2026-11-{i:02d}"
        rx = build_prescription(
            natal=natal,
            transit={},
            overlay=overlay,
            energy_level=2,
            energy_label="Low",
            preferred_space="focus",
            day_key=day,
            owned_names=owned,
            inventory_notes=notes,
            biohacking_unlocked=True,
        )
        if rx["kit_item"]:
            picks.add(rx["kit_item"]["name"])
    assert len(picks) >= 2, f"expected rotation across days, got {picks}"
    print("PASS: Pro kit deterministic + rotates across days; no invented dose")


def test_downrank_after_ignored_history():
    natal = _natal(
        type="Projector",
        defined_centers=["Ajna"],
        undefined_centers=["Sacral", "Root", "Head", "Throat", "G", "Heart", "Solar_Plexus", "Spleen"],
    )
    # Quiet sky primary for empty overlay Projector
    overlay = {"newly_defined_centers": [], "bridged_channels": []}
    # 14+ days ignoring quiet_sky, completing recover
    history = []
    for i in range(HISTORY_WINDOW_DAYS + 2):
        history.append({"item_id": "today-move:quiet_sky", "done": False, "day": f"2026-10-{i+1:02d}"})
        history.append({"item_id": "today-move:recover", "done": True, "day": f"2026-10-{i+1:02d}"})
    free = build_prescription(
        natal=natal,
        transit={},
        overlay=overlay,
        energy_level=2,
        energy_label="Low",
        preferred_space="alone",
        day_key="2026-11-06",
        biohacking_unlocked=False,
        history=history,
    )
    pro = build_prescription(
        natal=natal,
        transit={},
        overlay=overlay,
        energy_level=2,
        energy_label="Low",
        preferred_space="alone",
        day_key="2026-11-06",
        biohacking_unlocked=True,
        history=history,
    )
    assert free["moment"] == "quiet_sky"  # Free never down-ranks
    assert pro["moment"] == "recover"  # Pro prefers completed sibling
    print("PASS: Pro down-ranks ignored quiet_sky → recover; Free keeps primary")


def test_deterministic_full_stack():
    natal = _natal()
    overlay = {"newly_defined_centers": ["Solar_Plexus"], "bridged_channels": []}
    kwargs = dict(
        natal=natal,
        transit={"sun_earth": {"sun": {"gate": 36, "line": 2}}},
        overlay=overlay,
        energy_level=3,
        energy_label="Steady",
        preferred_space="alone",
        day_key="2026-11-06",
        owned_names=["L-Theanine", "NAC"],
        inventory_notes={},
        biohacking_unlocked=True,
        history=[],
    )
    a = build_prescription(**kwargs)
    b = build_prescription(**kwargs)
    assert a == b
    assert a["moment"] == "emotional_wave"
    print("PASS: emotional wave + full stack deterministic")


if __name__ == "__main__":
    test_move_word_cap_all_templates()
    test_hyper_surplus_no_jargon()
    test_root_without_sacral_recover()
    test_mind_only_mental_pressure()
    test_borrowed_sacral_fuel()
    test_quiet_sky_projector()
    test_no_natal_still_has_prescription()
    test_free_empty_kit_placeholder_visible()
    test_preview_as_free_forces_placeholder_even_with_kit()
    test_pro_kit_rotation_deterministic_and_varies()
    test_downrank_after_ignored_history()
    test_deterministic_full_stack()
    print("ALL PR1 prescription tests passed")
