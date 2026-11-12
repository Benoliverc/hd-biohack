/**
 * Assert formatResetsIn / nextNoveltyReset — 07:00 in the account timezone.
 * Run: npx tsx scripts/assert-resets-in-account-tz.mjs
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatResetsIn,
  nextNoveltyReset,
  noveltyDayKey,
  prevNoveltyDayKey,
  zonedWallTime,
  resolveAccountTz,
  NOVELTY_BUCKET_HOUR,
  DEFAULT_NOVELTY_TZ,
} from "../src/lib/timezone.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function assertEq(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
  }
}

function atZone(zone, y, m, d, hh, mm = 0, ss = 0) {
  return zonedWallTime(zone, y, m, d, hh, mm, ss);
}

const HKT = "Asia/Hong_Kong";
const NY = "America/New_York";

// --- HKT phrases (same approximate wording as before) ---
const now1315 = atZone(HKT, 2026, 10, 24, 13, 15);
const next = nextNoveltyReset(HKT, now1315);
const expectedNext = atZone(HKT, 2026, 10, 25, NOVELTY_BUCKET_HOUR);
assertEq(next.getTime(), expectedNext.getTime(), "next reset from 13:15 HKT");
assertEq(formatResetsIn(now1315, HKT), "Resets in ~18 hours", "13:15 HKT → ~18h");

assertEq(formatResetsIn(atZone(HKT, 2026, 10, 24, 6, 30), HKT), "Resets in ~30 minutes", "06:30 HKT");
assertEq(formatResetsIn(atZone(HKT, 2026, 10, 24, 6, 45), HKT), "Resets in ~15 minutes", "06:45 HKT");
assertEq(formatResetsIn(atZone(HKT, 2026, 10, 24, 6, 59, 30), HKT), "Resets soon", "06:59:30 HKT");

const atBucket = atZone(HKT, 2026, 10, 24, 7, 0);
assertEq(
  nextNoveltyReset(HKT, atBucket).getTime(),
  atZone(HKT, 2026, 10, 25, 7).getTime(),
  "exactly 07:00 → tomorrow",
);
assertEq(formatResetsIn(atBucket, HKT), "Resets in ~24 hours", "exactly 07:00");
assertEq(formatResetsIn(atZone(HKT, 2026, 10, 24, 7, 1), HKT), "Resets in ~24 hours", "07:01 HKT");
assertEq(formatResetsIn(atZone(HKT, 2026, 10, 24, 5, 30), HKT), "Resets in about an hour", "05:30 HKT (~90m)");
assertEq(formatResetsIn(atZone(HKT, 2026, 10, 24, 4, 36), HKT), "Resets in ~2 hours", "04:36 HKT");

const countdown = formatResetsIn(now1315, HKT);
assert.ok(!/HKT/.test(countdown), "countdown must not hardcode HKT once math follows Settings");

// --- Novelty day flips at 07:00, not midnight ---
assertEq(noveltyDayKey(HKT, atZone(HKT, 2026, 10, 24, 6, 59)), "2026-10-23", "06:59 still previous novelty day");
assertEq(noveltyDayKey(HKT, atZone(HKT, 2026, 10, 24, 7, 0)), "2026-10-24", "07:00 starts the new novelty day");
assertEq(prevNoveltyDayKey(HKT, atZone(HKT, 2026, 10, 24, 8, 0)), "2026-10-23", "prev novelty day");

// --- America/New_York, including DST spring-forward and fall-back ---
// 2026-03-08 US spring forward (02:00 → 03:00). 07:00 EDT exists.
assertEq(noveltyDayKey(NY, atZone(NY, 2026, 3, 8, 6, 59)), "2026-03-07", "NY 06:59 EDT still 7 Mar");
assertEq(noveltyDayKey(NY, atZone(NY, 2026, 3, 8, 7, 0)), "2026-03-08", "NY 07:00 EDT is 8 Mar");
assertEq(
  nextNoveltyReset(NY, atZone(NY, 2026, 3, 8, 6, 59)).getTime(),
  atZone(NY, 2026, 3, 8, 7, 0).getTime(),
  "NY spring-forward morning resets at 07:00 EDT",
);
assertEq(
  formatResetsIn(atZone(NY, 2026, 3, 8, 6, 30), NY),
  "Resets in ~30 minutes",
  "NY 06:30 EDT",
);

// 2026-11-01 US fall back (01:00 EDT → 01:00 EST). 07:00 EST exists.
assertEq(noveltyDayKey(NY, atZone(NY, 2026, 11, 1, 6, 59)), "2026-10-31", "NY 06:59 EST still 31 Oct");
assertEq(noveltyDayKey(NY, atZone(NY, 2026, 11, 1, 7, 0)), "2026-11-01", "NY 07:00 EST is 1 Nov");
assertEq(
  nextNoveltyReset(NY, atZone(NY, 2026, 11, 1, 6, 59)).getTime(),
  atZone(NY, 2026, 11, 1, 7, 0).getTime(),
  "NY fall-back morning resets at 07:00 EST",
);

// Same UTC instant: HKT already past 07:00, New York still on the previous novelty day
const utc0400 = new Date("2026-11-06T04:00:00.000Z"); // 12:00 HKT; 23:00 Nov 5 EST
assertEq(noveltyDayKey(HKT, utc0400), "2026-11-06", "04:00Z is 06 Nov in HKT");
assertEq(noveltyDayKey(NY, utc0400), "2026-11-05", "04:00Z is still 05 Nov novelty day in NY");

// Invalid / empty zone falls back to Asia/Hong_Kong
assertEq(resolveAccountTz(null), DEFAULT_NOVELTY_TZ, "null falls back");
assertEq(resolveAccountTz(""), DEFAULT_NOVELTY_TZ, "empty falls back");
assertEq(resolveAccountTz("Not/A_Zone"), DEFAULT_NOVELTY_TZ, "invalid falls back");
assertEq(noveltyDayKey("Not/A_Zone", utc0400), noveltyDayKey(HKT, utc0400), "invalid zone uses HKT day");

// --- Source: pages use account TZ; Settings copy is locked ---
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const transits = read("src/app/transits/page.tsx");
const biohack = read("src/app/biohack/page.tsx");
const settings = read("src/app/settings/page.tsx");
assert.ok(transits.includes("formatResetsIn("), "Today countdown uses formatResetsIn");
assert.ok(transits.includes("user?.preferred_timezone"), "Today countdown uses Settings timezone");
assert.ok(!/formatResetsInHkt\(/.test(transits), "Today no longer calls formatResetsInHkt");
assert.ok(biohack.includes("formatResetsIn("), "Protocols countdown uses formatResetsIn");
assert.ok(biohack.includes("noveltyDayKey(user?.preferred_timezone)"), "lead fingerprints use account novelty day");
assert.ok(settings.includes('t("settings.timezoneHelp")'), "Settings help is keyed");
assert.ok(settings.includes('t("settings.savedTz"'), "save toast is keyed");

const apos = "\u2019";
const locked = {
  "settings.timezoneHelp": `Used for Protocols days, Show-up, and when Today${apos}s Move resets \u2014 07:00 in this timezone.`,
  "settings.savedTz": `Saved \u00b7 days and Today${apos}s Move use {tz}`,
  "settings.savedTzDefault": `Saved \u00b7 days and Today${apos}s Move fall back to {tz}`,
  "today.resetsSoon": "Resets soon",
  "today.resetsInOneMinute": "Resets in ~1 minute",
  "today.resetsInMinutes": "Resets in ~{n} minutes",
  "today.resetsInAboutAnHour": "Resets in about an hour",
  "today.resetsInOneHour": "Resets in ~1 hour",
  "today.resetsInHours": "Resets in ~{n} hours",
};

function extractMessage(src, key) {
  const re = new RegExp(`['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*(['"\`])([\\s\\S]*?)\\1`);
  const m = src.match(re);
  return m ? m[2] : null;
}

const locales = ["en.ts", "de.ts", "es.ts", "fr.ts", "nl.ts"];
for (const loc of locales) {
  const src = read(`src/lib/i18n/messages/${loc}`);
  for (const [key, en] of Object.entries(locked)) {
    const value = extractMessage(src, key);
    assert.ok(value, `${loc} missing ${key}`);
    assert.equal(value, en, `${loc} ${key} must match EN source until translated`);
  }
}

const pkg = read("package.json");
assert.ok(pkg.includes('"assert:resets-in-account-tz"'), "package.json wires assert:resets-in-account-tz");

console.log("assert-resets-in-account-tz PASS");
