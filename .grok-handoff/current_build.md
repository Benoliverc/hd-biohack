# Handoff — BodyGraph perimeter upgrade

## Status
- Ready for Ship Gate / PO review
- Branch: `feat/bodygraph-perimeter`
- Specs: `.grok-handoff/bodygraph-perimeter-upgrade.md` (Benjamin architecture; supersedes shrink-only in `bodygraph-overlap-fix.md`)
- Base: `main` @ `d0fbca9` (PR #27)

## What changed (FE-only)
1. **Zero label clutter** — Center names off by default; hover/focus floating pill (Defined/Open · name). Optional `showLabels` dims chips to ~0.15 and paints names.
2. **No ghost inactive numbers** — removed hanging-missing naked text; hanging list below unchanged.
3. **Perimeter GATE_OFFSETS** — all 64 on inner perimeter; Throat Benjamin edges (top 62/23/56, right 35/12/45, bottom 8/31, 33 near bottom-left, left 16/20). Crowded centers scaled beyond ~25% so chips clear spacing (Throat s=52, Sacral/Root ~46–48).
4. **Chip style** — r=6.5, font 7.5/700, cream stroke `#FAF8F5` 1.5px. **Dual activation = basalt core + 2px terracotta ring** (never stacked circles).
5. **Channels + hanging half-channels** — full channels behind centers; hanging paints half-path held → midpoint (personality basalt / design terracotta).
6. **Collision guard** — `assertGateSpacing()` + `frontend/scripts/assert-gate-spacing.mjs` (`npm run assert:gate-spacing`); all pairs ≥ 14.5px.

## Dual-activation approach
**Basalt core + 2px terracotta ring** (not half-split / not stacked circles).

## Verify
- `cd frontend && npx tsc --noEmit` — green
- `npx tsx frontend/scripts/assert-gate-spacing.mjs` — PASS
- Grep: no default center labels; no `missingNaked`

## Out of scope
API/chart calc, Zinc ranking, Batch B copy, header nav.

## Files
- `frontend/src/lib/bodygraphGeometry.ts`
- `frontend/src/components/BodyGraph.tsx`
- `frontend/scripts/assert-gate-spacing.mjs` (new)
- `frontend/package.json` (script)
- `.grok-handoff/bodygraph-perimeter-upgrade.md`
- `.grok-handoff/bodygraph-overlap-fix.md` (diagnosis context)

## Smoke for PO
| Case | Expect |
| user’s chart | no stacked Throat/Spleen/G/Root chips |
| labels | no center-name under chips by default; hover pill |
| hanging | half-channels visible |
| dual gates | basalt + terracotta ring |
| showLabels | names on, chips dim |
