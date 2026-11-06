# Current build — Deep Dive Type copy ~3×

Softs muted. **No merge until Benjamin yes.**

---

## This PR — Deep Dive Type copy ~3× — [#69](https://github.com/Benoliverc/hd-biohack/pull/69)

- **Tip (branch HEAD):** `a99ff58` (`a99ff58608a73786bd76e29646bf718714d61bb5`)
- **Feature commit:** `b7d521f` (`b7d521feda2813b90334e42d53b318e2b44d5b7c`)
- **Branch:** `feat/deep-dive-type-copy-3x`
- **Base:** `origin/main` @ `5ff5758` (includes merged #65+#66)
- **Worktree:** `/workspace/hd-biohack-wt-type-copy-3x`
- **Scope:** FE-only. Exact longer Type essays in `TYPE_COPY` + visible paragraph breaks in Chart Deep Dive Type accordion.
- **Independent of** PR #67 (`feat/share-card-hero-graph-lockup`, tip `a5091a6`, UX PASS, held) and Today Move-first (`feat/today-move-first` / `/workspace/hd-biohack-wt-today-move-first`, in progress / held).

### Files
- `frontend/src/lib/hdCopy.ts` — TYPE_COPY only
- `frontend/src/components/ChartDeepDive.tsx` — learnMore paragraph split
- `.grok-handoff/deep-dive-type-copy-3x-ux-2026-11-06.md`

### Deploy
- Vercel FE after Benjamin yes + Ship Gate. No Railway.
