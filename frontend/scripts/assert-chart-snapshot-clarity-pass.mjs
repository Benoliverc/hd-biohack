/**
 * Chart Snapshot clarity pass (brief 2026-11-25, sha 7c5948ca…, pinned to main 497a750):
 * Strategy merged into How you decide, label-first Snapshot titles, Snapshot-only short
 * Strategy/Definition copy (<= 80 words / 500 chars) in five locales, ChartDisclosure
 * open/close animation with a reduced-motion guard, Definition full width, Deep dive pointer.
 * Run: npx tsx scripts/assert-chart-snapshot-clarity-pass.mjs
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
const copy = await import("../src/lib/essays/snapshotShortCopy.ts");
const { catalogs } = await import("../src/lib/i18n/messages/index.ts");
const { ChartDisclosure } = await import("../src/components/ChartDisclosure.tsx");
const { resolveHdCopy } = await import("../src/lib/essays/resolveHdCopy.ts");
const EN = await import("../src/lib/hdCopy.ts");

// --- (d)(g) Short copy: every strategy/definition, five locales, budget, locks ---
const words = (s) => s.trim().split(/\s+/).length;
assert.equal(copy.SNAPSHOT_COPY_MAX_WORDS, 80);
assert.equal(copy.SNAPSHOT_COPY_MAX_CHARS, 500);
assert.deepEqual(Object.keys(copy.SNAPSHOT_STRATEGY_COPY).sort(), Object.keys(EN.STRATEGY_COPY).sort(), "one short Strategy per official strategy");
assert.deepEqual(Object.keys(copy.SNAPSHOT_DEFINITION_COPY).sort(), Object.keys(EN.DEFINITION_COPY).sort(), "one short Definition per official definition");
const OLD = [/Feel the gut yes first/, /Siente primero el sí del cuerpo/, /Voel eerst het ja vanuit je buik/];
const all = [];
for (const map of [copy.SNAPSHOT_STRATEGY_COPY, copy.SNAPSHOT_DEFINITION_COPY])
  for (const [key, byLoc] of Object.entries(map)) {
    assert.deepEqual(Object.keys(byLoc).sort(), [...LOCALES].sort(), `${key}: all five locales`);
    for (const l of LOCALES) {
      const s = byLoc[l];
      assert.ok(words(s) <= 80 && s.length <= 500, `${key} ${l}: ${words(s)}w / ${s.length}c within 80w / 500c`);
      if (l !== "en") assert.notEqual(s, byLoc.en, `${key} ${l}: no English fallback`);
      // Shorter than the Deep dive summary + learnMore it replaces on Snapshot.
      const deep = (EN.STRATEGY_COPY[key] ?? EN.DEFINITION_COPY[key]);
      assert.ok(words(s) < words(`${deep.summary} ${deep.learnMore}`), `${key} ${l} shorter than Deep dive`);
      all.push([l, s]);
    }
  }
for (const l of LOCALES) all.push([l, copy.SNAPSHOT_EMOTIONAL_RESPOND_CONNECTOR[l]], [l, catalogs[l]["chart.people.readMoreInDeepDive"]]);
for (const [l, s] of all) {
  for (const rx of OLD) assert.doesNotMatch(s, rx, `${l} old MG phrasing absent`);
  if (l === "de") assert.doesNotMatch(s, /\b(Sie|Ihr|Ihnen|Ihre)\b/, `de du: ${s}`);
  if (l === "fr") assert.doesNotMatch(s, /\b(vous|votre|vos)\b/i, `fr tu: ${s}`);
  if (l === "es") assert.doesNotMatch(s, /\b(usted|ustedes|su|sus)\b/i, `es tú: ${s}`);
  if (l === "nl") assert.doesNotMatch(s, /\b(u|uw)\b/i, `nl je: ${s}`);
}
// Byte pin of the locked strings (brief tables); any edit must be a deliberate re-lock.
assert.equal(
  sha(JSON.stringify([copy.SNAPSHOT_STRATEGY_COPY, copy.SNAPSHOT_DEFINITION_COPY, copy.SNAPSHOT_EMOTIONAL_RESPOND_CONNECTOR])),
  "0f9cf0b7dfc94cab35e4d56ca081dcb15e18dafd4e30a3abbaa1247aab955143",
  "locked Snapshot copy unchanged",
);
const POINTER = { en: "Read more in Deep dive", de: "Mehr dazu in Deep dive", es: "Lee más en Deep dive", fr: "Lis-en plus dans Deep dive", nl: "Lees meer in Deep dive" };
for (const l of LOCALES) {
  assert.equal(catalogs[l]["chart.people.readMoreInDeepDive"], POINTER[l], `${l} Deep dive pointer`);
  assert.equal(catalogs[l]["chart.people.authority"], "Authority", `${l} Authority stays English`);
  assert.equal(catalogs[l]["chart.people.strategy"], "Strategy", `${l} Strategy stays English`);
  assert.equal(Object.keys(catalogs[l]).length, Object.keys(catalogs.en).length, `${l} catalog parity`);
}

// --- (b) Default 5 connector: Emotional + respond only ---
assert.equal(copy.needsEmotionalRespondConnector("To Respond (then inform)", "Emotional (Solar Plexus)"), true, "Emotional MG");
assert.equal(copy.needsEmotionalRespondConnector("To Respond", "Emotional (Solar Plexus)"), true, "Emotional Generator");
assert.equal(copy.needsEmotionalRespondConnector("To Respond", "Sacral"), false, "Sacral Generator");
assert.equal(copy.needsEmotionalRespondConnector("To Respond (then inform)", "Sacral"), false, "Sacral MG");
assert.equal(copy.needsEmotionalRespondConnector("Wait for the Invitation", "Emotional (Solar Plexus)"), false, "Emotional Projector");
assert.equal(copy.needsEmotionalRespondConnector("To Inform", "Emotional (Solar Plexus)"), false, "Emotional Manifestor");

// --- (a)(b) Merged section source: one section, fixed body order ---
const profile = read("src/app/profile/page.tsx");
const snapshot = profile.slice(profile.indexOf('id="snapshot"'), profile.indexOf("<ChartDeepDive"));
assert.ok(!snapshot.includes("snapshot-strategy\""), "no separate Strategy box");
const decide = snapshot.slice(snapshot.indexOf('testId="snapshot-how-you-decide"'), snapshot.indexOf("</ChartDisclosure>", snapshot.indexOf('testId="snapshot-how-you-decide"')));
assert.match(decide, /value=\{`\$\{authorityStr\} · \$\{strategyStr\}`\}\s+label=\{t\("chart\.people\.howYouDecide"\)\}/, "collapsed: How you decide: authority · strategy");
const steps = [
  't("chart.people.strategy")',
  "snapshotStrategyCopy(strategyStr, locale)",
  't("chart.people.authority")',
  "AUTHORITY_PLAIN[authorityStr]",
  "needsEmotionalRespondConnector(strategyStr, authorityStr)",
  'data-testid="chart-time-unknown-caveat"',
  "<ReadMoreInDeepDive",
].map((s) => decide.indexOf(s));
assert.ok(steps.every((i, n) => i > 0 && (n === 0 || i > steps[n - 1])), "Strategy → Authority → connector → caveat → pointer");
assert.doesNotMatch(decide, /STRATEGY_COPY|bodysYes/, "Deep dive Strategy summary not repeated on Snapshot");
// Environment line (brief 2026-11-25, sha 681c6bae…): Environment follows Definition with no pointer.
// Read more (brief cb9f2727…): Profile, How you decide, and Definition each open a mapped Core row.
const definition = snapshot.slice(snapshot.indexOf('testId="snapshot-definition"'), snapshot.indexOf('testId="snapshot-environment"'));
assert.ok(snapshot.indexOf('testId="snapshot-environment"') > snapshot.indexOf('testId="snapshot-definition"'), "Environment after Definition");
assert.doesNotMatch(snapshot.slice(snapshot.indexOf('testId="snapshot-environment"')), /<ReadMoreInDeepDive/, "no Deep dive pointer on Environment");
assert.doesNotMatch(snapshot.slice(snapshot.indexOf('testId="snapshot-centers"'), snapshot.indexOf('testId="snapshot-definition"')), /<ReadMoreInDeepDive/, "no pointer on Centers");
assert.match(definition, /snapshotDefinitionCopy\(definitionStr, locale\)[\s\S]*<ReadMoreInDeepDive/, "Definition short copy + pointer");
assert.equal((snapshot.match(/<ReadMoreInDeepDive/g) ?? []).length, 3, "pointer on Profile, How you decide, and Definition");
assert.match(decide, /rowId="deep-dive-strategy"/, "How you decide opens Strategy");
assert.doesNotMatch(decide, /deep-dive-inner-authority|innerAuthority/, "How you decide does not target Inner Authority");
assert.match(snapshot, /onJump=\{\(\) => jumpToSection\("deep-dive-profile"\)\}/, "Profile pointer opens its row");
assert.match(snapshot, /onJump=\{\(\) => jumpToSection\("deep-dive-strategy"\)\}/, "How you decide pointer opens Strategy");
assert.match(snapshot, /onJump=\{\(\) => jumpToSection\("deep-dive-definition"\)\}/, "Definition pointer opens its row");

// --- (c) Label-first titles (rendered), translated label + colon + English value ---
const title = (label, value) =>
  renderToStaticMarkup(React.createElement(ChartDisclosure, { testId: "x", label, value }, "B")).match(/<summary[^>]*>(.*?)<\/summary>/)[1].replace(/<[^>]+>/g, "");
assert.equal(title(catalogs.en["chart.people.profile"], "6/2"), "Profile: 6/2");
assert.equal(title(catalogs.de["chart.people.profile"], "6/2"), "Profil: 6/2");
assert.equal(title(catalogs.es["chart.people.profile"], "6/2"), "Perfil: 6/2");
assert.equal(title(catalogs.fr["chart.people.profile"], "6/2"), "Profil: 6/2");
assert.equal(title(catalogs.nl["chart.people.profile"], "6/2"), "Profiel: 6/2");
assert.equal(title(catalogs.en["chart.people.definition"], "Split"), "Definition: Split");
assert.equal(title(catalogs.en["chart.people.howYouDecide"], "Emotional (Solar Plexus) · To Respond (then inform)"), "How you decide: Emotional (Solar Plexus) · To Respond (then inform)");
assert.equal(title(catalogs.en["chart.people.centersToWatch"], "Head · Sacral · Ego / Heart"), "Centers to watch: Head · Sacral · Ego / Heart");
assert.match(read("src/components/ChartTypeBox.tsx"), /<span>Type:<\/span>\{" "\}\s*<span className="font-medium text-growth">\{displayedType \?\? actualType\}<\/span>/, "Type: value");

// --- (e) Animation with reduced-motion guard on ChartDisclosure only ---
const disclosure = read("src/components/ChartDisclosure.tsx");
const ms = Number(disclosure.match(/const EXPAND_MS = (\d+);/)?.[1]);
assert.ok(ms >= 200 && ms <= 250, `expand ${ms}ms`);
assert.match(disclosure, /matchMedia\("\(prefers-reduced-motion: reduce\)"\)\.matches/, "reduced-motion guard");
assert.match(disclosure, /if \(prefersReducedMotion\(\)\) return; \/\/ native, instant toggle/);
assert.match(disclosure, /className="min-h-11 /, "44px summary");
assert.doesNotMatch(read("src/components/ChartTypeBox.tsx"), /animate\(|prefers-reduced-motion/, "no new Type box animation");

// --- (f) Frozen: essays and graph unchanged. ChartDeepDive is excepted by the Read more brief
// (row ids, exclusive-open, scroll-margin on every Core row). Sibling assert-snapshot-read-more-deep-dive locks that.
const FROZEN = {
  "src/lib/hdCopy.ts": "63c5acd82b0a65dc2d58a275a212f7a23025fffad56c30e93530c7851f016136",
  "src/lib/essays/hdCopy.es.ts": "895abfa6bb5270c546b8a96778e80eebb60c9215b8961a9a40eebfd3709451b6",
  "src/lib/essays/hdCopy.nl.ts": "bd44bfc69afc237a978bc73586ec0af5aa474f7e6dfdd94f87c8970d3b8bd252",
  "src/lib/essays/strategySummaryOverlay.ts": "9e00df4d78a5c5db6ea972e8a312ada9da5a70c35cdd936c9a802317180ab7ca",
  "src/components/ChartSummaryLearnMore.tsx": "c959f936cc72e5528e56d5fb70c1cf983da1ecb9d53f21e85de4e416c90533af",
  "src/components/BodyGraph.tsx": "8f9380005b90a2b6e34190650a599c248d79e84e13c99e15ea9086d5b3dd2da8",
};
for (const [rel, digest] of Object.entries(FROZEN)) assert.equal(sha(read(rel)), digest, `${rel} byte-identical to 497a750`);
const card = profile.slice(profile.indexOf('id="bodygraph"'), profile.indexOf('id="snapshot"'));
const cardWithoutReadMore = card.replace(/\n\s*onReadMoreInDeepDive=\{\(\) => jumpToSection\("deep-dive-type"\)\}/, "");
assert.equal(sha(cardWithoutReadMore), "b5a68485937e0107918c907a7b25bdb760fe40c95038ce77133842f0ad5313b8", "Bodygraph card unchanged except the Type Read more callback");
// Deep dive keeps the long essays (summary + learnMore) in every locale.
for (const l of LOCALES) {
  const hd = resolveHdCopy(l);
  for (const k of Object.keys(EN.STRATEGY_COPY)) assert.ok(hd.STRATEGY_COPY[k].learnMore.length > 300, `${l} ${k} Deep dive learnMore kept`);
}

console.log("PASS assert-chart-snapshot-clarity-pass: one How you decide section (authority · strategy), label-first titles ×5 locales, locked short copy within 80w/500c ×5 locales, Emotional-respond connector only, Read more pointers on Profile / How you decide / Definition, 220ms animation with reduced-motion guard, essays / graph frozen.");
