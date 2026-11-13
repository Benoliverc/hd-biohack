/**
 * Login page first pass — source ACs (FE).
 * Run: npx tsx scripts/assert-login-page-first-pass.mjs
 *
 * Fold, honest identifiers/errors, quieter chrome, /login-only contrast
 * and 44px targets, and meaning-first Chart/Protocols/Soul copy.
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
const header = read("src/components/Header.tsx");
const locales = ["en", "de", "es", "fr", "nl"].map((id) => ({
  id,
  src: read(`src/lib/i18n/messages/${id}.ts`),
}));
const en = locales[0].src;

assert.ok(
  pkg.includes('"assert:login-page-first-pass": "npx tsx scripts/assert-login-page-first-pass.mjs"'),
  "package.json wires assert:login-page-first-pass",
);

// --- 1. First-visit fold on a phone ---
assert.match(page, /data-testid="login-mobile-brand"/);
const mobileStart = page.indexOf('data-testid="login-mobile-brand"');
const mobileOpen = page.lastIndexOf("<div", mobileStart);
const mobileBlock = page.slice(mobileOpen, page.indexOf("</div>", mobileStart) + 6);
assert.match(mobileBlock, /lg:hidden/);
assert.match(mobileBlock, /t\("brand\.name"\)/);
assert.match(mobileBlock, /t\("login\.subhead"\)/);

const cardSectionStart = page.indexOf('className="order-1 w-full max-w-md');
assert.ok(cardSectionStart > 0, "form card column is order-1");
const cardSection = page.slice(cardSectionStart, page.indexOf("</section>", cardSectionStart));
assert.match(cardSection, /data-testid="login-mobile-brand"/);
assert.match(cardSection, /lg:order-2/);
assert.ok(
  cardSection.indexOf('data-testid="login-mobile-brand"') < cardSection.indexOf('rounded-2xl border border-border bg-elevated'),
  "mobile wordmark + subhead render above the form card",
);

const storyStart = page.indexOf('className="order-2 space-y-6 lg:order-1');
assert.ok(storyStart > 0, "story column stays order-2 on small screens, lg:order-1");
const story = page.slice(storyStart, page.indexOf("</section>", storyStart));
assert.match(story, /t\("login\.headline"\)/);
assert.match(story, /t\("login\.subhead"\)/);
assert.match(story, /t\("login\.intro"\)/);
assert.match(story, /pillars\.map/);
assert.ok(!story.includes('data-testid="login-mobile-brand"'), "pillars stay in the story column, not above the card");
assert.match(page, /t\("login\.pillar\.chart\.title"\)/);
assert.match(page, /t\("login\.pillar\.today\.title"\)/);
assert.match(page, /t\("login\.pillar\.protocols\.title"\)/);
assert.match(page, /t\("login\.pillar\.soul\.title"\)/);
assert.match(page, /t\("login\.pillar\.chart\.body"\)/);
assert.match(page, /t\("login\.pillar\.today\.body"\)/);
assert.match(page, /t\("login\.pillar\.protocols\.body"\)/);
assert.match(page, /t\("login\.pillar\.soul\.body"\)/);
assert.match(page, /lg:grid-cols-2/);

// --- Default Sign in; no first-visit detection; Header hidden on /login ---
assert.match(page, /useState<Mode>\("signin"\)/);
assert.doesNotMatch(page, /firstVisit|first-visit|isFirstVisit|localStorage|sessionStorage/);
assert.ok(
  header.includes('if (pathname === "/login" || pathname === "/reset-password") return null;'),
  "Header stays hidden on exact /login and /reset-password",
);

// --- 2. Honest identifiers ---
assert.match(page, /t\("login\.email"\)/);
assert.equal(valueFor(en, "login.email"), "Email");
assert.match(page, /placeholder=\{t\("login\.emailPlaceholder"\)\}/);
assert.equal(valueFor(en, "login.emailPlaceholder"), "you@example.com");
assert.match(page, /autoComplete="username"/);
assert.doesNotMatch(page, /t\("login\.username"\)/);
assert.doesNotMatch(page, /t\("login\.hint"\)/);
assert.doesNotMatch(page, /username still works/i);
assert.doesNotMatch(page, /Enter a username/);

const renderedKeys = [
  "login.hintEmail",
  "login.missingCreds",
  "login.missingCreateFields",
  "login.missingForgotEmail",
  "login.betaNote",
  "login.intro",
  "login.pillar.chart.body",
  "login.pillar.protocols.body",
  "login.pillar.soul.body",
  "login.pillar.today.body",
  "login.genericAuthError",
  "login.passwordTooShort",
  "login.forgotHint",
  "login.resetSent",
  "login.email",
  "login.emailPlaceholder",
  "login.subhead",
  "brand.name",
];
for (const { id, src } of locales) {
  for (const key of renderedKeys) {
    const val = valueFor(src, key);
    assert.ok(val && val.length > 0, `${id} missing rendered key ${key}`);
    const lower = val.toLowerCase();
    assert.ok(!lower.includes("username still works"), `${id} ${key} mentions username still works`);
    if (key !== "login.genericAuthError") {
      // leftover unused keys may mention username; rendered ones must not ask for one
      assert.ok(!/enter a username/i.test(val), `${id} ${key} says Enter a username`);
    }
  }
}

const lockedEn = {
  "login.hintEmail": "Use the email on your account.",
  "login.missingCreds": "Enter an email and password.",
  "login.missingCreateFields": "Enter an email and a password of at least 8 characters.",
  "login.missingForgotEmail": "Enter the email on your account.",
  "login.betaNote":
    "Baseline is in beta. During beta, you have temporary full access \u2014 including Protocols and Soul.",
  "login.intro":
    "Calculate your natal chart, see what the sky is doing today, and get grounded protocols \u2014 no mysticism, just next steps.",
  "login.pillar.chart.body":
    "Your natal design, in plain language \u2014 how your energy typically works.",
  "login.pillar.protocols.body":
    "A checkable morning, midday, and evening list, preferring what you already own.",
  "login.pillar.soul.body":
    "How you connect with someone you\u2019ve charted, in one short reading.",
};
for (const [key, expected] of Object.entries(lockedEn)) {
  assert.equal(valueFor(en, key), expected, `EN ${key}`);
}
assert.equal(
  valueFor(en, "login.pillar.today.body"),
  "What the sky is lighting up now, in plain language you can act on.",
  "Today pillar body stays unchanged",
);
assert.ok(
  !valueFor(en, "login.betaNote").includes("People"),
  "beta note has no People clause",
);

const translateKeys = Object.keys(lockedEn);
for (const { id, src } of locales) {
  for (const key of translateKeys) {
    const val = valueFor(src, key);
    assert.ok(val && val.length > 0, `${id} missing ${key}`);
    if (id !== "en") {
      assert.notEqual(val, valueFor(en, key), `${id} ${key} still equals EN`);
      assert.ok(!val.includes("People"), `${id} ${key} must not reintroduce People`);
    }
  }
}

// typographic apostrophe / em dash where locked
assert.ok(valueFor(en, "login.pillar.soul.body").includes("\u2019"), "soul body uses U+2019");
assert.ok(valueFor(en, "login.intro").includes("\u2014"), "intro uses em dash");
assert.ok(valueFor(en, "login.pillar.chart.body").includes("\u2014"), "chart body uses em dash");
assert.ok(valueFor(en, "login.betaNote").includes("\u2014"), "beta note uses em dash");

// --- Missing-fields vs generic auth ---
const onCreateStart = page.indexOf("async function onCreate");
const onCreate = page.slice(onCreateStart, page.indexOf("async function onForgot"));
assert.match(onCreate, /t\("login\.missingCreateFields"\)/);
assert.match(onCreate, /t\("login\.passwordTooShort"\)/);
assert.ok(
  /if \(!em \|\| !password\) \{\s*setError\(t\("login\.missingCreateFields"\)\)/.test(onCreate),
  "onCreate uses missing-fields for empty required fields",
);
assert.ok(
  /if \(password\.length < 8\) \{\s*setError\(t\("login\.passwordTooShort"\)\)/.test(onCreate),
  "onCreate keeps passwordTooShort when a password is present but shorter than 8",
);
assert.equal((onCreate.match(/t\("login\.genericAuthError"\)/g) || []).length, 1, "onCreate genericAuthError only after a real submit");
assert.ok(onCreate.includes("} catch {"), "onCreate catch remains");
assert.ok(
  onCreate.indexOf('t("login.genericAuthError")') > onCreate.indexOf("} catch {"),
  "onCreate genericAuthError is in the catch, not empty-field validation",
);

const onForgotStart = page.indexOf("async function onForgot");
const onForgot = page.slice(onForgotStart, page.indexOf("const betaNote"));
assert.ok(
  /if \(!em\) \{\s*setError\(t\("login\.missingForgotEmail"\)\)/.test(onForgot),
  "onForgot uses missing-fields for an empty email",
);
assert.doesNotMatch(onForgot, /t\("login\.genericAuthError"\)/);
assert.match(onForgot, /t\("login\.resetSent"\)/);

const onSignIn = page.slice(page.indexOf("async function onSignIn"), onCreateStart);
assert.match(onSignIn, /t\("login\.missingCreds"\)/);
assert.ok(
  onSignIn.indexOf('t("login.genericAuthError")') > onSignIn.indexOf("} catch {"),
  "onSignIn genericAuthError is in the catch",
);

assert.ok(
  en.includes("'login.genericAuthError': 'Email or password didn\\'t work. Try again.'"),
  "login.genericAuthError stays the generic failed-auth sentence",
);
assert.equal(valueFor(en, "login.passwordTooShort"), "Password must be at least 8 characters.");
assert.equal(valueFor(en, "login.resetSent"), "If that email is on Baseline, we sent a reset link.");
assert.equal(
  valueFor(en, "login.forgotHint"),
  "We\u2019ll email a one-time link if that address is on Baseline.",
);

// --- 3. Quieter card chrome ---
assert.doesNotMatch(page, /t\("login\.betaCreateHint"\)/);
assert.doesNotMatch(page, /t\("login\.alreadyHaveAccount"\)/);
assert.doesNotMatch(page, /create-switch-signin/);

const signinStart = page.indexOf('{mode === "signin" &&');
const signinBlock = page.slice(signinStart, page.indexOf('{mode === "create" &&'));
assert.doesNotMatch(signinBlock, /<h2/);
assert.match(signinBlock, /\{betaNote\}/);
assert.equal((signinBlock.match(/\{betaNote\}/g) || []).length, 1, "beta note once on Sign in");

const createStart = page.indexOf('{mode === "create" &&');
const createBlock = page.slice(createStart, page.indexOf('{mode === "forgot" &&'));
assert.doesNotMatch(createBlock, /<h2/);
assert.match(createBlock, /\{betaNote\}/);
assert.equal((createBlock.match(/\{betaNote\}/g) || []).length, 1, "beta note once on Create");

const forgotStart = page.indexOf('{mode === "forgot" &&');
const forgotBlock = page.slice(forgotStart, page.indexOf("function AuthError"));
assert.match(forgotBlock, /<h2[^>]*>\{t\("login\.forgotPassword"\)\}<\/h2>/);
assert.match(forgotBlock, /t\("login\.backToSignIn"\)/);
assert.doesNotMatch(forgotBlock, /\{betaNote\}/);

assert.match(page, /data-testid="login-tab-signin"/);
assert.match(page, /data-testid="login-tab-create"/);
assert.match(page, /data-testid="login-beta-note"/);
assert.match(page, /t\("login\.betaNote"\)/);

// unused keys may remain in catalogs
for (const { id, src } of locales) {
  assert.ok(valueFor(src, "login.betaCreateHint"), `${id} may keep unused login.betaCreateHint`);
  assert.ok(valueFor(src, "login.alreadyHaveAccount"), `${id} may keep unused login.alreadyHaveAccount`);
  assert.ok(valueFor(src, "login.hint"), `${id} may keep unused login.hint`);
}

// --- 5. Contrast and 44px on this page only ---
const tabSignin = page.slice(page.indexOf('data-testid="login-tab-signin"') - 400, page.indexOf('data-testid="login-tab-signin"'));
const tabCreate = page.slice(page.indexOf('data-testid="login-tab-create"') - 400, page.indexOf('data-testid="login-tab-create"'));
assert.match(tabSignin, /min-h-11/);
assert.match(tabCreate, /min-h-11/);
assert.doesNotMatch(tabSignin, /min-h-10/);
assert.doesNotMatch(tabCreate, /min-h-10/);
assert.match(tabSignin, /text-fg-secondary hover:text-fg/);
assert.match(tabCreate, /text-fg-secondary hover:text-fg/);

const eyeStart = page.indexOf('data-testid="login-password-eye"');
assert.ok(eyeStart > 0, "password eye is marked");
const eyeOpen = page.lastIndexOf("<button", eyeStart);
const eyeBlock = page.slice(eyeOpen, page.indexOf("</button>", eyeStart) + 9);
assert.match(eyeBlock, /h-11 w-11|min-h-11 min-w-11/);
assert.doesNotMatch(eyeBlock, /h-10 w-10/);
assert.doesNotMatch(eyeBlock, /tabIndex=\{-1\}/);
assert.match(eyeBlock, /text-fg-secondary/);
assert.doesNotMatch(page, /tabIndex=\{-1\}/);

const forgotLinkStart = page.indexOf('data-testid="login-forgot-link"');
const forgotLinkOpen = page.lastIndexOf("<button", forgotLinkStart);
const forgotLink = page.slice(forgotLinkOpen, page.indexOf("</button>", forgotLinkStart) + 9);
assert.match(forgotLink, /min-h-11/);

assert.match(page, /t\("login\.hintEmail"\)/);
assert.match(signinBlock, /type-body text-fg-secondary/);
assert.match(story, /type-body text-fg-secondary/);
assert.match(page, /className="mt-4 type-caption text-fg-secondary"/);
const privacyOpen = page.lastIndexOf("<p", page.indexOf('data-testid="login-privacy-footer"'));
const privacyTag = page.slice(privacyOpen, page.indexOf(">", page.indexOf('data-testid="login-privacy-footer"')) + 1);
assert.match(privacyTag, /type-caption text-fg-secondary/);

const mutedHits = [...page.matchAll(/(placeholder:)?text-fg-muted/g)].map((m) => m[0]);
assert.ok(
  mutedHits.length > 0 && mutedHits.every((h) => h === "placeholder:text-fg-muted"),
  `body-like copy must not use text-fg-muted (got ${mutedHits.join(", ") || "none"})`,
);

// primary fields and submit stay 48px
function tagAround(testId) {
  const at = page.indexOf(`data-testid="${testId}"`);
  assert.ok(at > 0, `${testId} missing`);
  const open = Math.max(page.lastIndexOf("<button", at), page.lastIndexOf("<input", at));
  return page.slice(open, page.indexOf(">", at) + 1);
}
assert.match(tagAround("login-submit"), /min-h-12/);
assert.match(tagAround("create-submit"), /min-h-12/);
assert.match(tagAround("forgot-submit"), /min-h-12/);
assert.match(tagAround("login-username"), /min-h-12/);

// --- Leave-alone landings ---
assert.match(page, /router\.replace\("\/profile"\)/);
assert.match(page, /postSignInPath/);
assert.doesNotMatch(page, /Today'?s Move|todaysMove|kit pick|sample chart/i);
assert.doesNotMatch(page, /locale control|settings-lang-select|preferred_locale/);

console.log("assert-login-page-first-pass PASS");
