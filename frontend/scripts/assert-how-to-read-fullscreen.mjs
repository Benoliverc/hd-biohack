/**
 * Full-screen How to read reader (v2 brief) — source ACs (FE).
 * Run: npx tsx scripts/assert-how-to-read-fullscreen.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const coach = read("src/components/LiteracyCoach.tsx");
const header = read("src/components/Header.tsx");
const layout = read("src/app/layout.tsx");
const ctx = read("src/components/LiteracyHowToReadContext.tsx");
const todayInd = read("src/components/TodayIndication.tsx");
const transits = read("src/app/transits/page.tsx");
const profile = read("src/app/profile/page.tsx");
const soul = read("src/app/soul/page.tsx");
const hdCopy = read("src/lib/hdCopy.ts");
const pkg = read("package.json");
const pulseAssert = read("scripts/assert-literacy-pulse.mjs");
const fact = read("src/lib/hdFactOfTheDay.ts");

assert.ok(
  pkg.includes('"assert:how-to-read-fullscreen": "npx tsx scripts/assert-how-to-read-fullscreen.mjs"'),
  "package.json wires assert:how-to-read-fullscreen",
);

// --- One pattern, same variants / titles / test ids / banks ---
assert.ok(coach.includes('variant === "chart"'), "chart variant");
assert.ok(coach.includes('variant === "soul"'), "soul variant");
assert.ok(coach.includes('"How to read your chart"'), "chart title");
assert.ok(coach.includes('"How to read Soul"'), "soul title");
assert.ok(coach.includes('"How to read Today"'), "today title");
assert.ok(coach.includes('"chart-literacy-coach"'), "chart test id");
assert.ok(coach.includes('"soul-literacy-coach"'), "soul test id");
assert.ok(coach.includes('"today-literacy-coach"'), "today test id");
assert.ok(coach.includes("CHART_LITERACY_STEPS"), "chart steps bank");
assert.ok(coach.includes("SOUL_LITERACY_STEPS"), "soul steps bank");
assert.ok(coach.includes("TODAY_LITERACY_STEPS"), "today steps bank");
assert.ok(coach.includes("onJump"), "onJump hook kept");

assert.ok(hdCopy.includes('chart: "baseline.literacy.chart.v1"'), "chart storage key");
assert.ok(hdCopy.includes('soul: "baseline.literacy.soul.v1"'), "soul storage key");
assert.ok(hdCopy.includes('today: "baseline.literacy.today.v1"'), "today storage key");
assert.ok(coach.includes("LITERACY_STORAGE_KEYS"), "coach uses existing storage keys");

// --- No expanded inline panel, no pager, no first-visit auto-open ---
assert.doesNotMatch(coach, /max-h-\[min\(32vh/);
assert.doesNotMatch(coach, /max-h-\[50vh\]/);
assert.doesNotMatch(coach, /data-literacy-state="expanded"/);
assert.doesNotMatch(coach, /\$\{testId\}-prev/);
assert.doesNotMatch(coach, /\$\{testId\}-next/);
assert.doesNotMatch(coach, />Prev</);
assert.doesNotMatch(coach, />Next</);
assert.doesNotMatch(coach, /setExpanded\(true\)/);
assert.doesNotMatch(coach, /setExpanded\(!dismissed\)/);
assert.ok(
  /data-literacy-state="chip"/.test(coach),
  "after hydrate the page control is a chip",
);
assert.ok(coach.includes('data-testid={`${testId}-reopen`}'), "reopen id stays on the chip");
assert.ok(coach.includes('className="h-10"'), "chip-sized hydrate placeholder");
assert.ok(coach.includes('data-literacy-state="hydrating"'), "hydrate placeholder state");
assert.ok(
  /setDismissed\(readDismissed\(storageKey\)\)/.test(coach),
  "storage is read only to quiet the chip label, not to auto-open",
);
assert.ok(
  !/useEffect\([\s\S]{0,200}setOpen\(true\)/.test(coach),
  "no effect auto-opens the reader",
);

// First-visit label is the full title; Got it uses reopen labels already in the component
assert.ok(coach.includes('const chipLabel = dismissed ? reopenLabel : title'), "first-visit vs Got-it chip labels");
assert.ok(coach.includes('? "How to read"'), "chart/today reopen label");
assert.ok(coach.includes('? "How to read Soul"'), "soul reopen label is not shortened");
assert.doesNotMatch(coach, /New badge|data-literacy-new|"New"/);

// Only Got it writes the key
const writeCalls = [...coach.matchAll(/\bwriteDismissed\(/g)].filter(
  (m) => !coach.slice(Math.max(0, m.index - 20), m.index).includes("function "),
);
assert.equal(writeCalls.length, 1, "only one writeDismissed call site");
assert.ok(
  /const handleGotIt = useCallback\(\(\) => \{\s*writeDismissed\(storageKey\)/s.test(coach),
  "Got it is the only dismiss that writes the storage key",
);
assert.ok(coach.includes('data-testid={`${testId}-dismiss`}'), "Got it keeps dismiss test id");
assert.ok(
  /handleGotIt[\s\S]{0,250}focus: chipRef/.test(coach) ||
    /finishClose\(\{ focus: chipRef\.current \}\)/.test(coach),
  "Got it returns focus to the chip",
);

// --- Contrast: chip, pulse, nav use fg or growth-ink, not failing chrome ---
const chipBlock = coach.slice(coach.indexOf("const chipClass"), coach.indexOf("return (", coach.indexOf("const chipClass")));
assert.ok(/text-fg/.test(chipBlock), "chip uses primary ink");
assert.ok(!/text-fg-secondary/.test(chipBlock), "chip does not use text-fg-secondary");
assert.ok(!/hover:text-growth[^-]/.test(chipBlock), "chip hover is not raw text-growth");
assert.ok(!/text-fg-muted/.test(chipBlock), "chip does not use text-fg-muted");
assert.ok(/text-growth-ink|text-fg/.test(chipBlock), "chip hover/ink stays AA");
assert.ok(/border-growth\/40/.test(chipBlock), "first-visit quiet growth border");

const pulseBtnIdx = todayInd.indexOf('data-testid="hd-fact-how-to-read"');
assert.ok(pulseBtnIdx > 0, "pulse how-to-read control");
const pulseBtnStart = todayInd.lastIndexOf("<button", pulseBtnIdx);
const pulseBtn = todayInd.slice(pulseBtnStart, todayInd.indexOf(">", pulseBtnIdx) + 1);
assert.ok(pulseBtn.startsWith("<button"), "pulse is a button, not a hash link");
assert.ok(/text-growth-ink|text-fg/.test(pulseBtn), "pulse uses AA ink");
assert.ok(!/text-growth[^-]/.test(pulseBtn), "pulse does not use raw text-growth");
assert.ok(!/href=\{`#\$\{/.test(todayInd.slice(pulseBtnStart, pulseBtnStart + 800)), "pulse does not hash-scroll");
assert.ok(todayInd.includes("onHowToRead"), "TodayIndication calls up onHowToRead");
assert.ok(transits.includes("onHowToRead="), "transits page opens the Today reader from the pulse");
assert.ok(
  /howToRead\?\.open\(\{ stepId/.test(transits),
  "transits page opens the reader at the pulse step id",
);
assert.ok(
  fact.includes("LITERACY_JUMP_BY_FIELD") &&
    fact.includes('"today-new-signal"') &&
    fact.includes('"today-sun-earth"') &&
    fact.includes('"today-bridged-channels"') &&
    fact.includes('"today-newly-defined"'),
  "LITERACY_JUMP_BY_FIELD values stay the existing step/section ids",
);

// Direct live hashes still exist as page section ids (do not rename)
for (const id of ["today-new-signal", "today-sun-earth", "today-bridged-channels", "today-newly-defined"]) {
  assert.ok(transits.includes(`id="${id}"`) || todayInd.includes(`id="${id}"`), `live id ${id} remains`);
}

// --- Full-viewport dialog covering the top bar ---
assert.ok(coach.includes("createPortal"), "reader portals");
assert.ok(coach.includes("document.body.appendChild"), "portal is on document.body");
assert.ok(coach.includes('role="dialog"'), "role=dialog");
assert.ok(coach.includes('aria-modal="true"'), "aria-modal");
assert.ok(coach.includes("aria-labelledby"), "aria-labelledby on title");
assert.ok(coach.includes('aria-label="Close"'), "close aria-label");
assert.ok(coach.includes("fixed inset-0"), "fixed inset-0 covers the viewport");
assert.ok(/h-\[100dvh\]/.test(coach), "height 100dvh");
assert.ok(!/top:\s*var\(--app-header-h\)/.test(coach), "not sat under --app-header-h");
assert.ok(!/top:\s*var\(--chart-section-nav-h\)/.test(coach), "not sat under chart section nav");
assert.ok(!/top-\[var\(--app-header-h/.test(coach), "no top offset under app header");
assert.ok(coach.includes("zIndex") || coach.includes("z-50") || coach.includes('zIndex = "50"'), "z-index at least 50");
assert.ok(coach.includes("bg-canvas"), "solid canvas background");
assert.ok(coach.includes("env(safe-area-inset-top)"), "chrome safe-area padding");
assert.ok(coach.includes("env(safe-area-inset-bottom)"), "Got it footer safe-area padding");
assert.ok(coach.includes("overscroll-contain") || coach.includes("overscroll-behavior"), "article overscroll contain");
assert.ok(coach.includes('document.body.style.overflow = "hidden"'), "lock body scroll while open");
assert.ok(coach.includes("inert"), "page behind is inert");
assert.ok(coach.includes('aria-hidden", "true"') || coach.includes('aria-hidden","true"') || coach.includes("aria-hidden"), "page behind is aria-hidden");
assert.ok(coach.includes(".focus()"), "focus management");
assert.ok(/closeRef\.current\?\.focus\(\)/.test(coach), "initial focus is the close control");
assert.ok(coach.includes('key === "Escape"') || coach.includes('key === "Escape"'), "Escape closes");
assert.ok(coach.includes("Tab"), "focus trap via Tab");

// Section rail + continuous article + N sections
assert.ok(coach.includes(`${"steps.length"} sections`) || coach.includes("sections"), "N sections label");
assert.ok(coach.includes("{steps.length} sections"), "quiet N sections");
assert.ok(coach.includes("Sections") || coach.includes(`${"testId"}-rail`), "section rail");
assert.ok(coach.includes("`${testId}-rail`") || coach.includes("data-testid={`${testId}-rail`}"), "rail test id");
assert.ok(coach.includes("`${testId}-step-${step.id}`") || coach.includes("data-testid={`${testId}-step-${step.id}`}"), "step test ids kept");
assert.ok(coach.includes("`${testId}-jump-${step.id}`") || coach.includes("data-testid={`${testId}-jump-${step.id}`}"), "jump test ids kept");
assert.ok(coach.includes("Jump · {step.jumpLabel}"), "Jump · {jumpLabel} kept");
assert.ok(coach.includes("type-body"), "body uses type-body");
assert.ok(coach.includes("type-section"), "section titles use type-section");
assert.ok(coach.includes("max-w-prose"), "max-w-prose");
const bodyBlock = coach.slice(coach.indexOf("type-body"), coach.indexOf("type-body") + 80);
assert.ok(/text-fg/.test(bodyBlock), "body is primary ink");
assert.ok(!/type-body text-fg-secondary/.test(coach), "guide body is not secondary ink");

// Jump closes first: unmount, restore overflow, consume history, then next frame
assert.ok(coach.includes("handleJump") || coach.includes("onJumpStep"), "jump handler");
assert.ok(coach.includes("history.back()"), "consume reader history entry");
assert.ok(coach.includes("requestAnimationFrame"), "Jump runs existing onJump/defaultJump on the next frame");
assert.ok(coach.includes('behavior: "auto"'), "post-Jump / in-reader scroll is instant");
assert.ok(!/scrollIntoView\(\{ behavior: "smooth"/.test(coach), "defaultJump no longer always smooth");
assert.ok(
  /finishClose\(\{ after: runJump \}\)/.test(coach),
  "Jump closes the reader before running the existing jump path",
);

// History back / popstate closes without writing the key and without leaving the page
assert.ok(coach.includes("popstate") || coach.includes("addEventListener(\"popstate\""), "popstate listener");
assert.ok(coach.includes("pushState"), "opening pushes a history entry");
assert.ok(coach.includes("usePathname"), "route change is observed");
assert.ok(/prev !== pathname && openRef\.current/.test(coach), "route change closes the reader");

// --- Header opener ---
assert.ok(header.includes('data-testid="nav-how-to-read"'), "nav-how-to-read test id");
assert.ok(header.includes('t("nav.howToRead")'), "header label is i18n How to read");
assert.ok(header.includes('pathname === "/profile"'), "header only on Chart");
assert.ok(header.includes('pathname === "/soul"'), "header only on Soul");
assert.ok(header.includes('pathname === "/transits"'), "header only on Today");
assert.ok(
  /const literacyRoute =\s*pathname === "\/profile" \|\| pathname === "\/soul" \|\| pathname === "\/transits"/.test(header),
  "header opener routes are only Chart, Soul, and Today",
);
assert.ok(
  !/literacyRoute[\s\S]{0,200}\/biohack/.test(header) &&
    !/showHowToRead[\s\S]{0,200}\/settings/.test(header),
  "header opener is not shown on Protocols or Settings",
);
assert.ok(header.includes("howToRead?.available"), "visibility is signaled from the coach");
assert.ok(header.includes("howToRead?.open"), "header press opens that page's reader");
assert.ok(!/howToRead\?\.open\([\s\S]*stepId/.test(header), "header opener starts at the top");
assert.ok(!/writeDismissed|localStorage\.setItem/.test(header), "header press does not write the storage key");
assert.ok(!/growth-soft/.test(header.slice(header.indexOf("nav-how-to-read") - 400, header.indexOf("nav-how-to-read") + 500)), "header opener is not growth-soft active");
const navBtn = header.slice(header.indexOf('data-testid="nav-how-to-read"'), header.indexOf('data-testid="nav-how-to-read"') + 600);
assert.ok(/text-fg/.test(navBtn) || /text-growth-ink/.test(navBtn), "nav-how-to-read uses AA ink");
assert.ok(!/text-growth[^-/]/.test(navBtn), "nav-how-to-read is not raw text-growth");
assert.ok(!/<Icon |lucide/.test(navBtn), "header opener has no icon");
assert.ok(layout.includes("LiteracyHowToReadProvider"), "provider wraps Header + pages");
assert.ok(ctx.includes("available"), "local signal for header visibility");

// Do not add How to read to ChartSectionNav or ProtocolsHeader
const sectionNavStart = profile.indexOf("function ChartSectionNav");
assert.ok(sectionNavStart >= 0, "ChartSectionNav lives on the chart page");
const sectionNav = profile.slice(sectionNavStart, profile.indexOf("\n}", sectionNavStart) + 2);
assert.ok(!/nav-how-to-read/.test(sectionNav), "not added to ChartSectionNav");
const biohack = read("src/app/biohack/page.tsx");
const protoStart = biohack.indexOf("function ProtocolsHeader");
assert.ok(protoStart >= 0, "ProtocolsHeader lives on Protocols");
assert.ok(!/nav-how-to-read/.test(biohack.slice(protoStart, protoStart + 2500)), "not added to ProtocolsHeader");

// Placement: in-page chips stay in current slots
assert.ok(profile.includes('<LiteracyCoach'), "chart coach stays on profile");
assert.ok(soul.includes('<LiteracyCoach'), "soul coach stays on soul");
const todayCoachIdx = transits.indexOf('<LiteracyCoach');
const todayIndIdx = transits.indexOf("<TodayIndication");
assert.ok(todayCoachIdx > todayIndIdx && todayIndIdx > 0, "Today chip stays after TodayIndication, not above the Move");

// Existing shipped Today slots were not moved
assert.ok(todayInd.includes('data-testid="today-upcoming-toggle"'), "Next 7 days fold stays");
assert.ok(todayInd.includes("EarlierWeeksHistory") || transits.includes("EarlierWeeksHistory") || todayInd.includes("earlier"), "Earlier weeks stays in tree");

console.log("assert-how-to-read-fullscreen: ok");
