# Body-first roles — current build (signed off)

**Date:** 2026-11-09, 9:32 AM Asia/Hong Kong
**Signed off by:** Benjamin, answering widget t533s2440 in chat — “Yes, build Body-first roles”
**Research Page:** https://cursor.com/canvas/store-f5d34951-c924-450e-b54b-b19b5400da0d/f76983ae-3a1e-4465-b9b6-8cf88db147ab
**canvas_id:** `f76983ae-3a1e-4465-b9b6-8cf88db147ab`
**Research markdown:** `/workspace/reports/baseline-typography-review-2026-11-09.md`
**This file is the source of truth for the build.**

## Intent

Primary reading text across Baseline is mostly `text-sm` (14px). Many labels use `text-[9px]` / `[10px]` / `[11px]`. Scannable meta often uses `text-fg-muted` (`#82877e` on canvas `#f7f6f2` ≈ 3.40:1, fails WCAG AA 4.5:1).

**Approach: Body-first roles.** Lift primary reading to a 16px body floor with relaxed leading, name a small type-role scale so one-offs stop multiplying, floor captions at 12px, and move scannable meta off failing muted ink. Keep Inter, washes, copy, IA, and mechanics.

## Locked role scale

Add named roles as Tailwind theme `fontSize` keys and/or `.type-*` utilities in `globals.css` (rem-based). Roles set size / weight / line-height; color stays composable except `type-meta`, which defaults to `text-fg-secondary` and may be overridden. Do not add a new font family.

| Role | Utility | Size | Weight | Line-height | Default ink |
| --- | --- | --- | --- | --- | --- |
| Display | `type-display` | 1.875rem (30px); `md:` 2.25rem (36px) where heroes already step up | bold | tight | fg or growth (as today) |
| Page title | `type-title` | 1.5rem (24px) | semibold | tight + tracking-tight | fg |
| Section | `type-section` | 1.125rem (18px) | semibold | snug | fg |
| Body (primary) | `type-body` | **1rem (16px)** | regular or medium (keep current weight) | **relaxed ~1.5–1.625** | fg or fg-secondary (keep current) |
| Meta | `type-meta` | 0.875rem (14px) | medium | normal | **fg-secondary** |
| Caption | `type-caption` | 0.75rem (12px) | medium | normal | fg-secondary when scannable |
| Chip | `type-chip` | 0.75rem (12px) | semibold | normal | ink tokens as today; uppercase + tracking-wide allowed |

Equivalent Tailwind without custom names is acceptable if applied consistently: body = `text-base leading-relaxed`; caption/chip = `text-xs`; meta = `text-sm text-fg-secondary`. Prefer the named roles so new UI does not invent `text-[11px]` again.

Button / nav stay `text-sm` or `text-xs sm:text-sm`. Keep `min-h-10` / `min-h-11`. Do not shrink tap targets.

## Do not global-replace

There are ~248 `text-sm` and ~179 `text-xs` uses. **Do not** search-replace all of them to `text-base`. Apply roles to the surfaces below. Buttons, inputs, nav tabs, and truly dense controls may stay at meta/button size.

Do not globally replace every `text-fg-muted`. Remap **scannable** labels, subtitles, asOf/path lines, and eyebrows users read → `text-fg-secondary`. Placeholder, disabled, and purely decorative hints may stay muted. **Do not change the `--fg-muted` token value** (that would be a color-system change).

## In scope (FE-only → Vercel later, no Railway)

Pages: Home `/`, Today `/transits`, Protocols `/biohack`, Chart `/profile`, Soul `/soul`. Login / Settings only where a reading-role class is cheap and obvious. Admin is not the design target — leave admin tables alone.

### 1. Body floor — must lift to `type-body` (16px + relaxed leading)

- **Today Move sentence:** `frontend/src/components/TodayIndication.tsx` `data-testid="main-action-text"` — today `text-sm font-medium text-fg` → `text-base font-medium leading-relaxed text-fg` (or `type-body font-medium`). Also the matching completion-receipt line that uses the same `text-sm font-medium` reading role.
- **Protocols Move card:** `frontend/src/components/protocols/TodaysMoveCard.tsx` — the Move sentence block (today `text-sm font-medium text-growth-ink`) and primary protocol item titles (`text-sm font-medium text-fg`).
- **Protocol preview/row body:** `frontend/src/app/biohack/page.tsx` — `text-sm leading-snug text-fg-secondary line-clamp-2` preview copy → `text-base leading-relaxed` (keep `line-clamp-2`). Week-theme and other primary protocol prose that is `text-sm` reading text → body.
- **Soul Signature body** (not the display title, not the italic hook): `frontend/src/app/soul/page.tsx` — partner/friend body paragraphs that are `mt-3 max-w-2xl text-sm text-fg-secondary` (and the matching friend fallback) → `text-base leading-relaxed text-fg-secondary`. Display title stays `text-3xl font-bold`. Italic hook stays `text-base italic leading-snug sm:text-lg`.
- **Soul opened chapter prose:** Spectrum summaries (today `text-xs text-fg-muted`), Playbook headline+body (`text-sm`), and other opened chapter paragraphs users read in Spectrums / Playbook / Channels / Centers / Love → `type-body`. Spectrum bar *labels* (Intensity / Steadiness / Pace) may stay `text-sm font-semibold` or step to `type-section` if that fits; do not leave summaries at 12px muted.
- **Chart Snapshot meaning lines:** `frontend/src/app/profile/page.tsx` `#snapshot` — lines today `text-sm text-fg`, `text-sm leading-relaxed text-fg-secondary`, and `text-sm text-fg-secondary` under the snapshot heading → `type-body`. The Snapshot name/title that is already `text-lg font-semibold` may stay section-sized.
- **Chart Deep Dive essay bodies:** `frontend/src/components/ChartDeepDive.tsx` — `text-sm leading-relaxed` essay containers → `text-base leading-relaxed`. Do **not** shorten essay copy.
- **Home outcome card blurbs:** `frontend/src/app/page.tsx` — the four `text-sm text-fg-secondary` blurb blocks (Protocols / Today / Chart / Soul body + bullets) → `text-base leading-relaxed text-fg-secondary`. Card `h2` titles (bare `font-semibold`, inherit 16px) may stay or become `type-section`.
- **Pro gate body:** any locked-gate paragraph users read on Home / Soul / Protocols / Chart (not the chip) → `type-body`.

### 2. Caption / chip floor 12px

Retire `text-[9px]` and readable `text-[10px]` / `text-[11px]`. Use `type-caption` or `type-chip` (`text-xs` / 12px).

Known offenders (not exhaustive — sweep the in-scope pages):

- Today kit marks: `TodayIndication.tsx` `text-[9px] font-medium text-fg-muted` → `text-xs` + `text-fg-secondary` if the mark is readable.
- Home Today-card eyebrow `text-[10px]` and status chips `text-[11px]` → `text-xs` / `type-chip`.
- Soul spectrum endpoint labels `text-[10px] uppercase tracking-wide text-fg-muted` → `text-xs` + `text-fg-secondary`.
- Soul / partner chips `text-[10px] font-semibold uppercase` → `type-chip` (12px). Keep uppercase + tracking.
- Protocols badges / item `sub` lines / counts at `[10px]` or `[11px]` → at least `text-xs`; item `sub` that is readable support copy uses `text-fg-secondary`.

Out of this floor: BodyGraph SVG `fontSize` (diagram chrome) and share-card inline px lockups.

### 3. Page titles

- Chart, Soul, Protocols, Settings `h1`: unify to `text-2xl font-semibold tracking-tight` (they are already 24px; several use `font-bold` — step to semibold + tracking-tight).
- **Today `h1` stays visually quiet** (signed-off default): keep `text-sm font-semibold uppercase tracking-wide`, but change `text-fg-muted` → `text-fg-secondary`. Hierarchy stays on You + Move; Move itself becomes the 16px primary.
- Home hero and Login headline stay display (`text-3xl` / `md:text-4xl` / existing login scale).

### 4. Scannable meta → `fg-secondary`

Examples (apply the rule, not only these lines):

- Today `h1` (above).
- Page subtitles: Chart `mt-1 text-sm text-fg-muted`, Soul `text-sm text-fg-muted`, Protocols subtitle `text-sm text-fg-muted` and asOf `text-xs text-fg-muted`.
- Uppercase section eyebrows users scan (“Aura Signature”, chapter labels, protocol section kicker) that are `text-fg-muted` → `text-fg-secondary`. Size stays caption/meta as appropriate; do not turn every eyebrow into body text.
- Collapsed Why `<summary>` may stay `text-xs font-semibold` (meaning vs Why hierarchy) but use `text-fg-secondary` if it is `text-fg-muted` today.

### 5. Optional measure

Add `max-w-prose` (~65ch) on long Chart Deep Dive essay bodies and long opened Soul chapter prose only. Do **not** shrink `AppShell` (`max-w-6xl`).

## Out of scope

- New font family (keep Inter via `next/font/google`).
- Soul sand-amber copper wash and Today sage/growth achieved wash (do not restyle).
- Any copy rewrite. Dual-prompt strings, locked Move sentences, Signature titles/hooks/bodies/Why text, gold Generator+Projector hook, i18n values — all stay verbatim. If a locked string wraps badly after the size lift, report it; do not rewrite it.
- IA, scoring, mechanics, Chapter Map structure, testids.
- BodyGraph SVG type.
- Share-card pixel lockups (`ShareBaselineCard` and similar).
- Admin dashboard as a design target.
- Dark-theme token redesign. (Using `fg-secondary` instead of `muted` on scannable text is enough.)
- Backend / Railway / Python.

## Success criteria

1. Today Move sentence (`main-action-text`) is 16px with relaxed leading.
2. Soul Signature body, opened chapter prose, Chart Snapshot meaning lines, Deep Dive essays, Home card blurbs, and Protocol primary reading rows are 16px with relaxed leading.
3. No `text-[9px]` on in-scope user-facing pages; readable labels/chips are ≥12px.
4. Scannable meta/subtitles/eyebrows on those pages use `fg-secondary`, not `fg-muted`.
5. Today `h1` remains the quiet uppercase label, now in secondary ink; other main page titles are 24px semibold.
6. Inter, washes, copy, testids, and tap targets unchanged.
7. Existing asserts still pass: `assert-soul-chapter-map`, `assert-soul-dual-prompt`, `assert-quiet-move-closure`, `assert-settled-day` (and any related). `tsc` clean. No locale string edits.

## Ship path

Frontend only. Open a PR against current `main`. Do **not** merge or deploy. Report the PR number and exact tip SHA (`headRefOid`) back to Grok Bot. Grok Bot will route UX UI Review → Ship Gate QA → Benjamin merge-yes, then ask you to merge and deploy **Vercel only** (no Railway).

## Build status (Full Stack — do not merge yet)

- **Branch:** `feat/body-first-roles`
- **Base:** `afd18a8495b9abc1a6e48d41595d76a8f067c100` (main after PR #87)
- **Tip:** `59b42989dfff69e0c5da60d4024eef581f960423`
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/88
- **FE-only:** Yes — Vercel only after later yes (no Railway). Named `.type-*` utilities in `globals.css` + Tailwind `fontSize` aliases.
- **Preview:** not started
- **Do not merge / do not deploy.**
