# Handoff — Soul Aura Alchemy P0 (kill Fit %)

## Status
- Ready for `@qa` Ship Gate
- Branch: `feat/soul-aura-alchemy`
- Spec: `.grok-handoff/soul-aura-alchemy-spec.md` (supersedes Bio-Sync Fit % in soul-biosync-spec.md)
- FE + API same PR (schema break). Railway may lag — FE shows API/schema missing state.

## What changed
1. **Killed Fit %** — removed `natural_fit` / `regulated_fit` / vectors / archetype / co-reg toggles from `POST /soul/sync` + `/soul`.
2. **Layer A** — Aura Signature hero (5 ids, priority) + optional secondary sub-badge.
3. **Layer B** — Rare Alchemy badges (mutual Split→Single via `derive_definition`, shared G, 59-6 EM, 10-20-34 triad + false-positive guard, 19-49 companionship, mirror gates, 8-1 / 9-0).
4. **Layer C** — Auric Charge / Circuit Continuity / Somatic Pacing spectrums; pacing high end uses `text-energy` (amber), never danger-red.
5. **Playbooks** — `life` (default) / `work` / `play` reorder cards only (client-side + API `card_order`).
6. **Cards** — circuit_bridge, spark_glue, power_dynamics, somatic_playbook (≤3 templated protocols).
7. Bidirectional hanging bridges; protocols request field ignored.

## Gate AC
Spec AC 1–15. Pytest covers signatures, each badge (incl triad false-positive), spectrums, cards, playbook invariance, no Fit fields.

## Local smoke
```bash
cd backend && .venv/bin/python -m pytest tests/test_soul_sync.py -q
cd frontend && npm run dev   # http://localhost:3000/soul
```
1. ≥2 charts → Signature hero, badges, 3 spectrums, 4 cards — **no** Fit %.
2. Switch Life/Work/Play → cards reorder; signature/spectrums unchanged.
3. Sacral↔non-Sacral → sacral_aura_hygiene; double Emotional → double_emotional.
4. Old API / Fit schema → `soul-api-missing` banner.

## data-testid
- `soul-hero`, `soul-signature`, `soul-secondary-signature`, `soul-badges`, `soul-badge-<id>`
- `soul-spectrum-auric_charge|circuit_continuity|somatic_pacing`
- `soul-cards`, `soul-card-<id>`, `soul-playbook`, `soul-context-life|work|play`
- `soul-api-missing`, `soul-empty`, `soul-cta-chart`

## Verify
- `cd backend && .venv/bin/python -m pytest tests/test_soul_sync.py -q` → 15 passed
- `cd frontend && npx tsc --noEmit` → clean

## Files
- `backend/app/hd/soul_sync.py`
- `backend/app/schemas.py`, `backend/app/api/routes.py`
- `backend/tests/test_soul_sync.py`
- `frontend/src/app/soul/page.tsx`, `frontend/src/lib/api.ts`
- `.grok-handoff/soul-aura-alchemy-spec.md`, `current_build.md`
