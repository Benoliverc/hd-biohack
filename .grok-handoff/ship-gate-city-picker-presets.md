# Ship Gate — CityPicker presets

**Verdict: PASS**  
**When:** 2026-10-21 ~14:12 Asia/Hong_Kong (HKT)  
**Branch:** `fix/city-picker-presets` @ `c3acdc1` (fix `22bb71e`)  
**Local:** API `http://127.0.0.1:8000`, frontend `http://127.0.0.1:3000`  
**Scope:** `showChips = !disabled` — preset cities (HK, Ghent, Wetteren, Montreal, Bangkok) always under birth city when editable.

---

## Summary

| Area | Result |
|------|--------|
| Source `showChips = !disabled` | **PASS** — `CityPicker.tsx:158` |
| pytest | **PASS** — 8/8 |
| Geocode suggest ×5 presets | **PASS** — seed hits |
| Chart calc + `/api/backend` rewrite | **PASS** |
| UI chips with hydrated lat/lon | **PASS** |
| UI pick Hong Kong (via Ghent→HK) | **PASS** |
| trycloudflare | **DEAD** (non-blocking) |

**Overall: PASS**

---

## Automated

### Tip / source

- `git log -1`: `c3acdc1` on `fix/city-picker-presets`
- `const showChips = !disabled;` at `frontend/src/components/CityPicker.tsx:158`; chips render when `showChips`

### pytest

```
8 passed in 0.12s
```

### API

| Step | Result |
|------|--------|
| `GET /health` | **200** ok |
| `/geocode/suggest` Hong Kong, Ghent, Wetteren, Montreal, Bangkok | **PASS** — seed hits |
| `POST /chart/calculate` HK no-save | **200** |
| `GET :3000/api/backend/health` | **PASS** rewrite |
| trycloudflare | **DEAD** — non-blocking |

---

## UI

Login Benjamin → `/profile` → Edit / switch person on saved Me · Hong Kong · 1990-06-15 (#35). No save/delete.

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Chips with hydrated coords | **PASS** | Editable field; Resolved 22.3193, 114.1694 · Asia/Hong_Kong. Chips: **Hong Kong**, **Ghent, Belgium**, **Wetteren, Belgium**, **Montreal, Canada**, **Bangkok, Thailand**, plus Enter lat/lon. Not presets-hidden. |
| 2 | Pick Hong Kong | **PASS** | Ghent first → 51.0543, 3.7174 · Europe/Brussels; then Hong Kong chip → city `Hong Kong`, Resolved 22.3193, 114.1694 · Asia/Hong_Kong. |
| 3 | Disabled hide | Note | Field stayed enabled; chips stayed visible during pick. |

---

## Failures

**None.**
