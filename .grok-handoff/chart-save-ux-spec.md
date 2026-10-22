# P0 — Chart save UX: Me vs Friend (no silent overwrite)

**Status:** Ready for `@qa` Ship Gate (implemented on `feat/chart-save-ux`)  
**Route:** `/profile` (Chart) — people list + birth form save  
**App:** Baseline (hd-biohack)  
**Date:** 2026-10-23 (HKT)  
**PO:** Benjamin Lammens  

Related: Soul Bio-Sync (`soul-biosync-spec.md`) depends on saving **distinct** friend charts — this bug blocks that funnel. Admin usage (`admin-usage-spec.md`) and Today indication stay separate. Railway Hobby builds may still be paused — FE can ship on Vercel; API changes need redeploy when builds resume.

---

## Goal (plain language)

As a Baseline user on **Chart**, I want to know **who I’m editing**, and choose clearly between:

1. **Update this person** (overwrite *only* the selected Me or Friend), or  
2. **Save as new friend** (always insert a new row — never touch Me or another friend).

I should never lose my own chart (or a friend’s) because I flipped “Save for a friend” and hit Save.

Tone: calm, explicit — Oura-style clarity, not a dating-app merge.

---

## Root cause (diagnosed 2026-10-23)

| Layer | What happens today |
|---|---|
| FE selection | Tapping a saved person runs `applyRow` → sets `editingChartId = row.id` and fills the form. There is **no “Add new person”** control that clears `editingChartId`. |
| FE save | `submit(true)` sets `updatingExisting = editingChartId != null`. If true, it always sends `natal_chart_id: editingChartId`. |
| FE “Save as” toggle | “Save as me” / “Save for a friend” only changes `slot_kind` + `label`. It does **not** clear `editingChartId` and does **not** mean “create new.” |
| FE button copy | When `saveAs === "friend"`, the primary button always reads **“Calculate & save friend”** even while a person is selected — so users think they’re adding a friend while the API updates the selected row. |
| BE upsert | `POST /chart/calculate` with `save=true` + `natal_chart_id` loads that row and **overwrites** birth fields, `chart_json`, `label`, and `slot_kind` in place. No confirm. Insert only when `natal_chart_id` is omitted. Cap = 10 rows/user. |

**User-visible failure:** Select Me → change birth data / name → choose “Save for a friend” → Save → **Me’s row is rewritten** as that friend (label + slot_kind + chart). Same pattern if Friend A is selected and they try to add Friend B.

API upsert itself is correct for intentional updates; the bug is **missing explicit create vs update intent** in the Chart UI (and misleading copy).

---

## What already exists (grounding)

| Area | Today |
|---|---|
| Model | `natal_charts`: `id`, `user_id`, `label`, `slot_kind` (`self` \| `friend`), birth fields, `chart_json`, `created_at`. **No** unique constraint on `(user_id, slot_kind)` — multiple `self` rows possible. |
| API | `POST /chart/calculate` — calc always; persist when `save` + `user_id`. Update iff `natal_chart_id` owned by user; else insert (cap `MAX_CHARTS_PER_USER = 10`). `GET/PATCH/DELETE /charts/...` already work. |
| FE | `/profile`: Saved people chips, birth form, Preview, single primary Save. Store binds `natalChartId` for Today/Protocols/Soul “You”. |
| Cap | FE `MAX_PEOPLE = 10` mirrors backend. |

**Implication:** Prefer a **UX + FE intent** fix first. Optional small API hardening (confirm flag / reject slot_kind flip without intent) is nice-to-have, not required if FE never sends ambiguous upserts.

---

## P0 scope (must ship)

### In

1. **Explicit selected person**  
   - Always show who is active: chip highlight + one-line banner under Saved people / above form:  
     - Editing **“Me”** (chart #N) · or Editing **“Alex”** (friend) · or **New person (not saved yet)**.  
   - Store-bound natal for Today/Protocols may stay on Me; Chart local `editingChartId` is the save target.

2. **“Add new person” control**  
   - Button on Saved people row (or next to chips): **Add new person**.  
   - Clears `editingChartId`, clears/empties birth form (or leaves blank — **do not** silently load DEMO into a “new friend” path users will save; DEMO only for truly empty first-time users as today).  
   - Sets `saveAs` default to `friend` if a `self` already exists; else `self`.  
   - Sets `viewMode` so UI is clearly “new,” not “saved.”

3. **Two primary save actions (no ambiguous single button)**  
   When a **saved** person is selected (`editingChartId` set, viewMode saved):  
   - **Update [Name]** → `save=true` + `natal_chart_id=editingChartId` + current form + existing `slot_kind` (do **not** flip Me→Friend via the toggle alone).  
   - **Save as new friend** → `save=true`, **omit** `natal_chart_id`, `slot_kind=friend`, require non-empty friend name (trim; error if empty).  

   When **new person** (`editingChartId == null`):  
   - One primary: **Calculate & save** with chosen Me vs Friend.  
   - Me: `slot_kind=self`, label default `"Me"` (or custom name).  
   - Friend: `slot_kind=friend`, name required.

4. **Confirm before overwrite**  
   - On **Update [Name]**, if the selected row already has a saved chart (always true for update path), show `window.confirm` (or inline modal):  
     `Replace the saved chart for “[Name]” with these birth details?`  
   - Cancel → no API call.  
   - **Save as new friend** never confirms overwrite of another person (it inserts).  
   - Optional soft warn if new friend name collides with an existing label (allow save; collision is OK).

5. **Retire misleading “Save as me / Save for a friend” as the sole save intent**  
   - Keep a quiet **role** control only on the **new person** path (Me vs Friend).  
   - On the **update** path, do not offer a toggle that silently changes `slot_kind` from self→friend (or reverse) without a separate, confirmed “Change role” action — **out of P0** to support role change; freeze `slot_kind` on update to the row’s current value.

6. **Max 10 people**  
   - Honor existing cap. **Save as new friend** / new Me disabled at 10 with copy:  
     `At the 10-person limit — delete someone to add a new person. You can still update the selected person.`  
   - Update remains allowed at cap.

7. **Empty / error copy**  
   - No people: `None yet — add your chart or a friend’s below.`  
   - Friend name missing on friend save: `Enter a name for this friend.`  
   - Cap: as above.  
   - API 404 chart: `That person was deleted — pick someone else or add new.`  
   - Generic save failure: keep current error surfacing.

8. **After save**  
   - Update path: stay on that person; refresh people list; refresh store natal if updated id === store id.  
   - New friend path: select the new row (`applyRow`); do **not** steal Today’s bound Me unless user had no self and saved as self.

### Out of P0

- Multi-self merge / “promote friend to Me.”  
- Server-side confirm token.  
- Bulk import, sharing charts between accounts.  
- Renaming-only UI redesign (PATCH label already exists — keep × delete + optional rename later).

### Why this cut

Backend upsert is fine; users need **visible target + separate create**. Smallest fix that stops silent Me destruction and unblocks Soul friend saving.

---

## API notes (minimal change)

| Case | Request |
|---|---|
| Update selected | `save=true`, `natal_chart_id=<id>`, `slot_kind` = **existing row’s** kind, label as edited name for that person |
| Save as new friend | `save=true`, **no** `natal_chart_id`, `slot_kind=friend`, `label` required non-empty |
| Save new Me | `save=true`, no `natal_chart_id`, `slot_kind=self` |

**Optional hardening (same PR if cheap):**  
If `natal_chart_id` set and body `slot_kind` ≠ row.slot_kind → **400** `"Use update without changing role, or save as a new person."` — forces FE discipline. Not mandatory if FE freezes slot_kind on update.

No new endpoints required.

---

## FE implementation sketch (`profile/page.tsx`)

1. Add `startNewPerson()` — clear `editingChartId`, `chart` optional, `savedForm`, form fields, set banner state `mode: "new"`.  
2. Split `submit(save, intent: "update" | "create")` instead of inferring create solely from `editingChartId`.  
   - `update` requires `editingChartId`; confirm; send id.  
   - `create` **never** sends `natal_chart_id` even if a stale id exists.  
3. Button row:  
   - Selected saved: `[ Update “Name” ]` `[ Save as new friend ]` + Preview link.  
   - New: `[ Calculate & save ]` + Me/Friend role + Preview.  
4. Fix button labels so “friend” never appears on the update button.  
5. Tests / manual AC below; keep `data-testid` on primary actions (`calculate-save` can map to Update when in update mode; add `save-as-new-friend`).

---

## Acceptance criteria

1. Given Me is selected, when I enter a friend’s birth data and tap **Save as new friend**, then a **new** `natal_charts` row is created (`slot_kind=friend`) and Me’s row is **unchanged** (same id, birth, chart_json).  
2. Given Me is selected, when I change birth city and tap **Update “Me”** and confirm, then Me’s row updates in place and people count stays the same.  
3. Given Me is selected, when I tap **Update** and cancel the confirm, then no API save occurs and Me is unchanged.  
4. Given Friend A is selected, when I tap **Save as new friend** with name “B”, then Friend A is unchanged and Friend B appears in Saved people.  
5. Given I tap **Add new person**, then banner shows new/unsaved, form is empty (or cleared), and Save does **not** send `natal_chart_id`.  
6. Given 10 people saved, **Save as new friend** / new save is disabled with limit copy; **Update** still works.  
7. Given update path, UI does not offer a toggle that changes `slot_kind` without a separate confirmed flow (frozen to current).  
8. Empty friend name on create-friend → inline error, no save.  
9. Preview only still never persists.  
10. After create-friend, Soul (when live) can pick the new friend without Me disappearing from the list.

---

## Ship notes

- Spec only until `@dev` implements; hand to `@qa` Ship Gate vs AC 1–10.  
- Prefer one PR: FE Chart save UX (+ optional API slot_kind guard).  
- Prod API guard needs Railway redeploy; pure FE create/update split helps as soon as Vercel ships if API already supports omit-`natal_chart_id` insert (it does).

---

## Files likely touched

- `frontend/src/app/profile/page.tsx` (primary)  
- Possibly `frontend/src/lib/api.ts` (testid / types only if needed)  
- Optional: `backend/app/api/routes.py` slot_kind mismatch guard + one pytest  
- This spec: `.grok-handoff/chart-save-ux-spec.md`
