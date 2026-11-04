# UX handoff — Settings language (EN · NL · DE · FR · ES)

**Status:** READY_FOR_UX  
**Branch:** `feat/i18n-settings-5-locales`  
**PO:** Grok Bot · **Ask:** Benjamin  

## What to review
1. **Settings → Language** (near Timezone): picker with native labels English / Nederlands / Deutsch / Français / Español; `data-testid="settings-language"` + `settings-lang-select`.
2. Changing language switches **UI chrome immediately** (nav, Settings, login, Home CTAs, Protocols shell labels) without logout.
3. Preference **survives reload** via API `preferred_locale` (null → EN).
4. **DE/FR** longer strings: Language + Timezone cards are full-width selects; nav uses `whitespace-nowrap` — check no clipping on narrow viewports.
5. HD jargon (Type, Authority, Centers, Today's Move product name) intentionally stays EN in places; gloss note under Language picker.

## Deferred (v1)
Deep `hdCopy.ts` essays, Chart deep-dive body copy, Soul essays, long Protocols/Today indication API prose — remain English. Call out in PR.

## Out of scope
ZH / JP / KO; Daily Novelty HKT rules; Railway copy beyond settings field.

## Ship path
UX UI Review → Ship Gate → **wait for Benjamin merge yes** before merge/deploy.
