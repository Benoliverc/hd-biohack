"""Day 7 five fixes: Move headline selection (no reprint, no cross-person rotation)."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.checkin.prescription import MOMENT_MOVES, _cap_words, _norm_move_text, select_move_text

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


def test_unchanged_sky_picks_catalog_line_not_yesterdays_headline():
    """Unchanged sky picks an existing catalog line, never yesterday's served headline."""
    history = [_row("2026-11-23", GENERIC[0]), _row("2026-11-24", GENERIC[1])]
    text, key = select_move_text(
        "borrowed_fuel", history=history, pro=True, day_key="2026-11-25",
        user_key="person-unchanged", sky_changed=False, concrete=CONCRETE,
    )
    assert text in GENERIC
    assert text != GENERIC[1]
    assert text != CONCRETE[0]
    assert key.startswith("today.move.moment.borrowed_fuel.")


def test_unchanged_sky_does_not_repeat_yesterdays_concrete_line():
    nature = ("Walk outdoors briefly before screens pile up.", "today.spaceMicro.nature")
    history = [_row("2026-11-24", nature[0])]
    text, key = select_move_text(
        "borrowed_fuel", history=history, pro=True, day_key="2026-11-25",
        user_key="person-quiet", sky_changed=False, concrete=nature,
    )
    assert text in GENERIC
    assert _norm_move_text(text) != _norm_move_text(nature[0])
    assert key.startswith("today.move.moment.borrowed_fuel.")


def test_new_day_never_repeats_most_recent_served_headline():
    yesterday = GENERIC[2]
    history = [_row("2026-11-24", yesterday)]
    for changed in (True, False):
        text, _ = select_move_text(
            "borrowed_fuel", history=history, pro=True, day_key="2026-11-25",
            user_key="person-either-sky", sky_changed=changed, concrete=CONCRETE,
        )
        assert _norm_move_text(text) != _norm_move_text(yesterday)


def test_day10_nature_micro_was_yesterday_sky_changed_move_is_not_that_micro():
    """Nature Space micro was yesterday's label; the sky moved; Move is another catalog line."""
    nature = ("Walk outdoors briefly before screens pile up.", "today.spaceMicro.nature")
    quiet = [_cap_words(t) for t in MOMENT_MOVES["quiet_sky"]]
    history = [_row("2026-11-27", nature[0], moment="quiet_sky")]
    text, key = select_move_text(
        "quiet_sky", history=history, pro=True, day_key="2026-11-28",
        user_key="person-day10", sky_changed=True, concrete=nature,
    )
    assert _norm_move_text(text) != _norm_move_text(nature[0])
    assert text in quiet
    assert key.startswith("today.move.moment.quiet_sky.")


def test_same_day_reload_keeps_served_headline_when_sky_unchanged():
    history = [_row("2026-11-25", GENERIC[1])]
    text, _ = select_move_text(
        "borrowed_fuel", history=history, pro=True, day_key="2026-11-25",
        user_key="person-reload", sky_changed=False, concrete=CONCRETE,
    )
    assert text == GENERIC[1]


def test_yesterday_match_uses_norm_move_text():
    raw = GENERIC[1].lower()
    history = [_row("2026-11-24", raw)]
    for changed in (False, True):
        text, _ = select_move_text(
            "borrowed_fuel", history=history, pro=True, day_key="2026-11-25",
            user_key="person-norm", sky_changed=changed, concrete=CONCRETE,
        )
        assert _norm_move_text(text) != _norm_move_text(raw)


def test_two_people_may_share_their_accurate_concrete_action():
    nature = ("Walk outdoors briefly before screens pile up.", "today.spaceMicro.nature")
    a, _ = select_move_text("borrowed_fuel", history=[], pro=True, day_key="2026-11-25",
                            user_key="jules", sky_changed=True, concrete=nature)
    b, _ = select_move_text("borrowed_fuel", history=[], pro=True, day_key="2026-11-25",
                            user_key="ren", avoid_texts=[a], avoid_today_texts=[a],
                            sky_changed=True, concrete=nature)
    assert a == b == nature[0]


def test_all_lines_seen_by_others_takes_oldest_seen():
    nature = ("Walk outdoors briefly before screens pile up.", "today.spaceMicro.nature")
    # Concrete was yesterday's headline, so a generic line is needed; all were seen by others.
    history = [_row("2026-11-24", nature[0])]
    others = [GENERIC[1], GENERIC[0], GENERIC[2], GENERIC[3], GENERIC[4], nature[0]]
    text, _ = select_move_text("borrowed_fuel", history=history, pro=True, day_key="2026-11-25",
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


def test_concrete_action_leads_even_when_another_account_has_it_today():
    # Ref has had every moment line this week; Walk outdoors is also someone else's headline
    # today. Ref's own accurate action still leads: no own generic reprint while it exists.
    nature = ("Walk outdoors briefly before screens pile up.", "today.spaceMicro.nature")
    history = [_row(f"2026-11-{19 + i}", g) for i, g in enumerate(GENERIC)]
    text, key = select_move_text(
        "borrowed_fuel", history=history, pro=True, day_key="2026-11-25",
        user_key="ref", avoid_texts=[nature[0]], avoid_today_texts=[nature[0]],
        sky_changed=True, concrete=nature,
    )
    assert (text, key) == nature
    assert text not in GENERIC
