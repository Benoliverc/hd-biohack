"""Human Design Environment (Variables): the Color of the Design Nodes.

Environment = Color 1–6 of the Design North Node (Design South Node is 180° away and must
share Color and Tone). Baseline display names, English in every locale:

    1 Caves · 2 Markets · 3 Workshops · 4 Mountains · 5 Valleys · 6 Shores

Color 3 is the traditional HD Environment 'Kitchens'. Baseline's chosen display name is
'Workshops'; the traditional name is deliberately not used anywhere user-facing.

These fields are new and unrelated to ``activations[].color`` (personality | design | transit).
"""
from __future__ import annotations

from typing import Any, Mapping

from .mandala import longitude_to_color_tone

ENVIRONMENT_BY_COLOR: dict[int, str] = {
    1: "Caves",
    2: "Markets",
    3: "Workshops",  # traditional HD 'Kitchens'
    4: "Mountains",
    5: "Valleys",
    6: "Shores",
}

ENVIRONMENT_KEYS = (
    "environment",
    "environment_color",
    "environment_tone",
    "environment_orientation",
)


class EnvironmentNodeMismatch(ValueError):
    """Design North and South Node disagree on Color/Tone — a calculator bug, not a chart."""


def environment_from_node_longitudes(north: float, south: float) -> dict[str, Any]:
    """Environment fields from Design North/South Node longitudes (tropical degrees)."""
    nn = longitude_to_color_tone(north)
    sn = longitude_to_color_tone(south)
    if nn != sn:
        raise EnvironmentNodeMismatch(f"Design nodes disagree: NN color/tone {nn} vs SN {sn}")
    color, tone = nn
    return {
        "environment": ENVIRONMENT_BY_COLOR[color],
        "environment_color": color,
        "environment_tone": tone,
        "environment_orientation": "left" if tone <= 3 else "right",
    }


def _design_node_longitudes(chart: Mapping[str, Any]) -> tuple[float, float] | None:
    design = chart.get("design")
    if not isinstance(design, list):
        return None
    found: dict[str, float] = {}
    for row in design:
        if not isinstance(row, Mapping):
            continue
        planet = row.get("planet")
        lon = row.get("longitude")
        if planet in ("North_Node", "South_Node") and isinstance(lon, (int, float)) and not isinstance(lon, bool):
            found[planet] = float(lon)
    if "North_Node" not in found or "South_Node" not in found:
        return None
    return found["North_Node"], found["South_Node"]


def environment_for_chart(chart: Mapping[str, Any] | None) -> dict[str, Any] | None:
    """Read-time derivation from stored design-node longitudes; None when they are missing/bad."""
    if not isinstance(chart, Mapping):
        return None
    nodes = _design_node_longitudes(chart)
    if nodes is None:
        return None
    try:
        return environment_from_node_longitudes(*nodes)
    except EnvironmentNodeMismatch:
        return None


def with_environment(chart: Any) -> Any:
    """Return a shallow copy of a saved chart_json enriched with Environment fields.

    No migration: older rows get the fields derived on read. When the design-node longitudes
    are missing, the Environment keys are left out so the page simply omits the box.
    Never mutates the stored JSON.
    """
    if not isinstance(chart, Mapping):
        return chart
    out = {k: v for k, v in chart.items() if k not in ENVIRONMENT_KEYS}
    env = environment_for_chart(chart)
    if env:
        out.update(env)
    return out
