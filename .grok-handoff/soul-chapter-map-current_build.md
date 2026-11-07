# Soul Chapter Map — build brief

**Date:** 2026-11-07 (Asia/Hong Kong)
**Signed off by:** Benjamin, in his own words: “Yes, build the Chapter Map”
**Source of truth:** this file. Research page: https://cursor.com/canvas/store-f5d34951-c924-450e-b54b-b19b5400da0d/248f0d9e-ad4f-481d-811e-32d3668b0c21
**Research notes:** /workspace/reports/soul-clickable-restructure-2026-11-07.md
**Product owner:** Grok Bot. Do not ask Benjamin for clarification — ship this brief.

FE-only IA/presentation change. No backend mechanics, scoring, copy banks, or API shape changes. After dual-gate + Benjamin’s merge yes: **Vercel only** (not Railway), unless you must touch backend (you should not).

Do **not** merge. Open a PR and tell Grok Bot the URL + tip SHA. Grok Bot routes UX UI Review → Ship Gate QA, then asks Benjamin.

---

## Goal

Convert Soul from a magazine-scroll essay into one **Chapter Map**: Signature hero always above the fold + a vertical stack of full-width tease-then-reveal chapter cards that open **one chapter at a time**. Same skeleton for partner mode and friend/non-partner mode. Partner adds a Love guidance chapter; friend never sees Love.

This is an interaction/IA restructure, not a copy rewrite and not a mechanics change.

---

## Locked product decisions

1. **Signature above Love.** Partner Signature stays the always-visible hero. Love guidance is chapter #1 on the map, opened on click — not the page hero.
2. **One-open everywhere for v1**, including desktop. Opening a chapter closes the previous one. Same rule for Love sub-chapters and nested Playbook cards.
3. **LiteracyCoach:** `onJump` must open the matching chapter (and nested Playbook card when needed), then scroll. Do not leave targets collapsed.
4. Do **not** restore overflowing horizontal Love tabs.
5. Do **not** add relationship scores or percentages.

---

## Above the fold (both modes)

Keep shared chrome: H1 Soul · You locked to Me · Person/Partner picker · Free/Pro gate · existing Partner chip + reason line + Open Chart when Partner is selected.

### Partner mode

1. Pickers (keep “Partner · Love guidance” chip, reason line “Love guidance is on because you marked {Name} as Partner on Chart.” + Open Chart).
2. **Partner Signature hero** — unchanged curiosity-first presentation from PR #80 (`partnerSignatureCopy.ts`): eyebrow “Between you”; approved love titles; italic hook; two everyday sentences; collapsed “Why it feels this way”; chip “Strong charge”. Secondary signature and badges stay with the hero (not a separate chapter).
3. One soft line under the hero: “Explore this bond” (not a score, not a verdict).
4. **Chapter map** — full-width vertical cards, min ~44px tall, whole card is the hit target, title + one-line tease + chevron/signifier so they look tappable:

| Chapter | Tease (use concrete scent; adapt if a shorter live string fits) | Opens |
| --- | --- | --- |
| Love guidance | Gold hook excerpt, or “How you love · where you harmonize · when it’s hard” | Love chapter (below) |
| Spectrums | “Pace · continuity · charge for this pair” | The 3 existing SpectrumBars |
| Playbook | Existing playbook lede, one line | 4 InsightCards as nested one-open teases |
| Channels | “Electromagnetic & companionship overlaps” | Completed channels (+ PartnerNuanceBlock) |
| Centers | “You vs them per center — how this is read” | Conditioning strip |

### Friend / non-partner mode

1. Pickers — no Partner chip, no reason line, **no Love teaser in the DOM**.
2. **Aura Signature hero** — existing alchemy voice (Magnetic Alchemy etc., “Highest signature”). Secondary signature + badges stay with the hero.
3. Chapter map — **same cards minus Love guidance**: Spectrums · Playbook · Channels · Centers.

Visibility gate is unchanged: Love guidance mounts only when `result.friend?.role === "partner"` && `result.partner_overview`. If Partner is on but overview is missing, keep the existing refresh note — do not invent Love content.

---

## Love guidance chapter (partner only)

When the user opens **Love guidance**, show the post-#80 magazine content inside the sand-amber wash (`.soul-love-guidance-wash`), but **chunk it into one-open sub-chapters** instead of all always-open:

1. **The current** + How you love / How {Name} loves (dual cards can stay side by side inside this sub-chapter)
2. **Where you harmonize** + **Where friction shows up** (title + body + try; items can stay open within this sub-chapter)
3. **Decide & talk** (existing accordion OK inside this sub-chapter)
4. **When it’s hard** (What this bond asks, The tender spots, When things get hard, Try this together)

Wash stays on this chapter shell only — do not wash the whole Soul page or the Signature hero. Gold Generator+Projector hook stays verbatim: “One of you is the steady yes. The other is the one who sees what that yes is for. That is the heat — and the care — in a Generator with a Projector.” Disclaimer stays under the Love hook: “How your designs meet in love — not a score, not a verdict.”

Prefer **in-place expand** of one chapter (accordion-of-chapters) over a new route, so pickers and the Signature hero stay visible. A “Back to chapters” / collapse control is fine; collapsing returns to the map with the hero still above.

Keep existing Love testids (`soul-partner-overview`, `soul-partner-hook`, `soul-partner-the-current`, `soul-love-harmonies`, `soul-love-decide`, etc.).

---

## Playbook nested cards

Do not leave all four InsightCards always expanded. Inside the Playbook chapter, show four nested tease rows — `somatic_playbook`, `power_dynamics`, `circuit_bridge`, `spark_glue` — one open at a time. Keep existing card testids (`soul-card-{id}`). PartnerNuanceBlock still only when partner.

Title nested rows clearly (e.g. the existing card title) so it does not feel like a mystery accordion-in-accordion.

---

## LiteracyCoach deep links

Keep existing target ids. `jumpSoulSection` (and `LiteracyCoach` `onJump`) must:

| targetId | Action |
| --- | --- |
| `soul-hero` | Scroll to Signature hero (already visible) |
| `soul-spectrums` | Open Spectrums chapter, then scroll |
| `soul-card-somatic_playbook` | Open Playbook + nested somatic card, then scroll |
| `soul-card-power_dynamics` | Open Playbook + nested power_dynamics, then scroll |
| `soul-card-spark_glue` | Open Playbook + nested spark_glue, then scroll |
| `soul-cards` / `soul-card-circuit_bridge` | Open Playbook (and nested circuit_bridge if that id is the target), then scroll |
| `soul-completed-channels` | Open Channels, then scroll |
| `soul-conditioning` | Open Centers, then scroll |

Hash URLs (`#soul-hero`, `#soul-cards`, etc.) should still work after load: open the matching chapter, then scroll.

LiteracyCoach itself can stay where it is now (near the hero / below Signature is fine) as long as jumps work. Do not rewrite coach copy unless a jump would otherwise break.

---

## Interaction / visual

- Chapter rows need visible signifiers: border, chevron that rotates when open, press/focus states, `cursor-pointer`, min ~44px hit target. The whole card opens/closes.
- One chapter open at a time (`openChapter: null | id`). Optional: map starts with all chapters closed so above-the-fold is pickers + hero + teasers only. Do not default-open Love or Playbook — Benjamin asked for clickable, not another long scroll on first paint.
- Love sub-chapters: `openLoveSub`; default none open, or open the first sub-chapter only once the Love chapter itself is opened (prefer first sub-chapter open when Love opens, so the hook/current is immediately readable).
- Playbook nested: `openPlaybookCard`; when Playbook opens, default-open none or the first card — prefer none so the four teasers are visible.
- Mobile-first ~390px. No horizontal overflow. No horizontal tab/pill row for chapters.
- Sand-amber tokens unchanged (`--energy #c59659`, wash on Love only). Do not recolor Signature title to energy/red. No Valentine pink/red.
- Friend path must look like the same map, just without the Love card.

---

## Keep / do not change

**Keep:** Signature scoring and five ids; `partner_overview` / dynamics fields; You = Me lock; People never drive Today/Protocols; sand-amber copper; gold G+P hook; copy banks / CENTER_BANK gold strings; Free/Pro gate; PartnerNuance only when partner; existing playbook / spectrum / channel / conditioning content (new presentation, not deletion); partner Signature copy map; PLAYBOOK_CONTEXT locked to `"life"`.

**Do not:** Overflowing horizontal Love tabs; relationship scores / % / compatible ratings; Love teaser or wash on friend/Person charts; soulmate / twin-flame / destiny language; Valentine chrome; cloning Stella AI or scores; deleting playbook/spectrum/channel content; backend scoring or API changes; recoloring Signature title to energy/red.

---

## Suggested implementation

1. Extract existing section renderers in `frontend/src/app/soul/page.tsx` and `PartnerOverviewCard.tsx` into chapter panels keyed by id. A `SoulChapterMap` under the hero is fine.
2. State: `openChapter: null | "love" | "spectrums" | "playbook" | "channels" | "centers"`; Love has `openLoveSub`; Playbook has nested open id.
3. Keep sand-amber wash scoped to the Love chapter shell.
4. Wire LiteracyCoach `onJump` + hash load → set open chapter (+ nested) + existing `jumpSoulSection` scroll.
5. Friend path: assert zero Love teaser / `data-love-guidance` / partner overview in the DOM when `role !== "partner"`.
6. Prefer preserving testids. Add chapter-map testids such as `soul-chapter-map`, `soul-chapter-love`, `soul-chapter-spectrums`, `soul-chapter-playbook`, `soul-chapter-channels`, `soul-chapter-centers`.

Likely files: `frontend/src/app/soul/page.tsx`, `frontend/src/components/soul/PartnerOverviewCard.tsx`. New small component(s) under `frontend/src/components/soul/` are OK. No backend files unless a test import forces it (it should not).

---

## QA / tests

- `tsc --noEmit` clean.
- Existing soul / partner tests updated, not weakened. Friend chart: no Love chapter, no love wash, alchemy Signature. Partner chart: Love chapter present after Partner Signature hero; magazine content reachable inside Love; one-open behavior; PartnerNuance only on partner.
- LiteracyCoach jumps open the right chapter then scroll.
- ~390px: no overflow; chapter cards look tappable.
- Do not weaken CENTER_BANK character-for-character assertions (you should not need to touch those files).

When the PR is up, tell Grok Bot: PR URL, branch, exact tip SHA, files changed, test commands + results, and confirm FE-only.

---

## Implementation status (2026-11-07, Asia/Hong Kong)

- **PR:** https://github.com/Benoliverc/hd-biohack/pull/81 — OPEN, not merged
- **Branch:** `feat/soul-chapter-map`
- **Tip SHA:** `ba6b54d9220db84fc112b2ede9fb238f3cf1737b`
- **Base SHA (origin/main):** `23f5efb4671607bec0b144b2ab9dbd1f10249559` (post-#80)
- **Local preview:** http://127.0.0.1:3023 — `/` 200, `/soul` 200
- **FE-only:** yes (no backend / Railway)
- **Files:** `frontend/src/app/soul/page.tsx`, `frontend/src/components/soul/PartnerOverviewCard.tsx`, `frontend/src/components/soul/SoulChapterCard.tsx` (new), `frontend/scripts/assert-soul-chapter-map.mjs` (new), `frontend/package.json`
- **Tests:** `npx tsc --noEmit` clean; `npx tsx scripts/assert-soul-chapter-map.mjs` ok
- **Notes:** Love sub-chapters one-open (first open when Love opens); Playbook nested none default-open; LiteracyCoach/hash open-then-scroll; friend path mounts zero Love DOM
