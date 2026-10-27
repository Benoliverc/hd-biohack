# Ship report — three Ship Gate PASS branches (2026-10-27 HKT)

**Authorized by:** user message t220u (“Merge and ship all”)  
**Repo:** Benoliverc/hd-biohack (Baseline)  
**Order:** Power Dynamics → Protocols C → Protocols A (A rebased onto C)

## PRs / merge SHAs

| # | Branch | Tip shipped | PR | Merge commit on `main` | Merged (UTC) |
|---|--------|-------------|-----|------------------------|--------------|
| 1 | `feat/power-dynamics-unique-copy` | `ea48fcc` | [#37](https://github.com/Benoliverc/hd-biohack/pull/37) | `bc7bca658e3518b55cf0704bcd25044ae7ec89f6` | 2026-10-27T05:47:10Z |
| 2 | `feat/protocols-prove-it-checklist` | `070dbf9` → rebased `21dbb71` | [#38](https://github.com/Benoliverc/hd-biohack/pull/38) | `adf90cd0c6e094e4fec2f8b06c124118ac4ccced` | 2026-10-27T05:47:38Z |
| 3 | `feat/protocols-sky-rotated-daily` | `553eb94` → rebased `39518cb` | [#39](https://github.com/Benoliverc/hd-biohack/pull/39) | `3b04e91ee9df2e5e7fea0584e331f7ff4b79c8f0` | 2026-10-27T05:48:24Z |

**`main` tip after all three:** `3b04e91`

### Rebase note (C ∩ A)
Both C and A touched `frontend/src/app/biohack/page.tsx`. After #38, A was rebased onto `origin/main`; conflicts resolved keeping prove-it checklist (v2 completions / progress / week rollup) **and** sky-rotation (lead fingerprint helpers, what’s-new chip/badge). Tip after rebase: `39518cb`.

## Deploys

GitHub→host auto-deploy had **not** fired (Vercel prod was still 3d old @ `4f83913`-era; Railway last SUCCESS was `4f83913`). Manual deploys:

| Host | How | Result | IDs / URLs |
|------|-----|--------|------------|
| **Vercel FE** | `vercel deploy --prod --cwd frontend` from monorepo (after CLI fetch glitch) | **READY** | `dpl_6U2zeiivyAsebWnxFAkuzZV9PaYs` · https://hd-biohack-mlmp6pb91-hdbh1.vercel.app → aliased **https://hd-biohack.vercel.app** |
| **Railway API** | `railway up -d -y` from **monorepo ROOT** (not `backend/`) | **SUCCESS** | `baa6b88e-80ca-493f-b76c-0df7d271a593` · **https://api-production-7527.up.railway.app** |

Times (Asia/Hong_Kong): Railway SUCCESS ~13:53; Vercel Ready ~13:51.

## Live confirmation

| Check | Result |
|-------|--------|
| `GET https://hd-biohack.vercel.app/` `/biohack` `/soul` | 200 |
| FE biohack chunk markers | `whats-new-chip`, `todays-move-whats-new`, `New vs yesterday`, `protocol-leads:v1`, `protocol-done:v2` present |
| `GET …railway…/health` | `{"status":"ok","service":"baseline"}` |
| `POST /biohack/protocol` (Benjamin / chart 16) | `whats_new.chip` present; `forced_rotation` true; `daily_signal` + `vs_yesterday` populated |
| `POST /soul/sync` | Power Dynamics card present; bodies include `What to do:`; not the old one-liner stub |

## Follow-ups (non-blocking)
- Vercel Git integration still suggests `vercel git connect` — pushes to `main` may not auto-deploy FE until connected.
- Railway service `rootDirectory` remains `backend` in manifest; upload was from monorepo root as requested.
