"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";

const cards = [
  {
    href: "/profile",
    title: "Chart",
    description: "Natal blueprint — type, authority, centers, channels, and gates.",
  },
  {
    href: "/transits",
    title: "Today",
    description: "Live planetary gates plus personal conditioning overlays.",
  },
  {
    href: "/biohack",
    title: "Protocols",
    description: "Natal baseline and this-week transit stacks (Pro).",
  },
] as const;

export default function HomePage() {
  const { natalChart } = useApp();
  const hasChart = Boolean(natalChart);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-elevated p-8">
        <p className="mb-2 text-sm uppercase tracking-widest text-growth">Human Design + protocols</p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          Your chart, today&apos;s gates, and biohacking protocols
        </h1>
        <p className="max-w-2xl text-fg-muted">
          Self-hosted Swiss Ephemeris engine. Chart and daily transits stay free. Supplement
          protocols and inventory unlock with Biohacker Pro.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/profile"
            data-testid="home-calculate-chart"
            className="inline-flex min-h-10 items-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep"
          >
            {hasChart ? "Open your chart" : "Calculate my chart"}
          </Link>
          <Link
            href="/biohack"
            data-testid="home-view-protocols"
            className="inline-flex min-h-10 items-center rounded-xl border border-border px-4 py-2.5 text-sm hover:border-growth"
          >
            View protocols
          </Link>
          <Link
            href="/transits"
            className="inline-flex min-h-10 items-center rounded-xl border border-border px-4 py-2.5 text-sm hover:border-growth"
          >
            See today&apos;s gates
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ href, title, description }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-border bg-elevated p-5 transition hover:border-growth/50 hover:bg-elevated"
          >
            <h2 className="mb-1 font-semibold text-growth">{title}</h2>
            <p className="text-sm text-fg-muted">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
