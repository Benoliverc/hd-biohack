"""Day 5 top-5: Move selection (no reprint / no cross-account collision) and Soul grammar."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.checkin.prescription import (
    MOMENT_MOVES,
    _cap_words,
    prior_move_texts,
    select_move_text,
    sky_changed_from_payload,
)
from app.checkin.rules import MAIN_ACTION_MAX_WORDS, _word_count
from app.hd.soul_sync import hold_verb, possess_channel


def test_sky_changed_from_payload():
    assert sky_changed_from_payload({"vs_yesterday": [{"field": "moon", "from": "42.3", "to": "24.1"}]})
    assert not sky_changed_from_payload({"vs_yesterday": [{"field": "energy", "from": "3", "to": "4"}]})
    assert sky_changed_from_payload({"daily_signal": {"source": "moon_gate", "quiet": False}})
    assert not sky_changed_from_payload({"daily_signal": {"source": "continuity", "quiet": True}})


def test_user_salt_avoids_systematic_cross_account_collision():
    """Without a user salt, every Pro account on the same day+moment collides."""
    unsalted_a, _ = select_move_text(
        "borrowed_fuel", history=None, pro=True, day_key="2026-11-23"
    )
    unsalted_b, _ = select_move_text(
        "borrowed_fuel", history=None, pro=True, day_key="2026-11-23"
    )
    assert unsalted_a == unsalted_b

    salted = [
        select_move_text(
            "borrowed_fuel",
            history=None,
            pro=True,
            day_key="2026-11-23",
            user_key=key,
            sky_changed=True,
        )[0]
        for key in ("11", "22", "33", "44")
    ]
    # Salt must not collapse every account onto the unsalted line.
    assert len(set(salted)) > 1, salted
    assert set(salted) != {unsalted_a}


def test_no_reprint_of_earlier_day_when_sky_changed():
    earlier = _cap_words(MOMENT_MOVES["borrowed_fuel"][0])
    text, key = select_move_text(
        "borrowed_fuel",
        history=[
            {
                "item_id": "today-move:borrowed_fuel",
                "done": False,
                "day": "2026-11-20",
                "label": earlier,
            }
        ],
        pro=True,
        day_key="2026-11-23",
        user_key="maya",
        sky_changed=True,
    )
    assert text != earlier
    assert "borrowed_fuel" in key


def test_avoids_other_account_sentence_today_when_sky_changed():
    used = [_cap_words(line) for line in MOMENT_MOVES["surplus"][:4]]
    text, _ = select_move_text(
        "surplus",
        history=None,
        pro=True,
        day_key="2026-11-23",
        user_key="ren",
        avoid_texts=used,
        sky_changed=True,
    )
    assert text not in used
    assert text == _cap_words(MOMENT_MOVES["surplus"][4])


def test_legacy_path_without_user_key_unchanged_for_free():
    text, key = select_move_text(
        "borrowed_fuel",
        history=None,
        pro=False,
        day_key="2026-11-23",
    )
    assert text == _cap_words(MOMENT_MOVES["borrowed_fuel"][0])
    assert key.endswith(".0")


def test_prior_move_texts_skips_today():
    rows = [
        {"item_id": "today-move:surplus", "day": "2026-11-22", "label": "Walk yesterday."},
        {"item_id": "today-move:surplus", "day": "2026-11-23", "label": "Walk today."},
        {"item_id": "today-kit:x", "day": "2026-11-21", "label": "Not a move."},
    ]
    assert prior_move_texts(rows, "2026-11-23") == ["Walk yesterday."]


def test_hold_verb_and_they_only_hold():
    assert hold_verb("they") == "hold"
    assert hold_verb("They") == "hold"
    assert hold_verb("you") == "hold"
    assert hold_verb("Jules") == "holds"
    assert hold_verb("Priya") == "holds"
    line = f"{'they'} only {hold_verb('they')} a hanging gate"
    assert line == "they only hold a hanging gate"
    assert "they only holds" not in line


def test_possess_channel_drops_the():
    assert possess_channel("Your", "The Money Line") == "Your Money Line"
    assert possess_channel("Their", "The Money Line") == "Their Money Line"
    assert possess_channel("Your", "Concentration") == "Your Concentration"


def test_word_cap_still_applies_to_selected_moves():
    for moment, options in MOMENT_MOVES.items():
        for i, _opt in enumerate(options):
            text, _ = select_move_text(
                moment,
                history=None,
                pro=True,
                day_key="2026-11-23",
                user_key=str(i + 1),
                sky_changed=True,
            )
            assert _word_count(text) <= MAIN_ACTION_MAX_WORDS, (moment, text)


if __name__ == "__main__":
    test_sky_changed_from_payload()
    test_user_salt_avoids_systematic_cross_account_collision()
    test_no_reprint_of_earlier_day_when_sky_changed()
    test_avoids_other_account_sentence_today_when_sky_changed()
    test_legacy_path_without_user_key_unchanged_for_free()
    test_prior_move_texts_skips_today()
    test_hold_verb_and_they_only_hold()
    test_possess_channel_drops_the()
    test_word_cap_still_applies_to_selected_moves()
    print("PASS: test_day5_top5_fixes")
