/**
 * Day 1 next-3: evening-close human labels, sanitizeWhy, whyHint hide-when-open.
 * Run: npx tsx scripts/assert-day1-next3-labels-kit-disclosure.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const esc = await import("../src/lib/eveningSignatureClose.ts");
const { sanitizeProtocolWhy } = await import("../src/lib/sanitizeProtocolWhy.ts");

const {
  encodeEveningCloseLabel,
  parseEveningCloseLabel,
  eveningAnswerKey,
  eveningCloseDisplay,
  isEveningCloseCompletion,
  EVENING_CLOSE_ITEM_ID,
} = esc;

// --- Shared evening-close display helper ---
assert.equal(eveningAnswerKey("yes"), "today.eveningClose.yes");
assert.equal(eveningAnswerKey("no"), "today.eveningClose.no");
assert.equal(eveningAnswerKey("recognized"), "today.eveningClose.recognized");
assert.equal(eveningAnswerKey("rest"), "today.eveningClose.rest");

for (const [typeKey, answer] of [
  ["Generator", "yes"],
  ["Generator", "no"],
  ["Manifesting Generator", "yes"],
  ["Projector", "rest"],
  ["Projector", "recognized"],
  ["Manifestor", "yes"],
  ["Reflector", "yes"],
]) {
  const label = encodeEveningCloseLabel({ typeKey, answer });
  assert.equal(label, `${typeKey}|${answer}`);
  assert.ok(parseEveningCloseLabel(label), `parses ${label}`);
  const display = eveningCloseDisplay(label);
  assert.equal(display.titleKey, "today.eveningClose.label");
  assert.equal(display.answerKey, eveningAnswerKey(answer));
  // Never surface raw Type|answer as the title key / answer key
  assert.notEqual(display.titleKey, label);
}

// Unparseable evening label → title only, never raw string as answer
const fallback = eveningCloseDisplay("not-a-type-answer");
assert.equal(fallback.titleKey, "today.eveningClose.label");
assert.equal(fallback.answerKey, null);

assert.equal(
  isEveningCloseCompletion({ itemId: EVENING_CLOSE_ITEM_ID, kind: "move" }),
  true
);
assert.equal(isEveningCloseCompletion({ itemId: "x", kind: "evening" }), true);
assert.equal(isEveningCloseCompletion({ itemId: "x", kind: "move" }), false);

const biohack = read("src/app/biohack/page.tsx");
const history = read("src/components/EarlierWeeksHistory.tsx");
const todayInd = read("src/components/TodayIndication.tsx");
const deepDive = read("src/components/ChartDeepDive.tsx");
const escSrc = read("src/lib/eveningSignatureClose.ts");

assert.match(escSrc, /export function eveningCloseDisplay/);
assert.match(escSrc, /export function eveningAnswerKey/);
assert.match(biohack, /eveningCloseDisplay/);
assert.match(biohack, /isEveningCloseCompletion/);
assert.match(history, /eveningCloseDisplay/);
assert.match(history, /isEveningCloseCompletion/);
// Completed this week must not render raw r.label for evening rows without helper
const weekFnStart = biohack.indexOf("function WeekSkyCard");
assert.ok(weekFnStart > 0);
const weekFn = biohack.slice(weekFnStart, weekFnStart + 4500);
assert.match(weekFn, /eveningCloseDisplay/);
assert.match(weekFn, /isEveningCloseCompletion/);
assert.doesNotMatch(history, /function eveningAnswerKey/);

// --- sanitizeWhy / sanitizeProtocolWhy ---
const live =
  "Baseline kit — prefer what you already own; skip if evening lead already covers it.";
const out = sanitizeProtocolWhy(live, true);
assert.ok(out, "must not omit useful remainder");
assert.doesNotMatch(out, /^Baseline kit\s*[—–-]?\s*$/i);
assert.match(out, /skip if evening lead already covers it/i);
assert.doesNotMatch(out, /prefer what you already own/i);

// Missing period after ownership phrase must not swallow remainder
const missingPeriod =
  "Baseline kit — prefer what you already own skip if evening lead already covers it.";
const out2 = sanitizeProtocolWhy(missingPeriod, true);
assert.ok(out2);
assert.match(out2, /skip if evening lead already covers it/i);
assert.doesNotMatch(out2, /^Baseline kit\s*[—–-]?\s*$/i);

assert.equal(
  sanitizeProtocolWhy("Baseline kit — prefer what you already own.", true),
  undefined
);
assert.equal(
  sanitizeProtocolWhy("You already own something like this. Keep the dose steady.", true),
  "Keep the dose steady."
);

// Source must not use the old [^.]* ownership swallow
const sanitizeSrc = read("src/lib/sanitizeProtocolWhy.ts");
assert.doesNotMatch(sanitizeSrc, /prefer what you already own\[\^\.\]\*/);

// --- whyHint hide-when-open ---
assert.match(todayInd, /today\.whyHint/);
assert.match(
  todayInd,
  /group-open:hidden[\s\S]{0,80}today\.whyHint|today\.whyHint[\s\S]{0,80}group-open:hidden/
);
// Chart Deep Dive pin stays intact
assert.match(deepDive, /group-open:hidden[\s\S]{0,40}chart\.deepDive\.learnMore|chart\.deepDive\.learnMore[\s\S]{0,80}group-open:hidden/);

console.log("PASS: day1-next3 labels / sanitizeWhy / whyHint disclosure");
