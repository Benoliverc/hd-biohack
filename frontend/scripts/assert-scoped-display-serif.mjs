/**
 * Signed-in Newsreader (or Source Serif 4) on page titles and the Home greeting.
 * Login, layout, and public routes stay Inter. Run: npx tsx scripts/assert-scoped-display-serif.mjs
 *
 * Untouched surfaces stay at 6085a38. package.json, AuthGate, and globals.css
 * pins are main d06aa158 with this branch's delta removed. page.tsx is still 6085a38.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const sha = (text) => createHash("sha256").update(text).digest("hex");

const PINS_6085A38 = {
  "src/app/layout.tsx": "62913d0a4dded828b641d0fcf5d03bb0b269051cf5d5035ab0b2e045d5df9274",
  "src/app/login/page.tsx": "854d24bc9e2161de26bbc7b667166c46034f3c9fd41e5b2adab2273ba16c0576",
  "src/app/login/login-editorial-paper.css":
    "83f3a5d00d175a56e3a4b63c1de9befef5c00ddebd2d50b6d4cb41b358640c99",
  "src/components/AppShell.tsx": "7afd199dfefa8a0250585390505d61a40cc19012bcf6775ca96d263d4d1431cc",
  "src/components/Header.tsx": "daf1194b633f7343857073129ebea7717b1d3b8a64ffd0e4d8db0936401103b2",
  "tailwind.config.ts": "20a202ad9b8457cf998112ba8efdc3e84e6e1b2b686cc1ff06ed4ac9923ad172",
  "package-lock.json": "a6a9733cf7ab81eee53471a02cd27bc06e215ca57c290afd0b9fc94cdf191324",
  "package.json": "cff66e7f72372f3d5f3743b328ad9848f3939412b6df0f3637433dce4d83dee4",
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

function lockedFont(face) {
  return (
    `import { ${face} } from "next/font/google";\n\n` +
    "/** Signed-in display serif. Never import from layout.tsx or app/login. */\n" +
    `export const displaySerif = ${face}({\n` +
    `  subsets: ["latin"],\n` +
    `  style: ["normal"],\n` +
    `  display: "swap",\n` +
    `  preload: false,\n` +
    `  variable: "--font-display",\n` +
    `});\n`
  );
}

// --- 1. Display face module ---
const font = read("src/lib/fonts/displaySerif.ts");
assert.ok(
  ["Newsreader", "Source_Serif_4"].some((face) => font === lockedFont(face)),
  "check 1: displaySerif.ts imports Newsreader or Source_Serif_4 from next/font/google with preload: false, variable: \"--font-display\", subsets: [\"latin\"]"
);
assert.match(font, /preload:\s*false/);
assert.doesNotMatch(font, /preload:\s*true/);
assert.match(font, /variable:\s*"--font-display"/);
assert.match(font, /subsets:\s*\["latin"\]/);

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
  const specs = specifiers(read(`src/${rel}`));
  assert.ok(
    !specs.some(isDisplaySerifSpec),
    `check 2: ${rel} must not import displaySerif`
  );
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

// --- 4. AuthGate: public fragment, protected variable scope, other branches identical ---
const gate = read("src/components/AuthGate.tsx");
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
const lockedBlock = `/* Signed-in display serif: --font-display is defined only under AuthGate's protected scope. */
.type-display,
.type-title,
.display-serif {
  font-family: var(--font-display, inherit);
  font-optical-sizing: auto;
}
.display-serif-scope .type-title,
.display-serif-scope .display-serif {
  letter-spacing: normal;
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
assert.equal(
  sha(css.replace(lockedBlock, "")),
  PINS_6085A38["src/app/globals.css"],
  "check 5: globals.css outside the locked block is byte-identical to main d06aa158"
);
assert.equal(
  sha(read("tailwind.config.ts")),
  PINS_6085A38["tailwind.config.ts"],
  "check 5: tailwind.config.ts sha256 unchanged"
);

// --- 6. Home greeting / title h1 gains display-serif and nothing else ---
const page = read("src/app/page.tsx");
const originalClass =
  "mb-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl md:leading-tight";
const h1 = page.match(
  /<h1\s+className="([^"]*)"\s+data-testid=\{greeting \? "home-greeting" : "home-title"\}/
);
assert.ok(h1, "check 6: greeting h1 still carries the home-greeting / home-title test id");
assert.match(h1[1], /\bdisplay-serif\b/, "check 6: greeting h1 className contains display-serif");
assert.equal(
  h1[1].replace(/ display-serif$/, ""),
  originalClass,
  "check 6: greeting h1 className otherwise equals 6085a38"
);
const restoredPage = page.replace(`${originalClass} display-serif`, originalClass);
assert.equal(
  sha(restoredPage),
  PINS_6085A38["src/app/page.tsx"],
  "check 6: page.tsx is otherwise byte-identical to 6085a38"
);

// --- 7. Dependencies and the lockfile are unchanged; one new script line ---
const pkg = read("package.json");
const scriptLine = '    "assert:scoped-display-serif": "npx tsx scripts/assert-scoped-display-serif.mjs",\n';
assert.equal(pkg.split(scriptLine).length - 1, 1, "check 7: one assert:scoped-display-serif script line");
const restoredPkg = pkg.replace(scriptLine, "");
assert.equal(sha(restoredPkg), PINS_6085A38["package.json"], "check 7: package.json otherwise equals main d06aa158");
const parsed = JSON.parse(pkg);
const restoredParsed = JSON.parse(restoredPkg);
assert.equal(
  parsed.scripts["assert:scoped-display-serif"],
  "npx tsx scripts/assert-scoped-display-serif.mjs"
);
assert.deepEqual(parsed.dependencies, restoredParsed.dependencies);
assert.deepEqual(parsed.devDependencies, restoredParsed.devDependencies);
assert.equal(
  sha(read("package-lock.json")),
  PINS_6085A38["package-lock.json"],
  "check 7: package-lock.json unchanged"
);

console.log("PASS assert-scoped-display-serif");
