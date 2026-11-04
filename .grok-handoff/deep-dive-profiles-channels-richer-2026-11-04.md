# Deep Dive profiles + channels richer — 2026-11-04

## Branch
`feat/deep-dive-profiles-richer` (isolated worktree `/workspace/hd-biohack-wt-deep-dive`)

## Ask
Benjamin: Chart Deep Dive Profile copy much more detailed / clearer (e.g. 6/2 ~3×). Follow-up: same spirit for **channels**.

## Scope (FE-only)
- `frontend/src/lib/hdProfileCombos.ts` — dedicated combo essays for all 12 classic profiles
- `frontend/src/lib/hdChannelCopy.ts` — expanded essays for all 36 channels
- `frontend/src/lib/hdCopy.ts` — `profileLearnMore` prefers combo essays; `CHANNEL_COPY` re-exports expanded data; snapshot `profilePlainLine` unchanged (shorter)
- `frontend/src/components/ChartDeepDive.tsx` — Channels tab `whitespace-pre-line` so multi-section essays render fully (Accordion already `whitespace-pre-wrap`)

## ACs
1. 12 combo keys: 1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6, 4/1, 5/1, 5/2, 6/2, 6/3
2. Each combo ~450–700 words, structured sections
3. Unknown profiles fall back to PROFILE_LINES composition
4. Tone: warm, en-GB, educational HD, not medical
5. Snapshot stays shorter
6. Channels ~3× richer with What / How / Healthy vs not / In practice
7. `npx tsc --noEmit` clean

## Word counts
| Item | Before | After | Ratio |
|------|--------|-------|-------|
| Profile `6/2` (`profileLearnMore`) | ~215 words | ~603 words | ~2.8× |
| Channel `19-49` (Synthesis) | ~93 words | ~307 words | ~3.3× |
| Channel `10-20` (Awakening) | ~51 words | ~264 words | ~5.2× |

## Parallel
Do not block on open PRs #52 / #53 (soul-behind-pro / no-dup supplements) — separate branches/worktrees.

## Hold
Do **not** merge. Parent routes UX → Ship Gate → Benjamin yes.
