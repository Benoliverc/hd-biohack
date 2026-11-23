/** Primary app tabs: Today, Protocols, Chart, Soul. */
export const PRIMARY_TAB_PATHS = ["/transits", "/biohack", "/profile", "/soul"] as const;

export type PrimaryTabPath = (typeof PRIMARY_TAB_PATHS)[number];

export function isPrimaryTabPath(
  pathname: string | null | undefined
): pathname is PrimaryTabPath {
  return (PRIMARY_TAB_PATHS as readonly string[]).includes(pathname ?? "");
}

/**
 * Reset window scroll when arriving at a primary tab, unless the URL has a
 * hash (in-page deep links, /profile?new=person#people-form, /biohack#stack).
 * Open Chart ?person=<id> has no hash and should open at the top.
 */
export function shouldResetScrollOnPrimaryTabChange(
  pathname: string,
  previousPathname: string | null,
  hash: string
): boolean {
  if (!isPrimaryTabPath(pathname)) return false;
  if (previousPathname === pathname) return false;
  if (hash.replace(/^#/, "").length > 0) return false;
  return true;
}

export function resetWindowScrollToTop(): void {
  window.scrollTo(0, 0);
}
