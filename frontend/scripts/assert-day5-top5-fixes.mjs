/**
 * Day 5 top-5 fixes: recycled Moves, Soul trust, kit/Shelf honesty,
 * type-wrong Energy/authority copy, return-visit chrome.
 * Pins (a)–(r). Run: npx tsx scripts/assert-day5-top5-fixes.mjs
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
const transits = read("src/app/transits/page.tsx");
const header = read("src/components/Header.tsx");
const authGate = read("src/components/AuthGate.tsx");
const layout = read("src/app/layout.tsx");
const globals = read("src/app/globals.css");
const soulPage = read("src/app/soul/page.tsx");
const profile = read("src/app/profile/page.tsx");
const partnerCard = read("src/components/soul/PartnerOverviewCard.tsx");
const soulCopy = read("src/lib/soulCopy.ts");
const localize = read("src/lib/i18n/localizeEnums.ts");
const en = read("src/lib/i18n/messages/en.ts");
const prescription = read("../backend/app/checkin/prescription.py");
const routes = read("../backend/app/api/routes.py");
const soulSync = read("../backend/app/hd/soul_sync.py");
const usualDismiss = read("src/lib/usualConfirmDismiss.ts");

// (a) Move selection is salted per account and avoids earlier / other-account lines when the sky changed.
assert.match(prescription, /user_key/);
assert.match(prescription, /avoid_texts|avoid_move_texts/);
assert.match(prescription, /sky_changed/);
assert.match(prescription, /prior_move_texts/);
assert.match(routes, /_move_selection_context/);
assert.match(routes, /user_key=str\(/);

// (b) Soul uses Chart's quieter Person/Partner toggle, not a leading romance pitch.
assert.match(soulPage, /data-testid="person-role-control"/);
assert.match(soulPage, /chart\.people\.personFallback/);
assert.match(soulPage, /chart\.people\.partnerRole/);
assert.doesNotMatch(soulPage, /page\.soul\.markPartnerReasonNamed/);
assert.doesNotMatch(soulPage, /page\.soul\.markPartnerReason"/);
assert.match(profile, /data-testid="person-role-control"/);

// (c) Open Chart from a Person/Partner view deep-links to that person, not bare /profile (Me).
assert.match(soulPage, /\/profile\?person=\$\{selectedFriend\.id\}/);
assert.match(profile, /useSearchParams/);
assert.match(profile, /requestedPersonId/);

// (d) Copy about another person is not second-person "You're a…."
assert.match(en, /chart\.people\.theyreAType/);
// The single Chart Type box keeps both voice branches (collapsible revert pass).
const typeBox = read("src/components/ChartTypeBox.tsx");
assert.match(profile, /<ChartTypeBox/);
assert.match(profile, /personName=\{selectedSavedRow &&/);
assert.match(profile, /friendChipLabel\(selectedSavedRow, t\("chart\.people\.personFallback"\)\)/);
assert.match(typeBox, /personName \? "otherLead" : "youLead"/);
assert.match(typeBox, /personName \? "otherBody" : "youBody"/);
for (const type of ["Generator", "Manifesting Generator", "Manifestor", "Projector", "Reflector"]) {
  assert.ok(en.includes(`chart.bodygraphModule.type.${type}.otherLead`));
  assert.ok(en.includes(`chart.bodygraphModule.type.${type}.otherBody`));
}

// (e) Grammar / punctuation class: they only hold, Your Money Line, Try: prompt.
assert.match(soulSync, /def hold_verb/);
assert.match(soulSync, /\{other\} only \{hold_verb\(other\)\}/);
assert.doesNotMatch(soulSync, /they only holds/);
assert.match(soulCopy, /export function possessChannel/);
assert.match(soulCopy, /possessChannel\(label, name\)/);
assert.match(partnerCard, /\{t\("soul\.partner\.try"\)\}:/);
assert.match(soulCopy, /raw\.replace\(CHANNEL_ARTICLES, ""\)/);

// (f) Neutral Partner attribution; no empty-then-"you marked" flash; pairs not reset.
assert.match(soulPage, /soul\.chrome\.loveGuidanceOnNeutral/);
assert.doesNotMatch(soulPage, /soul\.chrome\.loveGuidanceOn"/);
assert.match(en, /is marked as Partner/);
const neutral = en.match(/'soul\.chrome\.loveGuidanceOnNeutral':\s*'([^']+)'/)?.[1] || "";
assert.doesNotMatch(neutral, /you marked/);
assert.match(soulPage, /readSessionToken\(\)/);
assert.match(soulPage, /chartsLoading \|\| Boolean\(!user && readSessionToken\(\)\)/);
assert.doesNotMatch(soulPage, /api\.deleteChart/);

// (g) Kit-fact label separates today marker from the supplement name.
assert.match(biohack, /\{\s*" · "\s*\}/);
assert.match(biohack, /protocols\.kitFactToday/);

// (h) Your usual does not ask about items already on Shelf.
assert.match(biohack, /shelfBaselineRef/);
assert.match(biohack, /newcomers\.length === 0/);
assert.match(usualDismiss, /usualConfirmDismissedKey/);

// (i) After a shelf remove, Morning is not left stale and "Added [item]" is cleared.
assert.match(biohack, /dropShelfItemFromPlan/);
assert.match(biohack, /setInvFeedback/);
assert.match(biohack, /setInventory\(\(list\) => list\.filter/);

// (j) Mid-page Shelf names the on-shelf item.
assert.match(biohack, /protocols\.shelfNamedOne/);
assert.match(biohack, /protocols\.shelfNamedMany/);

// (k) Returning Today with no kit does not put a large empty starter on the core loop.
assert.match(todayInd, /firstShowUpWeek/);
assert.match(todayInd, /onAddToKit && firstShowUpWeek/);

// (l) Energy body follows Type/Strategy; no sacral "clear yes" default on Manifestor/Reflector/Projector.
assert.match(localize, /TYPE_WEATHER_STANCE/);
assert.match(en, /today\.weatherStance\.charged\.manifestor/);
assert.match(en, /today\.weatherStance\.hyper\.reflector/);
assert.match(en, /today\.weatherStance\.charged\.projector/);
assert.match(todayInd, /weatherMeaningLine\(t, energy, space, natalType\)/);
assert.match(localize, /Manifestor:[\s\S]*charged\.manifestor/);
assert.match(localize, /Reflector:[\s\S]*hyper\.reflector/);
assert.match(localize, /Projector:[\s\S]*hyper\.projector/);
const chargedManifestor = en.match(/'today\.weatherStance\.charged\.manifestor':\s*'([^']+)'/)?.[1] || "missing";
assert.doesNotMatch(chargedManifestor, /clear yes/);
assert.match(en, /spend it on a clear yes/);

// (m) An Emotional chart never gets "Feel the gut yes first…" in How you decide.
assert.match(profile, /\/emotional\|solar plexus\/i\.test\(authorityStr\)/);
assert.match(profile, /AUTHORITY_PLAIN\[authorityStr\]/);

// (n) A signed-in session never paints the signed-out header.
assert.match(layout, /localStorage\.getItem\("hd-biohack:session-token"\)/);
assert.match(globals, /header-sign-in/);
assert.match(header, /header-session-pending/);
assert.match(header, /readSessionToken/);
assert.match(authGate, /data-baseline-session-pending/);

// (o) A returning user with a saved natal does not see the lookup twice.
const lookingUpHits = [...transits.matchAll(/page\.today\.lookingUp/g)];
assert.equal(lookingUpHits.length, 1, `Today lookingUp should appear once, found ${lookingUpHits.length}`);
assert.match(transits, /if \(!youChart\) setYouReady\(false\)/);

// (p) After I did it, the control is not left visibly pressed beside the success line.
assert.match(todayInd, /\{\s*!moveDone \?\s*\(/);
assert.match(todayInd, /today-move-closure/);
assert.doesNotMatch(todayInd, /aria-pressed=\{moveDone\}/);

// (q) Disclosure chevrons match open vs closed, including already-expanded first paint.
assert.match(globals, /details\.disclosure\[open\] > summary \[data-disclosure-chevron\]/);
assert.match(transits, /data-disclosure-chevron/);
assert.match(todayInd, /data-disclosure-chevron/);
assert.match(transits, /skyDetailsOpen \? "rotate-90"/);

// (r) Earlier weeks expands under Show-up, not below the kit-pick card.
assert.match(todayInd, /today-earlier-weeks-slot/);
const kitIdx = todayInd.indexOf("Filled kit / usual stay in the hero");
const histIdx = todayInd.indexOf("today-earlier-weeks-slot");
const showUpIdx = todayInd.indexOf('data-testid="today-show-up"');
assert.ok(histIdx > 0 && kitIdx > 0 && showUpIdx > 0);
assert.ok(
  showUpIdx < histIdx && histIdx < kitIdx,
  "Earlier weeks must sit under Show-up and above the kit pick"
);

console.log("PASS: assert-day5-top5-fixes");
