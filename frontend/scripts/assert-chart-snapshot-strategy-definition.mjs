/**
 * Chart Snapshot cleanup (brief 2026-11-25, sha d42d08d2…): no Type / Profile / Authority
 * fact tiles; Strategy + Definition are collapsed ChartDisclosures; How you decide shows
 * authority when collapsed; locked MG Strategy summary in en/de/es/fr/nl.
 * Updated by the Snapshot clarity pass (brief 2026-11-25, sha 7c5948ca…): Strategy merged into
 * How you decide (four disclosures; five with the Environment line), label-first titles, Snapshot bodies are the short copy.
 * Deep dive MG summaries stay pinned here; see assert-chart-snapshot-clarity-pass.mjs.
 * Run: npx tsx scripts/assert-chart-snapshot-strategy-definition.mjs
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
const { resolveHdCopy } = await import("../src/lib/essays/resolveHdCopy.ts");
const EN = await import("../src/lib/hdCopy.ts");
const { ChartDisclosure } = await import("../src/components/ChartDisclosure.tsx");

const MG = "To Respond (then inform)";
const LOCKED = {
  en: "Wait for a gut yes, then tell the people it'll affect before you move. (Strategy: To Respond, then inform)",
  de: "Warte auf ein Ja aus dem Bauch, dann sag den Betroffenen Bescheid, bevor du loslegst. (Strategy: To Respond, then inform)",
  es: "Espera un sí del cuerpo, y luego avisa a las personas a las que va a afectar antes de moverte. (Strategy: To Respond, then inform)",
  fr: "Attends un oui du corps, puis préviens les personnes concernées avant d\u2019avancer. (Strategy: To Respond, then inform)",
  nl: "Wacht op een ja vanuit je buik, en vertel het daarna de mensen die het raakt voordat je beweegt. (Strategy: To Respond, then inform)",
};
const OLD = [/Feel the gut yes first/, /Siente primero el sí del cuerpo/, /Voel eerst het ja vanuit je buik/];

// --- (h) MG Strategy summary: locked string per locale, old phrasing gone, learnMore untouched ---
for (const [loc, want] of Object.entries(LOCKED)) {
  const copy = resolveHdCopy(loc);
  assert.equal(copy.STRATEGY_COPY[MG].summary, want, `${loc} MG Strategy summary`);
  for (const rx of OLD) assert.doesNotMatch(JSON.stringify(copy.STRATEGY_COPY), rx, `${loc} old MG phrasing`);
  for (const k of Object.keys(EN.STRATEGY_COPY)) assert.ok(copy.STRATEGY_COPY[k]?.summary, `${loc} ${k} summary`);
  assert.equal(copy.TYPE_BATTERY, resolveHdCopy(loc === "de" || loc === "fr" ? "en" : loc).TYPE_BATTERY, `${loc} TYPE_BATTERY untouched`);
}
for (const loc of ["de", "fr"]) {
  const copy = resolveHdCopy(loc);
  assert.equal(copy.STRATEGY_COPY[MG].learnMore, EN.STRATEGY_COPY[MG].learnMore, `${loc} learnMore stays the English fallback`);
  for (const k of Object.keys(EN.STRATEGY_COPY).filter((k) => k !== MG))
    assert.deepEqual(copy.STRATEGY_COPY[k], EN.STRATEGY_COPY[k], `${loc} sibling ${k} unchanged`);
  assert.equal(copy.DEFINITION_COPY, EN.DEFINITION_COPY);
}
for (const rel of ["src/lib/hdCopy.ts", "src/lib/essays/hdCopy.es.ts", "src/lib/essays/hdCopy.nl.ts", "src/lib/essays/strategySummaryOverlay.ts",
  ...["en", "de", "es", "fr", "nl"].map((l) => `src/lib/i18n/messages/${l}.ts`)])
  for (const rx of OLD) assert.doesNotMatch(read(rel), rx, `${rel} has no old MG phrasing`);
// Voice locks on the new lines (FR tu, DE du, ES tú, NL je).
assert.doesNotMatch(LOCKED.de, /\b(Sie|Ihr|Ihnen)\b/);
assert.doesNotMatch(LOCKED.fr, /\b(vous|votre)\b/i);
assert.doesNotMatch(LOCKED.es, /\b(usted|ustedes)\b/i);
assert.doesNotMatch(LOCKED.nl, /\b(u|uw)\b/);

// --- (a)(b)(c) Snapshot source ---
const profile = read("src/app/profile/page.tsx");
const snapshot = profile.slice(profile.indexOf('id="snapshot"'), profile.indexOf("<ChartDeepDive"));
assert.doesNotMatch(snapshot, /\["(Type|Profile|Authority|Strategy|Definition)", chart\./, "no fact tiles");
assert.doesNotMatch(snapshot, /lg:grid-cols-5/, "fact-tile grid gone");
// Clarity pass: Strategy merged into How you decide. Environment line (brief 2026-11-25,
// sha 681c6bae…) adds Environment last, so five disclosures.
assert.equal((snapshot.match(/<ChartDisclosure/g) ?? []).length, 5);
assert.ok(!snapshot.includes('testId="snapshot-strategy"'), "no separate Strategy box");
const order = ["snapshot-profile", "snapshot-how-you-decide", "snapshot-centers", "snapshot-definition", "snapshot-environment"].map((id) => snapshot.indexOf(`testId="${id}"`));
assert.ok(order.every((i) => i > 0) && order.every((i, n) => n === 0 || i > order[n - 1]), "Definition after Centers to watch; Environment after Definition");
const tail = snapshot.slice(snapshot.indexOf('testId="snapshot-centers"'));
assert.doesNotMatch(tail, /sm:grid-cols-2/, "Definition and Environment are full width (no one-sided 2-col row)");
assert.match(snapshot, /testId="snapshot-definition"\s+value=\{definitionStr\}\s+label=\{t\("chart\.people\.definition"\)\}/);
assert.doesNotMatch(snapshot, /ChartSummaryLearnMore|learnMore/, "Snapshot no longer renders summary + learnMore");
// Default 1 (#147, extended): collapsed How you decide shows authority and strategy, for every authority.
assert.match(snapshot, /testId="snapshot-how-you-decide"\s+value=\{`\$\{authorityStr\} · \$\{strategyStr\}`\}/);
assert.match(snapshot, /testId="snapshot-profile"\s+value=\{<span[^>]*>\{profilePresentation\(profileStr\)\.value\}/, "brief 94b01b1a: Profile summary includes canonical names");
assert.match(snapshot, /data-testid="chart-time-unknown-caveat"/, "caveat kept inside How you decide");
// v9 replaces the classic Chart mount. Type box and the data props stay; the card is no longer byte-pinned.
const card = profile.slice(profile.indexOf('id="bodygraph"'), profile.indexOf('id="snapshot"'));
assert.match(card, /<ChartBodygraph\s+afterSvg=\{\s*<ChartTypeBox/, "Type box still under the Chart figure");
assert.match(card, /definedCenters=\{defined\}/);
assert.match(card, /channels=\{channels\}/);
assert.doesNotMatch(card, /<BodyGraph|max-w-\[300px\]|compact/, "v9 visual may widen; classic BodyGraph stays off this card");

// --- (d) Expanded bodies render exactly like the Deep dive accordions ---
const { ChartSummaryLearnMore } = await import("../src/components/ChartSummaryLearnMore.tsx");
const deepDive = read("src/components/ChartDeepDive.tsx");
const body = (src, name) => {
  const s = src.indexOf(`function ${name}(`);
  return src.slice(s, src.indexOf("\n}\n", s)).replace(name, "X");
};
assert.equal(body(read("src/components/ChartSummaryLearnMore.tsx"), "ChartSummaryLearnMore"), body(deepDive, "SummaryLearnMore"), "same markup as Deep dive SummaryLearnMore");
for (const [loc, want] of Object.entries(LOCKED)) {
  const html = renderToStaticMarkup(React.createElement(ChartSummaryLearnMore, { info: resolveHdCopy(loc).STRATEGY_COPY[MG] }));
  assert.ok(html.startsWith(`<p class="mb-2 text-fg">${want.replace(/'/g, "&#x27;")}</p>`), `${loc} expanded Strategy leads with locked summary`);
}
const def = renderToStaticMarkup(React.createElement(ChartSummaryLearnMore, { info: EN.DEFINITION_COPY.Split }));
assert.ok(def.includes(EN.DEFINITION_COPY.Split.summary.replace(/'/g, "&#x27;")));
assert.equal(renderToStaticMarkup(React.createElement(ChartSummaryLearnMore, { fallback: "FB" })), "<p>FB</p>");
const box = renderToStaticMarkup(React.createElement(ChartDisclosure, { testId: "snapshot-definition", value: "Split", label: "Definition" }, "B"));
assert.match(box, /^<details data-testid="snapshot-definition" class="rounded-xl border border-border bg-elevated px-3"><summary class="min-h-11 /, "closed, 44px summary");
assert.match(box, /<span class="font-semibold">Definition:<\/span> <span class="font-medium text-growth">Split<\/span>/, "label-first title");

// --- (g) labels: English feature names in all five locales ---
for (const l of ["en", "de", "es", "fr", "nl"]) {
  const cat = read(`src/lib/i18n/messages/${l}.ts`);
  assert.match(cat, /'chart\.people\.strategy': 'Strategy',/, `${l} strategy label`);
  assert.match(cat, /'chart\.people\.definition': 'Definition',/, `${l} definition label`);
}
console.log("PASS assert-chart-snapshot-strategy-definition: tiles gone, 5 collapsed disclosures (Strategy merged, Environment last), authority + strategy on How you decide, locked MG summary ×5 locales, Deep dive markup parity, Type box still under the Chart figure.");
