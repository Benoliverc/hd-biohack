/**
 * Love guidance language pass — source ACs (FE).
 * Run: npx tsx scripts/assert-love-guidance-language.mjs
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
  return overview.replace(
    /<span className="sr-only"[^>]*>[\s\S]*?<\/span>/g,
    "",
  );
}

const visible = visibleOverview();

// 1) One open heading; closed-row title only
assert.ok(
  page.includes('title="Partner mode · Love guidance"'),
  "closed chapter row still carries the title",
);
assert.ok(
  page.includes("hideTitleWhenOpen"),
  "Love chapter hides the row title when open",
);
assert.ok(
  chapterCard.includes("hideTitleWhenOpen"),
  "SoulChapterCard supports hiding the title when open",
);
assert.ok(
  !overview.includes("Partner mode · Love guidance"),
  "open card has no chapter title and no sr-only duplicate",
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
  !overview.includes("not a score, not a verdict"),
  "no open-chapter not-a-score line",
);
assert.ok(
  !overview.includes("How your designs meet in love"),
  "no open-chapter disclaimer under the hook",
);

// 2) No inner fold-outs; locked section order; one heading each
assert.ok(
  !overview.includes("LoveSubChapter") &&
    !overview.includes("AccordionPanel") &&
    !overview.includes("<details") &&
    !overview.includes("aria-expanded"),
  "no inner fold-outs or subchapters",
);
assert.ok(
  !overview.includes('title="The current"') &&
    !overview.includes("The current") &&
    !overview.includes("Decide & talk") &&
    !overview.includes("How you decide together") &&
    !overview.includes("Harmony and friction") &&
    !overview.includes("Where you harmonize") &&
    !overview.includes("What this bond asks") &&
    !overview.includes("The tender spots") &&
    !overview.includes("Try this together"),
  "dropped literary wrappers and extra headings",
);

const hookAt = overview.indexOf('data-testid="soul-partner-hook"');
const currentAt = overview.indexOf('data-testid="soul-partner-the-current"');
const decideAt = overview.indexOf('data-testid="soul-love-decide"');
const talkAt = overview.indexOf('data-testid="soul-love-communicate"');
const howYouAt = overview.indexOf('data-testid="soul-partner-how-you-love"');
const howTheyAt = overview.indexOf('data-testid="soul-partner-how-they-love"');
const clickAt = overview.indexOf('data-testid="soul-love-click-scrape"');
const hardAt = overview.indexOf('data-testid="soul-love-hard"');
assert.ok(hookAt > 0, "hook present");
assert.ok(currentAt > hookAt, "optional current fold-in sits under the hook");
assert.ok(decideAt > currentAt, "How you decide follows the hook");
assert.ok(talkAt > decideAt, "How you talk follows decide");
assert.ok(howYouAt > talkAt && howTheyAt > howYouAt, "how-you / how-they follow talk");
assert.ok(clickAt > howTheyAt, "Where you click / scrape follows love");
assert.ok(hardAt > clickAt, "When it's hard comes last");

assert.ok(overview.includes("How you decide"), "How you decide heading");
assert.ok(overview.includes("How you talk"), "How you talk heading");
assert.ok(overview.includes("How you love"), "How you love heading");
assert.ok(overview.includes("How ${partnerFirstName.trim()} loves"), "named how-they heading");
assert.ok(overview.includes('"How they love"'), "nameless how-they heading");
assert.ok(overview.includes("Where you click"), "Where you click group heading");
assert.ok(overview.includes("Where it scrapes"), "Where it scrapes group heading");
assert.ok(
  overview.includes("When it&apos;s hard") || overview.includes("When it's hard"),
  "When it's hard heading",
);

// Hook has no heading of its own; the_current has no heading
const currentBlock = overview.slice(
  overview.indexOf("hasCurrent"),
  overview.indexOf("hasCurrent") + 800,
);
// the_current render: paragraph only, no h3
const currentRenderStart = overview.indexOf("hasCurrent ?");
const currentRender = overview.slice(currentRenderStart, decideAt);
assert.ok(
  !currentRender.includes("<h3") && currentRender.includes('data-testid="soul-partner-the-current"'),
  "the_current fold-in has no heading",
);

// 3) Body-size Try in primary ink
assert.ok(
  overview.includes("function TryLine"),
  "shared Try line",
);
assert.ok(
  overview.includes('font-semibold text-fg">Try'),
  "visible Try label",
);
const tryFnStart = overview.indexOf("function TryLine");
const tryFnEnd = overview.indexOf("function foldTitleIntoBody", tryFnStart);
const tryFn = overview.slice(tryFnStart, tryFnEnd > tryFnStart ? tryFnEnd : tryFnStart + 500);
assert.ok(
  tryFn.includes("type-body text-fg") && !tryFn.includes("type-caption"),
  "Tries use type-body + text-fg, not type-caption",
);
assert.ok(
  !overview.includes("type-body text-fg-secondary"),
  "no body reading in secondary ink",
);
assert.ok(
  !overview.includes("type-caption text-fg-secondary"),
  "no caption reading in secondary ink on the open card",
);

// #97 ink, wash, elevated insets, mid-word-safe tease still present
assert.ok(
  overview.includes("type-section text-fg") &&
    overview.includes('data-testid="soul-partner-hook"'),
  "hook is type-section at text-fg",
);
assert.ok(
  !overview.includes("sm:text-2xl") && !overview.includes("text-xl font-semibold"),
  "hook is not a second 24px headline",
);
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
assert.ok(
  chapterCard.includes('accent === "energy" ? "text-fg"'),
  "Love closed tease uses primary ink on the copper shell",
);
assert.ok(
  chapterCard.includes('accent === "energy" ? "text-energy-ink"'),
  "Love chapter chevron is not fg-muted",
);
assert.ok(page.includes("function truncateLoveTease"), "Love tease helper");
assert.ok(
  page.includes("truncateLoveTease(result.partner_overview?.hook)"),
  "Love chapter uses the mid-word-safe tease",
);
const loveFnStart = page.indexOf("function truncateLoveTease");
const loveFnEnd = page.indexOf("function SoulUnlockedContent", loveFnStart);
const loveFn = page.slice(loveFnStart, loveFnEnd);
assert.ok(loveFn.includes("lastIndexOf"), "Love tease cuts on a word boundary");
assert.ok(
  /\[\^.!\?\]\+\[.!\?\]/.test(loveFn) || loveFn.includes("[^.!?]"),
  "Love tease prefers the first sentence",
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

for (const file of [page, overview, chapterCard, visible]) {
  const lower = file.toLowerCase();
  assert.ok(!lower.includes("soulmate"), "no soulmate");
  assert.ok(!lower.includes("twin flame"), "no twin flame");
  assert.ok(!lower.includes("valentine"), "no valentine");
}

console.log("assert-love-guidance-language: ok");
