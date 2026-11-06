# Current build — Today How to read literacy coach

**Status:** PR #71 open · Hold merge for Benjamin yes · FE-only Vercel later (no Railway).
**Date:** 2026-11-06 (Asia/Hong_Kong)
**PR:** https://github.com/Benoliverc/hd-biohack/pull/71

## Branch / tip
- **Branch:** `feat/today-how-to-read`
- **Tip / feature:** `ec01efd` (`ec01efd0e95b62dec6b104981327090828254436`)
- **Worktree:** `/workspace/hd-biohack-wt-today-how-to-read`
- **Base:** `origin/main` @ `0a4b72c388f5a752c5dcdb9cefa6fc4545f8a92c` (includes shipped #65–#69)
- **Independent of** in-flight Deep Dive Strategy / Authority / Definition copy PR (`feat/deep-dive-strategy-authority-definition-copy-3x` / `/workspace/hd-biohack-wt-sad-copy-3x`). Separate worktree; no SAD product changes.

## Scope
Reuse `LiteracyCoach` with a new `today` variant on the Today tab (after Move / TodayIndication, before Sun / Earth). Four jump targets for Today's new signal, Sun / Earth, Bridged channels, Newly defined centers. Exact handoff copy in `TODAY_LITERACY_STEPS`.

## Files
- `frontend/src/lib/hdCopy.ts` — `LITERACY_STORAGE_KEYS.today` + `TODAY_LITERACY_STEPS` only (STRATEGY / AUTHORITY / DEFINITION / TYPE untouched)
- `frontend/src/components/LiteracyCoach.tsx` — `today` variant + Chart-style compact-on-narrow; body splits on blank lines into `<p>`s
- `frontend/src/app/transits/page.tsx` — coach placement + jump ids on Sun/Earth, bridged, newly-defined
- `frontend/src/components/TodayIndication.tsx` — `id="today-new-signal"` + scroll-mt on existing daily-signal block
- `handoffs/today-how-to-read-2026-11-06.md` — SoT
- `.grok-handoff/today-how-to-read-ux-2026-11-06.md`

## Preview
- None (left :3009/#67, :3010/#68, :3011/#69 alone)

## Tests
- `npx tsc --noEmit` — clean
- `next lint` on touched files — see UX note

## Deploy
- Hold merge for Benjamin yes after UX → Ship Gate. FE-only Vercel after yes. No Railway. No standing auto-ship.
