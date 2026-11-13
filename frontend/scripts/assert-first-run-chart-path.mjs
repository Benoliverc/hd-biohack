/**
 * First-run Chart path — source ACs (FE).
 * Locks landing, hidden chrome, locked copy, You save, and post-save reveal.
 * Run: npx tsx scripts/assert-first-run-chart-path.mjs
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const login = read("src/app/login/page.tsx");
const reset = read("src/app/reset-password/page.tsx");
const gate = read("src/components/AuthGate.tsx");
const youChart = read("src/lib/youChart.ts");
const profile = read("src/app/profile/page.tsx");
const form = read("src/components/FirstRunChartForm.tsx");
const city = read("src/components/CityPicker.tsx");
const pkg = read("package.json");

// --- 1. Arrival ---
assert.ok(login.includes('intent: "create" | "signin"'), "applySession takes create/signin intent");
assert.ok(
  /if \(intent === "create"\) \{\s*router\.replace\("\/profile"\)/.test(login),
  "create-account goes straight to /profile",
);
assert.ok(login.includes("postSignInPath"), "sign-in uses existing /charts You check");
assert.ok(login.includes('await applySession(session.access_token, session.user, "create")'), "register uses create intent");
assert.ok(login.includes('await applySession(session.access_token, session.user, "signin")'), "login uses signin intent");
assert.equal(
  [...login.matchAll(/router\.replace\("\/"\)/g)].length,
  0,
  "login must not always send sessions to Home",
);
assert.ok(
  reset.includes('router.replace("/")'),
  "password-reset success stays on Home in this pass",
);
assert.ok(gate.includes("natalBindingLoading"), "AuthGate waits until You-chart bind is known");
assert.ok(gate.includes("natalChart"), "AuthGate uses store You natal");
assert.ok(
  gate.includes('router.replace(natalChart ? "/transits" : "/profile")'),
  "signed-in /login visit goes Today only when a You natal is confirmed",
);
assert.ok(
  /if \(natalBindingLoading\) return;/.test(gate),
  "AuthGate does not redirect off /login until the You-chart check is known",
);
assert.ok(youChart.includes("slot_kind !== \"friend\""), "You-chart check ignores person/friend rows");
assert.ok(
  youChart.includes('return "/profile"') && youChart.includes('? "/transits" : "/profile"'),
  "unknown or no-You sign-in lands on /profile; You natal goes Today",
);
assert.ok(youChart.includes("api.charts(userId)"), "sign-in uses existing /charts API, no new endpoint");

// --- 2. Focused Me form ---
assert.ok(profile.includes("isFirstRun"), "profile gates a first-run surface");
assert.ok(profile.includes("showFirstRunWait"), "profile has a neutral wait before first-run chrome");
assert.ok(profile.includes('data-testid="first-run-wait"'), "neutral wait is marked");
assert.ok(profile.includes('t("chart.firstRun.waiting")'), "wait uses the quiet first-run copy, not Loading saved chart");
assert.ok(form.includes('data-testid="first-run-chart-form"'), "focused first-run form exists");
assert.ok(form.includes('t("chart.firstRun.title")'), "title: Your chart");
assert.ok(form.includes('t("chart.firstRun.leadNamed", { name })'), "named lead uses account first name");
assert.ok(form.includes('t("chart.firstRun.lead")'), "nameless lead");
assert.ok(form.includes('t("chart.firstRun.timeCaption")'), "time caption is locked");
assert.ok(form.includes('t("chart.firstRun.save")'), "Save my chart");
assert.ok(form.includes('t("chart.firstRun.saving")'), "Saving your chart…");
assert.ok(form.includes('t("chart.firstRun.errorDate")'), "in-place birth date error");
assert.ok(form.includes('t("chart.firstRun.errorTime")'), "in-place birth time error");
assert.ok(
  form.includes('!birth.timeUnknown && !birth.birthTime') &&
    form.includes('t("chart.firstRun.errorTime")'),
  "errorTime still applies when there is no time and the unknown control is off",
);
assert.ok(form.includes('data-testid="first-run-time-unknown"'), "unknown-time control is marked");
assert.ok(form.includes('t("chart.timeUnknown")'), "unknown-time control copy is keyed");
assert.ok(form.includes('t("chart.timeUnknownDisclosure")'), "noon disclosure is keyed");
assert.ok(form.includes('t("chart.firstRun.errorCity")') || city.includes('fieldError'), "in-place city error");
assert.ok(form.includes('type="submit"'), "Enter submits the first-run form");
assert.ok(form.includes("type-body") && form.includes("text-fg"), "lead uses body type and primary ink");
assert.ok(form.includes("min-h-11"), "first-run controls keep the 10/11 minimum height");
assert.ok(form.includes("sm:grid-cols-2"), "date and time may sit side by side from sm");
assert.ok(form.includes("sm:col-span-2"), "city is full width");
assert.ok(!form.includes("md:grid-cols-4"), "first-run is not the four-column editor grid");

const hiddenInForm = [
  "Saved people",
  "Add new person",
  "Try demo chart",
  "demo-chart-banner",
  "Preview only",
  "save up to",
  "as {",
  "Calculate & save",
  "Display name",
  "Loading saved chart",
  "No Dev user selected",
  "Retry user",
  "person-role-control",
];
for (const needle of hiddenInForm) {
  assert.ok(!form.includes(needle), `first-run form must hide ${needle}`);
}
// Me / Person switch and Partner control stay off the focused form
assert.ok(!form.includes(">Me<") && !form.includes("setSaveAs"), "no Me / Person switch on first-run form");
assert.ok(!form.includes("personRole") && !form.includes("Partner"), "no Person / Partner on first-run form");

assert.ok(profile.includes("submitFirstRun"), "first-run save path exists");
assert.ok(profile.includes('slot_kind: "self"'), "Save my chart always writes slot_kind self");
assert.ok(profile.includes('role: "self"'), "Save my chart always writes role self");
assert.ok(
  /submitFirstRun[\s\S]*slot_kind: "self"[\s\S]*role: "self"/.test(profile) ||
    /slot_kind: "self",\s*role: "self"/.test(profile),
  "first-run calculateChart call saves as You",
);
assert.ok(profile.includes('UNKNOWN_BIRTH_TIME = "12:00:00"'), "documented default is 12:00:00");
assert.ok(profile.includes("effectiveBirthTime(birthTime, timeUnknown)"), "first-run save uses noon when unknown");
assert.ok(
  profile.includes("time_unknown: timeUnknown"),
  "first-run calculateChart sends the time_unknown flag",
);
assert.ok(
  profile.includes("if (!birthDate || (!timeUnknown && !birthTime) || lat == null || lon == null)"),
  "first-run save requires time only when not marked unknown",
);
assert.ok(
  profile.includes("if (preferred && isSelfRow(preferred)) applyRow(preferred)"),
  "no-You hydrate does not auto-apply a person chart",
);
assert.ok(
  profile.includes('data-testid="first-run-saved-people"'),
  "person charts without a You natal stay visible",
);
assert.ok(
  /isFirstRun[\s\S]*friendRows\.length > 0[\s\S]*first-run-saved-people/.test(profile),
  "Saved people only stay visible on first-run when person rows exist",
);
assert.ok(
  profile.includes('t("chart.firstRun.waiting")') &&
    profile.includes("showFirstRunWait") &&
    !/showFirstRunWait[\s\S]{0,400}Loading saved chart/.test(profile),
  "first-run wait is not Loading saved chart…",
);

// CityPicker first-run surface
assert.ok(city.includes('variant?: "default" | "first-run"'), "CityPicker has a first-run variant");
assert.ok(city.includes('t("chart.firstRun.cityLabel")'), "Birth city label");
assert.ok(city.includes('t("chart.firstRun.cityPlaceholder")'), "Start typing a city");
assert.ok(city.includes('t("chart.firstRun.cityUnresolved")'), "Pick your city from the list");
assert.ok(city.includes('t("chart.firstRun.coordsToggle")'), "I only have coordinates");
assert.ok(city.includes("!firstRun && !isResolved && !manual"), "Resolve is hidden on first-run");
assert.ok(city.includes('data-testid="first-run-city-confirm"'), "pinned place confirmation");
assert.ok(!/firstRun[\s\S]{0,200}ready to calculate/.test(city), "first-run confirmation is not ready to calculate");
assert.ok(city.includes("firstRunConfirm"), "confirmation is place + timezone, not raw lat/lon");
assert.ok(
  /firstRun \? \(\s*disabled \? null : isResolved && firstRunConfirm/.test(city) ||
    city.includes("isResolved && firstRunConfirm"),
  "first-run does not render the coordinate readout",
);
assert.ok(
  city.includes('r.source || (r.cached ? "cache" : "live")') &&
    city.includes("!firstRun && (") === false
    ? city.includes("{!firstRun && (")
    : true,
  "cache/live source badges are hidden on first-run",
);
assert.ok(
  city.includes("{!firstRun && (") && city.includes("cache") && city.includes("live"),
  "source badges gated behind !firstRun",
);
// Default editor chrome still exists for returners
assert.ok(city.includes(">Resolve<") || city.includes('"Resolve"'), "default CityPicker still has Resolve");
assert.ok(city.includes("Enter lat/lon"), "default CityPicker still has Enter lat/lon");
assert.ok(city.includes("ready to calculate"), "default CityPicker still has ready to calculate");

// --- 3. Natal appears ---
assert.ok(profile.includes("firstRunYouReveal"), "post-save first reveal flag");
assert.ok(profile.includes("setFirstRunYouReveal(true)"), "You save in-session flips the reveal");
assert.ok(profile.includes('t("chart.firstRun.editDetails")'), "first reveal relabels the collapsed row");
assert.ok(profile.includes("Edit / switch person"), "returners keep the current collapsed-row title");
assert.ok(profile.includes('t("chart.firstRun.natalLine")'), "This is your natal line sits above the snapshot");
assert.ok(profile.includes('data-testid="first-run-natal-line"'), "natal line is marked");
assert.ok(profile.includes('href="/transits"'), "See today's Move goes to /transits");
assert.ok(profile.includes('data-testid="first-run-see-todays-move"'), "Move link is a marked text link");
assert.ok(profile.includes('t("chart.firstRun.seeTodaysMove")'), "See today's Move copy is keyed");
assert.ok(
  !/firstRunYouReveal[\s\S]{0,400}biohack/.test(profile),
  "first-run reveal does not push Protocols",
);
assert.ok(profile.includes('You&apos;re a {typeKey}') || profile.includes("You're a {typeKey}"), "existing You're a {Type} snapshot stays");
assert.ok(profile.includes('id="snapshot"'), "snapshot remains in view after save");

// --- 4. Copy keys in all five locale files ---
const locked = {
  "chart.firstRun.title": "Your chart",
  "chart.firstRun.leadNamed":
    "{name}, enter your birth date, time, and city. This is the natal Today, Protocols, and Soul will use.",
  "chart.firstRun.lead":
    "Enter your birth date, time, and city. This is the natal Today, Protocols, and Soul will use.",
  "chart.firstRun.timeCaption":
    "An approximate time is fine if you're not sure. How you decide may be a little less precise.",
  "chart.firstRun.cityLabel": "Birth city",
  "chart.firstRun.cityPlaceholder": "Start typing a city",
  "chart.firstRun.cityUnresolved": "Pick your city from the list.",
  "chart.firstRun.save": "Save my chart",
  "chart.firstRun.saving": "Saving your chart…",
  "chart.firstRun.errorDate": "Enter a birth date.",
  "chart.firstRun.errorTime": "Enter a birth time.",
  "chart.firstRun.errorCity": "Pick your city from the list.",
  "chart.firstRun.coordsToggle": "I only have coordinates",
  "chart.firstRun.editDetails": "Edit your birth details",
  "chart.firstRun.natalLine": "This is your natal. You can edit your birth details anytime.",
  "chart.firstRun.seeTodaysMove": "See today's Move",
  "chart.timeUnknown": "I don’t know the time",
  "chart.timeUnknownDisclosure":
    "We’ll use noon in your birth city. How you decide may be a little less precise.",
};

const localeDir = resolve(root, "src/lib/i18n/messages");
const locales = ["en.ts", "de.ts", "es.ts", "fr.ts", "nl.ts"];
const localeFiles = readdirSync(localeDir)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts")
  .sort();
assert.deepEqual(
  localeFiles.filter((f) => !/^todaySoul\.(en|de|es|fr|nl)\.ts$/.test(f)),
  [...locales].sort(),
  "five locale files plus index",
);
for (const loc of ["en", "de", "es", "fr", "nl"]) {
  assert.ok(
    localeFiles.includes(`todaySoul.${loc}.ts`),
    `todaySoul catalog for ${loc}`,
  );
}

function extractMessage(src, key) {
  const re = new RegExp(`['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*(['"\`])([\\s\\S]*?)\\1`);
  const m = src.match(re);
  return m ? m[2] : null;
}

for (const loc of locales) {
  const src = read(`src/lib/i18n/messages/${loc}`);
  for (const [key, en] of Object.entries(locked)) {
    const value = extractMessage(src, key);
    assert.ok(value, `${loc} missing ${key}`);
    assert.equal(value, en, `${loc} ${key} must match EN source until translated`);
  }
}

assert.ok(pkg.includes('"assert:first-run-chart-path"'), "package.json wires assert:first-run-chart-path");

console.log("assert-first-run-chart-path PASS");
