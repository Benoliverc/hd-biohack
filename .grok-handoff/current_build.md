# Official UX B1 follow-up — Centers help only

- **Date:** 25 Nov 2026, Asia/Bangkok (UTC+7).
- **Amended brief SHA256:** `79f682861a01a04def9e18a948ea647d32019b648bbcd342b7116aa018b878c1`; read fully. Preflight confirmed main `aab6a29fd943b81a3dda1bb1e1339adcc0e83c7b` and PR #150 head `8c3b65d1f94b874d3d0a8dff47eded12281cfa64` with clean worktree.
- **Branch/PR:** `feat/chart-snapshot-panel-fixes`, https://github.com/Benoliverc/hd-biohack/pull/150. This is a follow-up commit, not an amendment of history. Exact current head is available via `gh pr view 150 --json headRefOid`.
- **Scope:** only the third-person Centers help caption, using the existing `snapshotPersonName` gate. Five locked strings in `snapshotOtherPersonCopy.ts`; self caption remains the original catalog key. Tips unchanged. No NL/ES closer edits, no backend/env/schema/lockfile changes. Accepted Hermit/Valleys typo corrections and +4px offset remain unchanged.
- **Regression:** expanded `assert:chart-snapshot-panel-fixes` with all five locked help strings, unchanged self strings, person/self/person and EN/ES/EN language sequences, help + tips voice checks and page gate wiring. PASS. Clarity-pass and Environment asserts PASS (frozen bytes unchanged). Lint 0 errors / 6 existing warnings; typecheck and production build PASS.
- **UI evidence:** 390×844 headless Playwright, invented local Mira/Juno only, preview :3167 / API :8167. Actual settings selector EN→ES→DE→FR→NL→EN; each locale person→self→person→self using Chart chips. 24/24 PASS: exact help text and no mixed second-person/other-person voice in help or tips. Preview left running.
- **Evidence:** `/workspace/reports/snapshot-panel-fixes-2026-11-25/b1/` — `switching.json`, ten locale/view screenshots, `playwright.log`, `assert.log`, `clarity.log`, `environment.log`, `lint.log`, `typecheck.log`, `build.log`, `evidence.md`. Repro script: `/workspace/pw-tools/day7/snapshot-centers-b1.cjs`.
- **Verification caveat / existing out-of-scope behavior:** with a fixed `?person=14` URL, the page effect reselects that person after a self-chip tap. The chip switching acceptance was therefore tested from `/profile#snapshot` (no fixed person query), where both transitions work. No navigation behavior changed for this caption-only amendment.
- No merge/deploy or contact with other agents.

---
## Original build record (superseded amendment notes below)

# Current build: Chart Snapshot panel fixes

- **Date:** 2026-11-25 (Asia/Bangkok, UTC+7)
- **Brief:** `/workspace/reports/baseline-chart-snapshot-panel-fixes-build-brief-2026-11-25.md`, sha256 `db2c99baab8f38a314f1f683284158c3f64f3d1a149c6b405a83fc7a83f6397a` (verified before build)
- **Go:** Benjamin's Go ("Go — build the Snapshot panel fixes brief against main aab6a29.", 5:57 PM Bangkok, relayed by Grok Bot) approves the build only. It is not a merge or ship yes.
- **Base:** main `aab6a29fd943b81a3dda1bb1e1339adcc0e83c7b` (origin/main verified after fetch)
- **Branch:** `feat/chart-snapshot-panel-fixes` (worktree `/workspace/hd-snapshot-panel-fixes`)
- **Code commit:** `6ed6848`. The PR tip is the handoff commit on top of it. Take the exact tip from `gh pr view`.
- **Ships (later, after a tip-bound merge yes only):** frontend only, Vercel only. No backend, env, schema, migration or lockfile changes.

## What changed (frontend only)
1. **Mobile disclosure scroll** (`ChartDisclosure.tsx`, `globals.css`)
   - Pin: on tap, the summary's viewport top is recorded, clamped to just below the sticky stack. It is restored after the React commit, on every animation frame, after `onfinish`, and on the reduced-motion native toggle (`onToggle`). Close keeps the pin until the collapsed layout is committed. No `scrollIntoView`.
   - No flash: the expand starts in a layout effect in the same commit as `open=true` (was: next `requestAnimationFrame`, one frame of full-height layout).
   - One token: `--chart-scroll-mt` is now `calc(var(--app-header-h, 4.5rem) + var(--chart-section-nav-h, 0px) + 0.75rem)` (was `+ 0.5rem`, no fallbacks). It applies to `#snapshot`, `#snapshot details` (every ChartDisclosure), `#bodygraph`, `#deep-dive`, `#chart-type-box` (added) and the existing Deep dive anchors. The JS clamp reads the same value from the box's computed `scroll-margin-top`.
   - `overflow-anchor: none` on `#snapshot` and `#snapshot details`.
2. **Other-person voice** (`page.tsx`, `snapshotShortCopy.ts`, `snapshotEnvironmentCopy.ts`, new `snapshotOtherPersonCopy.ts`)
   - `snapshotPersonName` uses the Type box gate and `friendChipLabel`. Every Snapshot body switches: Profile, Strategy, Authority, connector, Centers tips, Definition and Environment. Titles are unchanged.
   - Strategy, Definition, connector and Environment: locked strings ×5 locales.
   - Profile, Authority and Centers: the EN strings are locked. ES/NL are written with the same meaning, name-forward. DE/FR use the English other-person strings (same coverage as today's you-voice bundles).
   - `hdCopy*.ts` and `ChartDeepDive.tsx` are untouched (clarity-pass freeze hashes pass).
3. **Deep dive closer** (`hdProfileCombos.ts` only): the second copy was removed from 2/4, 3/5, 3/6, 4/6, 4/1, 5/1 and 5/2. One copy was appended to 1/3 and 6/2. All twelve now have the closer exactly once, as the last paragraph. The wording is unchanged.
4. **Valleys:** the you-voice is replaced ×5 locales with the locked copy. Other-person Valleys is in the other-person map.

## Files (+645 −48 before this handoff)
`src/components/ChartDisclosure.tsx`, `src/app/globals.css`, `src/app/profile/page.tsx`, `src/lib/essays/snapshotShortCopy.ts`, `src/lib/essays/snapshotEnvironmentCopy.ts`, `src/lib/essays/snapshotOtherPersonCopy.ts` (new), `src/lib/hdProfileCombos.ts`, `scripts/assert-chart-snapshot-panel-fixes.mjs` (new), `scripts/assert-chart-snapshot-environment-line.mjs` (digest re-pinned for Valleys; new other-person digest), `package.json` (+1 assert script; lockfile untouched).

## Original build deviations (typos and offset now accepted in amended brief)
1. **Line 2 Hermit (EN other-person Profile):** the locked string reads "Natural gifts others call out; **Quadruple Split** needs alone time…". "Quadruple Split" looks like a templating slip: it is a Definition value, not in the you-voice source, and it would render on every x/2 or 2/x chart. Shipped as "Natural gifts others call out; needs alone time…" (the you-voice clause, which has no second person to swap). Re-locking verbatim is a one-line change plus a digest update.
2. **FR other-person Valleys:** the locked string has a stray apostrophe, "peuvent laisser **’à** {name} un sentiment terne". Shipped as "peuvent laisser à {name} un sentiment terne" (one character removed).
3. **Offset token:** the brief asked for scroll-margin on each element. It is applied through the existing global `--chart-scroll-mt` rule, because `ChartDeepDive.tsx` and the Bodygraph card markup are byte-frozen. ID selectors outrank the old Tailwind `scroll-mt-[…]` classes on `#bodygraph` and `#chart-type-box`, so those classes are now inert. They were left in place so the frozen card hash holds. The token moves from +0.5rem to +0.75rem, so Deep dive hash landings sit 4px lower.
4. **Acceptance chart:** the local "Ren viewing Jules" equivalent is Remy (invented Reflector 6/3 account) viewing "Juno": Manifestor 1/3, Emotional · To Inform, Single, Workshops. Its Centers to watch come out as Head · Ajna · Sacral, not Head · Sacral · G. No searched birth time gave that exact trio together with the other traits.

## Amendment disposition
- Centers help mixed voice is resolved by the B1 follow-up above.
- NL/ES closer work is explicitly out of scope per the amendment; no changes made or proposed in this pass.

## Tests
- typecheck `tsc --noEmit`: clean. Lint: 0 errors (6 pre-existing warnings, unchanged). `next build`: OK.
- Asserts: 63/64 PASS on the branch. The only red is the known `assert:today-protocols-ia`. Base aab6a29 is 62/63 with the same red. New `assert:chart-snapshot-panel-fixes` PASS. `chart-snapshot-clarity-pass` PASS (freeze hashes untouched). `chart-snapshot-environment-line` PASS (re-pinned).
- Playwright (headless, invented local accounts, :3167 → API :8167):
  - **Before (main frontend on :3165):** at 320/375/390, opening shifted the summary up by 168–870px. How you decide moved −440px at 390, and neighbour taps moved too. Desktop shift was 0.
  - **After:** 0px shift at 300ms and 2.5s for all five boxes at 320/375/390/desktop, on both a self chart and an other-person chart. The summary and first body line stay below the sticky stack (stack bottom 167px, clamp 179px), close keeps the summary in place, and neighbour taps hit.
  - **Clamp case** (title 20px under the stack before the tap): lands at 178.5 against an expected 179.
  - **Reduced motion** (390 + desktop): 0px.
- Copy in the UI (all bodies opened): Remy→Juno EN; Mira→Juno DE/ES/FR/NL; Gale self Valleys EN/ES/FR (new you-voice); Remy→Vale other-person Valleys EN. Deep dive closer count is 1 on 2/4, 4/6, 1/3 and 6/2; before, 2/4 and 4/6 showed 2.

## Preview (left running)
- http://127.0.0.1:3167 (`/workspace/day7-tools/start-snapshot-panel-fixes.sh`) → API :8167 (`/workspace/day7-tools/start-panel-fixes-api.sh`, sqlite `/workspace/day7-tools/env3167.sqlite`, a copy of env3165 + invented charts Juno ×2 / Vale, and Gale's self chart moved to a Valleys birth time). Accounts: `/workspace/day7-tools/accounts.local.json` (gen/mge/ref…).
- Evidence: `/workspace/reports/snapshot-panel-fixes-2026-11-25/` (scroll JSON before/after, 300ms screenshots, copy JSON + Snapshot screenshots, `evidence.md`).
