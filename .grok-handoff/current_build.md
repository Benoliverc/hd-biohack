# Handoff — Protocols redesign P0 (“do the sky”)

## Status
- Ready for Ship Gate / PO review
- Branch: `feat/protocols-redesign-p0`
- Specs: `.grok-handoff/protocols-redesign-p0.md` + `.grok-handoff/protocols-ux-critique.md`
- Base: `main` @ `6ea2eed` (PR #23)

## What changed
1. **Auto-load** today’s protocol on `/biohack` enter (Refresh = rebuild). No Generate-as-empty happy path.
2. **Weather strip** — Energy / Space / as-of / Sun-Earth + sky cite; indication from shared `derive_today_indication` (FE also fetches `/transits/today` for parity with Today).
3. **Today’s Move hero** from indication `main_action_*`; **3 timed supports** (AM/MD/PM) from energy × bridge/newly defined × owned inventory first. Daylight / caffeine / magnesium demoted to **Baseline kit**.
4. **Checkable Today list** (hero + AM/MD/PM) with localStorage persistence keyed by user+chart+Asia/Hong_Kong day.
5. **Weekly theme fix** — uses `weekly_macro_theme.summary` (Sun/Earth). Week surface = **1 theme + 1 sky note** only.
6. **You-only** chart on Protocols (mirror Today PR #21); locked You chip.
7. **Natal baseline** collapsed by default when a day plan exists.
8. **Tests** — two fixture days (Logic vs Struggle) → different hero and/or timed leads; theme assertion; indication embed.

## Do not change (verified)
- No second energy model; no wearables/streaks/ApoE4/LLM dependency; Soul untouched; free-tier paywall unchanged; disclaimer stays.

## Files
- `backend/app/biohack/rules.py`
- `backend/app/api/routes.py`
- `backend/tests/test_protocols_redesign.py`
- `frontend/src/app/biohack/page.tsx`
- `frontend/src/lib/api.ts`
- `.grok-handoff/protocols-redesign-p0.md`
- `.grok-handoff/protocols-ux-critique.md`
- `.grok-handoff/current_build.md`

## Verify
```bash
cd backend && .venv/bin/pytest tests/test_protocols_redesign.py -q
cd frontend && npx tsc --noEmit
```

## Smoke (fixtures)
| Day | Energy | Hero (prefix) | Morning lead |
|-----|--------|---------------|--------------|
| Logic (4-63) Head/Ajna | Low | Downshift: one Sacral yes… | Quiet start — protein + no messages first |
| Struggle (28-38) Spleen | Steady | Temporary energy in Spleen… | Zinc (pulse) (owned) |
