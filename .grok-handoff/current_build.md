# current_build — Day 7 five fixes

- **Date:** 2026-11-25 (Asia/Bangkok, UTC+7)
- **Branch:** `fix/day7-five-fixes`
- **Worktree:** `/workspace/hd-day7-five-fixes`
- **Base:** `1a809f8d6ef733fc793da544f70ccb087fa5d231` (main after PR #145 merge)
- **Code commits:** `ef2e27c2511b131b42451e981c963ea9e1a60f80` (five fixes), then the Ship Gate Fix 1 commit (concrete action is never displaced by cross-person avoidance). Tip SHA: this stamp can't contain its own SHA. Lock on GitHub `headRefOid` after push.
- **Brief:** `/workspace/reports/baseline-day7-five-fixes-build-brief-2026-11-25.md` (sha256 `6b8a8147…5e07dd7`)
- **Ship Gate (FAIL at 4d05252):** `/workspace/reports/ship-gate-day7-five-fixes-pr146-2026-11-25-tip-4d05252.md` (sha256 `4db47c6e…7c543`). Blocker was Fix 1 only, and it is addressed below.
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
  - `select_move_text(concrete=…, avoid_today_texts=…)`. When the sky moved, the person's own concrete action leads unless it was their last headline. It leads **even when another account has the same accurate action** (brief (a)/(b): "Do not invent uniqueness").
  - Only when the concrete action was yesterday's headline does it fall back to a generic moment line the person has not had in 7 days. For that generic line, it prefers lines no other account was served in 7 days and never uses a generic line another account already has today. When nothing is fresh, it uses the line this person saw longest ago, never yesterday's.
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

## Checks (local, after the Ship Gate fix)
- tsc 0 · lint 0 (6 hook warnings, same count as before) · `next build` 0 · React harness PASS.
- Asserts 59/60. The only red is the pre-existing `today-protocols-ia` ("Conditioning notes"), with output byte-identical to base.
- New: `assert:day7-five-fixes` and `backend/tests/test_day7_five_fixes.py` (11 tests).
  - The swap tests were retargeted: `test_two_people_may_share_their_accurate_concrete_action` and `test_concrete_action_leads_even_when_another_account_has_it_today`.
  - `test_all_lines_seen_by_others_takes_oldest_seen` now sets the concrete action as yesterday's headline, so it still tests only the generic fallback.
- Backend pytest: 42 failed / 242 passed. The failure set is identical to base.
- Two existing asserts were updated where they pinned the behaviour this brief replaces:
  - `assert:chart-bodygraph-revert`: the ChartDeepDive byte pin now checks the f0d542d bytes plus only the Day 7 Type pointer swap.
  - `assert:history-beyond-this-week`: it now expects the toggle contract.

## Move numbers (8 days, sky changed on days 2–8)
- Pure-function sim (`item1-move-scale-sim-{base,4d05252,new}.json`), adapted from the gate harness. "Concrete-eligible" means the concrete action was not yesterday's headline.

| Accounts | Code | Concrete headline | Generic replaced an eligible concrete action | Own repeat, previous day | Own repeat within 7d (generic / own concrete) |
|---|---|---|---|---|---|
| 5 | base | 0/35 (0%) | 35/35 (100%) | 9 | 17 (17 / 0) |
| 5 | 4d05252 | 17/35 (48.6%) | 5/22 (22.7%) | 0 | 13 (1 / 12) |
| 5 | **new** | 20/35 (57.1%) | **0/20 (0%)** | 0 | 17 (2 / 15) |
| 100 | base | 0/700 (0%) | 700/700 (100%) | 65 | 302 (302 / 0) |
| 100 | 4d05252 | 210/700 (30.0%) | 370/580 (63.8%) | 0 | 204 (94 / 110) |
| 100 | **new** | 400/700 (57.1%) | **0/400 (0%)** | 0 | 301 (1 / 300) |

- The concrete rate is capped at about 4/7 because the person's single Space action cannot repeat yesterday's headline.
- Real DB replay on 5 invented accounts, Nov 25 – Dec 2 (`item1-moves-after-8day-replay.txt`, `item1-moves-8day-replay-stats.txt`):
  - Concrete headline 20/40.
  - Own repeat next day 0.
  - Generic repeats within 7 days: 1 after, against 14 before.
  - Same-day shared headlines: 8, all each person's own accurate action, 0 generic.
- Day 7 API capture (`item1-moves-after-api.json`): all 5 headlines are the person's concrete action. prs, mfe and ref share "Walk outdoors…" because it is accurate for all three. No own reprint. Reload stable.

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
- A person's own Space action returns on alternate changed-sky days, because it cannot repeat yesterday's headline. Recover/emotional-wave days also lead with it.
- Not verified: real touch devices, production `/biohack/protocol` latency, and non-en labels in the reprint check (history labels are stored in English).
- In the local DB, invented account mge (uid 2) now has `preferred_locale='en'` (set after my first capture). So its DE capture renders English. This is account state, not code.
- Left as is (out of scope): the MG Deep dive Strategy row still says "Feel the gut yes first". Gate optional follow-ups: dual-Midday copy, KIT FACT following the pinned pick, and localizing the sr-only Show-up status.
