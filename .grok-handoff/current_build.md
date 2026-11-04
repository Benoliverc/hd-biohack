# Current build — Settings language (EN/NL/DE/FR/ES) — READY_FOR_UX

- **Branch:** `feat/i18n-settings-5-locales`
- **Base tip at branch cut:** `87a582d` (docs ship #46)
- **Handoff:** `.grok-handoff/i18n-settings-5-locales.md`
- **Product handoff:** `handoffs/i18n-settings-5-locales-2026-11-04.md`
- **Status:** READY_FOR_UX — **do not merge/deploy** until Benjamin yes after UX → Ship Gate

## Scope landed
1. Light custom i18n (`frontend/src/lib/i18n`) — catalogs en/nl/de/fr/es
2. Settings Language picker + persist `preferred_locale`
3. API: User column + UserOut + UserSettingsPatch + patch handler + SQLite ALTER
4. Chrome wired: Header, Settings, Login, Home CTAs, TodaysMoveCard / WeatherStrip / TodayIndication shell labels

## Deferred
- Deep `hdCopy.ts` essays and most Chart/Soul/Protocols long-form body copy stay EN for v1

## Open questions
- Whether next-intl should replace the light dict in a follow-up
- How much of `hdCopy` / indication API prose to localise in v2

## Prior shipped
- **PR #46** Morning Ritual Option A — MERGED; Vercel READY
