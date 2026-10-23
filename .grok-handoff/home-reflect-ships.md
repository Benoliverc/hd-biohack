# P0 — Home reflects shipped Baseline (post #24 / #25 / Today You / Soul Aura)

**Status:** Draft for PO → `@ui-ux` critique → then `@dev`  
**App:** Baseline (repo `hd-biohack`)  
**Route:** `/` (`frontend/src/app/page.tsx`) · live https://hd-biohack.vercel.app/  
**Date:** 2026-10-23 (Asia/Hong_Kong)  
**Owner ask:** Update home to reflect all recent ships; check with UI/UX to make it great.

**Not this brief:** Code changes, Protocols/Soul/Today feature work, SEO overhaul, new screenshots production (nice only).

---

## 1. Why this exists

Home still sells a **pre-redesign** product:

| Live product (shipped) | Home today |
|---|---|
| Brand **Baseline** (Header + metadata) | Hero eyebrow still generic “Human Design · daily protocols” — never says Baseline’s story |
| Protocols: Weather → Today’s Move (checkable) → Week → Natal → **Your kit**; auto-load; Refresh = rebuild; **From your kit** | CTA **“Generate today’s protocol”**; card says **inventory** + vague “day and week stacks” |
| Today: Energy / Space indication + Main action; **You-only** (friends on Chart & Soul) | Card = “Today’s planetary gates” only |
| Soul: Aura Alchemy signatures, single **Playbook**, somatic / wire / spark-glue depth | **No Soul card or mention** despite primary nav |
| Chart: Me / Friends; Today & Protocols lock to You | Blueprint card = Type/Authority pamphlet only |

Users land, open Protocols expecting a Generate ritual and “inventory stacks,” and miss Soul entirely from the marketing surface.

---

## 2. Audit of current home (`page.tsx`)

### Structure (as shipped)
1. **Hero** — eyebrow, H1 (no-chart / has-chart), subcopy, primary CTA → `/profile`, secondary → `/transits`, optional continue strip (chart chip + Protocols CTA)
2. **Three outcome cards** — Blueprint (`/profile`), What’s active now (`/transits`), Your plan (`/biohack`)
3. **Trust line** — Swiss Ephemeris · self-hosted · not medical advice

### What’s fine (keep)
- Metadata already Baseline-branded (`layout.tsx`)
- Header wordmark **Baseline** + nav Chart / Soul / Today / Protocols
- Free vs Pro framing for Protocols status
- Chart-first primary CTA when no natal
- Thin trust / informational disclaimer
- No fake screenshots claiming features we don’t have
- Continue strip when chart exists (conceptually right — needs copy update)

### Stale / misleading (must fix in copy)

| # | Location | Current | Why wrong |
|---|---|---|---|
| S1 | Continue strip CTA | “Generate today’s protocol” | Protocols **auto-loads**; button is **Refresh** (rebuild). Generate ritual is gone (#24). |
| S2 | Protocols card body | “…chart, sky, and **inventory**” | Product language is **Your kit** / **From your kit** (#25). Inventory is internal/API. |
| S3 | Protocols card title + bullets | “Your plan” / “stacks” / “concrete next steps” | Undersells **Weather** + sky-driven **Today’s Move** + checkable day list + week theme. Reads like old laminate. |
| S4 | Today card | “Today’s planetary gates…” only | Misses **Energy / Space indication**, Main action, and **You-only** lock. |
| S5 | Home IA | 3 cards; **Soul absent** | Soul is a first-class nav surface (Aura Alchemy). Home implies Baseline is chart→gates→stacks only. |
| S6 | Hero eyebrow | “Human Design · daily protocols” | Fine as category, but doesn’t signal Baseline’s shipped loop (chart · sky · move · kit · chemistry). |

### Missing (should surface)

| # | Gap | Ship reference |
|---|---|---|
| M1 | Soul outcome (Aura Signature + Playbook between you & a friend) | Soul Aura Alchemy + playbook copy |
| M2 | Kit as visible lever on Protocols (“owns what you already have”) | #25 kit strip / badges |
| M3 | Today = indication-first, not gate list-first | Today HD indication + You-only |
| M4 | Protocols = do the sky today (not generate a static week stack) | #24 redesign |

### Not on home (OK / don’t invent)
- No marketing screenshots or alts today — **nice** to add after UX; not required for copy P0
- Admin, paywall stub, LLM coaching, wearables, Fit % (killed)
- Life/Work/Play **tabs** — removed; home must not reintroduce them (single Playbook)

---

## 3. Goals

1. Home **matches language and affordances** of live Chart / Today / Protocols / Soul.
2. Returning users with a chart get a **Continue** path that opens Protocols as “today’s move,” not Generate.
3. New users understand the **Baseline loop** in one screen: blueprint → sky (Today) → do it (Protocols + kit) → chemistry (Soul).
4. Zero promises of Fit %, inventory shelves, friend-driven Today, or Generate rituals.

**Non-goals:** Redesign AppShell/Header; new pricing page; screenshot production pipeline; changing `/biohack` route id.

---

## 4. Recommended IA (home)

Keep single-column hero + cards. **Prefer 4 outcome cards** (or 2×2 on `md+`) so Soul isn’t orphaned:

```
Hero (Baseline loop + CTAs)
  └─ Continue strip (has-chart): chip · Change · Open Protocols
Outcome grid
  1. Chart — Your blueprint (Me / Friends)
  2. Today — Sky on you (Energy · Space · Main action)
  3. Protocols — Today’s Move + Your kit
  4. Soul — Aura alchemy (you ↔ friend, one Playbook)
Trust line
```

**CTA priority**
- No chart: primary **Calculate my chart** → `/profile`; secondary **See today’s sky** → `/transits`
- Has chart: primary **Open your chart** *or* elevate **Open Protocols** in continue strip (UX to pick which is #1); secondary **Today’s sky**
- Never: “Generate protocol”

Optional thin **loop line** under hero subcopy (nice):  
`Chart → Today’s sky → Today’s Move → Soul`

---

## 5. Copy bank (draft — UX may tighten)

### Hero
- **Eyebrow:** `Baseline · Human Design, daily`  
  Alt: `Baseline · chart, sky, protocols`
- **H1 (no chart):** `Know your chart. Run today with it.` *(keep — still sharp)*
- **H1 (has chart):** `Continue with your chart` *(keep)*
- **Sub (no chart):** `Save your natal free. Today’s sky stays free. Protocols unlock with Pro when you’re ready.`
- **Sub (has chart):** `Chart and today’s sky stay free. Protocols turn the sky into a checkable move — using your kit when you own it.`
- **Primary / secondary:** keep destinations; rename Protocols continue CTA → **`Open today’s Protocols`** or **`Today’s Move`**

### Continue strip
- Chip: unchanged (`label · city · date`)
- CTA: **`Open Protocols`** / **`Open today’s move`** — **not** Generate
- Optional micro: `Auto-loads from today’s sky · Refresh rebuilds`

### Card — Chart (`/profile`)
- Title: **Your blueprint**
- Body: `Type, authority, centers, and gates — the map everything else uses.`
- Bullets:
  - `You + friends you save (friends never drive Today or Protocols)`
  - `Why: Today, Protocols, and Soul all read this first`
- Status: keep Saved / Not saved yet

### Card — Today (`/transits`)
- Eyebrow: **Today**
- Title: **What’s active on you**
- Body: `Energy, space, and one main action from your natal × today’s sky.`
- Bullets:
  - `Always your chart — friends stay on Chart & Soul`
  - `Why: catch pressure and openings before you plan`
- Avoid leading with “planetary gates” (gates remain secondary on the page)

### Card — Protocols (`/biohack`)
- Title: **Today’s Move** *(prefer over “Your plan”)*
- Body: `Weather from Today, a checkable day list, week theme — preferring compounds in your kit.`
- Bullets:
  - `Auto-loads; Refresh rebuilds when the sky or kit changes`
  - `From your kit badges show when inventory actually steered the move`
- Status: Needs a chart / Ready / Pro — unlock… *(keep)*

### Card — Soul (`/soul`)
- Title: **Aura between you**
- Body: `Signatures and a single Playbook for how your aura wires with someone you’ve charted.`
- Bullets:
  - `No Fit % — magnetic pairs get protocols, not a weak score`
  - `Why: chemistry lives here; daily weather lives on Today & Protocols`
- Empty-friendly: works even if user hasn’t added a friend yet (card still educates)

### Trust
- Keep: `Swiss Ephemeris · self-hosted · your data stays yours`
- Keep: informational / not medical

### Words to prefer / avoid

| Prefer | Avoid |
|---|---|
| Baseline | HD Biohack (user-facing) |
| Your kit / From your kit | Inventory (UI copy) |
| Today’s Move / Open Protocols | Generate today’s protocol |
| Energy · Space · Main action | Gates-only framing for Today |
| Aura Signature / Playbook | Fit %, Life/Work/Play tabs |
| You-only / friends on Chart & Soul | Implying friend can drive Today |

---

## 6. Must-fix vs nice

### Must-fix (P0)
1. Kill **Generate** language on home; Protocols CTA = open / today’s move.
2. Replace **inventory** with **kit** on Protocols card.
3. Rewrite Protocols card to Weather + Today’s Move + checkable + kit (not “stacks”).
4. Rewrite Today card to indication-first + You-only.
5. Add **Soul** to home outcome surface (4th card or equivalent).
6. Hero/continue copy doesn’t contradict auto-load or You-only rules.
7. No Fit %, no Life/Work/Play tabs, no friend-driven Today claims.
8. `tsc` / existing home test ids updated if copy/testid changes (`home-calculate-chart`, `home-view-protocols` stay or alias).

### Nice (P1 / with UX)
- Eyebrow → Baseline-forward
- Loop micro-line under hero
- Continue-strip micro about auto-load
- Product stills / alts for Protocols (Weather + kit strip) and Soul (signature hero) — only if UX wants; home currently has **zero** screenshots
- Elevate Open Protocols as primary when has-chart + Pro unlocked
- Metadata description one-liner mention of Soul / kit (optional)

### Out of scope
- Changing Header nav order
- Building screenshot pipeline
- Protocols ranking P1.1 (Zinc > Omega)
- Login / OAuth marketing
- Admin surface

---

## 7. Success criteria

1. Cold read of `/` by someone who used Protocols last week: they recognize **Today’s Move**, **kit**, and **Soul**, and do **not** look for Generate or inventory.
2. No-chart path still pushes Chart first; has-chart path lands in Protocols without promising a Generate click.
3. Soul card present; copy matches Aura Alchemy (signature + Playbook, no Fit %).
4. Today card never implies a friend can drive the page.
5. `@ui-ux` PASS on copy IA before `@dev` implements; Ship Gate smoke: home CTAs hit `/profile`, `/transits`, `/biohack`, `/soul`.

---

## 8. Files expected (when `@dev` runs — not this turn)

- `frontend/src/app/page.tsx` (primary)
- Possibly `layout.tsx` metadata description (nice)
- Tests / Playwright selectors if any assert old strings
- This handoff + UX critique fold-in

## 9. Handoff sequence

1. **PO** (this doc) — done  
2. **`@ui-ux`** — critique IA (3 vs 4 cards), tighten copy bank, decide primary CTA when has-chart, optional stills brief  
3. **`@dev`** — FE-only home refresh  
4. **Ship Gate** → merge + **Vercel only** (no API)

---

## 10. Source ships (do not re-litigate)

- Protocols redesign P0 — PR #24 · `protocols-redesign-p0.md`
- Kit visibility — PR #25 · `protocols-inventory-ux-critique.md`
- Today You-only — `today-you-profile-only.md`
- Soul Aura Alchemy + playbook copy — `soul-aura-alchemy-spec.md`, `soul-playbook-card-copy-2x.md`
- App rename Baseline — README + Header + metadata
