# UX critique — Whole-app Batch A (copy / You-chrome)

**Date:** 2026-10-23 (Asia/Hong_Kong)  
**PO audit:** `.grok-handoff/app-deep-review-2026-10-23.md`  
**Code scan:** `/workspace/hd-biohack-ui-failures/ux-review-2026-10-23/app-deep/code-scan.md`  
**Live:** `http://127.0.0.1:3000/` Dev Pro (Me · Wetteren · 1990-06-15 #21). Vercel login-walled.  
**Shots:** `/workspace/hd-biohack-ui-failures/ux-review-2026-10-23/app-deep/`  
**Scope:** FE copy/IA polish only — not Protocols redesign, not Zinc ranking API.

## Verdict

Benjamin’s two items **confirm live**. Batch A as proposed **PASS to @dev** with UX-tightened copy bank below.

| Item | Live | Call |
|------|------|------|
| B1 No Fit % on Aura | Home Soul only: `No Fit % — magnetic pairs…` | **Must-fix** — delete; positive Aura only |
| B2 You · You | Today + Protocols `🔒 You · You`; Chart `YOU · You · …` | **Must-fix** — one quiet You |
| Kit leftovers | `Add to inventory`, Natal `IN INVENTORY`, paywall inventory/stacks/generate | **Must-fix** |
| Today secondary | Gates/stack bullet + 2nd Open Protocols under What to do today | **Must-fix** |
| Paywall gate | Pre-#24/#25 vocabulary | **Must-fix** |
| Login missing Soul | H1 + 3 pillars | **Must-fix** (same PR if cheap) |
| Nav order vs loop | Soul mid-nav; home loop Soul last | **Nice / Batch B** — recommend, don’t block A |
| Friends-stay over-repeat | Today + Protocols + home | **Nice** — keep once after You simplify |

**Already good (post-#26):** home Open Protocols / Today’s Move / kit card; Protocols Refresh + From your kit strip; `/soul` happy path has **zero** Fit %.

## Must-fix Batch A

1. **B1** — Drop home Soul Fit % bullet; never teach Fit % on happy-path marketing. Soften Soul schema-lag banner (`older Fit % schema` → `older schema`).
2. **B2** — Shared chip helper: never `You · You` / `YOU · You` / leading 🔒. Pattern below.
3. **Kit glossary** — Every user-visible `inventory` on Protocols + Natal badge + locked header → kit language.
4. **Paywall** — `BiohackingEntitlementGate`: kill stacks / Inventory-aware / generate live stacks → Today’s Move / kit / sky.
5. **Today** — Rewrite stack/gates secondary bullet; **one** Open Protocols (keep indication CTA; remove or demote duplicate under What to do today).
6. **Login** — Add Soul pillar; H1 includes Soul lightly.
7. Preserve test ids / smoke paths. FE-only → Vercel.

## Nice / P1 (same PR only if free; else Batch B)

- Header nav → `Home · Chart · Today · Protocols · Soul` (matches loop). Document if keeping Soul mid-nav for “chemistry” prominence.
- Collapse friends-stay to **one** short line after You chip (Today *or* Protocols — not both + home).
- Soul Playbook micro: drop double “Playbook” (`Playbook guidance for this pair…` → one line).
- Header Free/Pro tier chip: Dev/paywall-relevant only (Sam showed Pro unlocked — known quirk).
- Home Soul “magnetic pairs get protocols” mixes domains — optional soften after Fit % deletion.

## Out of scope

Zinc>Omega ranking (API), Chart deep-dive structure, OAuth/Stripe, screenshot pipeline, disclaimer tone mega-pass.

---

## Copy bank — Aura (B1)

### Home Soul card (`page.tsx`)
- Title: **Aura between you** *(keep)*
- Body: **Signatures and a single Playbook for how your aura wires with someone you’ve charted.** *(keep)*
- Bullet 1 (**replace Fit %**): `Aura Signature + one Playbook for this pair`
- Bullet 2 *(keep or merge)*: `Chemistry lives here — daily weather stays on Today & Protocols`
- **Never:** Fit %, No Fit %, Natural fit, weak score

### Soul schema-lag (`soul/page.tsx`)
- Was: `Soul API is on an older Fit % schema…`
- Use: `Soul API is on an older schema. Redeploy with Aura Alchemy, then refresh.`

### Soul Playbook micro (nice)
- Was: `Playbook guidance for this pair — signature, spectrums, and cards below.`
- Use: `Guidance for this pair — signature, spectrums, and cards below.`

---

## Copy bank — You chrome (B2)

### Helper rule (all three pages)
```
youChipLabel(chart):
  name = trim(label)
  if empty or lower(name) in {me, you} → "You"
  else → name   // e.g. "Benjamin"
```
Chip text = **only** `youChipLabel` — no `You ·` prefix, no `YOU ·` prefix when label is You/Me.

### Today / Protocols header
- Chip: **`You`** (or **`Benjamin`** if named) — text only, no 🔒
- Optional one line under chip: `Today is for you` **or** `Always your natal — friends on Chart & Soul` — **pick one**, drop the other + drop “Overlaying Me · …” if chip already shows identity (Overlaying line can stay as chart meta elsewhere, not stacked under You).
- Prefer: chip `You` + single footnote `Friends stay on Chart & Soul` (Protocols can omit footnote if Today has it).

### Chart YOU row
- Section: **You** *(keep)*
- Row label: if chipLabel is You → **`You · {Type} · {Profile}`** (no second You)  
  if named → **`{Name} · {Type} · {Profile}`**  
  Optional small badge `YOU` left of row is fine **without** repeating You in the name slot.
- Avoid: `YOU · You · Manifesting Generator · 2/4`

### Lock emoji
- Drop 🔒 (reads paywall). If need “friends can’t drive”: text `You only` once, or rely on footnote.

---

## Copy bank — Kit / paywall / Today / login

### Protocols kit leftovers
| Was | Use |
|-----|-----|
| `Add to inventory` | `Add to kit` |
| `Loading inventory…` | `Loading kit…` |
| Natal `in inventory` / `IN INVENTORY` | `From your kit` (or `In your kit`) |
| `Pro unlocks today's plan, this week, and inventory.` | `Pro unlocks Today’s Move, this week, and your kit.` |

### Paywall `BiohackingEntitlementGate`
| Was | Use |
|-----|-----|
| `…decrease stacks from your Type…` | `Natal baseline — emphasize / increase / ease from your Type and centers` |
| `Inventory-aware protocols — prioritize supplements you already own` | `Kit-aware Today’s Move — prefer what you already own` |
| `Pro unlocks protocols and inventory.` | `Pro unlocks Today’s Move and your kit.` |
| `Preview — unlock to generate live stacks` | `Preview — unlock to open live Today’s Move` |
| This week line | Keep transit tweaks sense; avoid “stacks” |

### Today secondary
| Was | Use |
|-----|-----|
| `Skim today's planetary gates below, then open Protocols for stack tweaks.` | `Skim today’s sky below, then open Protocols for Today’s Move.` |
| Second `Open Protocols` under What to do today | **Remove** — keep indication Main-action CTA only |
| Section title What to do today | OK as secondary; keep sky-cue bullets (Gate N · line L fine in detail) |

### Login
- H1: `Chart. Today. Protocols. Soul.`
- Sub *(keep spirit)*: `Human Design that turns into a day you can follow.`
- Pillars: keep Chart / Today / Protocols; add  
  **Soul** — `Aura Signature and one Playbook for how you wire with someone you’ve charted.`
- Protocols pillar body: `A checkable Today’s Move from today’s sky — preferring what you already own.` *(replace “daily and weekly plan”)*

### Nav (P1 / Batch B)
- Recommend: `Home · Chart · Today · Protocols · Soul`
- If deferred: one-line comment in Header why Soul sits after Chart (chemistry before daily loop) — don’t leave unexplained.

---

## Success criteria (UX PASS)

1. Benjamin never sees Fit % / No Fit % on home or Soul happy path.
2. Default Me chart never renders `You · You` or `YOU · You` or 🔒 You.
3. Kit panel + Natal badge + Free paywall speak **kit / Today’s Move** — zero inventory/stacks/Generate.
4. Today has a single Open Protocols CTA; secondary copy is sky/Move, not stack tweaks.
5. Login surfaces Soul.
6. Ship Gate smoke: home Soul card, Today+Protocols chip with Me chart, kit Add button, Free paywall, login pillars.

## Ship notes for @dev

- Touch primarily: `page.tsx`, `transits/page.tsx`, `biohack/page.tsx`, `profile/page.tsx`, `soul/page.tsx`, `BiohackingEntitlementGate.tsx`, `login/page.tsx`; optional `Header.tsx` (nav P1).
- Prefer one shared `youChipLabel` helper (lib) over three copy-pasted `youDisplayName` sites.
- No API/schema rename of `inventory` / `in_inventory`.
- Vercel FE only. Shots for gate: home Soul crop, Today You chip, Chart YOU row, kit Add, paywall gate, login pillars.

## Handoff

1. PO deep review — done  
2. **@ui-ux** — this critique — **done**  
3. **@dev** — Batch A FE polish  
4. Ship Gate → merge → Vercel only  
5. Batch B (nav order, tier chip) optional follow-up
