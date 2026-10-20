"use client";

import { usePathname } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";

/** Full-bleed on /login; gated content elsewhere. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

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
