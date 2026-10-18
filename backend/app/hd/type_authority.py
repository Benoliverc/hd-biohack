"""Derive Type, Strategy, Authority, Definition, Profile from chart structure."""
from __future__ import annotations

from .channels import MOTORS


def _centers_connected(defined: set[str], channels: list[dict]) -> list[set[str]]:
    """Connected components of defined centers via active channels."""
    if not defined:
        return []
    adj: dict[str, set[str]] = {c: set() for c in defined}
    for ch in channels:
        c0, c1 = ch["centers"][0], ch["centers"][1]
        if c0 in defined and c1 in defined and c0 != c1:
            adj[c0].add(c1)
            adj[c1].add(c0)
    seen: set[str] = set()
    components: list[set[str]] = []
    for c in defined:
        if c in seen:
            continue
        stack = [c]
        comp: set[str] = set()
        while stack:
            n = stack.pop()
            if n in seen:
                continue
            seen.add(n)
            comp.add(n)
            stack.extend(adj[n] - seen)
        components.append(comp)
    return components


def motor_to_throat(defined: set[str], channels: list[dict]) -> bool:
    """True if a motor center is connected (directly or via chain) to Throat."""
    if "Throat" not in defined:
        return False
    components = _centers_connected(defined, channels)
    for comp in components:
        if "Throat" in comp and (comp & MOTORS):
            return True
    return False


def derive_type(defined: set[str], channels: list[dict]) -> str:
    if not defined:
        return "Reflector"
    sacral = "Sacral" in defined
    m2t = motor_to_throat(defined, channels)
    if sacral and m2t:
        return "Manifesting Generator"
    if sacral:
        return "Generator"
    if m2t:
        return "Manifestor"
    return "Projector"


def derive_strategy(hd_type: str) -> str:
    return {
        "Generator": "To Respond",
        "Manifesting Generator": "To Respond (then inform)",
        "Manifestor": "To Inform",
        "Projector": "Wait for the Invitation",
        "Reflector": "Wait a Lunar Cycle",
    }[hd_type]


def derive_authority(defined: set[str], channels: list[dict], hd_type: str) -> str:
    if "Solar_Plexus" in defined:
        return "Emotional (Solar Plexus)"
    if "Sacral" in defined:
        return "Sacral"
    if "Spleen" in defined:
        return "Splenic"
    if "Heart" in defined:
        return "Ego / Heart"
    # Self-Projected: G connected to Throat
    if "G" in defined and "Throat" in defined:
        for comp in _centers_connected(defined, channels):
            if "G" in comp and "Throat" in comp:
                return "Self-Projected"
    if hd_type == "Reflector":
        return "Lunar"
    return "Mental / Environmental (Outer Authority)"


def derive_definition(defined: set[str], channels: list[dict]) -> str:
    comps = _centers_connected(defined, channels)
    n = len(comps)
    if n == 0:
        return "None (Reflector)"
    if n == 1:
        return "Single"
    if n == 2:
        return "Split"
    if n == 3:
        return "Triple Split"
    return "Quadruple Split"


def derive_profile(personality_sun_line: int, design_sun_line: int) -> str:
    return f"{personality_sun_line}/{design_sun_line}"
