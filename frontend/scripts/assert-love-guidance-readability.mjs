/**
 * Love guidance readability pass — source ACs (FE).
 * Run: npx tsx scripts/assert-love-guidance-readability.mjs
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

function visibleOverview() {
  // Strip sr-only spans so hidden title text is not treated as a visible repeat.
  return overview.replace(
    /<span className="sr-only"[^>]*>[\s\S]*?<\/span>/g,
    "",
  );
}

const visible = visibleOverview();

// 1) One title, one lead, no third accordion
assert.ok(
  page.includes('title="Partner mode · Love guidance"'),
  "chapter row still carries the title",
);
assert.ok(
  !visible.includes("Partner mode · Love guidance"),
  "open card does not repeat the chapter title as a chip or h2",
);
assert.ok(
  !overview.includes('data-testid="soul-love-guidance-heading"'),
  "no inner Partner mode heading testid",
);
assert.ok(
  overview.includes('data-testid="soul-partner-pair-title"'),
  "lead is You & {name} / You two",
);
assert.ok(overview.includes("You & ${partnerFirstName.trim()}"), "named lead");
assert.ok(overview.includes('"You two"'), "nameless lead");
assert.ok(
  overview.includes("type-section text-fg") &&
    overview.includes('data-testid="soul-partner-hook"'),
  "hook is type-section at text-fg, not a second large headline",
);
assert.ok(
  !overview.includes("sm:text-2xl") && !overview.includes("text-xl font-semibold"),
  "hook is not a second 24px headline",
);
assert.ok(
  !overview.includes("Partner mode · Love guidance"),
  "open card has no chapter title and no sr-only duplicate",
);
assert.ok(
  !overview.includes("The current between you") &&
    !overview.includes('title="The current"') &&
    !overview.includes("Decide & talk"),
  "no The current / Decide & talk wrappers",
);
assert.ok(
  !overview.includes("AccordionPanel") &&
    !overview.includes("<details") &&
    !overview.includes("LoveSubChapter") &&
    !overview.includes("aria-expanded"),
  "open Love chapter has no inner accordion or subchapters",
);
assert.ok(
  overview.includes('data-testid="soul-love-decide"') &&
    overview.includes('data-testid="soul-love-communicate"'),
  "both decide and talk blocks remain in the open chapter",
);
assert.ok(
  overview.includes("Where you click") &&
    overview.includes("Where it scrapes") &&
    (overview.includes("When it&apos;s hard") || overview.includes("When it's hard")),
  "click / scrape / when it's hard headings remain",
);
assert.ok(
  !overview.includes("Where you harmonize · friction") &&
    !overview.includes("Where you harmonize"),
  "harmony group is not a stacked wrapper heading",
);
assert.ok(
  !overview.includes("When things get hard") &&
    !overview.includes("What this bond asks") &&
    !overview.includes("The tender spots"),
  "When it's hard does not nest literary subheads",
);

// Mid-word-safe Love tease (do not use the playbook mid-word slice for Love)
assert.ok(page.includes("function truncateLoveTease"), "Love tease helper");
assert.ok(
  page.includes("truncateLoveTease(result.partner_overview?.hook)"),
  "Love chapter uses the mid-word-safe tease",
);
assert.ok(
  page.includes("truncateTease(result.playbook?.lede)"),
  "playbook still uses the existing tease helper",
);
const loveFnStart = page.indexOf("function truncateLoveTease");
const loveFnEnd = page.indexOf("function SoulUnlockedContent", loveFnStart);
const loveFn = page.slice(loveFnStart, loveFnEnd);
assert.ok(loveFn.includes("lastIndexOf"), "Love tease cuts on a word boundary");
assert.ok(/\[\^.!\?\]\+\[.!\?\]/.test(loveFn) || loveFn.includes("[^.!?]"), "Love tease prefers the first sentence");

// 2) Primary ink on reading text; wash kept; reading on solid elevated
const readingSnippets = [
  "type-body text-fg",
  "type-section text-fg",
];
for (const snip of readingSnippets) {
  assert.ok(overview.includes(snip), `reading ink present: ${snip}`);
}
// Bodies and try-lines in this card must not use secondary ink
assert.ok(
  !overview.includes("type-body text-fg-secondary"),
  "no body reading in secondary ink",
);
assert.ok(
  !overview.includes("type-caption text-fg-secondary"),
  "no try/caption reading in secondary ink on the open card",
);
assert.ok(overview.includes('font-semibold text-fg">Try'), "visible Try label");
assert.ok(
  !overview.includes("text-fg-muted"),
  "open card reading text is not fg-muted",
);
assert.ok(
  chapterCard.includes("text-energy-ink"),
  "Love chapter chevron uses energy-ink or equivalent primary ink",
);

// Solid elevated insets (not wash-on-wash, not energy/5 tinted cards)
assert.ok(
  !overview.includes("soul-love-guidance-wash"),
  "inner card does not stack a second wash",
);
assert.ok(overview.includes("bg-transparent"), "inner card sits transparent on the chapter wash");
assert.ok(overview.includes("bg-elevated"), "reading text sits on solid elevated insets");
assert.ok(
  !overview.includes("bg-elevated/70") &&
    !overview.includes("bg-elevated/60") &&
    !overview.includes("bg-energy/5") &&
    !overview.includes("bg-energy-soft/40"),
  "reading cards are solid elevated, not tinted wash mixes",
);

// Chapter shell keeps the deepened copper-amber wash
assert.ok(
  chapterCard.includes("soul-love-guidance-chapter"),
  "chapter shell still uses the partner wash class",
);
assert.ok(css.includes(".soul-love-guidance-wash"), "wash class remains in CSS");
assert.ok(css.includes(".soul-love-guidance-chapter"), "chapter wash CSS remains");
const washStart = css.indexOf(".soul-love-guidance-chapter");
const asideStart = css.indexOf(".soul-love-guidance-aside");
assert.ok(washStart > 0 && asideStart > washStart, "wash blocks located");
const washBlock = css.slice(washStart, asideStart);
assert.ok(
  !/pink|valentine|#e11|#be12|#f43f|#dc2626|#ef4444|#f87171/i.test(washBlock),
  "wash not pink or red",
);
assert.ok(washBlock.includes("var(--energy)"), "wash stays copper-amber / energy");
assert.ok(
  /var\(--energy\) 4[0-9]%/.test(css) || /var\(--energy\) 3[2-9]%/.test(css),
  "deeper energy mix from #96 remains",
);

// Love chapter closed tease + chevron on the shell
assert.ok(
  chapterCard.includes('accent === "energy" ? "text-fg"'),
  "Love closed tease uses primary ink on the copper shell",
);
assert.ok(
  chapterCard.includes('accent === "energy" ? "text-energy-ink"'),
  "Love chapter chevron is not fg-muted",
);

// Keep Partner gate and #96 identity
assert.ok(
  page.includes('result.friend?.role === "partner"') &&
    page.includes("result.partner_overview"),
  "Love still gated on partner + partner_overview",
);
assert.ok(
  page.includes("Remove as Partner") && page.includes("Mark as Partner"),
  "Mark / Remove as Partner remain",
);

for (const file of [page, overview, chapterCard]) {
  const lower = file.toLowerCase();
  assert.ok(!lower.includes("soulmate"), "no soulmate");
  assert.ok(!lower.includes("twin flame"), "no twin flame");
  assert.ok(!lower.includes("valentine"), "no valentine");
}

console.log("assert-love-guidance-readability: ok");
