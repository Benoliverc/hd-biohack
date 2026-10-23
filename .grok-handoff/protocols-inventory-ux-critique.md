# UX critique — Protocols inventory visibility

**Date:** 2026-10-23 (Asia/Hong_Kong)  
**Route:** `/biohack` (local Dev Pro + empty-kit contrast; Vercel = login wall)  
**Research:** `.grok-handoff/protocols-inventory-ux-research.md`  
**Shots:** `/workspace/hd-biohack-ui-failures/ux-review-2026-10-23/protocols-inventory/`  
**Scope:** Inventory visibility + feedback only (not full Protocols redesign)

## Verdict
Engine already prefers owned compounds; **perceived value ≈ zero**. Above the fold never says the plan uses your shelf. All three research P0s **keep** (with small tweaks). Ship FE-first; optional ranking fix is P1.

## Live findings (confirm research)
| Issue | Evidence |
|-------|----------|
| No kit badge on Today’s Move | Morning/Midday behaviors + Evening Mag bare; why says “prefer what you already own” even when owned — no **From your kit** chip |
| Inventory buried + auto-closed | Collapsed under Natal as `Your inventory (N) · Show`; `useEffect` sets `inventoryOpen=false` on every `protocol` set — including **right after Add** |
| Add feedback invisible | After Add D3: count 3→4, panel snaps shut, **no toast**; only 12px “Added …” inside reopened panel. Remove: no message |
| Empty kit contradiction | Evening = `Magnesium Glycinate (consider adding)` + why still “prefer what you already own” |
| Natal-only badge | 10px “in inventory” inside collapsed Natal Emphasize; zinc pulse line unbadged |
| Starters off-path | +Mag / Omega / D3 / Creatine / Ashwagandha only when panel open |

## Proposed P0s — validate / refine

### P0.1 From your kit badge — **KEEP**
- Pass `in_inventory` into `checkItems` / Today’s Move rows.
- Owned compound → pill **From your kit** (growth-soft, readable ≥12px / secondary ink).
- Unowned compound → keep `(consider adding)` **or** muted **Not in kit**; do **not** show kit badge on pure behaviors.
- **Tweak:** When `in_inventory`, why must not claim ownership generically without the badge; when kit empty, drop “prefer what you already own” on that row (or only show it with a real owned hit).

### P0.2 Always-visible kit strip — **KEEP**
- Above fold (under Weather or atop Today’s Move): **`Your kit · N · Edit`** (N can be **0**).
- Empty: **`Add what you own — today’s supports prefer your shelf`** + Edit opens panel.
- **Stop** forcing `setInventoryOpen(false)` on every protocol load. Allow collapsed default on first paint, but **do not yank** open state mid-add; strip always visible regardless.
- Rename user-facing “inventory” → **kit** in strip/panel title (API name can stay).

### P0.3 Post add/remove status — **KEEP (must leave the panel)**
- After rebuild: toast / sticky status  
  `Plan updated · Evening now uses Magnesium Glycinate (from your kit)`  
  or `Kit updated · Today’s Move unchanged` when leads don’t flip.
- Remove needs a message too (`Removed Zinc · plan refreshed`).
- Do not rely on inline green text inside a panel that auto-closes.

## Must-fix (block “done” without these)
1. Kit ownership visible on Today’s Move for owned timed compounds (P0.1).  
2. Kit count/CTA visible without scrolling past Natal (P0.2).  
3. Add/remove feedback survives outside the panel (P0.3).  
4. No auto-collapse of Inventory on protocol set while user just edited kit.  
5. Empty-kit copy: never “prefer what you already own” on a `(consider adding)` row.

## Nice-to-have (same PR if cheap / else P1)
- P1.1 Sky-specific owned (Zinc) beats generic owned (Omega-3) — ranking honesty.  
- Starter chips on empty strip CTA (not only inside open panel).  
- Dedup Mag if already Evening lead vs baseline_kit.  
- Footnote when all three leads are behaviors: `No kit item matched today’s weather`.

## Out of scope
Natal redesign, qty/stock/scan, Today `/transits`, paywall rewrite.

## Ship notes for @dev
- FE-only for P0.1–0.3; no schema change.  
- Smoke: Zinc-only Struggle → AM Zinc + badge; empty kit → empty strip CTA, no false kit badges on behaviors; Add Zinc with plan loaded → status + AM flip; Low Quiet-start day → behavior row has no kit badge.  
- Shots for Ship Gate: above-fold strip + badged Move row + toast after add.

## Copy bank (UX-preferred)
- Strip: `Your kit · 3 · Edit` / `Your kit · 0 · Add items`  
- Badge: `From your kit`  
- Empty CTA: `Add what you own — timed supports prefer your shelf`  
- Toast: `Plan updated · Morning now uses Zinc (from your kit)`  
- Unchanged: `Kit updated · Today’s Move unchanged for this weather`
