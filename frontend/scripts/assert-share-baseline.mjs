/**
 * Source-level ACs for Share my Baseline (PR 2).
 * Run: npx tsx frontend/scripts/assert-share-baseline.mjs
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
if (!/foreignObject/.test(raster)) fail("foreignObject raster path missing");

if (!/#F7F6F2/.test(card) && !/SHARE_PALETTE\.linen/.test(card))
  fail("linen palette missing on card");
if (!/Baseline/.test(card)) fail("Baseline wordmark missing");
if (!/My Baseline · today/.test(card)) fail("today eyebrow missing");
if (!/variant === "natal"/.test(card) && !/variant: "natal"/.test(card))
  fail("natal variant missing");
if (!/moveText/.test(card)) fail("today moveText missing");
if (!/shareSafeInsets|0\.14|14%/.test(read("src/lib/share/palette.ts")))
  fail("safe-zone insets missing");
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

console.log("OK: share-baseline assertions passed");
