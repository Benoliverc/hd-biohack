# Feature 1 — Free / Pro truth + first-run identity

**PO:** Grok Bot · **Owner:** Full Stack Developer (@dev)  
**Source:** Baseline usability 10-persona Page — Rec #1  
**Branch suggestion:** `feat/free-pro-identity-truth`  
**Out of scope:** Real Stripe checkout wiring; Google OAuth wiring; account settings (name/password/timezone/delete) — those stay later.

## Problem
Live Baseline lies about entitlement and identity:
- Free Sam shows **Pro unlocked** and full Protocols because `NEXT_PUBLIC_ENFORCE_PAYWALL` defaults off → `biohackingUnlocked` is always true.
- Home still says Protocols unlock with Pro — contradicts live UI.
- Empty chart list **silently prefills Ra Uru Hu (1948 Montreal)** via `applyDemoBirth()` in `profile/page.tsx`.
- Signup 404 / Google OAuth is an alert stub — trust burn for new users.

## Goal
Tell the truth about Free vs Pro and whose chart this is. Unlock stays a stub/waitlist (no Stripe this PR).

## Acceptance criteria

### AC1 — Header badge matches `subscription_tier`
- Badge shows **Free** when `subscription_tier === "free"`, **Pro** when `biohacker_pro` (or equivalent).
- Do **not** show "Pro unlocked" merely because paywall env is off.
- Surfaces: `Header.tsx` (and any other tier chip).

### AC2 — Protocols gated for Free
- Free users hit `BiohackingEntitlementGate` (blurred preview + Unlock CTA).
- Pro / `biohacking_enabled` users get live Protocols.
- Change unlock logic so Free is gated even when `NEXT_PUBLIC_ENFORCE_PAYWALL` is unset/false.
- Keep admin/dev **Preview as Free** useful for Pro accounts.
- Align Home copy with reality (no "unlock later" while Free can already open full Protocols).

### AC3 — Unlock CTA honest
- Unlock button must **not** imply payment succeeded.
- Prefer: short **waitlist / coming soon** copy (mailto or inline "we'll notify you") **or** keep Stripe stub alert but relabel so it's clearly not live checkout.
- No fake success state.

### AC4 — Empty birth form; labeled demo only
- New / no-charts users: **empty** birth fields (no silent Ra).
- Remove auto `applyDemoBirth()` on empty `rows` in Chart/profile hydrate.
- Add explicit control e.g. **Try demo chart (Ra Uru Hu)** that calls the existing demo apply and is clearly labeled as a reference/demo — never implied as "your" chart.
- If a demo chart is loaded into the form, show a visible demo/reference banner until they clear or save their own.

### AC5 — No signup 404; hide dead Google
- Any "Sign up" / create-account path that 404s → replace with invite-only waitlist message on login (or remove the link).
- Hide or disable **Sign in with Google** until Supabase is wired (no alert-stub button in primary path). Login with existing password users stays.

### AC6 — Smoke tests
- Free user (e.g. Sam): badge Free; Protocols gated; Home copy coherent.
- Pro user: badge Pro; Protocols open.
- Empty chart user: form empty; demo only via labeled control; banner when demo active.
- No regression on Chart save / Me vs Friend.

## Key files (start here)
- `frontend/src/lib/store.tsx` — `biohackingUnlocked`
- `frontend/src/components/Header.tsx` — tier chip, Google stub, paywall toggles
- `frontend/src/components/BiohackingEntitlementGate.tsx` — Unlock CTA
- `frontend/src/app/page.tsx` — Home Free/Pro copy
- `frontend/src/app/profile/page.tsx` — `DEMO_BIRTH` / `applyDemoBirth` silent hydrate (~L403–405)
- `frontend/src/app/login/page.tsx` — Google stub / signup links
- Env docs: `DEPLOY.md` — note behavior change (tier gates even when `ENFORCE_PAYWALL` soft-false)

## Pipeline
1. Implement on branch → open PR.
2. Ping **UX UI Review** for live pass on Free Sam + Pro + empty chart demo path.
3. **Ship Gate QA** before merge.
4. Merge only after Benjamin yes via Grok Bot widget.

## Done when
All ACs above + UX soft P0s fixed + Ship Gate PASS. Report PR URL + tip SHA back to Grok Bot.
