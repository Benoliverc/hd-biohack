"""Environment (Variables): Color of the Design Nodes → Caves … Shores (Color 3 shows as Workshops).

Covers the mandala Color/Tone subdivision, NN/SN agreement, the read-time enrichment of saved
charts (no migration), and the birth-time cases (unknown → noon, known noon, legacy null).
"""
from __future__ import annotations

import copy
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.hd.chart import calculate_chart
from app.hd.environment import (
    ENVIRONMENT_BY_COLOR,
    ENVIRONMENT_KEYS,
    EnvironmentNodeMismatch,
    environment_for_chart,
    environment_from_node_longitudes,
    with_environment,
)
from app.hd.mandala import (
    COLOR_SPAN,
    LINE_SPAN,
    MANDALA_START,
    TONE_SPAN,
    gate_line_start_longitude,
    longitude_to_color_tone,
    longitude_to_gate_line,
)

EPS = 1e-7


def test_spans():
    assert COLOR_SPAN == pytest.approx(0.15625)
    assert TONE_SPAN == pytest.approx(5.625 / 216)
    assert LINE_SPAN == pytest.approx(6 * COLOR_SPAN)


def test_display_names_use_workshops_not_kitchens():
    assert ENVIRONMENT_BY_COLOR == {
        1: "Caves", 2: "Markets", 3: "Workshops", 4: "Mountains", 5: "Valleys", 6: "Shores",
    }
    assert "Kitchens" not in ENVIRONMENT_BY_COLOR.values()
    assert "Studios" not in ENVIRONMENT_BY_COLOR.values()


@pytest.mark.parametrize("color", range(1, 7))
def test_every_color_band_and_its_edges(color):
    line_start = gate_line_start_longitude(41, 3)
    lo = line_start + (color - 1) * COLOR_SPAN
    # Start edge, middle, and just before the end edge stay in this Color.
    assert longitude_to_color_tone(lo + EPS) == (color, 1)
    assert longitude_to_color_tone(lo + COLOR_SPAN / 2)[0] == color
    assert longitude_to_color_tone(lo + COLOR_SPAN - EPS) == (color, 6)
    # Just past the end edge is the next Color (or the next line's Color 1).
    nxt = longitude_to_color_tone(lo + COLOR_SPAN + EPS)
    assert nxt == ((color + 1, 1) if color < 6 else (1, 1))
    # Gate/line unchanged inside the band.
    assert longitude_to_gate_line(lo + COLOR_SPAN / 2) == (41, 3)


@pytest.mark.parametrize("tone", range(1, 7))
def test_every_tone_band(tone):
    base = gate_line_start_longitude(51, 5) + 2 * COLOR_SPAN  # Color 3
    assert longitude_to_color_tone(base + (tone - 0.5) * TONE_SPAN) == (3, tone)


def test_exact_end_of_line_clamps_to_six():
    import math

    from app.hd import mandala

    # The last representable longitude of a gate/line is Line 6, Color 6, Tone 6 — never 7.
    gate_end = MANDALA_START + 5.625
    last = math.nextafter(gate_end, 0.0)
    assert longitude_to_gate_line(last) == (41, 6)
    assert longitude_to_color_tone(last) == (6, 6)
    assert longitude_to_color_tone(gate_end) == (1, 1)  # next gate (19) starts at Color 1
    for k in range(1, 7):  # each line end inside the gate
        end = math.nextafter(MANDALA_START + k * LINE_SPAN, 0.0)
        assert longitude_to_color_tone(end) == (6, 6)
    # Dense sweep across boundaries: always 1–6.
    for i in range(20000):
        c, t = longitude_to_color_tone(i * 0.018 + 1e-12 * (i % 7))
        assert 1 <= c <= 6 and 1 <= t <= 6
    # Mandala start and wrap.
    assert longitude_to_color_tone(MANDALA_START) == (1, 1)
    assert longitude_to_color_tone(MANDALA_START - EPS) == (6, 6)
    assert longitude_to_color_tone(MANDALA_START + 360.0) == (1, 1)
    assert mandala.longitude_to_color_tone(-58.0) == longitude_to_color_tone(302.0)


@pytest.mark.parametrize("lon", [0.0, 12.3456, 51.570673, 179.99, 301.9999, 302.0, 359.999])
def test_180_offset_keeps_color_and_tone(lon):
    assert longitude_to_color_tone(lon) == longitude_to_color_tone(lon + 180.0)
    env = environment_from_node_longitudes(lon, (lon + 180.0) % 360.0)
    assert env["environment"] == ENVIRONMENT_BY_COLOR[env["environment_color"]]


def test_orientation_left_right():
    base = gate_line_start_longitude(41, 1)
    assert environment_from_node_longitudes(base + 3.5 * TONE_SPAN, base + 180 + 3.5 * TONE_SPAN)["environment_orientation"] == "right"
    assert environment_from_node_longitudes(base + 2.5 * TONE_SPAN, base + 180 + 2.5 * TONE_SPAN)["environment_orientation"] == "left"


def test_node_mismatch_is_a_bug():
    with pytest.raises(EnvironmentNodeMismatch):
        environment_from_node_longitudes(302.0 + 0.01, 122.0 + 0.5)


@pytest.mark.parametrize(
    "args",
    [
        (1948, 4, 9, 0, 5, 0, 45.5017, -73.5673),
        (1961, 8, 4, 19, 24, 0, 21.3069, -157.8583),
        (1990, 5, 15, 12, 0, 0, 22.3193, 114.1694),
        (2001, 1, 1, 6, 30, 0, 51.5074, -0.1278),
    ],
)
def test_calculate_chart_emits_fields_and_nodes_agree(args):
    c = calculate_chart(*args[:6], lat=args[6], lon=args[7])
    assert c["environment"] in ENVIRONMENT_BY_COLOR.values()
    assert 1 <= c["environment_color"] <= 6 and 1 <= c["environment_tone"] <= 6
    assert c["environment_orientation"] == ("left" if c["environment_tone"] <= 3 else "right")
    nn = next(a for a in c["design"] if a["planet"] == "North_Node")["longitude"]
    sn = next(a for a in c["design"] if a["planet"] == "South_Node")["longitude"]
    assert longitude_to_color_tone(nn) == longitude_to_color_tone(sn) == (c["environment_color"], c["environment_tone"])
    # activations[].color still means personality | design | transit.
    assert {a["color"] for a in c["design"]} == {"design"}
    # Read-time derivation from the stored (rounded) longitudes matches calculate time.
    stripped = {k: v for k, v in c.items() if k not in ENVIRONMENT_KEYS}
    assert environment_for_chart(stripped) == {k: c[k] for k in ENVIRONMENT_KEYS}


def test_obama_cross_check_matches_published_color_tone():
    """Barack Obama, 4 Aug 1961 19:24 HST, Honolulu (birth certificate; Astro-Databank AA).

    Published: Design North Node 59.4, colour 3, tone 3, Environment 'Left 3' (Kitchens)
    (omnicharts.app/barack-obama-human-design; gate.lines also in the humandesignsystem.com
    Obama/Biden composite). Baseline displays Color 3 as Workshops.
    """
    c = calculate_chart(1961, 8, 4, 19, 24, 0, lat=21.3069, lon=-157.8583)
    nn = next(a for a in c["design"] if a["planet"] == "North_Node")
    assert nn["label"] == "59.4"
    assert (c["environment_color"], c["environment_tone"]) == (3, 3)
    assert c["environment"] == "Workshops"  # traditional 'Kitchens'
    assert c["environment_orientation"] == "left"


def test_with_environment_read_time_enrichment():
    c = calculate_chart(1990, 5, 15, 12, 0, 0, lat=22.3193, lon=114.1694)
    legacy = {k: v for k, v in c.items() if k not in ENVIRONMENT_KEYS}
    before = copy.deepcopy(legacy)
    out = with_environment(legacy)
    assert legacy == before, "stored JSON is never mutated"
    assert {k: out[k] for k in ENVIRONMENT_KEYS} == {k: c[k] for k in ENVIRONMENT_KEYS}

    # Missing design nodes → keys omitted (page omits the box), no exception.
    no_nodes = dict(legacy, design=[a for a in legacy["design"] if "Node" not in a["planet"]])
    assert not set(ENVIRONMENT_KEYS) & set(with_environment(no_nodes))
    assert not set(ENVIRONMENT_KEYS) & set(with_environment({k: v for k, v in legacy.items() if k != "design"}))
    bad = dict(legacy, design=[dict(a, longitude=None) if "Node" in a["planet"] else a for a in legacy["design"]])
    assert not set(ENVIRONMENT_KEYS) & set(with_environment(bad))
    # A stale stored value never wins over the derived one; non-dicts pass through.
    assert with_environment(dict(legacy, environment="Kitchens"))["environment"] == c["environment"]
    assert with_environment(None) is None


# --- API: birth-time cases via the same client/user helpers as the unknown-birth-time suite ---
from tests.test_unknown_birth_time import PLACE, _clear_charts, _db, _ensure_user, _headers_for, client  # noqa: E402
from app.models import NatalChart  # noqa: E402


def _save(headers, user, **extra):
    r = client.post(
        "/chart/calculate",
        headers=headers,
        json={**PLACE, **extra, "user_id": user.id, "save": True, "label": "Me", "slot_kind": "self"},
    )
    assert r.status_code == 200, r.text
    return r.json()


def _listed(headers, user, natal_id):
    r = client.get(f"/charts/{user.id}", headers=headers)
    assert r.status_code == 200, r.text
    return next(x for x in r.json() if x["id"] == natal_id)


def test_api_unknown_time_uses_noon_and_still_returns_environment():
    user = _ensure_user(); headers = _headers_for(user); _clear_charts(user.id)
    created = _save(headers, user, time_unknown=True)
    noon = calculate_chart(1990, 5, 15, 12, 0, 0, lat=PLACE["lat"], lon=PLACE["lon"])
    assert created["chart"]["environment"] == noon["environment"]
    row = _listed(headers, user, created["natal_chart_id"])
    assert row["time_unknown"] is True and row["birth_time"] == "12:00:00"
    assert row["chart"]["environment"] == noon["environment"]
    assert row["chart"]["environment_color"] == noon["environment_color"]


def test_api_known_noon_returns_environment_without_flag():
    user = _ensure_user(); headers = _headers_for(user); _clear_charts(user.id)
    created = _save(headers, user, birth_time="12:00:00")
    row = _listed(headers, user, created["natal_chart_id"])
    assert row["time_unknown"] is False
    assert row["chart"]["environment"] in ENVIRONMENT_BY_COLOR.values()


def test_api_legacy_row_null_flag_and_no_env_keys_is_enriched_on_read():
    user = _ensure_user(); headers = _headers_for(user); _clear_charts(user.id)
    c = calculate_chart(1990, 5, 15, 9, 15, 0, lat=PLACE["lat"], lon=PLACE["lon"])
    legacy = {k: v for k, v in c.items() if k not in ENVIRONMENT_KEYS}
    db = _db()
    try:
        row = NatalChart(user_id=user.id, label="Me", slot_kind="self", role="self", birth_date="1990-05-15",
                         birth_time="09:15:00", time_unknown=None, birth_city="Hong Kong",
                         lat=PLACE["lat"], lon=PLACE["lon"], timezone=c["timezone"], chart_json=legacy)
        db.add(row); db.commit(); db.refresh(row); rid = row.id
        assert "environment" not in (db.get(NatalChart, rid).chart_json or {})
    finally:
        db.close()
    listed = _listed(headers, user, rid)
    assert listed["time_unknown"] is False  # legacy null = normal show, no mark
    assert listed["chart"]["environment"] == c["environment"]
    db = _db()
    try:
        assert "environment" not in (db.get(NatalChart, rid).chart_json or {}), "no write-back / migration"
    finally:
        db.close()


def test_api_legacy_row_without_design_nodes_omits_environment():
    user = _ensure_user(); headers = _headers_for(user); _clear_charts(user.id)
    c = calculate_chart(1990, 5, 15, 9, 15, 0, lat=PLACE["lat"], lon=PLACE["lon"])
    legacy = {k: v for k, v in c.items() if k not in ENVIRONMENT_KEYS}
    legacy["design"] = [a for a in legacy["design"] if "Node" not in a["planet"]]
    db = _db()
    try:
        row = NatalChart(user_id=user.id, label="Me", slot_kind="self", role="self", birth_date="1990-05-15",
                         birth_time="09:15:00", time_unknown=False, birth_city="Hong Kong",
                         lat=PLACE["lat"], lon=PLACE["lon"], timezone=c["timezone"], chart_json=legacy)
        db.add(row); db.commit(); db.refresh(row); rid = row.id
    finally:
        db.close()
    listed = _listed(headers, user, rid)
    assert "environment" not in listed["chart"]
    assert listed["chart"]["type"] == c["type"]
