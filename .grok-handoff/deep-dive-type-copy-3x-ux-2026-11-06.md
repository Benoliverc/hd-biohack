# UX handoff — Deep Dive Type copy ~3×

**PR:** https://github.com/Benoliverc/hd-biohack/pull/69
**Tip (branch HEAD):** `a99ff58` (`a99ff58608a73786bd76e29646bf718714d61bb5`)
**Feature commit:** `b7d521f` (`b7d521feda2813b90334e42d53b318e2b44d5b7c`)
**Branch:** `feat/deep-dive-type-copy-3x`
**Base:** `origin/main` @ `5ff5758` (post #65+#66)
**Worktree:** `/workspace/hd-biohack-wt-type-copy-3x`
**FE-only** (Vercel later; no Railway). **Independent of** PR #67 (Hero Graph Lockup) and Today Move-first.
**Hold merge for Benjamin yes.**

## Spec
`handoffs/deep-dive-type-copy-3x-2026-11-06.md` — exact `summary` + `learnMore` for all five types.

## What changed
1. `frontend/src/lib/hdCopy.ts` — `TYPE_COPY` learnMore essays ~3–4× longer; summaries unchanged (one sentence each).
2. `frontend/src/components/ChartDeepDive.tsx` — Type accordion splits `learnMore` on blank lines into multiple `<p>` tags with `mt-3` between paragraphs so breaks are visible.

## Unchanged (by design)
- Profile / Channels / Strategy / Authority / Definition essays
- Profile page still appends **summary only** beside the type name
- Collapsed Type row subtitle remains the type name only
- No backend, no i18n message files, no share-card / Today IA work

## How to review
Chart → Deep Dive → Core → Type (expanded). Check all five types if possible; Projector is the example Benjamin pasted. Paragraphs should read as short blocks, not one wall of text.

## Verify
- `tsc --noEmit` clean
- `next lint` clean aside from pre-existing react-hooks warnings
- Diff scoped to the two product files above (+ handoff notes)
