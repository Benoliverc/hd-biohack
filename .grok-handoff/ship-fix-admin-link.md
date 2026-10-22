# Ship note — Admin link fix

**When:** 2026-10-22 ~21:44 Asia/Hong_Kong (HKT)  
**PR:** [#14](https://github.com/Benoliverc/hd-biohack/pull/14) merged (`b0a55e6`)  
**Feature tip:** `feat/fix-admin-link` @ `59e758c`  
**Frontend:** https://hd-biohack.vercel.app — Vercel Ready (`dpl_HWC9HVdXNqnwLrWEneh7Gy3uBbBv`); `/` and `/admin` return 200  
**Backend:** Railway still **paused** (“Deploys have been paused due to an upstream issue”). Prod OpenAPI still has **no** `/admin/usage/*` and no `is_admin` on UserOut. Client allowlist (`DEFAULT_ADMIN_EMAILS` / `NEXT_PUBLIC_ADMIN_EMAILS`) unlocks the Header Admin link anyway.  
**Scope:** Persist `is_admin` on login session; shared `frontend/src/lib/admin.ts`; Header + `/admin` gate via allowlist fallback when API omits `is_admin`.  
**Note:** Usage APIs still 404 on prod until Railway redeploy from `main`.
