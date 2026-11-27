/**
 * Chart bodygraph v9 invariants (Field Notes).
 * Classic assert:gate-spacing stays on V1 geometry.
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

const geom = await import("../src/lib/bodygraphGeometryV2.ts");
const { ChartBodygraph } = await import("../src/components/ChartBodygraph.tsx");
const { I18nProvider } = await import("../src/lib/i18n/index.ts");
const render = (node) =>
  renderToStaticMarkup(React.createElement(I18nProvider, { accountLocale: "en" }, node));

assert.equal(geom.FIGURE_VIEWBOX, "-47 0 535 800");
assert.equal(geom.CHANNEL_WEIGHT, 7.5);
assert.equal(geom.HANGING_WEIGHT, 5);
assert.equal(geom.HAIRLINE_WEIGHT, 1);
assert.equal(Object.keys(geom.GATES).length, 64);
assert.equal(geom.SILHOUETTE_D.startsWith("M202.12,6.21"), true);
assert.equal(geom.SILHOUETTE_D.endsWith("Z"), true);
assert.equal(sha(geom.SILHOUETTE_D), "ce375fe7e881539633ad051dd4b8da0044918d3df3af7cc1040d1d730a112e27");
assert.deepEqual(geom.assertGateSpacingV2(), []);

const curveBlob = Object.keys(geom.CURVE_BY_KEY)
  .sort((a, b) => {
    const [a0, a1] = a.split("-").map(Number);
    const [b0, b1] = b.split("-").map(Number);
    return a0 - b0 || a1 - b1;
  })
  .map((key) => `${key} ${geom.CURVE_BY_KEY[key].d}`)
  .join("\n");
assert.equal(sha(curveBlob), "67d28879a1631a7a97bd852b27cd59473721a0fb52a84a8b54e97e0d5700b6b1", "curve_route matches the locked v9 generator");

const bow = geom.CURVE_BY_KEY["17-62"].d;
assert.match(bow, /^M191\.0,148\.0 C180\.3,173\.3 /, "17–62 is a short stacked bow, not a straight stick");
assert.equal(geom.CURVE_BY_KEY["9-52"].d, "M234.0,572.0 C239.5,589.3 239.5,606.7 234.0,624.0");
assert.match(geom.CURVE_BY_KEY["30-41"].d, /^M367\.6,573\.8 C360\.3,655\.5 /, "30–41 is one outward cubic");
assert.match(geom.CURVE_BY_KEY["16-48"].d, /155\.0,305\.0/, "16–48 drops below the planet lanes");
assert.match(geom.CURVE_BY_KEY["35-36"].d, /265\.0,305\.0/, "35–36 drops below the planet lanes");
assert.ok(geom.CURVE_BY_KEY["20-34"].d.includes("140.0,500.0"), "20–34 stays on the smoothed left bypass");
assert.ok(geom.CURVE_BY_KEY["26-44"].d.includes("142.0,472.0"), "26–44 uses the waist via");

const areas = geom.definitionAreas(
  ["Ajna", "Throat", "Sacral", "Solar_Plexus", "Root"],
  [
    { gates: [17, 62], centers: ["Ajna", "Throat"] },
    { gates: [9, 52], centers: ["Sacral", "Root"] },
    { gates: [30, 41], centers: ["Solar_Plexus", "Root"] },
  ],
);
assert.deepEqual(areas, [
  ["Ajna", "Throat"],
  ["Sacral", "Solar_Plexus", "Root"],
]);
assert.deepEqual(
  geom.joiningGates(
    ["Ajna", "Throat", "Sacral", "Solar_Plexus", "Root"],
    [
      { gates: [17, 62], centers: ["Ajna", "Throat"] },
      { gates: [9, 52], centers: ["Sacral", "Root"] },
      { gates: [30, 41], centers: ["Solar_Plexus", "Root"] },
    ],
    [17, 62, 9, 52, 30, 41],
  ),
  [],
  "Jobs has no single joining gate",
);

const profile = read("src/app/profile/page.tsx");
assert.doesNotMatch(profile, /ChartBodygraphModule|editorialBodygraph|bodygraph-peek|role="tablist"/);
const card = profile.slice(profile.indexOf('id="bodygraph"'), profile.indexOf('id="snapshot"'));
assert.match(card, /<ChartBodygraph\s+afterSvg=\{\s*<ChartTypeBox/);
assert.doesNotMatch(card, /<BodyGraph|compact|max-w-\[300px\]/);
assert.equal((profile.match(/<ChartTypeBox/g) ?? []).length, 1);
assert.match(profile, /lg:grid-cols-\[minmax\(0,640px\)_minmax\(0,1fr\)\]/);

const slot = React.createElement("div", { "data-testid": "slot-probe" }, "SLOT");
const html = render(
  React.createElement(ChartBodygraph, {
    definedCenters: ["Ajna", "Throat", "Sacral", "Root"],
    channels: [
      { gates: [17, 62], name: "Acceptance", centers: ["Ajna", "Throat"] },
      { gates: [9, 52], name: "Concentration", centers: ["Sacral", "Root"] },
      { gates: [1, 8], name: "Inspiration", centers: ["G", "Throat"] },
    ],
    activatedGates: [17, 62, 9, 52, 1],
    hangingGates: [{ held: 1, missing: 8, channel: "Inspiration" }],
    personalityGates: [17, 62],
    designGates: [9, 52, 1],
    typeName: "Generator",
    profile: "6/3",
    authority: "Emotional (Solar Plexus)",
    definition: "Split",
    afterSvg: slot,
  }),
);
assert.match(html, /viewBox="-47 0 535 800"/);
assert.ok(html.includes(geom.SILHOUETTE_D.slice(0, 24)), "silhouette path is painted");
assert.match(html, /stroke-width="7\.5"/);
assert.match(html, /stroke-width="5"/);
assert.match(html, /stroke-width="1"/);
assert.doesNotMatch(html, /stroke-dasharray="[^"]*" stroke-width="7\.5"|stroke-width="7\.5"[^>]*stroke-dasharray/);
const svgEnd = html.indexOf("</svg>");
const slotAt = html.indexOf("slot-probe");
const legendAt = html.indexOf("Centers");
assert.ok(svgEnd > 0 && svgEnd < slotAt && slotAt < legendAt, "Type box slot sits between the figure and the legend");
assert.match(html, /Generator/);
assert.match(html, /6\/3/);
assert.doesNotMatch(html, /1\/3/);
assert.doesNotMatch(html, /role="tablist"|bodygraph-peek|ChartBodygraphModule/);
// Full channels are one continuous d, not a midpoint color split.
const full = geom.CURVE_BY_KEY["17-62"].d;
assert.equal(html.split(full).length - 1, 1, "17–62 is a single continuous stroke");
assert.ok(html.includes(">17<") && html.includes(">62<") && html.includes(">9<") && html.includes(">52<"));
assert.ok(!html.includes(">64<"), "unactivated gates are not drawn as chips");
// Hanging 1 is drawn; its partner 8 is not a full chip.
assert.ok(html.includes(">1<"));
assert.ok(!/>8</.test(html));

const both = render(
  React.createElement(ChartBodygraph, {
    definedCenters: ["G", "Throat"],
    channels: [{ gates: [13, 33], name: "The Prodigal", centers: ["G", "Throat"] }],
    personalityGates: [13],
    designGates: [33],
    typeName: "Projector",
    profile: "2/4",
  }),
);
const bothD = geom.CURVE_BY_KEY["13-33"].d;
assert.equal(both.split(bothD).length - 1, 2, "Both is one casing path plus one ink core, same curve");
assert.match(both, new RegExp(`stroke-width="${geom.CHANNEL_WEIGHT + geom.BOTH_CASING_EXTRA}"`));
assert.match(both, new RegExp(`stroke-width="${geom.BOTH_CORE_WEIGHT}"`));

console.log("PASS assert-chart-bodygraph-v9: viewBox, silhouette, curve_route, weights, activated gates only, Type box under the figure, no revived module.");
