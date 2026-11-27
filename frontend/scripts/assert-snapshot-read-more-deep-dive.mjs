/**
 * Baseline Snapshot “Read more in Deep dive” (brief cb9f2727…, pinned to main e8fe2bf).
 * Shared caption control on Type, Profile, How you decide, and Definition; each opens its
 * mapped Deep dive Core row. Snapshot disclosures and Deep dive rows are exclusive-open.
 * Run: npx tsx scripts/assert-snapshot-read-more-deep-dive.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

globalThis.React = React;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const { catalogs } = await import("../src/lib/i18n/messages/index.ts");
const { ReadMoreInDeepDive } = await import("../src/components/ReadMoreInDeepDive.tsx");
const { ChartTypeBox } = await import("../src/components/ChartTypeBox.tsx");
const { ChartDisclosure, SnapshotExclusiveGroup } = await import("../src/components/ChartDisclosure.tsx");
const { I18nProvider } = await import("../src/lib/i18n/index.ts");
const { translate } = await import("../src/lib/i18n/I18nProvider.tsx");

const LOCALES = ["en", "de", "es", "fr", "nl"];
const VISIBLE = {
  en: "Read more in Deep dive",
  de: "Mehr dazu in Deep dive",
  es: "Lee más en Deep dive",
  fr: "Lis-en plus dans Deep dive",
  nl: "Lees meer in Deep dive",
};
const ARIA = {
  type: {
    en: "Read more about Type in Deep dive",
    de: "Mehr dazu über Type in Deep dive",
    es: "Lee más sobre Type en Deep dive",
    fr: "Lis-en plus sur Type dans Deep dive",
    nl: "Lees meer over Type in Deep dive",
  },
  profile: {
    en: "Read more about Profile in Deep dive",
    de: "Mehr dazu über Profile in Deep dive",
    es: "Lee más sobre Profile en Deep dive",
    fr: "Lis-en plus sur Profile dans Deep dive",
    nl: "Lees meer over Profile in Deep dive",
  },
  strategy: {
    en: "Read more about Strategy in Deep dive",
    de: "Mehr dazu über Strategy in Deep dive",
    es: "Lee más sobre Strategy en Deep dive",
    fr: "Lis-en plus sur Strategy dans Deep dive",
    nl: "Lees meer over Strategy in Deep dive",
  },
  definition: {
    en: "Read more about Definition in Deep dive",
    de: "Mehr dazu über Definition in Deep dive",
    es: "Lee más sobre Definition en Deep dive",
    fr: "Lis-en plus sur Definition dans Deep dive",
    nl: "Lees meer over Definition in Deep dive",
  },
};
const ARIA_KEYS = {
  type: "chart.people.readMoreAboutTypeInDeepDive",
  profile: "chart.people.readMoreAboutProfileInDeepDive",
  strategy: "chart.people.readMoreAboutStrategyInDeepDive",
  definition: "chart.people.readMoreAboutDefinitionInDeepDive",
};

// Scope change 27 Nov 2026 10:06 PM Bangkok (brief 17353706…): new aria-label keys are
// English and Dutch only. de/es/fr stay byte-identical to main and fall back to English
// through translate() (table[key] ?? catalogs.en[key]).
const ARIA_LOCALES = ["en", "nl"];
for (const l of LOCALES) {
  assert.equal(catalogs[l]["chart.people.readMoreInDeepDive"], VISIBLE[l], `${l} visible label`);
}
for (const l of ARIA_LOCALES) {
  for (const [dest, key] of Object.entries(ARIA_KEYS)) {
    assert.equal(catalogs[l][key], ARIA[dest][l], `${l} ${dest} aria-label`);
    assert.ok(ARIA[dest][l].includes("Deep dive"), `${l} ${dest} keeps Deep dive in English`);
    const feature = dest === "strategy" ? "Strategy" : dest[0].toUpperCase() + dest.slice(1);
    assert.ok(ARIA[dest][l].includes(feature), `${l} ${dest} names ${feature}`);
    if (l === "nl") assert.doesNotMatch(ARIA[dest][l], /\b(u|uw)\b/i);
  }
  assert.equal(Object.keys(catalogs[l]).length, Object.keys(catalogs.en).length, `${l} catalog parity`);
}
for (const l of ["de", "es", "fr"]) {
  for (const [dest, key] of Object.entries(ARIA_KEYS)) {
    assert.equal(catalogs[l][key], undefined, `${l} does not add ${dest} aria-label`);
    assert.equal(translate(l, key), ARIA[dest].en, `${l} ${dest} falls back to English`);
  }
  const missing = Object.keys(catalogs.en).filter((k) => catalogs[l][k] == null).sort();
  assert.deepEqual(missing, Object.values(ARIA_KEYS).sort(), `${l} omits only the four new aria-labels`);
}

const link = renderToStaticMarkup(
  React.createElement(ReadMoreInDeepDive, {
    label: VISIBLE.en,
    ariaLabel: ARIA.type.en,
    testId: "chart-type-deep-dive-pointer",
    rowId: "deep-dive-type",
    onJump() {},
  }),
);
assert.match(link, /href="#deep-dive-type"/);
assert.match(link, /aria-label="Read more about Type in Deep dive"/);
assert.match(link, /data-testid="chart-type-deep-dive-pointer"/);
assert.match(link, /type-caption/);
assert.match(link, /text-growth/);
assert.match(link, /min-h-11/);
assert.match(link, /underline-offset-2/);
assert.match(link, /hover:underline/);
assert.match(link, /focus-visible:ring-focus/);
assert.match(link, /gap-1/);
assert.match(link, /aria-hidden="true">→/);
assert.doesNotMatch(link, /type-body/);

const render = (node) =>
  renderToStaticMarkup(React.createElement(I18nProvider, { accountLocale: "en" }, node));
const typeBox = render(React.createElement(ChartTypeBox, { actualType: "NotAType" }));
const detailsAt = typeBox.indexOf("<details");
const summaryEnd = typeBox.indexOf("</summary>", detailsAt);
const detailsEnd = typeBox.indexOf("</details>", detailsAt);
const previewAt = typeBox.indexOf('id="', typeBox.indexOf("-preview"));
assert.ok(summaryEnd < typeBox.indexOf("chart-type-deep-dive-pointer") && typeBox.indexOf("chart-type-deep-dive-pointer") < detailsEnd, "Type link sits inside the details, after the summary");
assert.doesNotMatch(typeBox.slice(detailsAt, summaryEnd), /chart-type-deep-dive-pointer/, "not on the closed Type heading");
assert.ok(typeBox.indexOf("chart-type-deep-dive-pointer") < typeBox.indexOf("NotAType", summaryEnd) || typeBox.includes(">NotAType</h3>"), "unknown type still shows the link");
assert.match(typeBox, /href="#deep-dive-type"/);

const profile = read("src/app/profile/page.tsx");
const typeBoxSrc = read("src/components/ChartTypeBox.tsx");
const snapshot = profile.slice(profile.indexOf('id="snapshot"'), profile.indexOf("<ChartDeepDive"));
const bodygraph = profile.slice(profile.indexOf('id="bodygraph"'), profile.indexOf('id="snapshot"'));
assert.match(typeBoxSrc, /testId="chart-type-deep-dive-pointer"/);
assert.match(typeBoxSrc, /rowId="deep-dive-type"/);
assert.match(typeBoxSrc, /chart\.people\.readMoreAboutTypeInDeepDive/);
assert.match(bodygraph, /onReadMoreInDeepDive=\{\(\) => jumpToSection\("deep-dive-type"\)\}/);
const pointers = [
  ["snapshot-profile-deep-dive-pointer", "deep-dive-profile", "readMoreAboutProfileInDeepDive", snapshot],
  ["snapshot-how-you-decide-deep-dive-pointer", "deep-dive-strategy", "readMoreAboutStrategyInDeepDive", snapshot],
  ["snapshot-definition-deep-dive-pointer", "deep-dive-definition", "readMoreAboutDefinitionInDeepDive", snapshot],
];
const seen = new Set(["chart-type-deep-dive-pointer"]);
for (const [testId, rowId, ariaKey, src] of pointers) {
  assert.ok(!seen.has(testId), `distinct test id ${testId}`);
  seen.add(testId);
  assert.match(src, new RegExp(`testId="${testId}"`));
  assert.match(src, new RegExp(`rowId="${rowId}"`));
  assert.match(src, new RegExp(`chart\\.people\\.${ariaKey}`));
  assert.match(src, new RegExp(`jumpToSection\\("${rowId}"\\)`));
}
assert.doesNotMatch(snapshot.slice(snapshot.indexOf('testId="snapshot-environment"')), /ReadMoreInDeepDive|jumpToSection/, "Environment has no pointer");
assert.doesNotMatch(
  snapshot.slice(snapshot.indexOf('testId="snapshot-centers"'), snapshot.indexOf('testId="snapshot-definition"')),
  /ReadMoreInDeepDive/,
  "Centers has no pointer",
);
const decide = snapshot.slice(snapshot.indexOf('testId="snapshot-how-you-decide"'), snapshot.indexOf("</ChartDisclosure>", snapshot.indexOf('testId="snapshot-how-you-decide"')));
assert.match(decide, /rowId="deep-dive-strategy"/);
assert.doesNotMatch(decide, /deep-dive-inner-authority|innerAuthority/, "How you decide does not target Inner Authority");
assert.equal((snapshot.match(/testId="snapshot-deep-dive-pointer"/g) ?? []).length, 0, "old shared test id is not reused");

const deepDive = read("src/components/ChartDeepDive.tsx");
for (const id of ["deep-dive-type", "deep-dive-profile", "deep-dive-strategy", "deep-dive-definition"]) {
  assert.match(deepDive, new RegExp(`id="${id}"`));
  assert.match(deepDive, new RegExp(`testId="${id}"`));
}
assert.match(deepDive, /testId="deep-dive-inner-authority"/, "Inner Authority stays its own row");
assert.doesNotMatch(deepDive, /environment/i, "no Deep dive Environment row");
assert.match(deepDive, /setChannelOpen\(null\)/, "leaving Channels clears its open row");
assert.match(deepDive, /open=\{coreOpen === "deep-dive-type"\}/);
assert.match(deepDive, /open=\{channelOpen ===/);
assert.match(profile, /openCoreRow=\{deepDiveRow\}/);
assert.match(profile, /if \(next !== "core"\) setDeepDiveRow\(null\)/);
assert.match(profile, /const targetId = rowJump \? id : DEEP_SECTION_IDS\.has\(id\) \? "deep-dive" : id/, "row hashes scroll to the row, not the section heading");
assert.match(profile, /const targetId = isDeepDiveRowId\(raw\) \? raw : DEEP_SECTION_IDS\.has\(raw\) \? "deep-dive" : raw/, "load hashes for rows are not remapped");
assert.match(profile, /prefers-reduced-motion: reduce/);

const disclosure = read("src/components/ChartDisclosure.tsx");
assert.match(disclosure, /export function SnapshotExclusiveGroup/);
assert.match(disclosure, /setOpenId\(testId\)/);
assert.match(disclosure, /placeSummaryBelowSticky/);
assert.doesNotMatch(disclosure, /\.scrollIntoView\(/);
assert.match(profile, /<SnapshotExclusiveGroup/);
assert.doesNotMatch(bodygraph, /SnapshotExclusiveGroup/, "Type box is outside the Snapshot group");

const closed = renderToStaticMarkup(
  React.createElement(SnapshotExclusiveGroup, null,
    React.createElement(ChartDisclosure, { testId: "snapshot-profile", value: "5/1", label: "Profile" }, "P"),
    React.createElement(ChartDisclosure, { testId: "snapshot-definition", value: "Split", label: "Definition" }, "D"),
  ),
);
assert.equal((closed.match(/<details /g) ?? []).length, 2);
assert.doesNotMatch(closed, /<details[^>]* open/);

console.log("PASS assert-snapshot-read-more-deep-dive: five visible strings, four aria-labels, distinct pointers, row ids, Environment/Centers/Inner Authority exclusions, exclusive-open wiring.");
