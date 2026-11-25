/**
 * Bodygraph revert + collapsible Snapshot boxes (brief 2026-11-24, sha 5047c134…).
 * Real server renders of BodyGraph / ChartTypeBox / ChartDisclosure plus frozen-file
 * byte pins. Browser layout/first-paint evidence lives outside the repo.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// App components use the classic JSX runtime under tsx.
globalThis.React = React;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const sha = (text) => createHash("sha256").update(text).digest("hex");
const { BodyGraph } = await import("../src/components/BodyGraph.tsx");
const { ChartTypeBox } = await import("../src/components/ChartTypeBox.tsx");
const { ChartDisclosure } = await import("../src/components/ChartDisclosure.tsx");
const { I18nProvider } = await import("../src/lib/i18n/index.ts");
const render = (node, locale = "en") =>
  renderToStaticMarkup(
    React.createElement(I18nProvider, { accountLocale: locale }, node),
  );

// --- Frozen files: byte-identical to f0d542d (pre-today) ---
const FROZEN = {
  "src/lib/bodygraphGeometry.ts": "cc8c5433776ee2e8758f95f868597a5821f8077eec8a92ec7bcb6cad15f1b743",
  "src/components/share/ShareBaselineCard.tsx": "fdf24bb638d4c1b8930be2cbbe52387a7dcab790448ce6ccd3780595f260a298",
  "src/components/share/ShareBaselineButton.tsx": "1660a0daeb9e3631095243d3200d6641b0d2f72cac66962627e7d68f867e1d24",
  "src/components/LiteracyCoach.tsx": "de1516e98e78401bb759597110698732876915f14339fe552ecafd0c2bdc9976",
  "src/components/Header.tsx": "daf1194b633f7343857073129ebea7717b1d3b8a64ffd0e4d8db0936401103b2",
  "src/components/AppShell.tsx": "7afd199dfefa8a0250585390505d61a40cc19012bcf6775ca96d263d4d1431cc",
};
for (const [rel, digest] of Object.entries(FROZEN))
  assert.equal(sha(read(rel)), digest, `${rel} stays byte-identical to f0d542d`);

// BodyGraph: f0d542d bytes plus ONLY the optional non-compact slot.
const bodyGraph = read("src/components/BodyGraph.tsx");
const withoutSlot = bodyGraph
  .replace('import { useState, type ReactNode } from "react";', 'import { useState } from "react";')
  .replace(
    "  /** Non-compact only: content placed directly under the SVG, before the legend. */\n  afterSvg?: ReactNode;\n",
    "",
  )
  .replace("  afterSvg,\n}: BodyGraphProps)", "}: BodyGraphProps)")
  .replace("      {!compact ? afterSvg : null}\n\n", "");
assert.equal(
  sha(withoutSlot),
  "f1f25d1e30c611454baf9aa5d10334fd5726225b9e223fe80ccc21aff4c7fae9",
  "BodyGraph differs from f0d542d only by the afterSvg slot",
);

// Brief 94b01b1a… added the Type row and Profile subtitle. Brief cb9f2727… (Read more) excepts
// ChartDeepDive for row ids, exclusive-open, and scroll-margin. Essays stay frozen above.
// Sibling assert-snapshot-read-more-deep-dive locks the new row map.
assert.match(read("src/components/ChartDeepDive.tsx"), /id="deep-dive-type"/);
assert.match(read("src/components/ChartDeepDive.tsx"), /id="deep-dive-strategy"/);
assert.match(read("src/components/ChartDeepDive.tsx"), /id="deep-dive-profile"/);
assert.match(read("src/components/ChartDeepDive.tsx"), /id="deep-dive-definition"/);

// --- Today's module is gone ---
for (const rel of [
  "src/components/ChartBodygraphModule.tsx",
  "src/lib/editorialBodygraphGeometry.ts",
  "scripts/assert-chart-bodygraph-module.mjs",
  "scripts/assert-chart-bodygraph-layout.mjs",
  "scripts/test-chart-bodygraph-interactions.cjs",
  "scripts/fixtures/inter600-gate-bounds.json",
])
  assert.ok(!existsSync(join(root, rel)), `${rel} removed`);

// --- Page wiring (source, scoped to sections) ---
const profile = read("src/app/profile/page.tsx");
assert.doesNotMatch(profile, /ChartBodygraphModule|editorialBodygraph|bodygraph-peek|role="tablist"/);
const bodygraphCard = profile.slice(profile.indexOf('id="bodygraph"'), profile.indexOf('id="snapshot"'));
assert.match(bodygraphCard, /rounded-2xl border border-border bg-elevated p-4"/, "pre-today p-4 card");
assert.match(bodygraphCard, /<h2 className="mb-2 text-sm font-semibold text-fg">\{t\("chart\.people\.bodygraph"\)\}<\/h2>/, "visible Bodygraph heading");
assert.doesNotMatch(bodygraphCard, /sr-only/);
assert.match(bodygraphCard, /<BodyGraph\s+afterSvg=\{\s*<ChartTypeBox/, "Type box rides in the non-compact slot under the SVG");
assert.doesNotMatch(bodygraphCard, /compact/, "Chart uses the full BodyGraph");
for (const prop of ["definedCenters={defined}", "channels={channels}", "activatedGates={activatedGates}", "hangingGates={hangingGates}", "personalityGates={personality", "designGates={design"])
  assert.ok(bodygraphCard.includes(prop), `f0d542d BodyGraph prop ${prop}`);
const snapshot = profile.slice(profile.indexOf('id="snapshot"'), profile.indexOf("<ChartDeepDive"));
assert.doesNotMatch(snapshot, /youreAType|theyreAType|TYPE_BATTERY|ChartTypeBox|bodygraphModule\.preview/, "single Type presentation; no Preview outside Type");
assert.equal((profile.match(/<ChartTypeBox/g) ?? []).length, 1, "exactly one Type box");
// Chart Snapshot cleanup (brief 2026-11-25, sha d42d08d2…): Strategy + Definition became disclosures.
// Snapshot clarity pass (brief 2026-11-25, sha 7c5948ca…): Strategy merged into How you decide.
// Environment line (brief 2026-11-25, sha 681c6bae…): Environment is the fifth, last disclosure.
assert.equal((snapshot.match(/<ChartDisclosure/g) ?? []).length, 5, "Profile, How you decide, Centers to watch, Definition, Environment");
assert.ok(!snapshot.includes('testId="snapshot-strategy"'), "Strategy box merged away");
for (const id of ["snapshot-profile", "snapshot-how-you-decide", "snapshot-centers", "snapshot-definition", "snapshot-environment"])
  assert.ok(snapshot.includes(`testId="${id}"`));
assert.match(snapshot, /<ChartDisclosure\s+id="snapshot-centers"\s+testId="snapshot-centers"\s+openOnHash/);
assert.match(snapshot, /\{watch\.length > 0 && \(\s*<ChartDisclosure/, "Centers to watch omitted when empty");
assert.match(snapshot, /data-testid="chart-time-unknown-caveat"/, "caveat kept inside How you decide");
assert.match(snapshot, /grid items-start gap-3 sm:grid-cols-2/, "Profile + How you decide keep the 2-col row");
assert.doesNotMatch(snapshot, /\["(Type|Profile|Authority|Strategy|Definition)", chart\./, "no Snapshot fact tiles (Type/Profile/Authority removed; Strategy/Definition are disclosures)");
assert.match(profile, /<LiteracyCoach/);
assert.match(profile, /<ChartSectionNav onJump=\{jumpToSection\} \/>/);

// --- Rendered BodyGraph ---
const graphProps = {
  definedCenters: ["Throat", "G", "Sacral"],
  channels: [{ gates: [1, 8] }, { gates: [5, 15] }],
  activatedGates: [1, 8, 5, 15, 34],
  hangingGates: [{ held: 34, missing: 20, channel: "Charisma" }],
  personalityGates: [1, 8, 34],
  designGates: [5, 15],
};
const slot = React.createElement("div", { "data-testid": "slot-probe" }, "SLOT");
const full = render(React.createElement(BodyGraph, { ...graphProps, afterSvg: slot }));
assert.match(full, /viewBox="0 0 240 360"/);
assert.match(full, /max-w-\[300px\]/);
const svgEnd = full.indexOf("</svg>"), slotAt = full.indexOf("slot-probe"), legendAt = full.indexOf('id="bodygraph-legend"');
assert.ok(svgEnd > 0 && svgEnd < slotAt && slotAt < legendAt, "slot sits between SVG and legend");
assert.equal(
  render(React.createElement(BodyGraph, graphProps)),
  full.replace('<div data-testid="slot-probe">SLOT</div>', ""),
  "without the slot, Chart BodyGraph markup is unchanged",
);
const compact = (extra) => render(React.createElement(BodyGraph, { ...graphProps, compact: true, ...extra }));
assert.equal(compact({ afterSvg: slot }), compact({}), "compact/share ignores the slot");
assert.doesNotMatch(compact({}), /bodygraph-legend|slot-probe/);

// --- Rendered Type box: collapsed, voice, small Preview ---
const mine = render(React.createElement(ChartTypeBox, { actualType: "Projector" }));
assert.match(mine, /data-testid="bodygraph-type-card"/);
assert.doesNotMatch(mine.slice(mine.indexOf("<details"), mine.indexOf(">", mine.indexOf("<details"))), /open/, "Type closed on first paint");
assert.match(mine, /<summary class="min-h-11[^"]*"><span>Type:<\/span> <span class="font-medium text-growth">Projector<\/span><\/summary>/, "label-first Type title");
assert.match(mine, /class="absolute right-2 top-2 inline-flex h-6 min-w-6[^"]*text-\[11px\][^"]*"[^>]*>Preview/);
assert.match(mine, /You’re a Projector/);
const theirs = render(React.createElement(ChartTypeBox, { actualType: "Projector", personName: "Kenji" }));
assert.match(theirs, /<span>Kenji · <\/span><span>Type:<\/span> <span class="font-medium text-growth">Projector<\/span>/, "name-first, then Type: value");
assert.doesNotMatch(theirs, /You’re a Projector/);

// --- Rendered disclosure: closed, 44px summary, neutral (no Type wash), no Preview ---
const box = render(
  React.createElement(ChartDisclosure, { id: "snapshot-centers", testId: "snapshot-centers", openOnHash: true, value: "Head · Ajna", label: "Centers to watch" }, "BODY"),
);
assert.match(box, /^<details id="snapshot-centers" data-testid="snapshot-centers" class="rounded-xl border border-border bg-elevated px-3">/);
assert.match(box, /<summary class="min-h-11 [^"]*"><span class="font-semibold">Centers to watch:<\/span> <span class="font-medium text-growth">Head · Ajna<\/span><\/summary>/, "label-first Centers title");
assert.doesNotMatch(box, /color-mix|Preview|style=/);

// --- i18n: Type/Preview kept in all five locales; removed module chrome gone ---
const KEEP = ["typeDetails", "preview", "previewMine", "previewOther", "resetMine", "resetOther"];
for (const locale of ["en", "de", "es", "fr", "nl"]) {
  const messages = read(`src/lib/i18n/messages/${locale}.ts`);
  for (const key of KEEP) assert.ok(messages.includes(`"chart.bodygraphModule.${key}"`), `${locale} ${key}`);
  for (const type of ["Generator", "Manifesting Generator", "Manifestor", "Projector", "Reflector"])
    for (const part of ["youLead", "youBody", "otherLead", "otherBody"])
      assert.ok(messages.includes(`"chart.bodygraphModule.type.${type}.${part}"`), `${locale} ${type} ${part}`);
  const moduleKeys = [...messages.matchAll(/"chart\.bodygraphModule\.([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(moduleKeys.filter((k) => !KEEP.includes(k) && !k.startsWith("type.")), [], `${locale}: no orphan tab/peek/editorial keys`);
}
const { catalogs } = await import("../src/lib/i18n/messages/index.ts");
// Kept/reused chrome is localized (no new de/fr English fallback). Box labels reuse
// existing keys, so this pass adds no new copy.
for (const key of ["chart.bodygraphModule.typeDetails", "chart.bodygraphModule.preview", "chart.people.profile", "chart.people.howYouDecide", "chart.people.centersToWatch", "chart.people.bodygraph"])
  for (const locale of ["de", "fr", "es", "nl"])
    assert.notEqual(catalogs[locale][key], catalogs.en[key], `${locale} ${key} translated`);

await import("./assert-chart-bodygraph-navigation.mjs");
console.log("PASS assert-chart-bodygraph-revert: pre-today BodyGraph (only additive non-compact slot), one collapsed Type box with Preview, five neutral collapsed label-first Snapshot disclosures, #snapshot-centers opener, frozen files, five-locale keys, navigation observer.");
