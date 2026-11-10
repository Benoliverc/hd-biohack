/**
 * Soul names and partner-mode pass — source ACs (FE).
 * Run: npx tsx scripts/assert-soul-names-partner-mode.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const page = readFileSync(resolve(root, "src/app/soul/page.tsx"), "utf8");
const overview = readFileSync(
  resolve(root, "src/components/soul/PartnerOverviewCard.tsx"),
  "utf8",
);
const chapterCard = readFileSync(
  resolve(root, "src/components/soul/SoulChapterCard.tsx"),
  "utf8",
);
const css = readFileSync(resolve(root, "src/app/globals.css"), "utf8");

// 1) Remove as Partner uses existing renameChart(..., "person") and only shows
//    when the selected person is already Partner (same branch as the reason line).
assert.ok(page.includes("handleRemoveAsPartner"), "remove handler");
assert.ok(page.includes('data-testid="soul-remove-as-partner"'), "remove control testid");
assert.ok(page.includes("Remove as Partner"), "remove label");
assert.ok(
  page.includes('renameChart(selectedFriend.id, selectedFriend.label || "", "person")'),
  "renameChart id, label, person — clears tag only",
);
// Must not introduce a new unmark API.
assert.ok(!page.includes("unmarkPartner"), "no new unmark API");
assert.ok(!page.includes("removePartner("), "no new removePartner API");

const removeStart = page.indexOf("const handleRemoveAsPartner");
assert.ok(removeStart > 0, "locate remove handler");
const removeEnd = page.indexOf("}, [selectedFriend, removingPartner, user?.id]);", removeStart);
assert.ok(removeEnd > removeStart, "locate remove handler end");
const removeHandler = page.slice(removeStart, removeEnd);
assert.ok(!removeHandler.includes("deleteChart"), "remove does not delete the person");
assert.ok(
  !removeHandler.includes("setFriendId"),
  "remove does not change the selected person",
);
assert.ok(
  !removeHandler.includes("writeSoulLastPersonId"),
  "remove leaves last-selected storage alone",
);
assert.ok(removeHandler.includes("setRemovePartnerError"), "inline error on failure");
assert.ok(removeHandler.includes("setRemovingPartner(false)"), "control re-enabled");

// Shown only in the already-Partner branch (alongside the reason line),
// not in the Mark as Partner discovery prompt.
const reasonStart = page.indexOf('data-testid="soul-love-guidance-reason"');
const markStart = page.indexOf('data-testid="soul-mark-partner-prompt"');
assert.ok(reasonStart > 0 && markStart > reasonStart, "reason before mark prompt");
const partnerBranch = page.slice(reasonStart, markStart);
assert.ok(
  partnerBranch.includes('data-testid="soul-remove-as-partner"'),
  "Remove lives in the Partner reason area",
);
const markBlock = page.slice(markStart, markStart + 1600);
assert.ok(
  !markBlock.includes('data-testid="soul-remove-as-partner"'),
  "Remove is not in the Mark as Partner prompt",
);

// 2) Chapter title lives on the chapter row (open card no longer repeats it)
assert.ok(
  page.includes('title="Partner mode · Love guidance"'),
  "chapter title",
);
assert.ok(
  overview.includes("Partner mode · Love guidance"),
  "sr-only / a11y title remains in the open card source",
);

// 3) Deeper copper-amber wash on Love guidance only — not a whole-page re-wash
assert.ok(
  chapterCard.includes("soul-love-guidance-chapter"),
  "closed/open chapter shell uses partner wash class",
);
assert.ok(
  chapterCard.includes('accent === "energy"'),
  "wash still gated on energy accent",
);
assert.ok(
  !overview.includes("soul-love-guidance-wash"),
  "open inner card does not stack a second wash",
);
assert.ok(css.includes(".soul-love-guidance-chapter"), "chapter wash CSS");
assert.ok(css.includes(".soul-love-guidance-wash"), "wash class remains in CSS");
// Deeper than the previous 82/18 sand mix; stay in energy/copper-amber family
assert.ok(
  /var\(--energy\) 4[0-9]%/.test(css) || /var\(--energy\) 3[2-9]%/.test(css),
  "deeper energy mix than today's quiet 18%",
);
const washStart = css.indexOf(".soul-love-guidance-chapter");
const asideStart = css.indexOf(".soul-love-guidance-aside");
assert.ok(washStart > 0 && asideStart > washStart, "wash blocks located");
const washBlock = css.slice(washStart, asideStart);
assert.ok(!/pink|valentine|#e11|#be12|#f43f|#dc2626|#ef4444|#f87171/i.test(washBlock), "wash not pink or red");
assert.ok(washBlock.includes("var(--energy)"), "wash stays in energy/copper-amber family");
assert.ok(!washBlock.includes("var(--recovery)"), "open wash no longer leans on recovery tint");

// Page itself does not apply the wash to the whole Soul surface
assert.ok(!page.includes("soul-love-guidance-chapter"), "page does not re-wash the whole Soul page");
assert.ok(
  page.includes('accent="energy"'),
  "Love chapter is the energy-accented shell",
);
// Friend-mode chapters stay default (no energy accent)
const spectrumAt = page.indexOf('testId="soul-chapter-spectrums"');
const spectrumSlice = page.slice(spectrumAt, spectrumAt + 400);
assert.ok(
  !spectrumSlice.includes('accent="energy"'),
  "Spectrums is not energy-washed",
);

// 4) Last-selected / Dual / Mark as Partner paths not broken
assert.ok(page.includes("writeSoulLastPersonId"), "last-selected write remains");
assert.ok(page.includes("writeSoulLastPersonId(user.id, next)"), "write keyed by user.id");
assert.ok(page.includes('data-testid="soul-mark-as-partner"'), "Mark as Partner remains");
assert.ok(page.includes("Want Love guidance with"), "mark reason remains");
assert.ok(
  page.includes('renameChart(selectedFriend.id, selectedFriend.label || "", "partner")'),
  "Mark still uses renameChart partner",
);
assert.ok(
  page.includes("Love guidance is on because you marked"),
  "partner reason line remains",
);
assert.ok(
  page.includes('result.friend?.role === "partner"') &&
    page.includes("result.partner_overview"),
  "Love still gated on partner + partner_overview",
);
assert.ok(page.includes('data-testid="soul-empty"'), "dual-prompt empty remains");
assert.ok(
  page.includes("Add someone to explore the aura between both of you."),
  "empty copy unchanged",
);

// No soulmate / valentine language
for (const file of [page, overview, chapterCard]) {
  const lower = file.toLowerCase();
  assert.ok(!lower.includes("soulmate"), "no soulmate");
  assert.ok(!lower.includes("twin flame"), "no twin flame");
  assert.ok(!lower.includes("valentine"), "no valentine");
}

console.log("assert-soul-names-partner-mode: ok");
