# Current build — IN REVIEW (hold merge)

## OPEN — PR #52 Move Soul behind Pro
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/52
- **Branch:** `feat/soul-behind-pro`
- **Tip SHA:** `3c42de9` (`3c42de988b6c1cbefd814704bbb78976d8df278f`)
- **Base:** `origin/main` @ `7543c76`
- **Scope:** FE + **Railway** (soft `403` on `POST /soul/sync` for Free)
- **Hold merge** for Benjamin yes after UX → Ship Gate
- **Changes:** Gate `/soul` with `BiohackingEntitlementGate` + static locked mock + Soul teaser i18n; Home Soul status chip mirrors Protocols `proUnlock`; same `biohackingUnlocked` truth; API Free → 403
- **Assert:** `cd frontend && npx tsc --noEmit` → pass

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
- Soft residual (plan card under Usage H1) left optional.

## SHIPPED — PR #50 Nav clarity A+B
- **Merge SHA:** `9af2847` · docs tip `3a78466`
- **Vercel:** READY (superseded by later FE deploys)
- **Railway:** skipped (FE-only)

## Prior
- **PR #49** Visual density Option A — MERGED `48edf24`
- **PR #48** i18n P0 chrome/shell — MERGED `d633a3b`
