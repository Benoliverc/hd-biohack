"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { readSessionToken, readSessionUserId } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

const PUBLIC_PATHS = new Set(["/login", "/reset-password", "/privacy"]);

/**
 * Soft client gate: no session → /login.
 * /login is always allowed. Waits for sessionReady so we don't bounce while hydrating.
 * A signed-in visit to /login goes to /profile until a You natal is confirmed, then Today.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sessionReady, user, natalChart, natalBindingLoading } = useApp();
  const { t } = useI18n();
  const isPublic = PUBLIC_PATHS.has(pathname);
  const signedInOnLogin = Boolean(
    sessionReady && user && pathname === "/login" && readSessionUserId() && readSessionToken()
  );

  useEffect(() => {
    if (!sessionReady) return;
    const sessionId = readSessionUserId();
    const token = readSessionToken();
    if ((!sessionId || !token) && !isPublic) {
      router.replace("/login");
      return;
    }
    // Already signed in visiting /login → Chart if no You natal, Today if there is one.
    // Wait until the You-chart bind is known so returners do not flash Chart, and
    // first-run accounts never flash Today or Home. Password-reset stays reachable.
    if (sessionId && user && pathname === "/login") {
      if (natalBindingLoading) return;
      router.replace(natalChart ? "/transits" : "/profile");
    }
  }, [sessionReady, user, pathname, isPublic, router, natalChart, natalBindingLoading]);

  // Avoid flashing protected UI before we know session state
  if (!sessionReady && !isPublic) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-fg-muted">
        {t("auth.loading")}
      </div>
    );
  }

  if (!isPublic && (!readSessionUserId() || !readSessionToken()) && !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-fg-muted">
        {t("auth.redirecting")}
      </div>
    );
  }

  if (signedInOnLogin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-fg-muted">
        {t("auth.loading")}
      </div>
    );
  }

  return <>{children}</>;
}
