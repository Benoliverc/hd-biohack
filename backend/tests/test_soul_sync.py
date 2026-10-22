"""Soul Bio-Sync scoring (AC 3–8, context weights, regulated toggles)."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.hd.channels import active_channels, defined_centers, hanging_gates
from app.hd.soul_sync import (
    classify_channel_roles,
    compute_soul_sync,
    profile_harmony,
)


def _chart(gates: list[int], **meta) -> dict:
    g = set(gates)
    ch = active_channels(g)
    defined = defined_centers(ch)
    all_centers = {
        "Head",
        "Ajna",
        "Throat",
        "G",
        "Heart",
        "Solar_Plexus",
        "Sacral",
        "Spleen",
        "Root",
    }
    base = {
        "activated_gates": sorted(g),
        "channels": ch,
        "defined_centers": sorted(defined),
        "undefined_centers": sorted(all_centers - defined),
        "hanging_gates": hanging_gates(g),
        "type": meta.pop("type", "Generator"),
        "authority": meta.pop("authority", "Sacral"),
        "profile": meta.pop("profile", "3/5"),
    }
    base.update(meta)
    return base


def test_electromagnetic_plus_18_voltage():
    # Channel Emoting 39–55: A holds 39, B holds 55 → EM
    a = _chart([39, 5, 15], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([55, 1, 8], type="Projector", authority="Splenic", profile="1/3")
    roles = classify_channel_roles(set(a["activated_gates"]), set(b["activated_gates"]))
    assert any(c["channel"] == "Emoting" for c in roles["electromagnetic"])
    out = compute_soul_sync(a, b, context="work")
    assert out["vectors"]["voltage"] >= 18
    em = [d for d in out["vectors"]["voltage_drivers"] if d["kind"] == "electromagnetic"]
    assert any(d["pts"] == 18 and d["channel"] == "Emoting" for d in em)
    print("PASS: EM channel → Voltage +18")


def test_split_bridge_plus_15():
    # A has hanging missing completed by B
    a = _chart([26], type="Generator", authority="Sacral", profile="2/4")  # held 26, missing 44 Surrender
    assert any(h["missing"] == 44 for h in a["hanging_gates"])
    b = _chart([44, 10, 20], type="Projector", authority="Splenic", profile="5/1")
    out = compute_soul_sync(a, b, context="work")
    assert any(br["gate"] == 44 for br in out["split_bridges"])
    assert any(
        d["kind"] == "split_bridge" and d["pts"] == 15 and d.get("gate") == 44
        for d in out["vectors"]["voltage_drivers"]
    )
    assert out["vectors"]["voltage"] >= 15
    print("PASS: Split-Bridge → Voltage +15 + callout")


def test_compromise_minus_18_ease():
    # A full channel Rhythm 5–15; B only gate 5 → Compromise
    a = _chart([5, 15], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([5, 64, 47], type="Projector", authority="Splenic", profile="1/3")
    roles = classify_channel_roles(set(a["activated_gates"]), set(b["activated_gates"]))
    assert any(c["channel"] == "Rhythm" for c in roles["compromise"])
    out = compute_soul_sync(a, b, context="work")
    ease_penalties = [
        d for d in out["vectors"]["ease_drivers"] if d["kind"] == "compromise"
    ]
    assert ease_penalties and ease_penalties[0]["pts"] == -18
    # Base 100 − 18 compromise − 10 sacral asymmetry (Gen↔Proj) = 72 (no auth gap: Sacral vs Splenic)
    assert out["vectors"]["ease"] == 72
    print("PASS: Compromise → Ease −18")


def test_authority_gap_and_emotional_wait():
    a = _chart(
        [5, 15],
        type="Generator",
        authority="Sacral",
        profile="3/5",
    )
    b = _chart(
        [36, 22],
        type="Projector",
        authority="Emotional (Solar Plexus)",
        profile="1/3",
    )
    natural = compute_soul_sync(a, b, context="life", protocols=[])
    assert any(d["kind"] == "authority_gap" and d["pts"] == -15 for d in natural["vectors"]["ease_drivers"])
    wait = compute_soul_sync(a, b, context="life", protocols=["emotional_wait"])
    assert wait["regulated_ease"] == natural["vectors"]["ease"] + 10
    assert wait["regulated_fit"] > natural["natural_fit"] or wait["regulated_ease"] > natural["vectors"]["ease"]
    assert any(p["id"] == "emotional_wait" and p["applicable"] for p in natural["available_protocols"])
    print("PASS: Emotional vs Sacral → −15; emotional_wait raises regulated")


def test_nine_zero_badge_and_ease():
    # Force a near-full composite via large gate unions (both charts dense)
    # Build gates that light all 9 centers when combined.
    # Use many full channels across centers.
    gates_a = [
        64, 47,  # Head–Ajna Abstraction
        17, 62,  # Ajna–Throat Acceptance
        7, 31,  # G–Throat Alpha
        21, 45,  # Heart–Throat Money
        5, 15,  # Sacral–G Rhythm
        48, 16,  # Spleen–Throat Wavelength
        58, 18,  # Root–Spleen Judgment
    ]
    gates_b = [
        36, 35,  # Solar_Plexus–Throat Transitoriness (adds SP)
        3, 60,  # Sacral–Root Mutation
        25, 51,  # G–Heart Initiation
    ]
    a = _chart(gates_a, type="Generator", authority="Sacral", profile="3/5")
    b = _chart(gates_b, type="Manifesting Generator", authority="Sacral", profile="3/5")
    out = compute_soul_sync(a, b, context="work")
    assert out["archetype"]["composite_defined_count"] == 9
    assert out["archetype"]["id"] == "closed_loop"
    assert "9-0" in out["archetype"]["label"]
    assert any(d["kind"] == "nine_zero" and d["pts"] == -12 for d in out["vectors"]["ease_drivers"])
    print("PASS: 9-0 badge + Ease −12")


def test_sacral_asymmetry_minus_10():
    a = _chart([5, 15], type="Generator", authority="Sacral", profile="2/4")
    b = _chart([1, 8], type="Projector", authority="Splenic", profile="5/1")
    out = compute_soul_sync(a, b, context="work")
    assert any(d["kind"] == "sacral_asymmetry" and d["pts"] == -10 for d in out["vectors"]["ease_drivers"])
    print("PASS: Gen ↔ Projector → Ease −10")


def test_context_weights_change_fit_not_vectors():
    a = _chart(
        [39, 5, 15, 26],
        type="Generator",
        authority="Sacral",
        profile="3/5",
    )
    b = _chart(
        [55, 44, 1, 8],
        type="Projector",
        authority="Emotional (Solar Plexus)",
        profile="1/3",
    )
    work = compute_soul_sync(a, b, context="work")
    life = compute_soul_sync(a, b, context="life")
    play = compute_soul_sync(a, b, context="play")
    assert work["vectors"]["voltage"] == life["vectors"]["voltage"] == play["vectors"]["voltage"]
    assert work["vectors"]["flow"] == life["vectors"]["flow"] == play["vectors"]["flow"]
    assert work["vectors"]["ease"] == life["vectors"]["ease"] == play["vectors"]["ease"]
    fits = {work["natural_fit"], life["natural_fit"], play["natural_fit"]}
    # With nonzero vectors, at least one lens should differ
    assert len(fits) >= 2 or work["natural_fit"] == life["natural_fit"] == play["natural_fit"] == 0
    # Explicit weight check
    v, f, e = work["vectors"]["voltage"], work["vectors"]["flow"], work["vectors"]["ease"]
    assert work["natural_fit"] == int(round(0.35 * v + 0.45 * f + 0.20 * e))
    assert life["natural_fit"] == int(round(0.25 * v + 0.35 * f + 0.40 * e))
    assert play["natural_fit"] == int(round(0.50 * v + 0.35 * f + 0.15 * e))
    print("PASS: context reweights Fit; vectors unchanged")


def test_conditioning_amplifier_solar_plexus():
    a = _chart([5, 15], type="Generator", authority="Sacral", profile="3/5")
    # B defines Solar_Plexus via Openness 12–22
    b = _chart([12, 22], type="Projector", authority="Emotional (Solar Plexus)", profile="4/6")
    assert "Solar_Plexus" in b["defined_centers"]
    assert "Solar_Plexus" not in a["defined_centers"]
    out = compute_soul_sync(a, b, context="life")
    row = next(r for r in out["conditioning_strip"] if r["center"] == "Solar_Plexus")
    assert row["self"] == "open"
    assert row["friend"] == "defined"
    assert row["direction"] == "friend_to_self"
    assert "Amplifier" in row["hint"]
    print("PASS: open SP ← defined friend → amplifier hint")


def test_profile_harmony_identical_and_harmonic():
    assert profile_harmony("3/5", "3/5") is True
    assert profile_harmony("1/3", "4/6") is True  # personality {1,4}
    assert profile_harmony("2/4", "5/1") is True  # personality {2,5}
    assert profile_harmony("1/3", "6/2") is True  # RA vs LA complementary
    assert profile_harmony("4/1", "6/2") is False  # Juxtaposition no RA/LA bonus
    print("PASS: profile harmony rules")


def test_yield_compromise_and_solo_buffer():
    a = _chart([5, 15], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([5], type="Projector", authority="Splenic", profile="1/3")
    base = compute_soul_sync(a, b, context="work", protocols=[])
    assert any(p["id"] == "yield_compromise" and p["applicable"] for p in base["available_protocols"])
    toggled = compute_soul_sync(a, b, context="work", protocols=["yield_compromise"])
    assert toggled["regulated_ease"] == base["vectors"]["ease"] + 9  # min(18, 9*1)
    print("PASS: yield_compromise restore")


if __name__ == "__main__":
    test_electromagnetic_plus_18_voltage()
    test_split_bridge_plus_15()
    test_compromise_minus_18_ease()
    test_authority_gap_and_emotional_wait()
    test_nine_zero_badge_and_ease()
    test_sacral_asymmetry_minus_10()
    test_context_weights_change_fit_not_vectors()
    test_conditioning_amplifier_solar_plexus()
    test_profile_harmony_identical_and_harmonic()
    test_yield_compromise_and_solo_buffer()
    print("\nAll soul_sync tests passed.")
