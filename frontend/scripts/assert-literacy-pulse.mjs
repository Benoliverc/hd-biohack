/**
 * Contextual Literacy Pulse — pure selection + source ACs.
 * Run: npx tsx scripts/assert-literacy-pulse.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mod = await import("../src/lib/hdFactOfTheDay.ts");
const {
  contextualHdFact,
  pickLiteracyField,
  hdFactForDay,
  SKY_LITERACY_FACTS,
  HD_FACTS_OF_THE_DAY,
  LITERACY_JUMP_BY_FIELD,
} = mod;

const fixed = new Date("2026-11-06T04:00:00.000Z"); // 12:00 Asia/Hong_Kong novelty day 2026-11-06

// Sky-keyed when vs_yesterday has a moon/sun/bridge/newly/hanging change
const moonPulse = contextualHdFact({
  vsYesterday: [{ field: "moon", from: "17.1", to: "51.4" }],
  dailySignal: {
    key: "moon:51.4",
    headline: "Moon into Gate 51",
    body: "Notice",
    source: "moon_gate",
  },
  now: fixed,
});
assert.equal(moonPulse.skyKeyed, true);
assert.equal(moonPulse.field, "moon");
assert.equal(moonPulse.fact, SKY_LITERACY_FACTS.moon);
assert.equal(moonPulse.howToReadTargetId, "today-new-signal");
assert.ok(moonPulse.fact.length > 0);

const bridgePulse = contextualHdFact({
  vsYesterday: [{ field: "bridge", from: "none", to: "10-20" }],
  now: fixed,
});
assert.equal(bridgePulse.field, "bridge");
assert.equal(bridgePulse.howToReadTargetId, "today-bridged-channels");

const newlyPulse = contextualHdFact({
  vsYesterday: [{ field: "newly_defined", from: "none", to: "Sacral" }],
  now: fixed,
});
assert.equal(newlyPulse.field, "newly_defined");
assert.equal(newlyPulse.howToReadTargetId, "today-newly-defined");

const hangingPulse = contextualHdFact({
  vsYesterday: [{ field: "hanging_pressure", from: "none", to: "20" }],
  now: fixed,
});
assert.equal(hangingPulse.field, "hanging_pressure");

const sunPulse = contextualHdFact({
  vsYesterday: [{ field: "sun", from: "50.4", to: "50.5" }],
  now: fixed,
});
assert.equal(sunPulse.field, "sun");
assert.equal(sunPulse.howToReadTargetId, "today-sun-earth");

// energy/space alone → not literacy key; fall back to bank
const energyOnly = contextualHdFact({
  vsYesterday: [{ field: "energy", from: "3", to: "4" }],
  now: fixed,
});
assert.equal(energyOnly.skyKeyed, false);
assert.equal(energyOnly.field, null);
assert.ok(HD_FACTS_OF_THE_DAY.includes(energyOnly.fact));

// Continuity filler moon pill is not a real Moon move → source continuity → sun theme
const continuityFiller = contextualHdFact({
  vsYesterday: [
    { field: "moon", from: "same conditioning", to: "Day 3 of Sun Gate 50" },
  ],
  dailySignal: {
    key: "continuity:sun50:moon17.1:day3",
    headline: "Day 3",
    body: "Hold",
    source: "continuity",
  },
  now: fixed,
});
assert.equal(continuityFiller.field, "sun");
assert.equal(continuityFiller.skyKeyed, true);

// No overlay / first-day emptiness → bank fallback; never empty
const empty = contextualHdFact({
  vsYesterday: [],
  dailySignal: null,
  now: fixed,
});
assert.equal(empty.skyKeyed, false);
assert.ok(empty.fact.length > 0);
assert.equal(empty.fact, hdFactForDay(fixed).fact);

const noArgs = contextualHdFact({ now: fixed });
assert.ok(noArgs.fact.length > 0);

// Priority: moon beats energy when both present
assert.equal(
  pickLiteracyField({
    vsYesterday: [
      { field: "energy", from: "2", to: "3" },
      { field: "moon", from: "1.1", to: "2.2" },
    ],
  }),
  "moon"
);

// Source-level: aside stays below Move; uses contextualHdFact
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}
const todayInd = read("src/components/TodayIndication.tsx");
assert.match(todayInd, /contextualHdFact/);
assert.match(todayInd, /data-testid="hd-fact-of-the-day"/);
assert.match(todayInd, /data-testid="hd-fact-how-to-read"/);
assert.match(todayInd, /data-testid="main-action"/);
const moveIdx = todayInd.indexOf('data-testid="main-action"');
const factIdx = todayInd.indexOf('data-testid="hd-fact-of-the-day"');
assert.ok(moveIdx >= 0 && factIdx > moveIdx, "fact aside must stay below Move");
assert.ok(
  !/data-testid="hd-fact-of-the-day"[\s\S]*data-testid="main-action"/.test(todayInd) ||
    factIdx > moveIdx,
  "fact must not appear above Move"
);

// Jump targets match How to read Today steps
for (const [field, target] of Object.entries(LITERACY_JUMP_BY_FIELD)) {
  assert.ok(
    ["today-new-signal", "today-sun-earth", "today-bridged-channels", "today-newly-defined"].includes(
      target
    ),
    `${field} → ${target}`
  );
}

// Pulse opens the Today reader at the matching step — it is a button, not an in-page hash.
const pulseCtrl = todayInd.slice(
  todayInd.lastIndexOf("<", todayInd.indexOf('data-testid="hd-fact-how-to-read"')),
  todayInd.indexOf(">", todayInd.indexOf('data-testid="hd-fact-how-to-read"')) + 1,
);
assert.ok(pulseCtrl.includes("<button"), "pulse How to read is a button");
assert.ok(todayInd.includes("onHowToRead"), "pulse calls up onHowToRead(stepId)");
assert.ok(
  !/data-testid="hd-fact-how-to-read"[\s\S]{0,200}href=\{`#/.test(todayInd) &&
    !pulseCtrl.includes("href="),
  "pulse does not hash-scroll the page in place of opening the reader",
);

// Sky facts stay shorter than a typical Sky Story chapter (soft length guard)
for (const fact of Object.values(SKY_LITERACY_FACTS)) {
  assert.ok(fact.split(/\s+/).length <= 28, `sky fact too long: ${fact}`);
  assert.ok(!/type change|change your Type/i.test(fact) || /not a .*Type change/i.test(fact));
  assert.ok(!/universe wants|destiny|soulmate|aligned score/i.test(fact));
}

// Account-TZ novelty day: same UTC instant is still 5 Nov in America/New_York
const nyLate = contextualHdFact({ now: fixed, timeZone: "America/New_York" });
assert.equal(nyLate.dayKey, "2026-11-05");
const hktNoon = contextualHdFact({ now: fixed, timeZone: "Asia/Hong_Kong" });
assert.equal(hktNoon.dayKey, "2026-11-06");

console.log("assert-literacy-pulse PASS");

