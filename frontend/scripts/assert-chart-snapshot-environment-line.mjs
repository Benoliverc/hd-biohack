/**
 * Snapshot Environment line (brief 2026-11-25, sha 681c6bae…, pinned to main e3901e3):
 * one new last Snapshot disclosure `Environment: {Value}` (Color of the Design Nodes, from the API),
 * full width after Definition, locked short copy ×6 Colors ×5 locales, Color 3 shown as Workshops,
 * `({marker})` title tag + caveat first in the body when time_unknown is true, no Deep dive pointer,
 * box omitted only when the API could not derive Environment (design-node longitudes missing).
 * Run: npx tsx scripts/assert-chart-snapshot-environment-line.mjs
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
const sha = (t) => createHash("sha256").update(t).digest("hex");
const LOCALES = ["en", "de", "es", "fr", "nl"];
const NAMES = ["Caves", "Markets", "Workshops", "Mountains", "Valleys", "Shores"];
const env = await import("../src/lib/essays/snapshotEnvironmentCopy.ts");
const short = await import("../src/lib/essays/snapshotShortCopy.ts");
const { catalogs } = await import("../src/lib/i18n/messages/index.ts");
const { ChartDisclosure } = await import("../src/components/ChartDisclosure.tsx");
const words = (s) => s.trim().split(/\s+/).length;

// --- Values: six Colors in order, Color 3 = Workshops (traditional 'Kitchens'), never Kitchens/Studios ---
assert.deepEqual([...env.ENVIRONMENT_NAMES], NAMES, "Color 1–6 display names");
assert.deepEqual(Object.keys(env.SNAPSHOT_ENVIRONMENT_COPY), NAMES, "one short copy per Color");
assert.equal(env.SNAPSHOT_COPY_MAX_WORDS, short.SNAPSHOT_COPY_MAX_WORDS, "reuses the clarity-pass budget");
assert.equal(env.SNAPSHOT_COPY_MAX_CHARS, short.SNAPSHOT_COPY_MAX_CHARS);
assert.ok(env.isEnvironmentName("Workshops") && !env.isEnvironmentName("Kitchens") && !env.isEnvironmentName("Studios") && !env.isEnvironmentName(undefined));

// --- Locked copy: budget, five locales, voice locks, FR U+2019, byte pin ---
const userFacing = [];
for (const name of NAMES) {
  const byLoc = env.SNAPSHOT_ENVIRONMENT_COPY[name];
  assert.deepEqual(Object.keys(byLoc).sort(), [...LOCALES].sort(), `${name}: all five locales`);
  for (const l of LOCALES) {
    const s = byLoc[l];
    assert.ok(words(s) <= 80 && s.length <= 500, `${name} ${l}: ${words(s)}w / ${s.length}c within 80w / 500c`);
    if (l !== "en") assert.notEqual(s, byLoc.en, `${name} ${l}: no English fallback`);
    userFacing.push([l, s]);
  }
}
for (const l of LOCALES) {
  userFacing.push([l, env.SNAPSHOT_ENVIRONMENT_APPROX_CAVEAT[l]], [l, env.SNAPSHOT_ENVIRONMENT_APPROX_MARKER[l]], [l, catalogs[l]["chart.people.environment"]]);
  assert.match(env.SNAPSHOT_ENVIRONMENT_APPROX_CAVEAT[l], /Environment/, `${l} caveat keeps the English feature name`);
}
for (const [l, s] of userFacing) {
  // The value names are English proper nouns; Kitchens/Studios never appear as one (lowercase
  // common nouns like “a studio” in the locked Workshops copy are description, not the value).
  assert.doesNotMatch(s, /\b(Kitchens?|Studios)\b/, `${l}: no Kitchens/Studios as a value: ${s}`);
  if (l === "de") assert.doesNotMatch(s, /\b(Sie|Ihr|Ihnen|Ihre)\b/, `de du: ${s}`);
  if (l === "fr") assert.doesNotMatch(s, /\b(vous|votre|vos)\b/i, `fr tu: ${s}`);
  if (l === "fr") assert.ok(!s.includes("'"), `fr uses U+2019: ${s}`);
  if (l === "es") assert.doesNotMatch(s, /\b(usted|ustedes|su|sus)\b/i, `es tú: ${s}`);
  if (l === "nl") assert.doesNotMatch(s, /\b(u|uw)\b/i, `nl je: ${s}`);
}
assert.deepEqual(env.SNAPSHOT_ENVIRONMENT_APPROX_MARKER, { en: "approximate", de: "ungefähr", es: "aproximado", fr: "approximatif", nl: "ongeveer" });
// Byte pin of the brief's locked Environment strings (copy, caveat, marker).
// Re-locked 2026-11-25 for the Snapshot panel fixes brief (sha db2c99ba…): Valleys you-voice rewrite only.
assert.equal(
  sha(JSON.stringify([env.SNAPSHOT_ENVIRONMENT_COPY, env.SNAPSHOT_ENVIRONMENT_APPROX_CAVEAT, env.SNAPSHOT_ENVIRONMENT_APPROX_MARKER])),
  "26ac33e2b672cf7c192fa8fd221db963ee2c4744585957286a3104eb56270a7a",
  "locked Environment copy unchanged",
);
// Other-person Environment map (Snapshot panel fixes): locked, six Colors × five locales.
assert.equal(
  sha(JSON.stringify(env.SNAPSHOT_ENVIRONMENT_OTHER_COPY)),
  "f7940aac236226554deca3eea164bdec9598298ba780d8051839ac0804b56e32",
  "locked other-person Environment copy unchanged",
);
// The clarity-pass locked maps are untouched (same digest as assert-chart-snapshot-clarity-pass).
assert.equal(
  sha(JSON.stringify([short.SNAPSHOT_STRATEGY_COPY, short.SNAPSHOT_DEFINITION_COPY, short.SNAPSHOT_EMOTIONAL_RESPOND_CONNECTOR])),
  "0f9cf0b7dfc94cab35e4d56ca081dcb15e18dafd4e30a3abbaa1247aab955143",
);

// --- Catalog: one new key, English in every locale; the How you decide caveat is not reworded ---
for (const l of LOCALES) {
  assert.equal(catalogs[l]["chart.people.environment"], "Environment", `${l} Environment stays English`);
  assert.doesNotMatch(catalogs[l]["chart.timeUnknownCaveat"], /Environment/, `${l} How you decide caveat unchanged`);
}
assert.equal(catalogs.en["chart.timeUnknownCaveat"], "Birth time is unknown, so how you decide may be a little less precise.");

// --- Title: label-first, English value, locale marker only when time is unknown ---
for (const l of LOCALES)
  for (const name of NAMES) {
    assert.equal(env.snapshotEnvironmentValue(name, l, false), name);
    assert.equal(env.snapshotEnvironmentValue(name, l, true), `${name} (${env.SNAPSHOT_ENVIRONMENT_APPROX_MARKER[l]})`);
  }
const title = (value) =>
  renderToStaticMarkup(React.createElement(ChartDisclosure, { testId: "snapshot-environment", value, label: "Environment" }, "BODY"))
    .replace(/<[^>]+>/g, "").replace("BODY", "");
assert.equal(title(env.snapshotEnvironmentValue("Mountains", "en", false)), "Environment: Mountains");
assert.equal(title(env.snapshotEnvironmentValue("Workshops", "en", false)), "Environment: Workshops");
assert.equal(title(env.snapshotEnvironmentValue("Mountains", "en", true)), "Environment: Mountains (approximate)");
assert.equal(title(env.snapshotEnvironmentValue("Mountains", "de", true)), "Environment: Mountains (ungefähr)");
assert.equal(title(env.snapshotEnvironmentValue("Workshops", "fr", true)), "Environment: Workshops (approximatif)");
const box = renderToStaticMarkup(React.createElement(ChartDisclosure, { testId: "snapshot-environment", value: "Shores", label: "Environment" }, "B"));
assert.match(box, /^<details data-testid="snapshot-environment" class="rounded-xl border border-border bg-elevated px-3"><summary class="min-h-11 /, "collapsed, 44px summary");

// --- Page source: placement, gate, caveat-first, no pointer, Deep dive untouched ---
const profile = read("src/app/profile/page.tsx");
const snapshot = profile.slice(profile.indexOf('id="snapshot"'), profile.indexOf("<ChartDeepDive"));
const at = snapshot.indexOf('testId="snapshot-environment"');
assert.ok(at > snapshot.indexOf('testId="snapshot-definition"'), "Environment after Definition");
assert.equal(snapshot.lastIndexOf("<ChartDisclosure"), snapshot.lastIndexOf("<ChartDisclosure", at), "Environment is the last disclosure");
const envBlock = snapshot.slice(snapshot.lastIndexOf("{environmentName && (", at), snapshot.indexOf("</ChartDisclosure>", at));
assert.ok(envBlock.startsWith("{environmentName && ("), "box shown only when the API returned an Environment");
assert.doesNotMatch(snapshot.slice(snapshot.indexOf('testId="snapshot-definition"')), /sm:grid-cols-2/, "full width");
assert.match(envBlock, /value=\{snapshotEnvironmentValue\(environmentName, locale, environmentApprox\)\}\s+label=\{t\("chart\.people\.environment"\)\}/);
assert.doesNotMatch(envBlock, /SnapshotDeepDivePointer|jumpToSection/, "no Deep dive pointer");
assert.ok(
  envBlock.indexOf('data-testid="snapshot-environment-approx-caveat"') > 0 &&
    envBlock.indexOf('data-testid="snapshot-environment-approx-caveat"') < envBlock.indexOf('data-testid="snapshot-environment-copy"'),
  "caveat before the short copy",
);
assert.match(envBlock, /\{environmentApprox \? \(/, "caveat only when time is unknown");
assert.match(profile, /const environmentName = isEnvironmentName\(chart\?\.environment\) \? chart\.environment : null;/);
assert.match(
  profile,
  /const environmentApprox =\s+viewMode === "saved" \? savedTimeUnknown : viewMode === "preview" \? previewTimeUnknown : false;/,
  "approximate mark driven only by time_unknown (saved row or preview form); legacy null is a normal show",
);
assert.match(profile, /setPreviewTimeUnknown\(timeUnknown\);\s+setViewMode\("preview"\);/);
assert.doesNotMatch(read("src/components/ChartDeepDive.tsx"), /environment/i, "no Deep dive Environment row");

console.log("PASS assert-chart-snapshot-environment-line: Environment last + full width after Definition, label-first English title ×5 locales, Workshops (no Kitchens/Studios), locked copy within 80w/500c, approximate marker + caveat-first only when time_unknown, no pointer, shown only when the API derived it.");
