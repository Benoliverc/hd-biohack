# Ship Gate — Admin usage P0 (scoped)

**Verdict: PASS** (scoped to admin usage AC 1–9 — not a full-product gate)  
**Branch / SHA:** `feat/admin-usage` @ `06363c1`  
**PR:** https://github.com/Benoliverc/hd-biohack/pull/13 (**not merged** — Benjamin decides)  
**Checked:** 2026-10-22 ~21:29 Asia/Hong_Kong (HKT)  
**Shots:** `/workspace/hd-biohack-ui-failures/ship-gate-2026-10-22/admin-usage/`  
**Prod note:** Railway still paused — API redeploy waits after any merge.

---

## Summary

| Area | Result |
|------|--------|
| pytest `test_usage_admin.py` | **PASS** — 10/10 |
| Full suite (alone) | **PASS** — 35/35 |
| Admin APIs + non-admin 403 | **PASS** |
| UI AC 1–8 | **PASS** |
| AC 9 best-effort logging | **PASS** via pytest (UI N/A) |
| Merge / deploy | **Not done** |

**Overall (scoped): PASS** — ready to merge/ship when Benjamin asks.

---

## AC 1–9

| AC | Result | Evidence |
|----|--------|----------|
| 1 Admin sees stats + logbook | **PASS** | UI: Benjamin `/admin` — Unique logins / Charts / Protocols cards + 14-day table + Logbook; discreet Header **Admin** link. API `test_ac1` |
| 2 Non-admin blocked | **PASS** | UI Dev Free: “Not allowed”; API actor_user_id=1 → **403** |
| 3 Login → event | **PASS** | Live Benjamin login → login total 4→5; logbook Login rows; `test_ac3` |
| 4 Chart calculate → event | **PASS** | Logbook Chart rows (live + backfill); `test_ac4` |
| 5 Protocol → event | **PASS** | Logbook Protocol rows; `test_ac5` |
| 6 Unique logins math | **PASS** | `test_ac6` (3 logins / 2 users) |
| 7 Week/month toggles | **PASS** | UI Day/Week/Month update numbers; `test_ac7` |
| 8 Empty / no crash | **PASS** | `test_ac8` empty day API; UI has rows (backfill) — no crash |
| 9 Event-write failure doesn’t break primary | **PASS** | `test_ac9` (UI N/A) |

Filters/pagination: Login/Chart/Protocol chips + day picker + Prev/Next verified in UI.

---

## Automated detail

- Tip `06363c1` on `feat/admin-usage`
- Admin user id=3; Dev Free id=1
- Stats sample (shared local DB after tests): Day 2026-10-22 UI showed unique logins 2, charts 5, protocols 5
- Rewrite `:3000/api/backend/health` **200**
- Parallel-suite flake on AC3 once (shared SQLite); solo full suite green

## Failures

**None** in scoped AC.

## Fix-first

_(empty — PASS)_

## Out of scope

Merge, Railway redeploy, full analytics, locking open `GET /users`, JWT.
