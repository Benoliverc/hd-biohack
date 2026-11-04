# Current build — READY TO MERGE (Benjamin yes)

## READY — PR #53 Today's Move no-dup supplements
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/53
- **Branch:** `feat/todays-move-no-dup-supplements`
- **Tip (pre-main-merge):** `cf80f87` (`cf80f87f9543c0b9d9a771ae84c872812c5a1734`)
- **Scope:** API — `backend/app/biohack/rules.py` + `tests/test_kit_variety.py` (FE unchanged for this fix)
- **Root cause:** `_note_kit` for morning/midday lived only inside None-fallback indent → Hyper evening re-picked Magnesium Glycinate
- **Fix:** always register kit ids/names after each slot; cross-slot name+id dedupe; stack fallback attaches kit id; final safety pass
- **Tests:** `pytest -q tests/test_kit_variety.py` → 14 passed · Ship Gate PASS
- **Deploy:** Railway API after merge; Vercel skip unless tip moves FE
- **Benjamin yes:** merge + deploy (via Grok Bot)

## SHIPPED — PR #54 Soul unused-i18n hotfix
- **Merge SHA:** `a4de342` (`a4de3428c13b3dd4043cde39d1cf3fbd40afd237`)
- **Branch:** `hotfix/soul-unused-t`

## SHIPPED — PR #52 Move Soul behind Pro
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/52
- **Merge SHA:** `2ddbaaf` (`2ddbaafa116ad0596c98ce2bc5123f3d0e5b5744`)
- **Branch:** `feat/soul-behind-pro`
- **Scope:** FE + Railway (soft `403` on `POST /soul/sync` for Free)

## SHIPPED — PR #51 Admin Pro/Free plan toggle
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/51
- **Merge SHA:** `2590334` (`2590334bfe4e08b9b26604491a464cc0d25fbe90`)
- **Railway API:** SUCCESS `a6ec96b9-6109-451f-8d3e-eff05c205dde` @ commit `2590334`
  - https://api-production-7527.up.railway.app · `/health` ok · tier missing actor → **422**
- **Vercel FE:** READY `dpl_FhC1TSpmu3bFkRrz4WS64u99qvi3`
  - Alias: https://hd-biohack.vercel.app

## SHIPPED — PR #50 Nav clarity A+B
- **Merge SHA:** `9af2847` · docs tip `3a78466`
- **Vercel:** READY (superseded by later FE deploys)
- **Railway:** skipped (FE-only)

## Prior
- **PR #49** Visual density Option A — MERGED `48edf24`
- **PR #48** i18n P0 chrome/shell — MERGED `d633a3b`
