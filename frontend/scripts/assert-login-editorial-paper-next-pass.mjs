/**
 * Login editorial-paper next pass — source ACs (FE).
 * Run: npx tsx scripts/assert-login-editorial-paper-next-pass.mjs
 *
 * Deepens the live #118 Editorial paper login: no repeated phone story
 * lockup/subhead, Create orientation, Forgot craft, leftover English,
 * and a quiet locale switcher on /login. Does not reopen the theme.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function valueFor(src, key) {
  const re = new RegExp(`['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*(['"])([\\s\\S]*?)\\1`);
  const m = src.match(re);
  return m ? m[2] : null;
}

const pkg = read("package.json");
const page = read("src/app/login/page.tsx");
const en = read("src/lib/i18n/messages/en.ts");
const de = read("src/lib/i18n/messages/de.ts");
const es = read("src/lib/i18n/messages/es.ts");
const fr = read("src/lib/i18n/messages/fr.ts");
const nl = read("src/lib/i18n/messages/nl.ts");
const provider = read("src/lib/i18n/I18nProvider.tsx");
const types = read("src/lib/i18n/types.ts");
const header = read("src/components/Header.tsx");
const editorialAssert = read("scripts/assert-login-editorial-paper.mjs");
const firstPassAssert = read("scripts/assert-login-page-first-pass.mjs");

const catalogs = [
  { id: "en", src: en },
  { id: "de", src: de },
  { id: "es", src: es },
  { id: "fr", src: fr },
  { id: "nl", src: nl },
];

assert.ok(
  pkg.includes(
    '"assert:login-editorial-paper-next-pass": "npx tsx scripts/assert-login-editorial-paper-next-pass.mjs"',
  ),
  "package.json wires assert:login-editorial-paper-next-pass",
);
assert.ok(
  pkg.includes('"assert:login-editorial-paper": "npx tsx scripts/assert-login-editorial-paper.mjs"'),
  "package.json still wires assert:login-editorial-paper",
);
assert.ok(
  pkg.includes('"assert:login-page-first-pass": "npx tsx scripts/assert-login-page-first-pass.mjs"'),
  "package.json still wires assert:login-page-first-pass",
);

const storyStart = page.indexOf('className="order-2 space-y-6 lg:order-1');
assert.ok(storyStart > 0, "story column stays order-2 on small screens, lg:order-1");
const story = page.slice(storyStart, page.indexOf("</section>", storyStart));

const cardSectionStart = page.indexOf('className="order-1 w-full max-w-md');
assert.ok(cardSectionStart > 0, "form card column is order-1");
const cardSection = page.slice(cardSectionStart, page.indexOf("</section>", cardSectionStart));

// --- 1. Below lg: no second story lockup / rule / subhead; start at headline ---
assert.match(story, /login-story-lockup/);
const lockupOpen = story.lastIndexOf("<div", story.indexOf("login-story-lockup"));
const lockupTag = story.slice(lockupOpen, story.indexOf(">", story.indexOf("login-story-lockup")) + 1);
assert.match(lockupTag, /hidden/);
assert.match(lockupTag, /lg:block/);

const subheadOpen = story.lastIndexOf("<span", story.indexOf('t("login.subhead")'));
const subheadTag = story.slice(subheadOpen, story.indexOf(">", story.indexOf('t("login.subhead")')) + 1);
assert.match(subheadTag, /hidden/);
assert.match(subheadTag, /lg:block/);

const storyLockupAt = story.indexOf("login-story-lockup");
const headlineAt = story.indexOf('t("login.headline")');
const subheadAt = story.indexOf('t("login.subhead")');
const introAt = story.indexOf('t("login.intro")');
const pillarsAt = story.indexOf("pillars.map");
assert.ok(storyLockupAt >= 0 && headlineAt > storyLockupAt, "headline follows the story lockup");
assert.ok(subheadAt > headlineAt, "story subhead stays under the headline");
assert.ok(introAt > subheadAt, "intro follows the headline/subhead");
assert.ok(pillarsAt > introAt, "pillars follow the intro");
assert.match(story, /t\("login\.headline"\)/);
assert.match(story, /t\("login\.intro"\)/);
assert.match(story, /pillars\.map/);

// Hidden lockup must not leave a space-y gap above the below-lg headline.
const h1Open = story.lastIndexOf("<h1", headlineAt);
const h1Tag = story.slice(h1Open, story.indexOf(">", headlineAt) + 1);
assert.match(h1Tag, /max-lg:!mt-0/);

assert.match(cardSection, /data-testid="login-mobile-brand"/);
const mobileStart = page.indexOf('data-testid="login-mobile-brand"');
const mobileOpen = page.lastIndexOf("<div", mobileStart);
const mobileBlock = page.slice(mobileOpen, page.indexOf("</div>", mobileStart) + 6);
assert.match(mobileBlock, /lg:hidden/);
assert.match(mobileBlock, /login-wordmark/);
assert.match(mobileBlock, /login-wordmark-rule/);
assert.match(mobileBlock, /t\("login\.subhead"\)/);
assert.ok(
  cardSection.indexOf('data-testid="login-mobile-brand"') <
    cardSection.indexOf("rounded-2xl border border-border bg-elevated"),
  "login-mobile-brand remains above the card",
);
assert.ok(!story.includes('data-testid="login-mobile-brand"'), "mobile brand stays above the card, not in the story column");

// --- 2. From lg: one lockup, then headline, subhead, intro, pillars ---
assert.match(lockupTag, /lg:block/);
assert.match(subheadTag, /lg:block/);
assert.match(story, /login-wordmark/);
assert.match(story, /login-wordmark-rule/);
assert.match(story, /t\("brand\.name"\)/);

// --- 3. Create orientation; Sign in stays default; no length hint on Sign in ---
assert.match(page, /useState<Mode>\("signin"\)/);

const createStart = page.indexOf('{mode === "create" &&');
const createBlock = page.slice(createStart, page.indexOf('{mode === "forgot" &&'));
assert.match(createBlock, /t\("login\.hintCreate"\)/);
assert.match(createBlock, /t\("login\.passwordLengthHint"\)/);
assert.match(createBlock, /mt-5 type-body text-fg-secondary/);
assert.match(createBlock, /type-caption text-fg-secondary/);
assert.ok(
  createBlock.indexOf('t("login.hintCreate")') < createBlock.indexOf("<form"),
  "Create hint sits under the tabs, before the form",
);
assert.ok(
  createBlock.indexOf("PasswordField") < createBlock.indexOf('t("login.passwordLengthHint")'),
  "password length hint is under or directly after the Create password field",
);
assert.doesNotMatch(createBlock, /strength|meter|score|battery/i);

const signinStart = page.indexOf('{mode === "signin" &&');
const signinBlock = page.slice(signinStart, createStart);
assert.match(signinBlock, /t\("login\.hintEmail"\)/);
assert.doesNotMatch(signinBlock, /t\("login\.passwordLengthHint"\)/);
assert.doesNotMatch(signinBlock, /t\("login\.hintCreate"\)/);

assert.equal(valueFor(en, "login.hintCreate"), "Use the email you will sign in with.");
assert.equal(valueFor(en, "login.passwordLengthHint"), "At least 8 characters.");

const onCreateStart = page.indexOf("async function onCreate");
const onCreate = page.slice(onCreateStart, page.indexOf("async function onForgot"));
assert.ok(
  /if \(password\.length < 8\) \{\s*setError\(t\("login\.passwordTooShort"\)\)/.test(onCreate),
  "onCreate keeps passwordTooShort when a password is present but shorter than 8",
);

// --- 4. Forgot placeholder + 44px Back to sign in ---
const forgotStart = page.indexOf('{mode === "forgot" &&');
const forgotBlock = page.slice(forgotStart, page.indexOf("function AuthError"));
const forgotEmailAt = forgotBlock.indexOf('data-testid="forgot-email"');
assert.ok(forgotEmailAt > 0, "forgot email field is marked");
const forgotInputOpen = forgotBlock.lastIndexOf("<input", forgotEmailAt);
const forgotInputTag = forgotBlock.slice(forgotInputOpen, forgotBlock.indexOf(">", forgotEmailAt) + 1);
assert.match(forgotInputTag, /placeholder=\{t\("login\.emailPlaceholder"\)\}/);

const backAt = forgotBlock.indexOf('t("login.backToSignIn")');
assert.ok(backAt > 0, "Back to sign in is present");
const backOpen = forgotBlock.lastIndexOf("<button", backAt);
const backTag = forgotBlock.slice(backOpen, forgotBlock.indexOf(">", backAt) + 1);
assert.match(backTag, /min-h-11/);
assert.match(backTag, /type-body/);
assert.match(backTag, /text-fg-secondary/);
assert.match(backTag, /inline-flex|items-center/);
assert.match(backTag, /type="button"/);
assert.ok(forgotBlock.includes('setMode("signin")'), "Back returns to Sign in");
assert.ok(forgotBlock.includes("setInfo(null)"), "Back clears info");
assert.ok(forgotBlock.includes("setError(null)"), "Back clears error");

// --- 5. Leftover English translated; new keys in all catalogs; unused hint stays unused ---
const leftoverKeys = [
  "login.createAccount",
  "login.creating",
  "login.firstNameOptional",
  "login.forgotPassword",
  "login.forgotHint",
  "login.sendResetLink",
  "login.backToSignIn",
  "login.genericAuthError",
  "login.passwordTooShort",
  "login.resetSent",
  "login.supportPrefix",
  "login.email",
  "privacy.link",
];
const newKeys = ["login.hintCreate", "login.passwordLengthHint"];

for (const { id, src } of catalogs) {
  for (const key of [...leftoverKeys, ...newKeys]) {
    const val = valueFor(src, key);
    assert.ok(val && val.length > 0, `${id} missing ${key}`);
  }
  assert.ok(valueFor(src, "login.hint"), `${id} keeps unused login.hint`);
  assert.equal(valueFor(src, "login.emailPlaceholder"), "you@example.com", `${id} email placeholder stays you@example.com`);
  assert.equal(valueFor(src, "brand.name"), "Baseline", `${id} brand.name stays Baseline`);
}

for (const { id, src } of catalogs) {
  if (id === "en") continue;
  for (const key of [...leftoverKeys, ...newKeys]) {
    const val = valueFor(src, key);
    assert.notEqual(val, valueFor(en, key), `${id} ${key} still equals EN`);
  }
}

assert.doesNotMatch(page, /t\("login\.hint"\)/);
assert.ok(
  en.includes("'login.genericAuthError': 'Email or password didn\\'t work. Try again.'"),
  "English login.genericAuthError is unchanged (ASCII apostrophe)",
);

// --- 6. Compact locale switcher on /login; no browser-language auto-detect ---
assert.match(page, /data-testid="login-locale"/);
assert.ok(
  cardSection.indexOf('data-testid="login-privacy-footer"') <
    cardSection.indexOf('data-testid="login-locale"'),
  "locale switcher sits under the privacy footer",
);
assert.match(page, /setLocale/);
assert.match(page, /locales\.map/);
assert.match(page, /labels\[code\]/);
assert.match(page, /const \{ t, locale, setLocale, locales, labels \} = useI18n\(\)/);

const localeStart = page.indexOf('data-testid="login-locale"');
const localeOpen = page.lastIndexOf("<div", localeStart);
const localeBlock = page.slice(localeOpen, page.indexOf("</div>", localeStart) + 6);
assert.match(localeBlock, /min-h-11/);
assert.match(localeBlock, /text-fg-secondary/);
assert.match(localeBlock, /onClick=\{\(\) => setLocale\(code\)\}/);
assert.doesNotMatch(localeBlock, /flag|🏳️|🇺🇸|🇩🇪|🇪🇸|🇫🇷|🇳🇱/i);
assert.doesNotMatch(page, /navigator\.language/);
assert.doesNotMatch(page, /navigator\.languages/);
assert.doesNotMatch(page, /preferred_locale/);
assert.match(types, /"en", "nl", "de", "fr", "es"/);
assert.match(provider, /hd-biohack:preferred-locale/);
assert.match(provider, /const setLocale = useCallback/);
assert.ok(
  header.includes('if (pathname === "/login" || pathname === "/reset-password") return null;'),
  "Header stays hidden on exact /login and /reset-password",
);

// Prior login asserts remain present and unweakened
assert.match(editorialAssert, /login-story-lockup/);
assert.match(editorialAssert, /useState<Mode>\\?\("signin"\\?\)/);
assert.match(firstPassAssert, /data-testid="login-mobile-brand"/);
assert.match(firstPassAssert, /useState<Mode>\\?\("signin"\\?\)/);

console.log("assert-login-editorial-paper-next-pass PASS");
