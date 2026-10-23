"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Activity, FlaskConical, LogOut, Orbit, Shield, Sparkles, UserRound } from "lucide-react";
import { useApp } from "@/lib/store";
import { isAdminUser } from "@/lib/admin";

const nav = [
  { href: "/", label: "Home", icon: Orbit, testId: "nav-home" },
  { href: "/profile", label: "Chart", icon: UserRound, testId: "nav-chart" },
  { href: "/transits", label: "Today", icon: Activity, testId: "nav-today" },
  { href: "/biohack", label: "Protocols", icon: FlaskConical, testId: "nav-protocols" },
  { href: "/soul", label: "Soul", icon: Sparkles, testId: "nav-soul" },
];

const showDevControls =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_SHOW_DEV_CONTROLS === "true";

function DevChrome() {
  const {
    users,
    user,
    setUserId,
    enforcePaywall,
    setEnforcePaywall,
    previewAsFree,
    setPreviewAsFree,
  } = useApp();

  return (
    <div className="flex flex-col gap-2 text-xs text-fg-secondary">
      <label className="flex min-h-10 items-center gap-2">
        <span className="shrink-0 text-fg-muted">Dev user</span>
        <select
          className="min-h-10 min-w-0 flex-1 rounded-lg border border-border bg-elevated px-2 py-2 text-fg"
          value={user?.id ?? ""}
          onChange={(e) => setUserId(Number(e.target.value))}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.display_name} ({u.subscription_tier})
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-h-10 items-center gap-1.5">
        <input
          type="checkbox"
          checked={enforcePaywall}
          onChange={(e) => setEnforcePaywall(e.target.checked)}
        />
        Enforce paywall
      </label>
      <label className="flex min-h-10 items-center gap-1.5">
        <input
          type="checkbox"
          checked={previewAsFree}
          onChange={(e) => setPreviewAsFree(e.target.checked)}
          disabled={!enforcePaywall}
        />
        Preview as Free
      </label>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { biohackingUnlocked, user, signOut } = useApp();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publish = () => {
      document.documentElement.style.setProperty(
        "--app-header-h",
        `${el.getBoundingClientRect().height}px`
      );
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    window.addEventListener("resize", publish);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", publish);
    };
  }, [pathname, user, biohackingUnlocked]);

  if (pathname === "/login") return null;

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 overflow-x-clip border-b border-border bg-canvas/80 backdrop-blur"
    >
      <div className="mx-auto max-w-6xl px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            title="Home"
            className="min-w-0 shrink truncate text-base font-semibold tracking-tight text-growth sm:text-lg"
          >
            Baseline
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 text-xs text-fg-muted sm:gap-2">
            {showDevControls && (
              <details className="relative">
                <summary className="flex min-h-10 cursor-pointer list-none items-center rounded-lg border border-border px-2.5 text-fg-muted hover:border-growth hover:text-fg-secondary [&::-webkit-details-marker]:hidden">
                  Dev
                </summary>
                <div className="absolute right-0 top-full z-50 mt-1 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-border bg-elevated p-3 shadow-soft">
                  <DevChrome />
                </div>
              </details>
            )}
            {user ? (
              <>
                <span className="hidden max-w-[7rem] truncate text-fg-secondary sm:inline" title={user.display_name}>
                  {user.display_name}
                </span>
                {isAdminUser(user) && (
                  <Link
                    href="/admin"
                    data-testid="nav-admin"
                    title="Admin usage"
                    className={`inline-flex min-h-10 items-center gap-1 rounded-lg border px-2.5 py-2.5 sm:px-3 ${
                      pathname === "/admin"
                        ? "border-growth/40 bg-growth/15 text-growth"
                        : "border-border text-fg-muted hover:border-growth hover:text-fg-secondary"
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" aria-hidden />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  type="button"
                  data-testid="sign-out"
                  className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-border px-2.5 py-2.5 hover:border-growth sm:px-3"
                  onClick={() => {
                    signOut();
                    router.replace("/login");
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="min-h-10 rounded-lg border border-border px-2.5 py-2.5 hover:border-growth sm:px-3"
                onClick={() =>
                  alert("Google OAuth via Supabase Auth — stub UI. Wire SUPABASE_* keys to enable.")
                }
              >
                <span className="sm:hidden">Sign in</span>
                <span className="hidden sm:inline">Sign in with Google</span>
              </button>
            )}
            <span
              className={`rounded-full px-2 py-1 ${
                biohackingUnlocked
                  ? "bg-growth/20 text-growth"
                  : "bg-energy/15 text-energy-ink"
              }`}
            >
              {biohackingUnlocked ? "Pro unlocked" : "Free tier"}
            </span>
          </div>
        </div>

        <nav className="mt-2 flex flex-wrap gap-1" aria-label="Primary">
          {nav.map(({ href, label, icon: Icon, testId }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                data-testid={testId}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs sm:gap-1.5 sm:px-3 sm:text-sm ${
                  active
                    ? "bg-growth/20 text-growth"
                    : "text-fg-muted hover:bg-sunken hover:text-fg"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
