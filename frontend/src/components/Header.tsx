"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Activity, FlaskConical, LogOut, Settings, Shield, Sparkles, UserRound } from "lucide-react";
import { useApp } from "@/lib/store";
import { isAdminUser } from "@/lib/admin";
import { useI18n } from "@/lib/i18n";
import { useLiteracyHowToReadOptional } from "@/components/LiteracyHowToReadContext";

const nav = [
  { href: "/transits", labelKey: "nav.today" as const, icon: Activity, testId: "nav-today" },
  { href: "/biohack", labelKey: "nav.protocols" as const, icon: FlaskConical, testId: "nav-protocols" },
  { href: "/profile", labelKey: "nav.chart" as const, icon: UserRound, testId: "nav-chart" },
  { href: "/soul", labelKey: "nav.soul" as const, icon: Sparkles, testId: "nav-soul" },
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
        Enforce paywall (legacy flag)
      </label>
      <p className="type-caption leading-snug text-fg-secondary">
        UI Free/Pro gating follows subscription_tier even when this is off.
      </p>
      <label className="flex min-h-10 items-center gap-1.5">
        <input
          type="checkbox"
          checked={previewAsFree}
          onChange={(e) => setPreviewAsFree(e.target.checked)}
        />
        Preview as Free
      </label>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, previewAsFree, signOut } = useApp();
  const { t } = useI18n();
  const headerRef = useRef<HTMLElement>(null);
  const howToRead = useLiteracyHowToReadOptional();
  const literacyRoute =
    pathname === "/profile" || pathname === "/soul" || pathname === "/transits";
  const showHowToRead = Boolean(literacyRoute && howToRead?.available);

  // Badge follows effective entitlement (BETA_FULL_ACCESS → unlocked) and Preview as Free.
  const tierIsPro =
    !previewAsFree &&
    Boolean(
      user?.biohacking_unlocked === true ||
        user?.biohacking_enabled ||
        user?.subscription_tier === "biohacker_pro"
    );
  const tierBadge = tierIsPro ? t("tier.pro") : t("tier.free");
  const showBetaChrome = Boolean(user && user.beta_full_access === true);

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
  }, [pathname, user, tierBadge]);

  if (pathname === "/login" || pathname === "/reset-password") return null;

  return (
    <header
      ref={headerRef}
      className="app-header sticky top-0 z-40 overflow-x-clip border-b border-border bg-canvas/80 backdrop-blur"
    >
      <div className="app-header-pad-x mx-auto max-w-6xl py-2">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            title={t("nav.home")}
            aria-label={t("nav.home")}
            aria-current={pathname === "/" ? "page" : undefined}
            data-testid="nav-wordmark"
            className="inline-flex min-h-11 min-w-0 shrink items-center truncate text-base font-semibold tracking-tight text-growth-ink sm:text-lg"
          >
            {t("brand.name")}
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 text-xs text-fg-secondary sm:gap-2">
            {showDevControls && (
              <details className="relative">
                <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-lg border border-border px-2.5 text-fg-secondary hover:border-growth hover:text-fg [&::-webkit-details-marker]:hidden">
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
                    title={t("nav.admin")}
                    className={`inline-flex min-h-11 items-center gap-1 rounded-lg border px-2.5 py-2.5 sm:px-3 ${
                      pathname === "/admin"
                        ? "border-growth/40 bg-growth/15 text-growth-ink"
                        : "border-border text-fg-secondary hover:border-growth hover:text-fg"
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" aria-hidden />
                    <span>{t("nav.admin")}</span>
                  </Link>
                )}
                <Link
                  href="/settings"
                  data-testid="nav-settings"
                  title={t("nav.settings")}
                  className={`inline-flex min-h-11 min-w-11 items-center gap-1 rounded-lg border px-2.5 py-2.5 sm:px-3 ${
                    pathname === "/settings" || pathname.startsWith("/settings/")
                      ? "border-growth/40 bg-growth/15 text-growth-ink"
                      : "border-border text-fg-secondary hover:border-growth hover:text-fg"
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">{t("nav.settings")}</span>
                </Link>
                <button
                  type="button"
                  data-testid="sign-out"
                  className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-border px-2.5 py-2.5 text-fg-secondary hover:border-growth hover:text-fg sm:px-3"
                  onClick={() => {
                    signOut();
                    router.replace("/login");
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden />
                  <span>{t("nav.signOut")}</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                data-testid="header-sign-in"
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-2.5 py-2.5 text-fg-secondary hover:border-growth hover:text-fg sm:px-3"
              >
                {t("nav.signIn")}
              </Link>
            )}
            {user && (
              <span
                data-testid="tier-badge"
                className={`rounded-full px-2 py-1 ${
                  tierIsPro
                    ? "bg-growth-soft text-growth-ink"
                    : "bg-energy/15 text-energy-ink"
                }`}
              >
                {tierBadge}
              </span>
            )}
          </div>
        </div>

        <nav
          className="mt-2 flex flex-nowrap items-center gap-1"
          aria-label={t("nav.primary")}
        >
          <div className="flex min-w-0 flex-1 flex-nowrap gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nav.map(({ href, labelKey, icon: Icon, testId }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                data-testid={testId}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs sm:gap-1.5 sm:px-3 sm:text-sm ${
                  active
                    ? "border-growth/40 bg-growth-soft font-medium text-growth-ink"
                    : "border-transparent text-fg-secondary hover:bg-sunken hover:text-fg"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{t(labelKey)}</span>
              </Link>
            );
          })}
          </div>
          {literacyRoute ? (
            <div className="shrink-0">
              {showHowToRead ? (
                <button
                  type="button"
                  data-testid="nav-how-to-read"
                  onClick={(e) =>
                    howToRead?.open({ returnFocus: e.currentTarget })
                  }
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-transparent px-2 py-2 text-xs font-medium text-fg hover:bg-sunken hover:text-growth-ink sm:px-3 sm:text-sm"
                >
                  {t("nav.howToRead")}
                </button>
              ) : (
                <span
                  className="pointer-events-none invisible inline-flex min-h-11 select-none items-center justify-center px-2 py-2 text-xs font-medium sm:px-3 sm:text-sm"
                  aria-hidden
                >
                  {t("nav.howToRead")}
                </span>
              )}
            </div>
          ) : null}
        </nav>
      </div>
      {showBetaChrome && (
        <p
          className="app-header-pad-x border-t border-border/60 bg-growth-soft/40 py-1.5 text-center type-caption text-fg-secondary"
          data-testid="beta-chrome-note"
        >
          {t("beta.chromeNote")}
        </p>
      )}
    </header>
  );
}
