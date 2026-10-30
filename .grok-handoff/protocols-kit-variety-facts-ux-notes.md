# UX notes — Protocols kit variety + daily fact (pre-PR)

**Date:** 2026-10-30 (Asia/Hong_Kong)  
**For:** PO brief / Ship Gate ACs · `@dev` on `feat/protocols-kit-variety-facts`  
**Live baseline:** `http://127.0.0.1:3000/biohack` Dev Pro · kit = Zinc only  
**Code notes:** `/workspace/hd-biohack-ui-failures/ux-review-2026-10-30/protocols-kit-fact/code-notes.md`  
**Shots:** same folder  
**Scope:** Placement, density, trust for (1) moment-rotated kit leads from a larger bank (2) one HKT daily fact about an **owned** kit item. Not a full Protocols redesign.

---

## Live baseline (what exists today)

**IA (unlocked):** Weather (Energy · Space · What’s new · vs-yesterday) → **Kit strip** (`Your kit · N · Edit`) → **Today’s Move** (0/3 + three timed rows) → Do/Don’t → Baseline kit (collapsed) → Week → Natal → Kit panel → disclaimer.

**Move today (Zinc kit):** Morning **Zinc (pulse)** + **From your kit**; Midday behavior + **New vs yesterday**; Evening behavior (no kit). Mag only in baseline “(consider adding)” + Natal — not the timed lead. No fact callout. Disclaimer footer only.

**Density:** Kit badge OK — 12px pill on title row; does not fight checkbox/why at desktop or 390.

**Engine risk (code):** Kit leads sticky under sky rotation (behaviors rotate, kit doesn’t). Mag hardcoded in baseline + Hyper evening Mag filter + Mag-heavy stacks; B-Complex = Head morning[0]. `_slot_from_stack` = first owned hit only — **no** day-hash among owned compounds → “always B/Mag” when those are owned + focus matches.

---

## Product goals (UX read)

1. **Variety:** “From your kit” leads should feel tied to **today’s HD/sky moment** and rotate across a **larger owned-aware action bank** — not always B (or Mag) when the shelf has more options.
2. **Daily fact:** One interesting, curated, **in-repo** fact about something **already in the kit**; empty kit → soft CTA, **no fake facts**; no disease claims.

---

## Placement (must)

### Kit-led Move rows
- Keep **From your kit** on the timed row that the bank selected — same badge pattern.
- Variety must show up **in the checklist itself** (different owned compound or moment-tagged action), not only in a tip.
- Do **not** add a 4th checkbox for “today’s kit pick.”
- Preserve anti-whiplash: don’t thrash Mag↔Zinc every Refresh same HKT day; day-stable hash is correct. Rotate vs **yesterday** / when moment changes — align with existing What’s new / lead fingerprint spirit.

### Daily fact callout
**Preferred:** Soft card **between Kit strip and Today’s Move** (kit context, before checklist).  
**Alt:** Under Move progress line, **above** the three rows — still before checkboxes.  
**Avoid:**
- Inside a timed row (competes with why + badge + New vs yesterday)
- Replacing Weather What’s new (sky novelty ≠ supplement trivia)
- Sticky footer / toast that looks like a kit-status rebuild message
- Natal / Baseline kit collapsed areas (invisible)

**Empty kit:** Same slot shows one soft CTA, e.g. `Add something you own — today’s Move can prefer your shelf` + Edit/starters — **no** invented compound fact.

---

## Density (Ship Gate blockers if violated)

| Rule | AC |
|------|-----|
| Fact is **secondary** chrome | Max ~2 short lines + optional compound name chip; no essay |
| One fact / HKT day | Same fact until HKT 07:00 reset (match Protocols novelty clock) |
| Doesn’t steal Move | Progress `0/3`, checkboxes, From your kit, New vs yesterday remain primary |
| Mobile 390 | Fact + Kit strip + Move title still fit without pushing all three rows below fold *if* fact is one compact block (~72px); if taller, collapse to one line + “More” |
| No double kit story | Don’t restate “prefer what you already own” in fact if badge already on a Move row |

**Variety density:** Moment tag micro-label OK (`Sky · Head` / `Hyper evening`) **muted**, ≤1 chip — don’t stack with New vs yesterday on same row unless one is dropped.

---

## Trust / medical (Ship Gate blockers)

1. Reuse clinician disclaimer spirit — fact block may use short sibling: `Informational — not medical advice` (link/scroll to full footer OK).
2. **No** disease treat/cure/prevent; **no** diagnose; **no** “you should take X mg.”
3. Facts are about **mechanism / curiosity / pairing with sky language**, not dosing instructions. Dose stays “as on your label / clinician.”
4. Fact **only** if compound matches an owned kit item (fuzzy match same as inventory). Never show fact for Mag if Mag not owned.
5. Empty / no match → CTA, not a generic library tease that names a supplement they don’t have.
6. Tone: Grounded Vitality / Oura-calm — curious, not clinical panic or bro-science hype.

---

## Copy bank (draft for brief)

### Fact callout (owned)
- Eyebrow: `From your kit` or `Kit fact · today`
- Title/body: `{Compound} — {one interesting line ≤120 chars}`
- Foot: `Informational — not medical advice` (or omit if footer always visible without scroll on desktop — still required on mobile)

### Empty
- `Add what you own — Move can prefer your shelf`
- CTA: `Edit kit` (existing strip)

### Variety why (timed row)
- Prefer sky/moment: `Matches today’s {Energy/Space/center} weather`  
- Avoid repeating bare `You already own something like this — prioritize it.` when badge is present (keep short why).

### Avoid
- Fit %, stacks, Generate, inventory (user-facing), disease names, “cure”, megadose

---

## Variety UX expectations (for @dev / ACs)

1. Given ≥2 owned compounds that qualify for today’s moment bank → HKT day A lead ≠ day B lead when fingerprints/moments differ (or day-hash among qualified owned set).
2. Given only Zinc owned → Zinc may correctly repeat; fact still about Zinc; no fake second compound.
3. Sky rotation may still flip a **behavior** slot; kit variety is a **separate** owned-bank pick — document so Ship Gate doesn’t confuse What’s new badge with kit swap.
4. Starter chips: Mag first is OK for empty shelf, but once kit has 3+ items, leads must not devolve to Mag/B defaults solely because they’re stack[0].

---

## Ship Gate AC sketch (fold into PO brief)

| # | AC |
|---|-----|
| 1 | Fact callout appears only when kit non-empty and fact maps to an owned name |
| 2 | Empty kit → soft CTA in fact slot; zero compound claims |
| 3 | Fact sits between Kit strip and Move (or explicitly documented alt); not inside timed rows |
| 4 | Fact ≤2 lines + optional chip; mobile doesn’t hide all Move rows above fold when fact open |
| 5 | No disease / dose-prescribe language in fact library strings (grep gate) |
| 6 | Disclaimer visible (footer and/or fact foot) |
| 7 | Kit-led Move uses bank+moment; with multi-item kit, lead isn’t stuck on B/Mag for 3 consecutive distinct HKT moments (manual or fixture) |
| 8 | From your kit badge still on owned timed leads; behaviors never badged |
| 9 | Anti-whiplash: same HKT day Refresh doesn’t thrash owned lead |
| 10 | No Main-action duplicate on Protocols; fact ≠ checklist item |

---

## Out of scope

Literacy coach, Chart/Soul, paywall copy, Zinc>Omega API ranking as a separate P1 (may overlap bank design — coordinate with @dev but don’t block fact ship on ranking honesty alone).

## Follow-up

When PR URL lands on `feat/protocols-kit-variety-facts`: live pass for density/trust/placement — **block ship** only if fact competes with Move, fakes empty-kit facts, or medical tone fails.
