# Handoff — Soul Signature copy + Playbook differentiation + Badge descriptions (P0)

## Status
- Ready for Ship Gate / `@qa` after PR review
- Branch: `feat/soul-signature-copy-playbooks`
- Spec: `.grok-handoff/soul-signature-copy-playbooks.md`
- Base: `main` @ PR #19 Magnetic EM fix

## What changed
1. **Layer A** — 5 signature subtexts ~3× longer; Magnetic `tier: "highest"` / `tier_label: "Highest signature"` + FE chip.
2. **Layer B** — `description` (1–3 sentences) on all 8 badge ids; FE stacks label + description (not tooltip-only); short `detail` kept as mechanic crumb.
3. **Layer C** — `PLAYBOOK_LEDES` 5×3 matrix + `build_playbook_lede`; `SoulPlaybookOut.lede` / `focus_hint`; FE callout above cards; helper copy rewritten (no “reorder only”).
4. Secondary signature shows first-sentence subtext under “Also:”.

## Do not change (verified)
- `detect_signatures` priority / predicates
- `MAGNETIC_EM_MIN = 5`
- Badge detection predicates
- No Fit % fields

## Files
- `backend/app/hd/soul_sync.py`
- `backend/app/schemas.py`
- `backend/tests/test_soul_sync.py`
- `frontend/src/lib/api.ts`
- `frontend/src/app/soul/page.tsx`
- `.grok-handoff/soul-signature-copy-playbooks.md`, `backlog.md`, `current_build.md`, `soul-aura-alchemy-spec.md` (short amend)

## Verify
```bash
cd backend && .venv/bin/python -m pytest tests/test_soul_sync.py -q   # 20 passed
cd frontend && npx tsc --noEmit                                       # clean
```

## Smoke (prod pairs after merge)
1. Me↔K → Magnetic Alchemy + Highest chip + long subtext; Life/Work/Play ledes differ.
2. Me↔Achi → Integrated Flow; different lede set than Magnetic.
3. Me↔Test → Catalytic Growth; badge descriptions visible without hover.

## Awaiting
Ship Gate → merge → Railway + Vercel redeploy (FE+API paired).
