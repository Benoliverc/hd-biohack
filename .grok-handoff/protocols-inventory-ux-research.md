# Protocols inventory UX — deep product research

**App:** Baseline (hd-biohack)  
**Route:** `/biohack` (Protocols) · live https://hd-biohack.vercel.app/biohack  
**Date:** 2026-10-23 (Asia/Hong_Kong)  
**Trigger:** Benjamin — inventory feature unclear: how it works, whether Protocols follows inventory extras, what value it adds; wants research to make it better.  
**Scope:** Read-only code + product diagnosis + adjacent patterns + ranked recs. No code changes in this pass.  
**Related:** P0 redesign shipped in [#24](https://github.com/Benoliverc/hd-biohack/pull/24) (`feat/protocols-redesign-p0`).

---

## 1. Current behavior (code reality)

### 1.1 Where inventory lives

| Layer | Reality |
|-------|---------|
| **Storage** | Postgres table `user_supplement_inventory` (`SupplementInventory` in `backend/app/models.py`) |
| **Not** | React `store.tsx` / localStorage for the list itself |
| **localStorage** | Only **Today’s Move completion checks** (`hd-biohack:protocol-done:v1:{user}:{chart}:{HKT-day}`) |
| **Schema** | `id`, `user_id`, `name`, `notes` (unused in FE), `active` (soft-delete) — **no** dose, qty, timing, category, brand |
| **API** | `GET /inventory/{user_id}`, `POST /inventory`, `DELETE /inventory/{item_id}?user_id=` |
| **Into plan** | `POST /biohack/protocol` loads active names → `build_protocol(..., inventory_names, indication=...)` |

Dedupe is case-insensitive among active rows; soft-deleted names re-activate on re-add.

### 1.2 Defaults / starters (FE only)

`STARTER_SUPPLEMENTS` in `frontend/src/app/biohack/page.tsx`:

- Magnesium Glycinate, Omega-3, Vitamin D3, Creatine, Ashwagandha  

These are empty-state chips, not DB seeds. Backend `CENTER_STACKS` uses names like `Omega-3 / Krill`, `Zinc (pulse)`, `Magnesium Glycinate` — fuzzy match via substring (`_inv_hit`: `o in name or name in o`).

### 1.3 How redesign P0 uses inventory

**Principle (from P0 brief):** *Inventory is a filter, not the story.*

**Timed supports** (`_pick_timed_supports` in `rules.py`):

1. Energy band / preferred space often win with **behaviors** (`track_inventory=False`) — e.g. Low → “Quiet start…”, Hyper midday → single-task, open SP evening → “No big decisions…”.
2. When a **compound** is chosen, `_slot_from_stack` **prefers an owned hit** from the focus-center stack; else first stack item.
3. Unowned compounds get display suffix **`(consider adding)`** and `in_inventory: false`.
4. Owned compounds keep bare name + `in_inventory: true`; note may append *“You already own something like this — prioritize it.”* (from natal tagging path; also appears when stack notes flow through `_slot_from_stack` → stack note already tagged in some paths).

**Always-on demotion:** Daylight walk + caffeine cutoff + Magnesium Glycinate live in `daily_plan.baseline_kit`, **not** the hero Morning/Midday/Evening leads (P0 goal). Mag in kit still tracks inventory (`(consider adding)` when unowned).

**Natal baseline:** `emphasize` / `increase` / `decrease_or_pause` sorted owned-first and tagged `in_inventory`; FE shows a tiny **“in inventory”** badge — but only inside the **collapsed** Natal section.

**Not “owned-only filter”:** Empty inventory still yields a full plan (behaviors + “(consider adding)” compounds). Incomplete kit → mix of behaviors + whatever owned compounds match stacks.

### 1.4 UI surface today

IA after #24: **Weather → Today’s Move → Week → Natal (collapsed) → Inventory (collapsed)**.

| Touchpoint | Behavior |
|------------|----------|
| **Edit inventory** | Muted underline next to Refresh — scrolls to panel and opens it |
| **Inventory panel** | Collapsed by default; **auto-closes whenever `protocol` is set** (`useEffect` → `setInventoryOpen(false)`) |
| **Copy inside panel** | “Owned items are prioritized in today’s timed supports.” |
| **Add / remove** | Rebuilds protocol (`loadProtocol({ rebuild: true })`) — good loop, **invisible** above the fold |
| **Empty** | Starter chips only when panel is **open** |
| **Today’s Move rows** | `checkItems` maps `row.item` / `when` / `why` — **drops `in_inventory`** → **no “from your kit” badge on hero** |
| **Baseline kit** | Collapsed footnote; shows Mag name with/without “(consider adding)” but no owned chip |
| **Paywall** | Gate copy mentions “Inventory-aware protocols” |

### 1.5 Measured smoke (local engine, 2026-10-23)

Fixture: MG Sacral, Struggle 28-38 / Steady (matches ship note energy Steady, not Low).

| Inventory | Morning lead | `in_inventory` |
|-----------|--------------|----------------|
| `["Zinc"]` | **Zinc (pulse)** | true |
| `["Zinc", "Magnesium Glycinate"]` | Zinc (pulse) | true |
| `["Zinc", "Omega-3", "Magnesium Glycinate"]` | **Omega-3 / Krill** (not Zinc) | true |
| `[]` | Protein + short alone walk (behavior) | false |
| Logic + Low energy | Quiet start (behavior) — inventory unused for AM | — |

**Bug / dead-end nuance:** Spleen weather prefers Zinc/D **only if** the first `_slot_from_stack(morning_stack)` pick is **not** already owned. Owning Omega-3 (common starter) **steals** the AM slot from Zinc even when Zinc is the sky-specific pulse. Ship smoke “AM Zinc (owned)” holds for Zinc±Mag, **not** for the full typical kit that includes Omega-3.

### 1.6 What is working vs dead

| Working | Invisible / weak |
|---------|------------------|
| API persistence + protocol rebuild on add/remove | Hero never shows ownership |
| Owned preference in compound slots | Auto-collapse of inventory after load |
| `(consider adding)` on unowned compounds | Only readable in collapsed kit / natal |
| Natal “in inventory” badge | User must open Natal to see it |
| Fuzzy name match | Notes field unused; no qty/timing |

---

## 2. Product diagnosis (plain answers)

### 2.1 Is Protocols “following” inventory extras today?

**Yes, partially — in the engine; almost no in the UI.**

- For **compound** timed supports, owned items are preferred from focus stacks.
- For many **weather** days, energy/space force **behaviors**, so inventory never appears in the three leads (only in collapsed baseline kit / natal).
- Owning “extras” can change AM/PM **when** a stack compound wins — but competing owned starters (e.g. Omega-3) can override the sky-specific pick (Zinc), so “extras” don’t always feel intentional.

### 2.2 Value now vs aspirational

| Now (real) | Aspirational (user expectation) |
|------------|----------------------------------|
| Soft rank/tag so plans prefer bottles you already have | “Today’s plan is built from **my shelf**” |
| Avoid pure formulary spam of “consider adding” as the *only* story | Clear “using Zinc because you own it + Spleen weather” |
| Pro entitlement bullet | Visible kit → daily plan feedback loop |
| — | Stock, timing, scan, multi-stack (not in product) |

**Honest value today:** a quiet personalization lever. **Perceived value:** near zero unless you already know to open Inventory, add starters, Refresh, and diff the Morning line.

### 2.3 Why visibility is weak

1. **IA burial** — Inventory last; closed on every successful protocol load.  
2. **No feedback loop on the hero** — `in_inventory` never rendered on Today’s Move.  
3. **Jargon** — “inventory” / “prioritized” vs pantry/kit/shelf language users know from meal apps.  
4. **Explainability missing** — why-line is chart/energy copy; rarely “Because it’s in your kit.”  
5. **Empty state off-path** — starters hidden until user opens the collapsed panel.  
6. **Behaviors dominate** — many days look kit-agnostic even with a full shelf.  
7. **Competing owned items** — kit extras can hide the weather-specific compound without explanation.

---

## 3. Research patterns (adjacent products)

Sources sampled: SupplementStack, Stack Ritual, Onset, Neemio, Unfair, Fittra Wellness, Vitaon, Margin/Pantidy pantry planners, AISkincare shelf.

### Patterns that make owned → daily plan legible

| Pattern | Who | Why it works |
|---------|-----|--------------|
| **Pantry / Stacks / Today triad** | SupplementStack | Separates everything owned vs scheduled today; user always knows which layer they’re in |
| **“From your pantry” ranking + coverage** | Margin, Pantidy, Potlikkr | Results labeled by what you already have; empty pantry links *to* pantry, not silent fallback |
| **Explainability on the card** | Fittra, Vitaon, Unfair daily rec | “Why this?” / reason lines on the recommendation itself (trust driver in testing) |
| **Active vs paused** | Stack Ritual | Analysis/today only use what’s active — inventory isn’t a junk drawer |
| **Shelf powers the rest** | Neemio, AISkincare | Explicit product story: pantry is the input to regimens, not a settings dump |
| **Scarcity of actions** | Unfair Next Today / Fittra | One primary action + short reason; inventory is a badge, not a second page |
| **Progressive disclosure** | Onset / Stack Ritual | Scan/library deep; Today stays a short timed checklist |

### Anti-patterns Baseline is currently near

- Inventory as a **footer settings drawer** with no effect labeled on the plan.  
- Recommendations that change silently after add, with no “what changed” cue.  
- Formulary voice (“consider adding”) without a path to “already on your shelf.”

### Transferable, small-ship ideas (not full SupplementStack)

1. Chip on each timed row: **From your kit** vs **Consider adding**.  
2. One-line kit summary above Today’s Move: `Using 2 from your kit · Edit`.  
3. Empty kit banner *inside* Today’s Move, not only in the footer panel.  
4. On add: toast **“Morning → Zinc (from your kit)”** when a lead flips.  
5. Prefer **sky-specific owned** over **generic owned** when both match (fix Zinc vs Omega-3 on Spleen days).

---

## 4. Ranked recommendations (Protocols only)

Prefer small ships. Success = Benjamin (or any Pro user) can answer in &lt;10s: *“Does today use my shelf, and which bottle?”* without opening Inventory.

### P0 — make existing value obvious (1–2 days)

| # | Change | Where | Success criteria |
|---|--------|-------|------------------|
| **P0.1** | Pass `in_inventory` into `checkItems`; badge **From your kit** on Morning/Midday/Evening when true; optional muted **Not in kit** / keep `(consider adding)` only for compounds | FE `TodaysMoveCard` + `checkItems` | Struggle + Zinc-only → AM shows Zinc + “From your kit”. Empty kit → no false kit badges on behaviors |
| **P0.2** | Above-fold kit strip: `Your kit · N items · Edit` (or empty CTA: `Add what you own — timed supports prefer your shelf`). Stop forcing `inventoryOpen=false` on every protocol load (keep collapsed, but don’t yank open state mid-edit; show strip always) | FE header / under Weather | Inventory count visible without scrolling; empty users see CTA next to the plan |
| **P0.3** | After add/remove rebuild: status line `Plan updated · Morning now uses Zinc (from your kit)` when a timed lead’s `in_inventory` or item text changes | FE `addInv` / `removeInv` | Diff is spoken; not a silent Refresh |

**Smoke fixtures (P0):**

1. Inventory `["Zinc"]`, Struggle 28-38 / Steady → AM Zinc + From your kit.  
2. Inventory `[]`, same sky → AM behavior, kit strip empty CTA, Mag in baseline kit shows “(consider adding)” if opened.  
3. Add Zinc with protocol already loaded → toast/status + AM flips to Zinc with badge.  
4. Behaviors (Low Quiet start) → no “From your kit” badge on that row.

### P1 — make following feel intentional

| # | Change | Notes |
|---|--------|-------|
| **P1.1** | Sky-specific owned beats generic owned in `_slot_from_stack` / Spleen Zinc path (prefer Zinc/D when owned even if Omega-3 also owned) | Fixes extras “stealing” weather pulse |
| **P1.2** | Rename panel **Your kit** (keep API `inventory`); one-line why under strip | Copy only |
| **P1.3** | If evening lead already Magnesium-owned, hide Mag from baseline_kit or mark “Already in Evening” | Dedup |
| **P1.4** | Align starter chips with `CENTER_STACKS` names users will match (add Zinc; keep Omega-3 / Mag / D3) | Matching |
| **P1.5** | When all three leads are behaviors, one footnote: `No kit item matched today’s weather — baseline kit still applies` + link Edit | Honesty when inventory “does nothing” |

### P2 — later / don’t block P0

- Quantity / low-stock / auto-decrement (Stack Ritual).  
- Label scan (Onset / Neemio).  
- Multi-stack “Daily · Travel” (SupplementStack).  
- Server-side completions instead of localStorage.  
- Use `notes` for dose hints.  
- Deep natal inventory badges stay collapsed — don’t promote Natal for this.

---

## 5. Suggested next brief for @ui-ux / @dev

**Title:** Protocols — surface kit on Today’s Move (inventory legibility P0)

**Problem:** Engine already prefers owned supplements in timed supports, but FE drops `in_inventory`, collapses Inventory on load, and never says “from your kit.” Users can’t tell if Protocols follows their shelf.

**Do (P0 only):**

1. Badge + kit strip + post-add status (table in §4 P0.1–P0.3).  
2. No new data model; no scan; no qty.  
3. Optional tiny logic fix P1.1 only if cheap in same PR: Spleen/Zinc owned wins over Omega-3 when both owned.

**Out of scope:** Natal redesign, Today `/transits` changes, paywall copy rewrite, stock tracking.

**Verify:**

- pytest existing 62 + one new test: Struggle + `["Zinc"]` → morning `in_inventory` true and name contains Zinc; Struggle + `["Zinc","Omega-3"]` documents current vs desired if P1.1 included.  
- FE: Playwright or manual — badge visible; empty CTA; add Zinc updates AM + status.  
- tsc `--noEmit` clean.

**Copy bank (suggested):**

- Badge: `From your kit`  
- Strip empty: `Add what you own — we’ll prefer it in Morning / Midday / Evening`  
- Strip filled: `Using {n} from your kit`  
- Status: `Plan updated · {slot} now uses {item}`  

---

## 6. File map (for implementers)

| Concern | Path |
|---------|------|
| Inventory UI + Today’s Move | `frontend/src/app/biohack/page.tsx` |
| API client | `frontend/src/lib/api.ts` (`inventory` / `addInventory` / `removeInventory` / `protocol`) |
| Engine | `backend/app/biohack/rules.py` (`_inv_hit`, `_slot_from_stack`, `_pick_timed_supports`, `_build_actionable_plans`, `build_natal_baseline`) |
| Routes / model | `backend/app/api/routes.py`, `backend/app/models.py` |
| Redesign tests | `backend/tests/test_protocols_redesign.py` |
| Prior PO | `.grok-handoff/protocols-redesign-p0.md`, `protocols-ux-critique.md` |

---

*End of research handoff. No product code changed in this pass.*
