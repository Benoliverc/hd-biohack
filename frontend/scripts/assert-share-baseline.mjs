/**
 * Source-level ACs for Share my Baseline (PR 2).
 * Run: npx tsx frontend/scripts/assert-share-baseline.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

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

const adapter = read("src/lib/share/shareCardImage.ts");
const raster = read("src/lib/share/rasterizeCard.ts");
const card = read("src/components/share/ShareBaselineCard.tsx");
const btn = read("src/components/share/ShareBaselineButton.tsx");
const profile = read("src/app/profile/page.tsx");
const today = read("src/app/transits/page.tsx");
const body = read("src/components/BodyGraph.tsx");
const en = read("src/lib/i18n/messages/en.ts");
const nl = read("src/lib/i18n/messages/nl.ts");
const de = read("src/lib/i18n/messages/de.ts");
const fr = read("src/lib/i18n/messages/fr.ts");
const es = read("src/lib/i18n/messages/es.ts");

if (!/export async function shareCardImage/.test(adapter)) fail("shareCardImage missing");
if (!/SWAP POINT \(Capacitor\)/.test(adapter)) fail("Capacitor swap-point comment missing");
if (!/canShare/.test(adapter)) fail("canShare check missing");
if (!/downloadBlob/.test(adapter)) fail("download fallback missing");
// No scattered navigator.share outside the adapter (allow comment mentions).
for (const [name, src] of [
  ["ShareBaselineButton", btn],
  ["ShareBaselineCard", card],
  ["profile", profile],
  ["today", today],
]) {
  const stripped = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  if (/navigator\.share/.test(stripped)) fail(`${name} must not call navigator.share directly`);
}

if (!/document\.fonts\.ready/.test(raster)) fail("fonts.ready wait missing");
if (!/data-share-card/.test(raster) && !/data-share-card/.test(card))
  fail("off-screen data-share-card missing");
if (!/inlineSvgStyles/.test(raster)) fail("inlineSvgStyles not used in raster path");
// Old SVG+foreignObject path taints Chromium; must use node rasterizer instead.
if (/<foreignObject|foreignObject><\/foreignObject>|svgBlob/.test(raster))
  fail("hand-rolled SVG+foreignObject raster path must be removed");
if (!/from \"html-to-image\"|from 'html-to-image'/.test(raster))
  fail("html-to-image import missing");
if (!/html2canvas/.test(raster)) fail("html2canvas fallback missing");
if (!/replaceSvgsWithPngImages|data-share-svg-raster/.test(raster))
  fail("SVG→PNG flatten before capture missing");
const pkgJson = read("package.json");
if (!/"html-to-image"/.test(pkgJson)) fail("package.json missing html-to-image");
if (!/"html2canvas"/.test(pkgJson)) fail("package.json missing html2canvas");

if (!/#F7F6F2/.test(card) && !/SHARE_PALETTE\.linen/.test(card))
  fail("linen palette missing on card");
if (!/Baseline/.test(card)) fail("Baseline wordmark missing");
if (!/My Baseline · today/.test(card)) fail("today eyebrow missing");
if (!/variant === "natal"/.test(card) && !/variant: "natal"/.test(card))
  fail("natal variant missing");
if (!/moveText/.test(card)) fail("today moveText missing");
const palette = read("src/lib/share/palette.ts");
if (!/shareLayoutPad|shareTextSafeInsets/.test(palette))
  fail("shareLayoutPad / shareTextSafeInsets missing");
if (/export function shareSafeInsets\s*\(/.test(palette))
  fail("legacy shareSafeInsets content box must be removed");
if (/h \* 0\.14|h \* 0\.35|w \* 0\.06/.test(palette))
  fail("legacy 14/35/6 inset math must be removed");
if (!/shareGraphHeightFrac/.test(palette))
  fail("shareGraphHeightFrac missing");
if (!/0\.46|0\.5|0\.34/.test(palette))
  fail("hero graph height targets missing");
const cardSrc = card;
if (/marginTop:\s*["']auto["']/.test(cardSrc))
  fail("marginTop:auto void between graph and type must be removed");
if (!/shareGraphHeightFrac|canvasH \* /.test(cardSrc) && !/shareGraphHeightFrac/.test(cardSrc))
  fail("graph must size from full canvas %");
if (!/1080/.test(read("src/lib/share/palette.ts"))) fail("1080 width missing");
if (!/1920/.test(read("src/lib/share/palette.ts"))) fail("1920 height missing");
if (!/1350/.test(read("src/lib/share/palette.ts"))) fail("1350 feed height missing");

if (!/ShareBaselineButton/.test(profile)) fail("Chart page missing ShareBaselineButton");
if (!/ShareBaselineButton/.test(today)) fail("Today page missing ShareBaselineButton");
if (!/main_action_text/.test(today)) fail("Today share must read main_action_text");
if (!/compact/.test(body)) fail("BodyGraph compact export mode missing");

const shareKeys = [
  "share.myBaseline",
  "share.sharing",
  "share.stories",
  "share.feed",
  "share.moreSizes",
  "share.failed",
  "share.downloadFallback",
];
const enKeys = keysOf(en);
for (const k of shareKeys) {
  if (!enKeys.includes(k)) fail(`en missing ${k}`);
}
for (const [name, src] of [
  ["nl", nl],
  ["de", de],
  ["fr", fr],
  ["es", es],
]) {
  const keys = keysOf(src);
  const missing = shareKeys.filter((k) => !keys.includes(k));
  if (missing.length) fail(`${name} missing ${missing.join(", ")}`);
}

if (
  !/"assert:share-baseline": "npx tsx scripts\/assert-share-baseline\.mjs"/.test(
    pkgJson,
  )
) {
  fail("package.json missing assert:share-baseline");
}

const capture = read("src/lib/share/captureShareCard.ts");
const i18nSrc = read("src/lib/i18n/I18nProvider.tsx");
const i18nBarrel = read("src/lib/i18n/index.ts");

function extractFunction(src, name) {
  const sig = src.search(new RegExp(`export function ${name}\\b`));
  if (sig < 0) return null;
  const rest = src.slice(sig + name.length);
  const next = rest.search(/\nexport\s+(?:function|type|const|\{)/);
  return next < 0 ? src.slice(sig) : src.slice(sig, sig + name.length + next);
}

const localeRootFn = extractFunction(i18nSrc, "I18nLocaleRoot");
const providerFn = extractFunction(i18nSrc, "I18nProvider");
if (!localeRootFn) fail("I18nLocaleRoot missing from I18nProvider.tsx");
if (/document\.documentElement\.lang/.test(localeRootFn)) {
  fail("I18nLocaleRoot must not touch document.documentElement.lang");
}
if (!providerFn || !/document\.documentElement\.lang/.test(providerFn)) {
  fail("I18nProvider must still set document.documentElement.lang");
}
if (!/I18nLocaleRoot/.test(i18nBarrel) || !/readDocumentLocale/.test(i18nBarrel)) {
  fail("lib/i18n/index.ts must re-export I18nLocaleRoot and readDocumentLocale");
}
if (!/I18nLocaleRoot/.test(capture) || !/from ["']@\/lib\/i18n["']/.test(capture)) {
  fail("captureShareCard must import I18nLocaleRoot from @/lib/i18n");
}
if (
  !/createElement\(\s*I18nLocaleRoot/.test(capture) ||
  !/createElement\(\s*ShareBaselineCard/.test(capture)
) {
  fail("capture must wrap ShareBaselineCard in I18nLocaleRoot");
}

const captureCode = capture.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const rasterAt = captureCode.search(/rasterizeOffscreenCard\s*\(/);
if (rasterAt < 0) fail("rasterizeOffscreenCard call missing");
const rasterCall = captureCode.slice(rasterAt).match(
  /rasterizeOffscreenCard\s*\(\s*([^,\s)]+)/,
);
if (!rasterCall) fail("rasterizeOffscreenCard call missing");
const rasterArg = rasterCall[1];
if (rasterArg === "createElement") {
  if (
    /rasterizeOffscreenCard\s*\(\s*createElement\(\s*ShareBaselineCard/.test(
      captureCode,
    )
  ) {
    fail("bare ShareBaselineCard passed straight to rasterizeOffscreenCard");
  }
  if (
    !/rasterizeOffscreenCard\s*\(\s*createElement\(\s*I18nLocaleRoot/.test(
      captureCode,
    )
  ) {
    fail("rasterizeOffscreenCard must receive an I18nLocaleRoot wrap");
  }
} else {
  const assign = captureCode.match(
    new RegExp(`(?:const|let|var)\\s+${rasterArg}\\s*=\\s*([^;]+)`),
  );
  if (!assign) fail(`cannot find assignment of rasterize argument ${rasterArg}`);
  const rhs = assign[1];
  if (
    /createElement\(\s*ShareBaselineCard/.test(rhs) &&
    !/I18nLocaleRoot/.test(rhs)
  ) {
    fail("bare ShareBaselineCard passed straight to rasterizeOffscreenCard");
  }
  if (!/buildShareCardElement|I18nLocaleRoot/.test(rhs)) {
    fail("rasterize input must be the I18nLocaleRoot wrap");
  }
}

globalThis.React = React;
const { ShareBaselineCard } = await import(
  "../src/components/share/ShareBaselineCard.tsx"
);
const { buildShareCardElement } = await import(
  "../src/lib/share/captureShareCard.ts"
);

const natalFixture = {
  variant: "natal",
  aspect: "story",
  typeLabel: "Projector",
  profileLabel: "1/3",
  strategyLabel: "Wait for the Invitation",
  graph: {
    definedCenters: ["Spleen", "Sacral"],
    channels: [{ gates: [57, 34], name: "The Power" }],
  },
};

let bareThrew = false;
try {
  renderToStaticMarkup(React.createElement(ShareBaselineCard, natalFixture));
} catch (err) {
  bareThrew = true;
  const message = err instanceof Error ? `${err.message}\n${err.stack || ""}` : String(err);
  if (!message.includes("useI18n must be used within I18nProvider")) {
    fail(`bare ShareBaselineCard error missing provider message: ${message}`);
  }
}
if (!bareThrew) {
  fail("bare ShareBaselineCard must throw useI18n must be used within I18nProvider");
}

const enHtml = renderToStaticMarkup(buildShareCardElement(natalFixture, "en"));
if (!enHtml.includes("data-share-card")) {
  fail("wrapped en card missing data-share-card");
}

const nlHtml = renderToStaticMarkup(buildShareCardElement(natalFixture, "nl"));
if (!nlHtml.includes("Human Design-lichaamsgrafiek")) {
  fail("nl card missing Dutch aria Human Design-lichaamsgrafiek");
}

console.log("OK: share-baseline assertions passed");
