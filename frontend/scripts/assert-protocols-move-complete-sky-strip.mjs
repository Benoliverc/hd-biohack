/**
 * Protocols move-complete vs logged-on-Today, and no WeatherStrip.
 * Runs the helpers (behavior), then source and locale checks.
 * Run: npx tsx scripts/assert-protocols-move-complete-sky-strip.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function valueOf(src, key) {
  const re = new RegExp(
    `['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*(['"])([\\s\\S]*?)\\1`,
  );
  const m = src.match(re);
  assert.ok(m, `missing value for ${key}`);
  return m[2].replace(/\\'/g, "'").replace(/\\"/g, '"');
}

const { protocolsMoveCardState, isTodayMoveDone } = await import(
  "../src/lib/protocolCompletions.ts"
);

const state = (itemCount, doneCount, todayMoveLogged, completeFlash) =>
  protocolsMoveCardState({ itemCount, doneCount, todayMoveLogged, completeFlash });

assert.equal(state(3, 0, true, false), "loggedOnToday");
assert.equal(state(3, 1, true, false), "loggedOnToday");
assert.equal(state(3, 2, false, false), "progress");
assert.equal(state(3, 3, false, false), "complete");
assert.equal(state(3, 3, true, false), "complete");
assert.equal(state(3, 3, false, true), "complete");
assert.equal(state(3, 0, false, true), "progress");
assert.equal(state(3, 2, false, true), "progress");
assert.equal(state(3, 2, true, true), "loggedOnToday");
assert.equal(state(0, 0, true, false), "empty");

assert.equal(
  isTodayMoveDone({ "today-move:focus": { done: true } }, "today-move:rest"),
  false,
);
assert.equal(
  isTodayMoveDone({ "today-move:rest": { done: true } }, "today-move:rest"),
  true,
);
assert.equal(isTodayMoveDone({ "today-move": { done: true } }, null), true);

const move = read("src/components/protocols/TodaysMoveCard.tsx");
const biohack = read("src/app/biohack/page.tsx");
assert.doesNotMatch(move, /\|\| todayMoveLogged\)/);
assert.match(move, /protocolsMoveCardState/);
assert.match(move, /data-testid="protocol-move-logged-on-today"/);
assert.match(move, /protocols\.moveLoggedOnToday/);
assert.match(
  biohack,
  /todayMoveLogged=\{isTodayMoveDone\(completions, indication\?\.move_item_id\)\}/,
);
const toggleAt = biohack.indexOf("const onToggleItem");
assert.ok(toggleAt >= 0, "onToggleItem missing");
const toggleChunk = biohack.slice(toggleAt, toggleAt + 1600);
assert.match(toggleChunk, /else if \(!nowComplete\)[\s\S]*setCompleteFlash\(false\)/);
assert.doesNotMatch(biohack, /WeatherStrip/);
assert.doesNotMatch(biohack, /protocols-weather/);
assert.doesNotMatch(biohack, /weather-full-sky-link/);

const EN = "Logged on Today. The timed leads below are extra.";
const expected = {
  en: EN,
  de: "Auf Heute erledigt. Die Timed leads unten sind ein Extra.",
  es: "Registrado en Hoy. Los Timed leads de abajo son un extra.",
  fr: "Noté sur Aujourd'hui. Les Timed leads ci-dessous sont en plus.",
  nl: "Gelogd op Vandaag. De Timed leads hieronder zijn extra.",
};

for (const [locale, want] of Object.entries(expected)) {
  const src = read(`src/lib/i18n/messages/${locale}.ts`);
  const got = valueOf(src, "protocols.moveLoggedOnToday");
  assert.equal(got, want, `${locale} protocols.moveLoggedOnToday`);
  if (locale !== "en") assert.notEqual(got, EN, `${locale} must not copy English`);
}

assert.doesNotMatch(expected.fr, /\bvous\b/);
assert.doesNotMatch(expected.de, /\bSie\b/);
assert.doesNotMatch(expected.nl, /\bu\b|\buw\b/);

console.log("assert-protocols-move-complete-sky-strip PASS");
