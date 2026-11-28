/**
 * Other-person Chart leftover second person.
 * Run: npx tsx scripts/assert-other-person-chart-third-person.mjs
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(resolve(root, rel), "utf8");
const sha = (text) => createHash("sha256").update(text).digest("hex");

const DATA = {
  "OTHER": {
    "en": {
      "page.chart.h1.other": "Chart — {name}’s energy map",
      "chart.literacy.howToReadTitle.other": "How to read {name}’s chart",
      "chart.literacy.definedOpen.body.other": "Colored shapes are Defined — always-on for {name}. Pale shapes are Open — {name} picks up the room there and can tire if they stay plugged in too long.",
      "chart.literacy.channelsHanging.body.other": "A channel is a full wire: both ends of a path between two centers are lit, so that theme runs reliably in {name}. A hanging gate means {name} holds one end of a wire. Certain people (or certain days) can feel magnetic because they bring the other end.",
      "chart.literacy.legend.body.other": "The legend under {name}’s Bodygraph splits how each activation shows up. Darker chips are Conscious — what the mind notices and can talk about (Personality). Warmer chips are Somatic — what the body knows before words (Design). A ringed or dual mark means Integrated: both stories light the same place. You don’t need to memorize jargon; just match the colors to the legend.",
      "chart.literacy.typeStrategy.body.other": "These three are {name}’s operating loop. Type is the kind of energy engine {name} runs (how they move through a day). Strategy is the low-friction way life tends to invite {name} — following it usually means less push-and-resist. Authority is the body’s yes for {name}: the quiet signal that a choice is right for {name}, before the mind stacks pros and cons. Snapshot puts all three in one place.",
      "chart.literacy.centersWatch.body.other": "Open centers are where other people and places can pull {name}’s baseline off-center first. Snapshot lists the ones that matter most for {name} so the pull can be noticed early instead of fighting symptoms later. Treat them as early-warning dials, not flaws.",
      "chart.literacy.deepDive.body.other": "When the summary isn’t enough, Deep dive opens the same map in finer grain: Core, Centers, Channels, and Planets. Same language as above — just the exact gates and lines under {name}’s Snapshot. Open it when you’re curious; skip it when you only need the headline."
    },
    "nl": {
      "page.chart.h1.other": "Chart — de energiekaart van {name}",
      "chart.literacy.howToReadTitle.other": "Hoe de Chart van {name} te lezen",
      "chart.literacy.definedOpen.body.other": "Gekleurde vormen zijn Gedefinieerd — bij {name} altijd aan. Bleke vormen zijn Open — daar neemt {name} de ruimte op en kan moe worden als deze persoon te lang ingeplugd blijft.",
      "chart.literacy.channelsHanging.body.other": "Een kanaal is een volle draad: beide einden van een pad tussen twee centra branden, dus dat thema loopt betrouwbaar in {name}. Een hangende poort betekent dat {name} één eind van een draad vasthoudt. Bepaalde mensen (of bepaalde dagen) kunnen magnetisch aanvoelen omdat zij het andere eind meebrengen.",
      "chart.literacy.legend.body.other": "De legenda onder de Bodygraph van {name} splitst hoe elke activatie verschijnt. Donkerder chips zijn Conscious — wat de geest opmerkt en kan benoemen (Personality). Warmere chips zijn Somatic — wat het lichaam weet vóór woorden (Design). Een omringd of dubbel merkteken betekent Integrated: beide verhalen verlichten dezelfde plek. Je hoeft geen jargon te stampen; match gewoon de kleuren met de legenda.",
      "chart.literacy.typeStrategy.body.other": "Deze drie zijn de operationele lus van {name}. Type is het soort energiomotor dat {name} draait (hoe {name} door een dag beweegt). Strategy is de lage-wrijvingmanier waarop het leven {name} meestal uitnodigt — die volgen betekent meestal minder duwen en weerstand. Authority is het ja van het lichaam van {name}: het stille signaal dat een keuze klopt voor {name}, voordat de geest voor- en nadelen stapelt. Snapshot zet alle drie op één plek.",
      "chart.literacy.centersWatch.body.other": "Open centra zijn waar andere mensen en plekken de baseline van {name} het eerst uit het midden kunnen trekken. Snapshot somt de belangrijkste voor {name} op, zodat de trek vroeg zichtbaar is in plaats van later tegen symptomen te vechten. Behandel ze als vroegtijdige waarschuwingsmeters, niet als gebreken.",
      "chart.literacy.deepDive.body.other": "Als de samenvatting niet volstaat, opent Deep dive dezelfde kaart fijner: Core, Centers, Channels en Planets. Dezelfde taal als hierboven — alleen de exacte poorten en lijnen onder de Snapshot van {name}. Open het als je nieuwsgierig bent; sla het over als je alleen de kop nodig hebt."
    }
  },
  "OPENINGS": {
    "en": {
      "strategy": {
        "To Inform": "{name} is designed to start from an inner urge, not to wait for the world to ask first.",
        "Wait a Lunar Cycle": "For major decisions, {name}’s strategy is to sample across a full lunar cycle — about twenty-eight days — instead of locking in on one charged day.",
        "To Respond (then inform)": "{name} still waits to respond before moving."
      },
      "authority": {
        "Emotional (Solar Plexus)": "{name}’s clear answers arrive after feelings move, not at the high or the low.",
        "Lunar": "{name}’s authority is lunar, which goes with being a Reflector: major choices need a full lunar cycle of sampling before they are locked in."
      }
    },
    "nl": {
      "strategy": {
        "To Inform": "{name} is ontworpen om te beginnen vanuit een innerlijke aandrang, niet om te wachten tot de wereld het eerst vraagt.",
        "Wait a Lunar Cycle": "Voor grote beslissingen is de strategy van {name} om een volle maancyclus te proeven — ongeveer achtentwintig dagen — in plaats van vast te zetten op één geladen dag.",
        "To Respond (then inform)": "{name} wacht nog steeds om te antwoorden voordat deze persoon beweegt."
      },
      "authority": {
        "Emotional (Solar Plexus)": "De heldere antwoorden van {name} komen nadat gevoelens zijn bewogen, niet op het hoogtepunt of het dieptepunt.",
        "Lunar": "De authority van {name} is lunar, wat hoort bij een Reflector zijn: grote keuzes hebben een volle maancyclus van proeven nodig voordat ze worden vastgezet."
      }
    }
  },
  "SELF": {
    "en": {
      "page.chart.h1": "Chart — your energy map",
      "chart.literacy.howToReadTitle": "How to read your chart",
      "chart.literacy.definedOpen.body": "Colored shapes are Defined — always-on for you. Pale shapes are Open — you pick up the room there and can tire if you stay plugged in too long.",
      "chart.literacy.channelsHanging.body": "A channel is a full wire: both ends of a path between two centers are lit, so that theme runs reliably in you. A hanging gate means you hold one end of a wire. Certain people (or certain days) can feel magnetic because they bring the other end.",
      "chart.literacy.legend.body": "The legend under your Bodygraph splits how each activation shows up. Darker chips are Conscious — what your mind notices and can talk about (Personality). Warmer chips are Somatic — what your body knows before words (Design). A ringed or dual mark means Integrated: both stories light the same place. You don’t need to memorize jargon; just match the colors to the legend.",
      "chart.literacy.typeStrategy.body": "These three are your operating loop. Type is the kind of energy engine you run (how you move through a day). Strategy is the low-friction way life tends to invite you — following it usually means less push-and-resist. Authority is your body’s yes: the quiet signal that a choice is right for you, before the mind stacks pros and cons. Snapshot puts all three in one place.",
      "chart.literacy.centersWatch.body": "Open centers are where other people and places can pull your baseline off-center first. Snapshot lists the ones that matter most for you so you can notice the pull early instead of fighting symptoms later. Treat them as early-warning dials, not flaws.",
      "chart.literacy.deepDive.body": "When the summary isn’t enough, Deep dive opens the same map in finer grain: Core, Centers, Channels, and Planets. Same language as above — just the exact gates and lines under your Snapshot. Open it when you’re curious; skip it when you only need the headline.",
      "chart.deepDive.otherPersonNote": "You’re reading {name}’s chart. Where these notes say “you”, they mean {name}."
    },
    "nl": {
      "page.chart.h1": "Chart — jouw energiekaart",
      "chart.literacy.howToReadTitle": "Hoe je Chart te lezen",
      "chart.literacy.definedOpen.body": "Gekleurde vormen zijn Gedefinieerd — bij jou altijd aan. Bleke vormen zijn Open — daar neem je de ruimte op en je kunt moe worden als je te lang ingeplugd blijft.",
      "chart.literacy.channelsHanging.body": "Een kanaal is een volle draad: beide einden van een pad tussen twee centra branden, dus dat thema loopt betrouwbaar in jou. Een hangende poort betekent dat jij één eind van een draad vasthoudt. Bepaalde mensen (of bepaalde dagen) kunnen magnetisch aanvoelen omdat zij het andere eind meebrengen.",
      "chart.literacy.legend.body": "De legenda onder je Bodygraph splitst hoe elke activatie verschijnt. Donkerder chips zijn Conscious — wat je geest opmerkt en kan benoemen (Personality). Warmere chips zijn Somatic — wat je lichaam weet vóór woorden (Design). Een omringd of dubbel merkteken betekent Integrated: beide verhalen verlichten dezelfde plek. Je hoeft geen jargon te stampen; match gewoon de kleuren met de legenda.",
      "chart.literacy.typeStrategy.body": "Deze drie zijn je operationele lus. Type is het soort energiomotor dat je draait (hoe je door een dag beweegt). Strategy is de lage-wrijvingmanier waarop het leven je meestal uitnodigt — die volgen betekent meestal minder duwen en weerstand. Authority is het ja van je lichaam: het stille signaal dat een keuze klopt voor jou, voordat de geest voor- en nadelen stapelt. Snapshot zet alle drie op één plek.",
      "chart.literacy.centersWatch.body": "Open centra zijn waar andere mensen en plekken je baseline het eerst uit het midden kunnen trekken. Snapshot somt de belangrijkste voor jou op, zodat je de trek vroeg merkt in plaats van later tegen symptomen te vechten. Behandel ze als vroegtijdige waarschuwingsmeters, niet als gebreken.",
      "chart.literacy.deepDive.body": "Als de samenvatting niet volstaat, opent Deep dive dezelfde kaart fijner: Core, Centers, Channels en Planets. Dezelfde taal als hierboven — alleen de exacte poorten en lijnen onder je Snapshot. Open het als je nieuwsgierig bent; sla het over als je alleen de kop nodig hebt.",
      "chart.deepDive.otherPersonNote": "Je leest de chart van {name}. Waar hier “je” staat, wordt {name} bedoeld."
    }
  }
};

const { messages: en } = await import("../src/lib/i18n/messages/en.ts");
const { messages: nl } = await import("../src/lib/i18n/messages/nl.ts");
const { resolveHdCopy } = await import("../src/lib/essays/resolveHdCopy.ts");
const { deepDiveStrategyCopy, deepDiveAuthorityCopy } = await import(
  "../src/lib/essays/deepDiveStrategyAuthorityCopy.ts"
);
const { STRATEGY_OTHER_EN, AUTHORITY_OTHER_EN } = await import(
  "../src/lib/essays/deepDiveStrategyAuthority.en.ts"
);
const { STRATEGY_OTHER_NL, AUTHORITY_OTHER_NL } = await import(
  "../src/lib/essays/deepDiveStrategyAuthority.nl.ts"
);

const catalogs = { en, nl };
const strategyOther = { en: STRATEGY_OTHER_EN, nl: STRATEGY_OTHER_NL };
const authorityOther = { en: AUTHORITY_OTHER_EN, nl: AUTHORITY_OTHER_NL };

for (const locale of ["en", "nl"]) {
  for (const [key, expected] of Object.entries(DATA.SELF[locale])) {
    assert.equal(catalogs[locale][key], expected, `${locale} self ${key} unchanged`);
  }
  for (const [key, expected] of Object.entries(DATA.OTHER[locale])) {
    assert.equal(catalogs[locale][key], expected, `${locale} locked ${key}`);
    assert.ok(expected.includes("{name}"), `${locale} ${key} has a name slot`);
  }
}

const page = read("src/app/profile/page.tsx");
assert.match(
  page,
  /chartPersonName\s*\?\s*t\("page\.chart\.h1\.other",\s*\{\s*name:\s*chartPersonName\s*\}\)\s*:\s*t\("page\.chart\.h1"\)/,
  "header uses the other key only when chartPersonName is set",
);
assert.match(page, /<LiteracyCoach[\s\S]*?personName=\{chartPersonName\}/, "Chart coach receives chartPersonName");
assert.match(page, /snapshotStrategyOtherCopy\(strategyStr, locale, snapshotPersonName\)/);
assert.match(page, /snapshotAuthorityOtherPlain\(authorityStr, locale, snapshotPersonName\)/);

const coach = read("src/components/LiteracyCoach.tsx");
assert.match(coach, /variant === "chart" && Boolean\(personName\)/);
assert.match(coach, /chartOther && personName/);
assert.match(coach, /t\("chart\.literacy\.howToReadTitle\.other", \{ name: personName \}\)/);
assert.match(coach, /t\(chartOtherBodyKey\(step\.bodyKey\), \{ name: personName \}\)/);
assert.match(coach, /soul: "soul\.literacy\.howToReadTitle"/);
assert.match(coach, /today: "today\.literacy\.howToReadTitle"/);
assert.match(coach, /protocols: "protocols\.literacy\.howToUseTitle"/);
assert.doesNotMatch(coach, /soul\.literacy\.[A-Za-z.]+\.other/);
assert.doesNotMatch(coach, /today\.literacy\.[A-Za-z.]+\.other/);
assert.doesNotMatch(coach, /protocols\.literacy\.[A-Za-z.]+\.other/);
for (const key of [
  "chart.literacy.definedOpen.body.other",
  "chart.literacy.channelsHanging.body.other",
  "chart.literacy.legend.body.other",
  "chart.literacy.typeStrategy.body.other",
  "chart.literacy.centersWatch.body.other",
  "chart.literacy.deepDive.body.other",
]) {
  assert.ok(coach.includes(`"${key}"`), `coach lists ${key}`);
}
assert.ok(coach.includes('t("literacy.chrome.gotIt")'), "Got it stays the viewer control");
assert.match(coach, /title: t\(step\.titleKey\)/, "step titles stay on the self keys");

const copySrc = read("src/lib/essays/deepDiveStrategyAuthorityCopy.ts");
assert.match(copySrc, /replaceAll\("\{name\}", \(\) => name\)/, "{name} uses a function replacer");
assert.match(copySrc, /resolveHdCopy/);

const helpers = {
  strategy: deepDiveStrategyCopy,
  authority: deepDiveAuthorityCopy,
};
const bundles = {
  strategy: (locale) => resolveHdCopy(locale).STRATEGY_COPY,
  authority: (locale) => resolveHdCopy(locale).AUTHORITY_COPY,
};
const others = { strategy: strategyOther, authority: authorityOther };
const dutch = /\b(je|jij|jouw|jou)\b/i;
const englishLead = /(?:^|\n\n)(You |Your )/;
const englishYou = /\b(you|your)\b/i;

for (const kind of ["strategy", "authority"]) {
  const selfEn = bundles[kind]("en");
  const selfNl = bundles[kind]("nl");
  assert.deepEqual(Object.keys(others[kind].en).sort(), Object.keys(selfEn).sort(), `${kind} EN keys`);
  assert.deepEqual(Object.keys(others[kind].nl).sort(), Object.keys(selfNl).sort(), `${kind} NL keys`);
  for (const locale of ["en", "nl"]) {
    for (const key of Object.keys(selfEn)) {
      const self = helpers[kind](key, locale);
      assert.deepEqual(self, bundles[kind](locale)[key], `${locale} ${kind} ${key} self`);
      assert.equal(helpers[kind](key, locale, ""), self, "empty name stays self");
      for (const name of ["Jules", "Ren", "Kenji", "Juno $&"]) {
        const other = helpers[kind](key, locale, name);
        assert.ok(other, `${locale} ${kind} ${key} other`);
        assert.ok(other.summary.includes(name) && other.learnMore.includes(name), `${name} is in ${key}`);
        assert.equal((other.summary + other.learnMore).includes("{name}"), false);
        assert.doesNotMatch(other.summary + "\n\n" + other.learnMore, englishLead);
        if (locale === "en") assert.doesNotMatch(other.summary + " " + other.learnMore, englishYou);
        if (locale === "nl") assert.doesNotMatch(other.summary + " " + other.learnMore, dutch);
      }
      const raw = others[kind][locale][key];
      if (locale === "en") assert.doesNotMatch(raw.summary + "\n\n" + raw.learnMore, englishYou);
      if (locale === "nl") assert.doesNotMatch(raw.summary + "\n\n" + raw.learnMore, dutch);
    }
  }
  assert.deepEqual(helpers[kind](Object.keys(selfEn)[0], "de"), helpers[kind](Object.keys(selfEn)[0], "en"));
  assert.equal(
    helpers[kind](Object.keys(selfEn)[0], "fr", "Jules").learnMore,
    helpers[kind](Object.keys(selfEn)[0], "en", "Jules").learnMore,
  );
}

for (const locale of ["en", "nl"]) {
  for (const [kind, map] of Object.entries(DATA.OPENINGS[locale])) {
    for (const [key, opening] of Object.entries(map)) {
      for (const name of ["Jules", "Ren", "Kenji"]) {
        const filled = opening.replaceAll("{name}", () => name);
        const essay = helpers[kind](key, locale, name);
        assert.ok(essay.learnMore.startsWith(filled), `${locale} ${kind} ${key} ${name} opening`);
      }
    }
  }
}

const dd = read("src/components/ChartDeepDive.tsx");
assert.match(dd, /deepDiveStrategyCopy\(strategy, locale, personName\)/);
assert.match(dd, /deepDiveAuthorityCopy\(authority, locale, personName\)/);
assert.match(dd, /deepDiveTypeSections\(hdType, locale, personName\)/);
assert.match(dd, /data-testid="deep-dive-other-person-note"/);
assert.match(dd, /t\("chart\.deepDive\.otherPersonNote", \{ name: personName \}\)/);
assert.doesNotMatch(dd, /STRATEGY_COPY\[strategy\]/);
assert.doesNotMatch(dd, /AUTHORITY_COPY\[authority\]/);

assert.equal(
  sha(read("src/lib/hdCopy.ts")),
  "b8c89bc238dcc631717cdf098d92756f63df6e22d73ac67465851aa58d972ec6",
  "self EN hdCopy bundle untouched",
);
assert.equal(
  sha(read("src/lib/essays/hdCopy.nl.ts")),
  "8528a2f8e2ec67fd886cb5fb75a6784243dd492cbdaf7cb4693b3e827ef4f941",
  "self NL hdCopy bundle untouched",
);
assert.ok(
  resolveHdCopy("en").STRATEGY_COPY["To Respond (then inform)"].learnMore.includes(
    "That gut check is the same as a Generator's",
  ),
  "Maya own-chart Generator line remains",
);

const pkg = read("package.json");
assert.equal(
  pkg.split('"assert:other-person-chart-third-person"').length - 1,
  1,
  "one assert:other-person-chart-third-person script line",
);
assert.match(
  pkg,
  /"assert:other-person-chart-third-person": "npx tsx scripts\/assert-other-person-chart-third-person\.mjs"/,
);

console.log("assert-other-person-chart-third-person: ok");
