# Handoff — Chart save UX (Me/Friend no silent overwrite)

## Status
- **PASS @qa Ship Gate** (2026-10-23 00:21 HKT) — not merged; awaiting ship call
- PR: https://github.com/Benoliverc/hd-biohack/pull/16
- Tip SHA: `0942bba` (`feat/chart-save-ux`) — polish after Ship Gate PASS
- Spec: `.grok-handoff/chart-save-ux-spec.md` — AC 1–10
- Independent of Railway Hobby pause for pure FE create/update split (API already inserts when `natal_chart_id` omitted). Optional BE `slot_kind` freeze needs API redeploy when builds resume.

## Polish (post Ship Gate)
- **After Save as new friend / create:** always `applyRow` the new chart id (synthesize row if list lag). Pin `editingChartIdRef` before `refreshPeople` await so `refreshPeopleOnOpen` cannot re-apply store Me (#33). `bindStore` still only when create-self with no prior self / unbound natal.

## What to gate
Run AC 1–10 from `chart-save-ux-spec.md` against this PR (local stack preferred). Confirm after create-friend the editor chip/banner selects the **new** friend, not Me.

## Local smoke
```bash
# Backend (optional slot_kind guard)
cd backend && source .venv/bin/activate
pytest tests/test_chart_save_ux.py -q
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend
cd frontend && npm run dev   # http://localhost:3000/profile
```
1. Sign in with ≥1 saved chart (Me).
2. Select Me → change birth city → **Save as new friend** with a name → new friend row; Me unchanged (same id/birth); **editor selects the new friend**.
3. Select Me → change city → **Update “Me”** → confirm → Me updates in place; cancel confirm → no save.
4. Select Friend A → **Save as new friend** “B” → A unchanged; B appears and is selected.
5. **Add new person** → banner “New person (not saved yet)”; form cleared; Calculate & save does not send `natal_chart_id`; after save, new row selected (not Me).
6. At 10 people: create disabled with limit copy; Update still works.
7. Update path: role badge frozen (no Me↔Friend toggle).
8. Empty friend name on create-friend → inline error.
9. Preview only never persists.
10. After create-friend, Me still in Saved people; store Me not stolen.

## data-testid
- `editing-banner`, `add-new-person`
- `calculate-save` (Update on saved path; Calculate & save on new path)
- `save-as-new-friend`
- `preview-only`

## Files
- `frontend/src/app/profile/page.tsx` (primary)
- `backend/app/api/routes.py` (optional slot_kind mismatch → 400)
- `backend/tests/test_chart_save_ux.py`
- `.grok-handoff/chart-save-ux-spec.md`, `current_build.md`, `backlog.md`

## Verify locally
- `cd frontend && npx tsc --noEmit` (clean)
- `cd frontend && npm run lint` (pre-existing store.tsx warning only)
- `pytest tests/test_chart_save_ux.py` → 2 passed
