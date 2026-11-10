# Protocols complete-state pass — build brief

Signed off by Benjamin (PO) via Grok Bot on 2026-11-10 in his own words: “Yes, build the Protocols complete-state pass: sage wash on the Move card when complete, and drop the top Refresh button.”

## Intent
When every timed lead on Protocols is checked, the Today’s Move card should feel complete the same way Today does — sage wash on the card, not only a “nice work” line. Remove the always-visible top Refresh button, which usually looks like it does nothing.

## Current behavior
- Today (`frontend/src/components/TodayIndication.tsx`): the Move hero (`data-testid="main-action"`) gets `.today-move-achieved` when the Move is done. That class in `frontend/src/app/globals.css` is a growth/sage wash (`--growth-soft` plus a quiet radial). The “nice work” receipt sits on top of that wash.
- Protocols (`frontend/src/components/protocols/TodaysMoveCard.tsx`): the card stays `bg-elevated`. When `moveComplete` (all timed leads checked), a bordered “Today’s move complete — nice work” line appears (`data-testid="protocol-move-complete"`) but the card background does not change.
- The top Protocols control (`data-testid="refresh-protocol"`, label “Refresh”) in `frontend/src/app/biohack/page.tsx` calls `loadProtocol({ rebuild: true })`. The `rebuild` flag is a no-op (same path as the automatic load). Kit add/remove already reloads the plan. Error state already has Retry. Today has no equivalent button because it also just loads on open. A stable day/kit usually returns the same plan, so the button feels pointless.

## Build (FE-only)
- When `moveComplete` is true and there are timed-lead items, apply the existing `.today-move-achieved` class to the Protocols Today’s Move card (`data-testid="todays-move"`), same sage wash as Today. Do not invent a second wash.
- Keep the existing “Today’s move complete — nice work” copy, the complete flash/pulse, checklists, Do/Don’t, and Baseline kit as they are.
- Incomplete state stays as today (`bg-elevated`, no sage wash).
- Remove the always-visible top Refresh button (`data-testid="refresh-protocol"`). Do not replace it with a quieter reload in this pass.
- Keep Retry on protocol load errors.
- Kit add/remove already rebuilds the plan — leave that path alone.
- Do not change Today, backend/API, Dual prompt, Soul, Love gates, or plan-generation logic.
- Reuse `.today-move-achieved`. If unused i18n keys for the removed button can be cleaned up safely, do so; otherwise leave translations.

## Acceptance
- With all timed leads checked, the Protocols Move card uses the same sage wash as a completed Today Move hero (`.today-move-achieved`).
- With any timed lead still open, the Protocols Move card has no sage wash.
- “Today’s move complete — nice work” still appears when complete.
- The top Refresh button is gone from Protocols.
- Retry still appears and reloads when a protocol load errors.
- Adding or removing a kit item still rebuilds the plan.
- Today’s complete wash and behavior are unchanged.
- FE-only: Vercel only on ship (no Railway).

## Out of scope
A quieter manual reload; changing what the protocol API returns; Today page edits; backend or Railway.
