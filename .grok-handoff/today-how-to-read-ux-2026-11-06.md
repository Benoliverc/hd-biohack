# Today How to read — UX handoff

**Date:** 2026-11-06 (Asia/Hong_Kong)
**PR:** https://github.com/Benoliverc/hd-biohack/pull/71
**Branch:** `feat/today-how-to-read`
**Tip:** `5314d6a` (`5314d6a738fe1484b74725927bb271e61453c2df`) · feature `ec01efd`
**Worktree:** `/workspace/hd-biohack-wt-today-how-to-read`
**Base:** `origin/main` @ `0a4b72c` (#65–#69). **Independent of** Deep Dive Strategy / Authority / Definition copy PR.
**Hold merge** for Benjamin yes. FE-only (Vercel later; no Railway).

## Spec
`handoffs/today-how-to-read-2026-11-06.md`

## What changed
1. **LiteracyCoach `today` variant** — Title "How to read Today"; collapsed chip "How to read"; storage `baseline.literacy.today.v1`; test id `today-literacy-coach` (+ `-reopen`). Chart-style compact-on-narrow (active step only, tighter max-height) so first-visit expand does not wall off the Move from the sections below.
2. **Placement** (`transits/page.tsx`) — `<LiteracyCoach variant="today" />` after `<TodayIndication />` and before the Sun / Earth card. Move-first IA from #68 unchanged (Move still first inside TodayIndication; slim header untouched).
3. **Jump ids** (same `scroll-mt` as Chart `#bodygraph`):
   - `today-new-signal` on existing `data-testid="daily-signal"` block in `TodayIndication.tsx`
   - `today-sun-earth` on Sun / Earth card
   - `today-bridged-channels` on bridged-channels card
   - `today-newly-defined` on newly-defined-centers card
   Overlay cards may be absent (sky-only); those jumps no-op as briefed.
4. **Copy** — Exact four step bodies from handoff in `TODAY_LITERACY_STEPS` (`hdCopy.ts`). Bodies keep `\n\n` paragraph breaks; LiteracyCoach now splits blank lines into `<p>`s (Chart/Soul single-paragraph bodies unchanged).
5. **Out of scope kept** — No Move/Energy/Space computation changes; no "Conditioning notes" resurrection; no STRATEGY/AUTHORITY/DEFINITION_COPY conversion; no Type essay edits; no backend/Railway.

## Files
- `frontend/src/lib/hdCopy.ts`
- `frontend/src/components/LiteracyCoach.tsx`
- `frontend/src/app/transits/page.tsx`
- `frontend/src/components/TodayIndication.tsx`
- `handoffs/today-how-to-read-2026-11-06.md`

## Preview
- None started (do not touch :3009 / :3010 / :3011)

## Tests
- `./node_modules/.bin/tsc --noEmit` — clean
- `next lint` (transits + LiteracyCoach + TodayIndication + hdCopy) — clean aside pre-existing `react-hooks/exhaustive-deps` on page.tsx:109

## Softs / non-blockers
- Coach renders even while TodayIndication is still loading (sibling placement; dismiss/reopen still work).
- When overlay is missing, Bridged / Newly defined jumps silently no-op (by design).
