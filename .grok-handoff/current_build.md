# Current build — PR #52 Soul behind Pro SHIPPED

## SHIPPED — PR #52 Soul behind Pro
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/52
- **Merge SHA:** `2ddbaaf` (`2ddbaafa116ad0596c98ce2bc5123f3d0e5b5744`)
- **Feat tip:** `3c42de9` · head `60fe2d2`
- **Branch:** `feat/soul-behind-pro`
- **Hotfix:** PR #54 unused `t` lint unblock — merge `a4de342` (FE Vercel needed this; no API change)
- **Railway API:** SUCCESS `bbf2cbd7-4723-4f76-a684-fabe798c8278` @ commit `2ddbaaf`
  - https://api-production-7527.up.railway.app · `/health` ok
  - Free `POST /soul/sync` (user_id=1 Dev Free) → **403** `"Soul sync requires Pro"`
- **Vercel FE:** READY `dpl_G6cyMLew6BwtDLM9Ci8ibwVBH3Cz` (built from main incl. #54)
  - Alias: https://hd-biohack.vercel.app
  - Deployment: https://hd-biohack-66ut5p3q5-hdbh1.vercel.app
- **Smoke:** `/` `/soul` `/biohack` `/profile` `/transits` `/login` → all **200**
- Soft residuals left optional (hardcoded EN mock; mobile nav clip; Home chip `needsChart` when 0 charts).

## Prior SHIPPED
- **PR #51** Admin Pro/Free — MERGED `2590334`
- **PR #50** Nav clarity A+B — MERGED `9af2847`
- **PR #49** Visual density Option A — MERGED `48edf24`
- **PR #48** i18n P0 chrome/shell — MERGED `d633a3b`
