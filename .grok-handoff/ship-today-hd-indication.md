# Ship note — Today HD indication

**When:** 2026-10-22 ~13:08 Asia/Hong_Kong (HKT)  
**PR:** [#12](https://github.com/Benoliverc/hd-biohack/pull/12) merged (`e03e605`)  
**Frontend:** https://hd-biohack.vercel.app — Vercel Ready (`dpl_6a3cy4xwWKHniMWfL8Q3GvncDZUs`)  
**Backend:** Railway still **Paused temporarily** (platform outage / env-var incident). Prod `GET /transits/today` returns `transit` + `overlay` only — **no `indication`** until `api` redeploys from `main`.  
**Scope:** Frontend + backend (`indication` on `GET /transits/today`). No `PUT /checkin`.  
**Gate:** Ship Gate PASS (`.grok-handoff/ship_gate_report.md`) @ `6b43b01`
