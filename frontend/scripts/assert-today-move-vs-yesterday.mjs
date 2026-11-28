/**
 * Today Move must not repeat yesterday, and Why this must not lead with the Space micro.
 * Run: npx tsx scripts/assert-today-move-vs-yesterday.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(resolve(root, rel), "utf8");

const todayInd = read("src/components/TodayIndication.tsx");
const prescription = read("../backend/app/checkin/prescription.py");
const tests = read("../backend/tests/test_day7_five_fixes.py");
const pkg = read("package.json");

const MOVE_SENTENCE_TAG = `<p
                      className="type-statement text-fg"
                      data-testid="main-action-text"
                    >`;

// Why this still renders, and opens on the rationale rather than the Space micro.
assert.match(todayInd, /data-testid="main-action-why-details"/);
assert.match(todayInd, /data-testid="main-action-why"/);
const whyAt = todayInd.indexOf('data-testid="main-action-why-details"');
const whyEnd = todayInd.indexOf("</details>", whyAt);
assert.ok(whyAt > 0 && whyEnd > whyAt, "Why disclosure present");
const whyBlock = todayInd.slice(whyAt, whyEnd);
assert.match(whyBlock, /data-testid="main-action-why"/);
assert.match(whyBlock, /data-testid="main-action-micro"/);
const whyTextAt = whyBlock.indexOf('data-testid="main-action-why"');
const microAt = whyBlock.indexOf('data-testid="main-action-micro"');
assert.ok(microAt >= 0 && whyTextAt > microAt, "micro test id stays in the disclosure source");
assert.doesNotMatch(whyBlock, /<p[\s\S]*data-testid="main-action-micro"/);
assert.doesNotMatch(whyBlock, /\{microText\}/);
assert.doesNotMatch(whyBlock, /\{spaceMicro\}/);
assert.doesNotMatch(whyBlock, /\{spaceMicroLead\}/);
assert.doesNotMatch(todayInd, /\{microText \? \(/);
// Equal to today's Move stays rationale-only. A leftover micro is not a lead either.
assert.match(
  todayInd,
  /spaceMicro && spaceMicro\.trim\(\) === moveText\.trim\(\) \? "" : ""/,
);
assert.match(todayInd, /When the Space action is already the Move headline, Why this keeps only the rationale/);
assert.doesNotMatch(
  todayInd,
  /micro && micro\.trim\(\) === moveText\.trim\(\) \? "" : micro/,
);

// Move hero tag and typography are unchanged.
assert.equal(todayInd.split(MOVE_SENTENCE_TAG).length - 1, 1, "Move sentence tag once");
assert.equal(todayInd.split('className="type-statement text-fg"').length - 1, 1);
const actionIdx = todayInd.indexOf('data-testid="main-action-text"');
const actionOpen = todayInd.lastIndexOf("<p", actionIdx);
const actionTag = todayInd.slice(actionOpen, todayInd.indexOf(">", actionIdx) + 1);
assert.equal(actionTag, MOVE_SENTENCE_TAG);
assert.match(actionTag, /type-statement/);
assert.doesNotMatch(actionTag, /\btype-title\b/);

// Account selection: a new day never repeats yesterday, sky changed or not.
const selectAt = prescription.indexOf("def select_move_text(");
const selectEnd = prescription.indexOf("\ndef _slot_from_kit_when(", selectAt);
const selectFn = prescription.slice(selectAt, selectEnd);
assert.match(selectFn, /_norm_move_text/);
assert.match(prescription, /def _served_today\(/);
assert.match(selectFn, /today = _served_today\(history, day_key, moment\)/);
assert.match(selectFn, /if today and _norm_move_text\(today\) in by_norm:/);
assert.match(selectFn, /yesterday_norms/);
assert.match(selectFn, /def not_yesterday\(/);
assert.match(selectFn, /if not sky_changed:/);
assert.match(selectFn, /open_catalog = \[c for c in catalog if not_yesterday\(c\)\]/);
assert.match(selectFn, /never yesterday's served/);
assert.doesNotMatch(selectFn, /keep the last headline/);
assert.doesNotMatch(selectFn, /if served:\s*\n\s*latest = max\(served\.values\(\)\)/);
assert.match(selectFn, /or catalog_open/);
assert.match(selectFn, /while another catalog line is not yesterday's/);
assert.match(
  selectFn,
  /Another account having the same accurate action is not a reason to drop it/,
);
// Free / no-user_key legacy path stays.
assert.match(selectFn, /if not user_key and not other_blocked and not \(sky_changed and \(history or prior_texts\)\):/);
assert.match(selectFn, /Free \/ no-salt legacy path is unchanged/);

// Tests that encode the rule are present; the old unchanged-sky keep is gone.
assert.match(tests, /def test_unchanged_sky_picks_catalog_line_not_yesterdays_headline\(/);
assert.match(tests, /def test_same_day_reload_keeps_served_headline\(/);
assert.match(tests, /def test_same_day_reload_keeps_served_headline_when_sky_unchanged\(/);
assert.match(tests, /def test_two_people_may_share_their_accurate_concrete_action\(/);
assert.match(tests, /def test_day10_nature_micro_was_yesterday_sky_changed_move_is_not_that_micro\(/);
assert.match(tests, /def test_legacy_free_path_unchanged\(/);
assert.doesNotMatch(tests, /def test_unchanged_sky_keeps_last_headline_no_invented_sentence\(/);

const scriptLine =
  '"assert:today-move-vs-yesterday": "npx tsx scripts/assert-today-move-vs-yesterday.mjs"';
assert.equal(pkg.split(scriptLine).length - 1, 1, "one assert:today-move-vs-yesterday script line");
const ids = [...pkg.matchAll(/"(assert:[^"]+)"/g)].map((match) => match[1]);
const dupes = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual(dupes, []);

console.log("assert-today-move-vs-yesterday: OK");
