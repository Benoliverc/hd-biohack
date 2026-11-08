"""Soul Aura Alchemy scoring (AC signatures, badges, spectrums, cards)."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.hd.channels import active_channels, defined_centers, hanging_gates
from app.hd.soul_sync import (
    BADGE_DESCRIPTIONS,
    MAGNETIC_EM_MIN,
    PLAYBOOK_CARD_ORDER,
    PLAYBOOK_LEDES,
    SIGNATURES,
    build_playbook_lede,
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
    by_id = {s["id"]: s for s in out["spectrums"]}
    assert by_id["auric_charge"]["label"] == "Intensity"
    assert by_id["auric_charge"]["low_label"] == "Calmer"
    assert by_id["auric_charge"]["high_label"] == "High intensity"
    assert by_id["circuit_continuity"]["label"] == "Steadiness"
    assert by_id["circuit_continuity"]["low_label"] == "More separate"
    assert by_id["circuit_continuity"]["high_label"] == "One loop"
    assert by_id["somatic_pacing"]["label"] == "Pace"
    assert by_id["somatic_pacing"]["low_label"] == "Easy pace"
    assert by_id["somatic_pacing"]["high_label"] == "Needs pacing"
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
    # Ledes differ by context; signature/spectrums stay invariant
    assert life["playbook"]["lede"] != work["playbook"]["lede"] != play["playbook"]["lede"]
    assert life["playbook"]["lede"] != play["playbook"]["lede"]
    assert all(out["playbook"].get("lede") for out in (life, work, play))
    print("PASS: playbook reorders cards + varies lede; signature/badges/spectrums invariant")


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
    tenacity = next(blk for blk in power["body_blocks"] if "Purpose & Tenacity" in blk["headline"])
    assert tenacity["body"].startswith("You hold the full Struggle channel")
    assert "What to do:" in tenacity["body"]
    assert "Name who is running the full thermostat before pushing pace" not in tenacity["body"]
    assert len(tenacity["body"].split()) >= 80
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


def test_playbook_card_copy_deepened():
    """Spark & Glue essays + ~2× Wire/Somatic bodies (not bare channel lists)."""
    # Magnetic Intimacy EM pair (≈ Me↔K chemistry)
    a = _chart([6, 5, 15], type="Generator", authority="Emotional", profile="3/5")
    b = _chart([59, 1, 8], type="Projector", authority="Splenic", profile="1/3")
    out = compute_soul_sync(a, b, context="life")
    assert out["signature"]["id"] == "magnetic_alchemy"
    spark = next(c for c in out["cards"] if c["id"] == "spark_glue")
    em_blk = next(blk for blk in spark["body_blocks"] if "Electromagnetic" in blk["headline"])
    # Channel cites preserved AND essay meaning present
    assert "Intimacy" in em_blk["body"] and "6-59" in em_blk["body"]
    assert "Channels:" in em_blk["body"]
    assert len(em_blk["body"].split()) >= 40
    assert any(
        phrase in em_blk["body"].lower()
        for phrase in ("catalytic", "recovery", "spark", "electromagnetic")
    )
    # Dominance gift essay when present
    if any("Dominance" in blk["headline"] for blk in spark["body_blocks"]):
        dom = next(blk for blk in spark["body_blocks"] if "Dominance" in blk["headline"])
        assert "On this pair:" in dom["body"]
        assert len(dom["body"].split()) >= 40

    # Bridge themes (Structuring + Charisma EM)
    a2 = _chart([23, 20, 6], type="Generator", authority="Sacral", profile="3/5")
    b2 = _chart([43, 34, 59], type="Projector", authority="Splenic", profile="1/3")
    wire_out = compute_soul_sync(a2, b2, context="life")
    wire = next(c for c in wire_out["cards"] if c["id"] == "circuit_bridge")
    headlines = {blk["headline"] for blk in wire["body_blocks"]}
    assert "Mental Structuring Bridge" in headlines
    assert "Kinetic Execution Bridge" in headlines
    for blk in wire["body_blocks"]:
        assert len(blk["body"].split()) >= 35, blk["headline"]
        assert "Habit:" in blk["body"]

    # Somatic protocols longer
    a3 = _chart(
        [28, 38, 5, 15],
        type="Generator",
        authority="Emotional (Solar Plexus)",
        profile="6/2",
    )
    b3 = _chart(
        [28, 1, 8],
        type="Projector",
        authority="Emotional (Solar Plexus)",
        profile="5/1",
    )
    soma_out = compute_soul_sync(a3, b3, context="life")
    soma = next(c for c in soma_out["cards"] if c["id"] == "somatic_playbook")
    by_id = {p["id"]: p for p in (soma.get("protocols") or [])}
    assert "sacral_aura_hygiene" in by_id
    assert "profile_resonance" in by_id
    assert "double_emotional" in by_id
    assert len(by_id["sacral_aura_hygiene"]["body"].split()) >= 55
    assert len(by_id["profile_resonance"]["body"].split()) >= 55
    assert len(by_id["double_emotional"]["body"].split()) >= 55
    assert "Habit:" in by_id["sacral_aura_hygiene"]["body"]
    print("PASS: deepened spark_glue / circuit_bridge / somatic_playbook copy")


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



def test_signature_subtexts_long_and_magnetic_highest():
    assert MAGNETIC_EM_MIN == 5
    assert len(SIGNATURES) == 5
    for sig in SIGNATURES:
        words = len(sig["subtext"].split())
        assert words >= 35, f"{sig['id']} subtext too short ({words} words)"
    mag = next(s for s in SIGNATURES if s["id"] == "magnetic_alchemy")
    assert mag.get("tier") == "highest"
    assert mag.get("tier_label")
    a = _chart([6, 5, 15], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([59, 1, 8], type="Projector", authority="Splenic", profile="1/3")
    out = compute_soul_sync(a, b, context="life")
    assert out["signature"]["id"] == "magnetic_alchemy"
    assert out["signature"]["tier"] == "highest"
    assert "highest" in out["signature"]["subtext"].lower()
    print("PASS: signature subtexts ≥35 words; Magnetic tier=highest")


def test_badge_descriptions_present():
    assert set(BADGE_DESCRIPTIONS) == {
        "mutual_split_bridge",
        "shared_compass",
        "intimacy_lock",
        "integration_triad",
        "tribal_bond",
        "mirror_gates",
        "composite_8_1",
        "composite_9_0",
    }
    for bid, desc in BADGE_DESCRIPTIONS.items():
        assert len(desc.split()) >= 20, bid
    # Intimacy fixture emits intimacy_lock with description
    a = _chart([6, 5, 15], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([59, 1, 8], type="Projector", authority="Splenic", profile="1/3")
    out = compute_soul_sync(a, b, context="life")
    for badge in out["badges"]:
        assert badge.get("description"), badge["id"]
        assert len(badge["description"].split()) >= 20
    assert any(b["id"] == "intimacy_lock" for b in out["badges"])
    print("PASS: all 8 badge descriptions; emitted badges carry description")


def test_playbook_ledes_vary_by_signature_and_context():
    # Same signature → 3 distinct context ledes
    mag_ledes = {ctx: build_playbook_lede("magnetic_alchemy", ctx)["lede"] for ctx in ("life", "work", "play")}
    assert len(set(mag_ledes.values())) == 3
    # Different signatures → different life ledes
    life_by_sig = {
        sid: build_playbook_lede(sid, "life")["lede"] for sid in PLAYBOOK_LEDES
    }
    assert len(set(life_by_sig.values())) == 5
    # Wired into compute_soul_sync for diversified fixtures
    fixtures = {
        "magnetic_alchemy": (
            _chart([6, 5, 15], type="Generator", authority="Emotional", profile="3/5"),
            _chart([59, 1, 8], type="Projector", authority="Splenic", profile="1/3"),
        ),
        "integrated_flow": (
            _chart([10, 5, 15], type="Generator", authority="Sacral", profile="3/5"),
            _chart([20, 34, 1, 8], type="Manifesting Generator", authority="Sacral", profile="5/1"),
        ),
        "catalytic_growth": (
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
    life_ledes = {}
    for expected_sig, (a, b) in fixtures.items():
        out = compute_soul_sync(a, b, context="life")
        assert out["signature"]["id"] == expected_sig
        life_ledes[expected_sig] = out["playbook"]["lede"]
        work = compute_soul_sync(a, b, context="work")
        assert work["playbook"]["lede"] != out["playbook"]["lede"]
        assert work["signature"]["id"] == out["signature"]["id"]
    assert len(set(life_ledes.values())) == 3
    # Open-layer match: magnetic life lede + Body-first playbook title
    assert life_ledes["magnetic_alchemy"].startswith("Closeness runs hot here.")
    mag = compute_soul_sync(*fixtures["magnetic_alchemy"], context="life")
    soma = next(c for c in mag["cards"] if c["id"] == "somatic_playbook")
    assert soma["title"] == "Body-first playbook"
    print(f"PASS: playbook ledes vary by signature×context {list(life_ledes)}")


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
    test_playbook_card_copy_deepened()
    test_harmonic_sanctuary_and_profile_harmony_helper()
    test_conditioning_strip_preserved()
    test_signatures_diversify_across_fixtures()
    test_signature_subtexts_long_and_magnetic_highest()
    test_badge_descriptions_present()
    test_playbook_ledes_vary_by_signature_and_context()
    print("\nAll soul_sync Aura Alchemy tests passed.")


def test_partner_overview_generator_projector_exact_copy():
    """Partner role layers Love guidance; Generator+Projector + 59-6 use handoff gold copy."""
    from app.hd.partner_insights import TYPE_LOVE_BANK, partner_overview_for_types

    expected = partner_overview_for_types("Generator", "Projector")
    assert expected is not None
    a = _chart([6, 5, 15], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([59, 1, 8], type="Projector", authority="Splenic", profile="1/3")
    out = compute_soul_sync(
        a,
        b,
        context="life",
        self_meta={"id": 1, "label": "Me", "role": "self"},
        friend_meta={"id": 2, "label": "Sam", "role": "partner"},
    )
    assert out["friend"]["role"] == "partner"
    assert out["self"]["role"] == "self"
    overview = out.get("partner_overview")
    assert overview is not None
    # New Love guidance chapters (exact gold)
    assert overview["hook"] == expected["hook"]
    assert overview["the_current"] == expected["the_current"]
    assert overview["how_you_love"] == TYPE_LOVE_BANK["Generator"]
    assert overview["how_they_love"] == TYPE_LOVE_BANK["Projector"]
    assert overview["what_this_asks"] == expected["what_this_asks"]
    assert overview["tender_spots"] == expected["tender_spots"]
    assert overview["try_this"] == expected["try_this"]
    # Legacy aliases stay populated from the new fields
    assert overview["core_dynamic"] == overview["the_current"]
    assert overview["mutual_growth"] == overview["what_this_asks"]
    assert overview["relationship_challenges"] == overview["tender_spots"]
    # Directional love-language: swap types flips how_you / how_they
    flipped = partner_overview_for_types("Projector", "Generator")
    assert flipped is not None
    assert flipped["how_you_love"] == TYPE_LOVE_BANK["Projector"]
    assert flipped["how_they_love"] == TYPE_LOVE_BANK["Generator"]
    assert flipped["hook"] == expected["hook"]  # pair chapters stay unordered
    # Mechanics unchanged — Intimacy EM still Magnetic Alchemy
    assert out["signature"]["id"] == "magnetic_alchemy"
    assert "intimacy_lock" in _badge_ids(out)
    em = out["channel_roles"]["electromagnetic"]
    intimacy = next(c for c in em if c["channel"] == "Intimacy")
    nuance = intimacy.get("partner_nuance")
    assert nuance is not None
    assert nuance["gift_in_love"] == nuance["romantic_synergy"]
    assert nuance["tender_spot"] == nuance["romantic_friction"]
    assert nuance["gift_in_love"].startswith(
        "When you complete Intimacy together, closeness can feel unusually available"
    )
    assert "space feel like rejection" in nuance["tender_spot"]
    assert "Say the rhythm out loud so neither of you has to guess." in nuance["tender_spot"]
    print("PASS: partner Generator+Projector Love guidance + 59-6 nuance")


def test_non_partner_omits_romantic_layer():
    a = _chart([6, 5, 15], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([59, 1, 8], type="Projector", authority="Splenic", profile="1/3")
    out = compute_soul_sync(
        a,
        b,
        context="life",
        self_meta={"id": 1, "label": "Me", "role": "self"},
        friend_meta={"id": 2, "label": "Sam", "role": "person"},
    )
    assert out["friend"]["role"] == "person"
    assert out.get("partner_overview") is None
    for ch in out["channel_roles"].get("electromagnetic") or []:
        assert "partner_nuance" not in ch
    for ch in out["channel_roles"].get("companionship") or []:
        assert "partner_nuance" not in ch
    # Same mechanics as before
    assert out["signature"]["id"] == "magnetic_alchemy"
    print("PASS: non-partner has no partner_overview / partner_nuance")


def test_partner_layer_default_role_is_person_without_meta():
    a = _chart([5, 15], type="Generator", authority="Sacral", profile="3/5")
    b = _chart([1, 8], type="Projector", authority="Splenic", profile="5/1")
    out = compute_soul_sync(a, b, context="life")
    assert out["friend"]["role"] == "person"
    assert out.get("partner_overview") is None
    print("PASS: missing friend_meta role defaults to person (no romantic layer)")


def test_all_type_pairs_have_partner_overview():
    from app.hd.partner_insights import HD_TYPES, PARTNER_OVERVIEW_BY_TYPES, type_pair_key

    missing = []
    for i, a in enumerate(HD_TYPES):
        for b in HD_TYPES[i:]:
            key = type_pair_key(a, b)
            if key not in PARTNER_OVERVIEW_BY_TYPES:
                missing.append(key)
    assert not missing, f"missing overviews: {missing}"
    print(f"PASS: {len(PARTNER_OVERVIEW_BY_TYPES)} Type×Type partner overviews")


def test_partner_copy_has_no_forbidden_words():
    from app.hd.partner_insights import (
        PARTNER_NUANCE_BY_CHANNEL,
        PARTNER_OVERVIEW_BY_TYPES,
        TYPE_LOVE_BANK,
        partner_overview_for_types,
    )

    banned = (
        "soulmate",
        "twin flame",
        "twin-flame",
        "meant to be",
        "you two are meant",
        "destiny",
        "match meter",
        "compatibility score",
        "compatible",
        "incompatible",
    )
    blobs = []
    for ov in PARTNER_OVERVIEW_BY_TYPES.values():
        blobs.extend(ov.values())
    for nu in PARTNER_NUANCE_BY_CHANNEL.values():
        blobs.extend(nu.values())
    blobs.extend(TYPE_LOVE_BANK.values())
    # Include fully built overviews (aliases + love bank)
    for a in ("Generator", "Projector"):
        built = partner_overview_for_types(a, "Manifestor")
        assert built is not None
        blobs.extend(built.values())
    from app.hd.partner_love_dynamics import all_dynamics_copy_blobs

    blobs.extend(all_dynamics_copy_blobs())
    joined = "\n".join(blobs).lower()
    for word in banned:
        assert word not in joined, f"forbidden phrase in partner copy: {word}"
    # No percentage compatibility scores in partner copy
    import re

    assert not re.search(r"\b\d{2,3}%\b", joined), "partner copy must not include % scores"
    # No leftover textbook cadence
    textbook = (
        "as a couple this often works when",
        "friction often looks like",
        "growth shows up when",
        "as a couple this often shows up as",
        "as a couple this often thrives when",
        "as a couple this works when",
        "usual chafe:",
        "friction clusters around",
    )
    for phrase in textbook:
        assert phrase not in joined, f"textbook cadence leftover: {phrase}"
    # Curly quotes / fancy apostrophes banned in source strings
    fancy = ("\u2018", "\u2019", "\u201c", "\u201d")
    raw_joined = "\n".join(blobs)
    for ch in fancy:
        assert ch not in raw_joined, "curly quotes/apostrophes must not appear in partner copy"
    print("PASS: partner copy has no forbidden romance tropes / textbook cadence")


def test_love_guidance_fields_present_for_all_pairs():
    from app.hd.partner_insights import HD_TYPES, partner_overview_for_types

    required = (
        "hook",
        "the_current",
        "how_you_love",
        "how_they_love",
        "what_this_asks",
        "tender_spots",
        "try_this",
        "core_dynamic",
        "mutual_growth",
        "relationship_challenges",
    )
    for a in HD_TYPES:
        for b in HD_TYPES:
            ov = partner_overview_for_types(a, b)
            assert ov is not None, f"missing overview for {a}|{b}"
            for key in required:
                assert key in ov and isinstance(ov[key], str) and ov[key].strip(), (
                    f"{a}|{b} missing {key}"
                )
            assert ov["core_dynamic"] == ov["the_current"]
            assert ov["mutual_growth"] == ov["what_this_asks"]
            assert ov["relationship_challenges"] == ov["tender_spots"]
    print("PASS: all Type×Type Love guidance fields + aliases present")


def test_nuance_emits_gift_and_tender_aliases():
    from app.hd.partner_insights import PARTNER_NUANCE_BY_CHANNEL

    for key, nu in PARTNER_NUANCE_BY_CHANNEL.items():
        assert "gift_in_love" in nu and "tender_spot" in nu, key
        assert nu["gift_in_love"] == nu["romantic_synergy"], key
        assert nu["tender_spot"] == nu["romantic_friction"], key
        assert "As a couple this often" not in nu["gift_in_love"]
        assert "As a couple this often" not in nu["tender_spot"]
    print(f"PASS: {len(PARTNER_NUANCE_BY_CHANNEL)} channel nuances have gift/tender aliases")


def test_love_dynamics_solar_plexus_gold_and_authorities():
    """Open SP + defined partner → Their emotional weather; reverse; Emotional+Sacral decide."""
    from app.hd.partner_love_dynamics import CENTER_BANK, AUTHORITY_DECIDE_BANK, TYPE_PAIR_CLASH

    gold_open = CENTER_BANK["Solar_Plexus"]["you_open_they_defined"]
    gold_def = CENTER_BANK["Solar_Plexus"]["you_defined_they_open"]
    gold_decide = AUTHORITY_DECIDE_BANK["emotional|sacral"]
    gold_clash = TYPE_PAIR_CLASH["Generator|Projector"]

    # You open Solar_Plexus + Throat; they define both (Synthesis + Structuring).
    a = _chart([5, 15], type="Generator", authority="Emotional (Solar Plexus)", profile="3/5")
    b = _chart([19, 49, 23, 43], type="Projector", authority="Sacral", profile="1/3")
    assert "Solar_Plexus" not in a["defined_centers"]
    assert "Throat" not in a["defined_centers"]
    assert "Solar_Plexus" in b["defined_centers"]
    assert "Throat" in b["defined_centers"]
    out = compute_soul_sync(
        a,
        b,
        context="life",
        self_meta={"id": 1, "label": "Me", "role": "self"},
        friend_meta={"id": 2, "label": "Sam", "role": "partner"},
    )
    ov = out["partner_overview"]
    assert ov is not None
    frictions = ov.get("frictions") or []
    sp = next(i for i in frictions if i["id"] == "center-Solar_Plexus")
    assert sp["title"] == gold_open["title"]
    assert sp["body"] == gold_open["body"]
    assert sp["try"] == gold_open["try"]
    decide = ov["how_you_decide"]
    assert decide["title"] == gold_decide["title"]
    assert decide["body"] == gold_decide["body"]
    assert decide["try"] == gold_decide["try"]
    clash = ov["when_you_clash"]
    assert clash["title"] == gold_clash["title"]
    assert clash["body"].startswith(gold_clash["body"])
    assert (
        "Also remember your decision clocks are different — don't try to settle "
        "the fight on the faster clock."
    ) in clash["body"]
    assert clash["try"] == gold_clash["try"]
    # Throat mismatch try on communicate
    assert "signing a voice that isn't yours" in ov["how_you_communicate"]["try"]
    assert "The Generator loves by engaging what lights them up" in ov["how_you_communicate"]["body"]

    # Reverse centers + authorities (still Emotional|Sacral unordered)
    a2 = _chart([19, 49], type="Generator", authority="Sacral", profile="3/5")
    b2 = _chart([5, 15], type="Projector", authority="Emotional", profile="1/3")
    out2 = compute_soul_sync(
        a2,
        b2,
        context="life",
        self_meta={"id": 1, "label": "Me", "role": "self"},
        friend_meta={"id": 2, "label": "Sam", "role": "partner"},
    )
    ov2 = out2["partner_overview"]
    sp2 = next(i for i in ov2["frictions"] if i["id"] == "center-Solar_Plexus")
    assert sp2["title"] == gold_def["title"]
    assert sp2["body"] == gold_def["body"]
    assert sp2["try"] == gold_def["try"]
    assert ov2["how_you_decide"]["title"] == gold_decide["title"]
    assert ov2["how_you_decide"]["body"] == gold_decide["body"]
    print("PASS: Solar Plexus + Emotional/Sacral + Gen/Proj clash gold")


def test_love_dynamics_absent_for_person_role():
    a = _chart([5, 15], type="Generator", authority="Emotional", profile="3/5")
    b = _chart([19, 49], type="Projector", authority="Sacral", profile="1/3")
    out = compute_soul_sync(
        a,
        b,
        context="life",
        self_meta={"id": 1, "label": "Me", "role": "self"},
        friend_meta={"id": 2, "label": "Sam", "role": "person"},
    )
    assert out.get("partner_overview") is None
    print("PASS: person role omits love dynamics layer")


def test_love_dynamics_copy_has_no_forbidden_words():
    from app.hd.partner_love_dynamics import all_dynamics_copy_blobs

    banned = (
        "soulmate",
        "twin flame",
        "twin-flame",
        "meant to be",
        "destiny",
        "compatible",
        "incompatible",
        "compatibility score",
        "match meter",
    )
    joined = "\n".join(all_dynamics_copy_blobs()).lower()
    for word in banned:
        assert word not in joined, f"forbidden in dynamics: {word}"
    fancy = ("\u2018", "\u2019", "\u201c", "\u201d")
    raw = "\n".join(all_dynamics_copy_blobs())
    for ch in fancy:
        assert ch not in raw, "curly quotes in dynamics copy"
    # Cap sanity: banks complete
    from app.hd.partner_love_dynamics import (
        CENTER_BANK,
        AUTHORITY_DECIDE_BANK,
        TYPE_PAIR_COMMUNICATE,
        TYPE_PAIR_CLASH,
    )

    assert len(CENTER_BANK) == 9
    assert all(len(v) == 4 for v in CENTER_BANK.values())
    assert len(AUTHORITY_DECIDE_BANK) == 28
    assert len(TYPE_PAIR_COMMUNICATE) == 15
    assert len(TYPE_PAIR_CLASH) == 15
    print("PASS: dynamics banks complete + no forbidden words")


def test_love_dynamics_both_defined_solar_plexus_harmony():
    from app.hd.partner_love_dynamics import CENTER_BANK

    gold = CENTER_BANK["Solar_Plexus"]["both_defined"]
    # Both have Solar_Plexus via Community / Openness
    a = _chart([37, 40], type="Generator", authority="Emotional", profile="3/5")
    b = _chart([12, 22], type="Projector", authority="Emotional", profile="5/1")
    assert "Solar_Plexus" in a["defined_centers"] and "Solar_Plexus" in b["defined_centers"]
    out = compute_soul_sync(
        a,
        b,
        context="life",
        self_meta={"id": 1, "label": "Me", "role": "self"},
        friend_meta={"id": 2, "label": "Pat", "role": "partner"},
    )
    harmonies = out["partner_overview"]["harmonies"]
    sp = next(i for i in harmonies if i["id"] == "center-Solar_Plexus")
    assert sp["title"] == gold["title"]
    assert sp["body"] == gold["body"]
    assert sp["try"] == gold["try"]
    # shared authority class → shared-authority harmony
    assert any(i["id"] == "shared-authority" for i in harmonies)
    print("PASS: both_defined Solar Plexus harmony + shared authority")
