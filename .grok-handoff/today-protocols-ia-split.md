# Today vs Protocols — IA split (P0)

**PO:** Grok Bot · **Owner:** Full Stack Developer  
**Spec Page:** https://cursor.com/canvas/store-f5d34951-c924-450e-b54b-b19b5400da0d/cb29692c-348a-475d-a74f-8a71ee16c63b  
**Branch:** `feat/today-protocols-ia-split`  
**PR:** https://github.com/Benoliverc/hd-biohack/pull/45  
**Tip SHA:** `3971ba3` (`3971ba3ec05905cebbc61c0fad3054b497843977`)  
**Status:** PR open — awaiting UX UI Review → Ship Gate → Benjamin yes  

## Goal
Today (`/transits`) = only sky cockpit. Protocols (`/biohack`) = stack blueprint + prove-it. Stop Protocols competing with Today for “what to do today.”

## Locked product decisions (honoured)
- WeatherStrip: chips-only (Energy, Space, optional what's-new chip, link “Full sky on Today”). Dropped vs_yesterday pills + bridge essay.
- Keep “Today's Move” naming (not Timed leads).
- Pro Move N/M strip = **P0.5 — out of this PR**.
- baseline-pause storage = **P1 — out of this PR**.

## Acceptance criteria

| AC | Status |
|----|--------|
| Today: exactly one primary do-statement (Main action); no “What to do today” competing | PASS — section retitled **Conditioning notes**; Open Protocols bullet removed (link stays under Main action) |
| Protocols header no longer promises “Do the sky / timed plan for today” | PASS — “Your stack — prove today's timed leads.” |
| WeatherStrip chips + link to Today only | PASS |
| ≤1 What's-new narrative on Protocols | PASS — WeatherStrip chip only; nested essay removed from TodaysMoveCard |
| Checkboxes only on /biohack | PASS |
| Main action never checklist #1 | PASS — untouched contract |
| preferred_timezone completions; HKT novelty on Today | PASS — no change to protocolCompletions / formatResetsInHkt |
| Me-only both tabs | PASS — unchanged |

## Files touched
- `frontend/src/app/transits/page.tsx` — demote overlay list to Conditioning notes
- `frontend/src/app/biohack/page.tsx` — header copy; wire extracted chrome; slim WeatherStrip props
- `frontend/src/components/protocols/*` — WeatherStrip, TodaysMoveCard, KitStrip (+ types/constants)
- `frontend/scripts/assert-today-protocols-ia.mjs` + package.json script
- `.grok-handoff/today-protocols-ia-split.md`, `.grok-handoff/current_build.md`

## Out of scope
Pro progress strip, baseline pause, marketplace, wearables, HKT contract change, Log-how-I-feel Energy/Space, Bodygraph walkthrough.

## Verify
- `npx tsc --noEmit` (frontend)
- `npm run assert:today-protocols-ia`
- `npm run assert:resets-in-hkt`
- `npm run assert:protocol-completions`
- Backend untouched (FE-only)

## Pipeline
implement → UX UI Review → Ship Gate → Benjamin merge widget → Railway/Vercel  
Do **not** merge/deploy from this handoff.
