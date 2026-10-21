# Ship Gate — remove city preset chips

**Verdict: PASS**  
**When:** 2026-10-21 ~15:02 Asia/Hong_Kong (HKT)  
**Branch:** `fix/remove-city-presets` @ `f9e85f5` (fix `ef00c5f`)  
**Local:** API `http://127.0.0.1:8000`, frontend `http://127.0.0.1:3000`  
**Scope:** Delete QUICK presets from CityPicker; keep Enter lat/lon; typeahead geocode unchanged.

---

## Summary

| Area | Result |
|------|--------|
| Source: no `QUICK` / no preset chip labels | **PASS** |
| pytest | **PASS** — 8/8 |
| Geocode suggest (typeahead API) | **PASS** |
| Chart calc + `/api/backend` rewrite | **PASS** |
| UI: no HK/Ghent/Wetteren/Montreal/Bangkok chips | **PASS** |
| UI: typeahead suggest | **PASS** |
| UI: Enter lat/lon toggle | **PASS** |
| trycloudflare | **DEAD** (non-blocking) |

**Overall: PASS**

---

## Automated

### Tip / source

- Tip `f9e85f5` on `fix/remove-city-presets`
- `rg QUICK frontend/src/components/CityPicker.tsx` — no matches
- No Hong Kong / Ghent / Wetteren / Montreal / Bangkok chip labels in CityPicker
- **Enter lat/lon** control still present (~line 223)

### pytest

```
8 passed in 0.16s
```

### API

| Step | Result |
|------|--------|
| `GET /health` | **200** ok |
| `GET /geocode/suggest?q=Hong+Kong` | **PASS** — results incl. seed 22.3193, 114.1694 |
| `POST /chart/calculate` HK no-save | **200** |
| `GET :3000/api/backend/health` | **PASS** rewrite |
| trycloudflare | **DEAD** — non-blocking |

---

## UI

Benjamin → `/profile` → Edit / switch person. No save/delete.

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | No preset chips | **PASS** | Only dashed **Enter lat/lon** under field. HK/Ghent/Wetteren/Montreal/Bangkok not quick chips. “Hong Kong” only as current value / saved row. |
| 2 | Typeahead | **PASS** | “Ghen” → Ghent seed + others; “Hong Kong” → seed + open-meteo; pick seed pins 22.3193, 114.1694. |
| 3 | Enter lat/lon | **PASS** | Toggle → Hide lat/lon + lat/lon fields + Use coordinates; hide restores pill. |

---

## Failures

**None.**
