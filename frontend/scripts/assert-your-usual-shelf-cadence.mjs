/**
 * Your usual — Shelf cadence + ad-hoc kit highlight.
 * Run: npx tsx scripts/assert-your-usual-shelf-cadence.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const en = read("src/lib/i18n/messages/en.ts");
const nl = read("src/lib/i18n/messages/nl.ts");
const de = read("src/lib/i18n/messages/de.ts");
const fr = read("src/lib/i18n/messages/fr.ts");
const es = read("src/lib/i18n/messages/es.ts");
const todayInd = read("src/components/TodayIndication.tsx");
const moveCard = read("src/components/protocols/TodaysMoveCard.tsx");
const biohack = read("src/app/biohack/page.tsx");
const api = read("src/lib/api.ts");
const dismiss = read("src/lib/usualConfirmDismiss.ts");

function valueOf(src, key) {
  const re = new RegExp(
    `['"]${key.replace(/\./g, "\\.")}['"]\\s*:\\s*['"]([\\s\\S]*?)['"]\\s*,`
  );
  const m = src.match(re);
  assert.ok(m, `missing value for ${key}`);
  return m[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
}

// Leave-alones byte-identical
assert.equal(
  valueOf(en, "today.kitSetupNoMatch"),
  "Nothing in your kit matched today’s sky."
);
assert.equal(
  valueOf(en, "protocols.noKitMatch"),
  "No kit item matched today's weather"
);
assert.equal(
  valueOf(en, "today.kitSetupLead"),
  "Add what you already own. Protocols will use it."
);
assert.equal(
  valueOf(en, "protocols.literacy.shelfIntention.body"),
  "Shelf is what you own and what can feed today’s kit line. It is the one place on Protocols to add or manage that cupboard. It does not replace the Move."
);

// New copy in all five locales
for (const [loc, src] of [
  ["en", en],
  ["nl", nl],
  ["de", de],
  ["fr", fr],
  ["es", es],
]) {
  assert.match(src, /usual\.title/, `${loc} usual.title`);
  assert.match(src, /today\.usualStillApplies/, `${loc} today.usualStillApplies`);
  assert.match(src, /protocols\.usualStillApplies/, `${loc} protocols.usualStillApplies`);
}

assert.equal(valueOf(en, "usual.title"), "Your usual");
assert.equal(valueOf(en, "today.usualStillApplies"), "Your usual still applies.");

// Highlight / quiet line wiring
assert.match(todayInd, /kit_usual_applies/);
assert.match(todayInd, /today\.usualStillApplies/);
assert.match(
  todayInd,
  /inventoryCount > 0 \? t\("today\.kitSetupNoMatch"\) : t\("today\.kitSetupEmpty"\)/
);
assert.match(moveCard, /showUsualApplies/);
assert.match(moveCard, /protocols\.usualStillApplies/);
assert.match(biohack, /showUsualApplies/);
assert.match(biohack, /usual-confirm/);
assert.match(biohack, /usual-toggle-/);
assert.match(biohack, /patchUsual/);
assert.doesNotMatch(biohack, /Protocol sub-tab|protocols\.subTab/);
assert.match(api, /patchInventory/);
assert.match(api, /kit_usual_applies/);
assert.match(dismiss, /usualConfirmDismissedKey/);

// Feature name stays "Your usual" — not Protocol/Stack/Baseline for this surface
assert.match(en, /'usual\.title': 'Your usual'/);

console.log("PASS: assert-your-usual-shelf-cadence");
