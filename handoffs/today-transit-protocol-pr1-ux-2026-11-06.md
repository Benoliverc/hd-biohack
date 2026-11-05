# UX review — PR 1 Today transit→protocol (engine & join)

**PR:** (fill after open) · **Branch:** `feat/today-transit-protocol`  
**PO handoff:** `handoffs/today-transit-protocol-and-share-2026-11-06.md` (PR 1 only)  
**Hold merge** for Benjamin yes. Softs muted. **PR 2 (Share) not in this PR.**

## What to review on Today (`/transits`)

Three-line prescription under the main card:

1. **Move** — lifestyle, ≤20 words, no HD jargon (gate / Sacral / Strategy stay in collapsed **Why**).
2. **From your kit**
   - **Pro + kit:** one moment-tagged owned item; dose only if already on the kit notes row.
   - **Free / Preview as Free / empty kit:** muted placeholder is **always visible** — never silently omitted:  
     `From your kit: + Log a [calm/focus/recovery] item to pair with today's transit`  
     CTA → Protocols (`/biohack`) kit strip.
3. **When** — Morning / Midday / Evening (bound to the Move, not only the kit).

**I did it** — circle check on Move; on real kit line only (not the placeholder). Persists for the account day. **No streak**, no broken-streak copy, no badges.

Energy / Space chips and Why drawer behaviour unchanged.

## Acceptance checklist

| # | AC | How to poke |
|---|-----|-------------|
| 1 | Move ≤20 words, plain English + When; Why still collapsed with HD + disclaimer | Any natal on Today |
| 2 | Pro + kit: one moment-tagged item; rotates across days; no invented dose | Pro account with 3+ kit items; flip HKT day or wait |
| 3 | Free / Preview as Free / empty kit: muted placeholder names calm/focus/recovery | Toggle Preview as Free; or clear kit |
| 4 | I did it persists for the day; no streak UI | Tap Move; refresh |
| 5 | After ~14 days ignoring a move type, Pro prefers completed sibling | Covered by unit test; optional long history |
| 6 | Deterministic same natal+transit+kit+history | Unit tests |
| 7 | i18n EN/NL/DE/FR/ES for new strings | Flip locale in Settings |

## Testids

Existing indication testids preserved. New: `today-kit-line`, `today-kit-placeholder`, `today-when`, `today-move-done`, `today-kit-done`.

## Out of scope (do not fail PR 1 for these)

Share my Baseline cards, Stripe checkout, push notifications, LLM copy, Soul changes, energy-band formula changes.

## Commercial intent (not UI)

App Store-safe (moments, not drugs). Move free / live kit rotation Pro ($9.99 wedge). Engine 100% deterministic — no LLM.
