"""36 Human Design channels and 9-center topology."""
from __future__ import annotations

# (gate_a, gate_b, name)
CHANNELS: list[tuple[int, int, str]] = [
    (1, 8, "Inspiration"),
    (2, 14, "The Beat"),
    (3, 60, "Mutation"),
    (4, 63, "Logic"),
    (5, 15, "Rhythm"),
    (6, 59, "Intimacy"),
    (7, 31, "The Alpha"),
    (9, 52, "Concentration"),
    (10, 20, "Awakening"),
    (10, 34, "Exploration"),
    (10, 57, "Perfected Form"),
    (11, 56, "Curiosity"),
    (12, 22, "Openness"),
    (13, 33, "The Prodigal"),
    (16, 48, "The Wavelength"),
    (17, 62, "Acceptance"),
    (18, 58, "Judgment"),
    (19, 49, "Synthesis"),
    (20, 34, "Charisma"),
    (20, 57, "The Brain Wave"),
    (21, 45, "The Money Line"),
    (23, 43, "Structuring"),
    (24, 61, "Awareness"),
    (25, 51, "Initiation"),
    (26, 44, "Surrender"),
    (27, 50, "Preservation"),
    (28, 38, "Struggle"),
    (29, 46, "Discovery"),
    (30, 41, "Recognition"),
    (32, 54, "Transformation"),
    (35, 36, "Transitoriness"),
    (37, 40, "Community"),
    (39, 55, "Emoting"),
    (42, 53, "Maturation"),
    (47, 64, "Abstraction"),
]

# Unique channel keys as frozensets (canonical 35 bodygraph channels;
# HD literature often says "36" — this set matches standard calculators).
_CHANNEL_SET: dict[frozenset[int], str] = {}
for a, b, name in CHANNELS:
    key = frozenset({a, b})
    _CHANNEL_SET.setdefault(key, name)

CHANNEL_KEYS: list[frozenset[int]] = list(_CHANNEL_SET.keys())
assert len(CHANNEL_KEYS) == 35, f"Expected 35 unique channels, got {len(CHANNEL_KEYS)}"

# Gate → Center membership
GATE_TO_CENTER: dict[int, str] = {}
_CENTER_GATES: dict[str, list[int]] = {
    "Head": [64, 61, 63],
    "Ajna": [47, 24, 4, 17, 43, 11],
    "Throat": [62, 23, 56, 16, 20, 31, 8, 33, 35, 12, 45, 21],
    "G": [7, 1, 13, 10, 15, 2, 46, 25],
    "Heart": [21, 40, 26, 51],
    "Solar_Plexus": [36, 22, 37, 6, 49, 55, 30],
    "Sacral": [5, 14, 29, 59, 9, 3, 42, 27, 34],
    "Spleen": [48, 57, 44, 50, 32, 28, 18],
    "Root": [58, 38, 54, 53, 60, 52, 19, 39, 41],
}
for center, gates in _CENTER_GATES.items():
    for g in gates:
        GATE_TO_CENTER[g] = center

CENTERS = list(_CENTER_GATES.keys())
MOTORS = {"Root", "Sacral", "Solar_Plexus", "Heart"}


def active_channels(activated_gates: set[int]) -> list[dict]:
    """Return channels where both gates are present."""
    out = []
    for key, name in _CHANNEL_SET.items():
        if key.issubset(activated_gates):
            a, b = sorted(key)
            centers = sorted({GATE_TO_CENTER[a], GATE_TO_CENTER[b]})
            out.append({"gates": [a, b], "name": name, "centers": centers})
    return out


def defined_centers(channels: list[dict]) -> set[str]:
    defined: set[str] = set()
    for ch in channels:
        defined.update(ch["centers"])
    return defined


def hanging_gates(activated_gates: set[int]) -> list[dict]:
    """Gates that form half of a channel (potential for transit bridging)."""
    hanging = []
    for key, name in _CHANNEL_SET.items():
        a, b = tuple(key)
        if a in activated_gates and b not in activated_gates:
            hanging.append({"held": a, "missing": b, "channel": name})
        elif b in activated_gates and a not in activated_gates:
            hanging.append({"held": b, "missing": a, "channel": name})
    return hanging
