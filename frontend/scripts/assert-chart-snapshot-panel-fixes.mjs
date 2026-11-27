/**
 * Chart Snapshot panel fixes (brief 2026-11-25, sha db2c99ba…, pinned to main aab6a29):
 * (1) mobile disclosure scroll pin + one shared sticky-stack offset, (2) other-person Snapshot copy
 * ×5 locales, (3) Deep dive "One more anchor" closer exactly once on all twelve profiles,
 * (4) concrete Valleys Environment copy (self + other-person).
 * Run: npx tsx scripts/assert-chart-snapshot-panel-fixes.mjs
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const sha = (t) => createHash("sha256").update(t).digest("hex");
const words = (s) => s.trim().split(/\s+/).length;
const LOCALES = ["en", "nl"];
const short = await import("../src/lib/essays/snapshotShortCopy.ts");
const env = await import("../src/lib/essays/snapshotEnvironmentCopy.ts");
const other = await import("../src/lib/essays/snapshotOtherPersonCopy.ts");
const { PROFILE_COMBO_ESSAYS } = await import("../src/lib/hdProfileCombos.ts");
const EN = await import("../src/lib/hdCopy.ts");

// --- (1) Scroll: one token, applied to the Snapshot boxes and the Chart anchors ---
const css = read("src/app/globals.css");
assert.match(
  css,
  /--chart-scroll-mt: calc\(var\(--app-header-h, 4\.5rem\) \+ var\(--chart-section-nav-h, 0px\) \+ 0\.75rem\);/,
  "shared offset = header + section nav + 0.75rem (with fallbacks)",
);
assert.equal((css.match(/--chart-scroll-mt:/g) ?? []).length, 1, "one formula, no second token");
const anchorRule = css.match(/((?:#[\w-]+(?: details)?,\s*)+#[\w-]+)\s*\{\s*scroll-margin-top: var\(--chart-scroll-mt\);\s*\}/);
assert.ok(anchorRule, "scroll-margin rule present");
const anchors = anchorRule[1].split(/,\s*/);
for (const sel of ["#snapshot", "#snapshot details", "#bodygraph", "#deep-dive", "#chart-type-box"])
  assert.ok(anchors.includes(sel), `${sel} uses --chart-scroll-mt`);
assert.match(css, /#snapshot,\s*#snapshot details\s*\{\s*overflow-anchor: none;\s*\}/, "overflow-anchor: none on #snapshot + its disclosures");
const disclosure = read("src/components/ChartDisclosure.tsx");
assert.doesNotMatch(disclosure, /\.scrollIntoView\(/, "no scrollIntoView call on open");
assert.match(disclosure, /getComputedStyle\(details\)\.scrollMarginTop/, "clamp reads the same scroll-margin token");
assert.match(disclosure, /Math\.max\(summary\.getBoundingClientRect\(\)\.top, stickyStackBottom\(detailsRef\.current\)\)/, "pin = pre-tap top, clamped below the sticky stack");
assert.match(disclosure, /const onSummaryClick = [^]*?\{\s*capturePin\(\);\s*if \(prefersReducedMotion\(\)\) return;/, "pin captured before the reduced-motion native toggle");
assert.match(disclosure, /useBrowserLayoutEffect\(\(\) => \{[^]*?animateBody\(from, body\.scrollHeight, releasePin\)/, "expand starts in the commit frame (no full-height flash)");
assert.doesNotMatch(disclosure, /requestAnimationFrame\(\(\) => animateBody/, "old next-frame expand removed");
assert.match(disclosure, /onToggle=\{[^]*?releasePin\(\)/, "native toggle path restores the pin");
assert.match(disclosure, /anim\.onfinish = \(\) => \{[^]*?onDone\?\.\(\)/, "pin released after the 220ms animation finishes");

// --- (2) Other-person copy: coverage, budget, {name}, voice, locks, byte pins ---
const sameKeys = (a, b, what) => assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort(), what);
sameKeys(short.SNAPSHOT_STRATEGY_OTHER_COPY, short.SNAPSHOT_STRATEGY_COPY, "other-person Strategy per strategy");
sameKeys(short.SNAPSHOT_DEFINITION_OTHER_COPY, short.SNAPSHOT_DEFINITION_COPY, "other-person Definition per definition");
sameKeys(env.SNAPSHOT_ENVIRONMENT_OTHER_COPY, env.SNAPSHOT_ENVIRONMENT_COPY, "other-person Environment per Color");
const budgeted = [];
for (const map of [short.SNAPSHOT_STRATEGY_OTHER_COPY, short.SNAPSHOT_DEFINITION_OTHER_COPY, env.SNAPSHOT_ENVIRONMENT_OTHER_COPY])
  for (const [key, byLoc] of Object.entries(map)) {
    for (const l of LOCALES) assert.equal(typeof byLoc[l], "string", `${key}: ${l}`);
    for (const l of LOCALES) {
      assert.match(byLoc[l], /\{name\}/, `${key} ${l} names the person`);
      if (l !== "en") assert.notEqual(byLoc[l], byLoc.en, `${key} ${l}: no English fallback`);
      budgeted.push([`${key} ${l}`, l, byLoc[l]]);
    }
  }
for (const l of LOCALES) budgeted.push([`connector ${l}`, l, short.SNAPSHOT_EMOTIONAL_RESPOND_CONNECTOR_OTHER[l]]);
for (const bl of ["en", "nl"]) {
  sameKeys(other.SNAPSHOT_AUTHORITY_PLAIN_OTHER[bl], EN.AUTHORITY_PLAIN, `${bl} other-person Authority per authority`);
  sameKeys(other.SNAPSHOT_OPEN_CENTER_WATCH_OTHER[bl], EN.OPEN_CENTER_WATCH, `${bl} other-person Centers tip per center`);
  sameKeys(other.SNAPSHOT_PROFILE_LINES_OTHER[bl], EN.PROFILE_LINES, `${bl} other-person Profile per line`);
  for (const [k, s] of Object.entries(other.SNAPSHOT_AUTHORITY_PLAIN_OTHER[bl])) budgeted.push([`authority ${k} ${bl}`, bl, s]);
  for (const [k, s] of Object.entries(other.SNAPSHOT_OPEN_CENTER_WATCH_OTHER[bl])) budgeted.push([`center ${k} ${bl}`, bl, s]);
}
for (const [what, l, s] of budgeted) {
  assert.ok(words(s) <= 80 && s.length <= 500, `${what}: ${words(s)}w / ${s.length}c within 80w / 500c`);
  if (l === "en") assert.doesNotMatch(s, /\b(you|your|yours|yourself)\b/i, `${what}: no second person`);
}
const allOther = [...budgeted.map(([, l, s]) => [l, s])];
for (const bl of ["en", "nl"]) {
  for (const s of Object.values(other.SNAPSHOT_PROFILE_LINES_OTHER[bl])) allOther.push([bl, s]);
  allOther.push([bl, other.SNAPSHOT_PROFILE_FALLBACK_OTHER[bl]]);
}
for (const [l, s] of allOther) {
  if (l === "en") assert.doesNotMatch(s, /\b(you|your|yours|yourself)\b/i, `en other-person: ${s}`);
  if (l === "de") assert.doesNotMatch(s, /\b(Sie|Ihr|Ihnen|Ihre)\b/, `de du: ${s}`);
  if (l === "fr") assert.doesNotMatch(s, /\b(vous|votre|vos)\b/i, `fr tu: ${s}`);
  if (l === "fr") assert.ok(!s.includes("'"), `fr uses U+2019: ${s}`);
  if (l === "es") assert.doesNotMatch(s, /\b(usted|ustedes)\b/i, `es tú: ${s}`);
  if (l === "nl") assert.doesNotMatch(s, /\b(u|uw)\b/i, `nl je: ${s}`);
}
// Profile other-person keeps the you-voice shape and length (not shortened).
const p13 = other.snapshotProfileOtherLine("1/3", "en", "Juno");
assert.ok(p13.startsWith("1/3 — Investigator / Martyr.\n\nOutward (line 1): Juno needs a solid foundation"), p13.slice(0, 80));
assert.match(p13, /\n\nUnderneath \(line 3\): Learns by trial and error/);
assert.doesNotMatch(p13, /\{name\}|\byou\b/i);
for (const n of [1, 2, 3, 4, 5, 6])
  assert.ok(Math.abs(words(other.SNAPSHOT_PROFILE_LINES_OTHER.en[n]) - words(EN.PROFILE_LINES[n].brief)) <= 6, `line ${n} same length as you-voice`);
assert.equal(other.snapshotProfileOtherLine("x", "en", "Juno"), "Juno's profile is how they meet the world and how they digest experience.");
assert.equal(other.snapshotProfileOtherLine("1/3", "es", "Juno"), p13);
assert.ok(other.snapshotProfileOtherLine("1/3", "nl", "Juno").includes("Naar buiten (lijn 1): Juno heeft"));
// DE/FR follow today's English Profile / Authority / Centers bundles.
assert.equal(other.snapshotProfileOtherLine("1/3", "de", "Juno"), p13);
assert.equal(other.snapshotAuthorityOtherPlain("Emotional (Solar Plexus)", "fr", "Juno"), "Juno's clear answers arrive after feelings move — big calls need a night's sleep.");
assert.equal(other.snapshotCenterOtherTip("Sacral", "en", "Juno"), "Juno does not have a consistent work motor — rest is strategy, not failure.");
assert.equal(short.snapshotStrategyOtherCopy("To Inform", "en", "Juno").slice(0, 34), "Juno is designed to start, but to ");
assert.equal(env.snapshotEnvironmentCopy("Workshops", "en", "Juno").slice(0, 21), "Juno does best in a w");
assert.equal(env.snapshotEnvironmentCopy("Workshops", "en"), env.SNAPSHOT_ENVIRONMENT_COPY.Workshops.en, "self chart keeps you-voice");
// Byte pins of the locked maps (Environment other-person is pinned in the Environment assert).
assert.equal(
  sha(JSON.stringify([short.SNAPSHOT_STRATEGY_OTHER_COPY, short.SNAPSHOT_DEFINITION_OTHER_COPY, short.SNAPSHOT_EMOTIONAL_RESPOND_CONNECTOR_OTHER])),
  "419cba1cc35ac93441b7b9e494663d3583b09c5675ea3e9bae92d5232a3f76b0",
  "locked other-person Strategy / Definition / connector unchanged",
);
assert.equal(
  sha(JSON.stringify([other.SNAPSHOT_AUTHORITY_PLAIN_OTHER, other.SNAPSHOT_OPEN_CENTER_WATCH_OTHER, other.SNAPSHOT_PROFILE_LINES_OTHER, other.SNAPSHOT_PROFILE_FALLBACK_OTHER])),
  "a4ad2d13415a74fda61aa50609136e3dff8b165eeacb08d5a62b01dc962de0fd",
  "other-person Profile / Authority / Centers overlay unchanged",
);
// Page wiring: Type box gate, every Snapshot body switches, titles untouched.
// Brief 17353706…: chartVoiceName feeds snapshotPersonName (you only on your own chart).
const profile = read("src/app/profile/page.tsx");
assert.match(
  profile,
  /const chartPersonName = chartVoiceName\(\{[\s\S]*?\}\);\s*const snapshotPersonName = chartPersonName;/,
  "chartVoiceName feeds snapshotPersonName",
);
const snapshot = profile.slice(profile.indexOf('id="snapshot"'), profile.indexOf("<ChartDeepDive"));
for (const call of [
  // Brief 17353706…: Profile briefs open through snapshotProfileLine.
  "snapshotProfileLine(profileStr, locale, snapshotPersonName)",
  "snapshotStrategyOtherCopy(strategyStr, locale, snapshotPersonName)",
  "snapshotAuthorityOtherPlain(authorityStr, locale, snapshotPersonName)",
  "SNAPSHOT_EMOTIONAL_RESPOND_CONNECTOR_OTHER[locale]",
  "snapshotCenterOtherTip(w.center, locale, snapshotPersonName)",
  "snapshotDefinitionOtherCopy(definitionStr, locale, snapshotPersonName)",
  "snapshotEnvironmentCopy(environmentName, locale, snapshotPersonName)",
])
  assert.ok(snapshot.includes(call), `Snapshot uses ${call}`);
assert.doesNotMatch(snapshot, /label=\{[^}]*snapshotPersonName/, "titles stay as they are");
for (const f of ["src/lib/hdCopy.ts", "src/lib/essays/hdCopy.es.ts", "src/lib/essays/hdCopy.nl.ts", "src/components/ChartDeepDive.tsx"])
  assert.doesNotMatch(read(f), /snapshotPersonName|OTHER_COPY/, `${f} not touched by other-person overlays`);

// Official UX B1: locked help ×5 locales, unchanged self caption, person and locale switching.
const { catalogs } = await import("../src/lib/i18n/messages/index.ts");
const { resolveHdCopy } = await import("../src/lib/essays/resolveHdCopy.ts");
const HELP_SELF = {
  "en": "Open centers — where you can pick up other people’s energy (energy leaks to notice).",
  "nl": "Open centra — waar je de energie van anderen kunt oppikken (energielekken om op te merken)."
};
const HELP_OTHER = {
  "en": "Open centers — where {name} can pick up other people’s energy (energy leaks to notice).",
  "de": "Offene Zentren — wo {name} die Energie anderer aufnehmen kann (Energielecks, die es zu bemerken gilt).",
  "es": "Centros abiertos — donde {name} puede recoger la energía de otras personas (fugas de energía a notar).",
  "fr": "Centres ouverts — là où {name} peut prendre l’énergie des autres (fuites d’énergie à remarquer).",
  "nl": "Open centra — waar {name} de energie van anderen kan oppikken (energielekken om op te merken)."
};
assert.deepEqual(other.SNAPSHOT_CENTERS_HELP_OTHER, HELP_OTHER);
for (const l of LOCALES) {
  assert.equal(catalogs[l]["chart.people.openCentersHelp"], HELP_SELF[l], `${l} self unchanged`);
  assert.equal(other.snapshotCentersOtherHelp(l, "Juno"), HELP_OTHER[l].replace("{name}", "Juno"));
  assert.doesNotMatch(other.snapshotCentersOtherHelp(l, "Juno"), /\b(you|du|tu|tú|je|vous|Sie|usted|uw)\b/);
}
assert.match(snapshot, /snapshotPersonName\s*\? snapshotCentersOtherHelp\(locale, snapshotPersonName\)\s*: t\("chart\.people\.openCentersHelp"\)/, "help shares tips person gate");
for (const l of ["en", "nl", "en"]) {
  for (const name of ["Juno", "", "Vale", ""]) {
    const help = name ? other.snapshotCentersOtherHelp(l, name) : catalogs[l]["chart.people.openCentersHelp"];
    const tip = name ? other.snapshotCenterOtherTip("Sacral", l, name) : resolveHdCopy(l).OPEN_CENTER_WATCH.Sacral;
    if (name) {
      assert.ok(help.includes(name) && tip.includes(name));
      assert.doesNotMatch(help + tip, /\b(you|your|puedes|tienes|tu)\b/i);
    } else {
      assert.equal(help, HELP_SELF[l]);
      assert.doesNotMatch(help + tip, /Juno|Vale/);
    }
  }
}

// --- (3) Deep dive: closer exactly once on all twelve official profiles ---
const CLOSER =
  "One more anchor\nReturn to Strategy and Authority before you force this profile to perform. Profile describes flavour and pacing; it is not a license to override the body’s yes. Use the sections above as a mirror, not a script. Educational Human Design is a language for self-understanding — not medical advice, not a verdict, and not a reason to shame your timing.";
const OFFICIAL = ["1/3", "1/4", "2/4", "2/5", "3/5", "3/6", "4/6", "4/1", "5/1", "5/2", "6/2", "6/3"];
assert.deepEqual(Object.keys(PROFILE_COMBO_ESSAYS).sort(), [...OFFICIAL].sort(), "twelve official combos");
for (const key of OFFICIAL) {
  const essay = PROFILE_COMBO_ESSAYS[key];
  assert.equal(essay.split(CLOSER).length - 1, 1, `${key}: closer exactly once`);
  assert.equal((essay.match(/One more anchor/g) ?? []).length, 1, `${key}: one "One more anchor" heading`);
  assert.ok(essay.trimEnd().endsWith(CLOSER), `${key}: closer is the last paragraph`);
  assert.equal(EN.profileLearnMore(key), essay, `${key}: Deep dive reads this essay`);
}

// --- (4) Valleys: concrete you-voice (self) + other-person, budget, locks ---
for (const l of LOCALES) {
  for (const s of [env.SNAPSHOT_ENVIRONMENT_COPY.Valleys[l], env.SNAPSHOT_ENVIRONMENT_OTHER_COPY.Valleys[l]])
    assert.ok(words(s) <= 80 && s.length <= 500, `Valleys ${l}: ${words(s)}w / ${s.length}c`);
}
assert.ok(env.SNAPSHOT_ENVIRONMENT_COPY.Valleys.en.startsWith("You settle best on low, busy ground — a ground-floor desk, a café"), "Valleys you-voice rewritten");
assert.match(env.SNAPSHOT_ENVIRONMENT_COPY.Valleys.en, /This week, do at least one working block in a low place where people pass by/, "concrete weekly test");
assert.match(env.SNAPSHOT_ENVIRONMENT_OTHER_COPY.Valleys.en, /^\{name\} settles best on low, busy ground[^]*A useful test: one working block this week/);
assert.doesNotMatch(env.SNAPSHOT_ENVIRONMENT_COPY.Valleys.en, /news flow past/, "old Valleys copy gone");

console.log("PASS assert-chart-snapshot-panel-fixes: one shared sticky offset (#snapshot, its boxes, #bodygraph, #deep-dive, #chart-type-box) + overflow-anchor none + scroll pin without scrollIntoView; other-person Snapshot copy ×5 locales (Type box gate, titles unchanged, locks, budgets); Deep dive closer exactly once ×12 profiles; concrete Valleys self + other-person.");
