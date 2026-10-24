/**
 * Assert formatResetsInHkt / nextNoveltyResetHkt copy + timing.
 * Run: npx tsx frontend/scripts/assert-resets-in-hkt.mjs
 */
import {
  formatResetsInHkt,
  nextNoveltyResetHkt,
  NOVELTY_BUCKET_HOUR_HKT,
} from "../src/lib/timezone.ts";

const HKT_OFFSET_MS = 8 * 60 * 60 * 1000;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function assertEq(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
  }
}

/** Build a Date for an HKT wall-clock moment. */
function atHkt(y, m, d, hh, mm = 0, ss = 0) {
  return new Date(Date.UTC(y, m - 1, d, hh, mm, ss) - HKT_OFFSET_MS);
}

// Next reset from Sat 24 Oct 2026 13:15 HKT → Sun 25 Oct 2026 07:00 HKT
const now1315 = atHkt(2026, 10, 24, 13, 15);
const next = nextNoveltyResetHkt(now1315);
const expectedNext = atHkt(2026, 10, 25, NOVELTY_BUCKET_HOUR_HKT);
assertEq(next.getTime(), expectedNext.getTime(), "next reset from 13:15 HKT");
assertEq(formatResetsInHkt(now1315), "Resets in ~18 hours", "13:15 HKT → ~18h");

// Under an hour → minutes; 60–119m → about an hour; <1m → soon
assertEq(
  formatResetsInHkt(atHkt(2026, 10, 24, 6, 30)),
  "Resets in ~30 minutes",
  "06:30 HKT"
);
assertEq(
  formatResetsInHkt(atHkt(2026, 10, 24, 6, 45)),
  "Resets in ~15 minutes",
  "06:45 HKT"
);
assertEq(
  formatResetsInHkt(atHkt(2026, 10, 24, 6, 59, 30)),
  "Resets soon",
  "06:59:30 HKT"
);

// Exactly at 07:00 → tomorrow
const atBucket = atHkt(2026, 10, 24, 7, 0);
assertEq(
  nextNoveltyResetHkt(atBucket).getTime(),
  atHkt(2026, 10, 25, 7).getTime(),
  "exactly 07:00 → tomorrow"
);
assertEq(formatResetsInHkt(atBucket), "Resets in ~24 hours", "exactly 07:00");

// Just after 07:00
assertEq(
  formatResetsInHkt(atHkt(2026, 10, 24, 7, 1)),
  "Resets in ~24 hours",
  "07:01 HKT"
);

// 90 minutes out → about an hour
assertEq(
  formatResetsInHkt(atHkt(2026, 10, 24, 5, 30)),
  "Resets in about an hour",
  "05:30 HKT (~90m)"
);

// 2.4 hours → ~2 hours
assertEq(
  formatResetsInHkt(atHkt(2026, 10, 24, 4, 36)),
  "Resets in ~2 hours",
  "04:36 HKT"
);

console.log("assert-resets-in-hkt PASS");
