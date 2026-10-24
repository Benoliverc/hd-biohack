# Today — daily novelty UX (every day ≥1 new signal)

**Date:** 2026-10-24 (Asia/Hong_Kong)  
**Constraint (Benjamin):** Opening Today must surface **at least something new every calendar day**. “Be patient with sticky chips” is rejected. Still **HD × transits only** — no self-report.  
**Prior:** `.grok-handoff/today-indication-variance-2026-10-24.md` (A/B/C engine options).  
**No PR** — UX diagnosis + refined proposals + recommended spec sketch.

---

## 1. UX diagnosis (user POV, morning open)

### What the user actually sees (attention order)

Route `/transits` fold order today:

1. **Today’s indication** (hero card) — Energy chips → Space chips → Main action / why / micro / drivers  
2. **What to do today** — labeled *“Sky cues (secondary to today’s indication)”*  
3. **Weekly macro theme** — Sun · Earth gate.line  
4. Bridged channels / newly defined centers  
5. Planetary gates table (Sun → Pluto incl. Moon)

The **first two visual beats are the chip rows**. Selected chips use ring + soft fill. That is what “Today’s indication” *feels like*. Everything that already moves with the sky is **below the fold or explicitly demoted to secondary**.

### What already moves (inventory)

| Signal | Cadence (empiric, noon≈HKT) | Surfaces in indication hero? |
|--------|----------------------------|------------------------------|
| Sun gate.line | ~daily line flip; gate ~5–6d | **Only if** `energy_level == 3` (Steady) via `sky_bullet_one` → main action |
| Moon gate.line | ~daily (often intra-day) | **No** — only planetary table |
| Mercury/Venus/Mars | every few days | Table only |
| Hanging-gate *pressure* (transit hits natal missing end, no full bridge) | ~half of days flip | **Not computed / not shown** |
| Bridged channels / newly defined centers | multi-day | Overlay cards; chips when rules fire |
| Energy + Space chips | multi-day / Type-locked | **Hero — primary attention** |
| Main action (Charged / Hyper / Low / Drained) | **Type template — can freeze for weeks** | Hero |
| Main action micro | Sticky with Space | Hero |
| Drivers | Sticky with chip rules | Hero |

### Smoking-gun sim (sample MG 2/4, HK birth, 45 days from 2026-10-01 noon UTC≈HKT)

| Metric | Result |
|--------|--------|
| Chip-pair flips | **0** (Hyper + Focus entire window) |
| Max identical chip streak | **44 days** |
| Unique `main_action_text` | **1** (TYPE_SURPLUS forever) |
| Pairs where chips same **and** main same | **44 / 44** |
| Sun gate.line day-flips | **44 / 44** |
| Moon gate.line day-flips | **44 / 44** |
| Hanging-pressure set flips | **25 / 44** |
| Same Sun+Moon across consecutive noon snapshots | **0** |

So for a user stuck in a motor-borrow / Hyper band, **the entire indication hero can be bit-identical for a month+** while the sky is new every morning. That matches Benjamin’s complaint better than “Steady chips for a few days.”

### Hierarchy / attention problem (root UX bug)

1. **Chips are coarse conditioning weather** (Type + newly_defined + bridges) — correctly slow — but they **own the brand of “indication.”**  
2. **Sky novelty is orphaned:** Sun is secondary copy; Moon is a table row; hanging pressure is invisible.  
3. **Main action abandons the sky on non-Steady days** (`compute_main_action`: sky only when `energy_level == 3`). Charged/Hyper/Low → static Type strings → **zero daily novelty in the hero even when Steady’s Sun line would have moved.**  
4. Education line (“secondary to indication”) **trains the user to ignore** the part that changes.  
5. “Weekly macro theme” naming undersells **daily line** motion (Sun line ≈ daily).

**Verdict:** Stickiness is not mainly a cache bug or user impatience. It is a **product hierarchy bug**: we put the slowest signal first and gate the fastest signal behind Steady-only main action. Patience on chips is HD-honest; **asking the user to wait for the whole page to feel new is not.**

---

## 2. Guarantee of daily novelty (HK calendar day)

### Contract

For each **Asia/Hong_Kong calendar date** `D` (bucket ephemeris at a fixed local instant, e.g. **07:00 HKT** or first open that day — pick one and stick), the API must return a `daily_signal` such that:

```
perceptible_new(D) ≠ perceptible_new(D-1)
```

where “perceptible” = shown **above the chip rows** (or as the first line of Main action), not only in the planetary table.

### Waterfall (HD/transit-derived, no RNG, no self-report)

Compute today’s and yesterday’s snapshots at the same HKT clock time:

1. **Moon gate** changed → headline: “Moon into Gate {g} · line {l} — {one-line HD cue}”  
2. Else **Moon line** changed → “Moon still Gate {g}, now line {l} — …”  
3. Else **Sun line** changed → “Sun theme shifts to Gate {g} · line {l} — …”  
4. Else **Sun gate** changed → “New Sun gate {g} — weekly theme turn”  
5. Else **personal hanging pressure** set changed (transit gate ∈ natal hanging `missing`) → “Sky pressing hanging Gate {n} ({center}) — notice without forcing a bridge”  
6. Else **bridged_channels / newly_defined** set changed → “Conditioning update: {bridge or center}”  
7. Else (rare: identical noon-to-noon personal sky — should be ~0 for Moon) → **Continuity frame, still new copy:** “Day {n} of Sun Gate {g} · Moon {g}.{l} — hold the same theme; watch {open-center} amplification”

Empiric: steps 1–2 alone cover essentially every day; Sun line is a near-daily backup; hanging pressure adds personal color ~half the days.

### What stays sticky on purpose

- Energy / Space chips = **conditioning baseline** (multi-day weather)  
- Type Strategy battery lines in why/micro when energy ≠ Steady  
- Bridged / newly defined cards (until overlay flips)

Label them so stickiness reads as **“still true,”** not “broken refresh.”

---

## 3. Three refined solutions (UX-first)

### Option 1 — Sky-first hierarchy + always-sky Main (no new engine)

**User-visible daily change:** Hero opens with **Today’s sky** (Sun · Moon gate.line + one cue). Main action **always** appends/includes sky cue (remove `energy == 3` gate). Chips move under a labeled shelf: “Still conditioning (updates every few days).” Secondary “What to do today” merges or drops duplicate Sun bullet.

**How it uses sky:** Existing `transit.sun_earth` + Moon row from `activations`; FE (and small rules.py tweak) only.

**What stays sticky:** Energy / Space chips + Type surplus/recover framing (but no longer the only hero line).

**FE / API:** Mostly FE (`TodayIndication.tsx`, `transits/page.tsx`); tiny API/rules change so Charged/Hyper/Low also get a sky clause. Optional: expose Moon on indication payload.

**Effort:** **S**  
**Risk:** Low authenticity risk; user might still glance at chips first if visual weight isn’t truly demoted. Doesn’t ship an explicit vs-yesterday delta unless added in FE from two fetches (awkward).

**Meets “something new every day”?** **Yes**, if Moon or Sun line is in the hero every day (empiric near-certain). Weakest on documenting the guarantee.

---

### Option 2 — Daily Novelty Contract (`daily_signal` + vs-yesterday) ★ recommend

**User-visible daily change:** First fold inside indication:

- **Today’s new signal** (waterfall headline — guaranteed ≠ yesterday)  
- **vs yesterday** chips/pills (“Moon 17.1 → 51.4”, “Sun line 4 → 5”, “hanging 44 pressed”)  
- Then Main action (sky-aware on all energy bands)  
- Then **Conditioning** shelf: Energy + Space (sticky OK) + short caption

**How it uses sky:** Server buckets HKT day; compares `D` vs `D-1`; runs waterfall in §2; can include hanging pressure (new small helper on overlay).

**What stays sticky:** Energy / Space as conditioning; Strategy battery why.

**FE / API:** API extends `TodayIndication` with `daily_signal`, `vs_yesterday[]`, maybe `conditioning_caption`; FE reorders card. Ephemeris already live — add HKT day bucket + yesterday recompute (cheap).

**Effort:** **M**  
**Risk:** Copy must stay plain-language (no basalt/chalk). Must not imply medical/biometric. Need one fixed HKT snapshot time so “today” is stable across refreshes.

**Meets “something new every day”?** **Yes — by contract**, including rare quiet-conditioning days via continuity frame.

---

### Option 3 — Novelty Contract + soft chip weather (chips also move)

**User-visible daily change:** Everything in Option 2, plus Energy/Space can nudge when Moon/personal planets hit hangings/open centers (soft score / tie-break on mild overlays). Hard motor Hyper/Drained rules stay.

**How it uses sky:** Option 2 waterfall + scored inputs into `_energy_band` / `_preferred_space`.

**What stays sticky:** Extreme motor patterns; Type floors; educational “conditioning” framing when chips hold.

**FE / API:** API heavier (`derive.py` + tests); FE same as Option 2.

**Effort:** **L**  
**Risk:** Chips feel “random” if scoring is opaque; more QA; can dilute classic bridge-based conditioning story.

**Meets “something new every day”?** Yes (contract), and chips move more — but **novelty guarantee should not depend on chip flips.**

---

## 4. Spec sketch — recommended path (Option 2)

### Copy hierarchy (top → bottom inside `TodayIndication`)

1. **Eyebrow:** Today’s indication · `{You label}` · as of `{HKT time}`  
2. **Daily signal (NEW, required):**  
   - Title: e.g. `Moon into Gate 51 · line 4`  
   - One plain sentence cue (deterministic template from planet + gate; optional line flavor later)  
3. **Vs yesterday (NEW):** horizontal pills or one line — only fields that changed (Moon, Sun line, hanging pressure, bridges). If only continuity frame: `Same conditioning · day 3 of Sun Gate 50`.  
4. **Main action:** Title always sky-aware **or** Type band + sky clause (`Notice Sun {g}.{l} / Moon {g}.{l} while you …`). Why = Strategy/battery. Micro = space micro-move.  
5. **Conditioning shelf:**  
   - Label: `Still conditioning`  
   - Energy chips + Space chips (unchanged banding for v1)  
   - Caption: `These update when bridges or temporary centers shift — often every few days.`  
6. Disclaimer (unchanged intent).

### Payload sketch (additive)

```ts
daily_signal: {
  key: string;              // stable id for day, e.g. "moon:51.4"
  headline: string;         // "Moon into Gate 51 · line 4"
  body: string;             // one cue sentence
  source: "moon_gate" | "moon_line" | "sun_line" | "sun_gate"
        | "hanging_pressure" | "conditioning" | "continuity";
}
vs_yesterday: Array<{
  field: "moon" | "sun" | "hanging_pressure" | "bridge" | "newly_defined" | "energy" | "space";
  from: string;
  to: string;
}>
conditioning_caption: string
// existing energy_*, preferred_*, main_action_*, drivers, …
```

### Rotation / priority

- Prefer **personal** novelty (hanging pressure, personal bridge) in `body` when present, even if `headline` is Moon/Sun for the guarantee key.  
- Do **not** rotate RNG phrases; templates keyed by `source` + gate.  
- Drop duplicate Sun bullet from “What to do today” or retitle that block to Protocols CTA only.  
- Rename “Weekly macro theme” → **Sun / Earth theme** (line is daily).

### Acceptance checks

1. For a fixed natal, 30 consecutive HKT days: `daily_signal.key` consecutive inequality = **30/30** (or 29/30 only if continuity keys include day index).  
2. On Hyper/Charged streak: hero still shows new Moon/Sun line each day (regression vs current unique-main=1).  
3. Chips may stay identical; caption visible; no self-report controls.  
4. Free tier + no-natal: sky-only `daily_signal` still flips; save CTA unchanged.

### Out of scope

- Self-report energy  
- Friend charts on Today  
- Fake chip animation / random band flips  
- LLM copy

---

## 5. Ranking

1. **Option 2 (recommend)** — meets Benjamin’s “every day something new” with an explicit contract; keeps chips honest; fixes Charged/Hyper sky-blind main action; M effort.  
2. **Option 1** — ship-fast partial if API slot is tight; still must demote chips + always-sky main or the bug remains.  
3. **Option 3** — only if after Option 2 he still demands chip motion.

Combinations: 1 is a subset of 2’s FE; 2+3 later.

---

## Next (after PO confirm)

1. Benjamin confirms Option 2 (or 1 / 3).  
2. Brief Full Stack: HKT bucket, `daily_signal` waterfall, rules.py sky on all energy bands, `TodayIndication` reorder, rename Sun/Earth block.  
3. Ship Gate FE+API → merge → Vercel + Railway.
