"""PR1 — Transit → Moment → Move + kit slot (deterministic, no LLM)."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.checkin.derive import derive_today_indication
from app.checkin.prescription import (
    HISTORY_WINDOW_DAYS,
    MOMENT_MOVES,
    MOMENT_WHEN,
    _word_count,
    build_prescription,
    pick_dominant_moment,
    pick_kit_for_moment,
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


def test_every_moment_has_exactly_five_moves():
    for moment, lines in MOMENT_MOVES.items():
        assert len(lines) == 5, (moment, len(lines))
    print("PASS: every moment has exactly five Move options")


def test_all_moves_ban_jargon():
    banned = (
        "sacral",
        "gate",
        "strategy",
        "projector",
        "manifestor",
        "generator",
        "reflector",
        "authority",
        "sky",
        "wave",
        "crest",
        "battery",
        "borrowed",
        "charge",
        "fuel",
        "inputs",
    )
    for moment, lines in MOMENT_MOVES.items():
        for line in lines:
            lower = line.lower()
            for word in banned:
                assert word not in lower, (moment, word, line)
    print("PASS: all Move lines ban jargon")



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




def test_protocols_avoids_today_kit_id():
    """Protocols timed leads must not reuse Today's kit_supplement_id the same day."""
    from app.biohack.rules import _pick_timed_supports

    natal = _natal(
        type="Projector",
        defined_centers=["Ajna"],
        undefined_centers=["Sacral", "Root", "Head", "Throat", "G", "Heart", "Solar_Plexus", "Spleen"],
    )
    overlay = {"newly_defined_centers": ["Head", "Ajna"], "bridged_channels": []}
    owned_names = ["Magnesium Glycinate", "L-Theanine", "Lion's Mane", "Omega-3"]
    rx = build_prescription(
        natal=natal,
        transit={},
        overlay=overlay,
        energy_level=2,
        energy_label="Low",
        preferred_space="focus",
        day_key="2026-11-06",
        owned_names=owned_names,
        inventory_notes={},
        biohacking_unlocked=True,
    )
    assert rx["kit_item"] is not None
    today_sid = rx["kit_item"]["kit_supplement_id"]
    assert today_sid

    morning, midday, evening = _pick_timed_supports(
        natal,
        overlay,
        {n.lower() for n in owned_names},
        ["Head", "Ajna"],
        [{"name": n, "dose": "", "why": "t"} for n in owned_names],
        [{"name": n, "dose": "", "why": "t"} for n in owned_names],
        [{"name": n, "dose": "", "why": "t"} for n in owned_names],
        "Low",
        "focus",
        day_key="2026-11-06",
        avoid_kit_ids={today_sid},
    )
    for slot_name, row in (("morning", morning), ("midday", midday), ("evening", evening)):
        sid = str((row or {}).get("kit_supplement_id") or "")
        if sid:
            assert sid != today_sid, f"{slot_name} reused Today kit id {today_sid}"
    print("PASS: Protocols avoid_kit_ids skips Today's kit_supplement_id")


def test_offered_move_item_id_stable():
    natal = _natal()
    overlay = {"newly_defined_centers": ["Solar_Plexus"], "bridged_channels": []}
    rx = build_prescription(
        natal=natal,
        transit={},
        overlay=overlay,
        energy_level=3,
        energy_label="Steady",
        preferred_space="alone",
        day_key="2026-11-06",
        biohacking_unlocked=False,
    )
    assert rx["move_item_id"] == f"today-move:{rx['moment']}"
    assert rx["moment"] == "emotional_wave"
    print("PASS: move_item_id stable today-move:{moment}")


if __name__ == "__main__":
    test_move_word_cap_all_templates()
    test_every_moment_has_exactly_five_moves()
    test_all_moves_ban_jargon()
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
    test_protocols_avoids_today_kit_id()
    test_offered_move_item_id_stable()
    print("ALL PR1 prescription tests passed")


def test_live_kit_item_exposes_why_and_when():
    """kit_item carries why/when from pick_kit_for_moment; matcher is unchanged."""
    natal = _natal(
        type="Projector",
        defined_centers=["Ajna"],
        undefined_centers=["Sacral", "Root", "Head", "Throat", "G", "Heart", "Solar_Plexus", "Spleen"],
    )
    overlay = {"newly_defined_centers": ["Head", "Ajna"], "bridged_channels": []}
    owned = ["Magnesium Glycinate", "L-Theanine", "Lion's Mane", "Omega-3"]
    notes = {"Magnesium Glycinate": "200 mg evening"}
    kwargs = dict(
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
    rx = build_prescription(**kwargs)
    assert rx["kit_placeholder"] is False
    item = rx["kit_item"]
    assert item is not None
    assert "why" in item
    assert isinstance(item["why"], str)
    assert "when" in item
    assert item["when"] in ("morning", "midday", "evening", None)

    # Same values pick_kit_for_moment already computed — not a second why, no invented dose.
    newly = overlay.get("newly_defined_centers") or []
    natal_defined = natal.get("defined_centers") or []
    raw = pick_kit_for_moment(
        moment=rx["moment"],
        when=MOMENT_WHEN[rx["moment"]],
        owned_names=owned,
        inventory_notes=notes,
        energy_label="Low",
        preferred_space="focus",
        focus_centers=list(newly) or list(natal_defined)[:2],
        day_key="2026-11-06",
    )
    # when on the prescription may have been overwritten from the kit slot; compare name + why + dose.
    assert raw is not None
    assert item["name"] == raw["name"]
    assert item["why"] == (raw.get("why") or "")
    assert item["dose"] == (raw.get("dose") or "")
    if raw.get("when") in ("morning", "midday", "evening"):
        assert item["when"] == raw["when"]
    else:
        assert item["when"] is None
    print("PASS: live kit_item exposes why/when from pick_kit_for_moment")
