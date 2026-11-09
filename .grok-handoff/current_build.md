# Kit supplement daypart slots — current build

**Branch:** `fix/kit-supplement-daypart-slots`  
**Worktree:** `/workspace/hd-biohack-wt-kit-timing`  
**Tip:** `9cb5138cdde46cc891519c2538d6f7cdb611ab5b`
**PR:** [#92](https://github.com/Benoliverc/hd-biohack/pull/92)
**Base:** `338433fea46093954fd8dd3be2a6c29d84930f4b` (main @ PR #91 merge)  
**Scope:** **BE-only** → Railway on ship (no Vercel)

## Problem (Benjamin)

> In protocol it recommends glycine in the morning but also mentions evening. Spirulina in evening which should be a morning supplement. All not right.

## Root cause

`kit_variety.pick_kit_lead` allowed **off-slot** bank actions at a score discount (`score - 2`) so multi-item kits could rotate. That placed evening-only glycine into **Morning** (with `when`/`line` still Evening / “before bed”) and morning-only spirulina into **Evening** (with `when` still Morning). FE only displays BE fields — no FE rewrite needed.

## Fix

Hard-exclude actions whose `moments.slots` is non-empty and does not include the requested daypart. Empty slots = anytime (none in current bank). Bank entries unchanged (no new medical copy/doses).

## Files

- `backend/app/biohack/kit_variety.py` — hard slot filter + docstring
- `backend/tests/test_kit_variety.py` — glycine/spirulina + general single-slot regressions
- `.grok-handoff/current_build.md` — this brief

## Tests

```bash
cd backend && python -m pytest tests/test_kit_variety.py tests/test_today_prescription.py tests/test_protocols_redesign.py -v
```

- `test_kit_variety.py`: **17 passed** (incl. 3 new)
- `test_today_prescription.py` + `test_protocols_redesign.py`: **20 passed**

## Ship

- Open PR → UX → Ship Gate → Benjamin merge-yes
- Deploy: **Railway only** (BE)
- Softs muted

## Open questions

None. Soft polish from prior PRs not touched.
