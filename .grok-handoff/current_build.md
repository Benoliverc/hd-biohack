# Current build: Snapshot Environment line

- **Date:** 2026-11-25 (Asia/Bangkok, UTC+7)
- **Brief:** `/workspace/reports/baseline-snapshot-environment-line-build-brief-2026-11-25.md`, sha256 `681c6bae864ad476b945017166880fd241309afeca5227c07ef452e2bd34e356` (verified before build)
- **Go:** Benjamin's Go (relayed 25 Nov 2026, 3:10 PM Bangkok) approves the build only. It is not a merge or ship yes.
- **Base:** main `e3901e385d5d15e88b333a1fa4af040f3de1d193` (merge of #148; origin/main verified after fetch)
- **Branch:** `feat/snapshot-environment-line` (worktree `/workspace/hd-snapshot-environment`)
- **Code commit:** `859cfb1`. The PR tip is the handoff commit on top of it. Take the exact tip from `gh pr view`.
- **Ships (later, after a tip-bound merge yes only):** frontend **and** backend together — Vercel + Railway. A Vercel-only deploy would show no Environment box (the page hides it when the API sends no `environment`), so the brief forbids shipping one side alone. No env, schema, migration or lockfile changes.

## What changed
### Backend
1. `app/hd/mandala.py`: `COLOR_SPAN = LINE_SPAN/6` (0.15625°), `TONE_SPAN = COLOR_SPAN/6`, `longitude_to_color_tone()` on the same 302° wheel; the exact end of a line/Color clamps to 6.
2. `app/hd/environment.py` (new): Environment = Color of the Design North Node, asserted equal to the Design South Node (mismatch raises `EnvironmentNodeMismatch`). 1 Caves, 2 Markets, 3 **Workshops** (comment: traditional HD 'Kitchens'), 4 Mountains, 5 Valleys, 6 Shores. Tone 1–3 left, 4–6 right (API only, not shown).
3. `calculate_chart` adds flat `environment`, `environment_color`, `environment_tone`, `environment_orientation` (from exact node longitudes). `activations[].color` is untouched.
4. `GET /charts/{user_id}`: `chart` is `with_environment(chart_json)` — derived on read from the stored design-node longitudes, no migration and no write-back. If those longitudes are missing (or the rounded stored NN/SN disagree at a boundary), the keys are omitted and the page omits the box.

### Frontend (/profile #snapshot only)
1. New last disclosure `ChartDisclosure testId="snapshot-environment"`, full width after Definition (outside the 2-col row), collapsed, label-first `Environment: Mountains`. Feature name and values English in every locale.
2. `time_unknown` true → title `Environment: {Value} ({marker})` (approximate / ungefähr / aproximado / approximatif / ongeveer) and the locked caveat first in the body. Known time (incl. a deliberate noon) and legacy null → no mark, no caveat. The How you decide caveat is unchanged.
3. Body is the locked short copy (6 Colors × 5 locales, verbatim from the brief, all ≤ 80 words / 500 chars). No Deep dive pointer.
4. Copy lives in the new `src/lib/essays/snapshotEnvironmentCopy.ts` (reuses the clarity-pass budget constants). The three locked clarity-pass maps are untouched (digest `0f9cf0b7…` still passes).
5. i18n: `chart.people.environment` = `Environment` ×5 (parity holds).
6. **Decision:** unsaved previews also carry the mark. A new `previewTimeUnknown` state is set when "Preview without saving" runs, so `environmentApprox = saved ? savedTimeUnknown : preview ? previewTimeUnknown : false`.

## Files
- Backend (+391 −1): `app/hd/mandala.py`, `app/hd/environment.py` (new), `app/hd/chart.py`, `app/api/routes.py`, `tests/test_environment.py` (new), `tests/test_chart_reference.py`
- Frontend (+279 −12): `src/app/profile/page.tsx`, `src/lib/essays/snapshotEnvironmentCopy.ts` (new), `src/lib/i18n/messages/{en,de,es,fr,nl}.ts` (+1 key each), `package.json` (+1 assert script; lockfile untouched), asserts: new `scripts/assert-chart-snapshot-environment-line.mjs`; updated `assert-chart-snapshot-strategy-definition.mjs`, `assert-chart-bodygraph-revert.mjs`, `assert-chart-snapshot-clarity-pass.mjs` (4 → 5 boxes; pointer count stays 2; frozen-file hashes and copy digest unchanged)

## Reference pins
- **Ra Uru Hu** (`test_ra_uru_hu_reference`, 9 Apr 1948 00:05 Montreal): Design NN 23.3 → **Shores**, Color 6, Tone 2, left. Published match: Ra's own Environment lecture in "Radical Transformations – The Four Lectures" (Jovian Archive, 2006): on Shores, "This is mine."; Maia Mechanics (Jovian-licensed) per thehumandesignsystem.com founder-chart post: Design Nodes Tone 2.
- **Obama cross-check** (`test_environment.py`, 4 Aug 1961 19:24 HST Honolulu): Design NN 59.4 → Color 3, Tone 3 → **Workshops** (published "Environment Left 3", traditional Kitchens; omnicharts.app; NN 59.4 also on the humandesignsystem.com chart PDF).

## Preview
- Frontend `http://127.0.0.1:3165` (`/workspace/day7-tools/start-snapshot-environment.sh`, log `snapshot-environment-3165.log`), production build of this branch with the API rewrite baked in.
- Local API `http://127.0.0.1:8165` from this worktree's backend (`/workspace/day7-tools/start-env-api.sh`, log `env-api-8165.log`) on its own copy `/workspace/day7-tools/env3165.sqlite`. :8159/day7.sqlite is untouched.
- Invented local accounts only. Seeded on the copy: mge friends Ines (#11, time unknown → Workshops, approximate) and Lena (#12, known noon → Workshops); Theo (#10) set to legacy `time_unknown = NULL` (Valleys, no mark).
- :3159, :3161, :3163 left running.

## Tests
- Backend pytest on clean `git archive` copies: base e3901e3 **25 failed / 259 passed**; PR **25 failed / 293 passed**; identical failing set (+34 new passing tests).
- `tsc --noEmit` clean; `next lint` 0 errors / 6 warnings (same as main); `next build` OK.
- 62 of 63 `assert:*` PASS incl. the new `assert:chart-snapshot-environment-line`; `today-protocols-ia` is the expected red (same as main). Revert-interactions test PASS.
- Browser (Playwright headless, 320/375/390/desktop): all six Colors, time known / unknown / known noon / legacy null / unsaved preview with unknown time, en + de/es/fr/nl. `check-captures.py`: 54 captures, 0 failing.
- Evidence: `/workspace/reports/snapshot-environment-line-2026-11-25/`

## Open questions
1. The Ra pin rests on Ra's own lecture statement plus a Jovian-licensed Tone 2 read, not a printed Variables chart (Jovian/Genetic Matrix/myBodygraph Variables need an account). Both agree with Baseline's Shores.
2. Preview mode (unsaved) also shows the approximate mark via the new `previewTimeUnknown` (the brief only names saved `time_unknown`).
