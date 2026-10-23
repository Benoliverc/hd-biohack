# BodyGraph upgrade — perimeter snap, half-channels, zero label clutter

**Date:** 2026-10-23 · **Source:** Benjamin (PO) · **Status:** briefed @dev

## Must-fix
1. Remove center text labels from default SVG; center click/hover → pill/tooltip; optional `showLabels`.
2. Hide inactive (ghost) gate numbers by default.
3. Scale centers ~20–25%; reposition all 64 GATE_OFFSETS on inner perimeter aligned to channels; min 15px between adjacent gates.
4. Chip r=6.5, font 7.5/700, cream stroke 1.5px; dual activation = split or black+terracotta ring.
5. Channels gateA→gateB behind centers; hanging gates light half-channel to midpoint.
6. Collision assert hypot >= 14.5 for all gate pairs.

## Files
- `frontend/src/lib/bodygraphGeometry.ts`
- `frontend/src/components/BodyGraph.tsx` (or current)

## Related
- `.grok-handoff/bodygraph-overlap-fix.md` (diagnosis; shrink-only superseded)
