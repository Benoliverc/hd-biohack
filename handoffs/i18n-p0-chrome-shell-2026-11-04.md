# Handoff: i18n P0 — make NL/DE/FR/ES feel real

**PO:** Grok Bot · **Owner:** Full Stack Developer (@dev)  
**Date:** 2026-11-04 · **Repo:** Benoliverc/hd-biohack · **Base:** `main`  
**Ask:** Benjamin — “Do it” after deep review: app still ~80–90% English on NL Home→Today→Protocols.

**Evidence:** `handoffs/i18n-deep-review-2026-11-04.md` + live walk (Settings/Home/Today/Protocols NL+DE).

## Goal
After switching language in Settings, **primary chrome** on Home / Today / Protocols / Chart / Soul reads in that language. Deep HD essays and full API indication bodies may stay EN this PR if called out.

## Scope
1. Expand `frontend/src/lib/i18n/messages/{en,nl,de,fr,es}.ts` (AI draft OK; key parity 1:1).
2. Wire `t()` into:
   - Home outcome cards (use or replace dead `home.card.*`) + trust/status chips still EN
   - Page H1s + primary subtitles: Today (`transits`), Protocols (`biohack`), Chart (`profile`), Soul
   - `TodayIndication` static chrome: Energy/Space chip labels, Vs yesterday, Main action, Why, Still conditioning, loading, Chart notes
   - Protocols shell: `KitStrip`, intention placeholder, This week / Natal baseline, Refresh, empty You chart, Free paywall / entitlement gate copy
   - `TodaysMoveCard` badges (From your kit, New vs yesterday), Do/Don't, Reflection, baseline kit line
   - AuthGate loading/redirect
3. FE enum maps for API chips: `energy_label` + `preferred_space_label` (and similar short enums) so WeatherStrip/TodayIndication chips localize even if essay text stays EN.
4. Fix Settings feedback: toast must use **new** locale (not stale `t` closure); don’t trap Language save feedback under Timezone-only section.
5. Extend assert script: key parity; smoke that `nl` changes Home card title + Today H1 + Protocols H1 + kit strip.

## Out of scope
- Wholesale `hdCopy.ts` / LiteracyCoach / ChartDeepDive essays
- Full backend localization of `main_action_text` / daily_signal bodies / protocol tick `label`/`why` (P1 follow-up)
- New locales beyond en|nl|de|fr|es

## Acceptance
- [ ] Locale `nl` (spot-check `de`): Home cards, Today H1, Protocols H1, Kit strip, indication chrome labels are Dutch/German — not English.
- [ ] Language save toast matches **new** locale; not only under Timezone.
- [ ] Catalog key parity 1:1; `tsc` + i18n assert PASS.
- [ ] PR → UX UI Review → Ship Gate → **wait for Benjamin merge yes**.

## Report back
Branch, PR URL, key count before/after (~93 → ?), still-EN deferred clusters.
