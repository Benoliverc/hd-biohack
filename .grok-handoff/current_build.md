# current_build — Love guidance language pass

- **Date:** 2026-11-10 (Asia/Hong_Kong)
- **Branch:** `feat/love-guidance-language`
- **Worktree:** `/workspace/hd-biohack-wt-love-guidance-language`
- **Base:** `5621ee0740b4f392ea9a36fc5174a167e76f751f` (main after #97 merge)
- **Tip SHA:** this handoff stamp cannot contain its own SHA — lock on GitHub `headRefOid` after push
- **Do not merge** until Benjamin yes after UX → Ship Gate.
- **Later ship:** Vercel AND Railway together (not this step).
- **Brief:** `/workspace/reports/love-guidance-language-build-brief-2026-11-10.md`
- **Proposal evidence (read-only):** `/workspace/reports/love-guidance-language-proposal-2026-11-10.md`

## Intent
When Love is open, the first screen answers “what does this mean for us, and what should we try?” in words the reader could say out loud tonight. Translate the meaning; do not thin it out or add therapy-speak. This is the next language-and-structure pass after #97, not a redo of contrast / tease / insets / ink.

## Approach (FE + BE, same PR)
1. **[FE] One open heading; closed-row title only.** When Love is open, the only display heading is “You & {name}” / “You two.” `SoulChapterCard` hides the row title via `hideTitleWhenOpen`. “Partner mode · Love guidance” stays on the closed row only. Dropped the `sr-only` duplicate and the “not a score, not a verdict” line.
2. **[FE] No inner fold-outs; locked section order; one heading each.** Flattened to one open chapter: hook (no heading; optional `the_current` fold-in under it, no heading), How you decide, How you talk, How you love / How {name} loves, Where you click / Where it scrapes, When it’s hard. Dropped “The current,” “Decide & talk,” stacked decide titles, “Harmony and friction” / “Where you harmonize,” and literary hard subheads. A leftover decide title is folded into the body if it is not already there.
3. **[FE] Body-size Try.** Shared `TryLine` uses `type-body` + `text-fg` (visible semibold “Try” label), not `type-caption`. Reading text stays on solid `bg-elevated` insets. #97 copper wash, primary ink, and mid-word-safe tease are unchanged.
4. **[BE] Everyday rewrite of the Love banks.** Rewrote in-scope copy in `partner_insights.py`, `partner_love_dynamics.py`, and `partner_names.py`. Meaning first; Type-as-person subjects when types differ; no reader-facing “lanes,” “tracks” (as atmosphere), “multi-track,” “life-force,” “gut engines,” or “the current.” Channel nuance asides were left alone (out of scope).
5. **[BE] Names when the chart can tell who is who.** Type-pair hooks, talk, and clash use Type-as-person subjects so personalization becomes “Achi…” / “You….” Decide sides are assigned at apply time from `auth_a` / `auth_b` when known and different — not guessed from Type. Same or unknown authority stays two-sided (“one of you” / “you both”). Same-Type, MG-before-Generator, nameless Type path, and Me = you are unchanged. Mid-sentence “tell you first” is natural (not “tell You first”).
6. **[BE] When it’s hard is one why + one Try.** FE renders only the clash why + clash Try (falling back to `try_this` if needed). Literary subheads are gone. Type-pair clash copy was rewritten so the same ache is not told four times.

## Locked Achi / Alex meanings
- **Achi** (You = Projector, Achi = Manifesting Generator, emotional|sacral): hook, decide (assigned from authorities), talk, how-you / how-Achi-love, and when-it’s-hard why + Try are locked with exact-string tests in `test_partner_names.py`.
- **Alex** (You = Generator, Alex = Manifestor): hook and talk (including “tell you first”) are locked with exact-string tests. Mixed authority in that fixture still assigns from `auth_a` / `auth_b`.
- **sacral|sacral** stays two-sided and shared, with the signed-off wording and Try; names are not forced.
- A swapped-authority control (Projector sacral, MG emotional) proves sides follow `auth_a` / `auth_b`, not Type.
- Nameless path keeps Type-as-person wording on the same meanings.

## AC coverage
- Item 1: yes (open heading, closed-row title only, no sr-only duplicate, no “not a score” line).
- Item 2: yes (no inner fold-outs, locked order, one heading per section, click/scrape groups).
- Item 3: yes (body-size Tries in primary ink; #97 wash / insets / tease kept).
- Item 4: yes (everyday bank rewrite; banned atmosphere terms tested on Love banks).
- Item 5: yes (Type-as-person hooks/bodies; authority assignment; same-Type / nameless / agreement kept).
- Item 6: yes (one why + one Try on When it’s hard).
- Achi / Alex locked meanings: yes (tests).

## Keep (not regressed)
Copper-amber partner-mode wash from #96/#97; first names when available; Me stays “you”; Types as secondary labels on the type line; nameless Type path; Partner gate; Remove as Partner as shipped in #96; same-Type disambiguation; MG-before-Generator replacement; mid-word-safe closed tease; #97 primary ink and solid elevated insets; Inter and body-first roles except Love Tries raised to body size; no scores / verdicts / soulmate language as a product rule; personalization agreement from #97.

## Out of scope (untouched)
Friend-mode chapters, picker/aside, Chart, Signature, Playbook outside Love, Dual prompt, last-selected, dropdown order, Mark/Remove as Partner (kept as shipped), post-unmark Love linger, channel nuance asides, new features, Valentine pink/red, re-washing the rest of Soul, changing Inter, the body-first role scale (except Love Tries), the Partner gate, or the copper-amber identity.

## Deploy target
- **FE + BE** → Vercel + Railway on a later ship (not this step).
- **Not merged. Not deployed.** Preview server not started.

## Files
### BE
- `backend/app/hd/partner_insights.py`
- `backend/app/hd/partner_love_dynamics.py`
- `backend/app/hd/partner_names.py`
- `backend/tests/test_partner_names.py`
- `backend/tests/test_soul_sync.py`

### FE
- `frontend/src/app/soul/page.tsx`
- `frontend/src/components/soul/PartnerOverviewCard.tsx`
- `frontend/src/components/soul/SoulChapterCard.tsx`
- `frontend/scripts/assert-love-guidance-language.mjs` (new)
- `frontend/scripts/assert-love-guidance-readability.mjs` (retargeted; #97 ink/wash/tease kept)
- `frontend/scripts/assert-soul-chapter-map.mjs` (retargeted off inner subchapters / disclaimer)
- `frontend/scripts/assert-soul-names-partner-mode.mjs` (closed-row title only)
- `frontend/package.json` (language assert script)

### Handoff
- `.grok-handoff/current_build.md`

## Tests
- `cd backend && PYTHONPATH=. python -m pytest tests/test_partner_names.py tests/test_soul_sync.py -q` — 49 passed
- `./node_modules/.bin/tsc --noEmit` (frontend) — exit 0
- `./node_modules/.bin/eslint` on `soul/page.tsx`, `SoulChapterCard.tsx`, `PartnerOverviewCard.tsx` — exit 0, no warnings or errors
- `npx tsx scripts/assert-love-guidance-language.mjs` — ok
- `npx tsx scripts/assert-love-guidance-readability.mjs` — ok
- `npx tsx scripts/assert-soul-names-partner-mode.mjs` — ok
- `npx tsx scripts/assert-soul-chapter-map.mjs` — ok
- `npx tsx scripts/assert-soul-dual-prompt.mjs` — ok
- `npx tsx scripts/assert-soul-last-selected.mjs` — ok

Known pre-existing (not regressions; not touched): `react-hooks/exhaustive-deps` in `biohack/page.tsx`; `assert-today-protocols-ia.mjs` quieter Conditioning notes already on main.

## Preview
- Not started. No preview URL/port.

## Open questions
- None. No deviations from the locked brief.

## Verify
1. Open Love: the only display heading is “You & {name}” / “You two.” “Partner mode · Love guidance” is on the closed row only. No sr-only duplicate, no “not a score” line.
2. No inner fold-outs. Order is hook, How you decide, How you talk, How you love / How {name} loves, Where you click / Where it scrapes, When it’s hard.
3. Each section is a short why plus a body-size Try in primary ink on elevated insets. Contrast and copper wash from #97 remain.
4. Achi (Projector + MG, emotional|sacral) and Alex (Generator + Manifestor) match the locked meanings. Nameless path still uses Type-as-person wording. Me stays “you.”
5. Decide sides follow `auth_a` / `auth_b` when known and different, not Type. sacral|sacral stays shared and two-sided.
6. When it’s hard is one why + one Try.
