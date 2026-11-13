/**
 * Sky Story source ACs — chapter under signal, vs pills collapsed, no Move in tomorrow.
 * Run: npx tsx scripts/assert-sky-story.mjs
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
const api = read("src/lib/api.ts");
const weather = read("src/components/protocols/WeatherStrip.tsx");

assert.match(todayInd, /data-testid="sky-story"/);
assert.match(todayInd, /data-testid="sky-story-tomorrow"/);
assert.match(todayInd, /data-testid="vs-yesterday"/);
assert.match(todayInd, /data-testid="daily-signal"/);
assert.match(todayInd, /data-testid="main-action"/);
assert.match(todayInd, /data-testid="today-sky-block"/);

const moveIdx = todayInd.indexOf('data-testid="main-action"');
const signalIdx = todayInd.indexOf('data-testid="daily-signal"');
const storyIdx = todayInd.indexOf('data-testid="sky-story"');
const vsIdx = todayInd.indexOf('data-testid="vs-yesterday"');
assert.ok(moveIdx >= 0 && signalIdx > moveIdx, "signal under Move");
assert.ok(storyIdx > signalIdx, "chapter under signal");
assert.ok(vsIdx > storyIdx || vsIdx > signalIdx, "vs near sky block");

// vs stays in <details> (collapsed by default)
const vsBlock = todayInd.slice(vsIdx - 80, vsIdx + 200);
assert.match(vsBlock, /<details/);

// No always-visible week-ahead strip in the Move hero; this fold lives in the sky block.
assert.doesNotMatch(todayInd, /week-ahead|WeatherStrip|weekAhead/i);
assert.doesNotMatch(weather, /data-testid="sky-story"/);
assert.match(todayInd, /data-testid="today-upcoming-toggle"/);
assert.match(todayInd, /data-testid="today-upcoming"/);
const skyBlockIdx = todayInd.indexOf('data-testid="today-sky-block"');
const toggleIdx = todayInd.indexOf('data-testid="today-upcoming-toggle"');
const panelIdx = todayInd.indexOf('data-testid="today-upcoming"');
const teaseIdx2 = todayInd.indexOf('data-testid="sky-story-tomorrow"');
const factIdx = todayInd.indexOf('data-testid="hd-fact-of-the-day"');
assert.ok(skyBlockIdx >= 0 && teaseIdx2 > skyBlockIdx, "tease in sky block");
assert.ok(toggleIdx > teaseIdx2, "upcoming toggle under tomorrow tease");
assert.ok(panelIdx > toggleIdx && panelIdx < factIdx, "fold in sky block, not lower tables");
assert.ok(moveIdx < skyBlockIdx, "fold is not an always-visible strip in the Move hero");
assert.match(todayInd, /\{upcomingOpen \? \(/);
assert.match(todayInd, /tomorrowText && !upcomingOpen/);

// Tease and upcoming list must not invent a future Move
const forwardChunk = todayInd.slice(teaseIdx2, factIdx);
assert.doesNotMatch(forwardChunk, /move_item_id|main_action_text/);

// API types present
assert.match(api, /export type SkyStory/);
assert.match(api, /export type TomorrowTease/);
assert.match(api, /sky_story\?:/);

console.log("assert-sky-story PASS");
