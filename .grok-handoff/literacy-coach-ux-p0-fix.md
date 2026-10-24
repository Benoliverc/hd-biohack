# Literacy coach UX — P0.1 Chart narrow fix (PR #34 follow-up)

**Branch:** `fix/literacy-coach-ux`  
**Scope:** FE-only. No geometry / no gate clicks / no API.

## Blocker addressed
Ship Gate FAIL: Chart @375×720 first visit, coach expanded → Bodygraph heading ~y=888 (below 720vh fold).

## Changes
1. **`profile/page.tsx`** — flex reorder: Bodygraph grid `order-1 sm:order-2`, coach `order-2 sm:order-1`. On narrow, map is above the coach (Soul-under-Signature pattern). Desktop keeps coach-first.
2. **`LiteracyCoach.tsx`** — Chart narrow compact: `max-h-[min(32vh,240px)]`, step dots instead of stacked inactive titles, body `line-clamp-3`, tighter padding; sm+ unchanged accordion.
3. **`hdCopy.ts`** — Soft P1.4: Soul step title `Somatic playbook + Wire` (matches jump → `#soul-card-somatic_playbook` / DOM order).

## Local verify
- `npm run assert:gate-spacing` PASS
- `npm run assert:resets-in-hkt` PASS
- `npx tsc --noEmit` PASS
- `npm run build` PASS
- Structural: `#bodygraph` wrapper is `order-1` below `sm`; coach is `order-2` — Bodygraph paints before coach in first viewport on ~375 width (chrome ≈ header+title+person+nav only; coach no longer sits between nav and map).

## Not done
- Merge / Vercel
- Claim Ship Gate PASS (re-run Ship Gate QA)
