/**
 * Pin (h) — primary-tab scroll reset at the shared Header + AppShell.
 * Changing Today / Protocols / Chart / Soul opens the new page at the top.
 * In-page hashes, Open Chart ?person=, and the Add a person #people-form
 * handoff must still be honored.
 * Run: npx tsx scripts/assert-primary-tab-scroll.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRIMARY_TAB_PATHS,
  isPrimaryTabPath,
  shouldResetScrollOnPrimaryTabChange,
} from "../src/lib/primaryTabScroll.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const header = read("src/components/Header.tsx");
const shell = read("src/components/AppShell.tsx");
const helper = read("src/lib/primaryTabScroll.ts");
const soul = read("src/app/soul/page.tsx");
const profile = read("src/app/profile/page.tsx");
const pkg = read("package.json");

// --- Shared helper: the four primary tabs ---
assert.deepEqual(
  [...PRIMARY_TAB_PATHS],
  ["/transits", "/biohack", "/profile", "/soul"]
);
assert.equal(isPrimaryTabPath("/transits"), true);
assert.equal(isPrimaryTabPath("/biohack"), true);
assert.equal(isPrimaryTabPath("/profile"), true);
assert.equal(isPrimaryTabPath("/soul"), true);
assert.equal(isPrimaryTabPath("/settings"), false);
assert.equal(isPrimaryTabPath("/login"), false);
assert.equal(isPrimaryTabPath("/"), false);

// Reset when changing from one primary tab to another with no hash.
assert.equal(
  shouldResetScrollOnPrimaryTabChange("/biohack", "/transits", ""),
  true
);
assert.equal(
  shouldResetScrollOnPrimaryTabChange("/profile", "/soul", ""),
  true
);
assert.equal(
  shouldResetScrollOnPrimaryTabChange("/soul", "/profile", "#"),
  true
);

// Same tab: do not clobber in-page position.
assert.equal(
  shouldResetScrollOnPrimaryTabChange("/transits", "/transits", ""),
  false
);

// Hash handoffs and in-page deep links must not be reset to the top.
assert.equal(
  shouldResetScrollOnPrimaryTabChange(
    "/profile",
    "/soul",
    "#people-form"
  ),
  false,
  "Add a person handoff /profile?new=person#people-form must keep its hash scroll"
);
assert.equal(
  shouldResetScrollOnPrimaryTabChange("/biohack", "/transits", "#stack"),
  false
);
assert.equal(
  shouldResetScrollOnPrimaryTabChange("/biohack", "/transits", "#shelf"),
  false
);
assert.equal(
  shouldResetScrollOnPrimaryTabChange("/profile", "/transits", "#bodygraph"),
  false
);

// Open Chart ?person=<id> has no hash: open Chart at the top.
assert.equal(
  shouldResetScrollOnPrimaryTabChange("/profile", "/soul", ""),
  true,
  "Open Chart ?person= has no hash and should open at the top"
);

// Non-primary destinations are not this pin's reset.
assert.equal(
  shouldResetScrollOnPrimaryTabChange("/settings", "/transits", ""),
  false
);

// --- Header: primary nav links opt out of Next's default scroll ---
assert.match(header, /href: "\/transits"/);
assert.match(header, /href: "\/biohack"/);
assert.match(header, /href: "\/profile"/);
assert.match(header, /href: "\/soul"/);
assert.match(header, /testId: "nav-today"/);
assert.match(header, /testId: "nav-protocols"/);
assert.match(header, /testId: "nav-chart"/);
assert.match(header, /testId: "nav-soul"/);

const navMapStart = header.indexOf("{nav.map");
assert.ok(navMapStart >= 0);
const navMap = header.slice(navMapStart, header.indexOf(")}", navMapStart) + 2);
assert.match(navMap, /scroll=\{false\}/);
assert.equal(
  [...navMap.matchAll(/<Link/g)].length,
  1,
  "primary nav map should render one Link per item"
);
assert.match(navMap, /scroll=\{false\}/);

// Wordmark / settings / sign-in are not required to opt out; the reset is tab-scoped.
const wordmark = header.slice(
  header.indexOf('data-testid="nav-wordmark"') - 200,
  header.indexOf('data-testid="nav-wordmark"')
);
assert.doesNotMatch(wordmark, /scroll=\{false\}/);

// --- AppShell: app-wide reset on primary-tab pathname change ---
assert.match(shell, /from "@\/lib\/primaryTabScroll"/);
assert.match(shell, /shouldResetScrollOnPrimaryTabChange/);
assert.match(shell, /resetWindowScrollToTop/);
assert.match(shell, /usePathname\(\)/);
assert.match(shell, /window\.location\.hash/);
assert.match(shell, /history\.scrollRestoration = "manual"/);
assert.match(helper, /window\.scrollTo\(0, 0\)/);

// --- In-page / handoff pins (a)(e)(g) remain intact ---
assert.match(soul, /href="\/profile\?new=person#people-form"/);
assert.equal(
  [...soul.matchAll(/href="\/profile\?new=person#people-form"/g)].length,
  2,
  "Soul Add person and Add a person on Chart keep the #people-form handoff"
);
assert.match(soul, /\/profile\?person=\$\{selectedFriend\.id\}/);
assert.equal(
  [...soul.matchAll(/data-testid="soul-open-chart"/g)].length,
  2
);
assert.match(profile, /const startNewPerson = useCallback\(/);
assert.match(profile, /scrollChartSectionIntoView\("people-form"/);
assert.match(profile, /personNameInputRef\.current\?\.focus\(\)/);
assert.match(profile, /requestedPersonId/);
assert.match(pkg, /"assert:primary-tab-scroll"/);

console.log("PASS: assert-primary-tab-scroll");
