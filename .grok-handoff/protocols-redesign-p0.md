# P0 — Protocols redesign: “Today’s move” (stop the samey day)

**Status:** Draft for PO → recommend `@ui-ux` pass → then `@dev`  
**App:** Baseline (hd-biohack)  
**Route:** `/biohack` (nav **Protocols**) · live https://hd-biohack.vercel.app/biohack  
**Date:** 2026-10-23 (Asia/Hong_Kong)  
**Owner ask (Benjamin):** Deep PO review — Protocols feels like **every day the same**, not exciting. Come up with a **much better page**.

---

## 1. Problem statement (user voice)

> “I open Protocols and it’s the same plan again — daylight walk, caffeine cutoff, magnesium. That’s not exciting. Today already tells me the sky; Protocols should feel like *what I do with that sky*, not a laminated wellness checklist.”

Pain:
- Page reads as a **static Type OS pamphlet** with a Generate button, not a **daily instrument**.
- Hero checklist never changes → no reason to reopen.
- Transit “weather” that *does* exist is buried or filtered away.
- Competing with **Today** (`/transits`) which already has live Energy / Space / Main action — Protocols doesn’t reuse it.

---

## 2. Why samey — evidence from code (not vibes)

### 2.1 Always-on template dominates the hero

`backend/app/biohack/rules.py` → `_build_actionable_plans` **always** prepends:

| Slot | Hard-coded first items |
|------|------------------------|
| Morning | Daylight + short walk · Protein-forward meal |
| Midday | Caffeine cutoff |
| Evening | Magnesium Glycinate · No late stimulants |

`summary.top_actions` is literally those first items:

```text
Morning: Daylight + short walk …
Midday: Caffeine cutoff.
Evening: Magnesium Glycinate.
```

**Measured (Benjamin Me #35, MG 2/4 Sacral, inventory typical):** over **14 consecutive UTC days**, `top_actions` unique count = **1/14**. Morning/midday/evening *lead* items never change.

### 2.2 Weekly theme never uses the sky (bug)

Overlay builds `weekly_macro_theme` with keys `sun_gate` / `earth_gate` / **`summary`** (`hd/chart.py`).

Rules look for **`theme`**:

```python
if isinstance(weekly_macro, dict) and weekly_macro.get("theme"):
    theme_bits.append(...)
```

→ theme always falls back to `"{Type} operating system + open-center hygiene"`. **Zero day variance.**

### 2.3 Transit variance is real but invisible in the hero

`build_protocol` *does* call live `calculate_transits()` + `overlay_transits()` (route `POST /biohack/protocol`). Focus centers / stacks / `daily_directive` *can* shift with bridges.

But:
- Hero still shows always-on tops.
- `daily_directive` (“Channel X bridged…”) sits under **This week → Sky · this week**, not in the lead card.
- FE `WeekPlan` **filters** transit stacks that near-duplicate Today items into a collapsed `<details>Transit stacks</details>` — so the variable layer is demoted twice.

### 2.4 Session UX freezes sameness

- Protocol lives in **React state only**; no `GET` of latest `weekly_protocols` snapshot.
- Every visit: empty → tap **Generate** → same-looking plan.
- Snapshots are written (`WeeklyProtocol`) but **never re-read by FE**.
- Decorative `☐` on lead actions — **no completion / streak / progress**.

### 2.5 Split brain vs Today

| | Today `/transits` | Protocols `/biohack` |
|--|-------------------|----------------------|
| Auto-load sky | Yes | No (manual generate) |
| Energy / Space / Main action | Live `derive_today_indication` | Unused |
| Chart lock | You-only (PR #21) | Sticky ChartChip (can be friend) |
| Daily-variable hero | Yes | No |

Backlog already hinted the fix: P1 *“Space → filter / reorder Protocol Do list”* — never shipped; Protocols stayed template-first.

### 2.6 What is *not* the cause

- Not “missing LLM” — optional coaching is &lt;180 words rewrite; wouldn’t fix identical tops.
- Not “no ephemeris” — sky is computed; product just doesn’t lead with it.
- Not paywall alone — Pro users still get the same laminate after unlock.

---

## 3. Assets that already exist (do not invent sources)

**Use in P0:**
1. **Today indication** — `derive_today_indication` / `GET /transits/today` → `energy_label`, `preferred_space`, `main_action_text` + why/micro/drivers.
2. **Overlay** — `newly_defined_centers`, `bridged_channels` (personal first), `weekly_macro_theme.summary` (Sun/Earth gates), `transit_gates`.
3. **Natal** — Type / Authority / Strategy / defined·open centers (stable baseline).
4. **Inventory** — prioritize owned compounds in the *variable* stack, not only in the laminate.
5. **You chart resolution** — same You-only rule as Today (don’t protocol a friend by sticky accident).

**Exist but stub / later (do not fake in P0):**
- `UserBiometricsDaily` + `POST /v2/telemetry/ingest` — **not merged** into protocols (“V2 stub”).
- LLM coaching — optional env; don’t depend on it for excitement.
- ApoE4 / genotype — **no field in product today**. Grounding for Benjamin = HD chart weather + honest inventory; optional profile flag is P1+, not invented genetics.
- Soul playbooks — relationship context; link out later, don’t dump Soul into Protocols P0.
- Calendar / Google Calendar connector — out of scope.
- Streaks / notifications — backlog P2; skip for first cut.

---

## 4. Product principles

1. **Exciting ≠ spam.** One sharp daily move + why. Not 18 checklist rows + three twin sections.
2. **Sky leads; baseline supports.** Permanent Type OS lives collapsed. Temporary weather is above the fold.
3. **Same physics as Today.** Energy/Space language must match `/transits` (one derive function). No second scoring system.
4. **HD-grounded, not medical.** Informational / energetic optimization disclaimer stays. No diagnosis, no ApoE4 claims without a real profile field.
5. **Inventory is a filter, not the story.** “You own Magnesium” is a badge on a sky-driven evening move — not the headline every day.
6. **Auto-arrive.** Opening Protocols should show *today’s* plan without a Generate ritual (generate/refresh becomes explicit “rebuild”).
7. **You-only for Protocols day plan** (align with Today). Friend charts stay on Chart/Soul.

---

## 5. Proposed IA — “Protocols = Today’s move + stable kit”

### Above the fold (daily-variable)

**A. Weather strip** (reuse indication payload; compact)
- Energy chip (Drained→Hyper) · Space chip · as-of time (Asia/Hong_Kong)
- One-line sky cite: Sun/Earth gate summary + top bridged channel name (if any)

**B. Today’s Move** (hero — *the* exciting unit)
- Title = indication `main_action_text` **or** bridge-derived move if indication unavailable
- Why = `main_action_why` + optional micro
- **3 timed supports only** (not a dump): Morning / Midday / Evening — each **one** item chosen by:
  1. Energy band (Hyper → anti-stim evening; Drained → protect / no stack; Charged → capacity support from inventory)
  2. Top bridge / newly defined center (`CENTER_STACKS` pick, inventory-first)
  3. Else Type-safe default (not always daylight/caffeine/magnesium as the *lead*)
- Always-on hygiene (daylight, caffeine cutoff, magnesium) demoted to **Baseline kit** or a single “Defaults on” footnote — **not** the three hero slots.

**C. Do / Don’t for *this* weather** (max 3 each)
- Reordered by `preferred_space` (backlog idea): e.g. Alone → drop social initiation; Focus → single-task; Out → walk/inform move first.
- Type Strategy/Authority stays as one Do line, not three clones.

### Mid page (slow-changing)

**D. This week’s sky** (1 card)
- Fix theme: use `weekly_macro_theme.summary` (Sun/Earth).
- 2–4 habits that can stay for the week.
- Emphasize / Pause lists **short** (≤4), inventory-tagged.

**E. Baseline kit** (collapsed accordion, default closed after first visit)
- Natal emphasize / increase / decrease (current `natal_baseline`)
- Inventory editor (current accordion)

### Chrome

- Header: **Protocols** + locked **You** chip (parity with Today) + “as of {time HKT}”
- Secondary: Refresh / Rebuild
- Empty: no You chart → CTA Chart; Pro gate unchanged
- Loading: skeleton weather + move (not blank Generate forever)
- Disclaimer footer unchanged

### What NOT on the page (P0)

- Full Morning/Midday/Evening walls of 5–6 items each
- Duplicate “Transit stacks” details that restate Today
- Decorative checkboxes pretending to be a habit tracker
- Wearable HRV widgets, streaks, Soul pair playbooks, calendar blocks
- LLM essay as the primary content

---

## 6. P0 scope vs later

### P0 (shippable cut)

| # | Work | Layer |
|---|------|-------|
| 1 | Auto-load today’s protocol on page enter (compute or GET latest-for-day); Refresh explicit | FE + thin API |
| 2 | Weather strip + Today’s Move hero from **shared** indication + overlay | FE + glue in `build_protocol` or FE compose from `/transits/today` + protocol |
| 3 | Rebuild daily plan: **one** item/slot from energy×bridge×inventory; demote always-on template | `rules.py` |
| 4 | Fix weekly theme key (`summary` → theme string); promote sky cite | `rules.py` |
| 5 | You-only chart binding on Protocols (mirror Today) | FE store resolve |
| 6 | Collapse natal baseline by default; shorten Do/Don’t | FE |
| 7 | Tests: 2 fixture days with different bridges → **different** hero move / slot leads | backend |

### Later (explicitly cut)

- Wearable merge, streaks, notifications, midday re-ask
- ApoE4 profile flag → stack bias (Omega-3 / inflammation hygiene copy)
- Space→full Do reorder polish, energy history sparkline
- Persist completions, LLM narrative polish
- Deep-link from Soul “Activate Protocol”
- Friend protocols

---

## 7. Acceptance criteria

1. Given Pro + You chart, when opening `/biohack`, then **today’s plan appears without tapping Generate** (≤ one automatic fetch).
2. Given two dates whose top personal bridge or energy band differs, when protocols are built, then **Today’s Move title and/or at least one timed lead item differ** (pytest).
3. Given 14-day window for Me #35-class chart, hero lead trio is **not** permanently locked to Daylight / Caffeine cutoff / Magnesium (those may appear in Baseline kit).
4. Weekly theme shows **Sun/Earth gate summary** (not only “{Type} operating system…”).
5. Weather strip Energy/Space labels **match** Today indication for the same natal id + day.
6. Protocols resolves **You** even if sticky chart is a friend.
7. Natal baseline remains available but **collapsed** after load when a day plan exists.
8. Disclaimer still visible; no medical/ApoE4 claims without profile data.
9. Free tier: paywall behavior unchanged (blurred preview ok).

### What NOT to do

- Do not add a second energy model.
- Do not require LLM keys for the page to feel alive.
- Do not invent biometrics or ApoE4.
- Do not turn Protocols into a clone of Today (Today = read sky; Protocols = **do** the sky).
- Do not keep Generate-as-empty-state as the happy path.
- Do not spam more supplements to fake novelty.

---

## 8. Wireframe-in-prose + today vs tomorrow

### Today (example — Hyper + Logic bridge 4-63 + focus space)

```
Protocols                          [You · Me #35]
⚡ Hyper · Focus corner · Sun 50.4 / Earth 3.4
Bridge: Logic (4-63) — temporary Head/Ajna definition

TODAY’S MOVE
Protect the initiation window — inform one person, then one Sacral yes.
Why: Hyper motors + open Root soak urgency; Manifesting Generator still responds first.

  Morning   Omega-3 (in inventory) — quiet Head pressure before tabs open
  Midday    Single-task 40 min · phone down — Logic bridge wants certainty loops
  Evening   No stim stack · Magnesium only if you own it — Hyper anti-stim

Do  · Respond then inform · Decide Sacral, not the crest
Don’t · Afternoon caffeine on borrowed Root hurry · Big decisions on SP wave
```

### Tomorrow (example — Charged + different bridge / Spleen newly)

```
Protocols                          [You · Me #35]
⚡ Charged · Alone · Sun 28.1 / Earth 27.1
Bridge: Struggle (28-38) — Spleen in the weather

TODAY’S MOVE
Take the instinct hit — one hard yes/no before noon, then leave it.
Why: Splenic weather is quiet; Charged Sacral can over-push past the hit.

  Morning   Protein + short alone walk — don’t open Slack first
  Midday    Zinc pulse only if in inventory — else skip (no fear-hopping)
  Evening   Early wind-down · no late research tabs

Do  · Trust first instinct · Inform before multi-track
Don’t · Fear-driven supplement hopping · Matching Generator peers with focus stacks
```

**Same baseline kit underneath both days** (collapsed): MG Type OS, open Root/SP hygiene, inventory list.

---

## 9. Suggested implementation sketch (for `@dev` after UX)

**Preferred compose (least duplication):**
1. FE on load: `GET /transits/today?natal_chart_id=You` + `POST /biohack/protocol` (or new `GET /biohack/protocol/today` that returns `{indication, protocol}` once).
2. `build_protocol` gains `indication` input (or calls derive internally) to pick hero move + slot leads.
3. Keep `natal_baseline` payload; FE collapses it.

**API option:** `GET /biohack/protocol/today` idempotent for calendar day (Asia/Hong_Kong) — reuse snapshot if same day+chart+inventory hash; else rebuild. Avoids empty-state Generate.

---

## 10. Process

1. PO presents chat summary to Benjamin; confirm direction.
2. **`@ui-ux` reviews** IA (weather strip + hero hierarchy + density) before `@dev` codes — this is a page redesign, not a copy tweak.
3. `@dev` implements P0 against this spec; Ship Gate with two-day fixture diff.
4. Update `backlog.md`: move “Space → reorder Protocol Do” into this P0; leave wearables/streaks in P1/P2.

## Files likely touched (P0)

- `backend/app/biohack/rules.py` (hero selection; theme fix)
- `backend/app/api/routes.py` (+ optional GET today)
- `backend/tests/test_*.py` (new protocol variance tests)
- `frontend/src/app/biohack/page.tsx` (IA)
- `frontend/src/lib/api.ts`
- Possibly share a tiny indication strip component with Today

## Out of scope reminder

No product code in this research turn — brief only.

---

## UX fold-in (2026-10-23 — @ui-ux)

Source: `.grok-handoff/protocols-ux-critique.md`

**Must incorporate in P0:**
- As-of / weekday on Protocols (parity with Today).
- Hero = Indication weather, **not** “Run your Type OS.”
- One checkable **Today** list (main + AM/MD/PM) with **persisted** done for the calendar day — or drop ☐ entirely. No decorative boxes.
- Owned inventory first in timed slots; demote “(consider adding).”
- Week card = **1 theme + 1 sky note only** — cut standing “for every Type” / DAILY habits from the week surface.
- Close loop with Today: matching copy; Today = weather, Protocols = *do* it.
- Collapse natal so it is never visually longer than Today’s plan.
- Optional: “New this morning” when Refresh sees a different sky/bridge vs yesterday.

**IA one-liner (authoritative for @dev):**  
`Weather (why today) → Do today (checkable) → This week (theme + sky only) → Natal (collapsed) → Inventory`
