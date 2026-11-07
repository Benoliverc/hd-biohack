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
    "Also remember your decision clocks are different — don't try to settle "
    "the fight on the faster clock."
)


def _item(id_: str, title: str, body: str, try_: str) -> dict[str, str]:
    return {"id": id_, "title": title, "body": body, "try": try_}


def _section(title: str, body: str, try_: str) -> dict[str, str]:
    return {"title": title, "body": body, "try": try_}


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
# Center banks — 9 x 4. Solar_Plexus gold must match tests character-for-character.
# ---------------------------------------------------------------------------

CENTER_BANK: dict[str, dict[str, dict[str, str]]] = {
    "Solar_Plexus": {
        "you_open_they_defined": {
            "title": "Their emotional weather",
            "body": (
                "Their moods run on a steadier track than yours. You don't just "
                "notice how they feel — you can take that weather in and turn the volume "
                "up. A mood that is passing weather for them can start to feel like your "
                "personality, your day, or a verdict on the relationship. The gift is "
                "real empathy. The stretch is remembering the feeling may not have "
                "started in you."
            ),
            "try": (
                "When a strong mood arrives around them, wait before you decide anything "
                'about "us." Name it out loud: "I think I might be feeling your mood, not mine." '
                "Let their clarity come back before you treat the feeling as a conclusion."
            ),
        },
        "you_defined_they_open": {
            "title": "You set the emotional weather",
            "body": (
                "Your emotions move in a wave that is yours — it has a truth at both "
                "ends. They can absorb that wave and amplify it, then hand it back "
                "louder than you sent it. If you ask them to \"just tell me how you feel "
                "about us\" mid-wave, they may be reporting your weather, not their own."
            ),
            "try": (
                "Give them the time you already need. Say where you are on the wave "
                "(\"I'm not clear yet\") so they don't have to solve a feeling that "
                "isn't theirs to settle."
            ),
        },
        "both_defined": {
            "title": "Two emotional climates",
            "body": (
                "You both have a defined emotional center, so neither of you is meant "
                "to vote on a feeling in the heat of it. You each have a wave, and those "
                "waves will not always crest together. The harmony is that you can both "
                'understand "not yet" as honesty, not avoidance.'
            ),
            "try": (
                "When something matters, agree to revisit it after one sleep — or after "
                "the charge has actually moved — instead of negotiating clarity you "
                "neither have yet."
            ),
        },
        "both_open": {
            "title": "A shared emotional field",
            "body": (
                "Neither of you has a fixed emotional weather. Moods in the room — a film, "
                "a crowded dinner, someone else's argument — can color both of you. The "
                "gift is flexibility and a fine sensor for the field. The stretch is not "
                "turning every shared mood into a story about the relationship."
            ),
            "try": (
                "After an intense evening, check the room before you check the "
                'relationship. Ask: "Is this about us, or about what we just walked '
                'through?"'
            ),
        },
    },
    "Sacral": {
        "you_open_they_defined": {
            "title": "Their life-force pace",
            "body": (
                "They get a clear body yes or no. That signal "
                "can feel louder than your own sense of energy. "
                "You may find yourself matching their work rate, their yes, or their "
                "restlessness until your body is spent. The gift is learning what "
                "sustainable response looks like beside them. The stretch is not treating "
                "their pace as the law of the house."
            ),
            "try": (
                "Before you agree to a shared push, put a hand on your own belly and "
                "answer only for you. Say: \"I need a minute to feel if I have energy "
                "for that\" — even when their yes is already in the room."
            ),
        },
        "you_defined_they_open": {
            "title": "You set the energy tempo",
            "body": (
                "You get a clear gut sound about what has energy. "
                "They can absorb that drive and try to keep up, then crash or resent "
                "the pace. If you treat every gut yes as a joint project, they may "
                "agree on your energy instead of their capacity."
            ),
            "try": (
                "When your gut lights up for something big, ask whether they want in "
                "before you schedule them into it. Offer an easy out: \"This is my yes "
                "— you can watch, join, or pass.\""
            ),
        },
        "both_defined": {
            "title": "Two gut engines",
            "body": (
                "You both carry a steady gut engine, so each of you has a real gut yes and "
                "no. That is a lot of life force in one home — and two calendars that "
                "can fill without either of you noticing. The harmony is honest response "
                "meeting honest response when both are allowed to speak."
            ),
            "try": (
                "Before locking a shared plan, each of you answers from the gut out "
                "loud — no persuading. Keep only what both bodies still say yes to."
            ),
        },
        "both_open": {
            "title": "A shared energy field",
            "body": (
                "Neither of you has a fixed life-force motor. The energy in the room — "
                "work culture, friends who never stop, a week of urgency — can pull "
                "both of you into overdoing. The gift is flexibility. The stretch is "
                "not outsourcing your rest to whoever looks busier."
            ),
            "try": (
                "Name a shared recovery window this week that does not depend on "
                "finishing the list first. Protect it like a date."
            ),
        },
    },
    "Throat": {
        "you_open_they_defined": {
            "title": "Their voice lands loud",
            "body": (
                "Your throat is open, and theirs is defined. Their words can land like "
                "a decision. You may echo, go quiet, or feel you have to match their "
                "certainty. Pause before treating a sentence as the plan — their "
                "expression is not automatically a joint commitment."
            ),
            "try": (
                "Let them finish. Then say back the request in your own words before "
                "you agree — so you are not signing a voice that isn't yours."
            ),
        },
        "you_defined_they_open": {
            "title": "Your words carry weight",
            "body": (
                "Your throat is defined — speech and expression move with more "
                "consistency. They can take your wording as the verdict, amplify it, "
                "or go quiet under it. A casual thought said out loud may land as a "
                "plan they feel they must follow."
            ),
            "try": (
                "When you are thinking out loud, label it: \"I'm brainstorming, not "
                "deciding yet.\" Ask what they heard before you treat the talk as done."
            ),
        },
        "both_defined": {
            "title": "Two voices in the room",
            "body": (
                "You both have a defined throat, so expression wants airtime on both "
                "sides. The harmony is that neither of you is built to stay mute — "
                "when you take turns, the bond stays clear. The stretch is talking "
                "over each other until neither feels heard."
            ),
            "try": (
                "In one important talk this week, use a simple turn rule: one speaks "
                "until they say \"I'm done,\" then the other. No fixing mid-sentence."
            ),
        },
        "both_open": {
            "title": "A shared quiet throat",
            "body": (
                "Neither of you has a fixed throat definition. Words may come in "
                "bursts, through others, or only when the field feels safe. The gift "
                "is listening. The stretch is assuming silence means agreement — or "
                "pressure to perform certainty you do not have yet."
            ),
            "try": (
                "Before a decision talk, write one sentence each privately, then read "
                "them aloud. Give the quiet a structure so it is not mistaken for a no."
            ),
        },
    },
    "G": {
        "you_open_they_defined": {
            "title": "Their sense of direction",
            "body": (
                "Your identity and direction center is open, and theirs is defined. "
                "Their sense of who they are and where they are going can feel like a "
                "compass you borrow. The gift is flexibility beside a steady identity. "
                "The stretch is losing your own place when their direction fills the room."
            ),
            "try": (
                "Once this week, name one place or plan that is yours alone — even a "
                "small one — before you merge calendars. Say it out loud so it stays real."
            ),
        },
        "you_defined_they_open": {
            "title": "You carry a clear direction",
            "body": (
                "Your identity and direction are defined. They can orient to your "
                "sense of self and path, then feel lost when you change course or need "
                "solo time. Love here includes leaving room for their becoming without "
                "making them a passenger on your map."
            ),
            "try": (
                "When you share a direction, invite theirs: \"This is where I'm pointed "
                "— where are you?\" Wait for an answer that is not just an echo."
            ),
        },
        "both_defined": {
            "title": "Two clear identities",
            "body": (
                "You both have a defined identity and direction center. That can feel "
                "like two true norths under one roof — steady, and sometimes stubborn. "
                "The harmony is mutual respect for who each of you is when neither "
                "tries to rewrite the other."
            ),
            "try": (
                "Pick one domain (home, money, weekend) where each of you leads without "
                "the other correcting identity mid-stream. Review after a week."
            ),
        },
        "both_open": {
            "title": "A shared search for place",
            "body": (
                "Neither of you has a fixed identity/direction definition. Who you are "
                "together can shift with place, people, and season. The gift is "
                "reinvention. The stretch is clinging to a shared story because "
                "uncertainty feels like failure."
            ),
            "try": (
                "Ask together: \"Where do we feel most like ourselves lately?\" Let "
                "place and people be data, not a verdict on the bond."
            ),
        },
    },
    "Heart": {
        "you_open_they_defined": {
            "title": "Their will and promises",
            "body": (
                "Your will / heart center is open, and theirs is defined. Their "
                "promises and willpower can feel like a standard you should match. You "
                "may overcommit to prove loyalty, then burn out. The gift is sensing "
                "what commitment costs. The stretch is not treating their will as your "
                "measuring stick."
            ),
            "try": (
                "Before you make a promise beside theirs, ask what you can keep on a "
                "bad week. Say that smaller yes out loud."
            ),
        },
        "you_defined_they_open": {
            "title": "You hold the will charge",
            "body": (
                "Your will / heart is defined — you can make and keep commitments with "
                "a certain force. They may absorb that pressure and promise from your "
                "will instead of their capacity. Ego fights about who is \"stronger\" "
                "usually miss the design underneath."
            ),
            "try": (
                "When you want a joint commitment, ask what they can actually sustain "
                "— and accept a smaller bargain without treating it as less love."
            ),
        },
        "both_defined": {
            "title": "Two wills in the bargain",
            "body": (
                "You both have a defined will / heart. Commitments can feel tribal and "
                "serious — and pride can make soft renegotiation feel like losing. The "
                "harmony is two people who can stand by a deal when the deal is fair."
            ),
            "try": (
                "Rewrite one household bargain this week so both wills feel honored. "
                "Say the new deal out loud and shake on it — then stop scorekeeping."
            ),
        },
        "both_open": {
            "title": "A shared soft will",
            "body": (
                "Neither of you has a fixed will / heart definition. Proof-of-love "
                "through overpromising can sneak in from the culture around you. The "
                "gift is humility about capacity. The stretch is competing to look "
                "reliable instead of being honest."
            ),
            "try": (
                "Replace one vague \"I'll handle it\" with a specific, smaller promise "
                "you can keep. Celebrate kept small promises more than heroic ones."
            ),
        },
    },
    "Root": {
        "you_open_they_defined": {
            "title": "Their pressure clock",
            "body": (
                "Your root is open, and theirs is defined. Their sense of pressure and "
                "deadline can flood your nervous system. You may rush to clear their "
                "adrenaline as if it were yours. The gift is motivation beside them. "
                "The stretch is not living inside their urgency."
            ),
            "try": (
                "When urgency spikes around them, ask: \"Is this deadline mine?\" If "
                "not, take one slow breath before you move."
            ),
        },
        "you_defined_they_open": {
            "title": "You bring the pressure pulse",
            "body": (
                "Your root is defined — pressure and drive have a pulse that is yours. "
                "They can absorb that adrenaline and feel they must hurry with you. "
                "What feels like healthy fuel for you can feel like a fire alarm for them."
            ),
            "try": (
                "When you feel the push to move now, say whether the deadline is real "
                "or just root fuel. Invite them to choose a calmer pace without shame."
            ),
        },
        "both_defined": {
            "title": "Two pressure engines",
            "body": (
                "You both have a defined root. Momentum can be mutual — and so can "
                "mutual burnout if every spike becomes a couple emergency. The harmony "
                "is shared drive with shared recovery."
            ),
            "try": (
                "After one high-pressure day, schedule a no-agenda evening on purpose. "
                "Treat downtime as part of the engine, not a reward."
            ),
        },
        "both_open": {
            "title": "A shared pressure field",
            "body": (
                "Neither of you has a fixed root. Outside deadlines and other people's "
                "stress can climb into both of you. The gift is adaptability. The "
                "stretch is making every borrowed urgency a story about the relationship."
            ),
            "try": (
                "When both of you feel rushed, name the source out loud before you "
                "blame each other. Often it is the week, not the bond."
            ),
        },
    },
    "Spleen": {
        "you_open_they_defined": {
            "title": "Their instinctive alerts",
            "body": (
                "Your spleen is open, and theirs is defined. Their instinctive yes/no "
                "about safety, health, and timing can feel authoritative. You may "
                "adopt their fears or preferences as your own. The gift is learning "
                "clean instinct beside them. The stretch is not outsourcing your body's "
                "veto."
            ),
            "try": (
                "When they say \"this feels off,\" pause — then check your own body "
                "before you agree. You are allowed a second read."
            ),
        },
        "you_defined_they_open": {
            "title": "You hold the instinct clock",
            "body": (
                "Your spleen is defined — spontaneous awareness about what is healthy "
                "or timely moves through you. They can amplify your alerts and treat "
                "them as law. A passing instinct can become a household rule if you "
                "are not careful."
            ),
            "try": (
                "When you share an instinct, mark whether it is a hard stop or a soft "
                "preference. Leave them room to feel their own body."
            ),
        },
        "both_defined": {
            "title": "Two instinctive readers",
            "body": (
                "You both have a defined spleen. Intuitive alerts can stack — or "
                "compete. The harmony is two people who can trust a body no without "
                "a long trial. The stretch is dueling instincts with no soft landing."
            ),
            "try": (
                "Agree that either person's clear body no pauses a plan for one beat "
                "— then revisit with curiosity, not debate."
            ),
        },
        "both_open": {
            "title": "A shared instinct field",
            "body": (
                "Neither of you has a fixed spleen. Health trends, fear stories, and "
                "other people's alarms can color both of you. The gift is openness. "
                "The stretch is collecting anxieties until the home feels unsafe for "
                "no clear reason."
            ),
            "try": (
                "When fear spikes, ask where it entered the room before you redesign "
                "the relationship around it."
            ),
        },
    },
    "Ajna": {
        "you_open_they_defined": {
            "title": "Their mind and opinions",
            "body": (
                "Your mind / opinions center is open, and theirs is defined. Their "
                "certainty can feel like the correct analysis. You may abandon a "
                "half-formed thought to match their framework. The gift is flexible "
                "thinking. The stretch is not treating their opinion as your identity."
            ),
            "try": (
                "In one disagreement, state your unfinished thought first: \"I'm still "
                "forming this, but...\" Finish it before you invite their critique."
            ),
        },
        "you_defined_they_open": {
            "title": "You hold a steady mind",
            "body": (
                "Your mind / opinions are defined — concepts arrive with more "
                "consistency. They can absorb your framework and lose their own "
                "working theory mid-conversation. Being \"right\" can cost their voice."
            ),
            "try": (
                "Ask for their version before you deliver yours. Leave one opinion "
                "unsettled on purpose so certainty does not steamroll curiosity."
            ),
        },
        "both_defined": {
            "title": "Two steady minds",
            "body": (
                "You both have a defined mind / opinions center. Debates can be rich "
                "— and stuck. The harmony is two people who can hold a view without "
                "needing the room to convert. The stretch is turning every talk into "
                "a courtroom."
            ),
            "try": (
                "Time-box one recurring debate. When the timer ends, name one thing "
                "you still respect about the other's view."
            ),
        },
        "both_open": {
            "title": "A shared open mind",
            "body": (
                "Neither of you has a fixed mind / opinions definition. Ideas in the "
                "field — podcasts, friends, headlines — can swing both of you. The "
                "gift is curiosity. The stretch is outsourcing every decision to the "
                "loudest theory of the week."
            ),
            "try": (
                "Before a decision, each of you writes the question in one sentence "
                "without research. Start from your own wording."
            ),
        },
    },
    "Head": {
        "you_open_they_defined": {
            "title": "Their mental pressure",
            "body": (
                "Your head center is open, and theirs is defined. Their questions and "
                "mental pressure can fill your mind until you cannot tell which "
                "inspiration is yours. The gift is inspiration beside them. The stretch "
                "is carrying their unanswered questions as anxiety."
            ),
            "try": (
                "When your mind races after talking with them, ask: \"Is this my "
                "question?\" Write down what is theirs and set it aside for a night."
            ),
        },
        "you_defined_they_open": {
            "title": "You bring the questions",
            "body": (
                "Your head is defined — mental pressure and inspiration have a "
                "familiar pulse. They can take on your questions and lose sleep over "
                "puzzles that are yours to hold. Sharing inspiration is love; dumping "
                "unresolved pressure is not."
            ),
            "try": (
                "When you share a big question, say whether you want brainstorming or "
                "just a witness. Let them opt out of solving it."
            ),
        },
        "both_defined": {
            "title": "Two pressurized minds",
            "body": (
                "You both have a defined head. Inspiration and doubt can ping-pong "
                "until neither of you rests. The harmony is a shared respect for "
                "unanswered questions. The stretch is keeping the house awake with "
                "theories at midnight."
            ),
            "try": (
                "Park one shared question on paper with a revisit date. Give both "
                "nervous systems a night off from solving it."
            ),
        },
        "both_open": {
            "title": "A shared open head",
            "body": (
                "Neither of you has a fixed head definition. Other people's questions "
                "and media pressure can colonize both minds. The gift is receptivity. "
                "The stretch is mistaking every borrowed question for a couple problem."
            ),
            "try": (
                "Once a week, do a short \"not our question\" sweep — name what "
                "pressure came from outside and release it together."
            ),
        },
    },
}


# ---------------------------------------------------------------------------
# Throat paragraphs for how_you_communicate composition
# ---------------------------------------------------------------------------

THROAT_COMMUNICATE: dict[str, dict[str, str]] = {
    "you_open_they_defined": {
        "body": (
            "Their throat is defined and yours is open, so their words can land like "
            "a decision. You may echo, go quiet, or feel you have to match their "
            "certainty. Pause before treating a sentence as the plan."
        ),
        "try": (
            "Let them finish. Then say back the request in your own words before you "
            "agree — so you are not signing a voice that isn't yours."
        ),
    },
    "you_defined_they_open": {
        "body": (
            "Your throat is defined and theirs is open. What you say casually can "
            "sound like a settled plan to them. Soften brainstorming language and "
            "check what they heard before you move."
        ),
        "try": (
            "Label unfinished thoughts out loud, then ask: \"What did you take from "
            "that?\" Correct the hearing before you correct the plan."
        ),
    },
    "both_defined": {
        "body": (
            "You both have a defined throat, so both voices want clear airtime. "
            "Talking over each other is usually design, not disrespect — take turns "
            "on purpose."
        ),
        "try": (
            "In hard talks, finish your sentence and then stop. Invite theirs with "
            "\"Your turn\" so two defined throats do not duel."
        ),
    },
    "both_open": {
        "body": (
            "Neither of you has a fixed throat. Words may arrive slowly or through "
            "writing. Silence is not automatically a no — give conversation a gentle "
            "structure when something matters."
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
            "The Generator loves by engaging what lights them up; the Projector loves "
            "by seeing and guiding when recognized. In conversation that can sound "
            "like one person processing out loud while the other is waiting to be "
            "asked — or offering guidance that wasn't invited."
        ),
        "try": (
            "Generator: ask one clear question and wait. Projector: offer one "
            "observation only after \"do you want my take?\""
        ),
    },
    "Generator|Generator": {
        "body": (
            "Two Generators often process by talking through what has energy. "
            "Conversation can turn into mutual building — or mutual steamrolling if "
            "neither gut gets a quiet beat."
        ),
        "try": (
            "Pause after each share for a gut check: \"Does this still have a yes?\" "
            "before you stack the next plan."
        ),
    },
    "Generator|Manifesting Generator": {
        "body": (
            "The Generator wants a clean gut answer; the Manifesting Generator "
            "may already be mid-pivot while still talking. Conversation works when "
            "pivots are named and the Generator is not rushed into a yes."
        ),
        "try": (
            "MG: say \"I'm exploring, not locking\" when you pivot mid-talk. "
            "Generator: answer only when your gut has actually spoken."
        ),
    },
    "Generator|Manifestor": {
        "body": (
            "The Manifestor often informs to clear a path; the Generator needs a "
            "real response beat. Talks go sideways when informing sounds like a done "
            "deal, or when a gut no is taken as a personal stop sign."
        ),
        "try": (
            "Manifestor: inform, then ask for a gut response. Generator: give a "
            "clean yes/no without a long defense."
        ),
    },
    "Generator|Reflector": {
        "body": (
            "The Generator may want clarity in the talk itself; the Reflector often "
            "needs time and a calmer field before words settle. Pushing for a final "
            "sentence the same night can scramble both of you."
        ),
        "try": (
            "Agree on a sample window before big talks. Generator holds space; "
            "Reflector names what the environment is showing when ready."
        ),
    },
    "Manifesting Generator|Manifesting Generator": {
        "body": (
            "Two Manifesting Generators can finish each other's leaps mid-sentence. "
            "Voltage is high — updates get skipped unless you slow the mouth to match "
            "the lane changes."
        ),
        "try": (
            "Start hard talks with a two-minute open-thread dump each, then pick one "
            "thread only."
        ),
    },
    "Manifesting Generator|Manifestor": {
        "body": (
            "Initiation meets multi-track response. Talks work when the Manifestor "
            "informs cleanly and the MG does not treat every inform as a joint "
            "project needing instant gut stamps."
        ),
        "try": (
            "Separate \"I'm telling you\" from \"I need us to decide.\" Use those "
            "labels out loud."
        ),
    },
    "Manifesting Generator|Projector": {
        "body": (
            "The MG processes across lanes out loud; the Projector tracks what those "
            "lanes are for. Guidance without invitation feels like management; "
            "unrecognized seeing feels invisible."
        ),
        "try": (
            "MG: invite recognition on one thread before asking for guidance. "
            "Projector: guide that one thread only."
        ),
    },
    "Manifesting Generator|Reflector": {
        "body": (
            "Speed-talking meets lunar sampling. The MG may want to resolve in the "
            "conversation; the Reflector may need the field to settle before words "
            "are trustworthy."
        ),
        "try": (
            "Park non-urgent leaps until after a named sample window. Revisit once "
            "— not five times the same night."
        ),
    },
    "Manifestor|Manifestor": {
        "body": (
            "Two Manifestors inform to stay free. Conversation collapses when either "
            "skips the update to avoid friction — then anger shows up as a surprise "
            "collision."
        ),
        "try": (
            "Make short informs a ritual: one sentence before a leap, even when it "
            "feels obvious."
        ),
    },
    "Manifestor|Projector": {
        "body": (
            "Impact meets sight. The Manifestor needs to move; the Projector needs "
            "to be invited before guiding. Inform without recognition feels cold; "
            "guidance without invitation feels controlling."
        ),
        "try": (
            "Manifestor: inform early and invite what the Projector sees. "
            "Projector: wait for that invite before shaping the move."
        ),
    },
    "Manifestor|Reflector": {
        "body": (
            "Leaps meet sampling. Informing with lead time is how the Manifestor "
            "loves; rushing the Reflector for a same-hour answer is how talks turn "
            "into shocks."
        ),
        "try": (
            "Attach a sample window to every non-trivial inform. Reflector reports "
            "what the field showed when ready."
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
            "Focused seeing meets whole-field mirroring. The Projector may push for "
            "clarity; the Reflector mirrors the room — including Projector urgency. "
            "Curiosity beats diagnosis."
        ),
        "try": (
            "Check the room before feedback. Projector asks one curious question; "
            "Reflector answers what the field shows."
        ),
    },
    "Reflector|Reflector": {
        "body": (
            "Two samplers need healthy conditions more than clever arguments. Words "
            "said in a chaotic field will not feel true the next day."
        ),
        "try": (
            "Redesign the talk setting first — light, noise, timing — then speak. "
            "Give decisions a named cycle."
        ),
    },
}


TYPE_PAIR_CLASH: dict[str, dict[str, str]] = {
    "Generator|Projector": {
        "title": "When things get hard",
        "body": (
            "In a clash, the Generator often wants to stay in it and work the thing "
            "until the energy moves. The Projector can feel unseen, then either "
            "withdraw or start managing the Generator — which the Generator feels as "
            "pressure, not love. Neither is wrong. The Generator is built to respond; "
            "the Projector is built to wait for a real invitation and to be recognized "
            "for what they see."
        ),
        "try": (
            "Generator: respond to what was actually said, not the whole backlog. Ask "
            "one question and wait. Projector: don't fix unless you were asked. Name "
            "what you see in one sentence, then ask \"do you want my take?\" If the "
            "answer is no, that is not rejection of you — it is the invitation "
            "arriving later."
        ),
    },
    "Generator|Generator": {
        "title": "When things get hard",
        "body": (
            "Two Generators can overwork a conflict — staying in it past honesty "
            "because the energy is still \"on.\" Or both go quiet and call it peace. "
            "The repair is two gut truths, not a longer debate."
        ),
        "try": (
            "Stop the pile-on. Each of you names one gut yes and one gut no about "
            "the fight. Rest before round two."
        ),
    },
    "Generator|Manifesting Generator": {
        "title": "When things get hard",
        "body": (
            "The MG may pivot mid-fight to a new angle; the Generator may feel the "
            "original hurt was never answered. Speed looks like avoidance to one and "
            "like problem-solving to the other."
        ),
        "try": (
            "MG: finish the feeling on the table before you change lanes. Generator: "
            "say what still needs a response in one sentence."
        ),
    },
    "Generator|Manifestor": {
        "title": "When things get hard",
        "body": (
            "The Manifestor can inform a decision that feels like a slam to the "
            "Generator; the Generator's gut no can feel like a cage to the "
            "Manifestor. Inform and respond are the repair path — not control."
        ),
        "try": (
            "Manifestor: re-inform what you need with room for a gut answer. "
            "Generator: give the gut answer without a lecture."
        ),
    },
    "Generator|Reflector": {
        "title": "When things get hard",
        "body": (
            "The Generator wants movement through the clash; the Reflector needs a "
            "calmer environment and time before the mirror clears. Pushing for "
            "closure tonight often muddies both."
        ),
        "try": (
            "Change the room or take a lunar pause. Generator protects the quiet; "
            "Reflector returns with what the field showed — not a forced verdict."
        ),
    },
    "Manifesting Generator|Manifesting Generator": {
        "title": "When things get hard",
        "body": (
            "Two MGs can open five repair threads and finish none. The fight becomes "
            "a project board. Slow down to one hurt, one ask."
        ),
        "try": (
            "Park every side-issue on paper. Resolve one thread fully before you "
            "touch the next."
        ),
    },
    "Manifesting Generator|Manifestor": {
        "title": "When things get hard",
        "body": (
            "Who moved first becomes the fight. The Manifestor feels managed; the MG "
            "feels blindsided or left cleaning up. Inform and finish are the "
            "antidotes."
        ),
        "try": (
            "Re-do the last leap as a clean inform. Then finish one shared cleanup "
            "together before any new initiation."
        ),
    },
    "Manifesting Generator|Projector": {
        "title": "When things get hard",
        "body": (
            "The Projector may try to organize the MG's many threads; the MG feels "
            "slowed or judged. Unrecognized guidance and unfinished lanes feed each "
            "other."
        ),
        "try": (
            "MG: invite recognition on the one thread that hurts. Projector: guide "
            "only that thread, and only after the invite."
        ),
    },
    "Manifesting Generator|Reflector": {
        "title": "When things get hard",
        "body": (
            "Urgency meets sampling. The MG wants the conflict resolved so life can "
            "move; the Reflector needs time and a healthier field. Speed as proof of "
            "care will backfire."
        ),
        "try": (
            "Set a sample window for the repair talk. MG waits without sulking; "
            "Reflector returns with a clearer mirror."
        ),
    },
    "Manifestor|Manifestor": {
        "title": "When things get hard",
        "body": (
            "Two initiators in a fight can escalate with surprise moves or silent "
            "scoreboards. Informing in the fight — not after the damage — is how "
            "anger becomes usable."
        ),
        "try": (
            "Each of you informs the next move before you make it, even mid-conflict. "
            "Short updates beat dramatic exits."
        ),
    },
    "Manifestor|Projector": {
        "title": "When things get hard",
        "body": (
            "The Manifestor moves; the Projector feels unrecognized or blindsided, "
            "then corrects. Correction without invitation feels like a leash; "
            "initiation without inform feels like abandonment."
        ),
        "try": (
            "Manifestor: inform and invite sight. Projector: one sentence of what "
            "you see, then ask if it is wanted."
        ),
    },
    "Manifestor|Reflector": {
        "title": "When things get hard",
        "body": (
            "A Manifestor leap mid-conflict can shock a Reflector's system; a "
            "Reflector pause can feel like a stall. Lead time and a calmer "
            "environment are the repair, not matching speeds."
        ),
        "try": (
            "Manifestor informs the next step with a real window. Reflector names "
            "the environment they need before continuing."
        ),
    },
    "Projector|Projector": {
        "title": "When things get hard",
        "body": (
            "Two Projectors can duel with advice or go bitter from mutual "
            "under-recognition. Neither of you is built to out-produce the hurt. "
            "Recognition first, guidance second."
        ),
        "try": (
            "Speak one specific recognition each before any fix. Then take turns "
            "guiding for three minutes only."
        ),
    },
    "Projector|Reflector": {
        "title": "When things get hard",
        "body": (
            "The Projector may push for clarity the Reflector has not sampled; the "
            "Reflector mirrors urgency back louder. Slow the feedback and check the "
            "room before diagnosing love."
        ),
        "try": (
            "Change the setting. Projector asks one curious question. Reflector "
            "answers the field — not a character verdict."
        ),
    },
    "Reflector|Reflector": {
        "title": "When things get hard",
        "body": (
            "Two Reflectors in a chaotic field will feel the bond as chaotic. More "
            "talk without tending the space usually deepens the fog. Environment is "
            "part of the repair."
        ),
        "try": (
            "Fix the room first — quieter, clearer, less input. Then give the "
            "conflict a named cycle before you decide what it means."
        ),
    },
}


# ---------------------------------------------------------------------------
# Authority pair bank — every unordered pair including same+same (28).
# Emotional|Sacral gold must match exactly (either direction).
# ---------------------------------------------------------------------------

def _auth(title: str, body: str, try_: str) -> dict[str, str]:
    return {"title": title, "body": body, "try": try_}


AUTHORITY_DECIDE_BANK: dict[str, dict[str, str]] = {
    "emotional|sacral": _auth(
        "Different decision clocks",
        (
            "You decide on different clocks. One of you needs the emotional weather to "
            "rise and fall before a real yes exists. The other gets a gut sound now "
            "— uh-huh or unh-uh — that goes stale if you table it too long. This is "
            "not stubbornness versus impulsiveness. It is two honest ways of deciding "
            "two tempos."
        ),
        (
            "Don't force a shared deadline. The gut response can be spoken as a "
            "first body read (\"my gut is a yes right now\") and the emotional "
            "partner can sleep on it. Revisit once, after the feeling has settled. A "
            "pressured \"just decide\" helps neither of you."
        ),
    ),
    "emotional|emotional": _auth(
        "Same emotional clock",
        (
            "You both decide on the emotional weather. Clarity comes after feeling has "
            "moved — not in the spike. The harmony is that neither of you needs to "
            "fake certainty for the other. The stretch is two waves cresting on "
            "different nights and calling it a stalemate."
        ),
        (
            "When something matters, agree that \"not yet\" is a complete answer. "
            "Revisit after sleep — or after the charge has actually moved — instead "
            "of performing a yes neither body has."
        ),
    ),
    "emotional|splenic": _auth(
        "Different decision clocks",
        (
            "You decide on different clocks. One of you needs the emotional weather to "
            "rise and fall before a real yes exists. The other gets a spontaneous "
            "splenic alert — a now-knowing about health, timing, or safety — that "
            "fades if you put it on trial. This is not drama versus paranoia. It is "
            "two honest authorities on two tempos."
        ),
        (
            "Let the splenic read be spoken as a first alert (\"something feels off "
            "right now\") without forcing the emotional partner to match it. Revisit "
            "once the wave has moved. Don't put instinct on a debate stage."
        ),
    ),
    "sacral|splenic": _auth(
        "Two instant body clocks",
        (
            "You both decide in the body now — gut response and splenic alert. "
            "The harmony is speed with honesty when you trust the first signal. The "
            "stretch is stacking instant nos and yeses until the room feels jumpy, "
            "or overruling each other's body with logic after the fact."
        ),
        (
            "Honor the first body signal from either of you as data. If you need a "
            "second pass, take a short break — don't argue the body into a different "
            "answer."
        ),
    ),
    "sacral|sacral": _auth(
        "Same gut clock",
        (
            "You both get a gut sound — uh-huh or unh-uh — that wants to be trusted "
            "in the moment. The harmony is two honest responses that can build a "
            "life without committee fog. The stretch is persuading each other's gut "
            "until both yeses are polite instead of true."
        ),
        (
            "Before a shared commitment, each of you answers from the gut out loud "
            "with no sales pitch. If either gut goes flat, redesign — don't pep-talk "
            "it back."
        ),
    ),
    "splenic|splenic": _auth(
        "Same splenic clock",
        (
            "You both get spontaneous awareness about what is healthy or timely. "
            "The harmony is mutual trust in a quiet body no. The stretch is dueling "
            "alerts with no soft place to land, or ignoring an alert until it becomes "
            "a crisis."
        ),
        (
            "Agree that either person's clear body alert pauses a plan for one beat. "
            "Then revisit with curiosity instead of cross-examination."
        ),
    ),
    "ego|emotional": _auth(
        "Wave meets will",
        (
            "One of you needs the emotional weather before a real yes exists. The other "
            "decides through will and heart commitments — what they will stand behind. "
            "A pressured promise mid-wave can become a pride fight later. Neither "
            "clock is wrong."
        ),
        (
            "Let the will name what it can commit to after the feeling has settled — not "
            "as a dare mid-spike. Soften renegotiation so pride does not block honesty."
        ),
    ),
    "emotional|self-projected": _auth(
        "Wave meets spoken direction",
        (
            "One of you needs emotional clarity over time. The other finds truth by "
            "hearing themselves speak — identity and direction coming through the "
            "voice. Interrupting that talk to force a wave-vote — or demanding a "
            "final answer mid-monologue — misses both designs."
        ),
        (
            "Give the self-projected partner airtime to hear themselves, then give "
            "the emotional partner a sleep cycle before locking the plan."
        ),
    ),
    "emotional|lunar": _auth(
        "Wave meets lunar cycle",
        (
            "One of you rides emotional weather; the other needs a lunar cycle and a "
            "healthy environment before certainty. Both are slow compared with gut "
            "speed — and that is a gift when you stop treating waiting as avoidance."
        ),
        (
            "Name a shared waiting window that honors both clocks. Protect the "
            "environment during that window instead of probing for early answers."
        ),
    ),
    "emotional|mental": _auth(
        "Wave meets outer sounding board",
        (
            "One of you needs emotional clarity over time. The other decides through "
            "mental / environmental outer authority — talking it out in the right "
            "setting with the right people. A closed-door pressure talk mid-wave "
            "helps neither clock."
        ),
        (
            "Choose a calm sounding-board setting after the emotional weather has "
            "moved. Don't use friends as a court while feelings are still spiked."
        ),
    ),
    "ego|sacral": _auth(
        "Gut meets will",
        (
            "One of you gets a gut yes/no now. The other commits through will and "
            "heart. A gut no can feel like disrespect to pride; a willful yes can "
            "override a flat gut. Name which clock you are using."
        ),
        (
            "Gut speaks first as a body read. Will commits only to what the gut "
            "can sustain — smaller bargains beat heroic promises."
        ),
    ),
    "sacral|self-projected": _auth(
        "Gut meets spoken identity",
        (
            "One of you answers from the gut now. The other finds direction by "
            "talking it through. A gut no mid-monologue can feel like a shut door; "
            "a long talk can stale a gut yes."
        ),
        (
            "Let the self-projected partner finish hearing themselves, then ask for "
            "a fresh gut read — not a leftover one from twenty minutes ago."
        ),
    ),
    "lunar|sacral": _auth(
        "Gut meets lunar cycle",
        (
            "One of you gets a gut sound now that goes stale if tabled too long. "
            "The other needs a cycle and a healthy place. This is not impulsiveness "
            "versus flakiness — protect both tempos."
        ),
        (
            "Capture the gut first read out loud, then give the lunar partner a "
            "named sample window. Revisit once — don't keep the gut on indefinite hold."
        ),
    ),
    "mental|sacral": _auth(
        "Gut meets sounding board",
        (
            "One of you knows from the gut now. The other needs to talk it out in "
            "the right environment. Over-processing a gut yes can kill it; skipping "
            "the sounding board can leave the mental authority unmoored."
        ),
        (
            "Speak the gut read first, then take it to one trusted sounding-board "
            "setting — not a group debate that overrides the body."
        ),
    ),
    "ego|splenic": _auth(
        "Instinct meets will",
        (
            "One of you gets a spontaneous splenic alert. The other decides through "
            "will and commitment. Pride can override a quiet \"this feels off,\" and "
            "an alert can feel like an attack on a promise."
        ),
        (
            "Let the alert pause the bargain for one beat. Renegotiate the commitment "
            "without treating instinct as disloyalty."
        ),
    ),
    "self-projected|splenic": _auth(
        "Instinct meets spoken direction",
        (
            "One of you knows in a flash through the spleen. The other finds truth "
            "by speaking identity and direction. Talking past a body alert — or "
            "cutting off talk with an unexplained no — both create distance."
        ),
        (
            "Name the alert in one sentence, then let the self-projected partner "
            "speak. Decide after both clocks have had a turn."
        ),
    ),
    "lunar|splenic": _auth(
        "Instinct meets lunar cycle",
        (
            "One of you gets a now-alert; the other needs a lunar sample. Instant "
            "knowing and slow knowing can respect each other when neither pretends "
            "to be the only honest clock."
        ),
        (
            "Record the splenic alert, then protect a sample window. Don't put the "
            "alert on trial every day of the wait."
        ),
    ),
    "mental|splenic": _auth(
        "Instinct meets sounding board",
        (
            "One of you knows spontaneously through the spleen. The other needs "
            "outer conversation in the right environment. Explaining instinct until "
            "it dies — or skipping the sounding board — both miss the design."
        ),
        (
            "Honor the alert as data, then choose one calm sounding-board talk. "
            "Don't crowd-source a body no."
        ),
    ),
    "ego|ego": _auth(
        "Same will clock",
        (
            "You both decide through will and heart commitments. The harmony is two "
            "people who can stand behind a deal. The stretch is pride making soft "
            "renegotiation feel like losing."
        ),
        (
            "Rewrite bargains before bitterness. Treat a fair renegotiation as "
            "strength — not as someone backing down."
        ),
    ),
    "ego|self-projected": _auth(
        "Will meets spoken direction",
        (
            "One of you commits through will; the other finds direction by hearing "
            "themselves speak. A locked promise mid-monologue can trap both of you. "
            "Let identity talk finish before the handshake."
        ),
        (
            "Talk first for direction, then make the will-based commitment smaller "
            "and clearer than the speech that inspired it."
        ),
    ),
    "ego|lunar": _auth(
        "Will meets lunar cycle",
        (
            "One of you wants a commitment now through will; the other needs a lunar "
            "cycle. Pressuring a promise before the sample lands usually creates a "
            "proud regret later."
        ),
        (
            "Offer a provisional will-statement and a revisit date. Let the lunar "
            "partner sample before you call it a locked bargain."
        ),
    ),
    "ego|mental": _auth(
        "Will meets sounding board",
        (
            "One of you commits through will; the other needs environmental talk to "
            "know. A lonely proud decision — or an endless committee — both miss "
            "the blend."
        ),
        (
            "Take the will's draft commitment to one trusted sounding board, then "
            "seal a smaller promise you can both keep."
        ),
    ),
    "self-projected|self-projected": _auth(
        "Same spoken-direction clock",
        (
            "You both find truth by hearing yourselves speak. The harmony is mutual "
            "airtime. The stretch is two monologues that never land into a shared "
            "decision."
        ),
        (
            "Take timed turns to talk until each of you hears a clear sentence. "
            "Then write the decision in one shared line."
        ),
    ),
    "lunar|self-projected": _auth(
        "Spoken direction meets lunar cycle",
        (
            "One of you knows by talking it through; the other needs a cycle and a "
            "healthy field. Finishing the speech is not the same as finishing the "
            "sample — honor both."
        ),
        (
            "Let the self-projected partner speak fully, then protect a lunar window "
            "before you lock anything."
        ),
    ),
    "mental|self-projected": _auth(
        "Spoken direction meets sounding board",
        (
            "One of you hears truth in your own voice; the other needs outer "
            "environmental conversation. Both are talk-based — and can drown each "
            "other without a container."
        ),
        (
            "Do identity talk first in private, then one sounding-board session. "
            "End with a written sentence neither of you will keep expanding."
        ),
    ),
    "lunar|lunar": _auth(
        "Same lunar clock",
        (
            "You both need a cycle and a healthy environment before certainty. The "
            "harmony is shared permission to wait. The stretch is mutual delay "
            "without communication until the field feels foggy."
        ),
        (
            "Name the cycle and tend the environment together. Waiting becomes care "
            "when it is spoken, not when it is silent drift."
        ),
    ),
    "lunar|mental": _auth(
        "Lunar cycle meets sounding board",
        (
            "One of you needs a lunar sample; the other needs the right people and "
            "place to talk it out. Both depend on environment — rush neither."
        ),
        (
            "Choose a calm setting for one sounding-board talk inside a named lunar "
            "window. Don't crowd the cycle with daily interrogations."
        ),
    ),
    "mental|mental": _auth(
        "Same outer-authority clock",
        (
            "You both decide through mental / environmental outer authority. The "
            "harmony is shared respect for good sounding boards. The stretch is "
            "outsourcing the relationship to every friend until neither of you can "
            "hear the bond."
        ),
        (
            "Pick one trusted setting and one trusted person each — not a chorus. "
            "Bring insights home and decide together afterward."
        ),
    ),
}


SHARED_AUTHORITY_HARMONY = _item(
    "shared-authority",
    "You share a decision clock",
    (
        "You both decide in a similar authority class — a shared tempo for yes and "
        "no. That is a quiet harmony: less translating between clocks. The stretch "
        "is assuming the other person is already clear just because you are, or "
        "pushing each other to perform certainty on the shared clock."
    ),
    (
        "Say your stage of clarity out loud even when you think it is obvious. "
        "Protect the shared clock instead of skipping the check-in."
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
        "Channels you already share",
        (
            f"You already complete {listed} together — finished wires that neither "
            "of you holds alone. That companionship is a quiet harmony in love: "
            "shared circuitry you do not have to invent from scratch. The stretch is "
            "expecting those channels to do all the relational work without talking."
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


def _how_you_decide(auth_a: str | None, auth_b: str | None) -> dict[str, str] | None:
    key = authority_pair_key(auth_a, auth_b)
    if not key:
        return None
    entry = AUTHORITY_DECIDE_BANK.get(key)
    if not entry:
        return None
    return _section(entry["title"], entry["body"], entry["try"])


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
    body = f"{pair['body']} {throat['body']}"
    mismatch = throat_state in ("you_open_they_defined", "you_defined_they_open")
    try_ = throat["try"] if mismatch else pair["try"]
    return _section("How you talk", body, try_)


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
) -> dict[str, Any]:
    """Return dynamics fields to merge onto partner_overview (partner role only)."""
    da = set(defined_a or [])
    db = set(defined_b or [])
    roles = channel_roles or {}
    out: dict[str, Any] = {
        "harmonies": _select_harmonies(da, db, auth_a, auth_b, roles),
        "frictions": _select_frictions(da, db),
    }
    decide = _how_you_decide(auth_a, auth_b)
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
    blobs.extend(SHARED_AUTHORITY_HARMONY.values())
    blobs.append(CLASH_TEMPO_SENTENCE)
    return blobs
