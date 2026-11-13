/**
 * Protocols Shelf naming pass — source ACs (FE).
 * Run: npx tsx scripts/assert-protocols-shelf-naming.mjs
 *
 * Shelf is the only visible name for inventory. Kit stays only for today's
 * plan language: Today's kit pick, From your kit badges, and Baseline kit.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
const kit = read("src/components/protocols/KitStrip.tsx");
const move = read("src/components/protocols/TodaysMoveCard.tsx");
const todayInd = read("src/components/TodayIndication.tsx");
const home = read("src/app/page.tsx");
const locales = ["en", "de", "es", "fr", "nl"].map((id) => ({
  id,
  src: read(`src/lib/i18n/messages/${id}.ts`),
}));
const en = locales[0].src;

assert.ok(
  pkg.includes('"assert:protocols-shelf-naming": "npx tsx scripts/assert-protocols-shelf-naming.mjs"'),
  "package.json wires assert:protocols-shelf-naming",
);

// --- Shelf fold is the only inventory title ---
assert.match(biohack, /data-testid="shelf-disclosure"/);
assert.match(biohack, /id="shelf"/);
assert.match(biohack, /t\("page\.protocols\.shelf"\)/);
assert.match(en, /'page\.protocols\.shelf': 'Shelf'/);

const shelfStart = biohack.indexOf('data-testid="shelf-disclosure"');
assert.ok(shelfStart > 0, "shelf disclosure present");
const shelfBlock = biohack.slice(shelfStart, biohack.indexOf("</details>", shelfStart) + 10);
assert.match(shelfBlock, /t\("page\.protocols\.shelf"\)/);
assert.match(shelfBlock, /<KitStrip/);
assert.doesNotMatch(shelfBlock, /protocols\.yourKit/);
assert.doesNotMatch(shelfBlock, /Your kit/);

// --- KitStrip has no Your kit / protocols.yourKit heading ---
assert.match(kit, /data-testid="kit-strip"/);
assert.doesNotMatch(kit, /protocols\.yourKit/);
assert.doesNotMatch(kit, /Your kit/);
assert.match(kit, /t\("protocols\.editShelf"\)/);
assert.match(kit, /t\("protocols\.addItems"\)/);
assert.match(kit, /t\("protocols\.kitEmptyHint"\)/);
assert.match(kit, /min-h-9/);

// catalogs may keep the unused yourKit key
for (const { id, src } of locales) {
  assert.equal(Boolean(valueFor(src, "protocols.yourKit")), true, `${id} keeps protocols.yourKit`);
}
assert.equal(valueFor(en, "protocols.yourKit"), "Your kit");

// --- Editor and inventory banners use Shelf ---
const invStart = biohack.indexOf('data-testid="inventory-panel"');
assert.ok(invStart > 0, "inventory-panel present");
const invOpen = biohack.lastIndexOf("function InventoryPanel", invStart);
const invBlock = biohack.slice(invOpen, biohack.indexOf("\n}\n", invStart) + 3);
assert.match(invBlock, /t\("page\.protocols\.shelf"\)/);
assert.doesNotMatch(invBlock, /Your kit/);
assert.doesNotMatch(invBlock, /Add to kit/);
assert.doesNotMatch(invBlock, /Loading kit/);
assert.doesNotMatch(invBlock, /Items in your kit/);
assert.match(invBlock, /t\("protocols\.shelfHelp"\)/);
assert.match(invBlock, /t\("protocols\.addToShelf"\)/);
assert.match(invBlock, /t\("protocols\.loadingShelf"\)/);
assert.match(biohack, /t\("protocols\.editShelf"\)/);
assert.match(biohack, /t\("protocols\.addedToShelf"/);
assert.match(biohack, /t\("protocols\.fromYourShelf"\)/);
assert.match(biohack, /t\("protocols\.alreadyOnShelf"/);
assert.match(biohack, /t\("page\.protocols\.proUnlocks"\)/);
assert.doesNotMatch(biohack, /and your kit/);
assert.doesNotMatch(biohack, /Added \$\{res\.name\} to your kit/);
assert.doesNotMatch(biohack, /\(from your kit\)/);

const lockedEn = {
  "protocols.shelfHelp": "Items on your shelf are preferred in today\u2019s timed supports.",
  "protocols.addToShelf": "Add to shelf",
  "protocols.loadingShelf": "Loading shelf\u2026",
  "protocols.editShelf": "Edit shelf",
  "protocols.addedToShelf": "Added {name} to your shelf",
  "protocols.fromYourShelf": "(from your shelf)",
  "page.protocols.proUnlocks": "Pro unlocks Today\u2019s Move, this week, and your shelf.",
};

for (const [key, expected] of Object.entries(lockedEn)) {
  assert.equal(valueFor(en, key), expected, `EN ${key}`);
}

const requiredKeys = [
  ...Object.keys(lockedEn),
  "protocols.alreadyOnShelf",
  "protocols.addedName",
  "protocols.adding",
  "protocols.addSupplementPlaceholder",
  "protocols.shelfEmptyStarters",
  "protocols.planUpdatedUses",
  "protocols.removedPlanRefreshed",
  "protocols.shelfUpdatedUnchanged",
];

for (const { id, src } of locales) {
  for (const key of requiredKeys) {
    const val = valueFor(src, key);
    assert.ok(val && val.length > 0, `${id} missing ${key}`);
  }
}

// translations for inventory strings must differ from EN outside en
const translateKeys = [
  "protocols.shelfHelp",
  "protocols.addToShelf",
  "protocols.loadingShelf",
  "protocols.editShelf",
  "protocols.addedToShelf",
  "protocols.fromYourShelf",
  "page.protocols.proUnlocks",
];
for (const { id, src } of locales) {
  if (id === "en") continue;
  for (const key of translateKeys) {
    assert.notEqual(valueFor(src, key), valueFor(en, key), `${id} ${key} still equals EN`);
  }
}

// --- Today's kit pick, fromKit, Baseline kit unchanged ---
assert.equal(valueFor(en, "protocols.todayKitPick"), "Today\u2019s kit pick");
assert.equal(valueFor(en, "protocols.fromKit"), "From your kit");
assert.equal(valueFor(en, "protocols.baselineKit"), "Baseline kit (always-on defaults)");
assert.match(move, /t\("protocols\.todayKitPick"\)/);
assert.match(move, /t\("protocols\.fromKit"\)/);
assert.match(move, /t\("protocols\.baselineKit"\)/);
assert.match(biohack, /t\("protocols\.fromKit"\)/);
assert.ok(biohack.includes("From your kit[^.]*"), "still strips a leading From your kit sentence from why text");
assert.equal(valueFor(en, "protocols.fromYourShelf"), "(from your shelf)");
assert.ok(!/['"]protocols\.fromShelf['"]/.test(en), "do not add a From your shelf badge key");

// --- Leave-alone surfaces keep kit wording ---
assert.match(en, /using your kit when you own it/);
assert.equal(valueFor(en, "today.kitSetupAdd"), "Add to kit");
assert.doesNotMatch(todayInd, /protocols\.editShelf|protocols\.addToShelf|page\.protocols\.proUnlocks/);
assert.doesNotMatch(home, /page\.protocols\.proUnlocks/);

// --- Deep links and empty-Shelf auto-open unchanged ---
assert.match(biohack, /hash === "shelf" \|\| qs\.get\("shelf"\) === "1"/);
assert.match(
  biohack,
  /setShelfOpen\(!stackDeep && \(deep \|\| inventory\.length === 0\)\)/,
);
assert.match(biohack, /#stack must not open Shelf/);

// --- No new user-facing inventory names ---
assert.ok(!/['"][^'"]*[Cc]abinet/.test(en), "do not add Cabinet as a user-facing name");
assert.equal(valueFor(en, "page.protocols.shelf"), "Shelf");

console.log("assert-protocols-shelf-naming PASS");
