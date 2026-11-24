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
      'export {ChartTypeBox} from "./src/components/ChartTypeBox"; export {ChartDisclosure} from "./src/components/ChartDisclosure"; export {I18nProvider} from "./src/lib/i18n";',
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
const { ChartTypeBox, ChartDisclosure, I18nProvider } = require(path.join(scratch, "bundle.cjs"));
const flush = () => act(async () => { await Promise.resolve(); });
const text = (n) => (typeof n === "string" ? n : (n.children ?? []).map(text).join(""));

async function main() {
  // --- Page-like composition: Type box + three disclosures ---
  let r;
  const page = () =>
    React.createElement(I18nProvider, { accountLocale: "en" },
      React.createElement(ChartTypeBox, { actualType: "Projector" }),
      React.createElement(ChartDisclosure, { testId: "snapshot-profile", value: "5/1", label: "Profile" }, "PROFILE BODY"),
      React.createElement(ChartDisclosure, { testId: "snapshot-how-you-decide", value: "Splenic", label: "How you decide" }, "DECIDE BODY"),
      React.createElement(ChartDisclosure, { id: "snapshot-centers", testId: "snapshot-centers", openOnHash: true, value: "Head", label: "Centers to watch" }, "CENTERS BODY"),
    );
  await act(async () => { r = create(page()); });
  const details = () => r.root.findAllByType("details");
  const byTest = (id) => details().find((d) => d.props["data-testid"] === id);
  const typeDetails = () => details().find((d) => !d.props["data-testid"]);
  const toggle = (d, open) => act(() => d.props.onToggle({ currentTarget: { open } }));
  assert.equal(details().length, 4);
  assert.deepEqual(details().map((d) => Boolean(d.props.open)), [false, false, false, false], "all four start collapsed");

  // Independent: opening one leaves the others as they are.
  toggle(byTest("snapshot-profile"), true);
  assert.deepEqual(details().map((d) => Boolean(d.props.open)), [false, true, false, false]);
  toggle(byTest("snapshot-how-you-decide"), true);
  toggle(typeDetails(), true);
  assert.deepEqual(details().map((d) => Boolean(d.props.open)), [true, true, true, false], "no exclusive accordion");
  toggle(byTest("snapshot-profile"), false);
  assert.deepEqual(details().map((d) => Boolean(d.props.open)), [true, false, true, false]);

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
  assert.equal(Boolean(typeDetails().props.open), false, "Type details close on navigation");
  assert.ok(!text(r.root).includes("Preview — not your chart"), "Preview clears on navigation");
  assert.equal(Boolean(byTest("snapshot-how-you-decide").props.open), true, "other jumps do not close the Snapshot boxes");

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
  await act(async () => r.unmount());

  // Other person's voice.
  await act(async () => {
    r = create(React.createElement(I18nProvider, { accountLocale: "en" }, React.createElement(ChartTypeBox, { actualType: "Generator", personName: "Kenji" })));
  });
  const card = text(r.root.findByProps({ "data-testid": "bodygraph-type-card" }));
  assert.ok(card.startsWith("Preview ⌄Kenji · Generator"), card.slice(0, 60));
  assert.ok(!/You’re a Generator/.test(card));
  await act(async () => button("Preview").props.onClick());
  await act(async () => button("Projector").props.onClick());
  assert.ok(text(r.root).includes("Preview — not their chart") && text(r.root).includes("Back to Kenji"));
  await act(async () => r.unmount());
  console.log("PASS revert interactions: four boxes collapsed, independent toggles, Type-only presentation Preview (no URL/storage writes), navigation resets Type only, #snapshot-centers opens via replaceState/hashchange/direct load, other-person voice.");
}
main().catch((e) => { console.error(e); process.exit(1); });
