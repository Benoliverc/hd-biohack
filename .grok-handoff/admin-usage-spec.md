# P0 — Admin usage logbook + day/week/month stats

**Status:** Ready for `@dev` (spec only — not built)  
**Route:** `/admin` (frontend) + `/admin/*` API  
**App:** Baseline (hd-biohack)  
**Date:** 2026-10-22  
**PO:** Benjamin Lammens  

Related: Today HD indication remains in `current_spec.md` (shipped FE; API redeploy blocked on Railway). This admin work is a **separate** P0.

---

## Goal (plain language)

As the Baseline owner, I want a simple **admin page** that shows:

1. A **logbook** — who logged in when, who generated a chart, who generated Protocols.
2. **Stats** — how many distinct users logged in per day; how many charts were generated that day; same rollups for **week** and **month**.

No full analytics product. Just an overview so we can see real usage.

---

## What already exists (baseline for implementers)

| Area | Today |
|---|---|
| Auth | `POST /auth/login` (username+password) → `UserOut`. Soft client session: `localStorage` key `hd-biohack:session-user-id`. No JWT, no server session cookie, **no `last_login`**. |
| Users | `users`: `id`, `email`, `username`, `display_name`, `auth_provider` (`password` \| `dev`), `subscription_tier`, `biohacking_enabled`, `created_at`. Seeded password users (e.g. Benjamin) + Dev Free/Pro. **No admin role / flag.** |
| Chart | `POST /chart/calculate` — always computes; persists `natal_charts` only when `save=true` + `user_id`. Row has `created_at` (insert only; updates do not bump it). |
| Protocol | `POST /biohack/protocol` — always inserts `weekly_protocols` with `created_at` + `week_start`. Good **historical proxy** for “protocol generated.” |
| Telemetry | `POST /v2/telemetry/ingest` → `user_biometrics_daily` (wearables stub). **Not** product usage. |
| Admin UI/API | **None.** `GET /users` lists everyone with no auth. No `/admin` page. |
| Storage | SQLite on Railway volume (`SQLITE_PATH=/data/hd_biohack.db`); optional `DATABASE_URL` Postgres later. Tables via `create_all` + small ALTER helpers in `database.py`. |

**Implication:** We can approximate past **protocol** (and saved-chart) activity from existing tables, but **logins are invisible today**. P0 must add a lightweight event log and instrument the three write paths.

---

## Access — admin only

- Env var: **`ADMIN_EMAILS`** — comma-separated emails (case-insensitive).  
  **Default / required for prod:** include `benjaminlammens@gmail.com`.  
  Dev note: password-seeded Benjamin uses `benjamin@test.hd-biohack.local` — either add that email to `ADMIN_EMAILS` for local, **or** (preferred for PO) add a real-email mapping later; for P0, allowlist whichever email(s) the admin account actually has in `users.email`.
- No new RBAC column in P0. Admin = “current user’s email ∈ ADMIN_EMAILS”.
- **Frontend:** `/admin` only renders if `user.email` is allowlisted (else redirect home + short “not allowed”). Link from Header/profile **only** when allowlisted (do not advertise to all users).
- **Backend:** every `/admin/*` endpoint requires a caller identity, e.g. query/header `actor_user_id` (or reuse existing soft-auth pattern: `user_id` query). Resolve user → email → must be in `ADMIN_EMAILS` or **403**. Do not rely on obscurity; `GET /users` remaining open is pre-existing debt — out of scope to lock down fully in P0, but admin endpoints **must** gate.
- Add `ADMIN_EMAILS` to `.env.example`, `config.py` (`Settings.admin_emails`), and `DEPLOY.md` Railway variables table.

---

## Data model — `usage_events`

New table (SQLAlchemy model + `create_all`; SQLite-friendly):

| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | |
| `user_id` | FK → `users.id`, indexed, nullable | Null only if somehow anonymous (prefer always set) |
| `email` | String(255), indexed | Snapshot at event time (survives rename) |
| `event_type` | String(32), indexed | `login` \| `chart_generated` \| `protocol_generated` |
| `created_at` | DateTime, indexed, default utcnow | Event time (UTC) |
| `metadata_json` | JSON, nullable | Optional small bag: e.g. `natal_chart_id`, `saved: bool`, `protocol_id`, `slot_kind` — **no passwords, no birth data dumps** |

Indexes: `(event_type, created_at)`, `(created_at)`, `(user_id, created_at)`.

**Do not** invent a separate analytics warehouse. One append-only table is enough for P0.

### Historical backfill (optional, nice-to-have in same PR)

- From `weekly_protocols` → synthetic `protocol_generated` (idempotent: skip if matching `metadata_json.protocol_id` already exists).
- From `natal_charts` → synthetic `chart_generated` with `saved: true` (knowing updates won’t appear historically).
- **No** login backfill possible.

---

## Instrumentation points (exact hooks)

| Event | Where to record | When |
|---|---|---|
| `login` | `POST /auth/login` in `backend/app/api/routes.py` → `login()` | After successful password verify, before return. Include `user_id` + `email`. |
| `chart_generated` | `POST /chart/calculate` → `calc_chart()` | After successful `calculate_chart(...)`. Always log if `body.user_id` present; if no `user_id`, skip or log with email null (prefer skip to avoid anonymous noise). Metadata: `natal_chart_id` (if any), `saved: bool`, `slot_kind`. **Count every successful calculate with a user**, not only saves — matches “generated their charts.” |
| `protocol_generated` | `POST /biohack/protocol` → `protocol()` | After `WeeklyProtocol` commit. Metadata: `protocol_id` (= snap.id), `natal_chart_id`. |

Helper: e.g. `record_usage_event(db, *, user, event_type, metadata=None)` in a small `backend/app/usage.py` so routes stay thin. Failures to write events must **not** fail the primary request (log + swallow, or best-effort commit).

**Out of instrumentation for P0:** page views, transit loads, inventory edits, tier changes, geocode.

---

## API endpoints (admin)

All under admin gate. Return ISO-8601 UTC timestamps; UI may display Asia/Hong_Kong if desired.

### `GET /admin/usage/events`

Logbook — paginated, filterable.

Query params:

- `limit` (default 50, max 200), `offset` (default 0)
- `day` optional `YYYY-MM-DD` (filter `created_at` that UTC calendar day — document timezone; prefer **UTC day** for P0, note in UI)
- `event_type` optional: `login` \| `chart_generated` \| `protocol_generated`
- `actor_user_id` required (admin gate)

Response:

```json
{
  "total": 123,
  "items": [
    {
      "id": 1,
      "user_id": 3,
      "email": "benjamin@test.hd-biohack.local",
      "display_name": "Benjamin",
      "event_type": "login",
      "created_at": "2026-10-22T13:05:00Z",
      "metadata": {}
    }
  ]
}
```

Join `display_name` / `username` from `users` when present.

### `GET /admin/usage/stats/daily`

Query: `from` / `to` as `YYYY-MM-DD` (inclusive, UTC days; default last 14 days), `actor_user_id`.

Per day:

- `day`
- `logins` — count of `login` events
- `unique_users_logged_in` — distinct `user_id` with `login`
- `charts_generated` — count of `chart_generated`
- `protocols_generated` — count of `protocol_generated`

### `GET /admin/usage/stats/weekly` and `GET /admin/usage/stats/monthly`

Same counters rolled up:

- Weekly: ISO week key `YYYY-Www` (or `week_start` Monday UTC) for last ~8–12 weeks default.
- Monthly: `YYYY-MM` for last ~6–12 months default.

Keep payloads small — arrays of aggregates only.

---

## UI — `/admin`

- New page: `frontend/src/app/admin/page.tsx` (client component, uses `api` + `useApp`).
- Match Baseline look: canvas bg, soft cards, growth accent, same typography as login/transits.
- **Top:** period toggle — Day / Week / Month — drives which stats endpoint + which cards.
- **Stat cards:** Unique logins · Charts generated · Protocols generated (for selected period; for Day also show a small last-14-days table or simple bar/list — CSS or tiny chart, no new heavy chart lib required).
- **Logbook table:** columns Time · User (display_name / email) · Event · Notes (short metadata). Filters: event type chips + day picker. Pagination (Prev/Next).
- Loading / empty / 403 states.
- Soft AuthGate already requires login; additionally enforce admin allowlist client-side; trust server 403.
- Extend `frontend/src/lib/api.ts` with admin helpers.
- **Do not** put `/admin` in the main bottom/primary nav for everyone — discreet entry (e.g. profile menu or footer) when `isAdmin`.

---

## Out of scope for P0

- Full product analytics (funnels, retention cohorts, heatmaps, real-time streaming)
- Export CSV / email digests
- PII beyond email/display_name already in auth (no birth data in logbook)
- Hardening all existing open endpoints (`GET /users`, chart by id, etc.)
- Google/Supabase OAuth
- Changing Railway/Vercel deploy topology
- Replacing soft localStorage session with JWT
- Wearable telemetry as “usage”

---

## Acceptance criteria

1. Given `ADMIN_EMAILS` includes the signed-in user’s email, when they open `/admin`, then they see stats cards + logbook.
2. Given a non-allowlisted signed-in user, when they open `/admin` or call `/admin/usage/*`, then UI redirects/blocks and API returns **403**.
3. Given a successful `POST /auth/login`, then a `login` row appears in `usage_events` and in the logbook.
4. Given a successful `POST /chart/calculate` with `user_id`, then a `chart_generated` event is recorded (save or not).
5. Given a successful `POST /biohack/protocol`, then a `protocol_generated` event is recorded.
6. Given daily stats for a day with 2 logins from the same user and 1 from another, then `logins=3` and `unique_users_logged_in=2`.
7. Given week/month toggles, when selected, then aggregates match summed daily events for that bucket.
8. Given no events yet, when admin opens the page, then empty states render without crash.
9. Given event-write failure (e.g. DB blip), when login/chart/protocol succeeds, then the primary action still returns 200 (best-effort logging).

---

## Files (expected)

- `backend/app/models.py` — `UsageEvent`
- `backend/app/usage.py` — `record_usage_event` + admin email helper
- `backend/app/config.py` / `.env.example` / `DEPLOY.md` — `ADMIN_EMAILS`
- `backend/app/api/routes.py` — instrument 3 handlers + admin GETs
- `backend/app/schemas.py` — admin response models
- `backend/tests/test_usage_admin.py` — gate + event + daily unique counts
- `frontend/src/app/admin/page.tsx`, `lib/api.ts`, Header/profile link when admin

---

## Ship notes / blockers

- **Railway Hobby builds currently paused** — any backend model/route change needs an API redeploy to reach prod. Frontend `/admin` can deploy on Vercel sooner but will 404/fail API until Railway is unblocked.
- Local SQLite picks up new table via `init_db()` / `create_all` on boot.
