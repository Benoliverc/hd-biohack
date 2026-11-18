/** Client session: opaque bearer token + cached user id (localStorage). */

export const SESSION_USER_KEY = "hd-biohack:session-user-id";
export const SESSION_TOKEN_KEY = "hd-biohack:session-token";

/** Host-only presence flag for middleware. Value is always "1", never a token copy. */
export const SESSION_PRESENCE_COOKIE = "baseline_signed_in";
const SESSION_PRESENCE_MAX_AGE_SEC = 400 * 24 * 60 * 60;

function writePresenceCookie(present: boolean) {
  if (typeof document === "undefined") return;
  try {
    const parts = [
      present ? "baseline_signed_in=1" : "baseline_signed_in=",
      "Path=/",
      "SameSite=Lax",
      `Max-Age=${present ? SESSION_PRESENCE_MAX_AGE_SEC : 0}`,
    ];
    if (typeof window !== "undefined" && window.location.protocol === "https:") {
      parts.push("Secure");
    }
    document.cookie = parts.join("; ");
  } catch {
    /* ignore */
  }
}

/** Align the presence cookie with whatever token is already in localStorage. */
export function syncSessionPresenceCookie() {
  writePresenceCookie(Boolean(readSessionToken()));
}

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
    if (token == null || token === "") {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      writePresenceCookie(false);
    } else {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      writePresenceCookie(true);
    }
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  writeSessionUserId(null);
  writeSessionToken(null);
  writePresenceCookie(false);
}
