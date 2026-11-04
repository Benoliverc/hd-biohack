# Current build — PR #56 Deep Dive richer profiles + channels SHIPPED

## SHIPPED — PR #56 Deep Dive richer profiles + channels
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/56
- **Merge SHA:** `8631b3b` (`8631b3b8001946c72f5dd66b3561b8699b2e954d`)
- **Feat tip:** `5b8f6ae` · conflict-resolve tip `cf0cdbb` (merged main after #53/#57 docs)
- **Branch:** `feat/deep-dive-profiles-richer`
- **Scope:** FE-only — `hdProfileCombos.ts`, `hdChannelCopy.ts`, `hdCopy.ts`, `ChartDeepDive.tsx`
- **Content:** 12 profile Learn more essays (~2.8×) + 36 channel Deep Dives (~3×+, What/How/Healthy/In practice)
- **Tests:** UX PASS · Ship Gate PASS · `tsc --noEmit` clean
- **Railway API:** skipped (FE-only)
- **Vercel FE:** READY `dpl_7EfBS5F6rUNYiupHyLZ9NNfREFLt` @ merge `8631b3b` (CLI `--prod` after GitHub auto-deploy lag)
  - Alias: https://hd-biohack.vercel.app → 200
  - Deployment: https://hd-biohack-d6gbxgtlw-hdbh1.vercel.app
  - Smoke: live JS chunk includes richer “One more anchor” / “In practice” / 6/2 essay copy
- Soft residuals ride: dup “One more anchor” on 7/12, templated channel stems, en-GB mix, heading weight

## PARALLEL (do not block)
- **PR #58** Home card order + copy — `feat/home-card-order-copy` / tip `c4aded5` — hold for Ship Gate → Benjamin yes · Vercel only

## SHIPPED — PR #53 Today's Move no-dup supplements
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/53
- **Merge SHA:** `ad702f5` (`ad702f589a6d23e04980681dbd8d087abd0278aa`)
- **Railway API:** SUCCESS @ `ad702f5` · https://api-production-7527.up.railway.app
- **Vercel FE:** skipped (API-only); superseded by #56 FE deploy above

## SHIPPED — PR #52 Soul behind Pro
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/52
- **Merge SHA:** `2ddbaaf` (+ hotfix #54 `a4de342`)

## Prior SHIPPED
- **PR #57** docs ship-pr53 — merge `44c0d4d`
- **PR #55** docs ship-pr52 — merge `4f135e4`
- **PR #51** Admin Pro/Free — MERGED `2590334`
- **PR #50** Nav clarity A+B — MERGED `9af2847`
- **PR #49** Visual density Option A — MERGED `48edf24`
- **PR #48** i18n P0 chrome/shell — MERGED `d633a3b`
