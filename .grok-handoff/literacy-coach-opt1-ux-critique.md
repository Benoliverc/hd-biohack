# UX critique — Literacy coach Opt 1 (PR #33)

**Date:** 2026-10-24 (Asia/Hong_Kong)  
**Spec:** `.grok-handoff/chart-soul-literacy-coach.md`  
**Ship Gate:** PASS FE-only (`ship-gate-literacy-coach-opt1.md`) — this is **post-ship polish**, not a gate reopen  
**Live:** `http://127.0.0.1:3000/` Dev Pro (Vercel → login). Chart Me MG 2/4; Soul You+Friend Harmonic Sanctuary  
**Code notes:** `/workspace/hd-biohack-ui-failures/ux-review-2026-10-24/literacy-coach/code-notes.md`  
**Shots:** same folder  
**Constraints:** FE-only · no `bodygraphGeometry` · no gate/channel clicks · Grounded Vitality · no Fit% **score** language

## Verdict

Opt 1 **works** (auto-expand, Got it → pill, Chart jumps + Deep dive Core OK). First-visit **density fails the product goal**: coach steals the hero it teaches. Soul jumps miss sticky-header offset. Soul still leads with **negative Fit %** in a step title.

**PASS to @dev** for a small FE polish PR — not a redesign.

---

## P0 — must-fix

### P0.1 First-visit coach must not bury Bodygraph / Aura Signature
**Live:** Desktop Chart coach ~643px; Bodygraph starts ~y=1078 (sliver only). Soul coach ~606px; Signature peeks as “Harmonic Sanctuary”. Mobile 390: Chart coach ~1306px / map at y≈1817; Soul hero y≈1800 — first screen is step 1 only.  
**Why:** Story is “learn while looking at your data.” Expanded wall = learn *instead of* data.  
**Fix (pick one, prefer A+B):**
- **A (default):** First visit opens **step 1 only** (accordion: one step expanded; Next / prev). Full list still available. Cap height ~40–50vh with inner scroll as fallback.
- **B:** Move Soul coach to **immediately under** Aura Signature (still before spectrums/cards) so Signature is the hero; Chart keep above map but with A.
- **C (alt):** Auto-expand only a **compact 2-line teaser** + “Show steps”; full expand on tap (still first-visit nudge).

Do **not** keep “all 6/5 steps fully open” as first-visit default on mobile.

### P0.2 Soul jump scroll-margin (sticky header covers Signature)
**Live:** Jump · Signature puts `#soul-hero` at y=0; sticky header covers 114px desktop / 153px @390 — eyebrow + “Harmonic Sanctuary” hidden. Spectrums tops clipped ~42px. Chart already uses `--chart-scroll-mt`.  
**Fix:** Reuse Chart pattern for Soul targets (`#soul-hero`, `#soul-spectrums`, `#soul-card-*`, `#soul-conditioning`): `scroll-margin-top` ≥ header height (and wrapped-nav mobile). Prefer shared `scrollSectionIntoView` that waits for `--app-header-h`.

### P0.3 Drop “Spectrums ≠ Fit %” title
**Live/code:** Only remaining Fit% string in literacy; conflicts with Benjamin Batch A (no negative Fit% framing). Body copy already teaches charge/continuity/pacing without scores.  
**Fix title:** `Spectrums show relative charge` or `Charge · continuity · pacing`  
**Body (keep spirit):** Three bars = relative charge, continuity, pacing — high charge can mean high voltage that needs protocols, not bad chemistry. **Never** Fit %, ≠ Fit %, score.

---

## P1 — should fix same PR if cheap

### P1.1 Jump label honesty (Chart)
- Steps 1–3 all → `#bodygraph`; step 3 label **Legend** but no `#legend`.  
  **Fix:** Add `id="bodygraph-legend"` (or scroll to legend strip) **or** relabel Jump → Bodygraph for step 3.
- Steps 4–5 → `#snapshot`; “Centers to watch” doesn’t land on that card.  
  **Fix:** `id="snapshot-centers"` on Centers-to-watch card; wire step 5.

### P1.2 “Keep open” is confusing
While expanded, Keep open is a no-op (doesn’t write storage). Got it dismisses.  
**Fix:** Remove **Keep open** **or** rename to **Dismiss later** and hide while expanded; only show if we add a session “stay expanded after navigation” behavior. Prefer **remove** for calm UI — Got it + pill is enough.

### P1.3 Tap targets
Jump chips ~23px tall; Got it ~28px — under 44px.  
**Fix:** `min-h-10` (40px) on Jump / Got it / Keep open / reopen pill.

### P1.4 Soul coach order vs page order
Coach step order: Signature → Spectrums → Spark & Glue → Power Dynamics → Wire.  
Live page after signature: Spectrums → lead blurb → Somatic Playbook → Power Dynamics → How You Wire → **Spark & Glue last**.  
**Fix (copy/jump only):** Reorder Soul steps to match DOM (Signature → Spectrums → Wire → Power → Spark & Glue) **or** reorder cards (bigger product call — prefer step reorder for Opt 1). Update jumps accordingly. Step 5 currently jumps circuit_bridge and mentions somatic — either add jump to `#soul-card-somatic_playbook` as secondary or split.

### P1.5 Collapsed pill discoverability
Left, ~30px, non-sticky; scrolls away under Chart sticky nav. Fine after Got it if first visit was useful; easy to lose on long Chart.  
**Fix:** Optional quiet **How to read** in `ChartSectionNav` / Soul Playbook row (spec already allowed). Don’t sticky the full coach.

---

## P2 — nice

- Hydration `h-10` → layout jump on first expand: reserve min-height or skeleton matching teaser height.
- Meta line 11px very faint — bump to readable secondary (`text-xs` / `text-fg-muted`).
- Step numbers pale-green — OK if contrast AA on cream; spot-check.
- Chart Deep dive jump can’t pin section to top when short page end — acceptable; no fix required.
- Document: reopen does **not** clear dismiss key (intentional).

---

## Out of scope

Opt 2 progressive Bodygraph walk · bodygraphGeometry · gate/channel inspectors · API · Fit% score metrics · rewriting Soul card essays.

---

## Copy bank (literacy polish)

| Where | Use |
|-------|-----|
| Soul step 2 title | `Charge · continuity · pacing` |
| Soul step 2 body | `Three bars show relative charge, continuity, and pacing for this pair. High charge can mean high voltage that needs protocols — not bad chemistry.` |
| Avoid | Fit %, ≠ Fit %, score, dating grade *(step 1 already says not a score — keep once, drop Fit%)* |
| Chart step 3 jump | `Bodygraph` **or** target `#bodygraph-legend` |
| Chart step 5 jump | `Centers to watch` → `#snapshot-centers` |

---

## Success criteria (polish PASS)

1. First visit: Bodygraph **or** Aura Signature visible in first viewport (desktop + 390) without dismissing coach.
2. Soul Jump · Signature shows full title + signature name below sticky header.
3. Zero Fit% / ≠ Fit % strings in literacy UI.
4. Jump labels match landing targets; Centers to watch lands on that card.
5. Primary controls ≥40px tall; no Keep-open no-op (removed or real).
6. Still FE-only; geometry untouched; no gate/channel click-through.

## Ship notes for @dev

- Touch: `LiteracyCoach.tsx`, `hdCopy.ts` steps, `soul/page.tsx` mount order + scroll helper, `globals.css` Soul scroll-margin, optional Snapshot/legend ids in profile/BodyGraph.
- Smoke: clear both literacy keys → first visit → confirm hero visible; Got it → pill; Soul jumps Signature/Spectrums; Chart jump Centers + Legend; grep UI for Fit%.
- Shots: first-visit Chart/Soul @390 + desktop after polish; Soul signature jump under header.

## Handoff

Ship Gate Opt 1 **PASS** stands. This critique = **polish Batch** for @dev after Benjamin green-light.
