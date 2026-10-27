# Protocols C — Prove-it checklist + weekly rollup

**Branch:** `feat/protocols-prove-it-checklist`  
**Date:** 2026-10-27 (Asia/Hong_Kong)  
**Scope:** Local-only FE (no server sync, no proposal A)  
**Not touched:** `feat/power-dynamics-unique-copy`

## UX changes
1. **Progress bar** on Today’s Move (`N/M done · pct%` + bar).
2. **Complete feedback** — banner “Today’s move complete — nice work.” when all move items checked; brief pulse on the transition.
3. **Optional note** — when an item is checked, a note field appears (blur/Enter to save, max 120 chars).
4. **Baseline kit checkable** — each baseline row is a checkbox with its own mini progress; notes supported.
5. **Week rollup** — “This week → Completed this week” lists Mon–Sun HKT checks with day label, baseline badge, and notes. Empty state when nothing checked. Footer: “stored on this device.”

## Storage
- v2 key: `hd-biohack:protocol-done:v2:{userId}:{chartId}:{YYYY-MM-DD}` → `{ items: { id: { done, label, kind, note? } } }`
- Migrates v1 boolean maps on first read.
- Week view reads the seven HKT Mon–Sun day keys (no separate week key needed).

## Files
- `frontend/src/lib/protocolCompletions.ts` (new)
- `frontend/src/app/biohack/page.tsx`
- `frontend/scripts/assert-protocol-completions.mjs` + npm script

## Verify
1. `cd frontend && npm run assert:protocol-completions`
2. `cd frontend && npx tsc --noEmit`
3. Manual on `/biohack` (Pro): check hero + timed leads → progress fills → complete banner; add a note; open Baseline kit → check an item; scroll to This week → see “Completed this week”.
4. Refresh page — checks and notes persist (same browser). New HKT day resets day’s move progress; week list still shows earlier days in the Mon–Sun window.

## Risks
- **Device-local only** — no cross-browser / logout sync (intentional S).
- **Label stamp at check time** — if sky refresh renames a lead mid-day, week history keeps the label from when it was checked.
- **Note inputs use defaultValue** — external note updates won’t live-edit an open field (blur saves).
- **Baseline ids are index-based** (`baseline:0`) — if kit order changes, done state may stick to the wrong row until unchecked.
