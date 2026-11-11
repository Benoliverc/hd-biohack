/** Per-user, this-browser dismiss for the first-week Today kit setup. No server flag. */
export const KIT_SETUP_DISMISSED_KEY_PREFIX = "hd-biohack:kit-setup-dismissed:";

export function kitSetupDismissedKey(userId: number | string): string {
  return `${KIT_SETUP_DISMISSED_KEY_PREFIX}${userId}`;
}

export function readKitSetupDismissed(userId: number | string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(kitSetupDismissedKey(userId)) === "1";
  } catch {
    return false;
  }
}

export function writeKitSetupDismissed(userId: number | string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(kitSetupDismissedKey(userId), "1");
  } catch {
    /* private mode / quota — still collapse in UI */
  }
}
