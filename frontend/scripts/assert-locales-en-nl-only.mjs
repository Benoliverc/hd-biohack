/**
 * English + Nederlands only. de/fr/es stay on disk, unloaded, and resolve to English.
 * Run: npx tsx scripts/assert-locales-en-nl-only.mjs
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(root, "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

const LOCKED_EN =
  "UI language covers navigation, Settings, login, shell labels, Today, and Chart/Soul/Protocols chrome. In Dutch, Chart Deep Dive essays, Chart snapshot blurbs, and Soul readings are translated too. HD Type, Authority, and Center names, and feature names such as Today, Protocols, Chart, Soul, Move, Today\u2019s Move, How to read, and Shelf, stay in English.";
const LOCKED_NL =
  "UI-taal dekt navigatie, Instellingen, login, shell-labels, Today, en Chart/Soul/Protocols-chrome. In het Nederlands zijn ook de Chart Deep Dive-essays, Chart-snapshotteksten en Soul-readings vertaald. HD-namen voor Type, Authority en Centers, en featurenamen zoals Today, Protocols, Chart, Soul, Move, Today\u2019s Move, How to read en Shelf, blijven in het Engels.";

const RETIRED_FILES = {
  "src/lib/i18n/messages/de.ts": "dada3ac0614ba4d01a580c7d7d579316ae4d99372f0fdfa44eec3fd111f67f9f",
  "src/lib/i18n/messages/fr.ts": "9c2b4166fe4d19bc78ab0562f7050fff75b01e9203944fac5543a730b418edff",
  "src/lib/i18n/messages/es.ts": "8fc6e78052efad2b30201021ebf4265c5d59f6bea1855d47e0e91810c523732e",
  "src/lib/i18n/messages/todaySoul.de.ts": "89569bea7884f3fdeef818a8331b2dd2d8ab0a1614901cfe1608bd0a7a6aa5fd",
  "src/lib/i18n/messages/todaySoul.fr.ts": "1a8ed7d110c7453e707b700a05f98e3196c54bf60073802cd0219bffc4dd1ede",
  "src/lib/i18n/messages/todaySoul.es.ts": "68a5139452c9de2e223276ff3e3ca13064ab21eef74479ab49518d52b8ba94cf",
  "src/lib/essays/deepDiveType.de.json": "daf233ce063d70811b604fbf78c697b8f1e93fb78b1f0f901700a90de9174e91",
  "src/lib/essays/deepDiveType.es.json": "7403e4daeed33204de5bd39bdbf0ab6d67061be6a410f9afee282ba8f14ba329",
  "src/lib/essays/deepDiveType.fr.json": "a853f3b4a29dcbe483703c0014124d8e4ae0d219bb3fcca3b4fa5fa002362c30",
  "src/lib/essays/hdCopy.es.ts": "895abfa6bb5270c546b8a96778e80eebb60c9215b8961a9a40eebfd3709451b6",
  "src/lib/essays/hdChannelCopy.es.ts": "add6022657573a62ca58c49d0e7689accffc171a74e8f30b9d3267595740a65a",
  "src/lib/essays/hdProfileCombos.es.ts": "d82120dccc295a2e42ee35e5a06e3926fd5d4574fd4e002c396dc5103b4e752f",
  "src/lib/i18n/soulReadings/es.ts": "5dddbbbefa1a2c088c371364035b7fb85dedcc333093875687256e06766fc5be",
  "src/lib/essays/strategySummaryOverlay.ts": "9e00df4d78a5c5db6ea972e8a312ada9da5a70c35cdd936c9a802317180ab7ca",
};

const types = read("src/lib/i18n/types.ts");
assert.match(types, /export const LOCALES = \["en", "nl"\] as const;/);
assert.match(types, /export const RETIRED_LOCALES = \["de", "fr", "es"\] as const;/);
assert.match(types, /export type RetiredLocale/);
assert.match(types, /export type LocaleCopy/);

const { LOCALES, LOCALE_NATIVE_LABELS, RETIRED_LOCALES, resolveLocale } = await import(
  "../src/lib/i18n/types.ts"
);
assert.deepEqual([...LOCALES], ["en", "nl"]);
assert.deepEqual(Object.keys(LOCALE_NATIVE_LABELS), ["en", "nl"]);
assert.equal(LOCALE_NATIVE_LABELS.en, "English");
assert.equal(LOCALE_NATIVE_LABELS.nl, "Nederlands");
assert.deepEqual([...RETIRED_LOCALES], ["de", "fr", "es"]);

for (const value of ["fr", "de", "es", "de-DE", "es_419", "FR", "pt", null]) {
  assert.equal(resolveLocale(value), "en", `${String(value)} resolves to en`);
}
assert.equal(resolveLocale("nl"), "nl");
assert.equal(resolveLocale("nl-BE"), "nl");
assert.equal(resolveLocale("en-GB"), "en");

const { catalogs } = await import("../src/lib/i18n/messages/index.ts");
const { translate } = await import("../src/lib/i18n/I18nProvider.tsx");
assert.deepEqual(Object.keys(catalogs).sort(), ["en", "nl"]);
assert.ok(translate("en", "nav.today"), "translate(en, nav.today) is non-empty");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.tsx?$/.test(name)) out.push(abs);
  }
  return out;
}

function importSpecifiers(src) {
  const specs = [];
  const fromRe = /from\s+["']([^"']+)["']/g;
  const dynRe = /import\(\s*["']([^"']+)["']\s*\)/g;
  let m;
  while ((m = fromRe.exec(src))) specs.push(m[1]);
  while ((m = dynRe.exec(src))) specs.push(m[1]);
  return specs;
}

function isRetiredImport(spec) {
  return (
    /(?:^|\/)messages\/(?:de|fr|es)(?:\.ts)?$/.test(spec) ||
    /(?:^|\/)(?:de|fr|es)(?:\.ts)?$/.test(spec) ||
    /todaySoul\.(?:de|fr|es)(?:\.ts)?$/.test(spec) ||
    /deepDiveType\.(?:de|es|fr)\.json$/.test(spec) ||
    /hdCopy\.es(?:\.ts)?$/.test(spec) ||
    /hdChannelCopy\.es(?:\.ts)?$/.test(spec) ||
    /hdProfileCombos\.es(?:\.ts)?$/.test(spec) ||
    /soulReadings\/es(?:\.ts)?$/.test(spec) ||
    /strategySummaryOverlay(?:\.ts)?$/.test(spec)
  );
}

const retiredSrc = new Set(Object.keys(RETIRED_FILES).filter((rel) => rel.endsWith(".ts")));
for (const abs of walk(join(root, "src"))) {
  const rel = relative(root, abs).split("\\").join("/");
  if (retiredSrc.has(rel)) continue;
  const src = readFileSync(abs, "utf8");
  for (const spec of importSpecifiers(src)) {
    assert.ok(!isRetiredImport(spec), `${rel} imports retired content: ${spec}`);
  }
  assert.doesNotMatch(src, /locale\s*===\s*["'](?:de|fr|es)["']/, `${rel} compares a retired locale`);
}

const login = read("src/app/login/page.tsx");
const settings = read("src/app/settings/page.tsx");
assert.match(login, /locales\.map/);
assert.match(settings, /locales\.map/);
for (const [label, src] of [
  ["login", login],
  ["settings", settings],
]) {
  assert.doesNotMatch(src, /Deutsch|Français|Español/, `${label} has no retired language names`);
}

const provider = read("src/lib/i18n/I18nProvider.tsx");
assert.match(provider, /resolveLocale\(accountLocale\)/);
assert.match(provider, /resolveLocale\(raw\)/);

for (const [rel, digest] of Object.entries(RETIRED_FILES)) {
  assert.equal(sha256(readFileSync(join(root, rel))), digest, `${rel} frozen`);
}

const { messages: en } = await import("../src/lib/i18n/messages/en.ts");
const { messages: nl } = await import("../src/lib/i18n/messages/nl.ts");
assert.equal(en["settings.languageHelp"], LOCKED_EN);
assert.equal(nl["settings.languageHelp"], LOCKED_NL);
assert.doesNotMatch(en["settings.languageHelp"], /Spanish|Spaans|Deutsch|Français|Español/);
assert.doesNotMatch(nl["settings.languageHelp"], /Spanish|Spaans|Deutsch|Français|Español/);

const routes = readFileSync(join(repo, "backend/app/api/routes.py"), "utf8");
assert.match(routes, /SUPPORTED_LOCALES = frozenset\(\{"en", "nl", "de", "fr", "es"\}\)/);
const base = execSync("git merge-base HEAD origin/main", { cwd: repo, encoding: "utf8" }).trim();
assert.equal(execSync(`git diff ${base} -- backend`, { cwd: repo, encoding: "utf8" }), "");

assert.match(
  read("package.json"),
  /"assert:locales-en-nl-only": "npx tsx scripts\/assert-locales-en-nl-only\.mjs"/,
);

console.log("PASS assert-locales-en-nl-only");
