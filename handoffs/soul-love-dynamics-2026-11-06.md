# Soul Love guidance — Harmony, friction, and how you actually relate

Follow-on to #74 (Love guidance chapters). Partner-only. Do not mix with daily-return #76.

Benjamin (6 Nov 2026): make the partner feature deeper and more practical. Take what Stella and similar apps do well — not a clone.

Stella’s relationship mode works because it talks about how two designs *meet*: communication styles, center dynamics (defined vs open), strengths and fragile points. It does **not** earn that by a compatible/incompatible score, Stella AI Q&A, or Valentine chrome. Other HD apps (composite charts, connection readings) add the same mechanic Baseline already computes but barely *says*: an open center absorbs and amplifies a defined one; two authorities often run on different clocks.

What Baseline already has, and should not redo:
- Type-pair Love chapters (`hook`, `the_current`, `how_you_love`, `how_they_love`, `what_this_asks`, `tender_spots`, `try_this`) — keep verbatim.
- Channel gift / tender nuance.
- `conditioning_strip` on `/soul/sync` — 9 centers, defined/open, but hints only when they → you, and only a one-line “Amplifier…” note. The UI is a collapsed “Centers & how this is read” list at the bottom, labeled Person, not Love guidance.
- Authority used for spectrum *scores* (`shared_authority_class`, `authority_speed_gap`) — never explained as readable guidance.

This ticket surfaces those mechanics as practical Love guidance.

## Do not
- Compatibility percentages, fit scores, “compatible / incompatible,” ranking partners.
- Soulmate, twin flame, destiny, meant-to-be language.
- Pink / red romance, `--danger` for tender/friction (use copper `--energy` / `--energy-soft` / `--recovery`).
- Clone Stella AI, Stella’s children-vs-love IA, or their copy.
- LLM-generated chapters. Deterministic banks only.
- Change Aura Alchemy mechanics, You=Me lock, People vs partner, Today, or daily-return.
- Import `soul_sync` from `partner_insights.py` (circular). Pass `defined_a`, `defined_b`, `auth_a`, `auth_b` into `apply_partner_layer`.
- Dump all 9 centers as the existing collapsed strip. Select the most relevant items.

## New payload (partner role only)

Attach on `partner_overview` (or a sibling `partner_dynamics` nested on the overview so the hero stays one object):

```
harmonies: [{ id, title, body, try }]     # 2–4 items
frictions: [{ id, title, body, try }]     # 2–4 items
how_you_decide: { title, body, try }
how_you_communicate: { title, body, try }
when_you_clash: { title, body, try }
```

Each `try` is one practical move (what to say or do), not a platitude. No scores on the items.

Omit the whole layer when Person is not Partner (same as today’s overview).

## 1. Harmony and friction from centers

Bank: 9 centers × 4 states = 36 entries.

Centers (data keys already used): `Head`, `Ajna`, `Throat`, `G`, `Heart`, `Solar_Plexus`, `Sacral`, `Spleen`, `Root`.

States:
- `you_open_they_defined` — you absorb / amplify theirs (Benjamin’s example).
- `you_defined_they_open` — they absorb / amplify yours.
- `both_defined` — two consistent flavors that can support or collide; write the *shared consistency* as harmony, and mention the stretch in the same body without needing a second card unless the selector picks it as friction too (prefer one card, `kind` unused in UI).
- `both_open` — shared openness / field sensitivity; never shame “empty” centers.

Everyday names in copy: Solar Plexus → “emotional center”; Heart → “will / heart”; G → “identity and direction”; Ajna → “mind / opinions”. Don’t lead with jargon.

### Selection (do not show all 36)
Friction priority if state is a mismatch (`you_open_they_defined` or `you_defined_they_open`):
1. `Solar_Plexus` (always include when mismatched)
2. `Sacral`
3. `Throat`
4. `G`
5. `Heart`
6. `Root`
7. `Spleen`
8. `Ajna`
9. `Head`
Cap **4**.

Harmony priority:
- `both_defined` on `Solar_Plexus`, `Sacral`, `G`, `Throat`, `Heart` (that order)
- If `shared_authority_class` (same *class*: both emotional, or both instant sacral/splenic — reuse the idea from `soul_sync.shared_authority_class` without importing it): add one harmony `id: "shared-authority"`
- If `channel_roles.companionship` is non-empty: add one harmony `id: "companionship"` summarizing that you share finished channels (don’t invent channel names; use the ones already on the rows)
- `both_open` on `Solar_Plexus` or `G` only if you still have room
Cap **4**.

If an authority *speed gap* exists (emotional wave vs sacral/splenic instant — same idea as `authority_speed_gap`): add friction `id: "authority-tempo"` only when it wouldn’t duplicate `how_you_decide`. Prefer putting tempo in `how_you_decide` and *not* double-carding it.

### Gold copy — Solar Plexus (must match tests exactly)

**you_open_they_defined** (`id: "center-Solar_Plexus"`)
- title: `Their emotional weather`
- body: `Your emotional center is open, and theirs is defined. You don't just notice how they feel — you can take their wave in and turn the volume up. A mood that is passing weather for them can start to feel like your personality, your day, or a verdict on the relationship. The gift is real empathy. The stretch is remembering the feeling may not have started in you.`
- try: `When a strong mood arrives around them, wait before you decide anything about "us." Name it out loud: "I think I might be feeling your wave." Let their clarity come back before you treat the feeling as a conclusion.`

**you_defined_they_open**
- title: `You set the emotional weather`
- body: `Your emotions move in a wave that is yours — it has a truth at both ends. They can absorb that wave and amplify it, then hand it back louder than you sent it. If you ask them to "just tell me how you feel about us" mid-wave, they may be reporting your weather, not their own.`
- try: `Give them the time you already need. Say where you are on the wave ("I'm not clear yet") so they don't have to solve a feeling that isn't theirs to settle.`

**both_defined**
- title: `Two emotional climates`
- body: `You both have a defined emotional center, so neither of you is meant to vote on a feeling in the heat of it. You each have a wave, and those waves will not always crest together. The harmony is that you can both understand "not yet" as honesty, not avoidance.`
- try: `When something matters, agree to revisit it after one sleep — or after the charge has actually moved — instead of negotiating clarity you neither have yet.`

**both_open**
- title: `A shared emotional field`
- body: `Neither of you has a fixed emotional wave. Moods in the room — a film, a crowded dinner, someone else's argument — can color both of you. The gift is flexibility and a fine sensor for the field. The stretch is not turning every shared mood into a story about the relationship.`
- try: `After an intense evening, check the room before you check the relationship. Ask: "Is this about us, or about what we just walked through?"`

Write the other 8 centers × 4 states in the same voice: what’s happening in the body, why it matters in love, one spoken or behavioral try. No textbook “conditioning” lectures.

## 2. How you decide together (authorities)

Normalize:
- `Emotional (Solar Plexus)` → `emotional`
- `Sacral` → `sacral`
- `Splenic` → `splenic`
- `Ego / Heart` → `ego`
- `Self-Projected` → `self-projected`
- `Lunar` → `lunar`
- `Mental / Environmental (Outer Authority)` → `mental`

Bank every unordered pair (including same+same). Directional body may mention who is who using “you” / “they” from `auth_a` vs `auth_b`.

Always emit `how_you_decide` when both authorities are known.

### Gold — Emotional + Sacral (either direction)

- title: `Different decision clocks`
- body: `You decide on different clocks. One of you needs the emotional wave to rise and fall before a real yes exists. The other gets a gut sound now — uh-huh or unh-uh — that goes stale if you table it too long. This is not stubbornness versus impulsiveness. It is two honest authorities on two tempos.`
- try: `Don't force a shared deadline. The sacral response can be spoken as a first body read ("my gut is a yes right now") and the emotional partner can sleep on it. Revisit once, after the wave has moved. A pressured "just decide" helps neither of you.`

Also write gold-quality entries for at least: Emotional+Emotional, Sacral+Splenic, Emotional+Splenic, Self-Projected+Emotional, Lunar+anything, Mental+anything, Ego+Emotional. Then complete the rest of the grid so no pair falls through to a generic sentence.

Same-authority pairs should read as harmony: you share a clock — here’s how to protect it (e.g. two emotional authorities both need time; don’t make each other perform certainty).

## 3. How you communicate

Compose one section from:
1. A Type-pair sentence (new `how_you_communicate` string on each `PARTNER_OVERVIEW_BY_TYPES` key, same 15 unordered Type|Type keys as today).
2. A Throat-state paragraph (4 states, same shape as centers).

Join them with a space or a line break into `how_you_communicate.body`. `try` can come from the Throat state when it is a mismatch, else from the Type pair.

### Gold — Throat you_open / they_defined
- Mention: their words can land like a decision; you may echo, go quiet, or feel you have to match their certainty. Pause before treating a sentence as the plan.
- try: `Let them finish. Then say back the request in your own words before you agree — so you are not signing a voice that isn't yours.`

### Gold — Generator + Projector communicate (Type pair)
- The Generator loves by engaging what lights them up; the Projector loves by seeing and guiding when recognized. In conversation that can sound like one person processing out loud while the other is waiting to be asked — or offering guidance that wasn’t invited.
- Fold this into the Type-pair `how_you_communicate` field exactly as other pairs will be written.

## 4. When you clash (Type + a nod to authority)

New `when_you_clash` string (plus `try`) on every Type pair. This is the practical conflict recipe Benjamin asked for — how these two Types repair, not a verdict.

### Gold — Generator + Projector

- title: `When things get hard`
- body: `In a clash, the Generator often wants to stay in it and work the thing until the energy moves. The Projector can feel unseen, then either withdraw or start managing the Generator — which the Generator feels as pressure, not love. Neither is wrong. The Generator is built to respond; the Projector is built to wait for a real invitation and to be recognized for what they see.`
- try: `Generator: respond to what was actually said, not the whole backlog. Ask one question and wait. Projector: don't fix unless you were asked. Name what you see in one sentence, then ask "do you want my take?" If the answer is no, that is not rejection of you — it is the invitation arriving later.`

If an authority tempo gap exists, append one sentence to `when_you_clash.body` (not a new section): `Also remember your decision clocks are different — don't try to settle the fight on the faster clock.` Only when `how_you_decide` is the Emotional+Sacral (or Emotional+Splenic) gold case, use that exact sentence.

Write `when_you_clash` for every Type pair in the same practical voice (Manifestor inform-in-a-fight, Reflector needs time and a calmer environment, two Generators can overwork a conflict, etc.).

## UI

Keep the existing Love guidance hero and chapter order. After “How you / they love” and **before** “What this bond asks”, add:

1. **Where you harmonize** — list of harmony cards (`data-testid="soul-love-harmonies"`). Each item: title + body + muted try line (`soul-love-harmony-{id}`).
2. **Where friction shows up** — same, copper-soft not danger (`data-testid="soul-love-frictions"`).
3. **How you decide together** (`data-testid="soul-love-decide"`).
4. **How you talk** (`data-testid="soul-love-communicate"`).

After “The tender spots” and **before** “Try this together”:

5. **When things get hard** (`data-testid="soul-love-clash"`), same inset language as try-this (practical move visible).

Keep the footer: not a score, not a verdict.

Do not restyle the collapsed bottom “Centers & how this is read” strip in this PR (soft leftover). Love guidance should make it unnecessary to open that list to understand the emotional-wave example.

Partner picker / Love guidance chip unchanged.

## Files to start from
- `backend/app/hd/partner_insights.py` — banks + `apply_partner_layer` (extend signature with defined centers + authorities)
- `backend/app/hd/soul_sync.py` — pass `defined_a`, `defined_b`, `auth_a`, `auth_b` already in scope at the `apply_partner_layer` call (~1771)
- `backend/app/schemas.py` — `SoulPartnerOverviewOut`
- `frontend/src/lib/api.ts` — `SoulPartnerOverview`
- `frontend/src/components/soul/PartnerOverviewCard.tsx`
- `backend/app/tests/test_soul_sync.py` (path: `tests/test_soul_sync.py`)

## Tests
- Existing #74 gold (Generator+Projector chapters, Intimacy 59-6 nuance, aliases, person role omits layer, forbidden-word grep) still passes.
- New: You open Solar Plexus + partner defined → harmony/friction includes exact “Their emotional weather” gold (body + try). Reverse state matches “You set the emotional weather”.
- New: Emotional + Sacral authorities → `how_you_decide` matches gold (either direction).
- New: Generator + Projector → `when_you_clash` matches gold.
- New: Person/friend role → no `harmonies` / `frictions` / decide / communicate / clash chrome.
- Grep: no compatible/incompatible/soulmate/twin-flame/destiny; no `--danger` in the new Love blocks.
- `frontend tsc --noEmit` clean; i18n settings assert if you add chrome strings (follow whatever #74 did — component headings may stay English like the current card).

## Ship
Backend + frontend. Vercel **and** Railway after UX → Ship Gate → Benjamin’s own-words yes.
No standing auto-ship. Independent of #76.
Hold merge. Ping UX UI Review first, then Ship Gate after UX PASS. Tell Grok Bot when the PR is up and when both gates pass.
