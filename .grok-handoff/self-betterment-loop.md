# Feature 2 — Thin self-betterment loop

**PO:** Grok Bot · **Owner:** Full Stack Developer (@dev)  
**Source:** Baseline usability 10-persona Page — Rec #3  
**Branch suggestion:** `feat/self-betterment-loop`  
**Depends on:** Free/Pro identity shipped (`ae3c328` / PR #42) — Protocols still Pro-gated.

## Problem
Moves and week ticks exist, but nothing compounds across devices or days: completions are `localStorage` only (HKT-hardcoded), there is no account timezone, no daily intention, and no synced reflection after a Move. Personas (Maya, Jonah, Marcus, Sofia…) bounce without a thin loop.

## Goal
Ship the smallest loop that makes progress feel owned:
1. Account **timezone** (settings) drives Protocols day/week boundaries + copy.
2. Optional one-line **daily intention** on Protocols.
3. After marking a Move done, one **reflection** field **synced to the account**.
4. Keep the medical disclaimer.

## Out of scope (do not expand)
- Password / delete-account / full account center.
- Reminders / push / streaks / social share.
- Rewriting **Daily Novelty** sky buckets — those stay **07:00 Asia/Hong_Kong** per Daily Novelty Contract + Benjamin preference (`formatResetsInHkt`, `checkin/novelty.py`). Do **not** retarget novelty reset to user TZ in this PR.
- Stripe / signup (already handled in #42).

## Acceptance criteria

### AC1 — Account timezone
- Add `preferred_timezone` (IANA string, nullable) on `User` (+ migration / create-all friendly path matching existing patterns).
- API: read + update on the authenticated/session user (extend existing user GET/PATCH or add thin settings endpoints).
- FE: small **Settings** surface (new `/settings` page or Header → Settings) with timezone select (curated common list + free-text IANA ok). Default empty → fall back to `Asia/Hong_Kong` for Protocols day/week until set (document in UI: “Used for Protocols week & checklist days”).
- Persist across reload; Pro and Free can both set timezone (settings are free).

### AC2 — Protocols day/week use account timezone
- Replace hard-coded `Asia/Hong_Kong` in `protocolCompletions.ts` day/week helpers with the user’s preferred timezone (fallback HKT).
- Week rollup label must not say “Mon–Sun HKT” when user TZ ≠ HKT — use neutral “Mon–Sun” or show the TZ short name.
- Migrate/read: existing v2 localStorage keys keyed by old HKT dates may orphan mid-day; acceptable for v1 — document; do not build a complex migration unless cheap.
- **Novelty countdown / sky buckets remain HKT** (Today / transits) — copy can still say “resets in ~X hours” to HKT 07:00.

### AC3 — Daily intention (optional)
- One-line intention field on Protocols (near Today’s Move / top of checklist), placeholder e.g. “What are you aiming for today?”
- Stored per user + calendar day (in account TZ) on the **server**.
- Does not block checklist use; empty is fine.
- Optional soft prefer: if intention text is present, no LLM rewrite required this PR — just store + show. (Preferring Moves from intention is P1 later.)

### AC4 — Reflection after Move complete (synced)
- When user marks a **move** checklist item done, offer a one-line reflection (reuse/extend local `note` UX if present).
- Persist reflection + completion **server-side** keyed by user + chart + day + item id (and keep local cache for snappy UI).
- Reload on another browser/session shows the same completions + notes for that day.
- Baseline checklist items: reflection optional; at minimum Moves sync.
- Keep medical disclaimer visible as today.

### AC5 — Trust / density
- No leaked internal product logic.
- Settings and new fields meet existing density/trust bar (plain English, ≥40px tap where primary).
- Free users: can set timezone + see Settings; intention/reflection UI lives on Protocols → still behind Pro gate (same as Moves). If a Free user hits Settings only, that must work.

### AC6 — Tests / smoke
- Backend tests for timezone update, intention upsert, completion/reflection sync.
- FE/unit or API tests for day-key helper with non-HKT TZ (e.g. `America/New_York`).
- Smoke: set TZ → week label updates; complete Move + note → reload still there; novelty countdown still HKT-based.

## Suggested shape (not mandatory)
- Tables: `user_daily_intentions (user_id, day, text)`, `protocol_completions (user_id, chart_id, day, item_id, kind, label, done, note, updated_at)` with unique constraints.
- Or JSON columns on a single `user_protocol_days` row — pick the simpler migration path already used in this repo.
- FE: thin API client methods; hydrate completions from server on Protocols mount, write-through on toggle/note.

## Key files
- `frontend/src/lib/protocolCompletions.ts` — HKT day/week
- `frontend/src/app/biohack/page.tsx` — checklist, notes, week rollup
- `frontend/src/lib/timezone.ts` — keep novelty HKT helpers
- `backend/app/models.py` / `schemas.py` / `api/routes.py`
- `backend/app/checkin/novelty.py` — **do not change bucket TZ**

## Pipeline
1. Implement → open PR.
2. UX UI Review (Settings + Protocols intention/reflection + Free vs Pro).
3. Ship Gate QA.
4. Merge only after Benjamin yes via Grok Bot widget.

## Done when
All ACs + UX soft-P0s fixed + Ship Gate PASS. Report PR URL + tip SHA to Grok Bot.
