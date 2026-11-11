/**
 * Soul Partner CTA and literacy pass — source ACs (FE).
 * Run: npx tsx scripts/assert-soul-partner-cta-literacy.mjs
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const page = readFileSync(resolve(root, "src/app/soul/page.tsx"), "utf8");
const hdCopy = readFileSync(resolve(root, "src/lib/hdCopy.ts"), "utf8");
const coach = readFileSync(resolve(root, "src/components/LiteracyCoach.tsx"), "utf8");
const pkg = readFileSync(resolve(root, "package.json"), "utf8");

const NAMED =
  "Partner is for a romantic bond with {name}. It opens Love guidance, and it doesn’t score the bond.";
const NAMELESS =
  "Partner is for a romantic bond. It opens Love guidance, and it doesn’t score the bond.";

const SIGNATURE_BODY =
  "The big label at the top describes how your two charts tend to lock together — the shape of the bond. It is not a grade, not a dating score, and not 'how good' you are for each other. Secondary badges only appear when something rare lights up; start with the Signature as the shape of the relationship, not a rating.";
const WIRE_BODY =
  "The playbook is body-first: simple co-regulation moves for this pair. How You Wire Together names where a half-wire meets its other side. The centers strip shows who brings which always-on theme. Use these when you want something to try, not just a label. There is one playbook — not a work, life, or play switch.";
const LOVE_BODY =
  "Signature, the playbook, and the chapters below are how your two charts meet, for any person you saved. Love guidance is a separate chapter. It only appears when you mark this person as Partner, and it doesn’t score the bond.";

const SPECTRUMS_BODY =
  "The three bars map relative intensity (how much you stir in each other), steadiness (how continuous the shared field feels), and pace (how fast or slow you prefer to move together). High intensity can mean high energy that needs clear protocols — it is not a bad match. Read them as rhythm dials, never as a fit percentage.";
const POWER_BODY =
  "Sometimes one of you holds the full theme; the other holds only half. That can feel like fighting over the thermostat — same room, different set points. Each card below names who holds the fuller set point for that theme and gives a plain what-to-do. These are high-awareness zones to tune together; they are not a verdict that one person is 'in charge.'";
const SPARK_BODY =
  "In Spark & Glue, three everyday patterns show up. Spark is ignition when you meet — each of you holds one half of a wire. Bedrock is shared themes you both already hold — a baseline you can lean on without drama. Dominance is when one person fully holds a theme the other doesn't — a steady gift to borrow from, not a power trip. Role names live in Learn more.";

function openingTagWithTestId(src, testid) {
  const needle = `data-testid="${testid}"`;
  const i = src.indexOf(needle);
  assert.ok(i > 0, `missing testid ${testid}`);
  const start = src.lastIndexOf("<", i);
  const end = src.indexOf(">", i);
  assert.ok(start >= 0 && end > start, `locate opening tag for ${testid}`);
  return src.slice(start, end + 1);
}

function blockWithTestId(src, testid, endNeedle) {
  const needle = `data-testid="${testid}"`;
  const i = src.indexOf(needle);
  assert.ok(i > 0, `missing testid ${testid}`);
  const start = src.lastIndexOf("<", i);
  const end = src.indexOf(endNeedle, i);
  assert.ok(end > start, `locate end of ${testid} block`);
  return src.slice(start, end);
}

function catalogOf(locale) {
  return readFileSync(
    resolve(root, `src/lib/i18n/messages/${locale}.ts`),
    "utf8",
  );
}

function soulLiteracyRegion() {
  const start = hdCopy.indexOf("export const SOUL_LITERACY_STEPS");
  const end = hdCopy.indexOf("export const TODAY_LITERACY_STEPS");
  assert.ok(start > 0 && end > start, "locate SOUL_LITERACY_STEPS");
  return hdCopy.slice(start, end);
}

function stepIds(region) {
  return [...region.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
}

function stepBlock(region, id) {
  const start = region.indexOf(`id: "${id}"`);
  assert.ok(start > 0, `missing literacy step ${id}`);
  const next = region.indexOf("id: \"", start + 5);
  return region.slice(start, next > start ? next : region.length);
}

// --- Item 6: quiet Partner CTA on a Person ---
assert.ok(page.includes('data-testid="soul-mark-as-partner"'), "Mark as Partner testid");
assert.ok(page.includes("Mark as Partner"), "Mark as Partner label");
assert.ok(page.includes("Marking…"), "Marking busy label");
assert.ok(page.includes('data-testid="soul-mark-partner-reason"'), "reason testid");
assert.ok(page.includes('data-testid="soul-mark-partner-row"'), "quiet row testid");
assert.ok(
  !page.includes('data-testid="soul-mark-partner-prompt"'),
  "featured invitation card testid is gone",
);
assert.ok(!page.includes("Want Love guidance with"), "old invitation question is gone");

assert.ok(
  page.includes('renameChart(selectedFriend.id, selectedFriend.label || "", "partner")'),
  "Mark still uses renameChart partner",
);
assert.ok(
  page.includes("partnerFirstNameFromLabel"),
  "first-name helper remains",
);
assert.ok(
  page.includes("selectedPartnerFirstName"),
  "Person caption still uses first-name handling",
);
assert.ok(
  page.includes('t("page.soul.markPartnerReasonNamed"') &&
    page.includes('t("page.soul.markPartnerReason")'),
  "locked captions come from i18n keys",
);

const markRow = blockWithTestId(page, "soul-mark-partner-row", "data-testid=\"soul-playbook\"");
assert.ok(
  !/className="rounded-2xl border border-border bg-elevated p-4"/.test(markRow),
  "Person row has no featured card chrome",
);
assert.ok(
  markRow.includes(">Open Chart<") || markRow.includes("Open Chart\n"),
  "Open Chart stays on the Person row",
);
assert.ok(
  !/bg-growth\/20/.test(markRow) && !/hover:bg-growth\/30/.test(markRow),
  "Mark as Partner is not a growth primary",
);

const markBtn = openingTagWithTestId(page, "soul-mark-as-partner");
const removeBtn = openingTagWithTestId(page, "soul-remove-as-partner");
const quietChrome =
  "inline-flex min-h-11 items-center rounded-xl border border-border bg-elevated px-4 py-2.5 text-sm font-medium text-fg hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-60";
assert.ok(markBtn.includes(quietChrome), "Mark uses quiet secondary chrome");
assert.ok(removeBtn.includes(quietChrome), "Remove chrome (unchanged) is the same secondary");

const pickersAt = page.indexOf('data-testid="soul-pickers"');
const markAt = page.indexOf('data-testid="soul-mark-partner-row"');
const reasonRowAt = page.indexOf('data-testid="soul-partner-reason-row"');
assert.ok(
  pickersAt > 0 && reasonRowAt > pickersAt && markAt > reasonRowAt,
  "Person row sits in the same slot under the person picker as the Partner reason row",
);
assert.ok(page.includes('id="soul-pickers"'), "soul-pickers is a jump target id");

// Empty states stay unpitched
const emptyStart = page.indexOf('data-testid="soul-empty"');
const emptyEnd = page.indexOf(") : (", emptyStart);
assert.ok(emptyStart > 0 && emptyEnd > emptyStart, "locate soul-empty block");
const emptyBlock = page.slice(emptyStart, emptyEnd);
assert.ok(!/Mark as Partner/i.test(emptyBlock), "no Mark as Partner in empty");
assert.ok(!/Love guidance/i.test(emptyBlock), "no Love guidance pitch in empty");
assert.ok(page.includes('data-testid="soul-empty-me"'));
const meStart = page.indexOf('data-testid="soul-empty-me"');
const meEnd = page.indexOf(") : (", meStart);
const meBlock = page.slice(meStart, meEnd > meStart ? meEnd : meStart + 800);
assert.ok(!/Mark as Partner/i.test(meBlock), "no Mark as Partner in empty-me");
assert.ok(!/Love guidance/i.test(meBlock), "no Love guidance pitch in empty-me");

// Partner-on row unchanged
assert.ok(
  page.includes("Love guidance is on because you marked"),
  "partner-on reason unchanged",
);
assert.ok(page.includes("Remove as Partner"), "Remove as Partner remains");
assert.ok(page.includes("Partner · Love guidance"), "Partner chip remains");
assert.ok(
  page.includes('result.friend?.role === "partner"') &&
    page.includes("result.partner_overview"),
  "Love still gated on partner + partner_overview",
);
assert.ok(
  page.includes("isPartner && result.partner_overview"),
  "Love chapter mount still partner-gated",
);

// i18n: EN is source; other locales may match EN
const locales = ["en", "nl", "de", "fr", "es"];
for (const loc of locales) {
  const src = catalogOf(loc);
  assert.ok(
    src.includes(`'page.soul.markPartnerReasonNamed': '${NAMED}'`),
    `${loc} has locked named caption`,
  );
  assert.ok(
    src.includes(`'page.soul.markPartnerReason': '${NAMELESS}'`),
    `${loc} has locked nameless caption`,
  );
}
const messageFiles = readdirSync(resolve(root, "src/lib/i18n/messages")).filter(
  (f) => f.endsWith(".ts") && f !== "index.ts",
);
assert.equal(messageFiles.sort().join(","), "de.ts,en.ts,es.ts,fr.ts,nl.ts", "five locale files");

// --- Item 7: Soul literacy ---
assert.ok(coach.includes('"How to read Soul"'), "coach title stays How to read Soul");
assert.ok(coach.includes("SOUL_LITERACY_STEPS"), "coach still reads SOUL_LITERACY_STEPS");

const soulSteps = soulLiteracyRegion();
assert.deepEqual(
  stepIds(soulSteps),
  [
    "signature-not-score",
    "love-is-partner-only",
    "spectrums-not-fit",
    "wire-somatic",
    "power-dynamics",
    "spark-bedrock-dominance",
  ],
  "literacy order: new love step immediately after Aura Signature first",
);

const signature = stepBlock(soulSteps, "signature-not-score");
assert.ok(signature.includes('title: "Aura Signature first"'), "signature title");
assert.ok(signature.includes(SIGNATURE_BODY), "signature body locked");
assert.ok(!signature.includes("architecture of the bond across work, life, and play"));
assert.ok(!signature.includes("work, life, and play"));

const love = stepBlock(soulSteps, "love-is-partner-only");
assert.ok(love.includes('title: "Love guidance is Partner-only"'), "love step title");
assert.ok(love.includes('jumpLabel: "Partner"'), "love jump label");
assert.ok(love.includes('targetId: "soul-pickers"'), "love jumps to soul-pickers");
assert.ok(love.includes(LOVE_BODY), "love step body locked");

const wire = stepBlock(soulSteps, "wire-somatic");
assert.ok(wire.includes('title: "Body-first playbook + how you wire"'), "wire title");
assert.ok(wire.includes(WIRE_BODY), "wire body locked");
assert.ok(!wire.includes("context you picked"));
assert.ok(!wire.includes("(work, life, or play)"));

const spectrums = stepBlock(soulSteps, "spectrums-not-fit");
assert.ok(spectrums.includes('title: "Pace · steadiness · intensity"'));
assert.ok(spectrums.includes(SPECTRUMS_BODY), "Spectrums step unchanged");
assert.ok(spectrums.includes('jumpLabel: "Spectrums"'));
assert.ok(spectrums.includes('targetId: "soul-spectrums"'));

const power = stepBlock(soulSteps, "power-dynamics");
assert.ok(power.includes('title: "Power Dynamics to Tune"'));
assert.ok(power.includes(POWER_BODY), "Power Dynamics step unchanged");
assert.ok(power.includes('jumpLabel: "Power Dynamics"'));
assert.ok(power.includes('targetId: "soul-card-power_dynamics"'));

const spark = stepBlock(soulSteps, "spark-bedrock-dominance");
assert.ok(spark.includes('title: "Spark, Bedrock, Dominance"'));
assert.ok(spark.includes(SPARK_BODY), "Spark & Glue step unchanged");
assert.ok(spark.includes('jumpLabel: "Spark & Glue"'));
assert.ok(spark.includes('targetId: "soul-card-spark_glue"'));

assert.ok(!hdCopy.includes("the context you picked"), "no stale context-you-picked");
assert.ok(
  !soulSteps.includes("architecture of the bond across work, life, and play"),
  "no stale work/life/play architecture line",
);

assert.ok(
  pkg.includes('"assert:soul-partner-cta-literacy"'),
  "package.json wires the new assert",
);

console.log("assert-soul-partner-cta-literacy: ok");
