/**
 * First-week kit setup — source ACs (FE).
 * Run: npx tsx scripts/assert-first-week-kit-setup.mjs
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
const transits = read("src/app/transits/page.tsx");
const biohack = read("src/app/biohack/page.tsx");
const dismiss = read("src/lib/kitSetupDismiss.ts");
const constants = read("src/components/protocols/constants.ts");
const profile = read("src/app/profile/page.tsx");
const pkg = read("package.json");
const locales = ["en", "nl", "de", "fr", "es"].map((id) => ({
  id,
  src: read(`src/lib/i18n/messages/${id}.ts`),
}));

const LEAD = "Add what you already own. Protocols will use it.";
const HINT = "Tap a starter, or type a name.";
const INPUT_PH = "Or type a name you own";
const ADD = "Add to kit";
const ADDING = "Adding\u2026";
const ADDED = "Added {name}";
const ALREADY = "Already in kit: {name}";
const SKIP = "Not now";
const EMPTY = "Add what you already own.";
const NO_MATCH = "Nothing in your kit matched today\u2019s sky.";

function extractSetup(src) {
  const i = src.indexOf('data-testid="today-kit-setup"');
  assert.ok(i > 0, "today-kit-setup present");
  const start = src.lastIndexOf("<div", i);
  const end = src.indexOf('data-testid="today-kit-setup-skip"');
  assert.ok(start >= 0 && end > start, "locate kit setup block");
  return src.slice(start, src.indexOf("</button>", end) + 10);
}

function extractHandoff(src) {
  const i = src.indexOf('data-testid="open-protocols-secondary"');
  assert.ok(i > 0, "open-protocols-secondary present");
  const start = src.lastIndexOf("<Link", i);
  const end = src.indexOf("</Link>", i);
  return src.slice(start, end + 7);
}

// --- Wired in package.json ---
assert.ok(
  pkg.includes('"assert:first-week-kit-setup": "npx tsx scripts/assert-first-week-kit-setup.mjs"'),
  "package.json wires assert:first-week-kit-setup",
);

// --- Eligibility: You natal + unlocked + empty inventory + not dismissed ---
assert.ok(transits.includes("protocolsUnlocked={biohackingUnlocked}"), "Today passes unlock flag");
assert.ok(
  /inventoryStatus === "unknown"/.test(todayInd),
  "setup is hidden while inventory is unknown",
);
assert.ok(
  /inventoryCount === 0 && userId && !kitSetupDismissed/.test(todayInd),
  "setup requires empty shelf, a user, and no dismiss",
);
assert.ok(todayInd.includes("protocolsUnlocked"), "setup is entitlement-gated");
assert.ok(
  todayInd.includes('inventoryStatus === "unknown"') &&
    todayInd.includes('data-testid="today-kit-setup-wait"'),
  "unknown inventory shows a slot-only wait, not the dashed log-a-item line",
);
assert.ok(
  !/today-kit-setup-wait[\s\S]{0,400}kitPlaceholder|kitPlaceholder[\s\S]{0,200}today-kit-setup-wait/.test(
    todayInd,
  ),
  "wait slot does not reuse the old log-a-transit-item copy",
);
assert.ok(
  /!protocolsUnlocked \?[\s\S]{0,400}data-testid="today-kit-placeholder"/.test(todayInd),
  "locked users get the dashed invite, not the expanded setup",
);
assert.ok(
  /!protocolsUnlocked \?[\s\S]{0,600}href="\/biohack"/.test(todayInd),
  "locked dashed invite goes to bare /biohack, not #shelf",
);
assert.ok(
  !/!protocolsUnlocked[\s\S]{0,800}today-kit-setup"/.test(todayInd) ||
    todayInd.indexOf("!protocolsUnlocked") < todayInd.indexOf('data-testid="today-kit-setup"'),
  "locked branch precedes setup",
);
assert.ok(
  todayInd.includes('data-testid="today-kit-line"'),
  "filled kit line remains",
);
assert.ok(
  /inventoryCount > 0 \? t\("today.kitSetupNoMatch"\)/.test(todayInd),
  "non-empty shelf with no lead uses the no-match line, not the setup",
);

// No flash of old dashed copy
assert.ok(
  !todayInd.includes("today.kitPlaceholder"),
  "Today no longer renders the old log-a-transit-item placeholder body",
);

// --- Locked copy + craft ---
const setup = extractSetup(todayInd);
assert.ok(setup.includes('t("today.kitPick")'), "setup label is the Today-only kit pick heading");
assert.ok(!setup.includes('t("today.fromKit")'), "setup no longer uses today.fromKit");
assert.ok(setup.includes('t("today.kitSetupLead")'), "setup lead is keyed");
assert.ok(setup.includes('t("today.kitSetupHint")'), "starters hint is keyed");
assert.ok(setup.includes('t("today.kitSetupInputPlaceholder")'), "free-text placeholder is keyed");
assert.ok(setup.includes('t("today.kitSetupAdd")'), "Add to kit is keyed");
assert.ok(setup.includes('t("today.kitSetupAdding")'), "busy Adding… is keyed");
assert.ok(setup.includes('t("today.kitSetupSkip")'), "Not now is keyed");
assert.ok(todayInd.includes('t("today.kitSetupAdded"'), "Added {name} is keyed");
assert.ok(todayInd.includes('t("today.kitSetupAlready"'), "Already in kit is keyed");
assert.ok(setup.includes('t("today.kitSetupAddError")'), "add errors are plain keyed copy");
assert.ok(
  !/e\.message|error\.message|String\(e\)/.test(setup),
  "setup does not surface raw API text",
);
assert.ok(setup.includes('data-testid="today-kit-setup-input"'), "free-text input testid");
assert.ok(setup.includes('data-testid="today-kit-setup-add"'), "submit testid");
assert.ok(setup.includes('data-testid="today-kit-setup-skip"'), "skip testid");
assert.ok(
  /today-kit-starter-\$\{starterSlug\(name\)\}/.test(setup),
  "starter testids use slug form",
);
assert.ok(setup.includes("+ {name}"), "Today chips use plus + space + full name");
assert.ok(!setup.includes("name.split("), "Today chips are not KitStrip-truncated");
assert.ok(constants.includes("Magnesium Glycinate"), "reuses STARTER_SUPPLEMENTS");
assert.ok(todayInd.includes("STARTER_SUPPLEMENTS"), "Today imports the shared starters");
assert.ok(
  /onSubmit[\s\S]{0,200}kitName\.trim\(\)[\s\S]{0,120}addKitItem\(kitName\)/.test(setup),
  "Enter submits the free-text field when non-empty",
);
assert.ok(
  /onClick=\{\(\) => void addKitItem\(name\)\}/.test(setup),
  "tapping a starter adds that name immediately",
);

// Quiet secondary chrome — no growth wash on starters / Add to kit / Not now
assert.ok(!/today-kit-starter[\s\S]{0,200}bg-growth/.test(setup), "starters are not a growth wash");
assert.ok(
  !/today-kit-setup-add[\s\S]{0,250}bg-growth/.test(setup),
  "Add to kit is not a growth wash",
);
assert.ok(
  /today-kit-setup-skip[\s\S]{0,200}type-body text-fg underline-offset-2 hover:underline/.test(
    setup,
  ),
  "Not now is a text control",
);
assert.ok(/kitSetupLead[\s\S]{0,80}type-body text-fg/.test(setup), "lead is body-first primary ink");

// Placement: after Show-up, before When / Why, still in the kit-line slot
const showIdx = todayInd.indexOf('data-testid="today-show-up"');
const setupIdx = todayInd.indexOf('data-testid="today-kit-setup"');
const placeholderIdx = todayInd.indexOf('data-testid="today-kit-placeholder"');
const kitLineIdx = todayInd.indexOf('data-testid="today-kit-line"');
const whenIdx = todayInd.indexOf('data-testid="today-when"');
const whyIdx = todayInd.indexOf('data-testid="main-action-why-details"');
assert.ok(showIdx > 0 && setupIdx > showIdx, "setup sits after Show-up");
assert.ok(placeholderIdx > showIdx, "placeholder sits after Show-up");
assert.ok(kitLineIdx > showIdx, "kit line sits after Show-up");
assert.ok(whenIdx > setupIdx && whyIdx > setupIdx, "setup sits before When / Why this");
assert.ok(
  !todayInd.includes("step 1 of 3") && !todayInd.includes("Step 1 of 3"),
  "not a wizard",
);

// --- Refetch after add + on Today (re)gaining You / user ---
assert.ok(transits.includes("api.addInventory"), "add uses existing POST /inventory");
assert.ok(transits.includes("api.inventory"), "empty vs no-match uses GET /inventory");
assert.ok(transits.includes("api.transitsToday"), "Today still loads via GET /transits/today");
assert.ok(
  /addInventory[\s\S]{0,400}fetchToday\(\{ quiet: true \}\)/.test(transits) ||
    /addInventory[\s\S]{0,400}await fetchToday/.test(transits),
  "after a successful add, Today refetches transits + inventory",
);
assert.ok(
  transits.includes("onAddToKit={addToKit}"),
  "Today passes the in-place add handler into the indication",
);
assert.ok(
  /void fetchToday\(\)/.test(transits) &&
    /youChart\?\.id/.test(transits) &&
    /user\?\.id/.test(transits),
  "Today refetches when the page (re)gains the You chart / user",
);

// --- Dismiss key ---
assert.ok(
  dismiss.includes('hd-biohack:kit-setup-dismissed:'),
  "dismiss key is in the literacy-style per-user family",
);
assert.ok(
  /kitSetupDismissedKey[\s\S]{0,200}KIT_SETUP_DISMISSED_KEY_PREFIX\$\{userId\}/.test(dismiss) ||
    dismiss.includes("`hd-biohack:kit-setup-dismissed:${userId}`") ||
    dismiss.includes("${KIT_SETUP_DISMISSED_KEY_PREFIX}${userId}"),
  "dismiss key is per-user",
);
assert.ok(todayInd.includes("writeKitSetupDismissed"), "Not now writes the dismiss key");
assert.ok(todayInd.includes("readKitSetupDismissed"), "setup reads the dismiss key");
assert.doesNotMatch(todayInd, /you skipped|skipped setup|shame/i);
assert.ok(dismiss.includes("localStorage"), "dismiss is this-browser localStorage only");
assert.ok(!dismiss.includes("api."), "dismiss helper does not call the API");
assert.ok(
  !transits.includes("kit-setup-dismissed") && !biohack.includes("kit-setup-dismissed"),
  "no server dismiss flag is wired on Today or Protocols",
);

// Dismissed leftover: empty copy + #shelf; no-match lands on #stack
assert.ok(todayInd.includes('"/biohack#shelf"'), "empty leftover still links to /biohack#shelf");
assert.ok(todayInd.includes('"/biohack#stack"'), "no-match leftover can land on #stack");
assert.ok(
  /inventoryCount > 0 \? "\/biohack#stack" : "\/biohack#shelf"/.test(todayInd) ||
    /inventoryCount > 0 \? '\/biohack#stack' : '\/biohack#shelf'/.test(todayInd) ||
    todayInd.includes('inventoryCount > 0 ? "/biohack#stack" : "/biohack#shelf"'),
  "no-match leftover is /biohack#stack; empty leftover is /biohack#shelf",
);
assert.ok(todayInd.includes('t("today.kitSetupEmpty")'), "dismissed empty leftover uses Add what you already own");
assert.ok(todayInd.includes('t("today.kitSetupNoMatch")'), "no-match line is keyed");
assert.ok(
  todayInd.includes('inventoryCount > 0 ? t("today.kitSetupNoMatch") : t("today.kitSetupEmpty")'),
  "dismissed empty leftover and no-match share the dashed placeholder",
);

// --- Protocols: empty Shelf auto-open + #shelf deep-link ---
assert.ok(biohack.includes('data-testid="shelf-disclosure"'), "shelf-disclosure kept");
assert.ok(biohack.includes("open={shelfOpen}"), "Shelf open state is rendered");
assert.ok(
  /setShelfOpen\(deep \|\| inventory\.length === 0\)/.test(biohack) ||
    /setShelfOpen\(!stackDeep && \(deep \|\| inventory\.length === 0\)\)/.test(biohack),
  "empty loaded shelf starts open (unless arriving on #stack)",
);
assert.ok(
  /shelfDefaultApplied/.test(biohack) && /setShelfOpen\(false\)/.test(biohack),
  "collapsed-empty is not persisted across visits",
);
assert.ok(biohack.includes('id="shelf"'), "#shelf has a target");
assert.ok(
  /hash === "shelf"/.test(biohack) && /shelf=== "1"|get\("shelf"\) === "1"/.test(biohack),
  "honors /biohack#shelf and ?shelf=1",
);
assert.ok(biohack.includes("scrollIntoView"), "#shelf scrolls Shelf into view");
assert.ok(
  /cta=\{null\}/.test(biohack),
  "KitFact CTA stays null",
);
assert.ok(
  /useState\(false\);\s*\n\s*const \[baselineKitOpen/.test(biohack) ||
    /const \[inventoryOpen, setInventoryOpen\] = useState\(false\)/.test(biohack),
  "InventoryPanel stays closed by default",
);
assert.ok(!/setInventoryOpen\(true\).*shelfDeepLink|shelfDeepLink[\s\S]{0,200}setInventoryOpen\(true\)/.test(biohack),
  "deep-link does not auto-open InventoryPanel",
);
assert.ok(biohack.includes("loadProtocol({ rebuild: true })"), "add/remove still rebuilds the protocol");

// Move stays above Shelf
const iMove = biohack.indexOf("<TodaysMoveCard");
const iShelf = biohack.indexOf('data-testid="shelf-disclosure"');
const iIntent = biohack.indexOf('data-testid="intention-disclosure"');
assert.ok(iMove > 0 && iShelf > iMove && iIntent > iShelf, "Move stays above Shelf, then Intention");

// Empty-shelf Protocols copy unchanged
assert.ok(biohack.includes("page.protocols.addWhatYouOwn"), "Shelf · 0 · Add what you own stays");
assert.ok(
  read("src/components/protocols/KitStrip.tsx").includes("protocols.kitEmptyHint"),
  "kitEmptyHint stays on Protocols",
);

// --- No Chart / Protocols push on first-run reveal ---
assert.ok(profile.includes('href="/transits"'), "See today's Move still goes to /transits");
assert.ok(
  profile.includes('data-testid="first-run-see-todays-move"'),
  "first-run Move CTA is unchanged",
);
assert.ok(
  !/firstRunYouReveal[\s\S]{0,400}biohack/.test(profile),
  "first-run reveal does not push Protocols",
);
assert.ok(
  !/firstRunYouReveal[\s\S]{0,800}today-kit-setup|today-kit-setup[\s\S]{0,200}firstRunYouReveal/.test(
    profile,
  ),
  "no kit setup on the first-run Chart reveal",
);

// --- Tick the stack stays on bare /biohack ---
const handoff = extractHandoff(todayInd);
assert.ok(handoff.includes('href="/biohack"'), "open-protocols-secondary is bare /biohack");
assert.ok(!handoff.includes("#shelf"), "tick-the-stack handoff is not a Shelf deep-link");
assert.ok(handoff.includes('t("today.tickStack")'), "Tick the stack on Protocols copy stays");

// --- Locales: locked EN copy in all five catalogs ---
const locked = {
  "today.kitSetupLead": LEAD,
  "today.kitSetupHint": HINT,
  "today.kitSetupInputPlaceholder": INPUT_PH,
  "today.kitSetupAdd": ADD,
  "today.kitSetupAdding": ADDING,
  "today.kitSetupAdded": ADDED,
  "today.kitSetupAlready": ALREADY,
  "today.kitSetupSkip": SKIP,
  "today.kitSetupEmpty": EMPTY,
  "today.kitSetupNoMatch": NO_MATCH,
};

for (const { id, src } of locales) {
  for (const [key, value] of Object.entries(locked)) {
    assert.ok(src.includes(`"${key}"`), `${id} has ${key}`);
    if (id === "en") {
      assert.ok(src.includes(value), `en locked string for ${key}`);
    }
  }
  assert.ok(
    src.includes("today\u2019s sky") || src.includes("today’s sky") || id !== "en",
    `${id} no-match uses typographic apostrophe when sourced from EN`,
  );
}

assert.ok(
  locales[0].src.includes(NO_MATCH),
  "EN no-match line uses a typographic apostrophe",
);

console.log("assert-first-week-kit-setup PASS");
