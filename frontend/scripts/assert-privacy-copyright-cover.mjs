/**
 * Source-level ACs: subtle Privacy page + copyright cover.
 * Run: npx tsx frontend/scripts/assert-privacy-copyright-cover.mjs
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

function srcIncludesKey(src, key) {
  return src.includes(`'${key}'`) || src.includes(`"${key}"`);
}

const authGate = read("src/components/AuthGate.tsx");
const privacy = read("src/app/privacy/page.tsx");
const login = read("src/app/login/page.tsx");
const settings = read("src/app/settings/page.tsx");
const en = read("src/lib/i18n/messages/en.ts");
const locales = ["en", "nl", "de", "fr", "es"].map((l) => [
  l,
  read(`src/lib/i18n/messages/${l}.ts`),
]);

// AuthGate public allowlist
if (!/PUBLIC_PATHS[\s\S]*"\/privacy"/.test(authGate) && !authGate.includes('"/privacy"')) {
  fail("AuthGate must allowlist /privacy");
}
if (!authGate.includes('"/login"') || !authGate.includes('"/reset-password"')) {
  fail("AuthGate must keep /login and /reset-password public");
}

// Privacy page structure + locked copy wiring
if (!/data-testid="privacy-page"/.test(privacy)) fail("privacy page missing privacy-page testid");
if (!/t\("privacy\.title"\)/.test(privacy)) fail("privacy page must use privacy.title");
if (!/t\("privacy\.intro"\)/.test(privacy)) fail("privacy page must use privacy.intro");
for (const k of ["store", "use", "emails", "choices"]) {
  if (!privacy.includes(`privacy.${k}Title`) || !privacy.includes(`privacy.${k}Body`)) {
    fail(`privacy page missing ${k} section keys`);
  }
}
if (!/t\("privacy\.hdNote"\)/.test(privacy)) fail("privacy page must use privacy.hdNote");
if (!/t\("privacy\.copyright"\)/.test(privacy)) fail("privacy page must use privacy.copyright");
if (!/t\("home\.trust\.disclaimer"\)/.test(privacy)) {
  fail("privacy page must reuse home.trust.disclaimer (no new medical claim)");
}
// No hero / urgency patterns
if (/hero|urgent|must accept|agree to/i.test(privacy)) {
  fail("privacy page must stay calm — no hero/urgency/consent copy");
}

// Login quiet footer under card
if (!/data-testid="login-privacy-footer"/.test(login)) fail("login missing privacy footer");
if (!/href="\/privacy"/.test(login)) fail("login Privacy link must go to /privacy");
if (!/t\("privacy\.link"\)/.test(login)) fail("login must use privacy.link");
if (!/t\("privacy\.copyrightShort"\)/.test(login)) fail("login must use privacy.copyrightShort");

// Settings quiet Privacy footer (account controls live in settings-account)
if (!/data-testid="settings-privacy-footer"/.test(settings)) fail("settings missing privacy footer");
if (!/href="\/privacy"/.test(settings)) fail("settings Privacy link must go to /privacy");
if (!/t\("privacy\.link"\)/.test(settings)) fail("settings must use privacy.link");
if (!/t\("privacy\.copyrightShort"\)/.test(settings)) fail("settings must use privacy.copyrightShort");

const locked = {
  "privacy.link": "Privacy",
  "privacy.title": "Privacy",
  "privacy.intro":
    "Baseline keeps this short. Here is what we store and how we use it during beta.",
  "privacy.storeTitle": "What we store",
  "privacy.storeBody":
    "Account email, optional first name, password hash (we never store your plain password), signed-in session tokens, natal chart details you save, and app usage needed to run Today, Protocols, Chart, and Soul.",
  "privacy.useTitle": "How we use it",
  "privacy.useBody":
    "We use this data to run your account and the features you open. We do not sell your personal data.",
  "privacy.emailsTitle": "Emails",
  "privacy.emailsBody":
    "Password-reset mail is sent only when you ask for a reset. Support stays at baselineapp@proton.me.",
  "privacy.choicesTitle": "Your choices",
  "privacy.choicesBody":
    "You can sign out anytime. You can change your password or permanently delete your account in Settings. For other help, email baselineapp@proton.me.",
  "privacy.hdNote":
    "Human Design® is a registered system belonging to its owners. Baseline is an independent informational app and is not affiliated with or endorsed by those owners.",
  "privacy.copyright": "© 2026 Baseline. All rights reserved.",
  "privacy.copyrightShort": "© 2026 Baseline",
};

for (const [key, value] of Object.entries(locked)) {
  if (!srcIncludesKey(en, key)) fail(`en missing ${key}`);
  // Exact locked EN string present
  if (!en.includes(value)) fail(`en ${key} must match locked copy`);
}

// privacy.link: locked leftover-English fix on /login (editorial-paper next pass).
// English stays "Privacy"; de/es/fr/nl must be real translations, not EN verbatim.
const TRANSLATED_PRIVACY_KEYS = new Set(["privacy.choicesBody", "privacy.link"]);
const OLD_CHOICES_BODY =
  "You can sign out anytime. Account deletion is not in the app yet — email baselineapp@proton.me if you need help with that.";

function valueFor(src, key) {
  const re = new RegExp(`['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*(['"])([\\s\\S]*?)\\1`);
  const m = src.match(re);
  return m ? m[2] : null;
}

for (const [name, src] of locales) {
  for (const key of Object.keys(locked)) {
    if (!srcIncludesKey(src, key)) fail(`${name} missing ${key}`);
  }
  if (name === "en") continue;
  for (const [key, value] of Object.entries(locked)) {
    const got = valueFor(src, key);
    if (got == null || !got.trim()) fail(`${name} ${key} is missing a value`);
    if (TRANSLATED_PRIVACY_KEYS.has(key)) {
      if (got === value) fail(`${name} ${key} must be a real translation, not EN verbatim`);
      if (got === OLD_CHOICES_BODY) fail(`${name} ${key} must not keep the old sentence`);
    } else if (got !== value) {
      fail(`${name} ${key} must be EN verbatim`);
    }
  }
}

console.log("assert-privacy-copyright-cover PASS");
