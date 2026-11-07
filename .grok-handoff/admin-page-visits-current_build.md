# Admin page visits — build brief

**Date:** 2026-11-07 (Asia/Hong Kong)
**Signed off by:** Benjamin, in his own words: “In the admin dashboard, also share how many times the main pages are visited.”
**Source of truth:** this file (also copied at `/workspace/reports/admin-page-visits-build-brief-2026-11-07.md`).
**Product owner:** Grok Bot. Do not ask Benjamin for clarification — ship this brief.

This extends the existing Admin usage logbook (P0 shipped earlier; see `admin-usage-spec.md`). It is **frontend + backend**. After dual-gate + Benjamin’s merge yes: **Vercel and Railway together**.

Do **not** merge. Open a PR and tell Grok Bot the URL + tip SHA. Grok Bot routes UX UI Review → Ship Gate QA, then asks Benjamin.

---

## Goal

On `/admin`, show how many times each **main page** was visited, for the same day / week / month periods already used for logins, charts, and protocols.

Main pages are the five primary nav items in `frontend/src/components/Header.tsx`:

| Label | Path | Stats key |
| --- | --- | --- |
| Home | `/` | `home` |
| Protocols | `/biohack` | `protocols` |
| Today | `/transits` | `today` |
| Chart | `/profile` | `chart` |
| Soul | `/soul` | `soul` |

Do **not** count `/login`, `/admin`, `/settings`, or any other path.

---

## What already exists

- `/admin` already shows period tabs (day / week / month), three stat cards (Unique logins, Charts generated, Protocols generated), a “Last 14 days (UTC)” table, and a logbook of `login` / `chart_generated` / `protocol_generated`.
- Events live in `usage_events` via `record_usage_event` in `backend/app/usage.py`. `EVENT_TYPES` is currently `("login", "chart_generated", "protocol_generated")`. Unknown types are dropped.
- Aggregates are computed in `_aggregate_bucket` and exposed as `UsageStatsDay` / `Week` / `Month` (`backend/app/schemas.py` and `frontend/src/lib/api.ts` `UsageStatsBucket`).
- Instrumentation for the three existing events is server-side on API writes. Page visits do not exist yet — there is nothing to backfill. Days before ship stay at 0.
- Admin strings on the usage tables are English and hardcoded (not i18n). Match that.

---

## Locked product decisions

1. **Primary metric is visits** (“how many times”), not only unique users. Also show unique visitors per page as secondary text, matching the existing Unique logins card.
2. A visit is one opening of that page: first load, client navigation to it, or a full refresh. Query-string or hash-only changes are not a new visit.
3. **Do not flood the default logbook.** Page views would drown logins/charts/protocols. Default “All” stays those three action types. Add a “Pages” filter chip that lists `page_view` events only.
4. **No backfill.** Show a quiet note near the page-visit section: “Page visits start from when this shipped — earlier days stay at 0.”
5. **No third-party analytics**, no scores, no funnels, no session replay, no heatmaps.
6. Metadata must stay small and non-sensitive: `{ "page": "home", "path": "/" }` only. No query strings, no birth data, no chart ids, no emails in metadata.
7. Count logged-in visits with `user_id`. Count logged-out visits too (mainly Home) as `user_id = null` with empty email. Unique-visitor totals must **not** treat null `user_id` as a user (views still increment; unique stays based on distinct non-null `user_id`).
8. Do not invent extra pages (Settings, Login, Admin, share cards, Soul partner vs friend). Soul is just `/soul`.

---

## Backend

Add `page_view` to `EVENT_TYPES` and allow `record_usage_event` to persist it.

Relax the “no user_id and no email → drop” guard **only** for `page_view`, so anonymous Home visits are stored.

Add a best-effort write endpoint, e.g. `POST /usage/page-view`:

- Body: `{ "path": "/", "user_id": 123 | null }`.
- Normalize path: strip query and hash; treat `""` and trailing slashes as `/` except keep the five known prefixes exactly (`/biohack`, `/transits`, `/profile`, `/soul`).
- Map only the five paths above to a `page` key. Unknown paths: return 204 and write nothing.
- If `user_id` is present, snapshot that user’s email like other events. If absent, store `user_id=null` and `email=""`.
- Never fail the caller’s page: catch write errors, return 204. Same spirit as `record_usage_event`.
- Optional server debounce: ignore a duplicate `page_view` for the same `(user_id or anonymous, page)` within ~2 seconds (absorbs React Strict Mode double-mount if the client debounce misses).

Extend `_aggregate_bucket` and the three stats schemas with a nested object (keep existing login/chart/protocol fields unchanged):

```
page_visits: {
  home:       { views: int, unique_users: int },
  today:      { views: int, unique_users: int },
  chart:      { views: int, unique_users: int },
  protocols:  { views: int, unique_users: int },
  soul:       { views: int, unique_users: int }
}
```

`views` = count of `page_view` rows whose `metadata.page` (or `metadata.path`) matches. `unique_users` = distinct non-null `user_id` for that page in the bucket. Missing/legacy rows without `page_visits` should be treated as zeros on the frontend, but the API should always send the object going forward.

`list_usage_events`: allow filtering `event_type=page_view`. When `event_type` is omitted, **exclude** `page_view` so the default logbook stays the three action types.

---

## Frontend

1. **Tracker** — one client listener (layout or a small component mounted from `layout.tsx` / `Header.tsx`, which already uses `usePathname`). On pathname change to one of the five main pages, fire `api.recordPageView` best-effort (do not block render, ignore errors).
2. Debounce the same path for ~3 seconds so Strict Mode remounts and rapid replacement navigations do not double-count.
3. Include `user_id` when a session user exists; omit it when logged out.
4. **Admin UI**
   - Keep the existing three action cards and the existing 14-day actions table as they are.
   - Add a “Page visits” section under those cards: five cards (Home, Protocols, Today, Chart, Soul) showing the big **views** number for the selected period, with secondary text “N unique visitors” and the same period hint (e.g. `Day 2026-11-07 (UTC)`).
   - When period is day, add a second table “Page visits — last 14 days (UTC)” with columns Day · Home · Protocols · Today · Chart · Soul (view counts). Do not cram these columns into the existing logins/charts/protocols table.
   - Week and month: the five cards for the current period are enough (same pattern as the action cards — the series table is day-only today).
   - Update the page subtitle to mention page visits, e.g. “Logins, charts, protocols, and page visits — UTC days. Times shown in Asia/Hong_Kong.”
   - Quiet start-date note as specified above.
   - Logbook: add a “Pages” filter chip. Default “All” still means login / chart / protocol. Label `page_view` as “Page”. `notesFor` should show the page label (Home, Protocols, Today, Chart, Soul) from metadata.
5. Update `UsageStatsBucket` (and any mirrors) so the admin page can read `page_visits`.

---

## Tests

Extend `backend/tests/test_usage_admin.py` (and frontend types/UI as needed):

- Known path records a `page_view` with the right `metadata.page` / `path`.
- Unknown path does not write.
- Logged-out visit writes `user_id=null` and still increments `views`, but not `unique_users`.
- Logged-in visit increments both `views` and `unique_users`.
- Daily/weekly/monthly stats include `page_visits` keyed correctly.
- Default events list excludes `page_view`; `event_type=page_view` returns only those.
- Non-admin still 403 on `/admin/usage/*`.
- Existing login / chart / protocol tests stay green.

---

## Out of scope

- Tracking Settings, Login, Admin, or arbitrary URLs.
- Historical backfill.
- Changing admin allowlist, plan toggle, or the three existing action metrics.
- Third-party analytics, cookies beyond the current session, or PII in paths.
- Asking Benjamin which pages count — use the five nav pages above.

---

## Ship

- Open a PR (do not merge).
- Report URL + exact tip SHA to Grok Bot.
- Dual-gate: UX UI Review first, then Ship Gate QA.
- FE + BE → on Benjamin’s yes: **Vercel and Railway**.

---

## Status (build agent — 2026-11-07 Asia/Hong_Kong)

- Branch: `feat/admin-page-visits`
- Base: `76a537e2881f9a489b0e069885167a5144f3f284` (origin/main after PR #83)
- Tip SHA: `631c8cf9b9cfac0f9c0bb9becd52905029f05ff6`
- PR: https://github.com/Benoliverc/hd-biohack/pull/84
- Worktree: `/workspace/hd-biohack-wt-admin-page-visits`
- Files: `backend/app/usage.py`, `backend/app/schemas.py`, `backend/app/api/routes.py`, `backend/tests/test_usage_admin.py`, `frontend/src/lib/api.ts`, `frontend/src/components/PageViewTracker.tsx`, `frontend/src/app/layout.tsx`, `frontend/src/app/admin/page.tsx`
- Tests: `pytest tests/test_usage_admin.py` → 19 passed; `npx tsc --noEmit` → clean
- Preview: FE on `:3026` (ENABLE_API_REWRITE); not merged; dual-gate pending via Grok Bot
- Deviation: pre-existing `test_ac5_protocol_generated` failed on main (protocol now requires saved natal chart); fixture updated to save a chart first — assertion unchanged
