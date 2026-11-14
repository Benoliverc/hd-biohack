/**
 * Source-level ACs for the Today Sky details bridged-channels expansion.
 * Run: npx tsx scripts/assert-today-bridged-channels-sky-details.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { messages as enMessages } from "../src/lib/i18n/messages/en.ts";
import {
  BRIDGE_MEANING_KEYS,
  bridgeDateYearFlags,
  bridgeMeaningText,
  bridgeOwnershipText,
  bridgeWindowCaption,
  bridgeWindowText,
  formatBridgeDate,
  skyDetailsSummaryKey,
} from "../src/lib/bridgedChannels.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function keysOf(src) {
  const keys = [];
  const re = /^\s*['"]([^'"]+)['"]\s*:/gm;
  let m;
  while ((m = re.exec(src))) keys.push(m[1]);
  return keys;
}

function valueOf(src, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const startRe = new RegExp(`['"]${escaped}['"]\\s*:\\s*`);
  const m = startRe.exec(src);
  assert.ok(m, `missing value for ${key}`);
  const q = src[m.index + m[0].length];
  assert.ok(q === "'" || q === '"', `bad quote for ${key}`);
  let i = m.index + m[0].length + 1;
  let out = "";
  while (i < src.length) {
    const ch = src[i];
    if (ch === "\\") {
      out += src[i + 1] ?? "";
      i += 2;
      continue;
    }
    if (ch === q) break;
    out += ch;
    i += 1;
  }
  return out;
}

function sliceAround(src, needle, before = 0, after = 800) {
  const idx = src.indexOf(needle);
  assert.ok(idx >= 0, `missing ${needle}`);
  return src.slice(Math.max(0, idx - before), idx + after);
}

const transits = read("src/app/transits/page.tsx");
const api = read("src/lib/api.ts");
const helpers = read("src/lib/bridgedChannels.ts");
const chart = read("../backend/app/hd/chart.py");
const windows = read("../backend/app/hd/bridged_windows.py");
const routes = read("../backend/app/api/routes.py");
const pkg = read("package.json");
const en = read("src/lib/i18n/messages/en.ts");
const de = read("src/lib/i18n/messages/de.ts");
const es = read("src/lib/i18n/messages/es.ts");
const fr = read("src/lib/i18n/messages/fr.ts");
const nl = read("src/lib/i18n/messages/nl.ts");
const catalogs = { en, de, es, fr, nl };
const soul = {
  en: read("src/lib/i18n/messages/todaySoul.en.ts"),
  de: read("src/lib/i18n/messages/todaySoul.de.ts"),
  es: read("src/lib/i18n/messages/todaySoul.es.ts"),
  fr: read("src/lib/i18n/messages/todaySoul.fr.ts"),
  nl: read("src/lib/i18n/messages/todaySoul.nl.ts"),
};
const meanings = soul;

assert.ok(
  pkg.includes(
    '"assert:today-bridged-channels-sky-details": "npx tsx scripts/assert-today-bridged-channels-sky-details.mjs"'
  ),
  "package.json wires assert:today-bridged-channels-sky-details"
);

// --- Default collapsed ---
assert.match(transits, /data-testid="today-sky-details"/);
assert.match(transits, /useState\(false\)/, "Sky details starts closed in state");
assert.match(transits, /hd-biohack:today-sky-details-open:/, "open/close memory key prefix stays");
assert.match(
  transits,
  /localStorage\.getItem\(skyDetailsOpenKey\(userId\)\) === "1"/,
  "absent localStorage is not treated as open"
);
assert.match(transits, /setSkyDetailsOpen\(false\)/, "missing user defaults closed");
assert.doesNotMatch(
  transits,
  /defaultOpen|open=\{true\}/,
  "Sky details is not default-open"
);

// --- Collapsed label ---
assert.match(transits, /skyDetailsSummaryKey\(bridgedChannels\.length\)/, "collapsed label depends on count");
assert.equal(skyDetailsSummaryKey(0), "page.today.skyDetails");
assert.equal(skyDetailsSummaryKey(1), "page.today.skyDetailsBorrowedOne");
assert.equal(skyDetailsSummaryKey(2), "page.today.skyDetailsBorrowedMany");
assert.equal(valueOf(en, "page.today.skyDetails"), "Sky details.");
assert.equal(valueOf(en, "page.today.skyDetailsBorrowedOne"), "Sky details · 1 borrowed wire");
assert.equal(valueOf(en, "page.today.skyDetailsBorrowedMany"), "Sky details · {n} borrowed wires");

// --- Row stack replaces jargon title ---
const listIdx = transits.indexOf('id="today-bridged-channels"');
assert.ok(listIdx > 0, "today-bridged-channels present");
const listBlock = transits.slice(listIdx, transits.indexOf('id="today-newly-defined"', listIdx));
assert.match(listBlock, /font-semibold text-fg/, "name is font-semibold text-fg");
assert.match(listBlock, /\{c\.name\}/, "title line is the channel name");
assert.match(listBlock, /bridgeMeaningText/, "meaning line is wired");
assert.match(listBlock, /bridgeOwnershipText/, "ownership line is wired");
assert.match(listBlock, /bridgeWindowText/, "window line is wired");
assert.match(listBlock, /text-sm text-fg-secondary/, "ownership/window use quiet secondary color");
assert.match(listBlock, /data-testid=\{bridgeChannelTestId\(c\.gates\)\}/, "stable row test id");
assert.doesNotMatch(listBlock, /join\(["'`][–-]["'`]\)/, "rows do not lead with gate numbers");
assert.doesNotMatch(listBlock, /displayCenter/, "centers are not in the bridged title line");
assert.doesNotMatch(
  listBlock,
  /\(c\.gates[\s\S]{0,80}—[\s\S]{0,80}c\.name/,
  "old 10–20 — Name (centers) title pattern is gone"
);

// --- Locked English lead + empty state unchanged ---
assert.equal(
  valueOf(en, "page.today.bridgesLead"),
  "A temporary wire the sky is completing today. It can feel vivid; it is not a change of Type."
);
assert.equal(valueOf(en, "page.today.bridgesNone"), "None right now.");
assert.match(listBlock, /t\("page\.today\.bridgesLead"\)/);
assert.match(listBlock, /t\("page\.today\.bridgesNone"\)/);
const leadChunk = sliceAround(transits, 't("page.today.bridgesLead")', 80, 10);
assert.match(leadChunk, /text-sm text-fg/, "lead stays 14px text-fg");

// --- Runtime copy for hanging / transit-transit / windows ---
function t(key, vars) {
  const raw = enMessages[key];
  assert.ok(typeof raw === "string", `missing en message ${key}`);
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name) =>
    vars[name] != null ? String(vars[name]) : `{${name}}`
  );
}

const hanging = {
  gates: [10, 20],
  name: "Awakening",
  centers: ["G", "Throat"],
  natal_gates: [10],
  transit_gates: [20],
  transit_planets: [{ name: "North Node", gate: 20, line: 3 }],
  kind: "hanging",
  window_start: "2026-11-01",
  window_end: "2026-11-27",
};
assert.equal(
  bridgeMeaningText(hanging, t),
  "A borrowed pull to be yourself out loud, in the moment — presence, not a new personality."
);
assert.equal(
  bridgeOwnershipText(hanging, t),
  "You hold Gate 10; the sky brings Gate 20 (North Node)."
);
assert.equal(
  bridgeWindowText(hanging, t, "en", 2026),
  "On since 1 Nov · through 27 Nov 2026."
);
assert.doesNotMatch(
  `${hanging.name} ${bridgeMeaningText(hanging, t)} ${bridgeOwnershipText(hanging, t)} ${bridgeWindowText(hanging, t, "en", 2026)}`,
  /10–20 — Awakening \(G/
);

const transitTransit = {
  gates: [23, 43],
  name: "Structuring",
  centers: ["Ajna", "Throat"],
  natal_gates: [],
  transit_gates: [23, 43],
  transit_planets: [
    { name: "Sun", gate: 23, line: 1 },
    { name: "Moon", gate: 43, line: 2 },
  ],
  kind: "transit_transit",
  window_start: "2026-11-10",
  window_end: "2026-11-12",
};
assert.equal(bridgeOwnershipText(transitTransit, t), "The sky holds both ends today.");

assert.equal(
  bridgeWindowText({ window_start: null, window_end: "2026-11-27" }, t, "en", 2026),
  "On for a long stretch · through 27 Nov 2026."
);
assert.equal(
  bridgeWindowText({ window_start: "2026-11-01", window_end: null }, t, "en", 2026),
  "On since 1 Nov · no clear end in sight"
);
assert.equal(
  bridgeWindowText({ window_start: null, window_end: null }, t, "en", 2026),
  "On for a long stretch"
);
assert.equal(
  bridgeWindowText(
    { window_start: "2026-04-25", window_end: "2027-05-27" },
    t,
    "en",
    2026
  ),
  "On since 25 Apr 2026 · through 27 May 2027."
);

assert.equal(
  bridgeWindowCaption({ window_start: "2026-11-14", window_end: "2026-11-27" }, "2026-11-14", t),
  "This wire completes today."
);
assert.equal(
  bridgeWindowCaption({ window_start: "2026-11-01", window_end: "2026-11-14" }, "2026-11-14", t),
  "Last day of this wire."
);

const flags = bridgeDateYearFlags("2026-11-01", "2026-11-27", 2026);
assert.deepEqual(flags, { startYear: false, endYear: true });
assert.equal(formatBridgeDate("2026-11-01", "en", false), "1 Nov");
assert.equal(formatBridgeDate("2026-11-27", "en", true), "27 Nov 2026");

// --- No day N of M ---
const dayNofM = /\bday\s+\d+\s+of\s+\d+\b/i;
for (const [name, src] of [
  ["page", transits],
  ["helpers", helpers],
  ["en", en],
  ["meanings.en", meanings.en],
  ["todaySoul.en", soul.en],
]) {
  assert.doesNotMatch(src, dayNofM, `${name} must not say day N of M`);
}
assert.doesNotMatch(en + meanings.en + soul.en, /day 204 of 398/i, "no day 204 of 398-style string");

// --- Locked meaning library ---
const LOCKED_MEANINGS = {
  "1-8": "A borrowed stretch of creative voice — offer what only you see; it is not a new identity as an artist.",
  "2-14": "A borrowed sense of where your energy wants to go — follow it for this window, not as a new life path.",
  "3-60": "A borrowed pressure to change an old pattern when the timing is right — restlessness, not a new temperament.",
  "4-63": "A borrowed need to prove a pattern — doubt that wants a trustworthy answer, not a new mental baseline.",
  "5-15": "A borrowed feel for your natural tempo — how the day wants to move, not a new pace for life.",
  "6-59": "A borrowed closeness chemistry — let the body say yes or no; it is not a new relationship nature.",
  "7-31": "A borrowed pull toward leadership that works when others choose you — influence for this window, not a new role.",
  "9-52": "A borrowed capacity to sit still under pressure and finish — focus for the window, not a new work style.",
  "10-20": "A borrowed pull to be yourself out loud, in the moment — presence, not a new personality.",
  "10-34": "A borrowed conviction to follow your own behavior with real power — movement for this window, not a new personality of force.",
  "10-57": "A borrowed body-knowing of how to survive as yourself — intuition that protects your shape for now, not a new instinctive type.",
  "11-56": "A borrowed hunger to turn ideas into stories — tell what you found; it is not a new calling as a seeker.",
  "12-22": "A borrowed mood for emotional expression — eloquence that waits for the right feeling, not a new social nature.",
  "13-33": "A borrowed witness energy — leave, learn, and bring the story back; it is not a new life pattern of departure.",
  "16-48": "A borrowed meeting of talent and depth — skillful expression for this window, not a new gift profile.",
  "17-62": "A borrowed urge to organize what you see into usable detail — naming the pattern, not a new mental identity.",
  "18-58": "A borrowed drive to correct and improve — joy through making things better, not a new critic identity.",
  "19-49": "A borrowed sensitivity around needs, belonging, and fair deals — feel it for this window, not as a new value system.",
  "20-34": "A borrowed busy power in the now — energy that can speak and act while it is alive, not a new type of force.",
  "20-57": "A borrowed intuitive knowing that wants a voice in the moment — a quiet hit, not a new way of being.",
  "21-45": "A borrowed will to steward resources and say how they move — material voice for this window, not a new money nature.",
  "23-43": "A borrowed insight that needs the right timing and words — genius when it lands, noise when it is forced; not a new mind.",
  "24-61": "A borrowed pressure to know the mystery — listen; it cannot be forced, and it is not a new mental baseline.",
  "25-51": "A borrowed jolt of courage to start something untried. Use it once; it is not a new willpower baseline.",
  "26-44": "A borrowed instinct for what to offer and when to let go — salesmanship and memory for this window, not a new persona.",
  "27-50": "A borrowed caretaker energy — nourish and protect what matters now, not a new identity as the one who holds everything.",
  "28-38": "A borrowed search for meaning through challenge — know which fight is worth it; it is not a new life of struggle.",
  "29-46": "A borrowed yes to the experience — commitment that lets the body find out by living it, not a new yes-to-everything nature.",
  "30-41": "A borrowed wave of feeling and appetite for a new story. Let the wave move; it is not a life verdict.",
  "32-54": "A borrowed drive to climb, tempered by a gut sense of what will last. Ambition for this window, not a new career identity.",
  "34-57": "A borrowed vital, intuitive strength — power that knows when to act and when to hold, not a new type.",
  "35-36": "A borrowed craving to live and tell the experience — a chapter, not a new restless identity.",
  "37-40": "A borrowed feel for the tribe's bargain — loyalty and deals made plain for this window, not a new tribal nature.",
  "39-55": "A borrowed mood as fuel — pressure that tests spirit; ride the wave, it is not a new emotional baseline.",
  "42-53": "A borrowed sense of a cycle to begin, stay with, or finish — timing for this window, not a new life rhythm.",
  "47-64": "A borrowed mental pressure to make sense of confusion — meaning after the fog, not a new mind.",
};

assert.equal(Object.keys(BRIDGE_MEANING_KEYS).length, 36, "36 meaning keys");
for (const [slug, expected] of Object.entries(LOCKED_MEANINGS)) {
  const key = `page.today.bridgeMeaning.${slug}`;
  assert.equal(valueOf(meanings.en, key), expected, `locked English meaning for ${slug}`);
  assert.equal(enMessages[key], expected, `en catalog meaning for ${slug}`);
}

assert.equal(
  bridgeMeaningText({ gates: [99, 100], name: "Unknown Channel" }, t),
  "Unknown Channel. A temporary wire the sky is completing today."
);

// Translations exist and are not English copies
const CHROME_KEYS = [
  "page.today.skyDetailsBorrowedOne",
  "page.today.skyDetailsBorrowedMany",
  "page.today.bridgeYouHold",
  "page.today.bridgeSkyHoldsBoth",
  "page.today.bridgeOnSinceThrough",
  "page.today.bridgeOnLongStretchThrough",
  "page.today.bridgeOnSinceNoEnd",
  "page.today.bridgeOnLongStretch",
  "page.today.bridgeCompletesToday",
  "page.today.bridgeLastDay",
  "page.today.bridgeMeaningFallback",
];
for (const loc of ["de", "es", "fr", "nl"]) {
  for (const key of CHROME_KEYS) {
    const translated = valueOf(catalogs[loc], key);
    assert.ok(translated.trim().length > 0, `${loc} ${key} empty`);
    assert.notEqual(translated, valueOf(en, key), `${loc} ${key} must not be an English copy`);
  }
  for (const slug of Object.keys(LOCKED_MEANINGS)) {
    const key = `page.today.bridgeMeaning.${slug}`;
    const translated = valueOf(meanings[loc], key);
    assert.ok(translated.trim().length > 0, `${loc} ${key} empty`);
    assert.notEqual(translated, valueOf(meanings.en, key), `${loc} ${key} must not be an English copy`);
  }
}

// --- How to read: append only, keep title/jump/body start ---
const HOW_TO_APPEND = {
  en: "Sky details names which end is yours, which planet completes it, and how long the wire lasts.",
  de: "Himmelsdetails nennt, welches Ende dir gehört, welcher Planet es ergänzt, und wie lange der Draht dauert.",
  es: "Detalles del cielo indica qué extremo es tuyo, qué planeta lo completa y cuánto dura el cable.",
  fr: "Les détails du ciel indiquent quel bout est le tien, quelle planète le complète, et combien de temps le fil dure.",
  nl: "Hemeldetails noemt welk einde van jou is, welke planeet het compleet maakt, en hoe lang de draad duurt.",
};
const EN_BODY_START =
  "A channel is a full wire between two centers. You may already hold one end (a hanging gate).";
for (const loc of ["en", "de", "es", "fr", "nl"]) {
  const src = soul[loc];
  assert.match(src, /"today\.literacy\.bridged\.title"/, `${loc} keeps bridged title`);
  assert.match(src, /"today\.literacy\.bridged\.jump"/, `${loc} keeps bridged jump`);
  assert.ok(src.includes(HOW_TO_APPEND[loc]), `${loc} How to read body has the new sentence`);
  if (loc === "en") {
    assert.ok(src.includes(EN_BODY_START), "English How to read body start is unchanged");
    assert.ok(src.includes("borrowed circuitry"), "existing English body remains");
  }
}

// --- Backend contract ---
assert.match(api, /export type TransitResponse/, "frontend TransitResponse type exists");
assert.match(api, /natal_gates\?:/, "frontend types natal_gates");
assert.match(api, /window_start\?:/, "frontend types window_start");
assert.match(chart, /def _annotate_bridged_channel/, "overlay_transits annotates rows");
assert.match(chart, /"kind": kind/, "kind is attached in overlay_transits");
assert.match(windows, /BRIDGE_WINDOW_CAP = 900/, "window cap is at least 900");
assert.match(windows, /hkt_bucket_instant/, "window walk uses the 07:00 bucket helper");
assert.match(routes, /annotate_bridged_channel_windows\(/, "GET /transits/today attaches windows");
assert.match(transits, /<TodayIndication/, "TodayIndication remains on the page");
const detailsIdx = transits.indexOf('data-testid="today-sky-details"');
const returnIdx = transits.indexOf("return (");
assert.ok(detailsIdx > returnIdx, "Sky details is in the render tree");
assert.doesNotMatch(
  transits.slice(returnIdx, detailsIdx),
  /bridgeMeaningText|bridgeOwnershipText|today-bridged-channel-/,
  "bridged list is not promoted above Sky details"
);

console.log("assert-today-bridged-channels-sky-details: ok");
