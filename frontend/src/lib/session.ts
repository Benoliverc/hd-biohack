/** Client session: opaque bearer token + cached user id (localStorage). */

export const SESSION_USER_KEY = "hd-biohack:session-user-id";
export const SESSION_TOKEN_KEY = "hd-biohack:session-token";

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

export function readSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeSessionToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token == null || token === "") localStorage.removeItem(SESSION_TOKEN_KEY);
    else localStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  writeSessionUserId(null);
  writeSessionToken(null);
}
