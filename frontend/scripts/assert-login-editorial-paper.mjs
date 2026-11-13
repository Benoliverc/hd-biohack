/**
 * Login editorial-paper theme — source ACs (FE).
 * Run: npx tsx scripts/assert-login-editorial-paper.mjs
 *
 * Visual-only theme on /login: typographic lockup, growth hairline,
 * typographic underline tabs, flatter card, login-scoped paper grain,
 * no radial wash, quieter pillars. Inter and Linen tokens only.
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const pkg = read("package.json");
const page = read("src/app/login/page.tsx");
const css = read("src/app/login/login-editorial-paper.css");
const globals = read("src/app/globals.css");
const layout = read("src/app/layout.tsx");
const firstPassAssert = read("scripts/assert-login-page-first-pass.mjs");

assert.ok(
  pkg.includes('"assert:login-editorial-paper": "npx tsx scripts/assert-login-editorial-paper.mjs"'),
  "package.json wires assert:login-editorial-paper",
);
assert.ok(
  pkg.includes('"assert:login-page-first-pass": "npx tsx scripts/assert-login-page-first-pass.mjs"'),
  "package.json still wires assert:login-page-first-pass",
);
assert.ok(
  page.includes('import "./login-editorial-paper.css"'),
  "login page imports login-scoped editorial-paper CSS",
);
assert.ok(existsSync(resolve(root, "public/paper-grain.png")), "paper-grain.png is in frontend/public");

// --- Mobile lockup in login-mobile-brand (below lg) ---
assert.match(page, /data-testid="login-mobile-brand"/);
const mobileStart = page.indexOf('data-testid="login-mobile-brand"');
const mobileOpen = page.lastIndexOf("<div", mobileStart);
const mobileBlock = page.slice(mobileOpen, page.indexOf("</div>", mobileStart) + 6);
assert.match(mobileBlock, /lg:hidden/);
assert.match(mobileBlock, /login-wordmark/);
assert.match(mobileBlock, /login-wordmark-rule/);
assert.match(mobileBlock, /login-wordmark-subhead type-meta/);
assert.match(mobileBlock, /t\("brand\.name"\)/);
assert.match(mobileBlock, /t\("login\.subhead"\)/);
assert.doesNotMatch(mobileBlock, /uppercase/);
assert.doesNotMatch(mobileBlock, /tracking-\[0\.14em\]/);
assert.doesNotMatch(mobileBlock, /text-xl/);
assert.doesNotMatch(mobileBlock, /text-growth/);

// Card remains first in source order on small screens; lockup sits above the card.
const cardSectionStart = page.indexOf('className="order-1 w-full max-w-md');
assert.ok(cardSectionStart > 0, "form card column is order-1");
const cardSection = page.slice(cardSectionStart, page.indexOf("</section>", cardSectionStart));
assert.match(cardSection, /data-testid="login-mobile-brand"/);
assert.match(cardSection, /lg:order-2/);
assert.ok(
  cardSection.indexOf('data-testid="login-mobile-brand"') <
    cardSection.indexOf("rounded-2xl border border-border bg-elevated"),
  "mobile lockup + subhead render above the form card",
);

const storyStart = page.indexOf('className="order-2 space-y-6 lg:order-1');
assert.ok(storyStart > 0, "story column stays order-2 on small screens, lg:order-1");
const story = page.slice(storyStart, page.indexOf("</section>", storyStart));
assert.ok(!story.includes('data-testid="login-mobile-brand"'), "pillars stay in the story column, not above the card");
assert.match(story, /pillars\.map/);

// --- Desktop / story lockup (from lg, in place of uppercase tracked brand) ---
assert.match(story, /login-story-lockup/);
assert.match(story, /login-wordmark/);
assert.match(story, /login-wordmark-rule/);
assert.match(story, /t\("brand\.name"\)/);
assert.doesNotMatch(story, /uppercase/);
assert.doesNotMatch(story, /tracking-\[0\.14em\]/);
// Headline stays after the lockup + rule; do not put only the subhead under the desktop rule.
const storyLockupAt = story.indexOf("login-story-lockup");
const headlineAt = story.indexOf('t("login.headline")');
const subheadAt = story.indexOf('t("login.subhead")');
assert.ok(storyLockupAt >= 0 && headlineAt > storyLockupAt, "headline follows the story lockup");
assert.ok(subheadAt > headlineAt, "existing headline subhead stays under the headline, not under the rule alone");
assert.match(story, /t\("login\.intro"\)/);

// 34px Inter semibold sentence-case lockup + growth hairline
function ruleBlock(src, selector) {
  const re = new RegExp(`\\${selector}\\s*\\{([\\s\\S]*?)\\n\\}`);
  const m = src.match(re);
  assert.ok(m, `${selector} rule missing`);
  return m[1];
}
const wordmark = ruleBlock(css, ".login-wordmark");
assert.match(wordmark, /font-size:\s*34px/);
assert.match(wordmark, /font-weight:\s*600/);
assert.match(wordmark, /line-height:\s*1\.2/);
assert.match(wordmark, /letter-spacing:\s*-0\.03em/);
assert.match(wordmark, /color:\s*var\(--fg\)/);

const rule = ruleBlock(css, ".login-wordmark-rule");
assert.match(rule, /height:\s*1px/);
assert.match(rule, /width:\s*100%/);
assert.match(rule, /background:\s*var\(--growth\)/);
assert.match(rule, /opacity:\s*0\.85/);

// --- Canvas: login-scoped grain, no radial wash, body::before untouched ---
assert.doesNotMatch(page, /radial-gradient/);
assert.doesNotMatch(page, /var\(--energy\)/);
assert.doesNotMatch(page, /atmosphere/);
assert.match(page, /login-paper-grain/);
assert.match(page, /bg-canvas/);

const grain = ruleBlock(css, ".login-paper-grain");
assert.match(grain, /opacity:\s*0\.08/);
assert.match(grain, /mix-blend-mode:\s*multiply/);
assert.match(grain, /paper-grain\.png/);
assert.match(grain, /background-repeat:\s*repeat/);
assert.match(grain, /background-size:\s*180px 180px/);
assert.match(grain, /pointer-events:\s*none/);

assert.doesNotMatch(globals, /paper-grain/);
assert.doesNotMatch(globals, /login-paper-grain/);
assert.match(globals, /body::before/);
const bodyBefore = globals.slice(globals.indexOf("body::before"), globals.indexOf("body > *"));
assert.match(bodyBefore, /opacity:\s*0\.02/);
assert.doesNotMatch(bodyBefore, /opacity:\s*0\.08/);

// --- Flatter card: no drop shadow ---
assert.doesNotMatch(page, /shadow-soft/);
assert.doesNotMatch(page, /shadow-sm/);
assert.doesNotMatch(page, /box-shadow/);
assert.match(page, /rounded-2xl border border-border bg-elevated p-6 sm:p-8/);

// --- Typographic underline tabs ---
assert.match(page, /role="tablist"/);
assert.match(page, /className="login-tabs"/);
assert.doesNotMatch(page, /bg-canvas\/80/);
assert.doesNotMatch(page, /rounded-xl bg-canvas/);
assert.doesNotMatch(page, /shadow-sm/);
assert.doesNotMatch(page, /bg-elevated text-fg shadow/);
assert.match(page, /data-testid="login-tab-signin"/);
assert.match(page, /data-testid="login-tab-create"/);
assert.match(page, /useState<Mode>\("signin"\)/);

const tabSignin = page.slice(
  page.indexOf('data-testid="login-tab-signin"') - 400,
  page.indexOf('data-testid="login-tab-signin"'),
);
const tabCreate = page.slice(
  page.indexOf('data-testid="login-tab-create"') - 400,
  page.indexOf('data-testid="login-tab-create"'),
);
assert.match(tabSignin, /min-h-11/);
assert.match(tabCreate, /min-h-11/);
assert.match(tabSignin, /login-tab/);
assert.match(tabCreate, /login-tab/);
assert.match(tabSignin, /login-tab-selected/);
assert.match(tabCreate, /login-tab-selected/);
assert.match(tabSignin, /text-fg-secondary hover:text-fg/);
assert.match(tabCreate, /text-fg-secondary hover:text-fg/);

const tabs = ruleBlock(css, ".login-tabs");
assert.match(tabs, /border-bottom:\s*1px solid var\(--border\)/);
assert.doesNotMatch(css, /login-tabs[\s\S]{0,200}background:\s*var\(--canvas\)/);

const selectedAfter = ruleBlock(css, ".login-tab-selected::after");
assert.match(selectedAfter, /height:\s*1\.5px/);
assert.match(selectedAfter, /background:\s*var\(--growth\)/);
assert.match(selectedAfter, /bottom:\s*-1px/);

// Forgot mode still hides the tabs (same gate as #117)
assert.match(page, /mode !== "forgot" &&/);

// --- Quieter pillars: no rounded bordered tiles, no icon wells ---
assert.doesNotMatch(page, /rounded-xl border border-border\/80 bg-elevated\/60/);
assert.doesNotMatch(page, /bg-growth\/15/);
assert.doesNotMatch(page, /h-10 w-10[^\n]*rounded-lg bg-growth/);
assert.match(page, /login-pillar/);
assert.match(page, /login-pillar-icon/);
const pillar = ruleBlock(css, ".login-pillar");
assert.match(pillar, /border-top:\s*1px solid var\(--border\)/);
assert.match(pillar, /background:\s*transparent/);
assert.match(pillar, /border-radius:\s*0/);
const pillarIcon = ruleBlock(css, ".login-pillar-icon");
assert.match(pillarIcon, /width:\s*20px/);
assert.match(pillarIcon, /height:\s*20px/);
assert.match(pillarIcon, /background:\s*transparent/);
assert.match(pillarIcon, /color:\s*var\(--growth\)/);

// --- No second typeface; no Basalt / html.dark on this page ---
const typographySurfaces = [page, css, layout];
for (const src of typographySurfaces) {
  assert.doesNotMatch(src, /Noto Serif|NotoSerif|IBM Plex|IBMPlex|Playfair|Georgia|font-serif|font-family:\s*["']serif/i);
}
assert.match(layout, /import \{ Inter \} from "next\/font\/google"/);
assert.doesNotMatch(page, /html\.dark/);
assert.doesNotMatch(page, /className=\{?["'`][^"'`]*\bdark\b/);
assert.doesNotMatch(css, /html\.dark|\.dark\s*\{/);
assert.doesNotMatch(page, /Basalt|theme toggle|theme-toggle/i);

// Editorial CSS must not retouch app-wide body::before
assert.doesNotMatch(css, /body::before\s*\{/);

// --- First-pass assert is still present and not weakened ---
assert.match(firstPassAssert, /data-testid="login-mobile-brand"/);
assert.match(firstPassAssert, /useState<Mode>\\?\("signin"\\?\)/);
assert.match(firstPassAssert, /rounded-2xl border border-border bg-elevated/);
assert.match(firstPassAssert, /username still works/);
assert.match(firstPassAssert, /assert:login-page-first-pass/);

console.log("assert-login-editorial-paper PASS");
