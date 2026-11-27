/**
 * Login marketing first pass — source ACs (FE).
 * Run: npx tsx scripts/assert-login-marketing-first-pass.mjs
 *
 * Locked brief: /workspace/reports/baseline-login-marketing-first-pass-build-brief-2026-11-18.md
 */
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const TITLE = "Baseline — chart, today’s sky, grounded protocols";
const DESCRIPTION =
  "Your natal chart, today’s sky, Protocols that use what you already own, and Soul — informational, not medical advice.";
const OG_ALT = "HD Baseline — Baseline. Chart · Today · Protocols · Soul.";

const LOCKED_CAPTION = {
  en: "Today after a chart is saved.",
  de: "Today, nachdem ein Chart gespeichert wurde.",
  es: "Today, después de guardar un Chart.",
  fr: "Today, une fois un Chart enregistré.",
  nl: "Today, nadat je een Chart hebt opgeslagen.",
};

const LOCKED_ALT = {
  en: "A still of the Baseline Today screen after a natal chart has been saved.",
  de: "Ein Standbild des Baseline-Bildschirms Today, nachdem ein natal Chart gespeichert wurde.",
  es: "Una captura de la pantalla Today de Baseline, después de guardar un Chart natal.",
  fr: "Une image de l’écran Today de Baseline, une fois un Chart natal enregistré.",
  nl: "Een stilstaand beeld van het Baseline-scherm Today, nadat je een nataal Chart hebt opgeslagen.",
};

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function readBuf(rel) {
  return readFileSync(resolve(root, rel));
}

function valueFor(src, key) {
  const re = new RegExp(`['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*(['"])([\\s\\S]*?)\\1`);
  const m = src.match(re);
  return m ? m[2] : null;
}

function keysOf(src) {
  const keys = [];
  const re = /['"]([a-zA-Z0-9_.]+)['"]\s*:/g;
  let m;
  while ((m = re.exec(src))) keys.push(m[1]);
  return keys;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function unfilter(data, w, h, bpp) {
  const stride = w * bpp;
  const out = Buffer.alloc(stride * h);
  let src = 0;
  for (let y = 0; y < h; y++) {
    const filter = data[src++];
    const row = src;
    const dest = y * stride;
    const prev = y === 0 ? null : (y - 1) * stride;
    for (let i = 0; i < stride; i++) {
      const x = data[row + i];
      const a = i >= bpp ? out[dest + i - bpp] : 0;
      const b = prev !== null ? out[prev + i] : 0;
      const c = prev !== null && i >= bpp ? out[prev + i - bpp] : 0;
      let val;
      if (filter === 0) val = x;
      else if (filter === 1) val = (x + a) & 255;
      else if (filter === 2) val = (x + b) & 255;
      else if (filter === 3) val = (x + ((a + b) >> 1)) & 255;
      else if (filter === 4) val = (x + paeth(a, b, c)) & 255;
      else throw new Error(`unsupported PNG filter ${filter}`);
      out[dest + i] = val;
    }
    src += stride;
  }
  return out;
}

function readPng(buf) {
  assert.equal(buf[0], 0x89, "PNG signature");
  assert.equal(buf.subarray(1, 4).toString("ascii"), "PNG", "PNG signature");
  let off = 8;
  let ihdr = null;
  const idats = [];
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const typ = buf.subarray(off + 4, off + 8).toString("ascii");
    const data = buf.subarray(off + 8, off + 8 + len);
    if (typ === "IHDR") ihdr = data;
    if (typ === "IDAT") idats.push(data);
    if (typ === "IEND") break;
    off += 12 + len;
  }
  assert.ok(ihdr, "PNG IHDR");
  const w = ihdr.readUInt32BE(0);
  const h = ihdr.readUInt32BE(4);
  const bitDepth = ihdr[8];
  const colorType = ihdr[9];
  let pixels = null;
  if (bitDepth === 8 && (colorType === 2 || colorType === 6) && idats.length) {
    const raw = inflateSync(Buffer.concat(idats));
    const bpp = colorType === 6 ? 4 : 3;
    pixels = unfilter(raw, w, h, bpp);
  }
  return { w, h, bitDepth, colorType, pixels };
}

function pngHasRgb(png, r, g, b) {
  assert.ok(png.pixels, "PNG pixel data was decoded");
  const bpp = png.colorType === 6 ? 4 : 3;
  const row = png.w * bpp;
  for (let y = 0; y < png.h; y++) {
    for (let x = 0; x < png.w; x++) {
      const i = y * row + x * bpp;
      if (png.pixels[i] === r && png.pixels[i + 1] === g && png.pixels[i + 2] === b) {
        return true;
      }
    }
  }
  return false;
}

const pkg = read("package.json");
const middleware = read("src/middleware.ts");
const session = read("src/lib/session.ts");
const store = read("src/lib/store.tsx");
const header = read("src/components/Header.tsx");
const page = read("src/app/login/page.tsx");
const css = read("src/app/login/login-editorial-paper.css");
const layout = read("src/app/layout.tsx");
const en = read("src/lib/i18n/messages/en.ts");
const de = read("src/lib/i18n/messages/de.ts");
const es = read("src/lib/i18n/messages/es.ts");
const fr = read("src/lib/i18n/messages/fr.ts");
const nl = read("src/lib/i18n/messages/nl.ts");
const catalogs = { en, de, es, fr, nl };

assert.ok(
  pkg.includes(
    '"assert:login-marketing-first-pass": "npx tsx scripts/assert-login-marketing-first-pass.mjs"',
  ),
  "package.json wires assert:login-marketing-first-pass only as specified",
);

// --- middleware: exact /, 307/302 only, no other routes ---
assert.ok(existsSync(resolve(root, "src/middleware.ts")), "frontend/src/middleware.ts exists");
assert.match(middleware, /matcher:\s*["']\/["']/, "middleware matcher is exactly /");
assert.match(middleware, /NextResponse\.redirect\(\s*url,\s*307\s*\)|NextResponse\.redirect\(\s*url,\s*302\s*\)/, "middleware 307/302-redirects / to /login");
assert.match(middleware, /pathname\s*=\s*["']\/login["']/, "middleware redirects to /login");
assert.match(middleware, /baseline_signed_in/, "middleware checks the presence cookie");
assert.doesNotMatch(middleware, /\b301\b|\b308\b/, "middleware does not use 301 or 308");
assert.doesNotMatch(middleware, /\/reset-password|\/privacy/, "middleware does not mention or redirect /reset-password or /privacy");
assert.doesNotMatch(middleware, /matcher:\s*\[[^\]]*\/login/, "middleware matcher does not include /login");

// --- session cookie write/clear; no token in cookie ---
assert.match(session, /writeSessionToken/, "session.ts has writeSessionToken");
assert.match(session, /clearSession/, "session.ts has clearSession");
assert.match(session, /syncSessionPresenceCookie/, "session.ts exports syncSessionPresenceCookie");
assert.match(session, /baseline_signed_in/, "session.ts writes baseline_signed_in");
assert.match(session, /baseline_signed_in=\$\{SESSION_PRESENCE_VALUE\}|baseline_signed_in=1/, "session.ts writes baseline_signed_in=1");
assert.equal(session.includes('SESSION_PRESENCE_VALUE = "1"') || session.includes('baseline_signed_in=1'), true, "presence cookie value is 1");
assert.match(store, /syncSessionPresenceCookie\(\)/, "store hydration calls syncSessionPresenceCookie");

const writeFnStart = session.indexOf("export function writeSessionToken");
assert.ok(writeFnStart >= 0, "writeSessionToken is exported");
const writeFn = session.slice(writeFnStart, session.indexOf("export function clearSession"));
assert.match(writeFn, /writePresenceCookie\(true\)|baseline_signed_in/, "writeSessionToken writes the presence cookie when a token is stored");
assert.doesNotMatch(writeFn, /document\.cookie[\s\S]{0,80}\btoken\b/, "writeSessionToken does not write the access token into the cookie");

const clearFn = session.slice(session.indexOf("export function clearSession"));
assert.match(clearFn, /writePresenceCookie\(false\)|writeSessionToken\(null\)/, "clearSession clears the presence cookie");

// Cookie construction must use the constant "1", never the access token variable.
assert.doesNotMatch(
  session,
  /document\.cookie[\s\S]{0,200}\$\{token\}|cookie[^\n]*\+ token|token[^\n]*document\.cookie/,
  "access token is not interpolated into the cookie",
);

// --- Header hide paths unchanged ---
assert.ok(
  header.includes('if (pathname === "/login" || pathname === "/reset-password") return null;'),
  "Header hide paths stay exact /login and /reset-password",
);

// --- login story/card order and still after pillars.map ---
const storyStart = page.indexOf('className="order-2 space-y-6 lg:order-1');
assert.ok(storyStart > 0, "story column stays order-2 on small screens, lg:order-1");
const story = page.slice(storyStart, page.indexOf("</section>", storyStart));
const cardSectionStart = page.indexOf('className="order-1 w-full max-w-md');
assert.ok(cardSectionStart > 0, "form card column is order-1");
const cardSection = page.slice(cardSectionStart, page.indexOf("</section>", cardSectionStart));

assert.match(story, /pillars\.map/, "story column still has pillars.map");
assert.match(story, /data-testid="login-product-still"/, "product still is in the story column");
assert.ok(
  story.indexOf("pillars.map") < story.indexOf('data-testid="login-product-still"'),
  "login-product-still comes after pillars.map",
);
assert.ok(!cardSection.includes('data-testid="login-product-still"'), "still is not inside the auth card");
assert.match(css, /login-product-still-frame/, "linen editorial-paper frame class exists");
assert.match(page, /t\("login\.productStillCaption"\)/, "caption uses locked key");
assert.match(page, /t\("login\.productStillAlt"\)/, "alt uses locked key");
assert.match(page, /src="\/login\/today-after-chart\.png"/, "still src is the locked asset path");

// --- image assets ---
const stillPath = resolve(root, "public/login/today-after-chart.png");
const ogPath = resolve(root, "public/og/share-1200x630.png");
assert.ok(existsSync(stillPath), "frontend/public/login/today-after-chart.png exists");
assert.ok(existsSync(ogPath), "frontend/public/og/share-1200x630.png exists");
const og = readPng(readBuf("public/og/share-1200x630.png"));
assert.equal(og.w, 1200, "OG image is 1200px wide");
assert.equal(og.h, 630, "OG image is 630px tall");
assert.equal(og.bitDepth, 8, "OG image is 8-bit");
assert.equal(og.colorType, 2, "OG image is RGB (PNG color type 2)");
assert.ok(pngHasRgb(og, 0xf7, 0xf6, 0xf2), "OG image contains linen #f7f6f2");
assert.ok(pngHasRgb(og, 0x3a, 0x56, 0x42), "OG image contains growth-deep #3a5642");
assert.ok(pngHasRgb(og, 0x2f, 0x46, 0x36), "OG image contains growth-ink #2f4636");
const stillPng = readPng(readBuf("public/login/today-after-chart.png"));
assert.ok(stillPng.w >= 390, `still is at least phone-width (got ${stillPng.w})`);

// --- locked caption/alt in all five catalogs ---
for (const id of ["en", "de", "es", "fr", "nl"]) {
  const src = catalogs[id];
  assert.equal(valueFor(src, "login.productStillCaption"), LOCKED_CAPTION[id], `${id} caption matches lock`);
  assert.equal(valueFor(src, "login.productStillAlt"), LOCKED_ALT[id], `${id} alt matches lock`);
  const caption = valueFor(src, "login.productStillCaption");
  const alt = valueFor(src, "login.productStillAlt");
  assert.match(caption, /Today/, `${id} caption keeps Today in English`);
  assert.match(alt, /Today/, `${id} alt keeps Today in English`);
  // Locked EN uses lowercase "chart" as a common noun; de/es/fr/nl keep the
  // English feature name "Chart". Accept either form in every locale.
  assert.match(caption, /Chart|chart/, `${id} caption keeps Chart in English`);
  assert.match(alt, /Chart|chart/, `${id} alt keeps Chart in English`);
  if (id !== "en") {
    assert.match(caption, /Chart/, `${id} caption uses English feature name Chart`);
    assert.match(alt, /Chart/, `${id} alt uses English feature name Chart`);
  }
}
for (const id of ["de", "es", "fr", "nl"]) {
  assert.notEqual(
    valueFor(catalogs[id], "login.productStillCaption"),
    LOCKED_CAPTION.en,
    `${id} caption is not an English copy`,
  );
  assert.notEqual(
    valueFor(catalogs[id], "login.productStillAlt"),
    LOCKED_ALT.en,
    `${id} alt is not an English copy`,
  );
}

// typographic apostrophe in French l’écran
assert.equal(
  valueFor(fr, "login.productStillAlt").includes("l\u2019écran"),
  true,
  "French alt uses typographic apostrophe in l’écran",
);

// catalog key parity for the two new keys (and overall login key sets).
// Scope change 27 Nov 2026 10:06 PM Bangkok (brief 17353706…): de/es/fr omit the four
// Read more aria-labels that exist in en and nl only.
const EN_NL_ONLY_ARIA = [
  "chart.people.readMoreAboutTypeInDeepDive",
  "chart.people.readMoreAboutProfileInDeepDive",
  "chart.people.readMoreAboutStrategyInDeepDive",
  "chart.people.readMoreAboutDefinitionInDeepDive",
];
const enKeys = new Set(keysOf(en));
for (const id of ["de", "es", "fr", "nl"]) {
  const keys = new Set(keysOf(catalogs[id]));
  for (const need of ["login.productStillCaption", "login.productStillAlt"]) {
    assert.ok(keys.has(need), `${id} has ${need}`);
  }
  const allowed = id === "nl" ? [] : EN_NL_ONLY_ARIA;
  const missing = [...enKeys].filter((k) => !keys.has(k) && !allowed.includes(k));
  const extra = [...keys].filter((k) => !enKeys.has(k));
  const notOmitted = allowed.filter((k) => keys.has(k));
  assert.deepEqual(missing, [], `${id} missing catalog keys: ${missing.slice(0, 8).join(", ")}`);
  assert.deepEqual(extra, [], `${id} extra catalog keys: ${extra.slice(0, 8).join(", ")}`);
  assert.deepEqual(notOmitted, [], `${id} should not carry en/nl-only aria keys`);
}

// --- layout.tsx title/description unchanged; openGraph/twitter; no metadata.icons ---
assert.ok(layout.includes(`title: "${TITLE}"`), "layout.tsx title is unchanged");
assert.ok(layout.includes(`"${DESCRIPTION}"`), "layout.tsx description is unchanged");
assert.match(layout, /openGraph:/, "layout.tsx adds openGraph");
assert.match(layout, /siteName:\s*"HD Baseline"/, "openGraph.siteName is HD Baseline");
assert.match(layout, /type:\s*"website"/, "openGraph.type is website");
assert.match(layout, /url:\s*"https:\/\/hdbaseline.com"/, "openGraph.url is https://hdbaseline.com");
assert.match(layout, /summary_large_image/, "twitter.card is summary_large_image");
assert.match(layout, /\/og\/share-1200x630\.png/, "OG/Twitter images use /og/share-1200x630.png");
assert.match(layout, /width:\s*1200/, "openGraph image width 1200");
assert.match(layout, /height:\s*630/, "openGraph image height 630");
assert.ok(layout.includes(`alt: "${OG_ALT}"`), "openGraph image alt is locked");
assert.match(layout, /metadataBase/, "metadataBase is set");
assert.match(layout, /VERCEL_ENV/, "preview metadataBase uses VERCEL_ENV");
assert.match(layout, /VERCEL_URL/, "preview metadataBase uses VERCEL_URL");
assert.doesNotMatch(layout, /FRONTEND_BASE_URL/, "does not add or use FRONTEND_BASE_URL");
assert.doesNotMatch(layout, /metadata\.icons|icons:\s*\{/, "layout.tsx does not add metadata.icons");

// --- brand.name remains Baseline; no testimonial/press/user-count keys ---
for (const id of ["en", "de", "es", "fr", "nl"]) {
  assert.equal(valueFor(catalogs[id], "brand.name"), "Baseline", `${id} brand.name stays Baseline`);
  const src = catalogs[id];
  const loginBlob = [...src.matchAll(/['"]login\.[^'"]+['"]\s*:\s*(['"])([\s\S]*?)\1/g)]
    .map((m) => m[0])
    .join("\n");
  assert.doesNotMatch(
    loginBlob,
    /testimonial|press logo|user count|join [0-9]|star rating|as seen in/i,
    `${id} login catalog has no testimonial/press/user-count keys`,
  );
}
assert.doesNotMatch(
  page,
  /testimonial|press logo|user count|star rating|as seen in/i,
  "/login page does not render testimonials, press, or user counts",
);

// --- quiet informational footer (opportunity 7, Option A) ---
const LOCKED_DISCLAIMER = {
  en: "Informational only — not medical advice.",
  de: "Nur zur Information — keine medizinische Beratung.",
  es: "Solo informativo — no es consejo médico.",
  fr: "À titre informatif uniquement — pas un avis médical.",
  nl: "Alleen informatief — geen medisch advies.",
};

assert.match(page, /data-testid="login-disclaimer-footer"/, "login-disclaimer-footer exists in login/page.tsx");
assert.match(page, /t\("home\.trust\.disclaimer"\)/, "disclaimer uses home.trust.disclaimer");
assert.doesNotMatch(
  page,
  /t\("page\.protocols\.disclaimer"\)/,
  "login does not use page.protocols.disclaimer",
);

const privacyIdx = page.indexOf('data-testid="login-privacy-footer"');
const disclaimerIdx = page.indexOf('data-testid="login-disclaimer-footer"');
const localeIdx = page.indexOf('data-testid="login-locale"');
assert.ok(privacyIdx >= 0, "login-privacy-footer is present");
assert.ok(localeIdx >= 0, "login-locale is present");
assert.ok(
  disclaimerIdx > privacyIdx && localeIdx > disclaimerIdx,
  "disclaimer sits after login-privacy-footer and before login-locale",
);

const disclaimerOpen = page.lastIndexOf("<p", disclaimerIdx);
const disclaimerTag = page.slice(disclaimerOpen, page.indexOf(">", disclaimerIdx) + 1);
assert.match(disclaimerTag, /type-caption text-fg-secondary/, "disclaimer uses type-caption text-fg-secondary");
assert.match(disclaimerTag, /text-center/, "disclaimer is centered");

for (const id of ["en", "de", "es", "fr", "nl"]) {
  assert.equal(
    valueFor(catalogs[id], "home.trust.disclaimer"),
    LOCKED_DISCLAIMER[id],
    `${id} home.trust.disclaimer is unchanged`,
  );
}

console.log("assert:login-marketing-first-pass PASS");
