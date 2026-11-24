# current_build — Chart Bodygraph revert + collapsible Snapshot boxes

- **Date:** 2026-11-24 (Asia/Bangkok, UTC+7)
- **Branch:** `feat/chart-bodygraph-revert-collapsible`
- **Worktree:** `/workspace/hd-bodygraph-revert`
- **Base:** `d1252c8360fd807a0d6cab5d45459396735b04cd` (main after PR #144 merge)
- **Tip SHA:** this stamp can't contain its own SHA. Lock on GitHub `headRefOid` after push.
- **Brief:** `/workspace/reports/baseline-bodygraph-revert-collapsible-sections-build-brief-2026-11-24.md` (sha256 `5047c134…de8def`)
- **Evidence:** `/workspace/reports/bodygraph-revert-collapsible-2026-11-24/`
- **Do not merge or deploy** until Benjamin says yes. Frontend only. Railway, Share, env and lockfiles are untouched.

## Intent
Benjamin asked to "revert to previous chart design (the one before today). Keep the type box, make the same for profile, how you decide and centers to watch so it's clickable to open."

## What changed
- `#bodygraph` is back to the f0d542d design: visible "Bodygraph" h2, `p-4`, and the full `<BodyGraph>` (240×360, `max-w-[300px]`, hover pill, legend, channel/hanging lists, lit line).
- The collapsed Type box (`ChartTypeBox`, extracted verbatim from the removed module) sits directly under the SVG. It uses a new non-compact-only `afterSvg` slot on BodyGraph, which compact/Share ignores.
- Profile, How you decide and Centers to watch are neutral `ChartDisclosure` boxes. They are closed by default and open independently, each with a 44px summary (value + label). `#snapshot-centers` opens Centers. The time-unknown caveat stays inside How you decide.
- Removed: ChartBodygraphModule, editorialBodygraphGeometry, the tabs/peek sheet and 63 unused module keys per locale.
- Assert `assert:chart-bodygraph-revert` replaces the module, layout and interaction asserts. The navigation assert is kept and imported by it. New React harness: `scripts/test-chart-bodygraph-revert-interactions.cjs`.

## Checks (local)
tsc 0 · lint 0 (6 pre-existing hook warnings) · build 0 · React harness PASS · assert suite 58/59. The only red is the pre-existing `today-protocols-ia` failure ("Conditioning notes").

## Residual
At 320×568 the f0d542d graph lands with its bottom 33px below the fold after the `#bodygraph` jump, and 3px at 375×667. 390 and desktop show the full graph. This is the pre-today geometry; the `scroll-mt` and card markup are identical to f0d542d.
