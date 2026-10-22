# Handoff — Today HD indication (P0)

## Status
- **READY FOR @ui-ux re-verify** (UX FAIL fixes landed) — then **@qa Ship Gate**
- Branch: `feat/today-hd-indication`
- SHA: `1e100bf` (UX FAIL fixes; prior tip `725addd` / impl `7577fb6`)
- Spec: `.grok-handoff/current_spec.md` (2026-10-22 HD-derived rewrite; supersedes self-report)
- Prior UX FAIL: `.grok-handoff/today-hd-indication-ux-review.md`

## What shipped on this branch (not merged)
Read-only **Today's indication** on `/transits` above “What to do today”:
- Energy (Drained→Hyper) + preferred space highlighted as display chips (no questions, no taps)
- Main action + why + micro-move from deterministic rules (order: action → why → micro)
- Payload on `GET /transits/today` → `indication`
- Free tier; “chart weather” disclaimer; no-natal Steady/Charged + **one** save-chart CTA

## UX FAIL fixes (this SHA)
1. **High:** Space selected → `bg-energy-soft` + deepened `energy-ink` (not `bg-energy/30`)
2. **High:** Why + drivers → `text-sm text-fg-secondary` (not muted xs on growth-soft)
3. Unselected chips + disclaimer → `text-fg-secondary` / `text-sm`
4. Why is one plain because — no “Energy is …” / “Space: …” echo
5. Open Protocols → `min-h-11` tap target
6. No-chart: single Save CTA on indication (page banner removed); Sun theme `Gate N · line L`
7. Drivers labeled “Chart notes”; soft wording (no third Save ask)

## Hard no (verified)
- No self-ask chips / “How’s your energy?”
- No `PUT /checkin` from UI (checkin write routes not restored)
- No Variables engine / LLM / Protocol generate side effect
- Copy never claims Type/Authority changes (“temporary/borrowed Sacral”)

## Files
- `backend/app/checkin/derive.py` — `derive_today_indication`
- `backend/app/checkin/rules.py` — `compute_main_action` + `sky_bullet_one` Gate format
- `backend/app/checkin/__init__.py`
- `backend/app/api/routes.py` — extend `GET /transits/today`
- `backend/app/schemas.py` — `TodayIndication` on `TransitResponse`
- `backend/tests/test_checkin.py` — AC + why/gate format cases (17)
- `frontend/src/components/TodayIndication.tsx`
- `frontend/src/app/transits/page.tsx`
- `frontend/src/app/globals.css` — `--energy-soft`, deeper light `--energy-ink`
- `frontend/tailwind.config.ts` — `energy.soft`
- `frontend/src/lib/api.ts`

## Tests
- `backend/.venv/bin/pytest` → **25 passed** (indication 17/17)
- `npx tsc --noEmit` → green

## Preview
- Local: http://127.0.0.1:3000/transits (start API :8000 + Next :3000 if not up)
- Do **not** merge; do **not** write ship_gate_report (QA owns that)
- Do **not** hand to Ship Gate until @ui-ux re-PASS

## Open questions (non-blocking)
1. SP newly + natal-defined SP → `people` uses “defined SP + personal bridge involving SP” (newly_defined can’t include already-defined centers).
2. No-natal Charged when transit sky defines Sacral/Heart; else Steady — confirm with PO if too aggressive.

## Next
1. @ui-ux re-verify Indication card vs FAIL report (High + Medium)
2. @qa Ship Gate vs AC 1–9 in current_spec **only after UX PASS**
3. Ship only when Benjamin asks (Railway builds may still be paused for API)
