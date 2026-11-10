# current_build — Soul names and partner-mode pass

- **Date:** 2026-11-10 (Asia/Hong_Kong)
- **Branch:** `feat/soul-names-partner-mode`
- **Worktree:** `/workspace/hd-biohack-wt-soul-names-partner-mode`
- **Base:** `2e823b7a4ed5fe39ee1e0947dc0d4978631f2f1b` (main after #95 merge)
- **PR:** #96 — https://github.com/Benoliverc/hd-biohack/pull/96
- **Feature commit:** `ca28ca350a26ad620e51f92a4cecbbbb0677f44e`
- **Tip SHA:** this handoff stamp cannot contain its own SHA — lock on GitHub `headRefOid` after push
- **Do not merge** until Benjamin yes after UX → Ship Gate.
- **Brief:** `.grok-handoff/soul-names-partner-mode-build-brief-2026-11-10.md`

## Intent
Soul should talk about people by first name, not by Type, when a real first name is on the chart. You should be able to remove a Partner tag from Soul itself. Love guidance should be unmistakably partner-mode — title “Partner mode · Love guidance” and a deeper copper-amber wash, still not pink or red.

## Approach (FE + BE)
1. **Names at apply time.** Source banks stay type-keyed. `partner_names.py` personalizes built Love guidance / dynamics / in-scope Playbook lines when the person chart has a usable first name (same rule as `partnerFirstNameFromLabel`: first token; ignore Friend / Partner / Person / Me). Me stays “you.” Longer Type names (Manifesting Generator / MG) are replaced before Generator. Same-Type pairs are not globally rewritten — only unambiguous “the other {Type}” plus `how_they_love`. Nameless / role-label charts keep today’s gold Type wording exactly.
2. **`how_they_love`** is rewritten about the partner (“Sarah loves by…”) when a name exists. `how_you_love` stays second person from `TYPE_LOVE_BANK`. Try-line prefixes become “You:” / “Sarah:”.
3. **Remove as Partner** on Soul when the selected person is already Partner. Calls existing `api.renameChart(id, label, "person")` only — clears the tag, does not delete them or change the label. Same person stays selected; last-selected storage is unchanged. Inline error + control re-enabled, matching Mark as Partner. Love guidance hides and the Mark prompt returns once role is `person`.
4. **Partner-mode chapter.** Title (closed shell + open card heading) is “Partner mode · Love guidance.” Deeper copper-amber wash on this chapter only: `.soul-love-guidance-chapter` on the energy-accented shell and a deeper `.soul-love-guidance-wash` on the open card. Friend-mode chapters and the rest of Soul are not re-washed. Not pink or red.

## Deploy target
- **FE + BE** → Vercel + Railway on a later ship (not this step).
- **Not merged. Not deployed.** Preview server not started.

## Files
### BE
- `backend/app/hd/partner_names.py` (new)
- `backend/app/hd/partner_insights.py`
- `backend/app/hd/soul_sync.py`
- `backend/tests/test_partner_names.py` (new)
- `backend/tests/test_soul_sync.py` (gold-path friend labels that asserted type wording now use a reserved “Partner” label)

### FE
- `frontend/src/app/soul/page.tsx`
- `frontend/src/components/soul/SoulChapterCard.tsx`
- `frontend/src/components/soul/PartnerOverviewCard.tsx`
- `frontend/src/app/globals.css`
- `frontend/scripts/assert-soul-names-partner-mode.mjs` (new)
- `frontend/package.json` (script)

### Handoff
- `.grok-handoff/soul-names-partner-mode-build-brief-2026-11-10.md`
- `.grok-handoff/current_build.md`

## Tests
- `cd backend && PYTHONPATH=. pytest tests/test_partner_names.py tests/test_soul_sync.py -q` — 39 passed
- `./node_modules/.bin/tsc --noEmit` (frontend) — exit 0
- `./node_modules/.bin/next lint --file` on `soul/page.tsx`, `SoulChapterCard.tsx`, `PartnerOverviewCard.tsx` — exit 0, no warnings or errors
- `npx tsx scripts/assert-soul-names-partner-mode.mjs` — ok
- `npx tsx scripts/assert-soul-last-selected.mjs` — ok
- `npx tsx scripts/assert-soul-dual-prompt.mjs` — ok
- `npx tsx scripts/assert-soul-chapter-map.mjs` — ok

## Preview
- Not started. No preview URL/port.

## Verify
1. With a usable first name on the person chart, Love guidance (and in-scope Playbook / nuance lines) refer to them by name, not “the Manifestor” / “the Generator” / etc. “You” still reads as “you.”
2. “How {name} loves” is about them, not leftover “You love…”.
3. Same-Type pairs stay unambiguous (you vs their name).
4. With no usable name (Friend / Partner / Person / Me / empty), Type wording matches today.
5. Types still appear as secondary labels (existing type line).
6. Remove as Partner appears when the selected person is Partner; it only clears the tag; Love hides; Mark as Partner returns; the person stays selected and is not deleted.
7. The Love guidance chapter is titled “Partner mode · Love guidance” and uses a deeper copper-amber wash than today, clearly distinct from friend-mode chapters, and not pink or red.
8. Love guidance still appears only when the person is marked Partner.

## Out of scope
- Aura Signature titles and hooks
- Dual prompt empty-state copy
- Dropdown order / last-selected persistence
- Scoring or soulmate language
- Chart’s Person / Partner save control
- A new unmark API
- Re-washing the whole Soul page
- Valentine pink / red

## Open questions
- None for this build ticket.
