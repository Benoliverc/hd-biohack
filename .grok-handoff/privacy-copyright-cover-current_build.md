# current_build — Subtle Privacy + copyright cover

- **Date:** 2026-11-09 (Asia/Hong_Kong)
- **Branch:** `feat/privacy-copyright-cover`
- **Worktree:** `/workspace/hd-biohack-wt-privacy-copyright`
- **Base:** `6adedf1593cc460a4213474c4ee81ef2477b8229` (main after #90 merge)
- **Do not merge** until Benjamin yes after UX → Ship Gate.

## Intent
Light risk cover only: quiet Privacy link + short `/privacy` page + © line. Not ToS, not modal, not scare copy. Existing medical disclaimers unchanged.

## Approach (FE-only)
1. AuthGate allowlists `/privacy` alongside `/login` and `/reset-password` (signed-in users can stay on Privacy; only `/login` redirects home).
2. New calm `frontend/src/app/privacy/page.tsx` — title, intro, four sections, HD note, full copyright, reuses `home.trust.disclaimer`.
3. Quiet caption footers: Login under-card + Settings under `settings.footerAccount` — `Privacy` · `© 2026 Baseline`.
4. i18n keys in en/nl/de/fr/es; non-EN EN verbatim.
5. Assert: `npm run assert:privacy-copyright-cover`.

## Deploy target
- **FE-only** → Vercel only (no Railway / BE change).

## Files
- `frontend/src/components/AuthGate.tsx`
- `frontend/src/app/privacy/page.tsx` (new)
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/settings/page.tsx`
- `frontend/src/lib/i18n/messages/{en,nl,de,fr,es}.ts`
- `frontend/scripts/assert-privacy-copyright-cover.mjs`
- `frontend/package.json` (script)

## Tests
- `./node_modules/.bin/tsc --noEmit` — exit 0
- `assert:privacy-copyright-cover` — PASS
- `assert:i18n-settings` — PASS · keys=309 · parity ok

## Verify
1. Logged out → open `/privacy` → calm page, locked copy, no session required.
2. `/login` → under-card `Privacy · © 2026 Baseline`; beta note unchanged.
3. Settings → quiet strip under account footer; Open Privacy.
4. Existing Home / Today / Protocols disclaimers unchanged.

## Out of scope
- Full ToS / cookie banner / GDPR modal / age gate
- Stripe / paid checkout legal
- Resend keys / soft #89–#90 residuals
- Chart/Soul/Today/Move copy beyond quiet links

## Open questions
- None for ship. (Not legal advice — product risk cover as PO requested.)
