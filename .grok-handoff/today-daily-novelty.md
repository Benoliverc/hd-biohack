# Handoff — Today Daily Novelty Contract (Option 2)

**Date:** 2026-10-24 (Asia/Hong_Kong)  
**Status:** Ready for Ship Gate / PO review — **do not merge** until Benjamin yes  
**Branch:** `feat/today-daily-novelty`  
**Spec:** `.grok-handoff/today-daily-novelty-ux-2026-10-24.md` §2 waterfall + §4 payload/hierarchy  
**Prior:** `.grok-handoff/today-indication-variance-2026-10-24.md`

## Goal
Guarantee ≥1 perceptible new signal every Asia/Hong_Kong calendar day. Energy/Space chips stay multi-day conditioning (sticky OK) with caption. HD × transits only — **no self-report**.

## What shipped

### API
- Ephemeris bucketed at **07:00 Asia/Hong_Kong** for day D and D−1 (`hkt_bucket_instant`).
- `daily_signal: { key, headline, body, source }` waterfall:
  Moon gate → Moon line → Sun line → Sun gate → hanging pressure → bridges/newly_defined → continuity (`day N` in key).
- `vs_yesterday[]` deltas for changed fields.
- `conditioning_caption` on every indication payload.
- Free / no-natal: sky-only `daily_signal` still flips; save CTA unchanged.

### rules.py
- `compute_main_action` sky clause (Sun and/or Moon gate.line) on **all** energy bands — not only Steady.

### FE
- Hero order: eyebrow → daily_signal → vs_yesterday pills → Main action → **Still conditioning** shelf (Energy + Space + caption).
- Dropped duplicate Sun bullet from “What to do today”.
- Renamed “Weekly macro theme” → **Sun / Earth theme**.

## Files
- `backend/app/checkin/novelty.py` (new)
- `backend/app/checkin/derive.py`, `rules.py`, `__init__.py` (export unchanged)
- `backend/app/api/routes.py` (`transits_today` HKT bucket)
- `backend/app/schemas.py` (`DailySignal`, `VsYesterdayDelta`, extended `TodayIndication`)
- `backend/tests/test_checkin.py`
- `frontend/src/components/TodayIndication.tsx`
- `frontend/src/app/transits/page.tsx`
- `frontend/src/lib/api.ts`

## Verify
```bash
cd backend && . .venv/bin/activate && python -m pytest tests/test_checkin.py -q
# 23 passed
cd frontend && npx tsc --noEmit
# green
```

### Smoke (fixed natal, consecutive HKT days)
- pytest `test_consecutive_hkt_days_different_daily_signal_keys`: **14/14** distinct `daily_signal.key`; Energy stayed Charged (4) entire window — chips sticky, sky led.
- Live bucket today (HKT): Moon 22.2 → 25.4; Sun line 50.4 → 50.5; Hyper/Charged main still shows `Notice Sun … / Moon …`.

## Out of scope
- Self-report energy; friend charts on Today; RNG/LLM copy; Option 3 chip soft-scoring; **merge / Railway / Vercel** (parent + PO).

## Open questions
1. Continuity day-index walker walks back up to 44 HKT buckets only on the rare quiet-sky path — OK, or cap lower?
2. Steady main still prefers classic Sun-theme bullet (Moon is in daily_signal hero). Want Steady main to also force Sun/Moon clause?

## Next
1. Ship Gate FE+API.
2. Benjamin yes → merge → Railway API + Vercel FE.
