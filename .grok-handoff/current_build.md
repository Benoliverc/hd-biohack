# Current build — Deep Dive Strategy / Authority / Definition copy ~3×

**Status:** PR open · hold merge for Benjamin yes · FE-only Vercel later (no Railway).
**Date:** 2026-11-06 (Asia/Hong_Kong)

## Branch / tip
- **Branch:** `feat/deep-dive-strategy-authority-definition-copy-3x`
- **Tip:** `e64b426` (`e64b42677e766bc7c26e19757eda7b7aceb64065`)
- **Feature commit:** `116e188` (`116e188756b61079dcc95fe230830529c7ca36eb`)
- **Worktree:** `/workspace/hd-biohack-wt-sad-copy-3x`
- **Base:** `origin/main` @ `0a4b72c388f5a752c5dcdb9cefa6fc4545f8a92c` (includes shipped #65–#69)
- **Independent of** other open work. No preview server (copy-only, same as #69). Do not touch :3009/:3010/:3011.

## Scope
Convert `STRATEGY_COPY`, `AUTHORITY_COPY`, and `DEFINITION_COPY` to `{ summary, learnMore }` (exact handoff essays) and render Strategy / Inner Authority / Definition Deep Dive accordions like Type. Profile snapshot stays short (`.summary` / `AUTHORITY_PLAIN`).

## Files
- `frontend/src/lib/hdCopy.ts` — STRATEGY / AUTHORITY / DEFINITION only (`TYPE_COPY` + `AUTHORITY_PLAIN` untouched)
- `frontend/src/components/ChartDeepDive.tsx` — shared `SummaryLearnMore` for Type + Strategy + Authority + Definition
- `frontend/src/app/profile/page.tsx` — `.summary` for strategy; `AUTHORITY_PLAIN || AUTHORITY_COPY?.summary`
- `.grok-handoff/deep-dive-sad-copy-3x-ux-2026-11-06.md`

## Spec
`handoffs/deep-dive-strategy-authority-definition-copy-3x-2026-11-06.md`

## Deploy
- Hold merge for Benjamin yes after UX → Ship Gate.
- FE-only Vercel after yes. No Railway.

## Open questions
None.
