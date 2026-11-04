# Current build — Admin Pro/Free plan toggle

- **PR:** https://github.com/Benoliverc/hd-biohack/pull/51
- **Branch:** `feat/admin-pro-free-toggle`
- **Tip SHA:** `cade240` (`cade2408d4e8156cdd34b786a5e11385ee959fd4`) — feat; docs/head `869e793` (`869e793d84739458a0a0d1acbf0c21cd684f66ac`)
- **Handoff:** `.grok-handoff/admin-pro-free-toggle-2026-11-04.md`
- **Benjamin:** “Also in the admin profile, Benjamin.. Create a toggle so I can change between Pro and Free.”
- **Status:** READY FOR UX → Ship Gate → Benjamin merge yes. **Hold merge.**
- **Scope:** FE + API auth hardening (Railway needed for API)

## Parallel
- **PR #50** Nav clarity A+B — awaiting Ship Gate / Benjamin yes (separate branch; do not mix).

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

## Assert
- `cd frontend && npx tsc --noEmit` → pass
- `backend/.venv/bin/python -m pytest tests/test_usage_admin.py::test_set_tier_requires_admin_and_self_only -q` → pass

## Deploy note
- **FE (Vercel) + API (Railway)** — auth change on tier endpoint.

## Open questions
- Hold merge for Benjamin yes after UX → Ship Gate.
