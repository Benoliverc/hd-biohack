/**
 * Layout-shaped skeletons (brief layout-shaped-skeletons, 28 Nov 2026).
 * Source checks plus renderToStaticMarkup inside the real I18nProvider.
 *
 * I18nProvider applies accountLocale in useEffect, so a static render of the
 * provider alone stays on the default locale. I18nLocaleRoot (same module,
 * synchronous locale, the off-screen tree the app already uses for rasters)
 * sits inside that provider so the en and nl strings are actually in the markup.
 *
 * Run: npx tsx scripts/assert-layout-shaped-skeletons.mjs
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

globalThis.React = React;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const sha = (text) => createHash("sha256").update(text).digest("hex");

const {
  ChartAccountSkeleton,
  ChartFormSkeleton,
  ChartSkeleton,
  GenericPageSkeleton,
  HomeSkeleton,
  ProtocolsSkeleton,
  RouteSkeleton,
  SettingsSkeleton,
  SoulSkeleton,
  TodaySkeleton,
} = await import("../src/components/PageSkeleton.tsx");
const { I18nProvider, I18nLocaleRoot, translate } = await import("../src/lib/i18n/index.ts");

function render(node, locale) {
  return renderToStaticMarkup(
    React.createElement(
      I18nProvider,
      { accountLocale: locale },
      React.createElement(I18nLocaleRoot, { locale }, node),
    ),
  );
}

function visibleText(html) {
  const withoutSr = html.replace(/<span class="sr-only">[\s\S]*?<\/span>/g, "");
  return withoutSr
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function assertSkeleton(html, { testId, label }) {
  const rootMatch = html.match(/^<([a-z0-9]+)([^>]*)>/);
  assert.ok(rootMatch, "skeleton has a root element");
  const attrs = rootMatch[2];
  assert.match(attrs, /role="status"/, `${testId} role=status`);
  assert.match(attrs, /aria-busy="true"/, `${testId} aria-busy`);
  assert.match(attrs, /aria-live="polite"/, `${testId} aria-live`);
  assert.match(attrs, new RegExp(`data-testid="${testId}"`), `${testId} testid on root`);
  const sr = html.match(/<span class="sr-only">([^<]*)<\/span>/);
  assert.ok(sr, `${testId} has an sr-only label`);
  assert.equal(sr[1], label, `${testId} sr-only label`);
  assert.equal(visibleText(html), "", `${testId} has no visible text`);
  assert.equal((html.match(/<span class="sr-only">/g) || []).length, 1, `${testId} one sr-only label`);

  const tags = [...html.matchAll(/<([a-z0-9]+)([^>]*)>/g)];
  let blocks = 0;
  for (const tag of tags) {
    const classMatch = tag[2].match(/class="([^"]*)"/);
    if (!classMatch) continue;
    const tokens = classMatch[1].split(/\s+/).filter(Boolean);
    assert.equal(tokens.includes("animate-pulse"), false, `${testId} has no bare animate-pulse`);
    if (tokens.includes("bg-sunken")) {
      assert.ok(
        tokens.includes("motion-safe:animate-pulse"),
        `${testId} sunken block uses motion-safe:animate-pulse`,
      );
      blocks += 1;
    }
  }
  assert.ok(blocks > 0, `${testId} has at least one skeleton block`);
}

// --- 1 + 2. Route picks and rendered a11y, en and nl ---
const routes = [
  ["/", "skeleton-home"],
  ["/transits", "skeleton-today"],
  ["/biohack", "skeleton-protocols"],
  ["/profile", "skeleton-chart"],
  ["/soul", "soul-loading"],
  ["/settings", "skeleton-settings"],
  ["/settings/password", "skeleton-settings"],
  ["/settings/delete-account", "skeleton-settings"],
  ["/something", "skeleton-page"],
];

const standalones = [
  [ChartSkeleton, "skeleton-chart", "chart.people.loadingSavedChart"],
  [ChartFormSkeleton, "skeleton-chart-form", "chart.people.loadingSavedChart"],
  [ChartAccountSkeleton, "skeleton-chart-account", "chart.people.loadingAccount"],
  [SoulSkeleton, "soul-loading", "soul.chrome.loadingCharts"],
  [SettingsSkeleton, "skeleton-settings", "common.loading"],
  [HomeSkeleton, "skeleton-home", "auth.loading"],
  [TodaySkeleton, "skeleton-today", "auth.loading"],
  [ProtocolsSkeleton, "skeleton-protocols", "auth.loading"],
  [GenericPageSkeleton, "skeleton-page", "auth.loading"],
];

for (const locale of ["en", "nl"]) {
  const authLabel = translate(locale, "auth.loading");
  for (const [pathname, testId] of routes) {
    const html = render(
      React.createElement(RouteSkeleton, { pathname, label: authLabel }),
      locale,
    );
    assertSkeleton(html, { testId, label: authLabel });
  }
  for (const [Component, testId, key] of standalones) {
    const html = render(React.createElement(Component, null), locale);
    assertSkeleton(html, { testId, label: translate(locale, key) });
  }
}

// --- 3. Chart page: no visible loading strings, amber banner kept for real errors ---
const profile = read("src/app/profile/page.tsx");
assert.doesNotMatch(profile, /loadingSavedChart|loadingAccount/);
assert.doesNotMatch(profile, /fallback=\{null\}/);
assert.match(profile, /\{user && !formReady && <ChartFormSkeleton \/>\}/);
assert.match(profile, /\{usersLoading && !usersError \? <ChartAccountSkeleton \/> : null\}/);
assert.match(profile, /<Suspense fallback=\{<ChartSkeleton \/>\}>/);
const amber = `        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-energy/50 bg-energy/10 px-4 py-3 text-sm text-energy-ink">
          {usersError && <span>{t("chart.people.accountLoadIssue", { error: usersError })}</span>}
          {!usersLoading && !user && <span>{t("chart.people.noDevUser")}</span>}
          {(usersError || (!usersLoading && !user)) && (
            <button
              type="button"
              className="min-h-10 rounded-lg border border-energy-ink px-3 py-2.5 text-sm hover:bg-energy/15"
              onClick={() => refreshUsers()}
            >
              {t("chart.people.retryUser")}
            </button>
          )}
        </div>`;
assert.ok(profile.includes(amber), "amber banner text and button stay byte-identical");
assert.ok(
  profile.includes("{(usersError || (!usersLoading && !user)) && ("),
  "amber banner still gates on usersError or !usersLoading && !user",
);

// --- 4. Soul keeps its testid; Settings loading text and the "…" fallback are gone ---
const soul = read("src/app/soul/page.tsx");
assert.match(soul, /<SoulSkeleton data-testid="soul-loading" \/>/);
assert.doesNotMatch(soul, /soul\.chrome\.loadingCharts/);

for (const rel of [
  "src/app/settings/page.tsx",
  "src/app/settings/password/page.tsx",
  "src/app/settings/delete-account/page.tsx",
]) {
  const src = read(rel);
  assert.doesNotMatch(src, /\{t\("common\.loading"\)\}/, `${rel} does not render common.loading`);
  assert.match(src, /<SettingsSkeleton \/>/, `${rel} uses SettingsSkeleton`);
}
const settings = read("src/app/settings/page.tsx");
assert.match(settings, /<Suspense fallback=\{<SettingsSkeleton \/>\}>/);
assert.doesNotMatch(settings, /fallback=\{<p[^>]*>…<\/p>\}/);

// --- 5. AuthGate: redirecting and login-cover branches byte-identical to 6085a38 ---
const gate = read("src/components/AuthGate.tsx");
const redirectingBranch = `  if (!isPublic && (!readSessionUserId() || !readSessionToken()) && !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-fg-muted">
        {t("auth.redirecting")}
      </div>
    );
  }`;
const loginCoverBranch = `  if (signedInOnLogin || storedSessionHydrating) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-fg-muted">
        {t("auth.loading")}
      </div>
    );
  }`;
assert.equal(gate.split(redirectingBranch).length, 2, "auth.redirecting branch once, byte-identical");
assert.equal(gate.split(loginCoverBranch).length, 2, "login cover branch once, byte-identical");
assert.match(
  gate,
  /if \(!sessionReady && !isPublic\) \{\s*return <RouteSkeleton pathname=\{pathname\} label=\{t\("auth\.loading"\)\} \/>;/,
);
assert.doesNotMatch(
  gate.slice(0, gate.indexOf(redirectingBranch)),
  /min-h-\[40vh\]/,
  "session-pending branch is no longer the centered Loading line",
);

// --- 6. Files this skeleton pass does not edit stay pinned. Message catalogs
// were updated on main (ccdb757). biohack/page.tsx and globals.css are
// re-pinned to the disclosure-pattern bytes on the merged tree. ---
const FROZEN = {
  "src/lib/i18n/messages/en.ts": "08509229b4824354e75cddc108c17328ea717d0da8930a4f8d0032dfc3591db3",
  "src/lib/i18n/messages/nl.ts": "97f7a76f6dfb2ed2fd1d3c59eed2c81caf7de1664d0cc48f3c1f7370a96eb861",
  "src/lib/i18n/messages/todaySoul.en.ts": "8ee99ae08e41fa619a3b7bb3617dea63eadb8a6a0304a12859f56c07d37ce9c2",
  "src/lib/i18n/messages/todaySoul.nl.ts": "2c2dad2167eb0a0ba38276d84babe28268b731112404f22e95592b5e10f14f1e",
  "src/app/page.tsx": "2da3236bb90898826a75b9101dc59759c3f87fc400f05fba5715dd1ac9fd9a2a",
  "src/app/biohack/page.tsx": "56bf53d2ee929dbf244c33b4d26328b6d7b07e37772131a60bc848ad7de4dfd2",
  "src/app/globals.css": "2762eff0da5f55e4029524fd45182425ca17945742f8069e725ae703d64da18f",
  "src/app/login/page.tsx": "854d24bc9e2161de26bbc7b667166c46034f3c9fd41e5b2adab2273ba16c0576",
  "src/app/layout.tsx": "62913d0a4dded828b641d0fcf5d03bb0b269051cf5d5035ab0b2e045d5df9274",
};
for (const [rel, digest] of Object.entries(FROZEN)) {
  assert.equal(sha(read(rel)), digest, `${rel} pin`);
}

const skeletonSrc = read("src/components/PageSkeleton.tsx");
assert.match(skeletonSrc, /motion-safe:animate-pulse bg-sunken/);
assert.doesNotMatch(skeletonSrc, /(^|[^:\w-])animate-pulse/);

console.log("PASS assert-layout-shaped-skeletons");
