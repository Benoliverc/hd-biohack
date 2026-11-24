/** Navigation-boundary behavior with a URL/History event model, not browser proof. */
import assert from "node:assert/strict";
import { observeChartNavigation } from "../src/lib/observeChartNavigation.ts";

const previousWindow = globalThis.window;
const target = new EventTarget();
target.location = new URL("http://localhost/profile#bodygraph");
const entries = [{ url: target.location.href, state: null }];
let index = 0;
const calls = [];
function write(kind, receiver, args) {
  assert.equal(receiver, history, "retain History receiver");
  const [state, , url] = args;
  const next = new URL(url ?? target.location.href, target.location.href);
  if (next.origin !== target.location.origin)
    throw new DOMException("origin", "SecurityError");
  calls.push({ kind, args });
  if (kind === "push") entries.splice(++index);
  entries[index] = { url: next.href, state };
  target.location = next;
}
const history = {
  get state() {
    return entries[index].state;
  },
  pushState(...args) {
    write("push", this, args);
  },
  replaceState(...args) {
    write("replace", this, args);
  },
  go(delta) {
    index += delta;
    target.location = new URL(entries[index].url);
    target.dispatchEvent(new Event("popstate"));
    target.dispatchEvent(new Event("hashchange"));
  },
};
target.history = history;
globalThis.window = target;
const originalPush = history.pushState;
const originalReplace = history.replaceState;
let resets = 0;
const release = observeChartNavigation(() => {
  resets++;
});
const flush = async (expected) => {
  await Promise.resolve();
  assert.equal(resets, expected);
};
try {
  const state = Object.freeze({ __NA: true, person: 2 });
  history.replaceState(state, "section", "#snapshot");
  assert.equal(
    resets,
    0,
    "do not schedule React updates inside Next insertion effects",
  );
  assert.equal(history.state, state, "Next/caller state identity is preserved");
  assert.deepEqual(calls.at(-1), {
    kind: "replace",
    args: [state, "section", "#snapshot"],
  });
  await flush(1);
  history.replaceState(state, "", "#bodygraph");
  await flush(2);
  history.pushState(state, "", "?person=2#bodygraph");
  assert.equal(target.location.search, "?person=2");
  await flush(3);
  history.go(-1);
  await flush(4);
  history.go(1);
  await flush(5);
  history.pushState(state, "", "/today");
  await flush(6);
  target.location.hash = "native-anchor";
  target.dispatchEvent(new Event("hashchange"));
  await flush(7);
  target.dispatchEvent(new Event("popstate"));
  history.replaceState({ guideOnly: true }, "", target.location.href);
  await flush(7); // Same-URL guide history is not a route change.
  target.dispatchEvent(new Event("pageshow"));
  await flush(7);
  const restore = new Event("pageshow");
  restore.persisted = true;
  target.dispatchEvent(restore);
  await flush(8);
  const before = target.location.href;
  history.replaceState(null, "", "#away");
  history.replaceState(null, "", before);
  await flush(9); // Even away-and-back in one turn must invalidate preview.
  assert.throws(() => history.pushState(null, "", "https://example.org/"), {
    name: "SecurityError",
  });
  await flush(9);
  history.replaceState(null, "", "#queued-before-unmount");
  release();
  await flush(9);
  assert.equal(history.pushState, originalPush);
  assert.equal(history.replaceState, originalReplace);

  // A later Next wrapper must not be clobbered on cleanup or retain a live callback.
  const dispose = observeChartNavigation(() => {
    resets++;
  });
  const observedPush = history.pushState;
  const nextPush = function (...args) {
    return observedPush.apply(this, args);
  };
  history.pushState = nextPush;
  dispose();
  assert.equal(history.pushState, nextPush);
  history.pushState(state, "", "/profile?person=3#centers");
  target.dispatchEvent(restore);
  await flush(9);
  assert.equal(history.state, state);
  assert.equal(target.location.search, "?person=3");
  console.log(
    "PASS Chart navigation: section replace/return, push/query/path, native hash, back/forward, BFCache, same-turn roundtrip, same-URL non-navigation, state/args/errors, deferred updates and safe cleanup.",
  );
} finally {
  release();
  globalThis.window = previousWindow;
}
