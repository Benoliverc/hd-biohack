# P0 — Soul Aura Alchemy (kill Fit %)

**Status:** Ready for `@dev` (spec only — not built)  
**Route:** `/soul` (existing Soul tab)  
**App:** Baseline (hd-biohack)  
**Date:** 2026-10-23 (HKT)  
**Supersedes:** Bio-Sync Fit % scoring UI and `natural_fit` / `regulated_fit` product framing in `soul-biosync-spec.md` (mechanics below reuse that scorer’s channel roles)

Related: Chart Me/Friends IA is separate. Do not block Aura Alchemy on Chart polish.

---

## Goal (plain language)

As a Baseline user, I open **Soul**, pick **me** and a **saved friend**, and see **how our auras wire together** — signatures, rare unlocks, and somatic spectrums — without a single “62% Fit” grade that makes a high-voltage magnetic pair look weakly compatible.

Tone stays Grounded Vitality / Oura-style. Empowering biohacking language. No dating chrome. No red “bad” for Active Co-Regulation.

---

## Problem

The shipped Bio-Sync scorer (`backend/app/hd/soul_sync.py` + `/soul`) returns:

- `natural_fit` / `regulated_fit` (0–100 weighted %)
- Vectors `voltage` / `flow` / `ease` feeding that %
- Archetype from composite center count (9-0 / 8-1 / 7-2 / 6-3+)
- `channel_roles` (electromagnetic, companionship, dominance, compromise)
- One-way `split_bridges` (friend completes my hanging gate)
- Thin co-regulation toggles that bump Ease → Regulated Fit

Linear math **penalizes** Sacral/Non-Sacral asymmetry, Double Emotional, Compromise, and 9-0 saturation as “low ease / low fit.” In HD biohacking those often mean **high-voltage activation that needs protocols**, not weak chemistry. Users with Mutual Split-Bridge + 59-6 + Integration Triad + shared 19-49 still see middling %.

**Only consumer of `POST /soul/sync` is the Soul FE.** Clean response replace is preferred over dual-maintaining Fit fields.

---

## What already exists (grounding)

| Area | Today |
|---|---|
| Scorer | `compute_soul_sync` — channel roles, hanging bridges (self←friend), composite gates/channels/centers, profile harmony, authority gap, sacral asymmetry |
| Definition | `derive_definition` in `hd/type_authority.py` (Single / Split / Triple Split / …) from connected components — **not yet used in soul_sync** |
| Channels | `hd/channels.py` — Intimacy `(6,59)`, Awakening `(10,20)`, Exploration `(10,34)`, Charisma `(20,34)`, Synthesis `(19,49)`, Struggle `(28,38)`, Recognition `(30,41)`, Structuring `(23,43)`, Abstraction `(47,64)`, Transitoriness `(35,36)` |
| Chart JSON | `activated_gates`, `defined_centers`, `hanging_gates`, `type`, `authority`, `definition`, `profile` |
| FE | `/soul` hero shows Natural Fit % + Regulated Fit % + three meters + Split-Bridge + conditioning strip + toggles |

Almost all Aura Alchemy drivers are computable from two `chart_json` blobs + existing helpers. P0 extends the pure scorer and rewrites the page header + cards. No ephemeris change.

---

## P0 scope (must ship)

### In

1. **Kill single Fit %** from UI and from the sync response (no `natural_fit`, `regulated_fit`, `regulated_ease`, `weights`). Remove co-regulation toggles that only existed to bump Fit.
2. **Layer A — Aura Signature hero** (1 of 5, priority order) + optional **secondary sub-badge** when a second signature also matches.
3. **Layer B — Rare Alchemy badges** (0–N glowing pills) with exact detection below.
4. **Layer C — 3 biometric spectrums** (descriptive ends, position 0–100 for bar fill only — **never labeled as Fit %**). Somatic Pacing high end uses electric amber/violet, never danger red.
5. **Context → Playbooks** (same 3 ids: `work` / `life` / `play`). Switching playbook **reorders insight cards**; it does **not** regrade a score. Labels:
   - `life` → Life & Intimacy
   - `work` → Work & Co-Creation
   - `play` → Play & Recovery (rename from “Play & Performance” in UI copy)
6. **Four insight cards** (API returns all; FE orders by playbook):
   - Card 1 Circuit Bridge (templated)
   - Card 2 Spark & Glue (EM + Companionship + Dominance as gifts)
   - Card 3 Power Dynamics to Tune (ex-Compromise; empowering framing)
   - Card 4 Tailored Somatic Playbook (up to 3 templated protocols; no LLM)
7. Keep You ↔ Friend pickers, empty states, free-tier access, disclaimer.
8. Keep `channel_roles` + people meta in the response for cards/tests. Conditioning strip may stay collapsed under “Centers” or move into Card 1 as secondary detail — do not delete the data.

### Out of P0 (→ P1)

- LLM narrative rewrite of any card
- Exhaustive triad / bridge edge-case library beyond the detection rules below
- Component-merge bridges beyond hanging-gates + definition Single/Split check
- Dual / composite BodyGraph
- Circle rank all friends
- Persist playbook choice or protocol completion
- Reintroducing any single compatibility %

### Why this cut

Layers A–C + playbook reorder + rule-based Cards 1–3 fix the product lie (magnetic pairs looking “low fit”) with data we already compute. Card 4 ships the somatic protocols the brief cares about as **static templates keyed off type × authority × profile flags** — enough to prove the playbook idea without an LLM or a protocol CMS. Expanding every channel-name essay and LLM polish is P1.

---

## Layer A — Aura Signature detection (priority)

Evaluate top-down. First match is **primary**. If a later rule also matches, expose it as **secondary** (one sub-badge only; first secondary in this same priority list).

| Priority | id | Label | Trigger (any clause) | Subtext |
|---|---|---|---|---|
| 1 | `magnetic_alchemy` | Magnetic Alchemy | `len(electromagnetic) >= 2` **OR** EM channel Intimacy `{6,59}` present **OR** `mutual_split_bridge` (see badges) | High-voltage auric lock. Deep catalytic spark that amplifies vitality and transforms both baselines. |
| 2 | `integrated_flow` | Integrated Flow Circuit | Both individuals are Split* and composite definition is `Single` **OR** Integration Triad badge fires | Seamless circuit completion. Separate energy islands snap into a unified, continuous flow. |
| 3 | `harmonic_sanctuary` | Harmonic Sanctuary | `len(companionship) >= 2` **OR** (`len(companionship) >= 1` AND `len(compromise) <= 1` AND shared authority class) | Deep tribal or rhythmic familiarity. Low-friction baseline with effortless unspoken understanding. |
| 4 | `catalytic_growth` | Catalytic Growth Engine | Composite defined count is 8 or 9 **AND** (`len(compromise) >= 2` OR `len(dominance) >= 3`) | Intense developmental mirror. High momentum pairing designed for rapid expansion and conscious pacing. |
| 5 | `spacious_explorers` | Spacious Co-Explorers | Composite **open** centers `>= 3` (i.e. defined count `<= 6`) | Breathable, low-conditioning field. Thrives on shared novelty, changing environments, and fluidity. |

**Split\*** means definition string starts with `Split` or equals `Triple Split` / `Quadruple Split` (anything with more than one component). Use `derive_definition` on each chart and on the composite channel set.

**Shared authority class (P0):** both Emotional, or both Sacral, or both Splenic (string match via existing `_is_emotional` / sacral / splenic helpers). Other authorities do not count as “shared” for Harmonic Sanctuary.

**Fallback:** if somehow none match (should not with rule 5), use `spacious_explorers`.

UI: large hero title + subtext. Secondary as a small pill under the title (e.g. “Also: Harmonic Sanctuary”).

---

## Layer B — Rare Alchemy badges

Emit every badge that matches (stable `id`, `label`, short `detail`). Order in UI = table order.

| id | Label | Detection |
|---|---|---|
| `mutual_split_bridge` | Mutual Split-Bridge (Single Flow) | Self definition is Split* **and** friend definition is Split* **and** composite definition is `Single`. (Optional detail: list hanging bridges both directions — self hanging∩friend gates and friend hanging∩self gates.) |
| `shared_compass` | Shared Compass Unlocked (G-Center Defined) | `G ∉ defined_self` **and** `G ∉ defined_friend` **and** `G ∈ composite_defined` |
| `intimacy_lock` | Intimacy & Creative Lock (59-6) | Electromagnetic role on channel gates `{6,59}` (name Intimacy) |
| `integration_triad` | Integration Triad (10-20-34) | Composite activates **both** Awakening `(10,20)` and Exploration `(10,34)` **and** cross-person completion: (`10 ∈ gates_a` and `{20,34} ⊆ gates_b`) **or** (`10 ∈ gates_b` and `{20,34} ⊆ gates_a`). If that exact pattern fails but composite has both channels and **neither person alone** had both channels, still emit the badge (detail notes “composite triad”). |
| `tribal_bond` | Tribal Bond (Shared 19-49) | Companionship role on gates `{19,49}` (Synthesis) |
| `mirror_gates` | Mirror Gates (Shared Hanging Gates) | Non-empty set of gates `g ∈ gates_a ∩ gates_b` whose center `C = GATE_TO_CENTER[g]` is open for **both** individuals (`C ∉ defined_a` and `C ∉ defined_b`). Detail lists up to 5 gates + center names. |
| `composite_8_1` | 8-1 “Have Some Fun” Composite | `\|composite_defined\| == 8` |
| `composite_9_0` | 9-0 “Full Circuit” Composite | `\|composite_defined\| == 9` |

Old archetype badge (Closed-Loop / Focused Radar / …) is **replaced** by Signature + these composite badges. Do not show both competing center-count labels.

---

## Layer C — Biometric spectrums

Each spectrum: `{ id, label, low_label, high_label, position: 0–100, summary, drivers[] }`.  
`position` fills the bar only. **Never** show “Fit”, “% compatible”, or red danger styling on high Somatic Pacing.

### 1. `auric_charge` — Auric Charge

- Ends: **Independent Calm** ↔ **High-Voltage Lock**
- Position (clamp 0–100): start 0; `+18` per EM; `+15` per hanging bridge either direction (dedupe by gate); `+8` per newly defined motor; `+12` if `intimacy_lock`; `+10` if `integration_triad`.
- High summary example: “High-voltage activation — catalytic spark, shared momentum, and amplified nervous system output.”

### 2. `circuit_continuity` — Circuit Continuity

- Ends: **Independent Islands** ↔ **Unified Single Flow**
- Position: start 0; `+40` if mutual_split_bridge (or composite Single while either was Split*); `+15` per companionship; `+8` per dominance; `+20` if shared authority class; `+15` if `shared_compass`.
- High summary example: “You complete each other’s circuitry — thoughts, emotions, and actions wire into a single continuous loop.”

### 3. `somatic_pacing` — Somatic Pacing Style

- Ends: **Effortless Cruise** ↔ **Active Co-Regulation**
- Position: start 0; `+35` if sacral asymmetry; `+30` if both Emotional authority; `+12` per compromise channel (cap +36); `+10` if authority speed gap (Emotional vs Sacral/Splenic).
- **UX:** high end accent = electric amber or violet (`text-energy` / new token), **not** `text-danger`. Frame positively: “High-depth connection that thrives on intentional pacing, emotional wave surfing, and solo aura recovery.”

Reuse driver list shape from today’s vectors (`kind`, optional channel/gates, `pts`) for tests and collapsible “How this is read.”

---

## Playbooks (context switcher)

Request still sends `context`: `work` | `life` | `play` (default `life` for intimacy-first product, or keep `work` if changing default is noisy — **prefer default `life`** for Aura Alchemy).

Playbook only changes `card_order` (array of card ids). Spectrums/signature/badges are **context-invariant** in P0 (no reweight).

| Playbook | Label | Default card_order |
|---|---|---|
| `life` | Life & Intimacy | `somatic_playbook`, `power_dynamics`, `circuit_bridge`, `spark_glue` |
| `work` | Work & Co-Creation | `circuit_bridge`, `spark_glue`, `power_dynamics`, `somatic_playbook` |
| `play` | Play & Recovery | `spark_glue`, `somatic_playbook`, `circuit_bridge`, `power_dynamics` |

FE: segmented control; on change, either re-POST with new context (gets new `card_order`) or reorder client-side from a static map. Prefer **client-side reorder** of already-fetched cards so switching playbooks is instant; still send `context` for analytics / future weights. If client-side, API may omit per-request order and document the static map — either is fine if AC passes.

---

## Cards (rule-based copy)

Each card: `{ id, title, body_blocks: [{ headline, body }], empty_body? }`.  
Copy is template-filled on the server (single source of truth for tests). No LLM in P0.

### Card 1 — `circuit_bridge` — “How You Wire Together”

Emit one block per detected bridge theme (max 4):

| Theme | When | Headline / body pattern |
|---|---|---|
| Cognitive | Dominance or EM involving Structuring `(23,43)` and/or Abstraction `(47,64)` across the pair | **Mental Structuring Bridge:** You help organize and articulate their abstract mental swirls into crisp insights. (Swap You/They from `holder` / gate ownership.) |
| Kinetic | Dominance or EM involving Transitoriness `(35,36)` and/or Charisma `(20,34)` | **Kinetic Execution Bridge:** They wire deep intuition into physical action and experience. |
| Identity | `shared_compass` badge | **True North Lock:** Together you generate a defined sense of direction and presence that neither of you holds solo. |
| Mutual single flow | `mutual_split_bridge` | **Split → Single Flow:** Separately you run split circuitry; together the field resolves into one continuous definition. |

If none fire: one calm empty line — “No dramatic bridge theme on this pair — look at Spark & Glue and pacing instead.”

Also attach hanging bridge list (both directions) as structured `bridges: []` for FE bullets.

### Card 2 — `spark_glue` — “Spark & Glue”

Three sections always present (hide section if list empty):

1. **Spark (Electromagnetic)** — list EM channels by name/gates.
2. **Bedrock (Companionship)** — list companionship channels.
3. **Effortless Gifts (Dominance)** — list dominance with holder label (“Your Structuring” / “Their Transitoriness”). **Do not** call these “imbalance.”

### Card 3 — `power_dynamics` — “Power Dynamics to Tune”

Rename Compromise. For each compromise channel, emit:

- Headline from a small map when known:
  - `(28,38)` Struggle → **Purpose & Tenacity Tuning**
  - `(30,41)` Recognition → **Desire & Imagination Tuning**
  - else → **{Channel name} Tuning**
- Body: who holds full channel vs hanging gate; one protocol line (static):
  - 28-38: “Check in before locking into stubborn solo battles.”
  - 30-41: “Label casual fantasies vs ready-to-launch plans.”
  - default: “Name who is running the full thermostat before pushing pace.”

Empty: “No compromise channels — fewer thermostat collisions on paper.”

### Card 4 — `somatic_playbook` — “Tailored Somatic Playbook”

Emit up to **3** protocol objects `{ id, title, body }` when flags apply:

| id | When | Title / body (template) |
|---|---|---|
| `sacral_aura_hygiene` | `sacral_asymmetry` (MG/Generator ↔ Projector/Manifestor/Reflector) | **Sacral / Non-Sacral Aura Hygiene.** Name types. Sacral partner = “nuclear reactor” amplifier for the non-Sacral. Recommend 30–60 min solo wind-down before sleep so the non-Sacral can discharge borrowed Sacral charge without the Sacral partner reading it as rejection. |
| `profile_resonance` | Both profiles present | **Profile Resonance ({pA} + {pB}).** If `{6/2, 5/1}` pair (either way): 6/2 sees cleanly past 5/1 projection field; Projector waits for invitation; guide MG via binary Yes/No Sacral questions, not commands, while 20-34 is in motion. Else generic: honor hermit/investigator needs; don’t force same social bandwidth. |
| `double_emotional` | Both Emotional authority | **Double Emotional Wave Surfing.** Lean into tactile 19-49 comfort when present (food, warmth, presence; no heavy problem-solving at wave bottom). Wait a night’s sleep before locking big decisions. Mention shared 59-6 / 30-41 if those channels appear in roles. |

If none apply: one block — “Pacing looks relatively easy on paper — still protect solo aura time after high-charge days.”

---

## API change — `POST /soul/sync`

**Clean replace** (FE-only consumer). Update `SoulSyncOut` + `frontend` types in the same PR.

### Request

```json
{
  "user_id": 1,
  "self_chart_id": 12,
  "friend_chart_id": 15,
  "context": "life"
}
```

- Drop `protocols` (ignore if sent, for one release).
- `context`: `work` | `life` | `play` (default **`life`**).

### Response (illustrative)

```json
{
  "self": {"id": 12, "label": "Me", "type": "Projector", "profile": "6/2", "authority": "Emotional (Solar Plexus)", "definition": "Split"},
  "friend": {"id": 15, "label": "Alex", "type": "Manifesting Generator", "profile": "5/1", "authority": "Emotional (Solar Plexus)", "definition": "Split"},
  "context": "life",
  "playbook": {
    "id": "life",
    "label": "Life & Intimacy",
    "card_order": ["somatic_playbook", "power_dynamics", "circuit_bridge", "spark_glue"]
  },
  "signature": {
    "id": "magnetic_alchemy",
    "label": "Magnetic Alchemy",
    "emoji": "⚡",
    "subtext": "High-voltage auric lock. Deep catalytic spark that amplifies vitality and transforms both baselines."
  },
  "secondary_signature": {
    "id": "integrated_flow",
    "label": "Integrated Flow Circuit",
    "emoji": "🧬",
    "subtext": "…"
  },
  "badges": [
    {"id": "mutual_split_bridge", "label": "Mutual Split-Bridge (Single Flow)", "detail": "Split + Split → Single"},
    {"id": "intimacy_lock", "label": "Intimacy & Creative Lock (59-6)", "detail": "Electromagnetic Intimacy"},
    {"id": "integration_triad", "label": "Integration Triad (10-20-34)", "detail": "Gate 10 meets 20-34"},
    {"id": "tribal_bond", "label": "Tribal Bond (Shared 19-49)", "detail": "Companionship Synthesis"},
    {"id": "composite_8_1", "label": "8-1 “Have Some Fun” Composite", "detail": "8 defined / 1 open"}
  ],
  "spectrums": [
    {
      "id": "auric_charge",
      "label": "Auric Charge",
      "low_label": "Independent Calm",
      "high_label": "High-Voltage Lock",
      "position": 78,
      "summary": "High-voltage activation — catalytic spark and amplified output.",
      "drivers": []
    },
    {
      "id": "circuit_continuity",
      "label": "Circuit Continuity",
      "low_label": "Independent Islands",
      "high_label": "Unified Single Flow",
      "position": 85,
      "summary": "You complete each other’s circuitry into one continuous loop.",
      "drivers": []
    },
    {
      "id": "somatic_pacing",
      "label": "Somatic Pacing Style",
      "low_label": "Effortless Cruise",
      "high_label": "Active Co-Regulation",
      "position": 72,
      "summary": "High-depth connection that thrives on intentional pacing and solo aura recovery.",
      "drivers": []
    }
  ],
  "cards": [
    {"id": "circuit_bridge", "title": "How You Wire Together", "body_blocks": []},
    {"id": "spark_glue", "title": "Spark & Glue", "body_blocks": []},
    {"id": "power_dynamics", "title": "Power Dynamics to Tune", "body_blocks": []},
    {"id": "somatic_playbook", "title": "Tailored Somatic Playbook", "body_blocks": []}
  ],
  "channel_roles": {
    "electromagnetic": [],
    "companionship": [],
    "dominance": [],
    "compromise": []
  },
  "split_bridges": [],
  "friend_split_bridges": [],
  "conditioning_strip": [],
  "composite": {
    "defined_count": 8,
    "open_count": 1,
    "definition": "Single",
    "defined_centers": []
  },
  "disclaimer": "Chart mechanics for awareness — not medical or relationship advice."
}
```

**Removed:** `natural_fit`, `regulated_fit`, `regulated_ease`, `weights`, `vectors`, `archetype`, `available_protocols`.

**Added helpers inside scorer:** bidirectional hanging bridges; `derive_definition` for self/friend/composite; badge + signature registries; spectrum positions; card template filler.

**Errors:** unchanged (404 / 403 / 400 same chart / invalid context).

Implementation home: extend `backend/app/hd/soul_sync.py` (or rename module later — not required in P0). Rewrite tests in `backend/tests/test_soul_sync.py` around signatures/badges/spectrums/cards. Update `schemas.py`, route, `frontend/src/lib/api.ts`, `frontend/src/app/soul/page.tsx`.

---

## UI (`/soul`)

Match Baseline tokens. Suggested layout top → bottom:

1. Title **Soul** + subtitle: “Aura mechanics between you and someone you’ve charted.”
2. Pickers unchanged.
3. Playbook segmented control (3) — switching reorders cards only.
4. **Hero:** Signature title + subtext; secondary pill; Rare Alchemy badge row (wrap).
5. **Three spectrums** with dual end-labels; Somatic Pacing uses amber/violet at the high end.
6. **Insight cards** in playbook order.
7. Optional collapsed conditioning strip / “How this is read.”
8. Disclaimer.

**Forbidden copy:** “Fit %”, “compatibility score”, “match”, “soulmate”, red/warning treatment of Active Co-Regulation or Compromise.

---

## Acceptance criteria (P0)

1. Given a synced pair, the hero shows an Aura Signature title and subtext — **no** Natural/Regulated Fit % anywhere on `/soul`.
2. Given EM ≥ 2 or Intimacy EM or mutual Split→Single, primary signature is Magnetic Alchemy when that rule wins priority.
3. Given two Split* charts whose composite is Single, badge `mutual_split_bridge` appears.
4. Given both Open G and composite defines G, badge `shared_compass` appears.
5. Given EM on `{6,59}`, badge `intimacy_lock` appears.
6. Given Gate 10 vs `{20,34}` cross-person pattern forming both 10-20 and 10-34, badge `integration_triad` appears.
7. Given companionship `{19,49}`, badge `tribal_bond` appears.
8. Given composite defined count 8 or 9, the matching 8-1 / 9-0 badge appears.
9. Spectrum bars render with both end labels; Somatic Pacing high end is not styled as danger/red.
10. Switching Life / Work / Play reorders the four cards per the playbook table without changing signature/badges/spectrum positions.
11. Compromise channels appear under **Power Dynamics to Tune**, not “friction” / “bad compatibility.”
12. Sacral asymmetry pair shows `sacral_aura_hygiene` protocol; double Emotional shows `double_emotional`; 6/2↔5/1 shows profile protocol text.
13. Free tier works; empty state when &lt;2 people; no dating chrome.
14. Backend unit tests cover signature priority, each badge detector, spectrum drivers, and card template selection; old Fit %-only tests removed or rewritten.
15. `POST /soul/sync` response schema matches this spec (no `natural_fit`).

---

## Out of scope (repeat)

LLM copy, dual BodyGraph, circle ranking, Variables/PHS, persisting protocols, reintroducing a single %, full component-merge bridge search, exhaustive per-channel essay library beyond the templates above.

---

## Ship notes

- FE + API should ship together (schema break). Vercel + Railway both need the build.
- Railway may still lag; if API 404/old schema, Soul should show a clear “API needs update” state (already patterned).
- Suggested branch: `feat/soul-aura-alchemy`.
- Hand to `@qa` Ship Gate on AC 1–15 after PR.
- Mark Bio-Sync Fit % as **superseded** in backlog when this goes Active.

---

## Hand-off

When PO says go: brief `@dev` with this spec path. Do not implement Fit %-preserving dual mode.
