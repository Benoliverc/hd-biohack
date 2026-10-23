# Handoff — Today always uses You / Me natal (P0)

## Status
- Ready for Ship Gate / PO review
- Branch: `feat/today-you-profile-only`
- Spec: `.grok-handoff/today-you-profile-only.md`
- Base: `main` @ PR #20 (`9d01287`)

## What changed
1. **Today (`/transits`)** — Resolves **You** (`slot_kind !== "friend"`) via `api.charts`; calls `transitsToday(youChart?.id)` only. Locked **You** chip + “Today is for you” / “Always your natal — friends stay on Chart & Soul.” Nudges sticky to self when entering Today; clears friend sticky if no self.
2. **Store hydrate** — Prefer sticky **only if self**; else any self row; else `null` (never bind friend as natal). `NatalChartSummary.slot_kind` optional.
3. **Chart delete rebound** — After delete, rebound to **self** with `bindStore: true`; if no self, edit friend with `bindStore: false` and clear natal sticky.

## Do not change (verified)
- Soul friend picker / Soul API
- Indication scoring math
- No friend picker on Today

## Files
- `frontend/src/app/transits/page.tsx`
- `frontend/src/lib/store.tsx`
- `frontend/src/app/profile/page.tsx`
- `.grok-handoff/today-you-profile-only.md`, `current_build.md`

## Verify
```bash
cd frontend && npx tsc --noEmit
```

## Smoke (after merge)
1. Me + friend; Chart select friend → Today still You chip + self overlay.
2. DevTools set sticky to friend id; reload `/transits` → still You.
3. Newest chart = friend; reload Today → still You.
4. Soul friend pick still works; Chart Me/Friend edit intact.
5. No self (friends only) → Today sky-only / save-You CTA, not friend-as-you.

## Awaiting
Ship Gate → merge → Vercel FE redeploy.
