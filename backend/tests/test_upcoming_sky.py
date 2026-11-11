"""Upcoming sky — range endpoint and horizon helper (item 11)."""

from __future__ import annotations

import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from app.checkin.novelty import (
    BUCKET_HOUR,
    UPCOMING_HORIZON_DAYS,
    compute_upcoming_horizon,
    hkt_bucket_instant,
    hkt_today,
)
from app.database import init_db
from app.main import app

client = TestClient(app)
HKT = ZoneInfo("Asia/Hong_Kong")


def _transit(*, sun_g, sun_l, moon_g, moon_l, gates=None):
    sun = {"planet": "Sun", "gate": sun_g, "line": sun_l, "label": f"{sun_g}.{sun_l}"}
    moon = {"planet": "Moon", "gate": moon_g, "line": moon_l, "label": f"{moon_g}.{moon_l}"}
    earth = {"planet": "Earth", "gate": 1, "line": 1, "label": "1.1"}
    activated = gates if gates is not None else [sun_g, moon_g, 1]
    return {
        "activations": [sun, earth, moon],
        "activated_gates": activated,
        "sun_earth": {"sun": sun, "earth": earth},
    }


def _natal():
    return {
        "type": "Generator",
        "strategy": "To Respond",
        "defined_centers": ["Sacral", "Root"],
        "undefined_centers": [
            "Head",
            "Ajna",
            "Throat",
            "G",
            "Heart",
            "Solar_Plexus",
            "Spleen",
        ],
        "activated_gates": [5, 14],
        "hanging_gates": [],
        "channels": [],
    }


def _scripted_calc(script: dict[date, dict]):
    calls: list[datetime] = []

    def calc(when):
        calls.append(when)
        d = when.date() if hasattr(when, "date") else when
        if d not in script:
            raise AssertionError(f"unexpected bucket day {d}")
        return script[d]

    return calc, calls


def test_horizon_is_seven_novelty_days_after_today():
    day = date(2026, 11, 11)
    # Today + 7 future days
    script = {}
    for i in range(0, 8):
        d = day + timedelta(days=i)
        # hold sun 50; moon leaves on day+2 (Nov 13)
        moon = 17 if i < 2 else 51
        sun = 50 if i < 4 else 10  # theme turns on day+4 (Nov 15)
        script[d] = _transit(sun_g=sun, sun_l=1, moon_g=moon, moon_l=1)

    def overlay(_natal, transit):
        # Bridge on while Moon is 51 and Sun is still 50 (Nov 13–14);
        # it clears when the Sun theme turns on Nov 15.
        d_sun = transit["sun_earth"]["sun"]["gate"]
        d_moon = transit["activations"][2]["gate"]
        if d_sun == 50 and d_moon == 51:
            return {
                "bridged_channels": [
                    {"gates": [1, 8], "name": "Inspiration", "centers": ["G", "Throat"]}
                ],
                "newly_defined_centers": [],
            }
        return {"bridged_channels": [], "newly_defined_centers": []}

    calc, calls = _scripted_calc(script)
    payload = compute_upcoming_horizon(
        natal=_natal(),
        day=day,
        calc_transit=calc,
        calc_overlay=overlay,
    )
    assert payload["today"] == "2026-11-11"
    assert payload["horizon_days"] == 7
    assert len(payload["days"]) == 7
    assert [d["day"] for d in payload["days"]] == [
        (day + timedelta(days=i)).isoformat() for i in range(1, 8)
    ]
    # 8 bucket calls: baseline today + 7 future. No 44-day walk.
    assert len(calls) == 8
    assert all(c.hour == BUCKET_HOUR and c.tzinfo == HKT for c in calls)
    assert all(c == hkt_bucket_instant(c.date()) for c in calls)

    by_day = {d["day"]: d for d in payload["days"]}
    # Nov 12 (tomorrow): hold — no significant changes
    assert by_day["2026-11-12"]["changes"] == []
    # Nov 13: Moon leaves 17 → 51, and a bridge comes on (moon 51 + sun still 50)
    kinds_13 = [c["kind"] for c in by_day["2026-11-13"]["changes"]]
    assert "moon_leaves" in kinds_13
    assert "bridge_on" in kinds_13
    moon = next(c for c in by_day["2026-11-13"]["changes"] if c["kind"] == "moon_leaves")
    assert moon["from_moon_gate"] == 17
    assert moon["moon_gate"] == 51
    bridge = next(c for c in by_day["2026-11-13"]["changes"] if c["kind"] == "bridge_on")
    assert bridge["channel"] == "Inspiration"
    assert bridge["gates"] == [1, 8]
    # Nov 15: Sun theme turns 50 → 10 and the Nov 13–14 bridge clears
    kinds_15 = [c["kind"] for c in by_day["2026-11-15"]["changes"]]
    assert "sun_theme_turns" in kinds_15
    assert "bridge_clears" in kinds_15
    turn = next(c for c in by_day["2026-11-15"]["changes"] if c["kind"] == "sun_theme_turns")
    assert turn["from_sun_gate"] == 50
    assert turn["sun_gate"] == 10
    # Nov 16–18: holds (empty change lists)
    assert by_day["2026-11-16"]["changes"] == []
    # Structured identifiers are present on every day, not just prose
    for d in payload["days"]:
        assert "sun_gate" in d and "moon_gate" in d
        assert "bridges" in d and "changes" in d


def test_horizon_does_not_walk_forty_four_days():
    day = date(2026, 6, 1)
    script = {
        day + timedelta(days=i): _transit(sun_g=20, sun_l=1, moon_g=13, moon_l=1)
        for i in range(0, 8)
    }
    calc, calls = _scripted_calc(script)
    payload = compute_upcoming_horizon(
        natal=None,
        day=day,
        calc_transit=calc,
        calc_overlay=None,
    )
    assert len(calls) == 8
    assert payload["days"]
    assert all(d["changes"] == [] for d in payload["days"])


def test_upcoming_endpoint_uses_same_bucket_as_today(monkeypatch):
    from app.api import routes as routes_mod

    fixed = date(2026, 11, 11)
    monkeypatch.setattr(routes_mod, "hkt_today", lambda: fixed)

    today = client.get("/transits/today")
    upcoming = client.get("/transits/upcoming")
    assert today.status_code == 200, today.text
    assert upcoming.status_code == 200, upcoming.text
    body = upcoming.json()
    assert body["today"] == fixed.isoformat()
    assert body["horizon_days"] == UPCOMING_HORIZON_DAYS
    assert len(body["days"]) == 7
    assert body["days"][0]["day"] == (fixed + timedelta(days=1)).isoformat()
    assert body["days"][-1]["day"] == (fixed + timedelta(days=7)).isoformat()

    tease = (today.json().get("indication") or {}).get("sky_story") or {}
    tomorrow = tease.get("tomorrow") or {}
    first = body["days"][0]
    if tomorrow.get("moon_gate_tomorrow") is not None:
        assert first["moon_gate"] == tomorrow["moon_gate_tomorrow"]
    if tomorrow.get("sun_gate_tomorrow") is not None:
        assert first["sun_gate"] == tomorrow["sun_gate_tomorrow"]


def test_upcoming_stable_inside_one_bucket(monkeypatch):
    from app.api import routes as routes_mod

    fixed = date(2026, 11, 11)
    monkeypatch.setattr(routes_mod, "hkt_today", lambda: fixed)
    a = client.get("/transits/upcoming").json()
    b = client.get("/transits/upcoming").json()
    assert a == b
    # The instant behind each day is the 07:00 novelty bucket, not midnight.
    for row in a["days"]:
        instant = hkt_bucket_instant(date.fromisoformat(row["day"]))
        assert instant.hour == 7
        assert instant.tzinfo == HKT


def test_upcoming_changes_across_0700_boundary(monkeypatch):
    """When the /transits/today novelty day advances, the horizon shifts with it.

    On current main the day helper is calendar-HKT (item 12 will roll it at
    07:00 in the Settings timezone). This test drives the same helper the
    today endpoint uses, so a later rebase keeps the contract.
    """
    from app.api import routes as routes_mod

    d0 = date(2026, 11, 11)
    d1 = date(2026, 11, 12)
    monkeypatch.setattr(routes_mod, "hkt_today", lambda: d0)
    before = client.get("/transits/upcoming").json()
    monkeypatch.setattr(routes_mod, "hkt_today", lambda: d1)
    after = client.get("/transits/upcoming").json()

    assert before["today"] == d0.isoformat()
    assert after["today"] == d1.isoformat()
    assert after["days"][0]["day"] == (d1 + timedelta(days=1)).isoformat()
    assert before["days"][1]["day"] == after["days"][0]["day"]
    # Signatures for the shared novelty days stay stable across the roll.
    before_by = {d["day"]: d for d in before["days"]}
    after_by = {d["day"]: d for d in after["days"]}
    for shared in set(before_by) & set(after_by):
        assert before_by[shared]["sun_gate"] == after_by[shared]["sun_gate"]
        assert before_by[shared]["moon_gate"] == after_by[shared]["moon_gate"]

    # Crossing the 07:00 instant on D vs D+1 uses a different bucket.
    inst_d0 = hkt_bucket_instant(d0)
    inst_d1 = hkt_bucket_instant(d1)
    assert inst_d0 == datetime(2026, 11, 11, 7, 0, 0, tzinfo=HKT)
    assert inst_d1 == datetime(2026, 11, 12, 7, 0, 0, tzinfo=HKT)
    assert inst_d0 != inst_d1


def test_upcoming_missing_chart_404(monkeypatch):
    from app.api import routes as routes_mod

    init_db()
    monkeypatch.setattr(routes_mod, "hkt_today", lambda: date(2026, 11, 11))
    res = client.get("/transits/upcoming", params={"natal_chart_id": 9_999_999})
    assert res.status_code == 404


def test_hkt_today_helper_alignment():
    """Sanity: unit helper and live clock agree when unpatched (same function)."""
    assert hkt_today() == datetime.now(HKT).date()
