# Current build — PR #58 Home card order + copy SHIPPED

## SHIPPED — PR #58 Home card order + copy
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/58
- **Merge SHA:** `182cd25` (`182cd252dd2e01175e0159df7d57ec105048f62f`)
- **Feat tip:** `c4aded5` · main-sync tip `3d15591` (merged main after #56 before merge)
- **Branch:** `feat/home-card-order-copy`
- **Scope:** FE-only — `frontend/src/app/page.tsx` + i18n EN/nl/de/fr/es
- **Content:** Home outcome cards Protocols → Today → Chart → Soul; copy refresh (Soul Pro + kit no-dup); longer Swiss Ephemeris trust line
- **Sequencing:** Waited for PR #56 MERGED (`8631b3b`) before merging #58 (no race)
- **Tests:** UX PASS · Ship Gate PASS · soft residuals ride
- **Railway API:** skipped (FE-only)
- **Vercel FE:** READY `dpl_71YwwyKoFQcfLVXhRhmnY2q2Mt8z` (CLI `vercel deploy --prod --cwd frontend` from main incl. `182cd25` / tip `beb13f7`; GitHub auto-deploy lag)
  - Alias: https://hd-biohack.vercel.app → 200
  - Deployment: https://hd-biohack-i4ijyfamu-hdbh1.vercel.app
  - Smoke: live JS chunk includes `home.trust.line` Swiss Ephemeris engine copy; Outcome cards order comment Protocols · Today · Chart · Soul on tip
- Soft residuals ride: Today body shorter; chip contrast; trust line orphan “account.”; Soul nav clip at 390; American `centers`

## SHIPPED — PR #56 Deep Dive richer profiles + channels
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/56
- **Merge SHA:** `8631b3b` (`8631b3b8001946c72f5dd66b3561b8699b2e954d`)
- **Feat tip:** `5b8f6ae`
- **Vercel FE:** superseded by #58 deploy above (prior READY `dpl_7EfBS5F6rUNYiupHyLZ9NNfREFLt` / `hd-biohack-d6gbxgtlw-hdbh1`)
- Soft residuals ride: dup “One more anchor”, templated stems, en-GB mix, heading weight

## SHIPPED — PR #53 Today's Move no-dup supplements
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/53
- **Merge SHA:** `ad702f5`
- **Railway API:** SUCCESS @ `ad702f5` · https://api-production-7527.up.railway.app
- **Vercel FE:** skipped (API-only)

## SHIPPED — PR #52 Soul behind Pro
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/52
- **Merge SHA:** `2ddbaaf` (+ hotfix #54 `a4de342`)

## Prior SHIPPED
- **PR #59** docs ship-pr56 — merge `beb13f7`
- **PR #57** docs ship-pr53 — merge `44c0d4d`
- **PR #55** docs ship-pr52 — merge `4f135e4`
- **PR #51** Admin Pro/Free — MERGED `2590334`
- **PR #50** Nav clarity A+B — MERGED `9af2847`
- **PR #49** Visual density Option A — MERGED `48edf24`
- **PR #48** i18n P0 chrome/shell — MERGED `d633a3b`
