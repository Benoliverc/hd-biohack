/**
 * Quiet Move Closure — source ACs for Today Move receipt + note.
 * Run: npx tsx scripts/assert-quiet-move-closure.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const todayInd = read("src/components/TodayIndication.tsx");
const completions = read("src/lib/protocolCompletions.ts");
const en = read("src/lib/i18n/messages/en.ts");

assert.match(todayInd, /data-testid="today-move-done"/);
assert.match(todayInd, /data-testid="today-move-closure"/);
assert.match(todayInd, /data-testid="today-move-receipt"/);
assert.match(todayInd, /data-testid="today-move-note"/);
assert.match(todayInd, /setCompletionNote/);
assert.match(todayInd, /persistNote/);
assert.match(todayInd, /today\.moveComplete/);
assert.match(todayInd, /maxLength=\{120\}/);

// Receipt only when moveDone
const closureIdx = todayInd.indexOf('data-testid="today-move-closure"');
const beforeClosure = todayInd.slice(Math.max(0, closureIdx - 400), closureIdx);
assert.match(beforeClosure, /moveDone \?/);

// Uncheck path uses toggleCompletion (note may persist when re-done)
assert.match(todayInd, /toggleCompletion/);
assert.match(completions, /if \(nextDone && prev\?\.note\) next\.note = prev\.note/);

// Move completes without kit/dose gate
const moveTap = todayInd.slice(
  todayInd.indexOf('data-testid="today-move-done"'),
  todayInd.indexOf('data-testid="today-move-done"') + 500
);
assert.doesNotMatch(moveTap, /kitDone|kit_item|dose/);
assert.match(todayInd, /persistToggle\(moveId/);

// No confetti / points / badges / progress bars on Today Move closure
const closureBlock = todayInd.slice(closureIdx, closureIdx + 900);
assert.doesNotMatch(closureBlock, /confetti|badge|points|progressbar|progressPct/i);
assert.doesNotMatch(todayInd, /animate-confetti|loot/i);

// Note wires through existing completion API
assert.match(todayInd, /putProtocolCompletion/);
assert.match(todayInd, /note: row\.note \?\? null/);

assert.match(en, /today\.moveComplete/);
assert.match(en, /You met the sky/);
assert.doesNotMatch(en, /broke your streak|freeze-out|fire icon/i);

console.log("assert-quiet-move-closure PASS");
