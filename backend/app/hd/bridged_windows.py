"""Annotate today's bridged-channel rows with since/through novelty-bucket windows."""
from __future__ import annotations

from datetime import date, timedelta
from typing import Any, Callable

BRIDGE_WINDOW_CAP = 900

CalcTransit = Callable[[Any], dict[str, Any]]
CalcOverlay = Callable[[dict[str, Any], dict[str, Any]], dict[str, Any]]


def channel_gate_key(gates: Any) -> frozenset[int]:
    if not gates:
        return frozenset()
    out: list[int] = []
    for g in gates:
        try:
            out.append(int(g))
        except (TypeError, ValueError):
            continue
    return frozenset(out)


def overlay_channel_keys(overlay: dict[str, Any] | None) -> set[frozenset[int]]:
    keys: set[frozenset[int]] = set()
    for row in (overlay or {}).get("bridged_channels") or []:
        if not isinstance(row, dict):
            continue
        key = channel_gate_key(row.get("gates"))
        if key:
            keys.add(key)
    return keys


def annotate_bridged_channel_windows(
    natal: dict[str, Any],
    overlay: dict[str, Any],
    day: date,
    tz_name: str | None = None,
    *,
    calc_transit: CalcTransit | None = None,
    calc_overlay: CalcOverlay | None = None,
    cap: int = BRIDGE_WINDOW_CAP,
) -> dict[str, Any]:
    """Walk 07:00 account-TZ buckets backward and forward for each current bridge.

    ``window_start`` / ``window_end`` are ISO calendar dates in that timezone, or
    ``None`` when the walk hits ``cap`` without the channel disappearing.
    A retrograde dip that never actually clears at a 07:00 bucket stays one window.
    Mutates and returns ``overlay``. Also sets ``overlay["novelty_day"]``.
    """
    from ..checkin.novelty import hkt_bucket_instant
    from .chart import calculate_transits, overlay_transits

    calc_transit = calc_transit or calculate_transits
    calc_overlay = calc_overlay or overlay_transits
    try:
        cap_n = int(cap)
    except (TypeError, ValueError):
        cap_n = BRIDGE_WINDOW_CAP
    cap_n = max(cap_n, 0)

    overlay["novelty_day"] = day.isoformat()
    rows = overlay.get("bridged_channels") or []
    if not rows:
        return overlay

    row_keys = [channel_gate_key(r.get("gates") if isinstance(r, dict) else None) for r in rows]
    unique = {k for k in row_keys if k}
    if not unique:
        for row in rows:
            if isinstance(row, dict):
                row["window_start"] = None
                row["window_end"] = None
        return overlay

    present_cache: dict[date, set[frozenset[int]]] = {day: unique}

    def present_on(bucket_day: date) -> set[frozenset[int]]:
        cached = present_cache.get(bucket_day)
        if cached is not None:
            return cached
        transit = calc_transit(hkt_bucket_instant(bucket_day, tz_name))
        keys = overlay_channel_keys(calc_overlay(natal, transit))
        present_cache[bucket_day] = keys
        return keys

    tentative_start: dict[frozenset[int], date] = {k: day for k in unique}
    tentative_end: dict[frozenset[int], date] = {k: day for k in unique}
    starts: dict[frozenset[int], date | None] = {}
    ends: dict[frozenset[int], date | None] = {}
    unresolved_start = set(unique)
    unresolved_end = set(unique)

    for i in range(1, cap_n + 1):
        if not unresolved_start:
            break
        bucket_day = day - timedelta(days=i)
        present = present_on(bucket_day)
        still: set[frozenset[int]] = set()
        for key in unresolved_start:
            if key in present:
                tentative_start[key] = bucket_day
                still.add(key)
            else:
                starts[key] = tentative_start[key]
        unresolved_start = still
    for key in unresolved_start:
        starts[key] = None

    for i in range(1, cap_n + 1):
        if not unresolved_end:
            break
        bucket_day = day + timedelta(days=i)
        present = present_on(bucket_day)
        still = set()
        for key in unresolved_end:
            if key in present:
                tentative_end[key] = bucket_day
                still.add(key)
            else:
                ends[key] = tentative_end[key]
        unresolved_end = still
    for key in unresolved_end:
        ends[key] = None

    for row, key in zip(rows, row_keys):
        if not isinstance(row, dict):
            continue
        start = starts.get(key)
        end = ends.get(key)
        row["window_start"] = start.isoformat() if start is not None else None
        row["window_end"] = end.isoformat() if end is not None else None
    return overlay
