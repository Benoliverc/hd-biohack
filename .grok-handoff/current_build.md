# current_build — Protocols complete-state pass

- **Date:** 2026-11-10 (Asia/Hong_Kong)
- **Branch:** `feat/protocols-complete-state`
- **Worktree:** `/workspace/hd-biohack-wt-protocols-complete-state`
- **Base:** `4b7946d112ace84d7c64c91e1b5bc5dd8d4ee9ad` (main after #94 merge)
- **PR:** #95 — https://github.com/Benoliverc/hd-biohack/pull/95
- **Feature commit:** `19a7e30c184704154d49014fc37f87b983488540`
- **Tip SHA:** `58787aaac569ada2d1c93e791fe705066452f905`
- **Do not merge** until Benjamin yes after UX → Ship Gate.
- **Brief:** `.grok-handoff/protocols-complete-state-build-brief-2026-11-10.md`

## Intent
When every timed lead on Protocols is checked, the Today’s Move card should feel complete the same way Today does — sage wash on the card, not only a “nice work” line. Remove the always-visible top Refresh button.

## Approach (FE-only)
1. When `moveComplete` is true and there are timed-lead items, apply the existing `.today-move-achieved` class to the Protocols Today’s Move card (`data-testid="todays-move"`). Incomplete state stays `bg-elevated`. No second wash / no duplicated CSS.
2. Keep “Today’s move complete — nice work” (`data-testid="protocol-move-complete"`), the complete flash/pulse, checklists, Do/Don’t, and Baseline kit as they are.
3. Remove the always-visible top Refresh button (`data-testid="refresh-protocol"`). Do not replace it with a quieter reload in this pass.
4. Keep Retry on protocol load errors. Kit add/remove already rebuilds the plan — left alone.
5. Today, backend/API, Dual prompt, Soul, Love gates, and plan-generation logic unchanged.
6. Removed unused i18n keys `page.protocols.refresh` and `page.protocols.building` from all five locales (only used by the removed button).
7. Assert: `npm run assert:protocols-complete-state`.

## Deploy target
- **FE-only** → Vercel only on ship (no Railway / BE change).
- **Not merged. Not deployed.** Preview server not started.

## Files
- `frontend/src/components/protocols/TodaysMoveCard.tsx`
- `frontend/src/app/biohack/page.tsx`
- `frontend/src/lib/i18n/messages/en.ts`
- `frontend/src/lib/i18n/messages/nl.ts`
- `frontend/src/lib/i18n/messages/de.ts`
- `frontend/src/lib/i18n/messages/fr.ts`
- `frontend/src/lib/i18n/messages/es.ts`
- `frontend/scripts/assert-protocols-complete-state.mjs` (new)
- `frontend/package.json` (script)
- `.grok-handoff/protocols-complete-state-build-brief-2026-11-10.md`
- `.grok-handoff/current_build.md`

## Tests
- `./node_modules/.bin/tsc --noEmit` — exit 0
- `npx tsx scripts/assert-protocols-complete-state.mjs` — PASS
- `npx tsx scripts/assert-morning-ritual-option-a.mjs` — PASS
- `npx tsx scripts/assert-quiet-move-closure.mjs` — PASS
- `npx tsx scripts/assert-settled-day.mjs` — PASS
- `npx tsx scripts/assert-protocol-completions.mjs` — PASS
- `npx tsx scripts/assert-soul-dual-prompt.mjs` — ok
- `npx tsx scripts/assert-soul-last-selected.mjs` — ok
- `npx tsx scripts/assert-soul-chapter-map.mjs` — ok
- `npx tsx scripts/assert-i18n-settings-5-locales.mjs` — PASS (keys=307, parity ok)
- `./node_modules/.bin/next lint --file` on touched FE files — exit 0. Two pre-existing `react-hooks/exhaustive-deps` warnings in `biohack/page.tsx` at lines 280 and 405 (unchanged hook arrays on main @ `4b7946d`); not introduced by this pass. No new warnings or errors.

## Residual / pre-existing (not this pass)
- `npx tsx scripts/assert-today-protocols-ia.mjs` — FAIL: `transits/page.tsx missing quieter 'Conditioning notes'`. Same failure on unmodified main @ `4b7946d` (Today page not in scope; file unchanged). Not a regression from this PR.

## Preview
- Not started. No preview URL/port.

## Verify
1. With all timed leads checked, the Protocols Move card uses the same sage wash as a completed Today Move hero (`.today-move-achieved`).
2. With any timed lead still open, the Protocols Move card has no sage wash (`bg-elevated`).
3. “Today’s move complete — nice work” still appears when complete.
4. The top Refresh button is gone from Protocols.
5. Retry still appears and reloads when a protocol load errors.
6. Adding or removing a kit item still rebuilds the plan.
7. Today’s complete wash and behavior are unchanged.

## Out of scope
- A quieter manual reload
- Changing what the protocol API returns
- Today page edits
- Backend or Railway

## Open questions
- None for this build ticket.
