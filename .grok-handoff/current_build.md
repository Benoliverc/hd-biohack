# Current build — feat/soul-partner-insights

- **Branch:** feat/soul-partner-insights
- **Base:** origin/main @ 8817d38abc1621917fef4f0aadad3ac96f3aa24a (PR #71 merge)
- **Tip:** `73e220b4dffa5c294a870ab3de80524a7b065829` (PR head; includes docs tip-sync commits after feature a4865fb)
- **Worktree:** /workspace/hd-biohack-wt-soul-partner
- **Preview:** not started (no deploy; PR only)

## Files (summary)
- backend/app/hd/partner_insights.py (new) — Type×Type overviews + channel nuances
- backend/app/hd/soul_sync.py — apply partner layer after scoring
- backend/app/models.py, database.py — natal_charts.role column (default person)
- backend/app/schemas.py — role on BirthDataIn / SoulPersonOut; partner_overview models
- backend/app/api/routes.py — persist role; pass friend role into soul sync; charts list
- backend/tests/test_soul_sync.py — partner / non-partner / forbidden-copy tests
- frontend/src/lib/api.ts, store.tsx — role + partner types
- frontend/src/components/soul/PartnerOverviewCard.tsx, PartnerNuanceBlock.tsx
- frontend/src/app/soul/page.tsx — overview above hero; completed channels; nuance
- frontend/src/app/profile/page.tsx — Person | Partner control

## Tests
- backend: `pytest tests/test_soul_sync.py` → 26 passed
- frontend: `tsc --noEmit` → clean
- Forbidden-word grep on partner copy: clean

## Product confirms
- Existing Soul mechanics unchanged (scoring, signatures, badges, essays)
- Romantic layer only when friend.role === partner (BE emit + FE guard)
- Existing people default to person
- Free/Pro people-gate unchanged; You locked to Me
- Generator+Projector + 59-6 copy verbatim (ASCII apostrophes)

## Open questions / deviations
- Schema migration follows repo pattern (`_ensure_natal_chart_columns` ALTER), not Alembic (repo has no alembic versions).
- Channel nuances cover all 36 CHANNELS; Type×Type covers all 15 unordered pairs including same-type.
- Split-bridge rows may receive partner_nuance by channel name when partner (additive; body_blocks unchanged).
