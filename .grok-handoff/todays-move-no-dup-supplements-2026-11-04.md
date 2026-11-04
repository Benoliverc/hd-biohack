# Today's Move — no duplicate supplements (2026-11-04)

## Ticket
Benjamin: “On today's move, don't say magnesium glycinate twice on one day, or any other supplement twice.”

## AC
1. Morning / Midday / Evening leads never repeat the same owned supplement in one HKT day (by `kit_supplement_id` or normalized display / `matched_as` name).
2. Hyper/Charged evenings that prefer magnesium must skip Mag if it already appeared earlier that day (pick another kit lead or a non-supplement behavior).
3. Sky rotation must not reintroduce a duplicate (rotation only swaps non-kit behavior micros today — verified; final safety pass still guards).
4. Protocols FE UI unchanged.
5. Regression test covers Magnesium Glycinate + multi-item kit across Hyper days.

## Root cause
In `backend/app/biohack/rules.py` `_pick_timed_supports`, `_note_kit(morning)` / `_note_kit(midday)` were indented **inside** the final `if morning is None:` / `if midday is None:` fallback blocks only. When a slot was filled earlier via `_kit_slot`, the kit id never entered `used_kit_ids`. Evening Hyper path then preferred magnesium again → Magnesium Glycinate twice. Stack fallback via `_plan_item` also often lacked `kit_supplement_id`, so name-level dupes could slip through.

## Fix
- Always call `_note_kit` after each slot is finalized (outside None-only indent).
- Track bare supplement names as well as kit ids; `_kit_slot` / stack fallback respect avoids; stack fallback attaches `kit_supplement_id` when bank-matched.
- Evening Hyper collide → behavior fallback; final cross-slot safety pass replaces any remaining duplicate with a behavior lead.
- `apply_sky_rotation` only rotates non-`in_inventory` behavior slots — cannot reintroduce kit dupes; left as-is.

## Tests
`cd backend && .venv/bin/pytest -q tests/test_kit_variety.py` → **14 passed** (includes `test_no_duplicate_supplement_across_morning_midday_evening`).

## Branch / PR
- Branch: `feat/todays-move-no-dup-supplements` (from clean `origin/main`; **not** based on #52 soul-behind-pro)
- Deploy: **API / Railway** (backend rules) + Vercel if needed for cache; FE untouched
- Hold merge for Benjamin yes → UX → Ship Gate (parent routes)

## Parallel
PR #52 Soul behind Pro still in flight separately.
