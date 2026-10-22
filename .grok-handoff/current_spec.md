# P0 — Today check-in: Energy + Preferred space → Main action

**Status:** Active — ready for `@dev`  
**Route:** `/transits` (nav **Today**)  
**App:** Baseline (hd-biohack)  
**Date:** 2026-10-22

## User story & business goal

As a Baseline user opening **Today** in the morning, I want to mark **how much energy I have** and **what kind of space I want**, so the page tells me **one main action** for the day instead of only showing sky tables.

## Functional requirements

1. On `/transits`, **above** “What to do today”, show a **Check-in** card with:
   - **Energy** (required): five labeled chips — `Drained` · `Low` · `Steady` · `Charged` · `Hyper` (store as `energy_level` 1–5).
   - **Preferred space** (required): five vernacular chips — `People` · `Alone` · `Nature` · `Focus corner` · `Out & about` (store enum: `people` | `alone` | `nature` | `focus` | `out`).
2. Completing **both** upserts one check-in for `(user_id, local_date)` and reveals a **Main action** card.
3. **Main action** is deterministic (no LLM, do **not** call Protocol generate as a side effect):
   - Energy 1–2 (Drained/Low): protect/recover — Type battery / downregulation language; suppress “push” sky framing.
   - Energy 3 (Steady): follow chart OS — prefer existing sky bullet #1, or last cached Protocol `top_actions[0]` if available.
   - Energy 4–5 (Charged/Hyper): use surplus carefully — Strategy-aligned do; **Hyper (5)** bias against stimulants / over-scheduling.
   - Preferred space appends a **micro-move** under the Main action (alone → 20 min without chat; people → highest-leverage convo early; nature → walk outdoors before screens; focus → back-to-wall / one entrance; out → errands near thresholds).
4. Show **exactly one** Main action + one-line **why** (energy + optional space). Sky bullets stay **secondary** below.
5. User can change energy or space same day; Main action updates; persist after reload.
6. Empty state: invite check-in; sky content still visible below. No chart: still allow check-in with generic battery + space micro-move.
7. Free-tier OK — no paywall on check-in. Informational tone only (no medical claims).
8. Persist in dedicated `daily_checkins` (or equivalent): `energy_level`, `preferred_space`, `main_action_text`, `main_action_why`, `timezone`, timestamps. Do **not** overload `user_biometrics_daily` wearable fields.

## UI / UX expectations

- **Empty:** “How’s your energy?” + 5 chips; “Where do you want to be?” + 5 chips; Main action hidden until both set.
- **Saving:** brief Saving… / optimistic UI OK.
- **Success:** selected chips + Main action title + why; optional secondary “Open Protocols” link (demote existing Protocol CTA).
- **Error:** inline retry; keep selections.
- Match Baseline sage/terracotta / existing card language; mobile-first (~30s check-in).

## Acceptance criteria (Given / When / Then)

1. **Given** I’m on Today with a chart, **when** I tap Steady + Alone, **then** I see one Main action and both selections persist after reload.
2. **Given** I set Drained, **when** Main action shows, **then** copy is recovery/protect oriented (not “push hard”).
3. **Given** I change space to Nature, **then** Main action or why updates in-session.
4. **Given** no Protocol generated, **then** check-in still works from sky/type rules only.
5. **Given** a free user, **then** check-in works without Pro unlock.
6. **Given** Hyper energy, **then** Main action does not encourage more stimulation / stacked commitments.

## Out of scope

- HD Variables calculator / Caves–Markets as primary UI  
- Wearable auto-readiness, history sparkline, streaks, notifications  
- Midday re-check, journaling notes, LLM rewrite  
- Regenerating full Protocol stacks from check-in  
- Separate mood valence (energy only)  
- Renaming Protocols’ “Today” section or nav IA  

## Implementation notes for `@dev`

- Primary files: `frontend/src/app/transits/page.tsx`, backend models/routes for check-in CRUD.
- Prefer server compute of main action so copy stays consistent; client-only OK if rules live in one shared module.
- After implement: hand to `@ui-ux` then `@qa` Ship Gate against this AC list; write `.grok-handoff/ship_gate_report.md`.
