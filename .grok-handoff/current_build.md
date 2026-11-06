# Soul Love guidance — current build

**Ticket:** Soul partner Love guidance (human language + standout UI)
**Handoff:** handoffs/soul-love-guidance-2026-11-06.md
**Branch:** feat/soul-love-guidance
**Worktree:** /workspace/hd-biohack-wt-soul-love-guidance
**Base SHA:** b3ede0d6c13708aa6cfc4f5618dfee5bcf1acbbc
**Tip SHA:** `b7e6f0225a6aebad025966b760786cd95b0d8edc`
**PR:** (opening)
**Preview:** http://127.0.0.1:3016/soul (port 3016)
**Deploy:** BE+FE — Vercel AND Railway after Benjamin yes (do not deploy from this PR open)
**Gates:** UX UI Review → Ship Gate QA → Benjamin yes. No standing auto-ship.

## Scope
When Person is labeled partner, Soul top-of-playbook becomes a Love guidance reading (hook, the current, how you/they love, what this asks, tender spots, try this) with copper/energy chrome. Channel nuances use The gift in love / The tender spot. Mechanics unchanged. Legacy API keys kept as aliases.

## Files changed
- backend/app/hd/partner_insights.py
- backend/app/schemas.py
- backend/tests/test_soul_sync.py
- frontend/src/lib/api.ts
- frontend/src/components/soul/PartnerOverviewCard.tsx
- frontend/src/components/soul/PartnerNuanceBlock.tsx
- frontend/src/app/soul/page.tsx

## Untouched (parallel daily-return)
- TodayIndication.tsx, hdFactOfTheDay.ts, novelty.py, derive.py, protocolCompletions.ts, TodaysMoveCard.tsx, WeatherStrip.tsx
- /workspace/hd-biohack/.grok-handoff/current_build.md (not overwritten; this ticket writes soul-love-guidance-current_build.md there)

## Tests
- pytest tests/test_soul_sync.py — 28 passed
- frontend tsc --noEmit — clean
- Gold Gen+Projector + Intimacy 59-6 exact match verified
- All Type pairs rewritten; all channel nuances rewritten; aliases populated

## Open questions for UX/QA
- Partner first name is derived from chart label first token (no separate first_name on natal_charts). Confirm that is enough for "You & {FirstName}" / "How {Name} loves".
- Confirm copper/energy wash reads well in both light and dark, and is clearly distinct from Aura Signature without looking Valentine.
