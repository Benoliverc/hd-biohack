# Handoff — Deep dive domain tab clarity

## Branch & commit
- **Branch:** `feat/deep-dive-domain-tabs`
- **SHA:** 3aa08c5a83d73e2e12106de8d6154808f0f09a8a (short `3aa08c5`)
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

## Local preview
- http://127.0.0.1:3000/profile

## Test / verify
- `./node_modules/.bin/tsc --noEmit`
- `./node_modules/.bin/next lint --file src/components/ChartDeepDive.tsx`
- Keyboard arrows on tablist; hash `#centers` / `#activations` still select correct domain.

## Open questions
- None. Ready for UX re-verify → Ship Gate.
