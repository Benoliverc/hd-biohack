# Protocols redesign — chat summary (paste to Benjamin)

- **Problem:** Protocols feels the same every day — not exciting.
- **Root cause (code):** Hero checklist is hard-coded (daylight walk → caffeine cutoff → magnesium). Over 14 days on your Me chart, those top 3 actions never changed.
- **Sky is computed but buried:** Live transits/bridges exist, but the lead card ignores them; weekly “theme” even has a bug so it never shows Sun/Earth gates.
- **Today already has the exciting bit:** Energy / Space / Main action on `/transits` — Protocols doesn’t reuse it.
- **Other sameyness:** Plan only appears after Generate (not auto-loaded); natal baseline + inventory compete with “today”; checkboxes are decorative (no progress).
- **Insight:** Protocols should be **“do the sky”**, not a laminated Type OS pamphlet. Exciting = one sharp daily move + why, not more supplements.
- **Proposed page:** Weather strip (Energy/Space/Sun-Earth/bridge) → **Today’s Move** hero → 3 timed supports picked from energy × bridge × inventory → short Do/Don’t → week sky → collapsed baseline kit + inventory.
- **P0 cut:** Auto-load; share Today indication; rebuild slot leads; fix week theme; You-only chart; collapse natal. **No** wearables, streaks, ApoE4 inventing, LLM dependency.
- **Proof of done:** Two different sky days → visibly different hero move; magnesium/daylight no longer permanent lead trio.
- **Next:** Want `@ui-ux` to review the IA before `@dev` builds (page redesign, not a copy tweak).
