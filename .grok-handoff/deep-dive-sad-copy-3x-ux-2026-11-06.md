# UX handoff — Deep Dive Strategy / Authority / Definition copy ~3×

**Tip (branch HEAD):** `b8cd4ca` (`b8cd4cafe2632abab5576bee6971b90346af51bf`)
**Feature commit:** `b8cd4ca` (`b8cd4cafe2632abab5576bee6971b90346af51bf`)
**Branch:** `feat/deep-dive-strategy-authority-definition-copy-3x`
**Base:** `origin/main` @ `0a4b72c` (post #65–#69)
**Worktree:** `/workspace/hd-biohack-wt-sad-copy-3x`
**FE-only** (Vercel later; no Railway). **Independent** of other open work.
**Hold merge for Benjamin yes.**
**Preview:** none (copy-only, same as #69).

## Spec
`handoffs/deep-dive-strategy-authority-definition-copy-3x-2026-11-06.md` — exact `summary` + `learnMore` for all Strategy (5), Authority (7), and Definition (5) keys.

## What changed
1. `frontend/src/lib/hdCopy.ts` — convert `STRATEGY_COPY`, `AUTHORITY_COPY`, `DEFINITION_COPY` to `{ summary, learnMore }`; summaries unchanged; learnMore essays ~175–225 words / 3 paragraphs; straight ASCII quotes.
2. `frontend/src/components/ChartDeepDive.tsx` — local `SummaryLearnMore` helper (same Type pattern: summary + learnMore split on blank lines into `<p>` with `mt-3`). Used by Type, Strategy, Inner Authority, Definition.
3. `frontend/src/app/profile/page.tsx` — snapshot stays short: `STRATEGY_COPY[…]?.summary`, `AUTHORITY_PLAIN || AUTHORITY_COPY[…]?.summary`. No learnMore on profile.

## Unchanged (by design)
- `TYPE_COPY` and `AUTHORITY_PLAIN`
- Profile / Channels / Type essay content
- Accordion UI chrome (titles, subtitles, Learn more / Hide)
- No backend, no i18n message files, no Today / kit / share-card work

## How to review
Chart → Deep Dive → Core → expand Strategy, Inner Authority, Definition. Check a few keys per map. Paragraphs should read as short blocks, not one wall of text. Profile → snapshot card still shows one-line strategy / authority only.

## Verify
- `tsc --noEmit` clean
- Callers no longer treat the three maps as plain strings
- Diff scoped to the three product files (+ handoff notes)
