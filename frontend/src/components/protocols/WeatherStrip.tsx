"use client";

import Link from "next/link";
import type { TodayIndicationPayload } from "@/lib/api";
import type { WhatsNew } from "./types";

/**
 * Thin sky context for Protocols — chips + link back to Today.
 * Full indication essay / vs_yesterday lives on Today only.
 */
export function WeatherStrip({
  indication,
  whatsNew,
}: {
  indication: TodayIndicationPayload;
  whatsNew?: WhatsNew | null;
}) {
  const chip =
    whatsNew?.chip ||
    indication.daily_signal?.headline ||
    null;

  return (
    <section
      className="rounded-2xl border border-energy/40 bg-energy/10 px-4 py-3"
      data-testid="protocols-weather"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-energy/50 bg-elevated px-2.5 py-0.5 text-xs font-semibold text-energy-ink">
          {indication.energy_label}
        </span>
        <span className="rounded-full border border-border bg-elevated px-2.5 py-0.5 text-xs font-medium text-fg">
          {indication.preferred_space_label}
        </span>
        {chip && (
          <span
            className="rounded-full border border-growth/40 bg-growth-soft px-2.5 py-0.5 text-xs font-semibold text-growth-ink"
            data-testid="whats-new-chip"
            title={whatsNew?.body || indication.daily_signal?.body || undefined}
          >
            {chip}
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] text-fg-muted">
        <Link
          href="/transits"
          className="text-growth underline-offset-2 hover:underline"
          data-testid="weather-full-sky-link"
        >
          Full sky on Today
        </Link>
      </p>
    </section>
  );
}
