# BodyGraph SSOT + Integration trunk + center-only tap (post-#29)

**Date:** 2026-10-23 · **Branch:** `feat/bodygraph-ssot-integration` · **Base:** `main` @ `fb00992` (PR #29)

## Must-fix — done

1. **SSOT endpoints** — `GATE_OFFSETS` / `gateAnchor` / exported `GATE_POSITIONS` are the sole chip (x,y) source. Every `channelPathD` for all 36 lattice pairs **starts and ends** at `gateAnchor(A/B)` (verified by smoke script). Bezier controls may arc; endpoints never drift. Layering unchanged: tracks → centers → chips r=6.5. pathLength halves from #29 kept on the same derived `d`.

2. **Integration trunk (chosen approach)** — Traditional HD Integration:
   - Central diagonal **spine 20 (Throat) ↔ 57 (Spleen)** as one shared quadratic.
   - Short **tributaries from 10 (G) and 34 (Sacral)** into `integrationJoinPoint()` on that spine.
   - All six lattice pairs among {10,20,34,57} paint along shared segments so Personality+Design halves meet tip-to-tip.
   - Hanging multi-gates: `preferIntegrationHangingMissing` collapses to **one** trunk-oriented half (no three tentacles). Prefer: 20↔57 along spine; 10/34 → 57 then 20.

3. **Topology audit** — Gate **61** moved from Head tip to **bottom horizontal edge** between 64 (L) and 63 (R), above Ajna 24. Ajna top 47/24/4 · bottom 17/43/11 unchanged. Root top 53/60/52 under Sacral kept. Outer arcs for Sacral↔Spleen route left of Spleen tip.

4. **Center-only tap** — `pointerEvents: "none"` on ghost/active/hanging channels and gate chips. Only 9 centers are `cursor:pointer`. Hover pill lists active gates in that center. Caption: **Tap any center to inspect its mechanics**.

## Verify
- `cd frontend && npx tsc --noEmit` — green
- `npx tsx frontend/scripts/assert-gate-spacing.mjs` — spacing ≥14.5 + Ajna 43↔23 ≥18 PASS (38.21)
- Smoke: all 36 channel endpoints == gateAnchor; Head 61 between 64/63 on bottom; Integration hang 10→57 preferred

## Smoke notes (manual chart configs)
- **Integration-dense** (10+20+34+57): spine + tributaries share join; dual 10–57 meets mid-path
- **Root/SP hanging** (19/49, 41/30, 38/28…): pathLength halves still hug grey `d`
- **Head 61/64/63**: 61 bottom-center; 24–61 vertical clean

## Out of scope
API/chart calc, Zinc, Batch B copy, merge/Vercel (parent pings PO).

## Files
- `frontend/src/lib/bodygraphGeometry.ts`
- `frontend/src/components/BodyGraph.tsx`
