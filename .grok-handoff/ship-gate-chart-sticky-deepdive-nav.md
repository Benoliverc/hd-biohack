# Ship Gate — sticky Deep dive nav slice

**Verdict: PASS**  
**When:** 2026-10-21 ~00:48 Asia/Hong_Kong (HKT)  
**Branch:** `feat/chart-sticky-deepdive-nav` @ `26b80e7` (fix `0058747`)  
**Local:** API `http://127.0.0.1:8000`, frontend `http://127.0.0.1:3000`  
**Scope:** sticky chips People & form · Bodygraph · Snapshot · Deep dive only; domains via DeepDive tabs; legacy hashes → tabs + `#deep-dive`; measured sticky offsets. Medium UX fixes (375 overflow + hash scroll) in `0058747`.

---

## Summary

| Area | Result |
|------|--------|
| pytest | **PASS** — 8/8 |
| Live APIs + upsert + proxy rewrite | **PASS** |
| Sticky chip set (4 only) | **PASS** |
| Deep dive chip scroll clearance | **PASS** — ~8.1px under stack |
| Legacy `#centers` / `#activations` (+ `#core`/`#channels`/`#planets`) | **PASS** |
| DeepDive tabs Core\|Centers\|Channels\|Planets | **PASS** |
| Narrow ~375 (no h-scroll, nav ~50px) | **PASS** |
| trycloudflare | **DEAD** (non-blocking) |

**Overall: PASS** — slice cleared for ship from QA.

---

## Automated

### pytest

```
cd backend && source .venv/bin/activate && pytest tests/ -q --tb=line
........                                                                 [100%]
8 passed in 0.23s
```

| Result | **PASS** — **8/8** |

### Proxy / tunnel

| Check | Result |
|-------|--------|
| `:8000` / `:3000` | **UP** |
| `GET /api/backend/health` | **PASS** — 200 |
| trycloudflare | **DEAD** — pid still up, `Unauthorized: Tunnel not found`; non-blocking |

### API smoke

| Step | Result |
|------|--------|
| health, geocode HK/Ghent/Wetteren | **PASS** |
| chart calculate (HK, no save) | **PASS** — MG · 2/4 · Sacral |
| login Benjamin | **PASS** — id=3 |
| charts/3 | count **1**, id **35** |
| upsert natal_chart_id=35 | **PASS** — 35→35, count 1→1 |
| biohack/protocol, telemetry stub | **PASS** |

---

## UI (browser)

Login session Benjamin on `/profile`. No FAIL screenshots. No charts created/deleted.

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Sticky chip set | **PASS** | Exactly 4 links: People `#people-form`, Body `#bodygraph`, Snap `#snapshot`, Deep `#deep-dive`. Core/Centers/Channels/Planets are DeepDive tabs only. After scroll: header bottom 109px = chip nav top; nav height 50px. |
| 2 | Deep dive chip | **PASS** | Click → `#deep-dive`; h2 top 167.125 vs sticky bottom 159 → clearance **8.1px**, not clipped. |
| 3 | Legacy `#centers` | **PASS** | Centers tab selected; heading clearance **8.1px**. |
| 4 | Legacy `#activations` | **PASS** | Planets tab selected; clearance **8.1px**. |
| 5 | DeepDive tabs | **PASS** | Core / Centers / Channels / Planets switch panels. Also `#core`/`#channels`/`#planets` load correct tab + 8.1px clearance. |
| 6 | Narrow ~375 | **PASS** | Playwright viewport **375×582** (device toolbar; OS window min ~508). overflowX **0**; chip nav height **50**; short labels People/Body/Snap/Deep; `overflow-x-clip`; no h-scrollbar. |

---

## Failures

**None.**

## Open / non-blocking

- Dead trycloudflare process — kill/restart if public preview needed.
- Low (UX): frosted sticky ghosting over bodygraph at 375 — not a gate.
