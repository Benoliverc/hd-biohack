# Handoff — Soul Playbook card copy deepen (P0)

## Status
- Ready for Ship Gate / PO review
- Branch: `feat/soul-playbook-deeper-copy`
- Spec: `.grok-handoff/soul-playbook-card-copy-2x.md` + user ask 2026-10-23
- Base: `main` @ `5f0dd0b` (PR #22 merged)

## What changed
1. **How You Wire Together** (`circuit_bridge`) — ~2× every bridge body + Quiet wiring empty; each block adds feel + one Habit.
2. **Tailored Somatic Playbook** (`somatic_playbook`) — ~2× sacral hygiene, profile resonance (6/2+5/1 + generic), double emotional (+ channel extras), Easy pacing empty.
3. **Spark & Glue** (`spark_glue`) — essay (2–4 sentences) + `Channels:` / `On this pair:` cites for EM / Companionship / Dominance; richer Quiet field empty.
4. **Tests** — `test_playbook_card_copy_deepened` asserts essay length + channel cites preserved.

## Do not change (verified)
- `detect_signatures`, `MAGNETIC_EM_MIN`, badge predicates, card ids/order, FE structure, `power_dynamics` bodies

## Files
- `backend/app/hd/soul_sync.py` (`build_cards`)
- `backend/tests/test_soul_sync.py`
- `.grok-handoff/current_build.md`

## Verify
```bash
cd backend && pytest tests/test_soul_sync.py -q
```

## Before → After (Magnetic Intimacy ≈ Me↔K)

### Spark (Electromagnetic)
**Before:** `Intimacy (6-59)`  
**After:** Catalytic-chemistry essay + recovery/pace guidance, then `Channels: Intimacy (6-59)`.

### Kinetic Execution Bridge (Structuring+Charisma EM fixture)
**Before:** `They wire deep intuition into physical action and experience.`  
**After:** Feel (momentum / embodied next step) + Habit (15-minute same-day move).

### Sacral / Non-Sacral Aura Hygiene
**Before:** ~37 words (reactor + 30–60 min wind-down).  
**After:** ~70+ words — overstimulation vs life force, both-sides protection, Habit wind-down without reading as rejection.

## Smoke (after merge)
1. `/soul` Me↔K Magnetic → Spark & Glue reads as essay with channel cites (not bare list).
2. Wire + Somatic bodies visibly longer; no Fit % / dating chrome.
3. Signature / badges / spectrums unchanged.

## Awaiting
Ship Gate → merge → Railway API redeploy (FE unchanged).
