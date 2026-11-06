"""Partner relationship insight layer for Soul (additive copy only).

Emitted only when Person B role is partner. Does not alter Soul mechanics.
"""
from __future__ import annotations

from typing import Any

from .channels import CHANNELS

# Canonical HD types used in natal chart_json["type"].
HD_TYPES = (
    "Manifestor",
    "Generator",
    "Manifesting Generator",
    "Projector",
    "Reflector",
)

PartnerNuance = dict[str, str]
PartnerOverview = dict[str, str]


def _norm_type(raw: str | None) -> str | None:
    if not raw:
        return None
    t = str(raw).strip()
    aliases = {
        "MG": "Manifesting Generator",
        "ManifestingGenerator": "Manifesting Generator",
        "Gen": "Generator",
        "Man": "Manifestor",
        "Proj": "Projector",
        "Ref": "Reflector",
    }
    if t in aliases:
        return aliases[t]
    if t in HD_TYPES:
        return t
    # Case-insensitive match
    lower = {x.lower(): x for x in HD_TYPES}
    return lower.get(t.lower())


def type_pair_key(type_a: str | None, type_b: str | None) -> str | None:
    a = _norm_type(type_a)
    b = _norm_type(type_b)
    if not a or not b:
        return None
    return "|".join(sorted([a, b]))


def channel_gate_key(gates: list[int] | tuple[int, ...] | None) -> str | None:
    if not gates or len(gates) < 2:
        return None
    g1, g2 = int(gates[0]), int(gates[1])
    lo, hi = (g1, g2) if g1 <= g2 else (g2, g1)
    return f"{lo}-{hi}"


_CHANNEL_NAME_TO_GATES: dict[str, tuple[int, int]] = {
    name: (g1, g2) for g1, g2, name in CHANNELS
}


def partner_nuance_for_channel_name(name: str | None) -> PartnerNuance | None:
    if not name:
        return None
    gates = _CHANNEL_NAME_TO_GATES.get(str(name).strip())
    if not gates:
        return None
    return partner_nuance_for_gates(gates)


# Exact handoff copy — Generator + Projector (ASCII apostrophes).
_GEN_PROJ_OVERVIEW: PartnerOverview = {
    "core_dynamic": (
        "A Generator brings consistent life force and a sacral yes-or-no; a Projector "
        "brings seeing, guidance, and the need to be recognized. As a couple this often "
        "works when the Generator's energy is invited into what the Projector actually "
        "sees, and the Projector is recognized rather than asked to match sacral stamina."
    ),
    "mutual_growth": (
        "The Generator can practice waiting for a sacral response before pouring energy "
        "into the relationship's plans. The Projector can practice inviting and "
        "recognizing that energy instead of managing it. Both grow when rest and "
        "recognition are treated as part of the bond, not as a reward you earn after "
        "overgiving."
    ),
    "relationship_challenges": (
        "The usual friction is pace and proof. The Generator may feel unseen if their "
        "work and yes-energy are taken for granted. The Projector may feel exhausted or "
        "bitter if they are expected to keep up, initiate everything, or prove their "
        "value through output. Rushing decisions to match the other person's tempo — "
        "without invitation or a sacral response — creates resentment that is not "
        "really about love."
    ),
}

# Exact handoff copy — Electromagnetic Intimacy 59-6 / 6-59.
_INTIMACY_NUANCE: PartnerNuance = {
    "romantic_synergy": (
        "Completing Intimacy together can make closeness feel unusually available — "
        "bonding, fertility, and letting each other past the walls. As a couple this "
        "often shows up as a natural pull toward physical and emotional honesty when "
        "the emotional wave is open, not forced."
    ),
    "romantic_friction": (
        "The same wire can make space feel like rejection, or closeness feel like "
        "pressure. One person's need to bond and the other's need to protect the walls "
        "can look like a love problem when it is the channel asking for timing and "
        "consent. Name the rhythm aloud so neither of you has to guess."
    ),
}


def _ov(core: str, growth: str, challenges: str) -> PartnerOverview:
    return {
        "core_dynamic": core,
        "mutual_growth": growth,
        "relationship_challenges": challenges,
    }


def _nu(syn: str, fri: str) -> PartnerNuance:
    return {"romantic_synergy": syn, "romantic_friction": fri}


# Unordered Type x Type overviews (sorted name keys).
PARTNER_OVERVIEW_BY_TYPES: dict[str, PartnerOverview] = {
    "Generator|Projector": _GEN_PROJ_OVERVIEW,
    "Generator|Generator": _ov(
        "Two Generators bring dual sacral engines — abundant life force, work capacity, "
        "and a shared vocabulary of gut yes-or-no. As a couple this often thrives when "
        "each person's sacral response is respected as equal authority, not overridden "
        "by who is louder or more tired that day.",
        "Practice checking in with your own sacral before agreeing to shared plans. "
        "Celebrate that rest is productive for both of you. Growth shows up when you "
        "stop competing for who did more and start designing days around two honest "
        "responses instead of one fused agenda.",
        "Friction often looks like burnout theater: both saying yes to keep the peace, "
        "then resenting the pile-up. Or one sacral goes quiet and the other fills the "
        "gap until bitterness appears. Slow the joint calendar when either gut goes "
        "flat — that is information, not failure.",
    ),
    "Generator|Manifesting Generator": _ov(
        "A Generator's steady sacral and a Manifesting Generator's multi-track response "
        "can feel like reliable fuel meeting agile ignition. As a couple this works when "
        "the MG informs before leaping and the Generator is allowed a clean sacral "
        "answer without being rushed into the MG's next lane.",
        "The MG can practice finishing (or consciously parking) threads so the Generator "
        "is not left holding half-started plans. The Generator can practice trusting "
        "bursts of initiation when the sacral is still a yes. Both grow by naming "
        "which projects are shared versus solo.",
        "Usual chafe: pace mismatch. The MG may feel slowed; the Generator may feel "
        "scattered or overrun. Skipping the sacral check to match the other's tempo "
        "creates quiet resentment that shows up as nagging, withdrawal, or busywork "
        "instead of clear no's.",
    ),
    "Generator|Manifestor": _ov(
        "A Generator offers consistent sacral life force; a Manifestor brings initiating "
        "spark and the need to inform. As a couple this often works when the Manifestor "
        "informs before acting and the Generator's yes-or-no is treated as real data, "
        "not as a brake to override.",
        "The Manifestor can practice informing early enough that the Generator has time "
        "to respond. The Generator can practice not taking initiation personally when "
        "it is simply Manifestor design. Growth lives in shared rituals of inform → "
        "respond → adjust.",
        "Friction clusters around surprise and control. The Generator may feel steamrolled "
        "by unannounced moves. The Manifestor may feel managed or slowed. Turning every "
        "initiation into a committee — or every sacral no into a veto without conversation "
        "— drains the bond of trust.",
    ),
    "Generator|Reflector": _ov(
        "A Generator's sacral consistency meets a Reflector's lunar sampling and need "
        "for healthy environments. As a couple this often works when the Generator does "
        "not demand instant clarity and the Reflector is not asked to match sacral "
        "output or decide on Generator time.",
        "The Generator can practice protecting calm, clear spaces for the Reflector to "
        "sample the relationship honestly. The Reflector can practice naming environmental "
        "needs early. Both grow when the lunar wait is treated as wisdom, not delay.",
        "Friction: the Generator wants a gut answer now; the Reflector needs a cycle. "
        "Pushing for certainty before the sample lands — or reading Reflector openness "
        "as flakiness — creates pressure that is about timing, not care.",
    ),
    "Manifesting Generator|Manifesting Generator": _ov(
        "Two Manifesting Generators bring fast sacral response, multi-passion voltage, "
        "and a shared temptation to skip informing. As a couple this can feel electric "
        "and productive when you both inform each other before lane-changes and allow "
        "courses to correct without shame.",
        "Practice shorter feedback loops: inform, sacral-check, adjust. Celebrate "
        "efficient pivots instead of unfinished guilt. Growth shows when you design "
        "recovery into the calendar so the dual engines do not run until empty.",
        "Friction often looks like parallel spinning — both mid-leap, neither fully "
        "landing — or competitive initiation. Unspoken expectations about who finishes "
        "what turn into scorekeeping. Name the open threads weekly so speed does not "
        "become chaos.",
    ),
    "Manifesting Generator|Manifestor": _ov(
        "An MG's sacral agility meets a Manifestor's pure initiate-and-inform design. "
        "As a couple this often works when the Manifestor informs before the leap and "
        "the MG does not treat every Manifestor move as a joint project that needs "
        "their sacral stamp mid-flight.",
        "The Manifestor can leave clear space for the MG to respond without absorbing "
        "the initiation. The MG can practice finishing shared threads before starting "
        "three more. Both grow by separating solo initiations from couple decisions.",
        "Usual chafe: who got to move first, and who cleaned up. The MG may feel "
        "outpaced or under-informed; the Manifestor may feel managed. Skipping inform "
        "or sacral checks to keep the thrill creates repair debt.",
    ),
    "Manifesting Generator|Projector": _ov(
        "An MG brings multi-track sacral response; a Projector brings seeing and the "
        "need for recognition and invitation. As a couple this often works when the "
        "Projector is invited into what they see, and the MG informs before dumping "
        "half-finished lanes into the shared field.",
        "The MG can practice inviting recognition before asking for guidance. The "
        "Projector can practice not managing the MG's many threads. Both grow when "
        "rest and recognition are scheduled, not earned after burnout.",
        "Friction: the Projector feels scattered by MG pivots; the MG feels slowed or "
        "critiqued. Forcing the Projector to keep sacral pace — or the MG to freeze "
        "until fully recognized — creates bitterness that is about design, not devotion.",
    ),
    "Manifesting Generator|Reflector": _ov(
        "An MG's fast multi-response meets a Reflector's need to sample over a lunar "
        "cycle in a clean environment. As a couple this works when speed is not treated "
        "as proof of love and the Reflector's wait is not treated as rejection.",
        "The MG can practice parking non-urgent leaps until the Reflector has sampled. "
        "The Reflector can name which environments help them feel the relationship "
        "clearly. Growth is shared pacing agreements you revisit monthly.",
        "Friction clusters around urgency. The MG wants to move; the Reflector needs "
        "time and space. Pushing for sacral-speed clarity — or reading Reflector "
        "sampling as disinterest — invents a love problem out of timing mechanics.",
    ),
    "Manifestor|Manifestor": _ov(
        "Two Manifestors bring dual initiate-and-inform engines — high independence "
        "and a shared allergy to being controlled. As a couple this often works when "
        "informing is mutual and frequent, and neither tries to become the other's "
        "manager.",
        "Practice inform-as-care: short updates before leaps. Protect parallel freedom "
        "and deliberate together-time so independence does not become distance. Growth "
        "shows when anger is treated as a signal to inform earlier, not as proof you "
        "are incompatible.",
        "Friction: surprise collisions, competing initiations, or silent scoreboards "
        "about who disrupted whom. Skipping the inform to avoid a conversation creates "
        "exactly the anger you hoped to dodge.",
    ),
    "Manifestor|Projector": _ov(
        "A Manifestor initiates and needs to inform; a Projector sees and needs to be "
        "invited and recognized. As a couple this often works when the Manifestor "
        "informs early and invites the Projector's seeing — and the Projector does not "
        "try to initiate or manage the Manifestor's moves.",
        "The Manifestor can practice recognition as part of informing. The Projector "
        "can practice waiting for invitation before guiding. Both grow when impact is "
        "named without turning it into control.",
        "Usual friction: the Projector feels blindsided or unrecognized; the Manifestor "
        "feels slowed or corrected. Guidance without invitation, or initiation without "
        "inform, creates bitterness that is about strategy, not affection.",
    ),
    "Manifestor|Reflector": _ov(
        "A Manifestor's initiate-and-inform design meets a Reflector's lunar sampling "
        "and environmental sensitivity. As a couple this works when the Manifestor "
        "informs with enough lead time for the Reflector to sample, and the Reflector "
        "is not pressured to match Manifestor speed.",
        "The Manifestor can treat informing as creating a safe sample window. The "
        "Reflector can name environments that make the bond feel clear. Growth lives "
        "in paced initiations and protected quiet.",
        "Friction: Manifestor leaps feel like shocks; Reflector waits feel like stalls. "
        "Neither is a character flaw — rushing the lunar sample or withholding inform "
        "turns timing into a fake fight about care.",
    ),
    "Projector|Projector": _ov(
        "Two Projectors bring mutual seeing, guidance gifts, and a shared need for "
        "recognition and sustainable energy. As a couple this often works when you "
        "invite each other explicitly and refuse to compete for who sees more.",
        "Practice taking turns: one guides, one receives, then swap. Protect rest as "
        "a couple practice, not a private secret. Growth shows when recognition is "
        "spoken often enough that bitterness has less room to grow.",
        "Friction: unrecognized guidance, advice competitions, or both overgiving until "
        "empty. Expecting the other Projector to supply sacral stamina they do not have "
        "creates exhaustion that gets mislabeled as relationship failure.",
    ),
    "Projector|Reflector": _ov(
        "A Projector's focused seeing meets a Reflector's whole-environment sampling. "
        "As a couple this often works when the Projector invites rather than diagnoses, "
        "and the Reflector is recognized for reflecting the relationship's health "
        "without being turned into a permanent judge.",
        "The Projector can practice curiosity over correction. The Reflector can name "
        "what the field is showing without claiming final authority. Both grow when "
        "invitation and lunar timing are respected together.",
        "Friction: the Projector pushes for clarity the Reflector has not sampled yet; "
        "the Reflector mirrors Projector bitterness back amplified. Slow the feedback "
        "loop and check the environment before treating the mirror as a verdict.",
    ),
    "Reflector|Reflector": _ov(
        "Two Reflectors bring dual lunar sampling and high environmental sensitivity. "
        "As a couple this often works when you co-design calm, clear spaces and allow "
        "decisions the time of a cycle instead of forcing Generator-speed answers.",
        "Practice naming which rooms, people, and routines help you both feel the bond "
        "clearly. Protect solitude and shared sampling time. Growth is treating "
        "waiting as care, not as avoidance.",
        "Friction: mutual delay without communication, or absorbing each other's "
        "indecision until the field feels foggy. If the environment is chaotic, the "
        "relationship will feel chaotic — fix the space before diagnosing the love.",
    ),
}


# Channel nuances keyed by sorted gate pair "lo-hi".
PARTNER_NUANCE_BY_CHANNEL: dict[str, PartnerNuance] = {
    "6-59": _INTIMACY_NUANCE,
    "1-8": _nu(
        "Completing Inspiration together can make creative voice feel shared — ideas "
        "spark and want an audience. As a couple this often shows up as cheering each "
        "other's expression when the field is open.",
        "The same wire can turn feedback into identity threat. One person's muse "
        "energy and the other's need for quiet can look like rejection when it is "
        "timing around creative charge. Name when you want witnesses versus solitude.",
    ),
    "2-14": _nu(
        "Completing The Beat can make direction and resources feel rhythmic together — "
        "a shared pulse for work and provision. As a couple this often shows as natural "
        "coordination around money, pace, and where energy goes.",
        "The same channel can make control fights about tempo. One wants to hold the "
        "beat; the other feels marched. Agree on who sets pace for which domains so "
        "rhythm does not become domination.",
    ),
    "3-60": _nu(
        "Completing Mutation can make change feel fertile between you — breakthroughs "
        "after pressure. As a couple this often shows as growth spurts after stuck "
        "seasons when you stay with the process.",
        "The same wire can make melancholy or format fights feel personal. Pressure "
        "to mutate on command looks like a love problem when it is the channel's "
        "pulse. Protect downtime between format shifts.",
    ),
    "4-63": _nu(
        "Completing Logic together can make shared doubt useful — questions that "
        "improve the plan. As a couple this often shows as constructive pattern-checking "
        "when both feel safe to ask why.",
        "The same channel can turn skepticism into nitpicking. Endless proof-seeking "
        "can starve warmth. Time-box analysis so logic serves the bond instead of "
        "replacing trust.",
    ),
    "5-15": _nu(
        "Completing Rhythm can make daily patterns feel naturally synced — sleep, "
        "food, movement. As a couple this often shows as ease when your body clocks "
        "align without forcing it.",
        "The same wire can pathologize different tempos. Night owl versus early bird "
        "becomes a character judgment. Design parallel rhythms instead of demanding "
        "identical schedules.",
    ),
    "7-31": _nu(
        "Completing The Alpha can make leadership feel shared or clearly handed — "
        "influence with a voice. As a couple this often shows as clean roles when "
        "you agree who leads which arena.",
        "The same channel can spark power struggles about who speaks for the pair. "
        "Unspoken hierarchy becomes resentment. Explicitly rotate or divide leadership "
        "domains.",
    ),
    "9-52": _nu(
        "Completing Concentration can make focus feel co-held — deep work and still "
        "attention. As a couple this often shows as supporting each other's focus "
        "blocks without distraction as a love language.",
        "The same wire can make restlessness feel like disloyalty. One needs stillness; "
        "the other needs motion. Protect focus windows and name when presence means "
        "quiet versus activity.",
    ),
    "10-20": _nu(
        "Completing Awakening can make presence and selfhood feel awake together — "
        "identity meeting expression. As a couple this often shows as honest "
        "self-sharing in the moment.",
        "The same channel can amplify self-consciousness. Awake does not mean always "
        "on display. Allow private selfhood so presence does not become performance.",
    ),
    "10-34": _nu(
        "Completing Exploration can make empowered self-expression feel available — "
        "doing from identity. As a couple this often shows as supporting bold "
        "experiments when sacral energy is a yes.",
        "The same wire can confuse exploration with recklessness. One person's "
        "empowerment can feel like abandonment. Agree what experiments are solo versus "
        "shared before the leap.",
    ),
    "10-57": _nu(
        "Completing Perfected Form can make intuitive self-care feel mutual — body "
        "wisdom shared. As a couple this often shows as trusting gut/spleen signals "
        "about what environments fit.",
        "The same channel can turn aesthetic or health preferences into moral tests. "
        "Different body truths are not rejections. Ask before assuming your form is "
        "the couple's rule.",
    ),
    "11-56": _nu(
        "Completing Curiosity can make storytelling and seeking feel bonded — ideas "
        "want to travel. As a couple this often shows as lively sharing of what you "
        "are learning.",
        "The same wire can make restlessness or exaggeration feel like flakiness. "
        "Curiosity without landing can starve follow-through. Choose which stories "
        "become commitments.",
    ),
    "12-22": _nu(
        "Completing Openness can make social and emotional timing feel melodic — "
        "knowing when to engage. As a couple this often shows as graceful entries "
        "and exits from social fields.",
        "The same channel can make mood look like rejection. Closed for now is not "
        "closed forever. Ask about wave timing before inventing a love narrative.",
    ),
    "13-33": _nu(
        "Completing The Prodigal can make listening and secrets feel safe — a shared "
        "witness. As a couple this often shows as being able to tell the hard stories "
        "and be heard.",
        "The same wire can create pressure to confess or to hold too much. Privacy "
        "and disclosure need consent. Do not treat silence as betrayal or disclosure "
        "as owed.",
    ),
    "16-48": _nu(
        "Completing The Wavelength can make talent and depth feel coached — skill "
        "meeting pattern. As a couple this often shows as helping each other refine "
        "craft without crushing joy.",
        "The same channel can turn critique into inadequacy. Depth anxiety meets "
        "talent pride. Ask whether feedback was invited before polishing each other.",
    ),
    "17-62": _nu(
        "Completing Acceptance can make opinions find clean language — details that "
        "organize. As a couple this often shows as useful clarity when you are both "
        "ready to name facts.",
        "The same wire can weaponize correctness. Being right can cost warmth. Soften "
        "delivery and check whether the detail matters to the bond right now.",
    ),
    "18-58": _nu(
        "Completing Judgment can make improvement feel shared — tasting what could be "
        "better. As a couple this often shows as constructive standards for health, "
        "home, or craft.",
        "The same channel can make correction feel like contempt. Joyless fixing "
        "erodes goodwill. Balance critique with explicit appreciation in the same "
        "breath.",
    ),
    "19-49": _nu(
        "Completing Synthesis can make tribal needs feel mutually sensed — food, "
        "support, belonging. As a couple this often shows as natural caretaking when "
        "the emotional weather is steady.",
        "The same wire can turn neediness or principles into tests. Sensitivity without "
        "naming needs becomes crisis. Say the small need early.",
    ),
    "20-34": _nu(
        "Completing Charisma can make doing-in-the-moment feel magnetic — busy "
        "presence. As a couple this often shows as getting things done together when "
        "energy is high.",
        "The same channel can make stillness feel wrong. Always-on charisma burns "
        "the bond. Schedule off-stage recovery so capability does not become the "
        "only intimacy.",
    ),
    "20-57": _nu(
        "Completing The Brain Wave can make intuitive timing for speech and action "
        "feel sharp together. As a couple this often shows as knowing when to speak "
        "or move without overthinking.",
        "The same wire can punish hesitation. Intuitive speed is not a moral grade. "
        "Allow slower authorities room so intuition does not steamroll consent.",
    ),
    "21-45": _nu(
        "Completing The Money Line can make resources and control feel tribal — "
        "who holds the keys. As a couple this often shows as clear agreements about "
        "money and material care when roles are spoken.",
        "The same channel can ignite control fights about spending and access. "
        "Unspoken ownership becomes resentment. Write the resource rules down.",
    ),
    "23-43": _nu(
        "Completing Structuring can make insights land in language — breakthrough to "
        "sentence. As a couple this often shows as helping each other say the weird "
        "truth cleanly.",
        "The same wire can make genius feel lonely mid-process. Mute insights or "
        "harsh delivery both hurt. Ask for structuring help when ready, not mid-fog.",
    ),
    "24-61": _nu(
        "Completing Awareness can make mental pressure feel shared — mystery seeking "
        "resolution. As a couple this often shows as deep talks that eventually click.",
        "The same channel can loop anxiety together. Obsessive knowing crowds out "
        "presence. Time-box mystery talks and return to the body.",
    ),
    "25-51": _nu(
        "Completing Initiation can make shock and courage feel bonding — heart "
        "competitiveness that wakes love. As a couple this often shows as brave leaps "
        "you take side by side.",
        "The same wire can turn initiation into provocation. Shock without care "
        "feels like attack. Consent to intensity before you spike the field.",
    ),
    "26-44": _nu(
        "Completing Surrender can make transmission and instinct feel sales-smart "
        "together — knowing what to offer. As a couple this often shows as effective "
        "team pitching or household negotiation.",
        "The same channel can smell like manipulation when trust is thin. Instinct "
        "without transparency erodes safety. Disclose motives when the stakes are "
        "shared.",
    ),
    "27-50": _nu(
        "Completing Preservation can make caretaking and values feel tribal — "
        "protecting what matters. As a couple this often shows as reliable support "
        "around health, kids, or principles.",
        "The same wire can over-care or moralize. Martyrdom and rigid rules both "
        "chafe. Ask what care is wanted before delivering it.",
    ),
    "28-38": _nu(
        "Completing Struggle can make purposeful fight feel shared — meaning through "
        "effort. As a couple this often shows as standing together for what is worth "
        "it.",
        "The same channel can glorify conflict. Fighting for its own sake drains "
        "tenderness. Choose which struggles are couple projects versus solo.",
    ),
    "29-46": _nu(
        "Completing Discovery can make commitment to experience feel alive — saying "
        "yes to the process. As a couple this often shows as adventures you finish "
        "together.",
        "The same wire can confuse persistence with stubbornness. Over-commitment "
        "without sacral truth breeds regret. Re-check the yes mid-journey.",
    ),
    "30-41": _nu(
        "Completing Recognition can make desire and feeling feel vivid together — "
        "hunger that wants a story. As a couple this often shows as intense longing "
        "and creative yearning when waves align.",
        "The same channel can make craving feel like destiny pressure. Unmet desire "
        "becomes blame. Name the feeling without demanding the other person fix it.",
    ),
    "32-54": _nu(
        "Completing Transformation can make ambition feel co-supported — drive with "
        "instinct. As a couple this often shows as backing each other's material "
        "or status climbs when values match.",
        "The same wire can turn the bond into a ladder. Climbing without care "
        "hollows intimacy. Keep non-achievement time sacred.",
    ),
    "34-57": _nu(
        "Completing Power can make intuitive sacral force feel available — knowing "
        "when to act. As a couple this often shows as clean bursts of capable action "
        "together.",
        "The same channel can make rest feel unsafe. Power without pauses becomes "
        "pressure. Protect recovery so force does not define the relationship.",
    ),
    "35-36": _nu(
        "Completing Transitoriness can make experience-seeking feel shared — hunger "
        "for the next story. As a couple this often shows as adventure chemistry "
        "when both want newness.",
        "The same wire can confuse novelty with love. Crashing after highs feels "
        "like failure. Plan integration after big experiences.",
    ),
    "37-40": _nu(
        "Completing Community can make bargains and belonging feel warm — deals that "
        "hold the tribe. As a couple this often shows as clear agreements about "
        "who does what at home.",
        "The same channel can keep score. Unbalanced bargains breed quiet rage. "
        "Renegotiate deals before bitterness hardens.",
    ),
    "39-55": _nu(
        "Completing Emoting can make mood and spirit feel mutually catalytic — "
        "emotional weather that moves. As a couple this often shows as deep feeling "
        "shared when the wave is honored.",
        "The same wire can provoke for connection. Provocation without care feels "
        "cruel. Ask for emotional company instead of poking the wave.",
    ),
    "42-53": _nu(
        "Completing Maturation can make cycles feel co-held — beginnings and endings "
        "with meaning. As a couple this often shows as supporting each other through "
        "chapters without forcing forever language.",
        "The same channel can fear endings or rush them. Cycles are not verdicts on "
        "love. Name which chapter you are in together.",
    ),
    "47-64": _nu(
        "Completing Abstraction can make mental pressure resolve into insight — "
        "confusion to meaning. As a couple this often shows as talking through fog "
        "until a shared picture appears.",
        "The same wire can overthink the relationship. Abstract loops starve "
        "embodied contact. Leave the spiral for a walk when talk stops helping.",
    ),
}

# Alias keys used in copy / badges (59-6 etc.)
PARTNER_NUANCE_BY_CHANNEL["59-6"] = PARTNER_NUANCE_BY_CHANNEL["6-59"]


def partner_overview_for_types(
    type_a: str | None, type_b: str | None
) -> PartnerOverview | None:
    key = type_pair_key(type_a, type_b)
    if not key:
        return None
    return PARTNER_OVERVIEW_BY_TYPES.get(key)


def partner_nuance_for_gates(
    gates: list[int] | tuple[int, ...] | None,
) -> PartnerNuance | None:
    key = channel_gate_key(gates)
    if not key:
        return None
    return PARTNER_NUANCE_BY_CHANNEL.get(key)


def is_partner_role(role: str | None) -> bool:
    return (role or "").strip().lower() == "partner"


def apply_partner_layer(
    result: dict[str, Any],
    *,
    friend_role: str | None,
    type_a: str | None,
    type_b: str | None,
) -> dict[str, Any]:
    """Mutate/return soul sync dict with partner_overview + channel nuances when partner."""
    friend = result.get("friend") or {}
    # Always stamp role on friend (and self) for FE guards.
    friend = {**friend, "role": friend_role if friend_role in ("partner", "person") else (friend_role or "person")}
    self_out = result.get("self") or {}
    if "role" not in self_out:
        self_out = {**self_out, "role": "self"}
    result = {**result, "self": self_out, "friend": friend}

    if not is_partner_role(friend_role):
        # Ensure keys absent for non-partner
        result.pop("partner_overview", None)
        return result

    overview = partner_overview_for_types(type_a, type_b)
    if overview:
        result["partner_overview"] = dict(overview)
    else:
        result["partner_overview"] = None

    roles = result.get("channel_roles") or {}
    for key in ("electromagnetic", "companionship"):
        rows = roles.get(key) or []
        new_rows = []
        for ch in rows:
            nuance = partner_nuance_for_gates(ch.get("gates"))
            if nuance:
                new_rows.append({**ch, "partner_nuance": dict(nuance)})
            else:
                new_rows.append(dict(ch))
        roles[key] = new_rows
    result["channel_roles"] = roles

    # Attach partner_nuance onto circuit_bridge bridges by channel name when available.
    # Do not rewrite body_blocks.
    cards = result.get("cards") or []
    new_cards = []
    for card in cards:
        card = dict(card)
        bridges = card.get("bridges")
        if bridges:
            new_bridges = []
            for b in bridges:
                b = dict(b)
                nuance = partner_nuance_for_channel_name(b.get("channel"))
                if nuance:
                    b["partner_nuance"] = dict(nuance)
                new_bridges.append(b)
            card["bridges"] = new_bridges
        new_cards.append(card)
    result["cards"] = new_cards

    return result
