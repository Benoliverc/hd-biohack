"use client";

import Link from "next/link";
import { Activity, FlaskConical, Sparkles, UserRound } from "lucide-react";
import { useApp } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { natalChart, natalBindingLoading, biohackingUnlocked } = useApp();
  const { t } = useI18n();
  const ready = !natalBindingLoading;
  const hasChart = ready && Boolean(natalChart);

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
        <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-growth">
          {t("home.eyebrow")}
        </p>

        {natalBindingLoading ? (
          <div className="space-y-3" aria-busy="true" aria-live="polite">
            <div className="h-9 w-11/12 max-w-md animate-pulse rounded-lg bg-sunken sm:h-10" />
            <div className="h-4 w-full max-w-xl animate-pulse rounded bg-sunken" />
          </div>
        ) : (
          <>
            <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl md:leading-tight">
              {hasChart
                ? t("home.title.hasChart")
                : t("home.title.noChart")}
            </h1>
            <p className="max-w-2xl text-fg-secondary">
              {hasChart
                ? biohackingUnlocked
                  ? t("home.blurb.pro")
                  : t("home.blurb.free")
                : t("home.blurb.noChart")}
            </p>
            <p className="mt-2 text-xs font-medium tracking-wide text-fg-secondary">
              {t("home.path")}
            </p>
          </>
        )}

        {/* One filled growth primary per state — returners: Protocols (Pro) or Today’s sky (Free); Chart ghost. */}
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
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm text-fg hover:border-energy sm:w-auto"
              >
                {t("home.cta.seeSky")}
              </Link>
            </>
          ) : biohackingUnlocked ? (
            <>
              <Link
                href="/biohack"
                data-testid="home-primary-protocols"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep sm:w-auto"
              >
                {t("home.cta.openProtocols")}
              </Link>
              <Link
                href="/transits"
                data-testid="home-secondary-today"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm text-fg hover:border-energy sm:w-auto"
              >
                {t("home.cta.todaysSky")}
              </Link>
              <Link
                href="/profile"
                data-testid="home-calculate-chart"
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
            <p className="text-[11px] text-fg-secondary">
              {biohackingUnlocked
                ? t("home.morning.pro")
                : t("home.morning.free")}
            </p>
          </div>
        ) : null}
      </section>

      {/* Outcome cards — Protocols · Today · Chart · Soul */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/biohack"
          data-testid="home-view-protocols"
          className="group flex flex-col rounded-2xl border border-border bg-elevated p-5 shadow-soft transition hover:border-growth/50"
        >
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-sunken text-growth">
            <FlaskConical className="h-5 w-5" aria-hidden />
          </span>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-fg group-hover:text-growth-deep">
              {t("home.outcome.protocols.title")}
            </h2>
            <span className="inline-flex items-center rounded-full border border-border bg-sunken px-2 py-0.5 text-[11px] font-medium text-fg-secondary">
              {!ready
                ? "…"
                : !hasChart
                  ? t("home.status.needsChart")
                  : biohackingUnlocked
                    ? t("home.status.ready")
                    : t("home.status.proUnlock")}
            </span>
          </div>
          <div className="text-sm text-fg-secondary">
            <p>{t("home.outcome.protocols.body")}</p>
            <ul className="mt-2 list-disc space-y-0.5 pl-4">
              <li>{t("home.outcome.protocols.b1")}</li>
              <li>{t("home.outcome.protocols.b2")}</li>
            </ul>
          </div>
        </Link>

        <Link
          href="/transits"
          className="group flex flex-col rounded-2xl border border-border bg-elevated p-5 shadow-soft transition hover:border-energy"
          data-testid="home-card-today"
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-energy-ink">
            {t("home.card.today")}
          </p>
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-energy/15 text-energy-ink">
            <Activity className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="mb-1 font-semibold text-fg group-hover:text-growth-deep">
            {t("home.outcome.today.title")}
          </h2>
          <div className="text-sm text-fg-secondary">
            <p>{t("home.outcome.today.body")}</p>
            <ul className="mt-2 list-disc space-y-0.5 pl-4">
              <li>{t("home.outcome.today.b1")}</li>
              <li>{t("home.outcome.today.b2")}</li>
            </ul>
          </div>
        </Link>

        <Link
          href="/profile"
          className="group flex flex-col rounded-2xl border border-border bg-elevated p-5 shadow-soft transition hover:border-growth/50"
          data-testid="home-card-chart"
        >
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-sunken text-growth">
            <UserRound className="h-5 w-5" aria-hidden />
          </span>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-fg group-hover:text-growth-deep">
              {t("home.outcome.chart.title")}
            </h2>
            <span className="inline-flex items-center rounded-full border border-border bg-sunken px-2 py-0.5 text-[11px] font-medium text-fg-secondary">
              {!ready
                ? "…"
                : hasChart
                  ? natalChart?.label?.trim()
                    ? chartLabel
                    : t("home.status.saved")
                  : t("home.status.notSaved")}
            </span>
          </div>
          <div className="text-sm text-fg-secondary">
            <p>{t("home.outcome.chart.body")}</p>
            <ul className="mt-2 list-disc space-y-0.5 pl-4">
              <li>{t("home.outcome.chart.b1")}</li>
              <li>{t("home.outcome.chart.b2")}</li>
            </ul>
          </div>
        </Link>

        <Link
          href="/soul"
          className="group flex flex-col rounded-2xl border border-border bg-elevated p-5 shadow-soft transition hover:border-growth/50"
          data-testid="home-card-soul"
        >
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-sunken text-growth">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-fg group-hover:text-growth-deep">
              {t("home.outcome.soul.title")}
            </h2>
            <span className="inline-flex items-center rounded-full border border-border bg-sunken px-2 py-0.5 text-[11px] font-medium text-fg-secondary">
              {!ready
                ? "…"
                : !hasChart
                  ? t("home.status.needsChart")
                  : biohackingUnlocked
                    ? t("home.status.ready")
                    : t("home.status.proUnlock")}
            </span>
          </div>
          <div className="text-sm text-fg-secondary">
            <p>{t("home.outcome.soul.body")}</p>
            <ul className="mt-2 list-disc space-y-0.5 pl-4">
              <li>{t("home.outcome.soul.b1")}</li>
              <li>{t("home.outcome.soul.b2")}</li>
            </ul>
          </div>
        </Link>
      </div>

      {/* Thin trust line */}
      <p className="text-center text-sm text-fg-secondary">
        {t("home.trust.line")}
        <span className="mt-1 block text-xs text-fg-secondary/80">
          {t("home.trust.disclaimer")}
        </span>
      </p>
    </div>
  );
}
