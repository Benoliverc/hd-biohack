# Ship Gate — chart-nav slice

**Verdict: FAIL**  
**When:** 2026-10-20 ~23:40 Asia/Hong_Kong (HKT)  
**Branch:** `feat/chart-page-nav` @ `3cb7487`  
**Local:** API `http://127.0.0.1:8000`, frontend `http://127.0.0.1:3000`  
**Scope:** sticky section nav + measured `--app-header-h` / `--chart-scroll-mt`; reading-mode Edit/switch person; Centers bodygraph hide-in-place; DeepDive tabs Core|Centers|Channels|Planets; `natal_chart_id` upsert.  
**Constraints:** No deploy / commit / app-code changes by QA. UI shots dir empty (no FAIL screenshots captured).

---

## Summary

| Area | Result |
|------|--------|
| pytest | **PASS** — 8 passed / 0 failed / 0 errors |
| Live APIs + proxy rewrite | **PASS** |
| API `natal_chart_id` upsert | **PASS** — id 35 stayed 35; count 1→1 |
| Sticky section nav | **PASS** |
| Deep-link scroll-mt | **PASS** |
| Centers matrix + hide-in-place | **PASS** |
| DeepDive tabs + sticky labels | **PASS** |
| Edit/switch person (city · date) | **PASS** when list populated |
| People list hydrate + UI upsert path | **FAIL** — see failures |
| trycloudflare public URL | **DEAD** (non-blocking for local gate) |
| Med: narrow chip overflow-x | Note only (known UX Med) |

**Overall: FAIL** — High nav/Centers/tabs green; reading-mode people hydrate + UI save path left a duplicate Me and hid existing charts on first open.

---

## 1. Backend pytest

```text
cd /workspace/hd-biohack/backend && source .venv/bin/activate && pytest tests/ -q --tb=line
........                                                                 [100%]
8 passed in 0.15s
```

**Result:** **8 passed / 0 failed / 0 errors**

---

## 2. Live API smoke (`:8000`)

| Method path | Status | Key fields |
|---|---|---|
| `GET /health` | **200** | `status=ok`, `service=baseline` |
| `GET /geocode/suggest` HK / Ghent / Wetteren | **200** | seed hits with lat/lon/tz |
| `POST /chart/calculate` (HK/Ghent/Wetteren, no save) | **200** | MG `2/4` Sacral (HK payload) |
| `POST /auth/login` Benjamin/Wolkje | **200** | `id=3`, tier `biohacker_pro` |
| Create + upsert `natal_chart_id=35` | **200** | returned **35**; count stayed **1** |
| `POST /biohack/protocol` | **200** | pro protocol payload |
| `POST /v2/telemetry/ingest` + `/api/v2/telemetry/ingest` | **200** | `status=accepted` |
| `GET http://127.0.0.1:3000/api/backend/health` | **200** | rewrite **PASS** |

### Upsert `natal_chart_id` (API)

| Check | Value |
|---|---|
| Verdict | **PASS** |
| Before | count 0 → created id **35** (count 1) |
| Upsert | input 35 → returned 35; count **1** |

---

## 3. Proxy / tunnel

| Check | Result |
|---|---|
| `:8000` / `:3000` | **UP** |
| `/api/backend` rewrite | **PASS** |
| trycloudflare `convergence-appearance-bookmark-cult…` | **DEAD** (`Unauthorized: Tunnel not found`) — local preview unaffected |

---

## 4. UI (browser @ `http://127.0.0.1:3000/profile`)

Login: Benjamin / Wolkje. No FAIL screenshots.

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Sticky section nav under header | **PASS** | Header height 113px; chip `nav` `top: var(--app-header-h)`; after scroll header y=0–113, chips y=113–167. Chips: People & form, Bodygraph, Snapshot, Core, Centers, Channels & gates, Planets. |
| 2 | Deep-link scroll-mt | **PASS** | `#planets` / `#activations` → Planets; “Deep dive” clear of stickies (y≈455). Centers/Channels chips clear titles. Channels “Deep dive” ~8px under chip bar (still readable). |
| 3 | Centers bodygraph + hide-in-place | **PASS** | Head top-center, Root bottom-center; Heart right of G; Spleen left / Solar Plexus right of Sacral. Defined/Open hide in place — same x/y, no repack. |
| 4 | DeepDive tabs | **PASS** | Core \| Centers \| Channels \| Planets switch; sticky **Planets** (not Activations); **Core** in sticky. |
| 5 | Edit/switch person | **FAIL** (partial) | city · date on rows **when list loads**. First open: **0/10 “None yet”** while API already had chart **#35**. DEMO form (Montreal 1948-04-09) shown. One **Calculate & Save** inserted **#36**; list became **2/10** (Montreal Manifestor 5/1 + HK MG 2/4). Button stayed “Calculate & Save”. Upsert UI path not exercised (no `natalChartId` / not in saved mode). |
| 6 | Narrow width | Note | ~500px viewport: chips scroll horizontally; Planets past edge. Matches known UX Med. |

---

## Failures — repro + fix-first

### F1. People list empty on hydrate despite charts in DB (critical)

**Repro:**
1. Ensure `GET /charts/3` returns ≥1 row (e.g. id 35).
2. Open `http://127.0.0.1:3000/login` → Benjamin / Wolkje.
3. Go to `/profile` → expand **Edit / switch person**.
4. Observed: **0/10 None yet** + DEMO Montreal fields; chart #35 only appeared after a later Calculate & Save refreshed the list.

**Expected:** Saved people list shows existing charts with city · date; prefer selected / first row; do not present empty + DEMO when rows exist.

**Likely area:** `profile/page.tsx` hydrate (`refreshPeople` → empty/`catch`) vs session `user.id` timing.

### F2. UI save created second Me instead of updating (critical for slice)

**Repro:** From empty-list / DEMO state above, click **Calculate & Save** once with prefilled Montreal.

**Observed:** New chart **#36**; list 2/10 two “Me” rows. API upsert with `natal_chart_id` works; client only sends it when `viewMode === "saved" && natalChartId` — that state was never reached because list hydrate failed.

**Expected:** Selecting an existing person then Calculate & Save updates in place (same id, count unchanged).

---

## Fix-first ordered list

1. **Fix people hydrate** so `/charts/{user_id}` rows appear on first Edit/switch open after login (no false empty + DEMO).
2. **Re-verify UI upsert:** select existing person → Calculate & Save → same `natal_chart_id`, count unchanged; optional label “Update” when `updatingExisting`.
3. (Non-blocking) Med chip overflow-x at ~375; sticky `bg-canvas/95` ghosting — prior UX notes.
4. (Non-blocking) Restart or drop dead trycloudflare process if public preview needed.

---

## What was tested (checklist)

- [x] pytest 8/8  
- [x] health, geocode seeds, chart calc, login, biohack protocol, telemetry stub  
- [x] `/api/backend` rewrite  
- [x] API `natal_chart_id` upsert  
- [x] Sticky nav + scroll-mt + Centers hide-in-place + DeepDive tabs  
- [x] Edit/switch person row identity (city · date)  
- [ ] People list correct on first open — **FAIL**  
- [ ] UI recalculate selected does not add Me — **FAIL / not proven**  

**Do not ship this slice until F1 (and F2 via re-gate) are green.**
