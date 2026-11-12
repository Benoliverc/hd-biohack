/**
 * Today kit-tease pass — source ACs (FE).
 * Run: npx tsx scripts/assert-today-kit-tease.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const todayInd = read("src/components/TodayIndication.tsx");
const biohack = read("src/app/biohack/page.tsx");
const moveCard = read("src/components/protocols/TodaysMoveCard.tsx");
const completionsSrc = read("src/lib/protocolCompletions.ts");
const apiSrc = read("src/lib/api.ts");
const historySrc = read("src/lib/earlierWeeksHistory.ts");
const pkg = read("package.json");
const css = read("src/app/globals.css");
const en = read("src/lib/i18n/messages/en.ts");
const locales = ["en", "nl", "de", "fr", "es"].map((id) => ({
  id,
  src: read(`src/lib/i18n/messages/${id}.ts`),
}));

assert.ok(
  pkg.includes('"assert:today-kit-tease": "npx tsx scripts/assert-today-kit-tease.mjs"'),
  "package.json wires assert:today-kit-tease",
);

// --- No Today tick ---
assert.doesNotMatch(todayInd, /today-kit-done/);
assert.doesNotMatch(todayInd, /persistToggle\(\s*kitId/);
assert.doesNotMatch(todayInd, /persistToggle\([^)]*today-kit:/);
assert.ok(todayInd.includes('data-testid="today-move-done"'), "Move tick stays");

// --- No “From your kit” Today heading ---
assert.doesNotMatch(todayInd, /t\("today\.fromKit"\)/);
assert.doesNotMatch(todayInd, /From your kit/);
assert.match(todayInd, /t\("today\.kitPick"\)/);
assert.match(en, /Today\u2019s kit pick/);
assert.match(moveCard, /t\("protocols\.fromKit"\)/);
assert.match(moveCard, /t\("protocols\.todayKitPick"\)/);

// --- Filled / no-match / empty / locked hrefs ---
const kitLineStart = todayInd.indexOf('data-testid="today-kit-line"');
assert.ok(kitLineStart > 0, "filled tease test id present");
const kitLine = todayInd.slice(Math.max(0, kitLineStart - 400), kitLineStart + 900);
assert.match(kitLine, /href="\/biohack#stack"/);
assert.doesNotMatch(kitLine, /#shelf/);
assert.match(kitLine, /min-h-11/);

assert.ok(
  todayInd.includes('inventoryCount > 0 ? "/biohack#stack" : "/biohack#shelf"'),
  "no-match leftover is #stack; empty leftover is #shelf",
);

const lockedStart = todayInd.indexOf("!protocolsUnlocked");
assert.ok(lockedStart > 0);
const lockedBlock = todayInd.slice(lockedStart, todayInd.indexOf("inventoryStatus === \"unknown\""));
assert.match(lockedBlock, /href="\/biohack"/);
assert.doesNotMatch(lockedBlock, /#shelf|#stack/);
assert.doesNotMatch(lockedBlock, /today-kit-setup"/);
assert.match(lockedBlock, /min-h-11/);
assert.ok(
  todayInd.indexOf("!protocolsUnlocked") < todayInd.indexOf('data-testid="today-kit-setup"'),
  "locked branch precedes setup",
);

// --- Setup retained, shrunk, re-leaded ---
assert.match(todayInd, /data-testid="today-kit-setup"/);
assert.match(todayInd, /inventoryStatus === "unknown"/);
assert.match(todayInd, /inventoryCount === 0 && userId && !kitSetupDismissed && onAddToKit/);
assert.match(todayInd, /t\("today\.kitSetupLead"\)/);
assert.match(en, /Add what you already own\. Protocols will use it\./);
assert.doesNotMatch(en, /Today can prefer it/);
assert.match(todayInd, /STARTER_SUPPLEMENTS/);
assert.match(todayInd, /\+ \{name\}/);
assert.match(todayInd, /data-testid="today-kit-setup-input"/);
assert.match(todayInd, /data-testid="today-kit-setup-skip"/);
assert.match(todayInd, /writeKitSetupDismissed/);
const setupStart = todayInd.indexOf('data-testid="today-kit-setup"');
const setup = todayInd.slice(todayInd.lastIndexOf("<div", setupStart), todayInd.indexOf("today-kit-setup-skip") + 80);
assert.doesNotMatch(setup, /bg-growth/);
assert.doesNotMatch(setup, /text-growth/);

const showIdx = todayInd.indexOf('data-testid="today-show-up"');
const setupIdx = todayInd.indexOf('data-testid="today-kit-setup"');
const kitLineIdx = todayInd.indexOf('data-testid="today-kit-line"');
const whenIdx = todayInd.indexOf('data-testid="today-when"');
const whyIdx = todayInd.indexOf('data-testid="main-action-why-details"');
const heroStart = todayInd.indexOf('data-testid="main-action"');
const heroEnd = todayInd.indexOf('data-testid="main-action-status"');
assert.ok(heroStart > 0 && showIdx > heroStart && showIdx < heroEnd, "Show-up inside main-action");
assert.ok(setupIdx > showIdx && kitLineIdx > showIdx, "kit block after Show-up");
assert.ok(whenIdx > setupIdx && whyIdx > setupIdx, "kit block before When / Why");
assert.ok(kitLineIdx < heroEnd && setupIdx < heroEnd, "kit block stays inside main-action");

// --- Protocols hosts today-kit row above the trio, not in checkItems / flash ---
assert.match(moveCard, /data-testid="protocol-today-kit-pick"/);
assert.match(moveCard, /todayKitPick/);
assert.match(biohack, /todayKitPick=\{todayKitPick\}/);
assert.match(biohack, /kind: "kit" as const/);
const checkItemsFn = biohack.slice(biohack.indexOf("const checkItems = useMemo"), biohack.indexOf("const todayKitPick"));
assert.match(checkItemsFn, /\["morning", "midday", "evening"\]/);
assert.doesNotMatch(checkItemsFn, /today-kit:/);
assert.doesNotMatch(checkItemsFn, /todayKitPick/);
assert.match(biohack, /const doneCount = checkItems\.filter/);
assert.match(biohack, /const moveComplete = checkItems\.length > 0 && doneCount === checkItems\.length/);
const flashBlock = biohack.slice(biohack.indexOf("const onToggleItem"), biohack.indexOf("const unlockedBody"));
assert.match(flashBlock, /checkItems\.every/);
assert.match(flashBlock, /it\.kind === "move"/);

const pickRowAt = moveCard.indexOf('data-testid="protocol-today-kit-pick"');
const trioAt = moveCard.indexOf("{items.map((it, idx) => {");
assert.ok(pickRowAt > 0 && trioAt > pickRowAt, "pick row is above the trio list");

// --- kind kit ---
assert.match(completionsSrc, /export type CompletionKind = "move" \| "baseline" \| "evening" \| "kit"/);
assert.match(apiSrc, /kind: "move" \| "baseline" \| "evening" \| "kit"/);
const { normalizeCompletionKind } = await import("../src/lib/protocolCompletions.ts");
assert.equal(normalizeCompletionKind("kit"), "kit");
assert.equal(normalizeCompletionKind("nope"), "move");
assert.match(biohack, /r\.kind === "move" && !isTodayKitRow\(r\)/);
assert.match(historySrc, /isLifestyleMoveItemId\(id\)/);
assert.doesNotMatch(
  historySrc.slice(historySrc.indexOf('if (opts.scope === "today")'), historySrc.indexOf("const note")),
  /isTodayKitItemId\(id\)/,
);

// --- Contrast against elevated / elevated/80 ---
function hexToRgb(hex) {
  const h = hex.replace("#", "").trim();
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function channel(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
function contrastRatio(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}
function mix(top, bottom, alpha) {
  const [r1, g1, b1] = hexToRgb(top);
  const [r0, g0, b0] = hexToRgb(bottom);
  const hex = (n) => Math.round(n).toString(16).padStart(2, "0");
  return `#${hex(r1 * alpha + r0 * (1 - alpha))}${hex(g1 * alpha + g0 * (1 - alpha))}${hex(b1 * alpha + b0 * (1 - alpha))}`;
}
function themeTokens(src, marker) {
  const i = src.indexOf(marker);
  assert.ok(i >= 0, `globals.css has ${marker}`);
  const block = src.slice(i, src.indexOf("}", i));
  const grab = (name) => {
    const m = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
    assert.ok(m, `${marker} defines --${name}`);
    return m[1];
  };
  return {
    elevated: grab("elevated"),
    canvas: grab("canvas"),
    fg: grab("fg"),
    fgSecondary: grab("fg-secondary"),
  };
}
const linen = themeTokens(css, ":root {");
const basalt = themeTokens(css, "html.dark,");

function assertSurface(theme, name) {
  const surface = mix(theme.elevated, theme.canvas, 0.8);
  const fgOnMix = contrastRatio(theme.fg, surface);
  const fgOnElev = contrastRatio(theme.fg, theme.elevated);
  const secOnElev = contrastRatio(theme.fgSecondary, theme.elevated);
  const secOnMix = contrastRatio(theme.fgSecondary, surface);
  assert.ok(fgOnMix >= 4.5, `text-fg on elevated/80 over canvas must be AA in ${name} (got ${fgOnMix.toFixed(2)}:1)`);
  assert.ok(fgOnElev >= 4.5, `text-fg on elevated must be AA in ${name} (got ${fgOnElev.toFixed(2)}:1)`);
  return { secOnElev, secOnMix };
}
const linenRatios = assertSurface(linen, "Linen");
const basaltRatios = assertSurface(basalt, "Basalt");
assert.ok(
  basaltRatios.secOnElev < 4.5,
  `guard: text-fg-secondary on elevated still fails Basalt (${basaltRatios.secOnElev.toFixed(2)}:1)`,
);
assert.ok(
  basaltRatios.secOnMix < 4.5,
  `guard: text-fg-secondary on elevated/80 still fails Basalt (${basaltRatios.secOnMix.toFixed(2)}:1)`,
);
void linenRatios;

// Filled tease / setup / wait / error sit on bg-elevated/80 and use text-fg, not secondary/muted, for body copy
function elevatedKitChunk(src, testId) {
  const i = src.indexOf(`data-testid="${testId}"`);
  assert.ok(i > 0, `${testId} present`);
  const start = src.lastIndexOf("<", i);
  if (testId === "today-kit-line") {
    const close = src.indexOf("</Link>", i);
    return src.slice(start, close + 7);
  }
  if (testId === "today-kit-setup") {
    const skip = src.indexOf("today-kit-setup-skip", i);
    const close = src.indexOf("</button>", skip);
    return src.slice(start, close + 10);
  }
  // wait / error: stop at the next ternary sibling
  const bounds = [
    src.indexOf(") : inventoryStatus ===", i),
    src.indexOf(") : inventoryCount ===", i),
  ].filter((n) => n > start);
  const end = bounds.length ? Math.min(...bounds) : start + 600;
  return src.slice(start, end);
}

for (const testId of ["today-kit-line", "today-kit-setup", "today-kit-setup-wait", "today-kit-setup-error"]) {
  const chunk = elevatedKitChunk(todayInd, testId);
  assert.match(chunk, /bg-elevated\/80/);
  assert.doesNotMatch(chunk, /text-fg-secondary/);
  const mutedHits = [...chunk.matchAll(/[\w-:]*text-fg-muted/g)].map((m) => m[0]);
  assert.ok(
    mutedHits.every((h) => h === "placeholder:text-fg-muted"),
    `${testId} must not use text-fg-muted on elevated (got ${mutedHits.join(", ") || "none"})`,
  );
  assert.doesNotMatch(chunk, /text-growth[^-]/);
}

// --- min-h-11 on new/changed handoff controls ---
assert.match(kitLine, /min-h-11/);
const leftover = todayInd.slice(todayInd.indexOf('href={inventoryCount > 0 ? "/biohack#stack"'));
assert.match(leftover.slice(0, 400), /min-h-11/);

// --- #stack honored and does not open Shelf; #shelf still opens Shelf ---
assert.match(biohack, /function stackDeepLinkRequested/);
assert.match(biohack, /hash === "stack"/);
assert.match(biohack, /get\("stack"\) === "1"/);
assert.match(biohack, /data-testid="todays-move"/);
assert.match(biohack, /setHighlightTodayKitPick/);
assert.match(biohack, /setShelfOpen\(!stackDeep && \(deep \|\| inventory\.length === 0\)\)/);
assert.match(biohack, /function shelfDeepLinkRequested/);
assert.match(biohack, /hash === "shelf"/);
assert.match(biohack, /get\("shelf"\) === "1"/);
assert.match(biohack, /setShelfOpen\(true\)/);

// Recede generic tick-the-stack when the kit line already hands off to #stack
assert.match(todayInd, /hasKitStackHandoff/);
assert.match(todayInd, /protocolsUnlocked && !hasKitStackHandoff/);
const handoff = todayInd.slice(todayInd.indexOf('data-testid="open-protocols-secondary"') - 120, todayInd.indexOf('data-testid="open-protocols-secondary"') + 280);
assert.match(handoff, /href="\/biohack"/);
assert.doesNotMatch(handoff, /#shelf|#stack/);

// --- i18n: changed keys present in all five locales; non-EN tickStack / lead translated ---
const requiredKeys = [
  "today.kitPick",
  "today.kitPickCta",
  "today.kitSetupLead",
  "today.tickStack",
  "protocols.todayKitPick",
  "today.kitSetupHint",
  "today.kitSetupEmpty",
  "today.kitSetupNoMatch",
];
for (const { id, src } of locales) {
  for (const key of requiredKeys) {
    assert.ok(src.includes(`"${key}"`) || src.includes(`'${key}'`), `${id} has ${key}`);
  }
  if (id !== "en") {
    assert.ok(!src.includes("Today can prefer it."), `${id} must not keep the old EN setup lead`);
    const tick = src.match(/['"]today\.tickStack['"]\s*:\s*['"]([^'"]+)['"]/);
    assert.ok(tick, `${id} has today.tickStack`);
    assert.notEqual(tick[1], "Tick the stack on Protocols", `${id} tickStack is translated`);
  }
}
assert.match(en, /'protocols\.fromKit': 'From your kit'/);

console.log("assert-today-kit-tease PASS");
