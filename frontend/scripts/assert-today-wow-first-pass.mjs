/**
 * Source-level ACs for the Today wow first pass (Move hero, Sky details, first-filled ritual).
 * Run: npx tsx scripts/assert-today-wow-first-pass.mjs
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
    `['"]${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]\\s*:\\s*(['"])([\\s\\S]*?)\\1`
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
const transits = read("src/app/transits/page.tsx");
const api = read("src/lib/api.ts");
const schemas = read("../backend/app/schemas.py");
const derive = read("../backend/app/checkin/derive.py");
const pkg = read("package.json");
const en = read("src/lib/i18n/messages/en.ts");
const de = read("src/lib/i18n/messages/de.ts");
const es = read("src/lib/i18n/messages/es.ts");
const fr = read("src/lib/i18n/messages/fr.ts");
const nl = read("src/lib/i18n/messages/nl.ts");
const catalogs = { en, de, es, fr, nl };

assert.ok(
  pkg.includes('"assert:today-wow-first-pass": "npx tsx scripts/assert-today-wow-first-pass.mjs"'),
  "package.json wires assert:today-wow-first-pass"
);

// --- Move hero typography ---
const actionTextIdx = todayInd.indexOf('data-testid="main-action-text"');
assert.ok(actionTextIdx > 0, "main-action-text present");
const actionOpen = todayInd.lastIndexOf("<p", actionTextIdx);
const actionTag = todayInd.slice(actionOpen, todayInd.indexOf(">", actionTextIdx) + 1);
assert.match(actionTag, /type-title/, "main-action-text uses type-title");
assert.doesNotMatch(actionTag, /type-display/, "main-action-text does not use type-display");
assert.doesNotMatch(actionTag, /type-body/, "main-action-text does not use type-body");
const actionBlock = todayInd.slice(actionOpen, actionOpen + 400);
assert.doesNotMatch(actionBlock, /line-through/, "settled hero sentence is not struck through");

const moveLabel = sliceAround(todayInd, '{t("today.move")}', 250, 40);
assert.match(moveLabel, /text-xs font-semibold uppercase tracking-wide text-growth/, "quiet Move label unchanged");

// Supporting lines must not match the sentence size
for (const id of ["today-show-up", "today-when", "main-action-why-details"]) {
  const block = sliceAround(todayInd, `data-testid="${id}"`, 0, 500);
  assert.doesNotMatch(block, /type-title/, `${id} must not use type-title`);
}

// --- 44px tick ---
const tickIdx = todayInd.indexOf('data-testid="today-move-done"');
assert.ok(tickIdx > 0, "today-move-done present");
const tickOpen = todayInd.lastIndexOf("<button", tickIdx);
const tickClose = todayInd.indexOf("</button>", tickIdx);
const tickTag = todayInd.slice(tickOpen, tickClose + "</button>".length);
assert.ok(
  /h-11 w-11/.test(tickTag) || /min-h-11 min-w-11/.test(tickTag),
  "today-move-done is a 44px target"
);
assert.doesNotMatch(tickTag, /h-7 w-7/, "tick is no longer h-7 w-7");
assert.match(tickTag, /rounded-full/, "tick stays a circle");
assert.match(tickTag, /aria-pressed=\{moveDone\}/, "aria-pressed stays");
assert.match(tickTag, /aria-label=\{t\("today\.iDidIt"\)\}/, "aria-label stays today.iDidIt");
assert.match(todayInd, /today-move-achieved/, "settled wash remains");
assert.match(todayInd, /today-move-closure/, "settled receipt remains");

// --- Kit setup stays and is not gated off on first-filled ---
assert.match(todayInd, /today-kit-setup/, "first-week kit setup stays in TodayIndication");
const kitSetupIdx = todayInd.search(/data-testid="today-kit-setup"/);
assert.ok(kitSetupIdx > 0, "today-kit-setup test id");
const kitWindow = todayInd.slice(Math.max(0, kitSetupIdx - 400), kitSetupIdx);
assert.doesNotMatch(
  kitWindow,
  /has_previous_indication/,
  "kit setup is not gated on has_previous_indication"
);

// --- Energy/Space aside stays in TodayIndication, not in Sky details ---
assert.match(todayInd, /data-testid="main-action-status"/);
assert.match(todayInd, /energy_space_slot/, "highlight/quiet slot still in TodayIndication");
assert.match(todayInd, /weatherSame|weatherStance|weatherMeaning/, "weather meaning stays in TodayIndication");
assert.doesNotMatch(transits, /main-action-status/, "Energy/Space aside is not moved into Sky details");
assert.doesNotMatch(transits, /energy_space_slot/, "energy_space_slot is not consulted on the transits page");

// --- Sky details disclosure ---
assert.match(transits, /data-testid="today-sky-details"/);
assert.match(transits, /<details/, "Sky details is a disclosure");
const detailsIdx = transits.indexOf('data-testid="today-sky-details"');
const detailsOpen = transits.lastIndexOf("<details", detailsIdx);
const detailsClose = transits.indexOf("</details>", detailsIdx);
assert.ok(detailsOpen >= 0 && detailsClose > detailsOpen, "Sky details details block found");
const detailsBlock = transits.slice(detailsOpen, detailsClose + "</details>".length);
assert.match(detailsBlock, /open=\{skyDetailsOpen\}/, "disclosure open state is controlled");
assert.match(transits, /hd-biohack:today-sky-details-open:/, "per-user localStorage key prefix is present");
assert.match(transits, /=== "1"/, "remembered open value is 1");
assert.match(transits, /"0"/, "remembered closed value is 0");
assert.match(transits, /setSkyDetailsOpen\(false\)/, "absent / missing user defaults closed");

for (const id of [
  "today-sun-earth",
  "today-bridged-channels",
  "today-newly-defined",
  "today-planetary-gates",
]) {
  assert.match(detailsBlock, new RegExp(`id="${id}"`), `${id} is inside Sky details`);
  assert.match(
    detailsBlock,
    new RegExp(`id="${id}"[\\s\\S]{0,200}scroll-mt-\\[calc\\(var\\(--app-header-h,4\\.5rem\\)\\+0\\.75rem\\)\\]`),
    `${id} keeps header scroll margin`
  );
}

const coachIdx = transits.indexOf("<LiteracyCoach");
assert.ok(coachIdx > 0 && coachIdx < detailsOpen, "LiteracyCoach stays outside and before Sky details");
assert.doesNotMatch(detailsBlock, /LiteracyCoach/, "LiteracyCoach is not inside Sky details");
assert.match(transits, /onJump=\{jumpToTodaySection\}/, "Today LiteracyCoach is wired with onJump");

// How to read jump expands the disclosure before scrolling
const jumpFnIdx = transits.indexOf("const jumpToTodaySection");
assert.ok(jumpFnIdx > 0, "jumpToTodaySection is real source");
const jumpFn = transits.slice(jumpFnIdx, transits.indexOf("},", jumpFnIdx) + 2);
assert.match(jumpFn, /SKY_DETAILS_JUMP_IDS\.has\(targetId\)/, "jump detects Sky details ids");
const persistIdx = jumpFn.search(/persistSkyDetailsOpen\(true\)|skyDetailsRef[\s\S]{0,80}\.open = true/);
const scrollIdx = jumpFn.search(/scrollToTodaySection\(|scrollIntoView/);
assert.ok(persistIdx >= 0, "jump expands Sky details in source");
assert.ok(scrollIdx > persistIdx, "jump expands the disclosure before scrolling");

// --- First-filled invitation ---
assert.match(todayInd, /data-testid="today-first-filled-invite"/);
const inviteIdx = todayInd.indexOf('data-testid="today-first-filled-invite"');
const whyIdx = todayInd.indexOf('data-testid="main-action-why-details"');
assert.ok(inviteIdx > whyIdx, "first-filled invite lives under Why");
const inviteGuard = todayInd.slice(Math.max(0, inviteIdx - 250), inviteIdx);
assert.match(
  inviteGuard,
  /has_previous_indication === false/,
  "invite is gated strictly on has_previous_indication === false"
);
assert.doesNotMatch(
  inviteGuard,
  /energy_space_slot/,
  "invite is not inferred from energy_space_slot"
);

const inviteBlock = todayInd.slice(Math.max(0, inviteIdx - 80), inviteIdx + 700);
assert.doesNotMatch(inviteBlock, /open\(\{|howToRead\?\.open|setOpen\(true\)/, "invite does not auto-open the reader");
assert.doesNotMatch(todayInd, /has_previous_indication === false[\s\S]{0,400}useEffect/, "no first-filled effect auto-opens");
assert.doesNotMatch(todayInd, /useEffect\([\s\S]{0,400}has_previous_indication === false/, "no first-filled effect auto-opens");
assert.doesNotMatch(todayInd, /Day 1 of this chapter/, "no Day 1 change line in this pass");
assert.doesNotMatch(transits, /Day 1 of this chapter/, "no Day 1 change line on the page");
assert.doesNotMatch(todayInd, /GATE_CUE/, "no GATE_CUE library");

// --- Backend / payload field ---
assert.match(schemas, /has_previous_indication:\s*bool\s*=\s*True/, "schema defaults true (missing = later/quiet)");
assert.match(derive, /payload\["has_previous_indication"\] = prev_indication is not None/, "derive sets the field from prev_indication");
assert.match(api, /has_previous_indication\?:\s*boolean/, "frontend types the field as optional");

// --- New 14px regular copy on elevated uses text-fg ---
for (const lead of [
  "page.today.sunEarthLead",
  "page.today.bridgesLead",
  "page.today.newlyDefinedLead",
  "page.today.gatesLead",
]) {
  const chunk = sliceAround(transits, `t("${lead}")`, 120, 20);
  assert.match(chunk, /text-sm text-fg/, `${lead} is 14px regular text-fg`);
  assert.doesNotMatch(chunk, /text-fg-secondary/, `${lead} does not use fg-secondary on elevated`);
}
const inviteClass = sliceAround(todayInd, 'data-testid="today-first-filled-invite"', 0, 250);
assert.match(inviteClass, /text-sm text-fg/, "first-filled invite is 14px regular text-fg");
assert.doesNotMatch(inviteClass, /text-fg-secondary/, "invite does not use fg-secondary on elevated");

// --- i18n: new keys present, non-English catalogs are not English copies ---
const NEW_KEYS = [
  "page.today.skyDetails",
  "page.today.sunEarthLead",
  "page.today.bridgesLead",
  "page.today.newlyDefinedLead",
  "page.today.gatesLead",
  "page.today.bridgesNone",
  "page.today.newlyDefinedNone",
  "page.today.planetaryGates",
  "page.today.gatesPlanet",
  "page.today.gatesGateLine",
  "page.today.gatesLoading",
  "page.today.gatesEmpty",
  "today.firstFilledInvite",
];

const EN_LOCKED = {
  "page.today.skyDetails": "Sky details.",
  "page.today.sunEarthLead":
    "The week's broader theme, and the ground under it. It moves slowly — a chapter, not an hourly report.",
  "page.today.bridgesLead":
    "A temporary wire the sky is completing today. It can feel vivid; it is not a change of Type.",
  "page.today.newlyDefinedLead":
    "An open center the sky is lighting for now. Weather, not a new personality.",
  "page.today.gatesLead": "Where today's planets sit. For study, not a second Move.",
  "page.today.bridgesNone": "None right now.",
  "page.today.newlyDefinedNone": "No temporary definitions.",
  "page.today.planetaryGates": "Current planetary gates",
  "page.today.gatesPlanet": "Planet",
  "page.today.gatesGateLine": "Gate · line",
  "page.today.gatesLoading": "Loading today's gates…",
  "page.today.gatesEmpty": "No planetary activations returned.",
  "today.firstFilledInvite":
    "This is your Move for today. How to read explains the rest, when you want it.",
};

for (const [name, src] of Object.entries(catalogs)) {
  const keys = keysOf(src);
  for (const key of NEW_KEYS) {
    assert.ok(keys.includes(key), `${name} missing ${key}`);
  }
}

for (const [key, expected] of Object.entries(EN_LOCKED)) {
  assert.equal(valueOf(en, key), expected, `EN locked copy for ${key}`);
}

// "Planet" is also the German word; every other new string must differ from EN.
const IDENTICAL_COGNATES = new Set(["de:page.today.gatesPlanet"]);

for (const loc of ["de", "es", "fr", "nl"]) {
  for (const key of NEW_KEYS) {
    const translated = valueOf(catalogs[loc], key);
    assert.ok(translated.trim().length > 0, `${loc} ${key} is empty`);
    if (IDENTICAL_COGNATES.has(`${loc}:${key}`)) continue;
    assert.notEqual(translated, valueOf(en, key), `${loc} ${key} must not be an English copy`);
  }
}

// How to read's three Today study-layer steps and ids stay put
const hdCopy = read("src/lib/hdCopy.ts");
for (const id of ["today-sun-earth", "today-bridged-channels", "today-newly-defined"]) {
  assert.match(hdCopy, new RegExp(`id: "${id}"`), `How to read keeps step ${id}`);
  assert.match(hdCopy, new RegExp(`targetId: "${id}"`), `How to read keeps jump target ${id}`);
}

console.log("assert-today-wow-first-pass: ok");
