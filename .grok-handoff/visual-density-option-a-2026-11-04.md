# Handoff — Visual density Option A (hierarchy + Lucide + status)

**PO:** Grok Bot · **Dev:** Full Stack Developer (@dev)  
**Date:** 2026-11-04 (Asia/Hong_Kong)  
**Repo:** Benoliverc/hd-biohack · live https://hd-biohack.vercel.app  
**Benjamin:** “Ship” on emptiness research — Option A only  
**Suggested branch:** `feat/visual-density-option-a`  
**FE-only expected** (no API/Railway unless you discover a real need)

## Goal
Fix “a bit empty” **without** photos or a new illustration system. Make morning surfaces feel finished via card lift, one focal metric/verb, a thin labeled Lucide layer, and status glyphs.

**Analog:** WHOOP / Oura (score-first + glyphs + color) — **not** Calm/Headspace art density.

## Out of scope (do NOT)
- Stock wellness photos, nature heroes, supplement lifestyle shots, mascots
- New illustration / Lottie system
- Decorating BodyGraph, Today's Move + DO/DON'T bodies, planet table, login pillars, existing primary nav icons
- Option B abstract art (only if A still cold later — not this PR)
- Soft i18n residuals / API indication bodies

## Evidence (read before coding)
- PO Page: Baseline emptiness recommendation (chat)
- UX live notes + shots: `/workspace/hd-biohack-ui-failures/2026-11-04/emptiness-research/` (esp. `02-home-desktop.png`, `04-today-desktop.png`, `NOTES.md`)
- Source/competitive: `.grok-handoff/emptiness-research-source-competitive.md`
- Research: `/workspace/baseline-visual-density-research-2026-11-04.md`
- Prior expert uplift memo if present: `.grok-handoff/expert-ux-uplift-memo-2026-11-04.md`

## Acceptance — implement all of (1)–(4); (5) only if cheap

### 1) Hierarchy / one primary
- Each morning surface (Home hero path, Today indication/MAIN ACTION, Protocols progress) has **one** clear primary verb or metric optical weight.
- Stop dual competing growth washes that flatten cards into canvas.
- Raise **card lift**: elevated cards must clearly separate from `--canvas` (border and/or shadow/token — match Grounded Vitality; don't invent a new palette).

### 2) Thin Lucide layer (~8–12 **new** uses; library already `lucide-react`)
Use **labeled** icons (text visible; no icon-only for abstract HD). Suggested placements:
- Settings: Language + Timezone section headers (e.g. `Languages` / `Globe` or clock)
- Protocols: empty kit / Add affordance; optional time-of-day glyph on Morning / Midday / Evening Move rows
- Today: signal / “Newly defined centers” affordance (chips with light glyph or center mark — not four naked words in a void)
- Home: only if a card still lacks type cue after lift (don't re-icon the four Home outcome cards if they already have glyphs)

Keep stroke weight consistent with existing Header icons. Prefer existing Lucide names already in the app when possible.

### 3) Status glyphs / density without art
- Protocols progress: bar + “n/m done” must read as a status strip (not a hairline void).
- Today: center chips for newly defined centers; optional vs-yesterday cue weight if already in chrome.
- Prefer accent bar / chip / progress over decorative icons on every paragraph.

### 4) Emptiness hotspots (from live audit)
Fix visual voids called out in NOTES without adding photos:
- Settings desktop: section icons + slightly denser card content (still max-w-lg OK)
- Today MAIN ACTION: don't leave a half-blank right pane — tighten layout or give secondary status cluster room with purpose
- Home equal-height orphan labels (“Me” / “Ready” floating in empty card bottom) — align content or reduce forced equal height
- Protocols collapsed Shelf/Intention/kit rows: clearer chevron/add affordance weight

### 5) Optional (only if still barren on desktop after 1–4)
- Slightly tighter ritual content max-width **or** leave for follow-up — don't invent a whole right-rail in this PR unless trivial.

## i18n
New visible strings must go through `frontend/src/lib/i18n/messages/{en,nl,de,fr,es}.ts` (parity). Prefer reusing existing keys. Icon-only chrome with aria-label still needs locale strings for a11y labels.

## Assert / QA before READY_FOR_UX
```
cd frontend && npx tsc --noEmit
# plus any existing assert scripts you normally run
```
Smoke: `/` `/settings` `/transits` `/biohack` `/login` (and Chart untouched visually for BodyGraph).

## Ship path
Open PR → reply here with PR URL + tip SHA + short “what changed”  
→ PO routes **UX UI Review** → **Ship Gate** → **Benjamin merge yes widget** → you merge + Vercel deploy (Railway skip if FE-only).

## Done looks like
Benjamin hard-refreshes and morning path no longer feels barren; still calm; zero new photos; Lucide uses stay sparse and labeled.
