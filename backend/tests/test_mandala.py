"""Mandala integrity and degree-mapping unit tests."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.hd.mandala import (
    GATE_SPAN,
    LINE_SPAN,
    MANDALA_GATE_ORDER,
    MANDALA_START,
    assert_mandala_integrity,
    gate_line_start_longitude,
    longitude_to_gate_line,
)


def test_mandala_sequence_complete():
    assert_mandala_integrity()
    assert MANDALA_GATE_ORDER[0] == 41
    assert MANDALA_GATE_ORDER[-1] == 60
    print("PASS: Mandala sequence has 64 unique gates; starts at 41 ends at 60")


def test_gate_41_line_1_at_302():
    g, l = longitude_to_gate_line(302.0)
    assert (g, l) == (41, 1)
    assert abs(gate_line_start_longitude(41, 1) - 302.0) < 1e-9
    print("PASS: 302°00'00\" tropical → Gate 41 Line 1")


def test_gate_spans_and_lines():
    # Entire Gate 41: lines 1–6
    for line in range(1, 7):
        lon = 302.0 + (line - 1) * LINE_SPAN + 0.001
        g, l = longitude_to_gate_line(lon)
        assert g == 41 and l == line, f"lon={lon} → {g}.{l}, expected 41.{line}"
    # Next gate after 41 is 19
    g, l = longitude_to_gate_line(302.0 + GATE_SPAN + 0.001)
    assert g == 19 and l == 1
    print("PASS: Gate spans 5.625° and lines 0.9375° map correctly")


def test_full_circle_coverage():
    seen = set()
    # Sample every line start
    for i in range(64 * 6):
        lon = (MANDALA_START + i * LINE_SPAN + 0.0001) % 360.0
        g, l = longitude_to_gate_line(lon)
        seen.add(g)
        assert 1 <= l <= 6
    assert seen == set(range(1, 65))
    print("PASS: Full 360° circle covers all 64 gates")


if __name__ == "__main__":
    test_mandala_sequence_complete()
    test_gate_41_line_1_at_302()
    test_gate_spans_and_lines()
    test_full_circle_coverage()
    print("\nAll Mandala tests passed.")
