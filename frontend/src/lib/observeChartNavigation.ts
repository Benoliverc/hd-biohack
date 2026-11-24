/** Observe URL changes that do not necessarily remount Chart (notably section replaceState). */
export function observeChartNavigation(onNavigate: () => void): () => void {
  const history = window.history;
  const originalPush = history.pushState;
  const originalReplace = history.replaceState;
  let previousUrl = window.location.href;
  let listener: (() => void) | null = onNavigate;
  let pending = false;

  function notify() {
    if (!listener || pending) return;
    pending = true;
    // Next also writes history during its insertion effect. Never schedule React
    // state updates inside that effect or alter the history operation's return path.
    queueMicrotask(() => {
      pending = false;
      listener?.();
    });
  }

  function checkUrl() {
    if (!listener) return;
    const url = window.location.href;
    if (url === previousUrl) return;
    previousUrl = url;
    notify();
  }

  function pushState(...args: Parameters<History["pushState"]>) {
    originalPush.apply(history, args);
    checkUrl();
  }

  function replaceState(...args: Parameters<History["replaceState"]>) {
    originalReplace.apply(history, args);
    checkUrl();
  }

  function restorePage(event: PageTransitionEvent) {
    if (event.persisted) notify();
  }

  // Compose with Next's existing wrappers; state, URL, exceptions and scroll are
  // owned by the caller. Native hash/history traversal bypasses these methods.
  history.pushState = pushState;
  history.replaceState = replaceState;
  window.addEventListener("popstate", checkUrl);
  window.addEventListener("hashchange", checkUrl);
  window.addEventListener("pageshow", restorePage);

  return () => {
    listener = null;
    window.removeEventListener("popstate", checkUrl);
    window.removeEventListener("hashchange", checkUrl);
    window.removeEventListener("pageshow", restorePage);
    // Another owner (e.g. Next) may have wrapped us since mounting. Do not
    // overwrite its method; a retained wrapper is inert after listener release.
    if (history.pushState === pushState) history.pushState = originalPush;
    if (history.replaceState === replaceState)
      history.replaceState = originalReplace;
  };
}
