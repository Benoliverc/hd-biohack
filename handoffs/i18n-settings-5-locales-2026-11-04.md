# Handoff: Settings language — EN · NL · DE · FR · ES

**PO:** Grok Bot · **Owner:** Full Stack Developer (@dev)  
**Date:** 2026-11-04 · **Repo:** Benoliverc/hd-biohack · **Base:** `main`  
**Ask:** Benjamin — add English, Dutch, German, French, Spanish as a language option in Settings.

## Goal
User can pick UI language in Settings. App strings switch immediately (or on soft remount). Persist choice on the account.

## Locales (BCP-47)
| Code | Label in picker (native) |
|------|--------------------------|
| `en` | English |
| `nl` | Nederlands |
| `de` | Deutsch |
| `fr` | Français |
| `es` | Español |

Default: `en`. No Chinese / JP / KO in this PR.

## Scope (this PR)
1. **i18n plumbing** on frontend (prefer `next-intl` or light custom dict — match existing Next app patterns; keep it simple).
2. **Settings UI:** Language select below (or near) timezone; `data-testid="settings-language"` + select `settings-lang-select` + save if needed (or apply on change).
3. **Persist:** `preferred_locale` on user (nullable; null → `en`). Extend `UserSettingsPatch` + `patchUserSettings` + session user shape the same way as `preferred_timezone`.
4. **Translate user-facing UI chrome** for NL/DE/FR/ES with AI-quality copy (PO/Grok Bot will supply or you generate): nav, Settings, login, Today/Protocols shell labels, empty states, primary CTAs, errors. HD jargon may stay English terms where natural (Type, Authority, Centers) — gloss once in locale files if needed.
5. **Do not** block on native human review. AI draft OK for these five.

## Out of scope
- Traditional/Simplified Chinese, Japanese, Korean, etc.
- Localizing long HD essay copy in `hdCopy.ts` wholesale (optional: translate keys that surface above the fold on Today/Protocols; deep dive can stay EN for v1 if time-boxed — call out in PR if deferred).
- Railway/API copy beyond user settings field.
- Changing Daily Novelty HKT rules.

## Acceptance
- [ ] Settings shows Language with the five options (native labels).
- [ ] Choosing NL/DE/FR/ES switches UI chrome without logout.
- [ ] Preference survives reload (API `preferred_locale`).
- [ ] EN remains default for new / unset users.
- [ ] No layout blowouts on DE/FR (leave room for longer strings).
- [ ] Tests or smoke: settings page + locale persist.
- [ ] PR → UX UI Review → Ship Gate → **wait for Benjamin merge yes** before merge/deploy.

## Success report back to PO
Branch, PR URL, what was translated vs deferred (e.g. deep `hdCopy`), and any API migration note.
