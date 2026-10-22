# Ship Gate — Today check-in (scoped)

**Verdict: PASS** (scoped to Today check-in AC 1–6 only — not a full-product gate)  
**Branch:** `feat/today-checkin` @ `d42c091` (impl polish `975e99e`)  
**Preview:** http://127.0.0.1:3000/transits  
**Spec AC:** `.grok-handoff/current_spec.md`  
**UX review:** `.grok-handoff/today-checkin-ux-review.md` (UX PASS; Medium micro-move polish applied)  
**Gate time:** 2026-10-22 ~10:56 HKT (Asia/Hong_Kong)  
**Shots:** `/workspace/hd-biohack-ui-failures/ship-gate-2026-10-22/today-checkin/`

---

## Summary

| Area | Result |
|------|--------|
| pytest (full) | **PASS** — 16/16 |
| pytest (`test_checkin.py`) | **PASS** — 8/8 |
| Health + `/api/backend` rewrite | **PASS** |
| Check-in API + rules (no Protocol generate) | **PASS** |
| UI AC 1–6 | **PASS** |
| trycloudflare | not used (local preview) |

**Overall (scoped): PASS** — ready to ship when Benjamin asks.

---

## 1. Git tip

| Check | Result |
|-------|--------|
| Branch | `feat/today-checkin` |
| HEAD | `d42c091` |
| Impl polish | `975e99e` — space micro-move on own line + chip polish |

---

## 2. pytest

| Suite | Result |
|-------|--------|
| Full backend | **16 passed** in 0.11s |
| `tests/test_checkin.py` | **8 passed** |

---

## 3. Live APIs

| Step | Result |
|------|--------|
| `GET /health` | **200** |
| `GET :3000/api/backend/health` | **200** rewrite ok |
| `PUT /checkin` Steady+alone / Drained+alone / Hyper+nature | **200**; `main_action_micro` own field; title has no ` · ` micro |
| `GET /checkin/today?user_id=1&local_date=2026-10-22` | **200** persists |
| Protocol generate on check-in | **none** — `compute_main_action` + read-only cache only |

---

## 4. UI AC 1–6 (browser)

Preview hard-refreshed as **Dev Free (free)**. Check-in above “What to do today”.

| AC | Result | Evidence |
|----|--------|----------|
| 1 Steady + Alone → Main action; persist after reload | **PASS** | Title Sun theme (50.3); micro own line “Carve 20 minutes without chat.”; reload restores Steady/Alone; GET `/checkin/today` only |
| 2 Drained → protect/recover, not push | **PASS** | “Downshift… rest between bursts”; why “protect and recover” |
| 3 Change space → Nature updates in-session | **PASS** | Micro → “Walk outdoors briefly before screens pile up.”; why Space: nature; PUT 200 |
| 4 No Protocol generate required | **PASS** | Only PUT/GET checkin; no POST `/biohack/protocol` |
| 5 Free tier, no Pro unlock | **PASS** | Enforce paywall on → “Free tier”; check-in still saves; no upgrade dialog |
| 6 Hyper → no more stim / stacked commitments | **PASS** | “Skip extra stimulants and stacked commitments…” |

**Polish:** micro-move is its own line under the title (not ` · ` on the title). Why still ends with ` · Space: …` (space tag in why — observation only, not a fail).

Shots: `steady-alone.png`, `persist-after-reload.png`, `drained.png`, `nature-change.png`, `hyper.png`, `free-no-paywall.png`

---

## Failures

**None** in scoped AC.

## Fix-first ordered list

_(empty — PASS)_

## Out of scope (not gated)

Full product, wearables, Protocol redesign, dark theme, trycloudflare.
