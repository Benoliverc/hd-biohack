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

// No week-ahead strip on Today
assert.doesNotMatch(todayInd, /week-ahead|WeatherStrip|weekAhead/i);
assert.doesNotMatch(weather, /data-testid="sky-story"/);

// API types present
assert.match(api, /export type SkyStory/);
assert.match(api, /export type TomorrowTease/);
assert.match(api, /sky_story\?:/);

console.log("assert-sky-story PASS");
