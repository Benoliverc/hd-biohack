# Current build

PR: https://github.com/Benoliverc/hd-biohack/pull/151
Branch: `feat/deep-dive-type-profile-headings`
Implementation commit: `629726f8718ab57e7cdd61757444a96ac46dacd4`
Final PR tip includes this handoff-only commit. Resolve it with `git rev-parse HEAD` or the PR metadata.
Base: `cc82415c8845b0012f668fce1c18b721dec8347d`
Worktree: `/workspace/hd-type-profile-headings`
Brief: `/workspace/reports/baseline-deep-dive-type-profile-headings-build-brief-2026-11-25.md`
Brief SHA256: `94b01b1a5ff5a36b861cf44ab35c3b77a8a48e605623345dac6ff734a7f6b5d0`

## Files

- `frontend/src/components/ChartDeepDive.tsx`
- `frontend/src/components/SnapshotProfileBody.tsx`
- `frontend/src/app/profile/page.tsx`
- `frontend/src/lib/profilePresentation.ts`
- `frontend/src/lib/essays/deepDiveTypeCopy.ts`
- `frontend/src/lib/essays/deepDiveType.{en,de,es,fr,nl}.json`
- `frontend/package.json`
- `frontend/scripts/assert-deep-dive-type-profile-headings.mjs`
- Historical assert exceptions: `assert-chart-bodygraph-revert.mjs`, `assert-chart-snapshot-clarity-pass.mjs`, `assert-chart-snapshot-strategy-definition.mjs`, `assert-day7-five-fixes.mjs`.

## Preview and evidence

Frontend http://localhost:3169/profile, production mode. Local API http://127.0.0.1:8169 uses a separate invented-account SQLite copy. No production endpoint or account was used. Both services remain running. Local invented mge preference was changed through Settings during locale tests and restored to English. No chart or pairing writes.

Evidence: `/workspace/reports/deep-dive-type-profile-headings-2026-11-25/evidence.md`.
Full logs, word budgets, screenshots, browser scripts, PR verification, and merge-tree output are alongside it.

## Tests

Lint and TypeScript pass. Production build passes. All package asserts ran: 64 pass; one known Today IA red is byte-for-byte identical to pristine base. New check covers 50 complete essays, all twelve Profile headings in every locale and voice, original briefs, and frozen copy/geometry.

Headless Chromium: 480 component cases across twelve profiles, five locales, two voices, widths 320/375/390/1280. Exact Type copy, computed weights, overflow, sticky opening position, and live locale/person switching pass. Full app: fifteen local self/Juno/self journeys across all five locales pass. Actual app emits hydration errors 418/423; identical messages/counts reproduce on pristine base. No new component errors.

## Scope and gates

Frontend only. English essays match the locked brief verbatim. All 50 essays have 200–320 words. Four translations are complete with informal self voice, third-person other voice, English feature names, and French U+2019 apostrophes. Source review and automated checks are complete; no native-human language review or physical-device touch test was performed.

Short Type box, Bodygraph, all pre-existing copy modules, official Profile combo essays, NL/ES closers, and Share GB-2 remain untouched. No backend/env/schema/lockfile changes. TYPE_COPY narrow caller check found only existing bundle exports; legacy essays remain unchanged, and the new Type row uses dedicated structured copy.

Questions: none blocking the build. Official UX and Ship Gate remain open. Native-human translation review and real-device touch testing are unperformed limitations. No merge or deploy authorization; neither was performed.
