/** Client session for soft-gated login (localStorage). */

export const SESSION_USER_KEY = "hd-biohack:session-user-id";

export function readSessionUserId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_USER_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function writeSessionUserId(id: number | null) {
  if (typeof window === "undefined") return;
  try {
    if (id == null) localStorage.removeItem(SESSION_USER_KEY);
    else localStorage.setItem(SESSION_USER_KEY, String(id));
  } catch {
    /* ignore */
  }
}
