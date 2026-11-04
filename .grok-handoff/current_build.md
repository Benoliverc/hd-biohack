# Current build — PR #53 Today's Move no-dup SHIPPED

## SHIPPED — PR #53 Today's Move no-dup supplements
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/53
- **Merge SHA:** `ad702f5` (`ad702f589a6d23e04980681dbd8d087abd0278aa`)
- **Feat tip:** `cf80f87` · conflict-resolve tip `1b55f14` (merged main after #52/#54)
- **Branch:** `feat/todays-move-no-dup-supplements`
- **Scope:** API only — `backend/app/biohack/rules.py` + `backend/tests/test_kit_variety.py` (+ handoff docs)
- **Root cause:** `_note_kit` for morning/midday lived only inside None-fallback indent → Hyper evening re-picked Magnesium Glycinate
- **Fix:** always register kit ids/names after each slot; cross-slot name+id dedupe; stack fallback attaches kit id; final safety pass
- **Tests:** Ship Gate PASS — kit pytest 14 + live Move unique keys; FE unchanged
- **Railway API:** SUCCESS `eaa52175-6625-4dc1-a0be-56fc0a533c2c` @ commit `ad702f5`
  - https://api-production-7527.up.railway.app · `/health` → 200 `{"status":"ok","service":"baseline"}`
- **Vercel FE:** skipped (no FE files in #53). Prod still Ready from #52/#54:
  - Alias: https://hd-biohack.vercel.app → 200
  - Deployment: https://hd-biohack-66ut5p3q5-hdbh1.vercel.app · `dpl_G6cyMLew6BwtDLM9Ci8ibwVBH3Cz`
- Soft residuals left optional.

## SHIPPED — PR #52 Soul behind Pro
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/52
- **Merge SHA:** `2ddbaaf` (`2ddbaafa116ad0596c98ce2bc5123f3d0e5b5744`)
- **Hotfix:** PR #54 unused `t` lint unblock — merge `a4de342`
- **Railway (superseded by #53):** was SUCCESS `bbf2cbd7-…` @ `2ddbaaf`
- **Vercel FE:** READY `dpl_G6cyMLew6BwtDLM9Ci8ibwVBH3Cz`
  - Alias: https://hd-biohack.vercel.app
  - Deployment: https://hd-biohack-66ut5p3q5-hdbh1.vercel.app

## Prior SHIPPED
- **PR #51** Admin Pro/Free — MERGED `2590334`
- **PR #50** Nav clarity A+B — MERGED `9af2847`
- **PR #49** Visual density Option A — MERGED `48edf24`
- **PR #48** i18n P0 chrome/shell — MERGED `d633a3b`
