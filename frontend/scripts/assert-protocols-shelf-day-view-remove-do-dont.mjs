/**
 * Protocols: remove Do/Don't, Shelf title + Add, no kit fact, by-time-of-day view.
 * Run: npx tsx scripts/assert-protocols-shelf-day-view-remove-do-dont.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { groupShelfByWhen } from "../src/components/protocols/shelfDay.ts";

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
const biohack = read("src/app/biohack/page.tsx");
const move = read("src/components/protocols/TodaysMoveCard.tsx");
const dayView = read("src/components/protocols/ShelfDayView.tsx");
const helper = read("src/components/protocols/shelfDay.ts");
const rules = read("../backend/app/biohack/rules.py");
const locales = ["en", "de", "es", "fr", "nl"].map((id) => ({
  id,
  src: read(`src/lib/i18n/messages/${id}.ts`),
}));
const byId = Object.fromEntries(locales.map((row) => [row.id, row.src]));

assert.ok(
  pkg.includes(
    '"assert:protocols-shelf-day-view-remove-do-dont": "npx tsx scripts/assert-protocols-shelf-day-view-remove-do-dont.mjs"',
  ),
  "package.json wires the assert",
);

// --- Do/Don't is gone from the frontend; the backend still sends it ---
assert.doesNotMatch(move, /doList|dontList|protocols\.do"|protocols\.dont"/);
assert.doesNotMatch(biohack, /doList=|dontList=|daily\.do\b|daily\.dont\b/);
assert.match(rules, /"do": do/);
assert.match(rules, /"dont": dont/);

// --- New Shelf copy in all five locales; non-EN differs; address locks ---
const copy = {
  "protocols.shelfCaptionMore": {
    en: "{names} +{count} more",
    de: "{names} +{count} weitere",
    es: "{names} +{count} más",
    fr: "{names} +{count} autres",
    nl: "{names} +{count} meer",
  },
  "protocols.shelfAdd": {
    en: "+ Add",
    de: "+ Hinzufügen",
    es: "+ Añadir",
    fr: "+ Ajouter",
    nl: "+ Toevoegen",
  },
  "protocols.shelfViewDay": {
    en: "By time of day",
    de: "Nach Tageszeit",
    es: "Por momento del día",
    fr: "Par moment de la journée",
    nl: "Per moment van de dag",
  },
  "protocols.shelfViewEdit": {
    en: "Edit",
    de: "Bearbeiten",
    es: "Editar",
    fr: "Modifier",
    nl: "Bewerken",
  },
  "protocols.shelfDayCaption": {
    en: "What you take most days, by time of day.",
    de: "Was du an den meisten Tagen nimmst, nach Tageszeit.",
    es: "Lo que tomas casi todos los días, por momento del día.",
    fr: "Ce que tu prends la plupart des jours, par moment de la journée.",
    nl: "Wat je de meeste dagen neemt, per moment van de dag.",
  },
  "protocols.shelfDaySlotEmpty": {
    en: "Nothing set",
    de: "Nichts eingeplant",
    es: "Nada asignado",
    fr: "Rien de prévu",
    nl: "Niets ingepland",
  },
  "protocols.shelfDayUnsetHint": {
    en: "Pick a time in Edit to place these.",
    de: "Wähle unter Bearbeiten eine Zeit, um sie einzuordnen.",
    es: "Elige un momento en Editar para colocarlos.",
    fr: "Choisis un moment dans Modifier pour les placer.",
    nl: "Kies bij Bewerken een moment om ze in te delen.",
  },
  "protocols.shelfDayNotUsual": {
    en: "Also on Shelf: {names}",
    de: "Außerdem auf Shelf: {names}",
    es: "También en Shelf: {names}",
    fr: "Aussi sur Shelf : {names}",
    nl: "Ook op Shelf: {names}",
  },
  "protocols.shelfDayEmpty": {
    en: "Mark what you take most days as Usual, then pick morning, midday or evening.",
    de: "Markiere, was du an den meisten Tagen nimmst, als Usual und wähle dann Morgen, Mittag oder Abend.",
    es: "Marca como Usual lo que tomas casi todos los días y elige mañana, mediodía o noche.",
    fr: "Marque comme Usual ce que tu prends la plupart des jours, puis choisis matin, midi ou soir.",
    nl: "Markeer wat je de meeste dagen neemt als Usual en kies dan ochtend, middag of avond.",
  },
};

for (const [key, expected] of Object.entries(copy)) {
  for (const { id } of locales) {
    const val = valueFor(byId[id], key);
    assert.equal(val, expected[id], `${id} ${key}`);
    if (id !== "en") assert.notEqual(val, expected.en, `${id} ${key} must differ from EN`);
  }
  assert.doesNotMatch(expected.fr, /\bvous\b/, `fr ${key} uses vous`);
  assert.doesNotMatch(expected.de, /\bSie\b/, `de ${key} uses Sie`);
  assert.doesNotMatch(expected.nl, /\bu\b|\buw\b/, `nl ${key} uses u/uw`);
}

// --- Shelf summary is the section title plus a caption, not the first item ---
assert.doesNotMatch(biohack, /shelfNamedOne|shelfNamedMany/);
const shelfAt = biohack.indexOf('data-testid="shelf-disclosure"');
assert.ok(shelfAt > 0, "shelf disclosure");
const summaryStart = biohack.indexOf("<summary", shelfAt);
const summaryEnd = biohack.indexOf("</summary>", summaryStart);
assert.ok(summaryStart > shelfAt && summaryEnd > summaryStart);
const summary = biohack.slice(summaryStart, summaryEnd);
assert.match(summary, /t\("page\.protocols\.shelf"\)/);
assert.match(summary, /text-sm font-semibold text-fg/);
assert.match(summary, /data-testid="shelf-caption"/);
assert.match(summary, /type-caption text-fg-secondary/);
assert.match(summary, /shelfSummaryCaption/);
assert.doesNotMatch(summary, /shelf-add-header/);
assert.match(biohack, /inventory\.slice\(0,\s*3\)/);
assert.match(biohack, /protocols\.shelfCaptionMore/);

// --- Add sits outside summary, reuses openInventory, then focuses the input ---
const addAt = biohack.indexOf('data-testid="shelf-add-header"');
assert.ok(addAt > summaryEnd, "shelf-add-header sits outside summary");
const addBtn = biohack.slice(addAt, addAt + 900);
assert.match(addBtn, /setShelfView\("edit"\)/);
assert.match(addBtn, /openInventory\(\)/);
assert.match(addBtn, /shelfAddInputRef\.current\?\.focus\(\)/);
assert.match(addBtn, /requestAnimationFrame/);
assert.match(addBtn, /absolute right-3 top-2\.5/);
assert.match(addBtn, /min-h-11/);
assert.match(addBtn, /border-growth\/40 bg-growth-soft/);
assert.match(addBtn, /text-growth-ink/);
assert.match(addBtn, /aria-label=\{t\("protocols\.addToShelf"\)\}/);
assert.match(addBtn, /t\("protocols\.shelfAdd"\)/);
assert.match(addBtn, /disabled=\{!user \|\| adding \|\| inventoryLoading \|\| resolvingYou\}/);
assert.match(biohack, /data-testid="shelf-add-input"/);
assert.match(biohack, /ref=\{addInputRef\}/);
assert.match(biohack, /addInputRef=\{shelfAddInputRef\}/);

// --- Kit fact callout is gone from the page ---
assert.doesNotMatch(biohack, /KitFactCallout|kit-fact-callout|kit-fact-empty-cta|kit-fact-open-kit/);

// --- By time of day vs Edit ---
assert.match(biohack, /!inventoryLoading && inventory\.length > 0 \? \(/);
const guard = biohack.indexOf("!inventoryLoading && inventory.length > 0");
const dayBtn = biohack.indexOf('data-testid="shelf-view-day"');
const editBtn = biohack.indexOf('data-testid="shelf-view-edit"');
assert.ok(guard > 0 && guard < dayBtn && dayBtn < editBtn, "empty Shelf shows no toggle");
assert.match(biohack, /aria-pressed=\{shelfView === "day"\}/);
assert.match(biohack, /aria-pressed=\{shelfView === "edit"\}/);
assert.match(biohack, /min-h-11 flex-1/);
assert.match(biohack, /protocols\.shelfViewDay/);
assert.match(biohack, /protocols\.shelfViewEdit/);
assert.match(biohack, /<ShelfDayView/);
assert.match(biohack, /inventoryLoading \|\| inventory\.length === 0 \|\| shelfView === "edit"/);
assert.match(dayView, /function ShelfDayView|export function ShelfDayView/);
assert.match(dayView, /data-testid="shelf-day-view"/);
assert.match(dayView, /data-testid=\{slot\.testId\}/);
assert.match(dayView, /shelf-day-slot-morning/);
assert.match(dayView, /shelf-day-slot-midday/);
assert.match(dayView, /shelf-day-slot-evening/);
assert.match(dayView, /data-testid="shelf-day-slot-unset"/);
assert.match(dayView, /data-testid="shelf-day-not-usual"/);
assert.match(dayView, /protocols\.shelfDayCaption/);
assert.match(dayView, /protocols\.shelfDaySlotEmpty/);
assert.match(dayView, /protocols\.shelfDayUnsetHint/);
assert.match(dayView, /protocols\.shelfDayNotUsual/);
assert.match(dayView, /protocols\.shelfDayEmpty/);
assert.match(dayView, /usual\.when\.clear/);
assert.match(dayView, /protocols\.shelfViewEdit/);
assert.doesNotMatch(dayView, /dose/i);
assert.doesNotMatch(helper, /dose/i);

for (const bucket of ["morning", "midday", "evening", "unset", "notUsual"]) {
  assert.match(helper, new RegExp(`\\b${bucket}\\b`));
}

const items = [
  { id: 1, name: "Magnesium", is_usual: true, usual_when: "evening" },
  { id: 2, name: "Omega-3", is_usual: true, usual_when: "morning" },
  { id: 3, name: "Vitamin D", is_usual: true, usual_when: "morning" },
  { id: 4, name: "Creatine", is_usual: true, usual_when: null },
  { id: 5, name: "Zinc", is_usual: true, usual_when: "" },
  { id: 6, name: "Ashwagandha", is_usual: false, usual_when: "midday" },
  { id: 7, name: "Glycine", usual_when: "evening" },
];
const grouped = groupShelfByWhen(items);
assert.deepEqual(grouped.morning.map((item) => item.name), ["Omega-3", "Vitamin D"]);
assert.deepEqual(grouped.midday.map((item) => item.name), []);
assert.deepEqual(grouped.evening.map((item) => item.name), ["Magnesium"]);
assert.deepEqual(grouped.unset.map((item) => item.name), ["Creatine", "Zinc"]);
assert.deepEqual(grouped.notUsual.map((item) => item.name), ["Ashwagandha", "Glycine"]);

console.log("assert-protocols-shelf-day-view-remove-do-dont PASS");
