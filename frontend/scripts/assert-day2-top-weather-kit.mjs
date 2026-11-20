/**
 * Day 2 top leftovers: same-weather omit on sky change, Vs yesterday humanize,
 * no-kit footnote off when todayKitPick is present.
 * Run: npx tsx scripts/assert-day2-top-weather-kit.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatVsBridgeKey,
  formatVsCentersKey,
  formatVsYesterdayValue,
  vsYesterdayHasSkyChange,
  changeLineIsSkyChange,
} from "../src/lib/vsYesterdayDisplay.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const todayInd = read("src/components/TodayIndication.tsx");
const biohack = read("src/app/biohack/page.tsx");
const en = read("src/lib/i18n/messages/en.ts");
const helper = read("src/lib/vsYesterdayDisplay.ts");

function valueOf(src, key) {
  const re = new RegExp(
    `['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*['"]([\\s\\S]*?)['"]\\s*,`
  );
  const m = src.match(re);
  assert.ok(m, `missing value for ${key}`);
  return m[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
}

// --- (a) quiet Energy/Space + Moon/sky change → no today.weatherSame ---
assert.match(todayInd, /showSameWeather/);
assert.match(todayInd, /skyWeatherChanged/);
assert.match(todayInd, /vsYesterdayHasSkyChange/);
assert.match(todayInd, /changeLineIsSkyChange/);
assert.match(todayInd, /showSameWeather \?/);
assert.ok(
  vsYesterdayHasSkyChange([{ field: "moon", from: "63.3", to: "36.4" }]),
  "moon delta is a sky change"
);
assert.ok(
  vsYesterdayHasSkyChange([
    { field: "newly_defined", from: "none", to: "Solar_Plexus" },
  ]),
  "centers delta is a sky change"
);
assert.equal(
  vsYesterdayHasSkyChange([{ field: "energy", from: "3", to: "4" }]),
  false,
  "energy-only delta is not treated as sky for this omit gate"
);
assert.ok(changeLineIsSkyChange("moon_gate"));
assert.equal(changeLineIsSkyChange("continuity"), false);
assert.equal(changeLineIsSkyChange("first_filled"), false);

assert.equal(valueOf(en, "today.weatherSame"), "Same weather as yesterday.");

// --- (b) Vs yesterday never prints raw Solar_Plexus / piped bridges ---
assert.match(helper, /formatVsCentersKey/);
assert.match(helper, /formatVsBridgeKey/);
assert.match(todayInd, /formatVsYesterdayValue/);
assert.equal(formatVsCentersKey("Solar_Plexus,Spleen"), "Solar Plexus, Spleen");
assert.equal(formatVsCentersKey("Solar_Plexus"), "Solar Plexus");
assert.doesNotMatch(formatVsCentersKey("Solar_Plexus,Spleen"), /_/);
assert.equal(formatVsBridgeKey("10-20|28-38"), "10–20, 28–38");
assert.doesNotMatch(formatVsBridgeKey("10-20|28-38"), /\|/);
assert.equal(
  formatVsYesterdayValue("newly_defined", "Solar_Plexus"),
  "Solar Plexus"
);
assert.equal(
  formatVsYesterdayValue("bridge", "10-20|28-38"),
  "10–20, 28–38"
);
assert.equal(formatVsYesterdayValue("moon", "63.3"), "63.3");

// --- (c) footnote off when todayKitPick is present ---
assert.match(
  biohack,
  /showNoKitFootnote=\{timedLeadsAllBehavior && inventory\.length > 0 && !todayKitPick\}/
);
assert.equal(
  valueOf(en, "protocols.noKitMatch"),
  "No kit item matched today's weather"
);
// Curly apostrophe in locked EN string (U+2019)
assert.equal(
  valueOf(en, "today.kitSetupNoMatch"),
  "Nothing in your kit matched today\u2019s sky."
);

console.log("assert-day2-top-weather-kit PASS");
