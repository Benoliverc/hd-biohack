/**
 * Source-level ACs for Protocols complete-state pass:
 * sage wash on the Move card when complete; drop the top Refresh button.
 * Run: npx tsx scripts/assert-protocols-complete-state.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const move = read("src/components/protocols/TodaysMoveCard.tsx");
const biohack = read("src/app/biohack/page.tsx");
const todayInd = read("src/components/TodayIndication.tsx");
const globals = read("src/app/globals.css");

const cardIdx = move.indexOf('data-testid="todays-move"');
assert.ok(cardIdx >= 0, "todays-move test id missing");
const cardOpen = move.lastIndexOf("<section", cardIdx);
const cardHead = move.slice(cardOpen, cardIdx + 80);

// Complete + items => existing today-move-achieved class on the Protocols Move card
assert.match(
  cardHead,
  /moveComplete && items\.length > 0 \? "today-move-achieved" : "bg-elevated"/
);
assert.match(cardHead, /today-move-achieved/);

// Incomplete stays bg-elevated; do not invent a second wash or always-on sage class
assert.match(cardHead, /bg-elevated/);
assert.doesNotMatch(cardHead, /bg-growth-soft p-5|border-growth\/40 bg-growth-soft/);
assert.doesNotMatch(move, /protocols-move-achieved|protocol-move-achieved|todays-move-achieved/);

// "Today's move complete — nice work" still appears when complete
assert.match(move, /data-testid="protocol-move-complete"/);
assert.match(move, /protocols\.moveComplete/);
assert.match(move, /\(completeFlash \|\| moveComplete\) && items\.length > 0/);

// Reuse the existing CSS class; do not duplicate it
const washMatches = globals.match(/\.today-move-achieved\s*\{/g) || [];
assert.equal(washMatches.length, 1, "today-move-achieved must remain a single CSS class");
assert.match(globals, /--growth-soft/);

// Top Refresh button removed from Protocols; do not replace with a quieter reload control
assert.doesNotMatch(biohack, /data-testid="refresh-protocol"/);
assert.doesNotMatch(biohack, /page\.protocols\.refresh/);
assert.doesNotMatch(biohack, /page\.protocols\.building/);

// Retry still present on protocol load errors and still reloads
const errorIdx = biohack.indexOf("{error &&");
assert.ok(errorIdx >= 0, "error state missing");
const errorBlock = biohack.slice(errorIdx, errorIdx + 700);
assert.match(errorBlock, /page\.protocols\.retry/);
assert.match(errorBlock, /loadProtocol\(\{\s*rebuild:\s*true\s*\}\)/);

// Kit add/remove still rebuilds the plan (leave that path alone)
const kitRebuilds = [...biohack.matchAll(/loadProtocol\(\{\s*rebuild:\s*true\s*\}\)/g)];
assert.ok(kitRebuilds.length >= 2, "expected Retry plus kit add/remove rebuild calls");

// TodayIndication still uses .today-move-achieved unchanged
assert.match(todayInd, /data-testid="main-action"/);
assert.match(todayInd, /moveDone \? "today-move-achieved"/);
assert.match(todayInd, /data-achieved=\{moveDone \? "true" : "false"\}/);
assert.doesNotMatch(
  todayInd,
  /today-move-achieved[\s\S]{0,80}energy|energy-soft.*today-move-achieved/
);

console.log("assert-protocols-complete-state PASS");
