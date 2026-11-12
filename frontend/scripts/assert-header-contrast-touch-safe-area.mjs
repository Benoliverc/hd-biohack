/**
 * Header contrast, touch, and safe-area pass — source ACs (FE).
 * Run: npx tsx scripts/assert-header-contrast-touch-safe-area.mjs
 *
 * Locked brief: /workspace/reports/header-contrast-touch-safe-area-build-brief-2026-11-12.md
 *
 * Known Grounded Vitality token ratios (WCAG 2.2 AA ≥ 4.5:1, normal text):
 *   - fg-secondary on canvas: 5.62:1 Linen, 5.00:1 Basalt (brief)
 *   - growth-ink on growth-soft: 7.95:1 Linen, 12.40:1 Basalt (brief)
 *   - growth-ink on canvas: 9.47:1 Linen, 14.27:1 Basalt (computed this pass)
 *   - growth-ink on bg-growth/15 over canvas: 7.74:1 Linen, 12.64:1 Basalt
 *     (computed this pass; active Settings / Admin keep this surface)
 *   - fg on sunken (hover): 12.99:1 Linen, 16.54:1 Basalt (computed this pass)
 *   - fg-muted on canvas fails: 3.40:1 Linen, 3.02:1 Basalt
 *   - raw growth on canvas fails Basalt: 3.08:1
 *   - Pro badge previous growth on growth/20 fails: 4.20:1 Linen, 2.60:1 Basalt (brief)
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const header = read("src/components/Header.tsx");
const profile = read("src/app/profile/page.tsx");
const css = read("src/app/globals.css");
const layout = read("src/app/layout.tsx");
const pkg = read("package.json");

const headerFnStart = header.indexOf("export function Header()");
assert.ok(headerFnStart >= 0, "Header() is exported");
const headerFn = header.slice(headerFnStart);

const navStart = profile.indexOf("function ChartSectionNav");
assert.ok(navStart >= 0, "ChartSectionNav lives on the chart page");
const navEnd = profile.indexOf("\nexport default function ProfilePage", navStart);
assert.ok(navEnd > navStart, "ChartSectionNav ends before ProfilePage");
const sectionNav = profile.slice(navStart, navEnd);

function blockAfter(src, needle, len = 700) {
  const i = src.indexOf(needle);
  assert.ok(i >= 0, `missing ${needle}`);
  return src.slice(i, i + len);
}

function hasRawGrowthInk(src) {
  return /(?:^|[^a-z-])(?:hover:)?text-growth(?!-ink)/.test(src);
}

assert.ok(
  pkg.includes(
    '"assert:header-contrast-touch-safe-area": "npx tsx scripts/assert-header-contrast-touch-safe-area.mjs"',
  ),
  "package.json wires assert:header-contrast-touch-safe-area",
);

// --- Wordmark ---
const wordmark = blockAfter(headerFn, 'data-testid="nav-wordmark"');
assert.ok(/text-growth-ink/.test(wordmark), "wordmark uses text-growth-ink");
assert.ok(!hasRawGrowthInk(wordmark), "wordmark is not raw text-growth");
assert.ok(/min-h-11/.test(wordmark), "wordmark is min-h-11");
assert.ok(/text-base/.test(wordmark) && /sm:text-lg/.test(wordmark), "wordmark type stays text-base sm:text-lg");
assert.ok(!/sm:text-xl|text-lg font-semibold/.test(wordmark), "wordmark is not enlarged on mobile");

// --- Cluster / Sign out / Sign in ---
assert.ok(
  headerFn.includes('flex shrink-0 items-center gap-1.5 text-xs text-fg-secondary'),
  "row-1 cluster uses text-fg-secondary, not text-fg-muted",
);
const signOut = blockAfter(headerFn, 'data-testid="sign-out"');
assert.ok(/text-fg-secondary/.test(signOut), "Sign out has passing ink on the control");
assert.ok(/min-h-11/.test(signOut), "Sign out is min-h-11");
assert.ok(!/text-fg-muted/.test(signOut), "Sign out is not text-fg-muted");
assert.ok(!hasRawGrowthInk(signOut), "Sign out hover is not raw text-growth");

const signIn = blockAfter(headerFn, 'data-testid="header-sign-in"');
assert.ok(/text-fg-secondary/.test(signIn), "Sign in has passing ink on the control");
assert.ok(/min-h-11/.test(signIn), "Sign in is min-h-11");
assert.ok(!/text-fg-muted/.test(signIn), "Sign in is not text-fg-muted");
assert.ok(!hasRawGrowthInk(signIn), "Sign in hover is not raw text-growth");

// --- Dev summary (the header control, not DevChrome internals) ---
const devSummary = blockAfter(headerFn, "<summary", 400);
assert.ok(/min-h-11/.test(devSummary), "Dev summary is min-h-11");
assert.ok(/text-fg-secondary/.test(devSummary), "Dev summary uses text-fg-secondary");
assert.ok(!/text-fg-muted/.test(devSummary), "Dev summary is not text-fg-muted");
assert.ok(!hasRawGrowthInk(devSummary), "Dev summary hover is not raw text-growth");

// --- Settings and Admin ---
const settings = blockAfter(headerFn, 'data-testid="nav-settings"');
assert.ok(/min-h-11/.test(settings), "Settings is min-h-11");
assert.ok(/min-w-11/.test(settings), "icon-only Settings also has min-w-11");
assert.ok(/hidden sm:inline/.test(settings), "Settings label stays hidden below sm");
assert.ok(/text-growth-ink/.test(settings), "active Settings uses text-growth-ink");
assert.ok(/bg-growth\/15/.test(settings), "active Settings keeps growth/15 surface (AA with growth-ink)");
assert.ok(/text-fg-secondary/.test(settings), "inactive Settings uses text-fg-secondary");
assert.ok(!/text-fg-muted/.test(settings), "Settings is not text-fg-muted");
assert.ok(!hasRawGrowthInk(settings), "Settings is not raw text-growth");
assert.ok(!/hover:text-growth(?!-ink)/.test(settings), "Settings hover is not raw text-growth");

const admin = blockAfter(headerFn, 'data-testid="nav-admin"');
assert.ok(/min-h-11/.test(admin), "Admin is min-h-11");
assert.ok(/text-growth-ink/.test(admin), "active Admin uses text-growth-ink");
assert.ok(/bg-growth\/15/.test(admin), "active Admin keeps growth/15 surface (AA with growth-ink)");
assert.ok(/text-fg-secondary/.test(admin), "inactive Admin uses text-fg-secondary");
assert.ok(!/text-fg-muted/.test(admin), "Admin is not text-fg-muted");
assert.ok(!hasRawGrowthInk(admin), "Admin is not raw text-growth");

// --- Primary tabs ---
const tabClass = headerFn.slice(headerFn.indexOf("const active = pathname === href;"));
const tabLink = blockAfter(tabClass, "className={`inline-flex min-h-11 shrink-0", 500);
assert.ok(/min-h-11/.test(tabLink), "primary tabs are min-h-11");
assert.ok(/text-xs/.test(tabLink) && /sm:text-sm/.test(tabLink), "tab type is not enlarged on small screens");
assert.ok(/bg-growth-soft font-medium text-growth-ink/.test(tabLink), "active tab is growth-ink on growth-soft");
assert.ok(/border-growth\/40 bg-growth-soft/.test(tabLink), "active tab keeps border-growth/40 bg-growth-soft");
assert.ok(/text-fg-secondary/.test(tabLink), "inactive tabs use text-fg-secondary");
assert.ok(/hover:bg-sunken hover:text-fg/.test(tabLink), "inactive tab hover is fg on sunken");
assert.ok(!/text-fg-muted/.test(tabLink), "inactive tabs are not text-fg-muted");
assert.ok(!hasRawGrowthInk(tabLink), "tabs are not raw text-growth");

const navBlock = header.slice(header.indexOf("const nav = ["), header.indexOf("];") + 2);
const navHrefs = [...navBlock.matchAll(/href: "([^"]+)"/g)].map((m) => m[1]);
assert.deepEqual(
  navHrefs,
  ["/transits", "/biohack", "/profile", "/soul"],
  "primary nav stays Today, Protocols, Chart, Soul",
);

// --- How to read inks left alone; target only grows to 44px ---
const howTo = blockAfter(headerFn, 'data-testid="nav-how-to-read"');
assert.ok(/text-fg hover:bg-sunken hover:text-growth-ink/.test(howTo), "How to read inks are unchanged");
assert.ok(/min-h-11/.test(howTo), "How to read is min-h-11");
assert.ok(/text-xs font-medium/.test(howTo) && /sm:text-sm/.test(howTo), "How to read type is not enlarged");
assert.ok(headerFn.includes("pointer-events-none invisible inline-flex min-h-11"), "How to read spacer is min-h-11");

// --- Display name and beta strip inks left alone ---
assert.ok(
  headerFn.includes('hidden max-w-[7rem] truncate text-fg-secondary sm:inline'),
  "display name ink is unchanged",
);
assert.ok(
  headerFn.includes(
    'app-header-pad-x border-t border-border/60 bg-growth-soft/40 py-1.5 text-center type-caption text-fg-secondary',
  ),
  "beta strip ink is unchanged and max()s horizontal safe-area insets",
);
assert.ok(headerFn.includes('data-testid="beta-chrome-note"'), "beta strip test id remains");

// --- Pro badge: surface/ink, not type size; Free badge left alone ---
const badge = blockAfter(headerFn, 'data-testid="tier-badge"');
assert.ok(/bg-growth-soft text-growth-ink/.test(badge), "Pro badge is growth-ink on growth-soft");
assert.ok(/bg-energy\/15 text-energy-ink/.test(badge), "Free badge inks are unchanged");
assert.ok(!/bg-growth\/20/.test(badge), "Pro badge is not the failing growth/20 surface");
assert.ok(!hasRawGrowthInk(badge), "Pro badge is not raw text-growth");
assert.ok(!/min-h-11/.test(badge), "Pro badge is not treated as a tap target");

// --- Header padding and 113px height model (0 inset, no beta) ---
const inner = blockAfter(headerFn, "app-header-pad-x mx-auto max-w-6xl", 80);
assert.ok(/max-w-6xl py-2"/.test(inner), "Header inner wrapper is py-2 with horizontal safe-area padding");
assert.ok(!/py-2\.5/.test(inner), "Header inner wrapper dropped py-2.5");
assert.ok(!/sm:py-3/.test(headerFn), "Header dropped sm:py-3 so sm does not grow the bar");
assert.ok(headerFn.includes('className="mt-2 flex flex-nowrap items-center gap-1"'), "row-2 gap mt-2 is unchanged");
assert.ok(headerFn.includes("border-b border-border"), "Header keeps the 1px bottom border");
// 44 + 44 + py-2 (8+8) + mt-2 (8) + 1px border = 113px. Fallback stays 7rem (112px).
assert.ok(
  /--app-header-h:\s*7rem/.test(css),
  " --app-header-h fallback stays 7rem; ResizeObserver publishes the measured height",
);

// Header() chrome (not DevChrome) has no muted ink and no raw growth text
assert.ok(!/text-fg-muted/.test(headerFn), "Header chrome has no text-fg-muted");
assert.ok(!hasRawGrowthInk(headerFn), "Header chrome has no raw text-growth ink");
assert.ok(
  !/min-h-10/.test(headerFn),
  "Header chrome controls are no longer min-h-10",
);

// --- Safe-area compensation on the measured <header> ---
assert.ok(
  /ref=\{headerRef\}[\s\S]{0,180}className="app-header /.test(headerFn),
  "app-header (top inset) is on the measured <header> element",
);
assert.ok(
  css.includes("padding-top: env(safe-area-inset-top, 0px);"),
  "measured header padding-top is env(safe-area-inset-top) only",
);
assert.ok(
  /padding-left:\s*max\(1rem,\s*env\(safe-area-inset-left, 0px\)\);/.test(css),
  "horizontal padding max()s 1rem with safe-area-inset-left",
);
assert.ok(
  /padding-right:\s*max\(1rem,\s*env\(safe-area-inset-right, 0px\)\);/.test(css),
  "horizontal padding max()s 1rem with safe-area-inset-right",
);
assert.ok(!/safe-area-inset-top,\s*47/.test(css), "no 47px dummy top inset");
assert.ok(!/padding-top:\s*47px/.test(css + headerFn), "no fixed 47px top padding");
assert.match(
  headerFn,
  /setProperty\(\s*"--app-header-h",\s*`\$\{el\.getBoundingClientRect\(\)\.height\}px`/,
  "ResizeObserver still publishes the measured header height, which includes padding-top",
);
assert.ok(headerFn.includes('if (pathname === "/login" || pathname === "/reset-password") return null;'),
  "login and reset-password still return no Header");

assert.match(
  headerFn,
  /pathname === "\/settings" \|\| pathname\.startsWith\("\/settings\/"\)/,
  "Settings active state covers /settings and /settings/*",
);
assert.match(
  headerFn,
  /const literacyRoute =\s*pathname === "\/profile" \|\| pathname === "\/soul" \|\| pathname === "\/transits";/,
  "How to read stays wired only for exact /profile, /soul, and /transits",
);
assert.doesNotMatch(
  headerFn,
  /literacyRoute[\s\S]{0,200}\/settings/,
  "How to read is not broadened to Settings routes",
);

// --- ChartSectionNav ---
assert.ok(sectionNav.includes('style={{ top: "var(--app-header-h)" }}'), "ChartSectionNav stays under --app-header-h");
assert.ok(sectionNav.includes('"--chart-section-nav-h"'), "ResizeObserver still publishes --chart-section-nav-h");
assert.ok(/min-h-11/.test(sectionNav), "ChartSectionNav links are min-h-11");
assert.ok(!/\bh-9\b/.test(sectionNav), "ChartSectionNav links are no longer h-9");
assert.ok(/text-fg-secondary/.test(sectionNav), "ChartSectionNav links use text-fg-secondary");
assert.ok(!/text-fg-muted/.test(sectionNav), "ChartSectionNav links are not text-fg-muted");
assert.ok(/hover:bg-sunken hover:text-fg/.test(sectionNav), "ChartSectionNav hover is fg on sunken");
assert.ok(!hasRawGrowthInk(sectionNav), "ChartSectionNav is not raw text-growth");
assert.ok(/px-1\.5 py-1 /.test(sectionNav), "ChartSectionNav wrapper is py-1 so the bar grows ~4px, not 8px");
assert.ok(!/sm:py-2/.test(sectionNav), "ChartSectionNav dropped sm:py-2");
assert.ok(!/py-1\.5 shadow-soft/.test(sectionNav), "ChartSectionNav wrapper is not py-1.5");
assert.ok(profile.includes('shortLabel: "People"'), "People short label remains");
assert.ok(profile.includes('shortLabel: "Body"'), "Body short label remains");
assert.ok(profile.includes('shortLabel: "Snap"'), "Snap short label remains");
assert.ok(profile.includes('shortLabel: "Deep"'), "Deep short label remains");
assert.ok(/truncate sm:hidden/.test(sectionNav), "short labels still show on small screens");
assert.ok(!/nav-how-to-read/.test(sectionNav), "How to read was not moved into ChartSectionNav");

// --- No viewport-fit=cover and no new PWA manifest in this pass ---
const publicDir = resolve(root, "public");
const publicFiles = existsSync(publicDir) ? readdirSync(publicDir) : [];
assert.ok(!publicFiles.includes("manifest.json"), "no new PWA manifest.json in frontend/public");
assert.ok(!publicFiles.includes("manifest.webmanifest"), "no new PWA web manifest in frontend/public");
assert.ok(!/viewport-fit\s*=\s*cover/.test(layout), "layout did not add viewport-fit=cover");
assert.ok(!/viewport-fit\s*=\s*cover/.test(css), "globals.css did not add viewport-fit=cover");
assert.ok(!/viewport-fit\s*=\s*cover/.test(header), "Header did not add viewport-fit=cover");
assert.ok(!/apple-mobile-web-app/.test(layout), "layout did not add a PWA apple-mobile-web-app meta");

console.log("assert:header-contrast-touch-safe-area ok");
