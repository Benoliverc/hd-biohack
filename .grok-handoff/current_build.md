# Handoff — Sticky nav: single Deep dive chip (Medium UX fixes)

## Branch & commit
- **Branch:** `feat/chart-sticky-deepdive-nav`
- **SHA:** 00587472ee004ec9180754212c3d378d89a12a79 (short `0058747`)
- **Base:** `main` @ `2cfa3eb` (chart-nav merged)

## What changed (this tip)
Fix UX Mediums from `chart-sticky-deepdive-nav-ux-review.md` before Ship Gate:

1. **375 chip overflow** — short labels (People / Body / Snap / Deep), `flex w-full` equal chips, tighter padding, `overflow-x-clip` (no horizontal scrollbar; nav height stable ~50px).
2. **Hash scroll race** — wait for ResizeObserver-published `--app-header-h` / `--chart-section-nav-h` (stable frames + fonts) before scrolling; hash path uses `behavior: "auto"` + settle re-scroll. Legacy domain stubs (`#centers` etc.) pinned to `#deep-dive` top so `space-y-4` no longer offsets native hash scroll by 16px.

Chip set unchanged: People & form · Bodygraph · Snapshot · Deep dive (domains stay in DeepDive tabs).

## Changed files
- `frontend/src/app/profile/page.tsx` — SECTION_NAV shortLabels, overflow layout, `waitForChartScrollMt` / `scrollChartSectionIntoView`, hash hydrate
- `frontend/src/components/ChartDeepDive.tsx` — hash stub anchors at `top-0`
- `.grok-handoff/current_build.md` — this handoff

## Local preview
- Chart: **http://127.0.0.1:3000/profile**
- API: **http://127.0.0.1:8000**

## Test / build summary
- `npx tsc --noEmit` — pass
- `npm run lint` — pass (pre-existing `store.tsx` exhaustive-deps warning only)
- Headless Chrome (puppeteer-core) @ 375 & 1280:
  - overflowX **0**, no h-scroll, navHeight **50**
  - `#centers` / `#activations` deep-dive h2 clearance **+8px** under sticky stack (was **−8**)
  - Deep dive chip click clearance **+8px**

## How to verify
1. `/profile` @ 375 — sticky chips fit with no horizontal scrollbar; height ~50px.
2. `/profile#centers` and `/profile#activations` — Deep dive heading clears sticky stack (~8px gap); Centers / Planets tab selected.
3. Deep dive chip click still scrolls cleanly.

## Open / leftover
- None for these Mediums. Ready for UX re-verify / Ship Gate when tagged.
