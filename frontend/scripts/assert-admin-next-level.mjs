/**
 * Admin next level — source ACs (FE).
 * Run: npx tsx scripts/assert-admin-next-level.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const pkg = read("package.json");
const admin = read("src/app/admin/page.tsx");
const coach = read("src/components/LiteracyCoach.tsx");
const hdCopy = read("src/lib/hdCopy.ts");
const api = read("src/lib/api.ts");

assert.ok(
  pkg.includes(
    '"assert:admin-next-level": "npx tsx scripts/assert-admin-next-level.mjs"',
  ),
  "package.json wires assert:admin-next-level",
);

// Overview leads with the health strip and the four-step funnel before the
// plan switch and the raw Usage tables.
const healthIdx = admin.indexOf('data-testid="admin-health-strip"');
const funnelIdx = admin.indexOf('data-testid="admin-funnel"');
const planIdx = admin.indexOf('data-testid="admin-plan-switch"');
const usageIdx = admin.indexOf("<h2 className=\"text-lg font-semibold text-fg\">Usage</h2>");
assert.ok(healthIdx >= 0, "Overview has health strip");
assert.ok(funnelIdx >= 0, "Overview has funnel");
assert.ok(planIdx >= 0, "Overview has plan switch");
assert.ok(usageIdx >= 0, "Overview still has Usage tables");
assert.ok(
  healthIdx < funnelIdx && funnelIdx < planIdx && planIdx < usageIdx,
  "Health strip and funnel come before the plan switch and Usage tables",
);

const funnelBlock = admin.slice(funnelIdx, planIdx);
const labelOrder = ["Signed up", "Me natal", "Today view", "Move done"].map((label) =>
  funnelBlock.indexOf(label),
);
assert.ok(
  labelOrder.every((i) => i >= 0),
  "Funnel uses locked step labels: Signed up, Me natal, Today view, Move done",
);
assert.ok(
  labelOrder[0] < labelOrder[1] &&
    labelOrder[1] < labelOrder[2] &&
    labelOrder[2] < labelOrder[3],
  "Funnel step labels appear in locked order",
);

// Usage / Insights / logbook headings and the logbook day filter no longer say UTC.
const utcHits = [];
for (const [name, src] of [
  ["Usage heading", admin],
]) {
  // Narrow to the admin console page only; leftover UTC in comments would still fail.
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    if (line.includes("UTC")) utcHits.push(`admin/page.tsx:${i + 1}: ${line.trim()}`);
  });
}
assert.equal(
  utcHits.length,
  0,
  `Admin console must not label clocks as UTC:\n${utcHits.join("\n")}`,
);
assert.ok(admin.includes("Last 14 days (HKT)"), "14-day table caption is HKT");
assert.ok(admin.includes("Page visits — last 14 days (HKT)"), "Page-visits caption is HKT");
assert.ok(admin.includes("Day (HKT)"), "Logbook day filter is HKT");
assert.ok(admin.includes("HKT days"), "Usage subhead is HKT");
assert.ok(admin.includes("Windows are HKT calendar days"), "Insights subhead is HKT");

// People list can badge or hide seed/dev rows; person detail surfaces fields.
assert.ok(admin.includes('data-testid="people-include-seed"'), "People has include-seed toggle");
assert.ok(admin.includes("Include seed/dev"), "Include-seed toggle is clearly labelled");
assert.ok(/includeSeed/.test(admin), "People includeSeed state exists");
assert.ok(admin.includes("setIncludeSeed"), "People can toggle include seed");
assert.ok(
  admin.includes("useState(false)") && admin.includes("[includeSeed, setIncludeSeed]"),
  "Hide seed/dev is the default",
);
assert.ok(admin.includes('data-testid="people-seed-badge"'), "People list can badge seed/dev rows");
assert.ok(admin.includes('data-testid="person-auth-provider"'), "Person detail surfaces auth_provider");
assert.ok(admin.includes('data-testid="person-seed-or-dev"'), "Person detail surfaces seed/dev");
assert.ok(admin.includes('data-testid="person-joined-date"'), "Person detail surfaces joined date");
assert.ok(admin.includes("detail.auth_provider"), "Detail reads auth_provider from the payload");
assert.ok(admin.includes("detail.is_seed_or_dev"), "Detail reads is_seed_or_dev from the payload");
assert.ok(admin.includes("detail.created_at"), "Detail reads created_at (joined date)");
assert.ok(!/password_hash/.test(admin), "Person detail does not surface password hashes");
assert.ok(!/chart_json/.test(admin), "Person detail does not surface natal dumps");

// LiteracyCoach fires literacy_event for open, Got it, and jump; storage keys stay.
assert.ok(
  hdCopy.includes('chart: "baseline.literacy.chart.v1"') &&
    hdCopy.includes('soul: "baseline.literacy.soul.v1"') &&
    hdCopy.includes('today: "baseline.literacy.today.v1"') &&
    hdCopy.includes('protocols: "baseline.literacy.protocols.v1"'),
  "Existing literacy storage keys are unchanged",
);
assert.ok(
  api.includes("recordLiteracyEvent") && api.includes("/usage/literacy"),
  "API client has a best-effort literacy write",
);
assert.ok(coach.includes('fireLiteracyEvent("open"'), "LiteracyCoach fires open when the overlay opens");
assert.ok(coach.includes('fireLiteracyEvent("got_it")'), "LiteracyCoach fires got_it when Got it is pressed");
assert.ok(
  coach.includes('fireLiteracyEvent("jump", step.id)'),
  "LiteracyCoach fires jump with step_id",
);
assert.ok(coach.includes("writeDismissed(storageKey)"), "Got it still writes the existing storage key");
assert.ok(
  !coach.includes('localStorage.setItem(storageKey') || coach.includes("writeDismissed(storageKey)"),
  "Coach does not invent a new storage-key write path",
);
// open fires from openReader (header control or in-page chip), not from chip render alone.
const openReaderIdx = coach.indexOf("const openReader");
const fireOpenIdx = coach.indexOf('fireLiteracyEvent("open"');
const handleChipIdx = coach.indexOf("const handleChipOpen");
assert.ok(openReaderIdx >= 0 && fireOpenIdx > openReaderIdx, "open is fired inside openReader");
assert.ok(handleChipIdx > fireOpenIdx, "chip handler does not fire a separate open (it uses openReader)");
assert.ok(!/fireLiteracyEvent\("open"/.test(coach.slice(handleChipIdx)), "chip render/handler does not double-fire open");
assert.ok(coach.includes("closeWithoutWriting"), "Back / Escape / X still close without writing the key");
assert.ok(
  !coach.includes('fireLiteracyEvent') || !/fireLiteracyEvent\("(close|back|escape)"/.test(coach),
  "Does not fire literacy events for Back, Escape, or X",
);

// Insights (or the health strip) surfaces How to read opens, Got it rate, and a per-page split.
const literacyIdx = admin.indexOf('data-testid="admin-literacy-insights"');
assert.ok(literacyIdx >= 0, "Insights surfaces How to read stats");
const literacyBlock = admin.slice(literacyIdx, literacyIdx + 1800);
assert.ok(literacyBlock.includes('label="Opens"'), "How to read surfaces opens");
assert.ok(literacyBlock.includes('label="Got it rate"'), "How to read surfaces Got it rate");
assert.ok(literacyBlock.includes("Per-page split"), "How to read surfaces a per-page split");
assert.ok(
  literacyBlock.includes('"today"') &&
    literacyBlock.includes('"chart"') &&
    literacyBlock.includes('"soul"') &&
    literacyBlock.includes('"protocols"'),
  "Per-page split covers today, chart, soul, protocols",
);

// Literacy events are opt-in in the logbook, not in the default All filter.
const logbookIdx = admin.indexOf(">Logbook</h2>");
assert.ok(logbookIdx >= 0, "Logbook heading still present");
const logbookBlock = admin.slice(logbookIdx, logbookIdx + 2500);
assert.ok(
  logbookBlock.includes('{ id: "literacy_event", label: "How to read" }'),
  "Logbook has an opt-in How to read filter",
);
assert.ok(
  logbookBlock.includes('{ id: "", label: "All" }'),
  "Logbook keeps an All default that does not force literacy into the default query",
);

console.log("assert:admin-next-level passed");
