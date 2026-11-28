/**
 * Center-tap inspector on the v9 Chart (brief chart-center-tap-inspector).
 * Run: npx tsx scripts/assert-chart-center-tap-inspector.mjs
 *
 * BodyGraph.tsx and bodygraphGeometry.ts stay the pinned bytes.
 * The lockfile stays the 6085a38 bytes.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

globalThis.React = React;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const sha = (text) => createHash("sha256").update(text).digest("hex");

const BODYGRAPH_SHA = "8f9380005b90a2b6e34190650a599c248d79e84e13c99e15ea9086d5b3dd2da8";
const GEOMETRY_SHA = "cc8c5433776ee2e8758f95f868597a5821f8077eec8a92ec7bcb6cad15f1b743";
const LOCKFILE_SHA_6085A38 =
  "a6a9733cf7ab81eee53471a02cd27bc06e215ca57c290afd0b9fc94cdf191324";

const { ChartBodygraph } = await import("../src/components/ChartBodygraph.tsx");
const { ChartDeepDive } = await import("../src/components/ChartDeepDive.tsx");
const { I18nProvider } = await import("../src/lib/i18n/index.ts");
const render = (node) =>
  renderToStaticMarkup(React.createElement(I18nProvider, { accountLocale: "en" }, node));

function exactRule(css, selector) {
  const token = `${selector} {`;
  const idx = css.indexOf(token);
  assert.ok(idx >= 0, `check 3: missing ${selector}`);
  const start = idx + token.length;
  const end = css.indexOf("}", start);
  assert.ok(end > start, `check 3: ${selector} has a body`);
  return css.slice(start, end);
}

// --- 1. Profile mounts ChartBodygraph in #bodygraph and not BodyGraph. Share still uses BodyGraph. ---
const profile = read("src/app/profile/page.tsx");
const card = profile.slice(profile.indexOf('id="bodygraph"'), profile.indexOf('id="snapshot"'));
assert.match(card, /<ChartBodygraph\s+afterSvg=\{\s*<ChartTypeBox/, "check 1: Type box stays the first ChartBodygraph prop");
assert.match(card, /<ChartBodygraph/);
assert.doesNotMatch(card, /<BodyGraph/, "check 1: #bodygraph does not mount BodyGraph");
assert.match(card, /selectedCenter=\{selectedCenter\}/);
assert.match(card, /onSelectCenter=\{onSelectCenter\}/);
assert.match(profile, /searchParams\.get\("center"\)/);
assert.match(profile, /searchParams\.set\("center"/);
assert.match(profile, /searchParams\.delete\("center"\)/);
assert.match(profile, /openCenter=\{openCenter\}/);
assert.match(profile, /onOpenCenter=\{setOpenCenter\}/);
assert.match(profile, /jumpToSection\("deep-dive", "centers"\)/);
const share = read("src/components/share/ShareBaselineCard.tsx");
assert.match(share, /BodyGraph,\s*\n\s*type BodyGraphChannel,\s*\n\} from "@\/components\/BodyGraph"/, "check 1: ShareBaselineCard still imports BodyGraph");

// --- 2. Centers are buttons with a shape-matched focus path. Gates are not inspectors. ---
const bodygraph = read("src/components/ChartBodygraph.tsx");
assert.match(bodygraph, /role="button"/, "check 2: centers are buttons");
assert.match(bodygraph, /onClick=\{\(\) => activate\(key\)\}/, "check 2: centers activate on click");
assert.match(bodygraph, /event\.key !== "Enter" && event\.key !== " "/, "check 2: Enter and Space activate");
assert.match(bodygraph, /aria-pressed=\{activeCenter === key\}/);
assert.match(bodygraph, /stroke="var\(--focus\)"/, "check 2: focus stroke uses var(--focus)");
assert.match(bodygraph, /strokeWidth=\{2\.2\}/);
const focusPath = bodygraph.slice(bodygraph.indexOf('className={styles.focus}'));
assert.match(focusPath.slice(0, 240), /d=\{d\}/, "check 2: focus path reuses the center d");
const gatesAt = bodygraph.indexOf("Object.entries(GATES)");
const lanesAt = bodygraph.indexOf("lanes(design", gatesAt);
assert.ok(gatesAt > 0 && lanesAt > gatesAt, "check 2: gate chips present");
assert.doesNotMatch(bodygraph.slice(gatesAt, lanesAt), /onClick/, "check 2: no gate onClick inspector");

// --- 3. Focus rectangle is removed. Reduced motion drops the inspector fade. ---
const css = read("src/app/profile/chart-field-notes.css");
for (const selector of [".chart-v9-center:focus", ".chart-v9-center:focus-visible"]) {
  assert.match(exactRule(css, selector), /outline:\s*none/, `check 3: ${selector} sets outline none`);
}
for (const match of css.matchAll(/\.chart-v9-center[^{]*\{([^}]*)\}/g)) {
  for (const decl of match[1].match(/outline\s*:[^;]+/g) || []) {
    assert.match(decl, /outline\s*:\s*none\s*$/, `check 3: center outline stays none (${decl.trim()})`);
  }
}
assert.match(css, /\.chart-v9-center:focus-visible \+ \.chart-v9-center-focus/);
assert.match(css, /stroke:\s*var\(--focus\)/);
assert.match(css, /stroke-width:\s*2\.2px/);
assert.match(
  css,
  /@media \(prefers-reduced-motion: reduce\) \{\s*\.chart-v9-inspector \{\s*animation:\s*none;/,
  "check 3: reduced motion removes the inspector fade",
);

// --- 4. Inspector reuses locked catalog keys. No new Joy / full-page copy. ---
for (const key of [
  't("literacy.chrome.close")',
  't("chart.people.readMoreInDeepDive")',
  't("chart.deepDive.defined")',
  't("chart.deepDive.open")',
  't("chart.deepDive.definedConsistent")',
  't("chart.deepDive.openAmplifies")',
  't("chart.deepDive.bodyHint"',
  't("chart.deepDive.otherPersonNote"',
]) {
  assert.ok(bodygraph.includes(key), `check 4: inspector uses ${key}`);
}
assert.doesNotMatch(bodygraph, /Ask Joy|Open the full page|Open the full reading/, "check 4: no new catalog phrasing");
assert.match(bodygraph, /data-testid="chart-center-inspector"/);
assert.match(bodygraph, /data-testid="chart-center-inspector-deep-dive"/);
assert.match(bodygraph, /aria-modal="false"/);
assert.match(bodygraph, /role="dialog"/);

const closed = render(
  React.createElement(ChartBodygraph, {
    definedCenters: ["Head"],
    channels: [],
    typeName: "Generator",
  }),
);
assert.doesNotMatch(closed, /chart-center-inspector/, "check 4: inspector stays closed until a center is selected");
assert.match(closed, /role="button"/);

const open = render(
  React.createElement(ChartBodygraph, {
    definedCenters: ["Head"],
    channels: [],
    typeName: "Generator",
    ownerName: "Juno",
    selectedCenter: "Head",
    onSelectCenter: () => {},
    onInspectDeepDive: () => {},
    afterSvg: React.createElement("div", { "data-testid": "slot-probe" }, "SLOT"),
  }),
);
assert.match(open, /data-testid="chart-center-inspector"/);
assert.match(open, /data-testid="chart-center-inspector-deep-dive"/);
assert.match(open, /aria-modal="false"/);
assert.match(open, /aria-pressed="true"/);
assert.match(open, /Read more in Deep dive/);
assert.match(open, /You.re reading Juno/);
assert.match(open, /Defined — consistent/);
const svgEnd = open.indexOf("</svg>");
const inspectorAt = open.indexOf("chart-center-inspector");
const slotAt = open.indexOf("slot-probe");
const legendAt = open.indexOf(">Centers<");
assert.ok(
  svgEnd > 0 && svgEnd < inspectorAt && inspectorAt < slotAt && slotAt < legendAt,
  "check 4: inspector sits under the figure and above the Type box slot",
);

// --- 5. ChartDeepDive accepts openCenter and expands that center. Core ids stay. ---
const deepDive = read("src/components/ChartDeepDive.tsx");
assert.match(deepDive, /openCenter\?: CenterKey \| null/);
assert.match(deepDive, /onOpenCenter\?: \(center: CenterKey \| null\) => void/);
assert.match(deepDive, /const expanded = controlled \? openCenter \?\? null : internalExpanded/);
assert.match(deepDive, /const activeFilter: CenterFilter = openCenter \? "all" : filter/);
for (const id of ["deep-dive-type", "deep-dive-strategy", "deep-dive-profile", "deep-dive-definition"]) {
  assert.match(deepDive, new RegExp(`id="${id}"`), `check 5: ${id} remains`);
}
const dive = render(
  React.createElement(ChartDeepDive, {
    chart: {
      defined_centers: ["Head"],
      channels: [],
      hanging_gates: [],
      activated_gates: [],
      type: "Generator",
      strategy: "To Respond",
      authority: "Sacral",
      profile: "1/3",
      definition: "Single",
    },
    personality: [],
    design: [],
    domain: "centers",
    openCenter: "Ajna",
  }),
);
assert.match(dive, /You pick up many perspectives/, "check 5: openCenter expands that center");
assert.match(dive, /aria-label="Ajna detail"/);
assert.match(dive, />All</);

// --- 6. Classic graph and the lockfile stay pinned. One new script line. ---
assert.equal(sha(read("src/components/BodyGraph.tsx")), BODYGRAPH_SHA, "check 6: BodyGraph.tsx sha");
assert.equal(sha(read("src/lib/bodygraphGeometry.ts")), GEOMETRY_SHA, "check 6: bodygraphGeometry.ts sha");
assert.equal(sha(read("package-lock.json")), LOCKFILE_SHA_6085A38, "check 6: lockfile sha");
const pkg = read("package.json");
const scriptLine = '"assert:chart-center-tap-inspector": "npx tsx scripts/assert-chart-center-tap-inspector.mjs"';
assert.equal(pkg.split(scriptLine).length - 1, 1, "check 6: one assert:chart-center-tap-inspector script");
assert.doesNotMatch(pkg, /"framer-motion"|"@radix-ui/);

console.log("assert-chart-center-tap-inspector: ok");
