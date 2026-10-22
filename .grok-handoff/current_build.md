# Handoff — Today check-in (Energy + Preferred space → Main action)

## Status
- **Ready for:** `@ui-ux` then `@qa` Ship Gate (do **not** treat as shipped)
- **Spec:** `.grok-handoff/current_spec.md` (P0 Today check-in)
- **Branch:** `feat/today-checkin`
- **SHA:** _(filled after commit)_

## Request
On `/transits` (nav Today), above “What to do today”, add Check-in: Energy (1–5) + Preferred space → one Main action + why. Free tier. Deterministic. No LLM. No Protocol generate side effect.

## Implementation
### Backend
- New table `daily_checkins` (`DailyCheckin` model) — dedicated, not `user_biometrics_daily`
- `PUT /checkin` upsert by `(user_id, local_date)`; `GET /checkin/today`
- Server computes Main action via `backend/app/checkin/rules.py`:
  - Energy 1–2 → Type recover / protect (no push framing)
  - Energy 3 → sky bullet #1, else last cached Protocol `summary.top_actions[0]` (read-only), else Strategy
  - Energy 4–5 → Type surplus + Strategy; Hyper appends anti-stim / anti-stack note
  - Preferred space appends micro-move into `main_action_text`
- Optional `natal_chart_id`; no chart → generic battery + space micro

### Frontend
- `TodayCheckIn` on `/transits` **above** sky “What to do today”
- Both chip groups required before Main action; Saving…; inline Retry
- Sky section demoted (secondary copy + text link “Open Protocols”)
- Soft session `user.id`; free users OK (no entitlement gate)

## Changed files
- `backend/app/models.py`
- `backend/app/schemas.py`
- `backend/app/api/routes.py`
- `backend/app/checkin/__init__.py` *(new)*
- `backend/app/checkin/rules.py` *(new)*
- `backend/tests/test_checkin.py` *(new)*
- `frontend/src/lib/api.ts`
- `frontend/src/components/TodayCheckIn.tsx` *(new)*
- `frontend/src/app/transits/page.tsx`
- `.grok-handoff/current_build.md`
- `.grok-handoff/current_spec.md` *(already present; tracked if committed)*

## Preview
- Frontend: http://127.0.0.1:3000/transits
- API: http://127.0.0.1:8000 (Next rewrite `/api/backend`)
- Both were already running on the box; API restarted to pick up new table

## Verify locally
1. Open http://127.0.0.1:3000/transits (signed-in free user)
2. Tap **Steady** + **Alone** → Main action appears; reload → selections + Main action restore
3. Tap **Drained** → copy is protect/recover oriented
4. Change space to **Nature** → Main action / why updates
5. Confirm no call to `POST /biohack/protocol` during check-in (Network tab)
6. Hyper → anti-stimulant / no stacked-commitments language

```bash
cd backend && .venv/bin/python -m pytest tests/test_checkin.py -q
curl -s -X PUT http://127.0.0.1:8000/checkin -H 'Content-Type: application/json' \
  -d '{"user_id":1,"local_date":"2026-10-22","energy_level":3,"preferred_space":"alone","timezone":"Asia/Hong_Kong"}'
```

## Tests
- `pytest tests/test_checkin.py` → **7 passed**
- Full mandala + checkin → **11 passed**
- `npx tsc --noEmit` → clean
- `npm run lint` → only pre-existing `store.tsx` hooks warning

## AC checklist (for @qa)
1. Steady + Alone → one Main action; persists after reload — implementable
2. Drained → recovery/protect, not push — implementable
3. Change space → updates in-session — implementable
4. No Protocol generated → still works (sky/type rules) — implementable
5. Free user → no Pro unlock — implementable
6. Hyper → no more stimulation / stacked commitments — implementable

## Open questions for @po
- None blocking. Optional later: show space micro-move on its own line under Main action title (currently appended with ` · ` in `main_action_text`).
