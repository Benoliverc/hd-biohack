# Handoff — Chart page navigation (High UX fixes)

## Branch & commit
- **Branch:** `feat/chart-page-nav`
- **SHA:** `7391c8b3586ee51db5a19cc17bcf136e22a8c562` (short `7391c8b`)
- **Base:** prior `c4c1c15` on same branch

## What changed (this pass)
Fixes for UI/UX review High blockers (+ Med items) on `/profile`:

### High
1. **Sticky section nav under header** — `Header` publishes measured `--app-header-h`; section nav uses `top: var(--app-header-h)` (no hardcoded 5.75/6.25rem). Section nav publishes `--chart-section-nav-h`.
2. **Deep-link scroll offset** — `--chart-scroll-mt: calc(var(--app-header-h) + var(--chart-section-nav-h) + 0.5rem)` applied via globals to `#people-form`, `#bodygraph`, `#snapshot`, `#deep-dive`, `#core`, `#centers`, `#channels`, `#planets`, `#activations`.
3. **Centers bodygraph slots** — fixed CSS grid: spine Head→Ajna→Throat→G→Sacral→Root; Heart right of G; Spleen left / Solar Plexus right of Sacral. Defined/Open filter **hides in place** (`opacity-0` + placeholder) — no reflow.

### Medium (same PR)
4. Mobile chip nav: `overflow-x-auto` + `flex-nowrap` + shorter mobile labels (People / Channels).
5. Naming: sticky chip **Planets** (was Activations); added **Core**; tab hash `#planets` ( `#activations` still aliases).
6. People list: rows show **city · date** (+ friend tag). **Root cause of duplicate Me rows:** every Calculate & Save INSERTed a new chart. Fix: pass `natal_chart_id` when updating a selected saved chart; backend updates in place; cap only blocks *new* inserts. Existing over-cap rows (e.g. Dev Pro 13/10) remain until the user deletes them — no auto-wipe.

## Changed files
- `frontend/src/app/globals.css` — sticky/scroll CSS vars + section scroll-margin
- `frontend/src/components/Header.tsx` — ResizeObserver → `--app-header-h`
- `frontend/src/app/profile/page.tsx` — section nav top/measure, labels, people rows, upsert client
- `frontend/src/components/ChartDeepDive.tsx` — bodygraph CentersMatrix; planets hash
- `frontend/src/lib/api.ts` — `natal_chart_id` on calculateChart
- `backend/app/schemas.py` — `BirthDataIn.natal_chart_id`
- `backend/app/api/routes.py` — update-in-place when `natal_chart_id` set

## Local preview
- Chart: **http://127.0.0.1:3000/profile**
- API: **http://127.0.0.1:8000**

## Test / build summary
- `npx tsc --noEmit` — pass
- `npm run lint` — pass (pre-existing `store.tsx` exhaustive-deps warning only)
- `npx next build` — pass; `/profile` ~15.4 kB
- API smoke: upsert with `natal_chart_id` returns same id; chart count unchanged

## Verify for UI/UX
1. Sticky section chips sit **fully below** primary header (no tuck under Baseline / Home row).
2. `/profile#planets` or `#activations` — “Deep dive” title not clipped under subnav.
3. Centers tab: Head top-center, Root bottom-center; Defined/Open keeps slot positions.
4. Sticky chips: Planets (not Activations); Core present; mobile short labels scroll horizontally.
5. Edit/switch person: city · date on each row; recalculate selected person does not add a new Me.

## Open / leftover
- Existing DB rows over the 10-cap (Dev Pro) are historical; user must delete to get under cap.
- Low items from prior review (current-section chip state, North_Node display, Snapshot vs Core duplication) not in this pass.
- Definition still chip-row only (brainstorm #8 out of scope).

## Routing
- Ready for **@ui-ux** re-review of High #1–3.
- After sign-off → **@qa** Ship Gate.
