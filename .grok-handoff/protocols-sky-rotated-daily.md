# Handoff — Protocols A: Sky-rotated daily protocol (visible delta)

**Date:** 2026-10-27 (Asia/Hong_Kong)  
**Branch:** `feat/protocols-sky-rotated-daily`  
**Base:** `main` @ `4f83913`  
**Do not open a PR** until Ship Gate / Benjamin says so.  
**Leave alone:** `feat/power-dynamics-unique-copy`, `feat/protocols-prove-it-checklist` (@ `070dbf9`).

---

## Intent

Keep daily Protocols. Make day-to-day difference obvious under the same Daily Novelty Contract as Today (≥1 new HKT-day signal; reset at 07:00 Asia/Hong_Kong).

User-visible:
- Clear **What’s new vs yesterday** chip on WeatherStrip
- `vs_yesterday` pills (from indication / `/transits/today`)
- TodaysMoveCard callout + **New vs yesterday** badge on the rotated timed lead
- Relative countdown to HKT 07:00 reset unchanged (`formatResetsInHkt`)

---

## What shipped

### Backend
- `backend/app/biohack/sky_rotation.py` — lead fingerprint, novelty micros keyed by `daily_signal.source`, `apply_sky_rotation` (rotate ≤1 non-kit slot when fingerprints match; prefer midday → evening → morning; never thrash kit→kit; if all kit, force a midday behavior).
- `build_protocol(..., yesterday_lead_fingerprint=)` applies rotation; returns `whats_new`, `lead_fingerprint`, `natural_lead_fingerprint`; embeds `daily_plan.whats_new`.
- `POST /biohack/protocol` now uses HKT 07:00 buckets + `prev_transit` / `prev_overlay` like `/transits/today` so `indication.daily_signal` / `vs_yesterday` match Today.
- Accepts optional `yesterday_lead_fingerprint` from FE; if missing, recomputes D−1 natural leads as fallback.
- `ProtocolRequest.yesterday_lead_fingerprint`.

### Frontend
- Persist post-rotation fingerprint: `hd-biohack:protocol-leads:v1:{user}:{chart}:{hktDay}`.
- Pass yesterday’s fingerprint into `api.protocol`.
- WeatherStrip: what’s-new chip + vs-yesterday pills; countdown stays.
- TodaysMoveCard: what’s-new block; badge on `rotated_slot`.

### Tests
- `backend/tests/test_sky_rotation.py` (fingerprint, force rotate, no-force, anti-whiplash, all-kit, build_protocol).
- Existing `test_protocols_redesign.py` still green.

---

## UX (what to look for)

1. Open **Protocols** with a saved self chart + Pro unlock.
2. Weather strip shows Energy / Space / **What’s new…** chip / “Resets in ~N hours”.
3. If Today has vs-yesterday deltas, same pills appear under the chip.
4. Today’s Move shows a “What’s new vs yesterday” blurb; if server forced a rotation, a timed row may carry **New vs yesterday**.
5. Refresh same HKT day → same fingerprint persisted; leads should not thrash kit items.

---

## Verify steps

```bash
cd backend && .venv/bin/python tests/test_sky_rotation.py
.venv/bin/python tests/test_protocols_redesign.py
# optional: hit POST /biohack/protocol with yesterday_lead_fingerprint equal to
# response.natural_lead_fingerprint and assert whats_new.forced_rotation === true
```

Manual: Protocols page with network tab — body includes `yesterday_lead_fingerprint` after day 2; response has `protocol.whats_new`.

---

## Risks / follow-ups

- **Quiet sky weeks:** continuity micros are mild by design; chip still shows.
- **First visit / cleared storage:** server D−1 natural fingerprint fallback; may differ from a prior forced rotation until FE has one saved day.
- **prevHkDayKey** uses wall −24h, not “previous novelty bucket”; near midnight HKT edge cases rely on server fallback.
- **Double build_protocol** on route when FE omits fingerprint (D and D−1) — acceptable cost; cache later if needed.
- **Merge with C:** prove-it checklist lives on another branch; merge order C then A (or rebase A onto C) when shipping both.
- Does **not** change Power Dynamics or checklist UX.

---

## Out of scope
- No PR
- No weekly spine (Proposal B)
- No prove-it checklist (Proposal C — already on its branch)
