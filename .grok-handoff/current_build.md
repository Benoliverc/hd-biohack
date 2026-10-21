# Handoff — Remove birth-city preset chips

## Branch & commit
- **Branch:** `fix/remove-city-presets`
- **SHA (fix):** ef00c5f83cd813c5ce7ca949293097f5b968d261 (short `ef00c5f`)
- **Base:** `main` @ `9cc5b0f` (Merge PR #4 city-picker-presets)

## Request
Remove the 5 quick-select city buttons under **Birth city / place**:
Hong Kong · Ghent, Belgium · Wetteren, Belgium · Montreal, Canada · Bangkok, Thailand.

Keep **Enter lat/lon** under the input. Leave backend geocode seeds alone.

## Fix
- Deleted hardcoded `QUICK` array and the chip `.map` from `CityPicker.tsx`.
- Kept a single **Enter lat/lon** / **Hide lat/lon** control under the field.
- Updated placeholder, empty-results, error, and tip copy that mentioned city chips / seeded chips / Hong Kong–Ghent examples.

## Changed files
- `frontend/src/components/CityPicker.tsx`
- `.grok-handoff/current_build.md`

## Local preview
- http://127.0.0.1:3000/profile

## Test / verify
- `rg QUICK frontend/src/components/CityPicker.tsx` — no matches
- `./node_modules/.bin/tsc --noEmit` / `next lint --file CityPicker.tsx` — run after npm install
- `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/profile` — expect 200

## Open questions
- None for this slice. Ready for UI/UX then Ship Gate when asked.
