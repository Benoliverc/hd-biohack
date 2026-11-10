"""Apply-time first-name personalization for Soul partner copy.

Source banks stay type-keyed. Gold type-pair strings are unchanged when the
person chart has no usable first name. Me stays "you" in running prose.
"""
from __future__ import annotations

import re
from typing import Any

# Keep in sync with partnerFirstNameFromLabel in frontend/src/app/soul/page.tsx.
_RESERVED_CHART_LABELS = frozenset({"friend", "partner", "person", "me"})

# Longer official types first so "Manifesting Generator" is never swallowed by
# "Generator". MG is an alias of Manifesting Generator only.
_TYPE_FORMS_LONGEST_FIRST: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Manifesting Generator", ("Manifesting Generator", "MG")),
    ("Manifestor", ("Manifestor",)),
    ("Projector", ("Projector",)),
    ("Reflector", ("Reflector",)),
    ("Generator", ("Generator",)),
)

_YOU_AGREEMENT = {
    "loves": "love",
    "wants": "want",
    "needs": "need",
    "feels": "feel",
    "is": "are",
    "has": "have",
    "waits": "wait",
    "answers": "answer",
    "informs": "inform",
    "holds": "hold",
    "protects": "protect",
    "invites": "invite",
    "asks": "ask",
    "does": "do",
    "treats": "treat",
    "mirrors": "mirror",
    "pushes": "push",
    "processes": "process",
    "tracks": "track",
    "moves": "move",
    "returns": "return",
    "reports": "report",
    "names": "name",
    "guides": "guide",
    "offers": "offer",
    "practices": "practice",
    "carries": "carry",
    "clears": "clear",
    "starts": "start",
    "sees": "see",
    "samples": "sample",
    "responds": "respond",
    "recognizes": "recognize",
    "withdraws": "withdraw",
    "corrects": "correct",
}

_BARE_SUBJECT_VERBS = (
    "loves",
    "wants",
    "needs",
    "feels",
    "is",
    "has",
    "waits",
    "answers",
    "informs",
    "holds",
    "protects",
    "invites",
    "asks",
    "does",
    "treats",
    "mirrors",
    "pushes",
    "processes",
    "tracks",
    "moves",
    "returns",
    "reports",
    "names",
    "guides",
    "offers",
    "practices",
    "carries",
    "clears",
    "starts",
    "sees",
    "samples",
    "responds",
    "recognizes",
    "withdraws",
    "corrects",
    "may",
    "can",
    "often",
    "will",
    "should",
    "must",
    "doesn't",
    "does not",
    "don't",
    "do not",
)

_BARE_VERB_RE = "|".join(re.escape(v) for v in _BARE_SUBJECT_VERBS)
_YOU_VERB_RE = "|".join(re.escape(v) for v in _YOU_AGREEMENT)
# Optional mid-phrase words so "the Generator often wants" → "you often want".
_AFTER_TYPE = (
    r"(?:\s+(?:often|still|also|then|never|already|only|can|may|will|"
    r"could|would|should|must|doesn't|does not|don't|do not))*"
)


def first_name_from_label(label: str | None) -> str | None:
    """First token of a chart label; ignore Friend / Partner / Person / Me."""
    raw = (label or "").strip()
    if not raw:
        return None
    if raw.lower() in _RESERVED_CHART_LABELS:
        return None
    first = raw.split()[0] if raw.split() else ""
    return first or None


def _norm_official_type(raw: str | None) -> str | None:
    # Local alias of partner_insights._norm_type without an import cycle.
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
    official = (
        "Manifestor",
        "Generator",
        "Manifesting Generator",
        "Projector",
        "Reflector",
    )
    if t in official:
        return t
    lower = {x.lower(): x for x in official}
    return lower.get(t.lower())


def how_they_love_for_type(hd_type: str | None, name: str) -> str | None:
    """Third-person 'how they love' for a named partner. Banks stay second person."""
    official = _norm_official_type(hd_type)
    if not official or not name:
        return None
    templates = {
        "Generator": (
            "{name} loves by putting real energy where a yes lives — showing up, building, "
            "staying with what lights them. You feel that love when they wait for their "
            "gut (body yes/no) before they promise you the world, and when their yes "
            "is allowed to be as honest as their no."
        ),
        "Manifesting Generator": (
            "{name} loves in more than one lane at once — bursts of yes, quick course-corrections, "
            "a life that will not sit still. You feel that love when they tell you as they "
            "pivot, so you are riding with them instead of holding half-begun plans."
        ),
        "Manifestor": (
            "{name} loves by starting things and clearing a path no one else would have opened. "
            "You feel that love when they inform you (tell you first) before they leap, "
            "so their initiation lands as devotion instead of surprise."
        ),
        "Projector": (
            "{name} loves by seeing someone clearly — guiding, noticing, inviting the right use "
            "of your energy. You feel that love when they get a real invitation (asked to share "
            "their sight), not asked to match a stamina they were never built to run."
        ),
        "Reflector": (
            "{name} loves by sampling the life you share and reflecting it back with surprising "
            "clarity. You feel that love when you give them time and a healthy place, "
            "instead of demanding instant certainty."
        ),
    }
    tmpl = templates.get(official)
    if not tmpl:
        return None
    return tmpl.format(name=name)


def _subject_for_match(article_or_start: str, subject: str) -> str:
    """Capitalize 'you' when it replaces a sentence-starting 'The Type'."""
    if subject.lower() != "you":
        return subject
    if article_or_start[:1].isupper():
        return "You"
    return "you"


def _agree_if_you(subject: str, verb: str) -> str:
    if subject.lower() != "you":
        return verb
    return _YOU_AGREEMENT.get(verb.lower(), verb)


def _replace_forms(text: str, forms: tuple[str, ...], subject: str) -> str:
    """Replace type-as-person mentions of one official type with you / a name."""
    for form in forms:
        esc = re.escape(form)
        # Possessive: the Generator's → your / Sarah's
        def poss_sub(m: re.Match[str], subject=subject) -> str:
            article = m.group(1)
            if subject.lower() == "you":
                return "Your" if article[0].isupper() else "your"
            return f"{subject}'s"

        text = re.sub(rf"\b(The|the) {esc}'s\b", poss_sub, text)

        # Articled person + optional mid-words + verb: the Generator often wants
        def art_sub(m: re.Match[str], subject=subject) -> str:
            label = _subject_for_match(m.group(1), subject)
            mid = m.group(2) or ""
            verb = m.group(3)
            if verb:
                return f"{label}{mid} {_agree_if_you(subject, verb)}"
            return f"{label}{mid}"

        text = re.sub(
            rf"\b(The|the) {esc}({_AFTER_TYPE})(?:\s+({_YOU_VERB_RE}))?",
            art_sub,
            text,
        )

        # Try-line prefix: "Generator:" / "MG:"
        def colon_sub(m: re.Match[str], subject=subject) -> str:
            prefix = m.group(1)
            label = "You" if subject.lower() == "you" else subject
            return f"{prefix}{label}:"

        text = re.sub(rf"(^|[\n.;:!?]\s+|\s){esc}:", colon_sub, text)

        # Bare try-line subject + verb: "Generator holds space; Reflector names"
        def bare_sub(m: re.Match[str], subject=subject) -> str:
            prefix, verb = m.group(1), m.group(2)
            label = subject
            if subject.lower() == "you":
                label = "You" if (not prefix or prefix[-1] in "\n.;:!?") else "you"
                if prefix and prefix[-1].isspace() and len(prefix) >= 2 and prefix[-2] in "\n.;:!?":
                    label = "You"
                elif not prefix:
                    label = "You"
                verb = _agree_if_you(subject, verb)
            return f"{prefix}{label} {verb}"

        text = re.sub(
            rf"(^|[\n.;:!?]\s+|;\s+){esc}\s+({_BARE_VERB_RE})\b",
            bare_sub,
            text,
        )

    return text


def _replace_generator_mg_compound(text: str, type_a: str, type_b: str, name_b: str) -> str:
    """'the Generator / MG' refers to whichever person is Generator or MG."""
    a_sacral = type_a in ("Generator", "Manifesting Generator")
    b_sacral = type_b in ("Generator", "Manifesting Generator")
    if a_sacral and b_sacral:
        # Two sacral people — do not collapse the compound onto one of them.
        return text
    if a_sacral and not b_sacral:
        subject = "you"
    elif b_sacral and not a_sacral:
        subject = name_b
    else:
        return text

    def sub(m: re.Match[str], subject=subject) -> str:
        return _subject_for_match(m.group(1), subject)

    return re.sub(r"\b(The|the) Generator / MG\b", sub, text)


def personalize_type_prose(
    text: str,
    *,
    type_a: str | None,
    type_b: str | None,
    name_b: str,
) -> str:
    """Replace Type-as-person wording with 'you' / the partner's first name."""
    if not text or not name_b:
        return text
    a = _norm_official_type(type_a)
    b = _norm_official_type(type_b)
    if not a or not b:
        return text

    # Same-Type: never globally rewrite "the Generator". Only the unambiguous
    # "the other {Type}" points at the partner.
    if a == b:
        for official, forms in _TYPE_FORMS_LONGEST_FIRST:
            if official != a:
                continue
            for form in forms:
                esc = re.escape(form)
                text = re.sub(
                    rf"\b[Tt]he other {esc}\b",
                    name_b,
                    text,
                )
        return text

    text = _replace_generator_mg_compound(text, a, b, name_b)

    for official, forms in _TYPE_FORMS_LONGEST_FIRST:
        if official == a:
            text = _replace_forms(text, forms, "you")
        elif official == b:
            text = _replace_forms(text, forms, name_b)
    return text


def personalize_structure(
    obj: Any,
    *,
    type_a: str | None,
    type_b: str | None,
    name_b: str,
) -> Any:
    """Walk strings in a dict/list payload and personalize Type-as-person wording."""
    if not name_b:
        return obj
    if isinstance(obj, str):
        return personalize_type_prose(obj, type_a=type_a, type_b=type_b, name_b=name_b)
    if isinstance(obj, list):
        return [
            personalize_structure(item, type_a=type_a, type_b=type_b, name_b=name_b)
            for item in obj
        ]
    if isinstance(obj, dict):
        return {
            key: personalize_structure(val, type_a=type_a, type_b=type_b, name_b=name_b)
            for key, val in obj.items()
        }
    return obj
