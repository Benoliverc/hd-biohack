/**
 * Source-level ACs for the Today Energy and Space pass.
 * Run: npx tsx scripts/assert-today-energy-space.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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

function valueOf(src, key) {
  const re = new RegExp(`['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*['"]([\\s\\S]*?)['"]\\s*,`);
  const m = src.match(re);
  assert.ok(m, `missing value for ${key}`);
  return m[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
}

const todayInd = read("src/components/TodayIndication.tsx");
const weather = read("src/components/protocols/WeatherStrip.tsx");
const localize = read("src/lib/i18n/localizeEnums.ts");
const api = read("src/lib/api.ts");
const css = read("src/app/globals.css");
const en = read("src/lib/i18n/messages/en.ts");
const de = read("src/lib/i18n/messages/de.ts");
const es = read("src/lib/i18n/messages/es.ts");
const fr = read("src/lib/i18n/messages/fr.ts");
const nl = read("src/lib/i18n/messages/nl.ts");
const catalogs = { en, de, es, fr, nl };

const WEATHER_KEYS = [
  "today.weatherSame",
  "today.weatherStance.hyper",
  "today.weatherStance.charged",
  "today.weatherStance.steady",
  "today.weatherStance.low",
  "today.weatherStance.drained",
  "today.weatherSpace.nature",
  "today.weatherSpace.people",
  "today.weatherSpace.alone",
  "today.weatherSpace.focus",
  "today.weatherSpace.out",
];

const EN_LOCKED = {
  "today.weatherSame": "Same weather as yesterday.",
  "today.weatherStance.hyper": "High charge — one clear yes, then stop",
  "today.weatherStance.charged": "Extra fuel today — spend it on a clear yes",
  "today.weatherStance.steady": "Steady day",
  "today.weatherStance.low": "Lower fuel today — go gentle",
  "today.weatherStance.drained": "Run light today — recover first",
  "today.weatherSpace.nature": "and get some air.",
  "today.weatherSpace.people": "and have the important conversation earlier.",
  "today.weatherSpace.alone": "and protect a quiet window.",
  "today.weatherSpace.focus": "and work in a quiet corner.",
  "today.weatherSpace.out": "and batch the out-and-about errands.",
};

// --- Aside still present in the Move hero ---
assert.match(todayInd, /data-testid="main-action-status"/);
const heroStart = todayInd.indexOf('data-testid="main-action"');
const statusAt = todayInd.indexOf('data-testid="main-action-status"');
assert.ok(heroStart >= 0 && statusAt > heroStart, "aside stays inside the Move hero");

const asideStart = todayInd.lastIndexOf("<aside", statusAt);
const asideEnd = todayInd.indexOf("</aside>", statusAt);
assert.ok(asideStart >= 0 && asideEnd > asideStart, "aside block found");
const aside = todayInd.slice(asideStart, asideEnd + "</aside>".length);

// --- Highlight: badges + meaning line; do not drop badges in favor of a sentence ---
assert.match(aside, /energy_space_slot !== "quiet"|energySpaceHighlight/);
assert.match(aside, /data-testid="main-action-weather-meaning"/);
assert.match(todayInd, /localizeEnergyLabel/);
assert.match(todayInd, /localizeSpaceLabel/);
assert.match(aside, /\{energyLabel\}/);
assert.match(aside, /\{spaceLabel\}/);
assert.match(aside, /BatteryMedium/);
assert.match(aside, /MapPin/);
const meaningAt = aside.indexOf('data-testid="main-action-weather-meaning"');
const batteryAt = aside.indexOf("BatteryMedium");
const pinAt = aside.indexOf("MapPin");
assert.ok(batteryAt > 0 && pinAt > 0 && meaningAt > batteryAt && meaningAt > pinAt, "meaning line sits under the badges");

// --- Quiet: no Energy/Space badges; same-weather line; aria uses quiet string ---
assert.match(aside, /data-testid="main-action-weather-same"/);
assert.match(aside, /today\.weatherSame/);
assert.match(aside, /aria-label=\{/);
assert.match(aside, /t\("today\.weatherSame"\)/);
const quietStart = aside.indexOf('data-testid="main-action-weather-same"');
assert.ok(quietStart > 0, "quiet line present");
// badges are in the highlight branch only, not alongside the quiet line
const quietBranch = aside.slice(aside.lastIndexOf(") : (", quietStart), asideEnd);
assert.doesNotMatch(quietBranch, /BatteryMedium/);
assert.doesNotMatch(quietBranch, /MapPin/);
assert.doesNotMatch(quietBranch, /localizeEnergyLabel/);
assert.doesNotMatch(quietBranch, /energyLabel/);

// --- Meaning line composed from i18n keys, not Move / SPACE_MICRO / main_action_micro ---
assert.match(localize, /export function weatherMeaningLine/);
assert.match(localize, /today\.weatherStance\.(drained|low|steady|charged|hyper)/);
assert.match(localize, /today\.weatherSpace\.(nature|people|alone|focus|out)/);
assert.match(todayInd, /weatherMeaningLine\(/);
assert.doesNotMatch(todayInd, /SPACE_MICRO/);
assert.doesNotMatch(todayInd, /TYPE_SURPLUS_TEXT|TYPE_RECOVER_TEXT/);
const meaningChunk = aside.slice(meaningAt - 200, meaningAt + 180);
assert.doesNotMatch(meaningChunk, /main_action_text/);
assert.doesNotMatch(meaningChunk, /main_action_micro/);
assert.match(localize, /\$\{t\(stanceKey\)\}, \$\{t\(spaceKey\)\}/);

// --- Chips remain non-tappable ---
assert.doesNotMatch(aside, /<button/);
assert.doesNotMatch(aside, /<Link/);
assert.doesNotMatch(aside, /\bonClick\b/);
assert.doesNotMatch(aside, /role="button"/);
assert.match(aside, /<div className="min-w-\[9rem\]/);
assert.match(aside, /<span className="inline-flex items-center rounded-md/);

// --- Keep min-w and wrapping row ---
assert.match(aside, /min-w-\[9rem\]/);
assert.match(aside, /flex-row flex-wrap/);

// --- WeatherStrip gates chips on energy_space_slot, keeps Full sky, no vs_yesterday ---
assert.match(weather, /energy_space_slot/);
assert.match(weather, /energy_space_slot !== "quiet"/);
assert.match(weather, /weather-full-sky-link/);
assert.match(weather, /protocols\.fullSkyOnToday|Full sky on Today/);
assert.match(weather, /whats-new-chip/);
assert.doesNotMatch(weather, /protocols-vs-yesterday/);
assert.doesNotMatch(weather, /indication\.vs_yesterday/);
assert.doesNotMatch(weather, /vsYesterday/);
assert.doesNotMatch(weather, /main-action-weather-meaning/);
assert.doesNotMatch(weather, /main-action-weather-same/);
assert.doesNotMatch(weather, /today\.weatherSame/);
// energy/space chips are inside the highlight (showEnergySpace) branch
const showAt = weather.indexOf("showEnergySpace");
assert.ok(showAt >= 0, "WeatherStrip names the slot gate");
assert.match(weather, /showEnergySpace \?/);

// --- Payload field present on the frontend type ---
assert.match(api, /energy_space_slot\??:\s*"highlight"\s*\|\s*"quiet"/);

// --- 14px regular on elevated uses text-fg (AA on Linen and Basalt) ---
function hexToRgb(hex) {
  const h = hex.replace("#", "").trim();
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function channel(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
function contrastRatio(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}
function themeTokens(src, marker) {
  const i = src.indexOf(marker);
  assert.ok(i >= 0, `globals.css has ${marker}`);
  const block = src.slice(i, src.indexOf("}", i));
  const grab = (name) => {
    const m = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
    assert.ok(m, `${marker} defines --${name}`);
    return m[1];
  };
  return { elevated: grab("elevated"), fg: grab("fg"), fgSecondary: grab("fg-secondary") };
}
const linen = themeTokens(css, ":root {");
const basalt = themeTokens(css, "html.dark,");
const linenFg = contrastRatio(linen.fg, linen.elevated);
const basaltFg = contrastRatio(basalt.fg, basalt.elevated);
const linenSec = contrastRatio(linen.fgSecondary, linen.elevated);
const basaltSec = contrastRatio(basalt.fgSecondary, basalt.elevated);
assert.ok(linenFg >= 4.5, `text-fg on elevated must be AA in Linen (got ${linenFg.toFixed(2)}:1)`);
assert.ok(basaltFg >= 4.5, `text-fg on elevated must be AA in Basalt (got ${basaltFg.toFixed(2)}:1)`);
assert.ok(
  basaltSec < 4.5,
  `documented: type-caption/text-fg-secondary on elevated fails Basalt (${basaltSec.toFixed(2)}:1); meaning and quiet lines use text-fg`,
);
void linenSec;

const meaningClassChunk = aside.slice(meaningAt - 220, meaningAt);
const sameAt = aside.indexOf('data-testid="main-action-weather-same"');
const sameClassChunk = aside.slice(sameAt - 220, sameAt);
for (const [name, chunk] of [
  ["meaning", meaningClassChunk],
  ["quiet", sameClassChunk],
]) {
  assert.match(chunk, /text-sm/, `${name} line is 14px (text-sm)`);
  assert.match(chunk, /font-normal/, `${name} line is regular weight`);
  assert.match(chunk, /text-fg/, `${name} line uses text-fg on elevated`);
  assert.doesNotMatch(chunk, /text-fg-secondary/, `${name} line must not use text-fg-secondary`);
  assert.doesNotMatch(chunk, /type-caption/, `${name} line is not type-caption (12px)`);
}

// --- i18n: all five locales, locked English, real translations ---
for (const [locale, src] of Object.entries(catalogs)) {
  const keys = new Set(keysOf(src));
  for (const key of WEATHER_KEYS) {
    assert.ok(keys.has(key), `${locale} missing ${key}`);
  }
}

for (const [key, expected] of Object.entries(EN_LOCKED)) {
  assert.equal(valueOf(en, key), expected, `en ${key} must match locked brief copy`);
}

for (const locale of ["de", "es", "fr", "nl"]) {
  const src = catalogs[locale];
  for (const key of WEATHER_KEYS) {
    const val = valueOf(src, key);
    const english = EN_LOCKED[key];
    assert.ok(val && val.trim(), `${locale} ${key} is empty`);
    assert.notEqual(val, english, `${locale} ${key} must be a real translation, not English`);
  }
}

console.log(
  `assert-today-energy-space PASS (text-fg on elevated Linen ${linenFg.toFixed(2)}:1, Basalt ${basaltFg.toFixed(2)}:1; fg-secondary on elevated Basalt ${basaltSec.toFixed(2)}:1 — not used)`,
);
