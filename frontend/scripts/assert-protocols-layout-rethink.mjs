/**
 * Protocols layout rethink — source ACs.
 * Run: npx tsx scripts/assert-protocols-layout-rethink.mjs
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
  const re = new RegExp(`['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*(['"])([\\s\\S]*?)\\1`);
  const m = src.match(re);
  return m ? m[2] : null;
}

const pkg = read("package.json");
const biohack = read("src/app/biohack/page.tsx");
const move = read("src/components/protocols/TodaysMoveCard.tsx");
const baseline = read("src/components/protocols/BaselineKitCard.tsx");
const api = read("src/lib/api.ts");
const hdCopy = read("src/lib/hdCopy.ts");
const rules = read("../backend/app/biohack/rules.py");
const locales = ["en", "de", "es", "fr", "nl"].map((id) => ({
  id,
  src: read(`src/lib/i18n/messages/${id}.ts`),
}));
const en = locales[0].src;

assert.ok(
  pkg.includes(
    '"assert:protocols-layout-rethink": "npx tsx scripts/assert-protocols-layout-rethink.mjs"',
  ),
  "package.json wires assert:protocols-layout-rethink",
);

// --- Unlocked body order ---
const markers = [
  "<TodaysMoveCard",
  "<NatalBaselineCard",
  '<LiteracyCoach variant="protocols"',
  "<BaselineKitCard",
  'data-testid="shelf-disclosure"',
  'data-testid="usual-confirm"',
  "<WeekSkyCard",
  't("page.protocols.disclaimer")',
];
let prev = -1;
for (const marker of markers) {
  const idx = biohack.indexOf(marker);
  assert.ok(idx > prev, `order marker missing or out of place: ${marker}`);
  prev = idx;
}
const betweenMoveAndNatal = biohack.slice(
  biohack.indexOf("<TodaysMoveCard"),
  biohack.indexOf("<NatalBaselineCard"),
);
assert.doesNotMatch(
  betweenMoveAndNatal,
  /LiteracyCoach|BaselineKitCard|shelf-disclosure|data-testid="baseline-kit"/,
  "nothing sits between Today’s Move and Natal baseline",
);

// --- Intention UI is gone; API helpers are not called from Protocols ---
assert.doesNotMatch(biohack, /intention-disclosure|DailyIntentionField|getIntention|putIntention/);
assert.doesNotMatch(api, /getIntention|putIntention/);
assert.match(hdCopy, /id: "protocols-shelf-intention"/);

const shelfBody =
  "Shelf is what you own and what can feed today’s kit line. It is the one place on Protocols to add or manage that cupboard. It does not replace the Move.";
const natalBody =
  "Natal baseline is the starting protocol for this chart — just under Today’s Move, collapsed by default, with the overview on the closed row. This week is a single line at the bottom of Protocols that you can expand.";
assert.equal(valueFor(en, "protocols.literacy.shelfIntention.title"), "Shelf");
assert.equal(valueFor(en, "protocols.literacy.shelfIntention.jump"), "Shelf");
assert.equal(valueFor(en, "protocols.literacy.shelfIntention.body"), shelfBody);
assert.doesNotMatch(shelfBody, /Intention/);
assert.equal(valueFor(en, "protocols.literacy.natalWeek.title"), "Natal and This week");
assert.equal(valueFor(en, "protocols.literacy.natalWeek.jump"), "Natal and This week");
assert.equal(valueFor(en, "protocols.literacy.natalWeek.body"), natalBody);
assert.equal(valueFor(en, "page.protocols.startingProtocol"), "Starting protocol");
assert.equal(valueFor(en, "protocols.baselineKitSameEveryDay"), "Same every day.");
assert.equal(valueFor(en, "protocols.alreadyOnTodaysProtocol"), "Already on today’s protocol");
assert.equal(valueFor(en, "page.protocols.checkedShort"), "{n} checked");

for (const { id, src } of locales) {
  for (const key of [
    "page.protocols.startingProtocol",
    "page.protocols.checkedShort",
    "protocols.baselineKitSameEveryDay",
    "protocols.alreadyOnTodaysProtocol",
    "protocols.literacy.shelfIntention.title",
    "protocols.literacy.shelfIntention.body",
    "protocols.literacy.natalWeek.body",
  ]) {
    const val = valueFor(src, key);
    assert.ok(val && val.length > 0, `${id} missing ${key}`);
    assert.doesNotMatch(val, /Intention|Intentie|Intención|Intentión/i, `${id} ${key} still mentions Intention`);
  }
  assert.equal(valueFor(src, "protocols.literacy.shelfIntention.title"), "Shelf");
  assert.ok(!src.includes("page.protocols.intention"), `${id} dropped Protocols intention keys`);
}

// --- One Shelf home ---
assert.match(biohack, /data-testid="shelf-disclosure"/);
assert.match(biohack, /id="shelf"/);
assert.match(biohack, /<InventoryPanel/);
assert.match(biohack, /data-testid="shelf-editor"/);
assert.match(biohack, /starter-/);
assert.doesNotMatch(biohack, /<KitStrip/);
assert.doesNotMatch(biohack, /data-testid="inventory-panel"/);
assert.match(biohack, /setShelfOpen\(!stackDeep && \(deep \|\| inventory\.length === 0\)\)/);
assert.match(biohack, /#stack must not open Shelf/);
const shelfCount = biohack.split('data-testid="shelf-disclosure"').length - 1;
assert.equal(shelfCount, 1, "one Shelf disclosure");

// --- Natal is the starting protocol, collapsed, stronger closed row ---
assert.match(biohack, /const \[natalOpen, setNatalOpen\] = useState\(false\)/);
assert.match(biohack, /setNatalOpen\(false\)/);
const natalFnStart = biohack.indexOf("function NatalBaselineCard");
const natalFn = biohack.slice(natalFnStart, biohack.indexOf("function InventoryPanel"));
assert.match(natalFn, /border border-growth bg-growth-soft shadow-soft/);
assert.match(natalFn, /text-lg font-semibold text-growth-ink/);
assert.match(natalFn, /page\.protocols\.startingProtocol/);
assert.match(natalFn, /page\.protocols\.natalBaseline/);
assert.doesNotMatch(natalFn, /border-growth\/40 bg-growth-soft\/40/);
assert.doesNotMatch(natalFn, /text-sm font-semibold text-growth-ink/);
assert.ok(
  natalFn.indexOf("{open && (") > natalFn.indexOf("aria-expanded={open}"),
  "Natal grid stays behind the toggle",
);

// --- Baseline kit is its own card; covered Magnesium is not a second tick ---
assert.doesNotMatch(move, /data-testid="baseline-kit"/);
assert.match(baseline, /data-testid="baseline-kit"/);
assert.match(baseline, /border border-border bg-elevated/);
assert.match(baseline, /protocols\.baselineKitSameEveryDay/);
assert.match(baseline, /protocols\.alreadyOnTodaysProtocol/);
assert.match(baseline, /data-testid="baseline-done-count"/);
assert.match(biohack, /id: `baseline:\$\{i\}`/);
assert.match(biohack, /covered_by_today === true/);
assert.match(biohack, /baselineTickable/);
assert.match(rules, /"covered_by_today": True/);
const coveredStart = baseline.indexOf("if (it.covered)");
const checkboxAt = baseline.indexOf('type="checkbox"');
assert.ok(coveredStart > 0 && checkboxAt > coveredStart, "covered branch precedes the checkbox");
assert.doesNotMatch(baseline.slice(coveredStart, checkboxAt), /type="checkbox"/);
assert.match(biohack, /const \[baselineKitOpen, setBaselineKitOpen\] = useState\(false\)/);

// --- This week is a one-line disclosure at the bottom ---
const weekFnStart = biohack.indexOf("function WeekSkyCard");
const weekFn = biohack.slice(weekFnStart, biohack.indexOf("function NatalBaselineCard"));
assert.match(weekFn, /const \[open, setOpen\] = useState\(false\)/);
assert.match(weekFn, /data-testid="week-plan"/);
assert.match(weekFn, /truncate/);
assert.match(weekFn, /page\.protocols\.thisWeek/);
assert.match(weekFn, /page\.protocols\.checkedShort/);
assert.match(weekFn, /weekRows\.length > 0/);
assert.match(weekFn, /data-testid="week-theme"/);
assert.match(weekFn, /data-testid="week-sky-note"/);
assert.match(weekFn, /data-testid="week-completed-list"/);
assert.match(weekFn, /testId="week-history"/);
assert.match(weekFn, /min-h-12/);
assert.ok(
  weekFn.indexOf('testId="week-history"') > weekFn.indexOf('data-testid="week-completed"'),
  "Earlier weeks stays under the completed list",
);
assert.doesNotMatch(biohack, /today-show-up|week-of-dots|Show-up strip|computeMoveShowUpWeek/);

const paywall = biohack.slice(biohack.indexOf("function LockedPaywallMock"));
assert.doesNotMatch(paywall, /LiteracyCoach|startingProtocol|natal-baseline-card/);

console.log("assert-protocols-layout-rethink PASS");
