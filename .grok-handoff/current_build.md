# Handoff — Home reflects shipped Baseline (P0)

## Status
- Ready for Ship Gate / PO review
- Branch: `feat/home-reflect-ships`
- Specs: `.grok-handoff/home-reflect-ships.md` + `.grok-handoff/home-reflect-ux-critique.md` (UX PASS)
- Base: `main` @ `0ab5c13` (PR #25)

## What changed (FE-only)
1. Hero eyebrow → `Baseline · chart · sky · move`; has/no-chart H1/sub + CTAs from UX copy bank (sky, not gates).
2. Loop line under sub: `Chart → Today’s sky → Today’s Move → Soul`.
3. Continue strip CTA → solid growth **Open Protocols** → `/biohack` (no Generate); micro `Auto-loads from today’s sky · Refresh rebuilds`.
4. Outcome grid → 4 cards (`sm:grid-cols-2 lg:grid-cols-4`): Chart, Today, Protocols (**Today’s Move** + kit), Soul (**Aura between you**, Sparkles).
5. Blueprint / Today / Protocols copy rewritten per bank (You+friends, indication-first, kit — not inventory/stacks).
6. `layout.tsx` description mentions Soul / kit lightly.
7. Test ids kept: `home-calculate-chart`, `home-view-protocols`.

## Do not change (verified)
- Header nav, feature pages, API, paywall, Railway
- Trust line kept
- Destinations only `/profile` `/transits` `/biohack` `/soul`

## Files
- `frontend/src/app/page.tsx`
- `frontend/src/app/layout.tsx`
- `.grok-handoff/home-reflect-ships.md`
- `.grok-handoff/home-reflect-ux-critique.md`
- `.grok-handoff/current_build.md`

## Verify
```bash
cd frontend && npx tsc --noEmit
```
- tsc: green
- Grep page.tsx: no Generate / inventory (UI) / Your plan / stacks / gates-only framing

## Smoke notes (for PO)
| Case | Expect |
|------|--------|
| has-chart | Continue **Open Protocols** solid growth; no Generate; 4 cards incl Soul |
| no-chart | Calculate primary; See today’s sky; no continue strip |
| CTAs | `/profile` `/transits` `/biohack` `/soul` |
| Copy | Today’s Move, kit, You-only, no Fit % |

## Pair
- Vercel FE only (no Railway / API)
- Do not merge until Ship Gate
