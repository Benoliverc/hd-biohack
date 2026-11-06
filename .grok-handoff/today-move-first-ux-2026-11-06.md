# Today Move-first — UX handoff

**Date:** 2026-11-06 (Asia/Hong_Kong)
**PR:** (fill after open)
**Branch:** `feat/today-move-first`
**Worktree:** `/workspace/hd-biohack-wt-today-move-first`
**Base:** `origin/main` @ `5ff5758` (#65+#66). **Independent of PR #67** (Hero Graph Lockup, tip `a5091a6`).
**Hold merge** for Benjamin yes. FE-only (Vercel later; no Railway).

## Spec
`handoffs/today-tab-move-first-2026-11-06.md`

## What changed
1. **Slim header** (`transits/page.tsx`): You chip + one `formatResetsInHkt()` line + Share. Removed `page.today.friendsStay` and Overlaying/`formatNatalOverlayLabel` (no birth city/date/#id). Modest receded H1. Save-chart prompt kept.
2. **Move first** (`TodayIndication.tsx`): `main-action` before daily signal + vs-yesterday. Dropped `indication-eyebrow`. Move contents unchanged (I-did-it, kit, When, Why, Energy+Space aside, CTAs).
3. **Sky under Move**: Today's new signal primary; Vs yesterday folded into `<details>` default **closed**, summary reuses `today.vsYesterday` (no new i18n key). Same pills/`vs-${field}` when expanded.
4. **Dedup Energy/Space**: Removed `still-conditioning` / `energy-chips` / `space-chips`. Kept unique `conditioning_caption` as quiet line under sky.
5. **Disclaimer** → quiet footer of indication card (`text-[11px] text-fg-muted`).
6. **HD fact** kept below Move + sky.
7. **Removed** page-level `conditioning-notes` card (restated bridges/centers already in reference section). Kept Sun/Earth, Bridged channels, Newly defined centers, planetary gates table.

## Files
- `frontend/src/app/transits/page.tsx`
- `frontend/src/components/TodayIndication.tsx`

## Preview
- FE: http://127.0.0.1:3010 (not #67's :3009)
- API: http://127.0.0.1:8000 (existing)
- Smoke PNGs: `/workspace/hd-biohack-ui-failures/2026-11-06/today-move-first/`

## Tests
- `npx tsc --noEmit` — clean
- `npx next lint` (transits + components) — clean aside pre-existing `react-hooks/exhaustive-deps` on page.tsx:108
- Phone smoke 390×844 (Benjamin session): Move fully visible without scroll; vs default closed; expand shows same pills; no friendsStay/Overlaying/eyebrow/still-conditioning/conditioning-notes; kit placeholder + Why + I-did-it present

## Decisions
- **vs-yesterday label:** reused `today.vsYesterday` as `<summary>` (reads cleanly; no new EN/NL/DE/FR/ES keys).
- **conditioning-notes:** removed entirely (bridges/centers live in reference cards; noSpike/skyOnly empty-state lines dropped — open question if UX wants a quiet empty line later).
- **conditioning_caption:** kept under sky when non-empty (no chip picker rebuild).
- **aside aria-label:** now `Energy · Space` instead of `stillConditioning`.

## Open questions
- Whether a soft empty-state line (former noSpike/skyOnly) should return under sky when there is no daily signal — currently omitted.
- #67 remains a separate open PR held for Benjamin yes; do not merge this before his yes either.

## Softs / non-blockers
- On narrow viewports Energy/Space aside wraps under Move body (pre-existing flex behavior).
