/**
 * Joining gate in Deep dive, plus the hanging-gate hint.
 * Run: npx tsx scripts/assert-joining-gate-deep-dive.mjs
 *
 * Checks are ordered so a thrown failure is that check's exit 1.
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

const HANGING_HINT = {
  en: "You hold one end; the sky or another person completes it.",
  nl: "Je houdt één uiteinde vast; de hemel of een ander persoon maakt het af.",
};
const SPLIT_WOULD_JOIN = {
  en: "Gate {gates} would join them.",
  nl: "Poort {gates} zou ze verbinden.",
};
const SPLIT_NO_JOIN = {
  en: "No single gate joins them, so other people or the sky link them.",
  nl: "Geen enkele poort verbindt ze, dus andere mensen of de hemel verbinden ze.",
};

const WHAT_YOU = {
  en: "A joining gate is the missing end of a path between two separate areas of your chart. You already hold one side; that one gate would hook the areas together.",
  nl: "Een joining gate is het ontbrekende uiteinde van een pad tussen twee aparte gebieden van je grafiek. Jij houdt al één kant vast; die ene poort zou de gebieden aan elkaar haken.",
};
const WHAT_OTHER = {
  en: "A joining gate is the missing end of a path between two separate areas of Juno\u2019s chart. Juno already holds one side; that one gate would hook the areas together.",
  nl: "Een joining gate is het ontbrekende uiteinde van een pad tussen twee aparte gebieden van de grafiek van Juno. Juno houdt al één kant vast; die ene poort zou de gebieden aan elkaar haken.",
};
const SPECIFIC_YOU_48 = {
  en: "On your chart, Gate 48 would join Ajna + Throat with Spleen + Solar Plexus + Root. Another person who holds Gate 48, or the sky lighting that gate, can complete the link for a while.",
  nl: "Op jouw grafiek zou Gate 48 Ajna + Throat met Spleen + Solar Plexus + Root verbinden. Een ander persoon die Gate 48 vasthoudt, of de hemel die die poort belicht, kan de verbinding een tijdje compleet maken.",
};
const SPECIFIC_YOU_22 = {
  en: "On your chart, Gate 22 would join Ajna + Throat with Spleen + Solar Plexus + Root. Another person who holds Gate 22, or the sky lighting that gate, can complete the link for a while.",
  nl: "Op jouw grafiek zou Gate 22 Ajna + Throat met Spleen + Solar Plexus + Root verbinden. Een ander persoon die Gate 22 vasthoudt, of de hemel die die poort belicht, kan de verbinding een tijdje compleet maken.",
};
const WHY_YOU = {
  en: "This matters because that missing link can feel magnetic. The right person, or the right sky day, can make those two areas work as one for a while \u2014 it can feel like relief or chemistry, not a change of your definition.",
  nl: "Dit is belangrijk omdat die ontbrekende schakel magnetisch kan aanvoelen. De juiste persoon, of een dag waarop de hemel die poort belicht, kan die twee gebieden een tijdje als één laten werken \u2014 het kan voelen als opluchting of chemie, niet als een verandering van je definition.",
};
const WHY_OTHER = {
  en: "This matters because that missing link can feel magnetic. The right person, or the right sky day, can make those two areas work as one for a while \u2014 it can feel like relief or chemistry, not a change of Juno\u2019s definition.",
  nl: "Dit is belangrijk omdat die ontbrekende schakel magnetisch kan aanvoelen. De juiste persoon, of een dag waarop de hemel die poort belicht, kan die twee gebieden een tijdje als één laten werken \u2014 het kan voelen als opluchting of chemie, niet als een verandering van de definition van Juno.",
};
const SPECIFIC_OTHER_48 = {
  en: "On Juno\u2019s chart, Gate 48 would join Ajna + Throat with Spleen + Solar Plexus + Root. Another person who holds Gate 48, or the sky lighting that gate, can complete the link for a while.",
  nl: "Op de grafiek van Juno zou Gate 48 Ajna + Throat met Spleen + Solar Plexus + Root verbinden. Een ander persoon die Gate 48 vasthoudt, of de hemel die die poort belicht, kan de verbinding een tijdje compleet maken.",
};

const { messages: en } = await import("../src/lib/i18n/messages/en.ts");
const { messages: nl } = await import("../src/lib/i18n/messages/nl.ts");
const { ChartBodygraph } = await import("../src/components/ChartBodygraph.tsx");
const { ChartDeepDive } = await import("../src/components/ChartDeepDive.tsx");
const { I18nLocaleRoot } = await import("../src/lib/i18n/index.ts");
const { resolveHdCopy } = await import("../src/lib/essays/resolveHdCopy.ts");

const render = (locale, node) =>
  renderToStaticMarkup(React.createElement(I18nLocaleRoot, { locale }, node));

function noteOf(html) {
  const marker = '<p class="chart-v9-note">';
  const start = html.indexOf(marker);
  assert.ok(start >= 0, "check 2: split note is present");
  const end = html.indexOf("</p>", start);
  return html.slice(start, end + 4);
}

function visible(html) {
  return html.replace(/<[^>]+>/g, "");
}

const AREAS = ["Ajna", "Throat", "Spleen", "Solar_Plexus", "Root"];
const AREA_CHANNELS = [
  { gates: [17, 62], centers: ["Ajna", "Throat"] },
  { gates: [18, 58], centers: ["Spleen", "Root"] },
  { gates: [30, 41], centers: ["Solar_Plexus", "Root"] },
];
const ONE_GATE = [17, 62, 18, 58, 30, 41, 16];
const TWO_GATES = [17, 62, 18, 58, 30, 41, 16, 12];
const NO_JOIN_DEFINED = ["Ajna", "Throat", "Sacral", "Solar_Plexus", "Root"];
const NO_JOIN_CHANNELS = [
  { gates: [17, 62], centers: ["Ajna", "Throat"] },
  { gates: [9, 52], centers: ["Sacral", "Root"] },
  { gates: [30, 41], centers: ["Solar_Plexus", "Root"] },
];
const NO_JOIN_GATES = [17, 62, 9, 52, 30, 41];

function bodygraph(locale, definedCenters, channels, activatedGates) {
  return render(
    locale,
    React.createElement(ChartBodygraph, {
      definedCenters,
      channels,
      activatedGates,
      typeName: "Generator",
      profile: "6/2",
      authority: "Sacral",
      definition: "Split",
    }),
  );
}

function deepDive(locale, definedCenters, channels, activatedGates, personName) {
  return render(
    locale,
    React.createElement(ChartDeepDive, {
      chart: {
        defined_centers: definedCenters,
        channels,
        hanging_gates: [],
        activated_gates: activatedGates,
        type: "Generator",
        strategy: "To Respond",
        authority: "Sacral",
        profile: "1/3",
        definition: definedCenters.length > 3 ? "Split" : "Single",
      },
      personality: [],
      design: [],
      personName,
      domain: "core",
    }),
  );
}

// --- 1. Hanging hint, and the split sentences that stay ---
assert.equal(en["chart.v9.hangingHint"], HANGING_HINT.en, "check 1: EN hangingHint");
assert.equal(nl["chart.v9.hangingHint"], HANGING_HINT.nl, "check 1: NL hangingHint");
assert.equal(en["chart.v9.hangingGate"], "Hanging gate", "check 1: EN hangingGate");
assert.equal(nl["chart.v9.hangingGate"], "Hanging gate", "check 1: NL hangingGate");
assert.equal(en["chart.v9.splitWouldJoin"], SPLIT_WOULD_JOIN.en, "check 1: EN splitWouldJoin");
assert.equal(nl["chart.v9.splitWouldJoin"], SPLIT_WOULD_JOIN.nl, "check 1: NL splitWouldJoin");
assert.equal(en["chart.v9.splitNoJoin"], SPLIT_NO_JOIN.en, "check 1: EN splitNoJoin");
assert.equal(nl["chart.v9.splitNoJoin"], SPLIT_NO_JOIN.nl, "check 1: NL splitNoJoin");
assert.equal(en["chart.v9.joiningHint"], "Would join your split", "check 1: EN joiningHint unchanged");
assert.equal(nl["chart.v9.joiningHint"], "Zou je splitsing verbinden", "check 1: NL joiningHint unchanged");

// --- 2. Each joining-gate number is a link. The no-join sentence is plain text. ---
const bodygraphSrc = read("src/components/ChartBodygraph.tsx");
assert.doesNotMatch(
  bodygraphSrc,
  /t\("chart\.v9\.splitWouldJoin", \{\s*gates:\s*joins\.map/,
  "check 2: would-join is not one inert {gates} string",
);
assert.match(bodygraphSrc, /href="#deep-dive-definition"/, "check 2: href jumps to Definition");
assert.match(
  bodygraphSrc,
  /data-testid=\{`chart-v9-joining-gate-\$\{gate\}`\}/,
  "check 2: per-gate test id",
);
assert.match(bodygraphSrc, /t\("chart\.v9\.splitNoJoin"\)/, "check 2: no-join sentence remains");
assert.doesNotMatch(
  bodygraphSrc.slice(bodygraphSrc.indexOf("chart.v9.splitNoJoin") - 80, bodygraphSrc.indexOf("chart.v9.splitNoJoin") + 40),
  /<a\b/,
  "check 2: no-join sentence is not wrapped in a link",
);

for (const locale of ["en", "nl"]) {
  const one = noteOf(bodygraph(locale, AREAS, AREA_CHANNELS, ONE_GATE));
  const oneText =
    locale === "en"
      ? "Two separate areas: Ajna + Throat, and Spleen + Solar Plexus + Root. Gate 48 would join them."
      : "Twee aparte gebieden: Ajna + Throat, en Spleen + Solar Plexus + Root. Poort 48 zou ze verbinden.";
  assert.equal(visible(one), oneText, `check 2: ${locale} one-gate wording`);
  const oneLinks = [...one.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  assert.equal(oneLinks.length, 1, `check 2: ${locale} one link`);
  assert.match(oneLinks[0][1], /href="#deep-dive-definition"/);
  assert.match(oneLinks[0][1], /data-testid="chart-v9-joining-gate-48"/);
  assert.match(oneLinks[0][1], /aria-label="[^"]*48[^"]*Deep dive Definition"/);
  assert.equal(oneLinks[0][2], locale === "en" ? "Gate 48" : "Poort 48");
  assert.ok(one.indexOf("<a") > one.indexOf(locale === "en" ? "Two separate areas" : "Twee aparte gebieden"));
  assert.doesNotMatch(oneLinks[0][0], /would join them|zou ze verbinden|separate areas|aparte gebieden/);

  const many = noteOf(bodygraph(locale, AREAS, AREA_CHANNELS, TWO_GATES));
  const manyText =
    locale === "en"
      ? "Two separate areas: Ajna + Throat, and Spleen + Solar Plexus + Root. Gate 22, 48 would join them."
      : "Twee aparte gebieden: Ajna + Throat, en Spleen + Solar Plexus + Root. Poort 22, 48 zou ze verbinden.";
  assert.equal(visible(many), manyText, `check 2: ${locale} several-gate wording`);
  const manyLinks = [...many.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  assert.equal(manyLinks.length, 2, `check 2: ${locale} two number links`);
  assert.equal(manyLinks[0][2], "22");
  assert.equal(manyLinks[1][2], "48");
  for (const [tag, attrs] of manyLinks) {
    assert.match(attrs, /href="#deep-dive-definition"/);
    assert.match(tag, /data-testid="chart-v9-joining-gate-(22|48)"/);
    assert.doesNotMatch(tag, /would join them|zou ze verbinden/);
  }

  const none = noteOf(bodygraph(locale, NO_JOIN_DEFINED, NO_JOIN_CHANNELS, NO_JOIN_GATES));
  assert.doesNotMatch(none, /<a\b/, `check 2: ${locale} no-join note has no link`);
  assert.ok(none.includes(SPLIT_NO_JOIN[locale]), `check 2: ${locale} splitNoJoin text`);

  const single = bodygraph(locale, ["Sacral"], [], [5, 15]);
  assert.doesNotMatch(single, /chart-v9-note/, `check 2: ${locale} single definition has no split note`);
}

const noteCss = read("src/app/profile/chart-field-notes.css");
const noteRule = noteCss.slice(noteCss.indexOf(".chart-v9-note {"), noteCss.indexOf("}", noteCss.indexOf(".chart-v9-note {")) + 1);
assert.match(noteRule, /font-size:\s*15px/);
assert.match(noteRule, /line-height:\s*1\.45/);
assert.match(noteRule, /color:\s*var\(--fg-secondary\)/);
assert.doesNotMatch(noteRule, /min-height/);
const linkRule = noteCss.slice(noteCss.indexOf(".chart-v9-note a {"), noteCss.indexOf(".chart-v9-kicker"));
assert.match(linkRule, /color:\s*var\(--v9-growth\)/, "check 2: growth colour");
assert.match(linkRule, /text-underline-offset:\s*3px/, "check 2: underline offset");
assert.match(linkRule, /\.chart-v9-note a:hover \{[^}]*text-decoration:\s*underline/, "check 2: hover underline");
assert.match(linkRule, /\.chart-v9-note a:focus-visible \{[^}]*outline:\s*2px solid var\(--focus\)/, "check 2: focus-visible ring");
assert.doesNotMatch(linkRule, /min-height:\s*44px|min-h-11/, "check 2: note link is not a 44px target");

// --- 3. Joining gate block sits at the top of the Definition row ---
const deepDiveSrc = read("src/components/ChartDeepDive.tsx");
assert.match(deepDiveSrc, /id="deep-dive-definition"/, "check 3: Definition row id");
assert.doesNotMatch(deepDiveSrc, /(?:^|[\s{])id="deep-dive-joining-gate"/, "check 3: no new accordion id");
const defAt = deepDiveSrc.indexOf('id="deep-dive-definition"');
const blockAt = deepDiveSrc.indexOf('data-testid="deep-dive-joining-gate"');
const essayAt = deepDiveSrc.indexOf("DEFINITION_COPY[definition]", defAt);
const learnAt = deepDiveSrc.indexOf("<SummaryLearnMore", defAt);
assert.ok(blockAt > 0 && defAt > 0 && blockAt < essayAt && learnAt > defAt && blockAt < learnAt, "check 3: block is above the essay");
assert.match(deepDiveSrc, /joiningGateRows\.length > 0/, "check 3: block only when joins exist");
const core = deepDiveSrc.slice(deepDiveSrc.indexOf('active === "core"'), deepDiveSrc.indexOf('active === "centers"'));
const coreIds = ["deep-dive-type", "deep-dive-strategy", "deep-dive-inner-authority", "deep-dive-profile", "deep-dive-definition"];
let prev = -1;
for (const id of coreIds) {
  const at = core.indexOf(`id="${id}"`);
  assert.ok(at > prev, `check 3: Core order keeps ${id}`);
  prev = at;
}
assert.equal((core.match(/<Accordion/g) || []).length, 5, "check 3: no new Core row");
assert.match(core, /<h3 className="font-semibold">\{heading\}<\/h3>/, "check 3: Type heading typography stays");

for (const locale of ["en", "nl"]) {
  const you = deepDive(locale, AREAS, AREA_CHANNELS, ONE_GATE);
  const youBlock = you.indexOf('data-testid="deep-dive-joining-gate"');
  const youEssay = you.indexOf(resolveHdCopy(locale).DEFINITION_COPY.Split.summary.slice(0, 24));
  assert.ok(youBlock > you.indexOf('id="deep-dive-definition"'), `check 3: ${locale} block is inside Definition`);
  assert.ok(youEssay > youBlock, `check 3: ${locale} essay stays under the block`);
  assert.ok(you.includes("<h3 class=\"font-semibold\">Joining gate</h3>"), `check 3: ${locale} heading`);
  assert.ok(you.includes(WHAT_YOU[locale]), `check 3: ${locale} what you`);
  assert.ok(you.includes(SPECIFIC_YOU_48[locale]), `check 3: ${locale} specific you`);
  assert.ok(you.includes(WHY_YOU[locale]), `check 3: ${locale} why you`);
  assert.equal(you.split(WHAT_YOU[locale]).length - 1, 1, `check 3: ${locale} what once`);
  assert.equal(you.split(WHY_YOU[locale]).length - 1, 1, `check 3: ${locale} why once`);

  const other = deepDive(locale, AREAS, AREA_CHANNELS, ONE_GATE, "Juno");
  assert.ok(other.includes(WHAT_OTHER[locale]), `check 3: ${locale} what other`);
  assert.ok(other.includes(SPECIFIC_OTHER_48[locale]), `check 3: ${locale} specific other`);
  assert.ok(other.includes(WHY_OTHER[locale]), `check 3: ${locale} why other`);
  assert.ok(!other.includes(WHAT_YOU[locale]), `check 3: ${locale} other is not the you copy`);

  const many = deepDive(locale, AREAS, AREA_CHANNELS, TWO_GATES);
  assert.ok(many.includes(SPECIFIC_YOU_22[locale]) && many.includes(SPECIFIC_YOU_48[locale]), `check 3: ${locale} lists each gate`);
  assert.equal(many.split(WHAT_YOU[locale]).length - 1, 1, `check 3: ${locale} several gates, what once`);
  assert.equal(many.split(WHY_YOU[locale]).length - 1, 1, `check 3: ${locale} several gates, why once`);

  const none = deepDive(locale, NO_JOIN_DEFINED, NO_JOIN_CHANNELS, NO_JOIN_GATES);
  assert.doesNotMatch(none, /data-testid="deep-dive-joining-gate"/, `check 3: ${locale} no block without a joining gate`);
  assert.ok(none.includes('id="deep-dive-definition"'), `check 3: ${locale} Definition row remains`);
  assert.ok(none.includes(resolveHdCopy(locale).DEFINITION_COPY.Split.summary.slice(0, 24)), `check 3: ${locale} essay remains`);

  const single = deepDive(locale, ["Ajna", "Throat"], [{ gates: [17, 62], centers: ["Ajna", "Throat"] }], [17, 62]);
  assert.doesNotMatch(single, /data-testid="deep-dive-joining-gate"/, `check 3: ${locale} single definition has no block`);
}

// --- 4. Profile wires the link to the Definition jump and closes an open center first ---
const profile = read("src/app/profile/page.tsx");
const card = profile.slice(profile.indexOf('id="bodygraph"'), profile.indexOf('id="snapshot"'));
assert.match(card, /onOpenJoiningGate=\{/, "check 4: ChartBodygraph receives the callback");
assert.match(
  card,
  /onOpenJoiningGate=\{\(\) => \{[\s\S]*?if \(selectedCenter\) \{[\s\S]*?setSelectedCenter\(null\);[\s\S]*?replaceCenterParam\(null\);[\s\S]*?\}[\s\S]*?jumpToSection\("deep-dive-definition"\);/,
  "check 4: close center, drop ?center=, then jump to Definition",
);
assert.doesNotMatch(card, /searchParams\.set\("gate"|[?&]gate=/, "check 4: no gate query key");
assert.match(card, /<ChartBodygraph\s+afterSvg=\{\s*<ChartTypeBox/, "check 4: Type box pointer stays first");

// --- 5. Classic graph files and the lockfile stay pinned ---
assert.equal(sha(read("src/components/BodyGraph.tsx")), BODYGRAPH_SHA, "check 5: BodyGraph.tsx");
assert.equal(sha(read("src/lib/bodygraphGeometry.ts")), GEOMETRY_SHA, "check 5: bodygraphGeometry.ts");
assert.equal(sha(read("src/lib/bodygraphGeometryV2.ts")), GEOMETRY_V2_SHA, "check 5: bodygraphGeometryV2.ts");
assert.equal(sha(read("package-lock.json")), LOCKFILE_SHA, "check 5: package-lock.json");
const pkg = read("package.json");
const scriptLine = '"assert:joining-gate-deep-dive": "npx tsx scripts/assert-joining-gate-deep-dive.mjs"';
assert.equal(pkg.split(scriptLine).length - 1, 1, "check 5: one assert:joining-gate-deep-dive script");

console.log("PASS assert-joining-gate-deep-dive");
