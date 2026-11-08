# Chart & Soul plain-language — current build (signed off)

**Date:** 2026-11-08 (Asia/Hong Kong)
**Signed off by:** Benjamin, widget t517s2366 — “Yes, build Chart and Soul language together”
**Research Page:** https://cursor.com/canvas/store-f5d34951-c924-450e-b54b-b19b5400da0d/7a2b1e2d-9fcb-4394-b0ea-36972c991479
**canvas_id:** `7a2b1e2d-9fcb-4394-b0ea-36972c991479`
**Research markdown:** `/workspace/hd-biohack/.grok-handoff/chart-soul-plain-language-brief-2026-11-08.md`
**This file is the source of truth for the build.**

## Intent

Rewrite user-visible Chart (`/profile`) and Soul (`/soul`) copy so the ~90% of users who are not Human Design experts can understand it. Apply one language system: **Meaning-first, term-second** — the same pattern as shipped Today Move (PR #85). Everyday human meaning leads; official HD names stay as a secondary label or inside Learn more / Why.

Build Chart and Soul **together in one PR** (former research phases 1–3 plus a light Partner Love gloss). Do not wait to ship Soul first.

## Voice rules

1. Lead with what it means for a person’s day, body, or relationship.
2. Keep official HD vocabulary as a secondary label so the ~10% HD-literate users still recognize it (NHS-style: plain term first, then the technical name). Do **not** hide all HD terms.
3. Titles, teasers, chips, and friend-mode Signature headlines must be readable with zero HD background.
4. Dense mechanics (hanging gates, electromagnetic / companionship / compromise / dominance roles, Split→Single, circuitry, Integration triad, PHS-adjacent jargon) go inside Learn more / Why / chapter bodies — not first-layer titles.
5. Snapshot lines stay short. Deep Dive essays stay substantial (Type/Strategy/Authority/Definition ~3× old blurbs; Profile/Channels roughly double). Clarify leads; do **not** shrink essays back to slogans.
6. Conversational active voice; short sentences; “you / your / this pair”.
7. No scores, soulmate / twin-flame / destiny language, or compatible/incompatible ratings.
8. No sky / battery / wave / crest / borrowed-fuel metaphors on Chart literacy first layer (align with Today Move bans).
9. Mechanics unchanged: Signature scoring ids, engine, `partner_overview` structure, electromagnetic/companionship classification — only the words users see.

## HD term tiers

- **Keep and explain:** Type, Strategy, Authority (Inner Authority), Profile, Centers (defined vs open), Channels, Gates, Definition.
- **Secondary (depth only):** hanging gate, bridge/conditioning, electromagnetic/companionship/compromise/dominance roles, Split/Single definition bridges, Integration triad, circuitry.
- **Avoid on first layer:** Incarnation Cross, Variables, arrows, PHS, Color/Tone/Base, DreamRave, format energy, sacral-fuel metaphor spam.

## Locked Soul copy

### Friend-mode Aura Signature (display only; ids unchanged)

Partner presentation already uses `partnerSignatureCopy.ts`. Do not change partner titles or the partner chip.

| id | Friend display title (lock) | Friend chip (lock) | Partner title (do not change) | Partner chip (do not change) |
| --- | --- | --- | --- | --- |
| `magnetic_alchemy` | Strong pull between you | Strong pull | The charge between you | Strong charge |
| `integrated_flow` | When you become one current | (match partner everyday chip if one exists; else no “Highest signature”) | When you become one current | (unchanged) |
| `harmonic_sanctuary` | The quiet fit | (same rule) | The quiet fit | (unchanged) |
| `catalytic_growth` | Heat that grows you | (same rule) | Heat that grows you | (unchanged) |
| `spacious_explorers` | A wide-open field | (same rule) | A wide-open field | (unchanged) |

Never show “Highest signature” or “Magnetic Alchemy” / “Integrated Flow Circuit” / “Catalytic Growth Engine” / “Spacious Co-Explorers” as the friend-facing title or chip.

Friend magnetic_alchemy everyday body (lock the idea; keep HD in collapsed Why):
- Body: You light each other up fast. Say when you need space, and wait to decide until you both feel steadier.
- Why (collapsed, HD-literate OK): Electromagnetic completion, Intimacy 59-6, or a mutual Split-to-Single bridge.

If `soul_sync.SIGNATURES` labels/subtexts currently power the friend path, change the **display** strings (or add a friend display map parallel to `partnerSignatureCopy.ts`). Prefer a frontend friend display map so scoring stays untouched, unless backend subtexts are what the friend UI actually renders — then update those display strings only. Internal ids stay `magnetic_alchemy`, `integrated_flow`, `harmonic_sanctuary`, `catalytic_growth`, `spacious_explorers`.

### Chapter teasers and empty states (lock)

- Channels teaser: `Where you spark and where you share a baseline` (was `Electromagnetic & companionship overlaps`)
- Empty channels: `No spark wires or shared-baseline channels for this pair yet.` (was `No electromagnetic or companionship overlaps for this pair.`)
- Spectrums teaser: `Pace · steadiness · intensity for this pair` (was `Pace · continuity · charge for this pair`)

### Soul literacy coach (lock the voice, not a slogan cut)

- “Tailored Somatic Playbook… circuit bridges… hanging half” → body-first playbook for this pair… where a half-wire meets its other side… who brings which always-on theme.
- Power Dynamics: keep the thermostat metaphor. Replace compromise/hanging gate in the **first sentence** with “one of you holds the full theme; the other holds only half.”
- Spark & Glue / circuit language in the coach first sentence → ignition when you meet; shared themes you both already hold. Put role names in Learn more.

### Partner Love guidance — light gloss only

Do **not** rewrite signed-off Love chapters (hook, The current, How you love, Decide & talk, When it’s hard). Do **not** change Dual-prompt locked strings:

- Empty body: `Add someone to explore the aura between both of you.`
- Empty one-liner: `Save their natal on Chart — Soul uses it as the other half of the pair.`
- Empty button: `Add a person on Chart`
- Person hint: `Want Love guidance with {FirstName}? Mark them as Partner — it opens a quieter love chapter. It doesn’t score the bond.`
- Person button: `Mark as Partner`
- Partner-on reason: `Love guidance is on because you marked {FirstName} as Partner.`
- Quiet add: `Add person`

Light gloss only: on first use of “inform” / “invitation” / “gut” in a Love chapter, add a short plain clause (about five words) so a beginner knows what it means. No other Love rewrite.

Partner Signature why stays collapsed. Do not promote electromagnetic / 59-6 language into the title. Do **not** rename “The charge between you” or “Strong charge”.

## Locked Chart copy (pattern + explicit strings)

Files: `frontend/src/lib/hdCopy.ts`, `hdChannelCopy.ts`, `hdProfileCombos.ts`, Chart literacy coach strings.

### Snapshot / Type summaries (lock)

- Generator: `You build best when something real lights up a gut yes. (Type: Generator)`  
  (was `Sacral energy builders who thrive by responding to life.`)
- Manifestor: `You’re built to start — and to tell the people it’ll affect before you move. (Type: Manifestor)`  
  (was `Initiators with motor-to-Throat — designed to start and inform.`)
- Rewrite the other Type snapshot lines to the same pattern (meaning first, `(Type: …)` second). Keep them short.

### Definition snapshot (lock this Split example; apply pattern to other Definition kinds)

- Split: `You run in two steady clusters that don’t fully connect on their own. Some people feel oddly completing — they temporarily bridge the gap. (Definition: Split)`  
  (was “Two separate areas of definition. Bridging gates…”)
- Other Definition summaries: lived meaning first, `(Definition: …)` second. Do not lead with “circuitry”.

### Deep Dive openers (clarify, do not shrink)

- Generator first line pattern: `You have steady work energy that turns on when life gives you something to answer — in Human Design that motor is called the Sacral.` Then the rest of the essay, ending in practice.
- Emotional authority learnMore lead: `Your clear answers arrive after feelings move, not at the high or the low. In Human Design this is Emotional authority (Solar Plexus). Sleep on big calls.`  
  (do not lead with crest/dip or “no truth in the moment” unexplained)
- Strategy / Inner Authority / Definition essay first paragraphs: same pattern. Keep length.

### Channels (lock the template)

- Lead with the human theme, not the center pair.
- Example: `Inspiration is your steady creative voice — you have something only you see, and it wants to be offered, not performed for applause.`  
  Center pair and gate code in Learn more: `(Channel 1-8 · G ↔ Throat)`.
- Apply this template across channel essays. Do not open with “consistent defined pathway” / “aim with Strategy and Authority… on-design”.

### Profile

- Snapshot: keep the Profile code short (e.g. `6/2`).
- Deep Dive: lead with everyday Role Model / Hermit (etc.), then the essay. Gloss Martyr / Heretic in everyday words inside the essay — not as the only headline.

### Chart literacy coach (lock)

- Defined / Open: `Colored shapes are Defined — always-on for you. Pale shapes are Open — you pick up the room there and can tire if you stay plugged in too long.`  
  (no “steady battery”)
- Hanging gate: `A hanging gate means you hold one end of a wire. Certain people (or certain days) can feel magnetic because they bring the other end.`  
  (no “daily sky” / battery metaphors)
- Center defined/open one-liners: always-on vs pick up the room. Term second.

Remaining Chart copy that still leads with sacral / motor-to-Throat / circuitry / conditioning / on-design in the first sentence must be rewritten to this checklist. This is a language pass, not a structure pass.

## Out of scope

- Home, Today Move, Protocols, Admin, Login, marketing (“sky” on Home/Login stays).
- Snapshot length preference and Deep Dive length targets.
- Partner Signature approved titles and chips.
- Love guidance IA; no-score / no-soulmate rules.
- Dual-prompt empty / Mark as Partner copy (verbatim).
- Signature scoring, selection, and `partner_overview` structure.
- Mechanics of electromagnetic / companionship classification.

## Deploy

Friend Signature labels/subtexts live in backend `soul_sync.SIGNATURES` and/or a new friend display map. If any backend string users see changes, this is **FE + BE → Vercel AND Railway**. If you keep scoring untouched via a frontend-only friend display map and no backend strings change, say so clearly in the PR report (then Vercel only). Default assumption: **Vercel AND Railway**, because Phase 1 expected SIGNATURES display subtexts to change.

## Verification

- No user-visible “Highest signature”, “Magnetic Alchemy”, “Integrated Flow Circuit”, “Catalytic Growth Engine”, “Electromagnetic & companionship overlaps” on Soul first layer.
- No “steady battery” / “daily sky” on Chart literacy first layer.
- Locked strings above appear verbatim (straight apostrophes to match existing style: `You're`, `Don't` if used).
- Partner titles unchanged: The charge between you / When you become one current / The quiet fit / Heat that grows you / A wide-open field.
- Dual-prompt strings unchanged.
- Deep Dive essays are not shortened to slogans.
- Tests / asserts that snapshot old Chart/Soul jargon must be updated to the new locked strings.
- Existing IA, Chapter Map, Dual prompt, Settled Day, and Today Move behavior unchanged.

## Ship path

Open one PR from current `main`. Do not merge. Report the PR number and exact tip SHA back to Grok Bot (PO). Grok Bot will route UX UI Review → Ship Gate QA, then ask Benjamin for merge yes.

Authorized by Benjamin’s own-words answer to widget t517s2366: “Yes, build Chart and Soul language together.”

## Build status (Full Stack — do not merge yet)

- **Branch:** `feat/chart-soul-plain-language`
- **Base:** `e8c77481f0b6de57b3ed61bf0c42e301ec0e7a70` (main after PR #85)
- **Tip:** `43367f13e1517a23ff0ec8ed2582fab3a73a90fb`
- **PR:** (URL after `gh pr create`)
- **FE+BE:** Yes — frontend friend display map + Chart/Soul copy; backend Love gloss only in `partner_insights.py` (TYPE_LOVE_BANK first-use of gut / inform / invitation). Backend `soul_sync.SIGNATURES` scoring labels left unchanged (friend UI uses frontend map).
- **Files:** `friendSignatureCopy.ts` (new), `soul/page.tsx`, `hdCopy.ts`, `hdChannelCopy.ts`, `hdProfileCombos.ts`, `profile/page.tsx` (battery fallback), `partner_insights.py`
- **Tests:** `tsc --noEmit` clean; `assert-soul-chapter-map` / `assert-soul-dual-prompt` / `assert-literacy-pulse` / `assert-quiet-move-closure` PASS; `pytest tests/test_soul_sync.py` 32 passed; partner/love filter 15 passed
- **Preview:** not started
- **Do not merge** — Grok Bot routes UX → Ship Gate, then asks Benjamin.
