# Handoff — Chart page navigation (Ship Gate hydrate/upsert fix)

## Branch & commit
- **Branch:** `feat/chart-page-nav`
- **SHA:** 4c2f40b36e0e079fae5462016f66760b5469853c (short `4c2f40b`)
- **Base:** `3cb7487` on same branch

## What changed (this pass)
Ship Gate FAIL fixes for people-list hydrate + UI upsert on `/profile`:

### Root causes
1. **Stale empty hydrate** — Profile hydrated once and could lock in DEMO / `0/10 None yet` if `/charts` was empty at first paint (or raced ahead of store natal bind). Later charts (or store bind) did not re-populate the people list because `hydratedUserId` blocked re-fetch. Opening Edit/switch kept the stale empty state.
2. **Upsert never armed** — Client only sent `natal_chart_id` when `viewMode === "saved" && natalChartId`. Empty/DEMO hydrate left `viewMode` null, so Calculate & Save always INSERTed (e.g. Montreal #36 beside existing HK #35).

### Fixes
1. Wait for `natalBindingLoading === false` before hydrating the form/people list (avoid DEMO lock-in while store `/charts` is in flight).
2. Local `editingChartId` drives upsert + selection UI (independent of store clear races).
3. Resync once when store has `natalChartId` missing from `savedPeople`.
4. Re-fetch people when opening **Edit / switch person**.
5. Button label **Update chart** when a saved person is selected; save sends `natal_chart_id: editingChartId`.

## Changed files
- `frontend/src/app/profile/page.tsx` — hydrate gate, editingChartId upsert, open-editor refresh, Update label
- `.grok-handoff/current_build.md` — this handoff
- `.grok-handoff/ship-gate-chart-nav.md` — prior FAIL report (reference)

## Local preview
- Chart: **http://127.0.0.1:3000/profile**
- API: **http://127.0.0.1:8000**

## Test / build summary
- `npx tsc --noEmit` — pass
- `npm run lint` — pass (pre-existing `store.tsx` exhaustive-deps warning only)
- backend `pytest` — **8 passed**
- API: delete stray Montreal #36; upsert `#35` → same id, count **1**; proxy `GET /api/backend/charts/3` returns [#35]
- Browser smoke (Playwright/Chrome): login Benjamin → `/profile` → Edit/switch shows **1/10** + Hong Kong · 1990-06-15 + **Update chart** + Saved chart #35 → click Update → still single id **35**

## Verify hydrate + upsert (re-gate)
1. Ensure `GET /charts/3` has ≥1 row (Benjamin).
2. Hard refresh `/profile` after login — Edit/switch must show people (not 0/10 + DEMO) on first open.
3. Select saved person → **Update chart** → same `natal_chart_id`, chart count unchanged.

## Open / leftover
- Med chip overflow-x / sticky ghosting — non-blocking (prior UX).
- Dead trycloudflare — non-blocking for local preview.
- Historical over-cap DB rows still need manual delete if present.

## Routing
- Ready for **@qa** Ship Gate re-gate (scoped chart-nav hydrate + upsert).
- No need for UI/UX re-review unless QA finds visual regressions.
