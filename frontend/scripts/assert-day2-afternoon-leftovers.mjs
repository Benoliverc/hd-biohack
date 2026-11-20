/**
 * Day 2 afternoon leftovers: evening-close clock gate, Protocols vs Today Move,
 * authority-aware Protocols DO, Why this punctuation/grammar, Today clutter,
 * planetary-gate labels, Energy · Space landmark.
 * Run: npx tsx scripts/assert-day2-afternoon-leftovers.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatPlanetLabel,
  formatVsBridgeKey,
  formatVsCentersKey,
  formatVsYesterdayValue,
} from "../src/lib/vsYesterdayDisplay.ts";
import {
  isEveningCloseVisible,
  eveningQuestionKey,
  EVENING_CLOSE_START_HOUR,
} from "../src/lib/eveningSignatureClose.ts";
import { collapseDuplicateSentencePunctuation } from "../src/lib/todayCopy.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function valueOf(src, key) {
  const re = new RegExp(
    `['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*['"]([\\s\\S]*?)['"]\\s*,`
  );
  const m = src.match(re);
  assert.ok(m, `missing value for ${key}`);
  return m[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
}

const todayInd = read("src/components/TodayIndication.tsx");
const biohack = read("src/app/biohack/page.tsx");
const moveCard = read("src/components/protocols/TodaysMoveCard.tsx");
const transits = read("src/app/transits/page.tsx");
const helper = read("src/lib/vsYesterdayDisplay.ts");
const en = read("src/lib/i18n/messages/en.ts");
const enSoul = read("src/lib/i18n/messages/todaySoul.en.ts");
const rulesPy = read("../backend/app/biohack/rules.py");
const checkinPy = read("../backend/app/checkin/rules.py");

// --- (a) mid-afternoon Evening close is clock-gated, not kit-timed ---
assert.equal(EVENING_CLOSE_START_HOUR, 14);
const midAfternoon = new Date("2026-11-20T06:23:00.000Z"); // 14:23 HKT
assert.equal(
  isEveningCloseVisible({
    timeZone: "Asia/Hong_Kong",
    now: midAfternoon,
    whenSlot: "morning",
  }),
  true,
  "morning / empty cupboard still offered Evening close at 14:23 HKT"
);
assert.equal(
  isEveningCloseVisible({
    timeZone: "Asia/Hong_Kong",
    now: midAfternoon,
  }),
  true
);
const morningHour = new Date("2026-11-20T02:00:00.000Z"); // 10:00 HKT
assert.equal(
  isEveningCloseVisible({
    timeZone: "Asia/Hong_Kong",
    now: morningHour,
    whenSlot: "evening",
  }),
  false,
  "evening-timed kit does not unlock Evening close before the window"
);
assert.equal(
  eveningQuestionKey("Manifesting Generator", "Emotional (Solar Plexus)"),
  "today.eveningClose.q.emotional"
);
assert.equal(
  eveningQuestionKey("Projector"),
  "today.eveningClose.q.projector"
);
assert.match(todayInd, /eveningQuestionKey\(typeKey, natalAuthority\)/);
assert.match(todayInd, /isEveningCloseVisible/);
assert.doesNotMatch(
  read("src/lib/eveningSignatureClose.ts"),
  /whenSlot === ["']evening["']/
);

// --- (b) After Today I did it, Protocols is not Today's Move 0/3 0% ---
assert.match(moveCard, /todayMoveLogged/);
assert.match(biohack, /todayMoveLogged=\{dayHasDoneLifestyleMove\(completions\)\}/);
assert.match(moveCard, /todayMoveLogged && doneCount === 0/);
assert.match(moveCard, /protocols\.moveComplete/);
assert.match(moveCard, /protocols\.timedLeadsProgress/);
assert.equal(valueOf(en, "protocols.moveTitle"), "Today’s Move");

// --- (c) Emotional chart never gets Sacral-yes Protocols DO ---
assert.match(rulesPy, /_authority_why_class/);
assert.match(
  rulesPy,
  /Only start work that gets a clear yes after the feelings have moved\./
);
assert.match(
  rulesPy,
  /auth_class == "emotional"/
);
// Sacral default still present for Sacral / missing authority
assert.match(
  rulesPy,
  /Only start work that gets a clear Sacral yes \(sounds\/body response\)\./
);

// --- (d) Why this punctuation / Maya grammar ---
const battery = valueOf(
  enSoul,
  "today.battery.ManifestingGenerator.emotional"
);
assert.equal(
  battery,
  "Your battery needs a clear yes after the feelings have moved — then inform — not constant acceleration."
);
assert.doesNotMatch(enSoul, /a yes clear/);
assert.doesNotMatch(checkinPy, /a yes clear/);
assert.match(
  checkinPy,
  /Your battery needs a clear yes after the feelings have moved/
);
assert.equal(
  collapseDuplicateSentencePunctuation(
    "not constant acceleration.. Notice Sun 14.4."
  ),
  "not constant acceleration. Notice Sun 14.4."
);
assert.doesNotMatch(enSoul, /\{battery\}\./);
assert.match(read("src/lib/todayCopy.ts"), /collapseDuplicateSentencePunctuation/);

// --- (e) Returning Today clutter, one Earlier weeks, type/strategy visible ---
const eveningIdx = todayInd.indexOf('data-testid="today-evening-close"');
const emptyKitIdx = todayInd.indexOf('data-testid="today-empty-kit-slot"');
const setupIdx = todayInd.indexOf('data-testid="today-kit-setup"');
const typeIdx = todayInd.indexOf('data-testid="today-type-strategy"');
const whyIdx = todayInd.indexOf('data-testid="main-action-why-details"');
const linkIdx = todayInd.indexOf('data-testid="today-history-link"');
const historyIdx = todayInd.indexOf('testId="today-history"');
assert.ok(typeIdx > 0, "type/strategy visible on default scan");
assert.ok(typeIdx < whyIdx, "type/strategy is not hidden inside Why this");
assert.match(todayInd, /data-testid="today-natal-type"/);
assert.match(todayInd, /data-testid="today-natal-strategy"/);
assert.match(todayInd, /natalStrategy/);
assert.ok(emptyKitIdx > eveningIdx, "empty starter is not between the log and Evening close");
assert.ok(setupIdx > eveningIdx, "kit setup after the next action");
assert.match(todayInd, /historyOpen \? "mb-4" : "hidden"/);
assert.ok(linkIdx > 0 && historyIdx > linkIdx, "single visible trigger plus hidden review");

// --- (f) Planetary gates human labels; do not regress #137 Vs yesterday ---
assert.match(helper, /export function formatPlanetLabel/);
assert.match(transits, /formatPlanetLabel\(String\(r\.planet\)\)/);
assert.equal(formatPlanetLabel("North_Node"), "North Node");
assert.equal(formatPlanetLabel("South_Node"), "South Node");
assert.doesNotMatch(formatPlanetLabel("North_Node"), /_/);
assert.equal(formatPlanetLabel("Mean_Node"), "Mean Node");
assert.equal(formatVsCentersKey("Solar_Plexus,Spleen"), "Solar Plexus, Spleen");
assert.equal(formatVsBridgeKey("10-20|28-38"), "10–20, 28–38");
assert.equal(
  formatVsYesterdayValue("newly_defined", "Solar_Plexus"),
  "Solar Plexus"
);
assert.equal(formatVsYesterdayValue("bridge", "10-20|28-38"), "10–20, 28–38");

// --- (g) Energy · Space visible when values exist; no empty landmark ---
assert.match(todayInd, /showEnergySpace/);
assert.match(todayInd, /hasEnergySpaceValues/);
assert.match(todayInd, /\{\(showEnergySpace \|\| showSameWeather\) \? \(/);
assert.match(todayInd, /energySpaceHighlight \|\| \(hasEnergySpaceValues && skyWeatherChanged\)/);

// Leave-alone named keys stay byte-identical
assert.equal(valueOf(en, "today.weatherSame"), "Same weather as yesterday.");
assert.equal(
  valueOf(en, "protocols.noKitMatch"),
  "No kit item matched today's weather"
);
assert.equal(
  valueOf(en, "today.kitSetupNoMatch"),
  "Nothing in your kit matched today\u2019s sky."
);

console.log("assert-day2-afternoon-leftovers PASS");
