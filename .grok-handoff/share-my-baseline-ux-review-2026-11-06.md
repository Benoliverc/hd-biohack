# UX review — PR #66 Share my Baseline

- **Verdict:** UX **FAIL** (share never exports; visual/privacy ACs otherwise look right)
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/66
- **Tip reviewed:** `2421038` (`2421038ff86d5a083b1bb7f6b48d9e4e91531de1`)
- **Worktree / preview:** `/workspace/hd-biohack-wt-share-baseline` · http://127.0.0.1:3008 (API :8002). Left :3000 / :3007 / :8001 alone.
- **Date:** 2026-11-06 (HKT)
- **Hold merge:** Benjamin yes required. Do not merge before #65 unless he says otherwise.

Live walk: Dev Pro (id 2) on `/profile` and `/transits`. Shots: `/workspace/hd-biohack-ui-failures/2026-11-06/share-baseline-pr66/`. Card PNGs in that folder are **screenshots of the off-screen share card**, not files the app saved.

## Blocker (high)

Share control is present and obvious (“Share my Baseline” + Stories 9:16 / Feed 4:5 menu). Clicking it always ends on **“Could not share right now”**. No Web Share sheet, no download fallback, no `baseline-*.png`.

Thrown error: `SecurityError: Failed to execute 'toBlob' on 'HTMLCanvasElement': Tainted canvases may not be exported.` Rasterize throws before `shareCardImage` / download can run.

**Likely cause:** `elementToPngBlob` in `frontend/src/lib/share/rasterizeCard.ts` (~111–140) serializes the card to SVG + `<foreignObject>`, loads that as `Image`, `drawImage`s it onto a canvas, then `canvas.toBlob`. Chromium treats an SVG that contains `foreignObject` (especially with nested BodyGraph SVG) as a tainted source, so `toBlob` throws.

**Precise fix:** rasterize the already-mounted off-screen card node (styles are already inlined; fonts already awaited) instead of the SVG-foreignObject → Image → canvas path. Options that avoid this Chromium taint:

1. Prefer `html-to-image` / `modern-screenshot` `toBlob(card)` on the mounted `[data-share-card]` element, or
2. Another same-origin DOM rasterizer (`html2canvas` on that node).

Do not rely on `img.crossOrigin` or switching blob URL → data URL — that does not lift foreignObject taint. Keep `document.fonts.ready`, `inlineSvgStyles`, and the dedicated off-screen card. After the fix, download fallback must produce a real PNG when Share API is missing (as in this preview).

Re-review after export works; I am not sending this to Ship Gate until then.

## Acceptance criteria

| # | AC | Result |
|---|-----|--------|
| 1 | Chart top-right Share → natal poster 9:16 / 4:5; BodyGraph + Type + Profile + Strategy; no birth PII; first name only if set; wordmark Baseline | **Visual pass; export fail.** Button obvious on You/Me. Card copy: “BASELINE” / “My natal Baseline” / Manifesting Generator / Profile 2/4 / To Respond (then inform). Settings first_name empty → no name on card. No birth time, place, or full name on the card. |
| 2 | Today top-right Share; Move matches on-page; small graph + Type + “My Baseline · today”; no kit/doses | **Visual pass; export fail.** On-page Move and card Move both: “One deliberate start only. Skip stacking stimulants on top of the sky.” Card has MY BASELINE · TODAY, MOVE, small graph, TYPE Manifesting Generator, BASELINE. Kit line (Ashwagandha…) stays on the page only. |
| 3 | Content in ~14% top / 35% bottom / 6% sides; wordmark not in Story overlay band | **Pass (soft).** Text stays in the safe zone, close to the edges (~11px below top line on natal wordmark; Today wordmark ~17px above the bottom line). Washes paint into the reserved bands (ok). |
| 4 | Off-screen card; fonts.ready; inline SVG; real BodyGraph | **Pass (code + visible card).** Export path still fails as above. |
| 5 | All share through `shareCardImage`; download fallback when Share API missing | **Fail.** Fallback never runs because rasterize throws first. |
| 6 | i18n EN/NL/DE/FR/ES button labels | **Pass (code).** Live walk was EN (“Share my Baseline”). |
| 7 | Privacy: no chart IDs, emails, or kit contents in image or share text | **Pass on the card.** Today *page* still shows “Wetteren, Belgium · 1990-06-15 (#21)” — that is page chrome, not the card. No share filename was produced. |

## Quality bar (visual, from off-screen cards)

Cards look designed (linen / sage / terracotta), not screenshots of app chrome. No nav, Dev header, or Open Protocols on them.

- **9:16 natal** is sparse: large linen gap between the graph and the type block.
- **4:5 natal** is tighter and reads better.
- **Today 9:16** hierarchy is clearer (Move as hero); extra linen under the graph before the wordmark.

## Softs (ride after the export fix)

- Tighten 9:16 natal vertical rhythm (and Today’s lower linen) so the safe zone doesn’t feel empty.
- Wordmark / last rule sit ~10–17px from safe-zone edges.

## Screenshots

- `01-chart-profile-share-button.png`, `02-chart-share-menu-stories-feed.png`
- `03-natal-story-9x16-offscreen-card.png`, `04-natal-feed-4x5-offscreen-card.png`
- `05-today-transits-share-button.png`, `06-today-story-9x16-offscreen-card.png`
- `07-today-share-failed-alert.png`

## Hold

Benjamin yes required. Do not merge before #65 unless he says otherwise. Re-request UX walk after `toBlob` succeeds and a downloaded PNG can be inspected.
