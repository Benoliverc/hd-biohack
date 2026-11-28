/**
 * Complete-channel bridge glow (brief chart-channel-bridge-glow).
 * Run: npx tsx scripts/assert-chart-channel-bridge-glow.mjs
 *
 * The glow class sits on the existing onA && onB paths. Curve d is not cloned.
 * BodyGraph.tsx, bodygraphGeometry.ts, and bodygraphGeometryV2.ts stay pinned.
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
const GEOMETRY_V2_SHA = "2e21789f16656487f39876bddcf5ad6ca0fea372e1e9aa9e03f1a1f795725d02";
const LOCKFILE_SHA = "a6a9733cf7ab81eee53471a02cd27bc06e215ca57c290afd0b9fc94cdf191324";
const TYPOGRAPHY_ASSERT_SHA = "19fee28ee9c7deccc126a36ca880dd3074990bdac918300f59b44f365b5d6898";
const GLOBALS_CSS_SHA = "2c9cc2fdd9650f26f517cf3265e18b6f366976be4c20ceb94cc27f74a8082195";

const INSPECTOR_REDUCED_MOTION = `@media (prefers-reduced-motion: reduce) {
  .chart-v9-inspector {
    animation: none;
  }
}`;

const geom = await import("../src/lib/bodygraphGeometryV2.ts");
const { ChartBodygraph } = await import("../src/components/ChartBodygraph.tsx");
const { I18nProvider } = await import("../src/lib/i18n/index.ts");
const render = (node) =>
  renderToStaticMarkup(React.createElement(I18nProvider, { accountLocale: "en" }, node));

function pathTags(html) {
  return html.match(/<path\b[^>]*>/g) || [];
}

// --- Source: classes only on the complete-channel branch, and d is not cloned. ---
const src = read("src/components/ChartBodygraph.tsx");
const completeStart = src.indexOf("if (onA && onB) {");
const hangingStart = src.indexOf("} else if (onA || onB) {", completeStart);
assert.ok(completeStart > 0 && hangingStart > completeStart, "complete and hanging branches are present");
const complete = src.slice(completeStart, hangingStart);
const hairStart = src.lastIndexOf("if (!(onA && onB))", completeStart);
const hair = src.slice(hairStart, completeStart);
const hanging = src.slice(hangingStart, src.indexOf("const areaLabels", hangingStart));
const outside = src.slice(0, completeStart) + src.slice(hangingStart);
assert.equal(outside.split("chart-v9-bridge").length - 1, 0, "chart-v9-bridge is only in the complete-channel branch");
assert.match(complete, /chart-v9-bridge chart-v9-bridge-p/);
assert.match(complete, /chart-v9-bridge chart-v9-bridge-d/);
assert.match(complete, /chart-v9-bridge chart-v9-bridge-both/);
assert.doesNotMatch(hair, /chart-v9-bridge/);
assert.doesNotMatch(hanging, /chart-v9-bridge/, "paint() and the joining dash do not glow");
assert.equal(complete.split("d={curve.d}").length - 1, 3, "complete branch still has casing, core, and single path only");

const casingAt = complete.indexOf("key={`c-${key}`}");
const casingTag = complete.slice(casingAt, complete.indexOf(">", casingAt));
assert.match(casingTag, /className="chart-v9-bridge chart-v9-bridge-both"/);
assert.match(casingTag, /d=\{curve\.d\}/);
const coreAt = complete.indexOf("key={`k-${key}`}");
const coreTag = complete.slice(coreAt, complete.indexOf("/>", coreAt));
assert.match(coreTag, /d=\{curve\.d\}/);
assert.doesNotMatch(coreTag, /chart-v9-bridge/, "mixed ink core stays unfiltered");
const singleAt = complete.indexOf("key={`f-${key}`}");
const singleTag = complete.slice(singleAt, complete.indexOf(">", singleAt));
assert.match(singleTag, /chart-v9-bridge chart-v9-bridge-p/);
assert.match(singleTag, /chart-v9-bridge chart-v9-bridge-d/);
assert.match(singleTag, /d=\{curve\.d\}/);

// --- CSS: 6s breathe, same-ink drop-shadow, static reduced-motion fallback. ---
const css = read("src/app/profile/chart-field-notes.css");
assert.equal(css.split(INSPECTOR_REDUCED_MOTION).length - 1, 1, "inspector reduced-motion rule is byte-for-byte unchanged");
assert.match(css, /@keyframes chart-v9-bridge-breathe \{/);
assert.match(css, /filter:\s*drop-shadow\(0 0 4px rgb\(from var\(--v9-bridge-glow\) r g b \/ 0\.20\)\)/);
assert.match(css, /filter:\s*drop-shadow\(0 0 7px rgb\(from var\(--v9-bridge-glow\) r g b \/ 0\.34\)\)/);
assert.match(
  css,
  /\.chart-v9-bridge \{\s*--v9-bridge-glow:\s*var\(--v9-ink\);\s*animation:\s*chart-v9-bridge-breathe 6s ease-in-out infinite alternate;/,
);
assert.match(css, /\.chart-v9-bridge-p \{\s*--v9-bridge-glow:\s*var\(--v9-ink\);/);
assert.match(css, /\.chart-v9-bridge-d,\s*\.chart-v9-bridge-both \{\s*--v9-bridge-glow:\s*var\(--v9-clay\);/);
assert.match(
  css,
  /@media \(prefers-reduced-motion: reduce\) \{\s*\.chart-v9-bridge \{\s*animation:\s*none;\s*filter:\s*drop-shadow\(0 0 5px rgb\(from var\(--v9-bridge-glow\) r g b \/ 0\.26\)\);/,
);

// --- Render: one personality bridge, one design bridge, one hanging half, one joining dash. ---
const html = render(
  React.createElement(ChartBodygraph, {
    definedCenters: ["Ajna", "Throat", "Sacral", "Root", "Spleen"],
    channels: [
      { gates: [17, 62], name: "Acceptance", centers: ["Ajna", "Throat"] },
      { gates: [9, 52], name: "Concentration", centers: ["Sacral", "Root"] },
    ],
    activatedGates: [16],
    personalityGates: [17, 62],
    designGates: [9, 52],
    typeName: "Generator",
    profile: "6/3",
  }),
);
const tags = pathTags(html);
const personality = tags.filter((tag) => tag.includes(geom.CURVE_BY_KEY["17-62"].d));
const design = tags.filter((tag) => tag.includes(geom.CURVE_BY_KEY["9-52"].d));
assert.equal(personality.length, 1, "17–62 d appears once");
assert.match(personality[0], /class="chart-v9-bridge chart-v9-bridge-p"/);
assert.match(personality[0], /stroke="var\(--v9-ink\)"/);
assert.match(personality[0], /stroke-width="7\.5"/);
assert.equal(design.length, 1, "9–52 d appears once");
assert.match(design[0], /class="chart-v9-bridge chart-v9-bridge-d"/);
assert.match(design[0], /stroke="var\(--v9-clay\)"/);
assert.match(design[0], /stroke-width="7\.5"/);
const hangingPaths = tags.filter((tag) => tag.includes('stroke="url(#'));
assert.ok(hangingPaths.length >= 1, "hanging half is drawn");
for (const tag of hangingPaths) assert.doesNotMatch(tag, /chart-v9-bridge/);
assert.ok(hangingPaths.some((tag) => tag.includes('stroke-width="5"')));
const dashes = tags.filter((tag) => tag.includes('stroke-dasharray="4 4"'));
assert.equal(dashes.length, 1, "one joining dash");
assert.doesNotMatch(dashes[0], /chart-v9-bridge/);
assert.match(dashes[0], /stroke="var\(--v9-growth\)"/);
assert.match(dashes[0], /stroke-width="1\.6"/);
assert.ok(dashes[0].includes(geom.CURVE_BY_KEY["16-48"].d), "the dash is the 16–48 curve, not a clone of a complete channel");
const hairlines = tags.filter((tag) => tag.includes("var(--v9-hair)"));
assert.ok(hairlines.length > 0);
for (const tag of hairlines) {
  assert.doesNotMatch(tag, /chart-v9-bridge/);
  assert.match(tag, /stroke-width="1"/);
}
assert.match(html, /stroke-width="7\.5"/);
assert.match(html, /stroke-width="5"/);
assert.match(html, /stroke-width="1"/);
assert.equal(tags.filter((tag) => tag.includes("chart-v9-bridge")).length, 2);

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
assert.equal(both.split(bothD).length - 1, 2, "both is casing plus core, same curve, no glow clone");
const bothTags = pathTags(both).filter((tag) => tag.includes(bothD));
assert.equal(bothTags.length, 2);
const bothCasing = bothTags.filter((tag) => tag.includes("chart-v9-bridge-both"));
const bothCore = bothTags.filter((tag) => !tag.includes("chart-v9-bridge"));
assert.equal(bothCasing.length, 1);
assert.equal(bothCore.length, 1);
assert.match(bothCasing[0], new RegExp(`stroke-width="${geom.CHANNEL_WEIGHT + geom.BOTH_CASING_EXTRA}"`));
assert.match(bothCasing[0], /stroke="var\(--v9-clay\)"/);
assert.match(bothCore[0], new RegExp(`stroke-width="${geom.BOTH_CORE_WEIGHT}"`));
assert.match(bothCore[0], /stroke="var\(--v9-ink\)"/);

// --- Frozen files, one new script line, typography check 7 still the 24px Move tag. ---
assert.equal(sha(read("src/components/BodyGraph.tsx")), BODYGRAPH_SHA);
assert.equal(sha(read("src/lib/bodygraphGeometry.ts")), GEOMETRY_SHA);
assert.equal(sha(read("src/lib/bodygraphGeometryV2.ts")), GEOMETRY_V2_SHA);
assert.equal(sha(read("package-lock.json")), LOCKFILE_SHA);
assert.equal(sha(read("src/app/globals.css")), GLOBALS_CSS_SHA);
assert.equal(sha(read("scripts/assert-scoped-display-serif.mjs")), TYPOGRAPHY_ASSERT_SHA);
const typography = read("scripts/assert-scoped-display-serif.mjs");
assert.match(typography, /const MOVE_SENTENCE_TAG_6085A38 =/);
assert.match(typography, /check 7: the Move-sentence opening tag, with type-statement restored to type-title, equals the 6085a38 tag/);
assert.match(read("tailwind.config.ts"), /"type-statement": \["1\.5rem", \{ lineHeight: "1\.4", fontWeight: "500" }\]/);
assert.match(read("src/app/globals.css"), /\.type-statement \{\n  font-size: 1\.5rem; \/\* 24px \*\//);

const pkg = read("package.json");
const scriptLine = '"assert:chart-channel-bridge-glow": "npx tsx scripts/assert-chart-channel-bridge-glow.mjs"';
assert.equal(pkg.split(scriptLine).length - 1, 1, "assert:chart-channel-bridge-glow appears once");
const parsed = JSON.parse(pkg);
const ids = [...pkg.matchAll(/"(assert:[^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(ids.filter((id, index) => ids.indexOf(id) !== index), []);
assert.equal(Object.keys(parsed.scripts).filter((key) => key.startsWith("assert:")).length, ids.length);
assert.equal(parsed.scripts["assert:chart-channel-bridge-glow"], "npx tsx scripts/assert-chart-channel-bridge-glow.mjs");
assert.equal(parsed.scripts["assert:scoped-display-serif"], "npx tsx scripts/assert-scoped-display-serif.mjs");
assert.equal(parsed.scripts["assert:today-signal-structure"], "npx tsx scripts/assert-today-signal-structure.mjs");
assert.deepEqual(parsed.dependencies, {
  "html-to-image": "^1.11.13",
  html2canvas: "^1.4.1",
  "lucide-react": "^1.59.0",
  next: "14.2.35",
  react: "^18",
  "react-dom": "^18",
});
assert.deepEqual(parsed.devDependencies, {
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  eslint: "^8",
  "eslint-config-next": "14.2.35",
  postcss: "^8",
  tailwindcss: "^3.4.1",
  typescript: "^5",
});

console.log("PASS assert-chart-channel-bridge-glow");
