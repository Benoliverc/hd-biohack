# P0 — Soul tab: Bio-Sync Index (You ↔ Friend)

**Status:** Ready for `@dev` (spec only — not built)  
**Route:** `/soul` (primary nav **Soul**)  
**App:** Baseline (hd-biohack)  
**Date:** 2026-10-22 (HKT)  
**PO:** Benjamin Lammens  

Related: Today HD indication (`current_spec.md`) and Admin usage (`admin-usage-spec.md`) stay separate. Do **not** block Soul on those. Railway Hobby builds remain paused — see Ship notes.

---

## Goal (plain language)

As a Baseline user, I want a **Soul** tab where I pick **me** and a **saved friend**, and see a calm **Bio-Sync / Context Fit** readout (0–100%) — like a readiness score, **not** a dating match %.

It should show:

1. How we **spark** (Voltage), how easily we **move together** (Flow), and how hard the connection is on the nervous system (Somatic Ease).
2. A **context lens** (Work / Life / Play) that reweights those three into one Fit %.
3. Who is **broadcasting into whom** on the nine centers, plus a **Split-Bridge** callout when a friend completes one of my hanging gates.
4. A clear split between **Natural Fit** (raw chart collision) and a thin **Regulated Fit** preview when I flip 2–3 co-regulation toggles.

Tone: Grounded Vitality / Oura-style — biometric resonance, not romance UI.

---

## What already exists (grounding for implementers)

| Area | Today |
|---|---|
| Primary nav | `Header.tsx` tabs: Home `/`, Chart `/profile`, Today `/transits`, Protocols `/biohack`. **No Soul.** `AppShell` is layout only. |
| People | `natal_charts.slot_kind` = `self` \| `friend`; label; up to **10** people on Chart page. `GET /charts/{user_id}` returns full `chart` JSON per row. |
| Chart payload | `activated_gates`, `channels`, `defined_centers`, `undefined_centers`, `hanging_gates` (`held` / `missing` / `channel`), `type`, `authority`, `definition`, `profile` (`"X/Y"`). |
| Channel catalog | `backend/app/hd/channels.py` — 36 channels, `GATE_TO_CENTER`, `MOTORS`, `active_channels`, `defined_centers`, `hanging_gates`. |
| Type / Authority / Definition / Profile | `hd/type_authority.py` (incl. connected components for Split). |
| Composite today | **Natal × transit only** via `overlay_transits` in `hd/chart.py` (bridged channels, newly defined centers). **No person↔person composite engine.** |
| BodyGraph | Single-chart SVG (`BodyGraph.tsx`). No dual overlay. |
| Variables / PHS | **Missing** (already P2 icebox). Do not invent Environment Color for Soul P0. |
| Friend picker UI | Lives on `/profile` only. Soul must **reuse saved charts**, not re-implement birth form. |

**Implication:** Almost all Bio-Sync drivers are computable from two stored `chart_json` blobs + the existing 36-channel table. P0 needs a **new dual-chart scorer** (pure function) + API + `/soul` page. No ephemeris change required.

---

## P0 scope (must ship)

### In

1. **Nav + route:** Primary tab **Soul** → `/soul` (lucide icon e.g. `Sparkles` or `HeartPulse` — calm, not hearts/dating). Place after **Chart**, before **Today**.
2. **You ↔ Friend picker:** Two selects fed by `GET /charts/{userId}`. Default You = latest/`self` slot (or store-bound natal). Friend = any other saved row (prefer `slot_kind=friend`, but allow any second chart). Link CTA to Chart if &lt;2 people.
3. **Context lens switcher (3):**  
   | id | Primary label | Alias chips (same lens) |
   |---|---|---|
   | `work` | Work & Co-Creation | Co-Founder / Work |
   | `life` | Life & Intimacy | Partner / Sleep |
   | `play` | Play & Performance | Friend / Teammate |
4. **Natural Fit %** (0–100) from weighted vectors for active lens.
5. **Three sub-bars:** Voltage · Flow · Somatic Ease (each 0–100) with short plain-language gloss.
6. **Composite Archetype badge** from composite center count (see formulas).
7. **Split-Bridge Magnet callout** when friend holds ≥1 of your `hanging_gates[].missing` (list gate + channel name). Also count these as Voltage “Split-Bridge locks.”
8. **Directional Conditioning Strip:** 9 centers in a compact row/list — for each center, states Defined/Open for You and Friend; arrow You→Friend / Friend→You / both defined / both open; one-line somatic hint for open←defined “Amplifier” cases (copy templates OK; no dual BodyGraph).
9. **Thin Regulated Fit (included):** Show **Natural Fit** and **Regulated Fit** side by side. Offer **up to 3** conditional toggles (only those that apply to this pair). Toggling bumps Ease (and thus Fit) via fixed restores — proves the product idea without a protocol engine.
10. **Empty / error / loading:** No charts; only one person; charts belong to another user; API failure; loading skeleton. Free tier: **Soul is free** (like Today indication) — driving friend chart saves is the funnel. Disclaimer: informational chart mechanics, not medical/relationship advice.

### Out of P0 (→ P1/P2)

- Full co-regulation protocol library, persistence of toggles, “Activate Protocol” → Protocols tab deep-link generation.
- Dual-colored composite BodyGraph.
- Circle rank / compare all friends / share card.
- Variables, sleep-architecture scoring beyond Life lens weights.
- Multi-person (3+) composites.
- LLM narrative rewrite.

### Why this cut

Vectors + lens + strip + bridge + archetype are the **readable core** and map 1:1 onto existing gates/channels/centers/authority/type/profile. Full Regulated Fit gamification would double FE surface area and invent protocol content we don’t store yet — so P0 ships a **thin** regulated preview (2–3 hardcoded, relevance-gated toggles) to honor Natural vs Regulated without blocking the tab.

---

## Exact scoring formulas

All inputs from chart A (self) and chart B (friend). Cap every vector to **[0, 100]** after sum. Fit is a weighted average of the three vectors, then rounded to nearest int, clamped 0–100.

### Channel roles (per of the 36 channels)

For gates `(g1, g2)` let `nA` / `nB` = how many of `{g1,g2}` each person holds (0–2).

| Role | Rule |
|---|---|
| **Electromagnetic** | `nA==1` and `nB==1` and they hold **opposite** gates of the channel |
| **Companionship** | `nA==2` and `nB==2` |
| **Dominance** | (`nA==2` and `nB==0`) or (`nB==2` and `nA==0`) |
| **Compromise** | (`nA==2` and `nB==1`) or (`nB==2` and `nA==1`) |

Ignore channels where both have 0, or one has 0 and the other 1 (hanging only — not scored as EM).

### Composite field

- `composite_gates = activated_gates_A ∪ activated_gates_B`
- `composite_channels = active_channels(composite_gates)`
- `composite_defined = defined_centers(composite_channels)`
- **Newly defined motors:** motors in `composite_defined` that are **not** in `defined_centers_A` and **not** in `defined_centers_B` (center appears only when both auras combine). Motors = `{Root, Sacral, Solar_Plexus, Heart}` (Heart = Ego).

### Split-Bridge locks (Voltage)

Use self `hanging_gates`: each entry where `missing ∈ activated_gates_B` counts as **one Split-Bridge lock** (gate = `missing`, channel name from hanging row). Deduplicate by `missing` gate. (P0 does not require full component-merge bridge search beyond hanging gates — good enough and consistent with transit personal bridges.)

### Vector A — Voltage (Spark)

Start **0**, add:

| Driver | Points |
|---|---|
| Each Electromagnetic channel | **+18** |
| Each Split-Bridge lock (self hanging completed by friend) | **+15** |
| Each newly defined motor in composite | **+8** |

`voltage = clamp(0, 100, sum)`

### Vector B — Flow (Structural ease)

Start **0**, add:

| Driver | Points |
|---|---|
| **Profile harmony** (once if any match) | **+25** if identical profiles **or** harmonic line pair **or** complementary angle geometry (see below) |
| Each Companionship channel | **+15** |
| Each Dominance channel | **+10** |
| Each shared defined center (`defined_A ∩ defined_B`) | **+5** |

**Profile harmony details (P0):**

- Identical: `profile_A == profile_B`.
- Harmonic lines: parse `p/d` lines; treat as harmony if the **personality lines** `{pA, pB}` are one of `{1,4}`, `{2,5}`, `{3,6}` (unordered pair), **or** the same for design lines — **or** either person’s full profile matches the other’s with those line pairs. Keep implementation simple:  
  - identical → harmony; else  
  - if `{line_personality_A, line_personality_B}` ∈ `{{1,4},{2,5},{3,6}}` → harmony; else  
  - Right Angle = personality line ∈ {1,2,3}; Left Angle = personality line ∈ {4,5,6}; Juxtaposition = profile `4/1`. Complementary = (RA vs LA) and not identical. Juxtaposition does not grant the RA/LA bonus.
- Award the **+25 at most once**.

`flow = clamp(0, 100, sum)`

### Vector C — Somatic Ease (inverse friction)

Start **100**, subtract:

| Driver | Points |
|---|---|
| Each Compromise channel | **−18** |
| Authority speed gap | **−15** if one authority is Emotional (Solar Plexus) and the other is Splenic or Sacral (instant). Ego / Self-Projected / Lunar / Mental: **no** gap penalty in P0. |
| 9-0 saturation | **−12** if `|composite_defined| == 9` |
| Sacral / Non-Sacral asymmetry | **−10** if one type ∈ {Generator, Manifesting Generator} and the other ∈ {Projector, Manifestor, Reflector} |

`ease = clamp(0, 100, sum)`

### Context Fit (Natural)

| Context id | Weighting |
|---|---|
| `work` | 0.45·Flow + 0.35·Voltage + 0.20·Ease |
| `life` | 0.40·Ease + 0.35·Flow + 0.25·Voltage |
| `play` | 0.50·Voltage + 0.35·Flow + 0.15·Ease |

`natural_fit = clamp(0, 100, round(weighted))`

### Composite Archetype badge

Let `n = |composite_defined|`, `open = 9 - n`:

| Badge id | When | Label (UI) |
|---|---|---|
| `closed_loop` | n == 9 | **9-0 · Closed-Loop Reactor** |
| `focused_radar` | n == 8 | **8-1 · Focused Radar** |
| `dynamic_eq` | n == 7 | **7-2 · Dynamic Equilibrium** |
| `open_field` | n ≤ 6 | **6-3+ · Open-Field Explorers** |

One-line blurb per badge (static copy in FE or API).

### Thin Regulated Fit (P0)

**Base:** `regulated_ease` starts as Natural `ease`.  
**Toggles** (show only if `applicable`):

| id | Show when | On enable |
|---|---|---|
| `emotional_wait` | authority speed gap present | `regulated_ease += 10` (offset part of −15) |
| `yield_compromise` | ≥1 Compromise channel | `regulated_ease += min(18, 9 * compromise_count)` capped so restore ≤ full compromise penalty |
| `solo_buffer` | Voltage ≥ 60 **or** 9-0 composite | `regulated_ease += 8` |

After toggles: `regulated_ease = clamp(0, 100, …)`. Recompute Fit with **same context weights** but substitute `regulated_ease` for Ease → `regulated_fit`. Voltage/Flow unchanged in P0.

UI: list Natural Fit vs Regulated Fit; toggles as checkboxes under “Co-regulation (preview)”. No persistence.

---

## API sketch

### `POST /soul/sync`

Auth soft pattern: body includes `user_id` (owner). Verify both chart ids belong to that user.

Request:

```json
{
  "user_id": 1,
  "self_chart_id": 12,
  "friend_chart_id": 15,
  "context": "work",
  "protocols": ["emotional_wait", "solo_buffer"]
}
```

`context`: `work` | `life` | `play` (default `work`).  
`protocols`: optional list of enabled toggle ids (default `[]`).

Response (illustrative):

```json
{
  "self": {"id": 12, "label": "Me", "type": "Generator", "profile": "3/5", "authority": "Sacral"},
  "friend": {"id": 15, "label": "Alex", "type": "Projector", "profile": "1/3", "authority": "Emotional (Solar Plexus)"},
  "context": "work",
  "context_label": "Work & Co-Creation",
  "vectors": {
    "voltage": 54,
    "flow": 40,
    "ease": 62,
    "voltage_drivers": [{"kind": "electromagnetic", "channel": "Emoting", "gates": [39, 55], "pts": 18}],
    "flow_drivers": [],
    "ease_drivers": [{"kind": "authority_gap", "pts": -15}]
  },
  "natural_fit": 49,
  "regulated_fit": 55,
  "regulated_ease": 72,
  "weights": {"voltage": 0.35, "flow": 0.45, "ease": 0.20},
  "archetype": {
    "id": "dynamic_eq",
    "label": "7-2 · Dynamic Equilibrium",
    "composite_defined_count": 7,
    "blurb": "High internal chemistry with two open centers left to breathe."
  },
  "split_bridges": [
    {"gate": 44, "channel": "Surrender", "held_by": "friend", "missing_for": "self"}
  ],
  "conditioning_strip": [
    {
      "center": "Solar_Plexus",
      "self": "open",
      "friend": "defined",
      "direction": "friend_to_self",
      "hint": "Amplifier: you can feel their emotional wave more intensely. Ask: is this mine?"
    }
  ],
  "channel_roles": {
    "electromagnetic": [],
    "companionship": [],
    "dominance": [],
    "compromise": []
  },
  "available_protocols": [
    {"id": "emotional_wait", "label": "Apply 24h Emotional Wait Rule", "applicable": true},
    {"id": "yield_compromise", "label": "Yield compromise channels to the defined holder", "applicable": false},
    {"id": "solo_buffer", "label": "30-min solo decompression buffer", "applicable": true}
  ],
  "disclaimer": "Chart mechanics for awareness — not medical or relationship advice."
}
```

Implementation home: e.g. `backend/app/hd/soul_sync.py` pure `compute_soul_sync(chart_a, chart_b, context, protocols) -> dict` + thin route in `routes.py`. Unit tests with two fixture gate sets covering EM, Compromise, bridge, 9-0, authority gap, sacral asymmetry.

**Errors:** 404 chart; 403 chart not owned; 400 same chart twice / invalid context.

Optional later: `GET /soul/sync?...` — POST preferred so protocol list stays in body.

---

## UI (`/soul`)

Match Baseline tokens (`bg-canvas`, `border-border`, `text-growth`, chips like Today).

Suggested layout (top → bottom):

1. Title **Soul** + one-line subtitle: “Bio-Sync between you and someone you’ve charted.”
2. Pickers: `[ You ▾ ]` · sync glyph · `[ Friend ▾ ]`
3. Context segmented control (3) + small alias text under active lens.
4. Hero card: **Natural Fit** big % · **Regulated Fit** % (dim until a toggle on) · Archetype badge.
5. Three vector meters with scores.
6. Split-Bridge callout card (hide if none).
7. Conditioning strip.
8. Co-regulation toggles (applicable only).
9. Collapsible “How this is calculated” (short; no wall of HD jargon).

**Not:** hearts, “match”, “compatible soulmate”, swipe, dual pink/blue romance chrome.

---

## Acceptance criteria (P0)

1. Given ≥1 `self` and ≥1 other saved chart, when I open Soul and pick both, then Natural Fit %, three vectors, and archetype render without crashing.
2. Given I switch Work → Life → Play, then Fit % changes per the weight table (vectors themselves unchanged).
3. Given an Electromagnetic channel between the pair, then Voltage includes +18 for that channel (visible in drivers or test).
4. Given friend holds a gate in my `hanging_gates.missing`, then Split-Bridge callout shows that gate and Voltage includes +15.
5. Given Compromise channel(s), then Ease is reduced by 18 each (floored at 0).
6. Given Emotional vs Sacral/Splenic authorities, then Ease includes −15 authority gap; enabling `emotional_wait` raises Regulated Fit vs Natural.
7. Given composite defines all 9 centers, then badge is **9-0 · Closed-Loop Reactor** and Ease includes −12.
8. Given Generator/MG ↔ Projector/Manifestor/Reflector, then Ease includes −10 sacral asymmetry.
9. Given open Solar Plexus (me) + defined (friend), then conditioning strip shows Friend→Me amplifier hint.
10. Given &lt;2 saved people, then empty state + link to Chart — no fake scores.
11. Given free-tier user, then Soul works (no Pro wall).
12. Nav shows **Soul** and `aria-current` on `/soul`.
13. Backend unit tests cover scoring helpers; no dating copy in default UI strings.

---

## P1 backlog (after P0)

- Persist co-regulation prefs per pair; deeper protocol library tied to Compromise channel names.
- “Open in Protocols” CTA generating pair-aware Do items.
- Dual / composite BodyGraph optional view.
- Rank all friends by Fit for active lens (“circle scan”).
- Shareable summary card (no birth data).
- Richer bridge detection (component-merge gates beyond hanging).
- Partner/Sleep microcopy pack (recovery, overnight proximity) still on `life` weights.

## P2 backlog

- Variables / Environment overlay for shared-space advice.
- 3+ person team composite.
- Wearable HRV conflict days × high Voltage warning.
- LLM plain-language story from drivers (strictly post-mechanic).

---

## Ship notes

- **Railway Hobby builds still paused** (“Deploys have been paused due to an upstream issue”). Soul **API will not reach prod** until Hobby builds resume and `api` is redeployed from `main`. Frontend can merge to Vercel earlier; gate the page on API health or show “Soul sync needs API update” if endpoint 404s.
- Local/dev: full stack works without Railway.
- Do not wait on Admin PR merge or Today API redeploy to start Soul — independent feature slice.
- Suggested files: `backend/app/hd/soul_sync.py`, `backend/tests/test_soul_sync.py`, route + schemas; `frontend/src/app/soul/page.tsx`, Header nav entry, `lib/api.ts` helper.

---

## Hand-off

When PO says go: brief `@dev` with this spec path. `@qa` Ship Gate against AC 1–13 after PR.
