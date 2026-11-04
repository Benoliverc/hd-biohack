# Emptiness research — source audit + competitive cues

**Question:** Does HD Biohack feel empty because it needs more images/icons?  
**Audience:** PO (Grok Bot) → Benjamin  
**Date:** 2026-11-04 Asia/Hong_Kong  
**Scope:** Research only — no UI code changes.  
**Live context:** post-PR #48 i18n P0 chrome; Grounded Vitality; dark tokens exist.  
**Related prior UX:** `.grok-handoff/expert-ux-uplift-memo-2026-11-04.md` (hierarchy / accent misuse, not missing art).

---

## Executive recommendation (decisive)

**Do not add stock photos or a decorative illustration system.**  
**Do add a thin, semantic icon + status-glyph layer on action surfaces, and fix hierarchy / density of *content* (one big number / one verb), not wallpaper.**

Root cause of “empty” is **not** missing nature photography. It is:

1. **Low card lift** (elevated≈canvas; growth used as wash → nothing pops — already diagnosed in expert uplift memo).  
2. **Typography-first rooms with little glanceable signal** on Home / Settings / empty Protocols (essay + borders, few glyphs).  
3. **Icons concentrated in chrome, absent from work surfaces** (Today, Protocols body, Settings are mostly text).  
4. **max-w-6xl + generous py-8** on desktop leaves large gutters that read as barren when cards are pale.  
5. **The product’s real visual assets already exist** (BodyGraph SVG, progress bars, energy/growth chips) but sit below the fold or on Chart/Soul — morning surfaces don’t inherit that density.

Risk of photos / rich illustration: **generic AI wellness slop**, i18n cost, dark-mode retouch, mobile weight, and competing with HD bodygraph as the signature visual.

---

## A) Source audit — visual density system

### A1. Icons

| Item | Finding |
| --- | --- |
| Library | **`lucide-react` ^1.59.0** only (`frontend/package.json`). No Phosphor / Heroicons / custom icon set. |
| Distinct Lucide glyphs in use | `Activity`, `FlaskConical`, `Orbit`, `UserRound`, `Sparkles`, `Settings`, `LogOut`, `Shield`, `Lock`, `Eye`, `EyeOff`, `ArrowLeftRight` (~12). |
| Where used | **Header nav** (every primary dest + settings/admin/sign-out) — `src/components/Header.tsx`. **Home outcome cards** (4 icons in sunken/energy circles) — `src/app/page.tsx`. **Login pillars** — `src/app/login/page.tsx`. **Entitlement gate** Lock/Sparkles — `BiohackingEntitlementGate.tsx`. **Soul** swap ArrowLeftRight only. |
| Text-only / icon-poor | **`/transits` (Today)** — no Lucide; text eyebrows, ▸ disclosure, pills. **`/biohack` (Protocols)** body — KitStrip / TodaysMoveCard / WeatherStrip / InventoryPanel / week list — badges & bars, **no icons**. **`/settings`** — pure form text. Empty Protocols CTA — text + dashed box only. Chart deep-dive / literacy coach — step **dots**, not icons. |

**Philosophy in practice:** Icons = wayfinding chrome + marketing pillars. Ritual surfaces stay typographic.

### A2. Images / illustrations

| Asset type | Present? |
| --- | --- |
| `public/` marketing art | **No** app `public/` tree with heroes/illustrations (only Next internals / verify PNGs / favicon). |
| `next/image` / `<img>` product UI | **None** in `src/**/*.tsx`. |
| Hero / empty-state illustration | **None**. |
| Avatars | **None** (name chip / label text only). |
| Signature viz | **BodyGraph SVG** — `src/components/BodyGraph.tsx` + `src/lib/bodygraphGeometry` (centers, channels, personality/design gate colors). This is the product’s “illustration.” |
| Misc | `frontend/header-390-biohack.png`, `.ux-verify/*.png` — QA shots, not shipped art. Geist font files under `src/app/fonts/`. |

### A3. Spacing / padding patterns

| Surface | Pattern | Emptiness note |
| --- | --- | --- |
| Shell | `AppShell`: `mx-auto max-w-6xl px-4 py-8` | Wide desktop measure; large top/bottom air. |
| Home | Hero `rounded-3xl … p-6 sm:p-8`; grid `gap-4` cards `p-5`; page `space-y-8` | Hero is copy + CTAs; four equal essay cards → rooms feel like brochure, not dashboard. |
| Today | Page `space-y-6`; indication card `p-5`; conditioning `p-5`; energy panel `p-5`; table full-bleed card | Content exists but **visual weight is uniform borders** — signal headline competes with main action (expert memo). |
| Protocols | `space-y-4` / `space-y-5`; Move card `p-5`; kit `px-4 py-3`; empty dashed `px-5 py-8 text-center` | Empty kit / intention can push Move off fold (expert memo) — “empty” = wrong altitude of chrome, not missing art. |
| Settings | `max-w-lg space-y-6`; cards `p-5` | Correctly quiet; feels sparse vs Home because no icons and no status glyphs. |
| Login | Gradients + pillar cards; form `p-6 sm:p-8` | **Richest** decorative surface in the app (radial growth/energy blurs). |

### A4. Empty / loading / skeleton

| Pattern | Where |
| --- | --- |
| `animate-pulse` skeletons | Home hero + CTA; Protocols `protocol-skeleton` (3 blocks); occasional chip skeletons. |
| Text loading | Settings `common.loading`; Soul “Loading saved charts…”; TodayIndication loading card; transits “Loading today's gates…”. |
| Empty CTAs | Protocols no-chart dashed card (`page.protocols.emptyTitle/Body`); Soul empty; KitStrip empty hint + starter chips; i18n `empty.signInSettings`. |
| Illustrated empty states | **None** — dashed border + copy + primary button only. |

Skeletons exist; **empty states are structural, not pictorial.**

### A5. Color / texture / status

| Mechanism | Detail |
| --- | --- |
| Brand system | **Grounded Vitality** — linen light / basalt dark CSS vars in `globals.css` (`--canvas`, `--elevated`, `--growth*`, `--energy*`, `--recovery`, `--danger`). |
| Texture | `body::before` **2% SVG fractal noise** — intentional paper/mineral grain (canvas only). |
| Gradients | Login radial soft blobs; entitlement gate `bg-gradient-to-t` fade; not used on Home/Today/Protocols heroes. |
| Status language | Tier badge growth/energy pills; WeatherStrip energy chips; Move progress `bg-growth` bar; “From your kit” / “new vs yesterday” badges; LiteracyCoach **step dots**; BodyGraph defined/open fill. |
| Card lift | Soft shadow token `shadow-soft` (near-invisible). Expert memo: elevated vs canvas ~1.09:1 — cards barely lift → **reads empty even when filled**. |

### Density philosophy (docs / tokens)

- Explicit design comment in `globals.css`: organic earth tones; light default; dark via `html.dark`.  
- Tailwind extends semantic colors + `rounded-2xl/3xl` + `shadow-soft` — **no illustration tokens, no icon size scale beyond ad-hoc `h-4/h-5`**.  
- Prior UX memos push **hierarchy and accent discipline**, not more art (expert uplift: “using less fill, not replacing hues”; Whoop-style morning verb).

---

## B) Competitive / category cues (evidence only)

### Calm — illustration + soft atmosphere, not icon grids

- Sleep / mindfulness brand leans **hand-painted gradients, texture, silhouettes, ethereal light** — a commissioned illustration system for conceptual clarity, not dense chrome.  
  Sources: [Calm Sleep Visual System — Shannon Rollins](https://www.shannonbr.com/work/calm-sleep-visual-system), [BUCK × Calm Sleep](https://buck.co/work/calm-sleep-visual-system), [Eric Fillingame — Calm Sleep UI](https://ericfillingame.com/work/calm-sleep).  
- Category cliché called out elsewhere: blues/purples + **nature photos** + light gradients + playful illustration — easy to look generic.  
  Source: [Big Human — Mindfulness app design trends](https://www.bighuman.com/blog/trends-in-mindfulness-app-design).  
- **How they fill empty:** full-bleed / plan artwork and mood lighting behind sparse controls — art *is* content for a media product. HD Biohack is a **decision ritual**, not a sleep player → same tactic would be costume.

### Headspace — bespoke illustration + quirky icons as brand

- Distinctive **illustration library** (faces, metaphors), **bespoke rounded icons** (explicitly not stock), bold emotional palette + functional neutrals; light/dark tokens.  
  Sources: [Steven Sczepanik — Headspace DS](https://www.sczepanik.com/headspace), [karen yoojin hong — Headspace brand](https://www.karenyoojin.com/headspace), [Figma Blog — Headspace design system](https://www.figma.com/blog/building-a-design-system-that-breathes-with-headspace/).  
- Orange mark + character metaphor differentiates from Calm’s nature-photo sea.  
  Source: [Big Human](https://www.bighuman.com/blog/trends-in-mindfulness-app-design).  
- **Fill empty without clutter:** brand art on content cards; UI chrome stays simple. Costly to copy; without owned characters, Lucide + stock = “also-ran wellness.”

### WHOOP — data density that feels simple (closest analog for “empty morning”)

- **Score-first**, progressive disclosure: glanceable Recovery/Strain/Sleep → trends → deep graphs. Dark UI so **semantic green/yellow/red** pops; oversized primary metric; no decorative photos.  
  Source: [925studios — WHOOP design breakdown](https://www.925studios.co/blog/whoop-design-breakdown).  
- **Fill empty:** one big answer + meaningful color, not icons wallpapering white space. Coaching *is* the score.  
- Direct lesson for HD: emptiness cure = **compress today’s signal into one glanceable artifact** (type + color + optional glyph), not add lakes/sunsets.

### Oura — scores, nature-tinged iconography, color as state

- Today focuses on **“one big thing”**; Vitals glance; My Health trends. Design system uses **color to signal biometric state**; nature/body iconography for metrics (critique notes crown-as-optimal as inconsistent).  
  Sources: [Oura — New app design](https://ouraring.com/blog/new-app-design/), [IXD@Pratt — Design Critique: Oura](https://ixd.prattsi.org/2026/09/design-critique-oura/).  
- **Fill empty:** metric tiles + state color + light environmental mood — still score/icon led, not photo galleries.

### Daylio — icon/emoji density as the product

- Ultra-simple logging: **5-point smileys + activity icon grid**; calendars/charts for review. Emptiness avoided by making icons the *input affordance*, not decoration.  
  Sources: [Daylio App Store](https://apps.apple.com/us/app/daylio-journal-mood-tracker/id1194023242), [PMC — Daylio mood quantification](https://ncbi.nlm.nih.gov/pmc/articles/PMC5344152/).  
- Lesson: icons earn density when they **encode actions/states**; random Lucide on essay cards won’t.

### Notion (sparse contrast) — typography + whitespace as feature

- Document-first, minimal chrome, calm type, generous measure; hierarchy via size/weight, not illustration. Emptiness is intentional — content is user-authored.  
  Sources: [Notion blog — page design](https://www.notion.com/blog/updating-the-design-of-notion-pages), [DesignMD — Notion design language](https://www.designmd.co/blog/notion-design-language), [Blake Crosley — Notion design](https://blakecrosley.com/guides/design/notion).  
- Contrast: Notion’s empty = blank page waiting for you. HD’s empty = **product didn’t answer “what do I do?”** — so Notion-level sparseness without a hero metric feels unfinished, not premium.

### Category takeaway table

| Product | Primary fill | Secondary | Avoid for HD? |
| --- | --- | --- | --- |
| Calm | Illustration / atmosphere | Soft UI | Full-bleed stock nature |
| Headspace | Character illustration + bespoke icons | Color | Fake mascot without brand investment |
| WHOOP | Big scores + semantic color + charts | Progressive disclosure | Photo wallpaper |
| Oura | Score tiles + state color + light icons | Trends | Crowding Today with five equal tiles |
| Daylio | Action icons / emoji | Charts | Icon soup without logging verb |
| Notion | Type + whitespace | Minimal chrome | Sparseness without a primary answer |

---

## C) Constraints for this product

### Photos / stock lifestyle imagery

| | |
| --- | --- |
| Pros | Instant “fullness”; familiar wellness category cue. |
| Cons | **i18n:** faces/settings read culturally specific. **Dark/light:** need dual crops or muddy overlays. **Perf:** LCP on mobile. **Trust:** HD + biohack wants clinical-calm, not spa brochure. **Slop risk:** highest — looks like every AI wellness landing page. |
| Verdict | **Don’t**, except maybe one owned login/marketing asset later — never on Today/Protocols ritual. |

### Icons (Lucide extend / small semantic set)

| | |
| --- | --- |
| Pros | Already in bundle; i18n-safe; dark/light OK; tiny payload; aids scan of actions (check, kit, sky, settings rows). |
| Cons | Overuse → generic SaaS; Lucide is not distinctive brand (Headspace avoids stock). |
| Verdict | **Yes, selectively** — actions, empty CTAs, settings rows, status (lock/pro/sky). Cap density; keep essay cards from becoming icon farms. |

### Texture / color blocks / gradients

| | |
| --- | --- |
| Pros | Already have noise + growth/energy soft fills; lift cards, frame “the one thing,” login already proves it. Cheap, themeable, i18n-safe. |
| Cons | Expert memo: growth-as-wash kills accent; muddy dark contrast if overdone. |
| Verdict | **Yes — primary density lever.** Stronger card lift, one accent fill per screen, energy for “today,” growth for “do.” |

### Illustration system (owned)

| | |
| --- | --- |
| Pros | Category differentiation (Calm/Headspace path); can metaphor HD concepts. |
| Cons | Expensive; multi-locale; dual theme; competes with **BodyGraph** as signature art; half-done = slop. |
| Verdict | **Not now.** Long-term optional for marketing/onboarding only; product surfaces should stay data + bodygraph. |

### Data viz / glyphs (BodyGraph, bars, chips)

| | |
| --- | --- |
| Pros | Already distinctive; encodes meaning; WHOOP/Oura-aligned; performance OK as SVG. |
| Cons | Chart-heavy on Home would wrong-foot morning ritual. |
| Verdict | **Lean in on Chart/Soul;** on Today/Protocols use **micro** viz (bar, chip, optional tiny sky glyph) — not full bodygraph above the fold. |

---

## Phased options (for ticket writing)

### Option A — Density without decoration (recommended)

1. **Hierarchy first:** one primary metric/verb per morning surface (align with expert Morning Ritual); stop dual growth fills.  
2. **Card lift:** raise elevated/border contrast; reserve growth fill for the single CTA / checked Move.  
3. **Semantic icons (~8–12 more Lucide):** empty states, kit/add, settings section headers, Today “sky” / Protocols “check” affordances — not on every paragraph.  
4. **Status glyphs:** strengthen progress ring/bar, vs-yesterday pills, tier — color meaning > new art.  
5. **Desktop:** consider slightly tighter `max-w` for ritual pages *or* a right-rail summary so `max-w-6xl` doesn’t feel like empty theater.

### Option B — Light brand illustration (only if A ships and still feels cold)

- One owned **abstract** motif (mineral/ink, not lakes) for login + empty-chart only.  
- Still no photo library.  
- Budget for dark variants + 5 locales of any text-in-art (prefer text outside art).

### Explicit non-goals

- Stock Unsplash wellness photos on Home/Today/Protocols.  
- Mascot / brain character without a real brand program.  
- Icon on every list row “for density.”  
- Replacing BodyGraph with generic mandala art.

---

## Screen-level notes (ticket-ready)

| Screen | What emptiness is | Put / change | Do not decorate |
| --- | --- | --- | --- |
| `/` Home | Brochure hero + 4 equal essay cards; pale elevated | Returner: one primary CTA; optional compact “today strip” (signal chip + Move progress); keep 4 icons but shorten bodies | Full-bleed photo hero; illustrated room cards |
| `/transits` Today | Text walls; uniform cards | Glyph beside signal / main action; stronger energy accent on signal; keep Why collapsed | Nature header image; icon grid |
| `/biohack` Protocols | Empty kit / dashed void; Move below fold | Empty: single dashed card + kit icon + one CTA; filled: protect Move above fold; small check/kit icons on rows optional | Lifestyle photos of supplements; heavy illustration |
| Kit / Inventory | Text chips | Lucide flask/package sparingly on “add” | Product photography |
| `/settings` | Form in void | Section icons (globe/clock/user) left of titles | Illustrations |
| `/login` | Already densest | Keep gradients + pillars; optional later owned abstract — not photos | Stock meditation couple |
| `/profile` Chart | BodyGraph already dense | Protect as hero art; don’t add competing illustration | Photo of person |
| `/soul` | Meters + essays | Keep meters; optional sparkles already | Couple photography |
| Empty / error | Dashed + copy only | One icon + one sentence + one button | Empty-state lottie farm |

---

## Sources cited

- [Calm Sleep Visual System — Shannon Rollins](https://www.shannonbr.com/work/calm-sleep-visual-system)  
- [BUCK — Calm Sleep Visual System](https://buck.co/work/calm-sleep-visual-system)  
- [Eric Fillingame — Calm Sleep](https://ericfillingame.com/work/calm-sleep)  
- [Big Human — 6 Mindfulness App Design Trends](https://www.bighuman.com/blog/trends-in-mindfulness-app-design)  
- [Steven Sczepanik — Headspace](https://www.sczepanik.com/headspace)  
- [karen yoojin hong — Headspace](https://www.karenyoojin.com/headspace)  
- [Figma Blog — Headspace design system](https://www.figma.com/blog/building-a-design-system-that-breathes-with-headspace/)  
- [925studios — WHOOP Design Breakdown](https://www.925studios.co/blog/whoop-design-breakdown)  
- [Oura — A New Look for the Oura App](https://ouraring.com/blog/new-app-design/)  
- [IXD@Pratt — Design Critique: Oura](https://ixd.prattsi.org/2026/09/design-critique-oura/)  
- [Daylio — App Store](https://apps.apple.com/us/app/daylio-journal-mood-tracker/id1194023242)  
- [PMC — Daylio mood-quantification](https://ncbi.nlm.nih.gov/pmc/articles/PMC5344152/)  
- [Notion — Updating the design of Notion pages](https://www.notion.com/blog/updating-the-design-of-notion-pages)  
- [DesignMD — Notion's Design Language](https://www.designmd.co/blog/notion-design-language)  
- [Blake Crosley — Notion design guide](https://blakecrosley.com/guides/design/notion)  
- Internal: `frontend/src/app/globals.css`, `Header.tsx`, `page.tsx`, `AppShell.tsx`, `TodayIndication.tsx`, `biohack/page.tsx`, `BodyGraph.tsx`, `package.json`, `.grok-handoff/expert-ux-uplift-memo-2026-11-04.md`

---

*End of research handoff.*
