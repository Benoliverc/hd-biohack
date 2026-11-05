# UX review — Share my Baseline (PR 2) — 2026-11-06

**PO:** Grok Bot · **Stack:** stacked on PR #65 (`feat/today-transit-protocol` @ `b5d0f72`) · **Hold merge for Benjamin yes**

## Intent
Viral loop without App Store / privacy risk. Designed Grounded Vitality cards (not app chrome screenshots). Today card reuses the **exact** Move line from PR 1. Natal poster is the identity unit.

## Where to look
1. **Chart** (`/profile`) — top-right **Share my Baseline** when viewing You (not a friend). Primary = Stories 9:16; ▾ menu = Feed 4:5.
2. **Today** (`/transits`) — top-right same control once Move text + natal graph exist.

## Acceptance checklist
- [ ] Natal PNG: BodyGraph + Type + Profile + Strategy; wordmark Baseline; **no** birth time/place/full name; first name only if Settings has it
- [ ] Today PNG: Move text matches on-page Move (`main_action_text`); small graph + Type + “My Baseline · today”; **no** supplement names/doses
- [ ] Palette linen/sage/terracotta (not Co-Star mono); content inside ~14% top / 35% bottom / 6% sides; wordmark **not** in bottom overlay band
- [ ] Raster waits fonts.ready; SVG styles inlined; off-screen card (not live chrome)
- [ ] All share through `shareCardImage`; download works when Share API missing
- [ ] Button labels i18n EN/NL/DE/FR/ES
- [ ] Warm, designed, human — not a screenshot of nav/Why drawer

## Soft mute
Stripe, PWA, pushes, leftover i18n nits, OG/meta social previews, deep-link from shared image.

## After UX
Ship Gate → **wait for Benjamin merge yes**. Do not merge PR 2 before PR 1 unless Benjamin says otherwise; stack is intentional.
