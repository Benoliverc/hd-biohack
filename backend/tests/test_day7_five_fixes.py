"""Day 7 five fixes: Move headline selection (no reprint, no cross-person rotation)."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.checkin.prescription import MOMENT_MOVES, _cap_words, select_move_text

CONCRETE = ("Carve 20 minutes without chat.", "today.spaceMicro.alone")
GENERIC = [_cap_words(t) for t in MOMENT_MOVES["borrowed_fuel"]]


def _row(day: str, label: str, moment: str = "borrowed_fuel") -> dict:
    return {"item_id": f"today-move:{moment}", "done": False, "day": day, "label": label}


def test_sky_changed_leads_with_concrete_action_instead_of_reprint():
    history = [_row("2026-11-24", GENERIC[2])]
    text, key = select_move_text(
        "borrowed_fuel", history=history, pro=True, day_key="2026-11-25",
        user_key="maya", sky_changed=True, concrete=CONCRETE,
    )
    assert text == CONCRETE[0]
    assert key == CONCRETE[1]


def test_no_other_accounts_recent_generic_line():
    # Concrete was yesterday's headline; every unused moment line except one was
    # served to someone else this week -> that one, never a line another person had.
    history = [_row("2026-11-24", CONCRETE[0])]
    others = GENERIC[:4]
    text, _ = select_move_text(
        "borrowed_fuel", history=history, pro=True, day_key="2026-11-25",
        user_key="alex", avoid_texts=others, sky_changed=True, concrete=CONCRETE,
    )
    assert text == GENERIC[4]


def test_pool_exhausted_never_reprints_yesterday():
    # Concrete was yesterday's headline and every moment line was served this week.
    history = [_row("2026-11-24", CONCRETE[0])] + [
        _row(f"2026-11-{18 + i}", g) for i, g in enumerate(GENERIC)
    ]
    text, _ = select_move_text(
        "borrowed_fuel", history=history, pro=True, day_key="2026-11-25",
        user_key="sam", avoid_texts=GENERIC, sky_changed=True, concrete=CONCRETE,
    )
    assert text != CONCRETE[0]
    assert text == GENERIC[0]  # the line this person saw longest ago (Nov 18)


def test_same_day_reload_keeps_served_headline():
    history = [_row("2026-11-25", GENERIC[3])]
    for others in ([], GENERIC):
        text, _ = select_move_text(
            "borrowed_fuel", history=history, pro=True, day_key="2026-11-25",
            user_key="ren", avoid_texts=others, sky_changed=True, concrete=CONCRETE,
        )
        assert text == GENERIC[3]


def test_unchanged_sky_keeps_last_headline_no_invented_sentence():
    history = [_row("2026-11-23", GENERIC[0]), _row("2026-11-24", GENERIC[1])]
    text, _ = select_move_text(
        "borrowed_fuel", history=history, pro=True, day_key="2026-11-25",
        user_key="jules", sky_changed=False, concrete=CONCRETE,
    )
    assert text == GENERIC[1]


def test_two_people_with_same_action_do_not_share_a_headline():
    nature = ("Walk outdoors briefly before screens pile up.", "today.spaceMicro.nature")
    a, _ = select_move_text("borrowed_fuel", history=[], pro=True, day_key="2026-11-25",
                            user_key="jules", sky_changed=True, concrete=nature)
    b, _ = select_move_text("borrowed_fuel", history=[], pro=True, day_key="2026-11-25",
                            user_key="ren", avoid_texts=[a], sky_changed=True, concrete=nature)
    assert a == nature[0]
    assert b != a and b in GENERIC


def test_all_lines_seen_by_others_takes_oldest_seen():
    nature = ("Walk outdoors briefly before screens pile up.", "today.spaceMicro.nature")
    others = [GENERIC[1], GENERIC[0], GENERIC[2], GENERIC[3], GENERIC[4], nature[0]]
    text, _ = select_move_text("borrowed_fuel", history=[], pro=True, day_key="2026-11-25",
                               user_key="ren", avoid_texts=others, sky_changed=True, concrete=nature)
    assert text == GENERIC[1]


def test_legacy_free_path_unchanged():
    text, key = select_move_text("borrowed_fuel", history=None, pro=False, day_key="2026-11-25")
    assert text == GENERIC[0] and key.endswith(".0")


def _rx(owned, pinned=None):
    from app.checkin.prescription import build_prescription

    natal = {"type": "Generator", "authority": "Sacral", "defined_centers": ["Sacral", "Root"]}
    return build_prescription(
        natal=natal, transit={}, overlay={"newly_defined_centers": ["Head"], "bridged_channels": []},
        energy_level=4, energy_label="Charged", preferred_space="alone", day_key="2026-11-25",
        owned_names=owned, biohacking_unlocked=True, user_key="alex",
        pinned_kit_item_ids=pinned,
    )


def test_ticked_kit_pick_stays_todays_pick_after_shelf_add():
    first = _rx(["Magnesium Glycinate", "Omega-3"])["kit_item"]
    assert first
    # Precondition: without the pin this add swaps the suggested pick (the Day 7 symptom).
    swapped = _rx(["Magnesium Glycinate", "Omega-3", "Vitamin D3", "Ashwagandha", "L-Theanine"])["kit_item"]
    assert swapped and swapped["item_id"] != first["item_id"]
    for extra in (["Vitamin D3"], ["Vitamin D3", "Ashwagandha", "L-Theanine"]):
        after = _rx(["Magnesium Glycinate", "Omega-3", *extra], pinned={first["item_id"]})["kit_item"]
        assert after and after["item_id"] == first["item_id"], (first, after)


def test_pinned_pick_released_when_removed_from_shelf():
    first = _rx(["Magnesium Glycinate", "Omega-3"])["kit_item"]
    remaining = [n for n in ["Magnesium Glycinate", "Omega-3"] if n.lower() not in first["name"].lower()]
    after = _rx(remaining, pinned={first["item_id"]})["kit_item"]
    assert after is None or after["item_id"] != first["item_id"]


def test_never_same_headline_as_another_account_today():
    # Ref has had every moment line this week; Walk outdoors is already someone's headline today.
    nature = ("Walk outdoors briefly before screens pile up.", "today.spaceMicro.nature")
    history = [_row(f"2026-11-{19 + i}", g) for i, g in enumerate(GENERIC)]
    text, _ = select_move_text(
        "borrowed_fuel", history=history, pro=True, day_key="2026-11-25",
        user_key="ref", avoid_texts=[nature[0]], avoid_today_texts=[nature[0]],
        sky_changed=True, concrete=nature,
    )
    assert text != nature[0]
    assert text == GENERIC[0]  # seen longest ago (Nov 19), not yesterday's GENERIC[4]
