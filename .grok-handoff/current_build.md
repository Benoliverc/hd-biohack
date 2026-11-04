# Current build — i18n P0 chrome/shell — SHIPPED

- **PR:** https://github.com/Benoliverc/hd-biohack/pull/48 — **MERGED**
- **Branch tip:** `4b95416` (`4b954160adbcd9d1935ce33f434b5bd36679cdab`) — docs tip; fix tip `606eebe` confirmed at merge
- **Merge commit:** `d633a3b` (`d633a3b9c2d37f95c0822236089583d92cf1f922`)
- **Handoff:** `.grok-handoff/i18n-p0-chrome-shell.md`
- **Product handoff:** `handoffs/i18n-p0-chrome-shell-2026-11-04.md`
- **Status:** SHIPPED 2026-11-04 Asia/Hong_Kong — FE only. Soft residuals optional (Today’s Move title EN; InventoryPanel kit string; week block EN).

## Deploy
- **Vercel:** READY `dpl_Fcm6HCE2KeHL3eHMATfyTnMxgXVd` → https://hd-biohack.vercel.app (alias of https://hd-biohack-75ypzrmm9-hdbh1.vercel.app)
- **Railway:** skipped — FE-only (no API/schema paths in PR #48)
- **Smoke:** `/` 200 · `/settings` 200 · `/transits` 200 · `/biohack` 200 · `/login` 200. Hard-refresh advised for FE.

## Scope shipped
1. Expand catalogs en/nl/de/fr/es (~93 → 207 keys, 1:1 parity)
2. Wire Home outcome cards + trust/status chips
3. Page H1s: Today / Protocols / Chart / Soul (+ primary chrome)
4. TodayIndication static chrome + FE energy/space enum maps
5. Protocols: KitStrip, intention/shelf/week/baseline, MoveCard badges/Do·Don't, empty/paywall
6. Settings: language save toast via `translate(newLocale)` + feedback banner above cards
7. AuthGate loading/redirect; EntitlementGate chrome
8. Assert: key parity + NL smoke; `"use client"` fix on Today (`606eebe`)

## Deferred / soft residuals
- `hdCopy.ts` / LiteracyCoach / ChartDeepDive essays
- API `main_action_text` / daily_signal bodies / protocol tick `label`/`why` (P1)
- Soft: “Today’s Move” title still EN in catalog; InventoryPanel “Your kit” hardcoded; week block EN

## Prior shipped
- **PR #47** Settings language — MERGED `8351ee5` — FE + API
- **PR #46** Morning Ritual Option A — MERGED `81d2de8` — FE live on Vercel
