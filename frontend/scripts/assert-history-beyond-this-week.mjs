/**
 * History beyond this week — source ACs (FE).
 * Run: npx tsx scripts/assert-history-beyond-this-week.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const {
  priorHistoryRange,
  priorWeekKeysInZone,
  filterHistoryRows,
  groupHistoryByWeek,
  isLifestyleMoveItemId,
  isTodayKitItemId,
} = await import("../src/lib/earlierWeeksHistory.ts");
const { parseEveningCloseLabel } = await import("../src/lib/eveningSignatureClose.ts");
const { DEFAULT_PROTOCOLS_TZ, weekDayKeysInZone } = await import(
  "../src/lib/protocolCompletions.ts"
);

const todayInd = read("src/components/TodayIndication.tsx");
const biohack = read("src/app/biohack/page.tsx");
const helper = read("src/lib/earlierWeeksHistory.ts");
const ui = read("src/components/EarlierWeeksHistory.tsx");
const completions = read("src/lib/protocolCompletions.ts");
const pkg = read("package.json");
const en = read("src/lib/i18n/messages/en.ts");
const locales = ["en", "nl", "de", "fr", "es"].map((id) => ({
  id,
  src: read(`src/lib/i18n/messages/${id}.ts`),
}));

// --- Wired ---
assert.ok(
  pkg.includes(
    '"assert:history-beyond-this-week": "npx tsx scripts/assert-history-beyond-this-week.mjs"',
  ),
  "package.json wires assert:history-beyond-this-week",
);

// --- Bounded window: three weeks before the current Mon–Sun ---
const now = new Date("2026-11-11T04:00:00.000Z"); // Wed 11 Nov 2026 12:00 HKT
const current = weekDayKeysInZone(DEFAULT_PROTOCOLS_TZ, now);
assert.deepEqual(current, [
  "2026-11-09",
  "2026-11-10",
  "2026-11-11",
  "2026-11-12",
  "2026-11-13",
  "2026-11-14",
  "2026-11-15",
]);
const range = priorHistoryRange(DEFAULT_PROTOCOLS_TZ, now);
assert.equal(range.from, "2026-10-19");
assert.equal(range.to, "2026-11-08");
assert.equal(range.weeks.length, 3);
assert.deepEqual(range.weeks[0], [
  "2026-10-19",
  "2026-10-20",
  "2026-10-21",
  "2026-10-22",
  "2026-10-23",
  "2026-10-24",
  "2026-10-25",
]);
assert.deepEqual(range.weeks[2][0], "2026-11-02");
assert.deepEqual(range.weeks[2][6], "2026-11-08");
assert.ok(!range.weeks.flat().includes("2026-11-09"), "window excludes current week");
assert.ok(
  priorWeekKeysInZone(DEFAULT_PROTOCOLS_TZ, now).flat().length === 21,
  "three full weeks",
);

// Mon 9 Nov 12:00 HKT is still Sun 8 Nov in New York — different current weeks.
const boundary = new Date("2026-11-09T04:00:00.000Z");
const ny = priorHistoryRange("America/New_York", boundary);
const hkt = priorHistoryRange(DEFAULT_PROTOCOLS_TZ, boundary);
assert.deepEqual(hkt, priorHistoryRange(DEFAULT_PROTOCOLS_TZ, now));
assert.equal(ny.to, "2026-11-01");
assert.notEqual(
  `${ny.from}:${ny.to}`,
  `${hkt.from}:${hkt.to}`,
  "history window follows account TZ, not a fixed HKT key",
);
assert.match(helper, /weekDayKeysInZone/);
assert.doesNotMatch(helper, /hkDayKey|formatResetsInHkt/);
assert.doesNotMatch(helper, /from "@\/lib\/timezone"/);
assert.doesNotMatch(ui, /loadMoveCompletedDaysInWeek/);
assert.doesNotMatch(helper, /loadMoveCompletedDaysInWeek/);

// --- Filter: done only; Today vs Protocols kinds; any today-move:* ---
assert.equal(isLifestyleMoveItemId("today-move:calm"), true);
assert.equal(isLifestyleMoveItemId("today-move:focus"), true);
assert.equal(isLifestyleMoveItemId("morning"), false);
assert.equal(isTodayKitItemId("today-kit:magnesium"), true);

const sample = [
  { item_id: "today-move:calm", day: "2026-11-03", kind: "move", label: "Walk", done: true, note: "easy" },
  { item_id: "today-move:focus", day: "2026-11-04", kind: "move", label: "Offered", done: false },
  { item_id: "today-kit:mag", day: "2026-11-03", kind: "move", label: "Magnesium", done: true },
  { item_id: "today-kit:theanine", day: "2026-11-03", kind: "kit", label: "L-Theanine", done: true },
  { item_id: "today-evening-close", day: "2026-11-03", kind: "evening", label: "Generator|yes", done: true, note: "good" },
  { item_id: "morning", day: "2026-11-03", kind: "move", label: "Morning lead", done: true },
  { item_id: "baseline:0", day: "2026-11-03", kind: "baseline", label: "Vitamin D", done: true },
  { item_id: "today-move:recovery", day: "2026-10-10", kind: "move", label: "Old", done: true },
];

const todayRows = filterHistoryRows(sample, {
  scope: "today",
  includeEveningClose: true,
  from: "2026-10-19",
  to: "2026-11-08",
});
assert.deepEqual(
  todayRows.map((r) => r.id).sort(),
  ["today-evening-close", "today-move:calm"],
);
assert.ok(!todayRows.some((r) => r.id.startsWith("today-kit:")), "Today history excludes today-kit rows");
assert.ok(!todayRows.some((r) => r.kind === "kit"), "Today history excludes kind kit");
assert.ok(!todayRows.some((r) => r.id === "morning" || r.id === "baseline:0"));
assert.ok(!todayRows.some((r) => r.id === "today-move:focus"), "drops auto-seeded done=false");
assert.ok(!todayRows.some((r) => r.day === "2026-10-10"), "drops rows outside from/to");

const todayNoEvening = filterHistoryRows(sample, {
  scope: "today",
  includeEveningClose: false,
  from: "2026-10-19",
  to: "2026-11-08",
});
assert.ok(!todayNoEvening.some((r) => r.id === "today-evening-close"));

const protocolRows = filterHistoryRows(sample, {
  scope: "protocols",
  from: "2026-10-19",
  to: "2026-11-08",
});
assert.ok(protocolRows.some((r) => r.id === "morning"));
assert.ok(protocolRows.some((r) => r.id === "baseline:0"));
assert.ok(protocolRows.some((r) => r.id === "today-move:calm"));
assert.ok(!protocolRows.some((r) => r.done === false || r.id === "today-move:focus"));
assert.ok(protocolRows.some((r) => r.id === "today-kit:mag"), "Protocols history may include legacy today-kit rows");
assert.ok(protocolRows.some((r) => r.id === "today-kit:theanine" && r.kind === "kit"), "Protocols history may include kind kit");
assert.ok(
  protocolRows.filter((r) => r.id.startsWith("today-kit:")).every((r) => r.kind === "kit"),
  "today-kit rows are kind kit, not lifestyle Moves",
);
assert.equal(isLifestyleMoveItemId("today-kit:mag"), false);
assert.equal(isLifestyleMoveItemId("today-kit:theanine"), false);

// Past Moves must accept any today-move:* — not only today's moment id
assert.ok(todayRows.some((r) => r.id === "today-move:calm"));

// --- Grouping: newest week first; no invented empty weeks/days ---
const grouped = groupHistoryByWeek([
  { id: "today-move:calm", day: "2026-11-03", kind: "move", label: "Walk" },
  { id: "today-kit:mag", day: "2026-11-03", kind: "move", label: "Magnesium" },
  { id: "today-move:focus", day: "2026-10-21", kind: "move", label: "Focus walk" },
]);
assert.equal(grouped.length, 2, "only weeks with a done row");
assert.equal(grouped[0].weekStart, "2026-11-02", "newest week first");
assert.equal(grouped[1].weekStart, "2026-10-19");
assert.deepEqual(
  grouped[0].days.map((d) => d.day),
  ["2026-11-03"],
);
assert.ok(
  !grouped.some((w) => w.days.some((d) => d.items.length === 0)),
  "no invented missed days",
);
assert.ok(
  !grouped.some((w) => w.weekStart === "2026-10-26"),
  "does not invent the empty middle week",
);

// --- Evening close is decoded, never raw Type|answer ---
const parsed = parseEveningCloseLabel("Generator|yes");
assert.equal(parsed?.answer, "yes");
assert.equal(parseEveningCloseLabel("Projector|rest")?.answer, "rest");
assert.match(ui, /parseEveningCloseLabel/);
assert.match(ui, /today\.eveningClose\.label/);
assert.match(ui, /today\.eveningClose\.yes/);
assert.match(ui, /today\.eveningClose\.no/);
assert.match(ui, /today\.eveningClose\.recognized/);
assert.match(ui, /today\.eveningClose\.rest/);
assert.doesNotMatch(ui, /Generator\|yes/);
assert.match(ui, /item\.kind === "baseline"/);

// --- Fetch is the existing bounded list endpoint ---
assert.match(ui, /api\.listProtocolCompletions/);
assert.match(ui, /from:\s*range\.from/);
assert.match(ui, /to:\s*range\.to/);
assert.equal(
  [...ui.matchAll(/listProtocolCompletions\(/g)].length,
  1,
  "history uses one completions list call",
);
assert.doesNotMatch(helper + ui, /unpaginated|all-time|allTime/);
assert.match(ui, /priorHistoryRange/);
assert.doesNotMatch(ui, /loadMoveCompletedDaysInWeek/);

// This week's Show-up hydration is unchanged (current week only)
assert.match(todayInd, /loadMoveCompletedDaysInWeek/);
assert.match(todayInd, /computeMoveShowUpWeek/);
assert.match(todayInd, /const from = weekKeys\[0\]/);
assert.match(todayInd, /listProtocolCompletions\(userId, chartId, \{ from, to \}\)/);
assert.match(todayInd, /listProtocolCompletions\(userId, chartId, \{ day: dayKey \}\)/);

// --- Today placement ---
assert.match(todayInd, /data-testid="today-history-link"/);
assert.match(todayInd, /testId="today-history"/);
assert.match(todayInd, /historyRef\.current\?\.scrollIntoView/);
assert.match(todayInd, /setHistoryOpen\(true\)/);

const showIdx = todayInd.indexOf('data-testid="today-show-up"');
const linkIdx = todayInd.indexOf('data-testid="today-history-link"');
const setupIdx = todayInd.indexOf('data-testid="today-kit-setup"');
const whenIdx = todayInd.indexOf('data-testid="today-when"');
const whyIdx = todayInd.indexOf('data-testid="main-action-why-details"');
const eveningIdx = todayInd.indexOf('data-testid="today-evening-close"');
const historyIdx = todayInd.indexOf('testId="today-history"');
const skyIdx = todayInd.indexOf('data-testid="today-sky-block"');
assert.ok(showIdx > 0 && linkIdx > showIdx, "link sits on the Show-up row");
assert.ok(setupIdx > linkIdx, "link stays in Show-up, before kit/setup");
assert.ok(whenIdx > linkIdx && whyIdx > linkIdx, "link is not in When / Why");
assert.ok(historyIdx > eveningIdx, "today-history after Evening Close");
assert.ok(skyIdx > historyIdx, "today-history before the sky block");
const caveatIdx = todayInd.indexOf('data-testid="today-time-unknown-caveat"');
if (caveatIdx >= 0) {
  assert.ok(historyIdx > caveatIdx, "today-history after the item 9 caveat slot");
}
const heroStart = todayInd.indexOf('data-testid="main-action"');
const heroEnd = whenIdx > 0 ? whenIdx : eveningIdx;
const hero = todayInd.slice(heroStart, heroEnd);
assert.ok(hero.includes('data-testid="today-history-link"'), "link is in the Move hero");
assert.ok(!hero.includes('testId="today-history"'), "review is not inside the Move hero");
assert.match(todayInd, /includeEveningClose=\{Boolean\(normalizeHdType\(natalType\)\)\}/);
assert.match(todayInd, /scope="today"/);

// --- Protocols placement ---
const weekFnStart = biohack.indexOf("function WeekSkyCard");
const weekFnEnd = biohack.indexOf("function NatalBaselineCard");
const weekFn = biohack.slice(weekFnStart, weekFnEnd);
assert.ok(weekFn.includes('data-testid="week-completed"'), "Completed this week remains");
assert.ok(weekFn.includes('testId="week-history"'), "week-history under Completed this week");
assert.ok(
  weekFn.indexOf('testId="week-history"') > weekFn.indexOf('data-testid="week-completed"'),
  "earlier weeks sit under this week",
);
assert.ok(
  weekFn.indexOf('testId="week-history"') > weekFn.indexOf("Completed this week"),
  "does not replace Completed this week",
);
assert.match(weekFn, /scope="protocols"/);
assert.match(biohack, /userId=\{user\?\.id \?\? null\}/);
assert.match(biohack, /chartId=\{youChart\?\.id \?\? null\}/);
const callIdx = biohack.indexOf("<WeekSkyCard");
const natalCallIdx = biohack.indexOf("<NatalBaselineCard");
const shelfIdx = biohack.indexOf('data-testid="shelf-disclosure"');
assert.ok(callIdx > shelfIdx, "history is not above the Shelf");
assert.ok(natalCallIdx > callIdx, "WeekSkyCard stays above Natal baseline");

// --- Copy, empty, retry ---
for (const { id, src } of locales) {
  assert.match(src, /'history\.earlierWeeks': 'Earlier weeks'/);
  assert.match(src, /'history\.empty': 'Nothing earlier than this week yet\.'/);
  assert.match(src, /'history\.waiting': 'Looking up earlier weeks\u2026'/);
  assert.match(src, /'history\.error': 'Couldn\u2019t load earlier weeks\.'/);
  assert.match(src, /'history\.retry': 'Try again'/);
  assert.ok(!/history\.error.*Couldn't load/.test(src) || src.includes("Couldn\u2019t"), `${id} typographic apostrophe`);
}
assert.match(ui, /history\.earlierWeeks/);
assert.match(ui, /history\.empty/);
assert.match(ui, /history\.waiting/);
assert.match(ui, /history\.error/);
assert.match(ui, /history\.retry/);
assert.match(ui, /\$\{testId\}-empty/);
assert.match(ui, /\$\{testId\}-wait/);
assert.match(ui, /\$\{testId\}-error/);
assert.match(ui, /\$\{testId\}-retry/);
assert.doesNotMatch(en, /you missed|broke your streak|shame/i);
assert.doesNotMatch(ui, /you missed|broke your streak/i);

// --- Entitlement / leave-alones ---
assert.doesNotMatch(ui, /previewAsFree|biohackingUnlocked|tier\.pro|isPro/);
assert.doesNotMatch(helper, /intention|WeeklyProtocol|biometric|usage_events/);
assert.ok(!todayInd.includes("today.historyLink") || todayInd.includes("history.earlierWeeks"));

// Link is a quiet text control, not a primary CTA
const linkBlock = todayInd.slice(linkIdx - 80, linkIdx + 600);
assert.match(linkBlock, /type-caption text-fg-secondary/);
assert.doesNotMatch(linkBlock, /bg-growth/);

console.log("assert-history-beyond-this-week PASS");
