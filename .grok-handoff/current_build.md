# Handoff — Admin usage logbook (P0)

## Status
- **READY FOR QA** on `feat/admin-usage`
- Spec: `.grok-handoff/admin-usage-spec.md`
- Do **not** merge until Ship Gate PASS + Benjamin asks

## Built
1. `usage_events` table + `record_usage_event` (best-effort, separate session)
2. Instrument: login → `login`; chart calculate w/ user_id → `chart_generated`; protocol → `protocol_generated`
3. Gate: `ADMIN_EMAILS` (default includes `benjaminlammens@gmail.com` + `benjamin@test.hd-biohack.local`)
4. APIs: `GET /admin/usage/events`, `…/stats/daily|weekly|monthly` (+ optional `POST /admin/usage/backfill`)
5. Frontend `/admin`: Day/Week/Month cards + logbook; discreet Header Admin link when `is_admin`
6. Tests: `backend/tests/test_usage_admin.py` (AC 1–9) — 10 passed
7. Docs: `.env.example`, `DEPLOY.md`
8. Nice-to-have: idempotent backfill from natal_charts / weekly_protocols on API boot

## Local verify
```bash
# backend
cd backend && source .venv/bin/activate
export ADMIN_EMAILS=benjaminlammens@gmail.com,benjamin@test.hd-biohack.local
pytest tests/test_usage_admin.py -q
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# frontend — login as Benjamin / Wolkje → Admin in header → /admin
cd frontend && npm run dev
```

## Prod note
Railway builds still paused — merge/PR ok; API redeploy waits. Vercel can ship `/admin` UI earlier but admin APIs 404 until Railway is back.

## Out of scope (held)
Full analytics, CSV, locking open `GET /users`, JWT rewrite.
