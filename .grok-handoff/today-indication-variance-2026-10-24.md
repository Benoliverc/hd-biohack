# Today indication day-to-day variance — analysis + 3 PO options

**Date:** 2026-10-24 (Asia/Hong_Kong)  
**Scope:** Baseline / HD Biohack Today (`/transits`) Energy + preferred space  
**Constraint (Benjamin):** Today always uses Me/You chart; Energy + Space from HD of the day × transits — **not** self-report.  
**No PR** — analysis + proposals only.

---

## What “indication” means in product

The **Today’s indication** card (`TodayIndication.tsx`) shows:

| UI | Source field | Bucket count |
|----|--------------|--------------|
| **Energy today** chips | `energy_level` 1–5 → Drained / Low / Steady / Charged / Hyper | 5 |
| **Space the chart points to** chips | `preferred_space` → people / alone / nature / focus / out | 5 |
| Main action + why + micro | `main_action_*` | free text (templated) |
| Chart notes | `drivers[]` | free text |

User complaint (“same as yesterday”) almost certainly targets the **two chip rows**. Main action can already move daily on Steady days via Sun theme while chips stay fixed.

---

## Code path (inputs → chips)

```
FE /transits  →  api.transitsToday(youChart.id)   # Me/You only
GET /transits/today?natal_chart_id=…
  calculate_transits()           # now(UTC) ephemeris → gates/lines
  overlay_transits(natal, transit)
  derive_today_indication(natal, transit, overlay)
```

| Layer | File | Role |
|-------|------|------|
| FE bind Me | `frontend/src/app/transits/page.tsx` | `resolveYouChart` — never friend |
| FE chips | `frontend/src/components/TodayIndication.tsx` | read-only display of API payload |
| API | `backend/app/api/routes.py` `transits_today` | no response cache |
| Ephemeris | `backend/app/hd/chart.py` `calculate_transits` | live `datetime.now(UTC)` (not day-bucket hash) |
| Overlay | `overlay_transits` | `newly_defined_centers`, `bridged_channels` |
| **Chip logic** | `backend/app/checkin/derive.py` | `_energy_band` + `_preferred_space` |
| Main action | `backend/app/checkin/rules.py` | `compute_main_action` / `sky_bullet_one` |

### Exact inputs used for Energy + Space chips

**Used**

- Natal: `type`, `defined_centers` (static)
- Overlay: `newly_defined_centers` (set of center names)
- Overlay: `bridged_channels` (list; centers on those channels)

**Not used for chips** (important)

- Sun / Moon / Mercury gate or line
- Individual transit gate IDs (except insofar as they already folded into overlay centers/bridges)
- Line numbers, planetary speed, timezone of user (transits are UTC-now; FE only formats “as of”)
- Self-report / check-in (removed by design)
- Hash / daily seed / cache key — **none**; recomputed every request

### Banding behavior (why sticky)

Both energy and space are **first-match rule ladders**. Extreme patterns (Sacral+Root borrow → Hyper; Root without Sacral → Drained; G newly → nature) fire rarely. Most days fall through to:

| Type | Quiet / mild overlay → |
|------|-------------------------|
| Generator / MG | Steady + **focus** (or People if a Throat/SP bridge sticks) |
| Manifestor | Steady + **alone** |
| Projector + quiet sky | **Low** + alone |
| Reflector | Steady/varies + **out** (type-locked space) |

“Mild overlay — no extreme motor pattern” still returns **Steady**. A single persistent personal bridge (e.g. Throat) can lock **People** for many consecutive days.

---

## Mechanistic why yesterday ≈ today

1. **Chips are center/bridge weather, not sky labels.** Sun line advances ~daily; Sun gate ~every 5–6 days; Moon gate ~1–2×/day — but none of that feeds `_energy_band` / `_preferred_space`.
2. **Center definition is slow.** A transit gate that completes a channel keeps `newly_defined_centers` stable for days until that gate (or its partner) leaves.
3. **Coarse 5×5 buckets + first-match.** Many distinct skies map to the same Steady / People (or Steady / Focus) cell.
4. **Type defaults dominate quiet days.** With no new motors and no extreme bridges, chips = natal Type template.
5. **Not a cache/timezone bug.** `calculate_transits()` uses live UTC; FE Me binding is correct. Stickiness is algorithmic, not stale data.
6. **Main action already varies on Steady.** `sky_bullet_one` injects “Notice the Sun theme (Gate X · line Y)…” into `main_action_text` when energy==3 — so copy can change while chips look identical.

### Empiric sim (sample MG natal, Oct 2026 UTC~HKT noon)

Not Benjamin’s chart — illustrative of the algorithm:

| Day | Sun | newly | bridges | **Energy** | **Space** |
|-----|-----|-------|---------|------------|-----------|
| 10-23 | 50.4 | [] | 1 | Steady | People |
| 10-24 | 50.5 | [] | 1 | Steady | People |
| 10-25 | 50.6 | [Heart] | 1 | **Charged** | People |

- Oct chip-pair flips: **12**; max same streak: **9 days**
- Energy month: Steady 18 / Charged 12 / Low 1  
- Space month: People **25** / Out 4 / Focus 2  

**Verdict:** Seeing identical Energy + Space two days in a row is **expected and common** under current rules. Patience is correct *for chips*; the sky/main-action line is where day grain already lives.

---

## Three proposals for PO review

### Option A — Feed personal planets into chip scoring (more chip motion)

**What changes:** Extend `derive.py` so Energy/Space also consider (a) Sun gate/line theme buckets, (b) Moon + Mercury/Venus/Mars hits on natal hanging gates / open centers, as soft scores or tie-breakers when the overlay is “mild/quiet.” Keep hard motor-borrow rules for Hyper/Drained.

**Day-to-day variance:** Chips should flip more often (Moon ~daily influence; Sun line/gate as secondary). Expect fewer 5–9 day identical streaks.

**Tradeoffs vs HD authenticity:** Still transit×natal, no self-report. Risk: over-weighting fast planets vs classic “conditioning = bridges / newly defined.” Needs careful driver copy so it doesn’t feel random.

**Scope:** API (`derive.py`, tests); FE chips unchanged.  
**Effort:** **M**  
**Recommend if:** Benjamin wants the **chips themselves** to feel more weather-like.

### Option B — Keep coarse chips; surface daily sky delta in the card (honest patience) ★ lean recommend first

**What changes:** Leave Energy/Space banding as-is (authentic multi-day conditioning weather). Promote daily-changing signal in the indication card: Sun theme as a third labeled row (or stronger Main action), plus optional “vs yesterday” delta (`Sun 50.4 → 50.5`, bridge list change). One-line education: “Energy & space update when conditioning shifts — often every few days.”

**Day-to-day variance:** Chips stay sticky (by design); **visible indication** feels fresh every day.

**Tradeoffs vs HD authenticity:** Highest fidelity to current HD model (centers/bridges change slowly). Risk: user still fixates on chips unless UI hierarchy makes sky primary next to them.

**Scope:** Mostly FE (`TodayIndication.tsx`); small API optional (`yesterday` snapshot or `sky_theme` field).  
**Effort:** **S**  
**Recommend if:** Prefer truthfulness + low risk; answer “be patient on chips, watch the sky line.”

### Option C — Scored conditioning model (richer, slower to ship)

**What changes:** Replace first-match ladders with a weighted score: personal bridges, motor intensity, open-center hits, hanging-gate pressure (even without full channel), planetary tier (Moon / personal / outer). Map score → 1–5 energy and space with hysteresis or soft thresholds so small sky moves nudge bands.

**Day-to-day variance:** Highest intentional motion within Steady↔Charged etc., still grounded in overlay.

**Tradeoffs vs HD authenticity:** Can be *more* expressive of real HD nuance if well-tuned; risk of opaque scoring, harder-to-trust drivers, more QA surface.

**Scope:** API rewrite of `derive.py` + expanded tests; FE maybe progress/meter UX later.  
**Effort:** **L**  
**Recommend if:** Willing to invest in a durable “chart weather engine.”

---

## Ranking (light)

1. **B first** — cheapest, educates, preserves HD honesty; unblocks “same chips” complaint without fake variance.  
2. **A second** — if after B Benjamin still wants chips to move.  
3. **C later** — only if A’s rule tweaks feel insufficient.

Combinations OK: B+A (UI honesty + modest chip inputs).

---

## Out of scope / non-fixes

- Reintroducing self-report energy questions (violates Benjamin pref)
- Friend charts on Today (already locked to Me)
- Blaming Railway cache / FE sticky — not the cause
- Expecting Energy/Space to change every calendar midnight by design

---

## Next (after PO pick)

1. Benjamin picks A / B / C (or B+A).  
2. Brief Full Stack with chosen option + acceptance checks (e.g. “chip-pair identical streak p50 ≤ N days on sample natal” for A/C; “Sun theme visible in indication card” for B).  
3. Ship Gate on FE-only (B) or FE+API (A/C) → merge → Vercel (± Railway if API).
