/**
 * Protocols This week fold + Natal baseline prominence — source ACs (FE).
 * Run: npx tsx scripts/assert-protocols-this-week-natal-prominence.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function valueFor(src, key) {
  const re = new RegExp(
    `['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*(['"])([\\s\\S]*?)\\1`,
  );
  const m = src.match(re);
  return m ? m[2] : null;
}

const pkg = read("package.json");
const biohack = read("src/app/biohack/page.tsx");
const locales = ["en", "de", "es", "fr", "nl"].map((id) => ({
  id,
  src: read(`src/lib/i18n/messages/${id}.ts`),
}));
const en = locales[0].src;

assert.ok(
  pkg.includes(
    '"assert:protocols-this-week-natal-prominence": "npx tsx scripts/assert-protocols-this-week-natal-prominence.mjs"',
  ),
  "package.json wires assert:protocols-this-week-natal-prominence",
);

// --- Unlocked body order: Move, Natal, coach, Baseline kit, Shelf, This week last ---
const moveIdx = biohack.indexOf("<TodaysMoveCard");
const natalCallIdx = biohack.indexOf("<NatalBaselineCard");
const coachIdx = biohack.indexOf('<LiteracyCoach variant="protocols"');
const baselineIdx = biohack.indexOf("<BaselineKitCard");
const shelfIdx = biohack.indexOf('data-testid="shelf-disclosure"');
const weekCallIdx = biohack.indexOf("<WeekSkyCard");
const disclaimerIdx = biohack.indexOf('t("page.protocols.disclaimer")');
const weekPlanIdx = biohack.indexOf('data-testid="week-plan"');
assert.ok(moveIdx > 0 && natalCallIdx > moveIdx, "Natal sits under Today’s Move");
assert.ok(coachIdx > natalCallIdx, "How to use sits after Natal");
assert.ok(baselineIdx > coachIdx && shelfIdx > baselineIdx, "Baseline kit then the single Shelf");
assert.ok(weekCallIdx > shelfIdx && disclaimerIdx > weekCallIdx, "This week is last before the disclaimer");
assert.ok(!biohack.includes('data-testid="intention-disclosure"'), "Intention is off Protocols");
assert.ok(weekPlanIdx > 0, "week-plan present");

// --- Natal baseline default-collapsed + closed-row overview ---
assert.match(biohack, /const \[natalOpen, setNatalOpen\] = useState\(false\)/);
assert.match(biohack, /setNatalOpen\(false\)/);
assert.doesNotMatch(biohack, /Always-on for this chart/);
assert.match(biohack, /data-testid="natal-baseline-card"/);
assert.match(biohack, /labels\.natal_baseline/);
assert.match(biohack, /page\.protocols\.natalBaselineFallback/);
assert.match(biohack, /page\.protocols\.natalCountEmphasize/);
assert.match(biohack, /page\.protocols\.natalCountIncrease/);
assert.match(biohack, /page\.protocols\.natalCountEase/);
assert.match(biohack, /page\.protocols\.startingProtocol/);
assert.match(biohack, /min-h-12/);

const natalFnStart = biohack.indexOf("function NatalBaselineCard");
assert.ok(natalFnStart > 0, "NatalBaselineCard present");
const natalFnEnd = biohack.indexOf("\nfunction ", natalFnStart + 1);
const natalFn = biohack.slice(natalFnStart, natalFnEnd > 0 ? natalFnEnd : undefined);
assert.match(natalFn, /baselineLabel/);
assert.match(natalFn, /natalCountCaption/);
assert.match(natalFn, /border border-growth bg-growth-soft shadow-soft/);
assert.match(natalFn, /text-lg font-semibold text-growth-ink/);
assert.match(natalFn, /type-chip uppercase tracking-wide text-growth-ink/);
assert.doesNotMatch(natalFn, /border-growth\/40 bg-growth-soft\/40/);
assert.doesNotMatch(natalFn, /text-sm font-semibold text-growth-ink/);
assert.doesNotMatch(natalFn, /Always-on for this chart/);
assert.ok(
  natalFn.indexOf("aria-expanded={open}") > 0 &&
    natalFn.indexOf("{open && (") > natalFn.indexOf("aria-expanded={open}"),
  "open body stays behind the toggle",
);

// --- Completed this week is a default-collapsed disclosure ---
const weekFnStart = biohack.indexOf("function WeekSkyCard");
const weekFnEnd = biohack.indexOf("function NatalBaselineCard");
const weekFn = biohack.slice(weekFnStart, weekFnEnd);
assert.match(weekFn, /data-testid="week-plan"/);
assert.match(weekFn, /t\("page\.protocols\.thisWeek"\)/);
assert.match(weekFn, /data-testid="week-theme"/);
assert.match(weekFn, /data-testid="week-sky-note"/);
assert.match(weekFn, /page\.protocols\.skyNoteThisWeek/);
assert.match(weekFn, /data-testid="week-completed"/);
assert.match(weekFn, /const \[open, setOpen\] = useState\(false\)/);
assert.match(weekFn, /open=\{open\}/);
assert.doesNotMatch(weekFn, /<details className="group">/);
assert.match(weekFn, /min-h-12/);
assert.match(weekFn, /page\.protocols\.completedThisWeek/);
assert.match(weekFn, /page\.protocols\.completedCount/);
assert.match(weekFn, /page\.protocols\.completedNoneClosed/);
assert.match(weekFn, /data-testid="week-completed-count"/);
assert.match(weekFn, /data-testid="week-completed-list"/);
assert.match(weekFn, /page\.protocols\.completedEmpty/);
assert.match(weekFn, /groupedDays/);
assert.match(weekFn, /formatWeekDayLabel/);
assert.match(weekFn, /weekDayKeysInZone/);
assert.doesNotMatch(weekFn, /<details[^>]*data-testid="week-day/);
assert.ok(
  weekFn.indexOf('testId="week-history"') > weekFn.indexOf('data-testid="week-completed"'),
  "Earlier weeks stays under the completed list",
);
assert.ok(
  weekFn.indexOf('data-testid="week-theme"') < weekFn.indexOf('data-testid="week-completed"'),
  "theme stays outside the completed disclosure",
);
assert.ok(
  weekFn.indexOf('data-testid="week-sky-note"') < weekFn.indexOf('data-testid="week-completed"'),
  "sky note stays a fold outside the completed disclosure",
);

// The whole card is one disclosure. Completed list opens with the parent.
const completedIdx = weekFn.indexOf('data-testid="week-completed"');
assert.ok(completedIdx > 0, "completed list present");
assert.ok(
  weekFn.indexOf('t("page.protocols.thisWeek")') < completedIdx,
  "This week title is the closed line, not inside the completed list",
);
assert.ok(
  !/data-testid="week-completed"[\s\S]*<details/.test(
    weekFn.slice(completedIdx, weekFn.indexOf('testId="week-history"')),
  ),
  "completed list is open with the parent, not a second disclosure",
);

// --- No Show-up / week-of-dots strip on Protocols ---
assert.doesNotMatch(biohack, /today-show-up|week-of-dots|Show-up strip/i);
assert.doesNotMatch(weekFn, /computeMoveShowUpWeek|ShowUpDay|today\.showUpLabel/);

// --- Locked EN copy ---
assert.equal(valueFor(en, "page.protocols.skyNoteThisWeek"), "Sky note · this week");
assert.equal(valueFor(en, "page.protocols.completedThisWeek"), "Completed this week");
assert.equal(valueFor(en, "page.protocols.completedCount"), "{n} checked · {weekLabel}");
assert.equal(
  valueFor(en, "page.protocols.completedNoneClosed"),
  "Nothing checked yet · {weekLabel}",
);
assert.equal(
  valueFor(en, "page.protocols.completedEmpty"),
  "Nothing checked yet — tick Today\u2019s Move or baseline kit items as you go.",
);
assert.equal(
  valueFor(en, "page.protocols.natalBaselineFallback"),
  "Standard care for your chart",
);
assert.equal(valueFor(en, "page.protocols.natalCountEmphasize"), "{n} emphasize");
assert.equal(valueFor(en, "page.protocols.natalCountIncrease"), "{n} increase");
assert.equal(valueFor(en, "page.protocols.natalCountEase"), "{n} ease");

const requiredKeys = [
  "page.protocols.skyNoteThisWeek",
  "page.protocols.completedThisWeek",
  "page.protocols.completedCount",
  "page.protocols.completedNoneClosed",
  "page.protocols.completedEmpty",
  "page.protocols.natalBaselineFallback",
  "page.protocols.natalCountEmphasize",
  "page.protocols.natalCountIncrease",
  "page.protocols.natalCountEase",
];
for (const { id, src } of locales) {
  for (const key of requiredKeys) {
    const val = valueFor(src, key);
    assert.ok(val && val.length > 0, `${id} missing ${key}`);
  }
}
for (const { id, src } of locales) {
  if (id === "en") continue;
  for (const key of requiredKeys) {
    assert.notEqual(valueFor(src, key), valueFor(en, key), `${id} ${key} still equals EN`);
  }
}

console.log("assert-protocols-this-week-natal-prominence PASS");
