# Literacy coach Opt 1 — UX polish (post–Ship Gate)

**Source:** `.grok-handoff/literacy-coach-opt1-ux-critique.md`  
**Branch:** `fix/literacy-coach-ux`  
**Scope:** FE-only. Ship Gate Opt 1 PASS stands; this PR is polish — do **not** claim a new Ship Gate PASS until Ship Gate QA re-runs.

## Changes

### P0
1. **Density:** `LiteracyCoach` accordion — one step expanded at a time; Prev/Next; `max-h-[50vh]` + inner scroll. Soul coach moved **under** Aura Signature (before spectrums).
2. **Soul scroll-margin:** `--soul-scroll-mt` + `#soul-hero`, `#soul-spectrums`, `#soul-conditioning`, `[id^="soul-card-"]`; `jumpSoulSection` waits two frames.
3. **Copy:** Soul step 2 title → `Charge · continuity · pacing` (no Fit% / ≠ Fit % strings).

### P1
- Chart jumps: `#bodygraph-legend`, `#snapshot-centers` (honest labels).
- Removed Keep-open no-op.
- `min-h-10` (≥40px) on Jump / Got it / Prev / Next / reopen pill.
- Soul steps reorder to DOM: Signature → Spectrums → Somatic → Power → Spark.

### P2 left
- Hydration skeleton still `h-10` (possible layout jump on first expand).
- Optional “How to read” in ChartSectionNav / Soul Playbook row — not done.
- Meta contrast bumped to `text-xs text-fg-muted` (partial P2).

## Verify
- `npm run assert:gate-spacing` PASS
- `npm run assert:resets-in-hkt` PASS
- `npm run build` PASS
