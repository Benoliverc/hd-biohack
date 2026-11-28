/**
 * Partner mode Love guidance — complementary center counts.
 * Run: npx tsx scripts/assert-partner-love-guidance-center-counts.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { messages as en } from "../src/lib/i18n/messages/en.ts";
import { messages as nl } from "../src/lib/i18n/messages/nl.ts";
import { enSoulBadgeDescription } from "../src/lib/i18n/soulReadings/enBadgeDescriptions.ts";
import {
  bothOpenDefinedTogether,
  definedTogetherCenterKey,
  shouldSkipTheCurrent,
  soulCenterCounts,
  togetherCountMessage,
} from "../src/lib/soulCenterCounts.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(resolve(root, rel), "utf8");
const page = read("src/app/soul/page.tsx");
const overview = read("src/components/soul/PartnerOverviewCard.tsx");
const together = read("src/components/soul/TogetherCountLine.tsx");
const nlSoul = read("src/lib/i18n/soulReadings/nl.ts");
const pkg = read("package.json");

const ORDER = ["Head", "Ajna", "Throat", "G", "Heart", "Solar_Plexus", "Sacral", "Spleen", "Root"];

function fill(template, params) {
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    params[name] != null ? String(params[name]) : `{${name}}`,
  );
}

function sentence(counts, locale, catalog) {
  const { key, params } = togetherCountMessage(counts, locale);
  return { key, text: fill(catalog[key], params) };
}

function pairStrip(openCenters) {
  const open = new Set(openCenters);
  return ORDER.map((center) => {
    const state = open.has(center) ? "open" : "defined";
    return {
      center,
      self: state,
      friend: state,
      direction: state === "defined" ? "both_defined" : "both_open",
    };
  });
}

function compositeOf(definedCenters, definedCount = definedCenters.length) {
  return {
    defined_count: definedCount,
    open_count: 9 - definedCount,
    defined_centers: definedCenters,
  };
}

const workedStrip = pairStrip(["Head", "Solar_Plexus"]);
const workedDefined = ORDER.filter((center) => center !== "Head");
const worked = soulCenterCounts(workedStrip, compositeOf(workedDefined, 8));

const noEm = soulCenterCounts(
  pairStrip(["Head"]),
  compositeOf(ORDER.filter((center) => center !== "Head"), 8),
);
const full = soulCenterCounts(pairStrip([]), compositeOf([...ORDER], 9));
const emNine = soulCenterCounts(pairStrip(["Head"]), compositeOf([...ORDER], 9));

assert.ok(worked && noEm && full && emNine, "the four locked pictures resolve");

assert.equal(worked.unionDefined, 7);
assert.equal(worked.bothOpen, 2);
assert.deepEqual(worked.emCenters, ["Solar Plexus"]);
assert.deepEqual(worked.stillOpenCenters, ["Head"]);
assert.equal(worked.compositeDefined, 8);
assert.equal(worked.compositeOpen, 1);

assert.equal(noEm.unionDefined, 8);
assert.equal(noEm.bothOpen, 1);
assert.deepEqual(noEm.emCenters, []);
assert.equal(noEm.compositeDefined, 8);
assert.equal(noEm.compositeOpen, 1);

assert.equal(full.unionDefined, 9);
assert.equal(full.bothOpen, 0);
assert.deepEqual(full.emCenters, []);
assert.equal(full.compositeDefined, 9);
assert.equal(full.compositeOpen, 0);

assert.equal(emNine.unionDefined, 8);
assert.equal(emNine.bothOpen, 1);
assert.deepEqual(emNine.emCenters, ["Head"]);
assert.deepEqual(emNine.stillOpenCenters, []);
assert.equal(emNine.compositeDefined, 9);
assert.equal(emNine.compositeOpen, 0);

assert.throws(
  () => soulCenterCounts(workedStrip, compositeOf(workedDefined, 7)),
  /compositeDefined must equal unionDefined/,
);
assert.equal(soulCenterCounts(workedStrip, null), null);
assert.equal(soulCenterCounts(workedStrip, undefined), null);
assert.equal(bothOpenDefinedTogether("both_open", "Solar_Plexus", null), false);

const workedEn = sentence(worked, "en", en);
const workedNl = sentence(worked, "nl", nl);
assert.equal(workedEn.key, "soul.partner.togetherCount.splitOneEmOneOpen");
assert.equal(workedNl.key, workedEn.key);
assert.equal(
  workedEn.text,
  "In your own charts, 7 of the 9 centers are defined in at least one of you, and 2 stay open for both of you. When you are together, Solar Plexus defines in the pair, so 8 centers are defined and 1 stays open.",
);
assert.equal(
  workedNl.text,
  "In jullie eigen charts zijn 7 van de 9 centers bij minstens één van jullie gedefinieerd, en 2 blijven voor jullie allebei open. Wanneer jullie samen zijn, definieert Solar Plexus in het paar, zodat 8 centers gedefinieerd zijn en 1 open blijft.",
);
assert.match(workedEn.text, /in your own charts/i);
assert.match(workedEn.text, /When you are together/);

assert.equal(
  sentence(noEm, "en", en).text,
  "Together, 8 of the 9 centers are defined, and 1 stays open for both of you.",
);
assert.equal(
  sentence(full, "en", en).text,
  "Together, all 9 centers are defined. None stay open for both of you.",
);
assert.equal(sentence(full, "en", en).key, "soul.partner.togetherCount.sameNone");
assert.equal(
  sentence(emNine, "en", en).text,
  "In your own charts, 8 of the 9 centers are defined in at least one of you, and 1 stay open for both of you. When you are together, Head defines defined in the pair, so 9 centers are defined and 0 stay open.",
);
assert.equal(
  sentence(emNine, "nl", nl).text,
  "In jullie eigen charts zijn 8 van de 9 centers bij minstens één van jullie gedefinieerd, en 1 blijven voor jullie allebei open. Wanneer jullie samen zijn, definieert Head in het paar, zodat 9 centers gedefinieerd zijn en 0 open blijven.",
);

const twoStrip = [
  { center: "Solar_Plexus", self: "open", friend: "open", direction: "both_open" },
  { center: "Head", self: "open", friend: "open", direction: "both_open" },
  ...ORDER.filter((center) => center !== "Solar_Plexus" && center !== "Head").map((center) => ({
    center,
    self: "defined",
    friend: "defined",
    direction: "both_defined",
  })),
];
const two = soulCenterCounts(twoStrip, compositeOf([...ORDER], 9));
const twoEn = togetherCountMessage(two, "en");
const twoNl = togetherCountMessage(two, "nl");
assert.equal(twoEn.key, "soul.partner.togetherCount.split");
assert.equal(twoEn.params.emList, "Solar Plexus and Head");
assert.equal(twoEn.params.emVerb, "define");
assert.equal(twoNl.params.emList, "Solar Plexus en Head");
assert.equal(twoNl.params.emVerbNl, "definiëren");
assert.equal(twoEn.params.openVerb, "stay");
assert.equal(twoNl.params.openVerbNl, "blijven");

const hook = "Closeness arrives fast here.";
assert.equal(shouldSkipTheCurrent(hook, hook), true);
assert.equal(shouldSkipTheCurrent(hook, "  Closeness   arrives fast here. "), true);
assert.equal(shouldSkipTheCurrent(hook, "Closeness arrives fast here. Pace that heat."), true);
assert.equal(shouldSkipTheCurrent("Closeness arrives fast here. Pace that heat.", hook), true);
assert.equal(shouldSkipTheCurrent(hook, "A different current."), false);
assert.equal(shouldSkipTheCurrent(hook, "   "), true);
assert.match(
  overview,
  /const hasCurrent = hasText\(theCurrent\) && !shouldSkipTheCurrent\(hook, theCurrent\)/,
);

const hookAt = overview.indexOf('data-testid="soul-partner-hook"');
const currentAt = overview.indexOf('data-testid="soul-partner-the-current"');
const togetherAt = overview.indexOf('data-testid="soul-love-together-count"');
const decideAt = overview.indexOf('data-testid="soul-love-decide"');
assert.ok(hookAt > 0 && currentAt > hookAt && togetherAt > currentAt && decideAt > togetherAt);

const condAt = page.indexOf('data-testid="soul-conditioning"');
const centersAt = page.indexOf('data-testid="soul-centers-together-count"');
const listAt = page.indexOf("conditioning_strip.map", condAt);
assert.ok(condAt > 0 && centersAt > condAt && listAt > centersAt);
assert.match(together, /togetherCountMessage/);
assert.match(together, /t\(key, params\)/);
assert.match(page, /useTogetherCountText\(centerCounts\)/);
assert.match(page, /togetherCountText=\{togetherCountText\}/);
assert.match(overview, /\{togetherCountText\}/);

assert.match(page, /bothOpenDefinedTogether\(/);
assert.match(page, /soul\.chrome\.bothOpenDefinedTogether/);
assert.match(page, /soul\.chrome\.bothOpen/);
assert.equal(bothOpenDefinedTogether("both_open", "Head", workedDefined), false);
assert.equal(bothOpenDefinedTogether("both_open", "Solar_Plexus", workedDefined), true);
assert.equal(en["soul.chrome.bothOpen"], "Both open");
assert.equal(nl["soul.chrome.bothOpen"], "Beide open");
assert.equal(en["soul.chrome.bothOpenDefinedTogether"], "Open in both charts · defined together");
assert.equal(nl["soul.chrome.bothOpenDefinedTogether"], "In beide charts open · samen gedefinieerd");

const guidanceStart = overview.indexOf("function GuidanceBlock");
const guidanceEnd = overview.indexOf("export default function PartnerOverviewCard");
const guidance = overview.slice(guidanceStart, guidanceEnd);
assert.doesNotMatch(guidance, /TryLine/);
assert.match(guidance, /soul\.partner\.definedTogether\.title/);
assert.match(guidance, /soul\.partner\.definedTogether\.body/);
assert.match(guidance, /soul\.partner\.definedTogether\.try/);
for (const id of ["soul-love-decide", "soul-love-communicate", "soul-love-hard"]) {
  const at = overview.indexOf(`data-testid="${id}"`);
  assert.match(overview.slice(at, at + 900), /<TryLine/);
}
assert.doesNotMatch(overview, /LoveSubChapter|AccordionPanel|<details|aria-expanded/);

assert.equal(definedTogetherCenterKey("center-Solar_Plexus", workedDefined), "Solar_Plexus");
assert.equal(definedTogetherCenterKey("center-Head", workedDefined), null);
assert.equal(
  fill(en["soul.partner.definedTogether.title"], { center: "Solar Plexus" }),
  "Solar Plexus defines when you are together",
);
assert.equal(
  fill(nl["soul.partner.definedTogether.title"], { center: "Solar Plexus" }),
  "Solar Plexus definieert wanneer jullie samen zijn",
);
assert.doesNotMatch(en["soul.partner.definedTogether.body"], /Neither of you has a fixed emotional pattern/);
assert.doesNotMatch(nl["soul.partner.definedTogether.body"], /Geen van jullie heeft een vast emotioneel patroon/);

const NEW_KEYS = [
  "soul.partner.togetherCount.sameNone",
  "soul.partner.togetherCount.sameOne",
  "soul.partner.togetherCount.sameMany",
  "soul.partner.togetherCount.splitOneEmOneOpen",
  "soul.partner.togetherCount.split",
  "soul.chrome.bothOpenDefinedTogether",
  "soul.partner.definedTogether.title",
  "soul.partner.definedTogether.body",
  "soul.partner.definedTogether.try",
];
const formalU = /(^|[^A-Za-zÀ-ÿ\\])[uU](?![A-Za-zÀ-ÿw])/;
for (const key of NEW_KEYS) {
  assert.equal(typeof en[key], "string", `en missing ${key}`);
  assert.equal(typeof nl[key], "string", `nl missing ${key}`);
  assert.notEqual(nl[key], en[key], `${key} should differ in NL`);
  assert.doesNotMatch(nl[key], formalU, `${key} uses formal u`);
  assert.doesNotMatch(nl[key], /\b(?:Zonnevlecht|Hoofd|kanaal|grafiek|Liefdesbegeleiding|centra)\b/);
}
assert.match(nl["soul.partner.definedTogether.body"], /\bchannel\b/);
assert.match(nl["soul.partner.definedTogether.body"], /\bcharts\b/);
assert.match(nl["soul.partner.togetherCount.splitOneEmOneOpen"], /\bcenters\b/);

const EN_8_1 =
  'When you are together, eight of nine centers are defined in the pair — a nearly full circuit, with one center still open as the pressure-release valve. A center can be open in both of your own charts and still define when you meet. Classic HD composite lore frames 8-1 as "have some fun": high capability with a reminder not to take the bond as total identity. Honor the center that stays open; over-defining the last gap invites exhaustion.';
const EN_9_0 =
  'When you are together, all nine centers are defined in the pair — maximum circuitry and conditioning density. A center that stays open in both of your own charts can still define when you meet. Powerful for building and immersion; easy to lose solo aura hygiene. Schedule deliberate separation so the full circuit does not become the only way either of you feels "online."';
const NL_8_1 =
  "Wanneer jullie samen zijn, zijn acht van de negen centers in het paar gedefinieerd — een bijna vol circuit, met één center dat open blijft als drukventiel. Een center kan in jullie eigen charts voor allebei open zijn en toch definiëren wanneer jullie elkaar ontmoeten. Klassieke HD-composite-lore noemt 8-1 “heb een beetje pret”: hoog vermogen met de herinnering het paar niet als totale identiteit te nemen. Eer het center dat open blijft; het laatste gat over-definiëren nodigt uitputting uit.";
const NL_9_0 =
  "Wanneer jullie samen zijn, zijn alle negen centers in het paar gedefinieerd — maximale circuitry en conditioneringsdichtheid. Een center dat in jullie eigen charts voor allebei open blijft, kan toch definiëren wanneer jullie elkaar ontmoeten. Krachtig om te bouwen en in onder te gaan; makkelijk om solo aura-hygiëne te verliezen. Plan bewuste scheiding in, zodat het volle circuit niet de enige manier wordt waarop ieder van jullie zich “online” voelt.";

assert.equal(enSoulBadgeDescription("composite_8_1"), EN_8_1);
assert.equal(enSoulBadgeDescription("composite_9_0"), EN_9_0);
assert.equal(enSoulBadgeDescription("mirror_gates"), undefined);
assert.ok(nlSoul.includes(NL_8_1));
assert.ok(nlSoul.includes(NL_9_0));
assert.ok(nlSoul.includes('"soul.read.badge.composite_8_1.detail": "8 gedefinieerd / 1 open"'));
assert.ok(nlSoul.includes('"soul.read.badge.composite_9_0.detail": "9 gedefinieerd / 0 open"'));
assert.ok(nlSoul.includes("Samen bijna volledig aan — laat één ruimte (8-1)"));
assert.ok(nlSoul.includes("Samen volledig aan — plan tijd uit elkaar (9-0)"));
assert.match(page, /enSoulBadgeDescription\(b\.id\)/);
assert.match(page, /sc\(b\.label_part, b\.label\)/);
assert.match(page, /sc\(b\.detail_part, b\.detail\)/);
assert.doesNotMatch(page, /8 defined \/ 1 open/);
assert.doesNotMatch(page, /9 defined \/ 0 open/);

const scriptLine =
  '"assert:partner-love-guidance-center-counts": "npx tsx scripts/assert-partner-love-guidance-center-counts.mjs"';
assert.equal(pkg.split(scriptLine).length - 1, 1, "one assert script line");

console.log("assert-partner-love-guidance-center-counts: ok");
