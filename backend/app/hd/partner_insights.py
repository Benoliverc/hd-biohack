"""Partner Love guidance layer for Soul (additive copy only).

Emitted only when Person B role is partner. Does not alter Soul mechanics.
"""
from __future__ import annotations

from typing import Any

from .channels import CHANNELS
from .partner_names import (
    apply_how_you_love_name,
    first_name_from_label,
    how_they_love_for_type,
    personalize_structure,
)

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
PartnerPairChapters = dict[str, str]


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


# Exact handoff copy — Type love-language bank (ASCII apostrophes).
TYPE_LOVE_BANK: dict[str, str] = {
    "Generator": (
        "You love by putting real energy where a yes lives — showing up and staying "
        "with what lights you. The person next to you feels that love when your yes "
        "and your no are equally honest."
    ),
    "Manifesting Generator": (
        "You love in more than one lane at once — bursts of yes and quick course-corrections. "
        "The person next to you feels that love when you tell them as you pivot, so they are riding with you."
    ),
    "Manifestor": (
        "You love by starting things and clearing a path no one else would have opened. "
        "The person next to you feels that love when you tell them first, so a new move lands as care instead of surprise."
    ),
    "Projector": (
        "You love by seeing someone clearly — guiding and inviting the right use "
        "of their energy. The person next to you feels that love when you are asked "
        "to share what you see, not asked to match a stamina you do not have."
    ),
    "Reflector": (
        "You love by sampling the life you share and reflecting it back with surprising "
        "clarity. The person next to you feels that love when they give you time and a "
        "healthy place, instead of demanding instant certainty."
    ),
}


def _ov(
    hook: str,
    the_current: str,
    what_this_asks: str,
    tender_spots: str,
    try_this: str,
) -> PartnerPairChapters:
    return {
        "hook": hook,
        "the_current": the_current,
        "what_this_asks": what_this_asks,
        "tender_spots": tender_spots,
        "try_this": try_this,
    }


def _nu(gift: str, tender: str) -> PartnerNuance:
    return {
        "gift_in_love": gift,
        "tender_spot": tender,
        "romantic_synergy": gift,
        "romantic_friction": tender,
    }


# Exact handoff gold sample — Generator + Projector.
_GEN_PROJ_OVERVIEW: PartnerPairChapters = _ov(
    "One of you is the steady yes. The other sees what that yes is for.",
    "Life together can feel like a warm engine meeting a clear eye. When it is good, "
    "one of you feels used well — not used up — and the other feels seen without having "
    "to perform a stamina they do not have.",
    "This bond asks for rest and recognition as part of how you love, not a prize after "
    "overgiving. Protect energy that is offered freely, and sight that is actually wanted.",
    "The usual ache is feeling invisible, or exhausted from trying to keep up. Rushing to "
    "match each other's tempo creates a distance that is not really about whether you care.",
    "Generator: offer only a real yes. Projector: offer guidance only when asked. "
    "Afterward, name what felt easing.",
)

# Exact handoff gold sample — Intimacy 59-6 / 6-59.
_INTIMACY_NUANCE: PartnerNuance = _nu(
    "When you complete Intimacy together, closeness can feel unusually available — "
    "bonding, fertility, a pull to let each other past the walls. In love this often "
    "shows up as a natural honesty, physical and emotional, when feelings have room to settle, rather than being "
    "pushed.",
    "The same wire can make space feel like rejection, or closeness feel like pressure. "
    "One of you reaching for bond while the other protects the walls can look like a "
    "love problem when it is really a request for timing and consent. Say the rhythm "
    "out loud so neither of you has to guess.",
)


# Unordered Type x Type pair chapters (sorted name keys). Love-language fields are
# attached directionally in partner_overview_for_types.
PARTNER_OVERVIEW_BY_TYPES: dict[str, PartnerPairChapters] = {
    "Generator|Projector": _GEN_PROJ_OVERVIEW,
    "Generator|Generator": _ov(
        "Two steady yeses in one home. The care is making sure neither of you gets steamrolled.",
        "Life together can feel like two warm engines in the same room. When both of you are "
        "honest about capacity, the days fill with real energy instead of polite overcommitment.",
        "This bond asks you to treat rest as part of how you love each other. Design days around "
        "two honest responses instead of one fused agenda.",
        "The usual ache is both saying yes to keep the peace, then resenting the pile-up. Slow "
        "the shared calendar when either of you goes flat — that is information, not a failure of love.",
        "Before you lock a shared plan, both of you answer out loud without persuading the other. "
        "Keep only what both still say yes to.",
    ),
    "Generator|Manifesting Generator": _ov(
        "One of you is the steady burn. The other is the multi-lane spark.",
        "Life together can feel like reliable life force meeting quick course-corrections. When "
        "it is good, pivots are named and a real answer is allowed without a rush into the next lane.",
        "This bond asks you to finish or park threads so neither of you is left holding half-started "
        "plans. Name which projects are shared versus solo.",
        "The usual ache is pace — one of you feels slowed, the other scattered or overrun. Matching "
        "the other person's tempo without an honest check creates quiet resentment.",
        "Pick one shared thread. Name the next pivot out loud before moving, and answer only when "
        "you mean it. Then say what felt easing.",
    ),
    "Generator|Manifestor": _ov(
        "One of you carries the steady yes. The other clears paths no one else would open.",
        "Life together can feel like steady life-force meeting a spark that starts things. When "
        "it is good, a new move is named early enough for a real answer, and initiation is not treated as a personal override.",
        "This bond asks you to treat a heads-up as care, and initiation as design rather than "
        "disrespect. A short update, then an honest response, is how you move together.",
        "The usual ache clusters around surprise and control. One of you feels steamrolled; the "
        "other feels managed or slowed. That drain is not really about whether you care.",
        "Try one new move with a clear heads-up first, and one honest yes or no — spoken kindly. "
        "Afterward, name what felt like care instead of surprise.",
    ),
    "Generator|Reflector": _ov(
        "One of you gets an answer in the moment. The other needs a cycle and a healthy place to know.",
        "Life together can feel like consistent warmth meeting a slower, place-sensitive knowing. "
        "When it is good, calm space is protected and neither of you is asked to decide on the other's clock.",
        "This bond asks you to treat waiting as wisdom you share, not delay you argue about. Name "
        "what the environment needs early.",
        "The usual ache is one of you wanting an answer now while the other still needs time. "
        "Pushing for certainty before the sample lands creates pressure about timing, not care.",
        "Pick one decision and give it a named waiting window. Hold the space without demanding "
        "a same-day answer, then say what felt easing.",
    ),
    "Manifesting Generator|Manifesting Generator": _ov(
        "Two multi-lane yeses under one roof. The care is telling each other before the next leap.",
        "Life together can feel electric and productive — and tempting to skip the update. When "
        "it is good, you both name a lane-change and let a course correct without shame.",
        "This bond asks for shorter feedback loops and recovery on the calendar, so two engines "
        "do not run until empty. Celebrate a clean pivot instead of unfinished guilt.",
        "The usual ache is parallel spinning: both mid-leap, neither fully landing. Name the open "
        "threads so speed does not become chaos.",
        "Sit for ten minutes and each name your open threads out loud. Park or finish one together.",
    ),
    "Manifesting Generator|Manifestor": _ov(
        "One of you pivots across lanes. The other starts clean and tells you first.",
        "Life together can feel fast: agility meeting a clear start. When it is good, a leap is "
        "named early, and not every move becomes a joint project mid-flight.",
        "This bond asks you to leave room to respond without absorbing every start, and to finish "
        "shared threads before opening three more. Separate solo moves from couple decisions out loud.",
        "The usual ache is who got to move first, and who cleaned up. Skipping a heads-up to keep "
        "the thrill creates repair debt that is not about love.",
        "Try one leap with a full heads-up first, and finish one shared thread before any new lane "
        "opens. Then say what felt like teamwork.",
    ),
    "Manifesting Generator|Projector": _ov(
        "One of you runs multi-track yeses. The other sees what those tracks are for.",
        "Life together can feel like agile response meeting a clear eye. When it is good, one of "
        "you feels guided without being managed, and the other feels used well without matching a stamina they do not have.",
        "This bond asks for recognition before guidance, and for rest as part of how you love — "
        "scheduled, not earned after burnout.",
        "The usual ache is one of you feeling scattered by pivots, and the other feeling slowed "
        "or critiqued. That bitterness is about design, not devotion.",
        "Invite sight into one thread only, after a clear ask. Guide that one. Afterward, name "
        "what felt easing.",
    ),
    "Manifesting Generator|Reflector": _ov(
        "One of you is ready to move on a spark. The other needs time and a clean field to know.",
        "Life together can feel like fast multi-response meeting a slower sample. When it is good, "
        "speed is not treated as proof of love, and a wait is not treated as rejection.",
        "This bond asks you to park non-urgent leaps until the sample has landed, and to name "
        "which environments help the relationship feel clear.",
        "The usual ache clusters around urgency. Pushing for instant clarity — or reading sampling "
        "as disinterest — invents a love problem out of timing.",
        "Choose one non-urgent leap and give it a named sample window. Wait without sulking, then "
        "report what the field showed.",
    ),
    "Manifestor|Manifestor": _ov(
        "Two people who start things. The care is telling each other before either of you leaps.",
        "Life together can feel like dual engines that hate being managed. When it is good, short "
        "updates are mutual, and neither of you becomes the other's boss.",
        "This bond asks for short updates before leaps, plus solo space and together-time chosen "
        "on purpose. Treat anger as a signal to speak earlier, not as proof you cannot love each other.",
        "The usual ache is surprise collisions or silent scoreboards about who disrupted whom. "
        "Skipping the update to avoid a conversation creates exactly the anger you hoped to dodge.",
        "Both of you name one leap before it happens — even a small one. Afterward, say what felt "
        "like freedom shared instead of collision.",
    ),
    "Manifestor|Projector": _ov(
        "One of you starts the path. The other sees the path clearly.",
        "Life together can feel like impact meeting sight. When it is good, a new move is named "
        "early and sight is invited, and guidance does not try to manage the move.",
        "This bond asks for recognition as part of a heads-up, and for waiting to be asked before "
        "guiding. Name impact without turning it into control.",
        "The usual ache is feeling blindsided or unrecognized on one side, and slowed or corrected "
        "on the other. That bitterness is about how you start and how you guide, not about affection.",
        "Try one start with an early heads-up and a clear invite for what the other sees. Wait for "
        "that invite before guiding.",
    ),
    "Manifestor|Reflector": _ov(
        "One of you leaps. The other samples. Love here is lead time and a healthy place.",
        "Life together can feel like a clear start meeting a slower, place-sensitive knowing. When "
        "it is good, a move is named with enough lead time, and neither of you is pressured to match the other's speed.",
        "This bond asks you to treat a heads-up as a safe sample window, and to name environments "
        "that make the bond feel clear.",
        "The usual ache is that a leap feels like a shock, or a wait feels like a stall. Neither "
        "is a character flaw — rushing the sample turns timing into a fake fight about care.",
        "Name one move with a real sample window attached. Name the environment you need. Then say "
        "what felt like care instead of shock.",
    ),
    "Projector|Projector": _ov(
        "Two people who see. The care is refusing to compete for who sees more.",
        "Life together can feel like guidance meeting guidance. When it is good, you invite each "
        "other explicitly, take turns receiving, and protect rest as a couple practice.",
        "This bond asks you to take turns: one guides, one receives, then swap. Speak recognition "
        "before either of you has to earn it through overgiving.",
        "The usual ache is unrecognized guidance, or both overgiving until empty. Expecting the "
        "other person to supply a stamina they do not have creates exhaustion mislabeled as failure.",
        "Take a timed turn: one of you only receives recognition and guidance; then swap. Afterward, "
        "say what felt easing.",
    ),
    "Projector|Reflector": _ov(
        "One of you sees in focus. The other mirrors the whole field.",
        "Life together can feel like focused seeing meeting whole-environment sampling. When it is "
        "good, curiosity leads, and reflecting the relationship's health is not turned into a permanent verdict.",
        "This bond asks for curiosity over correction, and for naming what the field is showing "
        "without claiming final authority.",
        "The usual ache is pushing for clarity that has not been sampled yet, or mirroring urgency "
        "back louder. Check the environment before treating the mirror as a verdict on love.",
        "Before any big feedback, check the room together. Ask one curious question, and answer what "
        "the field shows.",
    ),
    "Reflector|Reflector": _ov(
        "Two samplers under one moon. The care is refusing rushed answers.",
        "Life together can feel like dual sampling and high sensitivity to place. When it is good, "
        "you co-design calm spaces and allow decisions the time of a cycle.",
        "This bond asks you to name which rooms, people, and routines help you both feel the bond "
        "clearly. Treat waiting as how you love each other.",
        "The usual ache is mutual delay without communication, or a chaotic place making the bond "
        "feel chaotic. Tend the space before diagnosing the love.",
        "Redesign one shared space together for calm, then give one decision a named cycle. Afterward, "
        "say what the clearer field reflected back.",
    ),
}

# Channel nuances keyed by sorted gate pair "lo-hi".
PARTNER_NUANCE_BY_CHANNEL: dict[str, PartnerNuance] = {
    "6-59": _INTIMACY_NUANCE,
    "1-8": _nu(
        "When you complete Inspiration together, creative voice can feel shared — ideas "
        "spark and want a witness. In love this often shows up as cheering each other's "
        "expression when the field is open rather than forced.",
        "The same wire can turn feedback into identity threat. One of you wanting a muse "
        "audience while the other needs quiet can look like rejection when it is timing "
        "around creative charge. Say when you want witnesses versus solitude.",
    ),
    "2-14": _nu(
        "When you complete The Beat together, direction and resources can feel rhythmic — "
        "a shared pulse for work and provision. In love this often shows up as natural "
        "coordination around money, pace, and where energy goes.",
        "The same wire can make control fights about tempo. One of you wants to hold the "
        "beat; the other feels marched. Agree on who sets pace for which domains so "
        "rhythm does not become domination.",
    ),
    "3-60": _nu(
        "When you complete Mutation together, change can feel fertile between you — "
        "breakthroughs after pressure. In love this often shows up as growth spurts after "
        "stuck seasons when you stay with the process instead of forcing it.",
        "The same wire can make melancholy or format fights feel personal. Pressure to "
        "mutate on command looks like a love problem when it is the channel's pulse. "
        "Protect downtime between format shifts.",
    ),
    "4-63": _nu(
        "When you complete Logic together, shared doubt can become useful — questions that "
        "improve the plan. In love this often shows up as constructive pattern-checking "
        "when both of you feel safe to ask why.",
        "The same wire can turn skepticism into nitpicking. Endless proof-seeking can "
        "starve warmth. Time-box analysis so logic serves the bond instead of replacing "
        "trust.",
    ),
    "5-15": _nu(
        "When you complete Rhythm together, daily patterns can feel naturally synced — "
        "sleep, food, movement. In love this often shows up as ease when your body clocks "
        "align without forcing it.",
        "The same wire can pathologize different tempos. Night owl versus early bird "
        "becomes a character judgment. Design parallel rhythms instead of demanding "
        "identical schedules.",
    ),
    "7-31": _nu(
        "When you complete The Alpha together, leadership can feel shared or clearly "
        "handed — influence with a voice. In love this often shows up as clean roles when "
        "you agree who leads which arena.",
        "The same wire can spark power struggles about who speaks for the pair. Unspoken "
        "hierarchy becomes resentment. Explicitly rotate or divide leadership domains.",
    ),
    "9-52": _nu(
        "When you complete Concentration together, focus can feel co-held — deep work and "
        "still attention. In love this often shows up as supporting each other's focus "
        "blocks without treating distraction as a love language.",
        "The same wire can make restlessness feel like disloyalty. One of you needs "
        "stillness; the other needs motion. Protect focus windows and name when presence "
        "means quiet versus activity.",
    ),
    "10-20": _nu(
        "When you complete Awakening together, presence and selfhood can feel awake — "
        "identity meeting expression. In love this often shows up as honest self-sharing "
        "in the moment.",
        "The same wire can amplify self-consciousness. Awake does not mean always on "
        "display. Allow private selfhood so presence does not become performance.",
    ),
    "10-34": _nu(
        "When you complete Exploration together, empowered self-expression can feel "
        "available — doing from identity. In love this often shows up as supporting bold "
        "experiments when gut energy is a yes.",
        "The same wire can confuse exploration with recklessness. One person's empowerment "
        "can feel like abandonment. Agree what experiments are solo versus shared before "
        "the leap.",
    ),
    "10-57": _nu(
        "When you complete Perfected Form together, intuitive self-care can feel mutual — "
        "body wisdom shared. In love this often shows up as trusting gut and spleen "
        "signals about what environments fit.",
        "The same wire can turn aesthetic or health preferences into moral tests. "
        "Different body truths are not rejections. Ask before assuming your form is the "
        "couple's rule.",
    ),
    "11-56": _nu(
        "When you complete Curiosity together, storytelling and seeking can feel bonded — "
        "ideas want to travel. In love this often shows up as lively sharing of what you "
        "are learning.",
        "The same wire can make restlessness or exaggeration feel like flakiness. "
        "Curiosity without landing can starve follow-through. Choose which stories become "
        "commitments.",
    ),
    "12-22": _nu(
        "When you complete Openness together, social and emotional timing can feel "
        "melodic — knowing when to engage. In love this often shows up as graceful "
        "entries and exits from social fields.",
        "The same wire can make mood look like rejection. Closed for now is not closed "
        "forever. Ask about wave timing before inventing a love narrative.",
    ),
    "13-33": _nu(
        "When you complete The Prodigal together, listening and secrets can feel safe — "
        "a shared witness. In love this often shows up as being able to tell the hard "
        "stories and be heard.",
        "The same wire can create pressure to confess or to hold too much. Privacy and "
        "disclosure need consent. Do not treat silence as betrayal or disclosure as owed.",
    ),
    "16-48": _nu(
        "When you complete The Wavelength together, talent and depth can feel coached — "
        "skill meeting pattern. In love this often shows up as helping each other refine "
        "craft without crushing joy.",
        "The same wire can turn critique into inadequacy. Depth anxiety meets talent "
        "pride. Ask whether feedback was invited before polishing each other.",
    ),
    "17-62": _nu(
        "When you complete Acceptance together, opinions can find clean language — "
        "details that organize. In love this often shows up as useful clarity when you "
        "are both ready to name facts.",
        "The same wire can weaponize correctness. Being right can cost warmth. Soften "
        "delivery and check whether the detail matters to the bond right now.",
    ),
    "18-58": _nu(
        "When you complete Judgment together, improvement can feel shared — tasting what "
        "could be better. In love this often shows up as constructive standards for "
        "health, home, or craft.",
        "The same wire can make correction feel like contempt. Joyless fixing erodes "
        "goodwill. Balance critique with explicit appreciation in the same breath.",
    ),
    "19-49": _nu(
        "When you complete Synthesis together, tribal needs can feel mutually sensed — "
        "food, support, belonging. In love this often shows up as natural caretaking when "
        "the emotional weather is steady.",
        "The same wire can turn neediness or principles into tests. Sensitivity without "
        "naming needs becomes crisis. Say the small need early.",
    ),
    "20-34": _nu(
        "When you complete Charisma together, doing-in-the-moment can feel magnetic — "
        "busy presence. In love this often shows up as getting things done together when "
        "energy is high.",
        "The same wire can make stillness feel wrong. Always-on charisma burns the bond. "
        "Schedule off-stage recovery so capability does not become the only intimacy.",
    ),
    "20-57": _nu(
        "When you complete The Brain Wave together, intuitive timing for speech and "
        "action can feel sharp. In love this often shows up as knowing when to speak or "
        "move without overthinking.",
        "The same wire can punish hesitation. Intuitive speed is not a moral grade. Allow "
        "slower authorities room so intuition does not steamroll consent.",
    ),
    "21-45": _nu(
        "When you complete The Money Line together, resources and control can feel "
        "tribal — who holds the keys. In love this often shows up as clear agreements "
        "about money and material care when roles are spoken.",
        "The same wire can ignite control fights about spending and access. Unspoken "
        "ownership becomes resentment. Write the resource rules down.",
    ),
    "23-43": _nu(
        "When you complete Structuring together, insights can land in language — "
        "breakthrough to sentence. In love this often shows up as helping each other say "
        "the weird truth cleanly.",
        "The same wire can make genius feel lonely mid-process. Mute insights or harsh "
        "delivery both hurt. Ask for structuring help when ready, not mid-fog.",
    ),
    "24-61": _nu(
        "When you complete Awareness together, mental pressure can feel shared — mystery "
        "seeking resolution. In love this often shows up as deep talks that eventually "
        "click.",
        "The same wire can loop anxiety together. Obsessive knowing crowds out presence. "
        "Time-box mystery talks and return to the body.",
    ),
    "25-51": _nu(
        "When you complete Initiation together, shock and courage can feel bonding — "
        "heart competitiveness that wakes love. In love this often shows up as brave "
        "leaps you take side by side.",
        "The same wire can turn initiation into provocation. Shock without care feels "
        "like attack. Consent to intensity before you spike the field.",
    ),
    "26-44": _nu(
        "When you complete Surrender together, transmission and instinct can feel "
        "sales-smart — knowing what to offer. In love this often shows up as effective "
        "team pitching or household negotiation.",
        "The same wire can smell like manipulation when trust is thin. Instinct without "
        "transparency erodes safety. Disclose motives when the stakes are shared.",
    ),
    "27-50": _nu(
        "When you complete Preservation together, caretaking and values can feel tribal — "
        "protecting what matters. In love this often shows up as reliable support around "
        "health, kids, or principles.",
        "The same wire can over-care or moralize. Martyrdom and rigid rules both chafe. "
        "Ask what care is wanted before delivering it.",
    ),
    "28-38": _nu(
        "When you complete Struggle together, purposeful fight can feel shared — meaning "
        "through effort. In love this often shows up as standing together for what is "
        "worth it.",
        "The same wire can glorify conflict. Fighting for its own sake drains tenderness. "
        "Choose which struggles are couple projects versus solo.",
    ),
    "29-46": _nu(
        "When you complete Discovery together, commitment to experience can feel alive — "
        "saying yes to the process. In love this often shows up as adventures you finish "
        "together.",
        "The same wire can confuse persistence with stubbornness. Over-commitment without "
        "gut truth breeds regret. Re-check the yes mid-journey.",
    ),
    "30-41": _nu(
        "When you complete Recognition together, desire and feeling can feel vivid — "
        "hunger that wants a story. In love this often shows up as intense longing and "
        "creative yearning when waves align.",
        "The same wire can make craving feel like pressure. Unmet desire becomes blame. "
        "Name the feeling without demanding the other person fix it.",
    ),
    "32-54": _nu(
        "When you complete Transformation together, ambition can feel co-supported — "
        "drive with instinct. In love this often shows up as backing each other's "
        "material or status climbs when values match.",
        "The same wire can turn the bond into a ladder. Climbing without care hollows "
        "intimacy. Keep non-achievement time sacred.",
    ),
    "34-57": _nu(
        "When you complete Power together, intuitive life-force can feel available — "
        "knowing when to act. In love this often shows up as clean bursts of capable "
        "action together.",
        "The same wire can make rest feel unsafe. Power without pauses becomes pressure. "
        "Protect recovery so force does not define the relationship.",
    ),
    "35-36": _nu(
        "When you complete Transitoriness together, experience-seeking can feel shared — "
        "hunger for the next story. In love this often shows up as adventure chemistry "
        "when both want newness.",
        "The same wire can confuse novelty with love. Crashing after highs feels like "
        "failure. Plan integration after big experiences.",
    ),
    "37-40": _nu(
        "When you complete Community together, bargains and belonging can feel warm — "
        "deals that hold the tribe. In love this often shows up as clear agreements about "
        "who does what at home.",
        "The same wire can keep score. Unbalanced bargains breed quiet rage. Renegotiate "
        "deals before bitterness hardens.",
    ),
    "39-55": _nu(
        "When you complete Emoting together, mood and spirit can feel mutually catalytic "
        "— emotional weather that moves. In love this often shows up as deep feeling "
        "shared when the wave is honored.",
        "The same wire can provoke for connection. Provocation without care feels cruel. "
        "Ask for emotional company instead of poking the wave.",
    ),
    "42-53": _nu(
        "When you complete Maturation together, cycles can feel co-held — beginnings and "
        "endings with meaning. In love this often shows up as supporting each other "
        "through chapters without forcing forever language.",
        "The same wire can fear endings or rush them. Cycles are not verdicts on love. "
        "Name which chapter you are in together.",
    ),
    "47-64": _nu(
        "When you complete Abstraction together, mental pressure can resolve into insight "
        "— confusion to meaning. In love this often shows up as talking through fog until "
        "a shared picture appears.",
        "The same wire can overthink the relationship. Abstract loops starve embodied "
        "contact. Leave the spiral for a walk when talk stops helping.",
    ),
}

# Alias keys used in copy / badges (59-6 etc.)
PARTNER_NUANCE_BY_CHANNEL["59-6"] = PARTNER_NUANCE_BY_CHANNEL["6-59"]


def partner_overview_for_types(
    type_a: str | None, type_b: str | None
) -> PartnerOverview | None:
    """Build directional Love guidance overview for You (type_a) and Partner (type_b)."""
    key = type_pair_key(type_a, type_b)
    if not key:
        return None
    pair = PARTNER_OVERVIEW_BY_TYPES.get(key)
    if not pair:
        return None
    a = _norm_type(type_a)
    b = _norm_type(type_b)
    how_you = TYPE_LOVE_BANK.get(a or "")
    how_they = how_they_love_for_type(b)
    if not how_you or not how_they:
        return None
    the_current = pair["the_current"]
    what_this_asks = pair["what_this_asks"]
    tender_spots = pair["tender_spots"]
    return {
        "hook": pair["hook"],
        "the_current": the_current,
        "how_you_love": how_you,
        "how_they_love": how_they,
        "what_this_asks": what_this_asks,
        "tender_spots": tender_spots,
        "try_this": pair["try_this"],
        # Legacy aliases — same strings as the new chapter fields.
        "core_dynamic": the_current,
        "mutual_growth": what_this_asks,
        "relationship_challenges": tender_spots,
    }


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
    defined_a: set[str] | frozenset[str] | list[str] | None = None,
    defined_b: set[str] | frozenset[str] | list[str] | None = None,
    auth_a: str | None = None,
    auth_b: str | None = None,
    label_a: str | None = None,
    label_b: str | None = None,
) -> dict[str, Any]:
    """Mutate/return soul sync dict with partner_overview + channel nuances when partner."""
    friend = result.get("friend") or {}
    # Always stamp role on friend (and self) for FE guards.
    friend = {
        **friend,
        "role": friend_role
        if friend_role in ("partner", "person")
        else (friend_role or "person"),
    }
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
        overview = dict(overview)
        # Late import avoids any chance of cycle if dynamics grows imports.
        from .partner_love_dynamics import build_partner_dynamics

        overview.update(
            build_partner_dynamics(
                type_a=type_a,
                type_b=type_b,
                defined_a=defined_a,
                defined_b=defined_b,
                auth_a=auth_a,
                auth_b=auth_b,
                channel_roles=result.get("channel_roles") or {},
            )
        )
        # label_a is accepted for API symmetry; Me running prose stays "you".
        name_b = first_name_from_label(label_b)
        if name_b:
            they = how_they_love_for_type(type_b, name_b)
            if they:
                overview["how_they_love"] = they
            if overview.get("how_you_love"):
                overview["how_you_love"] = apply_how_you_love_name(
                    overview["how_you_love"], name_b
                )
            overview = personalize_structure(
                overview, type_a=type_a, type_b=type_b, name_b=name_b
            )
        result["partner_overview"] = overview
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

    name_b = first_name_from_label(label_b)
    if name_b:
        if result.get("channel_roles"):
            result["channel_roles"] = personalize_structure(
                result["channel_roles"], type_a=type_a, type_b=type_b, name_b=name_b
            )
        if result.get("cards"):
            result["cards"] = personalize_structure(
                result["cards"], type_a=type_a, type_b=type_b, name_b=name_b
            )

    return result
