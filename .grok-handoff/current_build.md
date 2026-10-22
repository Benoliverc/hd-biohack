# Handoff — Today HD indication (P0)

## Status
- **READY FOR @ui-ux** then **@qa Ship Gate**
- Branch: `feat/today-hd-indication`
- Spec: `.grok-handoff/current_spec.md` (2026-10-22 HD-derived rewrite; supersedes self-report)

## What shipped on this branch (not merged)
Read-only **Today's indication** on `/transits` above “What to do today”:
- Energy (Drained→Hyper) + preferred space highlighted as display chips (no questions, no taps)
- Main action + why + micro-move line from deterministic rules
- Payload on `GET /transits/today` → `indication`
- Free tier; “chart weather” disclaimer; no-natal Steady/Charged + save-chart CTA

## Hard no (verified)
- No self-ask chips / “How’s your energy?”
- No `PUT /checkin` from UI (checkin write routes not restored)
- No Variables engine / LLM / Protocol generate side effect
- Copy never claims Type/Authority changes (“temporary/borrowed Sacral”)

## Files
- `backend/app/checkin/derive.py` — `derive_today_indication`
- `backend/app/checkin/rules.py` — `compute_main_action` (micro separate)
- `backend/app/checkin/__init__.py`
- `backend/app/api/routes.py` — extend `GET /transits/today`
- `backend/app/schemas.py` — `TodayIndication` on `TransitResponse`
- `backend/tests/test_checkin.py` — AC 2–7 + space/energy table cases (16)
- `frontend/src/components/TodayIndication.tsx`
- `frontend/src/app/transits/page.tsx`
- `frontend/src/lib/api.ts`

## Tests
- `backend/.venv/bin/pytest` → **24 passed** (indication 16/16)
- `npx tsc --noEmit` → green

## Preview
- Local: http://127.0.0.1:3000/transits (start API :8000 + Next :3000 if not up)
- Do **not** merge; do **not** write ship_gate_report (QA owns that)

## Open questions (non-blocking)
1. SP newly + natal-defined SP → `people` uses “defined SP + personal bridge involving SP” (newly_defined can’t include already-defined centers).
2. No-natal Charged when transit sky defines Sacral/Heart; else Steady — confirm with PO if too aggressive.
3. Chip selected contrast (energy wash) — UX may want polish (prior Medium notes).

## Next
1. @ui-ux review Indication card vs Baseline language / 375 + 1280
2. @qa Ship Gate vs AC 1–9 in current_spec
3. Ship only when Benjamin asks (Railway builds may still be paused for API)
