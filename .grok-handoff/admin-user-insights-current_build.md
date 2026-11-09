# current_build — Admin User Insights

- **Date:** 2026-11-10 (Asia/Hong_Kong)
- **Branch:** `feat/admin-user-insights`
- **Worktree:** `/workspace/hd-biohack-wt-admin-insights`
- **Base:** `21a9c4c202c75acbc001983e65fd1919ab1b85bb` (main after #92 kit daypart slots landed)
- **PR:** #93 — https://github.com/Benoliverc/hd-biohack/pull/93
- **Tip SHA:** `2a8e5ca623a7b4ff2b0405dfd3a7b8d42b5ac46c`
- **Do not merge** until Benjamin yes after UX → Ship Gate.
- **Deploy on ship:** FE+BE → **Vercel AND Railway**

> Note: #92 kit daypart is on main. Active in-flight build for **PR #93 Admin User Insights** (rebased).

## Intent
Admin User Insights as signed off: three tabs on `/admin` — Overview (new-user pulse + existing Usage), Insights (period averages), People (searchable list + detail panel). Canvas: https://cursor.com/canvas/store-f5d34951-c924-450e-b54b-b19b5400da0d/3bdb7117-23e5-4ea7-a8e4-d0130086749f

## Shipped (first cut — full metrics)
### Instrument
- `signup` usage_event on successful `/auth/register` (best-effort; still also records login)
- `users.last_login_at` column + SQLite-friendly ensure; updated on login / register / reset-password

### APIs (admin gate unchanged)
- `GET /admin/overview/pulse`
- `GET /admin/insights?period=7|30|90` (default 30)
- `GET /admin/users` (search + sort + page)
- `GET /admin/users/{id}` (rollup; no passwords/tokens/birth/natal dumps)

### Insights metrics included
- new users, active users, avg logins / active, median days since last login, Me-natal activation %
- Today engagement %, avg page visits by page, charts & protocols / active, Return D1 / D7
- **No soft-follow for metrics** — all shipped in this PR. Fancy charts muted as soft.

### FE
- Tabs: Overview | Insights | People
- Overview: new-today / new-week spark / total accounts (excludes `.local`); 24h signup banner; Signups logbook filter
- People: searchable table + side panel detail

## Soft-follow / muted
- Fancy Insights charts, CSV export, signup email alerts (out of scope)

## Files
- `backend/app/models.py` — `last_login_at`
- `backend/app/database.py` — ensure column
- `backend/app/usage.py` — signup type + pulse/insights/people rollups
- `backend/app/schemas.py` — admin insight DTOs
- `backend/app/api/routes.py` — instrument + admin routes
- `backend/tests/test_admin_user_insights.py` — new
- `frontend/src/lib/api.ts` — client types/methods
- `frontend/src/app/admin/page.tsx` — tabs UI

## Tests
- `cd backend && .venv/bin/python -m pytest tests/test_admin_user_insights.py -q` → **6 passed**
- `cd frontend && ./node_modules/.bin/tsc --noEmit` → **exit 0**
- Note: shared local SQLite can pollute `test_usage_admin` AC6 if prior register tests left login rows; wipe today's logins or run AC6 in isolation — not a product regression.

## Verify
1. Admin → Overview: pulse cards + signup banner when any signup in 24h; Signups filter in logbook.
2. Insights: switch 7/30/90; activation + D1/D7 + page mix visible.
3. People: search; open panel — no birth/natal/password fields.
4. Register a new account → signup + login events; `last_login_at` set.

## Out of scope
Email/push alerts, CSV, Mixpanel funnels, impersonation, session replay, editing accounts from admin.

## Open questions
- None for ship.
