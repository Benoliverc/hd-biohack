# UX review — CityPicker preset chips

- **Branch / SHA:** fix/city-picker-presets @ c3acdc1 (fix 22bb71e)
- **Preview:** http://127.0.0.1:3000/profile
- **Reviewer:** UX UI Review
- **Date:** 2026-10-21 (HK)

## Verdict
**PASS** — chips visible with hydrated coords; pick + lat/lon toggle OK. Cleared for Ship Gate.

## Checks
- (A) Loaded/DEMO with coords: presets visible under city field.
- (B) Preset pick applies; chips remain. Enter lat/lon toggle OK.
- Disabled/loading: chips hidden.

## Medium (not gate)
- Chip height ~40px / 6px gaps (under 44px touch).
- 375 wraps to many rows.
- No persistent selected style on active preset.

## Shots
`/workspace/hd-biohack-ui-failures/ux-review-2026-10-21/city-picker-presets/`
