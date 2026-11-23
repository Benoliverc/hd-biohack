/**
 * Add a person flow — source pins (a)–(g).
 * Soul Add person / Add a person on Chart land on Chart in new-person mode;
 * Add new person stays visible outside the collapsed Edit / switch person panel;
 * startNewPerson() is the single new-person path; Open Chart ?person= still works;
 * no natal form on Soul; cap and Pro rules unchanged.
 * Run: npx tsx scripts/assert-add-person-flow.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const soul = read("src/app/soul/page.tsx");
const profile = read("src/app/profile/page.tsx");
const pkg = read("package.json");

function sliceTestIdHref(src, testId) {
  const marker = `data-testid="${testId}"`;
  const idx = src.indexOf(marker);
  assert.ok(idx >= 0, `missing data-testid=${testId}`);
  const start = src.lastIndexOf("<Link", idx);
  assert.ok(start >= 0 && idx - start < 800, `${testId} Link start not found`);
  const end = src.indexOf("</Link>", idx);
  return src.slice(start, end);
}

// --- (a) Soul CTAs deep-link to Chart new-person mode ---
const addPersonLink = sliceTestIdHref(soul, "soul-add-person");
const addOnChartLink = sliceTestIdHref(soul, "soul-cta-chart");
assert.match(addPersonLink, /href="\/profile\?new=person#people-form"/);
assert.match(addOnChartLink, /href="\/profile\?new=person#people-form"/);
assert.match(soul, /soul\.chrome\.addPerson/);
assert.match(soul, /soul\.chrome\.addPersonOnChart/);

assert.match(profile, /searchParams\.get\("new"\) === "person"/);
assert.match(profile, /wantsNewPerson/);
assert.match(profile, /newPersonIntentRef/);
assert.match(profile, /id="people-form"/);
assert.match(profile, /personNameInputRef/);
assert.match(profile, /personNameInputRef\.current\?\.focus\(\)/);
assert.match(profile, /scrollChartSectionIntoView\("people-form"/);

// Hydration race: Me / preferred row must not clobber new-person intent.
const hydrateSkip = profile.slice(
  profile.indexOf("// New-person intent wins"),
  profile.indexOf("const preferred = pickPreferredRow(rows, requestedPersonId ?? natalChartId);"),
);
assert.match(hydrateSkip, /if \(newPersonIntentRef\.current\)/);
assert.doesNotMatch(hydrateSkip, /applyRow\(/);
assert.match(hydrateSkip, /setPersonEditorOpen\(true\)/);

// Resync / reopen / collapse must also respect the intent.
assert.match(
  profile,
  /editingChartIdRef\.current == null && !newPersonIntentRef\.current/,
);
assert.match(profile, /!newPersonIntentRef\.current\s*\n\s*\) \{\s*\n\s*applyRow\(preferred\)/);
assert.match(
  profile,
  /if \(!newPersonIntentRef\.current\) setPersonEditorOpen\(false\)/,
);

// Deep link runs the same startNewPerson path once the form is ready.
assert.match(profile, /if \(!wantsNewPerson \|\| !formReady\) return;/);
assert.match(profile, /startNewPerson\(\);/);

// --- (b) Add new person visible on Chart while a saved chart is showing ---
const peopleFormStart = profile.indexOf('<div id="people-form"');
assert.ok(peopleFormStart >= 0);
const peopleForm = profile.slice(peopleFormStart, peopleFormStart + 3500);
assert.match(peopleForm, /<details/);
assert.match(peopleForm, /<summary/);
const summaryStart = peopleForm.indexOf("<summary");
const summaryEnd = peopleForm.indexOf("</summary>");
assert.ok(summaryStart >= 0 && summaryEnd > summaryStart);
const summary = peopleForm.slice(summaryStart, summaryEnd);
assert.match(summary, /data-testid="add-new-person"/);
assert.match(summary, /chart\.people\.addNewPerson/);
assert.match(summary, /startNewPerson\(\)/);
assert.match(summary, /e\.preventDefault\(\)/);
assert.match(summary, /e\.stopPropagation\(\)/);
// Must not live only inside the collapsed details body.
const detailsBody = peopleForm.slice(summaryEnd);
assert.doesNotMatch(
  detailsBody,
  /data-testid="add-new-person"/,
  "collapsed details body must not be the only Add new person control",
);

// --- (c) Landing is a new person: existing banner + create save, not an update ---
assert.match(profile, /const isNewPersonUi = editingChartId == null \|\| viewMode !== "saved"/);
assert.match(profile, /chart\.people\.newPersonNothingOverwritten/);
assert.match(profile, /chart\.people\.savePerson/);
assert.match(profile, /chart\.people\.saveAsNewPerson/);
assert.match(profile, /data-testid="you-row"/);
assert.match(profile, /chart\.people\.savedPeople/);
// Primary save in new-person UI is create, not update of the previous chart.
const createSave = profile.slice(
  profile.indexOf(") : canCreatePeople || !hasSelfSaved ? ("),
  profile.indexOf('data-testid="preview-only"'),
);
assert.match(createSave, /void submit\(\s*"create"/);
assert.doesNotMatch(createSave, /submit\(\s*"update"/);

// --- (d) No natal form added on Soul ---
assert.doesNotMatch(soul, /FirstRunChartForm/);
assert.doesNotMatch(soul, /data-testid="first-run-chart-form"/);
assert.doesNotMatch(soul, /type="date"/);
assert.doesNotMatch(soul, /id="people-form"/);
assert.doesNotMatch(soul, /startNewPerson/);

// --- (e) Open Chart ?person= still opens that saved person ---
assert.match(soul, /\/profile\?person=\$\{selectedFriend\.id\}/);
assert.equal(
  [...soul.matchAll(/data-testid="soul-open-chart"/g)].length,
  2,
  "both Open Chart links must remain",
);
for (const match of soul.matchAll(/data-testid="soul-open-chart"/g)) {
  const start = soul.lastIndexOf("<Link", match.index);
  const chunk = soul.slice(start, match.index + 80);
  assert.match(chunk, /\/profile\?person=\$\{selectedFriend\.id\}/);
  assert.doesNotMatch(chunk, /new=person/);
}
assert.match(profile, /requestedPersonId/);
assert.match(profile, /Open Chart \(\?person=\) wins if both are present/);

// --- (f) Cap and Pro-gated create rules unchanged ---
assert.match(profile, /const MAX_PEOPLE = 10;/);
assert.match(profile, /savedPeople\.length >= MAX_PEOPLE/);
assert.match(profile, /chart\.people\.atPersonLimit/);
assert.match(profile, /chart\.people\.savingPeopleRequiresPro/);
assert.match(profile, /chart\.people\.freeOneMe/);
assert.match(profile, /const canCreatePeople = biohackingUnlocked;/);
assert.match(profile, /atCap \|\| !friendName\.trim\(\) \|\| !canCreatePeople/);
assert.match(
  profile,
  /saveIntent === "create" && savedPeople\.length >= MAX_PEOPLE/,
);
assert.match(
  profile,
  /saveIntent === "create" && !biohackingUnlocked/,
);

// --- (g) One new-person path: startNewPerson(), not a second model ---
assert.match(profile, /const startNewPerson = useCallback\(/);
assert.equal(
  [...profile.matchAll(/const startNewPerson/g)].length,
  1,
  "startNewPerson must be defined once",
);
// Every add-new-person control calls startNewPerson, not a second entry path.
const addButtons = [...profile.matchAll(/data-testid="add-new-person"/g)];
assert.equal(addButtons.length, 2, "expected summary + uncollapsed inner Add new person");
for (const match of addButtons) {
  const window = profile.slice(match.index, match.index + 700);
  assert.match(window, /startNewPerson/);
  assert.doesNotMatch(window, /setEditingChartId\(null\)/);
}
assert.match(pkg, /"assert:add-person-flow"/);

console.log("PASS: assert-add-person-flow");
