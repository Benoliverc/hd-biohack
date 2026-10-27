/**
 * Pure-function checks for protocolCompletions (no browser).
 * Run: npx tsx scripts/assert-protocol-completions.mjs
 */
import assert from "node:assert/strict";

// Inline minimal re-implementations mirrored from the module for node assert,
// then import the real TS via dynamic path after transpile isn't available —
// instead we duplicate the pure helpers we care about by importing compiled? 
// Use tsx to import TS directly.
const mod = await import("../src/lib/protocolCompletions.ts");

const {
  hkDayKey,
  hkWeekDayKeys,
  parseDayCompletions,
  toggleCompletion,
  setCompletionNote,
  doneMapFromCompletions,
  progressPct,
  formatWeekDayLabel,
} = mod;

// Fixed instant: 2026-10-27 12:00 HKT = 2026-10-27 04:00 UTC (Tue)
const tue = new Date("2026-10-27T04:00:00.000Z");
assert.equal(hkDayKey(tue), "2026-10-27");
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
