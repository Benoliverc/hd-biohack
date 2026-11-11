/**
 * Upcoming sky (item 11) — source ACs.
 * Run: npx tsx scripts/assert-upcoming-sky.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const todayInd = read("src/components/TodayIndication.tsx");
const transits = read("src/app/transits/page.tsx");
const api = read("src/lib/api.ts");
const lib = read("src/lib/upcomingSky.ts");
const weather = read("src/components/protocols/WeatherStrip.tsx");
const biohack = read("src/app/biohack/page.tsx");
const pkg = read("package.json");
const skyAssert = read("scripts/assert-sky-story.mjs");
const locales = ["en", "nl", "de", "fr", "es"].map((id) => ({
  id,
  src: read(`src/lib/i18n/messages/${id}.ts`),
}));

const TOGGLE = "Next 7 days";
const EMPTY = "No sky changes in the next 7 days.";
const ERROR = "Couldn\u2019t load the next 7 days.";
const TURNS = "{weekday}: Sun theme turns.";
const BRIDGE_ON = "{weekday}: a bridge comes on.";
const BRIDGE_CLEARS = "{weekday}: a bridge clears.";
const MOON = "{weekday}: Moon leaves this gate.";
const HOLD = "Sun theme holds through {weekday}.";

assert.ok(
  pkg.includes('"assert:upcoming-sky": "npx tsx scripts/assert-upcoming-sky.mjs"'),
  "package.json wires assert:upcoming-sky",
);

// Dedicated range endpoint — not stuffed into GET /transits/today
assert.match(api, /transitsUpcoming:/);
assert.match(api, /\/transits\/upcoming/);
assert.match(api, /export type UpcomingSkyPayload/);
assert.doesNotMatch(api, /forecast\?:/);
assert.ok(
  !/transits\/today[\s\S]{0,400}forecast/.test(api),
  "do not add a forecast array to GET /transits/today",
);

// Fetch on fold open, not on Today's first paint
assert.match(todayInd, /api\.transitsUpcoming/);
assert.match(todayInd, /upcomingOpen && upcomingStatus === "idle"/);
assert.doesNotMatch(transits, /transitsUpcoming/);
assert.ok(
  /const todayPromise = api\.transitsToday/.test(transits),
  "Today first paint stays on /transits/today",
);

// Placement: sky block, under the tomorrow tease
assert.match(todayInd, /data-testid="today-upcoming-toggle"/);
assert.match(todayInd, /data-testid="today-upcoming"/);
assert.match(todayInd, /data-testid="sky-story-tomorrow"/);

const skyIdx = todayInd.indexOf('data-testid="today-sky-block"');
const teaseIdx = todayInd.indexOf('data-testid="sky-story-tomorrow"');
const toggleIdx = todayInd.indexOf('data-testid="today-upcoming-toggle"');
const panelIdx = todayInd.indexOf('data-testid="today-upcoming"');
const moveIdx = todayInd.indexOf('data-testid="main-action"');
const signalIdx = todayInd.indexOf('data-testid="daily-signal"');
const vsIdx = todayInd.indexOf('data-testid="vs-yesterday"');
const factIdx = todayInd.indexOf('data-testid="hd-fact-of-the-day"');

assert.ok(skyIdx >= 0 && teaseIdx > skyIdx, "tease stays in the sky block");
assert.ok(toggleIdx > teaseIdx, "toggle is under the tomorrow tease");
assert.ok(panelIdx > toggleIdx, "list sits with the toggle under the tease");
assert.ok(moveIdx >= 0 && moveIdx < skyIdx, "fold is not in the Move hero");
assert.ok(signalIdx > moveIdx && toggleIdx > signalIdx, "fold is after the signal");
assert.ok(vsIdx > 0 && toggleIdx > vsIdx, "fold is after vs-yesterday");
assert.ok(factIdx > panelIdx, "fold is before the lower literacy / tables stack");

// Tease remains when closed; list is not always visible; tomorrow is not duplicated when open
assert.match(todayInd, /sky_story\?\.tomorrow\?\.text && !upcomingOpen/);
assert.match(todayInd, /\{upcomingOpen \? \(/);
assert.doesNotMatch(todayInd, /week-ahead|weekAhead|WeatherStrip/);

// No future Move in the tease or the list
const foldChunk = todayInd.slice(teaseIdx, factIdx);
assert.doesNotMatch(foldChunk, /move_item_id|main_action_text|today\.move[^A-Za-z]/);
assert.match(lib, /buildUpcomingRows/);
assert.doesNotMatch(lib, /move_item_id|main_action/);

// Keyed wait / error / retry, no raw API text in the fold
assert.match(todayInd, /data-testid="today-upcoming-loading"/);
assert.match(todayInd, /data-testid="today-upcoming-error"/);
assert.match(todayInd, /data-testid="today-upcoming-retry"/);
assert.match(todayInd, /today\.upcoming\.error/);
assert.doesNotMatch(foldChunk, /\.message|String\(err|error\.toString/);

// i18n: locked EN in all five locales
for (const { id, src } of locales) {
  assert.ok(src.includes(`'today.upcoming.toggle': '${TOGGLE}'`), `${id} toggle`);
  assert.ok(src.includes(`'today.upcoming.empty': '${EMPTY}'`), `${id} empty`);
  assert.ok(src.includes(`'today.upcoming.error': '${ERROR}'`), `${id} error typographic apostrophe`);
  assert.ok(src.includes(`'today.upcoming.sunThemeTurns': '${TURNS}'`), `${id} sun turns`);
  assert.ok(src.includes(`'today.upcoming.bridgeOn': '${BRIDGE_ON}'`), `${id} bridge on`);
  assert.ok(src.includes(`'today.upcoming.bridgeClears': '${BRIDGE_CLEARS}'`), `${id} bridge clears`);
  assert.ok(src.includes(`'today.upcoming.moonLeaves': '${MOON}'`), `${id} moon leaves`);
  assert.ok(src.includes(`'today.upcoming.sunThemeHoldsThrough': '${HOLD}'`), `${id} hold`);
}

// Protocols week theme / WeatherStrip stay the door to Today; no forecast module there
assert.doesNotMatch(weather, /today-upcoming|transitsUpcoming|upcoming-sky/);
assert.doesNotMatch(biohack, /today-upcoming|transitsUpcoming/);
assert.match(weather, /protocols\.fullSkyOnToday/);
assert.match(weather, /data-testid="weather-full-sky-link"/);

// sky-story assert still exists and allows this fold
assert.match(skyAssert, /today-upcoming-toggle/);
assert.match(skyAssert, /today-upcoming/);
assert.match(pkg, /"assert:sky-story"/);

console.log("assert-upcoming-sky PASS");
