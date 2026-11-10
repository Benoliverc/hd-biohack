/**
 * Soul last-selected person open — source + pure helper ACs (FE-only).
 * Run: npx tsx scripts/assert-soul-last-selected.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const page = readFileSync(resolve(root, "src/app/soul/page.tsx"), "utf8");
const helper = readFileSync(
  resolve(root, "src/lib/soulLastSelected.ts"),
  "utf8",
);

// --- Wiring: page uses the helper, writes on picker change, keys by user id
assert.ok(page.includes("@/lib/soulLastSelected"), "page imports helper");
assert.ok(page.includes("pickSoulOpenPerson"), "page calls pickSoulOpenPerson");
assert.ok(page.includes("readSoulLastPersonId"), "page reads remembered id");
assert.ok(page.includes("writeSoulLastPersonId"), "page writes on change");
assert.ok(page.includes("writeSoulLastPersonId(user.id, next)"), "write keyed by user.id");
assert.ok(page.includes('data-testid="soul-friend-select"'), "picker unchanged testid");
assert.ok(
  /personOptions\.map\(\(r\) =>/.test(page),
  "dropdown still maps personOptions in place (no reorder)",
);

// Account switch must not keep the prior account's in-session id
assert.ok(page.includes("lastUserIdRef"), "track signed-in user across refresh");
assert.ok(
  page.includes("previousId: userChanged ? null : prev"),
  "drop in-session id when the account changes",
);

// Dual prompt / Mark as Partner / Love-only-when-Partner unchanged
assert.ok(page.includes('data-testid="soul-empty"'), "empty state remains");
assert.ok(page.includes('data-testid="soul-add-person"'), "Add person remains");
assert.ok(page.includes('data-testid="soul-mark-as-partner"'), "Mark as Partner remains");
assert.ok(
  page.includes('result.friend?.role === "partner"') &&
    page.includes("result.partner_overview"),
  "Love still gated on partner + partner_overview",
);
assert.ok(
  page.includes("isPartner && result.partner_overview"),
  "Love chapter mount still partner-gated",
);

// Helper storage is per-account; no Chart / backend / Dual copy edits in helper
assert.ok(helper.includes("hd-biohack:soul-last-person:"), "per-account key prefix");
assert.ok(helper.includes("${userId}"), "key includes user id");
assert.ok(!helper.includes("/profile"), "helper does not touch Chart routes");

// --- Pure selection + storage tests
const {
  soulLastPersonKey,
  readSoulLastPersonId,
  writeSoulLastPersonId,
  pickDefaultFriend,
  pickPartnerId,
  pickSoulOpenPerson,
  SOUL_LAST_PERSON_KEY_PREFIX,
} = await import("../src/lib/soulLastSelected.ts");

const memory = new Map();
globalThis.localStorage = {
  getItem: (k) => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => {
    memory.set(k, String(v));
  },
  removeItem: (k) => {
    memory.delete(k);
  },
  clear: () => memory.clear(),
  key: () => null,
  get length() {
    return memory.size;
  },
};

const alex = { id: 11, slot_kind: "friend", role: "person" };
const blair = { id: 22, slot_kind: "friend", role: "partner" };
const casey = { id: 33, slot_kind: "friend", role: "person" };
const options = [alex, blair, casey]; // first row is Alex, Partner is second

// Remembered still-saved person opens, not the first list row
assert.equal(
  pickSoulOpenPerson({
    options,
    meId: 1,
    previousId: null,
    rememberedId: casey.id,
  }),
  casey.id,
  "fresh visit opens remembered person, not first row",
);

// In-session selection wins over remembered if still present
assert.equal(
  pickSoulOpenPerson({
    options,
    meId: 1,
    previousId: alex.id,
    rememberedId: casey.id,
  }),
  alex.id,
  "keep in-session selection when still in options",
);

// Remembered person gone → Partner, even if Partner is not first
assert.equal(
  pickSoulOpenPerson({
    options: [alex, blair],
    meId: 1,
    previousId: null,
    rememberedId: casey.id,
  }),
  blair.id,
  "deleted remembered person falls back to marked Partner",
);

// Remembered gone, no Partner → first friend / anyone else
assert.equal(
  pickSoulOpenPerson({
    options: [alex, casey],
    meId: 1,
    previousId: null,
    rememberedId: 99,
  }),
  alex.id,
  "no Partner: fall back to pickDefaultFriend (first friend)",
);

// Empty / add-person state
assert.equal(
  pickSoulOpenPerson({
    options: [],
    meId: 1,
    previousId: casey.id,
    rememberedId: casey.id,
  }),
  null,
  "empty options stay empty",
);

// Ignore a remembered id that is not in current options (also covers cross-account id)
assert.equal(
  pickSoulOpenPerson({
    options: [alex, casey],
    meId: 1,
    previousId: null,
    rememberedId: 9001,
  }),
  alex.id,
  "stored id not in options is ignored",
);

// pickDefaultFriend / pickPartnerId primitives
assert.equal(pickPartnerId(options), blair.id);
assert.equal(pickPartnerId([alex, casey]), null);
assert.equal(pickDefaultFriend(options, 1), alex.id);
assert.equal(pickDefaultFriend([], 1), null);

// Storage is keyed by user id — no cross-account leak
assert.equal(soulLastPersonKey(7), `${SOUL_LAST_PERSON_KEY_PREFIX}7`);
writeSoulLastPersonId(7, casey.id);
writeSoulLastPersonId(8, alex.id);
assert.equal(readSoulLastPersonId(7), casey.id, "user 7 remembers Casey");
assert.equal(readSoulLastPersonId(8), alex.id, "user 8 remembers Alex");
assert.equal(readSoulLastPersonId(9), null, "other account has no value");
assert.notEqual(
  soulLastPersonKey(7),
  soulLastPersonKey(8),
  "accounts use distinct keys",
);

// Invalid stored value is ignored
memory.set(soulLastPersonKey(7), "not-a-number");
assert.equal(readSoulLastPersonId(7), null, "non-numeric storage is ignored");

writeSoulLastPersonId(8, null);
assert.equal(readSoulLastPersonId(8), null, "write null clears that account only");
assert.equal(memory.has(soulLastPersonKey(7)), true, "other account key untouched");

console.log("assert-soul-last-selected: ok");
