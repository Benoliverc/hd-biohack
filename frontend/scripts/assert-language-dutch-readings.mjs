/**
 * Language Dutch readings — source ACs (FE).
 * Run: npx tsx scripts/assert-language-dutch-readings.mjs
 *
 * Dutch essay + Soul catalogs wired for locale=nl; Spanish remains the es path;
 * English source remains the en/de/fr fallback.
 */
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AP = "\u2019";

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function parseMessages(src) {
  const out = {};
  const re = /['"]([^'"]+)['"]\s*:\s*(['"])([\s\S]*?)\2/g;
  let m;
  while ((m = re.exec(src))) out[m[1]] = m[3];
  return out;
}

function catalog(loc) {
  return parseMessages(read(`src/lib/i18n/messages/${loc}.ts`));
}

function loadSoulReadings(rel, label) {
  const src = read(rel);
  const start = src.indexOf("{");
  const end = src.lastIndexOf("}");
  assert.ok(start >= 0 && end > start, `${label} object literal`);
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${src.slice(start, end + 1)});`)();
}

function interpolate(template, params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    params[name] != null ? String(params[name]) : match,
  );
}

function firstLevelExportKeys(src, exportName) {
  const re = new RegExp(`export const ${exportName}\\b[^=]*=\\s*\\{`);
  const m = src.match(re);
  if (!m) return new Set();
  const start = m.index + m[0].lastIndexOf("{");
  const keys = new Set();
  let i = start + 1;
  let depth = 1;
  let quote = null;
  let tick = false;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    const prev = src[i - 1];
    if (tick) {
      if (ch === "`" && prev !== "\\") tick = false;
      i++;
      continue;
    }
    if (quote) {
      if (ch === quote && prev !== "\\") quote = null;
      i++;
      continue;
    }
    if (ch === "`") {
      tick = true;
      i++;
      continue;
    }
    if (depth === 1) {
      const slice = src.slice(i);
      const qm = slice.match(/^["']([^"']+)["']\s*:/);
      const num = slice.match(/^(\d+)\s*:/);
      const id = slice.match(/^([A-Za-z_][A-Za-z0-9_ /().-]*)\s*:/);
      const atStart = /(^|\n)\s*$/.test(src.slice(Math.max(0, i - 20), i));
      if (qm && atStart) {
        keys.add(qm[1]);
        i += qm[0].length;
        continue;
      }
      if (num && atStart) {
        keys.add(num[1]);
        i += num[0].length;
        continue;
      }
      if (id && atStart) {
        keys.add(id[1].trim());
        i += id[0].length;
        continue;
      }
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      i++;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) break;
    }
    i++;
  }
  return keys;
}

const pkg = read("package.json");
assert.ok(
  pkg.includes(
    '"assert:language-dutch-readings": "npx tsx scripts/assert-language-dutch-readings.mjs"',
  ),
  "package.json wires assert:language-dutch-readings",
);

const locales = ["en", "de", "es", "fr", "nl"];
const catalogs = Object.fromEntries(locales.map((id) => [id, catalog(id)]));
const en = catalogs.en;
const soulEs = loadSoulReadings("src/lib/i18n/soulReadings/es.ts", "esSoulReadings");
const soulNl = loadSoulReadings("src/lib/i18n/soulReadings/nl.ts", "nlSoulReadings");

function resolveSoulCopyLite(locale, part, fallback = "") {
  const catalogForLocale = locale === "nl" ? soulNl : null;
  if (!catalogForLocale || !part?.key) return fallback;
  const tpl = catalogForLocale[part.key];
  if (!tpl) return fallback;
  return interpolate(tpl, part.params);
}

const LOCKED_LANGUAGE_HELP =
  "UI language covers navigation, Settings, login, shell labels, Today, and Chart/Soul/Protocols chrome. In Dutch, Chart Deep Dive essays, Chart snapshot blurbs, and Soul readings are translated too. HD Type, Authority, and Center names, and feature names such as Today, Protocols, Chart, Soul, Move, Today’s Move, How to read, and Shelf, stay in English.";

assert.equal(en["settings.languageHelp"], LOCKED_LANGUAGE_HELP, "en settings.languageHelp");
assert.match(en["settings.languageHelp"], new RegExp(`Today${AP}s Move`));

for (const loc of ["de", "es", "fr", "nl"]) {
  assert.ok(catalogs[loc]["settings.languageHelp"], `missing ${loc} settings.languageHelp`);
  assert.notEqual(
    catalogs[loc]["settings.languageHelp"],
    LOCKED_LANGUAGE_HELP,
    `${loc} settings.languageHelp must be translated`,
  );
}

// --- (a) Dutch essay and Soul catalogs exist and are wired for locale = nl ---
const essayFiles = [
  "src/lib/essays/hdChannelCopy.nl.ts",
  "src/lib/essays/hdCopy.nl.ts",
  "src/lib/essays/hdProfileCombos.nl.ts",
  "src/lib/essays/resolveHdCopy.ts",
];
for (const rel of essayFiles) {
  assert.ok(existsSync(resolve(root, rel)), `missing ${rel}`);
}

const resolver = read("src/lib/essays/resolveHdCopy.ts");
assert.match(resolver, /export function resolveHdCopy/);
assert.match(resolver, /export function useHdCopy/);
assert.match(resolver, /locale === "nl"/);
assert.doesNotMatch(resolver, /locale === "es"/);
assert.match(resolver, /from "@\/lib\/essays\/hdCopy\.nl"/);
assert.doesNotMatch(resolver, /from "@\/lib\/essays\/hdCopy\.es"/);

const channelEn = firstLevelExportKeys(read("src/lib/hdChannelCopy.ts"), "CHANNEL_COPY");
const channelNl = firstLevelExportKeys(read("src/lib/essays/hdChannelCopy.nl.ts"), "CHANNEL_COPY");
const channelEs = firstLevelExportKeys(read("src/lib/essays/hdChannelCopy.es.ts"), "CHANNEL_COPY");
assert.equal(channelEn.size, 36, "36 English channel essays");
assert.deepEqual([...channelNl].sort(), [...channelEn].sort(), "Dutch channel keys match English");
assert.deepEqual([...channelEs].sort(), [...channelEn].sort(), "Spanish channel keys still match English");

const comboEn = firstLevelExportKeys(read("src/lib/hdProfileCombos.ts"), "PROFILE_COMBO_ESSAYS");
const comboNl = firstLevelExportKeys(
  read("src/lib/essays/hdProfileCombos.nl.ts"),
  "PROFILE_COMBO_ESSAYS",
);
const comboEs = firstLevelExportKeys(
  read("src/lib/essays/hdProfileCombos.es.ts"),
  "PROFILE_COMBO_ESSAYS",
);
assert.equal(comboEn.size, 12, "12 English profile combo essays");
assert.deepEqual([...comboNl].sort(), [...comboEn].sort(), "Dutch profile combo keys match English");
assert.deepEqual([...comboEs].sort(), [...comboEn].sort(), "Spanish profile combo keys still match English");

const HD_MAPS = [
  "TYPE_COPY",
  "STRATEGY_COPY",
  "AUTHORITY_COPY",
  "DEFINITION_COPY",
  "PROFILE_LINES",
  "CENTER_COPY",
  "TYPE_BATTERY",
  "AUTHORITY_PLAIN",
  "OPEN_CENTER_WATCH",
];
const hdEnSrc = read("src/lib/hdCopy.ts");
const hdNlSrc = read("src/lib/essays/hdCopy.nl.ts");
const hdEsSrc = read("src/lib/essays/hdCopy.es.ts");
for (const name of HD_MAPS) {
  const a = firstLevelExportKeys(hdEnSrc, name);
  const b = firstLevelExportKeys(hdNlSrc, name);
  const c = firstLevelExportKeys(hdEsSrc, name);
  assert.ok(a.size > 0, `English ${name} has keys`);
  assert.deepEqual([...b].sort(), [...a].sort(), `Dutch ${name} keys match English`);
  assert.deepEqual([...c].sort(), [...a].sort(), `Spanish ${name} keys still match English`);
}

const deepDive = read("src/components/ChartDeepDive.tsx");
assert.match(deepDive, /useHdCopy/);
assert.doesNotMatch(
  deepDive,
  /import \{[^}]*\bTYPE_COPY\b[^}]*\} from "@@?\/lib\/hdCopy"/,
);
assert.doesNotMatch(
  deepDive,
  /import \{[^}]*\bchannelMeaning\b[^}]*\} from "@@?\/lib\/hdCopy"/,
);
assert.doesNotMatch(
  deepDive,
  /import \{[^}]*\bprofileLearnMore\b[^}]*\} from "@@?\/lib\/hdCopy"/,
);

const profile = read("src/app/profile/page.tsx");
assert.match(profile, /useHdCopy/);
assert.doesNotMatch(
  profile,
  /import \{[^}]*\bTYPE_COPY\b[^}]*\} from "@@?\/lib\/hdCopy"/,
);

const soulCopy = read("src/lib/soulCopy.ts");
assert.doesNotMatch(soulCopy, /from "@\/lib\/i18n\/soulReadings\/es"/);
assert.match(soulCopy, /from "@\/lib\/i18n\/soulReadings\/nl"/);
assert.match(soulCopy, /function isTranslatedLocale/);
assert.doesNotMatch(soulCopy, /locale === "es" \|\| locale === "nl"/);
assert.match(soulCopy, /export function resolveSoulCopy/);
assert.match(soulCopy, /export function useSoulCopy/);

const painted = [
  "src/app/soul/page.tsx",
  "src/components/soul/PartnerOverviewCard.tsx",
  "src/components/soul/PartnerNuanceBlock.tsx",
];
for (const rel of painted) {
  const src = read(rel);
  assert.match(src, /useSoulCopy|resolveSoulCopy/, `${rel} uses soulCopy`);
}

const soulEsKeys = Object.keys(soulEs).sort();
const soulNlKeys = Object.keys(soulNl).sort();
assert.equal(soulEsKeys.length, 747, "Spanish Soul catalog has 747 keys");
assert.deepEqual(soulNlKeys, soulEsKeys, "Dutch Soul catalog keys match Spanish (747)");

assert.equal(
  soulNlKeys.filter((k) => k.startsWith("soul.read.channelName.")).length,
  36,
  "36 Dutch channel nicknames",
);
assert.ok(soulNl["soul.read.howYouLove.generator.nameless"]);
assert.ok(soulNl["soul.read.howYouLove.generator.named"]);
assert.ok(soulNl["soul.read.howTheyLove.generator.nameless"]);
assert.ok(soulNl["soul.read.howTheyLove.generator.named"]);
assert.match(soulNl["soul.read.howTheyLove.generator.named"], /\{name\} houdt/);
assert.match(soulNl["soul.read.howTheyLove.generator.nameless"], /Ze houden/);

const fixture = {
  disclaimer: {
    key: "soul.read.disclaimer",
    params: {},
    en: "Informational reading — not medical, legal, or financial advice.",
  },
  lede: {
    key: "soul.read.lede.magnetic_alchemy.life",
    params: {},
    en: "English lede fallback",
  },
  title: {
    key: "soul.read.card.circuit_bridge.title",
    params: {},
    en: "Wire Together",
  },
  namedLove: {
    key: "soul.read.howYouLove.generator.named",
    params: { name: "Alex" },
    en: "Alex loves in English fallback.",
  },
  namelessLove: {
    key: "soul.read.howYouLove.generator.nameless",
    params: {},
    en: "The Generator loves in English fallback.",
  },
  gift: {
    key: "soul.read.nuance.6-59.gift",
    params: {},
    en: "English gift fallback",
  },
};

for (const [name, item] of Object.entries(fixture)) {
  assert.ok(soulNl[item.key], `Dutch catalog has ${item.key} (${name})`);
  assert.ok(soulEs[item.key], `Spanish catalog has ${item.key} (${name})`);
  const nlOut = resolveSoulCopyLite("nl", item, item.en);
  const esOut = resolveSoulCopyLite("es", item, item.en);
  assert.ok(nlOut && nlOut.trim().length > 0, `${name} Dutch resolve is non-empty`);
  assert.equal(esOut, item.en, `${name} es falls back to the English body`);
  assert.notEqual(nlOut, item.en, `${name} Dutch is not the English fallback`);
  assert.notEqual(nlOut, esOut, `${name} Dutch is not the Spanish body`);
  assert.equal(resolveSoulCopyLite("en", item, item.en), item.en, `${name} en falls back to English body`);
  assert.equal(resolveSoulCopyLite("de", item, item.en), item.en, `${name} de falls back to English body`);
  assert.equal(resolveSoulCopyLite("fr", item, item.en), item.en, `${name} fr falls back to English body`);
}
assert.equal(
  resolveSoulCopyLite("nl", { key: "soul.read.missing.doesNotExist", params: {} }, "English body"),
  "English body",
  "missing Dutch key falls back to English body",
);
assert.equal(
  resolveSoulCopyLite("es", { key: "soul.read.missing.doesNotExist", params: {} }, "English body"),
  "English body",
  "missing Spanish key falls back to English body",
);
const namedNl = resolveSoulCopyLite("nl", fixture.namedLove, fixture.namedLove.en);
assert.match(namedNl, /Alex/);
assert.doesNotMatch(namedNl, /loves/);
assert.match(namedNl, /houdt/);
const namedEs = resolveSoulCopyLite("es", fixture.namedLove, fixture.namedLove.en);
assert.equal(namedEs, fixture.namedLove.en, "es named love falls back to the English body");
assert.notEqual(namedNl, namedEs);

// Long-form must not be poured into main message catalogs
for (const loc of locales) {
  const keys = Object.keys(catalogs[loc]);
  assert.ok(
    !keys.some((k) => k.startsWith("soul.read.")),
    `${loc} main catalog must not contain soul.read.* long-form`,
  );
}

// --- (c) English source still renders when locale is en, de, or fr ---
const repoRoot = resolve(root, "..");
function gitDiff(rel) {
  return execSync(`git diff HEAD -- ${rel}`, { cwd: repoRoot, encoding: "utf8" });
}
assert.equal(gitDiff("frontend/src/lib/hdChannelCopy.ts").trim(), "", "English channel essays unchanged");
assert.equal(gitDiff("frontend/src/lib/hdProfileCombos.ts").trim(), "", "English profile combo essays unchanged");
assert.doesNotMatch(gitDiff("frontend/src/lib/hdCopy.ts"), /TYPE_COPY/, "TYPE_COPY English source not rewritten");
assert.match(hdEnSrc, /You move fast once something is a real yes/);
assert.equal(gitDiff("frontend/src/lib/i18n/soulReadings/es.ts").trim(), "", "Spanish Soul catalog unchanged");
assert.equal(gitDiff("frontend/src/lib/essays/hdCopy.es.ts").trim(), "", "Spanish hdCopy unchanged");
assert.equal(gitDiff("frontend/src/lib/essays/hdChannelCopy.es.ts").trim(), "", "Spanish channel essays unchanged");
assert.equal(gitDiff("frontend/src/lib/essays/hdProfileCombos.es.ts").trim(), "", "Spanish profile combos unchanged");

const types = read("src/lib/i18n/types.ts");
assert.match(types, /export const LOCALES = \["en", "nl"\] as const;/);
for (const loc of ["pt", "ko", "ja", "zh"]) {
  assert.doesNotMatch(types, new RegExp(`"${loc}"`));
  assert.ok(!existsSync(resolve(root, `src/lib/i18n/messages/${loc}.ts`)), `no ${loc} catalog`);
}

// Dutch this pass owns is je / jullie, never u / uw
function noFormalU(label, src) {
  assert.doesNotMatch(src, /(^|[^A-Za-zÀ-ÿ\\])[uU](?![A-Za-zÀ-ÿw])/, `${label} must not use formal u`);
  assert.doesNotMatch(src, /(^|[^A-Za-zÀ-ÿ\\])[uU]w\b/, `${label} must not use formal uw`);
}
noFormalU("soulReadings/nl.ts", read("src/lib/i18n/soulReadings/nl.ts"));
noFormalU("hdCopy.nl.ts", read("src/lib/essays/hdCopy.nl.ts"));
noFormalU("hdChannelCopy.nl.ts", read("src/lib/essays/hdChannelCopy.nl.ts"));
noFormalU("hdProfileCombos.nl.ts", read("src/lib/essays/hdProfileCombos.nl.ts"));
noFormalU("settings.languageHelp nl", catalogs.nl["settings.languageHelp"] || "");

const ownedDutch = [
  read("src/lib/i18n/soulReadings/nl.ts"),
  read("src/lib/essays/hdCopy.nl.ts"),
  read("src/lib/essays/hdChannelCopy.nl.ts"),
  read("src/lib/essays/hdProfileCombos.nl.ts"),
  catalogs.nl["settings.languageHelp"] || "",
].join("\n");
assert.match(ownedDutch, /\bje\b/);
assert.match(ownedDutch, /\bjullie\b/);

console.log("assert:language-dutch-readings PASS");
