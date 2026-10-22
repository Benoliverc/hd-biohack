# Handoff — Admin link fix (follow-up to Admin usage)

## Status
- **SHIPPED** (frontend live; API still blocked on Railway)
- Merge: [PR #14](https://github.com/Benoliverc/hd-biohack/pull/14) → `b0a55e6` on `main`
- Feature tip: `feat/fix-admin-link` @ `59e758c`
- Ship note: `.grok-handoff/ship-fix-admin-link.md`

## Production
- **Vercel:** https://hd-biohack.vercel.app — Ready (`dpl_HWC9HVdXNqnwLrWEneh7Gy3uBbBv`) @ ~21:44 HKT 2026-10-22; `/` + `/admin` 200
- **Railway api:** Online host, builds still **paused**. OpenAPI: no `/admin/usage/*`, no `is_admin` on login UserOut. Header Admin link works via client allowlist (`benjaminlammens@gmail.com`, `benjamin@test.hd-biohack.local`).

## What shipped
1. `frontend/src/lib/admin.ts` — `isAdminUser` prefers API `is_admin`, falls back to email allowlist
2. Header + `/admin` use shared gate; login persists `is_admin` when present
3. Docs: `NEXT_PUBLIC_ADMIN_EMAILS` in frontend `.env.example`

## Next
1. When Railway builds resume: set/confirm `ADMIN_EMAILS` on `api`, `railway redeploy --from-source -y`
2. Hard-refresh prod as Benjamin (allowlisted email) → Admin link; `/admin` data once API is live
3. Rotate Railway env secrets if not already done

---

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
