/**
 * Today signal structure: hero headline, chart-completes heading, Also today leftovers.
 * Run: npx tsx scripts/assert-today-signal-structure.mjs
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const sha = (text) => createHash("sha256").update(text).digest("hex");

const { alsoTodayLines, termSecondCaption } = await import("../src/lib/todayCopy.ts");
const { skyCompletesText } = await import("../src/lib/bridgedChannels.ts");
const { displayCenter } = await import("../src/lib/hdCopy.ts");
const { translate } = await import("../src/lib/i18n/I18nProvider.tsx");

const tEn = (key, vars) => translate("en", key, vars);
const tNl = (key, vars) => translate("nl", key, vars);

const FULL = "{planet} \u00b7 {gateLabel} {gate}, {lineLabel} {line}";
const PLANET_GATE = "{planet} \u00b7 {gateLabel} {gate}";
const GATE_LINE = "{gateLabel} {gate}, {lineLabel} {line}";
const OLD_FULL = "{planet}, {gateLabel} {gate} \u00b7 {lineLabel} {line}";
const EN_DASH = "\u2013";

function daily(partial) {
  return {
    key: "today.signal",
    headline: "",
    body: "",
    source: "moon_gate",
    ...partial,
  };
}

function indication({ signal = null, parts = [], lines = [] } = {}) {
  return {
    daily_signal: signal,
    sky_story: { lines, line_parts: parts },
  };
}

function channel(partial) {
  return {
    gates: [1, 8],
    name: "Inspiration",
    centers: ["G", "Throat"],
    natal_gates: [8],
    transit_gates: [1],
    kind: "hanging",
    window_start: "2026-11-28",
    ...partial,
  };
}

const todayInd = read("src/components/TodayIndication.tsx");
const todayCopy = read("src/lib/todayCopy.ts");
const bridged = read("src/lib/bridgedChannels.ts");
const enSoul = read("src/lib/i18n/messages/todaySoul.en.ts");
const nlSoul = read("src/lib/i18n/messages/todaySoul.nl.ts");

// --- 1. Headline templates ---
assert.equal(translate("en", "today.termCaption.full"), FULL);
assert.equal(translate("nl", "today.termCaption.full"), FULL);
assert.equal(translate("en", "today.termCaption.planetGate"), PLANET_GATE);
assert.equal(translate("nl", "today.termCaption.planetGate"), PLANET_GATE);
assert.equal(translate("en", "today.termCaption.gateLine"), GATE_LINE);
assert.equal(translate("nl", "today.termCaption.gateLine"), GATE_LINE);
assert.equal(translate("en", "today.termCaption.gate"), "{gateLabel} {gate}");
assert.equal(translate("nl", "today.termCaption.gate"), "{gateLabel} {gate}");
assert.match(todayCopy, /t\("today\.termCaption\.full"/);
assert.match(todayCopy, /t\("today\.termCaption\.planetGate"/);
assert.match(todayCopy, /t\("today\.termCaption\.gateLine"/);
assert.match(todayCopy, /t\("today\.termCaption\.gate"/);
assert.equal(
  termSecondCaption(daily({ planet: "Moon", gate: 62, line: 3 }), tEn),
  "Moon \u00b7 Gate 62, line 3"
);
assert.equal(
  termSecondCaption(daily({ planet: "Moon", gate: 62, line: 3 }), tNl),
  "Maan \u00b7 Gate 62, lijn 3"
);
assert.equal(translate("nl", "today.term.gate"), "Gate");
assert.equal(translate("en", "today.term.line"), "line");
assert.equal(translate("nl", "today.term.line"), "lijn");
assert.equal(enSoul.includes(OLD_FULL), false, "EN dropped the old full caption");
assert.equal(nlSoul.includes(OLD_FULL), false, "NL dropped the old full caption");
assert.equal(read("src/lib/i18n/messages/todaySoul.de.ts").includes(OLD_FULL), true);

// --- 2. Completes block and everyday centers ---
const pickAt = todayInd.indexOf("{skyPick ? (");
const storyAt = todayInd.indexOf('data-testid="sky-story"');
assert.ok(pickAt > 0 && storyAt > pickAt, "completes block is gated on skyPick before sky-story");
const completesBlock = todayInd.slice(pickAt, storyAt);
assert.match(completesBlock, /data-testid="today-sky-completes"/);
assert.match(completesBlock, /data-testid="today-in-your-chart"/);
assert.match(completesBlock, /t\("today\.inYourChart"\)/);
assert.match(completesBlock, /skyCompletesText\(skyPick\.lead, t\)/);
assert.match(completesBlock, /data-testid="today-sky-completes-open"/);
assert.match(completesBlock, /: null\}/);
assert.match(
  completesBlock,
  /mb-1 text-xs font-semibold tracking-wide text-fg-muted/
);
assert.doesNotMatch(completesBlock, /uppercase/);
const completesFn = bridged.slice(bridged.indexOf("export function skyCompletesText"));
assert.doesNotMatch(completesFn, /displayCenter/);
assert.doesNotMatch(bridged, /from "@\/lib\/hdCopy"/);
const gThroat = skyCompletesText(channel({ centers: ["G", "Throat"], transit_gates: [1] }), tEn);
assert.match(gThroat, /joining Identity and Throat/);
assert.equal(gThroat.includes("G / Identity"), false);
assert.equal(
  gThroat,
  `Today\u2019s Gate 1 completes your Channel 1${EN_DASH}8, Inspiration, joining Identity and Throat.`
);
const heart = skyCompletesText(
  channel({ centers: ["Heart", "Throat"], gates: [21, 45], name: "Money", transit_gates: [21] }),
  tEn
);
assert.match(heart, /joining Heart and Throat/);
assert.equal(heart.includes("Ego / Heart"), false);
const plexus = skyCompletesText(
  channel({
    centers: ["Solar_Plexus", "Root"],
    gates: [39, 55],
    name: "Emoting",
    transit_gates: [39],
  }),
  tEn
);
assert.match(plexus, /joining Solar Plexus and Root/);
assert.equal(
  skyCompletesText(
    channel({
      gates: [48, 16],
      name: "The Wavelength",
      centers: ["Spleen", "Throat"],
      natal_gates: [16],
      transit_gates: [48],
    }),
    tEn
  ),
  `Today\u2019s Gate 48 completes your Channel 16${EN_DASH}48, The Wavelength, joining Spleen and Throat.`
);

// --- 3. CTA ---
assert.equal(translate("en", "today.skyCompletes.more"), "See {k} more in Sky details");
assert.equal(translate("nl", "today.skyCompletes.more"), "Zie {k} meer in Sky details");
assert.equal(translate("en", "today.skyCompletes.open"), "See it in Sky details");
assert.equal(translate("nl", "today.skyCompletes.open"), "Zie het in Sky details");
assert.equal(translate("en", "today.skyCompletes.more", { k: 2 }), "See 2 more in Sky details");
assert.equal(translate("nl", "today.skyCompletes.more", { k: 2 }), "Zie 2 meer in Sky details");
assert.match(completesBlock, /onOpenSkyDetails\("today-bridged-channels"\)/);
assert.match(completesBlock, /min-h-11/);
assert.match(completesBlock, /skyPick\.more > 0/);

// --- 4. alsoTodayLines de-dupe ---
const ch18 = channel({ gates: [1, 8], window_start: "2026-11-28" });
const moon62 = { key: "today.skyStory.moonMoved", params: { gate: 62 } };
const sun9 = { key: "today.skyStory.sunTurned", params: { gate: 9 } };
const centers = { key: "today.skyStory.tempCenters", params: { centers: "G, Heart" } };
const bridgeOn = { key: "today.skyStory.bridgeOn" };

assert.deepEqual(
  alsoTodayLines(
    indication({
      signal: daily({ planet: "Moon", gate: 62, line: 3 }),
      parts: [moon62, sun9, bridgeOn, centers],
    }),
    tEn,
    { hasCompletes: true, bridgedChannels: [ch18], noveltyDay: "2026-11-28" }
  ),
  ["Sun and Earth turned to Gate 9.", "G and Heart are lit for today only."]
);

const moonKeys = [
  ["today.skyStory.moonMoved", { gate: 62 }],
  ["today.skyStory.moonInGateLine", { gate: 62, line: 3 }],
  ["today.skyStory.moonInGate", { gate: 62 }],
  ["today.skyStory.moonNewLine", { gate: 62, line: 3 }],
  ["today.skyStory.moonHolds", { label: "62.3" }],
  ["today.skyStory.moonInLabel", { label: "62" }],
];
for (const [key, params] of moonKeys) {
  assert.deepEqual(
    alsoTodayLines(
      indication({
        signal: daily({ planet: "Moon", gate: 62, line: 3 }),
        parts: [{ key, params }, sun9],
      }),
      tEn,
      { hasCompletes: false, bridgedChannels: [], noveltyDay: null }
    ),
    ["Sun and Earth turned to Gate 9."],
    `drops ${key} when the Moon headline names that gate`
  );
}

assert.deepEqual(
  alsoTodayLines(
    indication({
      signal: daily({ planet: "Sun", gate: 9, line: 1, source: "sun_gate" }),
      parts: [moon62, sun9],
    }),
    tEn,
    { hasCompletes: false, bridgedChannels: [], noveltyDay: null }
  )[0],
  "Moon moved to Gate 62.",
  "keeps the Moon line when the daily is Sun"
);
assert.equal(
  alsoTodayLines(
    indication({ signal: null, parts: [moon62] }),
    tEn,
    { hasCompletes: false, bridgedChannels: [], noveltyDay: null }
  )[0],
  "Moon moved to Gate 62.",
  "keeps the Moon line when there is no daily"
);
assert.equal(
  alsoTodayLines(
    indication({
      signal: daily({ planet: "Moon", source: "moon_gate" }),
      parts: [moon62],
    }),
    tEn,
    { hasCompletes: false, bridgedChannels: [], noveltyDay: null }
  )[0],
  "Moon moved to Gate 62.",
  "keeps the Moon line when the headline is empty"
);
assert.deepEqual(
  alsoTodayLines(
    indication({
      signal: daily({ planet: "Moon", gate: 62, line: 3 }),
      parts: [{ key: "today.skyStory.moonMoved", params: { gate: 9 } }, sun9],
    }),
    tEn,
    { hasCompletes: false, bridgedChannels: [], noveltyDay: null }
  ),
  ["Moon moved to Gate 9.", "Sun and Earth turned to Gate 9."],
  "keeps a Moon line about a different gate"
);

const withCleared = alsoTodayLines(
  indication({
    signal: daily({ planet: "Moon", gate: 62, line: 3 }),
    parts: [bridgeOn, { key: "today.skyStory.bridgeActive" }, { key: "today.skyStory.bridgeDay", params: { day: 3 } }, { key: "today.skyStory.bridgeCleared" }, sun9],
  }),
  tEn,
  { hasCompletes: true, bridgedChannels: [ch18], noveltyDay: "2026-11-28" }
);
assert.deepEqual(withCleared, ["Yesterday's bridge cleared.", "Sun and Earth turned to Gate 9."]);
assert.equal(withCleared.some((line) => /bridge/i.test(line) && !line.startsWith("Yesterday")), false);

assert.deepEqual(
  alsoTodayLines(
    indication({
      signal: daily({ planet: "Sun", gate: 9, line: 1, source: "sun_gate" }),
      parts: [bridgeOn],
    }),
    tEn,
    { hasCompletes: false, bridgedChannels: [ch18], noveltyDay: "2026-11-28" }
  ),
  [`Channel 1${EN_DASH}8 is on as a temporary bridge.`]
);
assert.deepEqual(
  alsoTodayLines(
    indication({ signal: null, parts: [bridgeOn, sun9] }),
    tEn,
    { hasCompletes: false, bridgedChannels: [], noveltyDay: "2026-11-28" }
  ),
  ["Sun and Earth turned to Gate 9."],
  "omits an unnamed bridge when gates cannot be resolved"
);
assert.deepEqual(
  alsoTodayLines(
    indication({ signal: null, parts: [bridgeOn] }),
    tEn,
    { hasCompletes: false, bridgedChannels: [channel({ gates: [8] })], noveltyDay: null }
  ),
  [],
  "omits an unnamed bridge when the channel has fewer than two gates"
);

const later = channel({ gates: [2, 14], name: "The Beat", window_start: "2026-11-01" });
const todayAnyKind = channel({
  gates: [1, 8],
  kind: "transit_transit",
  window_start: "2026-11-28",
});
assert.deepEqual(
  alsoTodayLines(
    indication({ signal: null, parts: [{ key: "today.skyStory.bridgeDay", params: { day: 2 } }, { key: "today.skyStory.bridgeActive" }] }),
    tEn,
    { hasCompletes: false, bridgedChannels: [later, todayAnyKind], noveltyDay: "2026-11-28" }
  ),
  [`Channel 1${EN_DASH}8 is on as a temporary bridge.`],
  "one named line, preferring the channel that starts today, any kind"
);
assert.deepEqual(
  alsoTodayLines(
    indication({ signal: null, parts: [bridgeOn] }),
    tEn,
    { hasCompletes: false, bridgedChannels: [later, todayAnyKind], noveltyDay: "2026-11-01" }
  ),
  [`Channel 2${EN_DASH}14 is on as a temporary bridge.`]
);

// --- 5. Catalog voice and retired sentences ---
assert.equal(translate("en", "today.skyStory.sunTurned", { gate: 9 }), "Sun and Earth turned to Gate 9.");
assert.equal(translate("nl", "today.skyStory.sunTurned", { gate: 9 }), "Zon en Aarde zijn naar Gate 9 gedraaid.");
assert.equal(
  translate("en", "today.skyStory.sunStill", { day: 4 }),
  "Sun and Earth are still in this theme \u2014 day 4."
);
assert.equal(translate("en", "today.skyStory.sunInGate", { gate: 9 }), "Sun and Earth in Gate 9.");
assert.equal(
  translate("en", "today.skyStory.day1SunTheme", { gate: 9 }),
  "Day 1 of this Sun and Earth theme (Gate 9)."
);
assert.equal(
  translate("en", "today.skyStory.holdSunTheme", { gate: 9 }),
  "Hold the same Sun and Earth Gate 9 theme."
);
assert.equal(translate("en", "today.skyStory.tempCenters", { centers: "G and Heart" }), "G and Heart are lit for today only.");
assert.equal(translate("nl", "today.skyStory.tempCenters", { centers: "G en Heart" }), "G en Heart zijn alleen vandaag belicht.");
assert.equal(translate("en", "today.skyStory.tempCentersOne", { center: "G" }), "G is lit for today only.");
assert.equal(translate("nl", "today.skyStory.tempCentersOne", { center: "G" }), "G is alleen vandaag belicht.");
assert.equal(translate("en", "today.inYourChart"), "In your chart today");
assert.equal(translate("nl", "today.inYourChart"), "In jouw chart vandaag");
assert.equal(translate("en", "today.alsoToday"), "Also today");
assert.equal(translate("nl", "today.alsoToday"), "Ook vandaag");
assert.equal(
  translate("nl", "today.skyCompletes.line", { m: 1, a: 1, b: 8, name: "Inspiration", centerA: "Identity", centerB: "Throat" }),
  `De Gate 1 van vandaag maakt je Channel 1${EN_DASH}8, Inspiration, compleet en verbindt Identity en Throat.`
);
assert.equal(translate("nl", "today.skyStory.moonInGateLine", { gate: 62, line: 3 }), "Maan in Gate 62 \u00b7 lijn 3.");
assert.equal(translate("nl", "today.skyStory.moonMoved", { gate: 62 }), "De Maan is naar Gate 62 getrokken.");
assert.equal(translate("nl", "today.skyStory.hangingPeek", { gate: 62, center: "Throat" }), "Hangende druk kijkt even mee bij Gate 62 (Throat).");
assert.equal(translate("nl", "today.skyStory.colouredByGate", { gate: 9 }), "Vandaag is gekleurd door Gate 9.");
assert.equal(
  translate("en", "today.skyStory.bridgeNamed", { a: 1, b: 8 }),
  `Channel 1${EN_DASH}8 is on as a temporary bridge.`
);
assert.equal(
  translate("nl", "today.skyStory.bridgeNamed", { a: 1, b: 8 }),
  `Channel 1${EN_DASH}8 staat vandaag aan als tijdelijke brug.`
);

assert.deepEqual(
  alsoTodayLines(
    indication({ signal: null, parts: [{ key: "today.skyStory.tempCenters", params: { centers: "Spleen" } }] }),
    tEn,
    { hasCompletes: false, bridgedChannels: [], noveltyDay: null }
  ),
  ["Spleen is lit for today only."]
);
assert.deepEqual(
  alsoTodayLines(
    indication({
      signal: null,
      parts: [{ key: "today.skyStory.tempCenters", params: { centers: "G, Heart, Spleen" } }],
    }),
    tEn,
    { hasCompletes: false, bridgedChannels: [], noveltyDay: null }
  ),
  ["G and Heart and Spleen are lit for today only."]
);
assert.deepEqual(
  alsoTodayLines(
    indication({
      signal: null,
      parts: [{ key: "today.skyStory.tempCenters", params: { centers: "G, Heart" } }],
    }),
    tNl,
    { hasCompletes: false, bridgedChannels: [], noveltyDay: null }
  ),
  ["G en Heart zijn alleen vandaag belicht."]
);

const OLD_STRINGS = [
  "Sun/Earth theme turned to Gate",
  "Temporary center peeks",
  "A bridge flipped on today",
  "+{k} more in Sky details",
];
for (const file of ["todaySoul.en.ts", "todaySoul.nl.ts", "en.ts", "nl.ts"]) {
  const src = read(`src/lib/i18n/messages/${file}`);
  for (const old of OLD_STRINGS) {
    assert.equal(src.includes(old), false, `${file} still contains ${old}`);
  }
}
const keepers = [
  sun9,
  { key: "today.skyStory.colouredByGate", params: { gate: 9 } },
  { key: "today.skyStory.hangingPeek", params: { gate: 62, center: "Throat" } },
  { key: "today.skyStory.opens" },
  { key: "today.skyStory.day1Chapter" },
];
const capped = alsoTodayLines(
  indication({ signal: null, parts: keepers }),
  tEn,
  { hasCompletes: false, bridgedChannels: [], noveltyDay: null }
);
assert.equal(capped.length, 4);
assert.equal(capped.includes("Day 1 of this sky chapter."), false, "does not pad or pull a fifth line");
assert.equal(
  alsoTodayLines(
    indication({ signal: null, parts: [sun9] }),
    tEn,
    { hasCompletes: false, bridgedChannels: [], noveltyDay: null }
  ).length,
  1
);
assert.deepEqual(
  alsoTodayLines(
    indication({
      signal: daily({ planet: "Moon", gate: 62, line: 3 }),
      parts: [moon62, bridgeOn],
    }),
    tEn,
    { hasCompletes: true, bridgedChannels: [ch18], noveltyDay: "2026-11-28" }
  ),
  []
);

// --- 6. Block order and untouched wiring ---
const order = [
  'data-testid="main-action"',
  'data-testid="today-sky-block"',
  'data-testid="daily-signal"',
  'data-testid="today-sky-completes"',
  'data-testid="sky-story"',
  'data-testid="vs-yesterday"',
  'data-testid="sky-story-tomorrow"',
  'data-testid="today-upcoming-toggle"',
];
let cursor = -1;
for (const id of order) {
  const at = todayInd.indexOf(id);
  assert.ok(at > cursor, `${id} stays in order`);
  cursor = at;
}
assert.match(todayInd, /alsoTodayLines\(/);
assert.match(todayInd, /aria-labelledby="today-also-today"/);
assert.match(todayInd, /data-testid="today-also-today"/);
assert.match(todayInd, /t\("today\.alsoToday"\)/);
assert.doesNotMatch(todayInd, /aria-label=\{t\("today\.skyStory"\)\}/);
assert.match(read("src/lib/i18n/messages/en.ts"), /'today\.skyStory': 'Sky story'/);
assert.match(todayInd, /onHowToRead/);
assert.match(todayInd, /energy_space_slot/);
assert.match(todayInd, /localizeMove\(/);
assert.match(todayInd, /localizeTomorrow\(/);
assert.equal(todayInd.split('className="type-statement text-fg"').length - 1, 1);
assert.equal(todayInd.split("uppercase").length > 1, true);

// --- 7. displayCenter, frozen graph files, and novelty. ChartBodygraph is the joining-gate bytes. ---
assert.equal(displayCenter("G"), "G / Identity");
assert.equal(displayCenter("Heart"), "Ego / Heart");
assert.equal(
  sha(read("src/components/BodyGraph.tsx")),
  "8f9380005b90a2b6e34190650a599c248d79e84e13c99e15ea9086d5b3dd2da8"
);
assert.equal(
  sha(read("src/lib/bodygraphGeometry.ts")),
  "cc8c5433776ee2e8758f95f868597a5821f8077eec8a92ec7bcb6cad15f1b743"
);
assert.equal(
  sha(read("src/components/ChartBodygraph.tsx")),
  "debc7c17f69a3ba153f6366def2ae8de43f258ddc9596b57a9b6c078dc94a5e5"
);
assert.equal(
  sha(read("../backend/app/checkin/novelty.py")),
  "125ebab496b497e3d4292a1d2c44794d489280199c486f409dc5f7a4bfd7e48e"
);

const pkg = read("package.json");
const script = '"assert:today-signal-structure": "npx tsx scripts/assert-today-signal-structure.mjs"';
assert.equal(pkg.split(script).length - 1, 1, "one assert:today-signal-structure script");
const ids = [...pkg.matchAll(/"(assert:[^"]+)"/g)].map((match) => match[1]);
const dupes = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual(dupes, []);

console.log("PASS assert-today-signal-structure");
