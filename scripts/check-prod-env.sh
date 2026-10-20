#!/usr/bin/env bash
# List / soft-check env vars needed for Vercel + Railway production.
# Usage: export vars then ./scripts/check-prod-env.sh
# Does not call any cloud APIs; exit 1 if critical vars look missing.

set -euo pipefail

fail=0

need() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "MISSING  $name"
    fail=1
  else
    local val="${!name}"
    local preview="$val"
    if [[ ${#val} -gt 56 ]]; then
      preview="${val:0:56}…"
    fi
    echo "OK       $name=$preview"
  fi
}

soft() {
  local name="$1"
  local hint="$2"
  if [[ -z "${!name:-}" ]]; then
    echo "OPTIONAL $name  ($hint)"
  else
    echo "OK       $name"
  fi
}

echo "=== Railway (API) — export these in the shell to dry-run, or check Railway Variables UI ==="
need CORS_ORIGINS
soft DATABASE_URL "empty = SQLite; set for Postgres"
soft SQLITE_PATH "use /data/hd_biohack.db with a Railway volume at /data"
soft NOMINATIM_USER_AGENT "set a real contact UA for Nominatim"
soft SEED_DEV_USERS "default true until Google auth"
soft ENFORCE_PAYWALL "false until paywall is real"
soft LLM_API_KEY "deterministic protocols work without it"
soft SUPABASE_URL "Google OAuth stub"
soft SUPABASE_ANON_KEY "Google OAuth stub"

echo
echo "=== Vercel (frontend) ==="
need NEXT_PUBLIC_API_URL
if [[ -n "${NEXT_PUBLIC_API_URL:-}" ]]; then
  if [[ "$NEXT_PUBLIC_API_URL" == *"127.0.0.1"* ]] || [[ "$NEXT_PUBLIC_API_URL" == *"localhost"* ]]; then
    echo "BAD      NEXT_PUBLIC_API_URL points at localhost — remote browsers cannot reach it"
    fail=1
  elif [[ "$NEXT_PUBLIC_API_URL" == /api/backend* ]]; then
    echo "BAD      NEXT_PUBLIC_API_URL=/api/backend needs a local Next rewrite — use the Railway HTTPS URL in production"
    fail=1
  fi
fi
soft NEXT_PUBLIC_ENFORCE_PAYWALL "false until Stripe is wired"
soft NEXT_PUBLIC_SHOW_DEV_CONTROLS "must be unset/false for real users"

echo
if [[ "$fail" -ne 0 ]]; then
  echo "Result: FAIL — fix MISSING/BAD before inviting users. See DEPLOY.md."
  exit 1
fi
echo "Result: PASS (required vars present). Review OPTIONAL items before go-live."
exit 0
