# Current build — Today's Move no-dup supplements (in flight)

## IN FLIGHT — Today's Move: no duplicate supplements
- **Branch:** `feat/todays-move-no-dup-supplements` (from clean `origin/main`)
- **Handoff:** `.grok-handoff/todays-move-no-dup-supplements-2026-11-04.md`
- **Scope:** API — `backend/app/biohack/rules.py` + `tests/test_kit_variety.py`
- **Root cause:** `_note_kit` for morning/midday lived only inside None-fallback indent → Hyper evening re-picked Magnesium Glycinate
- **Fix:** always register kit ids/names after each slot; cross-slot name+id dedupe; stack fallback attaches kit id; final safety pass
- **Tests:** `pytest -q tests/test_kit_variety.py` → 14 passed
- **Deploy:** Railway (API) after Benjamin merge yes; FE unchanged
- Hold merge. Parent routes UX → Ship Gate.

## PARALLEL (do not block)
- **PR #52** Soul behind Pro — separate branch `feat/soul-behind-pro` (still in flight)

## SHIPPED
- **PR #51** Admin Pro/Free — merge `2590334` · Railway + Vercel
- **PR #50** Nav clarity A+B — merge `9af2847` · Vercel
- **PR #49** Visual density Option A — merge `48edf24`
- **PR #48** i18n P0 chrome/shell — merge `d633a3b`
