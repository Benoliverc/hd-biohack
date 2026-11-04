# Current build — Settings language (EN/NL/DE/FR/ES) — SHIPPED

- **PR:** https://github.com/Benoliverc/hd-biohack/pull/47 — **MERGED**
- **Branch tip:** `64f0a05` (`64f0a05512899b9f7aef891bf44c32bea4dc5716`) — confirmed at merge
- **Merge commit:** `8351ee5` (`8351ee5a5d4d078ad06720ad459f1342c04f600e`)
- **Handoff:** `.grok-handoff/i18n-settings-5-locales.md`
- **Product handoff:** `handoffs/i18n-settings-5-locales-2026-11-04.md`
- **Status:** SHIPPED 2026-11-04 Asia/Hong_Kong — FE + API. Soft residuals optional (stale save toast locale lag; Protocols H1 EN).

## Deploy
- **Vercel:** READY `dpl_7Wg4ucHngt83RT9dyg8J82WgjuCd` → https://hd-biohack.vercel.app (alias of https://hd-biohack-1y8sukepj-hdbh1.vercel.app)
- **Railway:** SUCCESS `f389724a-d1a6-4134-8a42-0e4ebf7989d5` pinned `--commit 8351ee5a5d4d078ad06720ad459f1342c04f600e` → https://api-production-7527.up.railway.app
- **Smoke:** `/` 200 · `/settings` 200 · `/biohack` 200 · `/login` 200 · API `/health` 200 `{"status":"ok","service":"baseline"}`. Hard-refresh advised for FE.

## Scope shipped
1. Light custom i18n (`frontend/src/lib/i18n`) — catalogs en/nl/de/fr/es
2. Settings Language picker + persist `preferred_locale`
3. API: User column + UserOut + UserSettingsPatch + patch handler + SQLite ALTER
4. Chrome wired: Header, Settings, Login, Home CTAs, TodaysMoveCard / WeatherStrip / TodayIndication shell labels

## Deferred / soft residuals
- Deep `hdCopy.ts` essays and most Chart/Soul/Protocols long-form body copy stay EN for v1
- Soft: save toast one locale behind; Protocols H1 may stay EN; Nav “Home” untranslated in DE/NL

## Prior shipped
- **PR #46** Morning Ritual Option A — MERGED `81d2de8` — FE live on Vercel
