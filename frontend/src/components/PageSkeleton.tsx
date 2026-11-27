"use client";

import { useI18n, type MessageKey } from "@/lib/i18n";

/** Grey block. Pulse only when the user has not asked for reduced motion. */
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={"motion-safe:animate-pulse bg-sunken " + className}
    />
  );
}

function useSkeletonLabel(label: string | undefined, key: MessageKey): string {
  const { t } = useI18n();
  return label ?? t(key);
}

function SkeletonStatus({
  testId,
  label,
  className,
  children,
}: {
  testId: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      data-testid={testId}
      className={className}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Home hero card. Outer spacing matches `app/page.tsx` (`space-y-8 pb-4`). */
export function HomeSkeleton({ label }: { label?: string }) {
  const text = useSkeletonLabel(label, "auth.loading");
  return (
    <SkeletonStatus testId="skeleton-home" label={text} className="space-y-8 pb-4">
      <div className="rounded-3xl border border-border bg-elevated p-6 shadow-soft sm:p-8">
        <SkeletonBlock className="mb-2 h-3 w-24 rounded" />
        <div className="space-y-3">
          <SkeletonBlock className="h-9 w-11/12 max-w-md rounded-lg sm:h-10" />
          <SkeletonBlock className="h-4 w-full max-w-xl rounded" />
        </div>
        <SkeletonBlock className="mt-6 h-10 w-full rounded-xl sm:w-40" />
      </div>
    </SkeletonStatus>
  );
}

/** Single column, matching `/transits` (`space-y-6`, no top-level two-column split). */
export function TodaySkeleton({ label }: { label?: string }) {
  const text = useSkeletonLabel(label, "auth.loading");
  return (
    <SkeletonStatus testId="skeleton-today" label={text} className="space-y-6">
      <SkeletonBlock className="h-7 w-40 rounded-lg" />
      <SkeletonBlock className="h-40 rounded-2xl" />
      <SkeletonBlock className="h-4 w-2/3 rounded" />
      <SkeletonBlock className="h-4 w-1/2 rounded" />
      <SkeletonBlock className="h-24 rounded-2xl" />
      <div className="grid gap-6 md:grid-cols-2">
        <SkeletonBlock className="h-20 rounded-xl" />
        <SkeletonBlock className="h-20 rounded-xl" />
      </div>
    </SkeletonStatus>
  );
}

/** Protocols page. Outer spacing matches `app/biohack/page.tsx` (`space-y-5`). */
export function ProtocolsSkeleton({ label }: { label?: string }) {
  const text = useSkeletonLabel(label, "auth.loading");
  return (
    <SkeletonStatus testId="skeleton-protocols" label={text} className="space-y-5">
      <SkeletonBlock className="h-7 w-36 rounded-lg" />
      <div className="space-y-3">
        <SkeletonBlock className="h-16 rounded-2xl" />
        <SkeletonBlock className="h-40 rounded-2xl" />
        <SkeletonBlock className="h-24 rounded-2xl" />
      </div>
    </SkeletonStatus>
  );
}

/** v9 Chart page, used as the profile Suspense fallback. */
export function ChartSkeleton({ label }: { label?: string }) {
  const text = useSkeletonLabel(label, "chart.people.loadingSavedChart");
  return (
    <SkeletonStatus testId="skeleton-chart" label={text} className="space-y-6">
      <div>
        <SkeletonBlock className="h-7 w-28 rounded-lg" />
        <SkeletonBlock className="mt-1 h-4 w-64 max-w-full rounded" />
      </div>
      <div className="flex flex-wrap gap-2">
        <SkeletonBlock className="h-10 w-28 rounded-full" />
        <SkeletonBlock className="h-10 w-28 rounded-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)]">
        <SkeletonBlock className="aspect-[3/4] w-full max-w-[640px] rounded-2xl" />
        <div className="space-y-4">
          <SkeletonBlock className="h-20 rounded-xl" />
          <SkeletonBlock className="h-20 rounded-xl" />
          <SkeletonBlock className="h-20 rounded-xl" />
        </div>
      </div>
    </SkeletonStatus>
  );
}

/** In-place replacement for the saved-chart loading box. */
export function ChartFormSkeleton({ label }: { label?: string }) {
  const text = useSkeletonLabel(label, "chart.people.loadingSavedChart");
  return (
    <SkeletonStatus
      testId="skeleton-chart-form"
      label={text}
      className="rounded-xl border border-border bg-elevated px-4 py-3"
    >
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-1/2 rounded" />
        <SkeletonBlock className="h-10 w-full rounded-lg" />
      </div>
    </SkeletonStatus>
  );
}

/** Quiet bar while the account request is still in flight and has not failed. */
export function ChartAccountSkeleton({ label }: { label?: string }) {
  const text = useSkeletonLabel(label, "chart.people.loadingAccount");
  return (
    <SkeletonStatus testId="skeleton-chart-account" label={text}>
      <SkeletonBlock className="h-4 w-40 rounded" />
    </SkeletonStatus>
  );
}

/** Saved-charts wait on Soul. Testid stays `soul-loading`. */
export function SoulSkeleton({
  label,
  "data-testid": testId = "soul-loading",
}: {
  label?: string;
  "data-testid"?: string;
}) {
  const text = useSkeletonLabel(label, "soul.chrome.loadingCharts");
  return (
    <SkeletonStatus testId={testId} label={text} className="space-y-6">
      <div className="rounded-2xl border border-border bg-elevated p-5">
        <SkeletonBlock className="h-3 w-28 rounded" />
        <SkeletonBlock className="mt-2 h-8 w-2/3 rounded-lg" />
        <SkeletonBlock className="mt-3 h-4 w-full rounded" />
        <SkeletonBlock className="mt-2 h-4 w-5/6 rounded" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonBlock className="h-28 rounded-2xl" />
        <SkeletonBlock className="h-28 rounded-2xl" />
      </div>
    </SkeletonStatus>
  );
}

/** Settings, password, and delete-account. Container matches those pages. */
export function SettingsSkeleton({ label }: { label?: string }) {
  const text = useSkeletonLabel(label, "common.loading");
  return (
    <SkeletonStatus
      testId="skeleton-settings"
      label={text}
      className="mx-auto max-w-lg space-y-6"
    >
      <div>
        <SkeletonBlock className="h-7 w-32 rounded-lg" />
        <SkeletonBlock className="mt-1 h-4 w-56 max-w-full rounded" />
      </div>
      <SkeletonBlock className="h-14 rounded-xl" />
      <SkeletonBlock className="h-14 rounded-xl" />
      <SkeletonBlock className="h-14 rounded-xl" />
    </SkeletonStatus>
  );
}

export function GenericPageSkeleton({ label }: { label?: string }) {
  const text = useSkeletonLabel(label, "auth.loading");
  return (
    <SkeletonStatus testId="skeleton-page" label={text} className="space-y-6">
      <SkeletonBlock className="h-7 w-40 rounded-lg" />
      <SkeletonBlock className="h-32 rounded-2xl" />
      <SkeletonBlock className="h-32 rounded-2xl" />
    </SkeletonStatus>
  );
}

function routeKind(pathname: string):
  | "home"
  | "today"
  | "protocols"
  | "chart"
  | "soul"
  | "settings"
  | "generic" {
  if (pathname === "/") return "home";
  if (pathname === "/transits") return "today";
  if (pathname === "/biohack") return "protocols";
  if (pathname === "/profile") return "chart";
  if (pathname === "/soul") return "soul";
  if (pathname === "/settings" || pathname.startsWith("/settings/")) return "settings";
  return "generic";
}

/** Page-shaped cover for a signed-in route until the session is known. */
export function RouteSkeleton({
  pathname,
  label,
}: {
  pathname: string;
  label: string;
}) {
  switch (routeKind(pathname)) {
    case "home":
      return <HomeSkeleton label={label} />;
    case "today":
      return <TodaySkeleton label={label} />;
    case "protocols":
      return <ProtocolsSkeleton label={label} />;
    case "chart":
      return <ChartSkeleton label={label} />;
    case "soul":
      return <SoulSkeleton label={label} />;
    case "settings":
      return <SettingsSkeleton label={label} />;
    default:
      return <GenericPageSkeleton label={label} />;
  }
}
