// Real React (react-test-renderer) interactions for the Type box and Snapshot disclosures.
// Synthetic window/history; NOT browser or touch proof.
// Run: NODE_PATH=/workspace/bodygraph-test-tools/node_modules node scripts/test-chart-bodygraph-revert-interactions.cjs
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const frontend = path.resolve(__dirname, "..");
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "bodygraph-revert-"));
process.on("exit", () => fs.rmSync(scratch, { recursive: true, force: true }));
require("esbuild").buildSync({
  stdin: {
    contents:
      'export {ChartTypeBox} from "./src/components/ChartTypeBox"; export {ChartDisclosure, SnapshotExclusiveGroup} from "./src/components/ChartDisclosure"; export {I18nProvider} from "./src/lib/i18n";',
    resolveDir: frontend,
  },
  outfile: path.join(scratch, "bundle.cjs"),
  bundle: true,
  platform: "node",
  format: "cjs",
  jsx: "automatic",
  alias: { "@": path.join(frontend, "src") },
  external: ["react", "react/*"],
});
const React = require("react");
const { create, act } = require("react-test-renderer");

const listeners = {};
const historyWrites = [];
const storageWrites = [];
global.window = {
  location: new URL("http://localhost/profile"),
  addEventListener: (k, fn) => (listeners[k] ??= new Set()).add(fn),
  removeEventListener: (k, fn) => listeners[k]?.delete(fn),
};
window.history = {
  state: null,
  pushState(state, _t, url) {
    historyWrites.push(url);
    window.location = new URL(url, window.location.href);
  },
  replaceState(state, _t, url) {
    historyWrites.push(url);
    window.location = new URL(url, window.location.href);
  },
};
global.localStorage = { getItem: () => null, setItem: (...a) => storageWrites.push(a) };
global.document = { documentElement: { lang: "en" } };
const { ChartTypeBox, ChartDisclosure, SnapshotExclusiveGroup, I18nProvider } = require(path.join(scratch, "bundle.cjs"));
const flush = () => act(async () => { await Promise.resolve(); });
const text = (n) => (typeof n === "string" ? n : (n.children ?? []).map(text).join(""));

async function main() {
  // --- Page-like composition: Type box + four disclosures (Strategy merged into How you decide) ---
  let r;
  const page = () =>
    React.createElement(I18nProvider, { accountLocale: "en" },
      React.createElement(ChartTypeBox, { actualType: "Projector" }),
      React.createElement(SnapshotExclusiveGroup, null,
        React.createElement(ChartDisclosure, { testId: "snapshot-profile", value: "5/1", label: "Profile" }, "PROFILE BODY"),
        React.createElement(ChartDisclosure, { testId: "snapshot-how-you-decide", value: "Splenic · Wait for the Invitation", label: "How you decide" }, "DECIDE BODY"),
        React.createElement(ChartDisclosure, { id: "snapshot-centers", testId: "snapshot-centers", openOnHash: true, value: "Head", label: "Centers to watch" }, "CENTERS BODY"),
        React.createElement(ChartDisclosure, { testId: "snapshot-definition", value: "Split", label: "Definition" }, "DEFINITION BODY"),
      ),
    );
  await act(async () => { r = create(page()); });
  const details = () => r.root.findAllByType("details");
  const byTest = (id) => details().find((d) => d.props["data-testid"] === id);
  const typeDetails = () => details().find((d) => !d.props["data-testid"]);
  const toggle = (d, open) => act(() => d.props.onToggle({ currentTarget: { open } }));
  assert.equal(details().length, 5);
  assert.deepEqual(details().map((d) => Boolean(d.props.open)), [false, false, false, false, false], "all five start collapsed");
  assert.ok(text(byTest("snapshot-how-you-decide")).startsWith("How you decide: Splenic · Wait for the Invitation"), "merged label-first summary");

  const typePointer = () => r.root.findByProps({ "data-testid": "chart-type-deep-dive-pointer" });
  assert.equal(typePointer().props.href, "#deep-dive-type");
  assert.equal(typePointer().props["aria-label"], "Read more about Type in Deep dive");
  assert.equal(text(typePointer()), "Read more in Deep dive→");

  // Snapshot disclosures are exclusive. The Type box is not in that group.
  toggle(byTest("snapshot-profile"), true);
  assert.deepEqual(details().map((d) => Boolean(d.props.open)), [false, true, false, false, false]);
  toggle(byTest("snapshot-how-you-decide"), true);
  assert.deepEqual(details().map((d) => Boolean(d.props.open)), [false, false, true, false, false], "opening How you decide closes Profile");
  toggle(typeDetails(), true);
  assert.deepEqual(details().map((d) => Boolean(d.props.open)), [true, false, true, false, false], "Type box stays open and is not in the Snapshot group");
  toggle(byTest("snapshot-profile"), true);
  assert.deepEqual(details().map((d) => Boolean(d.props.open)), [true, true, false, false, false], "Profile closes How you decide; Type stays");
  toggle(byTest("snapshot-profile"), false);
  assert.deepEqual(details().map((d) => Boolean(d.props.open)), [true, false, false, false, false], "closing the open Snapshot box leaves them collapsed");
  toggle(byTest("snapshot-definition"), true);
  assert.deepEqual(details().map((d) => Boolean(d.props.open)), [true, false, false, false, true], "Definition opens alone among Snapshot boxes");
  toggle(byTest("snapshot-how-you-decide"), true);
  assert.deepEqual(details().map((d) => Boolean(d.props.open)), [true, false, true, false, false], "How you decide closes Definition");
  toggle(byTest("snapshot-definition"), false);
  window.history.replaceState(null, "", "#deep-dive-type");
  await flush();
  assert.equal(Boolean(typeDetails().props.open), true, "Read more hash leaves the Type box open");
  assert.equal(Boolean(byTest("snapshot-how-you-decide").props.open), true, "Read more hash leaves Snapshot open");

  // Preview: Type-only, presentation-only.
  const button = (label) => r.root.findAllByType("button").find((b) => text(b).startsWith(label));
  const writesBefore = historyWrites.length;
  await act(async () => button("Preview").props.onClick());
  await act(async () => button("Generator").props.onClick());
  assert.ok(text(r.root.findByProps({ "data-testid": "bodygraph-type-card" })).includes("Preview — not your chart"));
  assert.equal(historyWrites.length, writesBefore, "Preview writes no URL");
  assert.deepEqual(storageWrites, [], "Preview persists nothing");
  assert.equal(r.root.findAllByType("button").filter((b) => text(b).startsWith("Preview")).length, 1, "one Preview control (Type only)");

  // Hash jump (section replaceState) to #snapshot-centers: opens Centers; Type resets; others stay.
  window.history.replaceState(null, "", "#snapshot-centers");
  await flush();
  assert.equal(Boolean(byTest("snapshot-centers").props.open), true, "#snapshot-centers opens Centers to watch");
  assert.equal(Boolean(typeDetails().props.open), true, "Type details keep their state on navigation; Preview resets");
  assert.ok(!text(r.root).includes("Preview — not your chart"), "Preview clears on navigation");
  assert.equal(Boolean(byTest("snapshot-how-you-decide").props.open), false, "hash-open closes the other Snapshot boxes");
  assert.equal(Boolean(byTest("snapshot-profile").props.open), false);
  assert.equal(Boolean(byTest("snapshot-definition").props.open), false);

  // Navigation elsewhere does not auto-close Centers.
  window.history.replaceState(null, "", "#deep-dive");
  await flush();
  assert.equal(Boolean(byTest("snapshot-centers").props.open), true);
  toggle(byTest("snapshot-centers"), false);
  window.history.replaceState(null, "", "#bodygraph");
  await flush();
  assert.equal(Boolean(byTest("snapshot-centers").props.open), false, "only targeting reopens it");
  window.location.hash = "snapshot-centers";
  [...(listeners.hashchange ?? [])].forEach((fn) => fn());
  await flush();
  assert.equal(Boolean(byTest("snapshot-centers").props.open), true, "native hashchange also opens");
  await act(async () => r.unmount());

  // Direct load with #snapshot-centers.
  window.location = new URL("http://localhost/profile?person=2#snapshot-centers");
  await act(async () => { r = create(page()); });
  assert.equal(Boolean(byTest("snapshot-centers").props.open), true, "direct #snapshot-centers load opens it");
  assert.equal(Boolean(byTest("snapshot-profile").props.open), false);
  assert.equal(Boolean(byTest("snapshot-how-you-decide").props.open), false, "hash jump does not open How you decide");
  assert.equal(Boolean(byTest("snapshot-definition").props.open), false, "hash jump does not open Definition");
  await act(async () => r.unmount());

  // Other person's voice.
  await act(async () => {
    r = create(React.createElement(I18nProvider, { accountLocale: "en" }, React.createElement(ChartTypeBox, { actualType: "Generator", personName: "Kenji" })));
  });
  const card = text(r.root.findByProps({ "data-testid": "bodygraph-type-card" }));
  assert.ok(card.startsWith("Preview ⌄Kenji · Type: Generator"), card.slice(0, 60));
  assert.ok(!/You’re a Generator/.test(card));
  await act(async () => button("Preview").props.onClick());
  await act(async () => button("Projector").props.onClick());
  assert.ok(text(r.root).includes("Preview — not their chart") && text(r.root).includes("Back to Kenji"));
  await act(async () => r.unmount());
  console.log("PASS revert interactions: five boxes collapsed (Strategy merged into How you decide), Snapshot exclusive-open, Type independent, Type Read more link, Type-only presentation Preview (no URL/storage writes), Type details keep their state on navigation and Preview resets, #snapshot-centers opens and closes the other Snapshot boxes, other-person voice.");
}
main().catch((e) => { console.error(e); process.exit(1); });
