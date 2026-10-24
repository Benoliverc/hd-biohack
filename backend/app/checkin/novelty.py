"""Daily Novelty Contract — HKT-bucketed daily_signal waterfall (HD × transits only)."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any, Literal
from zoneinfo import ZoneInfo

from ..hd.channels import GATE_TO_CENTER

HKT = ZoneInfo("Asia/Hong_Kong")
BUCKET_HOUR = 7  # fixed 07:00 Asia/Hong_Kong — stick to this

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
    # sparse deterministic cues — fallback uses center
}


def hkt_bucket_instant(day: date | None = None) -> datetime:
    """Ephemeris bucket at 07:00 Asia/Hong_Kong for calendar day D."""
    if day is None:
        day = datetime.now(HKT).date()
    return datetime(day.year, day.month, day.day, BUCKET_HOUR, 0, 0, tzinfo=HKT)


def hkt_today() -> date:
    return datetime.now(HKT).date()


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


def _cue_for_gate(gate: int | None, planet: str) -> str:
    if gate is None:
        return f"Let today's {planet} theme colour the day without forcing it."
    center = GATE_TO_CENTER.get(gate)
    if center:
        return (
            f"Notice {planet} through {_center_display(center)} "
            f"(Gate {gate}) — colour the day without forcing it."
        )
    return f"Notice {planet} in Gate {gate} — colour the day without forcing it."


def _continuity_day_index(
    *,
    natal: dict[str, Any] | None,
    day: date,
    today_sig: dict[str, Any],
    calc_transit,
    calc_overlay,
) -> int:
    """Count consecutive HKT days (including today) with the same novelty-relevant sky."""
    n = 1
    for i in range(1, 45):
        prev_d = day - timedelta(days=i)
        when = hkt_bucket_instant(prev_d)
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

    # Prefer personal colour in body when hanging pressure present
    hp_rows: list[dict[str, Any]] = today["hanging_rows"]
    personal_body = None
    if hp_rows:
        top = hp_rows[0]
        personal_body = (
            f"Sky pressing hanging Gate {top['gate']} "
            f"({_center_display(str(top['center']))}) — notice without forcing a bridge."
        )

    if mg is not None and mg != ymg:
        source = "moon_gate"
        key = f"moon:{mg}.{ml if ml is not None else '?'}"
        headline = f"Moon into Gate {mg} · line {ml if ml is not None else '?'}"
        body = personal_body or _cue_for_gate(mg, "Moon")
    elif mg is not None and ml is not None and ml != yml:
        source = "moon_line"
        key = f"moon:{mg}.{ml}"
        headline = f"Moon still Gate {mg}, now line {ml}"
        body = personal_body or _cue_for_gate(mg, "Moon")
    elif sg is not None and sl is not None and sl != ysl:
        source = "sun_line"
        key = f"sun:{sg}.{sl}"
        headline = f"Sun theme shifts to Gate {sg} · line {sl}"
        body = personal_body or _cue_for_gate(sg, "Sun")
    elif sg is not None and sg != ysg:
        source = "sun_gate"
        key = f"sun_gate:{sg}"
        headline = f"New Sun gate {sg} — weekly theme turn"
        body = personal_body or _cue_for_gate(sg, "Sun")
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
        else:
            key = "hanging:clear"
            headline = "Hanging-gate pressure clears"
            body = "Yesterday's hanging pressure has lifted — note the quieter field."
    elif today["bridges"] != yest["bridges"] or today["newly"] != yest["newly"]:
        source = "conditioning"
        if today["newly"] and today["newly"] != yest["newly"]:
            centers = ", ".join(
                _center_display(c) for c in today["newly"].split(",") if c
            )
            key = f"newly:{today['newly']}"
            headline = f"Conditioning update: {centers}"
            body = "Temporary centers shifted — expect unfamiliar pressure; don't over-identify."
        else:
            key = f"bridge:{today['bridges'] or 'clear'}"
            headline = "Conditioning update: bridges"
            body = "Personal bridges shifted — watch who or what feels magnetic today."
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

    return {
        "key": key,
        "headline": headline,
        "body": body,
        "source": source,
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
