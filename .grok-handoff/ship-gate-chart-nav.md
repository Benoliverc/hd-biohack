# Ship Gate — chart-nav slice

**Verdict: PASS** (re-gate cleared prior FAIL)  
**When:** 2026-10-20 ~23:47 Asia/Hong_Kong (HKT)  
**Branch:** `feat/chart-page-nav` @ `161feaa` (fix `565ea7a`)  
**Local:** API `http://127.0.0.1:8000`, frontend `http://127.0.0.1:3000`  
**Scope:** sticky section nav + measured CSS vars; reading-mode Edit/switch person; Centers hide-in-place; DeepDive tabs; `natal_chart_id` upsert.  
**Prior FAIL:** people hydrate empty + UI insert duplicate Me — fixed in `565ea7a`.

---

## Summary

| Area | Result |
|------|--------|
| pytest (prior gate @ 3cb7487) | **PASS** — 8/8 |
| Live APIs + proxy rewrite (prior) | **PASS** |
| Sticky nav / scroll-mt / Centers / DeepDive tabs (prior) | **PASS** |
| API `natal_chart_id` upsert (re-gate) | **PASS** — 35→35, count 1→1 |
| F1 People hydrate (re-gate) | **PASS** — 1/10 HK · 1990-06-15, Update chart, Saved #35 |
| F2 Select → Update → same id/count (re-gate) | **PASS** — still #35, still 1/10 |
| trycloudflare | DEAD (non-blocking) |
| Med chip overflow-x | Note only (non-blocking) |

**Overall: PASS** — do not block ship on this slice. Med/tunnel leftovers remain optional.

---

## Re-gate 2026-10-20 (hydrate + upsert)

### API upsert

| Step | Result |
|------|--------|
| Before `GET /charts/3` | ids=`[35]`, count=`1` (HK 1990-06-15) |
| `POST /chart/calculate` save + `natal_chart_id=35` | returned **35** |
| After `GET /charts/3` | ids=`[35]`, count=`1` |

### UI F1 — People hydrate

Login Benjamin → hard refresh `/profile` → first open **Edit / switch person**:

- Saved people **1/10**
- Row: **Me · Manifesting Generator · 2/4** / **Hong Kong · 1990-06-15**
- Not 0/10, not DEMO Montreal
- Button **Update chart**; **Saved chart #35**
- Form loaded: 1990-06-15 / 14:30 / Hong Kong / Asia/Hong_Kong

### UI F2 — Update in place

- Before: 1/10, Saved #35, **Update chart**
- Click Update once (fields unchanged)
- After: still 1/10, still #35, one Me row, button back to **Update chart**
- No new id / no count increase

---

## Prior gate evidence (still valid)

- pytest 8 passed @ earlier tip on same branch
- health, geocode HK/Ghent/Wetteren, chart calc, login, biohack protocol, telemetry stub — 200
- `/api/backend` rewrite PASS
- Sticky section nav under measured header PASS
- Deep-link `#planets` / `#activations` scroll-mt PASS
- Centers bodygraph + Defined/Open hide-in-place PASS
- DeepDive tabs Core|Centers|Channels|Planets; sticky Planets + Core PASS

---

## Open / non-blocking

- Med: section chips horizontal scroll at narrow width; sticky `bg-canvas/95` ghosting
- Dead trycloudflare public URL — use local :3000/:8000
- Historical over-cap DB rows (other users) — manual delete if needed

## Failures

**None on re-gate.** Prior F1/F2 cleared.
