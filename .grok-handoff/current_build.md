# Current build — Baseline PR stack (Today engine + Share)

Softs muted (Stripe, PWA, pushes). **No merge until Benjamin yes.**

---

## PR 1 — Today transit→protocol (engine & join) — OPEN

- **PR:** https://github.com/Benoliverc/hd-biohack/pull/65
- **Branch:** `feat/today-transit-protocol`
- **Tip:** `b5d0f72` (`b5d0f721a177dabab2194058f3d95409e97db35f`) — includes quality follow-up `19e05d8` (Pro down-rank history, kit dedupe with Protocols, Move polish)
- **Base:** `origin/main` @ `3b986a3` (post PR #64)
- **Worktree:** `/workspace/hd-biohack-wt-today-transit`
- **Scope:** Transit → Moment → Move + kit slot on Today. Not Share cards.

### What shipped
- Deterministic prescription engine: `backend/app/checkin/prescription.py`
  - Driver → moment (same priority as `_energy_band`)
  - Move ≤20 words, plain English, driver-specific / screenshot-worthy
  - Kit line via `kit_variety.pick_kit_lead` (Pro); Free/empty → muted placeholder
  - When = kit slot or moment default; dose only from inventory notes
  - Pro down-rank after ~14 days of `today-move:*` history (offered rows seeded on Today load)
- `derive_today_indication` always attaches prescription fields
- `/transits/today?user_id=&preview_as_free=` joins kit + entitlement + history
- Protocols joins the same kit context and **avoids** Today's `kit_supplement_id`
- Today UI: Move + From your kit + When + I-did-it taps
- i18n EN/NL/DE/FR/ES; completions reuse `protocol_completions`

### Tests
- `backend/tests/test_today_prescription.py` — ALL PASS
- Related checkin / kit_variety / protocols redesign — ALL PASS
- FE `tsc` / `next lint` clean (pre-existing hook warnings only)

---

## PR 2 — Share my Baseline — OPEN (stacked on PR 1)

- **PR:** https://github.com/Benoliverc/hd-biohack/pull/66
- **Tip:** `TIP_SHORT` (`TIP_FULL`) — UX FAIL fix (tainted canvas export)
- **Branch:** `feat/share-my-baseline` **stacked on** `feat/today-transit-protocol` @ `b5d0f72`
- **Worktree:** `/workspace/hd-biohack-wt-share-baseline`
- **Scope:** Natal poster (Chart) + Today card (exact Move string). No prescription-engine changes. No kit/doses on public image.
- **Hold merge:** Benjamin yes. Do not merge before #65 unless he says otherwise.

### What shipped
- `shareCardImage(blob, filename, title?)` — single web adapter (`canShare`+`share` → download/clipboard fallback); Capacitor swap-point commented
- Off-screen raster path: `rasterizeOffscreenCard` waits `document.fonts.ready`, inlines SVG styles, flattens BodyGraph SVGs → PNG `<img>`, then `html-to-image` `toBlob` on `[data-share-card]` with `html2canvas` (`foreignObjectRendering: false`) fallback — **no** hand-rolled SVG+foreignObject (Chromium taint fix)
- Grounded Vitality cards (`#F7F6F2` / `#3F624D` / `#C45B38`); wordmark **Baseline**; Meta safe zone ~14%/35%/6%
- Sizes: 1080×1920 (primary) + 1080×1350 (feed via menu)
- Chart top-right Share (You only; first_name if set; no birth PII)
- Today top-right Share — Move text = on-page `main_action_text`; small BodyGraph; “My Baseline · today”
- BodyGraph `compact` mode (SVG only) for cards
- i18n EN/NL/DE/FR/ES for button labels
- Assert: `frontend/scripts/assert-share-baseline.mjs`
- Smoke (headless Chrome, Dev Pro): Chart + Today download `baseline-*-story-1080x1920.png` (real PNG, no “Could not share”)

### Out of scope
Prescription engine, OG/meta previews, deep-link into login, kit/protocol details on card, Stripe/PWA/pushes
