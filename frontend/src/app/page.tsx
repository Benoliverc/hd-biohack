"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Activity, FlaskConical, Sparkles, UserRound } from "lucide-react";
import { useApp } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { DEFAULT_PROTOCOLS_TZ } from "@/lib/protocolCompletions";

type Daypart = "morning" | "afternoon" | "evening";

function hourInZone(timeZone: string, now = new Date()): number | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      hourCycle: "h23",
    }).formatToParts(now);
    const raw = parts.find((p) => p.type === "hour")?.value;
    const hour = raw == null ? NaN : Number(raw);
    return Number.isFinite(hour) ? hour : null;
  } catch {
    return null;
  }
}

function daypartInZone(timeZone: string): Daypart {
  const hour = hourInZone(timeZone);
  if (hour == null) return "morning";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default function HomePage() {
  const { user, natalChart, natalBindingLoading, biohackingUnlocked } = useApp();
  const { t } = useI18n();
  const ready = !natalBindingLoading;
  const hasChart = ready && Boolean(natalChart);

  const firstName = user?.first_name?.trim() || "";
  const greeting = useMemo(() => {
    if (!firstName) return null;
    const zone =
      user?.preferred_timezone?.trim() || DEFAULT_PROTOCOLS_TZ;
    const part = daypartInZone(zone);
    const key =
      part === "morning"
        ? "home.greeting.morning"
        : part === "afternoon"
          ? "home.greeting.afternoon"
          : "home.greeting.evening";
    return t(key, { name: firstName });
  }, [firstName, user?.preferred_timezone, t]);

  const chartLabel = natalChart?.label?.trim() || t("common.me");
  const chipParts = [
    natalChart?.label?.trim() || t("common.me"),
    natalChart?.birth_city?.trim(),
    natalChart?.birth_date?.trim(),
  ].filter(Boolean);
  const chipText = chipParts.join(" · ");

  return (
    <div className="space-y-8 pb-4">
      {/* Hero */}
      <section className="rounded-3xl border border-border bg-elevated p-6 shadow-soft sm:p-8">
        <p className="mb-2 type-chip tracking-[0.12em] text-growth">
          {t("home.eyebrow")}
        </p>

        {natalBindingLoading ? (
          <div className="space-y-3" aria-busy="true" aria-live="polite">
            <div className="h-9 w-11/12 max-w-md animate-pulse rounded-lg bg-sunken sm:h-10" />
            <div className="h-4 w-full max-w-xl animate-pulse rounded bg-sunken" />
          </div>
        ) : (
          <>
            <h1
              className="mb-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl md:leading-tight"
              data-testid={greeting ? "home-greeting" : "home-title"}
            >
              {greeting
                ? greeting
                : hasChart
                  ? t("home.title.hasChart")
                  : t("home.title.noChart")}
            </h1>
            {greeting && (
              <p className="mb-2 text-base font-medium text-fg sm:text-lg">
                {hasChart
                  ? t("home.title.hasChart")
                  : t("home.title.noChart")}
              </p>
            )}
            <p className="max-w-2xl text-fg-secondary">
              {hasChart
                ? biohackingUnlocked
                  ? t("home.blurb.pro")
                  : t("home.blurb.free")
                : t("home.blurb.noChart")}
            </p>
            <div className="mt-3 space-y-1 type-body text-fg" data-testid="home-path">
              <p>{t("home.path.today")}</p>
              <p>{t("home.path.protocols")}</p>
              <p>{t("home.path.chart")}</p>
              <p>{t("home.path.soul")}</p>
            </div>
          </>
        )}

        {/* One filled growth primary per state — returners go to Today; no Protocols-first flash while loading. */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {natalBindingLoading ? (
            <div
              className="inline-flex h-10 w-full animate-pulse rounded-xl bg-growth/30 sm:w-40"
              aria-hidden
              data-testid="home-calculate-chart-skeleton"
            />
          ) : !hasChart ? (
            <>
              <Link
                href="/profile"
                data-testid="home-calculate-chart"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep sm:w-auto"
              >
                {t("home.cta.calculate")}
              </Link>
              <Link
                href="/transits"
                data-testid="home-secondary-sky"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm text-fg hover:border-energy sm:w-auto"
              >
                {t("home.cta.seeSky")}
              </Link>
            </>
          ) : biohackingUnlocked ? (
            <>
              <Link
                href="/transits"
                data-testid="home-primary-today"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep sm:w-auto"
              >
                {t("home.cta.seeTodaysMove")}
              </Link>
              <Link
                href="/biohack"
                data-testid="home-secondary-protocols"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm text-fg hover:border-energy sm:w-auto"
              >
                {t("home.cta.openProtocols")}
              </Link>
              <Link
                href="/profile"
                data-testid="home-open-chart"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium text-fg-secondary underline-offset-2 hover:underline sm:w-auto"
              >
                {t("home.cta.openChart")}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/transits"
                data-testid="home-primary-today"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep sm:w-auto"
              >
                {t("home.cta.todaysSky")}
              </Link>
              <Link
                href="/profile"
                data-testid="home-calculate-chart"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm text-fg hover:border-growth sm:w-auto"
              >
                {t("home.cta.openYourChart")}
              </Link>
              <Link
                href="/biohack"
                data-testid="home-view-protocols-ghost"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium text-fg-secondary underline-offset-2 hover:underline sm:w-auto"
              >
                {t("home.cta.protocolsPro")}
              </Link>
            </>
          )}
        </div>

        {/* Continue strip — You chip only (no second growth fill) */}
        {hasChart && natalChart ? (
          <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-border bg-canvas px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex max-w-full items-center truncate rounded-full border border-border bg-elevated px-3 py-1.5 font-medium shadow-sm">
                {chipText}
              </span>
              <Link
                href="/profile"
                className="shrink-0 text-sm font-medium text-fg-secondary underline-offset-2 hover:underline"
              >
                {t("common.change")}
              </Link>
            </div>
            <p className="type-caption text-fg-secondary">
              {biohackingUnlocked
                ? t("home.morning.pro")
                : t("home.morning.free")}
            </p>
          </div>
        ) : null}
      </section>

      {/* Outcome cards — Today · Protocols · Chart · Soul, one shared structure */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            href: "/transits",
            testId: "home-card-today",
            icon: Activity,
            title: t("home.outcome.today.title"),
            body: t("home.outcome.today.body"),
            b1: t("home.outcome.today.b1"),
            b2: t("home.outcome.today.b2"),
            status: !ready
              ? "…"
              : hasChart
                ? t("home.status.ready")
                : t("home.status.needsChart"),
          },
          {
            href: "/biohack",
            testId: "home-view-protocols",
            icon: FlaskConical,
            title: t("home.outcome.protocols.title"),
            body: t("home.outcome.protocols.body"),
            b1: t("home.outcome.protocols.b1"),
            b2: t("home.outcome.protocols.b2"),
            status: !ready
              ? "…"
              : !hasChart
                ? t("home.status.needsChart")
                : biohackingUnlocked
                  ? t("home.status.ready")
                  : t("home.status.proUnlock"),
          },
          {
            href: "/profile",
            testId: "home-card-chart",
            icon: UserRound,
            title: t("home.outcome.chart.title"),
            body: t("home.outcome.chart.body"),
            b1: t("home.outcome.chart.b1"),
            b2: t("home.outcome.chart.b2"),
            status: !ready
              ? "…"
              : hasChart
                ? natalChart?.label?.trim()
                  ? chartLabel
                  : t("home.status.saved")
                : t("home.status.notSaved"),
          },
          {
            href: "/soul",
            testId: "home-card-soul",
            icon: Sparkles,
            title: t("home.outcome.soul.title"),
            body: t("home.outcome.soul.body"),
            b1: t("home.outcome.soul.b1"),
            b2: t("home.outcome.soul.b2"),
            status: !ready
              ? "…"
              : !hasChart
                ? t("home.status.needsChart")
                : biohackingUnlocked
                  ? t("home.status.ready")
                  : t("home.status.proUnlock"),
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              data-testid={card.testId}
              className="group flex flex-col rounded-2xl border border-border bg-elevated p-5 shadow-soft transition hover:border-growth/50"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-sunken text-growth">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2 className="type-section text-fg group-hover:text-growth-deep">
                  {card.title}
                </h2>
                <span className="type-chip inline-flex items-center rounded-full border border-border bg-sunken px-2 py-0.5 font-medium text-fg-secondary">
                  {card.status}
                </span>
              </div>
              <div className="type-body text-fg-secondary">
                <p>{card.body}</p>
                <ul className="mt-2 list-disc space-y-0.5 pl-4">
                  <li>{card.b1}</li>
                  <li>{card.b2}</li>
                </ul>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Thin trust line */}
      <p className="text-center type-body text-fg-secondary">
        {t("home.trust.line")}
        <span className="mt-1 block text-xs text-fg-secondary/80">
          {t("home.trust.disclaimer")}
        </span>
      </p>
    </div>
  );
}
