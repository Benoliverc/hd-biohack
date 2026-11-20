"""Day 2 afternoon leftovers: Protocols DO follows natal authority."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.biohack.rules import build_protocol
from app.checkin import derive_today_indication


def _natal(**kwargs):
    base = {
        "type": "Manifesting Generator",
        "strategy": "To Respond then inform",
        "authority": "Sacral",
        "defined_centers": ["Sacral", "Root", "Throat", "G"],
        "undefined_centers": ["Head", "Ajna", "Heart", "Solar_Plexus", "Spleen"],
        "activated_gates": [5, 14, 34, 20],
        "hanging_gates": [],
        "channels": [],
    }
    base.update(kwargs)
    return base


def _do_list(natal, overlay=None):
    overlay = overlay or {"newly_defined_centers": [], "bridged_channels": []}
    indication = derive_today_indication(natal, {}, overlay)
    proto = build_protocol(
        natal,
        overlay,
        ["Omega-3", "Magnesium Glycinate"],
        indication=indication,
        transit={},
    )
    return list(proto["daily_plan"]["do"])


def test_emotional_mg_protocols_do_has_no_sacral_yes():
    natal = _natal(
        authority="Emotional (Solar Plexus)",
        defined_centers=["Sacral", "Solar_Plexus", "Throat", "G"],
        undefined_centers=["Head", "Ajna", "Heart", "Root", "Spleen"],
    )
    do = _do_list(natal)
    joined = " ".join(do)
    assert "Sacral yes" not in joined, do
    assert any(
        "clear yes after the feelings have moved" in line for line in do
    ), do
    print("PASS: Emotional MG Protocols DO has no Sacral yes")


def test_sacral_mg_protocols_do_keeps_sacral_yes():
    do = _do_list(_natal(authority="Sacral"))
    joined = " ".join(do)
    assert "Sacral yes" in joined, do
    print("PASS: Sacral MG Protocols DO keeps Sacral yes")


def test_splenic_generator_protocols_do_has_no_sacral_yes():
    natal = _natal(
        type="Generator",
        strategy="To Respond",
        authority="Splenic",
        defined_centers=["Sacral", "Spleen", "Throat"],
        undefined_centers=["Head", "Ajna", "Heart", "Root", "Solar_Plexus", "G"],
    )
    do = _do_list(natal)
    joined = " ".join(do)
    assert "Sacral yes" not in joined, do
    assert any("clear yes" in line for line in do), do
    print("PASS: Splenic Generator Protocols DO has no Sacral yes")


if __name__ == "__main__":
    test_emotional_mg_protocols_do_has_no_sacral_yes()
    test_sacral_mg_protocols_do_keeps_sacral_yes()
    test_splenic_generator_protocols_do_has_no_sacral_yes()
    print("ALL day2 afternoon leftover backend tests passed")
