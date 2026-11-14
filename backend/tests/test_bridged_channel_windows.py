"""Bridged-channel ownership fields and 07:00-bucket window walks."""
from __future__ import annotations

import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.checkin.novelty import hkt_bucket_instant
from app.hd.bridged_windows import (
    BRIDGE_WINDOW_CAP,
    annotate_bridged_channel_windows,
)
from app.hd.channels import active_channels, defined_centers, hanging_gates
from app.hd.chart import overlay_transits, planet_display_name

HKT = ZoneInfo("Asia/Hong_Kong")
TODAY = date(2026, 5, 8)
CHANNEL_10_20 = frozenset({10, 20})


def _act(planet: str, gate: int, line: int = 1) -> dict:
    return {
        "planet": planet,
        "gate": gate,
        "line": line,
        "label": f"{gate}.{line}",
        "color": "transit",
    }


def _natal(*, gates: set[int]) -> dict:
    channels = active_channels(set(gates))
    return {
        "activated_gates": sorted(gates),
        "channels": channels,
        "defined_centers": sorted(defined_centers(channels)),
        "hanging_gates": hanging_gates(set(gates)),
    }


def _transit(activations: list[dict], extra_gates: set[int] | None = None) -> dict:
    gates = {int(a["gate"]) for a in activations}
    if extra_gates:
        gates |= set(extra_gates)
    sun = next((a for a in activations if a["planet"] == "Sun"), _act("Sun", 1, 1))
    earth = next((a for a in activations if a["planet"] == "Earth"), _act("Earth", 2, 1))
    return {
        "at_utc": "2026-05-07T23:00:00+00:00",
        "activations": activations,
        "activated_gates": sorted(gates),
        "channels": active_channels(gates),
        "sun_earth": {"sun": sun, "earth": earth},
    }


def test_planet_display_name_uses_official_node_labels():
    assert planet_display_name("North_Node") == "North Node"
    assert planet_display_name("South_Node") == "South Node"
    assert planet_display_name("Sun") == "Sun"


def test_overlay_annotates_hanging_natal_and_sky_ends():
    natal = _natal(gates={10, 7, 31})
    transit = _transit(
        [
            _act("Sun", 13, 2),
            _act("Earth", 7, 2),
            _act("North_Node", 20, 3),
            _act("Mercury", 20, 1),
        ]
    )
    overlay = overlay_transits(natal, transit)
    rows = overlay["bridged_channels"]
    row = next(r for r in rows if set(r["gates"]) == {10, 20})
    assert row["name"] == "Awakening"
    assert row["kind"] == "hanging"
    assert row["natal_gates"] == [10]
    assert row["transit_gates"] == [20]
    assert row["transit_planets"] == [
        {"name": "North Node", "gate": 20, "line": 3},
        {"name": "Mercury", "gate": 20, "line": 1},
    ]
    assert "window_start" not in row
    assert "window_end" not in row
    # Personal hanging drop any pure transit-transit row (e.g. none expected here).
    assert all(r["kind"] == "hanging" for r in rows)


def test_overlay_transit_transit_only_when_no_personal_bridges():
    natal = _natal(gates={1, 8})  # already has Inspiration; no hanging 10 or 20
    transit = _transit(
        [
            _act("Sun", 10, 2),
            _act("Earth", 15, 2),
            _act("Moon", 20, 4),
        ]
    )
    overlay = overlay_transits(natal, transit)
    row = next(r for r in overlay["bridged_channels"] if set(r["gates"]) == {10, 20})
    assert row["kind"] == "transit_transit"
    assert row["natal_gates"] == []
    assert row["transit_gates"] == [10, 20]
    names = {p["name"] for p in row["transit_planets"]}
    assert names == {"Sun", "Moon"}


def _day_map_calc(day_activations: dict[date, list[dict]]):
    def calc_transit(when: datetime):
        # when is the 07:00 instant in the account TZ.
        local = when.astimezone(HKT)
        bucket = date(local.year, local.month, local.day)
        acts = day_activations.get(bucket)
        if acts is None:
            # Absent day: no completing gates.
            return _transit([_act("Sun", 13, 1), _act("Earth", 7, 1)])
        return _transit(acts)

    return calc_transit


def _on_20(planet: str = "Moon", line: int = 1) -> list[dict]:
    return [_act("Sun", 13, 1), _act("Earth", 7, 1), _act(planet, 20, line)]


def test_window_walk_matches_0700_buckets_for_known_fixture():
    natal = _natal(gates={10, 7, 31})
    # Channel 10–20 is on 1 May through 15 May inclusive; off on 30 Apr and 16 May.
    days = {TODAY - timedelta(days=i) for i in range(-20, 21)}
    activations = {}
    for d in days:
        if date(2026, 5, 1) <= d <= date(2026, 5, 15):
            activations[d] = _on_20("Moon" if d.day % 2 else "Sun", line=2)
        else:
            activations[d] = [_act("Sun", 13, 1), _act("Earth", 7, 1)]

    today_transit = _transit(activations[TODAY])
    overlay = overlay_transits(natal, today_transit)
    annotate_bridged_channel_windows(
        natal,
        overlay,
        TODAY,
        "Asia/Hong_Kong",
        calc_transit=_day_map_calc(activations),
        calc_overlay=overlay_transits,
        cap=900,
    )
    row = next(r for r in overlay["bridged_channels"] if set(r["gates"]) == {10, 20})
    assert row["window_start"] == "2026-05-01"
    assert row["window_end"] == "2026-05-15"
    assert row["natal_gates"] == [10]
    assert row["transit_gates"] == [20]
    assert row["transit_planets"][0]["gate"] == 20
    assert overlay["novelty_day"] == "2026-05-08"
    # Walk uses the same 07:00 HKT instant Today already uses.
    inst = hkt_bucket_instant(TODAY, "Asia/Hong_Kong")
    assert inst.hour == 7 and inst.tzinfo == HKT


def test_retrograde_reentry_stays_one_window_if_channel_never_clears():
    natal = _natal(gates={10, 7, 31})
    # Moon holds 20, briefly "retraces," but another planet (or the Moon again)
    # is still on 20 at every 07:00 bucket — the channel never disappears.
    activations = {}
    for i in range(0, 12):
        d = date(2026, 5, 1) + timedelta(days=i)
        # Mid-window "retrograde": swap the completing planet, still on gate 20.
        planet = "Moon" if i not in {4, 5, 6} else "Mercury"
        activations[d] = _on_20(planet, line=3 if i in {4, 5, 6} else 1)
    today_transit = _transit(activations[TODAY])
    overlay = overlay_transits(natal, today_transit)
    annotate_bridged_channel_windows(
        natal,
        overlay,
        TODAY,
        "Asia/Hong_Kong",
        calc_transit=_day_map_calc(activations),
        calc_overlay=overlay_transits,
        cap=900,
    )
    row = next(r for r in overlay["bridged_channels"] if set(r["gates"]) == {10, 20})
    assert row["window_start"] == "2026-05-01"
    assert row["window_end"] == "2026-05-12"


def test_cleared_gap_starts_a_new_window_after_reentry():
    natal = _natal(gates={10, 7, 31})
    activations = {}
    for i in range(0, 15):
        d = date(2026, 5, 1) + timedelta(days=i)
        # Off on 5 May, back on from 6 May.
        if d == date(2026, 5, 5):
            activations[d] = [_act("Sun", 13, 1), _act("Earth", 7, 1)]
        else:
            activations[d] = _on_20("Moon")
    today_transit = _transit(activations[TODAY])
    overlay = overlay_transits(natal, today_transit)
    annotate_bridged_channel_windows(
        natal,
        overlay,
        TODAY,
        "Asia/Hong_Kong",
        calc_transit=_day_map_calc(activations),
        calc_overlay=overlay_transits,
    )
    row = next(r for r in overlay["bridged_channels"] if set(r["gates"]) == {10, 20})
    assert row["window_start"] == "2026-05-06"
    assert row["window_end"] == "2026-05-15"


def test_cap_hit_yields_null_not_a_guessed_date():
    natal = _natal(gates={10, 7, 31})
    activations = {}
    for i in range(-30, 31):
        activations[TODAY + timedelta(days=i)] = _on_20("Pluto", line=1)
    today_transit = _transit(activations[TODAY])
    overlay = overlay_transits(natal, today_transit)
    annotate_bridged_channel_windows(
        natal,
        overlay,
        TODAY,
        "Asia/Hong_Kong",
        calc_transit=_day_map_calc(activations),
        calc_overlay=overlay_transits,
        cap=3,
    )
    row = next(r for r in overlay["bridged_channels"] if set(r["gates"]) == {10, 20})
    assert row["window_start"] is None
    assert row["window_end"] is None


def test_default_cap_is_at_least_900():
    assert BRIDGE_WINDOW_CAP >= 900
