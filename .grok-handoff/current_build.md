# Handoff — Sticky nav: single Deep dive chip

## Branch & commit
- **Branch:** `feat/chart-sticky-deepdive-nav`
- **SHA:** c5b5b4bf4c09e2c7856449cd4d5f8209ab268b90 (short `c5b5b4b`)
- **Base:** `main` @ `2cfa3eb` (chart-nav merged)

## What changed
Sticky in-page section nav no longer lists Core / Centers / Channels / Planets as separate chips. They are combined under one **Deep dive** chip that scrolls to `#deep-dive`. Domain switching stays on the existing DeepDive tabs (Core | Centers | Channels | Planets).

- `SECTION_NAV`: People & form · Bodygraph · Snapshot · Deep dive
- Jump / hash still maps legacy `#core` `#centers` `#channels` `#planets` `#activations` → scroll `#deep-dive` + set tab domain
- Measured sticky offset (`--app-header-h`, `--chart-section-nav-h`, `--chart-scroll-mt`) unchanged

## Changed files
- `frontend/src/app/profile/page.tsx` — SECTION_NAV + jump/hydrate deep-id set
- `.grok-handoff/current_build.md` — this handoff

## Local preview
- Chart: **http://127.0.0.1:3000/profile**
- API: **http://127.0.0.1:8000**

## Test / build summary
- `npx tsc --noEmit` — pass
- `npm run lint` — pass (pre-existing `store.tsx` exhaustive-deps warning only)

## How to verify
1. Open `/profile` with a loaded chart.
2. Sticky chips should be: People · Bodygraph · Snapshot · Deep dive (no separate Core/Centers/Channels/Planets).
3. Tap **Deep dive** → scrolls to Deep dive heading; tabs still switch domains.
4. Deep-link `/profile#centers` still opens Centers tab and lands on Deep dive (title clear of stickies).

## Open / leftover
- None for this slice.
