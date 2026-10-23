# BodyGraph overlap fix — how it’s built + ranked remediation

**Date:** 2026-10-23 (Asia/Hong_Kong)  
**Scope:** Chart BodyGraph SVG (`/profile` `#bodygraph`)  
**Evidence:** Benjamin screenshot (Throat 56/62, Spleen 48/57/28/50, G 1/10/2/25, Root 58/38/39; labels buried; faint ghost gates)  
**No code shipped** — diagnosis + brief only.

---

## 1. How Baseline BodyGraph is created (PO plain language)

Baseline does **not** use a third-party HD image or Jovian graphic. The chart is a **hand-drawn SVG** in the frontend:

| Piece | Where | What it does |
|---|---|---|
| Geometry + gate slots | `frontend/src/lib/bodygraphGeometry.ts` | Fixed viewBox `240×360`; 9 center shapes; 64 gate → center map; **hand-tuned `GATE_OFFSETS` (dx/dy from center)**; 36-channel lattice + Bezier paths; chalk torso silhouette |
| Renderer | `frontend/src/components/BodyGraph.tsx` | Paints layers in order; colors Personality (basalt) vs Design (terracotta); legend + channel/hanging lists below |
| Data feed | `frontend/src/app/profile/page.tsx` | Passes `definedCenters`, `channels`, `activatedGates`, `hangingGates`, `personalityGates`, `designGates` from the calculated chart JSON |

**Paint order (bottom → top)** — this is why labels lose:

1. Soft chalk torso fill  
2. Ghost channel lattice (inactive routes, faint gray)  
3. Active channels (thick basalt / terracotta / split gradient)  
4. Nine centers (sage = awareness, terracotta = motors, chalk = open) **+ center name text at geometric center**  
5. Hanging-*missing* partners as **plain ghost numbers** (no circle)  
6. **Activated gate chips** (`r=8` circles + bold gate #) — **top layer**, always win over labels  

Personality vs Design coloring is pure presentation: chip/stroke tone from `personalityGates` / `designGates`. Channel geometry always runs gate-anchor → gate-anchor (slightly inset with `t=0.72`).

Backend (`backend/app/hd/channels.py`) only supplies the **same 36-channel list** for chart math — it does **not** draw the graph.

---

## 2. Root cause of the screenshot bugs

### A. Fixed slots are too tight for `r=8` chips (primary)

`GATE_OFFSETS` comment claims chips “never collide with edges or each other.” Measured pairwise distances prove that wrong. Chips need **≥16 SVG units** center-to-center (`2×r`); many pairs are **5–11**:

| Center | Example pair | Distance | Need |
|---|---|---|---|
| Throat | 62 ↔ 56 | **7.1** | 16 |
| Throat | 62 ↔ 31 | 7.1 | 16 |
| Spleen | 48 ↔ 57 | **7.3** | 16 |
| Spleen | 32 ↔ 28 | 7.3 | 16 |
| Root | 19 ↔ 39 | **5.7** | 16 |
| Root | 58 ↔ 41 | 7.2 | 16 |
| G | 1 ↔ 10, 7 ↔ 1, … | ~10.8 | 16 |

Centers are small (`Throat s=30`, `Spleen s=28`, `G s=32`, `Root s=34`) while packing **7–11 gates** inside the border. Offsets were hand-tuned for *edges*, not for simultaneous activation of neighboring gates.

### B. Labels sit under chips at the same (cx, cy)

Center names are drawn at `g.cx, g.cy` with `opacity 0.7`, **before** chips. Gate anchors typically sit **12–14 units** from center — so a chip disk (`r=8`) easily covers “Throat”, “G”, “Root”, “Spl.”. No reserved label band; no z-order raise; no outside labels.

### C. Ghost hanging numbers add clutter

Layer 5 paints every hanging *missing* partner as faint `#` text at the same `gateAnchor`. When that slot is near an activated chip (or near the label), it reads as “instructed / noisy” undefined gates — matches the screenshot’s faint Head/Ajna/Throat numbers.

### D. No collision / stagger / density logic

Layout is **static**: same offset whether 1 or 6 gates are lit in a center. No packing, no hide-until-hover for ghosts, no chip-size scale with density.

### E. Display size amplifies it

SVG `max-w-[300px]` on a 240-wide viewBox → chips look chunky; two-digit numbers at `fontSize={9}` fill the circle with little air.

---

## 3. Ranked fixes

### P0 — must-fix for Chart readability (FE-only)

**P0.1 — Shrink activated chips + tighten type**  
- File: `BodyGraph.tsx`  
- Change `r={8}` → `r={6}` (or `5.5`); chip `fontSize` 9 → 7–8; stroke 1 → 0.75.  
- Instantly drops min separation need from 16 → 12 and reduces label coverage.  
- Keep hover/title tooltips for accessibility.

**P0.2 — Raise / relocate center labels so chips never bury them**  
Pick one (prefer A, then B):

| Option | Approach | Pros |
|---|---|---|
| **A (preferred)** | Move label **outside** each center (above Head/Ajna/Throat/G/Sacral/Root; beside Spleen/Ego/SP) via `LABEL_OFFSET` map in `bodygraphGeometry.ts`; keep short labels (`SP`, `Spl.`, `Ego`) | Always readable; classic HD apps do this |
| **B** | Paint labels in a **final** SVG group after chips, with chalk/linen halo (`paint-order: stroke fill`, stroke = center fill) | Minimal geometry change; still fights dense G/Throat |
| **C** | Reserve a clear “label disk” (`r≈7`) at center; push gate anchors outward / onto channel termini | More authentic HD feel; needs offset retune |

**P0.3 — Hide undefined / hanging-missing numbers by default**  
- File: `BodyGraph.tsx` layers 5  
- Default: **do not** paint `missingNaked` text.  
- Optional: show on chip/center hover, or a “Show open gates” toggle under the graph.  
- Removes the faint clutter Benjamin called out without losing hanging data (list below already shows hanging gates).

**P0.4 — Retune `GATE_OFFSETS` for high-traffic collision pairs**  
- File: `bodygraphGeometry.ts`  
- Minimum center-to-center for any two gates in the same center: **≥ 2×chipR + 1**.  
- Priority pairs from the screenshot + math: Throat `56/62/31`, Spleen `48/57/28/50`, G octant ring (spread radii to ~18–20), Root `58/38/39/41`.  
- Add a tiny unit test or script that fails if any same-center pair is closer than the threshold (prevents regressions).

**Acceptance (Ship Gate smoke on Benjamin / Struggle-style charts):**  
- No two activated chips overlap by >1–2px.  
- Every center name fully readable when that center is defined.  
- No faint gate numbers visible unless toggle/hover.  
- Personality/Design colors and channel list unchanged.

---

### P1 — polish / Grounded Vitality revisit

**P1.1 — Density-aware chip size**  
If a center has ≥4 activated gates, use `r=5` / font 7; else `r=6.5`. Optional.

**P1.2 — Stagger / ring layout generator**  
Replace hand offsets with per-center ring slots (N equal angles, radius = `f(s, chipR)`), with optional manual overrides only for classic HD gate “compass” positions (e.g. Throat 62 top-left). One source of truth; collision-proof by construction.

**P1.3 — Gate numbers on channel termini outside the fill**  
More “textbook HD”: numbers sit on the channel end just outside/inside the border; center interior stays for the label only. Bigger geometry change; pair with UX review.

**P1.4 — Slightly enlarge crowded centers**  
Bump `Spleen`/`Throat`/`G` `s` by +4–6 and nudge neighbors so channels still meet. Helps P0.4 without shrinking chips as hard.

**P1.5 — Interactive focus**  
Tap center → dim other centers, list that center’s gates in a side panel (Deep Dive already has Centers). Chart SVG stays calm.

**P1.6 — GV spec note**  
Update any Grounded Vitality bodygraph notes: current “r=8 inside border, no collision” claim is false; document chosen chip radius + label placement + ghost-gate policy.

---

### P2 — later / out of scope for this pain

- Dual/composite BodyGraph (Soul backlog).  
- Full 64-gate always-visible lattice (would worsen clutter unless tiny).  
- Raster/Lottie replacement.

---

## 4. Suggested ship sequence

1. **FE PR “bodygraph-legibility-p0”** — P0.1 + P0.2A + P0.3 + targeted P0.4 retune + collision unit check.  
2. UX Review on Benjamin’s chart + a dense Generator + an undefined-heavy Reflector.  
3. Ship Gate → Vercel only (no API).  
4. Optional follow-up P1.2 ring generator if manual retune still fails dense Throat.

---

## 5. Key file pointers for @dev

```
frontend/src/lib/bodygraphGeometry.ts
  CENTER_GEOM, GATE_OFFSETS, gateAnchor(), CENTER_LABELS, channelPathD()

frontend/src/components/BodyGraph.tsx
  layer order ~L216–367; chip r=8 @ L347; labels @ L292–303; ghost missing @ L309–327

frontend/src/app/profile/page.tsx
  <BodyGraph … /> ~L1405
```

---

## 6. One-line summary for PO

**BodyGraph is our own SVG with fixed gate slots that are too close for the current chip size, and center names are drawn underneath — so when several gates light up (Throat/G/Spleen/Root), numbers stack and bury the labels; hanging “ghost” numbers add extra noise.** Fix by smaller chips, labels outside (or above) chips, hide ghosts by default, and retune/enforce minimum spacing.
