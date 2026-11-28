/**
 * Language Spanish readings — source ACs (FE).
 * Run: npx tsx scripts/assert-language-spanish-readings.mjs
 *
 * Leftover chrome translated in de/es/fr/nl; Spanish essay + Soul catalogs
 * wired for locale=es; Dutch readings are a sibling path for locale=nl;
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
  const main = parseMessages(read(`src/lib/i18n/messages/${loc}.ts`));
  const soulPath = resolve(root, `src/lib/i18n/messages/todaySoul.${loc}.ts`);
  try {
    Object.assign(main, parseMessages(readFileSync(soulPath, "utf8")));
  } catch {
    /* optional */
  }
  return main;
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

function resolveSoulCopyLite(locale, part, fallback = "") {
  const catalog = locale === "nl" ? soulNl : null;
  if (!catalog || !part?.key) return fallback;
  const tpl = catalog[part.key];
  if (!tpl) return fallback;
  return interpolate(tpl, part.params);
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
    '"assert:language-spanish-readings": "npx tsx scripts/assert-language-spanish-readings.mjs"',
  ),
  "package.json wires assert:language-spanish-readings",
);

const locales = ["en", "de", "es", "fr", "nl"];
const catalogs = Object.fromEntries(locales.map((id) => [id, catalog(id)]));
const en = catalogs.en;
const soulEs = loadSoulReadings("src/lib/i18n/soulReadings/es.ts", "esSoulReadings");
const soulNl = loadSoulReadings("src/lib/i18n/soulReadings/nl.ts", "nlSoulReadings");

function mustEqual(loc, key, expected) {
  assert.equal(catalogs[loc][key], expected, `${loc} ${key}`);
}

function mustHave(loc, key) {
  assert.ok(catalogs[loc][key], `missing ${loc} ${key}`);
}

// --- (a) leftover chrome actually translated ---
const LOCKED_LANGUAGE_HELP =
  "UI language covers navigation, Settings, login, shell labels, Today, and Chart/Soul/Protocols chrome. In Dutch, Chart Deep Dive essays, Chart snapshot blurbs, and Soul readings are translated too. HD Type, Authority, and Center names, and feature names such as Today, Protocols, Chart, Soul, Move, Today’s Move, How to read, and Shelf, stay in English.";

mustEqual("en", "settings.languageHelp", LOCKED_LANGUAGE_HELP);
// typographic apostrophe in Today’s Move
assert.match(en["settings.languageHelp"], new RegExp(`Today${AP}s Move`));

for (const loc of ["de", "es", "fr", "nl"]) {
  mustHave(loc, "settings.languageHelp");
  assert.notEqual(
    catalogs[loc]["settings.languageHelp"],
    LOCKED_LANGUAGE_HELP,
    `${loc} settings.languageHelp must be translated`,
  );
}

const ITEM1 = {
  "chart.people.youLabel": { en: "You", de: "Du", es: "Tú", fr: "Toi", nl: "Jij" },
  "soul.chrome.youLabel": { en: "You", de: "Du", es: "Tú", fr: "Toi", nl: "Jij" },
  "soul.partner.youAnd": {
    en: "You & {name}",
    de: "Du & {name}",
    es: "Tú y {name}",
    fr: "Toi & {name}",
    nl: "Jij & {name}",
  },
  "soul.chrome.youToPerson": {
    en: "You → Person",
    de: "Du → Person",
    es: "Tú → Persona",
    fr: "Toi → Personne",
    nl: "Jij → Persoon",
  },
  "soul.chrome.personToYou": {
    en: "Person → You",
    de: "Person → Du",
    es: "Persona → Tú",
    fr: "Personne → Toi",
    nl: "Persoon → Jij",
  },
  "soul.chrome.youPersonStatus": {
    en: "You: {self} · Person: {friend}",
    de: "Du: {self} · Person: {friend}",
    es: "Tú: {self} · Persona: {friend}",
    fr: "Toi : {self} · Personne : {friend}",
    nl: "Jij: {self} · Persoon: {friend}",
  },
  "chart.people.peopleLabel": {
    en: "People",
    de: "Menschen",
    es: "Personas",
    fr: "Personnes",
    nl: "Mensen",
  },
  "chart.people.meLabel": { en: "Me", de: "Ich", es: "Yo", fr: "Moi", nl: "Ik" },
  "chart.deepDive.title": {
    en: "Deep dive",
    de: "Vertiefung",
    es: "A fondo",
    fr: "Plongée",
    nl: "Verdieping",
  },
  "chart.people.deepDive": {
    en: "Deep dive",
    de: "Vertiefung",
    es: "A fondo",
    fr: "Plongée",
    nl: "Verdieping",
  },
  "chart.literacy.deepDive.title": {
    en: "Deep dive",
    de: "Vertiefung",
    es: "A fondo",
    fr: "Plongée",
    nl: "Verdieping",
  },
  "chart.literacy.deepDive.jump": {
    en: "Deep dive",
    de: "Vertiefung",
    es: "A fondo",
    fr: "Plongée",
    nl: "Verdieping",
  },
  "chart.people.bodygraph": {
    en: "Bodygraph",
    de: "Körpergraph",
    es: "Gráfico corporal",
    fr: "Graphique corporel",
    nl: "Lichaamsgrafiek",
  },
  "chart.literacy.definedOpen.jump": {
    en: "Bodygraph",
    de: "Körpergraph",
    es: "Gráfico corporal",
    fr: "Graphique corporel",
    nl: "Lichaamsgrafiek",
  },
  "chart.literacy.channelsHanging.jump": {
    en: "Bodygraph",
    de: "Körpergraph",
    es: "Gráfico corporal",
    fr: "Graphique corporel",
    nl: "Lichaamsgrafiek",
  },
  "soul.chrome.playbookTitle": {
    en: "Playbook",
    de: "Leitfaden",
    es: "Guía",
    fr: "Guide",
    nl: "Draaiboek",
  },
  "soul.chrome.channelsTitle": {
    en: "Channels",
    de: "Kanäle",
    es: "Canales",
    fr: "Canaux",
    nl: "Kanalen",
  },
  "chart.deepDive.defined": {
    en: "Defined",
    de: "Definiert",
    es: "Definido",
    fr: "Défini",
    nl: "Gedefinieerd",
  },
  "chart.deepDive.open": {
    en: "Open",
    de: "Offen",
    es: "Abierto",
    fr: "Ouvert",
    nl: "Open",
  },
  "chart.deepDive.hangingGates": {
    en: "Hanging gates",
    de: "Hängetore",
    es: "Puertas colgantes",
    fr: "Portes en suspens",
    nl: "Hangende poorten",
  },
  "chart.deepDive.gateHeld": {
    en: "Gate {gate}",
    de: "Tor {gate}",
    es: "Puerta {gate}",
    fr: "Porte {gate}",
    nl: "Poort {gate}",
  },
  "chart.deepDive.gateLine": {
    en: "Gate · line",
    de: "Tor.Linie",
    es: "Puerta.Línea",
    fr: "Porte.Ligne",
    nl: "Poort · lijn",
  },
  "chart.deepDive.lon": {
    en: "Degree",
    de: "Länge°",
    es: "Long.°",
    fr: "Long.°",
    nl: "Graad",
  },
  "chart.deepDive.gatesCount": {
    en: "{n} gates",
    de: "{n} Tore",
    es: "{n} puertas",
    fr: "{n} portes",
    nl: "{n} poorten",
  },
  "chart.literacy.typeStrategy.jump": {
    en: "Snapshot",
    de: "Überblick",
    es: "Instantánea",
    fr: "Aperçu",
    nl: "Overzicht",
  },
  "soul.literacy.signature.jump": {
    en: "Signature",
    de: "Signatur",
    es: "Signatura",
    fr: "Signature",
    nl: "Signatuur",
  },
  "soul.literacy.spectrums.jump": {
    en: "Spectrums",
    de: "Spektren",
    es: "Espectros",
    fr: "Spectres",
    nl: "Spectrums",
  },
  "chart.people.bodyShort": {
    en: "Body",
    de: "Körper",
    es: "Cuerpo",
    fr: "Corps",
    nl: "Lichaam",
  },
  "share.feed": {
    en: "Feed · 4:5",
    de: "Beitrag · 4:5",
    es: "Publicación · 4:5",
    fr: "Publication · 4:5",
    nl: "Bericht · 4:5",
  },
  "vs.centers": {
    en: "Centers {from} → {to}",
    de: "Zentren {from} → {to}",
    es: "Centros {from} → {to}",
    fr: "Centres {from} → {to}",
    nl: "Centra {from} → {to}",
  },
  "chart.people.snapShort": {
    en: "Snap",
    de: "Blick",
    es: "Vista",
    fr: "Aperçu",
    nl: "Blik",
  },
  "nav.home": { en: "Home", de: "Start", es: "Inicio", fr: "Accueil", nl: "Start" },
  "home.cta.protocolsPro": {
    en: "Protocols (Pro)",
    de: "Protokolle (Pro)",
    es: "Protocolos (Pro)",
    fr: "Protocoles (Pro)",
    nl: "Protocollen (Pro)",
  },
  "chart.deepDive.tabCore": {
    en: "Core",
    de: "Kern",
    es: "Núcleo",
    fr: "Noyau",
    nl: "Kern",
  },
  "page.today.openChart": {
    en: "Open Chart",
    de: "Chart öffnen",
    es: "Abrir Chart",
    fr: "Ouvrir Chart",
    nl: "Chart openen",
  },
  "page.protocols.openChart": {
    en: "Open Chart",
    de: "Chart öffnen",
    es: "Abrir Chart",
    fr: "Ouvrir Chart",
    nl: "Chart openen",
  },
};

for (const [key, expected] of Object.entries(ITEM1)) {
  for (const loc of locales) {
    mustEqual(loc, key, expected[loc]);
  }
}

for (const loc of ["de", "es", "fr", "nl"]) {
  assert.equal(
    catalogs[loc]["chart.people.meLabel"],
    catalogs[loc]["common.me"],
    `${loc} chart.people.meLabel aligns with common.me`,
  );
  assert.equal(
    catalogs[loc]["page.today.openChart"],
    catalogs[loc]["home.cta.openChart"],
    `${loc} page.today.openChart aligns with home.cta.openChart`,
  );
  assert.notEqual(
    catalogs[loc]["chart.deepDive.hangingGates"].toLowerCase(),
    "hanging gates",
    `${loc} hangingGates is a real translation, not capitalization`,
  );
}

// Do not revert already-translated nav
mustEqual("de", "nav.today", "Heute");
mustEqual("es", "nav.today", "Hoy");
mustEqual("fr", "nav.today", "Aujourd'hui");
mustEqual("nl", "nav.today", "Vandaag");
mustEqual("de", "nav.protocols", "Protokolle");
mustEqual("es", "nav.protocols", "Protocolos");
mustEqual("fr", "nav.protocols", "Protocoles");
mustEqual("nl", "nav.protocols", "Protocollen");
mustEqual("de", "nav.howToRead", "So liest du das");
mustEqual("es", "nav.howToRead", "Cómo leerlo");
mustEqual("fr", "nav.howToRead", "Comment lire");
mustEqual("nl", "nav.howToRead", "Hoe te lezen");

// Channels title matches Deep Dive tab
for (const loc of locales) {
  assert.equal(
    catalogs[loc]["soul.chrome.channelsTitle"],
    catalogs[loc]["chart.deepDive.tabChannels"],
    `${loc} soul.chrome.channelsTitle matches tabChannels`,
  );
}

const NEW_CHROME = [
  "chart.bodygraph.activeChannelsHeading",
  "chart.bodygraph.aria",
  "chart.bodygraph.channelCountMany",
  "chart.bodygraph.channelCountOne",
  "chart.bodygraph.channelTitle",
  "chart.bodygraph.channelTitleBare",
  "chart.bodygraph.definedCenter",
  "chart.bodygraph.gateTitle",
  "chart.bodygraph.gateTitleNoCenter",
  "chart.bodygraph.hangingTitle",
  "chart.bodygraph.hangingTitleNamed",
  "chart.bodygraph.legendAmplifies",
  "chart.bodygraph.legendBaseline",
  "chart.bodygraph.legendBody",
  "chart.bodygraph.legendBoth",
  "chart.bodygraph.legendConscious",
  "chart.bodygraph.legendIntegrated",
  "chart.bodygraph.legendMind",
  "chart.bodygraph.legendSomatic",
  "chart.bodygraph.lit",
  "chart.bodygraph.more",
  "chart.bodygraph.openCenter",
  "chart.bodygraph.originActivated",
  "chart.bodygraph.originBoth",
  "chart.bodygraph.originDesign",
  "chart.bodygraph.originPersonality",
  "chart.bodygraph.strokeBoth",
  "chart.bodygraph.strokeDesign",
  "chart.bodygraph.strokePersonality",
  "chart.bodygraph.tapHint",
  "chart.bodygraph.titleConscious",
  "chart.bodygraph.titleDefined",
  "chart.bodygraph.titleIntegrated",
  "chart.bodygraph.titleOpen",
  "chart.bodygraph.titleSomatic",
  "chart.deepDive.gateLineFull",
  "chart.status.defined",
  "chart.status.open",
  "literacy.chrome.sectionsAria",
  "protocols.weekRangeHkt",
  "protocols.weekRangeZone",
  "soul.chrome.also",
  "soul.chrome.bridgeCompletesThem",
  "soul.chrome.bridgeCompletesYou",
  "soul.chrome.channelFallback",
  "soul.chrome.channelFallbackLower",
  "soul.chrome.sharedBaselineChip",
  "soul.chrome.sparkChip",
  "soul.nuance.giftInLove",
  "soul.nuance.tenderSpot",
];

const CHROME_COGNATES = new Set([
  // Baseline is the in-app wordmark; "Open" / "design" are same-spelling loans in some locales.
  "de:chart.bodygraph.legendBaseline",
  "es:chart.bodygraph.legendBaseline",
  "fr:chart.bodygraph.legendBaseline",
  "nl:chart.bodygraph.legendBaseline",
  "fr:chart.bodygraph.strokeDesign",
  "fr:chart.bodygraph.originDesign",
  "nl:chart.bodygraph.strokeDesign",
  "nl:chart.bodygraph.originDesign",
  "nl:chart.deepDive.open",
  "nl:chart.status.open",
  "nl:chart.bodygraph.openCenter",
]);

for (const key of NEW_CHROME) {
  mustHave("en", key);
  for (const loc of ["de", "es", "fr", "nl"]) {
    mustHave(loc, key);
    if (CHROME_COGNATES.has(`${loc}:${key}`)) continue;
    assert.notEqual(
      catalogs[loc][key],
      en[key],
      `${loc} ${key} should not still be leftover English`,
    );
  }
}

assert.notEqual(
  en["chart.bodygraph.activeChannelsHeading"],
  en["chart.deepDive.activeChannels"],
  "BodyGraph heading is a short key, not activeChannels",
);
assert.doesNotMatch(en["literacy.chrome.sectionsAria"], /\{n\}/);
assert.notEqual(en["literacy.chrome.sectionsAria"], en["literacy.chrome.sections"]);

// --- Also-assert: surfaces read through i18n keys ---
const bodyGraph = read("src/components/BodyGraph.tsx");
assert.match(bodyGraph, /useI18n/);
assert.match(bodyGraph, /t\("chart\.bodygraph\.aria"\)/);
assert.match(bodyGraph, /t\("chart\.bodygraph\.activeChannelsHeading"\)/);
assert.match(bodyGraph, /t\("chart\.deepDive\.hangingGates"\)/);
assert.match(bodyGraph, /t\("chart\.deepDive\.defined"\)/);
assert.match(bodyGraph, /t\("chart\.deepDive\.open"\)/);
assert.match(bodyGraph, /t\("chart\.bodygraph\.tapHint"\)/);
assert.doesNotMatch(bodyGraph, />Active channels</);
assert.doesNotMatch(bodyGraph, /"Tap any center to inspect its mechanics"/);
assert.doesNotMatch(bodyGraph, /aria-label="Human Design bodygraph"/);
assert.doesNotMatch(bodyGraph, />Hanging gates</);

const soulPage = read("src/app/soul/page.tsx");
assert.match(soulPage, /t\("soul\.chrome\.sparkChip"\)/);
assert.match(soulPage, /t\("soul\.chrome\.sharedBaselineChip"\)/);
assert.match(soulPage, /soul\.chrome\.bridgeCompletesYou/);
assert.match(soulPage, /soul\.chrome\.bridgeCompletesThem/);
assert.match(soulPage, /t\("soul\.chrome\.also"\)/);
assert.match(soulPage, /t\("soul\.chrome\.channelFallback/);
assert.match(soulPage, /t\("chart\.status\.defined"\)/);
assert.match(soulPage, /t\("chart\.status\.open"\)/);
assert.match(soulPage, /youPersonStatus/);
assert.doesNotMatch(soulPage, /"Also:"/);
assert.doesNotMatch(soulPage, /· Spark`/);
assert.doesNotMatch(soulPage, /completes you/);
assert.match(soulPage, /useSoulCopy|resolveSoulCopy/);
assert.match(soulPage, /resolveSoulChannelNickname/);

const nuance = read("src/components/soul/PartnerNuanceBlock.tsx");
assert.match(nuance, /t\("soul\.nuance\.giftInLove"\)/);
assert.match(nuance, /t\("soul\.nuance\.tenderSpot"\)/);
assert.doesNotMatch(nuance, /The gift in love/);
assert.doesNotMatch(nuance, /The tender spot/);

const partnerCard = read("src/components/soul/PartnerOverviewCard.tsx");
assert.match(partnerCard, /useSoulCopy|resolveSoulCopy/);

const biohack = read("src/app/biohack/page.tsx");
assert.match(biohack, /weekRangeLabelPart/);
assert.match(biohack, /t\(weekPart\.key, weekPart\.params\)/);

const protocolLib = read("src/lib/protocolCompletions.ts");
assert.match(protocolLib, /export function weekRangeLabel\(/);
assert.match(protocolLib, /export function weekRangeLabelPart\(/);

const coach = read("src/components/LiteracyCoach.tsx");
assert.match(coach, /t\("literacy\.chrome\.sectionsAria"\)/);
assert.match(coach, /t\("literacy\.chrome\.sections"/);

const hdCopy = read("src/lib/hdCopy.ts");
assert.match(hdCopy, /export function formatGateLine\(/);
assert.match(hdCopy, /t\("chart\.deepDive\.gateHeld"/);
assert.match(hdCopy, /t\("chart\.deepDive\.gateLineFull"/);
const transits = read("src/app/transits/page.tsx");
assert.match(transits, /formatGateLine\(/);
assert.match(transits, /,\s*t\s*\)/);

// --- (b) Spanish essay + Soul catalogs exist and are wired for es ---
const essayFiles = {
  "src/lib/essays/hdChannelCopy.es.ts": "CHANNEL_COPY",
  "src/lib/essays/hdCopy.es.ts": "TYPE_COPY",
  "src/lib/essays/hdProfileCombos.es.ts": "PROFILE_COMBO_ESSAYS",
  "src/lib/essays/resolveHdCopy.ts": "resolveHdCopy",
};
for (const rel of Object.keys(essayFiles)) {
  assert.ok(existsSync(resolve(root, rel)), `missing ${rel}`);
}

const resolver = read("src/lib/essays/resolveHdCopy.ts");
assert.match(resolver, /export function resolveHdCopy/);
assert.doesNotMatch(resolver, /locale === "es"/);
assert.match(resolver, /export function useHdCopy/);

const channelEn = firstLevelExportKeys(read("src/lib/hdChannelCopy.ts"), "CHANNEL_COPY");
const channelEs = firstLevelExportKeys(read("src/lib/essays/hdChannelCopy.es.ts"), "CHANNEL_COPY");
assert.equal(channelEn.size, 36, "36 English channel essays");
assert.deepEqual([...channelEs].sort(), [...channelEn].sort(), "Spanish channel keys match English");

const comboEn = firstLevelExportKeys(read("src/lib/hdProfileCombos.ts"), "PROFILE_COMBO_ESSAYS");
const comboEs = firstLevelExportKeys(
  read("src/lib/essays/hdProfileCombos.es.ts"),
  "PROFILE_COMBO_ESSAYS",
);
assert.equal(comboEn.size, 12, "12 English profile combo essays");
assert.deepEqual([...comboEs].sort(), [...comboEn].sort(), "Spanish profile combo keys match English");

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
const hdEsSrc = read("src/lib/essays/hdCopy.es.ts");
for (const name of HD_MAPS) {
  const a = firstLevelExportKeys(hdEnSrc, name);
  const b = firstLevelExportKeys(hdEsSrc, name);
  assert.ok(a.size > 0, `English ${name} has keys`);
  assert.deepEqual([...b].sort(), [...a].sort(), `Spanish ${name} keys match English`);
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

assert.ok(Object.keys(soulEs).length >= 700, `Spanish Soul catalog size (${Object.keys(soulEs).length})`);

const REQUIRED_SOUL_PREFIXES = [
  "soul.read.lede.",
  "soul.read.card.",
  "soul.read.spectrum.",
  "soul.read.disclaimer",
  "soul.read.howYouLove.",
  "soul.read.howTheyLove.",
  "soul.read.nuance.",
  "soul.read.decide.",
  "soul.read.overview.",
  "soul.read.channelName.",
];
for (const prefix of REQUIRED_SOUL_PREFIXES) {
  const n = Object.keys(soulEs).filter((k) => k === prefix || k.startsWith(prefix)).length;
  assert.ok(n > 0, `Spanish Soul catalog has ${prefix}* keys`);
}
assert.equal(
  Object.keys(soulEs).filter((k) => k.startsWith("soul.read.channelName.")).length,
  36,
  "36 Spanish channel nicknames",
);
assert.ok(
  Object.keys(soulEs).some((k) => k.startsWith("soul.read.nuance.") && k.endsWith(".gift")),
  "nuance gift keys",
);
assert.ok(soulEs["soul.read.howYouLove.generator.nameless"]);
assert.ok(soulEs["soul.read.howYouLove.generator.named"]);

// Fixture: representative CopyParts render Spanish for es, English fallback otherwise
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
// Only use catalog keys we actually have; disclaimer English may differ — fallback is just a body
for (const [name, item] of Object.entries(fixture)) {
  assert.ok(soulEs[item.key], `catalog has ${item.key} (${name})`);
  const esOut = resolveSoulCopyLite("es", item, item.en);
  assert.equal(esOut, item.en, `${name} es falls back to the English body`);
  const nlOut = resolveSoulCopyLite("nl", item, item.en);
  assert.ok(nlOut && nlOut.trim().length > 0, `${name} Dutch resolve is non-empty`);
  assert.notEqual(nlOut, item.en, `${name} Dutch is not the English fallback`);
  assert.notEqual(nlOut, esOut, `${name} Dutch is not the Spanish body`);
  assert.equal(resolveSoulCopyLite("en", item, item.en), item.en, `${name} en falls back to English body`);
  assert.equal(resolveSoulCopyLite("de", item, item.en), item.en, `${name} de falls back to English body`);
  assert.equal(resolveSoulCopyLite("fr", item, item.en), item.en, `${name} fr falls back to English body`);
}
assert.equal(
  resolveSoulCopyLite("es", { key: "soul.read.missing.doesNotExist", params: {} }, "English body"),
  "English body",
  "missing Spanish key falls back to English body",
);
assert.equal(
  resolveSoulCopyLite("nl", { key: "soul.read.missing.doesNotExist", params: {} }, "English body"),
  "English body",
  "missing Dutch key falls back to English body",
);
const named = resolveSoulCopyLite("es", fixture.namedLove, fixture.namedLove.en);
assert.equal(named, fixture.namedLove.en, "es named love falls back to the English body");

// Long-form must not be poured into main message catalogs
for (const loc of locales) {
  const keys = Object.keys(catalogs[loc]);
  assert.ok(
    !keys.some((k) => k.startsWith("soul.read.")),
    `${loc} main catalog must not contain soul.read.* long-form`,
  );
}

// --- (c) English source still renders when locale is en ---
const repoRoot = resolve(root, "..");
function gitDiff(rel) {
  return execSync(`git diff HEAD -- ${rel}`, { cwd: repoRoot, encoding: "utf8" });
}
assert.equal(gitDiff("frontend/src/lib/hdChannelCopy.ts").trim(), "", "English channel essays unchanged");
assert.equal(gitDiff("frontend/src/lib/hdProfileCombos.ts").trim(), "", "English profile combo essays unchanged");
const hdCopyDiff = gitDiff("frontend/src/lib/hdCopy.ts");
assert.doesNotMatch(hdCopyDiff, /TYPE_COPY/, "TYPE_COPY English source not rewritten");
assert.match(hdCopy, /You move fast once something is a real yes/);

const types = read("src/lib/i18n/types.ts");
assert.match(types, /export const LOCALES = \["en", "nl"\] as const;/);
for (const loc of ["pt", "ko", "ja", "zh"]) {
  assert.doesNotMatch(types, new RegExp(`"${loc}"`));
  assert.ok(!existsSync(resolve(root, `src/lib/i18n/messages/${loc}.ts`)), `no ${loc} catalog`);
}

// Spanish this pass owns is tú, never usted
function noUsted(label, src) {
  assert.doesNotMatch(src, /\busted(?:es)?\b/i, `${label} must not use usted`);
}
noUsted("messages/es.ts", read("src/lib/i18n/messages/es.ts"));
noUsted("soulReadings/es.ts", read("src/lib/i18n/soulReadings/es.ts"));
noUsted("hdCopy.es.ts", read("src/lib/essays/hdCopy.es.ts"));
noUsted("hdChannelCopy.es.ts", read("src/lib/essays/hdChannelCopy.es.ts"));
noUsted("hdProfileCombos.es.ts", read("src/lib/essays/hdProfileCombos.es.ts"));

console.log("assert:language-spanish-readings PASS");
