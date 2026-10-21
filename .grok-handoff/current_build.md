# Handoff — Deep dive domain tab clarity (SHIPPED)

## Production
- **Status:** SHIPPED 2026-10-21 ~17:38 Asia/Hong_Kong (HKT)
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/6 (merged)
- **Merge SHA:** `a21138a7957395196422468d21a1adb8a4ec8fec` (short `a21138a`)
- **Impl SHA:** `3aa08c5` (branch tip before docs stamp: `dc1ab81` / `b147c6c`)
- **Production frontend:** https://hd-biohack.vercel.app
- **Vercel deploy:** `dpl_EWJWw1fyZF4LmKLE3ZmBhsm8J67n` — Ready; aliased to production
- **API / Railway:** unchanged (frontend-only)

## Branch & commit (pre-merge)
- **Branch:** `feat/deep-dive-domain-tabs` (deleted after merge)
- **Base:** `main` @ `2678a3d` (Merge PR #5 remove-city-presets)

## Request
Make Core | Centers | Channels | Planets under Deep dive read clearly as clickable tabs.
Work from UX write-up: `.grok-handoff/deep-dive-domain-tabs-ux.md`.

## Fix
- Opaque sunken track (`bg-sunken` + `border-border`), four equal `flex-1` segments, `min-h-11`.
- Selected: elevated surface, semibold fg, soft shadow, ring, 2px growth bottom accent.
- Unselected: fg-secondary + hover elevated/80.
- Focus-visible ring with sunken offset.
- Roving tabindex: ArrowLeft/Right (wrap), Home/End; only selected is tabIndex 0; keyboard updates domain + hash same as click.
- Kept `role="tablist"/"tab"/"tabpanel"`; full labels; `text-xs sm:text-sm` for 375 fit.

## Changed files
- `frontend/src/components/ChartDeepDive.tsx`
- `.grok-handoff/current_build.md`
- `.grok-handoff/deep-dive-domain-tabs-ux.md` (UX guidance, tracked)
- `.grok-handoff/ship-gate-deep-dive-domain-tabs.md`

## Verify
- Ship Gate PASS — `.grok-handoff/ship-gate-deep-dive-domain-tabs.md`
- Spot-check: https://hd-biohack.vercel.app/profile → Deep dive segmented tabs
