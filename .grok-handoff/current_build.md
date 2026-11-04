# Current build — BOTH SHIPPED (#50 + #51)

## SHIPPED — PR #51 Admin Pro/Free plan toggle
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/51
- **Merge SHA:** `2590334` (`2590334bfe4e08b9b26604491a464cc0d25fbe90`)
- **Feat tip:** `cade240` · prior head `9b74126` · conflict-resolve push `27f3f09`
- **Branch:** `feat/admin-pro-free-toggle`
- **Railway API:** SUCCESS `a6ec96b9-6109-451f-8d3e-eff05c205dde` @ commit `2590334`
  - https://api-production-7527.up.railway.app · `/health` ok · tier missing actor → **422** (auth harden live)
- **Vercel FE:** READY `dpl_FhC1TSpmu3bFkRrz4WS64u99qvi3`
  - Alias: https://hd-biohack.vercel.app
  - Deployment: https://hd-biohack-f93uxw3ac-hdbh1.vercel.app
- **Smoke:** `/admin` `/` `/biohack` `/login` → all **200**
- Soft residual (plan card under Usage H1) left optional.

## SHIPPED — PR #50 Nav clarity A+B
- **Merge SHA:** `9af2847` · docs tip `3a78466`
- **Vercel:** READY `dpl_C1xXnA9Sn88Tb792ae4qZUjGWjZ4` (superseded by #51 FE deploy above)
- **Railway:** skipped (FE-only)
- **Smoke:** `/` `/biohack` `/transits` `/profile` `/soul` `/settings` → all **200**

## Prior
- **PR #49** Visual density Option A — MERGED `48edf24`
- **PR #48** i18n P0 chrome/shell — MERGED `d633a3b`
