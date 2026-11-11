/**
 * Source-level ACs for Baseline Option A — Morning Ritual (P0).
 * Run: npx tsx frontend/scripts/assert-morning-ritual-option-a.mjs
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

const biohack = read("src/app/biohack/page.tsx");
const move = read("src/components/protocols/TodaysMoveCard.tsx");
const home = read("src/app/page.tsx");
const todayInd = read("src/components/TodayIndication.tsx");
const weather = read("src/components/protocols/WeatherStrip.tsx");

// Move before Shelf / Intention in Protocols JSX
const iMove = biohack.indexOf("<TodaysMoveCard");
const iShelf = biohack.indexOf('data-testid="shelf-disclosure"');
const iIntent = biohack.indexOf('data-testid="intention-disclosure"');
if (iMove < 0 || iShelf < 0 || iIntent < 0) fail("missing Move / Shelf / Intention markers");
if (!(iMove < iShelf && iShelf < iIntent)) fail("Move must precede Shelf disclosure, then Intention");

// Single empty-kit ask: no KitFact empty CTA payload
if (/cta=\{\s*inventory\.length === 0/.test(biohack)) {
  fail("KitFact empty twin CTA still wired");
}
if (!/cta=\{null\}/.test(biohack)) fail("KitFact must pass cta={null}");
if (!/shelf-disclosure/.test(biohack)) fail("missing shelf-disclosure");

// Tick rows strip (consider adding)
if (!/bareItemName\(row\.item\)/.test(biohack)) {
  fail("checkItems must bareItemName labels (no consider adding in tick rows)");
}

// Colour: Move card not growth-soft wash
if (/bg-growth-soft p-5/.test(move) || /border-growth\/40 bg-growth-soft/.test(move)) {
  fail("TodaysMoveCard still uses full growth-soft wash");
}
if (!/data-testid="todays-move"/.test(move)) fail("TodaysMoveCard missing test id");
if (!/Today&apos;s Move|Today's Move|protocols\.moveTitle/.test(move)) fail("must keep Today's Move naming");

// Main action: sand/canvas, not growth-soft wash; Why closed contract; micro inside Why
if (/main-action[\s\S]{0,120}bg-growth-soft/.test(todayInd)) {
  fail("Main action still growth-soft wash");
}
if (!/main-action-why-details/.test(todayInd)) fail("Why disclosure missing");
if (!/open-protocols-secondary/.test(todayInd)) fail("Open Protocols secondary test id missing");
// micro should appear inside why-details block
const whyBlock = todayInd.slice(
  todayInd.indexOf("main-action-why-details"),
  todayInd.indexOf("save_chart_cta")
);
if (!/main-action-micro/.test(whyBlock)) fail("main-action-micro should live inside Why disclosure");

// Home: returners get one growth primary (Today); Pro secondary is Open Protocols
if (!/home-primary-today/.test(home)) fail("Home missing returner primary to Today");
if (!/home-secondary-protocols/.test(home)) fail("Home missing Pro returner Open Protocols secondary");
// Must not have two bg-growth fills in the hasChart+Pro branch for Chart+Protocols
const continueStripGrowth =
  /bg-growth-soft\/40[\s\S]{0,400}bg-growth/.test(home) &&
  /Open Protocols|home\.cta\.openProtocols/.test(home.match(/bg-growth-soft\/40[\s\S]{0,500}/)?.[0] || "");
if (continueStripGrowth) fail("Home continue strip still has second growth Open Protocols");

// WeatherStrip energy for sky-did chip
if (/whats-new-chip[\s\S]{0,80}bg-growth-soft/.test(weather)) {
  fail("whats-new chip should use energy, not growth wash");
}
if (!/Full sky on Today|protocols\.fullSkyOnToday/.test(weather)) fail("WeatherStrip Full sky link missing");

console.log("assert-morning-ritual-option-a PASS");
