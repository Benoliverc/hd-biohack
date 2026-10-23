# Handoff — BodyGraph path + legend fix

## Status
- Ready for Ship Gate / PO review
- Branch: `feat/bodygraph-path-legend`
- Specs: `.grok-handoff/bodygraph-path-legend.md`
- Base: `main` @ `146a2e0` (post-PR #28)

## What changed (FE-only)
1. Half-channels hug grey track via pathLength dash on existing `d` (no sticks).
2. Channel endpoints anchored to exact gate chips; Root/SP/Ego facing walls.
3. Ajna 43 ↔ Throat 23 ≥18px c2c (measured 38.21).
4. Motor centers amber/sand so Design terracotta chips pop; dual = striped pair.
5. Biohack pill legend (Conscious/Somatic/Integrated · Defined/Open).

## Dual-channel approach
Two parallel dashed 2.5px strokes on the same `d` (Obsidian + Terracotta, offset dash).

## Half-channel approach
`hangingHalfChannelDash` + SAME `channelPathD` as ghost track; `pathLength={100}` dash.

## Verify
- `cd frontend && npx tsc --noEmit` — green
- `npx tsx frontend/scripts/assert-gate-spacing.mjs` — PASS (spacing + Ajna gap)

## Out of scope
API/chart calc, Zinc, Batch B, merge/Vercel (parent pings PO).
