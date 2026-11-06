/**
 * Kind Show-Up Ritual — pure week statuses + Today source ACs.
 * Run: npx tsx scripts/assert-kind-show-up.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const mod = await import("../src/lib/protocolCompletions.ts");
const { computeMoveShowUpWeek, weekDayKeysInZone, DEFAULT_PROTOCOLS_TZ } = mod;

const week = [
  "2026-11-02",
  "2026-11-03",
  "2026-11-04",
  "2026-11-05",
  "2026-11-06",
  "2026-11-07",
  "2026-11-08",
];
assert.equal(week.length, 7);

// Today Friday with Mon+Wed filled, Tue missed (grace), Thu missed
const completed = new Set(["2026-11-02", "2026-11-04"]);
const { days, hadMiss, usedGrace } = computeMoveShowUpWeek({
  weekKeys: week,
  todayKey: "2026-11-06",
  completedMoveDays: completed,
  allowGrace: true,
});
assert.equal(days[0].status, "filled"); // Mon
assert.equal(days[1].status, "grace"); // Tue first miss
assert.equal(days[2].status, "filled"); // Wed
assert.equal(days[3].status, "missed"); // Thu second miss
assert.equal(days[4].status, "empty"); // Fri today
assert.equal(days[5].status, "future");
assert.equal(days[6].status, "future");
assert.equal(hadMiss, true);
assert.equal(usedGrace, true);

// Empty week — today empty, past days grace then missed; Move still independent
const empty = computeMoveShowUpWeek({
  weekKeys: week,
  todayKey: "2026-11-06",
  completedMoveDays: new Set(),
  allowGrace: true,
});
assert.equal(empty.days[4].status, "empty");
assert.ok(empty.days.slice(0, 4).every((d) => d.status === "grace" || d.status === "missed"));

// Filled today
const filledToday = computeMoveShowUpWeek({
  weekKeys: week,
  todayKey: "2026-11-06",
  completedMoveDays: new Set(["2026-11-06"]),
  allowGrace: true,
});
assert.equal(filledToday.days[4].status, "filled");

const todayInd = read("src/components/TodayIndication.tsx");
assert.match(todayInd, /data-testid="today-show-up"/);
assert.match(todayInd, /data-testid="today-show-up-dots"/);
assert.match(todayInd, /data-testid="today-show-up-kind"/);
assert.match(todayInd, /computeMoveShowUpWeek/);
assert.match(todayInd, /loadMoveCompletedDaysInWeek/);
assert.match(todayInd, /weekDayKeysInZone/);

const moveIdx = todayInd.indexOf('data-testid="main-action"');
const showIdx = todayInd.indexOf('data-testid="today-show-up"');
const headerish = todayInd.indexOf("slim header");
assert.ok(showIdx > moveIdx, "show-up under Move hero");

// Count only move id — not kit
assert.match(todayInd, /move_item_id \|\| "today-move"/);
assert.doesNotMatch(
  todayInd.slice(showIdx, showIdx + 800),
  /kitId|today-kit/
);

// Missed styling must not use warning/danger tokens (dotClass lives just above the testid)
const showBlock = todayInd.slice(Math.max(0, showIdx - 900), showIdx + 1800);
assert.doesNotMatch(showBlock, /--danger|text-danger|bg-danger|border-danger|text-red-|bg-red-|border-red-/);
assert.match(showBlock, /bg-fg-muted\/30/);
assert.match(todayInd, /data-status=\{d\.status\}/);
assert.match(read("src/lib/protocolCompletions.ts"), /status: "missed"/);

// Kind copy after miss; no streak shame
assert.match(todayInd, /today\.showUpStill/);
assert.doesNotMatch(todayInd, /broke your streak|freeze-out|fire/i);
assert.doesNotMatch(todayInd, /streakCount|streak-count|numeric streak/i);

// Move remains tappable regardless of week
assert.match(todayInd, /data-testid="today-move-done"/);

const en = read("src/lib/i18n/messages/en.ts");
assert.match(en, /today\.showUpLabel/);
assert.match(en, /Still showing up/);
assert.doesNotMatch(en, /broke your streak/i);

// Preferred TZ week keys (not novelty HKT retarget)
const ny = weekDayKeysInZone("America/New_York", new Date("2026-11-06T04:00:00.000Z"));
const hkt = weekDayKeysInZone(DEFAULT_PROTOCOLS_TZ, new Date("2026-11-06T04:00:00.000Z"));
assert.equal(ny.length, 7);
assert.equal(hkt.length, 7);

console.log("assert-kind-show-up PASS");
