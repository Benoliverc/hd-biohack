/**
 * Today versus Protocols versus Home — source ACs (FE).
 * Locks returner landing (including no-flash), nav order, wordmark door,
 * locked Home copy and card structure, the Today handoff placement and style,
 * and the login pillar line.
 * Run: npx tsx scripts/assert-today-protocols-home.mjs
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const login = read("src/app/login/page.tsx");
const reset = read("src/app/reset-password/page.tsx");
const gate = read("src/components/AuthGate.tsx");
const youChart = read("src/lib/youChart.ts");
const header = read("src/components/Header.tsx");
const home = read("src/app/page.tsx");
const todayInd = read("src/components/TodayIndication.tsx");
const transits = read("src/app/transits/page.tsx");
const pkg = read("package.json");

// --- 1. Morning arrival on Today ---
assert.ok(login.includes('intent: "create" | "signin"'), "applySession takes create/signin intent");
assert.ok(
  /if \(intent === "create"\) \{\s*router\.replace\("\/profile"\)/.test(login),
  "create-account goes straight to /profile",
);
assert.ok(login.includes("postSignInPath"), "sign-in uses existing /charts You check");
assert.ok(login.includes('await applySession(session.access_token, session.user, "create")'), "register uses create intent");
assert.ok(login.includes('await applySession(session.access_token, session.user, "signin")'), "login uses signin intent");
assert.equal(
  [...login.matchAll(/router\.replace\("\/"\)/g)].length,
  0,
  "login must not send sessions to Home",
);
assert.ok(reset.includes('router.replace("/")'), "password-reset success stays on Home");
assert.ok(gate.includes("natalBindingLoading"), "AuthGate waits until You-chart bind is known");
assert.ok(
  /if \(natalBindingLoading\) return;/.test(gate),
  "AuthGate does not redirect off /login until the You-chart check is known",
);
assert.ok(
  gate.includes('router.replace(natalChart ? "/transits" : "/profile")'),
  "signed-in /login visit goes Today when a You natal is confirmed, else Chart",
);
assert.ok(!gate.includes('natalChart ? "/" :'), "AuthGate must not send returners to Home");
assert.ok(youChart.includes('api.charts(userId)'), "sign-in uses existing /charts API, no new endpoint");
assert.ok(youChart.includes('slot_kind !== "friend"'), "You-chart check ignores person/friend rows");
assert.ok(
  youChart.includes('return "/profile"') && youChart.includes('? "/transits" : "/profile"'),
  "unknown or no-You sign-in lands on /profile; You natal goes Today",
);
assert.ok(!youChart.includes('? "/" :'), "postSignInPath must not land returners on Home");
assert.ok(
  transits.includes('page.today.lookingUp') && transits.includes("resolvingYou"),
  "Today keeps the quiet Looking up your natal chart… wait",
);
assert.ok(
  /resolvingYou && \([\s\S]*?page\.today\.lookingUp[\s\S]*?\)[\s\S]*?!resolvingYou && !youChart/.test(transits) ||
    (transits.indexOf("resolvingYou &&") >= 0 &&
      transits.indexOf("today-empty-no-you") > transits.indexOf("page.today.lookingUp")),
  "Today does not paint the empty save-chart state while the You bind is loading",
);

// --- 2. Four-tab bar, Home via the wordmark ---
const navBlock = header.slice(header.indexOf("const nav = ["), header.indexOf("];") + 2);
assert.ok(navBlock.includes("const nav = ["), "Header declares the primary nav list");
assert.ok(!navBlock.includes('href: "/"'), "Home is not a primary nav tab");
assert.ok(!navBlock.includes("nav-home"), "nav-home tab is gone from the primary bar");
const navHrefs = [...navBlock.matchAll(/href: "([^"]+)"/g)].map((m) => m[1]);
assert.deepEqual(
  navHrefs,
  ["/transits", "/biohack", "/profile", "/soul"],
  "primary nav order is Today, Protocols, Chart, Soul",
);
assert.ok(header.includes('labelKey: "nav.today"'), "Today tab keeps its label");
assert.ok(header.includes('labelKey: "nav.protocols"'), "Protocols tab keeps its label");
assert.ok(header.includes('labelKey: "nav.chart"'), "Chart tab keeps its label");
assert.ok(header.includes('labelKey: "nav.soul"'), "Soul tab keeps its label");
assert.ok(header.includes('data-testid="nav-wordmark"'), "wordmark is marked as the Home door");
assert.ok(header.includes('aria-label={t("nav.home")}'), "wordmark accessible name is Home");
assert.ok(header.includes('title={t("nav.home")}'), "wordmark keeps the Home title");
assert.ok(
  header.includes('aria-current={pathname === "/" ? "page" : undefined}'),
  "wordmark is aria-current=page on /",
);
assert.ok(
  /data-testid="nav-wordmark"[\s\S]{0,200}inline-flex min-h-11/.test(header),
  "wordmark hit target meets min-h-11",
);
assert.ok(
  !/data-testid="nav-wordmark"[\s\S]{0,400}border-growth\/40 bg-growth-soft/.test(header),
  "wordmark is not styled as a sixth tab",
);
assert.ok(!header.includes("{t(\"nav.home\")}</"), "no visible Home label beside the wordmark");

// --- 3. Today handoff: text link under the indication, not a growth primary in the hero ---
assert.ok(todayInd.includes('data-testid="open-protocols-secondary"'), "Protocols handoff keeps a test id");
assert.ok(todayInd.includes('t("today.tickStack")'), "handoff label is Tick the stack on Protocols");
assert.ok(todayInd.includes('href="/biohack"'), "handoff goes to /biohack");
assert.ok(todayInd.includes("protocolsUnlocked"), "handoff is gated on Protocols entitlement");
assert.ok(
  transits.includes("protocolsUnlocked={biohackingUnlocked}"),
  "Today passes Pro/beta unlock into the indication",
);

const heroStart = todayInd.indexOf('data-testid="main-action"');
const statusAt = todayInd.indexOf('data-testid="main-action-status"');
const handoffAtHero = todayInd.indexOf('data-testid="open-protocols-secondary"');
const eveningAt = todayInd.indexOf("Evening Close");
assert.ok(heroStart >= 0 && statusAt > heroStart, "Move hero includes the Energy / Space aside");
assert.ok(
  handoffAtHero > statusAt && eveningAt > handoffAtHero,
  "handoff sits after the Energy / Space aside and before Evening Close — not inside the growth-ringed Move hero",
);
const hero = todayInd.slice(heroStart, statusAt);
assert.ok(!hero.includes("open-protocols-secondary"), "handoff is not inside the Move hero before the aside");
assert.ok(
  !/open-protocols-secondary[\s\S]{0,200}bg-growth/.test(todayInd) &&
    !/bg-growth[\s\S]{0,200}open-protocols-secondary/.test(todayInd),
  "handoff is not a filled growth button",
);
assert.ok(
  /data-testid="open-protocols-secondary"[\s\S]{0,180}type-body text-fg underline-offset-2 hover:underline/.test(
    todayInd,
  ),
  "handoff is a primary-ink text link with hover underline",
);
assert.ok(
  /data-testid="open-protocols-secondary"[\s\S]{0,160}min-h-10/.test(todayInd),
  "handoff meets min-h-10",
);

const handoffAt = todayInd.indexOf('data-testid="open-protocols-secondary"');
const skyAt = todayInd.indexOf("today-sky-block");
const emptyAt = todayInd.indexOf("today-indication-needs-natal");
const loadAt = todayInd.indexOf("today-indication-loading");
const errAt = todayInd.indexOf("today-indication-error");
assert.ok(handoffAt > 0 && skyAt > handoffAt, "handoff sits under the indication and above the sky sections");
assert.ok(emptyAt >= 0 && handoffAt > emptyAt, "empty-state branch returns before the handoff");
assert.ok(loadAt >= 0 && handoffAt > loadAt, "loading branch returns before the handoff");
assert.ok(errAt >= 0 && handoffAt > errAt, "error branch returns before the handoff");
assert.ok(
  transits.includes('data-testid="today-empty-no-you"') && transits.includes('data-testid="today-empty-open-chart"'),
  "no-You empty state keeps the save-natal growth button as the only primary",
);

// --- 4. Home is a map ---
assert.ok(home.includes('t("home.title.hasChart")'), "has-chart title is keyed");
assert.ok(home.includes('t("home.title.noChart")'), "no-chart title is keyed");
assert.ok(home.includes('t("home.blurb.pro")'), "Pro blurb is keyed");
assert.ok(home.includes('t("home.blurb.free")'), "Free blurb is keyed");
assert.ok(home.includes('t("home.blurb.noChart")'), "no-chart blurb is keyed");
assert.ok(home.includes('data-testid="home-path"'), "path map is marked");
assert.ok(home.includes('t("home.path.today")'), "path line: Today is the morning read.");
assert.ok(home.includes('t("home.path.protocols")'), "path line: Protocols is the checkable stack.");
assert.ok(home.includes('t("home.path.chart")'), "path line: Chart is your natal.");
assert.ok(home.includes('t("home.path.soul")'), "path line: Soul is how you wire with someone.");
assert.ok(!home.includes('t("home.path")'), "old single arrow path string is gone");
assert.ok(
  /type-body text-fg"[\s\S]{0,60}data-testid="home-path"/.test(home) ||
    /data-testid="home-path"[\s\S]{0,80}type-body text-fg/.test(home),
  "path map uses body-size primary ink",
);
assert.ok(home.includes('t("home.morning.pro")'), "Pro morning strip is keyed");
assert.ok(home.includes('t("home.morning.free")'), "Free morning strip is keyed");

assert.ok(home.includes("natalBindingLoading"), "Home waits on the You-chart bind");
assert.ok(
  home.includes('data-testid="home-calculate-chart-skeleton"'),
  "Home keeps the hero CTA skeleton while the bind is loading",
);
assert.ok(
  home.indexOf("home-calculate-chart-skeleton") < home.indexOf("home-primary-today"),
  "loading skeleton is not a Protocols-first primary",
);

// One growth primary per locked state
assert.ok(home.includes('t("home.cta.seeTodaysMove")'), "Pro returner primary is See today's Move");
assert.ok(
  /data-testid="home-primary-today"[\s\S]{0,220}home\.cta\.seeTodaysMove/.test(home) ||
    (home.includes('data-testid="home-primary-today"') && home.includes('t("home.cta.seeTodaysMove")')),
  "Pro returner growth primary is See today's Move → Today",
);
assert.ok(home.includes('href="/transits"'), "returner primary goes to /transits");
assert.ok(
  /data-testid="home-secondary-protocols"[\s\S]{0,200}home\.cta\.openProtocols/.test(home) ||
    (home.includes('data-testid="home-secondary-protocols"') && home.includes('t("home.cta.openProtocols")')),
  "Pro returner secondary is Open Protocols",
);
assert.ok(home.includes('t("home.cta.openChart")'), "Pro Chart stays a text link");
assert.ok(home.includes('t("home.cta.todaysSky")'), "Free returner primary is Today's sky");
assert.ok(home.includes('t("home.cta.openYourChart")'), "Free Chart is the secondary border button");
assert.ok(home.includes('t("home.cta.protocolsPro")'), "Free Protocols (Pro) stays a text link");
assert.ok(home.includes('t("home.cta.calculate")'), "no-You primary is Calculate my chart");
assert.ok(home.includes('t("home.cta.seeSky")'), "no-You secondary is See today's sky");
assert.ok(
  !/home-primary-protocols/.test(home),
  "Home no longer uses a Protocols-first growth primary test id",
);

// Four cards, shared structure, Today first
const todayCardAt = home.indexOf('testId: "home-card-today"') >= 0
  ? home.indexOf('testId: "home-card-today"')
  : home.indexOf('data-testid="home-card-today"');
const protocolsCardAt = home.indexOf('testId: "home-view-protocols"') >= 0
  ? home.indexOf('testId: "home-view-protocols"')
  : home.indexOf('data-testid="home-view-protocols"');
const chartCardAt = home.indexOf('testId: "home-card-chart"') >= 0
  ? home.indexOf('testId: "home-card-chart"')
  : home.indexOf('data-testid="home-card-chart"');
const soulCardAt = home.indexOf('testId: "home-card-soul"') >= 0
  ? home.indexOf('testId: "home-card-soul"')
  : home.indexOf('data-testid="home-card-soul"');
assert.ok(
  todayCardAt >= 0 && protocolsCardAt > todayCardAt && chartCardAt > protocolsCardAt && soulCardAt > chartCardAt,
  "Home cards are ordered Today, Protocols, Chart, Soul",
);
assert.ok(home.includes('t("home.outcome.today.title")'), "Today card title is the surface name key");
assert.ok(home.includes('t("home.outcome.protocols.title")'), "Protocols card title is the surface name key");
assert.ok(home.includes('t("home.outcome.chart.title")'), "Chart card title is the surface name key");
assert.ok(home.includes('t("home.outcome.soul.title")'), "Soul card title is the surface name key");
assert.ok(!home.includes('t("home.card.today")'), "one-off Today energy chip is gone");
assert.ok(home.includes("type-section"), "cards share type-section titles");
assert.ok(home.includes("home.status.ready"), "Today uses Ready when a You chart is saved");
assert.ok(home.includes("home.status.needsChart"), "Today uses Needs a chart when it is not");
assert.ok(home.includes("home.status.proUnlock"), "Protocols and Soul keep the Pro unlock chip");
assert.ok(home.includes("home.status.saved") && home.includes("home.status.notSaved"), "Chart keeps Saved / Not saved yet");
assert.ok(home.includes('t("home.trust.line")') && home.includes('t("home.trust.disclaimer")'), "trust line and disclaimer stay");

// --- 5. One login line ---
assert.ok(login.includes('t("login.pillar.protocols.body")'), "login still wires the Protocols pillar body");

// --- Copy keys in all five locale files ---
const locked = {
  "login.pillar.protocols.body":
    "A checkable morning, midday, and evening list, preferring what you already own.",
  "home.title.hasChart": "Start the day on Today.",
  "home.title.noChart": "Know your chart. Run today with it.",
  "home.blurb.pro":
    "Today gives you one Move for how the sky meets your chart. Protocols is the checkable stack — morning, midday, and evening — using your kit when you own it.",
  "home.blurb.free":
    "Today stays open. Protocols and Soul unlock with Pro — the checkable stack plus kit, and Aura between people you've charted.",
  "home.blurb.noChart": "Save your natal first. Today and Protocols both read from it.",
  "home.path.today": "Today is the morning read.",
  "home.path.protocols": "Protocols is the checkable stack.",
  "home.path.chart": "Chart is your natal.",
  "home.path.soul": "Soul is how you wire with someone.",
  "home.cta.seeTodaysMove": "See today's Move",
  "home.morning.pro": "Start on Today — one Move for the sky. Tick the stack on Protocols.",
  "home.morning.free": "Today is open. Pro unlocks the checkable stack.",
  "home.outcome.today.title": "Today",
  "home.outcome.protocols.title": "Protocols",
  "home.outcome.chart.title": "Chart",
  "home.outcome.soul.title": "Soul",
  "home.outcome.protocols.body":
    "A checkable morning, midday, and evening stack shaped by your chart and today's sky — preferring what you already own.",
  "home.outcome.protocols.b1": "Tick the timed leads here.",
  "home.outcome.protocols.b2": "Uses your shelf when something fits.",
  "today.tickStack": "Tick the stack on Protocols",
};

const localeDir = resolve(root, "src/lib/i18n/messages");
const locales = ["en.ts", "de.ts", "es.ts", "fr.ts", "nl.ts"];
const localeFiles = readdirSync(localeDir)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts")
  .sort();
assert.deepEqual(
  localeFiles.filter((f) => !/^todaySoul\.(en|de|es|fr|nl)\.ts$/.test(f)),
  [...locales].sort(),
  "five locale files plus index",
);
for (const loc of ["en", "de", "es", "fr", "nl"]) {
  assert.ok(
    localeFiles.includes(`todaySoul.${loc}.ts`),
    `todaySoul catalog for ${loc}`,
  );
}

function extractMessage(src, key) {
  const re = new RegExp(`['"]${key.replace(/\\./g, "\\\\.").replace(/\./g, "\\.")}['"]\\s*:\\s*(['"\`])([\\s\\S]*?)\\1`);
  const m = src.match(re);
  return m ? m[2] : null;
}

const surfaceTitles = new Set([
  "home.outcome.today.title",
  "home.outcome.protocols.title",
  "home.outcome.chart.title",
  "home.outcome.soul.title",
]);

for (const loc of locales) {
  const src = read(`src/lib/i18n/messages/${loc}`);
  assert.ok(!extractMessage(src, "home.path"), `${loc} must drop the old arrow home.path string`);
  for (const [key, en] of Object.entries(locked)) {
    const value = extractMessage(src, key);
    assert.ok(value, `${loc} missing ${key}`);
    if (loc === "en.ts") {
      assert.equal(value, en, `en.ts ${key} must match locked EN`);
    } else if (loc === "nl.ts" && key === "home.outcome.chart.title") {
      // Pre-existing i18n smoke requires NL ≠ EN on this key. Surface name, not the old "blueprint" funnel title.
      assert.notEqual(value, en, "nl home.outcome.chart.title must differ from EN for i18n smoke");
      assert.notEqual(value, "Your blueprint", "nl chart card title must not keep the old funnel title");
    } else if (key === "login.pillar.protocols.body") {
      // Login page first pass: this body is now translated in all five catalogs.
      assert.ok(value.length > 0, `${loc} ${key} must be present`);
      assert.notEqual(value, en, `${loc} ${key} must be translated`);
    } else if (surfaceTitles.has(key) || key === "home.title.noChart") {
      // Surface names may reuse translated nav labels. noChart title was already
      // locked before this pass and may stay translated.
      assert.ok(value.length > 0, `${loc} ${key} must be present`);
    } else if (key === "today.tickStack") {
      // Still visible on setup / empty leftover / wait / error; translated in this pass.
      assert.ok(value.length > 0, `${loc} ${key} must be present`);
      if (loc === "en.ts") assert.equal(value, en);
    } else {
      assert.equal(value, en, `${loc} ${key} must match EN source until translated`);
    }
  }
}

assert.ok(pkg.includes('"assert:today-protocols-home"'), "package.json wires assert:today-protocols-home");

console.log("assert-today-protocols-home PASS");
