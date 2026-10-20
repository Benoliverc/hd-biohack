# UX review — Sticky nav: single Deep dive chip

- **Branch / SHA:** feat/chart-sticky-deepdive-nav @ 26b80e7 (fix 0058747)
- **Preview:** http://127.0.0.1:3000/profile
- **Reviewer:** UX UI Review
- **Date:** 2026-10-21 (HK)

## Verdict
**PASS** — no High/Medium. Cleared for Ship Gate.

## Re-verify (after Medium fixes)
- **Medium #1 PASS:** 375 labels People · Body · Snap · Deep; overflowX 0; nav 50px (was 64 + scrollbar).
- **Medium #2 PASS:** `#centers` / `#activations` clearance +7.8px every run (1280×3, 375×3); tabs correct. Chip click +7.8.

## Low (not gate)
- Frosted sticky (`bg-canvas/95`) over bodygraph ghosts green between chips at 375.

## Shots
`/workspace/hd-biohack-ui-failures/ux-review-2026-10-21/chart-deepdive-nav/rereview/`
