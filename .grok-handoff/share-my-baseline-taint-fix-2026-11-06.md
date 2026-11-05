# Share my Baseline — tainted-canvas export fix (PR #66)

- **Date:** 2026-11-06 (HKT)
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/66
- **Prior tip (UX FAIL):** `2421038`
- **Feature fix:** `237dda9` (`237dda9374d2a1a34d8beca080d8cfa6ca412af7`)
- **Branch HEAD / PR tip:** `70cd2aa` (`70cd2aabfa851445cbc58c7098ef738b6a86688f`)

## Blocker fixed
Chromium `SecurityError: Tainted canvases may not be exported` from hand-rolled SVG + `<foreignObject>` → Image → canvas → `toBlob` in `rasterizeCard.ts`. Download fallback never ran.

## Fix
1. Keep dedicated off-screen `[data-share-card]`, `await document.fonts.ready`, `inlineSvgStyles`.
2. Flatten nested BodyGraph SVGs to PNG `<img>` (pure SVG → canvas — no foreignObject).
3. Prefer `html-to-image` `toBlob` on that mounted node.
4. On taint / empty blob, fall back to `html2canvas` with `foreignObjectRendering: false` on the **same** node only (never app chrome).
5. `shareCardImage` unchanged — when Share API missing, downloads `baseline-*.png`.

## Verify
- `npx tsc --noEmit` clean
- `npx tsx scripts/assert-share-baseline.mjs` OK
- Headless Chrome Dev Pro: Chart + Today → real `baseline-*-story-1080x1920.png` (1080×1920), no failure alert

## Softs
9:16 natal sparse / wordmark edge — not chased.

## Hold
Benjamin yes. Do not merge before #65 unless he says otherwise. Re-request UX walk.
