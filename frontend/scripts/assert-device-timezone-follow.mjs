/**
 * Device-timezone follow: picker gone, sync PATCH rules, Settings read-only line.
 * Run: npx tsx scripts/assert-device-timezone-follow.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  detectDeviceTimezone,
  isValidIanaTimezone,
  needsPreferredTimezoneSync,
  syncDeviceTimezoneForUser,
  DEVICE_TZ_SYNC_DEBOUNCE_MS,
} from "../src/lib/deviceTimezone.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function extractMessage(src, key) {
  const re = new RegExp(`['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*(['"\`])([\\s\\S]*?)\\1`);
  const m = src.match(re);
  return m ? m[2] : null;
}

// --- Unit: IANA validation + detect ---
assert.equal(isValidIanaTimezone("Asia/Hong_Kong"), true);
assert.equal(isValidIanaTimezone("America/New_York"), true);
assert.equal(isValidIanaTimezone("UTC"), true);
assert.equal(isValidIanaTimezone("Not/A_Zone"), false);
assert.equal(isValidIanaTimezone(""), false);
assert.equal(isValidIanaTimezone("   "), false);
assert.equal(isValidIanaTimezone(null), false);
assert.equal(isValidIanaTimezone(undefined), false);

const runtimeTz = detectDeviceTimezone();
assert.ok(runtimeTz === null || isValidIanaTimezone(runtimeTz), "runtime detect is null or valid IANA");

assert.equal(needsPreferredTimezoneSync("America/New_York", "Asia/Hong_Kong"), true);
assert.equal(needsPreferredTimezoneSync("Asia/Hong_Kong", "Asia/Hong_Kong"), false);
assert.equal(needsPreferredTimezoneSync("Asia/Hong_Kong", "  Asia/Hong_Kong  "), false);
assert.equal(needsPreferredTimezoneSync("Asia/Hong_Kong", null), true);
assert.equal(needsPreferredTimezoneSync("Asia/Hong_Kong", ""), true);
assert.equal(needsPreferredTimezoneSync(null, "Asia/Hong_Kong"), false);
assert.equal(needsPreferredTimezoneSync("Not/A_Zone", "Asia/Hong_Kong"), false);
assert.equal(needsPreferredTimezoneSync("", "Asia/Hong_Kong"), false);

const baseUser = {
  id: 7,
  email: "a@b.c",
  display_name: "Ada",
  auth_provider: "password",
  subscription_tier: "free",
  stripe_customer_id: null,
  biohacking_enabled: false,
  preferred_timezone: "Asia/Hong_Kong",
};

// Detected zone differs → PATCH and return updated user
{
  let calls = 0;
  const updated = { ...baseUser, preferred_timezone: "America/New_York" };
  const result = await syncDeviceTimezoneForUser(baseUser, {
    detect: () => "America/New_York",
    patch: async (userId, body) => {
      calls += 1;
      assert.equal(userId, 7);
      assert.equal(body.preferred_timezone, "America/New_York");
      return updated;
    },
  });
  assert.equal(result.status, "patched");
  assert.equal(result.user.preferred_timezone, "America/New_York");
  assert.equal(calls, 1);
}

// Unchanged zone is not PATCHed
{
  let calls = 0;
  const result = await syncDeviceTimezoneForUser(baseUser, {
    detect: () => "Asia/Hong_Kong",
    patch: async () => {
      calls += 1;
      throw new Error("should not PATCH");
    },
  });
  assert.equal(result.status, "unchanged");
  assert.equal(result.user.preferred_timezone, "Asia/Hong_Kong");
  assert.equal(calls, 0);
}

// Invalid or missing detection does not overwrite a saved zone
{
  let calls = 0;
  for (const detect of [() => null, () => "Not/A_Zone", () => ""]) {
    const result = await syncDeviceTimezoneForUser(baseUser, {
      detect,
      patch: async () => {
        calls += 1;
        throw new Error("should not PATCH");
      },
    });
    assert.equal(result.status, "skipped");
    assert.equal(result.user.preferred_timezone, "Asia/Hong_Kong");
  }
  assert.equal(calls, 0);
}

// Failed PATCH leaves the saved zone in place
{
  const result = await syncDeviceTimezoneForUser(baseUser, {
    detect: () => "Europe/Berlin",
    patch: async () => {
      throw new Error("network");
    },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.user.preferred_timezone, "Asia/Hong_Kong");
}

assert.ok(DEVICE_TZ_SYNC_DEBOUNCE_MS >= 250, "debounce is long enough to absorb a flaky tab");

// --- Source: picker gone ---
const settings = read("src/app/settings/page.tsx");
for (const token of [
  "settings-tz-select",
  "settings-tz-custom",
  "settings-tz-custom-toggle",
  "settings-tz-save",
  "saveTimezone",
  "COMMON_TIMEZONES",
  "settings.commonZones",
  "settings.saveTimezone",
  "settings.customTzToggle",
  "settings.ianaName",
]) {
  assert.ok(!settings.includes(token), `Settings must not keep ${token}`);
}
assert.ok(!/geolocation|getCurrentPosition|navigator\.geolocation/i.test(settings), "no Geolocation on Settings");
assert.ok(settings.includes("settings-timezone"), "timezone section remains");
assert.ok(settings.includes("settings-tz-device"), "read-only device timezone line is present");
assert.ok(settings.includes('t("settings.deviceTimezone"'), "read-only line is keyed");
assert.ok(settings.includes('t("settings.timezoneHelp")'), "help is keyed");
const tzId = settings.indexOf('data-testid="settings-timezone"');
assert.ok(tzId >= 0, "settings-timezone test id");
const tzSectionStart = settings.lastIndexOf("<section", tzId);
assert.ok(tzSectionStart >= 0 && tzSectionStart < tzId, "timezone section opens before its test id");
const tzSection = settings.slice(tzSectionStart, settings.indexOf("</section>", tzId));
assert.ok(/\bbg-elevated\b/.test(tzSection), "timezone card is bg-elevated");

const helpOpen = tzSection.indexOf('t("settings.timezoneHelp")');
assert.ok(helpOpen >= 0, "timezone help is in the timezone card");
const helpTag = tzSection.slice(Math.max(0, helpOpen - 160), helpOpen);
assert.ok(/className="[^"]*\btext-sm\b[^"]*\btext-fg\b/.test(helpTag) && !/text-fg-secondary|text-fg-muted/.test(helpTag), "timezone help uses text-sm text-fg on elevated, not secondary or muted");

const deviceOpen = settings.indexOf('data-testid="settings-tz-device"');
assert.ok(deviceOpen >= 0, "settings-tz-device test id");
const deviceTag = settings.slice(deviceOpen - 80, deviceOpen + 160);
assert.ok(/className="[^"]*\btext-sm\b[^"]*\btext-fg\b/.test(deviceTag) && !/text-fg-secondary|text-fg-muted/.test(deviceTag), "device line uses text-sm text-fg on elevated, not secondary or muted");
assert.ok(!deviceTag.includes("text-growth\"" ) && !/text-growth[^-ink]/.test(deviceTag.split(">")[0] || ""), "device line must not use raw text-growth");

// Contrast vs elevated must be computed, not just a class name. text-sm is 14px regular, AA is 4.5:1.
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
function themeTokens(css, marker) {
  const i = css.indexOf(marker);
  assert.ok(i >= 0, `globals.css has ${marker}`);
  const block = css.slice(i, css.indexOf("}", i));
  const grab = (name) => {
    const m = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
    assert.ok(m, `${marker} defines --${name}`);
    return m[1];
  };
  return { elevated: grab("elevated"), fg: grab("fg"), fgSecondary: grab("fg-secondary") };
}
const css = read("src/app/globals.css");
const linen = themeTokens(css, ":root {");
const basalt = themeTokens(css, "html.dark,");
const linenFg = contrastRatio(linen.fg, linen.elevated);
const basaltFg = contrastRatio(basalt.fg, basalt.elevated);
const linenSec = contrastRatio(linen.fgSecondary, linen.elevated);
const basaltSec = contrastRatio(basalt.fgSecondary, basalt.elevated);
assert.ok(linenFg >= 4.5, `text-fg on elevated must be AA in Linen (got ${linenFg.toFixed(2)}:1)`);
assert.ok(basaltFg >= 4.5, `text-fg on elevated must be AA in Basalt (got ${basaltFg.toFixed(2)}:1)`);
assert.ok(basaltSec < 4.5, `guard: text-fg-secondary on elevated still fails Basalt (${basaltSec.toFixed(2)}:1), so the assert would catch a revert`);
void linenSec;

// --- Source: sync wiring ---
const helper = read("src/lib/deviceTimezone.ts");
const hook = read("src/lib/useDeviceTimezoneSync.ts");
const store = read("src/lib/store.tsx");
const transits = read("src/app/transits/page.tsx");
const biohack = read("src/app/biohack/page.tsx");

assert.ok(
  helper.includes("Intl.DateTimeFormat().resolvedOptions().timeZone"),
  "detect uses the system IANA timezone",
);
assert.ok(!/geolocation|getCurrentPosition/i.test(helper + hook + store), "sync path must not use Geolocation");
assert.ok(!/viewport-fit\s*=\s*cover/.test(helper + hook + store + settings), "no viewport-fit=cover in this pass");
assert.ok(store.includes("syncDeviceTimezoneForUser"), "session bootstrap syncs device timezone");
assert.ok(store.includes("useDeviceTimezoneSync"), "AppProvider re-checks after session ready");
assert.ok(hook.includes('visibilitychange'), "re-check on visibilitychange");
assert.ok(hook.includes('visibilityState === "visible"'), "only re-checks when becoming visible");
assert.ok(hook.includes('addEventListener("focus"'), "re-check on focus");
assert.ok(hook.includes("DEVICE_TZ_SYNC_DEBOUNCE_MS"), "foreground re-checks are debounced");
assert.ok(hook.includes("mergeUser") || hook.includes("mergeRef"), "successful sync updates the session user via mergeUser");
assert.ok(!hook.includes("setSessionUser"), "sync must not use setSessionUser (that clears natal)");
assert.ok(transits.includes("user?.preferred_timezone"), "Today refetch depends on account timezone");
assert.ok(biohack.includes("user?.preferred_timezone"), "Protocols can refetch after a timezone sync");

// --- i18n: picker copy retired; new line locked in all locales ---
const apos = "\u2019";
const locked = {
  "settings.timezoneHelp": `Used for Protocols days, Show-up, and when Today${apos}s Move resets \u2014 07:00 in your device timezone.`,
  "settings.deviceTimezone": "Using your device timezone: {tz}.",
};
const retired = [
  "settings.commonZones",
  "settings.defaultTz",
  "settings.customTzToggle",
  "settings.ianaName",
  "settings.current",
  "settings.saveTimezone",
  "settings.savedTz",
  "settings.savedTzDefault",
];
const locales = ["en.ts", "de.ts", "es.ts", "fr.ts", "nl.ts"];
for (const loc of locales) {
  const src = read(`src/lib/i18n/messages/${loc}`);
  for (const [key, en] of Object.entries(locked)) {
    const value = extractMessage(src, key);
    assert.ok(value, `${loc} missing ${key}`);
    assert.equal(value, en, `${loc} ${key} must match EN source until translated`);
  }
  for (const key of retired) {
    assert.equal(extractMessage(src, key), null, `${loc} must retire ${key}`);
    assert.ok(!src.includes(`Save timezone`) && !src.includes(`Common zones`), `${loc} leftover picker copy`);
  }
}

const pkg = read("package.json");
assert.ok(pkg.includes('"assert:device-timezone-follow"'), "package.json wires assert:device-timezone-follow");

console.log("assert-device-timezone-follow PASS");
