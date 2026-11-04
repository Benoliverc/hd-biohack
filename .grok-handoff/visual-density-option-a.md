# UX handoff — Visual density Option A

**PR:** https://github.com/Benoliverc/hd-biohack/pull/49 · **Branch:** `feat/visual-density-option-a`  
**PO ticket:** `.grok-handoff/visual-density-option-a-2026-11-04.md`  
**Date:** 2026-11-04 (Asia/Hong_Kong)  
**FE-only** — no API / Railway

## Goal
Fix “a bit empty” without photos/illustration — card lift + hierarchy + thin labeled Lucide + status glyphs (WHOOP/Oura analog).

## What changed (surfaces)

### Card lift / hierarchy
- Strengthened `shadow-soft` (tailwind) for clearer elevated vs `--canvas`
- Applied `shadow-soft` on Home hero + outcome cards, Settings cards, Today indication / conditioning / newly-defined / bridged, KitStrip, Shelf/Intention disclosures
- Main Action: growth ring + primary optical weight; energy/space status cluster fills former half-blank right pane
- Home: status chips beside titles (no orphan “Me” / “Ready” at equal-height card bottoms)

### Thin Lucide (~12 new labeled / section uses)
- Settings: `Languages`, `Clock` on section headers
- Today: `Zap` on new-signal; `BatteryMedium` / `MapPin` on Main Action status; `Hexagon` on newly-defined centers (+ per-chip mark)
- Protocols: `Sunrise` / `Sun` / `Moon` on Move rows; `Package` + `Plus` on KitStrip; `ChevronRight` + `Package` on Shelf; `ChevronRight` on Intention; `Package` + `ChevronDown` on InventoryPanel

### Status glyphs
- Protocols progress: bordered strip with label + done% + thicker bar (not hairline void)
- Today Main Action: compact energy/space status cluster
- Newly defined centers: bordered chips with hexagon marks

## Do NOT (untouched)
BodyGraph, Move DO/DON'T bodies, planet table, login pillars, primary nav icons, photos/illustration, soft i18n residuals / API indication bodies.

## i18n
No new catalog keys — reused existing chrome strings. Aria uses existing keys (`today.stillConditioning`, `protocols.moveProgress`). Decorative icons `aria-hidden`.

## QA
- `cd frontend && npx tsc --noEmit` PASS
- `node scripts/assert-i18n-settings-5-locales.mjs` PASS · keys=207

## Soft / deferred
- Optional tighter ritual max-width (AC5) — not needed after 1–4
- Chart “HOW YOU DECIDE” column void / how-to-read shells (out of Option A hotspots for morning path)
- InventoryPanel “Your kit” / Show|Hide still EN hardcoded (soft i18n residual — out of scope)

## Review path
UX UI Review → Ship Gate → **Benjamin merge yes** before merge/deploy.
