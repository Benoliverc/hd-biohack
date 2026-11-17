/**
 * Language first-pass — source ACs (FE).
 * Run: npx tsx scripts/assert-language-first-pass.mjs
 *
 * Leftover translations, locked English meaning fixes, Chart/Soul/Protocols
 * i18n wiring, French tu, and Shelf as an untranslated feature name.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
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
  while ((m = re.exec(src))) out[m[1]] = m[2] === '"' ? m[3] : m[3];
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

const pkg = read("package.json");
assert.ok(
  pkg.includes('"assert:language-first-pass": "npx tsx scripts/assert-language-first-pass.mjs"'),
  "package.json wires assert:language-first-pass",
);

const locales = ["en", "de", "es", "fr", "nl"];
const catalogs = Object.fromEntries(locales.map((id) => [id, catalog(id)]));
const en = catalogs.en;

function mustEqual(loc, key, expected) {
  assert.equal(catalogs[loc][key], expected, `${loc} ${key}`);
}

function mustHave(loc, key) {
  assert.ok(catalogs[loc][key], `missing ${loc} ${key}`);
}

// --- 1 / 4 / 5 locked English (catalog + layout description) ---
const LOCKED_EN = {
  "page.protocols.subtitle": `Your stack — tick today${AP}s timed leads. · Pro`,
  "home.title.noChart": "Know your chart. Start today with it.",
  "home.outcome.chart.b2": "Deep dive and How to read are here.",
  "login.pillar.soul.body": `How you connect with someone whose chart you${AP}ve saved, in one short reading.`,
  "home.blurb.pro":
    "Today gives you one Move for how the sky meets your chart. Protocols is the checkable stack — morning, midday, and evening — preferring what you already own on your shelf.",
  "home.blurb.free": `Today stays open. Protocols and Soul unlock with Pro — the checkable stack plus your shelf, and Soul between people whose charts you${AP}ve saved.`,
  "gate.kitAware": `Today${AP}s Move uses your shelf — it prefers what you already own`,
  "page.soul.subtitle": `How you connect with someone whose chart you${AP}ve saved. · Pro`,
  "gate.comingSoon": "Coming soon — not a live checkout. Chart and Today stay free.",
  "page.today.skyDetails": "Sky details",
  "home.cta.openChart": "Open Chart",
  "page.today.openChart": "Open Chart",
  "protocols.moveProgress": `Today${AP}s Move progress`,
  "protocols.moveComplete": `Today${AP}s Move complete — nice work.`,
  "page.today.noSpike": `No strong personal overlay today — skim today${AP}s planetary gates below.`,
  "today.disclaimerFallback": `Chart weather from your design and today${AP}s sky — not biometric or medical advice.`,
  "settings.languageHelp":
    "UI language covers navigation, Settings, login, shell labels, Today, and Chart/Soul/Protocols chrome. In Spanish, Chart Deep Dive essays, Chart snapshot blurbs, and Soul readings are translated too. Those long readings may still be in English in Deutsch, Français, and Nederlands. HD Type, Authority, and Center names, and feature names such as Today, Protocols, Chart, Soul, Move, Today’s Move, How to read, and Shelf, stay in English.",
  "chart.city.findCity": "Find city",
  "soul.chrome.staleApi": `Soul can${AP}t load right now. Try again in a moment.`,
};

for (const [key, value] of Object.entries(LOCKED_EN)) {
  mustEqual("en", key, value);
}

const layout = read("src/app/layout.tsx");
assert.match(
  layout,
  /Protocols that use what you already own, and Soul — informational, not medical advice/,
  "layout description uses locked Protocols/Soul wording",
);
assert.doesNotMatch(layout, /kit-aware Protocols/);
assert.doesNotMatch(read("src/lib/i18n/messages/en.ts"), /prove today/);
assert.doesNotMatch(read("src/lib/i18n/messages/en.ts"), /Run today with it/);
assert.doesNotMatch(read("src/lib/i18n/messages/en.ts"), /Deep Dive and literacy live here/);
assert.doesNotMatch(read("src/lib/i18n/messages/en.ts"), /someone you.${AP}?ve charted|people you.${AP}?ve charted/);

const playbook = en["soul.literacy.playbook.body"] || "";
assert.match(playbook, /simple ways to settle together/);
assert.match(playbook, /starts with the body/);
assert.doesNotMatch(playbook, /co-regulation/);
assert.doesNotMatch(playbook, /body-first/);

assert.equal(en["login.emailPlaceholder"], "you@example.com");
assert.ok(!("home.outcome.soul.b2" in en), "duplicate home.outcome.soul.b2 key is removed");

// --- leftover inventory is translated, except email placeholder + feature-name keys ---
const INVENTORY = [
  "settings.timezoneHelp",
  "settings.deviceTimezone",
  "login.emailPlaceholder",
  "login.alreadyHaveAccount",
  "login.betaCreateHint",
  "reset.title",
  "reset.hint",
  "reset.submit",
  "reset.expired",
  "beta.chromeNote",
  "home.title.hasChart",
  "home.blurb.pro",
  "home.blurb.free",
  "home.blurb.noChart",
  "home.path.today",
  "home.path.protocols",
  "home.path.chart",
  "home.path.soul",
  "home.cta.seeTodaysMove",
  "home.morning.pro",
  "home.morning.free",
  "home.card.protocols",
  "protocols.moveTitle",
  "home.outcome.protocols.body",
  "home.outcome.protocols.b1",
  "home.outcome.protocols.b2",
  "page.today.emptyTitle",
  "page.today.emptyBody",
  "page.soul.markPartnerReasonNamed",
  "page.soul.markPartnerReason",
  "today.upcoming.empty",
  "today.upcoming.loading",
  "today.upcoming.error",
  "today.upcoming.sunThemeTurns",
  "today.upcoming.bridgeOn",
  "today.upcoming.bridgeClears",
  "today.upcoming.moonLeaves",
  "today.upcoming.sunThemeHoldsThrough",
  "history.earlierWeeks",
  "history.empty",
  "history.waiting",
  "history.error",
  "share.stories",
  "chart.firstRun.leadNamed",
  "chart.firstRun.lead",
  "chart.firstRun.timeCaption",
  "chart.firstRun.cityPlaceholder",
  "chart.firstRun.cityUnresolved",
  "chart.firstRun.cityNetwork",
  "chart.firstRun.save",
  "chart.firstRun.saving",
  "chart.firstRun.errorDate",
  "chart.firstRun.errorTime",
  "chart.firstRun.errorCity",
  "chart.firstRun.coordsToggle",
  "chart.firstRun.coordsHide",
  "chart.firstRun.waiting",
  "chart.firstRun.editDetails",
  "chart.firstRun.natalLine",
  "chart.firstRun.seeTodaysMove",
  "chart.firstRun.saveFailed",
  "chart.firstRun.accountFailed",
  "chart.timeUnknown",
  "chart.timeUnknownDisclosure",
  "chart.timeUnknownCaveat",
  "chart.timeUnknownEdit",
  "today.resetsInOneMinute",
  "today.resetsInMinutes",
  "today.resetsInAboutAnHour",
  "today.resetsInOneHour",
  "today.resetsInHours",
  "privacy.intro",
  "privacy.storeTitle",
  "privacy.storeBody",
  "privacy.useTitle",
  "privacy.useBody",
  "privacy.emailsBody",
  "privacy.choicesTitle",
  "privacy.hdNote",
  "privacy.copyright",
  "privacy.copyrightShort",
  "chart.literacy.typeStrategy.title",
  "soul.literacy.love.title",
  "soul.literacy.playbook.jump",
  "soul.literacy.power.title",
  "soul.literacy.power.jump",
  "soul.literacy.spark.title",
  "soul.literacy.spark.jump",
  "protocols.literacy.todaysMove.title",
  "protocols.literacy.todaysMove.jump",
  "home.cta.openProtocols",
  "home.cta.protocolsPro",
  "protocols.openProtocols",
  "page.protocols.natalBaseline",
  "literacy.chrome.sections",
];

const FEATURE_NAME_KEYS = new Set([
  "login.emailPlaceholder",
  "home.card.protocols",
  "protocols.moveTitle",
  "privacy.copyrightShort",
  "chart.literacy.typeStrategy.title",
  "soul.literacy.love.title",
  "soul.literacy.spark.title",
  "soul.literacy.spark.jump",
  "protocols.literacy.todaysMove.title",
  "protocols.literacy.todaysMove.jump",
  "home.cta.protocolsPro",
]);

for (const loc of ["de", "es", "fr", "nl"]) {
  for (const key of INVENTORY) {
    mustHave("en", key);
    mustHave(loc, key);
    if (FEATURE_NAME_KEYS.has(key)) continue;
    assert.notEqual(
      catalogs[loc][key],
      en[key],
      `${loc} ${key} should not still be leftover English`,
    );
  }
}

// --- 2. Prefer catalog strings for reset and account errors ---
const login = read("src/app/login/page.tsx");
assert.match(login, /setInfo\(t\("login\.resetSent"\)\)/);
assert.doesNotMatch(
  login,
  /setInfo\(\s*res\.message/,
  "forgot-password success does not display res.message",
);

const accountApi = read("src/app/settings/accountApiMessage.ts");
assert.match(accountApi, /t\("common\.errorGeneric"\)/);
assert.doesNotMatch(
  accountApi,
  /return message\b/,
  "unmapped account errors do not return the raw API message",
);

// --- 3. Hardcoded chrome is read through i18n keys ---
const profile = read("src/app/profile/page.tsx");
const city = read("src/components/CityPicker.tsx");
const soulPage = read("src/app/soul/page.tsx");
const partnerCard = read("src/components/soul/PartnerOverviewCard.tsx");
const friendSig = read("src/components/soul/friendSignatureCopy.ts");
const partnerSig = read("src/components/soul/partnerSignatureCopy.ts");
const todayInd = read("src/components/TodayIndication.tsx");
const deepDive = read("src/components/ChartDeepDive.tsx");
const biohack = read("src/app/biohack/page.tsx");
const shareCard = read("src/components/share/ShareBaselineCard.tsx");
const capture = read("src/lib/share/captureShareCard.ts");
const shareBtn = read("src/components/share/ShareBaselineButton.tsx");

assert.match(profile, /useI18n/);
assert.match(profile, /t\("chart\.people\.savedPeople"\)/);
assert.match(profile, /t\("chart\.people\.tryWithoutSaving"\)/);
assert.match(profile, /t\("chart\.city\.findCity"\)|CityPicker/);
assert.doesNotMatch(profile, />People & form</);
assert.doesNotMatch(profile, />Try without saving</);
assert.doesNotMatch(profile, /People charts unlock with Pro\./);

assert.match(city, /t\("chart\.city\.findCity"\)/);
assert.doesNotMatch(city, />Resolve</);
assert.doesNotMatch(city, /\{loading \? "…" : "Resolve"\}/);

assert.match(soulPage, /t\("soul\.chrome\.staleApi"\)/);
assert.doesNotMatch(soulPage, /redeploy|older schema|Aura Alchemy/);
assert.match(partnerCard, /t\("soul\.partner\./);

assert.match(friendSig, /\bt\(/);
assert.match(partnerSig, /\bt\(/);
assert.match(friendSig, /soul\.sig\./);
assert.match(partnerSig, /soul\.sig\./);

// Why lines lead with a plain clause
const whyKeys = Object.keys(en).filter((k) => /^soul\.sig\.why\./.test(k));
assert.ok(whyKeys.length > 0, "signature why keys exist");
for (const key of whyKeys) {
  const val = en[key];
  assert.match(val, /^The charts /, `${key} leads with a plain clause`);
  if (/channel \d/.test(val) || /\d+[–-]\d+/.test(val)) {
    assert.match(val, /for example/i, `${key} keeps the HD example after a plain clause`);
  }
}

assert.match(todayInd, /t\(\s*pulse\.factKey/);
assert.match(todayInd, /t\("today\.hdFactLabel"\)/);

for (const key of [
  "chart.deepDive.learnMore",
  "chart.deepDive.definedConsistent",
  "chart.deepDive.openAmplifies",
  "chart.deepDive.activatedGates",
  "chart.deepDive.hangingGates",
  "chart.deepDive.personalityBlack",
  "chart.deepDive.designRed",
]) {
  mustHave("en", key);
  assert.match(deepDive, new RegExp(`t\\("${key.replace(/\./g, "\\.")}"\\)`), `ChartDeepDive uses ${key}`);
}
assert.doesNotMatch(deepDive, />Learn more</);
assert.doesNotMatch(deepDive, />Defined — consistent</);

for (const key of [
  "protocols.kitFact",
  "protocols.decreaseOrPause",
  "protocols.noNatalBaseline",
  "protocols.checklistSlots",
  "protocols.noneForSlice",
]) {
  mustHave("en", key);
  assert.match(biohack, new RegExp(`t\\("${key.replace(/\./g, "\\.")}"\\)`), `Protocols uses ${key}`);
}
assert.doesNotMatch(biohack, />Kit fact</);
assert.doesNotMatch(biohack, />Decrease or pause</);
assert.doesNotMatch(biohack, /title="Emphasize"/);
assert.doesNotMatch(biohack, /title="Increase"/);

assert.doesNotMatch(shareCard, /kicker = "My Baseline"/);
assert.doesNotMatch(capture, /"My Baseline · today"/);
assert.doesNotMatch(capture, /"My Baseline"/);
assert.match(shareBtn, /t\("share\.(natalKicker|kickerNatal|baselineToday)"\)/);

// CityPicker default button is Find city, translated
mustEqual("en", "chart.city.findCity", "Find city");
for (const loc of ["de", "es", "fr", "nl"]) {
  assert.notEqual(catalogs[loc]["chart.city.findCity"], "Find city", `${loc} Find city is translated`);
  assert.notEqual(catalogs[loc]["chart.city.findCity"], "Resolve");
}

// Soul stale-API locked line in all locales, no schema/redeploy language
for (const loc of locales) {
  const val = catalogs[loc]["soul.chrome.staleApi"];
  assert.ok(val, `${loc} soul.chrome.staleApi`);
  assert.doesNotMatch(val, /schema|redeploy|Aura Alchemy/i, `${loc} stale API is user-facing`);
}

// --- 6. French tu, Shelf literal, German Meine, locked evening-close + emails ---
function frenchConsumerLines(src) {
  const lines = src.split("\n");
  const out = [];
  for (const line of lines) {
    if (/^\s*['"]admin\./.test(line)) continue;
    out.push(line);
  }
  return out.join("\n");
}

for (const file of ["src/lib/i18n/messages/fr.ts", "src/lib/i18n/messages/todaySoul.fr.ts"]) {
  const src = frenchConsumerLines(read(file));
  const stripped = src.replace(/rendez-vous/gi, "");
  assert.doesNotMatch(stripped, /\b[Vv]ous\b/, `${file} has no remaining vous (except rendez-vous)`);
  assert.doesNotMatch(stripped, /\b[Vv]otre\b/, `${file} has no remaining votre`);
  assert.doesNotMatch(stripped, /\b[Vv]os\b/, `${file} has no remaining vos`);
}

for (const loc of locales) {
  mustEqual(loc, "page.protocols.shelf", "Shelf");
  const blob = Object.values(catalogs[loc]).join("\n");
  assert.doesNotMatch(blob, /\bRegal\b/, `${loc} has no Regal`);
  assert.doesNotMatch(blob, /\bEstante\b/, `${loc} has no Estante`);
  assert.doesNotMatch(blob, /Étagère/, `${loc} has no Étagère`);
  assert.doesNotMatch(blob, /\bPlank\b/, `${loc} has no Plank`);
}

mustEqual("de", "share.baselineToday", "Meine Baseline · heute");
mustEqual("de", "share.myBaseline", "Meine Baseline teilen");
mustEqual("de", "today.eveningClose.q.generator", "Hat dich heute etwas erfüllt?");
mustEqual(
  "fr",
  "today.eveningClose.q.generator",
  `Est-ce que quelque chose t${AP}a apporté de la satisfaction aujourd${AP}hui ?`,
);
mustEqual("nl", "today.eveningClose.q.generator", "Heeft iets je vandaag vervuld?");
mustEqual("de", "privacy.emailsTitle", "E-Mails");
mustEqual("es", "privacy.emailsTitle", "Correos");
mustEqual("fr", "privacy.emailsTitle", "E-mails");
mustEqual("nl", "privacy.emailsTitle", "E-mails");

console.log("assert-language-first-pass PASS");
