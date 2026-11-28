/**
 * Soul: one partner control.
 * Mark stays on the Partner segment. Unmark stays on the quiet Remove control.
 * Run: npx tsx scripts/assert-soul-one-partner-control.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const page = readFileSync(resolve(root, "src/app/soul/page.tsx"), "utf8");
const profile = readFileSync(resolve(root, "src/app/profile/page.tsx"), "utf8");

const QUIET_CLASS =
  "inline-flex min-h-11 items-center text-sm font-medium text-fg-secondary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60";

function openingTagForTestId(src, testid) {
  const needle = `data-testid="${testid}"`;
  const i = src.indexOf(needle);
  assert.ok(i > 0, `missing testid ${testid}`);
  const start = src.lastIndexOf("<", i);
  const end = src.indexOf(">", i);
  assert.ok(start >= 0 && end > start, `locate opening tag for ${testid}`);
  return src.slice(start, end + 1);
}

function onClickSource(src, testid) {
  const tag = openingTagForTestId(src, testid);
  const onClickAt = tag.indexOf("onClick=");
  assert.ok(onClickAt >= 0, `${testid} has an onClick`);
  return tag.slice(onClickAt);
}

// 1) Unmark still renames to "person" and does not delete, switch, or remember.
const removeStart = page.indexOf("const handleRemoveAsPartner");
assert.ok(removeStart > 0, "locate remove handler");
const removeEnd = page.indexOf("}, [selectedFriend, removingPartner, user?.id]);", removeStart);
assert.ok(removeEnd > removeStart, "locate remove handler end");
const removeHandler = page.slice(removeStart, removeEnd);
assert.ok(
  removeHandler.includes('renameChart(selectedFriend.id, selectedFriend.label || "", "person")'),
  "renameChart to person",
);
assert.ok(!removeHandler.includes("deleteChart"), "remove does not deleteChart");
assert.ok(!removeHandler.includes("setFriendId"), "remove does not setFriendId");
assert.ok(
  !removeHandler.includes("writeSoulLastPersonId"),
  "remove does not writeSoulLastPersonId",
);

// 2) Person segment does not unmark. Partner segment still marks.
const personClick = onClickSource(page, "person-role-person");
assert.ok(
  !personClick.includes("handleRemoveAsPartner"),
  "Person onClick does not call handleRemoveAsPartner",
);
assert.ok(
  !personClick.includes("renameChart"),
  "Person onClick does not call renameChart",
);
const partnerClick = onClickSource(page, "person-role-partner");
assert.ok(
  partnerClick.includes("handleMarkAsPartner"),
  "Partner onClick calls handleMarkAsPartner",
);
assert.ok(
  partnerClick.includes("!isPartnerSelected"),
  "Partner onClick marks only when not already Partner",
);

// 3) The only unmark control stays in the Partner reason area.
const reasonAt = page.indexOf('data-testid="soul-love-guidance-reason"');
const removeAt = page.indexOf('data-testid="soul-remove-as-partner"');
const markAt = page.indexOf('data-testid="soul-mark-partner-row"');
assert.ok(
  reasonAt > 0 && removeAt > reasonAt && markAt > removeAt,
  "Remove lives between the reason line and the mark row",
);
const partnerArea = page.slice(reasonAt, markAt);
assert.ok(
  partnerArea.includes("handleRemoveAsPartner"),
  "Remove control calls handleRemoveAsPartner",
);
assert.ok(
  partnerArea.includes('t("soul.chrome.removePartner")'),
  "Remove control uses soul.chrome.removePartner",
);
assert.ok(
  partnerArea.includes('t("soul.chrome.removing")'),
  "Remove control uses soul.chrome.removing",
);
assert.ok(
  onClickSource(page, "soul-remove-as-partner").includes("handleRemoveAsPartner"),
  "Remove onClick calls handleRemoveAsPartner",
);

// 4) Quiet text button: locked class, no border, no elevated fill, no danger.
const removeTag = openingTagForTestId(page, "soul-remove-as-partner");
assert.ok(removeTag.includes(QUIET_CLASS), "Remove uses the locked quiet className");
assert.ok(!removeTag.includes("border-border"), "Remove has no border-border");
assert.ok(!removeTag.includes("bg-elevated"), "Remove has no bg-elevated");
assert.ok(!removeTag.includes("text-danger"), "Remove has no text-danger");

// 5) Role control, reason line, and both Open Chart links remain.
assert.ok(page.includes('data-testid="person-role-control"'), "person-role-control remains");
assert.ok(page.includes('data-testid="person-role-person"'), "person-role-person remains");
assert.ok(page.includes('data-testid="person-role-partner"'), "person-role-partner remains");
assert.ok(
  page.includes('t("soul.chrome.loveGuidanceOnNeutral"'),
  "reason line key remains",
);
const openChart = page.match(/data-testid="soul-open-chart"/g);
assert.equal(openChart?.length, 2, "both Open Chart links remain");

// 6) Chart's people form keeps its own toggle and does not gain the Soul remove control.
assert.ok(
  profile.includes('data-testid="person-role-control"'),
  "Chart form person-role-control remains",
);
assert.ok(
  !profile.includes("soul-remove-as-partner"),
  "Chart form does not gain soul-remove-as-partner",
);

console.log("assert-soul-one-partner-control: ok");
