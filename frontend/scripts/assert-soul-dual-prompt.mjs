/**
 * Soul Dual prompt — source ACs (FE-only CTA/presentation).
 * Run: npx tsx scripts/assert-soul-dual-prompt.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const page = readFileSync(resolve(root, "src/app/soul/page.tsx"), "utf8");

// 1) soul-empty copy + Add a person on Chart
assert.ok(page.includes('data-testid="soul-empty"'));
assert.ok(
  page.includes("Add someone to explore the aura between both of you."),
  "empty body copy",
);
assert.ok(
  page.includes(
    "Save their natal on Chart — Soul uses it as the other half of the pair.",
  ),
  "empty one-liner",
);
assert.ok(page.includes("Add a person on Chart"), "empty CTA label");
assert.ok(page.includes('data-testid="soul-cta-chart"'), "keep soul-cta-chart");

// Empty must not pitch Partner / Love guidance
const emptyStart = page.indexOf('data-testid="soul-empty"');
const emptyEnd = page.indexOf(") : (", emptyStart);
assert.ok(emptyStart > 0 && emptyEnd > emptyStart, "locate soul-empty block");
const emptyBlock = page.slice(emptyStart, emptyEnd);
assert.ok(!/Mark as Partner/i.test(emptyBlock), "no Mark as Partner in empty");
assert.ok(
  !/Love guidance/i.test(emptyBlock),
  "no Love guidance pitch in empty",
);

// soul-empty-me left as shipped (no Partner/Love pitch)
assert.ok(page.includes('data-testid="soul-empty-me"'));
assert.ok(page.includes("Open Chart to save Me"));

// 2) Person-not-partner discovery: Mark as Partner, no Love content in that branch
assert.ok(page.includes('data-testid="soul-mark-as-partner"'));
assert.ok(page.includes('data-testid="soul-mark-partner-reason"'));
assert.ok(page.includes("Mark as Partner"));
assert.ok(page.includes('t("page.soul.markPartnerReasonNamed"') || page.includes("page.soul.markPartnerReason"), "mark reason copy remains");
assert.ok(page.includes("api.renameChart"));
assert.ok(page.includes('"partner"'));

// Mark row must not itself mount Love chrome
const markStart = page.indexOf('data-testid="soul-mark-partner-row"');
assert.ok(markStart > 0, "mark row present");
const markEnd = page.indexOf(")}", markStart + 50);
const markBlock = page.slice(markStart, markEnd > markStart ? markEnd : markStart + 1200);
assert.ok(
  !markBlock.includes("data-love-guidance"),
  "mark prompt has no data-love-guidance",
);
assert.ok(
  !markBlock.includes("soul-partner-overview"),
  "mark prompt has no soul-partner-overview",
);
assert.ok(!/bg-energy|energy-soft|sand-amber/i.test(markBlock), "no energy wash on discovery");

// Love content still gated on partner + partner_overview
assert.ok(
  page.includes('result.friend?.role === "partner"') &&
    page.includes("result.partner_overview"),
  "Love still gated on partner + partner_overview",
);
assert.ok(
  page.includes("isPartner && result.partner_overview"),
  "Love chapter mount still partner-gated",
);

// Quiet Add person near Person select
assert.ok(page.includes('data-testid="soul-add-person"'));
assert.ok(page.includes(">Add person<") || page.includes("Add person\n"));

// 3) Partner-on reason line no longer requires "on Chart"
assert.ok(page.includes('data-testid="soul-love-guidance-reason"'));
assert.ok(
  page.includes("Love guidance is on because you marked"),
  "partner-on reason present",
);
assert.ok(
  page.includes("as Partner.{" ) || page.includes("as Partner. "),
  "partner-on ends at Partner (Open Chart is separate link)",
);
const reasonStart = page.indexOf('data-testid="soul-love-guidance-reason"');
const reasonEnd = page.indexOf("</p>", reasonStart);
const reasonBlock = page.slice(reasonStart, reasonEnd);
assert.ok(
  !reasonBlock.includes("on Chart"),
  "partner-on reason must not say on Chart",
);
assert.ok(reasonBlock.includes("Open Chart"), "Open Chart edit escape retained");

// No Valentine / soulmate language in page
for (const bad of ["soulmate", "twin flame", "twin-flame", "destiny", "Valentine"]) {
  assert.ok(
    !page.toLowerCase().includes(bad.toLowerCase()),
    `forbidden language: ${bad}`,
  );
}

console.log("assert-soul-dual-prompt: ok");
