# HD Biohack V1

Human Design natal chart + live planetary transit overlay + deterministic (optional LLM) biohacking / supplement protocols.

Monorepo:
- `backend/` — FastAPI + `pyswisseph` calculation engine
- `frontend/` — Next.js 14 + Tailwind + Lucide

## Quick start

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
./scripts/download_ephemeris.sh
cp ../.env.example ../.env   # optional
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API docs: http://127.0.0.1:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local   # then set NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm run dev
```

App: http://localhost:3000

### 3. Tests

```bash
cd backend && source .venv/bin/activate
pytest tests/ -v
# or with printed reference dump:
python tests/test_mandala.py
python tests/test_chart_reference.py
```

Reference validation: **Ra Uru Hu** (1948-04-09 00:05 Montreal) → Manifestor / 5/1 / Splenic / Sun 51.5 & 61.1.

## Architecture

| Layer | Choice |
|---|---|
| HD math | Self-hosted Swiss Ephemeris; Mandala from 302° Gate 41.1; Design = Sun − 88° solar arc |
| Geocode | Nominatim + DB cache + custom user-agent; `timezonefinder` + `zoneinfo` |
| DB | SQLite by default; Postgres when `DATABASE_URL` set (Supabase-ready) |
| Auth | Dev Mode User Switcher now; Google via Supabase Auth stubbed in UI |
| Biohack | Deterministic center/transit rules; optional `LLM_PROVIDER` + `LLM_API_KEY` |
| Paywall | `subscription_tier`, `BiohackingEntitlementGate`, `NEXT_PUBLIC_ENFORCE_PAYWALL` |
| V2 | `user_biometrics_daily` + `POST /v2/telemetry/ingest` stub |

## Key API routes

- `POST /chart/calculate` — birth data → full chart (optional save)
- `GET /transits/today?natal_chart_id=` — live transits + overlay
- `POST /biohack/protocol` — weekly/daily stacks
- `POST /v2/telemetry/ingest` — wearable stub
- `GET /users` / Dev switcher seed users: `dev.free@…`, `dev.pro@…`

## Compliance

Biohack UI shows: *For informational and energetic optimization purposes only; not medical advice.*

## Stubbed / later

- Google OAuth (Supabase) — button present, not wired
- Stripe checkout — upgrade modal alerts stub
- LLM coaching — only when env keys set
- Wearable OAuth (Apple / Terra) — ingest stub only
- Bodygraph SVG visualization — tabular gates for V1

## Geocoding note

Nominatim often returns **403 from cloud/datacenter IPs**. V1 ships with a **seeded city cache** (Montreal, Hong Kong, London, New York, Ulm, Bangkok, …) and accepts optional `lat`/`lon` on `POST /chart/calculate` to skip geocoding. Successful Nominatim lookups are cached in DB for multi-user reuse.

