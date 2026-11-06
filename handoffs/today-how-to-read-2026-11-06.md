# Handoff: Today “How to read” for sky signals + Move

**To:** Full Stack Developer (@dev)
**From:** Grok Bot (PO)
**Date:** 2026-11-06
**Repo:** Benoliverc/hd-biohack
**Why now:** Benjamin asked to include a How to read section on Today for, especially, **Today's new signal**, **Sun / Earth theme**, **Bridged channels (conditioning)**, and **Newly defined centers today** — clearly explaining how each works and why it is relevant for the **Move**.

**Independent FE-only PR.** Separate from the Deep Dive Strategy / Inner Authority / Definition copy ticket. Branch from current `main` (or stack only if you must; do not mix the two features in one PR). No backend / Railway. No merge without Benjamin’s yes after UX → Ship Gate. No standing auto-ship.

---

## Product

Reuse the existing Chart / Soul `LiteracyCoach` pattern — do not invent a new teaching UI.

- Title: **How to read Today**
- Collapsed reopen chip: **How to read**
- Four steps, in this order, using the exact copy below
- Each step jumps to the matching live block on the page
- First visit expanded; “Got it” dismisses to localStorage like Chart/Soul (`baseline.literacy.today.v1`)

### Placement (Move-first — do not undo #68)

The Move must stay first on Today. **Do not put the coach above the Move or in the slim header.**

Place `<LiteracyCoach variant="today" />` on `frontend/src/app/transits/page.tsx` **after** `<TodayIndication />` and **before** the Sun / Earth card.

On a narrow phone, treat Today like Chart’s compact mode (active step only, tighter cap) so an expanded first-visit coach does not become a tall wall between the Move and the sections it explains.

### Jump targets

Add stable ids and `scroll-mt-[calc(var(--app-header-h,4.5rem)+0.75rem)]` (same as Chart’s `#bodygraph`):

| Step | `id` | Where |
|---|---|---|
| Today's new signal | `today-new-signal` | The existing `data-testid="daily-signal"` block in `TodayIndication.tsx` |
| Sun / Earth theme | `today-sun-earth` | The Sun / Earth card on `transits/page.tsx` |
| Bridged channels (conditioning) | `today-bridged-channels` | The bridged-channels card |
| Newly defined centers today | `today-newly-defined` | The newly-defined-centers card |

If overlay is missing (sky-only, no natal), the two overlay cards may be absent and those jumps can no-op. Do not resurrect the old “Conditioning notes” heading. Do not change Move copy, Energy/Space, vs-yesterday collapse, HD fact, or the disclaimer footer.

---

## Implementation notes

1. Extend `LiteracyCoachVariant` with `"today"`.
2. Add `TODAY_LITERACY_STEPS` and `LITERACY_STORAGE_KEYS.today` in `frontend/src/lib/hdCopy.ts` (English source-of-truth, same as Chart/Soul literacy — no i18n message-file sweep).
3. Wire title / reopen label / test id:
   - `data-testid="today-literacy-coach"`
   - reopen: `today-literacy-coach-reopen`
4. Use Chart-style narrow compact styling when `variant === "today"` (or `variant === "chart" || variant === "today"`).
5. Educational / not medical. No supplement or protocol advice. Straight ASCII quotes in TS strings.
6. Do not claim the daily signal *is* the Move, or that a temporary center changes Type. The copy below is careful about that — use it exactly.

---

## Copy (use exactly)

### 1. Today's new signal

**title:** Today's new signal
**jumpLabel:** Today's new signal
**targetId:** today-new-signal

**body:**
This headline is the one change in the sky compared with yesterday. Baseline picks it in a fixed order: the Moon moving into a new gate or line, then a shift in the Sun's line or gate, then new pressure on a hanging gate you already carry, then a change in today's bridges or temporary centers. If none of those moved, you will see a continuity note — another day of the same theme, not a new assignment.

The Move above is the one thing to do with that weather. Read the signal as the "what changed" context for why this Move showed up, not as a second to-do. A Moon or Sun shift colors the day or week the Move sits inside. A conditioning update usually lines up with the bridges and temporary centers below, which also shape your Energy, Space, and the Move itself.

### 2. Sun / Earth theme

**title:** Sun / Earth theme
**jumpLabel:** Sun / Earth
**targetId:** today-sun-earth

**body:**
The Sun and Earth are always opposite each other in the sky. The Sun gate is the week's broader theme — what life is highlighting — and the Earth gate is the ground under it, the balancing place to stand. This pair moves slowly (the Sun stays in one gate for about six days), so it is a chapter, not an hourly weather report.

The Move is daily and practical. Sun / Earth is the longer background that Move belongs to. You do not need to act on the gate numbers separately, and they are not a second protocol. If you want a reason the week feels like it has a flavor, look here; if you want what to do today, stay with the Move.

### 3. Bridged channels (conditioning)

**title:** Bridged channels (conditioning)
**jumpLabel:** Bridged channels
**targetId:** today-bridged-channels

**body:**
A channel is a full wire between two centers. You may already hold one end (a hanging gate). Today's sky can bring the other end — or both ends — and temporarily complete a channel that is not part of your natal chart. That completed wire is a bridge. It is called conditioning because it is borrowed circuitry: it can feel vivid and magnetic, and it is not a permanent change to your Type or Strategy.

Bridges are one of the main inputs to today's Energy and Space, and therefore to the Move. A motor bridge can leave you feeling more charged than usual; a mind or identity bridge can pull you toward focus or a change of place. The Move often translates that as "treat the energy as borrowed" or "one yes, then pause." Notice who or what feels suddenly complete today — that chemistry is often the other half of the wire, not a life verdict.

### 4. Newly defined centers today

**title:** Newly defined centers today
**jumpLabel:** Newly defined centers
**targetId:** today-newly-defined

**body:**
Your natal chart has defined centers (steady, always-on) and open ones (where you sample life). When today's sky completes enough channels to light an open center, that center shows up here as temporarily defined. It can feel like unusual pressure, fuel, emotion, or willpower that was not yours yesterday. It is a weather event, not a new personality.

These temporary centers are one of the strongest reasons the Move reads the way it does. A borrowed Sacral or Heart can raise Energy and produce a "use the charge once, then stop" Move — it does not make you a Generator. Fresh mind centers (Head or Ajna) often ask for a quieter focus corner. If this list is empty, the sky is not lighting new centers today, and the Move leans more on your usual Type strategy. Do not over-identify with a center that will fade when the transit moves on.

---

## Out of scope

- Deep Dive Strategy / Inner Authority / Definition essays (separate ticket)
- Changing how the daily-signal waterfall, overlay, Energy, Space, or Move are computed
- Vs yesterday, HD fact of the day, planetary-gates table explainers
- Share cards, kit line, Protocols / Soul
- Translating literacy bodies into de/fr/es/nl

When the PR is up, reply with the number, branch, tip SHA, and confirm it is not mixed with the Deep Dive copy PR.
