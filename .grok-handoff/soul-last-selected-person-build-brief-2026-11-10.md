# Soul last-selected person open — build brief

Signed off by Benjamin (PO) via Grok Bot on 2026-11-10 in his own words: “Yes, build Soul last-selected person open.”

## Intent
When Soul opens, show the person the user last picked on Soul, instead of defaulting to the first person in the list (which currently feels alphabetical).

## Current behavior
`frontend/src/app/soul/page.tsx`: `pickDefaultFriend` returns the first `friend` slot in `personOptions`, else `others[0]`. On load, if there is no in-memory `friendId`, that default wins. The picker `<select>` is not reordered. Charts list API is `order_by(NatalChart.id.desc())`.

## Build (FE-only)
- Persist the last person the signed-in user selected on Soul, per account, in the browser (e.g. localStorage keyed by user id).
- Write it when the person changes (picker change). Keep an existing in-session selection if that person is still in `personOptions`.
- On load / when options refresh: if the remembered id is still in `personOptions`, open that person.
- If the remembered person is gone (deleted or no longer a selectable person): fall back to a marked Partner if one exists in `personOptions`, then anyone else (`pickDefaultFriend` or equivalent).
- Dropdown order stays as-is for this pass. Do not change Chart, Dual prompt copy, Mark as Partner, Love gates, or backend/API.
- No cross-account leak: key storage by user id; ignore a stored id that does not belong to the current options.

## Acceptance
- Fresh visit to `/soul` with a remembered, still-saved person opens that person, not the first list row.
- Changing person, leaving Soul, and returning opens the one just picked.
- If the remembered person is removed, Soul opens a marked Partner if present, otherwise another remaining person, and does not break the empty / add-person state.
- Switching accounts does not open the previous account’s last person.
- Existing Dual prompt, Mark as Partner, and Love-only-when-Partner behavior unchanged.
- FE-only: Vercel only on ship (no Railway).

## Out of scope
Reordering the dropdown; server-side last-selected; syncing last-selected across devices; Chart person pickers.
