# UX guidance — Deep dive domain tabs

- **Surface:** Chart Deep dive (`ChartDeepDive.tsx`) — Core | Centers | Channels | Planets
- **Context:** Controls exist (`role="tablist"` + sunken track) but don’t read as clickable tabs; selected `bg-growth/25` is too soft vs muted labels.
- **Branch for impl:** `feat/…` from `main` @ `2678a3d` (or current tip)
- **Author:** UX UI Review · 2026-10-21 (HK)

## Recommendation: keep segmented control, strengthen affordance

Stay with the **segmented control in a sunken track** (already matches Grounded Vitality). Do **not** switch to underline-only text tabs — those read as in-page links and compete with sticky section chips above. Do **not** use terracotta/energy fills here (reserved for Design activations).

### Visual (tokens only)

| State | Track / button |
| --- | --- |
| Track | `rounded-xl border border-border bg-sunken p-1` (drop `/80` opacity so the well reads as a control chrome) |
| Unselected | `flex-1 min-h-11 text-sm text-fg-secondary hover:bg-elevated/80 hover:text-fg` — looks pressable, not plain copy |
| Selected | `bg-elevated text-fg font-semibold shadow-soft ring-1 ring-border` **plus** a **2px bottom accent** `bg-growth` (or `border-b-2 border-growth`) inside the segment |
| Focus-visible | `outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-sunken` |
| Active/press | slight `scale-[0.98]` or `bg-growth-soft` flash — optional |

Avoid selected-only `bg-growth/25` + `text-growth-ink` without a hard edge — that’s why it currently blends into the page.

### Layout / mobile

- Four equal segments: `flex w-full` + each tab `flex-1 basis-0 text-center` so Core…Planets fit **without** horizontal scroll at 375.
- Labels stay full words (Core / Centers / Channels / Planets) — don’t shorten unless overflow returns; if it does, prefer `text-xs sm:text-sm` over truncation.
- `min-h-11` (≥44px) for touch.
- Keep `overflow-x-auto` only as a fallback if a future 5th tab appears; with four equal tabs it should not scroll.

### Structure / copy

- Keep the **Deep dive** `h2` + one-line helper.
- Optional micro-label above the tablist (visually hidden OK): “Domain” — `aria-label="Deep dive domains"` already fine.
- Panel: keep `role="tabpanel"` + `aria-labelledby` on the active tab id.
- When switching tabs, don’t jump scroll unless arriving via hash.

### Keyboard (required)

Current markup has `role="tab"` / `aria-selected` but click-only. Add roving tabindex:

1. Only the selected tab is `tabIndex={0}`; others `-1`.
2. `ArrowLeft` / `ArrowRight` move selection (wrap).
3. `Home` / `End` → first / last.
4. `Enter` / `Space` activate (native button already does).
5. Moving selection updates domain + hash the same as click (`#core` / `#centers` / `#channels` / `#planets` / legacy `#activations` → Planets).

### Dark theme

Same classes via CSS vars: elevated/sunken/border/growth already flip under `html.dark`. Spot-check selected ring contrast on Basalt.

### Out of scope

- Don’t restyle sticky section chips (People / Bodygraph / Snapshot / Deep dive).
- Don’t change Centers matrix or accordion content in this pass.
- No new color tokens.

## Acceptance (for UX re-verify)

1. At a glance, the four domains look like one control; selected tab is obvious within ~1s.
2. 375: all four labels visible, no h-scrollbar on the tablist, tap targets ≥44px.
3. Keyboard: arrows move tabs; focus ring visible.
4. Hash deep-links still select the right domain; heading clearance under stickies unchanged.
5. Light + dark: selected state contrast OK (no growth wash that disappears on sunken).

## Hand back

Ship on a feat branch, update `.grok-handoff/current_build.md`, ping UX UI Review for live re-verify → then Ship Gate.
