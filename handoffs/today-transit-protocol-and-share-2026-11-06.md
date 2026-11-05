# Today transit→protocol + Share my Baseline — 2026-11-06

PO: Grok Bot · Implement: Full Stack Developer (@dev) · Then UX → Ship Gate → **wait for Benjamin merge yes** (no standing auto-ship)

Two **sequential** PRs. Do not combine. Soft residuals mute unless asked. i18n: new user-facing strings in EN/NL/DE/FR/ES.

Commercial intent (do not put in UI): App Store / legal safety (no algorithmic supplement prescribing), $9.99 Pro wedge (Move free, kit line Pro), zero-CAC share cards. Engine stays **100% deterministic — no LLM**. Variable API cost per user must stay ~$0.

Existing pieces to reuse, not replace:
- Energy / driver math: `backend/app/checkin/derive.py` (`_energy_band` first-match)
- Main action: `backend/app/checkin/rules.py` (`compute_main_action`, ≤20 words, Why separate)
- Today UI: `frontend/src/components/TodayIndication.tsx` + `frontend/src/app/transits/page.tsx`
- Kit rotation / moment-fit already on Protocols: `backend/app/biohack/rules.py` (`_slot_from_stack`, `kit_variety`) and `TodaysMoveCard`
- BodyGraph SVG: `frontend/src/components/BodyGraph.tsx` (linen / sage / terracotta already)
- Pro gate: `biohackingUnlocked` / `BiohackingEntitlementGate` / Preview as Free

---

## PR 1 — Engine & join (Transit → Moment → Move + kit slot)

**Intent:** Today already computes energy from natal × overlay and a type-aware main action. Protocols already has a kit checklist and rotation — on another tab. Join them on Today as a three-line prescription, plus a single-tap “I did it” that later down-ranks ignored move types.

### Driver → moment (never to a drug)

Pick today’s **dominant driver** with the same priority order as existing energy bands:

1. Hyper / Root-without-Sacral
2. Borrowed motor
3. Mind-only overlay (Head/Ajna)
4. Else Sun gate theme (existing `sky_bullet_one` / sun_earth)

Map that driver to a **moment** enum (extend existing moment vocabulary where it already exists; do not invent a parallel taxonomy):

- mental pressure
- emotional wave
- borrowed fuel
- quiet sky
- surplus
- recover

Never map a transit, gate, or open center directly to a supplement or a dose.

### Three-line prescription on Today

Emit:

1. **Move** — lifestyle, ≤20 words, plain English, no HD jargon. Example: “Skip the extra coffee. Take a 20-minute walk before you stack more inputs.” Prefer making `compute_main_action` more driver-specific (today’s moment) rather than the generic type templates when a sky driver exists. Keep the word cap and the existing disclaimer.
2. **From your kit** — one owned-kit item tagged to today’s moment, rotated so it is not always the same (reuse `kit_variety` / moment-fit; do not always pick B-complex). **Never invent a dose** that is not already on their kit row. Respect `kit_supplement_id` dedupe used by Protocols so Today and Protocols do not fight.
3. **When** — morning / midday / evening. If the chosen kit row has a slot, use that; otherwise pick a default that fits the moment (e.g. recover → evening, surplus/mental pressure → morning walk before inputs).

HD mechanics stay in the existing collapsed **Why** drawer (`main_action_why` + drivers). Do not promote gate/Sacral/Strategy into the Move line.

### Free vs Pro

- **Free** (and Preview as Free): always show the Move + When (if When is bound to the Move, not only to the kit). Show the kit **slot** as a muted placeholder — never silently hide it.
- **Pro**: live “From your kit” rotation + adaptive completion history (down-ranking).

### Locked / empty kit state (required upsell hook)

Never silently hide the kit line. When the user has no kit logged **or** is on Free, show a muted placeholder tied to today’s moment, in this shape:

> From your kit: + Log a [calm/focus/recovery] item to pair with today’s transit

Map moment → short noun (`calm` / `focus` / `recovery` or the closest existing i18n-friendly labels — keep them human, not technical). The CTA should take them to where they add kit items (Protocols / kit strip) without a sales essay. New users must see that the Transit → Kit join exists.

### “I did it” (no resetting streak)

- One tap on the Move line; one tap on the kit line when it is a real item (not the placeholder).
- Persist per user per HKT day (same day key as Protocols completions if possible).
- No streak counter, no “you broke your streak”, no gamified reset.
- After about 14 days of history, **down-rank move types** (moment / lifestyle family) they almost never complete when choosing tomorrow’s Move. Do not hide a type forever; just prefer types they finish. Pro-only for the adaptive ranking; Free can still tap “I did it” on the Move so the gesture exists.

Keep existing Today indication testids; add new ones for the kit line, placeholder, When, and done taps (`today-kit-line`, `today-kit-placeholder`, `today-when`, `today-move-done`, `today-kit-done`).

### Out of scope for PR 1

Share cards, Stripe checkout, push notifications, LLM copy, changing Soul, changing energy-band formulas unless a driver cannot be derived from what `_energy_band` already returns.

### Acceptance (PR 1)

1. Today shows Move (≤20 words, no jargon) + When; Why still collapsed with HD mechanics + disclaimer.
2. Pro with a kit: one moment-tagged kit item, rotated across days; dose text only if already on the kit row.
3. Free / no kit / empty kit: muted placeholder is visible and names today’s moment family; no silent omission.
4. “I did it” persists for the HKT day; no streak UI.
5. After simulated history of ignored move types, next Move prefers types that were completed (Pro).
6. Deterministic: same natal + transit + kit + history → same prescription (unit tests).
7. i18n EN/NL/DE/FR/ES for new copy. UX → Ship Gate → wait for Benjamin yes.

---

## PR 2 — Viral loop (Share my Baseline)

**Intent:** Dedicated Grounded Vitality cards (not screenshots of app chrome). Today card reuses the **same Move line** as PR 1. Natal poster is the identity unit.

Depends on PR 1 being merged (or stacked) so the Today card can read `main_action_text`.

### Two cards only

Palette: linen / sage / terracotta (existing BodyGraph tokens: `#F7F6F2`, `#3F624D`, `#C45B38`, plus defined-center fills already in `BodyGraph.tsx`). Not Co-Star monochrome.

1. **Natal poster** (Chart / profile page, top-right, obvious): BodyGraph + Type + Profile + Strategy. No birth time, place, or full name. First name only if Settings `first_name` is set. Wordmark: **Baseline**.
2. **Today card** (Today page, top-right, obvious): same Move line, small graph, Type, “My Baseline · today”. **No supplement names or doses** on the public image.

Privacy default: graph + type only. Do not leak chart IDs, emails, or kit contents into the image or share text.

### Sizes and safe zones

- Primary export: **1080×1920 (9:16)** — Instagram Stories / TikTok / Reels.
- Secondary: **1080×1350 (4:5)** feed crop (same composition, tighter vertical).
- Keep headline, graph, type, and wordmark inside Meta’s cautious Story safe zone: ~**14% top, 35% bottom, 6% each side** (on 1080×1920 ≈ 269 / 672 / 65 px). Do not put the wordmark in the bottom overlay band.

### Rasterization (required — Mobile Safari)

Off-screen SVG → canvas on iOS WebKit is unreliable. The implementation **must**:

- Render a **dedicated off-screen card** (hidden but laid out at target CSS pixels). Never `html2canvas` the live app chrome / nav / Why drawer.
- `await document.fonts.ready` before rasterizing.
- Inline critical styles on the SVG (no dependence on cross-origin stylesheets for fills/strokes).
- Rasterize the existing BodyGraph SVG into the card (same geometry as in-app).
- Export PNG blob (sRGB). Keep file size reasonable for share sheets.

### Share adapter (web → Capacitor-ready)

Build **one** function, e.g. `shareCardImage(blob: Blob, filename: string, title?: string)` in a small module:

- **Current Vercel web app:** `navigator.canShare?.({ files })` + `navigator.share({ files: [file], title })`. If canShare/files is false, fall back to a download (and optional clipboard write if available).
- **Future Capacitor wrap:** this is the **only** function that should need to change — swap internals to `@capacitor/share` + `@capacitor/filesystem`. Do not scatter `navigator.share` calls. Document the swap point in a one-line comment.

Web Share API inside iOS/Android WebViews is unreliable for file attachments — that is why the adapter exists now, even before a native wrap.

### Out of scope for PR 2

Changing the prescription engine; deep-linking shared images back into login; OG/meta social previews (nice later, not this PR); printing kit/protocol details on the card.

### Acceptance (PR 2)

1. Chart has Share my Baseline → natal poster PNG (9:16, 4:5 available). No birth PII.
2. Today has Share my Baseline → Today card PNG whose Move text matches the on-page Move. No supplement names/doses.
3. Cards use Grounded Vitality; wordmark Baseline; content inside safe zone.
4. Raster path waits for `document.fonts.ready`, inlines SVG styles, uses an off-screen card.
5. All share goes through `shareCardImage`; web fallback download works when Share API is missing.
6. i18n for button labels. UX → Ship Gate → wait for Benjamin yes.

---

## Soft mute

Mute leftover i18n nits, Stripe/waitlist paywall work, PWA/store wrap, and push notifications unless Benjamin asks.
