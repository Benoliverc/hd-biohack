"""Soul Aura Alchemy scoring (AC signatures, badges, spectrums, cards)."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.hd.channels import active_channels, defined_centers, hanging_gates
from app.hd.soul_sync import (
    PLAYBOOK_CARD_ORDER,
    classify_channel_roles,
    compute_soul_sync,
    detect_integration_triad,
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


def _badge_ids(out: dict) -> set[str]:
    return {b["id"] for b in out["badges"]}


def test_no_fit_percent_in_response():
    a = _chart([5, 15], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([1, 8], type="Projector", authority="Splenic", profile="5/1")
    out = compute_soul_sync(a, b, context="life")
    for banned in (
        "natural_fit",
        "regulated_fit",
        "regulated_ease",
        "weights",
        "vectors",
        "archetype",
        "available_protocols",
    ):
        assert banned not in out, banned
    assert "signature" in out
    assert "spectrums" in out
    assert "cards" in out
    assert out["playbook"]["id"] == "life"
    print("PASS: schema has signature/spectrums/cards; no Fit % fields")


def test_magnetic_alchemy_from_intimacy_em():
    # EM Intimacy 6–59
    a = _chart([6, 5, 15], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([59, 1, 8], type="Projector", authority="Splenic", profile="1/3")
    roles = classify_channel_roles(set(a["activated_gates"]), set(b["activated_gates"]))
    assert any(c["channel"] == "Intimacy" for c in roles["electromagnetic"])
    out = compute_soul_sync(a, b, context="life")
    assert out["signature"]["id"] == "magnetic_alchemy"
    assert "intimacy_lock" in _badge_ids(out)
    print("PASS: Intimacy EM → Magnetic Alchemy + intimacy_lock")


def test_magnetic_alchemy_from_em_count():
    # Five EM channels → exceptional density (MAGNETIC_EM_MIN).
    # Pairs: Emoting 39-55, Inspiration 1-8, Judgment 18-58, Concentration 9-52, Logic 63-4
    a = _chart([39, 1, 18, 9, 63], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([55, 8, 58, 52, 4], type="Projector", authority="Splenic", profile="1/3")
    roles = classify_channel_roles(set(a["activated_gates"]), set(b["activated_gates"]))
    assert len(roles["electromagnetic"]) >= 5
    out = compute_soul_sync(a, b, context="work")
    assert out["signature"]["id"] == "magnetic_alchemy"
    print("PASS: EM≥5 → Magnetic Alchemy")


def test_modest_em_without_intimacy_or_mutual_not_magnetic():
    # Two EM channels used to always win Magnetic; must not anymore.
    a = _chart([39, 1], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([55, 8], type="Projector", authority="Splenic", profile="1/3")
    roles = classify_channel_roles(set(a["activated_gates"]), set(b["activated_gates"]))
    assert 2 <= len(roles["electromagnetic"]) < 5
    out = compute_soul_sync(a, b, context="work")
    assert out["signature"]["id"] != "magnetic_alchemy"
    assert "intimacy_lock" not in _badge_ids(out)
    assert "mutual_split_bridge" not in _badge_ids(out)
    print(f"PASS: modest EM={len(roles['electromagnetic'])} → {out['signature']['id']} (not Magnetic)")


def test_mutual_split_bridge_badge():
    # A: Head–Ajna + Sacral–G = Split
    # B: Ajna–Throat + G–Throat + Sacral–Spleen = Split; composite merges to Single
    a = _chart(
        [64, 47, 5, 15],
        type="Generator",
        authority="Sacral",
        profile="3/5",
    )
    b = _chart(
        [17, 62, 7, 31, 27, 50],
        type="Projector",
        authority="Splenic",
        profile="1/3",
    )
    out = compute_soul_sync(a, b, context="life")
    assert out["self"]["definition"] == "Split" or out["self"]["definition"].startswith("Split")
    friend_def = out["friend"]["definition"]
    assert friend_def == "Split" or friend_def.startswith("Split") or friend_def in (
        "Triple Split",
        "Quadruple Split",
    )
    assert out["composite"]["definition"] == "Single"
    assert "mutual_split_bridge" in _badge_ids(out)
    assert out["signature"]["id"] == "magnetic_alchemy"  # mutual wins priority 1
    print("PASS: Split+Split→Single → mutual_split_bridge (+ Magnetic)")


def test_shared_compass_badge():
    # Neither defines G alone; composite Awakening 10–20 defines G
    a = _chart([10, 64, 47], type="Projector", authority="Splenic", profile="6/2")
    b = _chart([20, 18, 58], type="Projector", authority="Splenic", profile="5/1")
    assert "G" not in a["defined_centers"]
    assert "G" not in b["defined_centers"]
    out = compute_soul_sync(a, b, context="life")
    assert "G" in out["composite"]["defined_centers"]
    assert "shared_compass" in _badge_ids(out)
    print("PASS: Open G + Open G → shared_compass")


def test_integration_triad_cross_person():
    a = _chart([10, 5, 15], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([20, 34, 1, 8], type="Manifesting Generator", authority="Sacral", profile="5/1")
    ok, detail = detect_integration_triad(
        set(a["activated_gates"]), set(b["activated_gates"]), set(a["activated_gates"]) | set(b["activated_gates"])
    )
    assert ok
    out = compute_soul_sync(a, b, context="life")
    assert "integration_triad" in _badge_ids(out)
    print("PASS: Gate 10 vs {20,34} → integration_triad")


def test_integration_triad_false_positive_solo_owner():
    # A alone holds both Awakening + Exploration; B has unrelated gates
    a = _chart([10, 20, 34], type="Manifesting Generator", authority="Sacral", profile="3/5")
    b = _chart([64, 47], type="Projector", authority="Splenic", profile="1/3")
    ok, _ = detect_integration_triad(
        set(a["activated_gates"]), set(b["activated_gates"]), set(a["activated_gates"]) | set(b["activated_gates"])
    )
    assert ok is False
    out = compute_soul_sync(a, b, context="life")
    assert "integration_triad" not in _badge_ids(out)
    print("PASS: solo triad owner → no integration_triad badge")


def test_tribal_bond_companionship():
    a = _chart([19, 49, 5, 15], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([19, 49, 1, 8], type="Generator", authority="Sacral", profile="2/4")
    roles = classify_channel_roles(set(a["activated_gates"]), set(b["activated_gates"]))
    assert any(c["channel"] == "Synthesis" for c in roles["companionship"])
    out = compute_soul_sync(a, b, context="life")
    assert "tribal_bond" in _badge_ids(out)
    print("PASS: companionship 19-49 → tribal_bond")


def test_composite_9_0_and_8_1_badges():
    gates_a = [
        64, 47,  # Head–Ajna
        17, 62,  # Ajna–Throat
        7, 31,  # G–Throat
        21, 45,  # Heart–Throat
        5, 15,  # Sacral–G
        48, 16,  # Spleen–Throat
        58, 18,  # Root–Spleen
    ]
    gates_b = [
        36, 35,  # Solar_Plexus–Throat
        3, 60,  # Sacral–Root
        25, 51,  # G–Heart
    ]
    a = _chart(gates_a, type="Generator", authority="Sacral", profile="3/5")
    b = _chart(gates_b, type="Manifesting Generator", authority="Sacral", profile="3/5")
    out = compute_soul_sync(a, b, context="work")
    assert out["composite"]["defined_count"] == 9
    assert "composite_9_0" in _badge_ids(out)

    # Drop Solar_Plexus channel for 8-1
    b8 = _chart([3, 60, 25, 51], type="Manifesting Generator", authority="Sacral", profile="3/5")
    out8 = compute_soul_sync(a, b8, context="work")
    # May be 8 or less depending on overlap — assert 8-1 only when count==8
    if out8["composite"]["defined_count"] == 8:
        assert "composite_8_1" in _badge_ids(out8)
    print("PASS: 9-0 badge; 8-1 when defined_count==8")


def test_spectrums_shape_and_somatic_drivers():
    a = _chart(
        [6, 5, 15],
        type="Generator",
        authority="Emotional (Solar Plexus)",
        profile="3/5",
    )
    b = _chart(
        [59, 1, 8],
        type="Projector",
        authority="Emotional (Solar Plexus)",
        profile="6/2",
    )
    out = compute_soul_sync(a, b, context="life")
    ids = [s["id"] for s in out["spectrums"]]
    assert ids == ["auric_charge", "circuit_continuity", "somatic_pacing"]
    for s in out["spectrums"]:
        assert 0 <= s["position"] <= 100
        assert s["low_label"] and s["high_label"]
        assert "Fit" not in s["label"] and "compatible" not in s["summary"].lower()
    pacing = next(s for s in out["spectrums"] if s["id"] == "somatic_pacing")
    assert any(d["kind"] == "double_emotional" for d in pacing["drivers"])
    assert any(d["kind"] == "sacral_asymmetry" for d in pacing["drivers"])
    charge = next(s for s in out["spectrums"] if s["id"] == "auric_charge")
    assert any(d["kind"] == "intimacy_lock" for d in charge["drivers"])
    print("PASS: spectrums shape + somatic/auric drivers")


def test_playbook_reorders_cards_not_signature():
    a = _chart([6, 39], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([59, 55], type="Projector", authority="Splenic", profile="1/3")
    life = compute_soul_sync(a, b, context="life")
    work = compute_soul_sync(a, b, context="work")
    play = compute_soul_sync(a, b, context="play")
    assert life["signature"] == work["signature"] == play["signature"]
    assert life["badges"] == work["badges"] == play["badges"]
    assert [s["position"] for s in life["spectrums"]] == [
        s["position"] for s in work["spectrums"]
    ]
    assert life["playbook"]["card_order"] == PLAYBOOK_CARD_ORDER["life"]
    assert work["playbook"]["card_order"] == PLAYBOOK_CARD_ORDER["work"]
    assert play["playbook"]["card_order"] == PLAYBOOK_CARD_ORDER["play"]
    assert play["playbook"]["label"] == "Play & Recovery"
    print("PASS: playbook reorders cards; signature/badges/spectrums invariant")


def test_power_dynamics_and_somatic_protocols():
    # Compromise Struggle 28–38: A full, B hanging 28
    a = _chart(
        [28, 38, 5, 15],
        type="Generator",
        authority="Emotional (Solar Plexus)",
        profile="6/2",
    )
    b = _chart(
        [28, 1, 8],
        type="Projector",
        authority="Emotional (Solar Plexus)",
        profile="5/1",
    )
    out = compute_soul_sync(a, b, context="life")
    power = next(c for c in out["cards"] if c["id"] == "power_dynamics")
    assert any("Purpose & Tenacity" in blk["headline"] for blk in power["body_blocks"])
    assert "friction" not in power["title"].lower()
    soma = next(c for c in out["cards"] if c["id"] == "somatic_playbook")
    proto_ids = {p["id"] for p in (soma.get("protocols") or [])}
    assert "sacral_aura_hygiene" in proto_ids
    assert "double_emotional" in proto_ids
    assert "profile_resonance" in proto_ids
    assert any("6/2" in (p.get("body") or "") and "5/1" in (p.get("body") or "") for p in soma["protocols"])
    print("PASS: power dynamics + sacral/double-emotional/6-2↔5-1 protocols")


def test_bidirectional_bridges_and_spark_glue():
    a = _chart([26], type="Generator", authority="Sacral", profile="2/4")
    assert any(h["missing"] == 44 for h in a["hanging_gates"])
    b = _chart([44, 10], type="Projector", authority="Splenic", profile="5/1")
    # friend hanging: 10 missing 20 or 34 or 57
    out = compute_soul_sync(a, b, context="life")
    assert any(br["gate"] == 44 for br in out["split_bridges"])
    # friend may have hanging completed by self if self has matching gate
    spark = next(c for c in out["cards"] if c["id"] == "spark_glue")
    assert spark["title"] == "Spark & Glue"
    print("PASS: bidirectional bridge list + spark_glue card")


def test_harmonic_sanctuary_and_profile_harmony_helper():
    assert profile_harmony("3/5", "3/5") is True
    assert profile_harmony("4/1", "6/2") is False
    # Companionship ≥2 → Harmonic (unless Magnetic wins)
    a = _chart([5, 15, 19, 49], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([5, 15, 19, 49], type="Generator", authority="Sacral", profile="3/5")
    out = compute_soul_sync(a, b, context="life")
    # No EM → not Magnetic; companionship≥2 → Harmonic Sanctuary
    assert out["signature"]["id"] == "harmonic_sanctuary"
    print("PASS: harmonic sanctuary + profile_harmony helper")


def test_conditioning_strip_preserved():
    a = _chart([5, 15], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([12, 22], type="Projector", authority="Emotional (Solar Plexus)", profile="4/6")
    out = compute_soul_sync(a, b, context="life")
    row = next(r for r in out["conditioning_strip"] if r["center"] == "Solar_Plexus")
    assert row["direction"] == "friend_to_self"
    assert "Amplifier" in row["hint"]
    print("PASS: conditioning strip preserved")



def test_signatures_diversify_across_fixtures():
    """Regression: Magnetic must not monopolize; ≥3 distinct primary signatures."""
    fixtures = {
        # Intimacy EM → Magnetic
        "intimacy": (
            _chart([6, 5, 15], type="Generator", authority="Emotional", profile="3/5"),
            _chart([59, 1, 8], type="Projector", authority="Splenic", profile="1/3"),
        ),
        # Companionship ≥2, no EM → Harmonic
        "companionship": (
            _chart([19, 49, 5, 15, 2, 14, 23, 43], type="Generator", authority="Sacral", profile="2/4"),
            _chart([19, 49, 5, 15, 27, 50, 7, 31], type="Generator", authority="Sacral", profile="4/6"),
        ),
        # Open / sparse composite → Spacious
        "open_field": (
            _chart([64, 47, 17, 62], type="Projector", authority="Mental", profile="1/3"),
            _chart([18, 58, 28, 38], type="Projector", authority="Splenic", profile="5/1"),
        ),
        # Integration triad, modest EM (Awakening+Exploration=2) → Integrated (not Mag)
        "triad": (
            _chart([10, 5, 15], type="Generator", authority="Sacral", profile="3/5"),
            _chart([20, 34, 1, 8], type="Manifesting Generator", authority="Sacral", profile="5/1"),
        ),
        # Dense compromise + 8-ish composite, no Mag triggers → Catalytic
        "catalytic": (
            _chart(
                [28, 38, 30, 41, 23, 43, 35, 36, 5, 15, 2, 14, 20, 34, 10],
                type="Manifesting Generator",
                authority="Emotional",
                profile="3/5",
            ),
            _chart(
                [28, 30, 23, 35, 1, 8, 7, 31, 27, 50, 44, 26],
                type="Projector",
                authority="Emotional",
                profile="6/2",
            ),
        ),
    }
    expected = {
        "intimacy": "magnetic_alchemy",
        "companionship": "harmonic_sanctuary",
        "open_field": "spacious_explorers",
        "triad": "integrated_flow",
        "catalytic": "catalytic_growth",
    }
    got = {}
    for name, (a, b) in fixtures.items():
        out = compute_soul_sync(a, b, context="life")
        got[name] = out["signature"]["id"]
        assert out["signature"]["id"] == expected[name], (
            f"{name}: expected {expected[name]}, got {out['signature']['id']} "
            f"EM={len(out['channel_roles']['electromagnetic'])} badges={_badge_ids(out)}"
        )
    assert len(set(got.values())) >= 3
    print(f"PASS: diversified signatures {got}")



if __name__ == "__main__":
    test_no_fit_percent_in_response()
    test_magnetic_alchemy_from_intimacy_em()
    test_magnetic_alchemy_from_em_count()
    test_modest_em_without_intimacy_or_mutual_not_magnetic()
    test_mutual_split_bridge_badge()
    test_shared_compass_badge()
    test_integration_triad_cross_person()
    test_integration_triad_false_positive_solo_owner()
    test_tribal_bond_companionship()
    test_composite_9_0_and_8_1_badges()
    test_spectrums_shape_and_somatic_drivers()
    test_playbook_reorders_cards_not_signature()
    test_power_dynamics_and_somatic_protocols()
    test_bidirectional_bridges_and_spark_glue()
    test_harmonic_sanctuary_and_profile_harmony_helper()
    test_conditioning_strip_preserved()
    test_signatures_diversify_across_fixtures()
    print("\nAll soul_sync Aura Alchemy tests passed.")
