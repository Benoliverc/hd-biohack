# Handoff — Today check-in (Energy + Preferred space → Main action)

## Status
- **SHIPPED** (frontend live; Railway API redeploy **pending** — see ship note)
- **Spec:** `.grok-handoff/current_spec.md` (P0 Today check-in)
- **Branch:** merged via PR #8 → `main` @ `19bbd5b`
- **Impl:** `975e99e` (micro-move polish); tip docs `06dbddf`
- **UX:** PASS + Medium polish applied
- **Ship Gate:** PASS (scoped) — `.grok-handoff/ship_gate_report.md`

## Production
- **Frontend:** https://hd-biohack.vercel.app — Vercel Ready (`dpl_4H4QD6v8V4AGpcmDnQskmpzEzw2V`) — Today check-in UI in `/transits` bundle
- **Backend:** https://api-production-7527.up.railway.app — `/health` ok; **`/checkin` not yet on prod** (OpenAPI has no checkin paths). Railway CLI grant expired on this box → manual Redeploy from Railway dashboard (or `railway login` + redeploy) required so `PUT /checkin` + `GET /checkin/today` land.

## Request
On `/transits` (nav Today), above “What to do today”, add Check-in: Energy (1–5) + Preferred space → one Main action + why. Free tier. Deterministic. No LLM. No Protocol generate side effect.

## Implementation
### Backend
- New table `daily_checkins` (`DailyCheckin` model) — dedicated, not `user_biometrics_daily`
- `PUT /checkin` upsert by `(user_id, local_date)`; `GET /checkin/today`
- Server computes Main action via `backend/app/checkin/rules.py`
- Preferred space → **`main_action_micro`** (own field / own UI line)
- SQLite ALTER: `_ensure_checkin_columns` adds `main_action_micro` on existing DBs

### Frontend
- `TodayCheckIn` on `/transits` **above** sky “What to do today”
- Main action card: **title** → **micro-move line** → why
- Free users OK (no entitlement gate)

## Verify production (after Railway redeploy)
```bash
curl -sS https://api-production-7527.up.railway.app/health
curl -sS -X PUT https://api-production-7527.up.railway.app/checkin -H 'Content-Type: application/json' \
  -d '{"user_id":1,"local_date":"2026-10-22","energy_level":3,"preferred_space":"alone","timezone":"Asia/Hong_Kong"}'
```
