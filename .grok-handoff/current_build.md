# current_build — Love guidance readability pass

- **Date:** 2026-11-10 (Asia/Hong_Kong)
- **Branch:** `feat/love-guidance-readability`
- **Worktree:** `/workspace/hd-biohack-wt-love-guidance-readability`
- **Base:** `163ea6fdb66dff3f9da0a9fc64d740a462b82280` (main after #96 merge)
- **Tip SHA:** this handoff stamp cannot contain its own SHA — lock on GitHub `headRefOid` after push
- **Do not merge** until Benjamin yes after UX → Ship Gate.
- **Later ship:** Vercel AND Railway together (not this step).
- **Brief:** `/workspace/reports/love-guidance-readability-build-brief-2026-11-10.md`

## Intent
Partner-mode Love guidance should be much easier to read and understand. Keep the chapter identity from #96 (title “Partner mode · Love guidance,” deepened copper-amber wash, first names when available, Remove as Partner). Fix hierarchy, contrast, length, restatement, and broken name agreement.

## Approach (FE + BE, same PR)
1. **[FE] One title, one lead, no third accordion.** When the Love chapter is open, the chapter row is the only “Partner mode · Love guidance” title (sr-only remains for a11y). Lead is “You & {name}” / “You two,” then a short hook in `type-section` at `text-fg`. Dropped “The current between you.” Flattened “Decide & talk” (no inner AccordionPanel). Four one-open subchapters remain. Inner card sits transparent on the chapter wash (no second wash). Closed tease uses `truncateLoveTease`: first sentence if it fits, otherwise a mid-word-safe cut.
2. **[FE] Primary ink; contrast on the copper wash.** All primary reading in this chapter uses `type-body` + `text-fg` (hook uses `type-section` + `text-fg`). Type line and “not a score” caption sit on solid `bg-elevated` insets in `text-fg`. Try-lines have a visible semibold “Try” label and caption-size primary ink. Love chapter / subchapter chevrons use `text-energy-ink`, not `fg-muted`. Deepened `.soul-love-guidance-wash` / `.soul-love-guidance-chapter` mixes from #96 are unchanged. Reading text sits on solid `bg-elevated` insets.
3. **[BE] Shortened Love banks.** Hooks are one or two short sentences, all ≤96 characters (no mid-word tease cut). Lead paragraphs prefer two short sentences / ~40 words, meaning-first. “How you talk” is two beats (`body` + `voice`), not one fused paragraph. Try-lines are one concrete action, shorter, and still use `Generator:` / `Projector:` prefixes where both people are addressed so named copy becomes `You:` / `Sarah:`.
4. **[FE+BE] How-you / how-they lead “The current.”** A short current paragraph, then the two columns. Love-bank lines are two short sentences without stacked mid-sentence glosses. When a name exists, `how_you_love` says “Sarah feels that love when…” instead of “The person next to you.” Nameless `how_they_love` is now third person (“They love by…”) so the heading and body agree. Harmony / friction subchapter is labeled “Harmony and friction” (no middot splice), with shorter meaning-first cards. “When it's hard” no longer nests “When things get hard.” Hook, current, columns, asks, tender, and clash no longer each retell pace / invitation / gut.
5. **[BE] Personalization agreement.** After “the Type” becomes “you,” leftover their/them/they in that sentence (until the partner is named) become your/you. Hook Type-pair closers such as “in a Generator with a Projector” become “for you and Sarah.” Locked with tests. They/them as the partner pronoun may stay. Same-Type rules, MG-before-Generator replacement, and the nameless Type path are unchanged.

## AC coverage
- Item 1: yes (title/lead/accordion/tease).
- Item 2: yes (primary ink, Try label, chevrons, wash kept, solid elevated insets).
- Item 3: yes (shortened banks, talk split, try length).
- Item 4: yes (columns as lead, less restatement, plainer harmony label, no nested hard heading).
- Item 5: yes (agreement + pair-closer tests).

## Keep (not regressed)
First names when available; Me = you; Types as secondary labels; nameless Type path (shorter wording, same meaning); Partner gate; chapter title “Partner mode · Love guidance”; copper-amber identity and deepened wash from #96; Mark / Remove as Partner as shipped in #96 (`renameChart(id, label, "person")` only).

## Out of scope (untouched)
Friend-mode chapters, picker/aside, Chart, Signature, Playbook outside Love, last-selected, Dual prompt, post-unmark Love linger, channel nuance asides, new features, re-washing the rest of Soul, Inter / body-first role scale, Partner gate.

## Deploy target
- **FE + BE** → Vercel + Railway on a later ship (not this step).
- **Not merged. Not deployed.** Preview server not started.

## Files
### BE
- `backend/app/hd/partner_names.py`
- `backend/app/hd/partner_insights.py`
- `backend/app/hd/partner_love_dynamics.py`
- `backend/tests/test_partner_names.py`
- `backend/tests/test_soul_sync.py`

### FE
- `frontend/src/app/soul/page.tsx`
- `frontend/src/components/soul/PartnerOverviewCard.tsx`
- `frontend/src/components/soul/SoulChapterCard.tsx`
- `frontend/src/lib/api.ts` (`voice` optional on `SoulLoveGuidanceSection`)
- `frontend/scripts/assert-love-guidance-readability.mjs` (new)
- `frontend/scripts/assert-soul-names-partner-mode.mjs` (retargeted title/wash asserts)
- `frontend/package.json` (assert script)

### Handoff
- `.grok-handoff/current_build.md`

## Tests
- `cd backend && PYTHONPATH=. python -m pytest tests/test_partner_names.py tests/test_soul_sync.py -q` — 42 passed
- `./node_modules/.bin/tsc --noEmit` (frontend) — exit 0
- `./node_modules/.bin/next lint --file` on `soul/page.tsx`, `SoulChapterCard.tsx`, `PartnerOverviewCard.tsx`, `lib/api.ts` — exit 0, no warnings or errors
- `npx tsx scripts/assert-love-guidance-readability.mjs` — ok
- `npx tsx scripts/assert-soul-names-partner-mode.mjs` — ok
- `npx tsx scripts/assert-soul-chapter-map.mjs` — ok
- `npx tsx scripts/assert-soul-dual-prompt.mjs` — ok
- `npx tsx scripts/assert-soul-last-selected.mjs` — ok

Known pre-existing (not regressions; not touched): `react-hooks/exhaustive-deps` in `biohack/page.tsx`; `assert-today-protocols-ia.mjs` quieter Conditioning notes already on main.

## Preview
- Not started. No preview URL/port.

## Verify
1. Open Love chapter: title “Partner mode · Love guidance” appears once (the chapter row). Lead is “You & {name}” or “You two” plus a short hook in primary ink.
2. “The current between you” is gone. “Decide & talk” shows both blocks with no inner accordion.
3. Closed tease does not cut mid-word.
4. Reading text is primary ink on solid elevated insets and meets contrast on the copper wash in Linen and Basalt. Try-lines have a visible “Try” label. Chevrons are not muted.
5. The deepened copper-amber wash from #96 remains (not pink/red, not friend-mode elevated).
6. Named copy agrees (your/you, not leftover their/them pointing at you). Hook Type-pair closers personalize or drop. Nameless path still uses Type-as-person wording (shorter; “They love by…”).
7. Love still appears only when the selected person is marked Partner. Mark / Remove as Partner unchanged.

## Out of scope
Friend-mode chapters, picker / aside chrome, Chart, Signature, Playbook lines outside this Love chapter, Dual prompt, last-selected person, dropdown order. Mark as Partner / Remove as Partner (keep as shipped in #96). Love lingering for one re-sync after unmark. Partner nuance asides on Channels / gates. New product features. Valentine pink / red. Re-washing the rest of Soul. Changing Inter, the body-first role scale, the Partner gate, or the copper-amber partner-mode identity.

## Open questions
- None for this build ticket.
