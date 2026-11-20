/** Per-user, this-browser dismiss for the one-time Your usual confirm. No server flag. */
export const USUAL_CONFIRM_DISMISSED_KEY_PREFIX = "hd-biohack:usual-confirm-dismissed:";

export function usualConfirmDismissedKey(userId: number | string): string {
  return `${USUAL_CONFIRM_DISMISSED_KEY_PREFIX}${userId}`;
}

export function readUsualConfirmDismissed(userId: number | string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(usualConfirmDismissedKey(userId)) === "1";
  } catch {
    return false;
  }
}

export function writeUsualConfirmDismissed(userId: number | string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(usualConfirmDismissedKey(userId), "1");
  } catch {
    /* private mode / quota — still collapse in UI */
  }
}
