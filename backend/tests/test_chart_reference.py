"""Reference chart validation: Ra Uru Hu (public founder chart).

Birth: 9 April 1948, 00:05 local, Montreal, Canada.
Published chart: Manifestor, Profile 5/1, Splenic Authority (NOT Emotional — SP is open).
Coordinates: 45.5017°N, 73.5673°W.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.hd.chart import calculate_chart
from app.hd.channels import CHANNEL_KEYS
from app.hd.ephemeris import find_design_jd, sun_longitude, datetime_to_jd
from datetime import datetime, timezone


# Montreal approx
LAT, LON = 45.5017, -73.5673


def test_channel_count():
    expected = {
        frozenset(p) for p in [
            (1, 8), (2, 14), (3, 60), (4, 63), (5, 15), (6, 59),
            (7, 31), (9, 52), (10, 20), (10, 34), (10, 57), (11, 56),
            (12, 22), (13, 33), (16, 48), (17, 62), (18, 58), (19, 49),
            (20, 34), (20, 57), (21, 45), (23, 43), (24, 61), (25, 51),
            (26, 44), (27, 50), (28, 38), (29, 46), (30, 41), (32, 54),
            (34, 57), (35, 36), (37, 40), (39, 55), (42, 53), (47, 64),
        ]
    }
    assert len(CHANNEL_KEYS) == 36
    assert set(CHANNEL_KEYS) == expected
    assert frozenset({34, 57}) in CHANNEL_KEYS
    print(f"PASS: {len(CHANNEL_KEYS)} unique bodygraph channels loaded (incl. 34-57 Power)")


def test_design_solar_arc_88():
    # Arbitrary UTC moment
    dt = datetime(2000, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
    pers = datetime_to_jd(dt)
    des = find_design_jd(pers, 88.0)
    arc = (sun_longitude(pers) - sun_longitude(des)) % 360.0
    assert abs(arc - 88.0) < 1e-4, f"Design arc={arc}"
    print(f"PASS: Design solar arc = {arc:.6f}° (target 88°)")


def test_ra_uru_hu_reference():
    chart = calculate_chart(
        1948, 4, 9, 0, 5, 0,
        lat=LAT, lon=LON,
    )
    print("\n=== Ra Uru Hu reference chart ===")
    print(f"  Birth UTC:   {chart['birth_utc']}")
    print(f"  Design UTC:  {chart['design_utc']}")
    print(f"  Timezone:    {chart['timezone']}")
    print(f"  Type:        {chart['type']}")
    print(f"  Profile:     {chart['profile']}")
    print(f"  Authority:   {chart['authority']}")
    print(f"  Strategy:    {chart['strategy']}")
    print(f"  Definition:  {chart['definition']}")
    print(f"  Sun Pers:    {chart['sun_personality']}")
    print(f"  Sun Design:  {chart['sun_design']}")
    print(f"  Defined:     {chart['defined_centers']}")
    print(f"  Channels:    {len(chart['channels'])}")
    print(f"  Design arc:  {chart['design_solar_arc_check']}°")

    assert abs(chart["design_solar_arc_check"] - 88.0) < 0.01
    assert chart["profile"] == "5/1", f"Expected profile 5/1, got {chart['profile']}"
    assert chart["type"] == "Manifestor", f"Expected Manifestor, got {chart['type']}"
    assert "Splenic" in chart["authority"], f"Expected Splenic authority, got {chart['authority']}"
    assert "Solar_Plexus" not in chart["defined_centers"]
    assert chart["sun_personality"] == "51.5"
    assert chart["sun_design"] == "61.1"
    print("PASS: Ra Uru Hu → Manifestor / 5/1 / Splenic (matches published chart)")


def test_einstein_smoke():
    """Smoke test: Einstein Ulm 14 Mar 1879 11:30 — should produce a valid chart."""
    chart = calculate_chart(1879, 3, 14, 11, 30, 0, lat=48.4011, lon=9.9876)
    assert chart["type"] in {
        "Generator", "Manifesting Generator", "Projector", "Manifestor", "Reflector",
    }
    assert "/" in chart["profile"]
    print(
        f"PASS: Einstein smoke → {chart['type']} {chart['profile']} "
        f"auth={chart['authority']} gates={len(chart['activated_gates'])}"
    )


if __name__ == "__main__":
    test_channel_count()
    test_design_solar_arc_88()
    test_ra_uru_hu_reference()
    test_einstein_smoke()
    print("\nAll reference chart tests passed.")
