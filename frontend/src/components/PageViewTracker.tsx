"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";

/** Primary nav paths only — matches Header.tsx / backend PAGE_PATHS. */
const TRACKED = new Set(["/", "/biohack", "/transits", "/profile", "/soul"]);

const DEBOUNCE_MS = 3000;

/**
 * Fires best-effort page_view on primary-nav pathname changes.
 * Debounces the same path ~3s (Strict Mode remount / rapid replace).
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const { user, sessionReady } = useApp();
  const lastRef = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    if (!sessionReady) return;
    const path = pathname || "/";
    // pathname from Next has no query/hash; still normalize trailing slash
    const norm =
      path !== "/" && path.endsWith("/") ? path.replace(/\/+$/, "") || "/" : path;
    if (!TRACKED.has(norm)) return;

    const now = Date.now();
    const last = lastRef.current;
    if (last && last.path === norm && now - last.at < DEBOUNCE_MS) return;
    lastRef.current = { path: norm, at: now };

    void api.recordPageView(norm, user?.id ?? null);
  }, [pathname, sessionReady, user?.id]);

  return null;
}
