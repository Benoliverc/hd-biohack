"""Named Soul partner copy — first names at apply time, gold nameless path unchanged."""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.hd.channels import active_channels, defined_centers, hanging_gates
from app.hd.partner_insights import TYPE_LOVE_BANK, partner_overview_for_types
from app.hd.partner_names import first_name_from_label, how_they_love_for_type, personalize_type_prose
from app.hd.soul_sync import compute_soul_sync

_TYPE_PERSON_RE = re.compile(
    r"\bthe (Manifesting Generator|MG|Manifestor|Projector|Reflector|Generator)\b",
    re.IGNORECASE,
)
_TYPE_COLON_RE = re.compile(
    r"(^|[\n.;:!?]\s+|\s)(Manifesting Generator|MG|Manifestor|Projector|Reflector|Generator):"
)
_YOU_AGREEMENT_SLIPS = re.compile(
    r"\byou (loves|wants|needs|waits|answers|informs|holds|protects|"
    r"invites|asks|treats|mirrors|pushes|processes|tracks|moves|returns|"
    r"reports|names|guides|offers|practices|works|follows|gets|joins|"
    r"speaks|changes|runs|leaps)\b",
    re.IGNORECASE,
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


def _sync(type_a: str, type_b: str, *, label_b: str, label_a: str = "Me", role: str = "partner"):
    a = _chart([5, 15], type=type_a, authority="Sacral", profile="3/5")
    b = _chart([1, 8], type=type_b, authority="Splenic", profile="5/1")
    return compute_soul_sync(
        a,
        b,
        context="life",
        self_meta={"id": 1, "label": label_a, "role": "self", "type": type_a},
        friend_meta={"id": 2, "label": label_b, "role": role, "type": type_b},
    )


def _flatten(obj) -> str:
    if isinstance(obj, str):
        return obj
    if isinstance(obj, list):
        return "\n".join(_flatten(x) for x in obj)
    if isinstance(obj, dict):
        return "\n".join(_flatten(v) for v in obj.values())
    return ""


def test_first_name_from_label_matches_frontend_rule():
    assert first_name_from_label("Sarah Chen") == "Sarah"
    assert first_name_from_label("Sam") == "Sam"
    assert first_name_from_label("  Pat  ") == "Pat"
    for reserved in ("Friend", "Partner", "Person", "Me", "friend", "PARTNER", "person", "me"):
        assert first_name_from_label(reserved) is None, reserved
    assert first_name_from_label("") is None
    assert first_name_from_label(None) is None
    assert first_name_from_label("   ") is None


def test_nameless_role_labels_keep_gold_type_wording():
    gold = partner_overview_for_types("Generator", "Projector")
    assert gold is not None
    for label in ("Partner", "Friend", "Person", "Me", "", "   "):
        out = _sync("Generator", "Projector", label_b=label)
        ov = out["partner_overview"]
        assert ov is not None, label
        assert ov["hook"] == gold["hook"], label
        assert ov["the_current"] == gold["the_current"], label
        assert ov["how_you_love"] == TYPE_LOVE_BANK["Generator"], label
        assert ov["how_they_love"] == how_they_love_for_type("Projector"), label
        assert ov["how_they_love"].startswith("They love"), label
        assert ov["what_this_asks"] == gold["what_this_asks"], label
        assert ov["tender_spots"] == gold["tender_spots"], label
        assert ov["try_this"] == gold["try_this"], label
    # partner_overview_for_types with no labels stays gold
    assert partner_overview_for_types("Generator", "Projector") == gold


def test_named_generator_projector_uses_name_not_type():
    out = _sync("Generator", "Projector", label_b="Sarah Chen", label_a="Benjamin")
    ov = out["partner_overview"]
    assert ov is not None
    blob = _flatten(ov)
    assert "Sarah" in blob
    assert "Benjamin" not in blob
    assert ov["how_you_love"].startswith("You love")
    assert "The person next to you" not in ov["how_you_love"]
    assert "Sarah feels that love" in ov["how_you_love"]
    assert "a Generator with a Projector" not in ov["hook"]
    expected_they = how_they_love_for_type("Projector", "Sarah")
    assert expected_they is not None
    assert ov["how_they_love"] == expected_they
    assert ov["how_they_love"].startswith("Sarah loves")
    assert "You love" not in ov["how_they_love"]
    for m in _TYPE_PERSON_RE.finditer(blob):
        raise AssertionError(f"leftover type-as-person: {m.group(0)!r} in {blob[max(0,m.start()-40):m.end()+40]!r}")
    assert not _TYPE_COLON_RE.search(blob), blob
    assert not _YOU_AGREEMENT_SLIPS.search(blob), _YOU_AGREEMENT_SLIPS.search(blob)
    # try-lines address You / Sarah (type prefixes gone)
    comm = (ov.get("how_you_communicate") or {})
    clash = (ov.get("when_you_clash") or {})
    tries = "\n".join(
        block for block in (ov["try_this"], comm.get("try", ""), clash.get("try", "")) if block
    )
    assert "Generator:" not in tries
    assert "Projector:" not in tries
    assert "You:" in tries and "Sarah:" in tries


def test_same_type_pair_stays_unambiguous_you_vs_name():
    out = _sync("Generator", "Generator", label_b="Sarah")
    ov = out["partner_overview"]
    assert ov is not None
    blob = _flatten(ov)
    assert ov["how_you_love"].startswith("You love")
    assert "Sarah feels that love" in ov["how_you_love"]
    assert ov["how_they_love"].startswith("Sarah loves")
    assert "You love" not in ov["how_they_love"]
    # Do not naively turn every Generator mention into Sarah
    assert "Two Generators" in (ov.get("how_you_communicate") or {}).get("body", "") or "Two Generators" in blob
    # Both people stay distinct in the love-language chapters
    assert "you" in ov["how_you_love"].lower()
    assert "Sarah" in ov["how_they_love"]
    # No leftover articled type-as-person for the partner-only rewrite
    # Same-type overview uses "you" / "Two Generators", not "the Generator" as one person
    assert "the Generator" not in blob
    assert "Benjamin" not in blob


def test_mg_generator_replaces_longer_type_first_you_are_mg():
    out = _sync("Manifesting Generator", "Generator", label_b="Sarah")
    ov = out["partner_overview"]
    assert ov is not None
    blob = _flatten(ov)
    assert ov["how_you_love"].startswith("You love")
    assert "Sarah feels that love" in ov["how_you_love"]
    assert "more than one yes" in ov["how_you_love"]
    assert ov["how_they_love"].startswith("Sarah loves")
    assert "the Manifesting Generator" not in blob
    assert "The Manifesting Generator" not in blob
    assert "the MG" not in blob
    assert "The MG" not in blob
    assert "the Generator" not in blob
    assert "The Generator" not in blob
    assert "MG:" not in blob
    assert "Generator:" not in blob
    # Name and you both present so the two people stay distinct
    assert "Sarah" in blob
    assert re.search(r"\byou\b", blob, re.I)
    assert not _YOU_AGREEMENT_SLIPS.search(blob)
    # MG was not leftover-replaced as Generator (would drop "Manifesting" and
    # leave a bare "the Generator" for the MG — already asserted absent).


def test_mg_generator_replaces_longer_type_first_they_are_mg():
    out = _sync("Generator", "Manifesting Generator", label_b="Sarah")
    ov = out["partner_overview"]
    assert ov is not None
    blob = _flatten(ov)
    assert ov["how_you_love"].startswith("You love")
    assert "Sarah feels that love" in ov["how_you_love"]
    assert ov["how_they_love"].startswith("Sarah loves")
    assert "more than one yes" in ov["how_they_love"]
    assert "the Manifesting Generator" not in blob
    assert "The Manifesting Generator" not in blob
    assert "the MG" not in blob
    assert "The MG" not in blob
    assert "the Generator" not in blob
    assert "The Generator" not in blob
    assert "MG:" not in blob
    assert "Generator:" not in blob
    assert "Sarah" in blob
    assert re.search(r"\byou\b", blob, re.I)
    assert not _YOU_AGREEMENT_SLIPS.search(blob)


def test_named_playbook_sacral_and_profile_lines():
    a = _chart([5, 15], type="Generator", authority="Sacral", profile="6/2")
    b = _chart([1, 8], type="Projector", authority="Splenic", profile="5/1")
    out = compute_soul_sync(
        a,
        b,
        context="life",
        self_meta={"id": 1, "label": "Benjamin", "role": "self"},
        friend_meta={"id": 2, "label": "Sarah", "role": "person"},
    )
    assert out.get("partner_overview") is None  # person role
    cards = out["cards"]
    somatic = next(c for c in cards if c["id"] == "somatic_playbook")
    protocols = somatic.get("protocols") or []
    sacral = next((p for p in protocols if p["id"] == "sacral_aura_hygiene"), None)
    assert sacral is not None
    assert sacral["body"].startswith("You ↔ Sarah.")
    assert "Generator ↔ Projector" not in sacral["body"]
    profile = next((p for p in protocols if p["id"] == "profile_resonance"), None)
    assert profile is not None
    assert "the Projector" not in profile["body"]
    assert "the Generator / MG" not in profile["body"]
    assert "Sarah" in profile["body"]
    assert "you" in profile["body"].lower()
    assert "Benjamin" not in profile["body"]

    # Nameless keeps today's type header
    out2 = compute_soul_sync(
        a,
        b,
        context="life",
        self_meta={"id": 1, "label": "Me", "role": "self"},
        friend_meta={"id": 2, "label": "Friend", "role": "person"},
    )
    somatic2 = next(c for c in out2["cards"] if c["id"] == "somatic_playbook")
    sacral2 = next(p for p in (somatic2.get("protocols") or []) if p["id"] == "sacral_aura_hygiene")
    assert sacral2["body"].startswith("Generator ↔ Projector.")
    profile2 = next(p for p in (somatic2.get("protocols") or []) if p["id"] == "profile_resonance")
    assert "the Projector waits" in profile2["body"]
    assert "the Generator / MG answers" in profile2["body"]


def test_personalize_agrees_possessives_and_objects():
    out = personalize_type_prose(
        "The Generator can feel invisible if their work and yes-energy are simply expected.",
        type_a="Generator",
        type_b="Projector",
        name_b="Sarah",
    )
    assert out == "You can feel invisible if your work and yes-energy are simply expected."

    out = personalize_type_prose(
        "The Generator loves by engaging what lights them up.",
        type_a="Generator",
        type_b="Projector",
        name_b="Sarah",
    )
    assert out == "You love by engaging what lights you up."


def test_hook_type_pair_closers_personalize_when_named():
    out = personalize_type_prose(
        "That is the heat — and the care — in a Generator with a Projector.",
        type_a="Generator",
        type_b="Projector",
        name_b="Sarah",
    )
    assert "a Generator with a Projector" not in out
    assert "you and Sarah" in out

    out = personalize_type_prose(
        "The heat in a Projector with a Generator.",
        type_a="Generator",
        type_b="Projector",
        name_b="Sarah",
    )
    assert "a Projector with a Generator" not in out
    assert "you and Sarah" in out


def test_partner_they_pronoun_may_stay_when_pointing_at_them():
    # how_they_love already uses they/them for the partner; do not flip those to you.
    named = how_they_love_for_type("Projector", "Sarah")
    assert named is not None
    assert named.startswith("Sarah loves")
    assert "they are asked" in named or "they see" in named
    # Personalizing a sentence about Sarah should keep partner they/them.
    out = personalize_type_prose(
        "Sarah loves by seeing someone clearly. You feel that love when they get a real invitation.",
        type_a="Generator",
        type_b="Projector",
        name_b="Sarah",
    )
    assert "when they get" in out
    assert "when you get" not in out


def _partner_sync(
    type_a: str,
    type_b: str,
    *,
    auth_a: str,
    auth_b: str,
    label_b: str,
    label_a: str = "Me",
):
    a = _chart([5, 15], type=type_a, authority=auth_a, profile="3/5")
    b = _chart([1, 8], type=type_b, authority=auth_b, profile="5/1")
    return compute_soul_sync(
        a,
        b,
        context="life",
        self_meta={"id": 1, "label": label_a, "role": "self", "type": type_a},
        friend_meta={"id": 2, "label": label_b, "role": "partner", "type": type_b},
    )


def test_achi_projector_mg_emotional_sacral_locked_meanings():
    """You = Projector, Achi = MG, emotional|sacral — signed-off meanings."""
    out = _partner_sync(
        "Projector",
        "Manifesting Generator",
        auth_a="Emotional",
        auth_b="Sacral",
        label_b="Achi",
    )
    ov = out["partner_overview"]
    assert ov is not None
    assert ov["hook"] == (
        "Achi moves on several yeses at once. You see what those yeses are for."
    )
    decide = ov["how_you_decide"]
    assert decide["body"] == (
        "You decide at different speeds. "
        "A feeling has to rise and fall before your yes is real. "
        "Achi gets a clear yes or no in the body now, and it goes stale if you wait too long."
    )
    assert decide["try"] == (
        "Say the body yes or no now. Sleep on the feeling. Come back once, after it has settled. "
        "Do not force one deadline."
    )
    talk = ov["how_you_communicate"]
    assert talk["body"] == (
        "Achi works through several things out loud. You track what those "
        "threads are for. Advice that was not asked for can feel like being managed."
    )
    assert talk["try"] == (
        "Achi: ask to be seen on one thread before you ask for advice. "
        "You: advise on that one thread only."
    )
    assert "seeing Achi clearly" in ov["how_you_love"]
    assert "pointing their energy at the right thing" in ov["how_you_love"]
    assert "when they have asked" in ov["how_you_love"]
    assert "Achi feels that love when you are invited to share what you see" in ov["how_you_love"]
    assert "pace that is not yours" in ov["how_you_love"]
    assert ov["how_they_love"].startswith("Achi loves by following more than one yes at a time")
    assert "changing course quickly" in ov["how_they_love"]
    assert "tell you as they turn, so you are in on the change" in ov["how_they_love"]
    clash = ov["when_you_clash"]
    assert "In a fight, you may try to sort the many threads." in clash["body"]
    assert "Achi can feel slowed or judged." in clash["body"]
    assert "Advice that was not asked for, and yeses that never get finished, feed each other." in clash["body"]
    assert clash["try"] == (
        "Achi: ask to be seen on the one thread that hurts. "
        "You: advise on that thread only, and only after they ask."
    )
    blob = _flatten(ov)
    assert "Benjamin" not in blob
    assert "One of you" not in ov["hook"]
    assert "One of you" not in talk["body"]
    assert "one of you" not in decide["body"].lower()
    assert not _YOU_AGREEMENT_SLIPS.search(blob)
    # Nameless path keeps Type-as-person on the same meanings
    nameless = partner_overview_for_types("Projector", "Manifesting Generator")
    assert nameless is not None
    assert nameless["hook"] == (
        "The Manifesting Generator moves on several yeses at once. The Projector sees what those yeses are for."
    )


def test_alex_generator_manifestor_locked_talk_and_hook():
    """You = Generator, Alex = Manifestor — signed-off hook and talk."""
    out = _partner_sync(
        "Generator",
        "Manifestor",
        auth_a="Sacral",
        auth_b="Emotional",
        label_b="Alex",
    )
    ov = out["partner_overview"]
    assert ov is not None
    assert ov["hook"] == (
        "Alex starts things that would not have started without them. "
        "You need an honest yes or no before you join."
    )
    talk = ov["how_you_communicate"]
    assert talk["body"] == (
        "Alex often speaks in order to start. You need a beat to give a real yes or no. "
        "Talks go sideways when a heads-up sounds like a decision already made."
    )
    assert talk["try"] == (
        "Alex: tell you first, then ask for a real yes or no. "
        "You: give a clean yes or no, without a long defense."
    )
    assert "tell You first" not in talk["try"]
    # Mixed authority still assigns from auth fields, not Type
    decide = ov["how_you_decide"]
    assert "You get a clear yes or no in the body now" in decide["body"]
    assert "before Alex's yes is real" in decide["body"] or "before Alex's yes" in decide["body"]
    assert "one of you" not in decide["body"].lower()


def test_decide_sides_come_from_authorities_not_type():
    """A Projector can be sacral; do not guess sides from Type."""
    # Same types as Achi pair, authorities swapped
    out = _partner_sync(
        "Projector",
        "Manifesting Generator",
        auth_a="Sacral",
        auth_b="Emotional",
        label_b="Achi",
    )
    body = out["partner_overview"]["how_you_decide"]["body"]
    assert "You get a clear yes or no in the body now" in body
    assert "before Achi's yes is real" in body
    assert "A feeling has to rise and fall before your yes is real." not in body
    # Same authority: shared wording, no forced names
    same = _partner_sync(
        "Projector",
        "Manifesting Generator",
        auth_a="Sacral",
        auth_b="Sacral",
        label_b="Achi",
    )
    shared = same["partner_overview"]["how_you_decide"]
    assert "You both get a yes or no in the body that wants to be trusted now." in shared["body"]
    assert "talking each other into a polite yes" in shared["body"]
    assert shared["try"] == (
        "Before you lock a plan, both of you answer out loud, with no sales pitch. "
        "If either yes goes flat, change the plan."
    )
    assert "Achi gets" not in shared["body"]


def test_sacral_sacral_shared_wording_without_forced_names():
    out = _partner_sync(
        "Generator",
        "Generator",
        auth_a="Sacral",
        auth_b="Sacral",
        label_b="Sam",
    )
    decide = out["partner_overview"]["how_you_decide"]
    assert "You both get a yes or no in the body that wants to be trusted now." in decide["body"]
    assert "The stretch is talking each other into a polite yes." in decide["body"]
    assert decide["try"].startswith("Before you lock a plan, both of you answer out loud, with no sales pitch.")
    assert "Sam gets" not in decide["body"]


def test_mixed_type_love_copy_is_not_one_of_you():
    """When types differ, hooks / talk / clash are Type-as-person, not 'One of you'."""
    from app.hd.partner_insights import HD_TYPES, partner_overview_for_types
    from app.hd.partner_love_dynamics import TYPE_PAIR_CLASH, TYPE_PAIR_COMMUNICATE, type_pair_key

    for a in HD_TYPES:
        for b in HD_TYPES:
            if a == b:
                continue
            ov = partner_overview_for_types(a, b)
            assert ov is not None, f"{a}|{b}"
            for field in ("hook", "the_current", "what_this_asks", "tender_spots", "try_this"):
                assert "One of you" not in ov[field], f"{a}|{b} {field}: {ov[field]}"
            key = type_pair_key(a, b)
            assert "One of you" not in TYPE_PAIR_COMMUNICATE[key]["body"], key
            assert "One of you" not in TYPE_PAIR_CLASH[key]["body"], key


def test_love_chapter_banks_have_no_banned_atmosphere_terms():
    from app.hd.partner_insights import PARTNER_OVERVIEW_BY_TYPES, TYPE_LOVE_BANK
    from app.hd.partner_love_dynamics import all_dynamics_copy_blobs
    from app.hd.partner_names import _HOW_THEY_LOVE

    blobs = list(TYPE_LOVE_BANK.values())
    blobs.extend(_HOW_THEY_LOVE.values())
    for ov in PARTNER_OVERVIEW_BY_TYPES.values():
        blobs.extend(ov.values())
    blobs.extend(all_dynamics_copy_blobs())
    joined = "\n".join(blobs).lower()
    for phrase in (
        "lanes",
        "multi-track",
        "multi-lane",
        "life-force",
        "gut engines",
        "the current",
        "emotional weather",
        "body read",
        "sample window",
    ):
        assert phrase not in joined, f"banned phrase in Love banks: {phrase}"
    # Noun "tracks" (not the verb "track / tracks what")
    assert "those tracks" not in joined
    assert "across tracks" not in joined
    assert "the tracks" not in joined


def test_when_its_hard_is_one_clash_why_and_try():
    out = _partner_sync(
        "Projector",
        "Manifesting Generator",
        auth_a="Emotional",
        auth_b="Sacral",
        label_b="Achi",
    )
    ov = out["partner_overview"]
    clash = ov["when_you_clash"]
    assert clash["body"].strip()
    assert clash["try"].strip()
    # API may still carry overview asks / tender / try_this, but clash is the
    # preferred single why + try and is not a four-way retelling of the same ache
    # with literary subheads required at the data layer.
    assert "What this bond asks" not in clash["body"]
    assert "The tender spots" not in clash["body"]
    assert clash["try"]
