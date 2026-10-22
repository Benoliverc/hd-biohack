# Handoff — Chart Me/Friends UX (IA split)

## Status
- Ready for `@qa` Ship Gate
- Branch: `feat/chart-me-friends-ux`
- Spec / review: `.grok-handoff/chart-me-friends-ux-review.md` (+ prior save intents in `chart-save-ux-spec.md`)
- FE-first (Railway still paused). Keeps PR #16 create/update correctness.

## What changed
1. **YOU** dedicated card (growth soft) vs **Friends** chips only (`slot_kind=friend`, energy soft). Never `label||"Me"` on friends — `"Friend"` fallback. Extra `self` rows under **Other charts (you)**.
2. **You selected:** primary **Save as new friend** (omit `natal_chart_id`); secondary **Update your chart** with confirm naming Today/Protocols stakes. Friend name empty (not prefilled Me); create disabled until name entered; reject name `"Me"`.
3. **Friend selected:** primary Update “[Name]”; secondary Save as another friend.
4. **Full-width state bar** above form (`data-testid="editing-banner"`): Editing your chart / Editing [Name] / New friend — nothing overwritten.
5. **Add new person** with existing self → hide Me|Friend segment; primary **Save friend** only.

## Gate AC (from UX review)
1. You selected → primary is Save as new friend (or Save friend), not Update
2. You + Save friend → Me row unchanged
3. Friends list never chip titled Me
4. Add new person with existing self → no Me role control
5. State bar visible / prominent (full-width above form)

Also keep chart-save-ux AC: omit id on create, confirm overwrite, freeze slot_kind on update, 10-cap, Preview no persist.

## data-testid
- `editing-banner` (state bar), `add-new-person`, `you-row`
- `friend-chip-<id>`
- `save-as-new-friend` (primary when You selected)
- `calculate-save` (Update your chart when You; Update “[Name]” when Friend; Save friend / Calculate & save when new)
- `preview-only`

## Local smoke
```bash
cd frontend && npm run dev   # http://localhost:3000/profile
```
1. Select YOU → state bar “Editing your chart”; primary Save as new friend; secondary Update your chart.
2. Enter friend name + birth → Save as new friend → new Friends chip; YOU unchanged.
3. Add new person (with self) → no Me segment; Save friend; bar “New friend — nothing is overwritten.”
4. Friends chips never titled Me; You uses growth soft, friends energy soft.

## Verify
- `cd frontend && npx tsc --noEmit` (clean)
- `cd frontend && npm run lint` (pre-existing store.tsx warning only)

## Files
- `frontend/src/app/profile/page.tsx`
- `.grok-handoff/current_build.md`, `backlog.md`
