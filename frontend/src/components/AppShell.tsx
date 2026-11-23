"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import {
  resetWindowScrollToTop,
  shouldResetScrollOnPrimaryTabChange,
} from "@/lib/primaryTabScroll";

/** Full-bleed on /login; gated content elsewhere. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const previousPathnameRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in history)) return;
    const prev = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => {
      history.scrollRestoration = prev;
    };
  }, []);

  // Primary-tab change: open at the top unless the URL has a hash to honor.
  useLayoutEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;
    if (
      !shouldResetScrollOnPrimaryTabChange(
        pathname,
        previousPathname,
        window.location.hash
      )
    ) {
      return;
    }
    resetWindowScrollToTop();
  }, [pathname]);

  if (isLogin) {
    return (
      <main className="min-h-screen">
        <AuthGate>{children}</AuthGate>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <AuthGate>{children}</AuthGate>
    </main>
  );
}
