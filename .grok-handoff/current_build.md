# Current build — Free / Pro truth + first-run identity (PR OPEN)

- **PR:** https://github.com/Benoliverc/hd-biohack/pull/42 — **not merged** (awaiting UX → Ship Gate → Benjamin yes)
- **Branch:** `feat/free-pro-identity-truth`
- **Tip SHA:** `1c70a81` (`1c70a81e19b20ef4dff1ccc726d635604fab0d62`) · feature commit `59149ad`
- **Base:** `main` @ `17b5c99` (PR #41 shipped)
- **Handoff:** `.grok-handoff/free-pro-identity-truth.md`
- **Status:** ready for UX UI Review, then Ship Gate. Do **not** merge/deploy without Benjamin yes via Grok Bot.
- **Out of scope:** real Stripe, Google OAuth wiring, account settings
- **tsc:** `npx tsc --noEmit` (frontend) — pass

## Files touched
- `frontend/src/lib/store.tsx` — `biohackingUnlocked` follows tier / `biohacking_enabled`; ignore soft-false paywall env
- `frontend/src/components/Header.tsx` — Free/Pro badge from tier; Sign in → `/login` (no Google stub); Preview as Free always usable
- `frontend/src/components/BiohackingEntitlementGate.tsx` — Pro waitlist CTA (no fake checkout success)
- `frontend/src/app/page.tsx` — Home copy aligned with Free gate
- `frontend/src/app/profile/page.tsx` — no silent Ra prefill; labeled Try demo + demo banner
- `frontend/src/app/login/page.tsx` — invite-only waitlist; Google stub removed
- `DEPLOY.md` — tier gates even when `ENFORCE_PAYWALL` / `NEXT_PUBLIC_ENFORCE_PAYWALL` soft-false

## Preview notes
- Vercel: opens preview for PR #42 when CI/previews are enabled (`hd-biohack-*.vercel.app`)
- Local: `frontend` `npm run dev` + Railway/local API; Free Sam vs Pro; empty-chart user for demo path

## Open questions / risks
- Waitlist is client-only (in-session) — no backend notify yet (intentional stub)
- `enforcePaywall` Dev toggle kept as legacy flag; no longer unlocks Free UI
