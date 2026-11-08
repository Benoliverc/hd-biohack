# Soul Open-layer match — current build (signed off)

**Date:** 2026-11-08, 11:28 PM Asia/Hong Kong
**Signed off by:** Benjamin, answering widget t525s2408 in chat (t526u) — “Approve a future Soul-only Open-layer match pass with confirmation to rename charge title to Strong pull between you for Today Move consistency”
**Research Page:** https://cursor.com/canvas/store-f5d34951-c924-450e-b54b-b19b5400da0d/23579ac2-a8e7-4d16-8304-90b67c8b6a8f
**canvas_id:** `23579ac2-a8e7-4d16-8304-90b67c8b6a8f`
**Research markdown:** `/workspace/reports/soul-language-review-2026-11-08.md`
**This file is the source of truth for the build.**

## Intent

Soul-only language pass after PR #86. Chart already feels clearer because its open layer matches its teasers. Soul’s closed teasers and Signature titles were rewritten in #86, but when chapters open, Spectrums labels, Playbook ledes, badges, and some chrome still read like an HD textbook.

**Approach: Open-layer match.** Align every opened Soul chapter (and Pro gate chrome) with the everyday words already used in closed teasers — same Meaning-first, term-second system. No IA, scoring, mechanics, or color change.

Benjamin also signed off renaming the partner Aura Signature title and chip so they match friend mode and Today Move consistency (no “charge”).

## Voice rules

1. Lead with what it means for this pair’s day, body, or closeness.
2. Official HD terms stay as a secondary label or inside Learn more / Why / badge detail — NHS-style: plain first, term second.
3. Opened titles, bar labels, high/low labels, summaries, Playbook title/ledes/hints, badge display titles, loading line, chapter teasers, and Pro-gate chrome must be readable with zero HD background.
4. Keep scoring ids unchanged (`auric_charge`, `circuit_continuity`, `somatic_pacing`, signature ids, badge ids).
5. Conversational active voice; short sentences; “you / this pair”.
6. No scores, soulmate / twin-flame / destiny language, or compatible/incompatible ratings.
7. Do not reintroduce first-layer “charge”, “voltage”, “auric”, “circuitry”, “somatic”, “hygiene”, “Highest-signature”, or stacked gate-code titles.
8. Dual-prompt locked strings stay verbatim. Gold Generator+Projector hook stays verbatim.

## Scope

- Soul-only (+ Pro gate i18n strings under `gate.soul.*` that users see on `/soul`).
- Partner and friend together (they share Spectrums / Playbook / badges).
- Frontend display maps where possible; backend display strings that users actually see (Spectrums, Playbook ledes/hints/title, badge labels, easy-pacing fallback) must change too.
- Expect **Vercel AND Railway** (FE + BE).
- Locales: lock EN below; update DE / ES / NL / FR to the same everyday meaning (not leftover jargon translations of “Ladung / charge / voltage”).

## Out of scope

- Chart Deep Dive essays and Chart snapshot lines.
- Dual-prompt locked copy.
- Gold Generator+Projector hook: `One of you is the steady yes. The other is the one who sees what that yes is for. That is the heat — and the care — in a Generator with a Projector.`
- Chapter Map IA, scoring, colors, mechanics.
- Love chapter rewrite beyond what #86 already glossed (do not reopen Love IA).
- Internal comments in `soul_sync.py` may mention Auric Charge as section names; user-visible strings must not.
- Do not show “Highest signature” anywhere.

## Locked partner Signature rename (signed off)

File: `frontend/src/components/soul/partnerSignatureCopy.ts` (`magnetic_alchemy`) and fallback in `frontend/src/app/soul/page.tsx`.

| Field | Before | After (lock) |
| --- | --- | --- |
| title | The charge between you | Strong pull between you |
| chip | Strong charge | Strong pull |
| page.tsx fallback | `partnerCopy.chip \|\| "Strong charge"` | `partnerCopy.chip \|\| "Strong pull"` |

Keep the existing partner hook, body, and collapsed Why verbatim:

- hook: `Have you noticed how the air changes when you're in the same room?`
- body: `Closeness arrives fast here — and so does intensity. Pace that heat: say when you need the room, and don't make big calls in the middle of it.`
- why: `Electromagnetic completion, Intimacy channel 59-6, or a mutual Split-to-Single bridge.`

Friend-mode `magnetic_alchemy` already uses title `Strong pull between you` and chip `Strong pull` — do not change friend copy except if a leftover “charge” remains (it should not). Other partner titles stay: When you become one current / The quiet fit / Heat that grows you / A wide-open field.

## Locked Spectrums (open layer)

Ids stay `auric_charge`, `circuit_continuity`, `somatic_pacing`. Match the closed teaser already shipped: `Pace · steadiness · intensity for this pair`.

### Labels

| id | Field | Before | After (lock) |
| --- | --- | --- | --- |
| auric_charge | label | Auric Charge | Intensity |
| auric_charge | low_label | Independent Calm | Calmer |
| auric_charge | high_label | High-Voltage Lock | High intensity |
| circuit_continuity | label | Circuit Continuity | Steadiness |
| circuit_continuity | low_label | Independent Islands | More separate |
| circuit_continuity | high_label | Unified Single Flow | One loop |
| somatic_pacing | label | Somatic Pacing Style | Pace |
| somatic_pacing | low_label | Effortless Cruise | Easy pace |
| somatic_pacing | high_label | Active Co-Regulation | Needs pacing |

### Summaries

**Intensity (`auric_charge`)**

- High (≥60): `You stir each other strongly — lots of shared momentum. Plan rest so the intensity does not run the day.`
  - was: `High-voltage activation — catalytic spark, shared momentum, and amplified nervous system output.`
- Mid (≥30): `You stir each other noticeably — with room to breathe.`
  - was: `Moderate auric charge — noticeable spark with room to breathe.`
- Low: `Each of you stays more yourself — spark shows up in selected moments.`
  - was: `Calmer field — independent baselines with selective ignition points.`

**Steadiness (`circuit_continuity`)**

- High (≥60): `Together, thoughts and moves often feel like one loop — in Human Design, more continuous circuitry.`
  - was: `You complete each other's circuitry — thoughts, emotions, and actions wire into a single continuous loop.`
- Mid (≥30): `Some parts of life flow as one; other parts you still handle separately.`
  - was: `Partial circuit completion — some bridges, some islands.`
- Low: `You connect by choice more than by a constant loop.`
  - was: `Mostly independent islands — connection through choice, not circuitry.`

**Pace (`somatic_pacing`)**

- High (≥60): `This pair goes deep. Slow big decisions, and take time alone after intense time together.`
  - was: `High-depth connection that thrives on intentional pacing, emotional wave surfing, and solo aura recovery.`
- Mid (≥30): `Agree on pace before you push a decision.`
  - was: `Some co-regulation helps — name pace before pushing decisions.`
- Low: `Pace looks easy on paper — still take time alone after busy or intense days.`
  - was: `Effortless cruise on paper — still protect solo aura after high-charge days.`

Put any leftover HD driver names (electromagnetic, hanging_bridge, etc.) only in driver metadata / Learn more, not in these labels or summaries.

## Locked Playbook

### Card title

- Before: `Tailored Somatic Playbook`
- After: `Body-first playbook`

### Focus hints

| context | Before | After (lock) |
| --- | --- | --- |
| life | Lead with pacing & intimacy protocols | Lead with pace and how you get close |
| work | Lead with circuit bridge and role clarity | Lead with who holds which theme, and clear roles |
| play | Lead with spark, joy, and recovery | Lead with joy, spark, and recovery |

### Ledes (all 15 — lock verbatim)

**magnetic_alchemy**

- life: `Closeness runs hot here. Prioritize consent, wait for feelings to settle before big calls, and take solo wind-down after contact.`
- work: `Use the strong pull for short, clear work bursts. Agree roles before you brainstorm, and end on time so you can both reset.`
- play: `Play hard, then recover harder. Share something new, then take space before sleep. Skip one more deep talk when feelings are low; pick joy when you both feel ready.`

**integrated_flow**

- life: `You often move as one — great for shared direction, risky if you lose your own north. Check in on what is yours and what is ours. Protect time that still belongs to each of you alone.`
- work: `Use the shared flow to ship work: one list, clear owners, a shared aim. Also work alone sometimes so each of you can think without the other in the room.`
- play: `Choose rest that keeps you close without turning into more work — walks, music, low-stakes making. Give that energy a playground, then step apart so the loop can idle.`

**harmonic_sanctuary**

- life: `This is a low-friction bond. Lean into comfort — food, presence, care — and name needs before resentment. The ease fades when you assume the other already knows.`
- work: `Favor a steady rhythm over heroic sprints. Similar decision styles help — still write agreements so familiarity does not skip the details.`
- play: `Rest together without optimizing. Familiar play, same café, quiet parallel presence. Novelty is optional; feeling safe is the point.`

**catalytic_growth**

- life: `You grow each other, and you also collide. Name the tender spots early, and celebrate growth without turning every evening into a workshop.`
- work: `This is a high-momentum pair — name each person's strengths out loud, and schedule time to clear friction. Dense time together burns out teams that never separate.`
- play: `Alternate intensity with empty space. Competitive play or skill quests fit; add real recovery so the push does not become constant activation.`

**spacious_explorers**

- life: `This field needs room to breathe. Design closeness around choice and novelty, not a constant merge. Notice what actually lights you up; do not force a high-intensity script.`
- work: `Collaborate through experiments and changing environments. Keep ownership clear, because open pairs can blur who decides.`
- play: `Explore. New places, light plans, easy exits. Space is the chemistry; crowding the calendar kills it.`

### Easy-pacing fallback body (when no protocols)

Before (mentions sacral, double-wave, charge, solo aura). After (lock):

`Pace looks easy on paper — fewer built-in speed clashes — and that can lull a pair into skipping recovery. Quiet days still add up after late nights, travel, and busy social time. Habit: protect time alone after intense days anyway, and treat "we feel fine" as a cue to book the buffer before you need it.`

Use the same straight/curly quote style as surrounding Python strings in that file.

## Locked badge display titles

Keep ids and keep detail/description as secondary (detail may still name gates). First-layer `label` must change:

| id | Before | After (lock) |
| --- | --- | --- |
| mutual_split_bridge | Mutual Split-Bridge (Single Flow) | You bridge each other's gaps (Split→Single) |
| shared_compass | Shared Compass Unlocked (G-Center Defined) | You find direction together (G Center) |
| intimacy_lock | Intimacy & Creative Lock (59-6) | Closeness runs strong here (59-6) |
| integration_triad | Integration Triad (10-20-34) | Identity, voice, and drive link as one (10-20-34) |
| tribal_bond | Tribal Bond (Shared 19-49) | You look after each other's needs (19-49) |
| mirror_gates | Mirror Gates (Shared Hanging Gates) | You share the same open themes |
| composite_8_1 | 8-1 "Have Some Fun" Composite | Almost fully on together — leave one space (8-1) |
| composite_9_0 | 9-0 "Full Circuit" Composite | Fully on together — plan time apart (9-0) |

`BADGE_DESCRIPTIONS` bodies may stay as depth copy (they already explain). Do not let those descriptions replace the new labels in the UI.

## Locked chrome

| Surface | Before | After (lock) |
| --- | --- | --- |
| Loading (`soul/page.tsx`) | Reading aura mechanics… | Reading how your charts meet… |
| Centers teaser | You vs them per center — how this is read | Who brings which always-on theme |
| `gate.soul.spectrums` (en) | Spectrums for charge, continuity, and pacing style | Spectrums for intensity, steadiness, and pace |
| `gate.soul.playbook` (en) | Playbook cards + Literacy Coach for this relationship | Playbook cards and a simple guide for this relationship |

`gate.soul.signature` may stay `Aura Signature for this pair — how your charts wire together` (product name). Optional light polish only if you are already in that file: `Aura Signature for this pair — how your charts meet`. Not required.

Soul literacy coach in `frontend/src/lib/hdCopy.ts` (Soul-only items):

| Field | Before | After (lock) |
| --- | --- | --- |
| wire-somatic title | Somatic playbook + Wire | Body-first playbook + how you wire |
| wire-somatic jumpLabel | Somatic playbook | Body-first playbook |

Do not rewrite the already-plain `wire-somatic` body, and do not touch Chart/Today literacy essays.

Closed teasers already shipped in #86 stay:

- Spectrums teaser: `Pace · steadiness · intensity for this pair`
- Channels teaser: `Where you spark and where you share a baseline`
- Empty channels: `No spark wires or shared-baseline channels for this pair yet.`

## Dual prompt (do not change)

- Empty body: `Add someone to explore the aura between both of you.`
- Empty one-liner: `Save their natal on Chart — Soul uses it as the other half of the pair.`
- Empty button: `Add a person on Chart`
- Person hint: `Want Love guidance with {FirstName}? Mark them as Partner — it opens a quieter love chapter. It doesn’t score the bond.`
- Person button: `Mark as Partner`
- Partner-on: `Love guidance is on because you marked {FirstName} as Partner.`
- Quiet add: `Add person`

## Success criteria

1. Opening Spectrums shows Intensity / Steadiness / Pace (and matching high/low labels) — consistent with the teaser.
2. No user-visible first-open-layer “Auric Charge”, “Circuit Continuity”, “Somatic Pacing Style”, “High-Voltage Lock”, “Highest-signature”, “Tailored Somatic Playbook”, “The charge between you”, or “Strong charge”.
3. Partner magnetic title is `Strong pull between you` and chip is `Strong pull`.
4. Playbook first sentence is a do-this in everyday language.
5. Badge titles are everyday-first; gate codes / HD names are secondary in parentheses or detail.
6. Loading line is `Reading how your charts meet…`
7. Centers teaser is `Who brings which always-on theme`
8. Dual prompt + gold hook unchanged.
9. Scoring ids, chapter IA, and mechanics unchanged.
10. Existing Soul asserts still pass (`assert-soul-chapter-map`, `assert-soul-dual-prompt`) plus any string-assert updates this copy requires. Update `test_soul_sync.py` (and any frontend tests) that snapshot old labels.

## Ship path

1. Open one PR from current `main` (after #86, SHA `aff0079c44284b8294628d0f9998a58c1572b79d` or later main).
2. Suggested title: `feat(soul): open-layer match plain language`
3. Do not merge. Report the PR number and tip SHA back to Grok Bot.
4. UX UI Review then Ship Gate QA will run after the PR is open. Benjamin merge-yes comes after dual-gate green.

## Files likely involved

- `frontend/src/components/soul/partnerSignatureCopy.ts`
- `frontend/src/app/soul/page.tsx` (loading, chip fallback, Centers teaser)
- `frontend/src/lib/i18n/messages/{en,de,es,nl,fr}.ts` (`gate.soul.spectrums`, `gate.soul.playbook`)
- `frontend/src/lib/hdCopy.ts` (Soul literacy `wire-somatic` title/jumpLabel only)
- `backend/app/hd/soul_sync.py` (PLAYBOOK_LEDES, PLAYBOOK_FOCUS_HINTS, badge labels, Spectrums labels/summaries, playbook title, easy-pacing fallback)
- Tests that snapshot any of the before-strings

## Build status (Full Stack — do not merge yet)

- **Branch:** `feat/soul-open-layer-match`
- **Base:** `aff0079c44284b8294628d0f9998a58c1572b79d` (main after PR #86)
- **Tip:** `d3c408fe0271125082ff0a4891eaf1bbd3cc7b70`
- **PR:** (filled after create)
- **FE+BE:** Yes — backend `soul_sync.py` Spectrums / Playbook / badges / easy-pacing + frontend partner title, chrome, i18n, literacy titles.
- **Friend copy:** unchanged (`friendSignatureCopy.ts`)
- **Preview:** not started
- **Do not merge** — Grok Bot routes UX → Ship Gate, then asks Benjamin.
