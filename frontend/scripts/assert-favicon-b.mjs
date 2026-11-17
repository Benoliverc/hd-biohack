/**
 * Favicon Growth B pass — source ACs (FE).
 * Run: npx tsx scripts/assert-favicon-b.mjs
 *
 * Locked brief: /workspace/reports/baseline-favicon-b-build-brief-2026-11-17.md
 * Locked treatment: Growth B — linen #f7f6f2 Inter capital B on --growth-deep #3a5642.
 */
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GROWTH = [0x3a, 0x56, 0x42];
const LINEN = [0xf7, 0xf6, 0xf2];
const TITLE = "Baseline — chart, today’s sky, grounded protocols";
const DESCRIPTION =
  "Your natal chart, today’s sky, Protocols that use what you already own, and Soul — informational, not medical advice.";
const WORDMARK_CLASS =
  'className="inline-flex min-h-11 min-w-0 shrink items-center truncate text-base font-semibold tracking-tight text-growth-ink sm:text-lg"';

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function readBuf(rel) {
  return readFileSync(resolve(root, rel));
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
  const depth = ihdr[8];
  const color = ihdr[9];
  const inter = ihdr[12];
  assert.equal(depth, 8, "PNG is 8-bit");
  assert.equal(inter, 0, "PNG is not interlaced");
  assert.ok(color === 2 || color === 6, `unsupported PNG color type ${color}`);
  const bpp = color === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idats));
  const stride = w * bpp;
  const rgba = Buffer.alloc(w * h * 4);
  let i = 0;
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const ft = raw[i++];
    const row = Buffer.from(raw.subarray(i, i + stride));
    i += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? row[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let pr = 0;
      if (ft === 1) pr = a;
      else if (ft === 2) pr = b;
      else if (ft === 3) pr = Math.floor((a + b) / 2);
      else if (ft === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else {
        assert.ok(ft === 0, `unknown PNG filter ${ft}`);
      }
      if (ft !== 0) row[x] = (row[x] + pr) & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      rgba[o] = row[x * bpp];
      rgba[o + 1] = row[x * bpp + 1];
      rgba[o + 2] = row[x * bpp + 2];
      rgba[o + 3] = color === 6 ? row[x * bpp + 3] : 255;
    }
    prev = row;
  }
  return { w, h, rgba };
}

function parseIco(buf) {
  const reserved = buf.readUInt16LE(0);
  const type = buf.readUInt16LE(2);
  const count = buf.readUInt16LE(4);
  assert.equal(reserved, 0, "ICO reserved is 0");
  assert.equal(type, 1, "ICO type is 1");
  assert.ok(count >= 4, `ICO image count ${count}`);
  const images = [];
  for (let i = 0; i < count; i++) {
    const o = 6 + i * 16;
    let w = buf[o] || 256;
    let h = buf[o + 1] || 256;
    const size = buf.readUInt32LE(o + 8);
    const off = buf.readUInt32LE(o + 12);
    const blob = buf.subarray(off, off + size);
    if (blob[0] === 0x89 && blob.subarray(1, 4).toString("ascii") === "PNG") {
      const png = readPng(blob);
      images.push({ w: png.w, h: png.h, rgba: png.rgba, kind: "png" });
    } else {
      const biSize = blob.readUInt32LE(0);
      const biW = Math.abs(blob.readInt32LE(4));
      const biH = Math.abs(blob.readInt32LE(8));
      const biBit = blob.readUInt16LE(14);
      assert.equal(biBit, 32, `ICO DIB ${w}x${h} is 32-bit`);
      const xorH = biH > h ? biH / 2 : biH;
      const width = biW || w;
      const rgba = Buffer.alloc(width * xorH * 4);
      const rowSize = width * 4;
      const xorOff = biSize;
      for (let y = 0; y < xorH; y++) {
        const src = xorOff + (xorH - 1 - y) * rowSize;
        for (let x = 0; x < width; x++) {
          const b = blob[src + x * 4];
          const g = blob[src + x * 4 + 1];
          const r = blob[src + x * 4 + 2];
          const a = blob[src + x * 4 + 3];
          const d = (y * width + x) * 4;
          rgba[d] = r;
          rgba[d + 1] = g;
          rgba[d + 2] = b;
          rgba[d + 3] = a;
        }
      }
      images.push({ w: width, h: xorH, rgba, kind: "dib" });
    }
  }
  return images;
}

function pixelAt(rgba, w, x, y) {
  const o = (y * w + x) * 4;
  return [rgba[o], rgba[o + 1], rgba[o + 2], rgba[o + 3]];
}

function colorClose(px, rgb, tol) {
  return Math.abs(px[0] - rgb[0]) <= tol && Math.abs(px[1] - rgb[1]) <= tol && Math.abs(px[2] - rgb[2]) <= tol;
}

function hasColor(rgba, rgb, tol = 0) {
  for (let i = 0; i < rgba.length; i += 4) {
    if (colorClose(rgba.subarray(i, i + 3), rgb, tol)) return true;
  }
  return false;
}

function allOpaque(rgba) {
  for (let i = 3; i < rgba.length; i += 4) {
    if (rgba[i] !== 255) return false;
  }
  return true;
}

function cornersAre(rgba, w, h, rgb, tol = 0) {
  const pts = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ];
  return pts.every(([x, y]) => colorClose(pixelAt(rgba, w, x, y), rgb, tol) && pixelAt(rgba, w, x, y)[3] === 255);
}

// --- files exist ---
assert.ok(existsSync(resolve(root, "src/app/icon.svg")), "src/app/icon.svg exists");
assert.ok(existsSync(resolve(root, "src/app/favicon.ico")), "src/app/favicon.ico exists");
assert.ok(existsSync(resolve(root, "src/app/apple-icon.png")), "src/app/apple-icon.png exists");

const pkg = read("package.json");
assert.ok(
  pkg.includes('"assert:favicon-b": "npx tsx scripts/assert-favicon-b.mjs"'),
  "package.json wires assert:favicon-b",
);

// --- SVG is the vector source of truth ---
const svg = read("src/app/icon.svg");
assert.match(svg, /#3a5642/i, "SVG uses locked growth-deep #3a5642");
assert.match(svg, /#f7f6f2/i, "SVG uses locked linen #f7f6f2");
assert.match(svg, /<path\b/i, "SVG has a real path for the B");
assert.match(svg, /\sd="[^"]*[MLCQZmlcqz][^"]*"/, "SVG path has vector commands");
assert.doesNotMatch(svg, /<text\b/i, "SVG is not a <text>-only mark");
assert.doesNotMatch(svg, /<image\b/i, "SVG does not embed a raster");
assert.doesNotMatch(svg, /data:image/i, "SVG does not embed a raster data URI");
assert.doesNotMatch(svg, /prefers-color-scheme/i, "no prefers-color-scheme swap");
assert.doesNotMatch(svg, /\brx\s*=|\bry\s*=/, "badge is a full-bleed square, not a rounded rect");
assert.doesNotMatch(svg, /#121513|#2f4636/i, "SVG is Growth B, not Ink or Linen");

// --- ICO contains 16, 32, 48, and 256 ---
const icoBuf = readBuf("src/app/favicon.ico");
const icoImages = parseIco(icoBuf);
const icoSizes = new Set(icoImages.map((im) => `${im.w}x${im.h}`));
for (const need of ["16x16", "32x32", "48x48", "256x256"]) {
  assert.ok(icoSizes.has(need), `ICO contains ${need} (have ${[...icoSizes].join(", ")})`);
}
for (const im of icoImages) {
  assert.ok(cornersAre(im.rgba, im.w, im.h, GROWTH, 2), `ICO ${im.w}x${im.h} corners are growth-deep`);
  assert.ok(hasColor(im.rgba, GROWTH, 2), `ICO ${im.w}x${im.h} uses #3a5642`);
  const letterTol = im.w <= 16 ? 24 : 8;
  assert.ok(hasColor(im.rgba, LINEN, letterTol), `ICO ${im.w}x${im.h} uses linen #f7f6f2 for the B`);
  assert.ok(allOpaque(im.rgba), `ICO ${im.w}x${im.h} is opaque (no transparent corners)`);
}

// --- apple-icon 180×180, full-bleed, opaque, locked colors ---
const appleBuf = readBuf("src/app/apple-icon.png");
const apple = readPng(appleBuf);
assert.equal(apple.w, 180, "apple-icon is 180px wide");
assert.equal(apple.h, 180, "apple-icon is 180px tall");
assert.ok(allOpaque(apple.rgba), "apple-icon is fully opaque (iOS supplies the mask)");
assert.ok(cornersAre(apple.rgba, apple.w, apple.h, GROWTH, 0), "apple-icon corners are exact #3a5642");
assert.ok(hasColor(apple.rgba, GROWTH, 0), "apple-icon background uses #3a5642");
assert.ok(hasColor(apple.rgba, LINEN, 0), "apple-icon letter uses #f7f6f2");

// --- layout title / description unchanged; no metadata.icons required ---
const layout = read("src/app/layout.tsx");
assert.ok(layout.includes(`title: "${TITLE}"`), "layout.tsx title is unchanged");
assert.ok(layout.includes(`"${DESCRIPTION}"`), "layout.tsx description is unchanged");
assert.doesNotMatch(layout, /metadata\.icons|icons:\s*\{/, "layout.tsx does not override metadata.icons");

// --- Header wordmark unchanged ---
const header = read("src/components/Header.tsx");
const wordmarkAt = header.indexOf('data-testid="nav-wordmark"');
assert.ok(wordmarkAt >= 0, "Header wordmark test id is unchanged");
const wordmark = header.slice(wordmarkAt, wordmarkAt + 500);
assert.ok(wordmark.includes(WORDMARK_CLASS), "Header wordmark classes are unchanged");
assert.ok(wordmark.includes('{t("brand.name")}'), "Header wordmark still renders brand.name");

// --- brand.name catalog values unchanged ---
const catalogIds = ["en", "nl", "de", "fr", "es"];
for (const id of catalogIds) {
  const src = read(`src/lib/i18n/messages/${id}.ts`);
  assert.match(src, /'brand\.name': 'Baseline'/, `${id}.ts brand.name stays Baseline`);
}

console.log("assert:favicon-b PASS");
