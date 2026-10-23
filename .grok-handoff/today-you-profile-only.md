# P0 — Today always uses You / Me natal (never a friend)

**Status:** Ready for `@dev` (spec only — do not implement in this handoff turn)  
**App:** Baseline (hd-biohack)  
**Route:** `/transits` (nav label **Today**)  
**Date:** 2026-10-23 (Asia/Hong_Kong)  
**Live:** https://hd-biohack.vercel.app/transits  
**Repo:** https://github.com/Benoliverc/hd-biohack  

**User ask:** For Today, it should **always** be the **"you" / Me** profile. Make that clear in the UI and update so Today cannot be driven by a friend chart.

**Related:** `chart-me-friends-ux-review.md` (You vs Friends IA; copy already says “Today & Protocols use this chart”), `current_spec.md` / `today-hd-indication-ux-review.md` (indication assumes *your* natal × sky).

**Out of scope (do not break):** Soul friend picker / Bio-Sync; Chart `/profile` Me↔Friend editing; detection/copy for Soul Signatures. Protocols (`/biohack`) share the same store — optional soft hardening below, but **P0 acceptance is Today only**.

---

## Root cause

Today does **not** have its own chart picker. It reads the **global sticky natal** from `AppProvider` and passes that id to `GET /transits/today?natal_chart_id=…`.

That sticky id can be a **friend** (or newest non-self row), so indication + overlay condition a friend’s design while the user expects “you.”

### How selection works today

| Layer | Behavior |
|---|---|
| Store | `natalChart` / `natalChartId` in `frontend/src/lib/store.tsx` — shared by Chart, Today, Protocols |
| Sticky | `localStorage` key `hd-biohack:selected-chart:${userId}` |
| Hydration | On user load: prefer sticky id if still in `/charts/{user}`; else **`rows[0]`** |
| Charts API | `GET /charts/{user_id}` → `order_by(NatalChart.id.desc())` — **newest first** |
| Chart page | `selectPerson`: friends **usually** skip store bind when Me already bound (`bindStore = row.slot_kind !== "friend" \|\| natalChartId == null`) — good, but incomplete |
| Today page | Blindly `api.transitsToday(natalChartId ?? undefined)` — no `slot_kind` check |
| Summary type | `NatalChartSummary` has **no** `slot_kind` — UI cannot tell Me vs friend without re-fetch |

### Why a friend can win

1. **Store fallback = newest row.** If sticky missing/stale, `rows[0]` is the latest save. Saving a friend after Me makes Today overlay the friend.
2. **Sticky can already be a friend.** Older bind paths, `natalChartId == null` + select friend, or delete fallback `applyRow(rows[0])` (default `bindStore: true`) write a friend id into localStorage; store reloads it forever.
3. **Chart `pickPreferredRow` trusts store id first** — if store already holds a friend, Chart hydrate reinforces it (`preferId` match before self).
4. **Today copy is ambiguous.** Subtitle `Overlaying {label} · city · date (#id)` can show a friend name with no “You / locked” affordance and no picker to correct it on Today.

Chart’s friend chips are **edit targets** (local `editingChartId`); they are not meant to drive Today — but store hydration + sticky still can.

---

## Product rule (P0)

> **Today always overlays the user’s self natal (`slot_kind !== "friend"` / You row).**  
> Friend charts are for Chart + Soul only. Today never offers a friend switcher and never calls the transit API with a friend id when a self chart exists.

If **no** self chart exists: sky-only / save-chart CTA (existing no-natal path) — do **not** silently fall back to a friend for “personal” indication.

---

## Exact fix (minimal)

### A. Today page — resolve You chart for API + UI (required)

**File:** `frontend/src/app/transits/page.tsx` (+ small helper if useful)

1. When `user` is ready, load `api.charts(user.id)` (or reuse a thin helper).
2. Resolve **youChart** = first row with `slot_kind !== "friend"` (same rule as `isSelfRow` on Chart). Prefer store `natalChartId` **only if** that row is self; else the self row; else `null`.
3. Call `api.transitsToday(youChart?.id)` — **never** pass a friend id.
4. Drive overlay subtitle / as-of timezone from **youChart**, not from a friend sticky.
5. **UI (required clarity):**
   - Title stays **Today**.
   - Subhead / chip: locked **You** chip (not clickable as a friend switcher), e.g. `You · {displayName}` + short line **“Today is for you”** / “Always your natal — friends stay on Chart & Soul.”
   - Replace ambiguous `Overlaying FriendName · …` when sticky was a friend.
   - If no self: existing empty CTA (“Save your chart on Chart…”) — do not show a friend as the active Today profile.
6. **Do not** add a Me/Friend picker on Today.

Optional but nice: if store sticky is a friend and self exists, **nudge store back to self** when entering Today (`setNatalChart(summaryFromSelf)`) so Protocols also align — still Today-scoped trigger, Chart edit target unchanged.

### B. Store hydration — prefer self over sticky friend / newest (strongly recommended, small)

**File:** `frontend/src/lib/store.tsx` (~205–235)

Replace:

```ts
const preferred = readSelectedId(user.id);
const match = preferred != null ? rows.find((r) => r.id === preferred) : null;
const row = match || rows[0];
```

With preference order:

1. Sticky id **if** that row is self (`slot_kind !== "friend"`)
2. Else any self row (stable: e.g. lowest id or first self in list)
3. Else `null` (do **not** bind a friend as natal for Today/Protocols)
4. Write sticky to the chosen self id (or clear)

Optionally extend `NatalChartSummary` with `slot_kind?: "self" | "friend"` so consumers can assert.

### C. Chart delete / bind edge (small, same PR OK)

**File:** `frontend/src/app/profile/page.tsx`

- `deletePerson`: after delete, if rebound needed, `applyRow` **self** row (not `rows[0]`), and only `bindStore` when selecting/rebinding self.
- Keep existing `selectPerson` friend non-bind when Me already set.

### D. Backend (optional, not required for P0)

No API change required if FE always passes self id. Optional later: reject / ignore friend id on `/transits/today` when a self exists for that user — out of P0 unless easy.

---

## Files to touch

| File | Change |
|---|---|
| `frontend/src/app/transits/page.tsx` | Resolve You chart; lock chip + “Today is for you” copy; API id = self only |
| `frontend/src/lib/store.tsx` | Hydrate preferred **self**; never sticky-bind friend as natal |
| `frontend/src/lib/store.tsx` / `api.ts` | Optional: `slot_kind` on summary |
| `frontend/src/app/profile/page.tsx` | Delete rebound → self; no friend as store natal |
| Tests | FE unit or light RTL if present; else manual AC. Optional BE only if D |

**Do not touch:** `soul/page.tsx` friend selection, Soul API, indication derive rules (except they correctly receive self natal).

---

## Acceptance criteria

1. Given a saved **You** chart and ≥1 **Friend**, when sticky localStorage points at the friend id, opening **Today** still loads indication/overlay for **You** (self id in network request).
2. Given newest chart is a friend (`id.desc`), with no sticky, Today still uses **You**, not `rows[0]`.
3. Today UI shows a **locked You** chip / “Today is for you” (or equivalent) — **no** friend switcher on `/transits`.
4. Selecting a friend on **Chart** does not change Today’s natal after reload (store does not stick friend as natal when self exists).
5. Given **no** self chart but friends exist, Today does **not** treat a friend as personal natal (sky-only / save-You CTA).
6. Soul still lets user pick friends; Chart Me/Friend editing still works.
7. Hard-refresh Today after friend sticky: still You.

---

## @dev brief (copy-ready)

- **P0:** Today (`/transits`) must always use **You / `slot_kind !== "friend"`** natal — never a friend.
- **Root cause:** global sticky `hd-biohack:selected-chart:*` + store fallback to **newest** `rows[0]` (`id.desc`) can bind a friend; Today passes that id blindly.
- **Fix:** resolve self on Today for `transitsToday`; locked **You** chip + “Today is for you”; harden store hydrate to prefer self and **refuse** friend as natal when self exists; Chart delete rebound → self.
- **Don’t:** add friend picker on Today; don’t change Soul; don’t rewrite indication scoring.
- **AC:** friend sticky / newest-friend still → You on Today; no self → no friend personal overlay; Chart/Soul friends intact.
- **Spec:** `.grok-handoff/today-you-profile-only.md`

---

## Smoke (after implement)

1. Dev user with Me + friend; on Chart select friend; open Today → You chip + self overlay.
2. In DevTools set `localStorage['hd-biohack:selected-chart:'+userId]` to friend id; reload `/transits` → still You.
3. Save a new friend (newest id); reload Today → still You.
4. Open Soul, pick friend pair → still works.
5. Delete Me only → Today empty/CTA, not friend-as-you.
