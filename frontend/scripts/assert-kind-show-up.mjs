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
const {
  computeMoveShowUpWeek,
  weekDayKeysInZone,
  DEFAULT_PROTOCOLS_TZ,
  isLifestyleMoveItemId,
  dayHasDoneLifestyleMove,
  loadMoveCompletedDaysInWeek,
  readShowUpDayMemory,
  showUpStartDayFromCreatedAt,
  dayKeyInZone,
} = mod;

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

// --- first-use startDay (locked brief) ---
const thuWeek = [
  "2026-11-16",
  "2026-11-17",
  "2026-11-18",
  "2026-11-19",
  "2026-11-20",
  "2026-11-21",
  "2026-11-22",
];
// Today Thursday, startDay Thursday, no completions
const thuStartEmpty = computeMoveShowUpWeek({
  weekKeys: thuWeek,
  todayKey: "2026-11-19",
  completedMoveDays: new Set(),
  allowGrace: true,
  startDay: "2026-11-19",
});
assert.equal(thuStartEmpty.days[0].status, "beforeStart"); // Mon
assert.equal(thuStartEmpty.days[1].status, "beforeStart"); // Tue
assert.equal(thuStartEmpty.days[2].status, "beforeStart"); // Wed
assert.equal(thuStartEmpty.days[3].status, "empty"); // Thu today
assert.equal(thuStartEmpty.days[4].status, "future");
assert.equal(thuStartEmpty.days[5].status, "future");
assert.equal(thuStartEmpty.days[6].status, "future");
assert.equal(thuStartEmpty.hadMiss, false);
assert.equal(thuStartEmpty.usedGrace, false);

// Same week, Thursday filled — caption must not show (hadMiss false)
const thuStartFilled = computeMoveShowUpWeek({
  weekKeys: thuWeek,
  todayKey: "2026-11-19",
  completedMoveDays: new Set(["2026-11-19"]),
  allowGrace: true,
  startDay: "2026-11-19",
});
assert.equal(thuStartFilled.days[0].status, "beforeStart");
assert.equal(thuStartFilled.days[1].status, "beforeStart");
assert.equal(thuStartFilled.days[2].status, "beforeStart");
assert.equal(thuStartFilled.days[3].status, "filled");
assert.equal(thuStartFilled.hadMiss, false);
assert.equal(thuStartFilled.usedGrace, false);

// Today Friday, startDay Monday (or omitted), no completions — existing empty-week rule
const friEmptyOmitted = computeMoveShowUpWeek({
  weekKeys: week,
  todayKey: "2026-11-06",
  completedMoveDays: new Set(),
  allowGrace: true,
});
assert.equal(friEmptyOmitted.days[0].status, "grace");
assert.equal(friEmptyOmitted.days[1].status, "missed");
assert.equal(friEmptyOmitted.days[2].status, "missed");
assert.equal(friEmptyOmitted.days[3].status, "missed");
assert.equal(friEmptyOmitted.days[4].status, "empty");
assert.equal(friEmptyOmitted.hadMiss, true);

const friEmptyStartMon = computeMoveShowUpWeek({
  weekKeys: week,
  todayKey: "2026-11-06",
  completedMoveDays: new Set(),
  allowGrace: true,
  startDay: "2026-11-02",
});
assert.equal(friEmptyStartMon.days[0].status, "grace");
assert.equal(friEmptyStartMon.days[1].status, "missed");
assert.equal(friEmptyStartMon.days[2].status, "missed");
assert.equal(friEmptyStartMon.days[3].status, "missed");
assert.equal(friEmptyStartMon.days[4].status, "empty");
assert.equal(friEmptyStartMon.hadMiss, true);

// Today Friday, startDay Wednesday, no completions
const friStartWed = computeMoveShowUpWeek({
  weekKeys: week,
  todayKey: "2026-11-06",
  completedMoveDays: new Set(),
  allowGrace: true,
  startDay: "2026-11-04",
});
assert.equal(friStartWed.days[0].status, "beforeStart"); // Mon
assert.equal(friStartWed.days[1].status, "beforeStart"); // Tue
assert.equal(friStartWed.days[2].status, "grace"); // Wed
assert.equal(friStartWed.days[3].status, "missed"); // Thu
assert.equal(friStartWed.days[4].status, "empty"); // Fri
assert.equal(friStartWed.hadMiss, true);
assert.equal(friStartWed.usedGrace, true);

// #133 case unchanged when startDay on/before Monday
const case133 = computeMoveShowUpWeek({
  weekKeys: week,
  todayKey: "2026-11-06",
  completedMoveDays: new Set(["2026-11-02", "2026-11-04"]),
  allowGrace: true,
  startDay: "2026-11-02",
});
assert.equal(case133.days[0].status, "filled");
assert.equal(case133.days[1].status, "grace");
assert.equal(case133.days[2].status, "filled");
assert.equal(case133.days[3].status, "missed");
assert.equal(case133.days[4].status, "empty");
assert.equal(case133.hadMiss, true);

const case133BeforeMon = computeMoveShowUpWeek({
  weekKeys: week,
  todayKey: "2026-11-06",
  completedMoveDays: new Set(["2026-11-02", "2026-11-04"]),
  allowGrace: true,
  startDay: "2026-10-01",
});
assert.equal(case133BeforeMon.days[0].status, "filled");
assert.equal(case133BeforeMon.days[1].status, "grace");
assert.equal(case133BeforeMon.days[2].status, "filled");
assert.equal(case133BeforeMon.days[3].status, "missed");
assert.equal(case133BeforeMon.days[4].status, "empty");

// Helper: created_at + TZ → startDay
assert.equal(
  showUpStartDayFromCreatedAt("2026-11-19T10:00:00.000Z", "Asia/Hong_Kong"),
  "2026-11-19",
);
assert.equal(
  showUpStartDayFromCreatedAt("2026-11-18T16:30:00.000Z", "Asia/Hong_Kong"),
  "2026-11-19",
  "UTC evening can be next calendar day in HKT",
);
assert.equal(showUpStartDayFromCreatedAt(null, "Asia/Hong_Kong"), undefined);
assert.equal(showUpStartDayFromCreatedAt("", "Asia/Hong_Kong"), undefined);
assert.equal(showUpStartDayFromCreatedAt("not-a-date", "Asia/Hong_Kong"), undefined);
assert.equal(typeof dayKeyInZone, "function");

// Filled Move on a beforeStart calendar day may still be filled
const earlyFill = computeMoveShowUpWeek({
  weekKeys: thuWeek,
  todayKey: "2026-11-19",
  completedMoveDays: new Set(["2026-11-17"]),
  allowGrace: true,
  startDay: "2026-11-19",
});
assert.equal(earlyFill.days[1].status, "filled"); // Tue filled despite before start
assert.equal(earlyFill.days[0].status, "beforeStart");
assert.equal(earlyFill.hadMiss, false);

// Shared any-today-move:* predicate (single definition in protocolCompletions)
assert.equal(isLifestyleMoveItemId("today-move"), true);
assert.equal(isLifestyleMoveItemId("today-move:surplus"), true);
assert.equal(isLifestyleMoveItemId("today-move:quiet_sky"), true);
assert.equal(isLifestyleMoveItemId("today-kit:mag"), false);
assert.equal(isLifestyleMoveItemId("today-evening-close"), false);
assert.equal(isLifestyleMoveItemId("baseline"), false);
assert.equal(isLifestyleMoveItemId("morning"), false);

assert.equal(
  dayHasDoneLifestyleMove({
    "today-move:surplus": { done: true, label: "Surplus day", kind: "move" },
  }),
  true,
);
assert.equal(
  dayHasDoneLifestyleMove({
    "today-move:quiet_sky": { done: false, label: "Quiet sky", kind: "move" },
  }),
  false,
  "done=false seed does not count",
);
assert.equal(
  dayHasDoneLifestyleMove({
    "today-kit:mag": { done: true, label: "Mag", kind: "kit" },
    "today-evening-close": { done: true, label: "Evening", kind: "evening" },
  }),
  false,
  "kit and evening do not count as Move",
);

// Pure any-today-move:* rule: different done ids on earlier days fill; seeds/kit/evening do not
const mapsByDay = {
  "2026-11-02": {
    "today-move:surplus": { done: true, label: "Surplus Monday", kind: "move" },
  },
  "2026-11-03": {
    "today-move:quiet_sky": { done: false, label: "Offered seed", kind: "move" },
  },
  "2026-11-04": {
    "today-move:focus": { done: true, label: "Focus Wednesday", kind: "move" },
    "today-kit:mag": { done: true, label: "Mag", kind: "kit" },
  },
  "2026-11-05": {
    "today-evening-close": { done: true, label: "Yes", kind: "evening" },
  },
  "2026-11-06": {
    "today-move:bridge": { done: false, label: "Today offered", kind: "move" },
  },
};
const filledFromAnyRule = new Set(
  week.filter((day) => dayHasDoneLifestyleMove(mapsByDay[day] || {})),
);
assert.ok(filledFromAnyRule.has("2026-11-02"), "Mon surplus fills under a different today id");
assert.ok(filledFromAnyRule.has("2026-11-04"), "Wed focus fills under a different today id");
assert.ok(!filledFromAnyRule.has("2026-11-03"), "done=false seed does not fill");
assert.ok(!filledFromAnyRule.has("2026-11-05"), "evening-only day does not fill");
assert.ok(!filledFromAnyRule.has("2026-11-06"), "today done=false does not fill");
const painted = computeMoveShowUpWeek({
  weekKeys: week,
  todayKey: "2026-11-06",
  completedMoveDays: filledFromAnyRule,
  allowGrace: true,
});
assert.equal(painted.days[0].status, "filled");
assert.equal(painted.days[2].status, "filled");
assert.equal(typeof loadMoveCompletedDaysInWeek, "function");

const memoryFilled = readShowUpDayMemory({
  "today-move:zulu": { done: true, label: "Zulu move", kind: "move" },
  "today-move:alpha": { done: true, label: "Alpha move", kind: "move" },
  "today-evening-close": { done: true, label: "Generator|yes", kind: "evening" },
  "today-kit:mag": { done: true, label: "Mag", kind: "kit" },
});
assert.equal(memoryFilled.moveLabel, "Alpha move", "stable item_id order picks first Move");
assert.equal(memoryFilled.eveningNoted, true);
assert.doesNotMatch(memoryFilled.moveLabel || "", /Generator\|yes/);

const memoryMiss = readShowUpDayMemory({
  "today-move:quiet": { done: false, label: "Quiet", kind: "move" },
});
assert.equal(memoryMiss.moveLabel, null);
assert.equal(memoryMiss.eveningNoted, false);

const todayInd = read("src/components/TodayIndication.tsx");
const completionsSrc = read("src/lib/protocolCompletions.ts");
const historySrc = read("src/lib/earlierWeeksHistory.ts");

assert.match(todayInd, /data-testid="today-show-up"/);
assert.match(todayInd, /data-testid="today-show-up-dots"/);
assert.match(todayInd, /data-testid="today-show-up-kind"/);
assert.match(todayInd, /computeMoveShowUpWeek/);
assert.match(todayInd, /loadMoveCompletedDaysInWeek/);
assert.match(todayInd, /weekDayKeysInZone/);
assert.match(todayInd, /readShowUpDayMemory/);

const moveIdx = todayInd.indexOf('data-testid="main-action"');
const showIdx = todayInd.indexOf('data-testid="today-show-up"');
assert.ok(showIdx > moveIdx, "show-up under Move hero");

// Live Move tick still uses today's move_item_id; Show-up loader does not take moveItemId
assert.match(todayInd, /move_item_id \|\| "today-move"/);
const showCallStart = todayInd.indexOf("loadMoveCompletedDaysInWeek({");
assert.ok(showCallStart > 0, "loader call exists");
const showCall = todayInd.slice(showCallStart, showCallStart + 280);
assert.doesNotMatch(showCall, /moveItemId/);
assert.doesNotMatch(showCall, /move_item_id/);
assert.match(completionsSrc, /dayHasDoneLifestyleMove\(map\)/);
assert.doesNotMatch(
  completionsSrc.slice(
    completionsSrc.indexOf("export function loadMoveCompletedDaysInWeek"),
    completionsSrc.indexOf("export function loadMoveCompletedDaysInWeek") + 500,
  ),
  /moveItemId/,
);

assert.doesNotMatch(
  todayInd.slice(showIdx, showIdx + 2200),
  /kitId|today-kit/
);

// Missed styling must not use warning/danger tokens
const showBlock = todayInd.slice(Math.max(0, showIdx - 1200), showIdx + 4200);
assert.doesNotMatch(showBlock, /--danger|text-danger|bg-danger|border-danger|text-red-|bg-red-|border-red-/);
assert.match(showBlock, /bg-fg-muted\/30/);
assert.match(todayInd, /data-status=\{d\.status\}/);
assert.match(completionsSrc, /status: "missed"/);

// Kind copy after miss; no streak shame
assert.match(todayInd, /today\.showUpStill/);
assert.doesNotMatch(todayInd, /broke your streak|freeze-out|fire/i);
assert.doesNotMatch(todayInd, /streakCount|streak-count|numeric streak/i);

// Memory disclosure UI
assert.match(todayInd, /data-testid=\{`today-show-up-open-\$\{d\.day\}`\}/);
assert.match(todayInd, /data-testid="today-show-up-memory"/);
assert.match(todayInd, /data-testid="today-show-up-memory-move"/);
assert.match(todayInd, /data-testid="today-show-up-memory-evening"/);
assert.match(todayInd, /data-testid="today-show-up-memory-close"/);
assert.match(todayInd, /min-h-11 min-w-11/);
assert.match(todayInd, /aria-expanded=\{expanded\}/);
assert.match(todayInd, /aria-controls="today-show-up-memory"/);
assert.match(todayInd, /literacy\.chrome\.close/);
assert.match(todayInd, /today\.showUpMemory\.eveningNoted/);
// Today / future are not disclosure openers — open buttons only on past days
assert.match(todayInd, /isPastShowUpDay/);
assert.match(todayInd, /day < dayKey/);
assert.doesNotMatch(todayInd, /today-show-up-open-\$\{dayKey\}/);

// history link under Show-up, 44px target
assert.match(todayInd, /data-testid="today-history-link"/);
const linkIdx = todayInd.indexOf('data-testid="today-history-link"');
assert.ok(linkIdx > showIdx, "history link after show-up");
const linkSlice = todayInd.slice(linkIdx - 180, linkIdx + 220);
assert.match(linkSlice, /min-h-11/);

// Move remains tappable regardless of week
assert.match(todayInd, /data-testid="today-move-done"/);

// Single shared predicate — hoisted + re-exported
assert.match(completionsSrc, /export function isLifestyleMoveItemId/);
assert.match(historySrc, /export \{ isLifestyleMoveItemId \}/);
assert.match(historySrc, /isLifestyleMoveItemId\(id\)/);
assert.doesNotMatch(
  historySrc,
  /function isLifestyleMoveItemId/,
  "history must not keep a forked predicate body",
);

const en = read("src/lib/i18n/messages/en.ts");
assert.match(en, /today\.showUpLabel/);
assert.match(en, /Still showing up/);
assert.match(en, /Evening close: noted\./);
assert.doesNotMatch(en, /broke your streak/i);
const locales = ["en", "de", "es", "fr", "nl"].map((id) => ({
  id,
  src: read(`src/lib/i18n/messages/${id}.ts`),
}));
for (const loc of locales) {
  assert.match(loc.src, /today\.showUpMemory\.eveningNoted/);
}
const enEvening = en.match(/today\.showUpMemory\.eveningNoted': '([^']+)'/)?.[1];
assert.equal(enEvening, "Evening close: noted.");
for (const loc of locales.filter((l) => l.id !== "en")) {
  const m = loc.src.match(/today\.showUpMemory\.eveningNoted': '([^']+)'/);
  assert.ok(m, `${loc.id} has eveningNoted`);
  assert.notEqual(m[1], "Evening close: noted.", `${loc.id} is not an English copy`);
}

// Preferred TZ week keys (not novelty HKT retarget)
const ny = weekDayKeysInZone("America/New_York", new Date("2026-11-06T04:00:00.000Z"));
const hkt = weekDayKeysInZone(DEFAULT_PROTOCOLS_TZ, new Date("2026-11-06T04:00:00.000Z"));
assert.equal(ny.length, 7);
assert.equal(hkt.length, 7);

// beforeStart is not a disclosure opener; caption still gated on hadMiss only
assert.match(completionsSrc, /"beforeStart"/);
assert.match(completionsSrc, /showUpStartDayFromCreatedAt/);
assert.match(todayInd, /showUpStartDayFromCreatedAt/);
assert.match(todayInd, /startDay/);
assert.match(todayInd, /beforeStart/);
assert.match(todayInd, /status === "future" \|\| status === "beforeStart"/);
assert.doesNotMatch(
  todayInd.slice(
    todayInd.indexOf("const isPastShowUpDay"),
    todayInd.indexOf("const isPastShowUpDay") + 280,
  ),
  /beforeStart/,
  "beforeStart must not be treated as a past tappable memory day",
);
// Caption still only when hadMiss; wording key unchanged
assert.match(todayInd, /\{hadMiss \? \(/);
assert.match(todayInd, /today\.showUpStill/);
assert.doesNotMatch(todayInd, /today\.eveningClose\.label\s*=/);

const localesShowUp = ["en", "de", "es", "fr", "nl"].map((id) => ({
  id,
  src: read(`src/lib/i18n/messages/${id}.ts`),
}));
const enShowUpStill = localesShowUp[0].src.match(/today\.showUpStill': '([^']+)'/)?.[1];
assert.equal(enShowUpStill, "Still showing up — one quiet day is fine.");
for (const loc of localesShowUp) {
  assert.match(loc.src, /today\.showUpStill/);
}

console.log("assert-kind-show-up PASS");
