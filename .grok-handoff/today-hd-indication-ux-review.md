# UX review — Today HD indication (feat/today-hd-indication @ 725addd)

**Date:** 2026-10-22 (Asia/Hong_Kong)  
**Route:** `/transits`  
**Verdict:** **FAIL** — do not Ship Gate yet  
**Shots:** `/workspace/hd-biohack-ui-failures/ux-review-2026-10-22/today-indication/`

## Confirmed OK
- Read-only Energy + Space chips (`span` listitems, `aria-current`); no self-ask / no “How’s your energy?”
- Card above “What to do today”; chart-weather disclaimer present (not medical)
- Free tier still shows full card (AC8); no-chart gets Steady/Charged + save CTA (no crash)
- Mobile 375: chips wrap, no horizontal overflow

## High (block Ship Gate)
1. **Space selected contrast** — `text-energy-ink` on `bg-energy/30` ~2.9:1 (12px on mobile needs 4.5:1). Match Energy: solid soft fill + darker ink (not 30% wash).
2. **Why + drivers unreadability** — `text-xs text-fg-muted` on `growth-soft` ~2.85:1. Use `text-sm text-fg-secondary` (or equivalent ≥4.5:1).

## Medium
3. Unselected chips: `text-fg-muted` on sunken ~2.9:1 → `text-fg-secondary`.
4. Disclaimer: `text-xs text-fg-muted` → `text-sm text-fg-secondary`.
5. Why copy restates chips/action; drivers are jargon with no label. One plain “because” sentence; gate/center notes secondary or labeled.
6. “Open Protocols” ~16px text link in hero (<44px). `min-h-11` or move out of hero.
7. No-chart: Sun theme `(50.3)` not “Gate 50 · line 3”; Save natal chart asked 3× (banner + driver + button). One primary CTA; spell gates like sky section.

## Low / polish
- Order is action → micro → why; spec prefers action → why → micro (micro currently outranks why visually).
- Selected ring makes chips look tappable; Hyper alone on row 2 at 375.
- Loading = text only; save-chart `min-h-10` (40px).

## Design notes (not blocking if High/Medium fixed)
- Space selected must match Energy solid-soft pattern — contrast defect, not taste.
- Live theme is Linen light default; retest if Basalt/Ink dark ships later.

## Next
1. `@dev` fix High + Medium on `feat/today-hd-indication`
2. Re-ping `@ui-ux` for re-verify
3. Only then `@qa` Ship Gate vs AC 1–9
