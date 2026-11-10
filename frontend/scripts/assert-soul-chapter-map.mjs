/**
 * Soul Chapter Map — source ACs (FE-only IA).
 * Run: npx tsx scripts/assert-soul-chapter-map.mjs
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

// Chapter map chrome
assert.ok(page.includes('data-testid="soul-chapter-map"'));
for (const id of [
  "soul-chapter-love",
  "soul-chapter-spectrums",
  "soul-chapter-playbook",
  "soul-chapter-channels",
  "soul-chapter-centers",
]) {
  assert.ok(page.includes(`testId="${id}"`) || page.includes(`"${id}"`), id);
}

// Signature above Love: soul-hero appears before soul-chapter-love in source order
const heroAt = page.indexOf('id="soul-hero"');
const loveChapterAt = page.indexOf('testId="soul-chapter-love"');
assert.ok(heroAt > 0 && loveChapterAt > heroAt, "Signature hero before Love chapter");

// Explore this bond soft line
assert.ok(page.includes("Explore this bond"));
assert.ok(page.includes('data-testid="soul-explore-bond"'));

// One-open jump wiring
assert.ok(page.includes("handleSoulJump"));
assert.ok(page.includes("planSoulJump"));
assert.ok(page.includes("applySoulJumpPlan"));

// Friend never mounts Love without partner_overview gate
assert.ok(
  page.includes('result.friend?.role === "partner"') &&
    page.includes("result.partner_overview"),
);
assert.ok(!page.includes("soul-love-tabs"));
assert.ok(!page.includes('role="tablist"'));
assert.ok(!page.includes("soul-love-tab-"));

// Literacy targets still wired (ids on DOM + jump planner)
for (const id of [
  "soul-hero",
  "soul-spectrums",
  "soul-cards",
  "soul-completed-channels",
  "soul-conditioning",
]) {
  assert.ok(page.includes(id), `target ${id}`);
}
assert.ok(page.includes("soul-card-"), "nested card id prefix");
assert.ok(page.includes("/^soul-card-(.+)$/"), "card jump regex");
const hdCopy = readFileSync(resolve(root, "src/lib/hdCopy.ts"), "utf8");
for (const id of [
  "soul-card-somatic_playbook",
  "soul-card-power_dynamics",
  "soul-card-spark_glue",
]) {
  assert.ok(hdCopy.includes(id), `literacy ${id}`);
}

// Love chapter retained testids (flattened open chapter; no inner subchapters)
for (const id of [
  "soul-partner-overview",
  "soul-partner-hook",
  "soul-partner-the-current",
  "soul-love-harmonies",
  "soul-love-frictions",
  "soul-love-decide",
  "soul-love-communicate",
  "soul-love-click-scrape",
  "soul-love-hard",
]) {
  assert.ok(overview.includes(id), `overview ${id}`);
}
assert.ok(
  !overview.includes("soul-love-sub-current") &&
    !overview.includes("soul-love-sub-harmony") &&
    !overview.includes("soul-love-sub-decide") &&
    !overview.includes("soul-love-sub-hard"),
  "inner Love subchapters are gone",
);
assert.ok(
  !overview.includes(
    "How your designs meet in love — not a score, not a verdict.",
  ),
  "open-chapter not-a-score disclaimer is gone",
);

// Chapter card hit-target signifiers
assert.ok(chapterCard.includes("min-h-11"));
assert.ok(chapterCard.includes("cursor-pointer"));
assert.ok(chapterCard.includes("aria-expanded"));
assert.ok(chapterCard.includes("ChevronDown"));

// Nested playbook cards are one-open
assert.ok(page.includes("openPlaybookCard"));
assert.ok(page.includes("setOpenPlaybookCard"));

// No Valentine / soulmate language introduced in these files
for (const bad of ["soulmate", "twin flame", "destiny", "Valentine", "#ff"]) {
  assert.ok(!page.toLowerCase().includes(bad.toLowerCase()) || bad === "#ff");
  assert.ok(!overview.toLowerCase().includes(bad.toLowerCase()));
}

console.log("assert-soul-chapter-map: ok");
