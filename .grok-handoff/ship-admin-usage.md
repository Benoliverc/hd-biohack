# Ship note — Admin usage

**When:** 2026-10-22 ~21:31 Asia/Hong_Kong (HKT)  
**PR:** [#13](https://github.com/Benoliverc/hd-biohack/pull/13) merged (`81583b1`)  
**Frontend:** https://hd-biohack.vercel.app — Vercel Ready (`dpl_HMMmm4bbA7ehfm7RvKvznP8SeYCV`); `/admin` returns 200  
**Backend:** Railway still **paused** (“Deploys have been paused due to an upstream issue”). Prod OpenAPI has **no** `/admin/usage/*` routes until `api` redeploys from `main`.  
**Scope:** `usage_events` + instrumentation (login/chart/protocol), `ADMIN_EMAILS` gate, admin APIs, `/admin` UI + Header link.  
**Gate:** Ship Gate PASS (`.grok-handoff/ship_gate_report.md` / `ship-gate-admin-usage.md`) @ `06363c1`
