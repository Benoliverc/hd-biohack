# Handoff — Today check-in (Energy + Preferred space → Main action)

## Status
- **Ready for:** `@qa` Ship Gate (UX Medium polish applied; do **not** treat as shipped)
- **Spec:** `.grok-handoff/current_spec.md` (P0 Today check-in)
- **Branch:** `feat/today-checkin`
- **SHA:** `(pending commit — see git)`
- **UX:** PASS + Medium polish applied (micro-move own line). Review: `.grok-handoff/today-checkin-ux-review.md`

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
  - Preferred space → **`main_action_micro`** (own field / own UI line — not appended with ` · ` into title)
- Optional `natal_chart_id`; no chart → generic battery + space micro
- SQLite ALTER: `_ensure_checkin_columns` adds `main_action_micro` on existing DBs

### Frontend
- `TodayCheckIn` on `/transits` **above** sky “What to do today”
- Both chip groups required before Main action; Saving…; inline Retry
- Main action card: **title** → **micro-move line** → why
- Chips `min-h-11` (~44px); selected space chip `bg-energy/30` (contrast bump)
- Sky section demoted (secondary copy + text link “Open Protocols”)
- Soft session `user.id`; free users OK (no entitlement gate)

## UX Medium polish (this commit)
- Stop concatenating space micro into `main_action_text`
- API/model add `main_action_micro`
- Low: chip height, space wash contrast, Drained MG battery copy (“likes speed” removed)

## Changed files
- `backend/app/models.py`
- `backend/app/schemas.py`
- `backend/app/database.py`
- `backend/app/api/routes.py`
- `backend/app/checkin/__init__.py`
- `backend/app/checkin/rules.py`
- `backend/tests/test_checkin.py`
- `frontend/src/lib/api.ts`
- `frontend/src/components/TodayCheckIn.tsx`
- `frontend/src/app/transits/page.tsx`
- `.grok-handoff/current_build.md`
- `.grok-handoff/current_spec.md`
- `.grok-handoff/today-checkin-ux-review.md` *(tracked if present)*

## Preview
- Frontend: http://127.0.0.1:3000/transits
- API: http://127.0.0.1:8000 (Next rewrite `/api/backend`)

## Verify locally
1. Open http://127.0.0.1:3000/transits (signed-in free user)
2. Tap **Steady** + **Alone** → Main action title + micro on **own line**; reload → restore
3. Tap **Drained** → protect/recover; MG why has no “likes speed”
4. Change space to **Nature** → micro line updates
5. Confirm no call to `POST /biohack/protocol` during check-in
6. Hyper → anti-stimulant / no stacked-commitments language

```bash
cd backend && .venv/bin/python -m pytest tests/test_checkin.py -q
curl -s -X PUT http://127.0.0.1:8000/checkin -H 'Content-Type: application/json' \
  -d '{"user_id":1,"local_date":"2026-10-22","energy_level":3,"preferred_space":"alone","timezone":"Asia/Hong_Kong"}'
```

## Tests
- `pytest tests/test_checkin.py` → **8 passed** (incl. micro separate + MG drained copy)
- `npx tsc --noEmit` → clean

## AC checklist (for @qa)
1. Steady + Alone → one Main action; persists after reload — implementable
2. Drained → recovery/protect, not push — implementable
3. Change space → updates in-session — implementable
4. No Protocol generated → still works (sky/type rules) — implementable
5. Free user → no Pro unlock — implementable
6. Hyper → no more stimulation / stacked commitments — implementable
7. Micro-move on its own line under title (not ` · ` in title) — polish

## Open questions for @po
- None. Prior open Q (micro-move own line) resolved in this polish.
