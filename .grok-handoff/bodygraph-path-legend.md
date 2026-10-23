# BodyGraph path + legend fix (post-#28)

**Date:** 2026-10-23 · **Branch:** `feat/bodygraph-path-legend` · **Base:** `main` @ `146a2e0` (PR #28)

## Must-fix (5) — done
1. **Half-channels via pathLength** — no invented sticks. Inactive track `#D8D3C8` w=5; hanging overlays SAME `d` with `pathLength={100}`, `strokeDasharray="48 100"`, offset `0` (held=start) or `-52` (held=end). Helpers: `latticeGatePair`, `hangingHalfChannelDash`.
2. **Channel ends = chip (x,y)** — removed `t=0.72` inset. Root/SP/Ego/Spleen facing walls retuned (Root left 58/38/54 → Spleen; right 41/39/19 → SP; top 53/60/52 → Sacral).
3. **Ajna 43 ↔ Throat 23** — Head+Ajna +8px up; 43 inset / 23 down → **38.21px** c2c (`assertAjnaThroatGap` ≥18).
4. **Terracotta clash** — Open `#F5F2EB`/`#CFC9BC`; defined non-motors Deep Sage `#3F624D`; defined motors amber `#D9B89C` + `#8C583A` border. Chips/channels Obsidian `#1A1A1A` / Terracotta `#C45B38`. Dual channels = two dashed 2.5px strokes (obsidian + terracotta).
5. **Biohack pill legend** — Conscious / Somatic / Integrated + Defined / Open; caption “Tap any center or gate…”. Zero basalt/terracotta/chalk user copy.

## Verify
- `cd frontend && npx tsc --noEmit` — green
- `npx tsx scripts/assert-gate-spacing.mjs` — spacing ≥14.5 + Ajna gap ≥18 PASS

## Out of scope
API, Zinc, Batch B copy, header nav, merge/deploy (parent/PO).

## Files
- `frontend/src/lib/bodygraphGeometry.ts`
- `frontend/src/components/BodyGraph.tsx`
- `frontend/scripts/assert-gate-spacing.mjs`
