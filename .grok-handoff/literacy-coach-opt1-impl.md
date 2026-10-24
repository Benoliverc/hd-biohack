# Literacy coach Opt 1 — impl note

**Branch:** `feat/literacy-coach-opt1`  
**Date:** 2026-10-24 (Asia/Hong_Kong)  
**Scope:** FE-only (`frontend/` + `.grok-handoff/`). No backend.

## What shipped

- `CHART_LITERACY_STEPS` (6) + `SOUL_LITERACY_STEPS` (5) + `LITERACY_STORAGE_KEYS` in `frontend/src/lib/hdCopy.ts`
- `frontend/src/components/LiteracyCoach.tsx` — expanded / collapsed (“How to read”), Got it / Keep open
- Wired on `/profile` (when chart loaded) and `/soul` (when Aura result present)

## Persistence

| Key | Meaning |
|---|---|
| `baseline.literacy.chart.v1` | `"1"` = dismissed (collapsed; reopen pill remains) |
| `baseline.literacy.soul.v1` | same for Soul |

Re-open does **not** clear the key. Bump to `v2` to auto-expand again after IA changes.

## Jump target IDs (live DOM)

### Chart `/profile`
- `#bodygraph` — steps 1–3
- `#snapshot` — steps 4–5
- `#deep-dive` — step 6 (+ switches Deep dive tab to `core`)

### Soul `/soul`
- `#soul-hero`
- `#soul-spectrums`
- `#soul-cards` (stack wrapper)
- `#soul-card-spark_glue`
- `#soul-card-power_dynamics`
- `#soul-card-circuit_bridge`
- `#soul-card-somatic_playbook` (id on InsightCard; step 5 jumps to circuit_bridge)
- `#soul-conditioning`

## data-testid
- `chart-literacy-coach` / `soul-literacy-coach`
- `*-reopen`, `*-dismiss`, `*-keep-open`, `*-step-<id>`, `*-jump-<id>`

## Ship Gate
Not claimed here — @qa / Ship Gate owns PASS. Asserts + `npm run build` run before PR.
