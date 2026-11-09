# current_build — Today empty when no Me natal

- **Date:** 2026-11-09 (Asia/Hong_Kong)
- **Branch:** `feat/today-empty-no-me-chart`
- **Worktree:** `/workspace/hd-biohack-wt-today-empty-no-me-chart`
- **Base:** `0507fa54badfc7145d25fc0d66a14b870dc0039f` (main after #89 merge)
- **Do not merge** until Benjamin yes after UX → Ship Gate.

## Root cause (confirmed)
1. `frontend/src/app/transits/page.tsx` always called `api.transitsToday(youChart?.id, …)` even when `youChart` was null.
2. Backend `_no_natal_indication` intentionally returns a full lifestyle Move (`has_natal: false`, `save_chart_cta: true`) for sky-only.
3. Page always mounted `TodayIndication`, which rendered the filled Move cockpit; save CTA was buried under it. Header savePrompt alone was not enough.

## Fix (FE-only)
- Gate Today fetch + body on Me natal (`youChart`). No `transitsToday` without Me chart.
- Empty state card `today-empty-no-you` + CTA `today-empty-open-chart` → `/profile` (mirrors Protocols empty).
- Hide Move / LiteracyCoach / sun-earth / overlay / planetary gates until Me natal exists.
- Defense in `TodayIndication`: if `!indication.has_natal`, render needs-natal empty instead of filled Move.
- i18n: `page.today.emptyTitle` / `emptyBody` / `openChart` (all 5 locales; non-EN EN-verbatim).
- Assert: `npm run assert:today-empty-no-me-chart`

## Deploy target
- **FE-only** → Vercel only (no Railway / BE change).

## Files
- `frontend/src/app/transits/page.tsx`
- `frontend/src/components/TodayIndication.tsx`
- `frontend/src/lib/i18n/messages/{en,nl,de,fr,es}.ts`
- `frontend/scripts/assert-today-empty-no-me-chart.mjs`
- `frontend/package.json` (script)

## Tests
- `./node_modules/.bin/tsc --noEmit` — exit 0
- `assert:today-empty-no-me-chart` — PASS
- `assert:i18n-settings` — PASS · keys=295 · parity ok
- evening-signature-close, morning-ritual-option-a, settled-day, quiet-move-closure, kind-show-up, sky-story — PASS
- BE unchanged (no pytest required for this tip)

## Preview
- Ports not left running (use :3029 FE / :8029 API if needed; leave :3028/:8028 alone)

## Verify
1. New account → /transits → empty card + Open Chart; no Move / energy / sun-earth / gates.
2. Save Me natal on Chart → Today fills (Move-first, Settled Day, Evening Close, Share when payload).
3. Friend charts never drive Today (self-only resolveYouChart unchanged).

## Out of scope
- Soft #89 residuals (Resend, settings ORM, leftover tests)
- Changing BE `_no_natal_indication` (still valid for any non-UI caller; FE no longer paints it)
