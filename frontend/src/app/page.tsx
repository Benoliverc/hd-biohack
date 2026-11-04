"use client";

import Link from "next/link";
import { Activity, FlaskConical, Sparkles, UserRound } from "lucide-react";
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
          Baseline · chart · sky · move
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
            <p className="max-w-2xl text-fg-secondary">
              {hasChart
                ? biohackingUnlocked
                  ? "Chart and today’s sky stay free. Protocols turn the sky into a checkable move — using your kit when you own it."
                  : "Chart and today’s sky stay free. Protocols (Today’s Move + kit) unlock with Pro."
                : "Save your natal free. Today’s sky stays free. Protocols unlock with Pro when you’re ready."}
            </p>
            <p className="mt-2 text-xs font-medium tracking-wide text-fg-secondary">
              Chart → Today’s sky → Today’s Move → Soul
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
                Calculate my chart
              </Link>
              <Link
                href="/transits"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm text-fg hover:border-energy sm:w-auto"
              >
                See today’s sky
              </Link>
            </>
          ) : biohackingUnlocked ? (
            <>
              <Link
                href="/biohack"
                data-testid="home-primary-protocols"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep sm:w-auto"
              >
                Open Protocols
              </Link>
              <Link
                href="/transits"
                data-testid="home-secondary-today"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm text-fg hover:border-energy sm:w-auto"
              >
                Today’s sky
              </Link>
              <Link
                href="/profile"
                data-testid="home-calculate-chart"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium text-fg-secondary underline-offset-2 hover:underline sm:w-auto"
              >
                Open chart
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/transits"
                data-testid="home-primary-today"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep sm:w-auto"
              >
                Today’s sky
              </Link>
              <Link
                href="/profile"
                data-testid="home-calculate-chart"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm text-fg hover:border-growth sm:w-auto"
              >
                Open your chart
              </Link>
              <Link
                href="/biohack"
                data-testid="home-view-protocols-ghost"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium text-fg-secondary underline-offset-2 hover:underline sm:w-auto"
              >
                Protocols (Pro)
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
                Change
              </Link>
            </div>
            <p className="text-[11px] text-fg-secondary">
              {biohackingUnlocked
                ? "Morning path: Protocols → tick Today’s Move"
                : "Pro unlocks the live move — Free keeps Chart + Today"}
            </p>
          </div>
        ) : null}
      </section>

      {/* Outcome cards — Chart · Today · Protocols · Soul */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/profile"
          className="group flex flex-col rounded-2xl border border-border bg-elevated p-5 transition hover:border-growth/50"
        >
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-sunken text-growth">
            <UserRound className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="mb-1 font-semibold text-fg group-hover:text-growth-deep">
            Your blueprint
          </h2>
          <div className="flex-1 text-sm text-fg-secondary">
            <p>Type, authority, centers, and gates — the map everything else uses.</p>
            <ul className="mt-2 list-disc space-y-0.5 pl-4">
              <li>You + friends you save (friends never drive Today or Protocols)</li>
              <li>Why: Today, Protocols, and Soul all read this first</li>
            </ul>
          </div>
          <p className="mt-3 text-xs font-medium text-fg-secondary">
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
          <h2 className="mb-1 font-semibold text-fg group-hover:text-growth-deep">
            What’s active on you
          </h2>
          <div className="flex-1 text-sm text-fg-secondary">
            <p>Energy, space, and one main action from your natal × today’s sky.</p>
            <ul className="mt-2 list-disc space-y-0.5 pl-4">
              <li>Always your chart — friends stay on Chart &amp; Soul</li>
              <li>Why: catch pressure and openings before you plan</li>
            </ul>
          </div>
        </Link>

        <Link
          href="/biohack"
          data-testid="home-view-protocols"
          className="group flex flex-col rounded-2xl border border-border bg-elevated p-5 transition hover:border-growth/50"
        >
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-sunken text-growth">
            <FlaskConical className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="mb-1 font-semibold text-fg group-hover:text-growth-deep">
            Today’s Move
          </h2>
          <div className="flex-1 text-sm text-fg-secondary">
            <p>
              Weather from Today, a checkable day list, week theme — preferring compounds in
              your kit.
            </p>
            <ul className="mt-2 list-disc space-y-0.5 pl-4">
              <li>Auto-loads; Refresh rebuilds when the sky or kit changes</li>
              <li>From your kit shows when your shelf steered the move</li>
            </ul>
          </div>
          <p className="mt-3 text-xs font-medium text-fg-secondary">
            {!ready
              ? "…"
              : !hasChart
                ? "Needs a chart"
                : biohackingUnlocked
                  ? "Ready"
                  : "Pro — unlock when you’re ready"}
          </p>
        </Link>

        <Link
          href="/soul"
          className="group flex flex-col rounded-2xl border border-border bg-elevated p-5 transition hover:border-growth/50"
        >
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-sunken text-growth">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="mb-1 font-semibold text-fg group-hover:text-growth-deep">
            Aura between you
          </h2>
          <div className="flex-1 text-sm text-fg-secondary">
            <p>
              Signatures and a single Playbook for how your aura wires with someone you’ve
              charted.
            </p>
            <ul className="mt-2 list-disc space-y-0.5 pl-4">
              <li>Aura Signature + one Playbook for this pair</li>
              <li>Chemistry lives here — daily weather stays on Today &amp; Protocols</li>
            </ul>
          </div>
        </Link>
      </div>

      {/* Thin trust line */}
      <p className="text-center text-sm text-fg-secondary">
        Swiss Ephemeris · self-hosted · your data stays yours
        <span className="mt-1 block text-xs text-fg-secondary/80">
          Informational only — not medical advice.
        </span>
      </p>
    </div>
  );
}
