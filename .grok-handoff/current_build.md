# Handoff — CityPicker preset chips visible again

## Branch & commit
- **Branch:** `fix/city-picker-presets`
- **SHA:** d57e287a6add7936d8d4c9aac529a2e0dede27af (short `d57e287`)
- **Base:** `main` @ `d109715`

## Root cause
Not geocode/API/CSS/flag. `CityPicker` hid the `QUICK` chips (Hong Kong, Ghent, Wetteren, Montreal, Bangkok) whenever `lat`/`lon` were already set (`isResolved`), except when the input was focused *and* empty.

After DEMO defaults or saved-chart hydrate, coords are almost always present, so the UI fell through to the fallback row that only rendered **Enter lat/lon**. Geocode `/geocode` and `/geocode/suggest` remain healthy (seed/cache hits for those cities).

## Fix
- `showChips = !disabled` — presets always under the city field when editable.
- Removed unused `focused` state and the resolved-only “Enter lat/lon” fallback (toggle stays in the chip row).

## Changed files
- `frontend/src/components/CityPicker.tsx`

## Local preview
- http://127.0.0.1:3000/profile (Next already on :3000; hot-reload should pick up)

## Test / verify
- `./node_modules/.bin/tsc --noEmit` — clean
- `npm run lint -- --file src/components/CityPicker.tsx` — clean
- `curl` production + local geocode for Hong Kong / Wetteren / Bangkok suggest — OK (seed/cache)

## Open questions
- None. Ready for UI/UX or Ship Gate if you want a formal pass before merge.
