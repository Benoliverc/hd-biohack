# Current build — PR 1 Today transit→protocol (engine & join)

## OPEN — hold merge for Benjamin yes
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/65
- **Branch:** `feat/today-transit-protocol`
- **Tip:** `baceafe` (`baceafe1993af67a1ffc5af3e699984654ec1f31`)
- **Base:** `origin/main` @ `3b986a3` (post PR #64)
- **Scope:** PR 1 of two — Transit → Moment → Move + kit slot on Today. **Not** Share cards (PR 2).
- **Worktree:** `/workspace/hd-biohack-wt-today-transit`
- Softs muted (Stripe, PWA, pushes, leftover i18n nits)

## What shipped in this PR
- Deterministic prescription engine: `backend/app/checkin/prescription.py`
  - Driver → moment (same priority as `_energy_band`)
  - Move ≤20 words, plain English, driver-specific
  - Kit line via `kit_variety.pick_kit_lead` (Pro); Free/empty → muted placeholder
  - When = kit slot or moment default; dose only from inventory notes
  - Pro down-rank after ~14 days of `today-move:*` history
- `derive_today_indication` always attaches prescription fields
- `/transits/today?user_id=&preview_as_free=` joins kit + entitlement + history
- Today UI: Move + From your kit + When + I-did-it taps (`today-kit-line`, `today-kit-placeholder`, `today-when`, `today-move-done`, `today-kit-done`)
- i18n EN/NL/DE/FR/ES for new copy
- Completions reuse `protocol_completions` with item ids `today-move:{moment}` / `today-kit:{id}`

## Tests
- `backend/tests/test_today_prescription.py` — ALL PASS
- `backend/tests/test_checkin.py` — ALL PASS
- `backend/tests/test_kit_variety.py` — ALL PASS
- FE `tsc --noEmit` clean; `next lint` exit 0 (pre-existing hook warnings only)

## Next
- UX review → Ship Gate → **wait for Benjamin merge yes**
- Do **not** start PR 2 until PR 1 merges
