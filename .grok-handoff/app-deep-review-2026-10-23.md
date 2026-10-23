# Whole-app product/UX deep review — Baseline (hd-biohack)

**Date:** 2026-10-23 (Asia/Hong_Kong)  
**Repo:** `/workspace/hd-biohack` @ main (post #24 redesign, #25 kit visibility, #26 home reflect)  
**Live:** https://hd-biohack.vercel.app (login-walled; code + local Dev Pro used as source of truth)  
**Scope:** Home `/`, Chart `/profile`, Today `/transits`, Protocols `/biohack`, Soul `/soul`, plus auth paywall/login. **No code changes** — audit for @ui-ux critique next.  
**Benjamin callouts (must include):**
1. Soul / Aura between you must **not** mention “No Fit %”.
2. `🔒 You · You` (and Chart `YOU · You`) is redundant — simplify.

---

## Exec summary

Shipped Baseline finally has a coherent product loop on paper — **Chart → Today’s sky → Today’s Move (kit) → Soul** — but the UI still carries three generations of vocabulary at once: **gates / stacks / inventory / Generate / Fit %** beside **sky / kit / Open Protocols / Aura**. The two items Benjamin named are real and cheap: the home Soul card still leads with a **negative** Fit-% disclaimer, and every You-only surface builds a chip as `You · {youDisplayName}` where the display helper already collapses empty/`Me` → **You**, so default charts render **🔒 You · You** (and Chart **YOU · You**).

Beyond those, the highest-leverage work is a **copy consistency sweep** (kit everywhere user-facing; retire inventory/stacks/Generate on FE), **simplify You-only chrome** (one quiet signal, not lock + chip + subtitle + footnote), and **Today IA cleanup** (indication is primary; “What to do today” + gates table + duplicate Open Protocols still feel like the old product). Login and Pro paywall are a full product generation behind.

**Recommended next:** brief @ui-ux on this doc → one FE polish PR (Batch A below) before more feature work.

---

## Benjamin’s two items (called out)

### B1 — Aura between you must not say “No Fit %” — **P0**

| | |
|--|--|
| **Where** | Home Soul outcome card |
| **File** | `frontend/src/app/page.tsx:204` |
| **Quote** | `No Fit % — magnetic pairs get protocols, not a weak score` |
| **Why bad** | Product already killed Fit %. Marketing a *negative* (“we don’t do X”) teaches the old frame and sounds defensive. Soul page itself never leads with Fit % for happy path. |
| **Also** | Dev/ops string still surfaces Fit % on lag: `soul/page.tsx:316` — `Soul API is on an older Fit % schema…` (acceptable for schema-lag banner; keep internal, not home marketing). |
| **Fix direction** | Drop the bullet. Replace with positive Aura language only, e.g. `Aura Signature + one Playbook for this pair` or `Chemistry lives here — daily weather stays on Today & Protocols` (second bullet can stay / merge). |

### B2 — `🔒 You · You` repetition — **P0**

| | |
|--|--|
| **Where** | Today header chip, Protocols header chip, Chart YOU row |
| **Files** | `transits/page.tsx:185` · `biohack/page.tsx:692` · `profile/page.tsx:966–969` |
| **Helper** | `youDisplayName()` in all three: empty/`Me` → `"You"` (`biohack/page.tsx:55–57`, `transits/page.tsx:32–34`, `profile/page.tsx:72–74`) |
| **API default** | Self charts save as label `"Me"` (`backend/app/api/routes.py:176`) → FE maps to You → chip becomes **You · You** |
| **Live pattern** | `🔒 You · You` + subtitle `Today is for you` + footnote `Always your natal — friends stay on Chart & Soul` (Today); Protocols repeats lock chip + same footnote |
| **Chart twin** | Section label `You` + button `YOU · You · Type · Profile` |
| **Why bad** | Says “you” three ways; lock emoji reads like paywall, not “friends can’t drive this”; fails Benjamin’s “more simple” bar |
| **Fix direction** | Single quiet chip: if display name is You/Me → **`You`** (no `You ·`); if named (`Benjamin`) → **`Benjamin`** or **`You · Benjamin`** only when name ≠ You. Drop 🔒 or replace with text `You only`. Collapse Today’s three-line you-block to chip + one short line. Chart: `YOU` alone, or name alone — not `YOU · You`. |

---

## Findings table

| ID | Sev | Route / area | Finding | Evidence |
|----|-----|--------------|---------|----------|
| B1 | **P0** | `/` Soul card | “No Fit %” disclaimer framing | `page.tsx:204` quote above |
| B2 | **P0** | Today / Protocols / Chart | `You · You` / `YOU · You` + 🔒 redundancy | chips + `youDisplayName` + default `Me` |
| F3 | **P0** | Pro paywall | Still sells **inventory / stacks / generate** | `BiohackingEntitlementGate.tsx:25–35,47,64` — “Inventory-aware”, “increase/decrease stacks”, “unlock to generate live stacks”, “protocols and inventory” |
| F4 | **P0** | `/biohack` kit UI | User-facing **inventory** leftovers after #25 “kit” rename | Panel CTA `Add to inventory` (`biohack/page.tsx:1139`); `Loading inventory…` (`:1167`); Natal badge `in inventory` (`:1251`); locked header `…and inventory` (`:712`) |
| F5 | **P0** | `/transits` | Post-indication body still **gates/stack** product | Bullets: “planetary gates… stack tweaks” (`:163`); section “What to do today” + secondary Open Protocols (`:223–240`) duplicates indication Main action CTA (`TodayIndication.tsx:195–200`); table “Current planetary gates” fine as *detail* but above-fold bullets still gates-first |
| F6 | **P1** | Global nav vs home loop | **IA order conflict** | Header: Home · Chart · **Soul** · Today · Protocols (`Header.tsx:10–16`). Home loop: Chart → Today’s sky → Today’s Move → Soul (`page.tsx:46`). Users learn two orders |
| F7 | **P1** | `/login` | One generation behind — no Soul, no kit language | H1 `Chart. Today. Protocols.` (`login/page.tsx:74`); 3 pillars omit Soul; Protocols body “daily and weekly plan” not Today’s Move / kit (`:9–24`) |
| F8 | **P1** | You-only copy | Same footnote repeated everywhere | `friends stay on Chart & Soul` on home Today card, Today page, Protocols header, empty Protocols (`page.tsx:150`, `transits:190`, `biohack:540,695`) — over-explained after B2 simplify |
| F9 | **P1** | `/soul` | Playbook chrome redundancy | Label `Playbook` + micro `Playbook guidance for this pair — signature, spectrums, and cards below` (`soul/page.tsx:302–306`) — says Playbook twice, adds little |
| F10 | **P1** | `/soul` | Schema-lag banner still teaches Fit % | `soul/page.tsx:316` — OK for ops; soft-rewrite to “older sync schema” so Fit % never appears in user UI |
| F11 | **P1** | Header | Tier chip always on | `Pro unlocked` / `Free tier` (`Header.tsx:168–176`) — Ship Gate noted Sam still shows Pro unlocked; reads as product status not Dev; consider hide unless paywall relevant or Dev-only |
| F12 | **P1** | Protocols engine | Zinc vs Omega ranking honesty | Prior research/Ship Gate: Struggle+Zinc can lose to generic owned Omega — P1.1 still open (API); not FE-only |
| F13 | **P2** | `/` | Outcome card density / jargon | Home cards still pack “Why:” bullets; Soul “magnetic pairs get protocols” mixes Soul+Protocols concepts even without Fit % |
| F14 | **P2** | Chart | Extra Me charts UX | “Other charts (you)” / `You #id` (`profile:1044–1087`) — correct for duplicates but naming still You-heavy; fold into B2 pass |
| F15 | **P2** | Disclaimers | Multiple medical/info lines | Protocols footer, indication disclaimer, Soul disclaimer, home trust line — fine legally; tone-check once in polish so they don’t all shout |
| F16 | **P2** | Nav mobile | 5 primary tabs wrap | Home Chart Soul Today Protocols — Protocols often row 2 on 390; known; consider order fix (F6) or overflow pattern later |

---

## Route walk (condensed)

### Home `/`
- **Good (post #26):** Open Protocols, Today’s Move + kit, Soul 4th card, indication-first Today card, loop line.
- **Stale:** B1 Fit % bullet; You-only still “friends stay…” marketing on Today card.
- **Meta OK:** layout description already kit + Soul.

### Chart `/profile`
- YOU / Friends split works.
- **B2 twin:** `YOU · You` when label is Me/empty.
- Deep dive / sticky nav recently ship-gated — leave alone this batch unless copy-only.

### Today `/transits`
- Indication component is the real product.
- Header You-block overbuilt (B2 + F8).
- Secondary “What to do today” still gates/stack language (F5); duplicate Open Protocols.

### Protocols `/biohack`
- Redesign + kit visibility largely landed: Weather, Kit strip, From your kit, toasts, no yank-close.
- **Gaps:** inventory strings in panel/natal/paywall (F3/F4); You chip (B2); ranking P1 (F12).

### Soul `/soul`
- Aura happy path is signature / badges / spectrums / playbook — good.
- Empty and lag states OK; avoid Fit % in any user-visible string (F10).
- Playbook header thin (F9).

### Login + Pro gate
- Login missing Soul (F7).
- Entitlement gate vocabulary is pre-kit redesign (F3) — Free users still see the old product promise.

---

## Recommended next brief for @ui-ux

**Ask:** Critique + fold-in copy/IA for **Batch A** (FE-only polish). Confirm chip pattern, Fit % deletion, kit glossary, Today secondary section, nav order recommendation. Produce copy bank + must-fix; then PO briefs @dev.

**In scope for critique**
1. B1 — rewrite/remove home Soul Fit % bullet; scan any remaining user-facing Fit %.
2. B2 — redesign You chip + Chart YOU row + Today you-block to one simple pattern.
3. Kit glossary — replace every user-visible `inventory` / `stacks` / `Generate` on Protocols + paywall with kit / Today’s Move / Refresh language.
4. Today — keep indication primary; demote or rewrite “What to do today” (sky cues only, no “stack tweaks”); one Open Protocols CTA.
5. Optional: Header nav order vs home loop; login pillars + Soul.

**Out of scope**
- Zinc>Omega ranking (API P1).
- New Soul features, wearables, OAuth, Stripe.
- Chart deep-dive structure.

**Success**
- Benjamin never sees Fit % on happy-path marketing.
- Default self chart never shows `You · You`.
- Free paywall and kit panel speak the same language as shipped Protocols.

---

## Ship-sized batches

### Batch A — Copy & You-chrome polish (FE-only, ~1 PR) — **do next**
1. Home: delete/replace Fit % Soul bullet (B1).
2. Shared `youChipLabel` / display helper: no `You · You`; drop or soften 🔒; Chart `YOU` without `· You` (B2).
3. Kit glossary: `Add to kit`, `Loading kit…`, Natal `In your kit` / `From your kit`, paywall kit language; kill stacks/Generate in gate (F3/F4).
4. Today: rewrite stack/gates bullets; collapse you-block; single Open Protocols (F5/F8).
5. Soul: trim Playbook microcopy; soften schema-lag Fit % wording (F9/F10).
6. Login: add Soul pillar or one-line; H1 include Soul lightly (F7) — same PR if cheap.

**Ship:** Vercel FE only. Ship Gate smoke: home Soul card, Today/Protocols chip with Me-labeled chart, kit panel CTA, Free paywall copy.

### Batch B — IA consistency (FE, optional small PR)
- Header nav order aligned to product loop (e.g. Home · Chart · Today · Protocols · Soul) **or** document why Soul sits mid-nav (F6).
- Header tier chip visibility rules (F11).

### Batch C — Engine honesty (API + FE)
- Zinc-beats-generic-owned ranking (F12 / prior P1.1).
- Any remaining `prefer what you already own` why sanitization edge cases.

### Batch D — Later / icebox
- Disclaimer tone pass (F15), mobile nav overflow (F16), Chart duplicate-Me naming (F14), home card density (F13).

---

## Glossary (target user language)

| Prefer | Avoid (user-facing) |
|--------|---------------------|
| kit / Your kit / From your kit | inventory (API OK) |
| Today’s Move / Open Protocols / Refresh | Generate / stacks |
| today’s sky / indication / Energy · Space | gates-first marketing |
| Aura Signature / Playbook | Fit % / Natural fit |
| You (once) | 🔒 You · You / YOU · You |

---

## References

- Prior: `protocols-inventory-ux-research.md`, `protocols-inventory-ux-critique.md`, `home-reflect-ux-critique.md`, `ship_gate_report.md` (kit #25, home #26)
- Specs: `soul-aura-alchemy-spec.md` (Fit % superseded), `protocols-redesign-p0.md`
- Shots (prior reviews): `/workspace/hd-biohack-ui-failures/ux-review-2026-10-23/{home-reflect,protocols-inventory,protocols-redesign}/`
