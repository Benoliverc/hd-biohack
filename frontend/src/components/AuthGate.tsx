"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { clearSession, readSessionToken, readSessionUserId } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { RouteSkeleton } from "@/components/PageSkeleton";

const PUBLIC_PATHS = new Set(["/login", "/reset-password", "/privacy"]);

/**
 * Soft client gate: no session → /login.
 * /login is always allowed. Waits for sessionReady so we don't bounce while hydrating.
 * A signed-in visit to /login goes to /profile until a You natal is confirmed, then Today.
 * After sessionReady with no user (e.g. /auth/me 401), /login shows the public form.
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
  // Cover the form only while hydrating a stored token; once sessionReady && !user, show Sign in.
  const storedSessionHydrating =
    pathname === "/login" && Boolean(readSessionToken()) && !sessionReady;

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const token = readSessionToken();
    if (user || (sessionReady && !token)) {
      document.documentElement.removeAttribute("data-baseline-session-pending");
    }
  }, [pathname, user, sessionReady]);

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

  // Dead leftover token after a resolved 401 / sign-out: drop it so /login shows the form.
  useEffect(() => {
    if (!sessionReady || user) return;
    if (pathname !== "/login") return;
    if (readSessionToken() || readSessionUserId() != null) {
      clearSession();
    }
  }, [sessionReady, user, pathname]);

  // Avoid flashing protected UI before we know session state
  if (!sessionReady && !isPublic) {
    return <RouteSkeleton pathname={pathname} label={t("auth.loading")} />;
  }

  if (!isPublic && (!readSessionUserId() || !readSessionToken()) && !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-fg-muted">
        {t("auth.redirecting")}
      </div>
    );
  }

  if (signedInOnLogin || storedSessionHydrating) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-fg-muted">
        {t("auth.loading")}
      </div>
    );
  }

  return <>{children}</>;
}
