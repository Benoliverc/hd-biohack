/**
 * Upcoming sky (item 11) — source ACs.
 * Run: npx tsx scripts/assert-upcoming-sky.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const todayInd = read("src/components/TodayIndication.tsx");
const transits = read("src/app/transits/page.tsx");
const api = read("src/lib/api.ts");
const lib = read("src/lib/upcomingSky.ts");
const biohack = read("src/app/biohack/page.tsx");
const pkg = read("package.json");
const skyAssert = read("scripts/assert-sky-story.mjs");
const locales = ["en", "nl", "de", "fr", "es"].map((id) => ({
  id,
  src: read(`src/lib/i18n/messages/${id}.ts`),
}));

// Language first-pass: leftover today.upcoming.* keys are translated; pin each locale's strings.
const UPCOMING_PINS = {
  en: {
    toggle: "Next 7 days",
    empty: "No sky changes in the next 7 days.",
    error: "Couldn\u2019t load the next 7 days.",
    sunThemeTurns: "{weekday}: Sun theme turns.",
    bridgeOn: "{weekday}: a bridge comes on.",
    bridgeClears: "{weekday}: a bridge clears.",
    moonLeaves: "{weekday}: Moon leaves this gate.",
    sunThemeHoldsThrough: "Sun theme holds through {weekday}.",
  },
  de: {
    toggle: "N\u00e4chste 7 Tage",
    empty: "Keine Himmels\u00e4nderungen in den n\u00e4chsten 7 Tagen.",
    error: "Die n\u00e4chsten 7 Tage konnten nicht geladen werden.",
    sunThemeTurns: "{weekday}: das Sonnen-Thema wechselt.",
    bridgeOn: "{weekday}: eine Br\u00fccke geht an.",
    bridgeClears: "{weekday}: eine Br\u00fccke l\u00f6st sich.",
    moonLeaves: "{weekday}: der Mond verl\u00e4sst dieses Gate.",
    sunThemeHoldsThrough: "Das Sonnen-Thema bleibt bis {weekday}.",
  },
  es: {
    toggle: "Pr\u00f3ximos 7 d\u00edas",
    empty: "Sin cambios en el cielo en los pr\u00f3ximos 7 d\u00edas.",
    error: "No se pudieron cargar los pr\u00f3ximos 7 d\u00edas.",
    sunThemeTurns: "{weekday}: el tema del Sol cambia.",
    bridgeOn: "{weekday}: se enciende un puente.",
    bridgeClears: "{weekday}: se despeja un puente.",
    moonLeaves: "{weekday}: la Luna deja este gate.",
    sunThemeHoldsThrough: "El tema del Sol se mantiene hasta {weekday}.",
  },
  fr: {
    toggle: "7 prochains jours",
    empty: "Pas de changements dans le ciel pour les 7 prochains jours.",
    error: "Impossible de charger les 7 prochains jours.",
    sunThemeTurns: "{weekday} : le th\u00e8me du Soleil tourne.",
    bridgeOn: "{weekday} : un pont s\u2019allume.",
    bridgeClears: "{weekday} : un pont se dissipe.",
    moonLeaves: "{weekday} : la Lune quitte cette porte.",
    sunThemeHoldsThrough: "Le th\u00e8me du Soleil tient jusqu\u2019\u00e0 {weekday}.",
  },
  nl: {
    toggle: "Komende 7 dagen",
    empty: "Geen hemelveranderingen in de komende 7 dagen.",
    error: "Kon de komende 7 dagen niet laden.",
    sunThemeTurns: "{weekday}: het Zon-thema keert.",
    bridgeOn: "{weekday}: er komt een brug bij.",
    bridgeClears: "{weekday}: een brug verdwijnt.",
    moonLeaves: "{weekday}: de Maan verlaat deze gate.",
    sunThemeHoldsThrough: "Het Zon-thema houdt aan tot {weekday}.",
  },
};

assert.ok(
  pkg.includes('"assert:upcoming-sky": "npx tsx scripts/assert-upcoming-sky.mjs"'),
  "package.json wires assert:upcoming-sky",
);

// Dedicated range endpoint — not stuffed into GET /transits/today
assert.match(api, /transitsUpcoming:/);
assert.match(api, /\/transits\/upcoming/);
assert.match(api, /export type UpcomingSkyPayload/);
assert.doesNotMatch(api, /forecast\?:/);
assert.ok(
  !/transits\/today[\s\S]{0,400}forecast/.test(api),
  "do not add a forecast array to GET /transits/today",
);

// Fetch on fold open, not on Today's first paint
assert.match(todayInd, /api\.transitsUpcoming/);
assert.match(todayInd, /upcomingOpen && upcomingStatus === "idle"/);
assert.doesNotMatch(transits, /transitsUpcoming/);
assert.ok(
  /const todayPromise = api\.transitsToday/.test(transits),
  "Today first paint stays on /transits/today",
);

// Placement: sky block, under the tomorrow tease
assert.match(todayInd, /data-testid="today-upcoming-toggle"/);
assert.match(todayInd, /data-testid="today-upcoming"/);
assert.match(todayInd, /data-testid="sky-story-tomorrow"/);

const skyIdx = todayInd.indexOf('data-testid="today-sky-block"');
const teaseIdx = todayInd.indexOf('data-testid="sky-story-tomorrow"');
const toggleIdx = todayInd.indexOf('data-testid="today-upcoming-toggle"');
const panelIdx = todayInd.indexOf('data-testid="today-upcoming"');
const moveIdx = todayInd.indexOf('data-testid="main-action"');
const signalIdx = todayInd.indexOf('data-testid="daily-signal"');
const vsIdx = todayInd.indexOf('data-testid="vs-yesterday"');
const factIdx = todayInd.indexOf('data-testid="hd-fact-of-the-day"');

assert.ok(skyIdx >= 0 && teaseIdx > skyIdx, "tease stays in the sky block");
assert.ok(toggleIdx > teaseIdx, "toggle is under the tomorrow tease");
assert.ok(panelIdx > toggleIdx, "list sits with the toggle under the tease");
assert.ok(moveIdx >= 0 && moveIdx < skyIdx, "fold is not in the Move hero");
assert.ok(signalIdx > moveIdx && toggleIdx > signalIdx, "fold is after the signal");
assert.ok(vsIdx > 0 && toggleIdx > vsIdx, "fold is after vs-yesterday");
assert.ok(factIdx > panelIdx, "fold is before the lower literacy / tables stack");

// Tease remains when closed; list is not always visible; tomorrow is not duplicated when open
assert.match(todayInd, /tomorrowText && !upcomingOpen/);
assert.match(todayInd, /\{upcomingOpen \? \(/);
assert.doesNotMatch(todayInd, /week-ahead|weekAhead|WeatherStrip/);

// No future Move in the tease or the list
const foldChunk = todayInd.slice(teaseIdx, factIdx);
assert.doesNotMatch(foldChunk, /move_item_id|main_action_text|today\.move[^A-Za-z]/);
assert.match(lib, /buildUpcomingRows/);
assert.doesNotMatch(lib, /move_item_id|main_action/);

// Keyed wait / error / retry, no raw API text in the fold
assert.match(todayInd, /data-testid="today-upcoming-loading"/);
assert.match(todayInd, /data-testid="today-upcoming-error"/);
assert.match(todayInd, /data-testid="today-upcoming-retry"/);
assert.match(todayInd, /today\.upcoming\.error/);
assert.doesNotMatch(foldChunk, /\.message|String\(err|error\.toString/);

// i18n: per-locale pins (do not require leftover English in de/es/fr/nl)
for (const { id, src } of locales) {
  const pins = UPCOMING_PINS[id];
  assert.ok(pins, `${id} has upcoming pins`);
  assert.ok(src.includes(`'today.upcoming.toggle': '${pins.toggle}'`), `${id} toggle`);
  assert.ok(src.includes(`'today.upcoming.empty': '${pins.empty}'`), `${id} empty`);
  assert.ok(src.includes(`'today.upcoming.error': '${pins.error}'`), `${id} error typographic apostrophe`);
  assert.ok(src.includes(`'today.upcoming.sunThemeTurns': '${pins.sunThemeTurns}'`), `${id} sun turns`);
  assert.ok(src.includes(`'today.upcoming.bridgeOn': '${pins.bridgeOn}'`), `${id} bridge on`);
  assert.ok(src.includes(`'today.upcoming.bridgeClears': '${pins.bridgeClears}'`), `${id} bridge clears`);
  assert.ok(src.includes(`'today.upcoming.moonLeaves': '${pins.moonLeaves}'`), `${id} moon leaves`);
  assert.ok(src.includes(`'today.upcoming.sunThemeHoldsThrough': '${pins.sunThemeHoldsThrough}'`), `${id} hold`);
  assert.ok(
    !/today\.upcoming\.error.*Couldn't load/.test(src) || src.includes("Couldn\u2019t"),
    `${id} typographic apostrophe`,
  );
}

// Protocols has no WeatherStrip and no forecast module
assert.doesNotMatch(biohack, /WeatherStrip/);
assert.doesNotMatch(biohack, /protocols-weather/);
assert.doesNotMatch(biohack, /weather-full-sky-link/);
assert.doesNotMatch(biohack, /today-upcoming|transitsUpcoming/);

// sky-story assert still exists and allows this fold
assert.match(skyAssert, /today-upcoming-toggle/);
assert.match(skyAssert, /today-upcoming/);
assert.match(pkg, /"assert:sky-story"/);

console.log("assert-upcoming-sky PASS");
