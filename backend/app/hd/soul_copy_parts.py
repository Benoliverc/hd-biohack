"""Additive CopyPart helpers for Soul readings. English bodies stay the source."""
from __future__ import annotations

from typing import Any


def part(key: str, **params: Any) -> dict[str, Any]:
    clean: dict[str, Any] = {}
    for name, value in params.items():
        if value is None or value == "":
            continue
        if isinstance(value, (str, int, float)):
            clean[name] = value
        elif isinstance(value, (list, tuple)):
            clean[name] = ",".join(str(item) for item in value if item is not None and item != "")
        else:
            clean[name] = str(value)
    return {"key": key, "params": clean}


def type_slug(raw: str | None) -> str:
    return (raw or "").strip().lower().replace(" ", "_")


def type_pair_slug(type_a: str | None, type_b: str | None) -> str:
    """Stable slug for a sorted official Type pair, matching type_pair_key order."""
    a = (type_a or "").strip()
    b = (type_b or "").strip()
    parts = [p for p in sorted([a, b], key=lambda s: s.lower()) if p]
    return "_".join(type_slug(p) for p in parts)


def type_pair_slug_from_key(key: str | None) -> str:
    if not key:
        return ""
    return "_".join(type_slug(p) for p in key.split("|"))


def center_slug(center: str | None) -> str:
    return (center or "").strip().lower()


def auth_slug(raw: str | None) -> str:
    return (raw or "").strip().lower().replace(" ", "_").replace("-", "_")


def auth_pair_slug(key: str | None) -> str:
    if not key:
        return ""
    return "_".join(auth_slug(p) for p in key.split("|"))


def channel_id(gates: list[int] | tuple[int, ...] | None, fallback: str = "") -> str:
    if not gates:
        return fallback
    return "-".join(str(g) for g in sorted(int(g) for g in gates))


def with_field_parts(data: dict[str, Any], mapping: dict[str, Any]) -> dict[str, Any]:
    """Attach `{field}_part` for each mapping entry: key or (key, params_dict)."""
    out = dict(data)
    for field, spec in mapping.items():
        if field not in out or out[field] is None:
            continue
        if isinstance(spec, tuple):
            key, params = spec
            out[f"{field}_part"] = part(key, **(params or {}))
        else:
            out[f"{field}_part"] = part(spec)
    return out
