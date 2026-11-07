/**
 * Settled Day — Evening Close relocate, sage achieved wash, quieter Show-up.
 * Run: npx tsx scripts/assert-settled-day.mjs
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
const globals = read("src/app/globals.css");

const moveIdx = todayInd.indexOf('data-testid="main-action"');
const moveDoneIdx = todayInd.indexOf('data-testid="today-move-done"');
const kitPlaceholderIdx = todayInd.indexOf('data-testid="today-kit-placeholder"');
const kitLineIdx = todayInd.indexOf('data-testid="today-kit-line"');
const eveningIdx = todayInd.indexOf('data-testid="today-evening-close"');
const skyIdx = todayInd.indexOf('data-testid="today-sky-block"');

assert.ok(moveIdx > 0, "main-action present");
assert.ok(eveningIdx > 0, "today-evening-close present");
assert.ok(skyIdx > 0, "today-sky-block present");
assert.ok(kitPlaceholderIdx > 0, "kit placeholder present");
assert.ok(kitLineIdx > 0, "kit line present");

// Placement: Close after main-action + kit, before sky
assert.ok(eveningIdx > moveIdx, "evening after main-action");
assert.ok(eveningIdx > moveDoneIdx, "evening after move-done");
assert.ok(eveningIdx > kitPlaceholderIdx, "evening after kit placeholder");
assert.ok(eveningIdx > kitLineIdx, "evening after kit line");
assert.ok(skyIdx > eveningIdx, "evening before sky block");

// Achieved wash on main-action driven by moveDone
assert.match(todayInd, /data-achieved=\{moveDone \? "true" : "false"\}/);
assert.match(todayInd, /today-move-achieved/);
assert.match(todayInd, /moveDone \? "today-move-achieved"/);
assert.match(globals, /\.today-move-achieved/);
assert.match(globals, /--growth-soft/);
assert.match(globals, /var\(--growth\)/);

// Do not reuse Soul love / energy wash for completion
assert.doesNotMatch(todayInd, /soul-love-guidance-wash/);
assert.doesNotMatch(
  todayInd,
  /today-move-achieved[\s\S]{0,80}energy|energy-soft.*today-move-achieved/
);
const washBlock = globals.slice(globals.indexOf(".today-move-achieved"));
assert.doesNotMatch(washBlock, /--energy|soul-love-guidance-wash|sand-amber/i);

// Visibility gate unchanged
assert.match(todayInd, /isEveningCloseVisible/);
assert.match(
  todayInd,
  /isEveningCloseVisible\(\{\s*timeZone: protocolsTz,\s*whenSlot: indication\.when_slot,\s*alreadyDone,/
);

// No gamification in new chrome (hero wash + evening sibling area)
assert.doesNotMatch(todayInd, /confetti|animate-confetti/i);
const heroSlice = todayInd.slice(moveIdx, skyIdx + 80);
assert.doesNotMatch(
  heroSlice,
  /\bpoints\b|\bbadge\b|broke your streak|freeze-out|progressbar/i
);

// Quieter Show-up still inside hero (before kit / evening)
const showIdx = todayInd.indexOf('data-testid="today-show-up"');
assert.ok(showIdx > moveIdx && showIdx < kitPlaceholderIdx, "show-up inside hero before kit");
assert.match(todayInd, /data-testid="today-show-up-dots"/);
// No shouting uppercase section label on Show-up
const showBlock = todayInd.slice(showIdx, showIdx + 350);
assert.doesNotMatch(
  showBlock,
  /uppercase tracking-wide text-fg-muted">\s*\{t\("today\.showUpLabel"\)\}/
);

console.log("assert-settled-day PASS");
