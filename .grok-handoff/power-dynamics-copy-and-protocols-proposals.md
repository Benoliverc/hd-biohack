# Power Dynamics copy + Protocols proposals

**Date:** 2026-10-27 (Asia/Hong_Kong)  
**Branch (Improvement 1):** `feat/power-dynamics-unique-copy`  
**App:** Baseline · live hd-biohack.vercel.app  
**Status:** FE/BE copy implemented on branch (no PR). Protocols = analysis + 3 proposals only (no code).

---

## 1. Improvement 1 — Power Dynamics to Tune

### Where it lives
- **Generated bodies:** `backend/app/hd/soul_sync.py` → `_compromise_tuning_block()` used by Soul playbook card `power_dynamics`
- **Literacy coach intro:** `frontend/src/lib/hdCopy.ts` → `SOUL_COACH` entry `power-dynamics`

Ownership (You vs They) stays dynamic from compromise role `full` (`self` | `other`). Headlines for Struggle stay **Purpose & Tenacity Tuning**; body still names the Struggle channel.

### Full text for Benjamin’s listed pair (ownership as quoted)

#### Concentration Tuning — They hold
They hold the full Concentration channel (Sacral–Root focus under pressure). Deep-work stamina and the urge to dig into one thing until it is done lives more steadily in them; you may only catch the pressure half and feel restless, locked out, or suddenly 'behind' when they disappear into detail.

What to do: before a long shared day, ask them how long they need heads-down and what counts as 'done for now.' Name one interruption you need permission for (meal, kids, a real emergency) so their focus does not feel like rejection. If pace starts to clash, pause and ask who is setting the focus thermostat today — same room, different set points — then agree a window instead of pushing through.

#### Exploration Tuning — They hold
They hold the full Exploration channel (self-directed sacral motion). Their body wants to follow their own code and try the next path; you may only hold a hanging half and feel either pulled into their adventures or left watching from the shore.

What to do: ask them to name the exploration before it accelerates — destination, time box, and whether this is solo scouting or a shared trip. Give a clear yes, soft maybe, or not-today before calendars or money move. If you feel steamrolled (or they feel stalled), stop and say who is running the adventure thermostat right now, then slow to the slower person's real yes.

#### Synthesis Tuning — You hold
You hold the full Synthesis channel (needs, fairness, who is in or out). You feel consistent pressure around resources, belonging, and whether the deal is fair; they may only hold a hanging gate and feel the mood of inclusion or exclusion without the same steady signal.

What to do: before rewriting house rules, guest lists, or money plans, ride your emotional wave and then state the need in plain words — food, rest, loyalty, or fair share — not as a sudden revolution. Ask them what they heard the need was, so principles do not get mistaken for attack. If the room heats up, name who is holding the belonging thermostat and pause big 'in/out' decisions until both of you feel the wave settle.

#### Structuring Tuning — You hold
You hold the full Structuring channel (insight that needs the right words). Breakthrough knowing wants to leave your Ajna as a clear frame others can use; they may only hold a hanging half and hear genius as weird if the packaging is rushed.

What to do: protect a short incubation window, then translate the download into one sentence, one diagram, or one next step before you pitch it. Ask them 'Did that land as useful or as odd?' and adjust the frame, not the insight. If either of you pushes pace on a half-baked idea, name who is running the clarity thermostat and wait for recognition before the next dump.

#### Purpose & Tenacity Tuning — You hold (Struggle channel)
You hold the full Struggle channel (purpose through challenge — also called the channel of Struggle). Stubborn courage and the hunt for what is worth fighting for live more steadily in you; they may only hold a hanging gate and feel the pressure of a fight without the same sense of meaning.

What to do: before locking into a solo battle (work, family, principle), check in out loud — 'Is this fight connected to purpose, or am I grinding for sport?' If yes, invite them into the why so tenacity looks like devotion, not abandonment. If no, walk away together and save the spleen. Do not recruit them into a war they never named as theirs.

#### Transformation Tuning — They hold
They hold the full Transformation channel (ambition guided by instinct). Drive to rise and change material or social position lives more steadily in them, tempered by splenic knowing about what will last; you may only hold a hanging half and feel the climb without the same inner 'this will endure' meter.

What to do: before a promotion push, move, or big spend, ask them to name both the ambition and the gut check — what must stay intact while they climb. Say what stability you need on the other side of the change. If pace starts to feel like brittle striving, pause and say who is running the ambition thermostat, then slow until instinct and drive agree.

#### Community Tuning — They hold
They hold the full Community channel (loyalty, family deals, honest exchange). Emotional clarity and willpower meet in them around who is family, who owes what, and whether the bargain feels warm and fair; you may only hold a hanging gate and feel the loyalty weather without the same deal-making signal.

What to do: ask them to make the bargain explicit — time, money, care, holidays — before resentment writes the contract in silence. Say what you think the deal is, and renegotiate out loud when life changes. If either of you feels used or locked in, name who is holding the loyalty thermostat and pause new commitments until the exchange feels mutual again.

Also covered in code (not in Benjamin’s list): **Desire & Imagination Tuning** (Recognition) + a plain default for any other compromise channel.

### What changed
- Replaced one-line template (`They/You hold… Name who is running the full thermostat…`) with unique ~100–120 word bodies (what it is + What to do).
- Thermostat metaphor kept sparingly, explained in context (focus / adventure / belonging / etc.).
- Literacy coach intro now points at per-card who + what-to-do.
- Test asserts longer Struggle copy and absence of the old short line.

---

## 2. Why Protocols still feel the same every day (short analysis)

P0 redesign (`feat/protocols-redesign-p0`) already fixed the worst sameyness: Daylight / Caffeine / Magnesium demoted to baseline kit; hero comes from Today’s indication; timed leads pick from energy × bridge × kit; week theme uses Sun/Earth summary; localStorage checklist exists (`protocol-done:v1` per user+chart+HKT day) with `N/M done`.

Remaining sameyness sources:

1. **Sky moves slowly.** Adjacent HKT days often share the same bridge / newly-defined centers → same hero + same morning/midday/evening leads. Novelty Contract lives on **Today**, not Protocols.
2. **Do / Don’t and natal baseline are Type/Authority-stable** — they barely change day to day by design.
3. **Kit-weighted picks stabilize.** Once inventory is set, owned items win the same slots whenever weather class matches (e.g. Spleen days → Zinc-ish lead).
4. **Checklist is quiet.** Done state is local-only, resets each HKT day, no weekly rollup / streak / “what you completed” surface — so completing actions doesn’t create a lasting sense of progress.
5. **Week card is thin.** Theme + sky note only; no week-scale habits or progressive checklist, so “Protocols” still reads as a daily twin of Today rather than a distinct instrument.

---

## 3. Three proposals (Benjamin picks)

### A) Daily novelty dial — keep daily, make day-to-day differences obvious
**Name:** Sky-rotated daily protocol (visible delta)  
**User change:** Each HKT day Protocols shows a clear “What’s new vs yesterday” chip plus at least one rotated lead or micro-ritual keyed to that day’s novelty signal (same contract as Today: ≥1 new HKT-day signal). Relative countdown to HKT 07:00 reset stays.  
**Tech (high level):** Reuse `checkin/novelty.py` daily_signal inside `build_protocol`; persist yesterday’s lead fingerprint; force rotation among eligible timed supports when fingerprint matches; surface `vs_yesterday` on WeatherStrip / TodaysMoveCard.  
**Pros:** Aligns with Daily Novelty Contract; keeps daily habit loop; small conceptual jump.  
**Cons:** On quiet sky weeks variance may still feel mild; needs careful anti-whiplash so kit leads don’t thrash.  
**Effort:** M  

### B) Weekly protocol spine — day is a slice of the week
**Name:** Week-first Protocols  
**User change:** Primary surface becomes This Week (theme, 3–5 week habits, emphasize/pause list). Daily view is a thin “today’s slice” of that week plan + sky micro-adjust, not a full re-plan.  
**Tech (high level):** Expand `weekly_plan` (habits + emphasize/pause already stubbed empty in rules); FE default tab/section to Week; daily_plan becomes derived slice; optional week-keyed completion store.  
**Pros:** Matches how supplements/habits actually work; less “why did this flip overnight?”; clearer product split vs Today.  
**Cons:** Conflicts with “Protocols as daily instrument” unless Today stays the novelty home; bigger IA change; risk of feeling static within a week.  
**Effort:** L  

### C) Checklist done-state that proves action (combine with A)
**Name:** Prove-it checklist + weekly rollup  
**User change:** Stronger completion UX — checkboxes already exist; add progress bar, confetti-light “move complete,” optional note, and a Week review of what you marked done (HKT week). Make baseline kit optionally checkable. Server-optional later; start local.  
**Tech (high level):** Extend `protocol-done:v1` to week key + item catalog; TodaysMoveCard progress; WeekSkyCard “Completed this week”; later optional `WeeklyProtocol` snapshot read. Pairs cleanly with A’s daily delta.  
**Pros:** Directly answers “show actions are done”; low risk; ships value even if sky variance stays modest.  
**Cons:** Alone doesn’t fix samey *content* — only samey *feeling of inaction*; needs A (or B) for substance.  
**Effort:** S (local UX) / M (if server sync + streaks)  

### Recommendation
**Ship A + C (start C first if you want a same-week win):** C makes done-state feel real immediately (S); A restores day-to-day difference under the existing Novelty Contract without abandoning daily Protocols. Hold B until Today vs Protocols roles feel clear — B is the right long-term spine if Protocols should stop competing with Today for daily novelty.

---

## 4. Ship Gate note
- Branch: `feat/power-dynamics-unique-copy` (local commit; no PR opened).  
- Protocols proposals: draft-only — await Benjamin pick before any Protocols FE/BE work.
