# UX critique — Home reflects shipped Baseline

**Date:** 2026-10-23 (Asia/Hong_Kong)  
**Route:** `/` (`frontend/src/app/page.tsx`)  
**PO audit:** `.grok-handoff/home-reflect-ships.md`  
**Live check:** `http://127.0.0.1:3000/` (Dev Pro + no-chart Sam). Vercel `/` → login wall.  
**Shots:** `/workspace/hd-biohack-ui-failures/ux-review-2026-10-23/home-reflect/`  
**Scope:** Marketing home copy + IA only — not `/biohack` / `/transits` / `/soul` feature work.

## Verdict

Home still sells **pre-#24 / pre-kit / pre-indication / pre-Soul** Baseline. All six PO stale findings **confirm live**. **PASS to @dev** after this fold-in — FE-only, no API.

**IA call:** **4 outcome cards** (2×2 on `md+`, stack on mobile). Soul in nav but absent from body is a P0 product lie.

**CTA call (has-chart):** Keep hero primary **Open your chart**. Make continue-strip CTA the **do** path: solid growth **Open Protocols** (not muted border, not Generate). Secondary hero → **Today’s sky** (not “gates”).

## Live findings

| # | Live (has-chart Dev Pro) | Product truth | Severity |
|---|--------------------------|---------------|----------|
| S1 | Continue CTA: **Generate today’s protocol** | Auto-load + **Refresh** rebuild (#24) | P0 |
| S2–3 | Protocols card: **Your plan** · “day and week **stacks**” · **inventory** | Weather → **Today’s Move** (checkable) → **Your kit** / From your kit (#24/#25) | P0 |
| S4 | Today card + hero secondary: **gates**-first (“Today’s planetary gates”, “Today’s gates”) | Energy · Space · Main action; gates secondary; **You-only** | P0 |
| S5 | 3 cards; **Soul nowhere** on body | Nav: Home · Chart · Soul · Today · Protocols | P0 |
| S6 | Eyebrow: `Human Design · daily protocols` | Brand **Baseline**; loop chart → sky → move → chemistry | P1 (nice) |
| — | Blueprint why: “Today and Protocols” only | Soul also reads chart; Me/Friends not named | P0 light |
| — | Sub: “Chart and today’s **gates** stay free.” | Sky / indication free | P0 light |

**No-chart (Sam):** H1/CTAs fine conceptually; still says “today’s gates” and Protocols card still inventory/stacks. Continue strip correctly hidden. (Header “Pro unlocked” on Sam is a separate Dev chrome quirk — out of home-copy scope.)

**Mobile (390):** Cards stack; CTAs full-width of column; nav wraps (Protocols on row 2). 4-card grid must stay one column on small; `md:grid-cols-2` then optional `lg:grid-cols-4` or keep 2×2.

## Must-fix (block “done”)

1. Kill every **Generate** string on home. Continue CTA → **Open Protocols** (alt OK: **Open today’s move**).
2. Protocols card: drop **inventory** / **stacks** / “Your plan”. Title **Today’s Move**; body Weather + checkable day + kit.
3. Today card + hero secondary: indication-first (**Energy · Space · Main action**), not gates-first. Say **You-only** / friends stay on Chart & Soul.
4. Add **Soul** 4th outcome card (Aura Signature + single Playbook; **no Fit %**, no Life/Work/Play tabs).
5. Blueprint: mention **You + friends**; why includes Soul.
6. Has-chart subcopy: no “gates stay free” — sky / indication language; may mention kit lightly.
7. Preserve test ids `home-calculate-chart` / `home-view-protocols` (or alias). Trust line keep.
8. Destinations only: `/profile`, `/transits`, `/biohack`, `/soul` — no new routes.

## Nice (same PR if cheap)

- Eyebrow → `Baseline · chart · sky · move` (or `Baseline · Human Design, daily`)
- Thin loop under sub: `Chart → Today’s sky → Today’s Move → Soul`
- Continue micro: `Auto-loads · Refresh rebuilds`
- Strip CTA visually primary (solid growth) when has-chart
- Metadata description mention Soul / kit (optional)
- Product stills — **defer**; home has zero shots today; don’t block copy P0

## Out of scope

Header nav order, screenshot pipeline, Protocols/Soul/Today feature work, paywall, Fit % revival, OAuth marketing.

## IA (ship this)

```
Hero (eyebrow · H1 · sub · primary · secondary)
  └─ Continue strip (has-chart): chip · Change · Open Protocols [solid]
Outcome grid — 4 cards
  1. Chart     → /profile
  2. Today     → /transits
  3. Protocols → /biohack   (data-testid home-view-protocols)
  4. Soul      → /soul
Trust line
```

Grid: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` (or `md:grid-cols-2` only — either fine; avoid forcing 4-across on tablet).

**Icons:** keep UserRound / Activity / FlaskConical; Soul → Sparkles (already in Header).

## Copy bank (UX — use these)

### Hero
- **Eyebrow (nice):** `Baseline · chart · sky · move`
- **H1 no-chart:** `Know your chart. Run today with it.` *(keep)*
- **H1 has-chart:** `Continue with your chart` *(keep)*
- **Sub no-chart:** `Save your natal free. Today’s sky stays free. Protocols unlock with Pro when you’re ready.`
- **Sub has-chart:** `Chart and today’s sky stay free. Protocols turn the sky into a checkable move — using your kit when you own it.`
- **Primary no-chart:** `Calculate my chart` → `/profile`
- **Primary has-chart:** `Open your chart` → `/profile`
- **Secondary no-chart:** `See today’s sky` → `/transits`
- **Secondary has-chart:** `Today’s sky` → `/transits`

### Continue strip
- Chip / Change: keep
- CTA: **`Open Protocols`** → `/biohack`  
- Optional micro under/beside: `Auto-loads from today’s sky · Refresh rebuilds`

### Card — Chart (`/profile`)
- Title: **Your blueprint**
- Body: `Type, authority, centers, and gates — the map everything else uses.`
- Bullets:
  - `You + friends you save (friends never drive Today or Protocols)`
  - `Why: Today, Protocols, and Soul all read this first`
- Status: keep Saved / label / Not saved yet

### Card — Today (`/transits`)
- Eyebrow: **Today**
- Title: **What’s active on you**
- Body: `Energy, space, and one main action from your natal × today’s sky.`
- Bullets:
  - `Always your chart — friends stay on Chart & Soul`
  - `Why: catch pressure and openings before you plan`

### Card — Protocols (`/biohack`)
- Title: **Today’s Move**
- Body: `Weather from Today, a checkable day list, week theme — preferring compounds in your kit.`
- Bullets:
  - `Auto-loads; Refresh rebuilds when the sky or kit changes`
  - `From your kit shows when your shelf steered the move`
- Status: keep Needs a chart / Ready / Pro — unlock…

### Card — Soul (`/soul`)
- Title: **Aura between you**
- Body: `Signatures and a single Playbook for how your aura wires with someone you’ve charted.`
- Bullets:
  - `No Fit % — magnetic pairs get protocols, not a weak score`
  - `Why: chemistry lives here; daily weather lives on Today & Protocols`

### Prefer / avoid

| Prefer | Avoid |
|--------|--------|
| Baseline | HD Biohack (user-facing) |
| Your kit / From your kit | Inventory |
| Today’s Move / Open Protocols | Generate today’s protocol |
| Today’s sky / Energy · Space · Main action | Gates-only Today framing |
| Aura Signature / Playbook | Fit %, Life/Work/Play tabs |
| You-only | Friend-driven Today |

## Success criteria (UX PASS when)

1. Cold read: user sees **Today’s Move**, **kit**, **Soul**; does **not** hunt Generate or inventory.
2. Has-chart continue path opens Protocols without promising a Generate click.
3. Soul card present; no Fit % / tab language.
4. Today card never implies a friend can drive the page.
5. Ship Gate smoke: four card + hero CTAs hit `/profile`, `/transits`, `/biohack`, `/soul`.

## Ship notes for @dev

- Touch: `frontend/src/app/page.tsx` (+ metadata in `layout.tsx` only if doing nice).
- No backend. Vercel-only deploy after Ship Gate.
- Update any Playwright/string asserts that expect “Generate”, “Your plan”, “inventory”, or 3-card grid.
- Shots for gate: has-chart hero+strip, 4-card grid desktop, no-chart hero, mobile stack.

## Handoff

1. PO audit — done (`home-reflect-ships.md`)  
2. **@ui-ux** — this critique — **done**  
3. **@dev** — FE home refresh to this copy/IA  
4. Ship Gate → merge → Vercel only
