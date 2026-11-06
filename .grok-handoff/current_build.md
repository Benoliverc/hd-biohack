# Current build — Today Move-first

**Status:** PR opening — **Hold merge** for Benjamin yes · FE-only (Vercel later; no Railway).
**Date:** 2026-11-06 (Asia/Hong_Kong)

## Branch / tip
- **Branch:** `feat/today-move-first`
- **Worktree:** `/workspace/hd-biohack-wt-today-move-first`
- **Base:** `origin/main` @ `5ff5758` (includes #65+#66)
- **Independent of PR #67** (`feat/share-card-hero-graph-lockup` tip `a5091a6`) — that Hero Graph Lockup PR is still open and separately held.

## Scope
Move-first Today IA. Spec: `handoffs/today-tab-move-first-2026-11-06.md`
Detail: `.grok-handoff/today-move-first-ux-2026-11-06.md`

## Files changed
- `frontend/src/app/transits/page.tsx` — slim header; drop friendsStay + Overlaying + conditioning-notes
- `frontend/src/components/TodayIndication.tsx` — Move first; collapse vs-yesterday; drop eyebrow + still-conditioning; disclaimer footer

## Preview
- FE: http://127.0.0.1:3010
- API: http://127.0.0.1:8000

## Tests
- tsc clean · next lint clean (pre-existing hooks warning OK)
- Phone smoke 390×844 — Move visible without scrolling past sky chrome; vs closed by default
