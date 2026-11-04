# Current build — PR #51 Admin Pro/Free (post-#50)

## SHIPPED — PR #50 Nav clarity A+B
- **Merge SHA:** `9af2847` · docs tip `3a78466`
- **Vercel:** READY `dpl_C1xXnA9Sn88Tb792ae4qZUjGWjZ4` · https://hd-biohack.vercel.app
- **Railway:** skipped (FE-only)

## THIS PR — #51 Admin Pro/Free plan toggle
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/51
- **Branch:** `feat/admin-pro-free-toggle`
- **Tip SHA:** `cade240` (`cade2408d4e8156cdd34b786a5e11385ee959fd4`) — feat; docs/head was `869e793`
- **Handoff:** `.grok-handoff/admin-pro-free-toggle-2026-11-04.md`
- **Benjamin:** “Also in the admin profile, Benjamin.. Create a toggle so I can change between Pro and Free.” · merge yes granted
- **Status:** Merging after #50 · FE + Railway
- **Scope:** FE + API auth hardening (Railway needed for API)

## What changed
1. **Admin “Your plan” card** on `/admin` (allowlisted admin only): Free ↔ Pro segmented control targeting **self** via `api.setTier(user.id, tier, actorUserId)`.
2. **Store `mergeUser`** — patches user in place so Header badge + Protocols gate update without clearing natal / logout.
3. **API harden** `PATCH /users/{id}/tier`: requires `actor_user_id` allowlisted admin; **v1 self-only** (`actor.id == user_id`). Sets `subscription_tier` + `biohacking_enabled` consistently.
4. **i18n** admin.plan* keys en + nl/de/fr/es.
5. Header **Preview as Free** unchanged (session-only).

## Files
- `frontend/src/app/admin/page.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/store.tsx`
- `frontend/src/lib/i18n/messages/{en,nl,de,fr,es}.ts`
- `backend/app/api/routes.py`
- `backend/tests/test_usage_admin.py`

## Deploy note
- **FE (Vercel) + API (Railway)** — auth change on tier endpoint.
- Soft residual (card under Usage H1) optional — leave it.
