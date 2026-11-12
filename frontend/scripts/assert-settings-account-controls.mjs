/**
 * Source-level ACs: Settings account controls (change password + in-app delete).
 * Run: npx tsx scripts/assert-settings-account-controls.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function srcIncludesKey(src, key) {
  return src.includes(`'${key}'`) || src.includes(`"${key}"`);
}

function valueFor(src, key) {
  const re = new RegExp(`['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*(['"])([\\s\\S]*?)\\1`);
  const m = src.match(re);
  return m ? m[2] : null;
}

function hexToRgb(hex) {
  const h = hex.replace("#", "").trim();
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function channel(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
function contrastRatio(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}
function themeTokens(src, marker) {
  const i = src.indexOf(marker);
  assert.ok(i >= 0, `globals.css has ${marker}`);
  const block = src.slice(i, src.indexOf("}", i));
  const grab = (name) => {
    const m = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
    assert.ok(m, `${marker} defines --${name}`);
    return m[1];
  };
  return {
    elevated: grab("elevated"),
    fg: grab("fg"),
    fgSecondary: grab("fg-secondary"),
    fgMuted: grab("fg-muted"),
    danger: grab("danger"),
    growth: grab("growth"),
  };
}

const settings = read("src/app/settings/page.tsx");
assert.ok(existsSync(resolve(root, "src/app/settings/password/page.tsx")), "password route file exists");
assert.ok(existsSync(resolve(root, "src/app/settings/delete-account/page.tsx")), "delete-account route file exists");
const passwordPage = read("src/app/settings/password/page.tsx");
const deletePage = read("src/app/settings/delete-account/page.tsx");
const api = read("src/lib/api.ts");
const authGate = read("src/components/AuthGate.tsx");
const pkg = read("package.json");
const css = read("src/app/globals.css");
const en = read("src/lib/i18n/messages/en.ts");
const locales = ["en", "nl", "de", "fr", "es"].map((l) => [
  l,
  read(`src/lib/i18n/messages/${l}.ts`),
]);

assert.match(
  pkg,
  /"assert:settings-account-controls": "npx tsx scripts\/assert-settings-account-controls.mjs"/,
  "package.json wires assert:settings-account-controls",
);

assert.match(settings, /data-testid="settings-account"/, "Account section testid");
assert.match(
  settings,
  /rounded-2xl border border-border bg-elevated p-5 shadow-soft/,
  "Account section uses the elevated card pattern",
);
assert.doesNotMatch(
  settings,
  /data-testid="settings-footer-account"/,
  "muted settings-footer-account strip must be removed",
);
assert.doesNotMatch(
  en,
  /settings\.footerAccount/,
  "settings.footerAccount must be retired from the EN catalog",
);
assert.match(settings, /data-testid="settings-privacy-footer"/, "Privacy footer remains");
assert.match(settings, /data-testid="settings-first-name"/, "first name section stays");
assert.match(settings, /data-testid="settings-language"/, "language section stays");
assert.match(settings, /data-testid="settings-timezone"/, "timezone section stays");

assert.match(passwordPage, /data-testid="settings-password-page"/, "password page root testid");
assert.match(deletePage, /data-testid="settings-delete-page"/, "delete page root testid");

for (const testId of [
  "settings-change-password",
  "settings-change-password-current",
  "settings-delete-account",
  "settings-delete-email",
  "settings-delete-submit",
]) {
  assert.doesNotMatch(
    settings,
    new RegExp(`data-testid="${testId}"`),
    `settings/page.tsx must not keep form testid ${testId}`,
  );
}

function controlChunk(src, testId) {
  const i = src.indexOf(`data-testid="${testId}"`);
  assert.ok(i >= 0, `${testId} present`);
  const start = src.lastIndexOf("<", i);
  const endTag = src.indexOf(">", src.indexOf("className", i));
  return src.slice(start, endTag + 1);
}

const changeLink = controlChunk(settings, "settings-change-password-link");
assert.match(changeLink, /href="\/settings\/password"/, "change-password row goes to /settings/password");
assert.match(changeLink, /min-h-11/, "change-password row is min-h-11");
assert.match(changeLink, /text-fg/, "change-password row uses text-fg");
assert.doesNotMatch(changeLink, /text-fg-secondary|text-fg-muted/, "change-password row is not muted or secondary");

const deleteLink = controlChunk(settings, "settings-delete-account-link");
assert.match(deleteLink, /href="\/settings\/delete-account"/, "delete row goes to /settings/delete-account");
assert.match(deleteLink, /min-h-11/, "delete row is min-h-11");
assert.match(deleteLink, /text-danger/, "delete row uses text-danger");
assert.doesNotMatch(
  deleteLink,
  /(?:^|[\s"'`])bg-danger(?:[\s"'`]|$)/,
  "delete row must not use solid bg-danger",
);
assert.doesNotMatch(deleteLink, /text-white|text-fg-inverse/, "delete row must not use white / inverse on danger fill");

assert.match(passwordPage, /data-testid="settings-change-password"/, "change-password form");
assert.match(passwordPage, /data-testid="settings-change-password-current"/, "current password field");
assert.match(passwordPage, /data-testid="settings-change-password-new"/, "new password field");
assert.match(passwordPage, /data-testid="settings-change-password-confirm"/, "confirm password field");
assert.match(passwordPage, /data-testid="settings-change-password-submit"/, "change-password submit");
assert.match(deletePage, /data-testid="settings-delete-account"/, "delete-account block");
assert.match(deletePage, /data-testid="settings-delete-help"/, "delete help");
assert.match(deletePage, /data-testid="settings-delete-email"/, "delete email confirm field");
assert.match(deletePage, /data-testid="settings-delete-password"/, "delete password field");
assert.match(deletePage, /data-testid="settings-delete-submit"/, "delete submit");

for (const [src, testId] of [
  [passwordPage, "settings-change-password-current"],
  [passwordPage, "settings-change-password-new"],
  [passwordPage, "settings-change-password-confirm"],
  [passwordPage, "settings-change-password-submit"],
  [deletePage, "settings-delete-email"],
  [deletePage, "settings-delete-password"],
  [deletePage, "settings-delete-submit"],
]) {
  const chunk = controlChunk(src, testId);
  assert.match(chunk, /min-h-11/, `${testId} must be min-h-11`);
}

const currentChunk = controlChunk(passwordPage, "settings-change-password-current");
assert.match(currentChunk, /type=\{showCurrentPassword \? "text" : "password"\}|type="password"/);
assert.match(currentChunk, /autoComplete="current-password"/);
const newChunk = controlChunk(passwordPage, "settings-change-password-new");
assert.match(newChunk, /autoComplete="new-password"/);
const confirmChunk = controlChunk(passwordPage, "settings-change-password-confirm");
assert.match(confirmChunk, /autoComplete="new-password"/);

const deleteEmailIdx = deletePage.indexOf('data-testid="settings-delete-email"');
const deleteEmailValue = deletePage.slice(deletePage.lastIndexOf("<input", deleteEmailIdx), deletePage.indexOf("/>", deleteEmailIdx) + 2);
assert.doesNotMatch(deleteEmailValue, /value=\{user\.email\}/, "confirmation email must not be pre-filled");
assert.match(deleteEmailValue, /value=\{deleteEmail\}/, "confirmation email is typed");

function elevatedCard(src, label) {
  const classIdx = src.indexOf("rounded-2xl border border-border bg-elevated p-5 shadow-soft");
  assert.ok(classIdx >= 0, `${label} has elevated card pattern`);
  const start = src.lastIndexOf("<", classIdx);
  const tag = src.slice(start + 1).match(/^\w+/)[0];
  const end = src.indexOf(`</${tag}>`, classIdx);
  assert.ok(end > start, `${label} elevated card has a closing tag`);
  return src.slice(start, end + `</${tag}>`.length);
}

const accountStart = settings.indexOf('data-testid="settings-account"');
assert.ok(accountStart > 0, "settings-account present");
const accountSectionOpen = settings.lastIndexOf("<section", accountStart);
const accountEnd = settings.indexOf("</section>", accountStart);
const accountChunk = settings.slice(accountSectionOpen, accountEnd + "</section>".length);

assert.doesNotMatch(accountChunk, /text-fg-secondary/, "account list rows must not use text-fg-secondary");
const accountMutedHits = [...accountChunk.matchAll(/[\w-:]*text-fg-muted/g)].map((m) => m[0]);
assert.ok(
  accountMutedHits.every((h) => h === "placeholder:text-fg-muted"),
  `account section must not use text-fg-muted for 14px regular text (got ${accountMutedHits.join(", ") || "none"})`,
);

for (const [src, label] of [
  [passwordPage, "password screen"],
  [deletePage, "delete screen"],
]) {
  const card = elevatedCard(src, label);
  assert.doesNotMatch(card, /text-fg-secondary/, `new 14px regular text on elevated must not use text-fg-secondary (${label})`);
  const mutedHits = [...card.matchAll(/[\w-:]*text-fg-muted/g)].map((m) => m[0]);
  assert.ok(
    mutedHits.every((h) => h === "placeholder:text-fg-muted"),
    `${label} must not use text-fg-muted for 14px regular text (got ${mutedHits.join(", ") || "none"})`,
  );
  assert.match(card, /text-sm text-fg/, `${label} help / labels / body on elevated use text-sm text-fg`);
}

const submitChunk = controlChunk(passwordPage, "settings-change-password-submit");
assert.match(submitChunk, /bg-growth/, "change-password submit uses bg-growth");
assert.ok(
  /text-white/.test(submitChunk) || /text-fg-inverse/.test(submitChunk),
  "change-password submit uses text-white or text-fg-inverse",
);

const deleteSubmit = controlChunk(deletePage, "settings-delete-submit");
assert.match(deleteSubmit, /border-danger/, "delete submit is outline danger");
assert.match(deleteSubmit, /text-danger/, "delete submit uses text-danger");
assert.doesNotMatch(
  deleteSubmit,
  /(?:^|[\s"'`])bg-danger(?:[\s"'`]|$)/,
  "delete submit must not use solid bg-danger",
);
assert.doesNotMatch(deleteSubmit, /text-white|text-fg-inverse/, "delete submit must not use white / inverse on danger fill");

const deleteCard = elevatedCard(deletePage, "delete screen");
const helpIdx = deleteCard.indexOf('data-testid="settings-delete-help"');
const helpChunk = deleteCard.slice(deleteCard.lastIndexOf("<", helpIdx), deleteCard.indexOf("</p>", helpIdx) + 4);
assert.match(helpChunk, /text-sm text-fg|type-body[^"']*text-fg/, "delete help is text-sm or type-body text-fg");
assert.match(helpChunk, /t\("settings\.deleteAccountHelp"\)/, "delete help uses locked key");

assert.match(api, /changePassword:/, "api.changePassword helper");
assert.match(api, /\/auth\/change-password/, "api posts to /auth/change-password");
assert.match(api, /deleteAccount:/, "api.deleteAccount helper");
assert.match(api, /\/auth\/delete-account/, "api posts to /auth/delete-account");
assert.doesNotMatch(api, /\/auth\/change-password\/\$\{/, "change-password path has no user_id");
assert.doesNotMatch(api, /\/auth\/delete-account\/\$\{/, "delete-account path has no user_id");

assert.match(
  authGate,
  /PUBLIC_PATHS = new Set\(\["\/login", "\/reset-password", "\/privacy"\]\)/,
  "new settings routes stay session-gated (not in AuthGate PUBLIC_PATHS)",
);

const tokenIdx = passwordPage.indexOf("writeSessionToken(session.access_token)");
const userIdx = passwordPage.indexOf("setSessionUser(session.user)");
const replaceIdx = passwordPage.indexOf('router.replace("/settings?password=updated")');
assert.ok(tokenIdx >= 0, "change-password success writes the new session token");
assert.ok(userIdx >= 0, "change-password success refreshes the cached user");
assert.ok(replaceIdx >= 0, "change-password success returns to Settings with password=updated");
assert.ok(userIdx > tokenIdx, "writeSessionToken runs before setSessionUser");
assert.ok(replaceIdx > userIdx, "token write happens before the Settings replace");
assert.match(passwordPage, /api\.changePassword/, "change-password calls the API helper");
assert.match(passwordPage, /login\.passwordTooShort/, "client min length 8");
assert.match(passwordPage, /settings\.passwordMismatch/, "client confirm match");
assert.doesNotMatch(passwordPage, /signOut\(/, "password change must not sign out this device");

assert.match(settings, /get\("password"\) === "updated"/, "Settings consumes password=updated");
assert.match(settings, /t\("settings\.passwordUpdated"\)/, "Settings shows settings.passwordUpdated after password change");
assert.match(settings, /router\.replace\("\/settings"\)/, "Settings strips the password=updated query");

assert.match(deletePage, /api\.deleteAccount/, "delete calls the API helper");
assert.match(deletePage, /signOut\(/, "post-delete uses the same state reset signOut performs");
assert.match(deletePage, /router\.replace\("\/login"\)/, "post-delete handoff to /login");

function assertBack(src, testId, label) {
  const chunk = controlChunk(src, testId);
  assert.match(chunk, /href="\/settings"/, `${label} back link href is /settings`);
  assert.match(chunk, /min-h-11/, `${label} back link is min-h-11`);
  assert.match(src, /t\("settings\.backToSettings"\)/, `${label} uses settings.backToSettings`);
  assert.doesNotMatch(src, /router\.back\(/, `${label} must not use router.back()`);
}

assertBack(passwordPage, "settings-password-back", "password screen");
assertBack(deletePage, "settings-delete-back", "delete screen");
assert.doesNotMatch(settings, /router\.back\(/, "Settings list must not use router.back()");

const lockedEn = {
  "settings.accountTitle": "Account",
  "settings.changePasswordTitle": "Change password",
  "settings.currentPassword": "Current password",
  "settings.newPassword": "New password",
  "settings.confirmPassword": "Confirm new password",
  "settings.updatePassword": "Update password",
  "settings.passwordUpdated":
    "Your password was updated. Other devices will need to sign in again.",
  "settings.passwordMismatch": "New password and confirmation must match.",
  "settings.chooseDifferentPassword": "Choose a different password.",
  "settings.deleteAccountTitle": "Delete account",
  "settings.deleteAccountHelp":
    "This permanently deletes your Baseline account and everything we store for you — charts, kit, protocols, completions, sessions, and history. This cannot be undone.",
  "settings.deleteConfirmLabel": "Type your account email to confirm",
  "settings.deleteAccountSubmit": "Delete my account",
  "settings.deleteConfirmMismatch": "Type your account email to confirm.",
  "settings.backToSettings": "Back to Settings",
  "privacy.choicesBody":
    "You can sign out anytime. You can change your password or permanently delete your account in Settings. For other help, email baselineapp@proton.me.",
};

const OLD_CHOICES_BODY =
  "You can sign out anytime. Account deletion is not in the app yet — email baselineapp@proton.me if you need help with that.";

for (const [key, value] of Object.entries(lockedEn)) {
  assert.ok(srcIncludesKey(en, key), `en missing ${key}`);
  assert.equal(valueFor(en, key), value, `en ${key} must match locked copy`);
}

for (const [name, src] of locales) {
  for (const key of Object.keys(lockedEn)) {
    assert.ok(srcIncludesKey(src, key), `${name} missing ${key}`);
    const got = valueFor(src, key);
    assert.ok(got && got.trim(), `${name} ${key} is empty`);
    if (name === "en") continue;
    if (key === "privacy.choicesBody") {
      assert.notEqual(got, lockedEn[key], `${name} ${key} must be a real translation, not EN verbatim`);
      assert.notEqual(got, OLD_CHOICES_BODY, `${name} ${key} must not keep the old sentence`);
    } else if (got === lockedEn[key] && key !== "settings.accountTitle") {
      assert.fail(`${name} ${key} looks like an English leftover`);
    }
    assert.equal(valueFor(src, "settings.footerAccount"), null, `${name} must retire settings.footerAccount`);
  }
}

const linen = themeTokens(css, ":root {");
const basalt = themeTokens(css, "html.dark,");

function assertElevatedContrast(theme, name) {
  const fgOnElev = contrastRatio(theme.fg, theme.elevated);
  const dangerOnElev = contrastRatio(theme.danger, theme.elevated);
  const growthWhite = contrastRatio("#ffffff", theme.growth);
  const dangerWhite = contrastRatio("#ffffff", theme.danger);
  const secOnElev = contrastRatio(theme.fgSecondary, theme.elevated);
  assert.ok(
    fgOnElev >= 4.5,
    `text-fg on elevated must be AA in ${name} (got ${fgOnElev.toFixed(2)}:1)`,
  );
  assert.ok(
    dangerOnElev >= 4.5,
    `text-danger on elevated must be AA in ${name} (got ${dangerOnElev.toFixed(2)}:1)`,
  );
  assert.ok(
    growthWhite >= 4.5,
    `growth + white must be AA in ${name} (got ${growthWhite.toFixed(2)}:1)`,
  );
  return { secOnElev, dangerWhite };
}

const linenRatios = assertElevatedContrast(linen, "Linen");
const basaltRatios = assertElevatedContrast(basalt, "Basalt");
assert.ok(
  basaltRatios.secOnElev < 4.5,
  `guard: text-fg-secondary on elevated still fails Basalt (${basaltRatios.secOnElev.toFixed(2)}:1)`,
);
assert.ok(
  basaltRatios.dangerWhite < 4.5,
  `guard: solid danger + white still fails Basalt (${basaltRatios.dangerWhite.toFixed(2)}:1)`,
);
void linenRatios;

console.log("assert-settings-account-controls PASS");
