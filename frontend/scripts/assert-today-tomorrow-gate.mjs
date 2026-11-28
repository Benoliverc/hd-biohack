/**
 * Name tomorrow's gate — localizeTomorrow uses moon/sun gate numbers.
 * Run: npx tsx scripts/assert-today-tomorrow-gate.mjs
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const sha = (text) => createHash("sha256").update(text).digest("hex");

const { localizeTomorrow } = await import("../src/lib/todayCopy.ts");
const { translate } = await import("../src/lib/i18n/I18nProvider.tsx");
const { resolveLocale } = await import("../src/lib/i18n/types.ts");

const tEn = (key, vars) => translate("en", key, vars);
const tNl = (key, vars) => translate("nl", key, vars);

const OLD = {
  en: {
    moon_leaves: "Tomorrow: Moon leaves this gate",
    moon_holds: "Tomorrow: Moon holds this gate",
    sun_theme_leaves: "Tomorrow: Sun theme turns",
    sun_theme_holds: "Tomorrow: Sun theme holds",
  },
  nl: {
    moon_leaves: "Morgen: de Maan verlaat deze poort",
    moon_holds: "Morgen: de Maan blijft in deze poort",
    sun_theme_leaves: "Morgen: het Zon-thema draait",
    sun_theme_holds: "Morgen: het Zon-thema blijft",
  },
};

const NAMED = {
  en: {
    moon_leaves: "Tomorrow the Moon moves into Gate 9",
    moon_holds: "Tomorrow the Moon stays in Gate 41",
    sun_theme_leaves: "Tomorrow the Sun theme turns to Gate 11",
    sun_theme_holds: "Tomorrow the Sun theme stays in Gate 11",
  },
  nl: {
    moon_leaves: "Morgen trekt de Maan naar poort 9",
    moon_holds: "Morgen blijft de Maan in poort 41",
    sun_theme_leaves: "Morgen draait het Zon-thema naar poort 11",
    sun_theme_holds: "Morgen blijft het Zon-thema in poort 11",
  },
};

function indication(kind, gates) {
  if (!kind) return { sky_story: { lines: [], tomorrow: null } };
  return {
    sky_story: {
      lines: ["Moon in Gate 8."],
      tomorrow: { kind, text: "backend text stays unused", ...gates },
    },
  };
}

const ROWS = [
  ["moon_leaves", { moon_gate_today: 8, moon_gate_tomorrow: 9 }],
  ["moon_holds", { moon_gate_today: 41, moon_gate_tomorrow: 41 }],
  ["sun_theme_leaves", { sun_gate_today: 26, sun_gate_tomorrow: 11 }],
  ["sun_theme_holds", { sun_gate_today: 11, sun_gate_tomorrow: 11 }],
];

for (const locale of ["en", "nl"]) {
  const t = locale === "en" ? tEn : tNl;
  for (const [kind, gates] of ROWS) {
    assert.equal(
      localizeTomorrow(indication(kind, gates), t),
      NAMED[locale][kind],
      `${locale} ${kind} names the gate`,
    );
  }
}

const BAD = [undefined, null, 0, 65, 9.5, "9"];
for (const bad of BAD) {
  assert.equal(
    localizeTomorrow(indication("moon_leaves", { moon_gate_tomorrow: bad }), tEn),
    OLD.en.moon_leaves,
    `en moon_leaves fallback ${String(bad)}`,
  );
  assert.equal(
    localizeTomorrow(indication("moon_leaves", { moon_gate_tomorrow: bad }), tNl),
    OLD.nl.moon_leaves,
    `nl moon_leaves fallback ${String(bad)}`,
  );
  assert.equal(
    localizeTomorrow(
      indication("moon_holds", { moon_gate_tomorrow: bad, moon_gate_today: bad }),
      tEn,
    ),
    OLD.en.moon_holds,
    `en moon_holds fallback ${String(bad)}`,
  );
  assert.equal(
    localizeTomorrow(
      indication("moon_holds", { moon_gate_tomorrow: bad, moon_gate_today: bad }),
      tNl,
    ),
    OLD.nl.moon_holds,
    `nl moon_holds fallback ${String(bad)}`,
  );
  assert.equal(
    localizeTomorrow(indication("sun_theme_leaves", { sun_gate_tomorrow: bad }), tEn),
    OLD.en.sun_theme_leaves,
    `en sun_theme_leaves fallback ${String(bad)}`,
  );
  assert.equal(
    localizeTomorrow(indication("sun_theme_leaves", { sun_gate_tomorrow: bad }), tNl),
    OLD.nl.sun_theme_leaves,
    `nl sun_theme_leaves fallback ${String(bad)}`,
  );
  assert.equal(
    localizeTomorrow(
      indication("sun_theme_holds", { sun_gate_tomorrow: bad, sun_gate_today: bad }),
      tEn,
    ),
    OLD.en.sun_theme_holds,
    `en sun_theme_holds fallback ${String(bad)}`,
  );
  assert.equal(
    localizeTomorrow(
      indication("sun_theme_holds", { sun_gate_tomorrow: bad, sun_gate_today: bad }),
      tNl,
    ),
    OLD.nl.sun_theme_holds,
    `nl sun_theme_holds fallback ${String(bad)}`,
  );
}

assert.equal(localizeTomorrow({}, tEn), "");
assert.equal(localizeTomorrow({ sky_story: null }, tEn), "");
assert.equal(localizeTomorrow({ sky_story: { lines: [] } }, tNl), "");

// Holds / stays with only today's gate still name that gate.
assert.equal(
  localizeTomorrow(indication("moon_holds", { moon_gate_today: 41 }), tEn),
  NAMED.en.moon_holds,
);
assert.equal(
  localizeTomorrow(indication("sun_theme_holds", { sun_gate_today: 11 }), tNl),
  NAMED.nl.sun_theme_holds,
);

// Unknown kind keeps the sun-holds fallback.
assert.equal(
  localizeTomorrow(indication("other", {}), tEn),
  OLD.en.sun_theme_holds,
);
assert.equal(
  localizeTomorrow(indication("other", { sun_gate_tomorrow: 11 }), tEn),
  NAMED.en.sun_theme_holds,
);

const NEW_KEYS = [
  ["today.tomorrow.moonMovesTo", "Tomorrow the Moon moves into Gate {gate}", "Morgen trekt de Maan naar poort {gate}"],
  ["today.tomorrow.moonStaysIn", "Tomorrow the Moon stays in Gate {gate}", "Morgen blijft de Maan in poort {gate}"],
  ["today.tomorrow.sunMovesTo", "Tomorrow the Sun theme turns to Gate {gate}", "Morgen draait het Zon-thema naar poort {gate}"],
  ["today.tomorrow.sunStaysIn", "Tomorrow the Sun theme stays in Gate {gate}", "Morgen blijft het Zon-thema in poort {gate}"],
];

const enSoul = read("src/lib/i18n/messages/todaySoul.en.ts");
const nlSoul = read("src/lib/i18n/messages/todaySoul.nl.ts");

for (const [key, en, nl] of NEW_KEYS) {
  assert.equal(translate("en", key), en);
  assert.equal(translate("nl", key), nl);
  assert.ok(nlSoul.includes(`"${key}": "${nl}"`), `nl catalog has ${key}`);
  assert.ok(enSoul.includes(`"${key}": "${en}"`), `en catalog has ${key}`);
  assert.equal(nl.includes(" u "), false, `${key} has no formal u`);
  assert.equal(nl.includes(" uw "), false, `${key} has no formal uw`);
  assert.equal(nl.includes("Gate"), false, `${key} does not say Gate`);
  assert.notEqual(nl, en, `${key} NL is not the EN string`);
  assert.equal(en.endsWith("."), false, `${key} EN has no trailing stop`);
  assert.equal(nl.endsWith("."), false, `${key} NL has no trailing stop`);
}

const OLD_KEYS = [
  ["today.tomorrow.moonLeaves", OLD.en.moon_leaves, OLD.nl.moon_leaves],
  ["today.tomorrow.moonHolds", OLD.en.moon_holds, OLD.nl.moon_holds],
  ["today.tomorrow.sunThemeLeaves", OLD.en.sun_theme_leaves, OLD.nl.sun_theme_leaves],
  ["today.tomorrow.sunThemeHolds", OLD.en.sun_theme_holds, OLD.nl.sun_theme_holds],
];
for (const [key, en, nl] of OLD_KEYS) {
  assert.equal(translate("en", key), en, `old EN ${key}`);
  assert.equal(translate("nl", key), nl, `old NL ${key}`);
  assert.ok(enSoul.includes(`"${key}": "${en}"`), `old EN pin ${key}`);
  assert.ok(nlSoul.includes(`"${key}": "${nl}"`), `old NL pin ${key}`);
}

const todayInd = read("src/components/TodayIndication.tsx");
assert.equal(
  sha(todayInd),
  "e6eeeef1e44398795dd4229ec9414004545a7beb461f3a8280abeedb9fe74d84",
  "TodayIndication.tsx stays pinned",
);
assert.match(todayInd, /localizeTomorrow\(indication, t\)/);

for (const retired of ["fr", "de", "es"]) {
  assert.equal(resolveLocale(retired), "en", `${retired} resolves to en`);
}
assert.equal(
  translate(resolveLocale("fr"), "today.tomorrow.moonMovesTo", { gate: 9 }),
  NAMED.en.moon_leaves,
);

assert.match(
  read("package.json"),
  /"assert:today-tomorrow-gate": "npx tsx scripts\/assert-today-tomorrow-gate\.mjs"/,
);

console.log("PASS assert-today-tomorrow-gate");
