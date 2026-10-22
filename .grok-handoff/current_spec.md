# P0 — Today HD indication: Energy + Space from natal × transit (no self-ask)

**Status:** Active — ready for `@dev`  
**Supersedes:** Self-report Energy/space chips (reverted; prior `current_spec` obsolete)  
**Route:** `/transits` (nav **Today**)  
**App:** Baseline (hd-biohack)  
**Date:** 2026-10-22

## User story & business goal

As a Baseline user opening **Today**, I want the app to **indicate** today’s energy level and preferred space from **my Human Design × today’s transits**, then give **one main action** — without asking me how I feel or where I want to be.

## Functional requirements

1. On `/transits`, **above** “What to do today”, show an **Indication** card (read-only):
   - **Energy today:** Drained · Low · Steady · Charged · **Hyper** (store/display `energy_level` 1–5)
   - **Space the chart points to today:** People · Alone · Nature · Focus corner · Out & about (`people` | `alone` | `nature` | `focus` | `out`)
   - **Main action** + one-line **why** + optional drivers (e.g. temporary Sacral via bridge)
2. Compute live from natal × transit overlay — **no user taps**, no `PUT /checkin` from UI.
3. Extend `GET /transits/today` (or `GET /today/indication`) with indication payload from pure `derive_today_indication(natal, transit, overlay)`.
4. **Energy banding (first match wins)** using `newly_defined_centers`, personal hanging-gate bridges, `MOTORS`:
   - **Hyper (5):** `|motor_new| ≥ 2` and Root ∈ motor_new; OR sacral_borrowed ∧ root_borrowed; OR sp_borrowed ∧ root_borrowed
   - **Charged (4):** single Sacral or Heart borrow; OR ≥2 personal bridges with a motor; OR Generator/MG personal bridge into defined Sacral
   - **Drained (1):** Root pressure/borrow without Sacral fuel, and (Sacral natal-open OR Type Projector/Reflector)
   - **Low (2):** mind-only newly defined (Head/Ajna); OR Projector/Reflector with quiet personal sky
   - **Steady (3):** default
5. **Preferred space (first match)** — vernacular proxies only (no Variables engine):
   1. Reflector → `out`
   2. G newly defined / open G + G bridge → `nature`
   3. Head or Ajna newly → `focus`
   4. SP borrowed (natal open) → `alone`
   5. SP newly + natal defined → `people`
   6. Root newly, Sacral not → `nature`
   7. Sacral borrow/bridge → `out`
   8. Throat personal bridge → `people`
   9. Projector quiet sky → `alone`
   10. Manifestor → `alone`
   11. else Generator/MG → `focus`
6. Main action: reuse/extend `compute_main_action` — Low bands protect; Steady = sky #1 or Strategy; Charged/Hyper = Strategy surplus; Hyper adds anti-stim / no stack. Append space micro-move. Type/Authority **never** “change” in copy (borrowed energy is temporary).
7. No natal: transit-safe Steady/Charged only + CTA to save chart; never claim personal bridges.
8. Free tier; informational disclaimer (“chart weather,” not biometric/medical).

## UI / UX expectations

- Read-only highlighted energy + space chips (not question UI — no “How’s your energy?”).
- Main action hero; sky “What to do today” secondary below.
- Loading / error / no-chart states; match Baseline visual language.

## Acceptance criteria

1. Given saved natal on Today, when page loads, then Energy + Space + Main action appear with **no user tap**.
2. Given natal Sacral open + personal bridge newly defines Sacral, then Charged or Hyper; why says temporary/borrowed Sacral — never “you are a Generator today.”
3. Given Root newly defined, Sacral not, natal Sacral open (or Projector/Reflector), then Drained + protect Main action.
4. Given only Head/Ajna newly defined, then Low + space `focus`.
5. Given Reflector, then space `out` (per priority table).
6. Given Hyper, then Main action includes anti-stim / anti-stack language.
7. Given no natal, then safe indication + save-chart CTA; no crash.
8. Given free user, then indication works without Pro.
9. Given prior self-report UI, when this ships, then question chips are gone.

## Out of scope

- Full Variables / Environment Color (Caves–Shores)  
- Self-report energy/space questions or user override  
- Wearables, streaks, notifications, midday re-ask  
- Protocol regenerate / LLM rewrite  
- Claiming Type/Authority changes with transit  
- Medical/fatigue diagnosis language  

## Files (expected)

- `backend/app/checkin/derive.py` (or `hd/today_indication.py`) + extend `checkin/rules.py`
- `backend/app/api/routes.py`, `schemas.py`, `backend/tests/test_checkin.py`
- `frontend/src/components/TodayCheckIn.tsx` → indication-only; `transits/page.tsx`; `lib/api.ts`
- Update `backlog.md` when Ship Gate passes
