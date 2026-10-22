# Handoff — Soul Bio-Sync P0 (You ↔ Friend)

## Status
- **READY FOR @qa Ship Gate** (PR open; not yet merged)
- PR: https://github.com/Benoliverc/hd-biohack/pull/15
- Tip SHA: `9872235` (`feat/soul-biosync`)
- Spec: `.grok-handoff/soul-biosync-spec.md` — AC 1–13
- Independent of Admin / Today Railway redeploy

## What to gate
Run AC 1–13 from `soul-biosync-spec.md` against this PR (local stack preferred while Railway Hobby builds are paused).

## Local smoke
```bash
# Backend
cd backend && source .venv/bin/activate   # or fresh venv + pip install -r requirements.txt
python tests/test_soul_sync.py           # pure scorer (may need import bootstrap if pyswisseph missing)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend
cd frontend && npm run dev               # http://localhost:3000/soul
```
1. Sign in; ensure ≥2 saved charts on Chart (self + friend).
2. Open **Soul** (nav after Chart, before Today) — `aria-current` on `/soul`.
3. Pick You ↔ Friend; switch Work / Life / Play — Fit % changes, vector numbers stay.
4. Confirm Natural Fit, three meters, archetype, Split-Bridge (if applicable), conditioning strip, co-regulation toggles.
5. Free tier: no Pro wall.
6. With only one chart: empty CTA → Chart.
7. If API 404: banner “Soul sync needs an API update”.

## Backend unit coverage (`backend/tests/test_soul_sync.py`)
- EM +18 Voltage
- Split-Bridge +15 + callout payload
- Compromise −18 Ease
- Emotional vs Sacral/Splenic −15; `emotional_wait` raises regulated
- 9-0 badge + −12 Ease
- Sacral asymmetry −10
- Context weights change Fit, not vectors
- Open Solar Plexus ← defined friend amplifier hint
- Profile harmony + yield_compromise restore

## Files
- `backend/app/hd/soul_sync.py` — pure `compute_soul_sync`
- `backend/tests/test_soul_sync.py`
- `backend/app/schemas.py` — SoulSyncIn/Out
- `backend/app/api/routes.py` — `POST /soul/sync` (ownership 404/403/400)
- `frontend/src/app/soul/page.tsx`
- `frontend/src/components/Header.tsx` — Soul tab + Sparkles
- `frontend/src/lib/api.ts` — `soulSync` + types
- `.grok-handoff/soul-biosync-spec.md`, `backlog.md`

## Production note
Railway Hobby **builds still paused** — `/soul/sync` will 404 on prod API until redeploy from `main` after merge. Vercel FE can ship earlier; page shows API-update banner on 404.

## Open questions
- None blocking P0. P1: persist toggles, dual BodyGraph, circle rank (see spec backlog).

## Next
1. @qa Ship Gate AC 1–13
2. Merge → Vercel FE
3. When Railway unpauses: redeploy `api` from `main` so `/soul/sync` is live
