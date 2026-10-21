# Ship Gate — Deep dive domain tabs clarity

**Verdict: PASS**  
**When:** 2026-10-21 ~15:25 Asia/Hong_Kong (HKT)  
**Branch:** `feat/deep-dive-domain-tabs` @ `dc1ab81` (impl `3aa08c5`)  
**Local:** API `http://127.0.0.1:8000`, frontend `http://127.0.0.1:3000`  
**Scope:** Segmented tab track styling + roving keyboard; hash deep-links unchanged.  
**UX prior:** PASS acceptance 1–5 (`.grok-handoff/deep-dive-domain-tabs-ux-review.md`)

---

## Summary

| Area | Result |
|------|--------|
| Code smoke (ARIA + roving + styling) | **PASS** |
| pytest | **PASS** — 8/8 |
| Geocode suggest Hong Kong | **PASS** |
| Chart calc + `/api/backend` rewrite | **PASS** |
| UI acceptance 1–5 | **PASS** |
| trycloudflare | **DEAD** (non-blocking) |

**Overall: PASS** — no critical-path fails. Ready to ship when Benjamin asks.

---

## Automated

### Tip / source

- Tip `dc1ab81` on `feat/deep-dive-domain-tabs` (impl `3aa08c5`)
- File: `frontend/src/components/ChartDeepDive.tsx`

### Code smoke

| Check | Result | Evidence |
|-------|--------|----------|
| Labels Core / Centers / Channels / Planets | **yes** | `DOMAIN_TABS` ~27–31 |
| `role="tablist"` / `role="tab"` / `role="tabpanel"` | **yes** | ~329 / ~352 / ~377 |
| Roving tabindex (selected `0`, else `-1`) | **yes** | ~354 |
| ArrowLeft/Right wrap, Home/End | **yes** | ~337–341 |
| Track `bg-sunken` + border | **yes** | ~331 |
| Segments `flex-1` + `min-h-11` | **yes** | ~358 |
| Selected elevated + growth accent / ring | **yes** | ~360 / ~367 |

### pytest

```
8 passed in 0.18s
```

(`backend/.venv/bin/pytest -q`)

### API

| Step | Result |
|------|--------|
| `GET /health` | **200** ok/baseline |
| `GET /geocode/suggest?q=Hong+Kong` | **200** — 22.3193, 114.1694 Asia/Hong_Kong |
| `POST /chart/calculate` HK no-save | **200** — Manifesting Generator / Sacral / 2/4; natal_chart_id null |
| `GET :3000/api/backend/health` | **200** rewrite ok |
| trycloudflare | **DEAD** — non-blocking |

---

## UI (browser)

Preview: `http://127.0.0.1:3000/profile` — chart already loaded (Benjamin). No AuthGate block.

| # | Acceptance | Result | Evidence |
|---|------------|--------|----------|
| 1 | Segmented control; selected obvious | **PASS** | sunken track, elevated + ring + growth bar |
| 2 | 375: four labels, no h-scroll, ≥44px | **PASS** | 76.5×44px each; no tablist h-scrollbar |
| 3 | Keyboard arrows/Home/End + focus ring | **PASS** | wrap works; green focus ring |
| 4 | Hash `#centers` / `#activations` + clearance | **PASS** | Centers matrix; Planets tables; h2 ~8px under stickies |
| 5 | Light selected contrast | **PASS** (light only; no one-click dark) | elevated + ring + bar, not wash-only |

Shots: `/workspace/hd-biohack-ui-failures/ship-gate-2026-10-21/deep-dive-domain-tabs/`  
(`01-selected-core.png` … `06-hash-activations-planets.png`)

---

## Failures

**None.**

## Fix-first ordered list

_(empty — PASS)_
