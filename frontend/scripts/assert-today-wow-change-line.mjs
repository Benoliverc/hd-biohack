/**
 * Source-level ACs for the Today wow change-line pass.
 * Run: npx tsx scripts/assert-today-wow-change-line.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
  const re = new RegExp(
    `['"]${key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}['"]\\s*:\\s*(['"])([\\s\\S]*?)\\1`
  );
  const m = src.match(re);
  assert.ok(m, `missing value for ${key}`);
  return m[2].replace(/\\'/g, "'").replace(/\\"/g, '"');
}

function sliceAround(src, needle, before = 0, after = 800) {
  const idx = src.indexOf(needle);
  assert.ok(idx >= 0, `missing ${needle}`);
  return src.slice(Math.max(0, idx - before), idx + after);
}

const todayInd = read("src/components/TodayIndication.tsx");
const todayCopy = read("src/lib/todayCopy.ts");
const api = read("src/lib/api.ts");
const schemas = read("../backend/app/schemas.py");
const novelty = read("../backend/app/checkin/novelty.py");
const pkg = read("package.json");
const enCore = read("src/lib/i18n/messages/en.ts");
const catalogs = {
  en: enCore + read("src/lib/i18n/messages/todaySoul.en.ts"),
  de: read("src/lib/i18n/messages/de.ts") + read("src/lib/i18n/messages/todaySoul.de.ts"),
  es: read("src/lib/i18n/messages/es.ts") + read("src/lib/i18n/messages/todaySoul.es.ts"),
  fr: read("src/lib/i18n/messages/fr.ts") + read("src/lib/i18n/messages/todaySoul.fr.ts"),
  nl: read("src/lib/i18n/messages/nl.ts") + read("src/lib/i18n/messages/todaySoul.nl.ts"),
};

assert.ok(
  pkg.includes('"assert:today-wow-change-line": "npx tsx scripts/assert-today-wow-change-line.mjs"'),
  "package.json wires assert:today-wow-change-line"
);

// --- Placement: in Move hero, under sentence, before Show-up and Settled Day receipt ---
const actionIdx = todayInd.indexOf('data-testid="main-action-text"');
const changeIdx = todayInd.indexOf('data-testid="today-change-line"');
const receiptIdx = todayInd.indexOf('data-testid="today-move-closure"');
const showUpIdx = todayInd.indexOf('data-testid="today-show-up"');
const asideIdx = todayInd.indexOf('data-testid="main-action-status"');
assert.ok(actionIdx > 0 && changeIdx > actionIdx, "change line is after the Move sentence");
assert.ok(receiptIdx > changeIdx, "change line is before the Settled Day receipt");
assert.ok(showUpIdx > changeIdx, "change line is before Show-up");
assert.ok(asideIdx > 0 && changeIdx < asideIdx, "change line is not in the Energy/Space aside");
assert.doesNotMatch(
  sliceAround(todayInd, 'data-testid="main-action-status"', 0, 2000),
  /today-change-line/,
  "Energy/Space aside does not contain the change line"
);
assert.match(todayInd, /min-h-\[1\.625rem\]/, "change line slot reserves height");

// Typography
const changeBlock = sliceAround(todayInd, 'data-testid="today-change-line"', 0, 900);
assert.match(changeBlock, /type-body text-fg/, "change mornings use type-body text-fg");
assert.match(changeBlock, /type-meta text-fg/, "continuity uses type-meta with passing text-fg ink");
assert.match(todayInd, /data-testid="today-change-line-terms"/, "term-second caption test id");
assert.match(todayInd, /type-caption text-fg/, "term caption uses type-caption text-fg");

// First-filled precedence lives in changeLineLead, not inferred from sky story / vs_yesterday
const leadFn = sliceAround(todayCopy, "export function changeLineLead", 0, 1600);
assert.match(leadFn, /has_previous_indication === false/, "first-filled gated on has_previous_indication === false");
assert.match(leadFn, /today\.changeLine\.firstFilled/, "first-filled uses locked Day 1 lead key");
assert.doesNotMatch(leadFn, /energy_space_slot/, "change line is not derived from energy_space_slot");
assert.doesNotMatch(leadFn, /sky_story/, "first-filled is not inferred from sky_story");
assert.doesNotMatch(leadFn, /vs_yesterday/, "first-filled is not inferred from vs_yesterday");

// Structured fields
for (const field of ["gate", "line", "planet", "continuity_day", "phase", "cue_gate"]) {
  assert.match(api, new RegExp(`${field}\\?:`), `frontend DailySignal has ${field}`);
  assert.match(schemas, new RegExp(`${field}:`), `schema DailySignal has ${field}`);
}
assert.match(schemas, /phase: Literal\["on", "clear"\] \| None/, "phase is on|clear");
assert.match(novelty, /"continuity_day": continuity_day/, "signal continuity_day is emitted");
assert.match(novelty, /phase = "clear"/, "hanging/conditioning clear phase is set");
assert.match(novelty, /phase = "on"/, "hanging/conditioning on phase is set");

// Complete 64-cue library preferred over center fallback
for (let g = 1; g <= 64; g++) {
  assert.match(novelty, new RegExp(`\\n\\s*${g}:\\s*"`), `GATE_CUE has gate ${g}`);
}
assert.match(novelty, /if gate is not None and gate in GATE_CUE/, "_cue_for_gate prefers the library");
const cueFn = sliceAround(novelty, "def _cue_for_gate", 0, 400);
assert.match(cueFn, /GATE_CUE/, "library used first");
assert.doesNotMatch(
  cueFn.split("return GATE_CUE")[0] || cueFn,
  /colour the day without forcing it/,
  "center fallback is not preferred when a cue exists"
);

// Lower headline does not repeat the hero lead
const signalBlock = sliceAround(todayInd, 'id="today-new-signal"', 0, 1600);
assert.match(signalBlock, /id="today-new-signal"/, "How to read jump id stays");
assert.doesNotMatch(signalBlock, /changeLine\.text/, "sky block does not repeat the hero lead");
assert.doesNotMatch(signalBlock, /daily\.headline/, "sky block does not display baked English headline as the lead");
assert.match(signalBlock, /localizeCueBody|cueBody/, "sky block carries the cue body");

// Literacy step copy updated; shell unchanged
const hdCopy = read("src/lib/hdCopy.ts");
assert.match(hdCopy, /id: "today-new-signal"/, "literacy keeps today-new-signal id");
assert.match(hdCopy, /targetId: "today-new-signal"/, "literacy keeps today-new-signal jump");
assert.match(hdCopy, /The line under the Move is the one change/, "first literacy step explains the hero change line");
assert.match(hdCopy, /terms and the day's cue/, "first literacy step points to the sky block for terms and cue");
for (const id of ["today-sun-earth", "today-bridged-channels", "today-newly-defined"]) {
  assert.match(hdCopy, new RegExp(`id: "${id}"`), `How to read keeps step ${id}`);
}

const coach = read("src/components/LiteracyCoach.tsx");
assert.match(coach, /createPortal/, "How to read fullscreen shell stays");
assert.doesNotMatch(todayInd, /LiteracyCoach[\s\S]{0,80}step/, "TodayIndication does not reopen the reader shell");

// i18n: all new soul keys present in five locales; non-English not English copies
const enSoul = read("src/lib/i18n/messages/todaySoul.en.ts");
const NEW_KEYS = keysOf(enSoul);
assert.ok(NEW_KEYS.length >= 64 + 10, `expected a full soul key set, got ${NEW_KEYS.length}`);
for (let g = 1; g <= 64; g++) {
  assert.ok(NEW_KEYS.includes(`today.gateCue.${g}`), `missing today.gateCue.${g}`);
}
for (const key of [
  "today.changeLine.firstFilled",
  "today.changeLine.continuity",
  "today.changeLine.moonGate",
  "today.move.steady.skyCue",
  "share.baselineToday",
  "today.literacy.newSignal.body",
]) {
  assert.ok(NEW_KEYS.includes(key), `missing ${key}`);
}

const EN_LOCKED = {
  "today.changeLine.firstFilled": "Day 1 of this chapter.",
  "today.changeLine.continuity": "Same Sun chapter, day {n}.",
  "today.changeLine.moonGate": "The Moon moved on.",
  "today.changeLine.moonLine": "The Moon is still in this theme, with a new shade.",
  "today.changeLine.sunLine": "The week's theme shifts a little.",
  "today.changeLine.sunGate": "A new weekly theme starts.",
  "today.changeLine.hangingOn": "Pressure on an open place — notice it, don't force a close.",
  "today.changeLine.hangingClear": "Yesterday's pressure has lifted.",
  "today.changeLine.conditioningOn": "A borrowed current is on today.",
  "today.changeLine.conditioningClear": "Yesterday's borrowed current has cleared.",
};

for (const [name, src] of Object.entries(catalogs)) {
  const keys = keysOf(src);
  for (const key of NEW_KEYS) {
    assert.ok(keys.includes(key), `${name} missing ${key}`);
  }
}
for (const [key, expected] of Object.entries(EN_LOCKED)) {
  assert.equal(valueOf(catalogs.en, key), expected, `EN locked lead for ${key}`);
}

const STRUCTURAL_TEMPLATES = new Set([
  "today.termCaption.full",
  "today.termCaption.planetGate",
  "today.termCaption.gateLine",
  "today.termCaption.gate",
]);

for (const loc of ["de", "es", "fr", "nl"]) {
  for (const key of NEW_KEYS) {
    const translated = valueOf(catalogs[loc], key);
    assert.ok(translated.trim().length > 0, `${loc} ${key} is empty`);
    if (STRUCTURAL_TEMPLATES.has(key)) continue;
    assert.notEqual(translated, valueOf(catalogs.en, key), `${loc} ${key} must not be an English copy`);
  }
}

// Soul strings render from keys in the Today UI
assert.match(todayInd, /localizeMove\(/, "Move renders from keys");
assert.match(todayInd, /localizeWhy\(/, "Why renders from keys");
assert.match(todayInd, /changeLineLead\(/, "change line renders from keys");
assert.match(todayInd, /localizeCueBody\(/, "cue body renders from keys");
assert.match(todayInd, /localizeSkyLines\(/, "sky story renders from keys");
assert.match(read("src/components/share/ShareBaselineButton.tsx"), /share\.baselineToday/, "Share button localizes kicker");
assert.match(read("src/components/share/ShareBaselineCard.tsx"), /kicker/, "Share card accepts localized kicker");

console.log("assert-today-wow-change-line: ok");
