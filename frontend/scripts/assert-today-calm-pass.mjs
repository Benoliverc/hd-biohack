/**
 * Source-level plus pure-function checks for the Today calm pass.
 * Run: npx tsx scripts/assert-today-calm-pass.mjs
 *
 * Untouched-file pins are from main 87bd4665 (PR #157), except BodyGraph.tsx
 * and bodygraphGeometry.ts, whose pins are unchanged from 9a9bac51.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { messages as enMessages } from "../src/lib/i18n/messages/en.ts";
import { skyCompletesPick, skyCompletesText } from "../src/lib/bridgedChannels.ts";
import { yourWayKeys } from "../src/lib/todayYourWay.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function sha(text) {
  return createHash("sha256").update(text).digest("hex");
}

function keysOf(src) {
  const keys = [];
  const re = /^\s*['"]([^'"]+)['"]\s*:/gm;
  let m;
  while ((m = re.exec(src))) keys.push(m[1]);
  return keys;
}

function valueOf(src, key) {
  const re = new RegExp(
    `['"]${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]\\s*:\\s*(['"])([\\s\\S]*?)\\1`
  );
  const m = src.match(re);
  assert.ok(m, `missing value for ${key}`);
  return m[2].replace(/\\'/g, "'").replace(/\\"/g, '"');
}

function openingTag(src, needle) {
  const idx = src.indexOf(needle);
  assert.ok(idx >= 0, `missing ${needle}`);
  const start = src.lastIndexOf("<", idx);
  assert.ok(start >= 0, `no tag around ${needle}`);
  let i = start + 1;
  let brace = 0;
  let quote = null;
  while (i < src.length) {
    const ch = src[i];
    if (quote) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      i += 1;
      continue;
    }
    if (ch === "{") {
      brace += 1;
      i += 1;
      continue;
    }
    if (ch === "}") {
      brace = Math.max(0, brace - 1);
      i += 1;
      continue;
    }
    if (ch === ">" && brace === 0) return src.slice(start, i + 1);
    i += 1;
  }
  assert.fail(`unterminated tag around ${needle}`);
}

function frozenPin(rel) {
  const src = read("scripts/assert-deep-dive-type-profile-headings.mjs");
  const re = new RegExp(
    `"${rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}":\\s*"([a-f0-9]{64})"`
  );
  const m = src.match(re);
  assert.ok(m, `missing frozen pin for ${rel}`);
  return m[1];
}

function t(key, vars) {
  const raw = enMessages[key];
  assert.equal(typeof raw, "string", `missing en message ${key}`);
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name) =>
    vars[name] != null ? String(vars[name]) : `{${name}}`
  );
}

const todayInd = read("src/components/TodayIndication.tsx");
const transits = read("src/app/transits/page.tsx");
const pkg = read("package.json");
const soul = {
  en: read("src/lib/i18n/messages/todaySoul.en.ts"),
  de: read("src/lib/i18n/messages/todaySoul.de.ts"),
  es: read("src/lib/i18n/messages/todaySoul.es.ts"),
  fr: read("src/lib/i18n/messages/todaySoul.fr.ts"),
  nl: read("src/lib/i18n/messages/todaySoul.nl.ts"),
};

assert.ok(
  pkg.includes(
    '"assert:today-calm-pass": "npx tsx scripts/assert-today-calm-pass.mjs"'
  ),
  "package.json wires assert:today-calm-pass"
);

// --- 2. Unbox ---
const indicationTag = openingTag(todayInd, 'data-testid="today-indication"');
for (const forbidden of ["rounded-2xl", "border", "bg-elevated", "shadow-soft"]) {
  assert.ok(!indicationTag.includes(forbidden), `today-indication tag has ${forbidden}`);
}

const actionTag = openingTag(todayInd, 'data-testid="main-action"');
for (const forbidden of ["border-growth/25", "ring-1", "shadow-soft", "bg-canvas"]) {
  assert.ok(!actionTag.includes(forbidden), `main-action tag has ${forbidden}`);
}
assert.match(actionTag, /moveDone \? "today-move-achieved"/);

for (const id of ["today-move-closure", "today-evening-close", "hd-fact-of-the-day"]) {
  const tag = openingTag(todayInd, `data-testid="${id}"`);
  assert.ok(!tag.includes("rounded-xl"), `${id} tag has rounded-xl`);
  assert.ok(!tag.includes("bg-sunken"), `${id} tag has bg-sunken`);
}
for (const id of ["today-evening-close", "hd-fact-of-the-day"]) {
  const tag = openingTag(todayInd, `data-testid="${id}"`);
  assert.match(tag, /border-t border-border/, `${id} is a hairline section`);
}

const skyDetailsTag = openingTag(transits, 'data-testid="today-sky-details"');
for (const forbidden of ["rounded-2xl", "bg-elevated", "shadow-soft"]) {
  assert.ok(!skyDetailsTag.includes(forbidden), `today-sky-details tag has ${forbidden}`);
}
for (const id of [
  "today-sun-earth",
  "today-bridged-channels",
  "today-newly-defined",
  "today-planetary-gates",
]) {
  const tag = openingTag(transits, `id="${id}"`);
  for (const forbidden of ["rounded-2xl", "shadow-soft", "bg-energy/10"]) {
    assert.ok(!tag.includes(forbidden), `${id} tag has ${forbidden}`);
  }
}
assert.equal((transits.match(/rounded-2xl/g) || []).length, 1, "transits/page rounded-2xl count");
assert.equal((todayInd.match(/rounded-2xl/g) || []).length, 3, "TodayIndication rounded-2xl count");

// --- 3. Kept ---
const statusAt = todayInd.indexOf('data-testid="main-action-status"');
const asideStart = todayInd.lastIndexOf("<aside", statusAt);
const asideEnd = todayInd.indexOf("</aside>", statusAt);
assert.ok(asideStart >= 0 && asideEnd > asideStart, "Energy/Space aside block found");
const aside = todayInd.slice(asideStart, asideEnd + "</aside>".length);
assert.equal(
  sha(aside),
  "e7b75d50a8b5d5b966114763fd5ccab77ff5469685b8e76b5b4ae64a592130ba",
  "main-action-status aside is byte-identical to main 87bd4665"
);
assert.match(
  openingTag(todayInd, 'data-testid="today-kit-line"'),
  /bg-elevated\/80/,
  "today-kit-line keeps bg-elevated/80"
);
assert.match(transits, /<details/);
assert.match(skyDetailsTag, /open=\{skyDetailsOpen\}/);

// --- 4. Your way ---
const TYPE_KEYS = {
  Generator: "today.yourWay.type.generator",
  "Manifesting Generator": "today.yourWay.type.manifestingGenerator",
  Manifestor: "today.yourWay.type.manifestor",
  Projector: "today.yourWay.type.projector",
  Reflector: "today.yourWay.type.reflector",
};
const AUTHORITY_KEYS = {
  Sacral: "today.yourWay.authority.sacral",
  "Emotional (Solar Plexus)": "today.yourWay.authority.emotional",
  Splenic: "today.yourWay.authority.splenic",
  "Ego / Heart": "today.yourWay.authority.ego",
  "Self-Projected": "today.yourWay.authority.selfProjected",
  "Mental / Environmental (Outer Authority)": "today.yourWay.authority.mental",
  Lunar: "today.yourWay.authority.lunar",
};
for (const [type, typeKey] of Object.entries(TYPE_KEYS)) {
  for (const [authority, authorityKey] of Object.entries(AUTHORITY_KEYS)) {
    assert.deepEqual(yourWayKeys(type, authority), { typeKey, authorityKey });
  }
  assert.deepEqual(yourWayKeys(type, null), { typeKey, authorityKey: null });
  assert.deepEqual(yourWayKeys(type, ""), { typeKey, authorityKey: null });
}
assert.equal(yourWayKeys("", "Sacral"), null);
assert.equal(yourWayKeys("Unknown", "Lunar"), null);
assert.equal(yourWayKeys(null, null), null);

function renderYourWay(type, authority) {
  const keys = yourWayKeys(type, authority);
  assert.ok(keys, `expected keys for ${type}`);
  return t(keys.typeKey, {
    authority: keys.authorityKey ? ` ${t(keys.authorityKey)}` : "",
  });
}
assert.equal(
  renderYourWay("Projector", "Splenic"),
  "As a Projector, today you wait for the invitation and trust the quiet hit in the moment."
);
assert.equal(
  renderYourWay("Projector", null),
  "As a Projector, today you wait for the invitation."
);

const typeIdx = todayInd.indexOf('data-testid="today-type-strategy"');
const whyIdx = todayInd.indexOf('data-testid="main-action-why-details"');
assert.ok(typeIdx > 0 && typeIdx < whyIdx, "today-type-strategy precedes main-action-why-details");
assert.match(todayInd, /data-testid="today-natal-type"/);
assert.match(todayInd, /data-testid="today-natal-strategy"/);
assert.match(todayInd, /data-your-way="fallback"/);
assert.match(todayInd, /data-your-way="sentence"/);

// --- 5. Sky completes ---
assert.equal(skyCompletesPick([], "2026-11-27"), null);
assert.equal(
  skyCompletesPick(
    [
      {
        gates: [23, 43],
        name: "Structuring",
        centers: ["Ajna", "Throat"],
        natal_gates: [],
        transit_gates: [23, 43],
        kind: "transit_transit",
        window_start: "2026-11-27",
      },
    ],
    "2026-11-27"
  ),
  null
);
assert.equal(
  skyCompletesPick(
    [
      {
        gates: [16, 48],
        name: "The Wavelength",
        centers: ["Spleen", "Throat"],
        natal_gates: [],
        transit_gates: [48],
        kind: "hanging",
        window_start: "2026-11-27",
      },
    ],
    "2026-11-27"
  ),
  null
);

const older = {
  gates: [1, 8],
  name: "Inspiration",
  centers: ["G", "Throat"],
  natal_gates: [1],
  transit_gates: [8],
  kind: "hanging",
  window_start: "2026-11-01",
};
const today = {
  gates: [48, 16],
  name: "The Wavelength",
  centers: ["Spleen", "Throat"],
  natal_gates: [16],
  transit_gates: [48],
  kind: "hanging",
  window_start: "2026-11-27",
};
const later = {
  gates: [10, 20],
  name: "Awakening",
  centers: ["G", "Throat"],
  natal_gates: [10],
  transit_gates: [20],
  kind: "hanging",
  window_start: "2026-11-20",
};
const picked = skyCompletesPick([older, today, later], "2026-11-27");
assert.equal(picked.lead.name, "The Wavelength");
assert.equal(picked.more, 2);
const firstEligible = skyCompletesPick([older, later], "2026-11-27");
assert.equal(firstEligible.lead.name, "Inspiration");
assert.equal(firstEligible.more, 1);

assert.equal(
  skyCompletesText(today, t),
  "Today\u2019s Gate 48 completes your Channel 16\u201348, The Wavelength, joining Spleen and Throat."
);

const blockAt = todayInd.indexOf('data-testid="today-sky-block"');
const signalAt = todayInd.indexOf('data-testid="daily-signal"');
const completesAt = todayInd.indexOf('data-testid="today-sky-completes"');
const storyAt = todayInd.indexOf('data-testid="sky-story"');
assert.ok(
  blockAt > 0 && signalAt > blockAt && completesAt > signalAt && storyAt > completesAt,
  "today-sky-completes sits after daily-signal and before sky-story, inside today-sky-block"
);
assert.ok(
  !openingTag(todayInd, 'data-testid="today-sky-completes"').includes("today-sky-block"),
  "today-sky-completes must not contain the substring today-sky-block"
);
assert.match(todayInd, /onOpenSkyDetails\("today-bridged-channels"\)/);
assert.match(
  openingTag(todayInd, 'data-testid="today-sky-completes-open"'),
  /min-h-11/
);
assert.match(transits, /SKY_DETAILS_JUMP_IDS/);
assert.match(transits, /"today-bridged-channels"/);

// --- 6. i18n ---
const NEW_KEYS = [
  "today.yourWay.type.generator",
  "today.yourWay.type.manifestingGenerator",
  "today.yourWay.type.manifestor",
  "today.yourWay.type.projector",
  "today.yourWay.type.reflector",
  "today.yourWay.authority.sacral",
  "today.yourWay.authority.emotional",
  "today.yourWay.authority.splenic",
  "today.yourWay.authority.ego",
  "today.yourWay.authority.selfProjected",
  "today.yourWay.authority.mental",
  "today.yourWay.authority.lunar",
  "today.skyCompletes.line",
  "today.skyCompletes.open",
  "today.skyCompletes.more",
];
assert.equal(NEW_KEYS.length, 15);
const TYPE_NAME = {
  "today.yourWay.type.generator": "Generator",
  "today.yourWay.type.manifestingGenerator": "Manifesting Generator",
  "today.yourWay.type.manifestor": "Manifestor",
  "today.yourWay.type.projector": "Projector",
  "today.yourWay.type.reflector": "Reflector",
};
const formal = /\bSie\b|\bIhr\b|\bvous\b|\busted\b|\bu\b/;
for (const loc of ["en", "de", "es", "fr", "nl"]) {
  const keys = keysOf(soul[loc]);
  for (const key of NEW_KEYS) {
    assert.ok(keys.includes(key), `${loc} missing ${key}`);
    const value = valueOf(soul[loc], key);
    assert.ok(value.trim().length > 0, `${loc} ${key} is empty`);
    if (loc !== "en") {
      assert.notEqual(value, valueOf(soul.en, key), `${loc} ${key} must not be an English copy`);
      assert.doesNotMatch(value, formal, `${loc} ${key} uses a formal register`);
    }
  }
  for (const [key, name] of Object.entries(TYPE_NAME)) {
    assert.ok(valueOf(soul[loc], key).includes(name), `${loc} ${key} keeps English ${name}`);
  }
}
for (const loc of ["en", "de", "es", "fr", "nl"]) {
  const path = `src/lib/i18n/messages/${loc}.ts`;
  assert.equal(sha(read(path)), frozenPin(path), `${path} unchanged vs deep-dive pins`);
}

// --- 7. Untouched ---
assert.equal(
  sha(read("src/components/BodyGraph.tsx")),
  "8f9380005b90a2b6e34190650a599c248d79e84e13c99e15ea9086d5b3dd2da8"
);
assert.equal(
  sha(read("src/lib/bodygraphGeometry.ts")),
  "cc8c5433776ee2e8758f95f868597a5821f8077eec8a92ec7bcb6cad15f1b743"
);
// Brief 17353706… carries #152's Deep dive scroll-margin into globals.css.
// Rebase onto febe34f: lift this pin to those bytes. No other calm-pass edit.
assert.equal(
  sha(read("src/app/globals.css")),
  "265abe009ba6d3aa4d694e22a58177acdda8aae21ba44bae92321f71a4844e5e"
);
assert.equal(
  sha(read("src/app/biohack/page.tsx")),
  "abe27ee37dc12f88a780298195bcd0803dede6b475013a10cc63fa77d097c203"
);

const PROTOCOL_SHA = {
  "src/components/protocols/BaselineKitCard.tsx":
    "785b052c0af855febf9d754174472a2fb805ba668775ebd4ab8a90aa8fa1a9b1",
  "src/components/protocols/KitStrip.tsx":
    "8568202b69f9e0998fb694b7d4488182f7860ad2bf336958ebc18b09e36b98ac",
  "src/components/protocols/ShelfDayView.tsx":
    "121c55b07c33433053a5af63a0d9006590f30b2c4acf06329fcefbe94482c4ba",
  "src/components/protocols/TodaysMoveCard.tsx":
    "81580ad283a1ed06c63d3d89c7854727bf45f9ffac4060ce046e77df75216f6a",
  "src/components/protocols/constants.ts":
    "09dfe539efa0e0d92801d99d5bffefcf38fbfd7ce97d11de2bc37f7754196546",
  "src/components/protocols/index.ts":
    "f708f448995a82c6fdcf111f130b2de095681852d259a37bae9a9e0a6553f0e0",
  "src/components/protocols/shelfDay.ts":
    "6282a89cf802e6a331ec8a87ad56ce0e3e2c9eba8fd1ab04dfef55cbbcf7556b",
  "src/components/protocols/types.ts":
    "c5ee4863414bce2b4639f8d5e906bbe3652f5919a2b646be1caa84c2591571bd",
};
const protocolDir = resolve(root, "src/components/protocols");
const protocolFiles = readdirSync(protocolDir)
  .filter((name) => !name.startsWith("."))
  .map((name) => `src/components/protocols/${name}`)
  .sort();
assert.deepEqual(protocolFiles, Object.keys(PROTOCOL_SHA).sort());
for (const [rel, hash] of Object.entries(PROTOCOL_SHA)) {
  assert.equal(sha(read(rel)), hash, `${rel} byte-identical to main 87bd4665`);
}
console.log("assert-today-calm-pass: ok");
