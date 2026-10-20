# UX review — Sticky nav: single Deep dive chip

- **Branch / SHA:** feat/chart-sticky-deepdive-nav @ c61d7eb
- **Preview:** http://127.0.0.1:3000/profile
- **Reviewer:** UX UI Review
- **Date:** 2026-10-21 (HK)

## Verdict
No High. Two Medium before Ship Gate.

## PASS
- Sticky chips exactly: People & form · Bodygraph · Snapshot · Deep dive (375: People · …).
- No Core / Centers / Channels / Planets in sticky; domain tabs stay in Deep dive.
- Sticky flush under header (gap 0) at 1280 / 768 / 375.
- Deep dive **chip click** → `#deep-dive`, heading +7.8px below sticky stack (1280).
- Legacy hashes select tabs: `#centers` → Centers; `#activations` → Planets.

## Medium
1. **375 overflow:** chip bar ~1px over → horizontal scrollbar; nav 64px vs 54px.
2. **Hash scroll race:** `#centers` / `#activations` often land heading −8.2px under sticky (settle ~3s). Chip click OK. At 375 scrollbar clips title. Suspect `--chart-scroll-mt` before nav height settles.

## Shots
`/workspace/hd-biohack-ui-failures/ux-review-2026-10-21/chart-deepdive-nav/`
