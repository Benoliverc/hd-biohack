# Handoff — Soul Playbook: remove Life/Work/Play tabs (P0)

## Status
- Ready for Ship Gate / PO review
- Branch: `feat/soul-playbook-no-context-tabs`
- Spec: user ask 2026-10-23 — remove Life & Intimacy / Work & Co-Creation / Play & Recovery under Playbook for now
- Base: `main` @ PR #21 (`bd2cde8`)

## What changed
1. **Soul Playbook UI** — Removed Life / Work / Play context tab buttons. Single Playbook heading + short helper: “Playbook guidance for this pair…”.
2. **Fixed context** — FE always sends `context: "life"` (`PLAYBOOK_CONTEXT`). No `setContext` / switching.
3. **Cards** — Order from API `playbook.card_order`, fallback `LIFE_CARD_ORDER` (life). Lede / focus_hint / signature / badges / spectrums unchanged.
4. **Copy** — Dropped Life/Work/Play switching and “reorders cards” language in helper + conditioning strip.

## Do not change (verified)
- Signature detection, badge predicates, Magnetic threshold (backend untouched)
- Backend still accepts `context`; FE just always sends `life`

## Files
- `frontend/src/app/soul/page.tsx`
- `.grok-handoff/current_build.md`

## Verify
```bash
cd frontend && npx tsc --noEmit
```

## Smoke (after merge)
1. Open `/soul` with Me + friend → no Life/Work/Play tabs.
2. Signature, badges, spectrums, life lede, and cards still render.
3. Friend switch still refreshes sync; Chart flows untouched.

## Awaiting
Ship Gate → merge → Vercel FE redeploy.
