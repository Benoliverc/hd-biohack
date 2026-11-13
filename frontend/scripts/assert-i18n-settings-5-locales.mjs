/**
 * Source-level ACs for Settings language + i18n P0 chrome/shell.
 * Run: npx tsx frontend/scripts/assert-i18n-settings-5-locales.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function keysOf(src) {
  const keys = [];
  const re = /^\s*['"]([^'"]+)['"]\s*:/gm;
  let m;
  while ((m = re.exec(src))) keys.push(m[1]);
  return keys;
}

const settings = read("src/app/settings/page.tsx");
const en = read("src/lib/i18n/messages/en.ts");
const nl = read("src/lib/i18n/messages/nl.ts");
const de = read("src/lib/i18n/messages/de.ts");
const fr = read("src/lib/i18n/messages/fr.ts");
const es = read("src/lib/i18n/messages/es.ts");
const types = read("src/lib/i18n/types.ts");
const api = read("src/lib/api.ts");
const header = read("src/components/Header.tsx");
const move = read("src/components/protocols/TodaysMoveCard.tsx");
const home = read("src/app/page.tsx");
const todayPage = read("src/app/transits/page.tsx");
const biohack = read("src/app/biohack/page.tsx");
const kit = read("src/components/protocols/KitStrip.tsx");
const indication = read("src/components/TodayIndication.tsx");
const provider = read("src/lib/i18n/I18nProvider.tsx");

if (!/data-testid="settings-language"/.test(settings)) fail("settings-language missing");
if (!/data-testid="settings-lang-select"/.test(settings)) fail("settings-lang-select missing");
if (!/preferred_locale/.test(api)) fail("api User missing preferred_locale");
if (!/en.*nl.*de.*fr.*es/.test(types)) fail("LOCALES must list en nl de fr es");

const enKeys = keysOf(en);
const nlKeys = keysOf(nl);
const deKeys = keysOf(de);
const frKeys = keysOf(fr);
const esKeys = keysOf(es);

if (enKeys.length < 150) fail(`EN catalog too thin (${enKeys.length}); expected P0 expansion`);

for (const [name, keys] of [
  ["nl", nlKeys],
  ["de", deKeys],
  ["fr", frKeys],
  ["es", esKeys],
]) {
  const missing = enKeys.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !enKeys.includes(k));
  if (missing.length) fail(`${name} missing keys: ${missing.slice(0, 8).join(", ")}`);
  if (extra.length) fail(`${name} extra keys: ${extra.slice(0, 8).join(", ")}`);
  if (keys.length !== enKeys.length) fail(`${name} key count ${keys.length} != en ${enKeys.length}`);
}

for (const [name, src] of [
  ["en", en],
  ["nl", nl],
  ["de", de],
  ["fr", fr],
  ["es", es],
]) {
  if (!/nav\.home/.test(src)) fail(`${name} missing nav.home`);
  if (!/settings\.languageTitle/.test(src)) fail(`${name} missing settings.languageTitle`);
  if (!/protocols\.moveTitle/.test(src)) fail(`${name} missing protocols.moveTitle`);
  if (!/home\.outcome\.chart\.title/.test(src)) fail(`${name} missing home.outcome.chart.title`);
  if (!/page\.today\.h1/.test(src)) fail(`${name} missing page.today.h1`);
  if (!/page\.protocols\.h1/.test(src)) fail(`${name} missing page.protocols.h1`);
  if (!/protocols\.yourKit/.test(src)) fail(`${name} missing protocols.yourKit`);
  if (!/energy\.drained/.test(src)) fail(`${name} missing energy.drained`);
}

if (!/Today.?s Move/.test(en)) fail("EN catalog must keep Today's Move naming");
if (!/useI18n/.test(header)) fail("Header must use i18n");
if (!/useI18n/.test(move)) fail("TodaysMoveCard must use i18n");
if (!/t\("protocols\.moveTitle"\)/.test(move)) fail("TodaysMoveCard must t(protocols.moveTitle)");
if (!/t\("protocols\.fromKit"\)/.test(move)) fail("TodaysMoveCard must t(protocols.fromKit)");

// P0 wiring
if (!/t\("home\.outcome\.chart\.title"\)/.test(home)) fail("Home must wire outcome chart title");
if (!/t\("page\.today\.h1"\)/.test(todayPage)) fail("Today page must wire H1");
if (!/t\("page\.protocols\.h1"\)/.test(biohack)) fail("Protocols page must wire H1");
// Shelf naming pass: catalogs keep protocols.yourKit, but KitStrip no longer
// titles the inventory list with it. The Shelf fold is the only inventory title.
if (/t\("protocols\.yourKit"\)/.test(kit)) fail("KitStrip must not retitle inventory as yourKit");
if (!/t\("today\.vsYesterday"\)/.test(indication)) fail("TodayIndication must wire vsYesterday");
if (!/localizeEnergyLabel/.test(indication)) fail("TodayIndication must localize energy");

// Settings toast + feedback placement
if (!/translate\(/.test(settings)) fail("Settings must use translate() for language toast");
if (!/settings-feedback-banner/.test(settings)) fail("Settings feedback must be in shared banner");
if (!/export function translate/.test(provider)) fail("I18nProvider must export translate()");

// NL smoke: key strings differ from EN
function valueFor(src, key) {
  const re = new RegExp(`['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*(['"])([\\s\\S]*?)\\1`);
  const m = src.match(re);
  return m ? m[2] : null;
}
const smoke = [
  "home.outcome.chart.title",
  "page.today.h1",
  "page.protocols.h1",
  "protocols.yourKit",
];
for (const key of smoke) {
  const e = valueFor(en, key);
  const n = valueFor(nl, key);
  if (!e || !n) fail(`smoke missing value for ${key}`);
  if (e === n) fail(`nl smoke: ${key} still equals EN (${e})`);
}

console.log(
  `assert-i18n-settings-5-locales PASS · keys=${enKeys.length} · parity ok · P0 smoke ok`
);
