"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { readSessionUserId } from "@/lib/session";

const PUBLIC_PATHS = new Set(["/login"]);

/**
 * Soft client gate: no session → /login.
 * /login is always allowed. Waits for sessionReady so we don't bounce while hydrating.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sessionReady, user } = useApp();
  const isPublic = PUBLIC_PATHS.has(pathname);

  useEffect(() => {
    if (!sessionReady) return;
    const sessionId = readSessionUserId();
    if (!sessionId && !isPublic) {
      router.replace("/login");
      return;
    }
    // Already signed in visiting /login → home
    if (sessionId && user && pathname === "/login") {
      router.replace("/");
    }
  }, [sessionReady, user, pathname, isPublic, router]);

  // Avoid flashing protected UI before we know session state
  if (!sessionReady && !isPublic) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-fg-muted">
        Loading…
      </div>
    );
  }

  if (!isPublic && !readSessionUserId() && !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-fg-muted">
        Redirecting to sign in…
      </div>
    );
  }

  return <>{children}</>;
}
