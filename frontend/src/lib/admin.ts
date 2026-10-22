/**
 * Client admin gate — mirrors backend ADMIN_EMAILS / User.is_admin.
 * Prefer API `is_admin` when present; fall back to allowlist so the Header
 * link still shows when production API predates the is_admin field.
 */

/** Same default as backend Settings.admin_emails (seed Benjamin + real email). */
export const DEFAULT_ADMIN_EMAILS = [
  "benjaminlammens@gmail.com",
  "benjamin@test.hd-biohack.local",
] as const;

function allowlistFromEnv(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Emails that unlock the discreet Admin nav link (and /admin UI gate). */
export function adminEmailAllowlist(): string[] {
  const fromEnv = allowlistFromEnv();
  if (fromEnv.length) return fromEnv;
  return DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase());
}

export function isAdminUser(
  user: { email?: string | null; is_admin?: boolean } | null | undefined
): boolean {
  if (!user) return false;
  if (user.is_admin === true) return true;
  const email = (user.email || "").trim().toLowerCase();
  if (!email) return false;
  return adminEmailAllowlist().includes(email);
}
