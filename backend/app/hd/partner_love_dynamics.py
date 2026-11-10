"""Partner Love dynamics — harmony, friction, decide, communicate, clash.

Deterministic banks only. Partner role. Does not import soul_sync.
"""
from __future__ import annotations

from typing import Any

from .partner_insights import type_pair_key

CENTER_KEYS = (
    "Head",
    "Ajna",
    "Throat",
    "G",
    "Heart",
    "Solar_Plexus",
    "Sacral",
    "Spleen",
    "Root",
)

FRICTION_CENTER_PRIORITY = (
    "Solar_Plexus",
    "Sacral",
    "Throat",
    "G",
    "Heart",
    "Root",
    "Spleen",
    "Ajna",
    "Head",
)

HARMONY_BOTH_DEFINED_PRIORITY = (
    "Solar_Plexus",
    "Sacral",
    "G",
    "Throat",
    "Heart",
)

AUTH_NORMS = (
    "emotional",
    "sacral",
    "splenic",
    "ego",
    "self-projected",
    "lunar",
    "mental",
)

TEMPO_GAP_NORMS = {
    frozenset({"emotional", "sacral"}),
    frozenset({"emotional", "splenic"}),
}

CLASH_TEMPO_SENTENCE = (
    "Do not try to settle the fight on the faster person's clock."
)


def _item(id_: str, title: str, body: str, try_: str) -> dict[str, str]:
    return {"id": id_, "title": title, "body": body, "try": try_}


def _section(title: str, body: str, try_: str, voice: str | None = None) -> dict[str, str]:
    out = {"title": title, "body": body, "try": try_}
    if voice:
        out["voice"] = voice
    return out


def normalize_authority(raw: str | None) -> str | None:
    if not raw:
        return None
    a = str(raw).strip().lower()
    if "emotional" in a or "solar plexus" in a:
        return "emotional"
    if a.startswith("sacral") or a == "sacral":
        return "sacral"
    if "splenic" in a or a == "spleen":
        return "splenic"
    if "ego" in a or ("heart" in a and "self" not in a):
        return "ego"
    if "self-projected" in a or "self projected" in a or "self_projected" in a:
        return "self-projected"
    if "lunar" in a:
        return "lunar"
    if "mental" in a or "environmental" in a or "outer authority" in a:
        return "mental"
    return None


def authority_pair_key(auth_a: str | None, auth_b: str | None) -> str | None:
    a = normalize_authority(auth_a)
    b = normalize_authority(auth_b)
    if not a or not b:
        return None
    return "|".join(sorted([a, b]))


def _shared_authority_class(auth_a: str | None, auth_b: str | None) -> bool:
    a = normalize_authority(auth_a)
    b = normalize_authority(auth_b)
    if not a or not b:
        return False
    return a == b and a in ("emotional", "sacral", "splenic")


def _center_state(center: str, defined_a: set[str], defined_b: set[str]) -> str:
    a = center in defined_a
    b = center in defined_b
    if not a and b:
        return "you_open_they_defined"
    if a and not b:
        return "you_defined_they_open"
    if a and b:
        return "both_defined"
    return "both_open"


# ---------------------------------------------------------------------------
# Center banks — 9 x 4. Tests lock to these bank strings (retargeted with the rewrite).
# ---------------------------------------------------------------------------

CENTER_BANK: dict[str, dict[str, dict[str, str]]] = {
    "Solar_Plexus": {
        "you_open_they_defined": {
            "title": "Their moods can become yours",
            "body": (
                "Their moods run on a steadier pattern than yours. A mood that is passing "
                "for them can start to feel like your day, or a verdict on the relationship."
            ),
            "try": (
                "When a strong mood arrives, wait before you decide anything about \"us.\" "
                "Name it: \"I might be feeling your mood, not mine.\""
            ),
        },
        "you_defined_they_open": {
            "title": "Your feelings can fill the room",
            "body": (
                "Your feelings move in a wave that is yours — it has a truth at both ends. "
                "If you ask them how they feel about \"us\" mid-wave, they may be reporting your mood, not their own."
            ),
            "try": (
                "Say where you are on the wave (\"I'm not clear yet\") so they don't have to "
                "solve a feeling that isn't theirs."
            ),
        },
        "both_defined": {
            "title": "Two emotional climates",
            "body": (
                "You each have a wave, and those waves will not always crest together. "
                "The harmony is that you can both understand \"not yet\" as honesty, not avoidance."
            ),
            "try": (
                "When something matters, agree to revisit it after one sleep — or after the "
                "charge has actually moved."
            ),
        },
        "both_open": {
            "title": "Moods in the room can color you both",
            "body": (
                "Neither of you has a fixed emotional pattern. Moods in the room can color "
                "both of you. The stretch is not turning every shared mood into a story about the relationship."
            ),
            "try": (
                "After an intense evening, check the room before you check the relationship. "
                "Ask: \"Is this about us, or about what we just walked through?\""
            ),
        },
    },
    "Sacral": {
        "you_open_they_defined": {
            "title": "Their energy can set the pace",
            "body": (
                "They get a clear body yes or no, and that signal can feel louder than your "
                "own energy. The stretch is not treating their pace as the law of the house."
            ),
            "try": (
                "Before you agree to a shared push, answer only for you. Say: \"I need a minute "
                "to feel if I have energy for that.\""
            ),
        },
        "you_defined_they_open": {
            "title": "You set the energy tempo",
            "body": (
                "You get a clear body yes or no about what has energy. If you treat every yes "
                "as a joint project, they may agree on your energy instead of their capacity."
            ),
            "try": (
                "When something big lights up for you, ask whether they want in before you "
                "schedule them into it. Offer: \"This is my yes — you can watch, join, or pass.\""
            ),
        },
        "both_defined": {
            "title": "You both have a body yes and no",
            "body": (
                "You both have a real body yes and no, so a lot of energy lives in one home. "
                "The harmony is honest response meeting honest response when both are allowed to speak."
            ),
            "try": (
                "Before you lock a plan, both of you answer out loud, with no sales pitch. "
                "If either yes goes flat, change the plan."
            ),
        },
        "both_open": {
            "title": "Energy in the room can pull you both",
            "body": (
                "Neither of you has a fixed energy motor. The energy in the room can pull "
                "both of you into overdoing. The stretch is not outsourcing your rest to whoever looks busier."
            ),
            "try": (
                "Name a shared recovery window this week that does not depend on finishing the "
                "list first. Protect it like a date."
            ),
        },
    },
    "Throat": {
        "you_open_they_defined": {
            "title": "Their voice lands loud",
            "body": (
                "Their words can land like a decision. Pause before treating a sentence as the "
                "plan — their expression is not automatically a joint commitment."
            ),
            "try": (
                "Let them finish. Then say back the request in your own words before you agree."
            ),
        },
        "you_defined_they_open": {
            "title": "Your words carry weight",
            "body": (
                "What you say casually can sound like a settled plan to them. A thought said "
                "out loud may land as something they feel they must follow."
            ),
            "try": (
                "When you are thinking out loud, label it: \"I'm brainstorming, not deciding yet.\" "
                "Ask what they heard."
            ),
        },
        "both_defined": {
            "title": "Two voices in the room",
            "body": (
                "Both of your voices want clear airtime. The harmony is that neither of you is "
                "built to stay mute — when you take turns, the bond stays clear."
            ),
            "try": (
                "In one important talk, use a simple turn rule: one speaks until they say "
                "\"I'm done,\" then the other."
            ),
        },
        "both_open": {
            "title": "A shared quiet voice",
            "body": (
                "Words may come slowly, through writing, or only when the room feels safe. "
                "The stretch is assuming silence means agreement."
            ),
            "try": (
                "Before a decision talk, write one sentence each privately, then read them aloud."
            ),
        },
    },
    "G": {
        "you_open_they_defined": {
            "title": "Their sense of direction",
            "body": (
                "Their sense of who they are and where they are going can feel like a compass "
                "you borrow. The stretch is losing your own place when their direction fills the room."
            ),
            "try": (
                "Once this week, name one place or plan that is yours alone — even a small one "
                "— before you merge calendars."
            ),
        },
        "you_defined_they_open": {
            "title": "You carry a clear direction",
            "body": (
                "You have a steady sense of self and path. They can orient to it, then feel lost "
                "when you change course or need solo time."
            ),
            "try": (
                "When you share a direction, invite theirs: \"This is where I'm pointed — where "
                "are you?\" Wait for an answer that is not just an echo."
            ),
        },
        "both_defined": {
            "title": "Two clear identities",
            "body": (
                "You can feel like two true norths under one roof — steady, and sometimes stubborn. "
                "The harmony is respect for who each of you is when neither tries to rewrite the other."
            ),
            "try": (
                "Pick one domain (home, money, weekend) where each of you leads without the other "
                "correcting mid-stream."
            ),
        },
        "both_open": {
            "title": "A shared search for place",
            "body": (
                "Who you are together can shift with place, people, and season. The stretch is "
                "clinging to a shared story because uncertainty feels like failure."
            ),
            "try": (
                "Ask together: \"Where do we feel most like ourselves lately?\" Let place and "
                "people be data, not a verdict on the bond."
            ),
        },
    },
    "Heart": {
        "you_open_they_defined": {
            "title": "Their will and promises",
            "body": (
                "Their promises and willpower can feel like a standard you should match. You may "
                "overcommit to prove loyalty, then burn out."
            ),
            "try": (
                "Before you make a promise beside theirs, ask what you can keep on a bad week. "
                "Say that smaller yes out loud."
            ),
        },
        "you_defined_they_open": {
            "title": "You hold the will charge",
            "body": (
                "You can make and keep commitments with a certain force. They may promise from "
                "your will instead of their capacity. Fights about who is \"stronger\" usually miss that."
            ),
            "try": (
                "When you want a joint commitment, ask what they can actually sustain — and accept "
                "a smaller bargain without treating it as less love."
            ),
        },
        "both_defined": {
            "title": "Two wills in the bargain",
            "body": (
                "Commitments can feel serious — and pride can make soft renegotiation feel like "
                "losing. The harmony is two people who can stand by a deal when the deal is fair."
            ),
            "try": (
                "Rewrite one household bargain this week so both of you feel honored. Say the new "
                "deal out loud, then stop scorekeeping."
            ),
        },
        "both_open": {
            "title": "A shared soft will",
            "body": (
                "Proof-of-love through overpromising can sneak in from the culture around you. "
                "The stretch is competing to look reliable instead of being honest."
            ),
            "try": (
                "Replace one vague \"I'll handle it\" with a specific, smaller promise you can keep."
            ),
        },
    },
    "Root": {
        "you_open_they_defined": {
            "title": "Their pressure clock",
            "body": (
                "Their sense of pressure and deadline can flood your nervous system. You may rush "
                "to clear their adrenaline as if it were yours."
            ),
            "try": (
                "When urgency spikes around them, ask: \"Is this deadline mine?\" If not, take one "
                "slow breath before you move."
            ),
        },
        "you_defined_they_open": {
            "title": "You bring the pressure pulse",
            "body": (
                "Pressure and drive have a pulse that is yours. What feels like healthy fuel for "
                "you can feel like a fire alarm for them."
            ),
            "try": (
                "When you feel the push to move now, say whether the deadline is real or just fuel. "
                "Invite a calmer pace without shame."
            ),
        },
        "both_defined": {
            "title": "Two pressure engines",
            "body": (
                "Momentum can be mutual — and so can mutual burnout if every spike becomes a couple "
                "emergency. The harmony is shared drive with shared recovery."
            ),
            "try": (
                "After one high-pressure day, schedule a no-agenda evening on purpose. Treat downtime "
                "as part of the engine, not a reward."
            ),
        },
        "both_open": {
            "title": "Outside pressure can climb into you both",
            "body": (
                "Outside deadlines and other people's stress can climb into both of you. The stretch "
                "is making every borrowed urgency a story about the relationship."
            ),
            "try": (
                "When both of you feel rushed, name the source out loud before you blame each other."
            ),
        },
    },
    "Spleen": {
        "you_open_they_defined": {
            "title": "Their instinctive alerts",
            "body": (
                "Their instinct about safety, health, and timing can feel authoritative. You may "
                "adopt their fears or preferences as your own."
            ),
            "try": (
                "When they say \"this feels off,\" pause — then check your own body before you agree. "
                "You are allowed a second read."
            ),
        },
        "you_defined_they_open": {
            "title": "You hold the instinct clock",
            "body": (
                "Spontaneous awareness about what is healthy or timely moves through you. A passing "
                "instinct can become a household rule if you are not careful."
            ),
            "try": (
                "When you share an instinct, mark whether it is a hard stop or a soft preference. "
                "Leave them room to feel their own body."
            ),
        },
        "both_defined": {
            "title": "Two instinctive readers",
            "body": (
                "Intuitive alerts can stack — or compete. The harmony is two people who can trust "
                "a body no without a long trial."
            ),
            "try": (
                "Agree that either person's clear body no pauses a plan for one beat — then revisit "
                "with curiosity, not debate."
            ),
        },
        "both_open": {
            "title": "Fear stories can color you both",
            "body": (
                "Health trends, fear stories, and other people's alarms can color both of you. The "
                "stretch is collecting anxieties until the home feels unsafe for no clear reason."
            ),
            "try": (
                "When fear spikes, ask where it entered the room before you redesign the relationship "
                "around it."
            ),
        },
    },
    "Ajna": {
        "you_open_they_defined": {
            "title": "Their mind and opinions",
            "body": (
                "Their certainty can feel like the correct analysis. You may abandon a half-formed "
                "thought to match their framework."
            ),
            "try": (
                "In one disagreement, state your unfinished thought first: \"I'm still forming this, "
                "but...\" Finish it before you invite their critique."
            ),
        },
        "you_defined_they_open": {
            "title": "You hold a steady mind",
            "body": (
                "Concepts arrive with more consistency for you. They can absorb your framework and "
                "lose their own working theory mid-conversation."
            ),
            "try": (
                "Ask for their version before you deliver yours. Leave one opinion unsettled on purpose."
            ),
        },
        "both_defined": {
            "title": "Two steady minds",
            "body": (
                "Debates can be rich — and stuck. The harmony is two people who can hold a view "
                "without needing the room to convert."
            ),
            "try": (
                "Time-box one recurring debate. When the timer ends, name one thing you still respect "
                "about the other's view."
            ),
        },
        "both_open": {
            "title": "A shared open mind",
            "body": (
                "Ideas around you — podcasts, friends, headlines — can swing both of you. The stretch "
                "is outsourcing every decision to the loudest theory of the week."
            ),
            "try": (
                "Before a decision, each of you writes the question in one sentence without research."
            ),
        },
    },
    "Head": {
        "you_open_they_defined": {
            "title": "Their mental pressure",
            "body": (
                "Their questions and mental pressure can fill your mind until you cannot tell which "
                "inspiration is yours. The stretch is carrying their unanswered questions as anxiety."
            ),
            "try": (
                "When your mind races after talking with them, ask: \"Is this my question?\" Write down "
                "what is theirs and set it aside."
            ),
        },
        "you_defined_they_open": {
            "title": "You bring the questions",
            "body": (
                "Mental pressure and inspiration have a familiar pulse for you. They can lose sleep "
                "over puzzles that are yours to hold."
            ),
            "try": (
                "When you share a big question, say whether you want brainstorming or just a witness. "
                "Let them opt out of solving it."
            ),
        },
        "both_defined": {
            "title": "Two pressurized minds",
            "body": (
                "Inspiration and doubt can ping-pong until neither of you rests. The harmony is a "
                "shared respect for unanswered questions."
            ),
            "try": (
                "Park one shared question on paper with a revisit date. Give both of you a night off "
                "from solving it."
            ),
        },
        "both_open": {
            "title": "A shared open head",
            "body": (
                "Other people's questions and media pressure can colonize both minds. The stretch is "
                "mistaking every borrowed question for a couple problem."
            ),
            "try": (
                "Once a week, do a short \"not our question\" sweep — name what pressure came from "
                "outside and release it together."
            ),
        },
    },
}


# ---------------------------------------------------------------------------
# Throat paragraphs for how_you_communicate (second beat: how voices land)
# ---------------------------------------------------------------------------

THROAT_COMMUNICATE: dict[str, dict[str, str]] = {
    "you_open_they_defined": {
        "body": (
            "Their words can land like a decision. You may echo, go quiet, or feel you "
            "have to match their certainty."
        ),
        "try": (
            "Let them finish. Then say back the request in your own words before you "
            "agree — so you are not signing a voice that isn't yours."
        ),
    },
    "you_defined_they_open": {
        "body": (
            "What you say casually can sound like a settled plan to them. Soften "
            "brainstorming language and check what they heard before you move."
        ),
        "try": (
            "Label unfinished thoughts out loud, then ask: \"What did you take from "
            "that?\" Correct the hearing before you correct the plan."
        ),
    },
    "both_defined": {
        "body": (
            "Both of your voices want clear airtime. Talking over each other is usually "
            "design, not disrespect — take turns on purpose."
        ),
        "try": (
            "In hard talks, finish your sentence and then stop. Invite theirs with "
            "\"Your turn\" so two strong voices do not duel."
        ),
    },
    "both_open": {
        "body": (
            "Words may arrive slowly or through writing. Silence is not automatically a "
            "no — give conversation a gentle structure when something matters."
        ),
        "try": (
            "For one decision, each of you texts a short paragraph first, then talk. "
            "Let the quieter medium go first."
        ),
    },
}


# ---------------------------------------------------------------------------
# Type-pair communicate + clash (15 unordered keys)
# ---------------------------------------------------------------------------

TYPE_PAIR_COMMUNICATE: dict[str, dict[str, str]] = {
    "Generator|Projector": {
        "body": (
            "The Generator often processes out loud. The Projector may be waiting to be asked "
            "— or offering a take that was not invited."
        ),
        "try": (
            "Generator: ask one clear question and wait. Projector: offer one "
            "observation only after \"do you want my take?\""
        ),
    },
    "Generator|Generator": {
        "body": (
            "Two Generators often process by talking through what has energy. Conversation "
            "can turn into mutual building — or mutual steamrolling if neither gets a quiet beat."
        ),
        "try": (
            "Pause after each share: \"Does this still have a yes?\" before you stack "
            "the next plan."
        ),
    },
    "Generator|Manifesting Generator": {
        "body": (
            "The Generator is after a clean answer. The Manifesting Generator may already be mid-turn while still talking. "
            "Conversation works when turns are named and no one is rushed into a yes."
        ),
        "try": (
            "Manifesting Generator: say \"I'm exploring, not locking\" when you change course mid-talk. "
            "Generator: answer only when you actually mean it."
        ),
    },
    "Generator|Manifestor": {
        "body": (
            "The Manifestor often speaks in order to start. The Generator needs a beat to give a real yes or no. "
            "Talks go sideways when a heads-up sounds like a decision already made."
        ),
        "try": (
            "Manifestor: tell the Generator first, then ask for a real yes or no. "
            "Generator: give a clean yes or no, without a long defense."
        ),
    },
    "Generator|Reflector": {
        "body": (
            "The Generator may want clarity in the talk itself. The Reflector often needs time "
            "and a calmer room before words settle."
        ),
        "try": (
            "Agree on a set time to wait before big talks. Hold the space, then name what became clear."
        ),
    },
    "Manifesting Generator|Manifesting Generator": {
        "body": (
            "Two of you can finish each other's leaps mid-sentence. Voltage is high — "
            "updates get skipped unless you slow the mouth to match the change of course."
        ),
        "try": (
            "Start hard talks with a two-minute open-thread dump each, then pick one "
            "thread only."
        ),
    },
    "Manifesting Generator|Manifestor": {
        "body": (
            "A clean start meets someone already working through several yeses. Talks work when a heads-up is "
            "not treated as a joint project needing an instant stamp."
        ),
        "try": (
            "Separate \"I'm telling you\" from \"I need us to decide.\" Use those "
            "labels out loud."
        ),
    },
    "Manifesting Generator|Projector": {
        "body": (
            "The Manifesting Generator works through several things out loud. The Projector tracks what those "
            "threads are for. Advice that was not asked for can feel like being managed."
        ),
        "try": (
            "Manifesting Generator: ask to be seen on one thread before you ask for advice. "
            "Projector: advise on that one thread only."
        ),
    },
    "Manifesting Generator|Reflector": {
        "body": (
            "Speed-talking meets a slower sample. The Manifesting Generator may want to resolve in the "
            "conversation. The Reflector may need the room to settle first."
        ),
        "try": (
            "Park non-urgent leaps until after a set time to wait. Revisit once "
            "— not five times the same night."
        ),
    },
    "Manifestor|Manifestor": {
        "body": (
            "Two of you inform to stay free. Conversation collapses when either skips "
            "the update to avoid friction — then anger shows up as a surprise collision."
        ),
        "try": (
            "Make short updates a ritual: one sentence before a leap, even when it "
            "feels obvious."
        ),
    },
    "Manifestor|Projector": {
        "body": (
            "Impact meets sight. A heads-up without recognition can feel cold. Guidance "
            "without being asked can feel controlling."
        ),
        "try": (
            "Manifestor: tell them early and invite what they see. Projector: wait for "
            "that invite before shaping the move."
        ),
    },
    "Manifestor|Reflector": {
        "body": (
            "Leaps meet sampling. Informing with lead time is care. Rushing for a "
            "same-hour answer is how talks turn into shocks."
        ),
        "try": (
            "Attach a set time to wait to every non-trivial heads-up. Report what became "
            "clear when you are ready."
        ),
    },
    "Projector|Projector": {
        "body": (
            "Two seers in one talk can compete for who sees more. Recognition spoken "
            "first keeps guidance from becoming a duel of advice."
        ),
        "try": (
            "Take timed turns: one guides, one only receives — then swap. Speak "
            "recognition before critique."
        ),
    },
    "Projector|Reflector": {
        "body": (
            "Focused seeing meets a mirror of the whole room. Curiosity beats diagnosis — "
            "the room itself may be coloring the talk."
        ),
        "try": (
            "Check the room before feedback. Ask one curious question, then answer what became clear."
        ),
    },
    "Reflector|Reflector": {
        "body": (
            "Two samplers need healthy conditions more than clever arguments. Words "
            "said in a chaotic room will not feel true the next day."
        ),
        "try": (
            "Redesign the talk setting first — light, noise, timing — then speak. "
            "Give decisions a named cycle."
        ),
    },
}


TYPE_PAIR_CLASH: dict[str, dict[str, str]] = {
    "Generator|Projector": {
        "title": "In a clash",
        "body": (
            "In a fight, the Generator often wants to stay in it until the energy moves. "
            "The Projector can feel unseen, then withdraw or start managing — which lands as pressure, not love."
        ),
        "try": (
            "Generator: answer what was actually said, in one question or one sentence. "
            "Projector: if a take is not wanted, let it wait."
        ),
    },
    "Generator|Generator": {
        "title": "In a clash",
        "body": (
            "Two of you can overwork a conflict — staying in it past honesty because "
            "the energy is still on. Or both go quiet and call it peace."
        ),
        "try": (
            "Stop the pile-on. Both of you name one honest yes and one honest no about "
            "the fight. Rest before round two."
        ),
    },
    "Generator|Manifesting Generator": {
        "title": "In a clash",
        "body": (
            "The Manifesting Generator may change course mid-fight. The Generator may feel the "
            "original hurt was never answered. Speed looks like avoidance to one and like problem-solving to the other."
        ),
        "try": (
            "Finish the feeling on the table before you change course. Say what still "
            "needs a response in one sentence."
        ),
    },
    "Generator|Manifestor": {
        "title": "In a clash",
        "body": (
            "A named decision can feel like a slam to the Generator. An honest no can feel "
            "like a cage to the Manifestor. A heads-up and a real response are the repair path — not control."
        ),
        "try": (
            "Re-state what you need with room for a real answer. Give that answer without "
            "a lecture."
        ),
    },
    "Generator|Reflector": {
        "title": "In a clash",
        "body": (
            "The Generator is after movement through the clash. The Reflector needs a calmer "
            "room and time before the mirror clears. Pushing for closure tonight often muddies both."
        ),
        "try": (
            "Change the room or take a pause. Return with what became clear — not a "
            "forced verdict."
        ),
    },
    "Manifesting Generator|Manifesting Generator": {
        "title": "In a clash",
        "body": (
            "Two of you can open five repair threads and finish none. The fight becomes "
            "a project board. Slow down to one hurt, one ask."
        ),
        "try": (
            "Park every side-issue on paper. Resolve one thread fully before you touch "
            "the next."
        ),
    },
    "Manifesting Generator|Manifestor": {
        "title": "In a clash",
        "body": (
            "Who moved first becomes the fight. The Manifesting Generator can feel managed. "
            "The Manifestor can feel blindsided or left cleaning up."
        ),
        "try": (
            "Re-do the last leap as a clean heads-up. Then finish one shared cleanup "
            "together before any new start."
        ),
    },
    "Manifesting Generator|Projector": {
        "title": "In a clash",
        "body": (
            "In a fight, the Projector may try to sort the many threads. The Manifesting Generator can feel slowed or judged. "
            "Advice that was not asked for, and yeses that never get finished, feed each other."
        ),
        "try": (
            "Manifesting Generator: ask to be seen on the one thread that hurts. "
            "Projector: advise on that thread only, and only after they ask."
        ),
    },
    "Manifesting Generator|Reflector": {
        "title": "In a clash",
        "body": (
            "Urgency meets sampling. The Manifesting Generator is trying to get the conflict resolved so life can "
            "move. The Reflector needs time and a healthier room."
        ),
        "try": (
            "Set a time to wait before the repair talk. Wait without sulking, then return with "
            "a clearer picture."
        ),
    },
    "Manifestor|Manifestor": {
        "title": "In a clash",
        "body": (
            "Two people who start things can escalate with surprise moves or silent "
            "scoreboards. Informing in the fight — not after the damage — is how anger becomes usable."
        ),
        "try": (
            "Both of you name the next move before you make it, even mid-conflict. "
            "Short updates beat dramatic exits."
        ),
    },
    "Manifestor|Projector": {
        "title": "In a clash",
        "body": (
            "The Manifestor is already in motion. The Projector feels unrecognized or blindsided, then corrects. "
            "Correction without being asked feels like a leash. A move without a heads-up feels like abandonment."
        ),
        "try": (
            "Name the next step and invite sight. Offer one sentence of what you see, "
            "then ask if it is wanted."
        ),
    },
    "Manifestor|Reflector": {
        "title": "In a clash",
        "body": (
            "A leap mid-conflict can shock a sensitive system. A pause can feel like a "
            "stall. Lead time and a calmer room are the repair, not matching speeds."
        ),
        "try": (
            "Name the next step with a real window. Name the place you need before "
            "continuing."
        ),
    },
    "Projector|Projector": {
        "title": "In a clash",
        "body": (
            "Two of you can duel with advice or go bitter from mutual under-recognition. "
            "Neither of you is built to out-produce the hurt."
        ),
        "try": (
            "Speak one specific recognition each before any fix. Then take turns guiding "
            "for three minutes only."
        ),
    },
    "Projector|Reflector": {
        "title": "In a clash",
        "body": (
            "The Projector may push for clarity the Reflector has not sampled. Urgency gets "
            "mirrored back louder. Slow the feedback and check the room before diagnosing love."
        ),
        "try": (
            "Change the setting. Ask one curious question. Answer what the room showed — not a "
            "character verdict."
        ),
    },
    "Reflector|Reflector": {
        "title": "In a clash",
        "body": (
            "Two of you in a chaotic room will feel the bond as chaotic. More talk "
            "without tending the space usually deepens the fog."
        ),
        "try": (
            "Fix the room first — quieter, clearer, less input. Then give the conflict "
            "a named cycle before you decide what it means."
        ),
    },
}


# ---------------------------------------------------------------------------
# Authority pair bank — every unordered pair including same+same (28).
# ---------------------------------------------------------------------------

def _auth(title: str, body: str, try_: str) -> dict[str, str]:
    return {"title": title, "body": body, "try": try_}


AUTHORITY_DECIDE_BANK: dict[str, dict[str, str]] = {
    "emotional|sacral": _auth(
        "You decide at different speeds",
        (
            "A feeling has to rise and fall before one of you has a real yes. "
            "The other gets a clear yes or no in the body now, and it goes stale if you wait too long."
        ),
        (
            "Say the body yes or no now. Sleep on the feeling. Come back once, after it has settled. "
            "Do not force one deadline."
        ),
    ),
    "emotional|emotional": _auth(
        "You share an emotional clock",
        (
            "You both decide after feeling has moved — not in the spike. The stretch is "
            "two waves cresting on different nights and calling it a stalemate."
        ),
        (
            "When something matters, agree that \"not yet\" is a complete answer. Revisit "
            "after sleep, or after the charge has actually moved."
        ),
    ),
    "emotional|splenic": _auth(
        "You decide at different speeds",
        (
            "A feeling has to rise and fall before one of you has a real yes. "
            "The other gets a now-knowing about health, timing, or safety that fades if you put it on trial."
        ),
        (
            "Let the instant read be spoken as a first alert without forcing the other "
            "person to match it. Come back once the feeling has settled."
        ),
    ),
    "sacral|splenic": _auth(
        "Two instant body clocks",
        (
            "You both decide in the body now. The harmony is speed with honesty when you "
            "trust the first signal. The stretch is overruling each other's body with logic after the fact."
        ),
        (
            "Honor the first body signal from either of you as data. If you need a second "
            "pass, take a short break — do not argue the body into a different answer."
        ),
    ),
    "sacral|sacral": _auth(
        "You share a gut clock",
        (
            "You both get a yes or no in the body that wants to be trusted now. "
            "The stretch is talking each other into a polite yes."
        ),
        (
            "Before you lock a plan, both of you answer out loud, with no sales pitch. "
            "If either yes goes flat, change the plan."
        ),
    ),
    "splenic|splenic": _auth(
        "You share an instinct clock",
        (
            "You both get spontaneous awareness about what is healthy or timely. The "
            "harmony is mutual trust in a quiet body no."
        ),
        (
            "Agree that either person's clear body alert pauses a plan for one beat. Then "
            "revisit with curiosity instead of cross-examination."
        ),
    ),
    "ego|emotional": _auth(
        "Feeling meets will",
        (
            "A feeling has to settle before one of you has a real yes. The other "
            "decides through will — what they will stand behind. A pressured promise mid-wave can become a pride fight later."
        ),
        (
            "Let the will name what it can commit to after the feeling has settled — not "
            "as a dare mid-spike."
        ),
    ),
    "emotional|self-projected": _auth(
        "Feeling meets spoken direction",
        (
            "For one of you, emotional clarity comes over time. The other finds truth by hearing "
            "themselves speak. Interrupting that talk to force a vote misses both designs."
        ),
        (
            "Give airtime to hear themselves, then give the feeling a sleep cycle before "
            "locking the plan."
        ),
    ),
    "emotional|lunar": _auth(
        "Feeling meets a longer cycle",
        (
            "One of you needs a feeling to settle. The other needs a cycle and a healthy "
            "place before certainty. Both are slow compared with a snap yes — and that is a gift when waiting is not treated as avoidance."
        ),
        (
            "Name a shared waiting time that honors both. Protect the place during "
            "that window instead of probing for early answers."
        ),
    ),
    "emotional|mental": _auth(
        "Feeling meets a sounding board",
        (
            "For one of you, emotional clarity comes over time. The other decides by talking it "
            "out in the right setting with the right people. A closed-door pressure talk mid-wave helps neither of you."
        ),
        (
            "Choose a calm sounding-board setting after the feeling has moved. "
            "Do not use friends as a court while feelings are still spiked."
        ),
    ),
    "ego|sacral": _auth(
        "A body yes meets will",
        (
            "One of you gets a yes or no in the body now. The other commits through will and heart. "
            "A no can feel like disrespect to pride. A willful yes can override a flat body."
        ),
        (
            "Let the body speak first as a read. Commit only to what that yes can sustain "
            "— smaller bargains beat heroic promises."
        ),
    ),
    "sacral|self-projected": _auth(
        "A body yes meets spoken identity",
        (
            "One of you gets a yes or no in the body now. The other finds direction by talking it "
            "through. A no mid-monologue can feel like a shut door. A long talk can stale a yes."
        ),
        (
            "Let them finish hearing themselves, then ask for a fresh body yes or no — not a "
            "leftover one from twenty minutes ago."
        ),
    ),
    "lunar|sacral": _auth(
        "A body yes meets a longer cycle",
        (
            "One of you gets a body yes now that goes stale if tabled too long. The other "
            "needs a cycle and a healthy place. This is not impulsiveness versus flakiness."
        ),
        (
            "Say the first body yes or no out loud, then give a set time to wait. Come back "
            "once — do not keep the yes on indefinite hold."
        ),
    ),
    "mental|sacral": _auth(
        "A body yes meets a sounding board",
        (
            "One of you knows from the body now. The other needs to talk it out in the "
            "right place. Over-processing a yes can kill it. Skipping the sounding board can leave the other unmoored."
        ),
        (
            "Say the body yes or no first, then take it to one trusted sounding-board setting "
            "— not a group debate that overrides the body."
        ),
    ),
    "ego|splenic": _auth(
        "Instinct meets will",
        (
            "One of you gets a spontaneous alert. The other decides through will and "
            "commitment. Pride can override a quiet \"this feels off,\" and an alert can feel like an attack on a promise."
        ),
        (
            "Let the alert pause the bargain for one beat. Renegotiate the commitment "
            "without treating instinct as disloyalty."
        ),
    ),
    "self-projected|splenic": _auth(
        "Instinct meets spoken direction",
        (
            "One of you knows in a flash. The other finds truth by speaking identity and "
            "direction. Talking past a body alert — or cutting off talk with an unexplained no — both create distance."
        ),
        (
            "Name the alert in one sentence, then let the other person speak. Decide after "
            "both of you have had a turn."
        ),
    ),
    "lunar|splenic": _auth(
        "Instinct meets a longer cycle",
        (
            "One of you gets a now-alert. The other needs a slower sample. Instant knowing "
            "and slow knowing can respect each other when neither pretends to be the only honest clock."
        ),
        (
            "Record the alert, then protect a set time to wait. Do not put the alert on trial "
            "every day of the wait."
        ),
    ),
    "mental|splenic": _auth(
        "Instinct meets a sounding board",
        (
            "One of you knows spontaneously. The other needs outer conversation in the "
            "right place. Explaining instinct until it dies — or skipping the sounding board — both miss the design."
        ),
        (
            "Honor the alert as data, then choose one calm sounding-board talk. Do not "
            "crowd-source a body no."
        ),
    ),
    "ego|ego": _auth(
        "You share a will clock",
        (
            "You both decide through will and heart commitments. The harmony is two people "
            "who can stand behind a deal. The stretch is pride making soft renegotiation feel like losing."
        ),
        (
            "Rewrite bargains before bitterness. Treat a fair renegotiation as strength "
            "— not as someone backing down."
        ),
    ),
    "ego|self-projected": _auth(
        "Will meets spoken direction",
        (
            "One of you commits through will. The other finds direction by hearing themselves "
            "speak. A locked promise mid-monologue can trap both of you."
        ),
        (
            "Talk first for direction, then make the commitment smaller and clearer than "
            "the speech that inspired it."
        ),
    ),
    "ego|lunar": _auth(
        "Will meets a longer cycle",
        (
            "One of you is ready for a commitment now through will. The other needs a cycle. "
            "Pressuring a promise before the sample lands usually creates a proud regret later."
        ),
        (
            "Offer a provisional statement and a revisit date. Let the sample happen before "
            "you call it a locked bargain."
        ),
    ),
    "ego|mental": _auth(
        "Will meets a sounding board",
        (
            "One of you commits through will. The other needs to talk it out in the right place to know. "
            "A lonely proud decision — or an endless committee — both miss the blend."
        ),
        (
            "Take the draft commitment to one trusted sounding board, then seal a smaller "
            "promise you can both keep."
        ),
    ),
    "self-projected|self-projected": _auth(
        "You share a spoken-direction clock",
        (
            "You both find truth by hearing yourselves speak. The harmony is mutual airtime. "
            "The stretch is two monologues that never land into a shared decision."
        ),
        (
            "Take timed turns to talk until each of you hears a clear sentence. Then write "
            "the decision in one shared line."
        ),
    ),
    "lunar|self-projected": _auth(
        "Spoken direction meets a longer cycle",
        (
            "One of you knows by talking it through. The other needs a cycle and a healthy "
            "place. Finishing the speech is not the same as finishing the sample."
        ),
        (
            "Let them speak fully, then protect a waiting time before you lock anything."
        ),
    ),
    "mental|self-projected": _auth(
        "Spoken direction meets a sounding board",
        (
            "One of you hears truth in your own voice. The other needs outer conversation. "
            "Both are talk-based — and can drown each other without a container."
        ),
        (
            "Do identity talk first in private, then one sounding-board session. End with "
            "a written sentence neither of you will keep expanding."
        ),
    ),
    "lunar|lunar": _auth(
        "You share a longer cycle",
        (
            "You both need a cycle and a healthy place before certainty. The stretch "
            "is mutual delay without communication until the room feels foggy."
        ),
        (
            "Name the cycle and tend the place together. Waiting becomes care when "
            "it is spoken, not when it is silent drift."
        ),
    ),
    "lunar|mental": _auth(
        "A longer cycle meets a sounding board",
        (
            "One of you takes a sample over time. The other needs the right people and place "
            "to talk it out. Both depend on place — rush neither."
        ),
        (
            "Choose a calm setting for one sounding-board talk inside a named waiting time. "
            "Do not crowd the cycle with daily interrogations."
        ),
    ),
    "mental|mental": _auth(
        "You share an outer sounding board",
        (
            "You both decide by talking it out in the right place. The stretch is "
            "outsourcing the relationship to every friend until neither of you can hear the bond."
        ),
        (
            "Pick one trusted setting and one trusted person each — not a chorus. Bring "
            "insights home and decide together afterward."
        ),
    ),
}


# Per-authority lines used when auth_a and auth_b are known and different.
# Do not infer sides from Type.
AUTHORITY_SIDE: dict[str, dict[str, str]] = {
    "emotional": {
        "you": "A feeling has to rise and fall before your yes is real.",
        "they": "A feeling has to rise and fall before their yes is real.",
        "named": "A feeling has to rise and fall before {name}'s yes is real.",
    },
    "sacral": {
        "you": "You get a clear yes or no in the body now, and it goes stale if you wait too long.",
        "they": "They get a clear yes or no in the body now, and it goes stale if you wait too long.",
        "named": "{name} gets a clear yes or no in the body now, and it goes stale if you wait too long.",
    },
    "splenic": {
        "you": "You get a quick sense of what is healthy or timely, and it can fade if you put it on trial.",
        "they": "They get a quick sense of what is healthy or timely, and it can fade if you put it on trial.",
        "named": "{name} gets a quick sense of what is healthy or timely, and it can fade if you put it on trial.",
    },
    "ego": {
        "you": "You decide through will — what you will stand behind.",
        "they": "They decide through will — what they will stand behind.",
        "named": "{name} decides through will — what they will stand behind.",
    },
    "self-projected": {
        "you": "You find the truth by hearing yourself speak.",
        "they": "They find the truth by hearing themselves speak.",
        "named": "{name} finds the truth by hearing themselves speak.",
    },
    "lunar": {
        "you": "You need a cycle and a healthy place before a yes is real.",
        "they": "They need a cycle and a healthy place before a yes is real.",
        "named": "{name} needs a cycle and a healthy place before a yes is real.",
    },
    "mental": {
        "you": "You find the answer by talking it out with the right people, in the right place.",
        "they": "They find the answer by talking it out with the right people, in the right place.",
        "named": "{name} finds the answer by talking it out with the right people, in the right place.",
    },
}

# Extra sentence appended after the two assigned side lines, when it adds meaning.
AUTHORITY_ASSIGN_TAIL: dict[str, str] = {
    "ego|emotional": "A pressured promise mid-wave can become a pride fight later.",
    "emotional|self-projected": "Interrupting that talk to force a vote misses both designs.",
    "emotional|lunar": "Both are slow compared with a snap yes, and that is a gift when waiting is not treated as avoidance.",
    "emotional|mental": "A closed-door pressure talk mid-wave helps neither of you.",
    "ego|sacral": "A no can feel like disrespect to pride. A willful yes can override a flat body.",
    "sacral|self-projected": "A no mid-monologue can feel like a shut door. A long talk can stale a yes.",
    "lunar|sacral": "This is not impulsiveness versus flakiness.",
    "mental|sacral": "Over-processing a yes can kill it. Skipping the sounding board can leave the other unmoored.",
    "ego|splenic": "Pride can override a quiet \"this feels off,\" and an alert can feel like an attack on a promise.",
    "self-projected|splenic": "Talking past a body alert — or cutting off talk with an unexplained no — both create distance.",
    "lunar|splenic": "Instant knowing and slow knowing can respect each other when neither pretends to be the only honest clock.",
    "mental|splenic": "Explaining instinct until it dies — or skipping the sounding board — both miss the design.",
    "ego|self-projected": "A locked promise mid-monologue can trap both of you.",
    "ego|lunar": "Pressuring a promise before the sample lands usually creates a proud regret later.",
    "ego|mental": "A lonely proud decision — or an endless committee — both miss the blend.",
    "lunar|self-projected": "Finishing the speech is not the same as finishing the sample.",
    "mental|self-projected": "Both are talk-based — and can drown each other without a container.",
    "lunar|mental": "Both depend on place — rush neither.",
}

EVERYDAY_DECIDE_LEADS = frozenset(
    {
        "You decide at different speeds",
    }
)


SHARED_AUTHORITY_HARMONY = _item(
    "shared-authority",
    "You share a way of deciding",
    (
        "You both decide in a similar way — a shared tempo for yes and no. The stretch "
        "is assuming the other person is already clear just because you are."
    ),
    (
        "Say your stage of clarity out loud even when you think it is obvious. Don't "
        "skip the check-in."
    ),
)


def _companionship_harmony(channel_roles: dict[str, Any]) -> dict[str, str] | None:
    rows = channel_roles.get("companionship") or []
    names: list[str] = []
    for ch in rows:
        name = ch.get("channel") or ch.get("name")
        if name and str(name) not in names:
            names.append(str(name))
    if not names:
        return None
    if len(names) == 1:
        listed = names[0]
    elif len(names) == 2:
        listed = f"{names[0]} and {names[1]}"
    else:
        listed = ", ".join(names[:-1]) + f", and {names[-1]}"
    return _item(
        "companionship",
        "What you already share",
        (
            f"You already complete {listed} together — a way of connecting that neither "
            "of you has alone. The stretch is expecting that shared channel to do all "
            "the relational work without talking."
        ),
        (
            "Name one shared channel out loud this week and say how you already feel "
            "it in daily life — without turning it into a fix-it project."
        ),
    )


def _select_frictions(
    defined_a: set[str], defined_b: set[str]
) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    for center in FRICTION_CENTER_PRIORITY:
        state = _center_state(center, defined_a, defined_b)
        if state not in ("you_open_they_defined", "you_defined_they_open"):
            continue
        entry = CENTER_BANK[center][state]
        out.append(
            _item(f"center-{center}", entry["title"], entry["body"], entry["try"])
        )
        if len(out) >= 4:
            break
    return out


def _select_harmonies(
    defined_a: set[str],
    defined_b: set[str],
    auth_a: str | None,
    auth_b: str | None,
    channel_roles: dict[str, Any],
) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    for center in HARMONY_BOTH_DEFINED_PRIORITY:
        state = _center_state(center, defined_a, defined_b)
        if state != "both_defined":
            continue
        entry = CENTER_BANK[center][state]
        out.append(
            _item(f"center-{center}", entry["title"], entry["body"], entry["try"])
        )
        if len(out) >= 4:
            return out

    if _shared_authority_class(auth_a, auth_b) and len(out) < 4:
        out.append(dict(SHARED_AUTHORITY_HARMONY))

    if len(out) < 4:
        comp = _companionship_harmony(channel_roles)
        if comp:
            out.append(comp)

    if len(out) < 4:
        for center in ("Solar_Plexus", "G"):
            if len(out) >= 4:
                break
            state = _center_state(center, defined_a, defined_b)
            if state != "both_open":
                continue
            # Skip if we already added this center as both_defined (we didn't).
            if any(i["id"] == f"center-{center}" for i in out):
                continue
            entry = CENTER_BANK[center][state]
            out.append(
                _item(f"center-{center}", entry["title"], entry["body"], entry["try"])
            )
    return out[:4]


def _assign_decide_body(
    auth_a: str | None,
    auth_b: str | None,
    entry: dict[str, str],
    name_b: str | None,
) -> str:
    """Assign decide sides from auth_a / auth_b when known and different.

    Does not guess from Type. Same or unknown authorities keep the bank body.
    """
    a = normalize_authority(auth_a)
    b = normalize_authority(auth_b)
    if not a or not b or a == b:
        body = entry["body"]
        title = entry["title"].strip()
        if title in EVERYDAY_DECIDE_LEADS and title not in body:
            lead = title if title.endswith(".") else f"{title}."
            return f"{lead} {body}"
        return body
    you = AUTHORITY_SIDE.get(a)
    they = AUTHORITY_SIDE.get(b)
    if not you or not they:
        return entry["body"]
    they_line = they["named"].format(name=name_b) if name_b else they["they"]
    parts = [you["you"], they_line]
    title = entry["title"].strip()
    if title in EVERYDAY_DECIDE_LEADS:
        lead = title if title.endswith(".") else f"{title}."
        parts.insert(0, lead)
    tail = AUTHORITY_ASSIGN_TAIL.get(authority_pair_key(auth_a, auth_b) or "")
    if tail:
        parts.append(tail)
    return " ".join(parts)


def _how_you_decide(
    auth_a: str | None,
    auth_b: str | None,
    name_b: str | None = None,
) -> dict[str, str] | None:
    key = authority_pair_key(auth_a, auth_b)
    if not key:
        return None
    entry = AUTHORITY_DECIDE_BANK.get(key)
    if not entry:
        return None
    body = _assign_decide_body(auth_a, auth_b, entry, name_b)
    return _section(entry["title"], body, entry["try"])


def _how_you_communicate(
    type_a: str | None,
    type_b: str | None,
    defined_a: set[str],
    defined_b: set[str],
) -> dict[str, str] | None:
    key = type_pair_key(type_a, type_b)
    if not key:
        return None
    pair = TYPE_PAIR_COMMUNICATE.get(key)
    if not pair:
        return None
    throat_state = _center_state("Throat", defined_a, defined_b)
    throat = THROAT_COMMUNICATE[throat_state]
    # Type-pair Try stays the section action. A throat beat, if it adds a new
    # idea, is a second paragraph under the same heading — not a second Try.
    return _section("How you talk", pair["body"], pair["try"], voice=throat["body"])


def _when_you_clash(
    type_a: str | None,
    type_b: str | None,
    auth_a: str | None,
    auth_b: str | None,
) -> dict[str, str] | None:
    key = type_pair_key(type_a, type_b)
    if not key:
        return None
    pair = TYPE_PAIR_CLASH.get(key)
    if not pair:
        return None
    body = pair["body"]
    auth_key = authority_pair_key(auth_a, auth_b)
    if auth_key and frozenset(auth_key.split("|")) in TEMPO_GAP_NORMS:
        body = f"{body} {CLASH_TEMPO_SENTENCE}"
    return _section(pair["title"], body, pair["try"])


def build_partner_dynamics(
    *,
    type_a: str | None,
    type_b: str | None,
    defined_a: set[str] | frozenset[str] | list[str] | None,
    defined_b: set[str] | frozenset[str] | list[str] | None,
    auth_a: str | None,
    auth_b: str | None,
    channel_roles: dict[str, Any] | None = None,
    name_b: str | None = None,
) -> dict[str, Any]:
    """Return dynamics fields to merge onto partner_overview (partner role only)."""
    da = set(defined_a or [])
    db = set(defined_b or [])
    roles = channel_roles or {}
    out: dict[str, Any] = {
        "harmonies": _select_harmonies(da, db, auth_a, auth_b, roles),
        "frictions": _select_frictions(da, db),
    }
    decide = _how_you_decide(auth_a, auth_b, name_b)
    if decide:
        out["how_you_decide"] = decide
    communicate = _how_you_communicate(type_a, type_b, da, db)
    if communicate:
        out["how_you_communicate"] = communicate
    clash = _when_you_clash(type_a, type_b, auth_a, auth_b)
    if clash:
        out["when_you_clash"] = clash
    return out


def all_dynamics_copy_blobs() -> list[str]:
    """Flatten bank strings for forbidden-word tests."""
    blobs: list[str] = []
    for center in CENTER_BANK.values():
        for state in center.values():
            blobs.extend(state.values())
    for block in THROAT_COMMUNICATE.values():
        blobs.extend(block.values())
    for block in TYPE_PAIR_COMMUNICATE.values():
        blobs.extend(block.values())
    for block in TYPE_PAIR_CLASH.values():
        blobs.extend(block.values())
    for block in AUTHORITY_DECIDE_BANK.values():
        blobs.extend(block.values())
    for side in AUTHORITY_SIDE.values():
        blobs.extend(side.values())
    blobs.extend(AUTHORITY_ASSIGN_TAIL.values())
    blobs.extend(SHARED_AUTHORITY_HARMONY.values())
    blobs.append(CLASH_TEMPO_SENTENCE)
    return blobs
