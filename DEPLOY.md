# Deploy Baseline (Vercel + Railway)

> Repo / project paths may still say `hd-biohack`; product display name is **Baseline**.

Stable public hosting for real users. Replaces `*.trycloudflare.com` quick tunnels.

| Piece | Host | Role |
|---|---|---|
| `frontend/` | **Vercel** | Next.js 14 UI |
| `backend/` | **Railway** | FastAPI + Swiss Ephemeris + DB |

Local `npm run dev` + `uvicorn` is unchanged. Production sets `NEXT_PUBLIC_API_URL` to the Railway HTTPS URL so the browser never talks to `127.0.0.1`.

---

## Prerequisites

- GitHub repo with this monorepo (push when ready; this scaffold does not commit for you)
- [Railway](https://railway.app) account
- [Vercel](https://vercel.com) account
- Optional: a domain you control

---

## 1. Deploy the API on Railway

1. **New Project** → **Deploy from GitHub** → select this repo.
2. When prompted for the service root, set **Root Directory** to `backend`  
   (or add an empty service and set Root Directory → `backend` under Settings).
3. Railway should detect `backend/Dockerfile` + `backend/railway.toml`.  
   If not: Settings → Build → Builder **Dockerfile**, Dockerfile path `Dockerfile`.
4. **Generate domain**: Settings → Networking → **Generate Domain**  
   Copy the HTTPS URL, e.g. `https://hd-biohack-api-production.up.railway.app`  
   (no trailing slash). Health: `GET /health` → `{"status":"ok",...}`.
5. **Volume (SQLite v1)**  
   - Settings → Volumes → Add volume  
   - Mount path: `/data`  
   - Variables (below) must include `SQLITE_PATH=/data/hd_biohack.db`  
   Without a volume, every redeploy wipes charts / inventory / protocols.
6. **Variables** (Settings → Variables):

| Variable | Example / notes |
|---|---|
| `CORS_ORIGINS` | `https://hd-biohack.vercel.app,https://www.yourdomain.com` (comma-separated; also accepts `ALLOWED_ORIGINS`) |
| `SQLITE_PATH` | `/data/hd_biohack.db` |
| `NOMINATIM_USER_AGENT` | `hd-biohack/1.0 (you@email.com)` |
| `SEED_DEV_USERS` | `true` until Google auth exists (seeds Dev Free / Dev Pro) |
| `ENFORCE_PAYWALL` | `false` until Stripe is real |
| `DATABASE_URL` | leave empty for SQLite; set later for Postgres |
| `LLM_PROVIDER` / `LLM_API_KEY` | optional |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | optional stubs |

7. Redeploy after env + volume. Smoke:
   ```bash
   curl -sS https://YOUR-RAILWAY-HOST/health
   curl -sS https://YOUR-RAILWAY-HOST/docs
   ```

### Postgres later (optional)

1. Railway → New → Database → PostgreSQL.
2. Copy the connection URL into `DATABASE_URL` (e.g. `postgresql://...`).
3. Remove reliance on `SQLITE_PATH` / the volume for app data.  
   Tables are created on boot via SQLAlchemy `create_all` (no Alemmic migration yet).

---

## 2. Deploy the UI on Vercel

1. **Add New Project** → import the same GitHub repo.
2. **Root Directory** → `frontend` (Configure → edit).
3. Framework Preset: Next.js (see `frontend/vercel.json`).
4. **Environment Variables**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-RAILWAY-HOST` (no trailing slash, **not** `/api/backend`) |
| `NEXT_PUBLIC_ENFORCE_PAYWALL` | `false` |
| `NEXT_PUBLIC_SHOW_DEV_CONTROLS` | `false` or omit |

5. Deploy. Open the `*.vercel.app` URL.
6. **Update Railway `CORS_ORIGINS`** to include that Vercel URL (and preview URLs if you use them), then redeploy the API.
7. Hard-refresh the Vercel site → Chart / Protocols should hit Railway (Network tab: requests to the Railway host).

### Custom domain

- Vercel: Project → Domains → add `app.yourdomain.com`
- Railway: optional custom domain for the API, or keep `*.up.railway.app`
- Add every production (and staging) origin to `CORS_ORIGINS`

---

## 3. Env var cheat sheet

### Railway (backend)

| Name | Required | Purpose |
|---|---|---|
| `CORS_ORIGINS` / `ALLOWED_ORIGINS` | **Yes** | Browser origins allowed (credentials on → no `*`) |
| `SQLITE_PATH` | Yes for durable SQLite | e.g. `/data/hd_biohack.db` + volume `/data` |
| `DATABASE_URL` | No | Postgres when ready |
| `SEED_DEV_USERS` | No (default true) | Empty-DB seed of Dev Free / Dev Pro |
| `ENFORCE_PAYWALL` | No | Backend paywall flag |
| `NOMINATIM_USER_AGENT` | Recommended | Nominatim ToS |
| `LLM_*` / `SUPABASE_*` | No | Optional |
| `ADMIN_EMAILS` | Recommended | Comma-separated admin emails for `/admin` (include `benjaminlammens@gmail.com`; local also `benjamin@test.hd-biohack.local`) |

### Vercel (frontend)

| Name | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | Railway HTTPS origin |
| `NEXT_PUBLIC_SHOW_DEV_CONTROLS` | No | Must stay false/omitted for real users |
| `NEXT_PUBLIC_ENFORCE_PAYWALL` | No | UI paywall gate |

Dry-run locally (after exporting vars):

```bash
./scripts/check-prod-env.sh
```

---

## 4. Click order (first time)

1. Push monorepo to GitHub (when you choose to commit).
2. Railway: create project from repo → root `backend` → volume `/data` → env vars → Generate Domain → confirm `/health`.
3. Vercel: import repo → root `frontend` → set `NEXT_PUBLIC_API_URL` → Deploy.
4. Railway: set `CORS_ORIGINS` to the Vercel URL(s) → redeploy.
5. Open Vercel URL → select Dev Pro (until Google auth) → calculate a chart → Generate protocol.
6. Only then share the Vercel (or custom) URL with users — **never** a `trycloudflare.com` link.

---

## 5. Local vs production API wiring

| Mode | `NEXT_PUBLIC_API_URL` | Next rewrite |
|---|---|---|
| `next dev` | `/api/backend` or unset | Yes → `http://127.0.0.1:8000` (`frontend/next.config.mjs`) |
| Vercel production | `https://…railway.app` | **Off** (`NODE_ENV=production`) |

Do not point production at `127.0.0.1` or leave `/api/backend` without a rewrite destination the serverless runtime can reach.

---

## 6. Real-user checklist (before inviting strangers)

- [ ] Railway `/health` green; volume mounted; data survives a redeploy
- [ ] Vercel loads; Network calls go to Railway; CORS not blocking
- [ ] Dev chrome hidden (`NEXT_PUBLIC_SHOW_DEV_CONTROLS` unset/false)
- [ ] Informational / not-medical disclaimer still visible on Protocols
- [ ] Google OAuth still stub — users rely on seeded Dev users or you add auth (deferred)
- [ ] Paywall / Stripe still stub — keep `ENFORCE_PAYWALL=false` or expect upgrade modal stubs
- [ ] Nominatim: datacenter IPs often 403 — seeded cities + manual lat/lon still work
- [ ] Custom domain + HTTPS (optional)
- [ ] Privacy / ToS pages (deferred — add before broad marketing)

---

## 7. Deferred (not in this scaffold)

- Live `vercel` / `railway` CLI deploys from this agent (no credentials assumed)
- Google OAuth via Supabase (UI button stub only)
- Stripe checkout / real paywall
- Alembic migrations / managed Postgres as default
- Buying and attaching a custom domain
- CDN caching / rate limits / abuse controls
- Turning off `SEED_DEV_USERS` once real auth exists

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| Browser `Failed to fetch` / CORS error | Add exact Vercel origin to Railway `CORS_ORIGINS`, redeploy API |
| Chart works locally, blank on Vercel | `NEXT_PUBLIC_API_URL` still `/api/backend` or localhost — set Railway URL and **redeploy frontend** (Next inlines `NEXT_PUBLIC_*` at build) |
| Data wiped after Railway deploy | Missing volume or `SQLITE_PATH` not under `/data` |
| `/health` 502 | Check Railway build logs; ephemeris download needs outbound HTTPS at image build |
| Dev panel visible to users | Unset `NEXT_PUBLIC_SHOW_DEV_CONTROLS`; ensure production build |

See also root `README.md` for local quick start.
