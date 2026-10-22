# Chart save overwrite report — Vercel lag (not code bug)

**When:** 2026-10-23 ~00:35 HKT (Asia/Hong_Kong)  
**Investigator:** executor (Chart save overwrite after #16)

## Verdict
**Deploy lag.** Benjamin saw the pre-#16 overwrite path because production Vercel was still on Soul `#15`, not Chart save UX `#16`. No remaining create/update collision bug found in `main` `profile/page.tsx`. No hotfix PR.

## Evidence

### Git
- `origin/main` tip = `e8cd46b` — Merge PR #16 (`feat/chart-save-ux`)
- Includes Update vs Save as new friend, `natal_chart_id` only on `saveIntent === "update"`, Add new person clears `editingChartId`, post-create `applyRow(newId)`.

### Vercel (before fix)
| Field | Value |
|-------|--------|
| Deploy id | `dpl_CaafCJ5cazREBXRsJJYAjQGmvkZk` |
| URL | https://hd-biohack-rju12wdn6-hdbh1.vercel.app (aliased to hd-biohack.vercel.app) |
| Ready | 2026-10-22 23:57 HKT |
| Commit | `00a2df0` — Merge PR **#15** Soul Bio-Sync |
| Profile chunk | `page-5c2b08168cd57c73.js` |
| Prod JS | Old path: `natal_chart_id: l && X ? X : void 0`; buttons “Calculate & save friend” / “Update chart” / “Save as me” — **no** “Save as new friend” / “Add new person” |

### Code review (`frontend/src/app/profile/page.tsx` @ e8cd46b)
- Create never sends `natal_chart_id` (`saveIntent === "update" ? editingChartId : undefined`) ✓
- Update freezes `slot_kind` via `frozenSlot` ✓
- `startNewPerson` clears `editingChartId` + ref ✓
- Create pins `editingChartIdRef` before `refreshPeople`; `applyRow` new id ✓
- Separate Update vs Save as new friend buttons when editing saved ✓

### Vercel (after redeploy)
| Field | Value |
|-------|--------|
| Deploy id | `dpl_H8Nie3SGA2mjFc6R43FJL3vV25t9` |
| URL | https://hd-biohack-2cx8tytpn-hdbh1.vercel.app → https://hd-biohack.vercel.app |
| Commit | `e8cd46b` — Merge PR **#16** Chart save UX |
| Profile chunk | `page-ab61c8c049ba7192.js` |
| Prod JS | Contains “Save as new friend”, “Add new person”, “Replace the saved chart”, “Editing …” |

## Action taken
Redeployed `frontend` from clean `e8cd46b` with `vercel --prod`. No code change / no hotfix branch.

## Notes for UX / PO
- Hard refresh /profile if CDN cache sticks briefly.
- Optional BE `slot_kind` freeze still local-only until Railway Hobby unpauses (FE create path no longer sends id, so overwrite should stop without BE).
- Bigger Me-chip vs Friends-list visual distinction still waits on @UX notes (no redesign in this pass).
