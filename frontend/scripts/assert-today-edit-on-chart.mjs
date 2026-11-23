/**
 * Today “Edit on Chart” handoff — source pins (a)–(i).
 * Today’s Edit on Chart opens the existing You birth editor on Chart via
 * /profile?edit=me#people-form; it must not collapse once a chart appears,
 * and must not start a new person. Open Chart ?person= still wins if both
 * intents are present. Add a person / startNewPerson() stay unchanged.
 * Run: npx tsx scripts/assert-today-edit-on-chart.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { shouldResetScrollOnPrimaryTabChange } from "../src/lib/primaryTabScroll.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const indication = read("src/components/TodayIndication.tsx");
const profile = read("src/app/profile/page.tsx");
const soul = read("src/app/soul/page.tsx");
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

function sliceCaveatEditLink(src) {
  const marker = 'data-testid="today-time-unknown-caveat"';
  const idx = src.indexOf(marker);
  assert.ok(idx >= 0, "missing today-time-unknown-caveat");
  const end = src.indexOf("</p>", idx);
  const chunk = src.slice(idx, end);
  assert.match(chunk, /chart\.timeUnknownEdit/);
  const linkStart = chunk.indexOf("<Link");
  const linkEnd = chunk.indexOf("</Link>");
  assert.ok(linkStart >= 0 && linkEnd > linkStart, "Edit on Chart Link missing in caveat");
  return chunk.slice(linkStart, linkEnd);
}

// --- (a) Today “Edit on Chart” uses a dedicated edit-You deep link, not ?new=person ---
const editLink = sliceCaveatEditLink(indication);
assert.match(editLink, /href="\/profile\?edit=me#people-form"/);
assert.doesNotMatch(editLink, /new=person/);
assert.match(indication, /t\("chart\.timeUnknownEdit"\)/);

// The no-Me “Save natal” CTA stays plain /profile (both instances).
const saveCtas = [...indication.matchAll(/data-testid="indication-save-chart-cta"/g)];
assert.equal(saveCtas.length, 2, "both Save natal CTAs must remain");
for (const match of saveCtas) {
  const start = indication.lastIndexOf("<Link", match.index);
  const chunk = indication.slice(start, indication.indexOf("</Link>", match.index));
  assert.match(chunk, /href="\/profile"/);
  assert.doesNotMatch(chunk, /edit=me/);
  assert.doesNotMatch(chunk, /new=person/);
}

assert.match(profile, /searchParams\.get\("edit"\) === "me"/);
assert.match(profile, /wantsEditYou/);
assert.match(profile, /editYouIntentRef/);
assert.match(profile, /id="people-form"/);

// --- (b) Arrival: You selected, editor open, details kept, scrolled, time-unknown focused ---
assert.match(profile, /timeUnknownInputRef/);
assert.match(profile, /timeUnknownInputRef\.current\?\.focus\(\)/);
assert.match(profile, /scrollChartSectionIntoView\("people-form"/);
assert.match(profile, /data-testid="chart-time-unknown"/);
assert.match(profile, /ref=\{timeUnknownInputRef\}/);
// Apply the existing You row; do not blank the form.
const editApply = profile.slice(
  profile.indexOf("// Deep link /profile?edit=me#people-form"),
  profile.indexOf("const mapSaveError"),
);
assert.match(editApply, /const youRow = savedPeople\.find\(\(r\) => isSelfRow\(r\)\)/);
assert.match(editApply, /applyRow\(youRow\)/);
assert.match(editApply, /setPersonEditorOpen\(true\)/);
assert.doesNotMatch(editApply, /startNewPerson\(/);
assert.doesNotMatch(editApply, /setBirthDate\(""\)/);
assert.doesNotMatch(editApply, /setTimeUnknown\(false\)/);

// --- (c) Separate latch wins over Me hydration and the shared collapse root ---
assert.match(profile, /const editYouIntentRef = useRef\(false\)/);
assert.match(
  profile,
  /if \(!newPersonIntentRef\.current\) setPersonEditorOpen\(false\)/,
);
assert.match(
  profile,
  /if \(editYouIntentRef\.current\) setPersonEditorOpen\(true\)/,
);
// Edit-You hydrate path applies You and keeps the editor open; it is not the new-person skip.
const editHydrate = profile.slice(
  profile.indexOf("// Edit-You intent: apply You"),
  profile.indexOf("// No You yet: leave fields empty for first-run."),
);
assert.match(editHydrate, /if \(editYouIntentRef\.current\)/);
assert.match(editHydrate, /isSelfRow/);
assert.match(editHydrate, /applyRow\(youRow\)/);
assert.match(editHydrate, /setPersonEditorOpen\(true\)/);
assert.doesNotMatch(editHydrate, /startNewPerson/);
assert.doesNotMatch(editHydrate, /newPersonIntentRef/);
// Must not reuse the new-person latch for this handoff.
assert.match(profile, /const newPersonIntentRef = useRef\(false\)/);

// --- (d) Update of You, not a create; no new-person banner on this path ---
assert.doesNotMatch(editApply, /newPersonNothingOverwritten/);
assert.doesNotMatch(editApply, /setEditingChartId\(null\)/);
assert.match(profile, /const isNewPersonUi = editingChartId == null \|\| viewMode !== "saved"/);
assert.match(profile, /chart\.people\.updateYourChart/);
assert.match(profile, /chart\.people\.newPersonNothingOverwritten/);

// --- (e) Open Chart ?person= still wins and does not force the editor open ---
assert.match(profile, /Open Chart \(\?person=\) wins if both are present/);
assert.match(
  profile,
  /const wantsEditYou =\s*requestedPersonId == null && searchParams\.get\("edit"\) === "me"/,
);
assert.match(soul, /\/profile\?person=\$\{selectedFriend\.id\}/);
// When ?person= is present, the edit latch is cleared so collapse behaves as today.
const latch = profile.slice(
  profile.indexOf("// Latch URL intent before the hydrate effect"),
  profile.indexOf("const refreshPeople = useCallback"),
);
assert.match(latch, /if \(requestedPersonId != null\)/);
assert.match(latch, /editYouIntentRef\.current = false/);

// --- (f) Add a person path is unchanged; Today does not use ?new=person ---
assert.match(soul, /href="\/profile\?new=person#people-form"/);
assert.equal(
  [...soul.matchAll(/href="\/profile\?new=person#people-form"/g)].length,
  2,
  "Soul Add person and Add a person on Chart stay on the new-person deep link",
);
assert.match(profile, /const startNewPerson = useCallback\(/);
assert.equal(
  [...profile.matchAll(/const startNewPerson/g)].length,
  1,
  "startNewPerson must still be defined once",
);
assert.doesNotMatch(indication, /new=person/);
assert.match(profile, /if \(!wantsNewPerson \|\| !formReady\) return;/);
assert.match(profile, /startNewPerson\(\);/);

// --- (g) Primary-tab scroll unchanged; this handoff’s hash must not be reset ---
assert.equal(
  shouldResetScrollOnPrimaryTabChange("/transits", "/profile", "#people-form"),
  false,
  "Today Edit on Chart /profile?edit=me#people-form must keep its hash scroll",
);
assert.equal(
  shouldResetScrollOnPrimaryTabChange("/biohack", "/transits", ""),
  true,
  "primary-tab change with no hash still resets to the top",
);

// --- (h) Locked time-unknown copy keys and leave-alones stay in place ---
assert.match(indication, /chart\.timeUnknownCaveat/);
assert.match(indication, /chart\.timeUnknownEdit/);
assert.match(profile, /t\("chart\.timeUnknown"\)/);
assert.match(profile, /t\("chart\.timeUnknownDisclosure"\)/);
assert.match(profile, /t\("chart\.timeUnknownCaveat"\)/);
assert.match(profile, /data-testid="chart-time-unknown-caveat"/);
assert.doesNotMatch(soul, /FirstRunChartForm/);
assert.doesNotMatch(soul, /id="people-form"/);

// --- (i) One edit-You path at the shared Chart intent root, not a second form ---
assert.equal(
  [...profile.matchAll(/const editYouIntentRef/g)].length,
  1,
  "editYouIntentRef must be defined once",
);
assert.equal(
  [...profile.matchAll(/id="people-form"/g)].length,
  1,
  "must not invent a second people form",
);

assert.match(pkg, /"assert:today-edit-on-chart"/);

console.log("PASS: assert-today-edit-on-chart");
