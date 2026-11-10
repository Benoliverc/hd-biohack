# current_build — Soul last-selected person open

- **Date:** 2026-11-10 (Asia/Hong_Kong)
- **Branch:** `feat/soul-last-selected-person`
- **Worktree:** `/workspace/hd-biohack-wt-soul-last-selected`
- **Base:** `a8849913029cbbea7d5dcc5d392a0499b794a6a6` (main after #93 merge)
- **PR:** pending (do not merge until Benjamin yes after UX → Ship Gate)
- **Tip SHA:** pending push
- **Brief:** `.grok-handoff/soul-last-selected-person-build-brief-2026-11-10.md`

## Intent
When Soul opens, show the person the user last picked on Soul, instead of defaulting to the first person in the list (which currently feels alphabetical).

## Approach (FE-only)
1. New helper `frontend/src/lib/soulLastSelected.ts` — localStorage key `hd-biohack:soul-last-person:{userId}`; read/write; `pickSoulOpenPerson`.
2. Open order: in-session selection if still in `personOptions` → remembered id if still in options → marked Partner if present → `pickDefaultFriend` (first friend slot, else first remaining). Empty options stay empty.
3. Write on picker change only, keyed by signed-in `user.id`. Account switch drops in-session id (`lastUserIdRef`) and reads the new account's key.
4. Dropdown order, Dual prompt, Mark as Partner, Love gates, Chart, and backend unchanged.
5. Assert: `npm run assert:soul-last-selected`.

## Deploy target
- **FE-only** → Vercel only (no Railway / BE change).

## Files
- `frontend/src/lib/soulLastSelected.ts` (new)
- `frontend/src/app/soul/page.tsx`
- `frontend/scripts/assert-soul-last-selected.mjs` (new)
- `frontend/package.json` (script)
- `.grok-handoff/soul-last-selected-person-build-brief-2026-11-10.md`
- `.grok-handoff/current_build.md`

## Tests
- `./node_modules/.bin/tsc --noEmit` — exit 0
- `npx tsx scripts/assert-soul-last-selected.mjs` — ok
- `npx tsx scripts/assert-soul-dual-prompt.mjs` — ok
- `./node_modules/.bin/next lint --file src/app/soul/page.tsx --file src/lib/soulLastSelected.ts` — no warnings or errors

## Verify
1. Fresh `/soul` visit with a remembered, still-saved person opens that person, not the first list row.
2. Change person, leave Soul, return — opens the one just picked.
3. Delete the remembered person — opens a marked Partner if present, otherwise another remaining person. Empty / add-person state still works.
4. Switch accounts — does not open the previous account's last person.
5. Dual prompt, Mark as Partner, and Love-only-when-Partner unchanged. Dropdown order unchanged.

## Out of scope
- Reordering the dropdown
- Server-side last-selected / cross-device sync
- Chart person pickers
- Dual prompt copy / Mark as Partner / Love gates / backend

## Open questions
- None for ship.
