"""Dual-chart Soul Aura Alchemy scorer (You ↔ Friend). Pure functions — no I/O.

Supersedes Bio-Sync Fit % framing. Reuses channel-role classification.
"""
from __future__ import annotations

from typing import Any, Iterable, Literal

from .channels import (
    CENTERS,
    CHANNELS,
    GATE_TO_CENTER,
    MOTORS,
    active_channels,
    defined_centers,
    hanging_gates as compute_hanging_gates,
)
from .type_authority import derive_definition

ContextId = Literal["work", "life", "play"]

CONTEXT_LABELS: dict[str, str] = {
    "work": "Work & Co-Creation",
    "life": "Life & Intimacy",
    "play": "Play & Recovery",
}

# Valid context ids (replaces old CONTEXT_WEIGHTS for route validation)
CONTEXT_IDS = frozenset(CONTEXT_LABELS.keys())

PLAYBOOK_CARD_ORDER: dict[str, list[str]] = {
    "life": ["somatic_playbook", "power_dynamics", "circuit_bridge", "spark_glue"],
    "work": ["circuit_bridge", "spark_glue", "power_dynamics", "somatic_playbook"],
    "play": ["spark_glue", "somatic_playbook", "circuit_bridge", "power_dynamics"],
}

SIGNATURES: list[dict[str, Any]] = [
    {
        "id": "magnetic_alchemy",
        "label": "Magnetic Alchemy",
        "emoji": "⚡",
        "tier": "highest",
        "tier_label": "Highest signature",
        "subtext": (
            "This is Baseline's highest Aura Signature — the rarest high-voltage "
            "lock we grade. Your charts complete each other through dense "
            "electromagnetic charge, an Intimacy lock (59-6), and/or a mutual "
            "Split→Single bridge, so the field feels catalytic rather than casual. "
            "Expect amplified vitality, faster bonding chemistry, and a nervous "
            "system that lights up in each other's aura. Treat the charge as fuel "
            "with protocols: name pace, protect solo recovery, and let decisions "
            "wait when Emotional waves are high. This is transformation chemistry, "
            "not a compatibility score."
        ),
    },
    {
        "id": "integrated_flow",
        "label": "Integrated Flow Circuit",
        "emoji": "🧬",
        "subtext": (
            "Your separate energy islands snap into one continuous circuit when "
            "you are together. Split definitions resolve toward Single flow, "
            "and/or the Integration Triad (10-20-34) wires identity, expression, "
            "and sacral power across the pair. Thoughts, direction, and action "
            "start looping as one field instead of two parallel graphs. Protect "
            "the gift by noticing when you lose your own north inside the shared "
            "current — step out of aura regularly so the composite does not become "
            "fusion. Use this signature for co-creation and long-form building, "
            "not only for intensity."
        ),
    },
    {
        "id": "harmonic_sanctuary",
        "label": "Harmonic Sanctuary",
        "emoji": "🌿",
        "subtext": (
            "This field feels familiar before either of you explains why. "
            "Companionship channels and shared authority class create low-friction "
            "rhythm — tribal or emotional pacing that needs less negotiation than "
            "high-EM pairs. Unspoken understanding is the feature; boredom or "
            "assumed consent is the shadow. Keep the sanctuary honest by naming "
            "needs early instead of relying on \"we just get it.\" Ideal for "
            "recovery days, household cadence, and work that rewards steadiness "
            "over spark."
        ),
    },
    {
        "id": "catalytic_growth",
        "label": "Catalytic Growth Engine",
        "emoji": "🔥",
        "subtext": (
            "This pairing is built for rapid expansion, not soft cruise control. "
            "A dense composite (8 or 9 defined centers) plus compromise and/or "
            "dominance density creates a developmental mirror with high momentum "
            "and frequent thermostat collisions. Growth comes from tuning power "
            "dynamics — who holds the full channel, who adapts — without shaming "
            "either role. Schedule recovery as seriously as the push: Active "
            "Co-Regulation is a strength here, not a defect. Use Life playbook "
            "for intimacy pacing; Work playbook for role clarity."
        ),
    },
    {
        "id": "spacious_explorers",
        "label": "Spacious Co-Explorers",
        "emoji": "🌊",
        "subtext": (
            "Your composite stays relatively open, so the field stays breathable "
            "and low-conditioning. Chemistry thrives on novelty, changing "
            "environments, and chosen connection rather than locked circuitry. "
            "Do not mistake space for weak bond — this signature prefers fluidity "
            "over fusion. Design dates, projects, and recovery around movement "
            "and fresh context. When you want more charge, look to the Spark & "
            "Glue card for selective ignition points instead of forcing a "
            "Magnetic-style lock."
        ),
    },
]

_SIG_BY_ID = {s["id"]: s for s in SIGNATURES}

BADGE_DESCRIPTIONS: dict[str, str] = {
    "mutual_split_bridge": (
        "Separately you each run Split (or multi-split) definition — islands of "
        "energy that do not fully connect on your own. Together, hanging gates "
        "complete across the pair and the composite resolves to Single definition: "
        "one continuous flow. That is why time in the same aura can feel clarifying "
        "or addictive; the circuit literally closes. Practice leaving the room "
        "(or the call) so each person remembers their solo graph."
    ),
    "shared_compass": (
        "Neither of you has a defined G-Center alone, so identity and direction "
        "can feel open or environmentally pulled. In composite, Gate bridges define "
        "the G together — a shared \"true north\" and sense of place that neither "
        "holds solo. Beautiful for partnership and co-vision; risky if you outsource "
        "\"who I am\" to the pair. Check your own compass after intense time together."
    ),
    "intimacy_lock": (
        "Electromagnetic Channel 59-6 (Intimacy) means each of you holds one half "
        "of the sacral–emotional intimacy circuit; together the channel closes. "
        "This is creative and sexual/relational chemistry in HD terms — fertility "
        "of ideas and bonding, not a moral grade. Expect heat, fertility of "
        "projects, and thin skin around rejection. Name consent and recovery "
        "explicitly; do not treat the lock as permanent permission."
    ),
    "integration_triad": (
        "Gates 10, 20, and 34 weave Awakening (10-20) and Exploration (10-34) — "
        "and with 20-34, Charisma — so identity, voice, and sacral power integrate "
        "across the pair. One person's Gate 10 often meets the other's 20-34 "
        "(or the composite forms the triad neither held alone). The field can feel "
        "highly capable and \"on.\" Watch for burnout: integrated does not mean "
        "always-on."
    ),
    "tribal_bond": (
        "Companionship on Channel 19-49 (Synthesis) is shared tribal sensitivity — "
        "needs, resources, and emotional support frequency. You both already carry "
        "the full channel, so comfort, food, and \"are we okay?\" themes feel "
        "native. Lean into tactile care on low Emotional waves; avoid turning every "
        "need into a crisis meeting."
    ),
    "mirror_gates": (
        "You share hanging gates in centers that are open for both of you — the "
        "same open receptors looking for completion. That can feel like instant "
        "recognition (\"you get this exact itch\") and also like mutual amplification "
        "of the same conditioning themes. Use the listed gates as mirrors: ask "
        "whose story is running before you both spiral."
    ),
    "composite_8_1": (
        'Together you define eight of nine centers — a nearly full circuit with '
        "one open center as the pressure-release valve. Classic HD composite lore "
        'frames 8-1 as \"have some fun\": high capability with a reminder not to '
        "take the bond as total identity. Honor the open center; over-defining the "
        "last gap invites exhaustion."
    ),
    "composite_9_0": (
        "All nine centers define in composite — maximum circuitry and conditioning "
        "density when together. Powerful for building and immersion; easy to lose "
        "solo aura hygiene. Schedule deliberate separation so the full circuit does "
        'not become the only way either of you feels \"online.\"'
    ),
}

PLAYBOOK_LEDES: dict[str, dict[str, str]] = {
    "magnetic_alchemy": {
        "life": (
            "Highest-signature intimacy field. Prioritize consent, Emotional-wave "
            "timing, and solo wind-down after contact. Use Sacral/Non-Sacral hygiene "
            "if present, and treat 59-6 heat as creative fuel you both steward — not "
            "as proof you must merge calendars."
        ),
        "work": (
            "Channel the magnetic charge into short, high-clarity collaboration "
            "bursts. Define roles before brainstorming so EM spark does not become "
            "meeting chaos. End sessions with a hard stop so borrowed sacral/ego "
            "charge can discharge."
        ),
        "play": (
            "Play hard, recover harder. Prefer novel shared experiences that burn "
            "the charge cleanly, then separate auras before sleep. Avoid \"one more "
            "deep talk\" at wave bottom; schedule joy when both authorities say yes."
        ),
    },
    "integrated_flow": {
        "life": (
            "You wire into one continuous circuit — beautiful for shared direction, "
            "risky for fused identity. Practice \"my north / our north\" check-ins. "
            "Protect the open spaces that still belong to each person alone."
        ),
        "work": (
            "Use the Single-flow composite for shipping and systems work: one "
            "backlog, clear owners, shared True North if G unlocked. Break the "
            "circuit with async solo deep work so Split individuals can think "
            "without the bridge."
        ),
        "play": (
            "Choose recovery that keeps flow without forcing productivity — walks, "
            "music, low-stakes making. The triad wants expression; give it a "
            "playground, then step out of aura so the loop can idle."
        ),
    },
    "harmonic_sanctuary": {
        "life": (
            "Low-friction bond: lean into companionship comfort (food, presence, "
            "tribal care) and name needs before resentment. Sanctuary dies when "
            "assumed telepathy replaces requests."
        ),
        "work": (
            "Favor steady cadence over heroic sprints. Shared authority class helps "
            "decision rhythm — still write agreements so familiarity does not skip "
            "scope."
        ),
        "play": (
            "Rest together without optimizing. Familiar play, same café, quiet "
            "parallel presence. Novelty is optional; safety is the feature."
        ),
    },
    "catalytic_growth": {
        "life": (
            "Developmental mirror with thermostat collisions. Tune compromise "
            "channels early (Struggle, Recognition, etc.) and celebrate growth "
            "without turning every evening into a workshop."
        ),
        "work": (
            "High momentum pair — assign dominance gifts as explicit strengths and "
            "schedule conflict reviews. Dense 8-1/9-0 composites burn out teams "
            "that never separate."
        ),
        "play": (
            "Alternate intensity with empty space. Competitive play or skill quests "
            "fit; add mandatory recovery blocks so Active Co-Regulation does not "
            "become chronic activation."
        ),
    },
    "spacious_explorers": {
        "life": (
            "Breathable field — design intimacy around choice and novelty, not "
            "locked circuitry. Check Spark & Glue for selective ignition; do not "
            "force a Magnetic script."
        ),
        "work": (
            "Collaborate through experiments and changing environments. Keep "
            "ownership clear because open composites dilute \"who decides.\""
        ),
        "play": (
            "Explore. New places, light plans, easy exits. Space is the chemistry; "
            "crowding the calendar kills it."
        ),
    },
}

PLAYBOOK_FOCUS_HINTS: dict[str, str] = {
    "life": "Lead with pacing & intimacy protocols",
    "work": "Lead with circuit bridge and role clarity",
    "play": "Lead with spark, joy, and recovery",
}


def build_playbook_lede(
    signature_id: str,
    context: str,
    focus_hint: str | None = None,
) -> dict[str, str]:
    """Return playbook lede (+ optional focus_hint) for signature × context."""
    by_sig = PLAYBOOK_LEDES.get(signature_id) or PLAYBOOK_LEDES["spacious_explorers"]
    lede = by_sig.get(context) or by_sig["life"]
    hint = focus_hint if focus_hint is not None else PLAYBOOK_FOCUS_HINTS.get(context, "")
    out: dict[str, str] = {"lede": lede}
    if hint:
        out["focus_hint"] = hint
    return out


CENTER_HINTS: dict[str, str] = {
    "Head": "Amplifier: their mental pressure can feel like your question. Ask: is this mine?",
    "Ajna": "Amplifier: fixed opinions can land as certainty. Soften before deciding.",
    "Throat": "Amplifier: their expression may pull you to speak or act. Pause first.",
    "G": "Amplifier: their direction can feel like your identity. Check your own north.",
    "Heart": "Amplifier: willpower and worth themes intensify. Rest the Ego.",
    "Solar_Plexus": "Amplifier: you can feel their emotional wave more intensely. Ask: is this mine?",
    "Sacral": "Amplifier: borrowed work energy — respond, don't initiate from it.",
    "Spleen": "Amplifier: instinctive fear/alertness can spike. One breath before reacting.",
    "Root": "Amplifier: adrenal pressure rises. Shorten the list; don't force pace.",
}

HARMONIC_LINE_PAIRS = {frozenset({1, 4}), frozenset({2, 5}), frozenset({3, 6})}

SACRAL_TYPES = {"Generator", "Manifesting Generator"}
NON_SACRAL_TYPES = {"Projector", "Manifestor", "Reflector"}

INTIMACY_GATES = frozenset({6, 59})
# Real natal pairs routinely form 2–4 EM channels; Magnetic needs exceptional density.
MAGNETIC_EM_MIN = 5
SYNTHESIS_GATES = frozenset({19, 49})
STRUCTURING_GATES = frozenset({23, 43})
ABSTRACTION_GATES = frozenset({47, 64})
TRANSITORINESS_GATES = frozenset({35, 36})
CHARISMA_GATES = frozenset({20, 34})
STRUGGLE_GATES = frozenset({28, 38})
RECOGNITION_GATES = frozenset({30, 41})
AWAKENING_GATES = frozenset({10, 20})
EXPLORATION_GATES = frozenset({10, 34})

DISCLAIMER = "Chart mechanics for awareness — not medical or relationship advice."


def clamp(n: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, n))


def _gate_set(chart: dict[str, Any]) -> set[int]:
    raw = chart.get("activated_gates") or []
    return {int(g) for g in raw}


def _defined_set(chart: dict[str, Any], gates: set[int] | None = None) -> set[str]:
    raw = chart.get("defined_centers")
    if raw is not None:
        return set(raw)
    g = gates if gates is not None else _gate_set(chart)
    return defined_centers(active_channels(g))


def _hanging(chart: dict[str, Any], gates: set[int] | None = None) -> list[dict]:
    raw = chart.get("hanging_gates")
    if isinstance(raw, list) and raw:
        return raw
    g = gates if gates is not None else _gate_set(chart)
    return compute_hanging_gates(g)


def _parse_profile(profile: str | None) -> tuple[int | None, int | None]:
    if not profile or "/" not in str(profile):
        return None, None
    try:
        a, b = str(profile).strip().split("/", 1)
        return int(a), int(b)
    except (TypeError, ValueError):
        return None, None


def profile_harmony(profile_a: str | None, profile_b: str | None) -> bool:
    """True once if identical, harmonic lines, or complementary RA↔LA (not Juxtaposition)."""
    if not profile_a or not profile_b:
        return False
    if profile_a == profile_b:
        return True
    p_a, d_a = _parse_profile(profile_a)
    p_b, d_b = _parse_profile(profile_b)
    if p_a is None or p_b is None:
        return False
    if frozenset({p_a, p_b}) in HARMONIC_LINE_PAIRS:
        return True
    if d_a is not None and d_b is not None and frozenset({d_a, d_b}) in HARMONIC_LINE_PAIRS:
        return True
    if profile_a == "4/1" or profile_b == "4/1":
        return False
    ra = {1, 2, 3}
    la = {4, 5, 6}
    a_ra, a_la = p_a in ra, p_a in la
    b_ra, b_la = p_b in ra, p_b in la
    return (a_ra and b_la) or (a_la and b_ra)


def _is_emotional(authority: str | None) -> bool:
    if not authority:
        return False
    a = authority.lower()
    return "emotional" in a or "solar plexus" in a


def _is_sacral_auth(authority: str | None) -> bool:
    if not authority:
        return False
    return authority.lower().startswith("sacral")


def _is_splenic(authority: str | None) -> bool:
    if not authority:
        return False
    a = authority.lower()
    return "splenic" in a or a == "spleen"


def _is_instant(authority: str | None) -> bool:
    return _is_sacral_auth(authority) or _is_splenic(authority)


def shared_authority_class(auth_a: str | None, auth_b: str | None) -> bool:
    """Both Emotional, both Sacral, or both Splenic."""
    if _is_emotional(auth_a) and _is_emotional(auth_b):
        return True
    if _is_sacral_auth(auth_a) and _is_sacral_auth(auth_b):
        return True
    if _is_splenic(auth_a) and _is_splenic(auth_b):
        return True
    return False


def authority_speed_gap(auth_a: str | None, auth_b: str | None) -> bool:
    return (_is_emotional(auth_a) and _is_instant(auth_b)) or (
        _is_emotional(auth_b) and _is_instant(auth_a)
    )


def sacral_asymmetry(type_a: str | None, type_b: str | None) -> bool:
    if not type_a or not type_b:
        return False
    a_sacral = type_a in SACRAL_TYPES
    b_sacral = type_b in SACRAL_TYPES
    a_non = type_a in NON_SACRAL_TYPES
    b_non = type_b in NON_SACRAL_TYPES
    return (a_sacral and b_non) or (b_sacral and a_non)


def is_split_definition(definition: str | None) -> bool:
    """Split* = Split / Triple Split / Quadruple Split (multi-component)."""
    if not definition:
        return False
    d = definition.strip()
    if d.startswith("Split"):
        return True
    return d in {"Triple Split", "Quadruple Split"}


def definition_for_gates(gates: set[int]) -> str:
    channels = active_channels(gates)
    defined = defined_centers(channels)
    return derive_definition(defined, channels)


def classify_channel_roles(
    gates_a: set[int], gates_b: set[int]
) -> dict[str, list[dict[str, Any]]]:
    roles: dict[str, list[dict[str, Any]]] = {
        "electromagnetic": [],
        "companionship": [],
        "dominance": [],
        "compromise": [],
    }
    for g1, g2, name in CHANNELS:
        pair = {g1, g2}
        held_a = pair & gates_a
        held_b = pair & gates_b
        n_a, n_b = len(held_a), len(held_b)
        entry = {"channel": name, "gates": sorted(pair)}
        if n_a == 1 and n_b == 1 and held_a != held_b:
            roles["electromagnetic"].append(entry)
        elif n_a == 2 and n_b == 2:
            roles["companionship"].append(entry)
        elif (n_a == 2 and n_b == 0) or (n_b == 2 and n_a == 0):
            roles["dominance"].append({**entry, "holder": "self" if n_a == 2 else "friend"})
        elif (n_a == 2 and n_b == 1) or (n_b == 2 and n_a == 1):
            roles["compromise"].append(
                {**entry, "full": "self" if n_a == 2 else "friend"}
            )
    return roles


def split_bridge_locks(
    hanging_self: Iterable[dict], gates_friend: set[int], *, held_by: str, missing_for: str
) -> list[dict[str, Any]]:
    seen: set[int] = set()
    out: list[dict[str, Any]] = []
    for row in hanging_self:
        missing = row.get("missing")
        if missing is None:
            continue
        gate = int(missing)
        if gate in seen:
            continue
        if gate in gates_friend:
            seen.add(gate)
            out.append(
                {
                    "gate": gate,
                    "channel": row.get("channel") or "",
                    "held_by": held_by,
                    "missing_for": missing_for,
                }
            )
    return out


def conditioning_strip(
    defined_a: set[str], defined_b: set[str]
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for center in CENTERS:
        self_state = "defined" if center in defined_a else "open"
        friend_state = "defined" if center in defined_b else "open"
        if self_state == "defined" and friend_state == "defined":
            direction = "both_defined"
            hint = ""
        elif self_state == "open" and friend_state == "open":
            direction = "both_open"
            hint = ""
        elif self_state == "open" and friend_state == "defined":
            direction = "friend_to_self"
            hint = CENTER_HINTS.get(center, "Amplifier: notice what is theirs vs yours.")
        else:
            direction = "self_to_friend"
            hint = ""
        rows.append(
            {
                "center": center,
                "self": self_state,
                "friend": friend_state,
                "direction": direction,
                "hint": hint,
            }
        )
    return rows


def _channel_has_gates(roles_list: list[dict], gates: frozenset[int]) -> bool:
    for ch in roles_list:
        if frozenset(ch.get("gates") or []) == gates:
            return True
    return False


def _roles_involving(
    roles: dict[str, list[dict[str, Any]]],
    role_keys: tuple[str, ...],
    gate_sets: tuple[frozenset[int], ...],
) -> bool:
    for key in role_keys:
        for ch in roles.get(key) or []:
            g = frozenset(ch.get("gates") or [])
            if g in gate_sets:
                return True
    return False


def detect_integration_triad(
    gates_a: set[int], gates_b: set[int], composite_gates: set[int]
) -> tuple[bool, str]:
    """Return (matched, detail)."""
    comp_has_awakening = AWAKENING_GATES.issubset(composite_gates)
    comp_has_exploration = EXPLORATION_GATES.issubset(composite_gates)
    if not (comp_has_awakening and comp_has_exploration):
        return False, ""

    cross = (10 in gates_a and {20, 34}.issubset(gates_b)) or (
        10 in gates_b and {20, 34}.issubset(gates_a)
    )
    if cross:
        return True, "Gate 10 meets 20-34 across the pair"

    alone_a = AWAKENING_GATES.issubset(gates_a) and EXPLORATION_GATES.issubset(gates_a)
    alone_b = AWAKENING_GATES.issubset(gates_b) and EXPLORATION_GATES.issubset(gates_b)
    if not alone_a and not alone_b:
        return True, "Composite triad"

    return False, ""


def detect_mirror_gates(
    gates_a: set[int], gates_b: set[int], defined_a: set[str], defined_b: set[str]
) -> tuple[bool, str, list[int]]:
    shared = sorted(gates_a & gates_b)
    mirrored: list[int] = []
    for g in shared:
        center = GATE_TO_CENTER.get(g)
        if not center:
            continue
        if center not in defined_a and center not in defined_b:
            mirrored.append(g)
    if not mirrored:
        return False, "", []
    shown = mirrored[:5]
    parts = []
    for g in shown:
        c = GATE_TO_CENTER.get(g, "?")
        parts.append(f"{g} ({c})")
    detail = "Shared hanging: " + ", ".join(parts)
    return True, detail, mirrored


def detect_badges(
    *,
    def_a: str,
    def_b: str,
    def_comp: str,
    defined_a: set[str],
    defined_b: set[str],
    composite_defined: set[str],
    gates_a: set[int],
    gates_b: set[int],
    composite_gates: set[int],
    roles: dict[str, list[dict[str, Any]]],
    bridges_self: list[dict],
    bridges_friend: list[dict],
) -> list[dict[str, Any]]:
    badges: list[dict[str, Any]] = []

    mutual = (
        is_split_definition(def_a)
        and is_split_definition(def_b)
        and def_comp == "Single"
    )
    if mutual:
        detail_parts = []
        if bridges_self:
            detail_parts.append(
                "you←them: " + ", ".join(f"g{b['gate']}" for b in bridges_self[:4])
            )
        if bridges_friend:
            detail_parts.append(
                "them←you: " + ", ".join(f"g{b['gate']}" for b in bridges_friend[:4])
            )
        detail = "Split + Split → Single"
        if detail_parts:
            detail = detail + " · " + "; ".join(detail_parts)
        badges.append(
            {
                "id": "mutual_split_bridge",
                "label": "Mutual Split-Bridge (Single Flow)",
                "detail": detail,
            }
        )

    if (
        "G" not in defined_a
        and "G" not in defined_b
        and "G" in composite_defined
    ):
        badges.append(
            {
                "id": "shared_compass",
                "label": "Shared Compass Unlocked (G-Center Defined)",
                "detail": "Open G + Open G → Defined G together",
            }
        )

    if _channel_has_gates(roles["electromagnetic"], INTIMACY_GATES):
        badges.append(
            {
                "id": "intimacy_lock",
                "label": "Intimacy & Creative Lock (59-6)",
                "detail": "Electromagnetic Intimacy",
            }
        )

    triad_ok, triad_detail = detect_integration_triad(gates_a, gates_b, composite_gates)
    if triad_ok:
        badges.append(
            {
                "id": "integration_triad",
                "label": "Integration Triad (10-20-34)",
                "detail": triad_detail,
            }
        )

    if _channel_has_gates(roles["companionship"], SYNTHESIS_GATES):
        badges.append(
            {
                "id": "tribal_bond",
                "label": "Tribal Bond (Shared 19-49)",
                "detail": "Companionship Synthesis",
            }
        )

    mirror_ok, mirror_detail, _ = detect_mirror_gates(
        gates_a, gates_b, defined_a, defined_b
    )
    if mirror_ok:
        badges.append(
            {
                "id": "mirror_gates",
                "label": "Mirror Gates (Shared Hanging Gates)",
                "detail": mirror_detail,
            }
        )

    n_defined = len(composite_defined)
    if n_defined == 8:
        badges.append(
            {
                "id": "composite_8_1",
                "label": '8-1 "Have Some Fun" Composite',
                "detail": "8 defined / 1 open",
            }
        )
    elif n_defined == 9:
        badges.append(
            {
                "id": "composite_9_0",
                "label": '9-0 "Full Circuit" Composite',
                "detail": "9 defined / 0 open",
            }
        )

    for badge in badges:
        desc = BADGE_DESCRIPTIONS.get(badge["id"])
        if desc:
            badge["description"] = desc
    return badges


def detect_signatures(
    *,
    roles: dict[str, list[dict[str, Any]]],
    badge_ids: set[str],
    def_a: str,
    def_b: str,
    def_comp: str,
    composite_defined_count: int,
    auth_a: str | None,
    auth_b: str | None,
) -> tuple[dict[str, Any], dict[str, Any] | None]:
    """Return (primary, secondary|None) by priority order."""
    em = roles["electromagnetic"]
    companionship = roles["companionship"]
    compromise = roles["compromise"]
    dominance = roles["dominance"]
    shared_auth = shared_authority_class(auth_a, auth_b)

    checks: list[tuple[str, bool]] = [
        (
            "magnetic_alchemy",
            # Tighten vs P0 draft EM>=2 (nearly all real pairs). Keep 59-6 + mutual.
            len(em) >= MAGNETIC_EM_MIN
            or _channel_has_gates(em, INTIMACY_GATES)
            or "mutual_split_bridge" in badge_ids,
        ),
        (
            "integrated_flow",
            (
                is_split_definition(def_a)
                and is_split_definition(def_b)
                and def_comp == "Single"
            )
            or "integration_triad" in badge_ids,
        ),
        (
            "harmonic_sanctuary",
            len(companionship) >= 2
            or (
                len(companionship) >= 1
                and len(compromise) <= 1
                and shared_auth
            ),
        ),
        (
            "catalytic_growth",
            composite_defined_count in (8, 9)
            and (len(compromise) >= 2 or len(dominance) >= 3),
        ),
        (
            "spacious_explorers",
            composite_defined_count <= 6,
        ),
    ]

    matched = [sid for sid, ok in checks if ok]
    if not matched:
        matched = ["spacious_explorers"]

    primary = dict(_SIG_BY_ID[matched[0]])
    secondary = dict(_SIG_BY_ID[matched[1]]) if len(matched) > 1 else None
    return primary, secondary


def build_spectrums(
    *,
    roles: dict[str, list[dict[str, Any]]],
    bridges_all_gates: set[int],
    newly_motors: list[str],
    badge_ids: set[str],
    def_a: str,
    def_b: str,
    def_comp: str,
    auth_a: str | None,
    auth_b: str | None,
    type_a: str | None,
    type_b: str | None,
) -> list[dict[str, Any]]:
    # --- Auric Charge ---
    charge_drivers: list[dict[str, Any]] = []
    charge = 0
    for ch in roles["electromagnetic"]:
        charge += 18
        charge_drivers.append(
            {
                "kind": "electromagnetic",
                "channel": ch["channel"],
                "gates": ch["gates"],
                "pts": 18,
            }
        )
    for gate in sorted(bridges_all_gates):
        charge += 15
        charge_drivers.append({"kind": "hanging_bridge", "gate": gate, "pts": 15})
    for motor in newly_motors:
        charge += 8
        charge_drivers.append({"kind": "new_motor", "center": motor, "pts": 8})
    if "intimacy_lock" in badge_ids:
        charge += 12
        charge_drivers.append({"kind": "intimacy_lock", "pts": 12})
    if "integration_triad" in badge_ids:
        charge += 10
        charge_drivers.append({"kind": "integration_triad", "pts": 10})
    charge = int(clamp(charge))
    if charge >= 60:
        charge_summary = (
            "High-voltage activation — catalytic spark, shared momentum, "
            "and amplified nervous system output."
        )
    elif charge >= 30:
        charge_summary = "Moderate auric charge — noticeable spark with room to breathe."
    else:
        charge_summary = "Calmer field — independent baselines with selective ignition points."

    # --- Circuit Continuity ---
    cont_drivers: list[dict[str, Any]] = []
    cont = 0
    mutual_or_single = "mutual_split_bridge" in badge_ids or (
        def_comp == "Single"
        and (is_split_definition(def_a) or is_split_definition(def_b))
    )
    if mutual_or_single:
        cont += 40
        cont_drivers.append({"kind": "mutual_or_single_flow", "pts": 40})
    for ch in roles["companionship"]:
        cont += 15
        cont_drivers.append(
            {
                "kind": "companionship",
                "channel": ch["channel"],
                "gates": ch["gates"],
                "pts": 15,
            }
        )
    for ch in roles["dominance"]:
        cont += 8
        cont_drivers.append(
            {
                "kind": "dominance",
                "channel": ch["channel"],
                "gates": ch["gates"],
                "pts": 8,
            }
        )
    if shared_authority_class(auth_a, auth_b):
        cont += 20
        cont_drivers.append({"kind": "shared_authority", "pts": 20})
    if "shared_compass" in badge_ids:
        cont += 15
        cont_drivers.append({"kind": "shared_compass", "pts": 15})
    cont = int(clamp(cont))
    if cont >= 60:
        cont_summary = (
            "You complete each other's circuitry — thoughts, emotions, and "
            "actions wire into a single continuous loop."
        )
    elif cont >= 30:
        cont_summary = "Partial circuit completion — some bridges, some islands."
    else:
        cont_summary = "Mostly independent islands — connection through choice, not circuitry."

    # --- Somatic Pacing ---
    pace_drivers: list[dict[str, Any]] = []
    pace = 0
    if sacral_asymmetry(type_a, type_b):
        pace += 35
        pace_drivers.append({"kind": "sacral_asymmetry", "pts": 35})
    if _is_emotional(auth_a) and _is_emotional(auth_b):
        pace += 30
        pace_drivers.append({"kind": "double_emotional", "pts": 30})
    compromise_pts = 0
    for ch in roles["compromise"]:
        if compromise_pts >= 36:
            break
        add = min(12, 36 - compromise_pts)
        compromise_pts += add
        pace += add
        pace_drivers.append(
            {
                "kind": "compromise",
                "channel": ch["channel"],
                "gates": ch["gates"],
                "pts": add,
            }
        )
    if authority_speed_gap(auth_a, auth_b):
        pace += 10
        pace_drivers.append({"kind": "authority_speed_gap", "pts": 10})
    pace = int(clamp(pace))
    if pace >= 60:
        pace_summary = (
            "High-depth connection that thrives on intentional pacing, "
            "emotional wave surfing, and solo aura recovery."
        )
    elif pace >= 30:
        pace_summary = "Some co-regulation helps — name pace before pushing decisions."
    else:
        pace_summary = "Effortless cruise on paper — still protect solo aura after high-charge days."

    return [
        {
            "id": "auric_charge",
            "label": "Auric Charge",
            "low_label": "Independent Calm",
            "high_label": "High-Voltage Lock",
            "position": charge,
            "summary": charge_summary,
            "drivers": charge_drivers,
        },
        {
            "id": "circuit_continuity",
            "label": "Circuit Continuity",
            "low_label": "Independent Islands",
            "high_label": "Unified Single Flow",
            "position": cont,
            "summary": cont_summary,
            "drivers": cont_drivers,
        },
        {
            "id": "somatic_pacing",
            "label": "Somatic Pacing Style",
            "low_label": "Effortless Cruise",
            "high_label": "Active Co-Regulation",
            "position": pace,
            "summary": pace_summary,
            "drivers": pace_drivers,
        },
    ]


def _holder_label(holder: str) -> str:
    return "Your" if holder == "self" else "Their"


def build_cards(
    *,
    roles: dict[str, list[dict[str, Any]]],
    badge_ids: set[str],
    bridges_self: list[dict],
    bridges_friend: list[dict],
    type_a: str | None,
    type_b: str | None,
    profile_a: str | None,
    profile_b: str | None,
    auth_a: str | None,
    auth_b: str | None,
) -> list[dict[str, Any]]:
    # Card 1 — circuit_bridge
    bridge_blocks: list[dict[str, str]] = []
    if _roles_involving(
        roles, ("dominance", "electromagnetic"), (STRUCTURING_GATES, ABSTRACTION_GATES)
    ):
        # Determine who holds structuring/abstraction for swap copy
        holder_note = ""
        for key in ("dominance", "electromagnetic"):
            for ch in roles.get(key) or []:
                g = frozenset(ch.get("gates") or [])
                if g in (STRUCTURING_GATES, ABSTRACTION_GATES):
                    h = ch.get("holder") or ch.get("full")
                    if h == "self":
                        holder_note = (
                            "You help organize and articulate their abstract mental "
                            "swirls into crisp insights."
                        )
                    elif h == "friend":
                        holder_note = (
                            "They help organize and articulate your abstract mental "
                            "swirls into crisp insights."
                        )
                    break
        bridge_blocks.append(
            {
                "headline": "Mental Structuring Bridge",
                "body": holder_note
                or (
                    "You help organize and articulate their abstract mental swirls "
                    "into crisp insights."
                ),
            }
        )
    if _roles_involving(
        roles, ("dominance", "electromagnetic"), (TRANSITORINESS_GATES, CHARISMA_GATES)
    ):
        bridge_blocks.append(
            {
                "headline": "Kinetic Execution Bridge",
                "body": "They wire deep intuition into physical action and experience.",
            }
        )
    if "shared_compass" in badge_ids:
        bridge_blocks.append(
            {
                "headline": "True North Lock",
                "body": (
                    "Together you generate a defined sense of direction and presence "
                    "that neither of you holds solo."
                ),
            }
        )
    if "mutual_split_bridge" in badge_ids:
        bridge_blocks.append(
            {
                "headline": "Split → Single Flow",
                "body": (
                    "Separately you run split circuitry; together the field resolves "
                    "into one continuous definition."
                ),
            }
        )
    bridge_blocks = bridge_blocks[:4]
    all_bridges = bridges_self + bridges_friend
    circuit_card: dict[str, Any] = {
        "id": "circuit_bridge",
        "title": "How You Wire Together",
        "body_blocks": bridge_blocks
        or [
            {
                "headline": "Quiet wiring",
                "body": (
                    "No dramatic bridge theme on this pair — look at Spark & Glue "
                    "and pacing instead."
                ),
            }
        ],
        "bridges": all_bridges,
    }
    if not bridge_blocks:
        circuit_card["empty_body"] = (
            "No dramatic bridge theme on this pair — look at Spark & Glue and pacing instead."
        )

    # Card 2 — spark_glue
    spark_blocks: list[dict[str, str]] = []
    if roles["electromagnetic"]:
        lines = ", ".join(
            f"{c['channel']} ({'-'.join(str(g) for g in c['gates'])})"
            for c in roles["electromagnetic"]
        )
        spark_blocks.append(
            {
                "headline": "Spark (Electromagnetic)",
                "body": lines,
            }
        )
    if roles["companionship"]:
        lines = ", ".join(
            f"{c['channel']} ({'-'.join(str(g) for g in c['gates'])})"
            for c in roles["companionship"]
        )
        spark_blocks.append(
            {
                "headline": "Bedrock (Companionship)",
                "body": lines,
            }
        )
    if roles["dominance"]:
        lines = ", ".join(
            f"{_holder_label(c.get('holder', 'self'))} {c['channel']}"
            for c in roles["dominance"]
        )
        spark_blocks.append(
            {
                "headline": "Effortless Gifts (Dominance)",
                "body": lines,
            }
        )
    spark_card: dict[str, Any] = {
        "id": "spark_glue",
        "title": "Spark & Glue",
        "body_blocks": spark_blocks
        or [
            {
                "headline": "Quiet field",
                "body": "No electromagnetic, companionship, or dominance channels on this pair.",
            }
        ],
    }

    # Card 3 — power_dynamics
    power_blocks: list[dict[str, str]] = []
    for ch in roles["compromise"]:
        gset = frozenset(ch.get("gates") or [])
        name = ch.get("channel") or "Channel"
        if gset == STRUGGLE_GATES:
            headline = "Purpose & Tenacity Tuning"
            proto = "Check in before locking into stubborn solo battles."
        elif gset == RECOGNITION_GATES:
            headline = "Desire & Imagination Tuning"
            proto = "Label casual fantasies vs ready-to-launch plans."
        else:
            headline = f"{name} Tuning"
            proto = "Name who is running the full thermostat before pushing pace."
        full = ch.get("full", "self")
        who = "You hold the full channel" if full == "self" else "They hold the full channel"
        power_blocks.append(
            {
                "headline": headline,
                "body": f"{who} ({name}). {proto}",
            }
        )
    power_card: dict[str, Any] = {
        "id": "power_dynamics",
        "title": "Power Dynamics to Tune",
        "body_blocks": power_blocks
        or [
            {
                "headline": "Steady thermostats",
                "body": "No compromise channels — fewer thermostat collisions on paper.",
            }
        ],
    }
    if not power_blocks:
        power_card["empty_body"] = (
            "No compromise channels — fewer thermostat collisions on paper."
        )

    # Card 4 — somatic_playbook
    protocols: list[dict[str, str]] = []
    if sacral_asymmetry(type_a, type_b):
        protocols.append(
            {
                "id": "sacral_aura_hygiene",
                "title": "Sacral / Non-Sacral Aura Hygiene",
                "body": (
                    f"{type_a or 'You'} ↔ {type_b or 'Friend'}. The Sacral partner is a "
                    "nuclear reactor amplifier for the non-Sacral. Recommend 30–60 min "
                    "solo wind-down before sleep so the non-Sacral can discharge borrowed "
                    "Sacral charge without the Sacral partner reading it as rejection."
                ),
            }
        )
    if profile_a and profile_b:
        pair = {profile_a, profile_b}
        if pair == {"6/2", "5/1"}:
            body = (
                f"Profile Resonance ({profile_a} + {profile_b}). "
                "6/2 sees cleanly past 5/1 projection field; Projector waits for invitation; "
                "guide MG via binary Yes/No Sacral questions, not commands, while 20-34 "
                "is in motion."
            )
        else:
            body = (
                f"Profile Resonance ({profile_a} + {profile_b}). "
                "Honor hermit/investigator needs; don't force same social bandwidth."
            )
        protocols.append(
            {
                "id": "profile_resonance",
                "title": f"Profile Resonance ({profile_a} + {profile_b})",
                "body": body,
            }
        )
    if _is_emotional(auth_a) and _is_emotional(auth_b):
        extras = []
        if _channel_has_gates(roles["companionship"], SYNTHESIS_GATES) or _channel_has_gates(
            roles["electromagnetic"], SYNTHESIS_GATES
        ):
            extras.append("shared 19-49 comfort")
        if _channel_has_gates(roles["electromagnetic"], INTIMACY_GATES) or _channel_has_gates(
            roles["companionship"], INTIMACY_GATES
        ):
            extras.append("shared 59-6")
        if _channel_has_gates(roles["compromise"], RECOGNITION_GATES) or _channel_has_gates(
            roles["electromagnetic"], RECOGNITION_GATES
        ):
            extras.append("30-41 desire waves")
        extra_txt = (
            (" Lean into " + ", ".join(extras) + ".") if extras else ""
        )
        protocols.append(
            {
                "id": "double_emotional",
                "title": "Double Emotional Wave Surfing",
                "body": (
                    "Lean into tactile 19-49 comfort when present (food, warmth, presence; "
                    "no heavy problem-solving at wave bottom). Wait a night's sleep before "
                    "locking big decisions."
                    + extra_txt
                ),
            }
        )
    protocols = protocols[:3]
    soma_blocks: list[dict[str, str]] = [
        {"headline": p["title"], "body": p["body"]} for p in protocols
    ]
    somatic_card: dict[str, Any] = {
        "id": "somatic_playbook",
        "title": "Tailored Somatic Playbook",
        "body_blocks": soma_blocks
        or [
            {
                "headline": "Easy pacing",
                "body": (
                    "Pacing looks relatively easy on paper — still protect solo aura "
                    "time after high-charge days."
                ),
            }
        ],
        "protocols": protocols,
    }
    if not protocols:
        somatic_card["empty_body"] = (
            "Pacing looks relatively easy on paper — still protect solo aura "
            "time after high-charge days."
        )

    return [circuit_card, spark_card, power_card, somatic_card]


def compute_soul_sync(
    chart_a: dict[str, Any],
    chart_b: dict[str, Any],
    context: str = "life",
    protocols: list[str] | None = None,  # ignored (compat)
    *,
    self_meta: dict[str, Any] | None = None,
    friend_meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Aura Alchemy between chart A (self) and chart B (friend)."""
    _ = protocols  # drop Fit-era toggles
    if context not in CONTEXT_IDS:
        raise ValueError(f"invalid context: {context}")

    gates_a = _gate_set(chart_a)
    gates_b = _gate_set(chart_b)
    defined_a = _defined_set(chart_a, gates_a)
    defined_b = _defined_set(chart_b, gates_b)
    hanging_a = _hanging(chart_a, gates_a)
    hanging_b = _hanging(chart_b, gates_b)

    roles = classify_channel_roles(gates_a, gates_b)
    bridges_self = split_bridge_locks(
        hanging_a, gates_b, held_by="friend", missing_for="self"
    )
    bridges_friend = split_bridge_locks(
        hanging_b, gates_a, held_by="self", missing_for="friend"
    )

    composite_gates = gates_a | gates_b
    composite_channels = active_channels(composite_gates)
    composite_defined = defined_centers(composite_channels)
    newly_motors = sorted((composite_defined & MOTORS) - defined_a - defined_b)

    # Prefer derived definition from live gates (authoritative for badges)
    def_a = definition_for_gates(gates_a)
    def_b = definition_for_gates(gates_b)
    def_comp = derive_definition(composite_defined, composite_channels)

    type_a = (self_meta or {}).get("type") or chart_a.get("type")
    type_b = (friend_meta or {}).get("type") or chart_b.get("type")
    profile_a = (self_meta or {}).get("profile") or chart_a.get("profile")
    profile_b = (friend_meta or {}).get("profile") or chart_b.get("profile")
    auth_a = (self_meta or {}).get("authority") or chart_a.get("authority")
    auth_b = (friend_meta or {}).get("authority") or chart_b.get("authority")

    badges = detect_badges(
        def_a=def_a,
        def_b=def_b,
        def_comp=def_comp,
        defined_a=defined_a,
        defined_b=defined_b,
        composite_defined=composite_defined,
        gates_a=gates_a,
        gates_b=gates_b,
        composite_gates=composite_gates,
        roles=roles,
        bridges_self=bridges_self,
        bridges_friend=bridges_friend,
    )
    badge_ids = {b["id"] for b in badges}

    signature, secondary = detect_signatures(
        roles=roles,
        badge_ids=badge_ids,
        def_a=def_a,
        def_b=def_b,
        def_comp=def_comp,
        composite_defined_count=len(composite_defined),
        auth_a=auth_a,
        auth_b=auth_b,
    )

    bridge_gates = {b["gate"] for b in bridges_self} | {b["gate"] for b in bridges_friend}
    spectrums = build_spectrums(
        roles=roles,
        bridges_all_gates=bridge_gates,
        newly_motors=newly_motors,
        badge_ids=badge_ids,
        def_a=def_a,
        def_b=def_b,
        def_comp=def_comp,
        auth_a=auth_a,
        auth_b=auth_b,
        type_a=type_a,
        type_b=type_b,
    )

    cards = build_cards(
        roles=roles,
        badge_ids=badge_ids,
        bridges_self=bridges_self,
        bridges_friend=bridges_friend,
        type_a=type_a,
        type_b=type_b,
        profile_a=profile_a,
        profile_b=profile_b,
        auth_a=auth_a,
        auth_b=auth_b,
    )

    self_out = {
        "id": (self_meta or {}).get("id"),
        "label": (self_meta or {}).get("label") or "Me",
        "type": type_a,
        "profile": profile_a,
        "authority": auth_a,
        "definition": def_a,
    }
    friend_out = {
        "id": (friend_meta or {}).get("id"),
        "label": (friend_meta or {}).get("label") or "Friend",
        "type": type_b,
        "profile": profile_b,
        "authority": auth_b,
        "definition": def_b,
    }

    return {
        "self": self_out,
        "friend": friend_out,
        "context": context,
        "playbook": {
            "id": context,
            "label": CONTEXT_LABELS[context],
            "card_order": list(PLAYBOOK_CARD_ORDER[context]),
            **build_playbook_lede(signature["id"], context),
        },
        "signature": signature,
        "secondary_signature": secondary,
        "badges": badges,
        "spectrums": spectrums,
        "cards": cards,
        "channel_roles": roles,
        "split_bridges": bridges_self,
        "friend_split_bridges": bridges_friend,
        "conditioning_strip": conditioning_strip(defined_a, defined_b),
        "composite": {
            "defined_count": len(composite_defined),
            "open_count": 9 - len(composite_defined),
            "definition": def_comp,
            "defined_centers": sorted(composite_defined),
        },
        "disclaimer": DISCLAIMER,
    }
