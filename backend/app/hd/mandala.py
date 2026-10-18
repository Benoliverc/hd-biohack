"""64-Gate Human Design Mandala wheel (exact tropical degree mapping).

Gate 41 Line 1 begins at 302°00'00" Tropical Zodiac (2°00'00" Aquarius).
Each Gate spans 5.625°; each Line spans 0.9375°.
"""
from __future__ import annotations

from dataclasses import dataclass

# Exact sequence starting at 302° tropical = Gate 41
MANDALA_GATE_ORDER: list[int] = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
    27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
]

GATE_SPAN = 5.625
LINE_SPAN = 0.9375
MANDALA_START = 302.0  # degrees tropical


@dataclass(frozen=True)
class GateLine:
    gate: int
    line: int
    longitude: float
    color: str  # "personality" | "design" | "transit"

    @property
    def label(self) -> str:
        return f"{self.gate}.{self.line}"


def normalize_longitude(lon: float) -> float:
    return lon % 360.0


def longitude_to_gate_line(longitude: float) -> tuple[int, int]:
    """Map tropical ecliptic longitude → (gate, line). Line is 1–6."""
    lon = normalize_longitude(longitude)
    offset = (lon - MANDALA_START) % 360.0
    gate_index = int(offset / GATE_SPAN) % 64
    within_gate = offset % GATE_SPAN
    line = int(within_gate / LINE_SPAN) + 1
    if line > 6:
        line = 6
    return MANDALA_GATE_ORDER[gate_index], line


def gate_line_start_longitude(gate: int, line: int = 1) -> float:
    """Return the tropical longitude where a given gate/line begins."""
    if gate not in MANDALA_GATE_ORDER:
        raise ValueError(f"Invalid gate: {gate}")
    if not 1 <= line <= 6:
        raise ValueError(f"Invalid line: {line}")
    idx = MANDALA_GATE_ORDER.index(gate)
    return normalize_longitude(MANDALA_START + idx * GATE_SPAN + (line - 1) * LINE_SPAN)


def assert_mandala_integrity() -> None:
    assert len(MANDALA_GATE_ORDER) == 64
    assert len(set(MANDALA_GATE_ORDER)) == 64
    assert set(MANDALA_GATE_ORDER) == set(range(1, 65))
    # Gate 41 Line 1 at exactly 302°
    g, l = longitude_to_gate_line(302.0)
    assert (g, l) == (41, 1), f"Expected 41.1 at 302°, got {g}.{l}"
    # Just before wrap: last fraction of Gate 60
    g2, l2 = longitude_to_gate_line(301.999)
    assert g2 == 60
    # Mid Gate 41 Line 3
    g3, l3 = longitude_to_gate_line(302.0 + 2 * LINE_SPAN + 0.01)
    assert (g3, l3) == (41, 3)
