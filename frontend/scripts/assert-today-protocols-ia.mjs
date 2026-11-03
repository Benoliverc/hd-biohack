/**
 * Source-level ACs for Today vs Protocols IA split (P0).
 * Run: npx tsx frontend/scripts/assert-today-protocols-ia.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const transits = read("src/app/transits/page.tsx");
const biohack = read("src/app/biohack/page.tsx");
const weather = read("src/components/protocols/WeatherStrip.tsx");
const move = read("src/components/protocols/TodaysMoveCard.tsx");
const todayInd = read("src/components/TodayIndication.tsx");

// Today: no competing "What to do today" heading
if (/What to do today/.test(transits)) {
  fail("transits/page.tsx still has 'What to do today'");
}
if (!/Conditioning notes/.test(transits)) {
  fail("transits/page.tsx missing quieter 'Conditioning notes'");
}
if (/type=\"checkbox\"/.test(transits)) {
  fail("transits/page.tsx must not have checkboxes");
}

// TodayIndication keeps Open Protocols secondary + Main action contract untouched
if (!/open-protocols-secondary/.test(todayInd)) {
  fail("TodayIndication missing Open Protocols secondary link");
}
if (!/main-action/.test(todayInd)) {
  fail("TodayIndication missing main-action test id");
}

// Protocols header thesis
if (/Do the sky/.test(biohack)) {
  fail("biohack header still promises 'Do the sky'");
}
if (!/prove today/.test(biohack)) {
  fail("biohack header missing blueprint subtitle");
}

// WeatherStrip chips + link only
if (/protocols-vs-yesterday/.test(weather) || /protocols-vs-yesterday/.test(biohack)) {
  fail("vs_yesterday pill row still present on Protocols");
}
if (!/Full sky on Today/.test(weather)) {
  fail("WeatherStrip missing 'Full sky on Today' link");
}
if (!/whats-new-chip/.test(weather)) {
  fail("WeatherStrip missing optional what's-new chip");
}

// ≤1 what's-new narrative on Protocols (chip ok; nested essay not)
if (/todays-move-whats-new/.test(move) || /todays-move-whats-new/.test(biohack)) {
  fail("TodaysMoveCard still has nested What's new essay");
}
if (!/Today&apos;s Move|Today's Move/.test(move)) {
  fail("TodaysMoveCard must keep Today's Move naming");
}

// Checkboxes only via Protocols Move card (biohack page itself should not declare checkbox inputs)
if (/type=\"checkbox\"/.test(biohack)) {
  fail("biohack/page.tsx should not inline checkboxes after extract");
}
if (!/type=\"checkbox\"/.test(move)) {
  fail("TodaysMoveCard must retain prove-it checkboxes");
}

console.log("assert-today-protocols-ia PASS");
