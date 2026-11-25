# Current build: Chart Snapshot clarity pass

- **Date:** 2026-11-25 (Asia/Bangkok, UTC+7)
- **Brief:** `/workspace/reports/baseline-chart-snapshot-clarity-pass-build-brief-2026-11-25.md`, sha256 `7c5948cac1c523db8c8ca8468ae9a52ceae63db7a309ce6204708d6918374c02` (verified before build)
- **Go:** Benjamin, 1:51 PM Bangkok, 25 Nov 2026: "Go — build the Snapshot clarity brief against main 497a750." This approves the build only. It is not a merge yes.
- **Base:** main `497a7506b3ccedcce94e3c2d58d2ff5209dde59b` (origin/main verified after fetch)
- **Branch:** `feat/chart-snapshot-clarity-pass` (worktree `/workspace/hd-snapshot-clarity`)
- **Code commit:** `a67ca6622fc937edac799d27a122a0706e966202`. The PR tip is the handoff commit on top of it. Take the exact tip from `gh pr view`.
- **Ships:** frontend only, Vercel only. No backend, env, schema, lockfile, or Railway changes.

## What changed (all on /profile #snapshot)
1. **Strategy merged into How you decide.** The `snapshot-strategy` box is removed.
   - Collapsed: `How you decide: {authority} · {strategy}`, with the locale label and English values.
   - Body, in order:
     - **Strategy** subhead, then the locked short copy
     - **Authority** subhead, then `AUTHORITY_PLAIN` (unchanged)
     - the Emotional + respond connector (default 5 only)
     - the time-unknown caveat
     - `Read more in Deep dive`, which jumps to `#deep-dive`
2. **Label-first titles.** `ChartDisclosure` renders `<label>: <value>`: label semibold, value `font-medium text-growth`. The Type box title is now `Type: Projector`, or `Kenji · Type: Projector` for someone else. The essay, Preview and placement are unchanged.
3. **Short copy.** The new `frontend/src/lib/essays/snapshotShortCopy.ts` holds 5 strategies × 5 locales, 5 definitions × 5 locales and the connector × 5, taken verbatim from the brief tables. A programmatic check found 0 diffs against the brief, and every string is within 80 words / 500 chars. Snapshot no longer renders `ChartSummaryLearnMore` / `learnMore`.
4. **Animation.** `ChartDisclosure` opens and closes with a ~220ms Web Animations height and opacity animation. Under `prefers-reduced-motion: reduce` it uses the native instant toggle. The Type box has no animation.
5. **Layout.** Profile and How you decide stay in the `sm:grid-cols-2` row. Centers to watch is full width. Definition is full width below it, with the short copy and the Deep dive pointer.
6. **i18n.** New keys `chart.people.authority` ("Authority" in all locales) and `chart.people.readMoreInDeepDive` (the locked pointer strings), so catalog parity holds. `chart.bodygraphModule.typeDetails` is kept but no longer shown. "Type" is a literal English feature name, like the Deep dive `title="Type"`.

## Files
- `frontend/src/components/ChartDisclosure.tsx`
- `frontend/src/components/ChartTypeBox.tsx`: title order only
- `frontend/src/app/profile/page.tsx`: #snapshot only. The #bodygraph card sha `b5a68485…` is unchanged.
- `frontend/src/lib/essays/snapshotShortCopy.ts` (new)
- `frontend/src/lib/i18n/messages/{en,de,es,fr,nl}.ts`: +2 keys each
- `frontend/package.json`: adds the `assert:chart-snapshot-clarity-pass` script only. Lockfile untouched.
- Asserts:
  - new: `scripts/assert-chart-snapshot-clarity-pass.mjs`
  - updated: `assert-chart-snapshot-strategy-definition.mjs`, `assert-chart-bodygraph-revert.mjs`, `test-chart-bodygraph-revert-interactions.cjs`, `assert-day5-top5-fixes.mjs` (item m)

Frozen, and byte-identical to 497a750 (pinned in the new assert):
- `hdCopy.ts`, `hdCopy.es.ts`, `hdCopy.nl.ts`
- `strategySummaryOverlay.ts`
- `ChartDeepDive.tsx`
- `ChartSummaryLearnMore.tsx`
- `BodyGraph.tsx`

## Preview
- `http://127.0.0.1:3163`, started by `/workspace/day7-tools/start-snapshot-clarity.sh` (log `/workspace/day7-tools/snapshot-clarity-3163.log`). Production build of this branch.
- It uses the local API on :8159 (day7.sqlite, invented accounts only). :3159 and :3161 are left running.

## Tests
- `tsc --noEmit`: clean.
- `next lint`: 0 errors, 6 warnings. Main also has 6 warnings.
- `next build`: OK.
- 62 PASS across 61 `assert:*` scripts plus the revert-interactions test.
  - `today-protocols-ia` is red as expected, with the same failure as main ("transits/page.tsx missing quieter 'Conditioning notes'").
  - `day7-five-fixes` and `chart-snapshot-strategy-definition` are green. The #147 MG Deep dive summaries are still pinned.
- **Browser** (Playwright, headless): 11 runs × 320/375/390/desktop, plus 375 with reduced motion.
  - Charts: Generator/Sacral; Projector/Splenic; MG/Emotional in en/de/fr/es/nl; Manifestor/Emotional; Reflector/Lunar/None; Projector/Emotional (Noor, p9); MG/Sacral (Theo, p10).
  - `check-captures.mts`: 0 failures. It checks titles, the 44px minimum, overflow, the open/close animation and reduced-motion instant, locked copy equality, connector placement, the pointers, and the pointer jump.
- Evidence: `/workspace/reports/chart-snapshot-clarity-pass-2026-11-25/` (README.md, snapshot-matrix.md, copy-limits.tsv, screenshots).

## Open questions
1. `chart.bodygraphModule.typeDetails` is now unused in the UI but kept in all five catalogs, and the bodygraph-revert assert still requires it. Should a later cleanup remove it?
2. The Snapshot copy has no English fallback. If `chart_json` ever returns a strategy or definition outside the official five, the body shows the raw value (the same fallback pattern as before).
3. ES "To Respond (then inform)" is 61 words. That is inside the 80-word cap but one over the 35–60 target. It is locked verbatim from the brief.
