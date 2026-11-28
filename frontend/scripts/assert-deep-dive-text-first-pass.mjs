/**
 * Deep dive text and formatting — first pass (brief 2026-11-28, Benjamin t1196u Go).
 * Channel and Profile essay cleanup, shared heading renderer, tag/disclaimer removal,
 * Deep dive help text, and the other-person "you" line.
 * Run: npx tsx scripts/assert-deep-dive-text-first-pass.mjs
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

globalThis.React = React;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

const { CHANNEL_COPY } = await import("../src/lib/hdChannelCopy.ts");
const { PROFILE_COMBO_ESSAYS } = await import("../src/lib/hdProfileCombos.ts");
const { resolveHdCopy } = await import("../src/lib/essays/resolveHdCopy.ts");
const { deepDiveTypeSections } = await import("../src/lib/essays/deepDiveTypeCopy.ts");
const { DeepDiveEssayBody } = await import("../src/components/DeepDiveEssayBody.tsx");
const { messages: en } = await import("../src/lib/i18n/messages/en.ts");
const { messages: nl } = await import("../src/lib/i18n/messages/nl.ts");
const EN = resolveHdCopy("en");
const NL = resolveHdCopy("nl");

const CHANNEL_BANNED = [
  "Learn more\n(",
  "Meer weten\n(",
  "(Channel ",
  "between you and the people around you",
  "tussen jou en de mensen om je heen",
  "One hallmark:",
  "Eén kenmerk:",
  "In practice\nIn practice",
  "In de praktijk\nIn de praktijk",
  "describes flavour and pacing",
  "beschrijft smaak en tempo",
  "dat je haar",
];

function h3Count(html) {
  return (html.match(/<h3 class="font-semibold">/g) ?? []).length;
}

const channelKeys = Object.keys(CHANNEL_COPY).sort();
assert.equal(channelKeys.length, 36, "36 channel essays");
for (const key of channelKeys) {
  const gates = key.split("-").map(Number);
  const enText = EN.channelMeaning(gates);
  const nlText = NL.channelMeaning(gates);
  assert.equal(enText, CHANNEL_COPY[key], `${key} EN channelMeaning reads CHANNEL_COPY`);
  for (const banned of CHANNEL_BANNED) {
    assert.equal(enText.includes(banned), false, `EN ${key} still has ${JSON.stringify(banned)}`);
    assert.equal(nlText.includes(banned), false, `NL ${key} still has ${JSON.stringify(banned)}`);
  }
  for (const [label, text] of [["EN", enText], ["NL", nlText]]) {
    const html = renderToStaticMarkup(React.createElement(DeepDiveEssayBody, { text }));
    assert.equal(h3Count(html), 4, `${label} ${key} has 4 section headings`);
    assert.ok(html.startsWith('<p class="text-fg">'), `${label} ${key} starts with the lead paragraph`);
  }
}

const PROFILES = ["1/3", "1/4", "2/4", "2/5", "3/5", "3/6", "4/6", "4/1", "5/1", "5/2", "6/2", "6/3"];
assert.deepEqual(Object.keys(PROFILE_COMBO_ESSAYS).sort(), [...PROFILES].sort(), "12 profile essays");
for (const key of PROFILES) {
  const enText = PROFILE_COMBO_ESSAYS[key];
  const nlText = NL.profileLearnMore(key);
  assert.equal(EN.profileLearnMore(key), enText, `${key} EN profileLearnMore`);
  for (const banned of ["(Profile ", "One more anchor", "Nog één anker"]) {
    assert.equal(enText.includes(banned), false, `EN ${key} still has ${banned}`);
    assert.equal(nlText.includes(banned), false, `NL ${key} still has ${banned}`);
  }
  for (const [label, text] of [["EN", enText], ["NL", nlText]]) {
    const html = renderToStaticMarkup(React.createElement(DeepDiveEssayBody, { text }));
    assert.equal(h3Count(html), 6, `${label} profile ${key} has 6 section headings`);
  }
}
assert.ok(
  PROFILE_COMBO_ESSAYS["1/3"].includes("Martyr here means a trial-and-error learner, not a victim."),
  "1/3 keeps the Martyr definition",
);

const TAG = /\((Strategy|Authority|Definition|Defined|Open)[ :][^)]*\)$/;
for (const [label, bundle] of [["EN", EN], ["NL", NL]]) {
  for (const [group, map] of [
    ["STRATEGY", bundle.STRATEGY_COPY],
    ["AUTHORITY", bundle.AUTHORITY_COPY],
    ["DEFINITION", bundle.DEFINITION_COPY],
  ]) {
    for (const [key, info] of Object.entries(map)) {
      assert.doesNotMatch(info.summary, TAG, `${label} ${group} ${key} summary has no trailing tag`);
    }
  }
  for (const [key, info] of Object.entries(bundle.CENTER_COPY)) {
    assert.doesNotMatch(info.defined, TAG, `${label} ${key} defined has no trailing tag`);
    assert.doesNotMatch(info.open, TAG, `${label} ${key} open has no trailing tag`);
  }
  for (const [key, info] of Object.entries(bundle.TYPE_COPY)) {
    assert.match(info.summary, /\(Type: [^)]+\)$/, `${label} TYPE_COPY ${key} summary still ends in (Type: …)`);
  }
}

const TYPES = ["Generator", "Manifesting Generator", "Manifestor", "Projector", "Reflector"];
const ENDING = {
  en: {
    self: "Strategy and Authority describe how you act on it.",
    other: (name) => `Strategy and Authority describe how ${name} acts on it.`,
  },
  nl: {
    self: "Strategy en Authority beschrijven hoe je ermee omgaat.",
    other: (name) => `Strategy en Authority beschrijven hoe ${name} ermee omgaat.`,
  },
};
for (const locale of ["en", "nl"]) {
  for (const type of TYPES) {
    for (const name of [undefined, "Juno"]) {
      const sections = deepDiveTypeSections(type, locale, name);
      const ending = name ? ENDING[locale].other(name) : ENDING[locale].self;
      assert.ok(sections[0].body.endsWith(ending), `${locale} ${type} ${name ?? "self"} lived meaning ending`);
      const text = sections.map((s) => s.body).join(" ");
      assert.doesNotMatch(text, /Core rows|Core-rijen/);
    }
  }
}

const dd = read("src/components/ChartDeepDive.tsx");
assert.match(dd, /import \{ DeepDiveEssayBody \} from "@\/components\/DeepDiveEssayBody"/);
assert.match(dd, /<DeepDiveEssayBody text=\{profileLearnMore\(profile\)\} \/>/);
assert.match(dd, /<DeepDiveEssayBody text=\{channelMeaning\(g, name\)\} \/>/);
assert.match(dd, /data-testid="deep-dive-footer"/);
assert.match(dd, /t\("chart\.deepDive\.footer"\)/);
assert.match(
  dd,
  /\{personName \? \([\s\S]*?data-testid="deep-dive-other-person-note"[\s\S]*?\) : null\}/,
  "other-person note is gated on personName",
);
const body = (src, name) => {
  const s = src.indexOf(`function ${name}(`);
  return src.slice(s, src.indexOf("\n}\n", s)).replace(name, "X");
};
assert.equal(
  body(read("src/components/ChartSummaryLearnMore.tsx"), "ChartSummaryLearnMore"),
  body(dd, "SummaryLearnMore"),
  "SummaryLearnMore is byte-equal to ChartSummaryLearnMore",
);

const CATALOG = {
  "chart.deepDive.subtitle": {
    en: "The longer read behind the summary above.",
    nl: "De langere uitleg achter de samenvatting hierboven.",
  },
  "chart.deepDive.tapToExpand": {
    en: "Open a row to read more.",
    nl: "Open een rij om meer te lezen.",
  },
  "chart.deepDive.definedOpenHelp": {
    en: "Defined centers work the same way every day. Open centers take in energy from the people around you. Tap a center to read more.",
    nl: "Gedefinieerde centra werken elke dag hetzelfde. Open centra nemen energie op van de mensen om je heen. Tik op een centrum om meer te lezen.",
  },
  "chart.deepDive.bodyHint": {
    en: "Body themes in Human Design: {hint}",
    nl: "Lichaamsthema\u2019s in Human Design: {hint}",
  },
  "chart.deepDive.gateLine": {
    en: "Gate \u00b7 line",
    nl: "Poort \u00b7 lijn",
  },
  "chart.deepDive.lon": {
    en: "Degree",
    nl: "Graad",
  },
  "chart.deepDive.footer": {
    en: "Human Design here is for self-understanding, not medical advice.",
    nl: "Human Design is hier bedoeld om jezelf beter te begrijpen, niet als medisch advies.",
  },
  "chart.deepDive.otherPersonNote": {
    en: "You\u2019re reading {name}\u2019s chart. Where these notes say \u201cyou\u201d, they mean {name}.",
    nl: "Je leest de chart van {name}. Waar hier \u201cje\u201d staat, wordt {name} bedoeld.",
  },
};
function noFormalU(label, src) {
  assert.doesNotMatch(src, /(^|[^A-Za-zÀ-ÿ\\])[uU](?![A-Za-zÀ-ÿw])/, `${label} must not use formal u`);
  assert.doesNotMatch(src, /(^|[^A-Za-zÀ-ÿ\\])[uU]w\b/, `${label} must not use formal uw`);
}
for (const [key, value] of Object.entries(CATALOG)) {
  assert.equal(en[key], value.en, `en ${key}`);
  assert.equal(nl[key], value.nl, `nl ${key}`);
  noFormalU(`nl ${key}`, value.nl);
}
assert.equal(en["chart.deepDive.otherPersonNote"].split("{name}").length - 1, 2);
assert.equal(nl["chart.deepDive.otherPersonNote"].split("{name}").length - 1, 2);

const staticDir = join(root, ".next/static");
assert.ok(existsSync(staticDir), ".next/static missing; run npm run build before this assert");
const bannedStatic = ["One hallmark:", "Eén kenmerk:", "One more anchor", "Nog één anker"];
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.(js|css|html|json|txt|map)$/.test(name)) out.push(abs);
  }
  return out;
}
for (const file of walk(staticDir)) {
  const text = readFileSync(file, "utf8");
  for (const banned of bannedStatic) {
    assert.equal(text.includes(banned), false, `${file} contains ${JSON.stringify(banned)}`);
  }
}

console.log("PASS assert-deep-dive-text-first-pass: 36 channels × 2 locales, 12 profiles × 2 locales, tagless summaries, Type meta sentence, footer, other-person note, help text.");
