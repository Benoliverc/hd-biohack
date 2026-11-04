/**
 * Source-level ACs for Settings language (EN/NL/DE/FR/ES).
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

if (!/data-testid="settings-language"/.test(settings)) fail("settings-language missing");
if (!/data-testid="settings-lang-select"/.test(settings)) fail("settings-lang-select missing");
if (!/preferred_locale/.test(api)) fail("api User missing preferred_locale");
if (!/\["en", "nl", "de", "fr", "es"\]/.test(types) && !/LOCALES = \["en", "nl", "de", "fr", "es"\]/.test(types)) {
  // tolerate as const form
  if (!/en.*nl.*de.*fr.*es/.test(types)) fail("LOCALES must list en nl de fr es");
}
for (const [name, src] of [["en", en], ["nl", nl], ["de", de], ["fr", fr], ["es", es]]) {
  if (!/nav\.home/.test(src)) fail(`${name} missing nav.home`);
  if (!/settings\.languageTitle/.test(src)) fail(`${name} missing settings.languageTitle`);
  if (!/protocols\.moveTitle/.test(src)) fail(`${name} missing protocols.moveTitle`);
}
if (!/"Today's Move"/.test(en) && !/'Today\'s Move'/.test(en)) {
  // en.ts uses single quotes from Python repr → Today's Move with escaped apostrophe
  if (!/Today.?s Move/.test(en)) fail("EN catalog must keep Today's Move naming");
}
if (!/useI18n/.test(header)) fail("Header must use i18n");
if (!/useI18n/.test(move)) fail("TodaysMoveCard must use i18n");
if (!/t\("protocols\.moveTitle"\)/.test(move)) fail("TodaysMoveCard must t(protocols.moveTitle)");

console.log("assert-i18n-settings-5-locales PASS");
