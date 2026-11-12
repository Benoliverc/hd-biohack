/**
 * Evening Signature Close — Type copy, visibility, placement, no-score ACs.
 * Run: npx tsx scripts/assert-evening-signature-close.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const mod = await import("../src/lib/eveningSignatureClose.ts");
const {
  normalizeHdType,
  eveningQuestionKey,
  eveningAnswerOptions,
  encodeEveningCloseLabel,
  parseEveningCloseLabel,
  isEveningCloseVisible,
  hourInZone,
  EVENING_CLOSE_ITEM_ID,
} = mod;

assert.equal(normalizeHdType("Generator"), "Generator");
assert.equal(normalizeHdType("Manifesting Generator"), "Manifesting Generator");
assert.equal(normalizeHdType("mg"), "Manifesting Generator");
assert.equal(normalizeHdType("Projector"), "Projector");
assert.equal(normalizeHdType("Manifestor"), "Manifestor");
assert.equal(normalizeHdType("Reflector"), "Reflector");
assert.equal(normalizeHdType(""), null);
assert.equal(normalizeHdType("Unknown"), null);

assert.equal(eveningQuestionKey("Generator"), "today.eveningClose.q.generator");
assert.equal(
  eveningQuestionKey("Manifesting Generator"),
  "today.eveningClose.q.generator"
);
assert.equal(eveningQuestionKey("Manifestor"), "today.eveningClose.q.manifestor");
assert.equal(eveningQuestionKey("Projector"), "today.eveningClose.q.projector");
assert.equal(eveningQuestionKey("Reflector"), "today.eveningClose.q.reflector");

assert.deepEqual(
  eveningAnswerOptions("Generator").map((o) => o.answer),
  ["yes", "no"]
);
assert.deepEqual(
  eveningAnswerOptions("Manifesting Generator").map((o) => o.answer),
  ["yes", "no"]
);
assert.deepEqual(
  eveningAnswerOptions("Manifestor").map((o) => o.answer),
  ["yes", "no"]
);
assert.deepEqual(
  eveningAnswerOptions("Reflector").map((o) => o.answer),
  ["yes", "no"]
);
assert.deepEqual(
  eveningAnswerOptions("Projector").map((o) => o.answer),
  ["recognized", "rest"]
);

const enc = encodeEveningCloseLabel({ typeKey: "Projector", answer: "rest" });
assert.equal(enc, "Projector|rest");
assert.deepEqual(parseEveningCloseLabel(enc), {
  typeKey: "Projector",
  answer: "rest",
});
assert.equal(parseEveningCloseLabel("Generator|maybe"), null);

// Visibility: after 17:00 HKT (UTC+8) — 09:00 UTC = 17:00 HKT
const at17 = new Date("2026-11-06T09:00:00.000Z");
assert.equal(hourInZone("Asia/Hong_Kong", at17), 17);
assert.equal(
  isEveningCloseVisible({ timeZone: "Asia/Hong_Kong", now: at17 }),
  true
);
const at16 = new Date("2026-11-06T08:00:00.000Z"); // 16:00 HKT
assert.equal(hourInZone("Asia/Hong_Kong", at16), 16);
assert.equal(
  isEveningCloseVisible({ timeZone: "Asia/Hong_Kong", now: at16 }),
  false
);
assert.equal(
  isEveningCloseVisible({
    timeZone: "Asia/Hong_Kong",
    now: at16,
    whenSlot: "evening",
  }),
  true
);
assert.equal(
  isEveningCloseVisible({
    timeZone: "Asia/Hong_Kong",
    now: at16,
    alreadyDone: true,
  }),
  true
);

const todayInd = read("src/components/TodayIndication.tsx");
assert.match(todayInd, /data-testid="today-evening-close"/);
assert.match(todayInd, /data-testid="today-evening-close-question"/);
assert.match(todayInd, /data-testid="today-evening-close-choices"/);
assert.match(todayInd, /data-testid="today-evening-close-note"/);
assert.match(todayInd, /isEveningCloseVisible/);
assert.match(todayInd, /persistEveningClose/);
assert.match(todayInd, /kind: "evening"/);
assert.match(todayInd, /maxLength=\{120\}/);

const moveIdx = todayInd.indexOf('data-testid="main-action"');
const eveningIdx = todayInd.indexOf('data-testid="today-evening-close"');
const kitIdx = todayInd.indexOf('data-testid="today-kit-placeholder"');
const kitLineIdx = todayInd.indexOf('data-testid="today-kit-line"');
const skyIdx = todayInd.indexOf('data-testid="today-sky-block"');
assert.ok(eveningIdx > moveIdx, "evening close under Move hero");
// Settled Day: Close is a sibling after the hero (after kit), not between Move and kit
assert.ok(eveningIdx > kitIdx, "evening close after kit placeholder");
assert.ok(kitLineIdx > 0 && eveningIdx > kitLineIdx, "evening close after kit line");
assert.ok(skyIdx > eveningIdx, "evening close before sky block");

// Never above Move — evening block must sit after move-done
const moveDoneIdx = todayInd.indexOf('data-testid="today-move-done"');
assert.ok(eveningIdx > moveDoneIdx, "evening after move checkbox");

// No score / gamification in evening block
const eveningBlock = todayInd.slice(eveningIdx - 200, eveningIdx + 2200);
assert.doesNotMatch(
  eveningBlock,
  /confetti|badge|points|progressbar|alignment score|percent|%/i
);
assert.doesNotMatch(todayInd, /animate-confetti|loot/i);

// Save/load via existing completion plumbing
assert.match(todayInd, /putProtocolCompletion/);
assert.match(todayInd, /eveningCloseItemId/);
assert.match(todayInd, /encodeEveningCloseLabel/);
assert.match(todayInd, /parseEveningCloseLabel/);
assert.equal(EVENING_CLOSE_ITEM_ID, "today-evening-close");

const completions = read("src/lib/protocolCompletions.ts");
assert.match(completions, /"evening"/);
assert.match(completions, /normalizeCompletionKind/);

const api = read("src/lib/api.ts");
assert.match(api, /"evening"/);

const schemas = read("../backend/app/schemas.py");
assert.match(schemas, /"evening"/);

const routes = read("../backend/app/api/routes.py");
assert.match(routes, /\("move", "baseline", "evening", "kit"\)/);

const en = read("src/lib/i18n/messages/en.ts");
assert.match(en, /Did anything satisfy\?/);
assert.match(en, /Did you have peace to start/);
assert.match(en, /Were you recognized, or did you rest\?/);
assert.match(en, /Did the place feel right\?/);
assert.doesNotMatch(en, /alignment score|broke your streak/i);

const transits = read("src/app/transits/page.tsx");
assert.match(transits, /natalType=\{typeFromChart\(youChartPayload\)\}/);

console.log("assert-evening-signature-close PASS");
