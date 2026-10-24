# P1 — Chart & Soul literacy coach (Opt 1: Inline “How to read”)

**Status:** Implementing on `feat/literacy-coach-opt1` — PO green-light 2026-10-24; PR pending Ship Gate  
**App:** Baseline (hd-biohack)  
**Date:** 2026-10-24 (Asia/Hong_Kong)  
**Decision:** Literacy Mix — **Opt 1 first**, Opt 2 later (progressive Bodygraph walkthrough). This file is **Opt 1 only**.  
**Routes:** Chart `/profile` · Soul `/soul`  
**Related:** `hdCopy.ts`, `ChartDeepDive.tsx`, `BodyGraph.tsx` legend, `soul-aura-alchemy-spec.md`, `soul-signature-copy-playbooks.md`

---

## 1. User story + business goal

### User story

As a Baseline user who just calculated a chart (or opened Soul with me + a friend), I want a short **“How to read this”** coach beside the Bodygraph / Aura Signature so I can learn Human Design **while looking at my own data** — not by leaving for a blog.

### Business goal

- Raise Chart & Soul **comprehension** (Type → Strategy → Authority; Defined vs Open; aura wiring roles) without a full education product.
- Reduce bounce / “pretty but opaque” on Bodygraph and Soul cards.
- Reuse existing copy (`hdCopy`, Snapshot blurbs, Deep dive, Soul card headlines) so literacy feels native to Baseline vernacular (Grounded Vitality / Oura-calm), not a jargon dump.

### Success signal (qualitative P1)

New users can explain in one sentence: (Chart) what Defined vs Open means and where Strategy/Authority live; (Soul) what Spark / Bedrock / Power Dynamics mean for *this* pair — without opening external HD sites.

---

## 2. Placement

### Chart (`/profile`) — when `chart` is present

| Element | Placement |
|---|---|
| **Coach panel** | Compact card **above or sticky-adjacent to** the Bodygraph + Snapshot grid (`#bodygraph` / `#snapshot`). Preferred: full-width strip **between** `ChartSectionNav` and the `lg:grid` that holds Bodygraph + Snapshot — so both columns stay visible while reading steps. |
| **Entry affordance** | Title: **How to read your chart**. Collapsed default after dismiss = one-line chip / button in Snapshot header or nav: **How to read**. |
| **Empty / no chart** | Do **not** show coach on people-form-only state. |

### Soul (`/soul`) — when sync `result` is present (Aura Alchemy schema)

| Element | Placement |
|---|---|
| **Coach panel** | Compact card **immediately above** Aura Signature hero (`data-testid="soul-hero"`) — after pickers + Playbook label, before signature. Users learn the map before the signature label hits them. |
| **Empty / loading / API lag** | Hide coach (same as insight cards). Empty-state CTA stays “Open Chart…”. |
| **Entry after dismiss** | Quiet link under Playbook blurb or beside signature eyebrow: **How to read Soul**. |

### Shared UX shape

- Collapsible panel (not a modal blocking the page).
- Numbered steps (4–6), each **≤2 short sentences**.
- Each step that maps to a section has a **Jump** control (smooth scroll + hash).
- Footer: **Got it** (dismiss) · **Keep open** (stay expanded this session).
- Tone: Baseline vernacular — “battery,” “body’s yes,” “wires,” “charge” — mirror Snapshot / Soul Aura Alchemy copy. No textbook HD dumps.

---

## 3. Content outline (verified against live UI)

### Chart — 6 steps

Grounded in live anchors: `#bodygraph`, `#snapshot`, `#deep-dive` (+ domain stubs `#centers`, `#channels`, …). Legend pills on `BodyGraph`: **Defined / Open**, **Conscious (Mind) / Somatic (Body) / Integrated**. Snapshot already surfaces Type, Profile, Strategy (“How you decide”), Authority (“Your body’s yes”), Centers to watch.

| # | Step title | Plain copy (draft — ship via `hdCopy`) | Jump |
|---|---|---|---|
| 1 | **Defined vs Open centers** | Colored shapes are **Defined** — consistent energy you can rely on. Pale shapes are **Open** — you amplify people and places; watch for energy leaks. | `#bodygraph` (legend) |
| 2 | **Channels & hanging gates** | A **channel** is a lit path between two centers (consistent circuitry). A **hanging gate** is a half-path — magnetic to people who hold the other side. | `#bodygraph` (Active channels / Hanging gates lists) |
| 3 | **Conscious · Somatic · Integrated** | Dark chips = mind / Personality; warm chips = body / Design; ringed = both. Same gate can show on either “story.” | `#bodygraph` (legend pills) |
| 4 | **Type → Strategy → Authority** | **Type** is your energy role. **Strategy** is how life invites you. **Authority** is your body’s yes — decide from there, not the mind alone. | `#snapshot` |
| 5 | **Centers to watch** | Open centers are where conditioning lands. Snapshot lists the ones that matter most for you. | `#snapshot` (Centers to watch card) |
| 6 | **Deep dive when you want more** | Core, Centers, Channels, Planets, Activations expand the same map — same words, more detail. | `#deep-dive` |

**Reuse / extend `hdCopy.ts`:** Prefer pulling Type/Strategy/Authority one-liners from existing `TYPE_COPY` / `STRATEGY_COPY` / `AUTHORITY_PLAIN`. Add a small `CHART_LITERACY_STEPS` (or similar) export so Profile + future Opt 2 share strings.

### Soul — 5 steps

Verified live Soul UI (Aura Alchemy):

- Hero: **Aura Signature** (+ optional secondary, rare **badges**)
- **Spectrums** (relative charge / continuity / pacing — never a Fit %)
- **Playbook** lede
- Cards (`data-testid="soul-card-*"`):
  - `circuit_bridge` → **How You Wire Together**
  - `spark_glue` → **Spark & Glue** with body headlines **Spark (Electromagnetic)**, **Bedrock (Companionship)**, **Dominance** (gifts)
  - `power_dynamics` → **Power Dynamics to Tune** (compromise / thermostat collisions)
  - `somatic_playbook` → **Tailored Somatic Playbook**
- Collapsed: **Centers & how this is read** (`soul-conditioning`)
- API roles (not primary UI labels): `electromagnetic`, `companionship`, `dominance`, `compromise`

Coach must teach **user-facing** names first; parenthetical HD terms once, then drop them.

| # | Step title | Plain copy (draft) | Jump |
|---|---|---|---|
| 1 | **Aura Signature first** | The big label is how *this* pair’s auras tend to wire — not a score, not a dating grade. Secondary / badges are rare extras when they fire. | `#soul-hero` *(add id)* |
| 2 | **Spectrums ≠ Fit %** | Three bars show relative **charge, continuity, and pacing**. High charge can mean high voltage that needs protocols — not “bad chemistry.” | `#soul-spectrums` *(add id)* |
| 3 | **Spark, Bedrock, Dominance** | In **Spark & Glue**: **Spark (Electromagnetic)** = each of you holds one half — chemistry / ignition. **Bedrock (Companionship)** = you both have the full channel — easy shared baseline. **Dominance** = one person fully holds a channel — a gift to lean on, not a power trip. | `#soul-card-spark_glue` *(scroll to card; or `data-testid`)* |
| 4 | **Power Dynamics to Tune** | **Compromise** channels (both hold the same gate, different missing halves) are thermostat collisions — name them and tune, don’t shame. | `#soul-card-power_dynamics` |
| 5 | **Wire + somatic practice** | **How You Wire Together** = bridges / hanging completions. **Tailored Somatic Playbook** = body-first practices for this pair. Centers strip shows who defines what. | `#soul-card-circuit_bridge` · `#soul-conditioning` |

**New `SOUL_LITERACY_STEPS` in `hdCopy` (or `soulLiteracy.ts`)** — keep Soul-specific strings out of Chart bundle if tree-shaking matters; otherwise colocated is fine for P1.

### Proposed Soul DOM anchors (FE-only)

Add stable `id`s mirroring Chart (today Soul mostly uses `data-testid` only):

- `id="soul-hero"` on signature card  
- `id="soul-spectrums"` on spectrum grid  
- `id="soul-cards"` on cards stack  
- `id="soul-card-spark_glue"` / `soul-card-power_dynamics` / `soul-card-circuit_bridge` / `soul-card-somatic_playbook` on each InsightCard  
- `id="soul-conditioning"` on the details block  

Jump helper: reuse Chart’s `jumpToSection` pattern (smooth scroll + `history.replaceState` hash) so sticky headers / `#deep-dive` behavior stay consistent.

---

## 4. Jump links into existing sections

| Page | Targets |
|---|---|
| Chart | `#bodygraph`, `#snapshot`, `#deep-dive`, optionally `#centers` / `#channels` for steps 1–2 / 6 |
| Soul | `#soul-hero`, `#soul-spectrums`, `#soul-card-spark_glue`, `#soul-card-power_dynamics`, `#soul-card-circuit_bridge`, `#soul-conditioning` |

**Behavior**

- Clicking Jump expands coach stay-open (don’t auto-dismiss).
- If target missing (e.g. no Centers to watch), Jump still goes to parent section (`#snapshot`).
- Hash should not fight Chart’s deep-dive domain hash handling — prefer scrolling without forcing domain tab unless step 6 explicitly opens Deep dive.

---

## 5. First-visit vs dismissible persistence

### Keys (localStorage)

| Key | Purpose |
|---|---|
| `baseline.literacy.chart.v1` | Chart coach dismissed (`"1"` when Got it) |
| `baseline.literacy.soul.v1` | Soul coach dismissed |

Optional namespaced by user id if multi-account on same browser matters later: `baseline.literacy.chart.v1.${userId}` — **not required for P1** (mirror `store.tsx` selected-key pattern only if trivial).

### Rules

| State | Behavior |
|---|---|
| Key absent | Auto-**expand** coach once chart/result is ready (first visit). |
| Key `"1"` | Coach **collapsed**; show quiet **How to read** re-open control. |
| Got it | Write key; collapse; keep re-open control. |
| Keep open | Expand for this session only; do **not** write dismiss key. |
| Version bump | Changing copy/structure → bump to `v2` so users see coach once more. |

No server persistence. No cross-device sync. FE-only.

---

## 6. Copy tone

- **Baseline vernacular** already in product: “Your body’s yes,” “Centers to watch,” “energy leaks,” “Reading aura mechanics…,” “Spark & Glue,” “Power Dynamics to Tune.”
- Prefer **one HD term + plain gloss**, then use the plain name: e.g. “Spark (Electromagnetic)” once → “Spark” after.
- No medical claims; no dating chrome; no Fit % language.
- Extend `hdCopy.ts` rather than scattering literals in page components.
- Keep each step skimmable on mobile (~320px): title + ≤2 sentences + Jump.

---

## 7. Non-goals

| Out of Opt 1 | Notes |
|---|---|
| **Opt 3 — Shared Literacy drawer / glossary** | Full Learn HD panel with articles — icebox until Opt 1 proven. |
| **Opt 2 — Progressive Bodygraph walkthrough** | First-open centers → channels → hanging gates guided tour + Soul dual-aura mini walk — **explicit follow-up** (see backlog). |
| Dual / composite Bodygraph on Soul | Aura Alchemy P1 already lists this separately. |
| API / scorer / card essay changes | Literacy is FE chrome + copy modules only. |
| i18n | English only. |
| Blocking onboarding modal | Must not gate Chart calculate or Soul sync. |

---

## 8. Acceptance criteria (testable)

1. **Chart with chart loaded:** Expanded coach (first visit) shows **6** numbered steps with titles matching §3; Jump on step 1 scrolls to `#bodygraph`; step 4 to `#snapshot`; step 6 to `#deep-dive`.
2. **Chart Got it:** Sets `localStorage['baseline.literacy.chart.v1'] === '1'`; coach collapses; **How to read** control re-expands without clearing the key until… (re-expand does not clear; only a future `v2` reset does).
3. **Chart return visit:** Dismissed key present → coach starts collapsed; Snapshot / Bodygraph unchanged (TYPE/STRATEGY/AUTHORITY blurbs, legend, Deep dive still work).
4. **Soul with Aura result:** Expanded coach (first visit) shows **5** steps; step 3 Jump lands on Spark & Glue card; step 4 on Power Dynamics; step 1 on Aura Signature.
5. **Soul empty / loading / schema lag:** Coach not rendered.
6. **Copy:** No “Fit %”, no “compatibility score”; Electromagnetic / Companionship / Dominance / Compromise appear at most as glosses next to Spark / Bedrock / Dominance / Power Dynamics.
7. **FE only:** No backend route or schema change required for Opt 1.
8. **tsc / existing Playwright or assert scripts** (if any Chart/Soul smoke) still green; add a light assert that coach root `data-testid`s exist when chart/result present:
   - `data-testid="chart-literacy-coach"`
   - `data-testid="soul-literacy-coach"`

---

## 9. Suggested FE scope + API out of scope

### In (FE)

- New presentational component(s), e.g. `LiteracyCoach.tsx` (shared shell) + page-specific step configs from `hdCopy` / `soulLiteracy`.
- Wire into `frontend/src/app/profile/page.tsx` and `frontend/src/app/soul/page.tsx`.
- Add Soul section `id`s listed in §3.
- localStorage dismiss keys (§5).
- Jump helper consistent with Chart `jumpToSection`.

### Out of scope (API)

- No changes to `POST /soul/sync`, `soul_sync.py`, chart calculate, or schemas.
- No new educational endpoints.
- Card body essays / signature copy remain owned by existing Soul specs — coach **points at** them, does not rewrite them.

### Suggested file touch list (for @dev later)

- `frontend/src/lib/hdCopy.ts` (or new `literacyCopy.ts`)
- `frontend/src/components/LiteracyCoach.tsx` (new)
- `frontend/src/app/profile/page.tsx`
- `frontend/src/app/soul/page.tsx`
- Optional: tiny assert script under `frontend/scripts/` if Ship Gate wants a deterministic check

### Effort guess

~0.5–1 FE day including copy polish + Ship Gate FE-only.

---

## 10. Follow-up (Opt 2 — not this ship)

**Progressive reveal on the Bodygraph:** first Chart opens walk Defined centers → channels → hanging gates with short tooltips; Soul gets a mini dual-aura explainer before cards. Depends on Opt 1 dismiss patterns and legend vocabulary staying stable. Tracked in backlog P1 as follow-up to this file.

---

## Open questions (resolved at build)

1. Auto-expand: first visit only per `baseline.literacy.*.v1`; bump key to `v2` to re-show after major IA.
2. Chart step 6: scroll to `#deep-dive` **and** switch domain to **Core** via `onJump` meta (`deepDiveTab: "core"`). Domain chips in Opt 2 can refine later.
3. Soul coach: **above hero** (this spec’s default) — implemented.
