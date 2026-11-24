const assert = require("node:assert/strict");
// Synthetic DOM/focus/resize React harness; NOT actual-app/browser or touch proof.
// Optional test-only tools: esbuild + react-test-renderer@18.3.1 (no repo dependency changes).
// Run: NODE_PATH=/workspace/bodygraph-test-tools/node_modules node scripts/test-chart-bodygraph-interactions.cjs
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const frontend = path.resolve(process.argv[2] ?? path.resolve(__dirname, ".."));
const scratch = fs.mkdtempSync(
  path.join(os.tmpdir(), "bodygraph-interactions-"),
);
process.on("exit", () => fs.rmSync(scratch, { recursive: true, force: true }));
require("esbuild").buildSync({
  stdin: {
    contents:
      'export {ChartBodygraphModule} from "./src/components/ChartBodygraphModule"; export {I18nProvider} from "./src/lib/i18n";',
    resolveDir: frontend,
  },
  outfile: path.join(scratch, "module.cjs"),
  bundle: true,
  platform: "node",
  format: "cjs",
  jsx: "automatic",
  alias: { "@": path.join(frontend, "src") },
  external: ["react", "react/*"],
});
const React = require("react");
const { create, act } = require("react-test-renderer");
const { ChartBodygraphModule, I18nProvider } = require(
  path.join(scratch, "module.cjs"),
);
let observers = [];
const events = {};
const writes = [];
const historyWrites = [];
const dispatch = (type, event = {}) =>
  [...(events[type] || [])].forEach((fn) => fn(event));
global.ResizeObserver = class {
  constructor(cb) {
    this.cb = cb;
    observers.push(this);
  }
  observe() {}
  disconnect() {}
};
global.getComputedStyle = () => ({ fontFamily: "Inter, sans-serif" });
global.document = {
  documentElement: { lang: "en" },
  getElementById() {
    return { focus() {} };
  },
};
global.window = {
  innerHeight: 800,
  scrollBy() {},
  location: new URL("http://localhost/profile#bodygraph"),
  addEventListener(k, fn) {
    (events[k] ??= new Set()).add(fn);
  },
  removeEventListener(k, fn) {
    events[k]?.delete(fn);
    if (!events[k]?.size) delete events[k];
  },
};
window.history = {
  state: null,
  pushState(state, title, url) {
    assert.equal(this, window.history);
    this.state = state;
    if (url != null) window.location = new URL(url, window.location.href);
    historyWrites.push(["push", state, title, url]);
  },
  replaceState(state, title, url) {
    assert.equal(this, window.history);
    this.state = state;
    if (url != null) window.location = new URL(url, window.location.href);
    historyWrites.push(["replace", state, title, url]);
  },
};
global.localStorage = {
  getItem() {
    return null;
  },
  setItem(...args) {
    writes.push(args);
  },
};
global.requestAnimationFrame = (fn) => {
  fn();
  return 1;
};
global.cancelAnimationFrame = () => {};
async function main() {
  const focusEvents = [];
  let blurHeading;
  const headingAttributes = {};
  const heading = {
    getAttribute(k) {
      return headingAttributes[k] ?? null;
    },
    setAttribute(k, v) {
      headingAttributes[k] = v;
    },
    removeAttribute(k) {
      delete headingAttributes[k];
    },
    addEventListener(k, fn) {
      if (k === "blur") blurHeading = fn;
    },
    focus(opts) {
      focusEvents.push({ kind: "heading", opts });
    },
  };
  document.querySelector = (selector) =>
    selector === "#deep-dive h2" ? heading : null;
  let resolveJump;
  const fixture = {
    actualType: "Generator",
    definedCenters: ["Throat", "Spleen", "Sacral", "Root", "G", "Solar Plexus"],
    channels: [
      { gates: [20, 57] },
      { gates: [9, 52] },
      { gates: [19, 49] },
      { gates: [1, 8] },
    ],
    hangingGates: [
      { held: 10, missing: 20 },
      { held: 10, missing: 34 },
      { held: 10, missing: 57 },
      { held: 37, missing: 40 },
    ],
    personalityGates: [20, 57, 9, 1, 8, 37],
    designGates: [52, 19, 49, 10, 57],
  };
  const originalFixture = JSON.stringify(fixture);
  const jumps = [];
  fixture.onDeepDive = (domain) => {
    jumps.push(domain);
    return new Promise((resolve) => {
      resolveJump = resolve;
    });
  };
  let renderer;
  const element = (props = fixture, key = "self", locale = "en") =>
    React.createElement(
      I18nProvider,
      { accountLocale: locale },
      React.createElement(ChartBodygraphModule, { ...props, key }),
    );
  const text = (node) =>
    typeof node === "string"
      ? node
      : Array.isArray(node)
        ? node.map(text).join("")
        : node && node.children
          ? node.children.map(text).join("")
          : "";
  const roots = () => renderer.root;
  const nodes = (type) => roots().findAll((node) => node.type === type);
  const button = (label) =>
    nodes("button").find((node) => text(node) === label);
  const click = (node) =>
    act(() =>
      node.props.onClick({
        currentTarget: {
          focus(opts) {
            focusEvents.push({ kind: "initiator", opts });
          },
        },
        preventDefault() {},
        stopPropagation() {},
      }),
    );
  const layer = (name) =>
    roots().find((node) => node.props["data-layer"] === name);
  const svgData = () =>
    JSON.stringify(
      nodes("svg")[0]
        .findAll(
          (node) => typeof node.type === "string" && node.type !== "style",
        )
        .map((node) => ({
          type: node.type,
          d: node.props.d,
          x: node.props.x,
          y: node.props.y,
          fill: node.props.fill,
          stroke: node.props.stroke,
          opacity: node.props.opacity,
          text: node.type === "text" ? text(node) : undefined,
        })),
    );
  act(() => {
    renderer = create(element(), {
      createNodeMock(node) {
        return node.type === "svg"
          ? {
              querySelector() {
                return null;
              },
            }
          : { focus() {} };
      },
    });
  });
  const baseSvg = svgData();
  const gate = (n) =>
    layer("badges")
      .findAllByType("text")
      .find((node) => text(node) === String(n));
  assert.equal(gate(20).props.fill, "#f7f6f2");
  assert.equal(gate(16).props.fill, "#e8e4da");
  assert.equal(gate(53).props.fill, "#1c201d");
  assert.equal(gate(20).props.textDecoration, "underline");
  assert.equal(gate(16).props.textDecoration, "none");
  assert.ok(gate(20).props["aria-label"].includes("personality"));
  assert.ok(gate(52).props["aria-label"].includes("design"));
  assert.ok(gate(57).props["aria-label"].includes("personality + design"));

  assert.ok(
    text(
      roots().findByProps({ "data-testid": "bodygraph-type-card" }),
    ).includes("actual Authority"),
  );
  // Reproduce the official UX failure with a still-mounted real component, not a keyed remount.
  for (const [name, navigate] of [
    [
      "Chart section replaceState",
      () => window.history.replaceState(window.history.state, "", "#snapshot"),
    ],
    [
      "return section replaceState",
      () => window.history.replaceState(window.history.state, "", "#bodygraph"),
    ],
    [
      "programmatic pushState",
      () =>
        window.history.pushState({ app: "retained" }, "", "?person=2#centers"),
    ],
    [
      "native fragment",
      () => {
        window.location.hash = "channels";
        dispatch("hashchange");
      },
    ],
    [
      "back/forward",
      () => {
        window.location = new URL("http://localhost/profile#snapshot");
        dispatch("popstate");
        dispatch("hashchange");
      },
    ],
    [
      "real pathname navigation",
      () => window.history.pushState(null, "", "/today"),
    ],
    ["BFCache restoration", () => dispatch("pageshow", { persisted: true })],
  ]) {
    const beforePreviewUrl = window.location.href;
    const beforePreviewWrites = historyWrites.length;
    click(button("Preview ⌄"));
    click(button("Projector"));
    assert.equal(window.location.href, beforePreviewUrl);
    assert.equal(
      historyWrites.length,
      beforePreviewWrites,
      "preview controls never write history",
    );
    assert.ok(text(roots()).includes("Preview — not your chart"));
    const svgBefore = svgData();
    await act(async () => {
      navigate();
      await Promise.resolve();
    });
    assert.ok(
      !text(roots()).includes("Preview — not your chart"),
      name + " must reset Type preview without remounting",
    );
    assert.equal(svgData(), svgBefore, name + " must not change actual SVG");
    assert.ok(
      text(roots()).includes("You’re a Generator"),
      name + " restores actual Type",
    );
    assert.ok(!button("Reflector"), name + " closes preview pills");
  }
  const beforeLocalTabs = window.location.href;
  const historyCount = historyWrites.length;
  for (const label of ["Centers", "Bridges", "Hanging Gates", "Overview"])
    click(button(label));
  assert.equal(window.location.href, beforeLocalTabs);
  assert.equal(
    historyWrites.length,
    historyCount,
    "module tabs never write history",
  );

  click(button("Preview ⌄"));
  assert.deepEqual(
    nodes("button")
      .filter((node) =>
        [
          "Generator",
          "Manifesting Generator",
          "Manifestor",
          "Projector",
          "Reflector",
        ].includes(text(node)),
      )
      .map(text),
    ["Manifesting Generator", "Manifestor", "Projector", "Reflector"],
  );
  click(button("Projector"));
  assert.ok(text(roots()).includes("Preview — not your chart"));
  assert.ok(
    text(roots()).includes("You are built to guide, not to grind all day."),
  );
  assert.equal(
    svgData(),
    baseSvg,
    "Type preview cannot mutate any rendered SVG attribute",
  );
  click(button("Preview ⌄"));
  assert.ok(
    !text(roots()).includes("Preview — not your chart"),
    "closing pills resets hypothetical copy",
  );
  click(button("Preview ⌄"));
  click(button("Reflector"));
  click(button("Back to mine"));
  assert.ok(!text(roots()).includes("Preview — not your chart"));
  for (const tab of ["Overview", "Centers", "Bridges", "Hanging Gates"]) {
    click(button(tab));
    assert.equal(button(tab).props["aria-selected"], true);
  }
  const hangingPanel = roots().findByProps({ role: "tabpanel" });
  assert.equal(hangingPanel.findAllByType("button").length, 0);
  assert.equal(hangingPanel.findAllByType("a").length, 0);
  assert.ok(text(hangingPanel).includes("10 → 20"));
  assert.ok(text(hangingPanel).includes("10 → 34"));
  assert.ok(text(hangingPanel).includes("10 → 57"));
  assert.equal(
    layer("hanging").findAllByType("path").length,
    2,
    "one Integration hanging visual plus gate37; full data retained in list",
  );
  const hit = layer("hitboxes");
  assert.equal(
    hit.findAllByType("path").length,
    10,
    "6 Defined Center and 4 Bridge hit targets only",
  );
  assert.equal(layer("hanging").props.pointerEvents, "none");
  assert.equal(layer("centers").props.pointerEvents, "none");
  for (const width of [224, 256, 286, 343, 640, 1024]) {
    act(() => observers[0].cb([{ contentRect: { width } }]));
    assert.ok(
      Math.abs((layer("badges").props.fontSize * width) / 240 - 12) < 1e-9,
    );
  }
  click(button("Centers"));
  click(button("Spleen · Defined"));
  assert.ok(
    text(roots().findByProps({ "data-testid": "bodygraph-peek" })).includes(
      "Quiet instinct about safety and timing",
    ),
  );
  assert.equal(layer("tracks").props.opacity, 0.18);
  focusEvents.length = 0;
  act(() => dispatch("keydown", { key: "Escape" }));
  assert.equal(
    focusEvents.at(-1).kind,
    "initiator",
    "Escape restores the initiating control",
  );
  assert.equal(
    roots().findAllByProps({ "data-testid": "bodygraph-peek" }).length,
    0,
  );
  assert.equal(
    button("Centers").props["aria-selected"],
    true,
    "Escape restores tab mode",
  );
  click(button("Bridges"));
  click(button("20–57 · The Brain Wave"));
  assert.equal(
    layer("effects").findAllByType("animateMotion")[0].props.path,
    layer("bridges")
      .find((node) => node.props["data-selected"] === true)
      .findByType("path").props.d,
  );
  assert.ok(
    text(roots().findByProps({ "data-testid": "bodygraph-peek" })).includes(
      "Intuitive knowing finding a voice",
    ),
  );
  focusEvents.length = 0;
  act(() => nodes("svg")[0].props.onClick());
  assert.equal(
    focusEvents.at(-1).kind,
    "initiator",
    "blank canvas restores the initiating control",
  );
  assert.equal(
    roots().findAllByProps({ "data-testid": "bodygraph-peek" }).length,
    0,
  );
  click(button("20–57 · The Brain Wave"));
  focusEvents.length = 0;
  const paper = {};
  act(() =>
    roots()
      .findByProps({ "data-testid": "chart-bodygraph-module" })
      .props.onClick({ target: paper, currentTarget: paper }),
  );
  assert.equal(
    focusEvents.at(-1).kind,
    "initiator",
    "empty module paper restores initiator",
  );
  click(button("Centers"));
  click(button("Spleen · Defined"));
  focusEvents.length = 0;
  await act(async () => {
    click(
      roots().findByProps({ "data-testid": "bodygraph-peek" }).findByType("a"),
    );
  });
  assert.equal(focusEvents.length, 0);
  await act(async () => {
    resolveJump();
    await Promise.resolve();
  });
  assert.equal(
    focusEvents.at(-1).kind,
    "heading",
    "center navigation focuses Deep dive heading",
  );
  blurHeading();
  click(button("Bridges"));
  click(button("20–57 · The Brain Wave"));
  focusEvents.length = 0;
  await act(async () => {
    click(
      roots().findByProps({ "data-testid": "bodygraph-peek" }).findByType("a"),
    );
  });
  assert.equal(focusEvents.length, 0, "focus waits for real handoff Promise");
  await act(async () => {
    resolveJump();
    await Promise.resolve();
  });
  assert.deepEqual(jumps, ["centers", "channels"]);
  assert.equal(focusEvents.at(-1).kind, "heading");
  assert.deepEqual(focusEvents.at(-1).opts, { preventScroll: true });
  assert.equal(headingAttributes.tabindex, "-1");
  blurHeading();
  assert.equal(
    headingAttributes.tabindex,
    undefined,
    "temporary focusability restored on blur",
  );
  click(button("Preview ⌄"));
  click(button("Projector"));
  act(() =>
    renderer.update(element({ ...fixture, personName: "Kenji" }, "friend-2")),
  );
  assert.ok(!text(roots()).includes("Preview — not your chart"));
  assert.ok(text(roots()).includes("Kenji is a Generator"));
  click(button("Preview ⌄"));
  click(button("Projector"));
  assert.ok(text(roots()).includes("Preview — not their chart"));
  assert.ok(button("Back to Kenji"));
  assert.ok(text(roots()).includes("Kenji is built to guide"));
  click(button("Back to Kenji"));
  click(button("Preview ⌄"));
  click(button("Reflector"));
  act(() =>
    renderer.update(
      element({ ...fixture, personName: "Kenji" }, "friend-2?route-change"),
    ),
  );
  assert.ok(
    !text(roots()).includes("Preview — not their chart"),
    "route keyed remount resets preview",
  );
  for (const locale of ["de", "es", "fr", "nl"]) {
    act(() =>
      renderer.update(
        element(
          { ...fixture, personName: "Kenji" },
          "locale-" + locale,
          locale,
        ),
      ),
    );
    assert.ok(!text(roots()).includes("Kenji is a Generator"));
    assert.ok(!text(roots()).includes("chart.bodygraphModule."));
    const tabs = nodes("button")
      .filter((n) => n.props.role === "tab")
      .map(text);
    assert.ok(
      !tabs.includes("Centers") &&
        !tabs.includes("Bridges") &&
        !tabs.includes("Hanging Gates"),
      "new tab chrome is translated",
    );
  }
  assert.deepEqual(writes, [], "no data/storage writes");
  // A delayed handoff must not steal focus after leaving the chart.
  click(button("Bruggen"));
  click(button("20–57 · The Brain Wave"));
  await act(async () => {
    click(
      roots().findByProps({ "data-testid": "bodygraph-peek" }).findByType("a"),
    );
  });
  focusEvents.length = 0;
  act(() => renderer.unmount());
  await act(async () => {
    resolveJump();
    await Promise.resolve();
  });
  assert.equal(focusEvents.length, 0, "no navigation focus after unmount");
  assert.equal(events.keydown, undefined);
  assert.equal(
    JSON.stringify(fixture),
    originalFixture,
    "input chart data is unchanged",
  );
  // Exact failure direction: Me Projector -> preview Generator -> snapshot -> bodygraph.
  // Derived from the local review chart's Type/centers/channel; still synthetic props,
  // not evidence that API/store/person wiring or browser navigation has passed.
  act(() => {
    renderer = create(
      element({
        actualType: "Projector",
        definedCenters: ["G", "Throat"],
        channels: [{ gates: [13, 33] }],
      }),
    );
  });
  const projectorSvg = svgData();
  click(button("Preview ⌄"));
  click(button("Generator"));
  assert.ok(text(roots()).includes("Preview — not your chart"));
  assert.equal(svgData(), projectorSvg);
  await act(async () => {
    window.history.replaceState(window.history.state, "", "/profile#snapshot");
    await Promise.resolve();
  });
  await act(async () => {
    window.history.replaceState(window.history.state, "", "#bodygraph");
    await Promise.resolve();
  });
  assert.ok(text(roots()).includes("You’re a Projector"));
  assert.ok(!text(roots()).includes("Preview — not your chart"));
  assert.ok(!button("Generator"), "route reset closes preview pills");
  assert.equal(svgData(), projectorSvg);
  act(() => renderer.unmount());
  for (const event of ["popstate", "hashchange", "pageshow"])
    assert.equal(events[event], undefined, "navigation listeners are released");

  console.log(
    "PASS: real React component interactions (synthetic data, no browser): Type-only preview/reset, person remount plus mounted section/hash/query/path/back-forward/BFCache navigation reset, unchanged SVG and no tab history writes, 4 tabs, all hanging data, dedup visuals, hit-target rules, 12px resize state, center+bridge peek, Escape/blank SVG/blank paper focus restore, both awaited Deep dive heading-focus handoffs, tabindex cleanup, no focus steal after unmount, five locales, zero writes.",
  );
}
const guard = setTimeout(() => {
  console.error("FAIL: interaction harness did not reach completion");
  process.exit(1);
}, 8000);
main().then(
  () => clearTimeout(guard),
  (error) => {
    clearTimeout(guard);
    console.error(error);
    process.exitCode = 1;
  },
);
