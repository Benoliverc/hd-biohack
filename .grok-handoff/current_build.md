# Handoff — Admin usage logbook (P0)

## Status
- **SHIPPED** (frontend live; API blocked on Railway)
- Merge: [PR #13](https://github.com/Benoliverc/hd-biohack/pull/13) → `81583b1` on `main`
- Feature tip gated: `feat/admin-usage` @ `06363c1`
- Ship note: `.grok-handoff/ship-admin-usage.md`
- Spec: `.grok-handoff/admin-usage-spec.md`
- Gate: `.grok-handoff/ship_gate_report.md` — PASS AC 1–9

## Production
- **Vercel:** https://hd-biohack.vercel.app — Ready (`dpl_HMMmm4bbA7ehfm7RvKvznP8SeYCV`) @ ~21:31 HKT 2026-10-22; `/admin` 200
- **Railway api:** Online host, but **builds paused** — `railway redeploy --from-source -y` and `railway redeploy -y` both failed (“Deploys have been paused due to an upstream issue”). Prod OpenAPI has **no** `/admin/usage/*` until builds resume + redeploy. Smoke: `GET …/admin/usage/stats/daily` → 404.

## What shipped
1. `usage_events` table + `record_usage_event` (best-effort)
2. Instrument: login → `login`; chart calculate w/ user_id → `chart_generated`; protocol → `protocol_generated`
3. Gate: `ADMIN_EMAILS` (default includes `benjaminlammens@gmail.com` + `benjamin@test.hd-biohack.local`)
4. APIs: `GET /admin/usage/events`, `…/stats/daily|weekly|monthly` (+ optional backfill)
5. Frontend `/admin`: Day/Week/Month cards + logbook; discreet Header Admin link when `is_admin`
6. Docs: `.env.example`, `DEPLOY.md`

## Next
1. When Railway builds resume: set/confirm `ADMIN_EMAILS` on `api`, then `railway redeploy --from-source -y`
2. Smoke: admin endpoints 200 for allowlisted login; 403 for others; events appear after login/chart/protocol
3. Rotate Railway env secrets if not already done (incident notice)

## Out of scope (held)
Full analytics, CSV, locking open `GET /users`, JWT rewrite.
