# UX handoff — Deep Dive Type copy ~3×

**PR:** https://github.com/Benoliverc/hd-biohack/pull/69  
**Tip:** `b7d521f` (`59984365c0f322f8e06f708181cf14fc7e2f88c5`)
**Branch:** `feat/deep-dive-type-copy-3x`  
**Base:** `origin/main` @ `5ff5758` (post #65+#66)  
**Worktree:** `/workspace/hd-biohack-wt-type-copy-3x`  
**FE-only** (Vercel later; no Railway). **Independent of** PR #67 (Hero Graph Lockup) and Today Move-first.  
**Hold merge for Benjamin yes.**

## Spec
`/workspace/hd-biohack/handoffs/deep-dive-type-copy-3x-2026-11-06.md` — exact `summary` + `learnMore` for all five types.

## What changed
1. `frontend/src/lib/hdCopy.ts` — `TYPE_COPY` learnMore essays ~3–4× longer; summaries unchanged (one sentence each).
2. `frontend/src/components/ChartDeepDive.tsx` — Type accordion splits `learnMore` on blank lines (`\n\n`) into multiple `<p>` tags with `mt-3` between paragraphs so breaks are visible.

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
- Diff scoped to the two files above (+ this handoff)
