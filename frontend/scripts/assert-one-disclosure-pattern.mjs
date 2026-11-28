/**
 * One disclosure pattern: shared chevron and a CSS-only open fade.
 * Run: npx tsx scripts/assert-one-disclosure-pattern.mjs
 *
 * Lockfile and the unchanged Chart/Today files are the 6085a38 bytes.
 * ChartDeepDive is #170 Core order plus this PR’s joining-gate block.
 * globals.css and biohack/page.tsx are the disclosure merge's resolved bytes; main abd12a94 did not edit them.
 * Motion stays in globals.css; no new dependency.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(resolve(root, rel), "utf8");
const sha = (text) => createHash("sha256").update(text).digest("hex");
const norm = (text) => text.replace(/\s+/g, " ").trim();

const EXISTING_RULE = `/* Disclosure chevrons follow the open attribute, including first paint already expanded. */
details.disclosure > summary [data-disclosure-chevron] {
  display: inline-block;
  transition: transform 150ms ease;
}
details.disclosure[open] > summary [data-disclosure-chevron] {
  transform: rotate(90deg);
}`;

const LOCKED_CSS = `/* One disclosure pattern: calm open fade, CSS only. */
@keyframes disclosure-in {
  from { opacity: 0; transform: translateY(-2px); }
  to { opacity: 1; transform: none; }
}
details.disclosure[open] > :not(summary),
.disclosure-panel {
  animation: disclosure-in 180ms ease-out;
}
[data-disclosure-chevron] {
  transition: transform 150ms ease;
}
[data-disclosure-chevron][data-open="true"] {
  transform: rotate(90deg);
}
@media (prefers-reduced-motion: reduce) {
  details.disclosure[open] > :not(summary),
  .disclosure-panel {
    animation: none;
  }
  [data-disclosure-chevron],
  details.disclosure > summary [data-disclosure-chevron] {
    transition: none !important;
  }
}`;

const LOCKFILE_SHA_6085A38 =
  "a6a9733cf7ab81eee53471a02cd27bc06e215ca57c290afd0b9fc94cdf191324";

// Resolved tree after the merge onto abd12a94. Main did not edit these two.
const RESOLVED_SHA = {
  "src/app/globals.css":
    "2c9cc2fdd9650f26f517cf3265e18b6f366976be4c20ceb94cc27f74a8082195",
  "src/app/biohack/page.tsx":
    "56bf53d2ee929dbf244c33b4d26328b6d7b07e37772131a60bc848ad7de4dfd2",
};

const FROZEN_6085A38 = {
  "src/components/ChartDisclosure.tsx":
    "ef4ff692ed470ae3cc32a6c3d1dcf3e633c62f1c6d1a7d77b1fe67f57b044eff",
  "src/components/ChartTypeBox.tsx":
    "f7996a40bd54c6c64efe5ddab4be725111c1ef7b496f91c500f0480f160baea4",
  "src/components/TodayIndication.tsx":
    "691fecfb86631889a1c05a9f41417063289f0b0610e636d64e7e6f23b97f5eb8",
  "src/app/transits/page.tsx":
    "32379668ae081b642c42dd61b245b896bf73deddddc87e518e77a418d49a0cfd",
};

// ChartDeepDive is #170 Core order plus this PR’s joining-gate block.
const CHART_DEEP_DIVE_SHA_ABD12A94 =
  "f3a9b36c897facf2691be602b448eb453f1313a5e07a49b829de4c1062a353e9";

// --- 1. Locked CSS after the byte-identical chevron rule ---
const css = read("src/app/globals.css");
const ruleAt = css.indexOf(EXISTING_RULE);
assert.ok(ruleAt >= 0, "check 1: L281-288 chevron rule is byte-identical");
const afterRule = css.slice(ruleAt + EXISTING_RULE.length);
assert.ok(
  norm(afterRule).includes(norm(LOCKED_CSS)),
  "check 1: locked block follows the existing chevron rule",
);
assert.match(
  css,
  /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*animation:\s*none;[\s\S]*transition:\s*none !important;/,
  "check 1: prefers-reduced-motion sets animation none and transition none",
);
for (const [rel, hash] of Object.entries(RESOLVED_SHA)) {
  assert.equal(sha(read(rel)), hash, `check 1: ${rel} matches the resolved tree`);
}

// --- 2. Button sections: chevron, no Show / Hide text ---
function assertButtonSection(src, label) {
  assert.doesNotMatch(
    src,
    /protocols\.(?:show|hide)/,
    `check 2: ${label} has no protocols.show / protocols.hide`,
  );
  assert.equal(
    (src.match(/data-disclosure-chevron/g) || []).length,
    1,
    `check 2: ${label} has exactly one data-disclosure-chevron`,
  );
  assert.equal(
    (src.match(/data-open=\{open \? "true" : "false"\}/g) || []).length,
    1,
    `check 2: ${label} sets data-open from open`,
  );
  const expandedAt = src.indexOf("aria-expanded={open}");
  const bodyAt = src.indexOf("{open && (");
  assert.ok(
    expandedAt >= 0 && bodyAt > expandedAt,
    `check 2: ${label} keeps aria-expanded={open} before {open && (`,
  );
  assert.match(
    src.slice(bodyAt, bodyAt + 500),
    /disclosure-panel/,
    `check 2: ${label} open content has disclosure-panel`,
  );
}

assertButtonSection(read("src/components/protocols/BaselineKitCard.tsx"), "BaselineKitCard");
const biohack = read("src/app/biohack/page.tsx");
const natalStart = biohack.indexOf("function NatalBaselineCard");
const natalEnd = biohack.indexOf("function InventoryPanel");
assert.ok(natalStart >= 0 && natalEnd > natalStart, "check 2: NatalBaselineCard present");
assertButtonSection(biohack.slice(natalStart, natalEnd), "natal card");

// --- 3. week-plan and week-sky-note share the hook ---
function detailsOpenTag(src, testid) {
  const marker = `data-testid="${testid}"`;
  const idx = src.indexOf(marker);
  assert.ok(idx >= 0, `check 3: ${testid} present`);
  const start = src.lastIndexOf("<details", idx);
  assert.ok(start >= 0 && idx - start < 500, `check 3: ${testid} is on a details`);
  return src.slice(start, idx + marker.length);
}

const planTag = detailsOpenTag(biohack, "week-plan");
assert.match(planTag, /\bdisclosure\b/, "check 3: week-plan details has disclosure");
const skyIdx = biohack.indexOf('data-testid="week-sky-note"');
assert.match(
  biohack.slice(biohack.indexOf('data-testid="week-plan"'), skyIdx),
  /data-disclosure-chevron/,
  "check 3: week-plan has a data-disclosure-chevron",
);
const skyTag = detailsOpenTag(biohack, "week-sky-note");
assert.match(skyTag, /\bdisclosure\b/, "check 3: week-sky-note details has disclosure");
const skyStart = biohack.lastIndexOf("<details", skyIdx);
const skyEnd = biohack.indexOf("</details>", skyIdx);
assert.match(
  biohack.slice(skyStart, skyEnd),
  /data-disclosure-chevron/,
  "check 3: week-sky-note has a data-disclosure-chevron",
);
assert.doesNotMatch(
  biohack,
  /group-open:rotate-90/,
  "check 3: group-open:rotate-90 is gone from biohack/page.tsx",
);

// --- 4. Soul details use the shared pattern ---
const soul = read("src/app/soul/page.tsx");
const detailTags = soul.match(/<details\b[^>]*>/g) || [];
assert.ok(detailTags.length > 0, "check 4: soul has details");
for (const tag of detailTags) {
  assert.match(tag, /\bdisclosure\b/, "check 4: every details has the disclosure class");
}
for (const part of soul.split(/<details\b/).slice(1)) {
  const body = part.slice(0, part.indexOf("</details>"));
  assert.match(body, /data-disclosure-chevron/, "check 4: every details has a data-disclosure-chevron");
}
const summaries = soul.match(/<summary\b[^>]*>/g) || [];
assert.equal(summaries.length, detailTags.length, "check 4: each details has a summary");
for (const tag of summaries) {
  assert.match(tag, /list-none/, "check 4: no summary without list-none");
}

// --- 5. No motion library; lockfile stays the 6085a38 bytes ---
const pkg = JSON.parse(read("package.json"));
const depNames = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];
for (const name of depNames) {
  assert.ok(
    name !== "framer-motion" &&
      name !== "motion" &&
      name !== "react-spring" &&
      name !== "@radix-ui" &&
      !name.startsWith("@radix-ui/"),
    `check 5: ${name} is not a motion library`,
  );
}
assert.equal(sha(read("package-lock.json")), LOCKFILE_SHA_6085A38, "check 5: lockfile sha256 equals 6085a38");

// --- 6. Chart, Today, and sky details ---
for (const [rel, hash] of Object.entries(FROZEN_6085A38)) {
  assert.equal(sha(read(rel)), hash, `check 6: ${rel} equals 6085a38`);
}
assert.equal(
  sha(read("src/components/ChartDeepDive.tsx")),
  CHART_DEEP_DIVE_SHA_ABD12A94,
  "check 6: ChartDeepDive.tsx is #170 Core order plus the joining-gate block",
);

assert.match(
  read("package.json"),
  /"assert:one-disclosure-pattern": "npx tsx scripts\/assert-one-disclosure-pattern\.mjs"/,
);

console.log("assert-one-disclosure-pattern: ok");
