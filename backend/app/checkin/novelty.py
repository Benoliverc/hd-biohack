"""Daily Novelty Contract — 07:00-bucketed daily_signal waterfall (account TZ, HD × transits only)."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any, Literal
from zoneinfo import ZoneInfo

from ..hd.channels import GATE_TO_CENTER

DEFAULT_TZ_NAME = "Asia/Hong_Kong"
HKT = ZoneInfo(DEFAULT_TZ_NAME)
BUCKET_HOUR = 7  # 07:00 in the account timezone (fallback Asia/Hong_Kong)


def resolve_zone(tz_name: str | None = None) -> ZoneInfo:
    """Preferred IANA zone, or Asia/Hong_Kong when null/invalid."""
    name = (tz_name or "").strip() or DEFAULT_TZ_NAME
    try:
        return ZoneInfo(name)
    except Exception:
        return HKT


def novelty_today(tz_name: str | None = None) -> date:
    """Current novelty calendar day, flipping at 07:00 in the account timezone."""
    zone = resolve_zone(tz_name)
    now = datetime.now(zone)
    if now.hour < BUCKET_HOUR:
        return now.date() - timedelta(days=1)
    return now.date()


def novelty_bucket_instant(day: date | None = None, tz_name: str | None = None) -> datetime:
    """Ephemeris bucket at 07:00 in the account timezone for novelty day D."""
    zone = resolve_zone(tz_name)
    if day is None:
        day = novelty_today(tz_name)
    return datetime(day.year, day.month, day.day, BUCKET_HOUR, 0, 0, tzinfo=zone)

CONDITIONING_CAPTION = (
    "These update when bridges or temporary centers shift — often every few days."
)

DailySource = Literal[
    "moon_gate",
    "moon_line",
    "sun_line",
    "sun_gate",
    "hanging_pressure",
    "conditioning",
    "continuity",
]

GATE_CUE: dict[int, str] = {
    1: "A creative pulse is close to the surface, seeking a unique shape.",
    2: "A quiet sense of direction sits underneath today's choices.",
    3: "Something new is still finding its order; the start feels uneven.",
    4: "The mind wants a formula for what does not yet have one.",
    5: "Fixed rhythms feel louder; timing wants to stay in its groove.",
    6: "Friction in closeness may colour the room more than usual.",
    7: "Questions of role and leadership sit nearer the front.",
    8: "The urge to contribute a unique piece is more audible today.",
    9: "Attention wants to narrow; small details can hold the whole task.",
    10: "How you carry yourself is more visible than what you declare.",
    11: "Ideas arrive in clusters; they are weather, not a plan yet.",
    12: "Words carry more weight than usual; silence is charged too.",
    13: "Stories want a listener; what is shared may linger.",
    14: "Resources and skill feel primed to be used, not scattered.",
    15: "The day's pace may swing between extremes; neither pole is a verdict.",
    16: "Practiced skill wants to be used; enthusiasm can run ahead of mastery.",
    17: "Opinions form quickly; they describe a pattern, not a final ruling.",
    18: "The eye for what could be better is sharper than usual.",
    19: "Needs and approaches press a little harder at the edges.",
    20: "The present moment is louder than the plan around it.",
    21: "Questions of control and provision sit closer to the surface.",
    22: "Openness and mood may colour every conversation today.",
    23: "A few essential words may land harder than a long explanation.",
    24: "The mind turns the same question over, looking for a rational thread.",
    25: "A plain, uncalculated warmth may show through ordinary acts.",
    26: "The art of the deal feels closer at hand today.",
    27: "Care for what must be nourished is more noticeable today.",
    28: "The risk in the game is easier to feel — information, not a dare.",
    29: "The pull to say yes and stay with it is stronger than usual.",
    30: "Feelings may color the room; they are weather, not a verdict.",
    31: "Influence wants a stage; the question is whether the room asked.",
    32: "Instincts about what will last are closer to the surface.",
    33: "A need to withdraw and remember may colour the day's pace.",
    34: "Raw power is available in bursts; it is fuel, not a mandate.",
    35: "The appetite for a new experience is more awake than usual.",
    36: "Emotional weather may dip into a crisis colour; it will move on.",
    37: "Agreements and family-like bonds feel more vivid today.",
    38: "A fighting spirit may rise where something valued feels opposed.",
    39: "Provocation can stir the waters; the mood that follows is the signal.",
    40: "Aloneness and the terms of support sit closer to the surface.",
    41: "A sense of decrease can start a cycle — a beginning, not a lack.",
    42: "A cycle of growth wants to complete what was already started.",
    43: "A sudden insight may arrive sideways, hard to translate at once.",
    44: "The past pattern in a person or offer is easier to recognize today.",
    45: "Gathering and speaking for the group may feel closer at hand.",
    46: "The body and its path through the day want more trust than usual.",
    47: "Realizations try to form from a mental press that is not yet clear.",
    48: "A well of depth is available; it need not be emptied today.",
    49: "Principles about who belongs, and on what terms, are more awake.",
    50: "Values about care and responsibility sit nearer the surface.",
    51: "A jolt may reset the field — a spark, not a verdict.",
    52: "Stillness has more weight; activity may feel like it can wait.",
    53: "A new cycle is only starting; the first step is not the path.",
    54: "Ambition and the next rung may colour the day's drive.",
    55: "Spirit and mood can swing widely; neither pole is the whole story.",
    56: "Stories and stimulation travel farther than usual today.",
    57: "A quiet intuitive alertness is closer to the skin.",
    58: "The joy of being alive wants a little more room than usual.",
    59: "The urge to dissolve a wall and get close may be stronger today.",
    60: "A limitation is more visible; it can also be a clear frame.",
    61: "An inner question without a quick answer sits nearer the surface.",
    62: "Small, exact details want more attention than the big claim.",
    63: "Doubt is working on a pattern; it is a process, not a failure.",
    64: "A mental fog sits before the picture completes, just short of the click.",
}


def hkt_bucket_instant(day: date | None = None, tz_name: str | None = None) -> datetime:
    """Ephemeris bucket at 07:00 in tz_name (fallback Asia/Hong_Kong) for novelty day D."""
    return novelty_bucket_instant(day, tz_name)


def hkt_today(tz_name: str | None = None) -> date:
    """Current novelty day in tz_name (fallback Asia/Hong_Kong), flipping at 07:00."""
    return novelty_today(tz_name)


def _act(transit: dict[str, Any] | None, planet: str) -> dict[str, Any] | None:
    transit = transit or {}
    for a in transit.get("activations") or []:
        if isinstance(a, dict) and a.get("planet") == planet:
            return a
    if planet == "Sun":
        se = transit.get("sun_earth") or {}
        sun = se.get("sun") if isinstance(se, dict) else None
        return sun if isinstance(sun, dict) else None
    return None


def gate_line(transit: dict[str, Any] | None, planet: str) -> tuple[int | None, int | None]:
    a = _act(transit, planet)
    if not a:
        return None, None
    g, ln = a.get("gate"), a.get("line")
    try:
        return (int(g) if g is not None else None, int(ln) if ln is not None else None)
    except (TypeError, ValueError):
        return None, None


def _gl_label(g: int | None, ln: int | None) -> str:
    if g is None:
        return "?"
    if ln is None:
        return str(g)
    return f"{g}.{ln}"


def hanging_pressure_rows(
    natal: dict[str, Any] | None,
    transit: dict[str, Any] | None,
) -> list[dict[str, Any]]:
    """Natal hanging missing-ends currently hit by transit gates."""
    if not natal:
        return []
    hanging = natal.get("hanging_gates") or []
    transit_gates = {int(g) for g in (transit or {}).get("activated_gates") or []}
    out: list[dict[str, Any]] = []
    seen: set[int] = set()
    for h in hanging:
        if not isinstance(h, dict):
            continue
        missing = h.get("missing")
        if missing is None:
            continue
        try:
            m = int(missing)
        except (TypeError, ValueError):
            continue
        if m in transit_gates and m not in seen:
            seen.add(m)
            center = GATE_TO_CENTER.get(m, "open")
            out.append(
                {
                    "gate": m,
                    "held": h.get("held"),
                    "channel": h.get("channel"),
                    "center": center,
                }
            )
    out.sort(key=lambda r: r["gate"])
    return out


def hanging_pressure_key(rows: list[dict[str, Any]]) -> str:
    if not rows:
        return ""
    return ",".join(str(r["gate"]) for r in rows)


def bridge_key(overlay: dict[str, Any] | None) -> str:
    bridges = (overlay or {}).get("bridged_channels") or []
    parts: list[str] = []
    for b in bridges:
        if isinstance(b, dict):
            gates = b.get("gates") or []
            try:
                parts.append("-".join(str(int(g)) for g in sorted(gates)))
            except (TypeError, ValueError):
                parts.append(str(b.get("name") or gates))
    return "|".join(sorted(parts))


def newly_defined_key(overlay: dict[str, Any] | None) -> str:
    newly = (overlay or {}).get("newly_defined_centers") or []
    return ",".join(sorted(str(c) for c in newly))


def sky_signature(
    natal: dict[str, Any] | None,
    transit: dict[str, Any] | None,
    overlay: dict[str, Any] | None,
) -> dict[str, Any]:
    mg, ml = gate_line(transit, "Moon")
    sg, sl = gate_line(transit, "Sun")
    hp = hanging_pressure_rows(natal, transit)
    return {
        "moon_gate": mg,
        "moon_line": ml,
        "sun_gate": sg,
        "sun_line": sl,
        "hanging": hanging_pressure_key(hp),
        "hanging_rows": hp,
        "bridges": bridge_key(overlay),
        "newly": newly_defined_key(overlay),
    }


def _center_display(center: str) -> str:
    return center.replace("_", " ")


def _cue_fallback(gate: int | None, planet: str) -> str:
    """Last-resort English body when a library cue is missing."""
    if gate is None:
        return f"Let today's {planet} theme colour the day without forcing it."
    center = GATE_TO_CENTER.get(gate)
    if center:
        return (
            f"Notice {planet} through {_center_display(center)} "
            f"(Gate {gate}) — colour the day without forcing it."
        )
    return f"Notice {planet} in Gate {gate} — colour the day without forcing it."


def _cue_fallback_part(gate: int | None, planet: str) -> dict[str, object]:
    if gate is None:
        return {"key": "today.gateCue.fallbackPlanet", "params": {"planet": planet}}
    center = GATE_TO_CENTER.get(gate)
    if center:
        return {
            "key": "today.gateCue.fallbackCenter",
            "params": {
                "planet": planet,
                "center": _center_display(center),
                "gate": gate,
            },
        }
    return {
        "key": "today.gateCue.fallbackGate",
        "params": {"planet": planet, "gate": gate},
    }


def _cue_for_gate(gate: int | None, planet: str) -> str:
    """Observational body: library cue first, center fallback last-resort only."""
    if gate is not None and gate in GATE_CUE:
        return GATE_CUE[gate]
    return _cue_fallback(gate, planet)


def _cue_part(gate: int | None, planet: str) -> dict[str, object]:
    if gate is not None and gate in GATE_CUE:
        return {"key": f"today.gateCue.{gate}", "params": {}}
    return _cue_fallback_part(gate, planet)


def _continuity_day_index(
    *,
    natal: dict[str, Any] | None,
    day: date,
    today_sig: dict[str, Any],
    calc_transit,
    calc_overlay,
    tz_name: str | None = None,
) -> int:
    """Count consecutive novelty days (including today) with the same novelty-relevant sky."""
    n = 1
    for i in range(1, 45):
        prev_d = day - timedelta(days=i)
        when = hkt_bucket_instant(prev_d, tz_name)
        t = calc_transit(when)
        o = calc_overlay(natal, t) if natal else None
        sig = sky_signature(natal, t, o)
        same = (
            sig["moon_gate"] == today_sig["moon_gate"]
            and sig["moon_line"] == today_sig["moon_line"]
            and sig["sun_gate"] == today_sig["sun_gate"]
            and sig["sun_line"] == today_sig["sun_line"]
            and sig["hanging"] == today_sig["hanging"]
            and sig["bridges"] == today_sig["bridges"]
            and sig["newly"] == today_sig["newly"]
        )
        if not same:
            break
        n += 1
    return n


def compute_daily_signal(
    *,
    natal: dict[str, Any] | None,
    transit: dict[str, Any] | None,
    overlay: dict[str, Any] | None,
    prev_transit: dict[str, Any] | None,
    prev_overlay: dict[str, Any] | None,
    day: date,
    calc_transit=None,
    calc_overlay=None,
    tz_name: str | None = None,
) -> dict[str, Any]:
    """
    Waterfall §2: Moon gate → Moon line → Sun line → Sun gate → hanging →
    bridges/newly → continuity (key includes day index).
    """
    today = sky_signature(natal, transit, overlay)
    yest = sky_signature(natal, prev_transit, prev_overlay)

    mg, ml = today["moon_gate"], today["moon_line"]
    sg, sl = today["sun_gate"], today["sun_line"]
    ymg, yml = yest["moon_gate"], yest["moon_line"]
    ysg, ysl = yest["sun_gate"], yest["sun_line"]

    source: DailySource
    key: str
    headline: str
    body: str
    gate: int | None = None
    line: int | None = None
    planet: str | None = None
    continuity_day: int | None = None
    phase: str | None = None
    cue_gate: int | None = None
    body_part: dict[str, Any] | None = None

    hp_rows: list[dict[str, Any]] = today["hanging_rows"]

    if mg is not None and mg != ymg:
        source = "moon_gate"
        key = f"moon:{mg}.{ml if ml is not None else '?'}"
        headline = f"Moon into Gate {mg} · line {ml if ml is not None else '?'}"
        body = _cue_for_gate(mg, "Moon")
        body_part = _cue_part(mg, "Moon")
        gate, line, planet, cue_gate = mg, ml, "Moon", mg
    elif mg is not None and ml is not None and ml != yml:
        source = "moon_line"
        key = f"moon:{mg}.{ml}"
        headline = f"Moon still Gate {mg}, now line {ml}"
        body = _cue_for_gate(mg, "Moon")
        body_part = _cue_part(mg, "Moon")
        gate, line, planet, cue_gate = mg, ml, "Moon", mg
    elif sg is not None and sl is not None and sl != ysl:
        source = "sun_line"
        key = f"sun:{sg}.{sl}"
        headline = f"Sun theme shifts to Gate {sg} · line {sl}"
        body = _cue_for_gate(sg, "Sun")
        body_part = _cue_part(sg, "Sun")
        gate, line, planet, cue_gate = sg, sl, "Sun", sg
    elif sg is not None and sg != ysg:
        source = "sun_gate"
        key = f"sun_gate:{sg}"
        headline = f"New Sun gate {sg} — weekly theme turn"
        body = _cue_for_gate(sg, "Sun")
        body_part = _cue_part(sg, "Sun")
        gate, line, planet, cue_gate = sg, sl, "Sun", sg
    elif today["hanging"] != yest["hanging"]:
        source = "hanging_pressure"
        if hp_rows:
            top = hp_rows[0]
            key = f"hanging:{today['hanging']}"
            headline = (
                f"Sky pressing hanging Gate {top['gate']} "
                f"({_center_display(str(top['center']))})"
            )
            body = "Notice without forcing a bridge — pressure is information, not a to-do."
            body_part = {"key": "today.signal.body.hangingOn", "params": {}}
            gate = int(top["gate"]) if top.get("gate") is not None else None
            line = None
            planet = None
            phase = "on"
            cue_gate = gate
        else:
            key = "hanging:clear"
            headline = "Hanging-gate pressure clears"
            body = "Yesterday's hanging pressure has lifted — note the quieter field."
            body_part = {"key": "today.signal.body.hangingClear", "params": {}}
            phase = "clear"
    elif today["bridges"] != yest["bridges"] or today["newly"] != yest["newly"]:
        source = "conditioning"
        if today["newly"] or today["bridges"]:
            phase = "on"
        else:
            phase = "clear"
        if today["newly"] and today["newly"] != yest["newly"]:
            centers = ", ".join(
                _center_display(c) for c in today["newly"].split(",") if c
            )
            key = f"newly:{today['newly']}"
            headline = f"Conditioning update: {centers}"
            body = "Temporary centers shifted — expect unfamiliar pressure; don't over-identify."
            body_part = {
                "key": "today.signal.body.conditioningNewly",
                "params": {"centers": centers},
            }
        else:
            key = f"bridge:{today['bridges'] or 'clear'}"
            headline = "Conditioning update: bridges"
            if phase == "clear":
                body = "The temporary wires of yesterday are no longer in the field."
                body_part = {"key": "today.signal.body.conditioningClear", "params": {}}
            else:
                body = "Personal bridges shifted — watch who or what feels magnetic today."
                body_part = {"key": "today.signal.body.conditioningBridges", "params": {}}
    else:
        source = "continuity"
        day_n = 1
        if calc_transit is not None:
            day_n = _continuity_day_index(
                natal=natal,
                day=day,
                today_sig=today,
                calc_transit=calc_transit,
                calc_overlay=calc_overlay or (lambda _n, _t: None),
                tz_name=tz_name,
            )
        else:
            # Fallback when walker not supplied: use day-of-year so keys still differ
            day_n = day.toordinal()
        key = f"continuity:sun{sg}:moon{_gl_label(mg, ml)}:day{day_n}"
        headline = (
            f"Day {day_n} of Sun Gate {sg if sg is not None else '?'} · "
            f"Moon {_gl_label(mg, ml)}"
        )
        body = (
            "Hold the same theme; watch open-center amplification rather than forcing a new move."
        )
        body_part = {"key": "today.signal.body.continuity", "params": {}}
        continuity_day = day_n
        # Term caption + cue: Sun theme first, else Moon.
        if sg is not None:
            gate, line, planet, cue_gate = sg, sl, "Sun", sg
        elif mg is not None:
            gate, line, planet, cue_gate = mg, ml, "Moon", mg
        if cue_gate is not None:
            body = _cue_for_gate(cue_gate, planet or "Sun")
            body_part = _cue_part(cue_gate, planet or "Sun")

    return {
        "key": key,
        "headline": headline,
        "body": body,
        "source": source,
        "gate": gate,
        "line": line,
        "planet": planet,
        "continuity_day": continuity_day,
        "phase": phase,
        "cue_gate": cue_gate,
        "body_part": body_part,
    }


def compute_vs_yesterday(
    *,
    natal: dict[str, Any] | None,
    transit: dict[str, Any] | None,
    overlay: dict[str, Any] | None,
    prev_transit: dict[str, Any] | None,
    prev_overlay: dict[str, Any] | None,
    energy_today: int | None = None,
    energy_yest: int | None = None,
    space_today: str | None = None,
    space_yest: str | None = None,
    daily_source: str | None = None,
    continuity_headline: str | None = None,
) -> list[dict[str, str]]:
    """Only fields that changed — pills for the FE."""
    today = sky_signature(natal, transit, overlay)
    yest = sky_signature(natal, prev_transit, prev_overlay)
    out: list[dict[str, str]] = []

    t_moon = _gl_label(today["moon_gate"], today["moon_line"])
    y_moon = _gl_label(yest["moon_gate"], yest["moon_line"])
    if t_moon != y_moon and today["moon_gate"] is not None:
        out.append({"field": "moon", "from": y_moon, "to": t_moon})

    t_sun = _gl_label(today["sun_gate"], today["sun_line"])
    y_sun = _gl_label(yest["sun_gate"], yest["sun_line"])
    if t_sun != y_sun and today["sun_gate"] is not None:
        out.append({"field": "sun", "from": y_sun, "to": t_sun})

    if today["hanging"] != yest["hanging"]:
        out.append(
            {
                "field": "hanging_pressure",
                "from": yest["hanging"] or "none",
                "to": today["hanging"] or "none",
            }
        )

    if today["bridges"] != yest["bridges"]:
        out.append(
            {
                "field": "bridge",
                "from": yest["bridges"] or "none",
                "to": today["bridges"] or "none",
            }
        )

    if today["newly"] != yest["newly"]:
        out.append(
            {
                "field": "newly_defined",
                "from": yest["newly"] or "none",
                "to": today["newly"] or "none",
            }
        )

    if (
        energy_today is not None
        and energy_yest is not None
        and energy_today != energy_yest
    ):
        out.append(
            {
                "field": "energy",
                "from": str(energy_yest),
                "to": str(energy_today),
            }
        )

    if space_today and space_yest and space_today != space_yest:
        out.append({"field": "space", "from": space_yest, "to": space_today})

    if not out and daily_source == "continuity" and continuity_headline:
        out.append(
            {
                "field": "moon",
                "from": "same conditioning",
                "to": continuity_headline,
            }
        )

    return out



def _field_continuity_day_index(
    *,
    natal: dict[str, Any] | None,
    day: date,
    today_sig: dict[str, Any],
    calc_transit,
    calc_overlay,
    fields: tuple[str, ...],
    tz_name: str | None = None,
) -> int:
    """Count consecutive novelty days (including today) matching selected sky_signature fields."""
    n = 1
    for i in range(1, 45):
        prev_d = day - timedelta(days=i)
        when = hkt_bucket_instant(prev_d, tz_name)
        t = calc_transit(when)
        o = calc_overlay(natal, t) if natal else None
        sig = sky_signature(natal, t, o)
        same = all(sig.get(f) == today_sig.get(f) for f in fields)
        if not same:
            break
        n += 1
    return n


def compute_tomorrow_tease(
    *,
    day: date,
    transit: dict[str, Any] | None,
    calc_transit=None,
    tz_name: str | None = None,
) -> dict[str, Any]:
    """
    Structured tomorrow tease from next novelty-day Moon/Sun gates.
    Mechanics only — never invents a lifestyle Move.
    """
    mg_t, _ml_t = gate_line(transit, "Moon")
    sg_t, _sl_t = gate_line(transit, "Sun")
    mg_n: int | None = None
    sg_n: int | None = None
    if calc_transit is not None:
        next_t = calc_transit(hkt_bucket_instant(day + timedelta(days=1), tz_name))
        mg_n, _ = gate_line(next_t, "Moon")
        sg_n, _ = gate_line(next_t, "Sun")

    if mg_t is not None and mg_n is not None and mg_t != mg_n:
        kind = "moon_leaves"
        text = "Tomorrow: Moon leaves this gate"
    elif mg_t is not None and mg_n is not None and mg_t == mg_n:
        kind = "moon_holds"
        text = "Tomorrow: Moon holds this gate"
    elif sg_t is not None and sg_n is not None and sg_t != sg_n:
        kind = "sun_theme_leaves"
        text = "Tomorrow: Sun theme turns"
    elif sg_t is not None:
        kind = "sun_theme_holds"
        text = "Tomorrow: Sun theme holds"
    else:
        kind = "sun_theme_holds"
        text = "Tomorrow: Sun theme holds"

    return {
        "kind": kind,
        "text": text,
        "moon_gate_today": mg_t,
        "moon_gate_tomorrow": mg_n,
        "sun_gate_today": sg_t,
        "sun_gate_tomorrow": sg_n,
    }


def compute_sky_story(
    *,
    natal: dict[str, Any] | None,
    transit: dict[str, Any] | None,
    overlay: dict[str, Any] | None,
    prev_transit: dict[str, Any] | None,
    prev_overlay: dict[str, Any] | None,
    day: date,
    daily_signal: dict[str, Any] | None = None,
    calc_transit=None,
    calc_overlay=None,
    tz_name: str | None = None,
) -> dict[str, Any]:
    """
    Free sky chapter: 2-4 observational lines + one muted tomorrow tease.
    Deterministic templates only — no LLM, no destiny language, no Move tease.
    """
    today = sky_signature(natal, transit, overlay)
    has_yest = prev_transit is not None
    yest = sky_signature(natal, prev_transit, prev_overlay) if has_yest else None

    mg, ml = today["moon_gate"], today["moon_line"]
    sg, sl = today["sun_gate"], today["sun_line"]

    overlay_fn = calc_overlay or (lambda _n, _t: None)
    sun_day = 1
    bridge_day = 1
    if calc_transit is not None and sg is not None:
        sun_day = _field_continuity_day_index(
            natal=natal,
            day=day,
            today_sig=today,
            calc_transit=calc_transit,
            calc_overlay=overlay_fn,
            fields=("sun_gate",),
            tz_name=tz_name,
        )
    if calc_transit is not None and today["bridges"]:
        bridge_day = _field_continuity_day_index(
            natal=natal,
            day=day,
            today_sig=today,
            calc_transit=calc_transit,
            calc_overlay=overlay_fn,
            fields=("bridges",),
            tz_name=tz_name,
        )

    lines: list[str] = []
    line_parts: list[dict[str, Any]] = []

    def _add_line(english: str, key: str, **params: Any) -> None:
        lines.append(english)
        part: dict[str, Any] = {"key": key}
        clean = {k: v for k, v in params.items() if v is not None}
        if clean:
            part["params"] = clean
        line_parts.append(part)

    if not has_yest:
        if sg is not None:
            _add_line(
                f"Day 1 of this Sun theme (Gate {sg}).",
                "today.skyStory.day1SunTheme",
                gate=sg,
            )
        else:
            _add_line("Day 1 of this sky chapter.", "today.skyStory.day1Chapter")
        if mg is not None:
            if ml is not None:
                _add_line(
                    f"Moon in Gate {mg} · line {ml}.",
                    "today.skyStory.moonInGateLine",
                    gate=mg,
                    line=ml,
                )
            else:
                _add_line(
                    f"Moon in Gate {mg}.",
                    "today.skyStory.moonInGate",
                    gate=mg,
                )
    else:
        assert yest is not None
        moon_flipped = (
            today["moon_gate"] != yest["moon_gate"]
            or today["moon_line"] != yest["moon_line"]
        )
        sun_flipped = (
            today["sun_gate"] != yest["sun_gate"]
            or today["sun_line"] != yest["sun_line"]
        )
        bridge_flipped = today["bridges"] != yest["bridges"]
        newly_flipped = today["newly"] != yest["newly"]
        hanging_flipped = today["hanging"] != yest["hanging"]

        if moon_flipped and mg is not None:
            if today["moon_gate"] != yest["moon_gate"]:
                _add_line(
                    f"Moon moved to Gate {mg}.",
                    "today.skyStory.moonMoved",
                    gate=mg,
                )
            else:
                _add_line(
                    f"Moon still Gate {mg}, now line {ml if ml is not None else '?'}.",
                    "today.skyStory.moonNewLine",
                    gate=mg,
                    line=ml if ml is not None else "?",
                )
        elif mg is not None:
            _add_line(
                f"Moon holds Gate {_gl_label(mg, ml)}.",
                "today.skyStory.moonHolds",
                label=_gl_label(mg, ml),
            )

        if sun_flipped and sg is not None:
            _add_line(
                f"Sun/Earth theme turned to Gate {sg}.",
                "today.skyStory.sunTurned",
                gate=sg,
            )
        elif sg is not None:
            if sun_day <= 1:
                _add_line(
                    f"Day 1 of this Sun theme (Gate {sg}).",
                    "today.skyStory.day1SunTheme",
                    gate=sg,
                )
            else:
                _add_line(
                    f"Sun/Earth still in this theme — day {sun_day}.",
                    "today.skyStory.sunStill",
                    day=sun_day,
                )

        if today["bridges"]:
            if bridge_flipped:
                _add_line("A bridge flipped on today.", "today.skyStory.bridgeOn")
            elif bridge_day > 1:
                _add_line(
                    f"This bridge is on day {bridge_day}.",
                    "today.skyStory.bridgeDay",
                    day=bridge_day,
                )
            else:
                _add_line("A bridge is active today.", "today.skyStory.bridgeActive")
        elif bridge_flipped and yest["bridges"]:
            _add_line("Yesterday's bridge cleared.", "today.skyStory.bridgeCleared")

        if newly_flipped and today["newly"]:
            centers = ", ".join(
                _center_display(c) for c in today["newly"].split(",") if c
            )
            if centers:
                _add_line(
                    f"Temporary center peeks: {centers}.",
                    "today.skyStory.tempCenters",
                    centers=centers,
                )
        elif hanging_flipped and today["hanging_rows"]:
            top = today["hanging_rows"][0]
            _add_line(
                f"Hanging pressure peeks at Gate {top['gate']} "
                f"({_center_display(str(top['center']))}).",
                "today.skyStory.hangingPeek",
                gate=top["gate"],
                center=_center_display(str(top["center"])),
            )

    # Ensure 2-4 lines; pad observationally if thin — never echo the hero lead.
    if len(lines) < 2 and daily_signal:
        src = daily_signal.get("source")
        if src == "continuity" and sg is not None:
            pad = f"Hold the same Sun Gate {sg} theme."
            if pad not in lines:
                _add_line(pad, "today.skyStory.holdSunTheme", gate=sg)
        elif daily_signal.get("cue_gate") is not None:
            cg = daily_signal.get("cue_gate")
            pad = f"Today is coloured by Gate {cg}."
            if pad not in lines:
                _add_line(pad, "today.skyStory.colouredByGate", gate=cg)

    if len(lines) < 2:
        if sg is not None and all("Sun" not in ln for ln in lines):
            _add_line(
                f"Sun/Earth in Gate {sg}.",
                "today.skyStory.sunInGate",
                gate=sg,
            )
        if mg is not None and all("Moon" not in ln for ln in lines):
            _add_line(
                f"Moon in Gate {_gl_label(mg, ml)}.",
                "today.skyStory.moonInLabel",
                label=_gl_label(mg, ml),
            )
    if not lines:
        _add_line("Sky chapter opens today.", "today.skyStory.opens")

    lines = lines[:4]
    line_parts = line_parts[:4]

    tomorrow = compute_tomorrow_tease(
        day=day,
        transit=transit,
        calc_transit=calc_transit,
        tz_name=tz_name,
    )

    return {
        "lines": lines,
        "line_parts": line_parts,
        "tomorrow": tomorrow,
        "continuity_day": sun_day,
        "bridge_day": bridge_day if today["bridges"] else 0,
    }


def sky_notice_sun_moon(transit: dict[str, Any] | None) -> str | None:
    """Compact Sun/Moon clause for Main action on every energy band."""
    sg, sl = gate_line(transit, "Sun")
    mg, ml = gate_line(transit, "Moon")
    parts: list[str] = []
    if sg is not None and sl is not None:
        parts.append(f"Sun {sg}.{sl}")
    elif sg is not None:
        parts.append(f"Sun {sg}")
    if mg is not None and ml is not None:
        parts.append(f"Moon {mg}.{ml}")
    elif mg is not None:
        parts.append(f"Moon {mg}")
    if not parts:
        return None
    return "Notice " + " / ".join(parts)


UPCOMING_HORIZON_DAYS = 7

UpcomingChangeKind = Literal[
    "sun_theme_turns",
    "bridge_on",
    "bridge_clears",
    "moon_leaves",
]


def _channel_rows(overlay: dict[str, Any] | None) -> list[dict[str, Any]]:
    """Structured bridge rows (name + gates) for official secondary labels."""
    rows: list[dict[str, Any]] = []
    seen: set[tuple[Any, ...]] = set()
    for b in (overlay or {}).get("bridged_channels") or []:
        if not isinstance(b, dict):
            continue
        gates: list[int] = []
        for g in b.get("gates") or []:
            try:
                gates.append(int(g))
            except (TypeError, ValueError):
                continue
        gates = sorted(gates)
        key: tuple[Any, ...] = tuple(gates) if gates else (str(b.get("name") or ""),)
        if key in seen:
            continue
        seen.add(key)
        rows.append({"name": str(b.get("name") or ""), "gates": gates})
    rows.sort(key=lambda r: (r["gates"], r["name"]))
    return rows


def _bridge_id(row: dict[str, Any]) -> tuple[Any, ...]:
    gates = row.get("gates") or []
    return tuple(gates) if gates else (str(row.get("name") or ""),)


def compute_upcoming_horizon(
    *,
    natal: dict[str, Any] | None,
    day: date,
    calc_transit,
    calc_overlay=None,
    days: int = UPCOMING_HORIZON_DAYS,
) -> dict[str, Any]:
    """
    Next `days` novelty days after `day` (tomorrow through day+N).

    Uses the same bucket helper as GET /transits/today (`hkt_bucket_instant`).
    Compares consecutive days only — no 44-day backward continuity walks.
    Does not invent lifestyle Moves or kit leads.
    """
    horizon = max(0, int(days))
    overlay_fn = calc_overlay if (natal and calc_overlay) else None

    def _pack(d: date) -> tuple[dict[str, Any], dict[str, Any] | None, dict[str, Any], list[dict[str, Any]]]:
        transit = calc_transit(hkt_bucket_instant(d))
        overlay = overlay_fn(natal, transit) if overlay_fn else None
        sig = sky_signature(natal, transit, overlay)
        return transit, overlay, sig, _channel_rows(overlay)

    # Baseline is the current novelty day so day+1 can diff against it.
    _t0, _o0, prev_sig, _prev_bridges = _pack(day)
    prev_bridge_rows = _prev_bridges
    out_days: list[dict[str, Any]] = []

    for i in range(1, horizon + 1):
        d = day + timedelta(days=i)
        _t, _o, sig, bridge_rows = _pack(d)
        changes: list[dict[str, Any]] = []

        if sig["sun_gate"] != prev_sig["sun_gate"]:
            changes.append(
                {
                    "kind": "sun_theme_turns",
                    "text": "Sun theme turns.",
                    "sun_gate": sig["sun_gate"],
                    "sun_line": sig["sun_line"],
                    "from_sun_gate": prev_sig["sun_gate"],
                    "from_sun_line": prev_sig["sun_line"],
                }
            )

        prev_ids = {_bridge_id(r): r for r in prev_bridge_rows}
        next_ids = {_bridge_id(r): r for r in bridge_rows}
        for key, row in next_ids.items():
            if key not in prev_ids:
                changes.append(
                    {
                        "kind": "bridge_on",
                        "text": "A bridge comes on.",
                        "channel": row.get("name") or None,
                        "gates": list(row.get("gates") or []),
                    }
                )
        for key, row in prev_ids.items():
            if key not in next_ids:
                changes.append(
                    {
                        "kind": "bridge_clears",
                        "text": "A bridge clears.",
                        "channel": row.get("name") or None,
                        "gates": list(row.get("gates") or []),
                    }
                )

        if sig["moon_gate"] != prev_sig["moon_gate"]:
            changes.append(
                {
                    "kind": "moon_leaves",
                    "text": "Moon leaves this gate.",
                    "moon_gate": sig["moon_gate"],
                    "moon_line": sig["moon_line"],
                    "from_moon_gate": prev_sig["moon_gate"],
                    "from_moon_line": prev_sig["moon_line"],
                }
            )

        out_days.append(
            {
                "day": d.isoformat(),
                "sun_gate": sig["sun_gate"],
                "sun_line": sig["sun_line"],
                "moon_gate": sig["moon_gate"],
                "moon_line": sig["moon_line"],
                "bridges": bridge_rows,
                "changes": changes,
            }
        )
        prev_sig = sig
        prev_bridge_rows = bridge_rows

    return {
        "today": day.isoformat(),
        "horizon_days": horizon,
        "days": out_days,
    }
