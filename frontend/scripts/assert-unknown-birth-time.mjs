/**
 * Unknown birth-time path — source ACs (FE + contract).
 * Locks the control, noon default, server flag, and Chart/Today caveats.
 * Run: npx tsx scripts/assert-unknown-birth-time.mjs
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(root, "..");

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function readRepo(rel) {
  return readFileSync(resolve(repo, rel), "utf8");
}

const apos = "\u2019";
const locked = {
  "chart.timeUnknown": `I don${apos}t know the time`,
  "chart.timeUnknownDisclosure": `We${apos}ll use noon in your birth city. How you decide may be a little less precise.`,
  "chart.timeUnknownCaveat":
    "Birth time is unknown, so how you decide may be a little less precise.",
  "chart.timeUnknownEdit": "Edit on Chart",
};

const form = read("src/components/FirstRunChartForm.tsx");
const profile = read("src/app/profile/page.tsx");
const indication = read("src/components/TodayIndication.tsx");
const transits = read("src/app/transits/page.tsx");
const api = read("src/lib/api.ts");
const store = read("src/lib/store.tsx");
const pkg = read("package.json");

const models = readRepo("backend/app/models.py");
const schemas = readRepo("backend/app/schemas.py");
const routes = readRepo("backend/app/api/routes.py");
const database = readRepo("backend/app/database.py");

// --- Default and flag ---
assert.ok(models.includes("time_unknown"), "NatalChart has time_unknown");
assert.ok(
  /time_unknown: Mapped\[bool/.test(models) || models.includes("time_unknown"),
  "time_unknown is a mapped column",
);
assert.ok(database.includes("time_unknown"), "existing DBs get a time_unknown column");
assert.ok(schemas.includes("time_unknown"), "BirthDataIn threads time_unknown");
assert.match(routes, /UNKNOWN_BIRTH_TIME\s*=\s*"12:00:00"/, "documented noon default is 12:00:00");
assert.ok(routes.includes("def _resolved_birth_time"), "server resolves noon when unknown");
assert.ok(
  /if data\.time_unknown:[\s\S]{0,80}return UNKNOWN_BIRTH_TIME/.test(routes),
  "unknown path stores noon, not Settings TZ / UTC / sunrise / midnight",
);
assert.ok(
  /if not raw:[\s\S]{0,80}raise HTTPException\(status_code=422/.test(routes),
  "omitted time without the flag fails",
);
assert.ok(
  /row\.time_unknown = time_unknown/.test(routes) && /time_unknown=time_unknown/.test(routes),
  "create and update persist time_unknown",
);
assert.ok(
  /"time_unknown": bool\(getattr\(r, "time_unknown", False\)\)/.test(routes),
  "GET /charts echoes time_unknown",
);
const patchFn = routes.split('@router.patch("/charts/{chart_id}")')[1]?.split("@router")[0] || "";
assert.ok(patchFn.includes("ChartLabelPatch") && !patchFn.includes("time_unknown"), "PATCH /charts stays label/role only");

assert.ok(api.includes("time_unknown?: boolean"), "SavedChartRow / calculateChart echo time_unknown");
assert.ok(store.includes("time_unknown?: boolean"), "NatalChartSummary carries time_unknown");
assert.ok(
  store.includes("time_unknown: row.time_unknown === true"),
  "store hydrates the flag from GET /charts, not chart_json or localStorage",
);
assert.ok(
  !form.includes("localStorage") && !form.includes("firstRunYouReveal"),
  "first-run form does not persist unknown in localStorage or the reveal flag",
);

// --- First-run form ---
assert.ok(form.includes('data-testid="first-run-time-unknown"'), "first-run unknown control is marked");
assert.ok(form.includes('t("chart.timeUnknown")'), "first-run control uses locked copy");
assert.ok(form.includes('t("chart.timeUnknownDisclosure")'), "first-run disclosure is keyed");
assert.ok(
  /if \(!birth\.timeUnknown && !birth\.birthTime\) next\.time = t\("chart.firstRun.errorTime"\)/.test(form),
  "errorTime still applies when time is empty and not marked unknown",
);
assert.ok(form.includes('t("chart.firstRun.timeCaption")'), "approximate caption stays for a typed guess");
assert.ok(
  profile.includes("submitFirstRun") &&
    profile.includes("effectiveBirthTime") &&
    /time_unknown: timeUnknown/.test(profile) &&
    profile.includes('UNKNOWN_BIRTH_TIME = "12:00:00"'),
  "submitFirstRun sends 12:00:00 and time_unknown when the control is on",
);
assert.ok(
  /if \(!birthDate \|\| \(!timeUnknown && !birthTime\) \|\| lat == null \|\| lon == null\)/.test(profile),
  "submitFirstRun does not require a typed time when marked unknown",
);
assert.ok(form.includes('data-testid="first-run-chart-form"'), "focused first-run form remains");
assert.ok(!form.includes("Saved people"), "first-run form does not reintroduce Saved people");
assert.ok(!form.includes("Try demo chart"), "first-run form does not reintroduce demo");
assert.ok(!form.includes("Preview"), "first-run form does not reintroduce Preview");
assert.ok(!form.includes("Display name"), "first-run form does not reintroduce display name");

// --- Returning editor ---
assert.ok(profile.includes('data-testid="chart-time-unknown"'), "returning editor has the same control");
assert.ok(profile.includes('t("chart.timeUnknown")'), "editor control is keyed");
assert.ok(profile.includes('t("chart.timeUnknownDisclosure")'), "editor disclosure is keyed");
assert.ok(
  /required=\{!timeUnknown\}/.test(profile),
  "HTML required respects the unknown flag",
);
assert.ok(
  /if \(!timeUnknown && !birthTime\) throw new Error\("Enter a birth time\."\)/.test(profile),
  "editor Enter a birth time guard respects the flag",
);

// --- Caveats only when loaded natal has the flag ---
assert.ok(profile.includes('data-testid="chart-time-unknown-caveat"'), "Chart snapshot caveat is marked");
assert.ok(
  /viewMode === "saved" && savedTimeUnknown/.test(profile),
  "Chart caveat shows only for a saved natal with the flag, not a typed noon",
);
assert.ok(
  /id="snapshot"[\s\S]*chart-time-unknown-caveat/.test(profile),
  "Chart caveat lives under Your body's yes in #snapshot",
);
assert.ok(profile.includes('t("chart.timeUnknownCaveat")'), "Chart caveat uses locked copy");

assert.ok(indication.includes('data-testid="today-time-unknown-caveat"'), "Today caveat is marked");
assert.ok(indication.includes('t("chart.timeUnknownCaveat")'), "Today caveat uses the same sentence");
assert.ok(indication.includes('t("chart.timeUnknownEdit")'), "Today caveat may include Edit on Chart");
assert.ok(indication.includes('href="/profile"'), "Edit on Chart goes to /profile");
assert.ok(
  /main-action-why-details[\s\S]*today-time-unknown-caveat[\s\S]*today-evening-close/.test(indication),
  "Today caveat sits after Why and before Evening Close",
);
assert.ok(
  /data-testid="main-action"[\s\S]*today-time-unknown-caveat[\s\S]*open-protocols-secondary/.test(indication),
  "Today caveat is in the Move hero, not the header or the Protocols CTA slot",
);
assert.ok(
  !/today-kit-setup[\s\S]{0,200}today-time-unknown-caveat/.test(indication) ||
    indication.indexOf('data-testid="today-kit-setup"') < indication.indexOf('today-time-unknown-caveat'),
  "Today caveat is not in the kit / first-week setup slot",
);
assert.ok(
  transits.includes("timeUnknown={youChart.time_unknown === true}"),
  "Today caveat is driven by the loaded You natal flag",
);
assert.ok(!transits.includes("today-time-unknown-caveat"), "Today caveat is not in the page header");

// Must not land on literacy, Deep Dive, Soul, Protocols, Home, or Share
for (const [rel, label] of [
  ["src/components/LiteracyCoach.tsx", "literacy"],
  ["src/components/ChartDeepDive.tsx", "Deep Dive"],
  ["src/app/page.tsx", "Home"],
  ["src/app/biohack/page.tsx", "Protocols"],
]) {
  const src = read(rel);
  assert.ok(
    !src.includes("timeUnknownCaveat") && !src.includes("today-time-unknown-caveat") && !src.includes("chart-time-unknown-caveat"),
    `caveat must not appear in ${label}`,
  );
}
const soulHits = readdirSync(resolve(root, "src"), { recursive: true })
  .filter((f) => typeof f === "string" && /soul/i.test(f) && f.endsWith(".tsx"))
  .map((f) => `src/${f}`);
for (const rel of soulHits) {
  const src = read(rel);
  assert.ok(
    !src.includes("timeUnknownCaveat") && !src.includes("chart-time-unknown-caveat"),
    `caveat must not appear in Soul file ${rel}`,
  );
}
const shareDir = resolve(root, "src/components/share");
for (const f of readdirSync(shareDir)) {
  if (!f.endsWith(".tsx") && !f.endsWith(".ts")) continue;
  const src = read(`src/components/share/${f}`);
  assert.ok(
    !src.includes("timeUnknownCaveat") && !src.includes("chart-time-unknown-caveat"),
    `caveat must not appear in Share file ${f}`,
  );
}

// --- Copy keys in all five locales (typographic apostrophes) ---
const localeDir = resolve(root, "src/lib/i18n/messages");
const locales = ["en.ts", "de.ts", "es.ts", "fr.ts", "nl.ts"];
assert.deepEqual(
  readdirSync(localeDir).filter((f) => f.endsWith(".ts") && f !== "index.ts").sort(),
  [...locales].sort(),
  "five locale files plus index",
);

function extractMessage(src, key) {
  const re = new RegExp(`['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*(['"\`])([\\s\\S]*?)\\1`);
  const m = src.match(re);
  return m ? m.group ? null : m[2] : null;
}

for (const loc of locales) {
  const src = read(`src/lib/i18n/messages/${loc}`);
  for (const [key, en] of Object.entries(locked)) {
    const value = extractMessage(src, key);
    assert.ok(value, `${loc} missing ${key}`);
    assert.equal(value, en, `${loc} ${key} must match EN source until translated`);
    if (key === "chart.timeUnknown" || key === "chart.timeUnknownDisclosure") {
      assert.ok(value.includes(apos), `${loc} ${key} must use a typographic apostrophe`);
      assert.ok(!value.includes("'") && !value.includes("\u0027") || value.includes(apos), `${loc} ${key} typographic check`);
    }
  }
}

assert.ok(pkg.includes('"assert:unknown-birth-time"'), "package.json wires assert:unknown-birth-time");

console.log("assert-unknown-birth-time PASS");
