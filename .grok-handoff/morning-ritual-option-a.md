# Baseline Option A — Morning Ritual (P0)

**Status:** [PR #46](https://github.com/Benoliverc/hd-biohack/pull/46) open — awaiting UX UI Review → Ship Gate → Benjamin merge yes  
**Branch:** `feat/morning-ritual-option-a`  
**Tip:** `5679fd8` (`5679fd8bde05df61aabbca4a13030affe7ad8bf4`)  
**Do not merge without Benjamin yes.**

## Specs
- Decision Page: https://cursor.com/canvas/store-f5d34951-c924-450e-b54b-b19b5400da0d/891b1ff3-ee84-4631-8705-b87d3fb4e173
- Expert #1 memo: `.grok-handoff/expert-ux-uplift-memo-2026-11-04.md`
- Shots: `/workspace/hd-biohack-ui-failures/ux-review-2026-11-04/expert-uplift-memo/`
- Base tip: `70a8b27` (PR #45 merge)

## Goal
Protocols as a morning ritual: **Today's Move first above the fold** (390 + 1280); kit/intention deferred behind disclosures; **colour restraint** (same hues, less sage wash — one growth fill per view). Not a rebrand. Keep PR #45 IA split.

## P0 ACs
| # | AC | Done |
| --- | --- | --- |
| 1 | Protocols: WeatherStrip (optional) + Today's Move first; Shelf + Intention deferred | yes |
| 2 | Empty + filled kit: Move checkboxes on first screen (fix empty 390 y≈887) | yes (structure) |
| 3 | Home returners: one filled growth primary (Protocols if Pro, Today's sky if Free); Chart ghost | yes |
| 4 | Single empty-kit ask — KitFact empty twin CTA killed (`cta={null}`); Shelf summary + KitStrip only | yes |
| 5 | Strip `(consider adding)` from tick-row labels via `bareItemName` | yes |
| 6 | Colour: Move + Main action sand/elevated (no growth-soft card wash); progress/completed/one primary use growth | yes |
| 7 | Energy for sky-did what's-new chip | yes |
| 8 | assert:today-protocols-ia PASS; Why stays closed by default | yes |

## Cheap soft-P1 fallout
- Why micro moved inside Why disclosure
- Open Protocols under Main action → real growth button (Today's one fill)
- This-week sky note collapsed behind disclosure (cut morning bridge noise)
- Meta muted → `fg-secondary` in several Places

## Keep (unchanged contracts)
- PR #45 IA split (Today cockpit / Protocols blueprint)
- invite/Free honesty
- Why closed by default
- chips-only WeatherStrip + Full sky on Today
- “From your kit” when stocked
- bodygraph contrast / sand·sage·rust hues
- completions `preferred_timezone`; novelty HKT

## Files
- `frontend/src/app/biohack/page.tsx` — Move-first order; Shelf/Intention disclosures; no KitFact empty CTA; bare labels
- `frontend/src/components/protocols/TodaysMoveCard.tsx` — sand card; growth on progress + completed rows
- `frontend/src/components/protocols/WeatherStrip.tsx` — energy chip for sky-did
- `frontend/src/components/TodayIndication.tsx` — sand Main action; micro in Why; Open Protocols button
- `frontend/src/app/page.tsx` — one returning primary
- `frontend/scripts/assert-morning-ritual-option-a.mjs` + `package.json` script

## Out of scope
Bold nav rethink; dark mode; colour-first-only / hue rebrand; Pro Move N/M; baseline-pause.

## Verify
```bash
cd frontend
npm run assert:today-protocols-ia
npm run assert:morning-ritual-option-a
npx tsc --noEmit
```

## Deploy notes
FE-only (Vercel). No Railway required unless API changes land later.
