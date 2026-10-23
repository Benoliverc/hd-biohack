# Handoff — Protocols kit visibility P0

## Status
- Ready for Ship Gate / PO review
- Branch: `feat/protocols-kit-visibility`
- Specs: `.grok-handoff/protocols-inventory-ux-critique.md` + `.grok-handoff/protocols-inventory-ux-research.md`
- Base: `main` @ `6316b1c` (PR #24)

## What changed (FE-only)
1. **From your kit** badge on Today’s Move timed rows when `in_inventory` — passed through `checkItems` → `TodaysMoveCard`. No badge on pure behaviors.
2. Always-visible **Your kit · N · Edit/Add items** strip under Weather (empty CTA + starter chips).
3. **Kit status toast outside panel** after add/remove rebuild (`Plan updated · …` / `Kit updated · …` / `Removed …`).
4. **Stopped** `setInventoryOpen(false)` on every protocol set — panel stays open mid-edit.
5. `sanitizeWhy` drops “prefer what you already own” on unowned rows; panel title renamed **Your kit**.
6. Nice: empty-strip starters; footnote when all timed leads are behaviors and kit is non-empty.

## Do not change (verified)
- No BE ranking / P1.1 Zinc vs Omega-3
- No schema, Natal redesign, Today `/transits`, Soul

## Files
- `frontend/src/app/biohack/page.tsx`
- `.grok-handoff/protocols-inventory-ux-critique.md`
- `.grok-handoff/protocols-inventory-ux-research.md`
- `.grok-handoff/current_build.md`

## Verify
```bash
cd frontend && npx tsc --noEmit
```

## Smoke notes (logic)
| Fixture | Expect |
|---------|--------|
| Struggle + Zinc only | AM Zinc + **From your kit** badge |
| Empty kit | Strip CTA + starters; no false kit badges on behaviors |
| Add Zinc with plan loaded | External toast + AM flip; panel **not** yanked shut |
| Low / Quiet-start day | Behavior row has **no** kit badge |

## Pair
- Vercel FE only (API unchanged)
