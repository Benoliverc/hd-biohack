/**
 * Signed-in Newsreader (local, weight 500, opsz) on page titles, the Home greeting,
 * and the Today Move sentence. Login and public routes stay Inter.
 * Run: npx tsx scripts/assert-scoped-display-serif.mjs
 *
 * Untouched surfaces stay at 6085a38. AuthGate (with the serif delta removed)
 * and globals.css (with the locked block removed) are main d06aa158.
 * package.json dependencies, devDependencies, and the lockfile stay pinned.
 * The scripts block is not pinned, so a later assert:* line can land.
 * AuthGate itself is byte-identical to tip 6cacac09.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const sha = (text) => createHash("sha256").update(text).digest("hex");

const AUTHGATE_TIP_6CACAC09 =
  "991864bb55142c3724be2b577a58c449b7f342ad3072f88391a224620b3e6a24";
const TODAY_INDICATION_6085A38 =
  "68a908ea51723fa753d3e1599949e859fbd0d436b198aed7ba43f2cb9711b8bb";

const PINS_6085A38 = {
  "src/app/layout.tsx": "62913d0a4dded828b641d0fcf5d03bb0b269051cf5d5035ab0b2e045d5df9274",
  "src/app/login/page.tsx": "854d24bc9e2161de26bbc7b667166c46034f3c9fd41e5b2adab2273ba16c0576",
  "src/app/login/login-editorial-paper.css":
    "83f3a5d00d175a56e3a4b63c1de9befef5c00ddebd2d50b6d4cb41b358640c99",
  "src/components/AppShell.tsx": "7afd199dfefa8a0250585390505d61a40cc19012bcf6775ca96d263d4d1431cc",
  "src/components/Header.tsx": "daf1194b633f7343857073129ebea7717b1d3b8a64ffd0e4d8db0936401103b2",
  "tailwind.config.ts": "20a202ad9b8457cf998112ba8efdc3e84e6e1b2b686cc1ff06ed4ac9923ad172",
  "package-lock.json": "a6a9733cf7ab81eee53471a02cd27bc06e215ca57c290afd0b9fc94cdf191324",
  "src/components/AuthGate.tsx": "f7c04fb5379b08d0e0e4732792fc5b0ae08b212373a76bea80c5010514af9e50",
  "src/app/page.tsx": "d3a5dec9bfa3e3fa983316a61e73bc81334f4f653c4a5d6f1bb60c65a24b0bd6",
  "src/app/globals.css": "d188793365b21eca60a5959822f6b361b446589eafeeb13faf31fbab72322247",
};

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function specifiers(src) {
  const code = stripComments(src);
  const specs = [];
  const re =
    /\bfrom\s+["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|import\s+["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(code))) specs.push(m[1] || m[2] || m[3]);
  return specs;
}

function walkSrc(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) walkSrc(abs, out);
    else if (/\.(tsx?|jsx?|mjs|css)$/.test(name)) out.push(abs);
  }
  return out;
}

function relFromSrc(abs) {
  return relative(join(root, "src"), abs).split(sep).join("/");
}

function isNextFont(spec) {
  return spec === "next/font" || spec.startsWith("next/font/");
}

function isDisplaySerifSpec(spec) {
  const clean = spec.split("?")[0].replace(/\.(tsx?|jsx?|mjs)$/, "");
  return clean === "@/lib/fonts/displaySerif" || clean.endsWith("/lib/fonts/displaySerif");
}

const LOCKED_FONT = `import localFont from "next/font/local";

/** Signed-in display serif. Never import from layout.tsx or app/login. */
export const displaySerif = localFont({
  src: "./Newsreader-opsz-wght500-latin.woff2",
  weight: "500",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-display",
  adjustFontFallback: "Times New Roman",
  fallback: ["Iowan Old Style", "Georgia", "Times New Roman", "serif"],
});
`;

// --- 1. Local Newsreader module and the pinned file ---
const font = read("src/lib/fonts/displaySerif.ts");
assert.equal(font, LOCKED_FONT, "check 1: displaySerif.ts is the locked next/font/local module");
assert.match(font, /from "next\/font\/local"/);
assert.doesNotMatch(font, /next\/font\/google/);
assert.doesNotMatch(font, /Source_Serif_4/);
assert.match(font, /preload:\s*false/);
assert.doesNotMatch(font, /preload:\s*true/);
assert.match(font, /variable:\s*"--font-display"/);
assert.match(font, /weight:\s*"500"/);
assert.match(font, /adjustFontFallback:\s*"Times New Roman"/);
assert.match(
  font,
  /fallback:\s*\["Iowan Old Style", "Georgia", "Times New Roman", "serif"\]/
);
const woff = readFileSync(join(root, "src/lib/fonts/Newsreader-opsz-wght500-latin.woff2"));
assert.equal(woff.length, 60724, "check 1: Newsreader woff2 is 60724 bytes");
assert.equal(
  createHash("sha256").update(woff).digest("hex"),
  "d411a65041e3042e040c79ab7d128b0707002718a72c3cdb72f4b5461376ab07",
  "check 1: Newsreader woff2 sha256"
);
const ofl = read("src/lib/fonts/OFL-Newsreader.txt");
assert.match(ofl, /SIL OPEN FONT LICENSE/, "check 1: OFL-Newsreader.txt is the SIL licence");

// --- 2. Import graph: signed-in module only ---
const srcFiles = walkSrc(join(root, "src"));
const nextFontImporters = [];
const displaySerifImporters = [];
for (const abs of srcFiles) {
  const rel = relFromSrc(abs);
  const specs = specifiers(readFileSync(abs, "utf8"));
  if (specs.some(isNextFont)) nextFontImporters.push(rel);
  if (specs.some(isDisplaySerifSpec)) displaySerifImporters.push(rel);
}
nextFontImporters.sort();
displaySerifImporters.sort();
assert.deepEqual(
  nextFontImporters,
  ["app/layout.tsx", "lib/fonts/displaySerif.ts"],
  "check 2: the only src files that import next/font are layout.tsx and displaySerif.ts"
);
assert.match(read("src/app/layout.tsx"), /import \{ Inter \} from "next\/font\/google"/);
assert.doesNotMatch(stripComments(read("src/app/layout.tsx")), /Newsreader|Source_Serif_4|displaySerif/);
assert.deepEqual(
  displaySerifImporters,
  ["components/AuthGate.tsx"],
  "check 2: the only importer of displaySerif is AuthGate.tsx"
);
const publicRels = srcFiles
  .map(relFromSrc)
  .filter(
    (rel) =>
      rel === "app/layout.tsx" ||
      rel.startsWith("app/login/") ||
      rel.startsWith("app/reset-password/") ||
      rel.startsWith("app/privacy/")
  );
for (const rel of publicRels) {
  const src = read(`src/${rel}`);
  const specs = specifiers(src);
  assert.ok(
    !specs.some(isDisplaySerifSpec),
    `check 2: ${rel} must not import displaySerif`
  );
  assert.doesNotMatch(src, /Newsreader/, `check 2: ${rel} must not mention Newsreader`);
}

// --- 3. Untouched surfaces stay at their 6085a38 bytes ---
for (const rel of [
  "src/app/layout.tsx",
  "src/app/login/page.tsx",
  "src/app/login/login-editorial-paper.css",
  "src/components/AppShell.tsx",
  "src/components/Header.tsx",
]) {
  assert.equal(sha(read(rel)), PINS_6085A38[rel], `check 3: ${rel} sha256 equals 6085a38`);
}

// --- 4. AuthGate is the tip, with both imports and the protected scope ---
const gate = read("src/components/AuthGate.tsx");
assert.equal(sha(gate), AUTHGATE_TIP_6CACAC09, "check 4: AuthGate is byte-identical to tip 6cacac09");
assert.equal(
  gate.split('import { RouteSkeleton } from "@/components/PageSkeleton";\n').length - 1,
  1,
  "check 4: RouteSkeleton import once"
);
assert.equal(
  gate.split('import { displaySerif } from "@/lib/fonts/displaySerif";\n').length - 1,
  1,
  "check 4: displaySerif import once"
);
const publicReturn = "if (isPublic) return <>{children}</>;";
const wrappedReturn =
  "return <div className={`${displaySerif.variable} display-serif-scope contents`}>{children}</div>;";
const publicAt = gate.indexOf(publicReturn);
const wrappedAt = gate.indexOf(wrappedReturn);
assert.ok(publicAt >= 0 && wrappedAt > publicAt, "check 4: public return precedes the wrapped return");
const wrappedClass = gate.slice(wrappedAt, wrappedAt + wrappedReturn.length);
assert.match(wrappedClass, /displaySerif\.variable/);
assert.match(wrappedClass, /display-serif-scope/);
assert.match(wrappedClass, /contents/);

const branches = [
  `  if (!sessionReady && !isPublic) {
    return <RouteSkeleton pathname={pathname} label={t("auth.loading")} />;
  }`,
  `  if (!isPublic && (!readSessionUserId() || !readSessionToken()) && !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-fg-muted">
        {t("auth.redirecting")}
      </div>
    );
  }`,
  `  if (signedInOnLogin || storedSessionHydrating) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-fg-muted">
        {t("auth.loading")}
      </div>
    );
  }`,
];
for (const block of branches) {
  const at = gate.indexOf(block);
  assert.ok(at >= 0 && at < publicAt, "check 4: other AuthGate branches match the merged tree");
}
const importLine = 'import { displaySerif } from "@/lib/fonts/displaySerif";\n';
assert.equal(gate.split(importLine).length - 1, 1, "check 4: one displaySerif import");
const restoredGate = gate
  .replace(importLine, "")
  .replace(
    `  ${publicReturn}\n  ${wrappedReturn}\n`,
    "  return <>{children}</>;\n"
  );
assert.equal(
  sha(restoredGate),
  PINS_6085A38["src/components/AuthGate.tsx"],
  "check 4: AuthGate outside the protected return is byte-identical to main d06aa158"
);

// --- 5. globals.css locked block; type size and weight unchanged; Tailwind untouched ---
const css = read("src/app/globals.css");
const lockedBlock = `.type-statement {
  font-size: 1.5rem; /* 24px */
  font-weight: 500;
  line-height: 1.4;
}
/* Signed-in display serif: --font-display is defined only under AuthGate's protected scope. */
.display-serif-scope .type-display,
.display-serif-scope .type-title,
.display-serif-scope .type-statement,
.display-serif-scope .display-serif {
  font-family: var(--font-display, inherit);
  font-weight: 500;
  font-synthesis-weight: none;
  font-optical-sizing: auto;
  letter-spacing: 0;
}
.display-serif-scope .type-display {
  font-size: 2.125rem; /* 34px */
  line-height: 1.15;
  letter-spacing: -0.005em;
  text-wrap: balance;
}
@media (min-width: 768px) {
  .display-serif-scope .type-display {
    font-size: 2.625rem; /* 42px */
  }
}
.display-serif-scope .type-title {
  font-size: 1.75rem; /* 28px */
  line-height: 1.2;
  text-wrap: balance;
}
.display-serif-scope .type-statement {
  font-size: 1.5rem; /* 24px */
  line-height: 1.4;
  letter-spacing: 0.003em;
  text-wrap: pretty;
}
`;
const titleRule = `.type-title {
  font-size: 1.5rem; /* 24px */
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.025em;
}
`;
const titleAt = css.indexOf(titleRule);
assert.ok(titleAt >= 0, "check 5: .type-title size and weight rule is unchanged");
assert.equal(
  css.slice(titleAt + titleRule.length, titleAt + titleRule.length + lockedBlock.length),
  lockedBlock,
  "check 5: locked serif block sits directly after .type-title"
);
assert.ok(
  css.slice(titleAt + titleRule.length + lockedBlock.length).startsWith(".type-section {"),
  "check 5: .type-section follows the locked block"
);
assert.match(
  css,
  /\.type-display \{\s*font-size: 1\.875rem; \/\* 30px \*\/\s*font-weight: 700;\s*line-height: 1\.25;\s*\}/
);
assert.doesNotMatch(css, /\.display-serif-scope\s*\{/, "display-serif-scope has no rules of its own");
assert.equal(css.split(lockedBlock).length - 1, 1, "check 5: locked block appears once");
assert.match(lockedBlock, /font-weight:\s*500/);
assert.match(lockedBlock, /font-synthesis-weight:\s*none/);
assert.equal(
  sha(css.replace(lockedBlock, "")),
  PINS_6085A38["src/app/globals.css"],
  "check 5: globals.css outside the locked block is byte-identical to main d06aa158"
);

// --- 6. Home greeting / title h1 is mb-3 type-display ---
const page = read("src/app/page.tsx");
const originalClass =
  "mb-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl md:leading-tight";
const h1 = page.match(
  /<h1\s+className="([^"]*)"\s+data-testid=\{greeting \? "home-greeting" : "home-title"\}/
);
assert.ok(h1, "check 6: greeting h1 still carries the home-greeting / home-title test id");
assert.equal(h1[1], "mb-3 type-display", "check 6: greeting h1 className is mb-3 type-display");
for (const banned of ["font-bold", "font-semibold", "text-3xl", "text-4xl", "tracking-tight", "display-serif"]) {
  assert.doesNotMatch(h1[1], new RegExp(`\\b${banned}\\b`), `check 6: greeting class has no ${banned}`);
}
const restoredPage = page.replace("mb-3 type-display", originalClass);
assert.equal(
  sha(restoredPage),
  PINS_6085A38["src/app/page.tsx"],
  "check 6: restoring the 6085a38 greeting class returns that page pin"
);

// --- 7. Today Move sentence uses type-statement ---
const todayInd = read("src/components/TodayIndication.tsx");
const actionIdx = todayInd.indexOf('data-testid="main-action-text"');
assert.ok(actionIdx > 0, "check 7: main-action-text present");
const actionOpen = todayInd.lastIndexOf("<p", actionIdx);
const actionTag = todayInd.slice(actionOpen, todayInd.indexOf(">", actionIdx) + 1);
assert.match(actionTag, /type-statement/, "check 7: main-action-text uses type-statement");
assert.match(actionTag, /text-fg/, "check 7: main-action-text keeps text-fg");
for (const banned of ["type-title", "type-display", "type-body", "font-bold", "font-semibold"]) {
  assert.doesNotMatch(actionTag, new RegExp(`\\b${banned}\\b`), `check 7: main-action-text has no ${banned}`);
}
const restoredInd = todayInd.replace(
  'className="type-statement text-fg"',
  'className="type-title text-fg"'
);
assert.equal(
  sha(restoredInd),
  TODAY_INDICATION_6085A38,
  "check 7: restoring type-title on the Move sentence returns the 6085a38 pin"
);

// --- 8. Dependencies and the lockfile are unchanged; one script line ---
// The scripts block is not hashed. Later assert:* lines must not turn this check red.
const pkg = read("package.json");
const scriptLine = '    "assert:scoped-display-serif": "npx tsx scripts/assert-scoped-display-serif.mjs",\n';
assert.equal(pkg.split(scriptLine).length - 1, 1, "check 8: one assert:scoped-display-serif script line");
const parsed = JSON.parse(pkg);
assert.equal(
  parsed.scripts["assert:scoped-display-serif"],
  "npx tsx scripts/assert-scoped-display-serif.mjs"
);
assert.deepEqual(
  parsed.dependencies,
  {
    "html-to-image": "^1.11.13",
    html2canvas: "^1.4.1",
    "lucide-react": "^1.59.0",
    next: "14.2.35",
    react: "^18",
    "react-dom": "^18",
  },
  "check 8: dependencies unchanged"
);
assert.deepEqual(
  parsed.devDependencies,
  {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    eslint: "^8",
    "eslint-config-next": "14.2.35",
    postcss: "^8",
    tailwindcss: "^3.4.1",
    typescript: "^5",
  },
  "check 8: devDependencies unchanged"
);
assert.equal(
  sha(read("package-lock.json")),
  PINS_6085A38["package-lock.json"],
  "check 8: package-lock.json unchanged"
);

// --- 9. Tailwind gains only the type-statement token ---
const tailwind = read("tailwind.config.ts");
const statementToken =
  '\n        "type-statement": ["1.5rem", { lineHeight: "1.4", fontWeight: "500" }],';
assert.equal(tailwind.split(statementToken).length - 1, 1, "check 9: one type-statement token");
assert.match(
  tailwind,
  /"type-display": \["1\.875rem", \{ lineHeight: "1\.25", fontWeight: "700" }\]/
);
assert.match(
  tailwind,
  /"type-title": \["1\.5rem", \{ lineHeight: "1\.25", fontWeight: "600", letterSpacing: "-0\.025em" }\]/
);
assert.match(tailwind, /"type-section": \["1\.125rem", \{ lineHeight: "1\.375", fontWeight: "600" }\]/);
assert.match(tailwind, /"type-body": \["1rem", \{ lineHeight: "1\.625" }\]/);
assert.match(tailwind, /"type-meta": \["0\.875rem", \{ lineHeight: "1\.5", fontWeight: "500" }\]/);
assert.match(tailwind, /"type-caption": \["0\.75rem", \{ lineHeight: "1\.5", fontWeight: "500" }\]/);
assert.match(tailwind, /"type-chip": \["0\.75rem", \{ lineHeight: "1\.5", fontWeight: "600" }\]/);
assert.equal(
  sha(tailwind.replace(statementToken, "")),
  PINS_6085A38["tailwind.config.ts"],
  "check 9: removing type-statement restores the tip tailwind pin"
);

// --- 10. No bold utility on a scoped serif role ---
function classValues(src) {
  const values = [];
  const re = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/g;
  let m;
  while ((m = re.exec(src))) values.push(m[1] || m[2] || m[3]);
  return values;
}
const role = /\b(?:type-title|type-display|type-statement|display-serif)\b/;
const bold = /\b(?:font-bold|font-semibold)\b/;
for (const abs of walkSrc(join(root, "src"))) {
  if (!/\.tsx?$/.test(abs)) continue;
  for (const value of classValues(readFileSync(abs, "utf8"))) {
    assert.ok(
      !(role.test(value) && bold.test(value)),
      `check 10: ${relFromSrc(abs)} pairs a serif role with font-bold or font-semibold: ${value}`
    );
  }
}

console.log("PASS assert-scoped-display-serif");
