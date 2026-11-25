# current_build: Chart Snapshot duplicate-cards cleanup

- **Date:** 2026-11-25 (Asia/Bangkok, UTC+7)
- **Branch:** `feat/chart-snapshot-strategy-definition`
- **Worktree:** `/workspace/hd-chart-snapshot-cleanup`
- **Base:** `53ec65fa45b22af8d6203302f59de2262968859d` (main after PR #146)
- **Brief:** `/workspace/reports/baseline-chart-duplicate-cards-cleanup-build-brief-2026-11-25.md` (sha256 `d42d08d2…8345`)
- **Approval:** Benjamin's Go (12:01 Bangkok, relayed by Grok Bot) covers the build only. Do not merge or deploy until Benjamin says yes in his own words.
- **Scope:** frontend only. No backend, env, lockfile, Railway or Share change.
- **Evidence:** `/workspace/reports/chart-duplicate-cards-cleanup-2026-11-25/` (README.md, snapshot-matrix.md)
- **Local preview:** `http://127.0.0.1:3161`, started by `/workspace/day7-tools/start-snapshot-cleanup.sh`. It talks to the local API on `127.0.0.1:8159`, which serves invented accounts only.

## What changed (/profile #snapshot)
1. **Fact tiles removed.** The Type / Strategy / Authority / Profile / Definition fact-tile grid is gone.
   - Profile already has its own box.
   - Authority now shows in How you decide.
   - Type lives in the Bodygraph Type box.
2. **New Strategy and Definition boxes.** They reuse `ChartDisclosure`, sit in a new `sm:grid-cols-2` row after Centers to watch, and are closed by default.
   - Their bodies render through `ChartSummaryLearnMore`. This is a byte-for-byte mirror of Deep dive's `SummaryLearnMore`; `ChartDeepDive.tsx` is byte-pinned and was not edited.
   - Labels are the new chrome keys `chart.people.strategy` / `chart.people.definition`. They are English ("Strategy" / "Definition") in all five locales.
3. **How you decide, collapsed:** always shows the authority string (default 1). The expanded body is unchanged (default 2).
4. **MG `STRATEGY_COPY` summary:** the brief's exact strings in en / es / nl (bundles), plus de / fr through a one-key overlay (`lib/essays/strategySummaryOverlay.ts`, wired in `resolveHdCopy`).
   - learnMore, TYPE_BATTERY, the Type box and every other Strategy key are unchanged.
   - DE / FR learnMore stays on the English fallback.

## Asserts
- **New:** `assert:chart-snapshot-strategy-definition`. It fails on 53ec65f at "en MG Strategy summary".
- **Updated minimally:** `assert-chart-bodygraph-revert.mjs`.
  - The "Type fact tile kept" lock is replaced by a no-fact-tiles check.
  - Disclosure count goes from 3 to 5, with the new ids added.
- **React harness:** `test-chart-bodygraph-revert-interactions.cjs` is extended. Strategy and Definition start closed and toggle independently, and they are not opened by `#snapshot-centers`.
- **Note:** `assert-language-dutch-readings` checks "Spanish hdCopy unchanged" with `git diff HEAD`. It passes once committed, but it no longer guards against this intended ES summary change.

## Checks
- tsc 0, lint 0 (warnings only), build 0, harness PASS.
- Asserts: 60 PASS. Only `today-protocols-ia` fails, and it fails identically on base ("transits/page.tsx missing quieter 'Conditioning notes'").

## Open questions
- **Default 2 overlap:** for non-Emotional charts, the expanded How you decide body still opens with the Strategy summary. Strategy is now its own box, so the two overlap.
