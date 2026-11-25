/**
 * Day 7 five fixes: Move headline novelty, Soul switch, Shelf/kit honesty,
 * one Type explanation, Earlier weeks control.
 * Run: npx tsx scripts/assert-day7-five-fixes.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(resolve(root, rel), "utf8");

const todayInd = read("src/components/TodayIndication.tsx");
const earlier = read("src/components/EarlierWeeksHistory.tsx");
const soulPage = read("src/app/soul/page.tsx");
const biohack = read("src/app/biohack/page.tsx");
const deepDive = read("src/components/ChartDeepDive.tsx");
const typeBox = read("src/components/ChartTypeBox.tsx");
const prescription = read("../backend/app/checkin/prescription.py");
const derive = read("../backend/app/checkin/derive.py");
const routes = read("../backend/app/api/routes.py");
const locales = ["en", "de", "es", "fr", "nl"];
const msgs = Object.fromEntries(locales.map((l) => [l, read(`src/lib/i18n/messages/${l}.ts`)]));
// Catalog value for a key, single- or double-quoted; null when missing.
function msg(l, key) {
  const k = key.replace(/\./g, "\\.");
  const m = msgs[l].match(new RegExp(`(["'])${k}\\1:\\s*(["'])((?:\\\\.|(?!\\2).)*)\\2`));
  return m ? m[3] : null;
}

// 1. Move: concrete action leads when the sky moved; no own reprint; no same-day twin across accounts.
assert.match(prescription, /RECENT_MOVE_WINDOW_DAYS = 7/);
assert.match(prescription, /concrete: tuple\[str, str\] \| None = None/);
assert.match(prescription, /def _served_today\(/);
assert.match(prescription, /avoid_today_texts/);
assert.match(prescription, /never yesterday's/);
assert.match(prescription, /concrete_action=\(/);
assert.match(routes, /return history, avoid, avoid_today/);
assert.match(routes, /ProtocolCompletion\.day >= completion_day - timedelta\(days=RECENT_MOVE_WINDOW_DAYS\)/);
assert.match(derive, /avoid_move_texts_today/);
// Why this does not repeat the headline when the Space action is the headline.
assert.match(todayInd, /micro && micro\.trim\(\) === moveText\.trim\(\) \? "" : micro/);

// 2. Soul: a reading is keyed to the person it was requested for; switching never shows the previous person.
assert.match(soulPage, /useState<\{ friendId: number; data: SoulSyncResult \} \| null>/);
assert.match(soulPage, /const result = reading && reading\.friendId === friendId \? reading\.data : null;/);
assert.match(soulPage, /res\.friend\.id !== requestedFor\) return;/);
assert.doesNotMatch(soulPage, /\bsetResult\(/);

// 3. Shelf/kit: banner names the item that changed; kit pick + fact refresh with the shelf; ticked pick is kept.
assert.match(biohack, /removedPlanRefreshed/);
assert.match(biohack, /addedPlanRefreshed/);
assert.match(biohack, /function dropShelfItemFromIndication\(/);
assert.match(biohack, /setIndication\(\(prev\) => dropShelfItemFromIndication\(prev, |setIndication\(dropShelfItemFromIndication|dropShelfItemFromIndication\(/);
assert.match(biohack, /protocolReq/);
assert.match(routes, /def _done_kit_pick_ids\(/);
assert.match(prescription, /pinned_kit_item_ids/);
for (const l of locales) assert.ok(msg(l, "protocols.addedPlanRefreshed")?.includes("{name}"), `${l} addedPlanRefreshed`);

// 4. Chart: Type is explained once (Type box under the Bodygraph); Deep dive only points to it.
assert.doesNotMatch(deepDive, /TYPE_COPY/);
assert.doesNotMatch(deepDive, /<Accordion\s+title="Type"/);
assert.match(deepDive, /data-testid="deep-dive-type-pointer"/);
assert.match(deepDive, /href="#chart-type-box"/);
assert.match(typeBox, /id="chart-type-box"/);
for (const l of locales) {
  assert.ok(!msgs[l].includes("chart.deepDive.typeBlurb"), `${l} old typeBlurb`);
  const v = msg(l, "chart.deepDive.typePointer");
  assert.ok(v, `${l} typePointer`);
  // Feature names stay English in every locale.
  assert.ok(/Type/.test(v) && /Bodygraph/.test(v) && v.includes("{type}"), `${l} typePointer names`);
}

// 5. Earlier weeks: one control opens and closes; it stays clear of the sticky header.
assert.match(todayInd, /setHistoryOpen\(\(v\) => !v\)/);
assert.match(todayInd, /aria-expanded=\{historyOpen\}/);
assert.match(todayInd, /aria-controls="today-earlier-weeks"/);
assert.match(todayInd, /regionId="today-earlier-weeks"/);
assert.doesNotMatch(todayInd, /historyRef\.current\?\.scrollIntoView/);
assert.doesNotMatch(todayInd, /onOpenChange=\{setHistoryOpen\}/);
assert.match(earlier, /hidden=\{!open\}/);
assert.match(earlier, /regionId/);

// Locale voice locks on the new strings: FR tu, DE du, ES tú, NL je (no formal forms).
const newKeys = ["chart.deepDive.typePointer", "protocols.addedPlanRefreshed"];
const formal = { de: /\b(Sie|Ihr|Ihnen|Ihre)\b/, fr: /\b(vous|votre|vos)\b/i, es: /\b(usted|ustedes|su )\b/i, nl: /\b(u|uw)\b/ };
for (const [l, rx] of Object.entries(formal)) {
  for (const k of newKeys) {
    const v = msg(l, k);
    assert.ok(v, `${l} ${k}`);
    assert.ok(!rx.test(v), `${l} ${k} formal voice: ${v}`);
  }
}

console.log("assert-day7-five-fixes: OK");
