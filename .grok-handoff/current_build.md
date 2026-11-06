# Current build — Deep Dive Type copy ~3×

**Status:** Merging PR #69 after Benjamin yes · FE-only Vercel (no Railway).
**Date:** 2026-11-06 (Asia/Hong_Kong)

## Branch / tip
- **Branch:** `feat/deep-dive-type-copy-3x`
- **Tip (product, pre-main merge):** `593d215` (`593d215d73d135516211dc2f75609205a6567727`)
- **Feature commit:** `b7d521f` (`b7d521feda2813b90334e42d53b318e2b44d5b7c`)
- **Worktree:** `/workspace/hd-biohack-wt-type-copy-3x`
- **Base now:** `origin/main` @ `5b5e3b1` (includes shipped #65+#66+#67+#68)
- **Independent of** already-shipped #67 (merge `0ba0fa0`) and #68 (merge `5b5e3b1`). Conflict with main was only this handoff file; product files merged clean.

## Scope
Exact longer Type essays in `TYPE_COPY` + visible paragraph breaks in Chart Deep Dive Type accordion.

## Files
- `frontend/src/lib/hdCopy.ts` — TYPE_COPY only
- `frontend/src/components/ChartDeepDive.tsx` — learnMore paragraph split
- `.grok-handoff/deep-dive-type-copy-3x-ux-2026-11-06.md`

## Deploy
- Vercel FE after Benjamin yes + Ship Gate. No Railway.
