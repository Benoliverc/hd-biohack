# Current build — Free / Pro truth + first-run identity (IN PROGRESS)

- **Branch:** `feat/free-pro-identity-truth`
- **Base:** `main` @ `17b5c99` (PR #41 shipped)
- **Handoff:** `.grok-handoff/free-pro-identity-truth.md`
- **Status:** implementing ACs → open PR → UX UI Review → Ship Gate (do **not** merge without Benjamin yes)
- **Out of scope:** real Stripe, Google OAuth wiring, account settings

## Files touched
- `frontend/src/lib/store.tsx` — `biohackingUnlocked` follows tier / `biohacking_enabled`; ignore soft-false paywall env
- `frontend/src/components/Header.tsx` — Free/Pro badge from tier; Sign in → `/login` (no Google stub); Preview as Free always usable
- `frontend/src/components/BiohackingEntitlementGate.tsx` — Pro waitlist CTA (no fake checkout success)
- `frontend/src/app/page.tsx` — Home copy aligned with Free gate
- `frontend/src/app/profile/page.tsx` — no silent Ra prefill; labeled Try demo + demo banner
- `frontend/src/app/login/page.tsx` — invite-only waitlist; Google stub removed
- `DEPLOY.md` — tier gates even when `ENFORCE_PAYWALL` / `NEXT_PUBLIC_ENFORCE_PAYWALL` soft-false

## Preview notes
- Local: `frontend` `npm run dev` + API; sign in as Free Sam vs Pro; empty-chart user for demo path
- Vercel preview: after PR open (if CI previews enabled)

## Open questions / risks
- Waitlist is client-only (session memory) — no backend notify yet (intentional stub)
- `enforcePaywall` Dev toggle kept as legacy flag; no longer unlocks Free UI
