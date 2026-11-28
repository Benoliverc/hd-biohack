/**
 * How to read across pages — source ACs (FE).
 * Run: npx tsx scripts/assert-how-to-read-across-pages.mjs
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const pkg = read("package.json");
const coach = read("src/components/LiteracyCoach.tsx");
const hdCopy = read("src/lib/hdCopy.ts");
const todayCopy = read("src/lib/todayCopy.ts");
const fact = read("src/lib/hdFactOfTheDay.ts");
const transits = read("src/app/transits/page.tsx");
const todayInd = read("src/components/TodayIndication.tsx");
const header = read("src/components/Header.tsx");
const soul = read("src/app/soul/page.tsx");
const biohack = read("src/app/biohack/page.tsx");
const todaysMoveCard = read("src/components/protocols/TodaysMoveCard.tsx");
const home = read("src/app/page.tsx");
const settings = read("src/app/settings/page.tsx");
const login = read("src/app/login/page.tsx");
const reset = read("src/app/reset-password/page.tsx");
const admin = read("src/app/admin/page.tsx");
const en = read("src/lib/i18n/messages/en.ts") + "\n" + read("src/lib/i18n/messages/todaySoul.en.ts");
const locales = ["en", "de", "es", "fr", "nl"];

assert.ok(
  pkg.includes(
    '"assert:how-to-read-across-pages": "npx tsx scripts/assert-how-to-read-across-pages.mjs"',
  ),
  "package.json wires assert:how-to-read-across-pages",
);

function catalogValue(src, key) {
  const needle = `"${key}": "`;
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing catalog key ${key}`);
  let i = start + needle.length;
  let out = "";
  while (i < src.length) {
    const ch = src[i];
    if (ch === "\\") {
      const next = src[i + 1];
      if (next === "n") out += "\n";
      else out += next;
      i += 2;
      continue;
    }
    if (ch === '"') break;
    out += ch;
    i += 1;
  }
  return out;
}

function bankRegion(src, startNeedle, endNeedle) {
  const start = src.indexOf(startNeedle);
  const end = endNeedle ? src.indexOf(endNeedle, start + startNeedle.length) : src.length;
  assert.ok(start >= 0 && end > start, `locate ${startNeedle}`);
  return src.slice(start, end);
}

function stepBlocks(region) {
  const ids = [...region.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
  return ids.map((id) => {
    const start = region.indexOf(`id: "${id}"`);
    const next = region.indexOf('id: "', start + 5);
    const block = region.slice(start, next > start ? next : region.length);
    const titleKey = /titleKey:\s*"([^"]+)"/.exec(block)?.[1];
    const jumpKey = /jumpKey:\s*"([^"]+)"/.exec(block)?.[1];
    const targetId = /targetId:\s*"([^"]+)"/.exec(block)?.[1];
    return { id, titleKey, jumpKey, targetId, block };
  });
}

const apo = "\u2019";

// --- Today: exactly three locked steps ---
const todayBank = bankRegion(todayCopy, "export const TODAY_LITERACY_I18N", "];");
const todaySteps = stepBlocks(todayBank);
assert.deepEqual(
  todaySteps.map((s) => s.id),
  ["today-move", "today-energy-space", "today-sky-details"],
  "Today has exactly three How to read steps",
);
assert.deepEqual(
  todaySteps.map((s) => catalogValue(en, s.titleKey)),
  ["The Move", "Energy and Space", "Sky details"],
  "Today titles are the locked English titles",
);
assert.deepEqual(
  todaySteps.map((s) => s.targetId),
  ["main-action", "main-action-status", "today-sky-details"],
  "Today jump targets are locked",
);
assert.equal(
  catalogValue(en, "today.literacy.move.body"),
  `The Move at the top is the one thing to do with today${apo}s weather. The short line under it is the one change in the sky compared with yesterday — a first glance, not a second to-do. Stay with the Move if you want what to do; you do not need to act on the change-line separately.`,
  "Today Move body is locked English",
);
assert.ok(
  /const SKY_DETAILS_JUMP_IDS = new Set\(\[[^\]]*["']today-sky-details["']/.test(transits),
  "today-sky-details is in SKY_DETAILS_JUMP_IDS",
);
assert.ok(
  transits.includes('id="today-sky-details"'),
  "Sky details disclosure has id=today-sky-details",
);

// Pulse field map no longer points at old four-step ids
assert.match(fact, /moon:\s*"today-move"/);
assert.match(fact, /hanging_pressure:\s*"today-move"/);
assert.match(fact, /sun:\s*"today-sky-details"/);
assert.match(fact, /bridge:\s*"today-sky-details"/);
assert.match(fact, /newly_defined:\s*"today-sky-details"/);
for (const stale of [
  "today-new-signal",
  "today-sun-earth",
  "today-bridged-channels",
  "today-newly-defined",
]) {
  assert.ok(
    !new RegExp(`:\\s*"${stale}"`).test(fact),
    `pulse field map no longer points at ${stale}`,
  );
}

// Unused TODAY_LITERACY_STEPS is gone
assert.ok(!hdCopy.includes("TODAY_LITERACY_STEPS"), "unused TODAY_LITERACY_STEPS is gone");
assert.ok(!coach.includes("TODAY_LITERACY_STEPS"), "coach does not read TODAY_LITERACY_STEPS");

// Chart and Soul banks + reader titles are i18n'd
assert.ok(hdCopy.includes("export const CHART_LITERACY_I18N"), "chart bank is i18n");
assert.ok(hdCopy.includes("export const SOUL_LITERACY_I18N"), "soul bank is i18n");
assert.ok(!hdCopy.includes("export const CHART_LITERACY_STEPS"), "no hardcoded chart English array");
assert.ok(!hdCopy.includes("export const SOUL_LITERACY_STEPS"), "no hardcoded soul English array");
assert.ok(coach.includes("CHART_LITERACY_I18N") && coach.includes("SOUL_LITERACY_I18N"));
assert.ok(coach.includes("chart.literacy.howToReadTitle"));
assert.ok(coach.includes("soul.literacy.howToReadTitle"));
assert.equal(catalogValue(en, "chart.literacy.howToReadTitle"), "How to read your chart");
assert.equal(catalogValue(en, "soul.literacy.howToReadTitle"), "How to read Soul");

// Other-person Chart: sibling .other keys exist; self Chart bodies stay second person.
const nlCatalog = read("src/lib/i18n/messages/nl.ts");
const chartOtherKeys = [
  "chart.literacy.howToReadTitle.other",
  "chart.literacy.definedOpen.body.other",
  "chart.literacy.channelsHanging.body.other",
  "chart.literacy.legend.body.other",
  "chart.literacy.typeStrategy.body.other",
  "chart.literacy.centersWatch.body.other",
  "chart.literacy.deepDive.body.other",
];
for (const key of chartOtherKeys) {
  assert.ok(catalogValue(en, key).includes("{name}"), `${key} names the chart person`);
  assert.ok(nlCatalog.includes(`"${key}"`), `nl has ${key}`);
}
assert.match(catalogValue(en, "chart.literacy.definedOpen.body"), /always-on for you/);
assert.match(catalogValue(en, "chart.literacy.legend.body"), /under your Bodygraph/);
assert.match(catalogValue(en, "chart.literacy.typeStrategy.body"), new RegExp(`your body${apo}s yes`));
assert.match(catalogValue(en, "chart.literacy.deepDive.body"), new RegExp(`when you${apo}re curious`));
assert.match(catalogValue(en, "chart.literacy.legend.body"), new RegExp(`You don${apo}t need to memorize jargon`));
assert.ok(coach.includes('variant === "chart" && Boolean(personName)'), "Chart voice switches only with personName");
assert.ok(coach.includes("chart.literacy.howToReadTitle.other"));
assert.doesNotMatch(coach, /soul\.literacy\.[A-Za-z.]+\.other/);
assert.doesNotMatch(coach, /today\.literacy\.[A-Za-z.]+\.other/);
assert.doesNotMatch(coach, /protocols\.literacy\.[A-Za-z.]+\.other/);

const chartSteps = stepBlocks(bankRegion(hdCopy, "export const CHART_LITERACY_I18N", "export const SOUL_LITERACY_I18N"));
assert.equal(chartSteps.length, 6, "six Chart steps");
assert.deepEqual(
  chartSteps.map((s) => catalogValue(en, s.titleKey)),
  [
    "Defined vs Open centers",
    "Channels & hanging gates",
    "The legend",
    "Type → Strategy → Authority",
    "Centers to watch",
    "Deep dive",
  ],
);
assert.equal(catalogValue(en, "chart.literacy.legend.jump"), "Legend");

const soulSteps = stepBlocks(bankRegion(hdCopy, "export const SOUL_LITERACY_I18N", "export const PROTOCOLS_LITERACY_I18N"));
assert.equal(soulSteps.length, 6, "six Soul steps");
assert.deepEqual(
  soulSteps.map((s) => catalogValue(en, s.titleKey)),
  [
    "Aura Signature first",
    "Love guidance",
    "Pace · steadiness · intensity",
    "The playbook",
    "Power dynamics",
    "Spark, Bedrock, Dominance",
  ],
);

// Chrome is i18n'd
for (const key of [
  "literacy.chrome.gotIt",
  "literacy.chrome.jump",
  "literacy.chrome.sections",
  "literacy.chrome.close",
]) {
  assert.ok(coach.includes(key), `coach uses ${key}`);
}
assert.equal(catalogValue(en, "literacy.chrome.gotIt"), "Got it");
assert.equal(catalogValue(en, "literacy.chrome.jump"), "Jump · {label}");
assert.equal(catalogValue(en, "literacy.chrome.sections"), "{n} sections");
assert.equal(catalogValue(en, "literacy.chrome.close"), "Close");

// Today and Soul dismissed chips use translated reopen label How to read
assert.ok(coach.includes('soul: "nav.howToRead"'), "Soul dismissed chip uses nav.howToRead");
assert.ok(coach.includes('today: "nav.howToRead"'), "Today dismissed chip uses nav.howToRead");
assert.ok(!coach.includes("How to read Soul"), "Soul does not stay on How to read Soul after Got it");

// Existing storage keys are not bumped
assert.ok(hdCopy.includes('chart: "baseline.literacy.chart.v1"'));
assert.ok(hdCopy.includes('soul: "baseline.literacy.soul.v1"'));
assert.ok(hdCopy.includes('today: "baseline.literacy.today.v1"'));
assert.ok(hdCopy.includes('protocols: "baseline.literacy.protocols.v1"'));

// Partner-aware Love jump
const loveStep = soulSteps.find((s) => s.id === "love-is-partner-only");
assert.equal(loveStep.targetId, "soul-pickers", "Love bank fallback is soul-pickers");
assert.ok(
  /if \(targetId === "soul-chapter-love"\)/.test(soul),
  "planSoulJump has a Love-chapter case",
);
assert.ok(soul.includes('chapter: "love"'), "Love jump opens chapter love");
assert.ok(
  /result\.friend\?\.role === "partner"/.test(soul) && soul.includes("result.partner_overview"),
  "Love step jump is Partner-aware as locked",
);
assert.ok(/id=\{id \?\? testId\}/.test(read("src/components/soul/SoulChapterCard.tsx")), "Love chapter root can take a stable id");
assert.ok(soul.includes('testId="soul-chapter-love"'), "Love chapter test id remains");

// Today in-page chip under the Move hero
const heroStatus = todayInd.indexOf('data-testid="main-action-status"');
const slotIdx = todayInd.indexOf("{literacyCoach}");
const eveningIdx = todayInd.indexOf("Evening Close");
const pulseIdx = todayInd.indexOf('data-testid="hd-fact-how-to-read"');
assert.ok(heroStatus > 0 && slotIdx > heroStatus, "chip is under the Move + Energy/Space hero");
assert.ok(eveningIdx > slotIdx, "chip is before Evening Close");
assert.ok(todayInd.includes('id="today-new-signal"') ? todayInd.indexOf('id="today-new-signal"') > slotIdx : transits.includes('id="today-new-signal"'), "new signal stays after the hero chip");
assert.ok(pulseIdx > slotIdx, "chip is before the literacy pulse");
assert.ok(transits.includes("literacyCoach="), "transits passes the coach into the hero slot");
assert.ok(!/<\/TodayIndication>[\s\S]{0,120}<LiteracyCoach/.test(transits), "Today chip is not after the whole TodayIndication card");

// Protocols How to use
const protoBank = bankRegion(hdCopy, "export const PROTOCOLS_LITERACY_I18N", "];");
const protoSteps = stepBlocks(protoBank);
assert.deepEqual(
  protoSteps.map((s) => catalogValue(en, s.titleKey)),
  [`Today${apo}s Move`, "Shelf", "Natal and This week"],
  "Protocols titles are locked English",
);
assert.deepEqual(
  protoSteps.map((s) => s.targetId),
  ["todays-move", "shelf", "natal-baseline-card"],
);
assert.ok(coach.includes('variant === "protocols"') || coach.includes('"protocols"'));
assert.ok(biohack.includes('variant="protocols"'), "Protocols page mounts the coach");
assert.ok(biohack.includes("<LiteracyCoach"), "Protocols How to use uses LiteracyCoach");
assert.ok(!/setOpen\(true\)/.test(coach) || !/useEffect\([\s\S]{0,200}setOpen\(true\)/.test(coach), "no auto-open");
const moveCardIdx = biohack.indexOf("<TodaysMoveCard");
const natalIdx = biohack.indexOf("<NatalBaselineCard");
const protoCoachIdx = biohack.indexOf('<LiteracyCoach variant="protocols"');
const shelfIdx = biohack.indexOf('data-testid="shelf-disclosure"');
assert.ok(
  moveCardIdx > 0 && natalIdx > moveCardIdx && protoCoachIdx > natalIdx && shelfIdx > protoCoachIdx,
  "Protocols chip sits after Natal baseline and before Shelf",
);
assert.ok(biohack.includes('id="natal-baseline-card"'), "natal-baseline-card has a matching id");
assert.ok(todaysMoveCard.includes('id="todays-move"'), "todays-move has a matching id");
assert.ok(header.includes('pathname === "/biohack"'), "header control can show on /biohack");
assert.ok(header.includes('"nav.howToUse"'), "Protocols header label is How to use");
assert.ok(header.includes("howToRead?.available"), "header control only when the coach can open");
assert.equal(catalogValue(en, "protocols.literacy.howToUseTitle"), "How to use Protocols");
assert.equal(catalogValue(en, "nav.howToUse"), "How to use");

for (const [name, src] of [
  ["Home", home],
  ["Settings", settings],
  ["login", login],
  ["reset-password", reset],
  ["Admin", admin],
]) {
  assert.ok(!src.includes("<LiteracyCoach"), `${name} has no How to read / How to use coach`);
}

const paywallStart = biohack.indexOf("function LockedPaywallMock");
assert.ok(paywallStart > 0, "locked paywall mock exists");
assert.ok(
  !biohack.slice(paywallStart, paywallStart + 2500).includes("LiteracyCoach"),
  "How to use is not added to the locked paywall mock",
);

// Five-locale parity for keys this pass touches
const keys = [
  "today.literacy.move.title",
  "today.literacy.energySpace.title",
  "today.literacy.skyDetails.title",
  "chart.literacy.legend.title",
  "soul.literacy.love.title",
  "protocols.literacy.todaysMove.title",
  "literacy.chrome.gotIt",
  "nav.howToUse",
];
for (const loc of locales) {
  const todaySoul = read(`src/lib/i18n/messages/todaySoul.${loc}.ts`);
  const main = read(`src/lib/i18n/messages/${loc}.ts`);
  const blob = todaySoul + "\n" + main;
  for (const key of keys) {
    assert.ok(blob.includes(`"${key}"`) || blob.includes(`'${key}'`), `${loc} has ${key}`);
  }
  assert.ok(!todaySoul.includes("today.literacy.newSignal.title"), `${loc} dropped unused Today four-step keys`);
}

// No new locale files
const localeDir = resolve(root, "src/lib/i18n/messages");
const localeFiles = readdirSync(localeDir).filter((f) => f.endsWith(".ts") && f !== "index.ts").sort();
assert.deepEqual(
  localeFiles.filter((f) => !/^todaySoul\.(en|de|es|fr|nl)\.ts$/.test(f)),
  ["de.ts", "en.ts", "es.ts", "fr.ts", "nl.ts"],
  "no new locale files",
);

console.log("assert-how-to-read-across-pages: ok");
