/**
 * Pure-function checks for protocolCompletions (no browser).
 * Run: npx tsx scripts/assert-protocol-completions.mjs
 */
import assert from "node:assert/strict";

const mod = await import("../src/lib/protocolCompletions.ts");

const {
  hkDayKey,
  hkWeekDayKeys,
  dayKeyInZone,
  weekDayKeysInZone,
  weekRangeLabel,
  parseDayCompletions,
  toggleCompletion,
  setCompletionNote,
  doneMapFromCompletions,
  progressPct,
  formatWeekDayLabel,
  resolveProtocolsTz,
  DEFAULT_PROTOCOLS_TZ,
} = mod;

// Fixed instant: 2026-10-27 12:00 HKT = 2026-10-27 04:00 UTC (Tue)
const tue = new Date("2026-10-27T04:00:00.000Z");
assert.equal(hkDayKey(tue), "2026-10-27");
assert.equal(dayKeyInZone(DEFAULT_PROTOCOLS_TZ, tue), "2026-10-27");
const week = hkWeekDayKeys(tue);
assert.deepEqual(week, [
  "2026-10-26",
  "2026-10-27",
  "2026-10-28",
  "2026-10-29",
  "2026-10-30",
  "2026-10-31",
  "2026-11-01",
]);

// Sunday → previous Monday
const sun = new Date("2026-11-01T04:00:00.000Z");
assert.equal(hkWeekDayKeys(sun)[0], "2026-10-26");
assert.equal(hkWeekDayKeys(sun)[6], "2026-11-01");

// Non-HKT: America/New_York — 2026-10-27 02:30 UTC = still Mon 26 evening EDT (UTC-4)
const nyEvening = new Date("2026-10-27T02:30:00.000Z");
assert.equal(dayKeyInZone("America/New_York", nyEvening), "2026-10-26");
assert.equal(dayKeyInZone("Asia/Hong_Kong", nyEvening), "2026-10-27");
const nyWeek = weekDayKeysInZone("America/New_York", nyEvening);
assert.equal(nyWeek[0], "2026-10-26"); // Monday of that week
assert.equal(nyWeek.length, 7);

// Empty / null TZ falls back to HKT
assert.equal(resolveProtocolsTz(null), DEFAULT_PROTOCOLS_TZ);
assert.equal(resolveProtocolsTz(""), DEFAULT_PROTOCOLS_TZ);
assert.equal(weekRangeLabel(null), "Mon–Sun HKT");
assert.equal(weekRangeLabel("America/New_York"), "Mon–Sun · America/New_York");
assert.notEqual(weekRangeLabel("America/New_York"), "Mon–Sun HKT");

// v1 boolean migrate parse
const v1 = parseDayCompletions(JSON.stringify({ hero: true, morning: false }));
assert.equal(v1.hero.done, true);
assert.equal(v1.hero.kind, "move");
assert.equal(v1.morning.done, false);

// v2 wrap
const v2 = parseDayCompletions(
  JSON.stringify({
    items: {
      "baseline:0": { done: true, label: "Daylight + short walk", kind: "baseline", note: "park" },
    },
  })
);
assert.equal(v2["baseline:0"].kind, "baseline");
assert.equal(v2["baseline:0"].note, "park");

let map = {};
map = toggleCompletion(map, "hero", { label: "Main move", kind: "move" });
assert.equal(map.hero.done, true);
assert.equal(map.hero.label, "Main move");
map = setCompletionNote(map, "hero", "  felt calm  ");
assert.equal(map.hero.note, "felt calm");
map = toggleCompletion(map, "hero", { label: "Main move", kind: "move" });
assert.equal(map.hero.done, false);
assert.equal(map.hero.note, undefined);

assert.deepEqual(doneMapFromCompletions({ a: { done: true, label: "A", kind: "move" }, b: { done: false, label: "B", kind: "move" } }), { a: true });
assert.equal(progressPct(2, 4), 50);
assert.equal(progressPct(0, 0), 0);
assert.ok(formatWeekDayLabel("2026-10-27").includes("27"));

console.log("PASS assert-protocol-completions");
