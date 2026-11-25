# current_build — Day 7 five fixes

- **Date:** 2026-11-25 (Asia/Bangkok, UTC+7)
- **Branch:** `fix/day7-five-fixes`
- **Worktree:** `/workspace/hd-day7-five-fixes`
- **Base:** `1a809f8d6ef733fc793da544f70ccb087fa5d231` (main after PR #145 merge)
- **Code commit:** `ef2e27c2511b131b42451e981c963ea9e1a60f80`. Tip SHA: this stamp can't contain its own SHA. Lock on GitHub `headRefOid` after push.
- **Brief:** `/workspace/reports/baseline-day7-five-fixes-build-brief-2026-11-25.md` (sha256 `6b8a8147…5e07dd7`)
- **Evidence:** `/workspace/reports/day7-five-fixes-2026-11-25/`
- **Scope:** frontend + backend. A later ship is Vercel + Railway. No env, lockfile, schema, Railway or Share change.
- **Local preview:** `http://127.0.0.1:3159` (next start) → local API `127.0.0.1:8159` on a local SQLite DB with invented accounts only. No production account was used.
- **Do not merge or deploy** until Benjamin says yes in his own words. Benjamin's Go was build-only.

## Root causes (confirmed in code and reproduced locally)
1. **Move reprints:** each moment has a 5-line pool. The rotation fallback preferred avoiding other accounts' *today* labels over the person's own history, so within about 5 days people got their own lines back and lines rotated across accounts. The concrete Space action in Why this was never a headline candidate.
2. **Soul switch:** the previous `result` stayed in state until the next `/soul/sync` resolved, and it was not keyed to the selected person.
3. **Shelf/kit:**
   - `announceKitChange` named the first changed slot lead, not the item that changed.
   - The kit pick and KIT FACT only refreshed inside a `Promise.all` with the slow protocol rebuild.
   - The optimistic remove left the pick and fact alone.
   - The backend recomputed the pick without honouring today's tick.
4. **Type twice:** the Deep dive Core tab mounted a default-open `Type` accordion using type-generic `TYPE_COPY` ("same gut yes or no as a Generator" on an Emotional MG).
5. **Earlier weeks:**
   - The Show-up control only ever opened the list.
   - It then scrolled the list to block start, which tucked the control under the sticky header (control top 81 vs header bottom 113 at every width).
   - Closing was only possible from the inner summary.

## What changed
- `prescription.py` / `routes.py` / `derive.py`:
  - `select_move_text(concrete=…, avoid_today_texts=…)`. When the sky moved, the concrete action leads unless it was the person's last headline. Otherwise it uses a moment line the person has not had in 7 days.
  - Lines no other account was served in 7 days are preferred. A line another account already has today is never used. When nothing is fresh, it uses the line this person saw longest ago, never yesterday's.
  - Same-day reload is stable. An unchanged sky keeps the last headline.
  - The other-account window is 7 days.
  - `_done_kit_pick_ids` pins today's ticked kit pick.
  - Incidental: `/transits/today` without `user_id` no longer raises a 500.
- `TodayIndication.tsx`:
  - Why this hides the micro line when it equals the headline.
  - The Earlier weeks control toggles, with `aria-expanded`/`aria-controls` and a chevron. It is never scrolled under the header.
- `EarlierWeeksHistory.tsx`: controlled mode is a plain `section hidden` region with no inner summary. Protocols (uncontrolled) keeps details/summary.
- `soul/page.tsx`: `reading = {friendId, data}`. Render only when it matches the selected person. Mismatched payloads are dropped.
- `biohack/page.tsx`:
  - Banners: "Removed {name} · plan refreshed", "Added {name} · plan refreshed", or "Plan updated · {slot} now uses …" only when a slot uses the added item.
  - An optimistic remove clears the pick and fact naming the item.
  - transitsToday is applied independently of the protocol, with a request-sequence guard.
- `ChartDeepDive.tsx` / `ChartTypeBox.tsx`: the Deep dive Type essay is replaced by a pointer to `#chart-type-box`, which gets an id plus scroll-mt.
- i18n:
  - `chart.deepDive.typeBlurb` is replaced by `chart.deepDive.typePointer`.
  - New `protocols.addedPlanRefreshed` in all 5 locales.
  - Voice locks hold (tu/du/tú/je). Feature names stay English.

## Checks (local)
- tsc 0 · lint 0 (6 hook warnings, same count as before) · `next build` 0 · React harness PASS.
- Asserts 59/60. The only red is the pre-existing `today-protocols-ia` ("Conditioning notes"), with the same exit and message as on base.
- New: `assert:day7-five-fixes` (fails on base) and `backend/tests/test_day7_five_fixes.py` (11 tests).
- Backend pytest: 42 failed / 242 passed. The failure set is identical to base (42/231).
- Two existing asserts were updated where they pinned the behaviour this brief replaces:
  - `assert:chart-bodygraph-revert`: the ChartDeepDive byte pin now checks the f0d542d bytes plus only the Day 7 Type pointer swap.
  - `assert:history-beyond-this-week`: it now expects the toggle contract instead of `setHistoryOpen(true)` + list scroll.

## Evidence (before = 1a809f8 on :3160/:8160, after = branch on :3159/:8159)
- Item 1:
  - `item1-moves-{before,after}-api.json`
  - `item1-moves-{before,after}-8day-replay.txt`
  - `item1-moves-8day-replay-stats.txt`
  - `item1-today-move-*.png|json`: 320/375/390/desktop, plus de and fr.
- Item 2: `item2-soul-{before,after}-*`: 4s delayed sync. Before showed Rowan's "BETWEEN YOU" on Pia from 0 to 3500 ms. After, it is cleared at 0 ms at all 4 widths.
- Item 3:
  - `item3-shelf-{before,after}-slow*`: 6s delayed protocol, desktop and 375.
  - `item3-tickswap-{before,after}*`
- Item 4: `item4-chart-type-*`, `item4-deepdive-*`, `item4-typebox-*`: 4 widths, plus de.
- Item 5: `item5-earlier-weeks-{before,after}*`: 4 widths.
- Leave-alone: `leave-alone-idid-gen-375.*` (I did it → closure, Show-up dot filled, Move stable across reload).

## Open questions / unverified
- Pool exhaustion: on Day 7 the invented Reflector had had every surplus line within 7 days. Its concrete action was already another account's headline today, so it got its least-recent line back (6 days old) rather than a same-day twin. The 8-day replay shows 1 generic repeat within 7 days after the fix, against 14 before. The person's own Space action can return on alternate changed-sky days (8 in the replay).
- Recover/emotional-wave days also lead with the Space action when the sky moved.
- Not verified: real touch devices, production `/biohack/protocol` latency, and the UI-level kit pick swap (reproduced only in a backend unit test plus the tick-swap run). Also not verified: non-en labels in the reprint check (history labels are stored in English).
- Left as is (out of scope): the MG Deep dive Strategy row still says "Feel the gut yes first".
