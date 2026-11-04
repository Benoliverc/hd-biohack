"use client";

import Link from "next/link";
import type { TodayIndicationPayload } from "@/lib/api";
import { useI18n, localizeEnergyLabel, localizeSpaceLabel } from "@/lib/i18n";
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
  const { t } = useI18n();
  const energyLabel = localizeEnergyLabel(
    t,
    indication.energy_level,
    indication.energy_label
  );
  const spaceLabel = localizeSpaceLabel(
    t,
    indication.preferred_space,
    indication.preferred_space_label
  );

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
          {energyLabel}
        </span>
        <span className="rounded-full border border-border bg-elevated px-2.5 py-0.5 text-xs font-medium text-fg">
          {spaceLabel}
        </span>
        {chip && (
          <span
            className="rounded-full border border-energy/50 bg-energy/15 px-2.5 py-0.5 text-xs font-semibold text-energy-ink"
            data-testid="whats-new-chip"
            title={whatsNew?.body || indication.daily_signal?.body || undefined}
          >
            {chip}
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] text-fg-secondary">
        <Link
          href="/transits"
          className="text-growth underline-offset-2 hover:underline"
          data-testid="weather-full-sky-link"
        >
          {t("protocols.fullSkyOnToday")}
        </Link>
      </p>
    </section>
  );
}
