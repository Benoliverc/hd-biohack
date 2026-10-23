# P0 — Soul Signature copy + Playbook differentiation + Badge descriptions

**Status:** Ready for `@dev` (spec + copy — implement next)  
**App:** Baseline (hd-biohack)  
**Route:** `/soul`  
**Date:** 2026-10-23 (Asia/Hong_Kong)  
**Live:** https://hd-biohack.vercel.app/soul  
**Repo:** https://github.com/Benoliverc/hd-biohack  

**Related:** `soul-aura-alchemy-spec.md` (P0 ship), `ship-soul-signature-magnetic-fix.md` (PR #19 EM threshold).  
**Does not change:** Signature detection rules / `MAGNETIC_EM_MIN` / badge detectors (unless noted for `detail` enrichment).

---

## User feedback (2026-10-23)

After Magnetic threshold fix (#19), Aura Signatures now diversify (Magnetic / Integrated / Catalytic, etc.), but:

1. **Playbook** tabs (Life & Intimacy / Work & Co-Creation / Play & Recovery) still feel **identical** across friend pairs and signatures — user expects content to **differ by Aura Signature** (and ideally pair mechanics).
2. **Aura Signature** card (e.g. Magnetic Alchemy): mark Magnetic as the **highest** signature; roughly **triple** the explanation length.
3. **Every badge/label** under the signature needs a **deeper description underneath** (not hover-only). Example: what does “Intimacy & Creative Lock (59-6)” mean?

---

## Root cause — why Playbooks look identical

This is **not** a stale cache or #19 regression. It is **by design in the Aura Alchemy P0 cut**, plus one FE visibility gap.

### 1. Playbook = reorder only (documented)

| Layer | Behavior |
|---|---|
| Backend | `PLAYBOOK_CARD_ORDER` in `soul_sync.py` — only changes `playbook.card_order` |
| FE | `CARD_ORDER` in `frontend/src/app/soul/page.tsx` — client reorder of the **same** four cards |
| Copy | Explicit UI: *“Reorders insight cards only — signature and spectrums stay the same.”* |
| Spec | `soul-aura-alchemy-spec.md` § Playbooks: *“Playbook only changes `card_order`… Spectrums/signature/badges are context-invariant in P0”* |
| Tests | `test_soul_sync.py` asserts life/work/play share identical badges/signature/spectrums and same card **ids** |

Switching Life ↔ Work ↔ Play therefore shows the **same paragraphs in a different order**. Users correctly perceive “exactly the same.”

### 2. Insight cards ignore `signature.id` and almost ignore `context`

`build_cards(...)` (`soul_sync.py` ~745–1017) keys off:

- channel roles (EM / companionship / dominance / compromise)
- badge_ids (shared_compass, mutual_split_bridge, …)
- type / profile / authority pair flags

It does **not** receive `signature` or use `context` for body text. So:

- Magnetic Alchemy vs Catalytic Growth vs Integrated Flow can render **near-identical** card essays when role lists overlap.
- Across friends, cards *do* change when mechanics differ (e.g. sacral asymmetry protocol appears), but there is **no signature-framed lede** that makes the Playbook section feel signature-specific.

### 3. Badge `detail` exists but is invisible as body copy

API already returns `badges[].detail` (short strings like `"Electromagnetic Intimacy"`).  
FE renders badges as pills with `title={b.detail}` only (`page.tsx` ~394–403) — **tooltip, not under-label description**. User asked for visible deeper text under each label.

### Exact fix loci (for @dev)

| Fix | File / symbol |
|---|---|
| Longer signature subtexts + Magnetic “highest” flag | `SIGNATURES` in `backend/app/hd/soul_sync.py` (~37–83); optional `rank` / `tier` field on signature object |
| Richer badge descriptions | `detect_badges` detail strings (~394–508) **or** new `description` field; keep short `detail` for mechanics if useful |
| Playbook content by signature (+ context) | New helper e.g. `build_playbook_lede(signature_id, context, badge_ids)` called from `compute_soul_sync`; extend `SoulPlaybookOut` |
| Optional: signature-flavored card intros | Pass `signature["id"]` + `context` into `build_cards` and prepend one context-aware block |
| FE: show badge descriptions | `frontend/src/app/soul/page.tsx` badge row — stack label + description |
| FE: drop / rewrite “reorder only” helper | Same file ~329–331 and conditioning footnote ~462–463 |
| Types | `backend/app/schemas.py` (`SoulSignatureOut`, `SoulBadgeOut`, `SoulPlaybookOut`); `frontend/src/lib/api.ts` |
| Tests | Update playbook-invariance test: signature/spectrums still invariant; **lede + card framing may vary by context**; add signature×context lede snapshots |

---

## Current signature enum (5 — not 3)

Priority order in `detect_signatures` (first match = primary):

| Priority | `id` | Label | Emoji | Notes |
|---|---|---|---|---|
| 1 | `magnetic_alchemy` | Magnetic Alchemy | ⚡ | **Highest / rarest tier** — call out in copy + UI |
| 2 | `integrated_flow` | Integrated Flow Circuit | 🧬 | |
| 3 | `harmonic_sanctuary` | Harmonic Sanctuary | 🌿 | |
| 4 | `catalytic_growth` | Catalytic Growth Engine | 🔥 | Label may show as “Catalytic Growth” in conversation; keep full API label |
| 5 | `spacious_explorers` | Spacious Co-Explorers | 🌊 | Fallback |

Prod pairs after #19 commonly surface Magnetic / Integrated / Catalytic; Harmonic and Spacious remain in the enum and must get the same copy treatment.

---

## Layer A — Signature copy (replace `SIGNATURES[].subtext`)

Target length: ~3× current (~90–100 chars / ~12 words → **~280–360 chars / ~40–55 words**, 3–5 sentences).  
Tone: Grounded Vitality / Oura-style; empowering; no dating chrome; no Fit %.

### `magnetic_alchemy` — Magnetic Alchemy ⚡ (highest)

**UI chip (required):** show a small pill next to the title, e.g. `Highest signature` or `Highest · rarest lock` (FE can hardcode when `signature.id === "magnetic_alchemy"` **or** read `signature.tier === "highest"` from API).

**subtext (paste-ready):**

> This is Baseline’s highest Aura Signature — the rarest high-voltage lock we grade. Your charts complete each other through dense electromagnetic charge, an Intimacy lock (59-6), and/or a mutual Split→Single bridge, so the field feels catalytic rather than casual. Expect amplified vitality, faster bonding chemistry, and a nervous system that lights up in each other’s aura. Treat the charge as fuel with protocols: name pace, protect solo recovery, and let decisions wait when Emotional waves are high. This is transformation chemistry, not a compatibility score.

**Optional API fields:**

```json
{ "id": "magnetic_alchemy", "label": "Magnetic Alchemy", "emoji": "⚡",
  "tier": "highest", "tier_label": "Highest signature",
  "subtext": "<above>" }
```

### `integrated_flow` — Integrated Flow Circuit 🧬

> Your separate energy islands snap into one continuous circuit when you are together. Split definitions resolve toward Single flow, and/or the Integration Triad (10-20-34) wires identity, expression, and sacral power across the pair. Thoughts, direction, and action start looping as one field instead of two parallel graphs. Protect the gift by noticing when you lose your own north inside the shared current — step out of aura regularly so the composite does not become fusion. Use this signature for co-creation and long-form building, not only for intensity.

### `harmonic_sanctuary` — Harmonic Sanctuary 🌿

> This field feels familiar before either of you explains why. Companionship channels and shared authority class create low-friction rhythm — tribal or emotional pacing that needs less negotiation than high-EM pairs. Unspoken understanding is the feature; boredom or assumed consent is the shadow. Keep the sanctuary honest by naming needs early instead of relying on “we just get it.” Ideal for recovery days, household cadence, and work that rewards steadiness over spark.

### `catalytic_growth` — Catalytic Growth Engine 🔥

> This pairing is built for rapid expansion, not soft cruise control. A dense composite (8 or 9 defined centers) plus compromise and/or dominance density creates a developmental mirror with high momentum and frequent thermostat collisions. Growth comes from tuning power dynamics — who holds the full channel, who adapts — without shaming either role. Schedule recovery as seriously as the push: Active Co-Regulation is a strength here, not a defect. Use Life playbook for intimacy pacing; Work playbook for role clarity.

### `spacious_explorers` — Spacious Co-Explorers 🌊

> Your composite stays relatively open, so the field stays breathable and low-conditioning. Chemistry thrives on novelty, changing environments, and chosen connection rather than locked circuitry. Do not mistake space for weak bond — this signature prefers fluidity over fusion. Design dates, projects, and recovery around movement and fresh context. When you want more charge, look to the Spark & Glue card for selective ignition points instead of forcing a Magnetic-style lock.

---

## Layer B — Badge deeper descriptions

**API:** Prefer adding `description` (1–3 sentences, user-facing) while keeping short `detail` for mechanic crumbs if tests rely on it.  
**FE:** For each badge, render:

```
[label pill or bold label]
description paragraph (text-sm text-fg-secondary)
optional tiny mechanic line from detail (text-xs text-fg-muted) — optional
```

Do **not** leave description in `title=` only.

### Paste-ready `description` by `id`

#### `mutual_split_bridge` — Mutual Split-Bridge (Single Flow)

> Separately you each run Split (or multi-split) definition — islands of energy that do not fully connect on your own. Together, hanging gates complete across the pair and the composite resolves to Single definition: one continuous flow. That is why time in the same aura can feel clarifying or addictive; the circuit literally closes. Practice leaving the room (or the call) so each person remembers their solo graph.

**Keep/enrich `detail`:** existing bridge gate list is fine (`Split + Split → Single · you←them: …`).

#### `shared_compass` — Shared Compass Unlocked (G-Center Defined)

> Neither of you has a defined G-Center alone, so identity and direction can feel open or environmentally pulled. In composite, Gate bridges define the G together — a shared “true north” and sense of place that neither holds solo. Beautiful for partnership and co-vision; risky if you outsource “who I am” to the pair. Check your own compass after intense time together.

#### `intimacy_lock` — Intimacy & Creative Lock (59-6)

> Electromagnetic Channel 59-6 (Intimacy) means each of you holds one half of the sacral–emotional intimacy circuit; together the channel closes. This is creative and sexual/relational chemistry in HD terms — fertility of ideas and bonding, not a moral grade. Expect heat, fertility of projects, and thin skin around rejection. Name consent and recovery explicitly; do not treat the lock as permanent permission.

#### `integration_triad` — Integration Triad (10-20-34)

> Gates 10, 20, and 34 weave Awakening (10-20) and Exploration (10-34) — and with 20-34, Charisma — so identity, voice, and sacral power integrate across the pair. One person’s Gate 10 often meets the other’s 20-34 (or the composite forms the triad neither held alone). The field can feel highly capable and “on.” Watch for burnout: integrated does not mean always-on.

#### `tribal_bond` — Tribal Bond (Shared 19-49)

> Companionship on Channel 19-49 (Synthesis) is shared tribal sensitivity — needs, resources, and emotional support frequency. You both already carry the full channel, so comfort, food, and “are we okay?” themes feel native. Lean into tactile care on low Emotional waves; avoid turning every need into a crisis meeting.

#### `mirror_gates` — Mirror Gates (Shared Hanging Gates)

> You share hanging gates in centers that are open for both of you — the same open receptors looking for completion. That can feel like instant recognition (“you get this exact itch”) and also like mutual amplification of the same conditioning themes. Use the listed gates as mirrors: ask whose story is running before you both spiral.

#### `composite_8_1` — 8-1 “Have Some Fun” Composite

> Together you define eight of nine centers — a nearly full circuit with one open center as the pressure-release valve. Classic HD composite lore frames 8-1 as “have some fun”: high capability with a reminder not to take the bond as total identity. Honor the open center; over-defining the last gap invites exhaustion.

#### `composite_9_0` — 9-0 “Full Circuit” Composite

> All nine centers define in composite — maximum circuitry and conditioning density when together. Powerful for building and immersion; easy to lose solo aura hygiene. Schedule deliberate separation so the full circuit does not become the only way either of you feels “online.”

### Secondary signature (“Also: …”)

Secondary is a second **signature**, not a badge. FE today shows only `Also: {label}`.  
**Required:** when `secondary_signature` is present, show its **full subtext** (same long copy as primary would use) under the “Also” pill, or a one-line pointer: “Also carries {label}: {first sentence of subtext}.”

---

## Layer C — How Playbooks must vary (P0.5 / this ship)

### Product intent (user)

Life / Work / Play should **not** be a silent reorder. Content should feel different by:

1. **Primary Aura Signature** (required)
2. **Context** life | work | play (required)
3. **Pair mechanics already available** (reuse badges / roles / protocols — already partially in cards)

### Minimal architecture (preferred — smallest diff)

Add to API response:

```json
"playbook": {
  "id": "life",
  "label": "Life & Intimacy",
  "card_order": ["somatic_playbook", "power_dynamics", "circuit_bridge", "spark_glue"],
  "lede": "…2–4 sentences…",
  "focus_hint": "Lead with pacing & intimacy protocols"
}
```

- `lede` = `PLAYBOOK_LEDES[signature_id][context]` (15 cells: 5 signatures × 3 contexts).  
- FE: render `playbook.lede` in a callout **above** the ordered cards whenever result is shown; update when context or friend changes.  
- Keep card_order as today.  
- Optionally prepend one signature×context block inside `somatic_playbook` or `circuit_bridge` via `build_cards(..., signature_id=..., context=...)`.

### Why not “only reorder” anymore

Original P0 cut deferred content variance. User feedback makes signature×context ledes **in scope now**. Reorder alone fails AC.

### Playbook lede table (paste-ready)

Use these exact strings (or tighten slightly for length; do not collapse to one shared paragraph).

#### Magnetic Alchemy (`magnetic_alchemy`)

| Context | `lede` |
|---|---|
| `life` | Highest-signature intimacy field. Prioritize consent, Emotional-wave timing, and solo wind-down after contact. Use Sacral/Non-Sacral hygiene if present, and treat 59-6 heat as creative fuel you both steward — not as proof you must merge calendars. |
| `work` | Channel the magnetic charge into short, high-clarity collaboration bursts. Define roles before brainstorming so EM spark does not become meeting chaos. End sessions with a hard stop so borrowed sacral/ego charge can discharge. |
| `play` | Play hard, recover harder. Prefer novel shared experiences that burn the charge cleanly, then separate auras before sleep. Avoid “one more deep talk” at wave bottom; schedule joy when both authorities say yes. |

#### Integrated Flow (`integrated_flow`)

| Context | `lede` |
|---|---|
| `life` | You wire into one continuous circuit — beautiful for shared direction, risky for fused identity. Practice “my north / our north” check-ins. Protect the open spaces that still belong to each person alone. |
| `work` | Use the Single-flow composite for shipping and systems work: one backlog, clear owners, shared True North if G unlocked. Break the circuit with async solo deep work so Split individuals can think without the bridge. |
| `play` | Choose recovery that keeps flow without forcing productivity — walks, music, low-stakes making. The triad wants expression; give it a playground, then step out of aura so the loop can idle. |

#### Harmonic Sanctuary (`harmonic_sanctuary`)

| Context | `lede` |
|---|---|
| `life` | Low-friction bond: lean into companionship comfort (food, presence, tribal care) and name needs before resentment. Sanctuary dies when assumed telepathy replaces requests. |
| `work` | Favor steady cadence over heroic sprints. Shared authority class helps decision rhythm — still write agreements so familiarity does not skip scope. |
| `play` | Rest together without optimizing. Familiar play, same café, quiet parallel presence. Novelty is optional; safety is the feature. |

#### Catalytic Growth (`catalytic_growth`)

| Context | `lede` |
|---|---|
| `life` | Developmental mirror with thermostat collisions. Tune compromise channels early (Struggle, Recognition, etc.) and celebrate growth without turning every evening into a workshop. |
| `work` | High momentum pair — assign dominance gifts as explicit strengths and schedule conflict reviews. Dense 8-1/9-0 composites burn out teams that never separate. |
| `play` | Alternate intensity with empty space. Competitive play or skill quests fit; add mandatory recovery blocks so Active Co-Regulation does not become chronic activation. |

#### Spacious Co-Explorers (`spacious_explorers`)

| Context | `lede` |
|---|---|
| `life` | Breathable field — design intimacy around choice and novelty, not locked circuitry. Check Spark & Glue for selective ignition; do not force a Magnetic script. |
| `work` | Collaborate through experiments and changing environments. Keep ownership clear because open composites dilute “who decides.” |
| `play` | Explore. New places, light plans, easy exits. Space is the chemistry; crowding the calendar kills it. |

### Pair-specific hooks (already available — keep using)

Do not replace card mechanics; **layer** ledes on top:

| Hook | Source | Card / protocol |
|---|---|---|
| Sacral ↔ non-Sacral | `sacral_asymmetry` | `somatic_playbook` / sacral_aura_hygiene |
| Double Emotional | authorities | double_emotional protocol |
| Profile pair | profiles | profile_resonance |
| EM / companionship / dominance lists | `channel_roles` | `spark_glue` |
| Compromise thermostats | compromise roles | `power_dynamics` |
| Bridges / True North / Split→Single | badges | `circuit_bridge` |

Cards should continue to differ by pair; ledes make signature+playbook difference obvious even when two pairs share similar protocols.

---

## FE acceptance UX

1. **Hero:** Signature emoji + label; if Magnetic, visible **Highest signature** chip; long subtext (~3×).  
2. **Also:** secondary label + readable subtext/description (not label-only).  
3. **Badges:** each badge shows label + 1–3 sentence `description` underneath (stack or definition list — not tooltip-only).  
4. **Playbook:** Life/Work/Play switch updates `lede` + card order; user can tell contexts apart without scrolling only for order.  
5. **Friends:** changing friend changes signature and/or lede and/or cards; no two distinct signatures share identical lede text.  
6. Remove or rewrite helper copy that says playbooks “only reorder.”

Suggested replacement helper:

> Playbook reframes guidance for Life, Work, or Play. Signature and spectrums stay for this pair; the focus blurb and card order change.

---

## Acceptance criteria (@qa)

1. Magnetic Alchemy hero includes explicit highest/rarest framing (chip and/or first sentence).  
2. All five signature subtexts are ≥ ~35 words (≈3× prior).  
3. Every emitted badge renders a visible multi-sentence description under its label; tooltip-only is insufficient.  
4. Descriptions exist for all eight badge ids (including 9-0 even if rare).  
5. Switching Life / Work / Play changes visible `playbook.lede` for the same pair.  
6. Same person + three friends with different primary signatures → three different lede sets (at least for the active context).  
7. Card mechanical content still varies with pair roles/protocols (regression: sacral hygiene still appears for Sacral↔non-Sacral).  
8. Signature detection thresholds unchanged (`MAGNETIC_EM_MIN = 5`, priority order intact).  
9. No Fit % fields reintroduced.  
10. `pytest tests/test_soul_sync.py` updated + green; FE typecheck clean.

---

## Files to touch

| Path | Change |
|---|---|
| `backend/app/hd/soul_sync.py` | `SIGNATURES` subtexts; optional `tier`; badge `description`; `PLAYBOOK_LEDES`; `build_playbook_lede`; wire in `compute_soul_sync`; optionally pass signature/context into `build_cards` |
| `backend/app/schemas.py` | `SoulSignatureOut.tier?`, `SoulBadgeOut.description?`, `SoulPlaybookOut.lede` / `focus_hint` |
| `backend/tests/test_soul_sync.py` | Subtext length / Magnetic tier; badge description present; lede varies by context & signature; relax “cards identical across context” if intros added |
| `frontend/src/lib/api.ts` | Mirror new fields |
| `frontend/src/app/soul/page.tsx` | Highest chip; long subtext; badge descriptions; playbook lede; helper copy |
| `.grok-handoff/soul-aura-alchemy-spec.md` | Short amend: playbooks now include signature×context lede (optional follow-up edit) |
| `.grok-handoff/backlog.md` | Move this item under Active / note P0.5 |

**Out of scope:** LLM narratives; changing detection math; dual BodyGraph; persisting playbook choice.

---

## Suggested @dev brief (copy into task)

1. **Root cause:** Playbooks are reorder-only; `build_cards` ignores `signature.id`/`context` for framing; badge `detail` is tooltip-only — see this spec.  
2. **Ship:** (a) 5 long signature subtexts + Magnetic `Highest signature` chip/tier; (b) visible `description` under every badge id; (c) `playbook.lede` matrix 5×3 wired in API + FE.  
3. **Touch:** `soul_sync.py`, `schemas.py`, `test_soul_sync.py`, `api.ts`, `soul/page.tsx`.  
4. **Do not** change `detect_signatures` thresholds or badge detection predicates.  
5. **AC:** Magnetic marked highest; subtexts ~3×; badges readable without hover; Life/Work/Play ledes differ; friend/signature change changes lede; pytest + tsc green.  
6. **Verify locally:** Me↔Test (Catalytic), Me↔Achi (Integrated), Me↔K (Magnetic) on `/soul` — Playbook blurb + badge essays clearly different.

---

## PO one-liner

Playbooks look identical because P0 only reordered four shared cards and hid badge essays in tooltips; this handoff adds Magnetic-as-highest long copy, under-badge descriptions, and signature×context playbook ledes so `/soul` reads differently per friend and per Life/Work/Play without touching detection math.
