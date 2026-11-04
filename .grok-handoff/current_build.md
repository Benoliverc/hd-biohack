# Current build — i18n P0 chrome/shell — READY_FOR_UX

- **PR:** https://github.com/Benoliverc/hd-biohack/pull/48 — OPEN
- **Tip:** `606eebe`
- **Branch:** `feat/i18n-p0-chrome-shell`
- **Base:** `main` @ `65e4a15` (post PR #47)
- **Handoff:** `.grok-handoff/i18n-p0-chrome-shell.md`
- **Product handoff:** `handoffs/i18n-p0-chrome-shell-2026-11-04.md`
- **Status:** READY_FOR_UX — do **not** merge without Benjamin yes after UX + Ship Gate.

## Scope
1. Expand catalogs en/nl/de/fr/es (~93 → 207 keys, 1:1 parity)
2. Wire Home outcome cards + trust/status chips
3. Page H1s: Today / Protocols / Chart / Soul (+ primary chrome)
4. TodayIndication static chrome + FE energy/space enum maps
5. Protocols: KitStrip, intention/shelf/week/baseline, MoveCard badges/Do·Don't, empty/paywall
6. Settings: language save toast via `translate(newLocale)` + feedback banner above cards
7. AuthGate loading/redirect; EntitlementGate chrome
8. Assert: key parity + NL smoke (Home card title, Today H1, Protocols H1, kit strip)

## Deferred (still EN)
- `hdCopy.ts` / LiteracyCoach / ChartDeepDive essays
- API `main_action_text` / daily_signal bodies / protocol tick `label`/`why` (P1)
- Deep Chart/Soul body beyond H1/subtitle
- Admin / CityPicker

## Prior shipped
- **PR #47** Settings language — MERGED `8351ee5`
- **PR #46** Morning Ritual Option A — MERGED `81d2de8`
