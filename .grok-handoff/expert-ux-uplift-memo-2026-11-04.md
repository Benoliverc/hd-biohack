# Expert #1 — Baseline UX uplift (deep memo)

**Lens:** Product UX/UI (not Ship Gate) · **Author:** UX UI Review  
**When:** 2026-11-04 HKT · post PR #45 IA split  
**Live:** Vercel login-walled → product walk on **local Dev Pro** (`127.0.0.1:3000`, Me · Wetteren #21) after #45 merge (`70a8b27`)  
**Shots + raw notes:** `/workspace/hd-biohack-ui-failures/ux-review-2026-11-04/expert-uplift-memo/` (`01`–`16`, `notes.md`)  
**For:** PO synthesis → decision Page (3 options for Benjamin)

---

## Executive take

The IA split worked. Today owns the sky; Protocols owns the check. Trust copy (invite-only, Free waitlist honesty) is strong. The product still fails the **7–9am ritual**: the only daily verb (tick Today's Move) loses the fold to kit setup and an optional intention. Colour direction is right; usage is wrong — sage washes the biggest cards so nothing can be the accent. Elevate by **reordering Protocols around the check** and **using less fill**, not by replacing hues.

**Bold bet (one):** Make Protocols a **Morning Ritual** surface — Move first above the fold; kit/intention demoted or deferred. Everything else is incremental polish.

---

## 1) Morning ritual journey map (returning Pro, 7–9am)

Intent: open → know the one move → tick → leave. Chart already exists.

| Step | Surface | What they see | Friction |
| --- | --- | --- | --- |
| 0 | Home `/` | Two filled greens: **Open your chart** + **Open Protocols**; ghost **Today’s sky**. Path “Chart → Today’s sky → Today’s Move → Soul.” Four room-essay cards. | Daily job is body copy, not the button. Chart CTA wins the morning path. |
| 1 | Today `/transits` | Signal (rust) → **MAIN ACTION** in sage → Why closed + micro line → text link Open Protocols → conditioning → sky table below fold. | Action findable on 1280 and 390. Signal headline competes (larger, higher). Micro line = second imperative outside Why. Open Protocols is not a button. |
| 2 | Why (optional) | Four paraphrases of the same skip-stim / Sacral-yes line + strategy jargon. | Opens → less sure. Leave closed. |
| 3 | Protocols empty kit | Weather chips (repeat Today) → kit strip + dashed twin CTA → intention → **Move**. | **Empty 390: Move at y=887 — fully off first screen.** Empty 1280: first checkbox y=830 (below 800). |
| 3b | Protocols filled kit | Compact kit row + kit fact + intention → Move. | Dashed CTA gone; first checkbox still ~fold line because intention + fact sit above. |
| 4 | Tick Move | Rows + Do/Don’t + baseline. Empty shelf rows say “(consider adding)”. | Prove-it works when “From your kit” appears — currently under the fold. |
| 5 | After | This week bridge + “0 checked · Mon–Sun · America/New_York”. | Loop never closes near the checks. Wrong TZ vs chart. |

**Net:** Today can be *understood* in one screen. Protocols cannot be *done* in one screen. The daily verb loses to onboarding chrome.

---

## 2) Hierarchy / density by surface

### Today — right stack, wrong weights
- Order good: signal → action → out-link → conditioning → reference dump.
- Signal (black, large) outranks Main action (medium weight in pale sage).
- Why closed = keep. Micro “Work with your back to a wall…” should live *inside* Why or be the only Why.
- Conditioning notes = one bullet — keep, don’t grow.
- Planetary table at y≈1378 / 390 y≈1731 — fine as research, not decision.

### Protocols — prove-it buried
- WeatherStrip idea right, altitude wrong (above kit, repeats Today).
- Empty kit: **two** “Add what you own” regions + five starter chips.
- Intention looks required (full sunken field); optional in name only; last thing on 390 fold.
- Move card packs checks + Do + Don’t + baseline — rows are the product; Do/Don’t is essay.
- Progress = `0/3` + 8px bar only. No streak, no yesterday, no ring.

### Chart — reading OK, editor dense when open
- Collapsed “Edit / switch person” = right default.
- Opened form: three peer actions (Save friend / Update / Preview) + seed noise (local 13/10 duplicate Yous — don’t treat as prod).
- Bodygraph contrast (deep green defined, rust gates, sand card) = **palette reference** for the rest of the app.

### Kit
- Empty = setup gate every morning (Whoop doesn’t re-pair daily).
- Filled one-row strip + “From your kit” = the prove-it story — protect this, put it where the eye hits.
- Kit fact trivia between shelf and intention = morning tax.

### Home / Login / Soul
- Home: keep Free/Pro one-liner; cut duplicate room essays for returners; one primary for returning users (Today or Protocols).
- Login (Vercel): invite-only honest; waitlist can’t see Free vs Pro deal.
- Soul: signature + meters good; essays secondary — not a morning surface.

---

## 3) Colour elevation (same hues, greater)

**Keep:** sand `#f7f6f2`, growth `#4a6b53`, energy `#c87d55` (+ soft/ink steps). Do not rebrand.

**Problem:** accent used as wash.
- growth-soft vs canvas **1.19:1**; elevated vs canvas **1.09:1** — cards barely lift.
- Sage fills entire Main action + entire Move → cannot also mark “the one button.”
- Home: two growth fills.
- Rust does “today” *and* fine print (disclaimer energy-ink).
- `--fg-muted` on canvas **3.40:1** — “Resets in…”, “0/3”, “optional” fail the scan layer.
- Dark Basalt tokens exist but **no toggle**; as tokened, growth on `#121513` is **3.08:1** and growth-soft ≈ canvas — muddy. Don’t ship dark until fills/muted lift.

**Elevate without new hues:**
1. One filled growth control per view (Protocols: not Refresh — next unticked / “Start morning”).
2. Inside Move: growth only on progress fill + completed row; card stays sand/elevated.
3. Energy only for “what the sky just did” (one chip + new-signal label). Don’t column = ink on sand.
4. Lift meta type from muted → `fg-secondary` (`#5e645c`, ~5.6:1).
5. Real elevation: deeper canvas *or* action card on elevated + soft shadow (`shadow-soft` exists, barely used).
6. Borrow Chart bodygraph ratio: small saturated marks on sand, not pale slabs.

---

## 4) Competitive bar (Whoop / Oura / Levels-class)

Seen in UI only — biometrics exist in DB but nowhere on surfaces; Today disclaims them.

| Expectation | Baseline today |
| --- | --- |
| Recovery / readiness at top | Chart-weather labels (Hyper / Focus corner) look like check-in, aren’t |
| Close the loop on the log card | Loop is a buried week sentence + wrong TZ |
| One-tap morning | Home → Today → text link → scroll kit/intention → checkbox |
| Habit stickiness | Explains the system more than reflects the user back |
| Kit / device quiet after setup | Empty kit re-asks; even checks say “consider adding” |

Bar is not “add biometrics now.” Bar is **ritual stickiness + fold discipline + loop closure** on the check surface.

---

## 5) Soft P1s (PR #45) — still relevant?

| Item | Status | Impact now |
| --- | --- | --- |
| Why open-by-default | **Gone** (closed at 1280 + 390) | **Low** — residual: micro line outside disclosure; opened Why is repetitive |
| Empty-kit double CTA + intention | **Still here** | **High on 390, medium-high on 1280** — intention is the structural pusher; double CTA is empty-state amplifier. Fix before colour. |
| Week bridge paragraph | **Still here** | **Medium** — y≈1413 / 1933, doesn’t block morning; rewrite/cut |

---

## 6) Ranked backlog (P0–P2) with evidence

### P0 — ritual / fold (ship before palette play)
1. **Protocols: Move above the fold on 390 and 1280.** Collapse empty kit to one quiet line + Add; defer or collapse intention below Move (or behind “Add intention”). Evidence: empty Move y=887@390; checkbox y=830@1280; filled still ~fold because intention+fact.
2. **Home returning path: one primary** — Today’s sky or Protocols (Move), not Chart as the filled green. Ghost Chart secondary. Evidence: two equal growth CTAs; path line already names Move as the job.
3. **Single empty-kit ask** — kill dashed twin; stop “(consider adding)” on the morning check when shelf empty (or demote to soft hint under kit, not in the tick row).

### P1 — hierarchy / loop / colour usage
4. Put Why micro inside disclosure; trim Why body to one sentence + strategy.
5. WeatherStrip beside Move or under it — not above kit; keep ≤1 what’s-new chip.
6. Cut or rewrite This week bridge (“Channel 4-63…”) — no “today” inside week; no HD jargon restating the Move.
7. Progress loop on the Move card: yesterday / week count near checks; timezone = account preferred_timezone (already set) shown honestly — fix “America/New_York” on Wetteren when that’s stale seed.
8. Colour pass: sand cards, sage = button + progress only; rust = sky-did; muted → secondary. One growth fill per view.
9. “Open Protocols” under Main action → real button (or auto-advance after read).

### P2 — trust / chrome / later
10. Nav wrap Soul on 390; Settings icon collapse — tighten.
11. Login waitlist: one Free vs Pro line.
12. Chart people density when open; seed duplicate Yous (dev).
13. Soul essays below meters.
14. Dark theme — only after contrast lift + toggle.
15. Kit fact — evening/trivia slot, not morning column.
16. Underscores in labels (`North_Node`, `Solar_Plexus`); “prove today’s timed leads” → plain English.

---

## 7) Bold bet vs incremental

**Bold (recommended as Option A core):**  
**Morning Ritual mode on Protocols** — first paint = WeatherStrip chips (optional) + **Today’s Move** with first unticked row in view; kit/intention behind “Shelf” / “Intention” disclosure or a bottom sheet. Home for returners deep-links here. Colour: Move card sand + growth progress only. Ship P0 #1–3 + P1 #8 together.

**Incremental (Option B):** Fix soft P1s only (kit twin, intention collapse, Why micro, week bridge rewrite) + muted→secondary. Safer, smaller lift; won’t feel “next level.”

**Colour-first (Option C — not recommended alone):** Token polish without fold reorder. Makes wash prettier; ritual still fails on phone.

---

## What already works — must keep

- Chart / Today / Protocols / Soul IA split (post-#45).
- Invite-only login; Free waitlist “Coming soon — not a live checkout. Chart + daily transits stay free.”
- Main action as single imperative; Why closed by default; one-bullet conditioning notes.
- WeatherStrip chips-only + Full sky on Today (once altitude fixed).
- Filled kit one-row + **From your kit** chip.
- Bodygraph contrast as the richness target.
- Sand / sage / rust hues — greater via restraint, not replacement.

---

## Sources for the decision Page

- This memo: `.grok-handoff/expert-ux-uplift-memo-2026-11-04.md`
- Walk notes: `.../expert-uplift-memo/notes.md`
- Prior soft P1 baseline: `.grok-handoff/today-protocols-ia-split-ux-review.md`
