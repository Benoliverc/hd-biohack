# i18n deep review — Baseline / hd-biohack (post PR #47)

**Date:** 2026-11-04 (Asia/Hong_Kong)  
**Repo tip reviewed:** `main` @ `65e4a15` (docs) / merge `8351ee5` (PR #47)  
**Ask:** Benjamin — app still looks almost completely English after language switch; quantify + Q&A.  
**Method:** read-only inventory of `frontend/src/lib/i18n/messages/*`, `useI18n`/`t()` call sites, hardcoded JSX/attr strings on major surfaces, API indication builders. No product code changes.

---

## Executive verdict

**Benjamin’s read is correct.** PR #47 shipped working Settings language plumbing + a **thin chrome dictionary** (~93 keys). After switching to NL/DE/FR/ES you mainly see translated **nav chrome, Settings, login, Home hero/CTAs, and a few Protocols/Today shell labels**. Everything that fills the page — indication prose, checklist ticks, kit UI, Chart/Soul essays, Home outcome cards, page H1s — stays English.

**Honest overall (locale = `nl`, Pro user, Home → Today → Protocols):** roughly **~80–90% of user-visible copy still English**. Localized share is closer to **~10–20%** of what you actually read on those screens.

---

## 1. Key counts per locale

| Locale | Keys | Missing vs `en` | Extra vs `en` | Keys ≠ English text |
|--------|------|-----------------|---------------|---------------------|
| `en` | **93** | — | — | source |
| `nl` | **93** | 0 | 0 | 76 (17 identical to EN) |
| `de` | **93** | 0 | 0 | 79 (14 identical) |
| `fr` | **93** | 0 | 0 | 80 (13 identical) |
| `es` | **93** | 0 | 0 | 80 (13 identical) |

**Catalog completeness:** parity is perfect — every locale has the same 93 keys. Coverage problem is **scope of the catalog**, not missing translations inside it.

**Intentionally left as English loanwords / brand (examples in NL):**  
`nav.home` = Home · `nav.chart` = Chart · `nav.soul` = Soul · `nav.admin` = Admin · `brand.name` = Baseline · `tier.free`/`tier.pro` · `protocols.moveTitle` = Today's Move · several Home CTA/card keys. UX review flagged “Home untranslated” — that is **by catalog choice**, not a wiring miss (`Header` does call `t("nav.home")`).

**Unused catalog keys (defined but not referenced in app code):**  
`common.save`, `common.errorGeneric`, `home.card.chart`, `home.card.today`, `home.card.protocols`, `home.card.soul`, `errors.geocode`  
→ Home outcome cards were **not** wired to `home.card.*`; they remain hardcoded English in `app/page.tsx`.

**Files that call `useI18n` / `t()` (only 7 surfaces):**  
`Header.tsx`, `app/page.tsx` (Home), `app/login/page.tsx`, `app/settings/page.tsx`, `TodayIndication.tsx` (shell only), `TodaysMoveCard.tsx` (shell only), `WeatherStrip.tsx` (one link).

**Major TSX with zero i18n:**  
`app/biohack/page.tsx`, `app/transits/page.tsx`, `app/profile/page.tsx`, `app/soul/page.tsx`, `KitStrip.tsx`, `BiohackingEntitlementGate.tsx`, `AuthGate.tsx`, `CityPicker.tsx`, `ChartDeepDive.tsx`, `LiteracyCoach.tsx`, `BodyGraph.tsx`, `app/admin/page.tsx`, plus all of `lib/hdCopy.ts` (~511 lines, ~180 English copy entries).

---

## 2. Surface coverage table

| Surface | Classification | What’s localized | What stays EN |
|---------|----------------|------------------|---------------|
| **Settings** | **Fully localized** (chrome) | Title, subtitle, Language + Timezone blocks, save/loading, gloss, footer | IANA example placeholder; feedback toast stale-locale bug (see Q9) |
| **Login** | **Fully localized** | Headline, pillars, form, invite copy | Password dots only |
| **Header / nav** | **Partially** | Brand, nav labels via keys, Settings/Admin/Sign in·out, tier Free/Pro | Dev chrome; Chart/Soul/Home often still *look* English (loanwords); Admin EN |
| **Home** | **Partially** | Eyebrow, titles, blurbs, path, primary CTAs, morning line, Change | **Four outcome cards** (“Your blueprint”, “What’s active on you”, …) + trust line — hardcoded EN; `home.card.*` unused |
| **Today (`/transits`)** | **Partially** (shell) | Indication H2 keys (`today.indication`, `today.newSignal`), Open Protocols CTA | Page **H1 “Today”**, you-chip copy, Sun/Earth / bridges / centers sections, planet table — all EN; indication **body from API** EN |
| **TodayIndication body** | **English-only (deferred)** | Eyebrow shell + Open Protocols | Energy/Space chips, Vs yesterday, Main action, Why, Chart notes, Save natal chart, API `headline`/`body`/`main_action_*`/`disclaimer`/`conditioning_caption` |
| **Protocols (`/biohack`)** | **Partially** (thin shell) | Today's Move title/progress/complete; “Full sky on Today” link | **H1 “Protocols”**, kit strip, intention, This week, Natal baseline, Shelf, Refresh, paywall gate, tick `label`/`why`/`sub` from API, Do/Don't lists, badges (“From your kit”, “New vs yesterday”) |
| **WeatherStrip chips** | **English-only** | Link text only | `energy_label` / `preferred_space_label` / daily chip from API |
| **Chart (`/profile`)** | **English-only** | — | H1, people list, form, Bodygraph, Deep dive, LiteracyCoach — 0 `t()` |
| **Soul** | **English-only** | — | H1, Playbook, Aura Signature, literacy — 0 `t()` |
| **hdCopy / Literacy / ChartDeepDive** | **English-only (deferred in PR #47)** | — | TYPE/AUTHORITY/CENTER/CHANNEL essays, literacy steps |
| **API indication / protocol ticks** | **English-only** | — | `backend/app/checkin/*`, `biohack/rules.py` — no `preferred_locale` in generation |
| **AuthGate / CityPicker / Admin** | **English-only** | — | Loading/redirect; birth city form; admin |

---

## 3. Q&A double-check (with evidence)

### Q1 — Does Settings Language switch persist and apply without logout?
**Yes (persist + immediate chrome).**  
- Apply: `setLocale(next)` in `onLanguageChange` / `saveLanguage` (`frontend/src/app/settings/page.tsx` ~113–127, 91–105).  
- Persist API: `api.patchUserSettings(..., { preferred_locale })`; column `users.preferred_locale` (`backend/app/models.py`, `_validate_preferred_locale` in `routes.py`).  
- Hydrate: `I18nProvider` reads `accountLocale={user?.preferred_locale}` then localStorage `hd-biohack:preferred-locale` (`I18nProvider.tsx` 69–77; `store.tsx` wraps children).  
- Tests: `backend/tests/test_self_betterment_loop.py` locale round-trip; UX review hard-reload on `es` stayed Ajustes.  
**Caveat:** only surfaces that call `t()` update; rest of app stays EN so “switch works” can feel like “nothing happened.”

### Q2 — Which nav labels are translated?
**All five primary nav keys go through `t(labelKey)`** in `Header.tsx` 11–16 + 219.  
| Key | EN | NL | DE | FR | ES |
|-----|----|----|----|----|-----|
| `nav.home` | Home | Home | Home | Accueil | (translated in es catalog) |
| `nav.chart` | Chart | Chart | Chart | Chart | Chart |
| `nav.today` | Today | Vandaag | Heute | Aujourd'hui | … |
| `nav.protocols` | Protocols | Protocollen | Protokolle | Protocoles | … |
| `nav.soul` | Soul | Soul | Soul | Soul | Soul |

So Today/Protocols/Settings/Sign-out visibly change; **Chart/Soul/Home often still look English** by design.

### Q3 — What % of visible Home chrome is translated?
**Hero + CTAs ~yes; cards ~no.**  
- Translated: eyebrow/title/blurb/path/CTAs/morning (`app/page.tsx` uses ~20 `t()` calls).  
- **Not** translated: outcome card titles/bodies (“Your blueprint”, “What’s active on you”, “Today’s Move” card essay, “Aura between you”), status lines (“Saved”, “Not saved yet”, “Needs a chart”, “Ready”, “Pro — unlock…”), trust line (“Swiss Ephemeris…”, “Informational only…”) — hardcoded from ~line 162.  
- Dead keys: `home.card.*` exist in catalogs but are **never referenced**.  
**Estimate:** ~40–50% of Home *chrome* localized; **~25–35% of total Home visible text** once cards dominate.

### Q4 — Today page — what stays EN?
Almost everything below the indication shell:  
- Hardcoded H1 `"Today"` (`app/transits/page.tsx:158`), “Looking up your natal chart…”, “Friends stay on Chart & Soul”, “Sun / Earth theme”, “Bridged channels (conditioning)”, “Newly defined centers today”, planet table headers.  
- `TodayIndication.tsx`: shell titles via `t("today.indication")` / `t("today.newSignal")`; **hardcoded** “Reading your chart weather…”, “Vs yesterday”, “Main action”, “Why”, “Chart notes”, “Still conditioning”, ENERGY_CHIPS / SPACE_CHIPS (`Drained`…`Out & about`), “Save natal chart”.  
- Payload fields `daily.headline`, `daily.body`, `main_action_text`, `main_action_why`, `disclaimer`, `conditioning_caption`, `energy_label`, `preferred_space_label` — **API English**.

### Q5 — Protocols / biohack — what stays EN?
- Localized shell only: `protocols.moveTitle`, `donePct`, `moveComplete`, `moveProgress`, `fullSkyOnToday`, `openProtocols`.  
- Hardcoded page chrome: H1 `"Protocols"` (`biohack/page.tsx:898`), “Your stack — prove today's timed leads.”, “No You chart”, “Save on Chart”, “This week”, “Natal baseline”, intention placeholder, Shelf/kit editor, Refresh/Building…  
- `KitStrip.tsx`: “Your kit”, “Add items”/“Edit”, empty copy — no i18n.  
- `TodaysMoveCard.tsx`: badges “From your kit”, “New vs yesterday”, “Reflection”, “Do”/“Don't”, “Baseline kit…”, placeholders — EN; **item labels come from API**.  
- `BiohackingEntitlementGate.tsx`: entire waitlist/lock copy EN.

### Q6 — Is API-returned indication prose localized?
**No.** Generation is English-only; no locale argument.  
- Labels: `ENERGY_LABELS` / space labels / disclaimers in `backend/app/checkin/derive.py` (e.g. disclaimer ~366).  
- Caption: `CONDITIONING_CAPTION` in `backend/app/checkin/novelty.py:14-16`.  
- Main action: `backend/app/checkin/rules.py` `compute_main_action`.  
- Protocol tick copy / energy_label branching: `backend/app/biohack/rules.py` (English f-strings).  
- `preferred_locale` is stored on the user but **not consulted** by checkin/biohack builders.

### Q7 — Is hdCopy.ts / Literacy / Chart deep-dive localized?
**No.**  
- `frontend/src/lib/hdCopy.ts` (~511 lines) — TYPE_COPY, AUTHORITY_COPY, CENTER_COPY, CHANNEL_COPY, literacy steps — English constants, no locale.  
- `LiteracyCoach.tsx` / `ChartDeepDive.tsx` — 0 `useI18n`; UI labels (“Deep dive”, “Learn more”, domain tabs) hardcoded.  
- Explicitly deferred in PR #47 handoff (`.grok-handoff/i18n-settings-5-locales.md`).

### Q8 — Login / empty states / errors?
- **Login:** largely localized (good).  
- **Empty / gate states:** mostly EN — AuthGate “Loading…” / “Redirecting to sign in…”; Protocols “No You chart”; Kit empty; Free paywall gate; Today no-natal tips.  
- **Errors:** `common.errorGeneric` unused; geocode `errors.geocode` unused; many `e.message` / inline English strings remain. Login uses `t("login.failed")` / `missingCreds`.

### Q9 — Soft residual stale save-toast — still present?
**Yes — still in code on `main`.**  
1. **Stale locale:** `onLanguageChange` calls `setLocale(next)` then immediately `setFeedback(t("settings.savedLanguage", …))` with the **pre-update** `t` closure → toast text is one locale behind until remount/reload (`settings/page.tsx` 113–127). Same pattern risk in `saveLanguage` 98–105.  
2. **Wrong card:** shared `{feedback}` renders **inside the Timezone `<section>`** (lines 277–281), so a Language save confirmation appears under Timezone (matches UX soft note).

### Q10 — Is “almost completely English” accurate? Estimate % still EN when locale=nl
**Yes — accurate.**  
- Catalog is only **93** UI strings; NL changes 76 of them, but many never appear on Today/Protocols body.  
- Primary path weight: Home cards + Today body + Protocols body + API prose ≫ translated chrome.  
- **Estimate for NL Pro morning path:** **~80–90% of user-visible strings still English** (chrome-only islands feel translated; content does not).  
- If counting only “chrome chrome” (nav + settings + login + home hero), closer to **~60–70% localized** — which is why Settings/login feel fine while the product still “reads English.”

---

## 4. Top 10 highest-impact untranslated string clusters

1. **API Today indication prose** — `daily_signal`, `main_action_*`, disclaimer, drivers (`checkin/derive.py`, `rules.py`, `novelty.py`). Dominates Today.  
2. **API Protocols checklist labels / why / Do·Don't / energy_label chips** (`biohack/rules.py`, kit_variety). Dominates Protocols.  
3. **Home outcome cards** — hardcoded essays; unused `home.card.*` keys. First thing after login.  
4. **Today page chrome** — H1 + overlay sections (`transits/page.tsx`).  
5. **Protocols page chrome** — H1, kit strip, intention, week, natal baseline (`biohack/page.tsx`, `KitStrip.tsx`).  
6. **TodayIndication local chrome** — Energy/Space chips, Vs yesterday, Main action/Why labels (`TodayIndication.tsx`).  
7. **TodaysMoveCard microcopy** — From your kit, New vs yesterday, Reflection, Do/Don't, baseline kit.  
8. **Chart surface** — H1, people, form, Bodygraph chrome (`profile/page.tsx`).  
9. **hdCopy + ChartDeepDive + LiteracyCoach** — long-form HD education (largest volume; OK to stay P2).  
10. **Paywall / empty / AuthGate** — Free lock copy, loading redirects (`BiohackingEntitlementGate.tsx`, `AuthGate.tsx`).

**Also fix (small, high annoyance):** stale language save toast + feedback placement (Q9).

---

## 5. Prioritized fix backlog (AI-first NL/DE/FR/ES OK)

### P0 — Make language switch *feel* real (1 PR)
1. Wire **Home outcome cards** to i18n (use or replace dead `home.card.*`).  
2. Localize **page H1s + primary subtitles**: Today, Protocols, Chart, Soul.  
3. Localize **TodayIndication** static chrome (chips, Vs yesterday, Main action, Why, Still conditioning, loading).  
4. Localize **Protocols shell**: KitStrip, intention placeholder, This week / Natal baseline headers, Refresh, empty You chart, MoveCard badges/Do·Don't/Reflection.  
5. Fix **save feedback**: compute toast with explicit locale table lookup (or `useEffect` on locale), render feedback **above** both cards (or per-card).  
6. Use dead keys or delete them (`home.card.*`, `common.errorGeneric`, `errors.geocode`).

### P1 — Content that users read every day
7. Pass `preferred_locale` into indication + protocols builders **or** add FE message maps for known enums (`energy_label`, `preferred_space_label`) + translate high-frequency templates.  
8. Localize BiohackingEntitlementGate + AuthGate + CityPicker labels.  
9. Localize remaining Home trust line + status chips.

### P2 — Depth (do after chrome feels native)
10. `hdCopy.ts` essays + LiteracyCoach + ChartDeepDive + Soul Playbook long-form.  
11. Admin (low user traffic).  
12. Optional: localize product names (Today's Move / Chart / Soul) per locale instead of loanwords.

---

## 6. Suggested PO ticket for @dev (next PR)

**Title:** i18n P0 — make NL/DE/FR/ES feel real (chrome + shell, not essays)

**Goal:** After switching language in Settings, Home / Today / Protocols / Chart / Soul **primary chrome** reads in that language. Deep HD essays (`hdCopy`) and full API prose can stay EN this PR if called out; enum labels that appear as chips should translate.

**Scope**
1. Expand `frontend/src/lib/i18n/messages/{en,nl,de,fr,es}.ts` for P0 strings (AI draft OK).  
2. Wire `t()` into: Home outcome cards; `transits` H1/sections; `biohack` H1/kit/intention/week/baseline; `KitStrip`; `TodayIndication` static UI; `TodaysMoveCard` badges/Do·Don't/Reflection; Chart + Soul H1/primary empty states; AuthGate loading; EntitlementGate.  
3. FE map for API enums: energy labels + space labels (and optionally vs_yesterday field prefixes) so WeatherStrip/TodayIndication chips localize even if essay text stays EN.  
4. Fix Settings feedback stale-locale + move feedback out of Timezone-only section.  
5. Assert script: key parity across 5 locales; smoke that `nl` changes Home card title + Today H1 + Protocols H1 + kit strip.

**Out of scope (this PR):** wholesale `hdCopy.ts` / LiteracyCoach essays; full backend template localization of `main_action_text` / daily_signal bodies (follow-up P1).

**Acceptance**
- [ ] Locale = `nl` (and spot-check `de`): Home cards, Today H1, Protocols H1, Kit strip, indication chrome labels are Dutch/German — not English.  
- [ ] Language save toast matches **new** locale and is not trapped under Timezone only.  
- [ ] Catalog key parity still 1:1; `tsc` + existing `assert:i18n-settings` still PASS (extend assert).  
- [ ] PR → UX → Ship Gate → **Benjamin merge yes**.

**Success report:** branch, PR URL, key count before/after, list of still-EN deferred clusters.

---

## Appendix — plumbing reference

| Piece | Location |
|-------|----------|
| Locales | `frontend/src/lib/i18n/types.ts` — `en\|nl\|de\|fr\|es` |
| Provider | `frontend/src/lib/i18n/I18nProvider.tsx` |
| Messages | `frontend/src/lib/i18n/messages/*.ts` (93 keys each) |
| Persist | `users.preferred_locale` + `PATCH` settings |
| Prior handoff | `handoffs/i18n-settings-5-locales-2026-11-04.md` |
| UX notes | `.grok-handoff/i18n-settings-5-locales-ux-review.md` |

*End of audit — read-only; no PR opened.*
