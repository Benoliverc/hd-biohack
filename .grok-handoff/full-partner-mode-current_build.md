# Full Partner mode — current build

**Date:** 2026-11-07 (Asia/Hong Kong)
**PR:** [#80](https://github.com/Benoliverc/hd-biohack/pull/80)
**Tip SHA:** `d39cf7e9fb21654dd82570c98d84f4f813e759ab`
**Branch:** `feat/full-partner-mode`
**Base:** `origin/main` @ `12aaecf2d3d8e376bde93202bf7a3f528c8b4e0a` (post PR #79)
**Worktree:** `/workspace/hd-biohack-wt-full-partner-mode`
**Do not merge** — Grok Bot routes UX UI Review → Ship Gate QA; Benjamin yes after.

## Scope shipped
1. Color tokens — sand-amber `--energy #c59659`, ink/soft/recovery; wash 82/18; softer radials
2. Love guidance magazine IA (no five tabs) in `PartnerOverviewCard.tsx`
3. Everyday partner copy in `partner_insights.py` + `partner_love_dynamics.py` (research §5 + broader sacral/wave → gut/weather)
4. Partner-only Aura Signature FE map (`partnerSignatureCopy.ts`) — approved curiosity-first copy
5. Partner clarity: reason line + Open Chart (`/profile`) + chip `Partner · Love guidance`; missing-overview note

## Leave alone (confirmed)
- `soul_sync.py` SIGNATURES scoring/ids untouched
- Friend/Person path alchemy voice unchanged (except global token hue)
- Visibility gate unchanged

## Preview
- Local: http://127.0.0.1:3022
- HTTP: `/` 200, `/soul` 200 (verified 2026-11-07 Asia/Hong Kong)

## Tests
- `npx tsc --noEmit` (frontend) — clean
- `pytest tests/test_soul_sync.py` — 32 passed (gold banks updated via source; assertions pull from banks)

## Backend copy changed
Yes. Gold strings in CENTER_BANK / TYPE-pair chapters / AUTHORITY_DECIDE / Intimacy nuance updated. Gen+Projector hook verbatim.

## Open questions / deviations
- Almost none. Dark `--energy-ink` set to sand-tinted `#e0c49a` (brief specified light ink only).
- API-missing banner shifted from energy copper to `border-border` + growth soft (brief optional).
