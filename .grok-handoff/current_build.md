# Current build — READY TO MERGE (Benjamin yes) — PR #56

## READY — PR #56 Deep Dive richer profiles + channels
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/56
- **Branch:** `feat/deep-dive-profiles-richer` (worktree `/workspace/hd-biohack-wt-deep-dive`)
- **Feat tip:** `5b8f6ae` (`5b8f6ae843edba76bb1b204b749938b750af3d80`)
- **Handoff:** `.grok-handoff/deep-dive-profiles-channels-richer-2026-11-04.md`
- **Scope:** FE-only — `hdProfileCombos.ts`, `hdChannelCopy.ts`, `hdCopy.ts`, `ChartDeepDive.tsx`
- **6/2:** ~215 → ~603 words; **19-49:** ~93 → ~307 words; 12 combos + 36 channels
- **Assert:** `cd frontend && npx tsc --noEmit` clean · UX PASS · Ship Gate PASS
- **Soft residuals (ride):** dup “One more anchor” on 7/12, templated channel stems, en-GB mix, heading weight
- **Deploy:** Vercel FE after merge; **skip Railway** (FE-only)
- **Benjamin yes:** merge + deploy (via Grok Bot)

## PARALLEL (do not block)
- **PR #58** Home card order + copy — `feat/home-card-order-copy` / wt-home-cards · tip `c4aded5` — UX/Ship Gate path

## SHIPPED — PR #53 Today's Move no-dup supplements
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/53
- **Merge SHA:** `ad702f5` (`ad702f589a6d23e04980681dbd8d087abd0278aa`)
- **Feat tip:** `cf80f87` · conflict-resolve tip `1b55f14` (merged main after #52/#54)
- **Branch:** `feat/todays-move-no-dup-supplements`
- **Scope:** API only — `backend/app/biohack/rules.py` + `backend/tests/test_kit_variety.py` (+ handoff docs)
- **Railway API:** SUCCESS `eaa52175-6625-4dc1-a0be-56fc0a533c2c` @ commit `ad702f5`
  - https://api-production-7527.up.railway.app · `/health` → 200
- **Vercel FE:** skipped (no FE in #53). Prod Ready from #52/#54:
  - Alias: https://hd-biohack.vercel.app → 200
  - Deployment: https://hd-biohack-66ut5p3q5-hdbh1.vercel.app · `dpl_G6cyMLew6BwtDLM9Ci8ibwVBH3Cz`
- Soft residuals left optional.

## SHIPPED — PR #52 Soul behind Pro
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/52
- **Merge SHA:** `2ddbaaf` (`2ddbaafa116ad0596c98ce2bc5123f3d0e5b5744`)
- **Hotfix:** PR #54 unused `t` lint unblock — merge `a4de342`
- **Vercel FE:** READY `dpl_G6cyMLew6BwtDLM9Ci8ibwVBH3Cz`
  - Alias: https://hd-biohack.vercel.app

## Prior SHIPPED
- **PR #55** docs ship-pr52 — merge on main `4f135e4`
- **PR #57** docs ship-pr53 — merge on main `44c0d4d`
- **PR #51** Admin Pro/Free — MERGED `2590334`
- **PR #50** Nav clarity A+B — MERGED `9af2847`
- **PR #49** Visual density Option A — MERGED `48edf24`
- **PR #48** i18n P0 chrome/shell — MERGED `d633a3b`
