# Handoff — Baseline build status

## Status
- **REVERTED** self-report Today check-in (Energy/Preferred-space chips + Main action)
- **Reason:** Benjamin chose revert. Scope change — future Today feature will **indicate** energy/preferred space from Human Design of today (transits/overlay), not ask the user.
- **Awaiting:** rewritten `.grok-handoff/current_spec.md` with HD-derived indication rules (PO)

## What was removed
- UI: `TodayCheckIn` on `/transits` (chips + Main action card)
- API: `PUT /checkin`, `GET /checkin/today`, `DailyCheckin` model, `backend/app/checkin/`, tests
- Frontend: `TodayCheckIn.tsx`, checkin helpers in `api.ts`
- Sky “What to do today” card restored to pre-check-in styling (growth card + protocol CTA)

## Production notes
- **Frontend:** redeploy Vercel so chips disappear from https://hd-biohack.vercel.app
- **Backend:** Railway builds may still be paused after env-var incident; removing UI is the critical path. Prod API never had `/checkin` live. If Railway can redeploy, tip will also drop checkin routes.

## Prior ships still live
- Deep dive domain tabs (PR #6)
- City picker without presets, chart nav, etc.
