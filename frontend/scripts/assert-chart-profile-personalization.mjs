/**
 * Chart profile personalization (brief 17353706…).
 * Scope change 27 Nov 2026 10:06 PM Bangkok: new copy is English and Dutch only.
 * de/es/fr catalogs and Profile behavior stay as on main 87bd4665.
 * Run: npx tsx scripts/assert-chart-profile-personalization.mjs
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
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

const pkg = read("package.json");
assert.match(
  pkg,
  /"assert:chart-profile-personalization": "npx tsx scripts\/assert-chart-profile-personalization\.mjs"/,
  "package.json wires the assert",
);

const { chartVoiceName } = await import("../src/lib/chartVoice.ts");
const { PROFILE_LEAD_SELF, PROFILE_LEAD_OTHER, snapshotProfileLine } = await import(
  "../src/lib/essays/snapshotProfileVoice.ts"
);
const { resolveHdCopy } = await import("../src/lib/essays/resolveHdCopy.ts");
const { SNAPSHOT_PROFILE_LINES_OTHER } = await import(
  "../src/lib/essays/snapshotOtherPersonCopy.ts"
);
const { profilePresentation } = await import("../src/lib/profilePresentation.ts");
const { SnapshotProfileBody } = await import("../src/components/SnapshotProfileBody.tsx");
const { readChartTypeOpen, writeChartTypeOpen, writeChartTypeOpenIfNull } = await import(
  "../src/lib/chartTypeOpen.ts"
);
const { ChartTypeBox } = await import("../src/components/ChartTypeBox.tsx");
const { I18nProvider } = await import("../src/lib/i18n/index.ts");

const PROFILES = ["1/3", "1/4", "2/4", "2/5", "3/5", "3/6", "4/6", "4/1", "5/1", "5/2", "6/2", "6/3"];
const LEAD_LOCALES = ["en", "nl"];
const LINES = [1, 2, 3, 4, 5, 6];
const NAME = "Juno $&";
const insert = (template) => template.replaceAll("{name}", () => NAME);

// --- 2. Voice ---
const self = { slot_kind: "self", label: "Me" };
const friend = { slot_kind: "friend", label: "Kenji" };
const base = {
  viewMode: "saved",
  isNewPersonUi: false,
  saveAs: "self",
  hasSelfSaved: true,
  friendName: "",
  personFallback: "Person",
};
assert.equal(chartVoiceName({ ...base, selectedRow: self }), undefined, "self row is you");
assert.equal(
  chartVoiceName({ ...base, selectedRow: self, viewMode: null, isNewPersonUi: true, hasSelfSaved: false }),
  undefined,
  "first-run path is you",
);
assert.equal(
  chartVoiceName({ ...base, selectedRow: self, viewMode: "preview" }),
  undefined,
  "preview with a self row selected is you",
);
assert.equal(
  chartVoiceName({
    ...base,
    selectedRow: null,
    viewMode: "preview",
    isNewPersonUi: true,
    saveAs: "self",
    hasSelfSaved: false,
    friendName: "Mia",
  }),
  undefined,
  "preview in self mode with no self saved is you",
);
assert.equal(chartVoiceName({ ...base, selectedRow: friend }), "Kenji", "friend row uses the label");
assert.equal(
  chartVoiceName({ ...base, selectedRow: { slot_kind: "friend", label: "  " } }),
  "Person",
  "empty friend label uses the fallback",
);
assert.equal(
  chartVoiceName({ ...base, selectedRow: { slot_kind: "friend", label: "me" } }),
  "Person",
  "me friend label uses the fallback",
);
assert.equal(
  chartVoiceName({
    ...base,
    selectedRow: null,
    viewMode: "preview",
    isNewPersonUi: true,
    saveAs: "friend",
    hasSelfSaved: false,
    friendName: "Mia",
  }),
  "Mia",
  "new-person preview saveAs friend",
);
assert.equal(
  chartVoiceName({
    ...base,
    selectedRow: null,
    viewMode: "preview",
    isNewPersonUi: true,
    saveAs: "self",
    hasSelfSaved: true,
    friendName: "  Mia  ",
  }),
  "Mia",
  "new-person preview when a self chart is already saved",
);
assert.equal(
  chartVoiceName({
    ...base,
    selectedRow: null,
    viewMode: "preview",
    isNewPersonUi: true,
    saveAs: "friend",
    friendName: "  ",
  }),
  "Person",
  "empty preview name uses the fallback",
);
assert.equal(
  chartVoiceName({
    ...base,
    selectedRow: null,
    viewMode: "preview",
    isNewPersonUi: true,
    saveAs: "friend",
    friendName: "Me",
  }),
  "Person",
  "me preview name uses the fallback",
);

const page = read("src/app/profile/page.tsx");
const ownerAt = page.indexOf("ownerName=");
const ownerExpr = page.slice(ownerAt, page.indexOf("\n", ownerAt));
assert.match(ownerExpr, /ownerName=\{chartPersonName\}/);
assert.doesNotMatch(ownerExpr, /first_name/, "no first_name reaches ownerName");
assert.match(page, /personName=\{chartPersonName\}/);
assert.match(page, /const snapshotPersonName = chartPersonName;/);
assert.match(page, /<ChartDeepDive\s+personName=\{snapshotPersonName\}/);

// --- 3. Profile leads (en/nl only) ---
for (const locale of LEAD_LOCALES) {
  assert.equal(Object.keys(PROFILE_LEAD_SELF[locale]).length, 6, `${locale} self leads`);
  assert.equal(Object.keys(PROFILE_LEAD_OTHER[locale]).length, 6, `${locale} other leads`);
  for (const line of LINES) {
    const selfLead = PROFILE_LEAD_SELF[locale][line];
    const otherLead = PROFILE_LEAD_OTHER[locale][line];
    assert.ok(words(selfLead) <= 30 && words(otherLead) <= 30, `${locale} line ${line} ≤ 30 words`);
    assert.ok(Math.abs(words(selfLead) - words(otherLead)) <= 6, `${locale} line ${line} length`);
    assert.match(otherLead, /^\{name\}/, `${locale} other lead ${line} starts with the name`);
    if (locale === "en") {
      assert.match(selfLead, /^(You|Your)\b/);
      assert.doesNotMatch(otherLead, /\b(you|your|yours|yourself)\b/i);
    }
    if (locale === "nl") assert.match(selfLead, /^(Je)\b/);
    assert.doesNotMatch(selfLead + otherLead, /\b(Sie|Ihr|Ihnen|Ihre)\b/);
    assert.doesNotMatch(selfLead + otherLead, /\b(vous|votre|vos)\b/);
    assert.doesNotMatch(selfLead + otherLead, /\b(usted|ustedes)\b/);
    assert.doesNotMatch(selfLead + otherLead, /\b(u|uw)\b/);
    assert.doesNotMatch(otherLead, /\{name\}s|\{name\}'|\{name\}’/);
  }
}

for (const profile of PROFILES) {
  const [a, b] = profile.split("/").map(Number);
  for (const locale of LEAD_LOCALES) {
    const selfCopy = snapshotProfileLine(profile, locale);
    const selfSections = profilePresentation(profile, selfCopy).sections;
    assert.equal(selfSections.length, 2, `${locale} ${profile} self sections`);
    const selfBriefs = [resolveHdCopy(locale).PROFILE_LINES[a].brief, resolveHdCopy(locale).PROFILE_LINES[b].brief];
    const selfLeads = [PROFILE_LEAD_SELF[locale][a], PROFILE_LEAD_SELF[locale][b]];
    selfSections.forEach((section, i) => {
      assert.ok(section.brief.startsWith(selfLeads[i]), `${locale} ${profile} self lead ${i}`);
      const cut = selfBriefs[i].indexOf(". ");
      assert.equal(section.brief.slice(selfLeads[i].length + 1), selfBriefs[i].slice(cut + 2));
    });
    assert.deepEqual(
      selfSections.map((s) => s.name),
      profilePresentation(profile).value.split(" — ")[1].split(" / "),
    );

    const otherCopy = snapshotProfileLine(profile, locale, NAME);
    assert.ok(otherCopy.includes(NAME), `${locale} ${profile} renders $& literally`);
    assert.doesNotMatch(otherCopy, /\{name\}/);
    const otherSections = profilePresentation(profile, otherCopy).sections;
    const otherBriefs = [SNAPSHOT_PROFILE_LINES_OTHER[locale][a], SNAPSHOT_PROFILE_LINES_OTHER[locale][b]];
    const otherLeads = [insert(PROFILE_LEAD_OTHER[locale][a]), insert(PROFILE_LEAD_OTHER[locale][b])];
    otherSections.forEach((section, i) => {
      assert.ok(section.brief.startsWith(otherLeads[i]), `${locale} ${profile} other lead ${i}`);
      const cut = otherBriefs[i].indexOf(". ");
      assert.equal(section.brief.slice(otherLeads[i].length + 1), insert(otherBriefs[i].slice(cut + 2)));
    });

    const html = renderToStaticMarkup(
      React.createElement(SnapshotProfileBody, { profile, copy: selfCopy }),
    );
    assert.equal((html.match(/<h3/g) ?? []).length, 2, `${locale} ${profile} two headings`);
    for (const feature of ["Investigator", "Hermit", "Martyr", "Opportunist", "Heretic", "Role Model"]) {
      if (selfSections.some((s) => s.name === feature)) assert.ok(html.includes(feature));
    }
  }
  for (const locale of ["de", "es", "fr"]) {
    assert.equal(
      snapshotProfileLine(profile, locale),
      snapshotProfileLine(profile, "en"),
      `${locale} ${profile} falls back to the English line`,
    );
    assert.equal(
      snapshotProfileLine(profile, locale, "Kenji"),
      snapshotProfileLine(profile, "en", "Kenji"),
      `${locale} ${profile} other falls back to the English line`,
    );
  }
}

// --- 4. Frozen copy, pinned to main 87bd4665 ---
const FROZEN = {
  "src/lib/hdCopy.ts": "b8c89bc238dcc631717cdf098d92756f63df6e22d73ac67465851aa58d972ec6",
  "src/lib/essays/hdCopy.es.ts": "895abfa6bb5270c546b8a96778e80eebb60c9215b8961a9a40eebfd3709451b6",
  "src/lib/essays/hdCopy.nl.ts": "8528a2f8e2ec67fd886cb5fb75a6784243dd492cbdaf7cb4693b3e827ef4f941",
  "src/lib/essays/snapshotOtherPersonCopy.ts": "a146f37cdd159d430de72e8c9d925654d5c17a5db70aa17e74b35a1795b75864",
  "src/lib/essays/resolveHdCopy.ts": "32466a4cc54502412783bfb36398f263d4af93734f4080b0d4df60aa006967b1",
  "src/lib/essays/snapshotShortCopy.ts": "98bb7a4974cae8c533d6fe57fdcb72ec35dc1e5276dfbece891aacd5db4e5679",
  "src/lib/i18n/messages/de.ts": "dada3ac0614ba4d01a580c7d7d579316ae4d99372f0fdfa44eec3fd111f67f9f",
  "src/lib/i18n/messages/es.ts": "8fc6e78052efad2b30201021ebf4265c5d59f6bea1855d47e0e91810c523732e",
  "src/lib/i18n/messages/fr.ts": "9c2b4166fe4d19bc78ab0562f7050fff75b01e9203944fac5543a730b418edff",
};
for (const [rel, digest] of Object.entries(FROZEN)) {
  assert.equal(sha(read(rel)), digest, `${rel} unchanged from main 87bd4665`);
}

// --- 5. Type open ---
function memoryStorage(seed = {}) {
  const data = { ...seed };
  const writes = [];
  return {
    writes,
    getItem: (key) => (Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
      writes.push([key, String(value)]);
    },
  };
}
function installWindow(storage) {
  globalThis.window = {
    localStorage: storage,
    location: { hash: "", href: "http://localhost/profile" },
    addEventListener() {},
    removeEventListener() {},
  };
}
const renderBox = (props) =>
  renderToStaticMarkup(
    React.createElement(I18nProvider, { accountLocale: "en" }, React.createElement(ChartTypeBox, props)),
  );
const detailsOpen = (html) => {
  const tag = html.slice(html.indexOf("<details"), html.indexOf(">", html.indexOf("<details")) + 1);
  return /\sopen(?:=|\s|>|\/)/.test(tag);
};

installWindow(memoryStorage());
assert.equal(detailsOpen(renderBox({ actualType: "Projector" })), false, "bare render stays closed");
assert.equal(detailsOpen(renderBox({ actualType: "Projector", initialOpen: true })), true, "initialOpen opens");

installWindow(memoryStorage({ "hd-biohack:chart-type-open:3:9": "0" }));
assert.equal(
  detailsOpen(renderBox({ actualType: "Projector", initialOpen: true, openStorageKey: { userId: 3, chartId: 9 } })),
  false,
  "stored 0 stays closed even when initialOpen",
);
installWindow(memoryStorage({ "hd-biohack:chart-type-open:3:9": "1" }));
assert.equal(
  detailsOpen(renderBox({ actualType: "Projector", openStorageKey: { userId: 3, chartId: 9 } })),
  true,
  "stored 1 opens",
);

const store = memoryStorage();
installWindow(store);
assert.equal(readChartTypeOpen(4, 8), null);
writeChartTypeOpen(4, 8, true);
assert.equal(store.getItem("hd-biohack:chart-type-open:4:8"), "1");
assert.equal(readChartTypeOpen(4, 8), true);
writeChartTypeOpen(4, 8, false);
assert.equal(store.getItem("hd-biohack:chart-type-open:4:8"), "0");
assert.equal(readChartTypeOpen(4, 8), false);
const held = globalThis.window;
delete globalThis.window;
assert.equal(readChartTypeOpen(4, 8), null, "read no-ops without window");
writeChartTypeOpen(4, 8, true);
writeChartTypeOpenIfNull(4, 8);
globalThis.window = held;
assert.equal(store.getItem("hd-biohack:chart-type-open:4:8"), "0", "writes no-op without window");
writeChartTypeOpenIfNull(4, 8);
assert.equal(store.getItem("hd-biohack:chart-type-open:4:8"), "0", "if-null does not overwrite");
delete store.writes;
const fresh = memoryStorage();
installWindow(fresh);
writeChartTypeOpenIfNull(1, 2);
assert.equal(fresh.getItem("hd-biohack:chart-type-open:1:2"), "1");

const typeBox = read("src/components/ChartTypeBox.tsx");
assert.match(
  typeBox,
  /onClick=\{\(\) => \{[\s\S]*?writeChartTypeOpen\(\s*openStorageKey\.userId,\s*openStorageKey\.chartId,\s*!typeDetailsOpen,/,
  "summary click writes the inverted open state",
);
assert.doesNotMatch(
  typeBox.slice(typeBox.indexOf("observeChartNavigation(() =>"), typeBox.indexOf("const actual")),
  /setTypeDetailsOpen\(false\)|writeChartTypeOpen/,
  "navigation clears preview only",
);
const chip = typeBox.slice(typeBox.indexOf("TYPES.filter"), typeBox.indexOf("))}\n"));
assert.match(chip, /setTypeThemePreview\(name\);\s*setTypeDetailsOpen\(true\);/);
assert.doesNotMatch(chip, /writeChartTypeOpen/, "Preview chip writes nothing");

const createIdx = page.indexOf("create-friend / create-self");
const createBlock = page.slice(createIdx, page.indexOf("applyRow(createdOrUpdated", createIdx));
assert.match(createBlock, /writeChartTypeOpenIfNull\(activeUser\.id, newId\)/);
const updateBlock = page.slice(page.lastIndexOf('if (saveIntent === "update")', createIdx), createIdx);
assert.doesNotMatch(updateBlock, /writeChartTypeOpenIfNull/, "update is not a first generation");
const firstRun = page.slice(page.indexOf("const submitFirstRun"), page.indexOf("const patchFirstRunBirth"));
assert.match(firstRun, /writeChartTypeOpenIfNull\(activeUser\.id, newId\)/);
assert.match(page, /setPreviewJustGenerated\(true\)/);
assert.match(page, /initialOpen=\{viewMode === "preview" && previewJustGenerated\}/);
assert.match(
  page,
  /openStorageKey=\{\s*user && viewMode === "saved" && selectedSavedRow\s*\? \{ userId: user\.id, chartId: selectedSavedRow\.id \}/,
);

// --- 6. Profile → Deep dive link ---
const snapshot = page.slice(page.indexOf('id="snapshot"'), page.indexOf("<ChartDeepDive"));
const profileBox = snapshot.slice(
  snapshot.indexOf('testId="snapshot-profile"'),
  snapshot.indexOf('testId="snapshot-how-you-decide"'),
);
assert.match(profileBox, /testId="snapshot-profile-deep-dive-pointer"/);
assert.match(profileBox, /rowId="deep-dive-profile"/);
const deepDive = read("src/components/ChartDeepDive.tsx");
assert.match(deepDive, /id="deep-dive-profile"/);

// --- 7. Untouched v9, classic graph, and #158 files ---
// Rebase onto febe34f (#158 merge): these pins are the post-#158 bytes. This branch does not edit them.
assert.equal(sha(read("src/components/BodyGraph.tsx")), "8f9380005b90a2b6e34190650a599c248d79e84e13c99e15ea9086d5b3dd2da8");
assert.equal(sha(read("src/lib/bodygraphGeometry.ts")), "cc8c5433776ee2e8758f95f868597a5821f8077eec8a92ec7bcb6cad15f1b743");
assert.equal(sha(read("src/components/ChartBodygraph.tsx")), "1fe364d73c574a15106159dd77768e830a40dd26ab63222e48f1951abfc30617");
assert.equal(sha(read("src/app/profile/chart-field-notes.css")), "ee151956c4b96d3458c6ea0306dd2f74ac59df0a00b3dd8f891089af0d00ecf9");
assert.equal(sha(read("src/app/transits/page.tsx")), "32379668ae081b642c42dd61b245b896bf73deddddc87e518e77a418d49a0cfd");
assert.equal(sha(read("src/lib/i18n/messages/todaySoul.en.ts")), "dc89f81cbb1e24c7a8142418f755e13c07671b96a5246a5eb6e1ed21b5b5cf48");
assert.equal(sha(read("src/lib/i18n/messages/todaySoul.de.ts")), "89569bea7884f3fdeef818a8331b2dd2d8ab0a1614901cfe1608bd0a7a6aa5fd");
assert.equal(sha(read("src/lib/i18n/messages/todaySoul.es.ts")), "68a5139452c9de2e223276ff3e3ca13064ab21eef74479ab49518d52b8ba94cf");
assert.equal(sha(read("src/lib/i18n/messages/todaySoul.fr.ts")), "1a8ed7d110c7453e707b700a05f98e3196c54bf60073802cd0219bffc4dd1ede");
assert.equal(sha(read("src/lib/i18n/messages/todaySoul.nl.ts")), "e8b2cd7865d672a55ff6868f7de20545c028808627b3e5e40ecaabb571a81a61");
assert.equal(sha(read("src/components/TodayIndication.tsx")), "68a908ea51723fa753d3e1599949e859fbd0d436b198aed7ba43f2cb9711b8bb");
assert.equal(sha(read("src/lib/bridgedChannels.ts")), "fe188cb7292bc5cb464da56ee6f2650f13053b61b184168fb612c508c76495ac");
assert.equal(sha(read("src/lib/todayYourWay.ts")), "26977fb88989466a0496a1c59f55f1f20764721de134c40f16e666bc0e9c4c34");
// assert-today-calm-pass.mjs differs from febe34f only by the globals.css pin lift above.
assert.equal(sha(read("scripts/assert-today-calm-pass.mjs")), "392080a4eb19cacf5400e1de1adf4a5850717506ea8149447a57297835291aec");

console.log("PASS assert-chart-profile-personalization");
