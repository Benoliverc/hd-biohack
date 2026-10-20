"use client";

import Link from "next/link";
import { Activity, FlaskConical, UserRound } from "lucide-react";
import { useApp } from "@/lib/store";

export default function HomePage() {
  const { natalChart, natalBindingLoading, biohackingUnlocked } = useApp();
  const ready = !natalBindingLoading;
  const hasChart = ready && Boolean(natalChart);

  const chartLabel = natalChart?.label?.trim() || "Me";
  const chipParts = [
    natalChart?.label?.trim() || "Me",
    natalChart?.birth_city?.trim(),
    natalChart?.birth_date?.trim(),
  ].filter(Boolean);
  const chipText = chipParts.join(" · ");

  return (
    <div className="space-y-8 pb-4">
      {/* Hero */}
      <section className="rounded-3xl border border-border bg-elevated p-6 sm:p-8">
        <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-growth">
          Human Design · daily protocols
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
                ? "Continue with your chart"
                : "Know your chart. Run today with it."}
            </h1>
            <p className="max-w-2xl text-fg-muted">
              {hasChart
                ? "Chart and today’s gates stay free."
                : "Save your natal chart free. Today’s gates stay free. Protocols unlock with Pro when you’re ready."}
            </p>
          </>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {natalBindingLoading ? (
            <div
              className="inline-flex h-10 w-full animate-pulse rounded-xl bg-growth/30 sm:w-40"
              aria-hidden
              data-testid="home-calculate-chart-skeleton"
            />
          ) : (
            <Link
              href="/profile"
              data-testid="home-calculate-chart"
              className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep sm:w-auto"
            >
              {hasChart ? "Open your chart" : "Calculate my chart"}
            </Link>
          )}
          <Link
            href="/transits"
            className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm hover:border-energy sm:w-auto"
          >
            {hasChart ? "Today’s gates" : "See today’s gates"}
          </Link>
        </div>

        {/* Continue strip — has-chart only */}
        {hasChart && natalChart ? (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-growth/30 bg-growth-soft/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex max-w-full items-center truncate rounded-full border border-border bg-elevated px-3 py-1.5 font-medium shadow-sm">
                {chipText}
              </span>
              <Link
                href="/profile"
                className="shrink-0 text-sm font-medium text-growth underline-offset-2 hover:underline"
              >
                Change
              </Link>
            </div>
            <Link
              href="/biohack"
              className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-border bg-elevated px-3.5 py-2 text-sm hover:border-growth sm:w-auto"
            >
              Generate today’s protocol
            </Link>
          </div>
        ) : null}
      </section>

      {/* Outcome cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/profile"
          className="group flex flex-col rounded-2xl border border-border bg-elevated p-5 transition hover:border-growth/50"
        >
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-growth-soft text-growth">
            <UserRound className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="mb-1 font-semibold text-growth group-hover:text-growth-deep">
            Your blueprint
          </h2>
          <p className="flex-1 text-sm text-fg-muted">
            Type, authority, centers, gates — the map everything else uses.
          </p>
          <p className="mt-3 text-xs font-medium text-fg-muted">
            {!ready
              ? "…"
              : hasChart
                ? natalChart?.label?.trim()
                  ? chartLabel
                  : "Saved"
                : "Not saved yet"}
          </p>
        </Link>

        <Link
          href="/transits"
          className="group flex flex-col rounded-2xl border border-border bg-elevated p-5 transition hover:border-energy"
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-energy-ink">
            Today
          </p>
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-energy/15 text-energy-ink">
            <Activity className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="mb-1 font-semibold text-growth group-hover:text-growth-deep">
            What’s active now
          </h2>
          <p className="flex-1 text-sm text-fg-muted">
            Today’s gates in your natal timezone.
          </p>
        </Link>

        <Link
          href="/biohack"
          data-testid="home-view-protocols"
          className="group flex flex-col rounded-2xl border border-border bg-elevated p-5 transition hover:border-growth/50"
        >
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-growth-soft text-growth">
            <FlaskConical className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="mb-1 font-semibold text-growth group-hover:text-growth-deep">
            Your plan
          </h2>
          <p className="flex-1 text-sm text-fg-muted">
            Day + week plan from your chart and inventory.
          </p>
          <p className="mt-3 text-xs font-medium text-fg-muted">
            {!ready
              ? "…"
              : !hasChart
                ? "Needs a chart"
                : biohackingUnlocked
                  ? "Ready"
                  : "Pro — unlock when you’re ready"}
          </p>
        </Link>
      </div>

      {/* Thin trust line */}
      <p className="text-center text-sm text-fg-muted">
        Swiss Ephemeris · self-hosted · your data stays yours
        <span className="mt-1 block text-xs text-fg-muted/80">
          Informational only — not medical advice.
        </span>
      </p>
    </div>
  );
}
