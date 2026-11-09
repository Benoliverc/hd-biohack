/**
 * Source-level ACs: Today empty when no Me natal (new-user bug).
 * Run: npx tsx frontend/scripts/assert-today-empty-no-me-chart.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const transits = read("src/app/transits/page.tsx");
const todayInd = read("src/components/TodayIndication.tsx");
const en = read("src/lib/i18n/messages/en.ts");

// Empty state card + CTA on Today when no Me natal
if (!/data-testid="today-empty-no-you"/.test(transits)) {
  fail("transits missing today-empty-no-you empty state");
}
if (!/data-testid="today-empty-open-chart"/.test(transits)) {
  fail("transits missing today-empty-open-chart CTA");
}
if (!/t\("page\.today\.emptyTitle"\)/.test(transits)) {
  fail("transits must wire page.today.emptyTitle");
}
if (!/t\("page\.today\.emptyBody"\)/.test(transits)) {
  fail("transits must wire page.today.emptyBody");
}
if (!/t\("page\.today\.openChart"\)/.test(transits)) {
  fail("transits must wire page.today.openChart");
}
if (!/href="\/profile"/.test(transits)) {
  fail("empty CTA must link to /profile (Chart)");
}

// Must not call transitsToday without a Me chart id
if (/transitsToday\(youChart\?\.id/.test(transits)) {
  fail("must not call transitsToday(youChart?.id) — only call with youChart.id after Me natal gate");
}
if (!/transitsToday\(youChart\.id/.test(transits)) {
  fail("with Me natal, must call transitsToday(youChart.id)");
}
if (!/if \(!youChart\)/.test(transits)) {
  fail("transits must early-return fetch when !youChart");
}

// Filled cockpit only when youChart is present
if (!/\{youChart \? \(\s*<TodayIndication/.test(transits) && !/\{youChart \?\s*\(\s*\n\s*<TodayIndication/.test(transits)) {
  // looser: TodayIndication must be gated on youChart
  const indIdx = transits.indexOf("<TodayIndication");
  if (indIdx < 0) fail("TodayIndication missing");
  const before = transits.slice(Math.max(0, indIdx - 80), indIdx);
  if (!/youChart/.test(before)) {
    fail("TodayIndication must be gated on youChart");
  }
}

// People never drive Today — resolveYouChart still filters friends
if (!/isSelfRow/.test(transits) || !/resolveYouChart/.test(transits)) {
  fail("Today must keep self-only youChart resolution");
}

// Defense in TodayIndication: no filled Move without has_natal
if (!/!indication\.has_natal/.test(todayInd)) {
  fail("TodayIndication must short-circuit when !has_natal");
}
if (!/data-testid="today-indication-needs-natal"/.test(todayInd)) {
  fail("TodayIndication missing needs-natal empty testid");
}
// Filled main-action still exists for natal path
if (!/data-testid="main-action"/.test(todayInd)) {
  fail("TodayIndication must keep main-action for Me natal path");
}

// i18n keys present
for (const k of ["page.today.emptyTitle", "page.today.emptyBody", "page.today.openChart"]) {
  if (!srcIncludesKey(en, k)) fail(`en missing ${k}`);
}

function srcIncludesKey(src, key) {
  return src.includes(`'${key}'`) || src.includes(`"${key}"`);
}

console.log("assert-today-empty-no-me-chart PASS");
