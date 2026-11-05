"use client";

import Link from "next/link";
import { Zap, BatteryMedium, MapPin } from "lucide-react";
import type { TodayIndicationPayload, VsYesterdayDelta } from "@/lib/api";
import { hdFactForDay } from "@/lib/hdFactOfTheDay";
import {
  useI18n,
  localizeEnergyLabel,
  localizeSpaceLabel,
  ENERGY_LEVELS,
  SPACE_VALUES,
  type MessageKey,
} from "@/lib/i18n";

type TFn = (key: MessageKey, vars?: Record<string, string | number>) => string;

function vsPillLabel(d: VsYesterdayDelta, t: TFn): string {
  const vars = { from: d.from, to: d.to };
  if (d.field === "moon") return t("vs.moon", vars);
  if (d.field === "sun") return t("vs.sun", vars);
  if (d.field === "hanging_pressure") return t("vs.hanging", vars);
  if (d.field === "bridge") return t("vs.bridge", vars);
  if (d.field === "newly_defined") return t("vs.centers", vars);
  if (d.field === "energy") return t("vs.energy", vars);
  if (d.field === "space") return t("vs.space", vars);
  return `${d.from} → ${d.to}`;
}

type Props = {
  indication: TodayIndicationPayload | null | undefined;
  loading?: boolean;
  error?: string | null;
  bindingLoading?: boolean;
  youLabel?: string | null;
  asOfLabel?: string | null;
};

export default function TodayIndication({
  indication,
  loading = false,
  error = null,
  bindingLoading = false,
  youLabel = null,
  asOfLabel = null,
}: Props) {
  const { t } = useI18n();
  if (bindingLoading || loading) {
    return (
      <div
        className="rounded-2xl border border-border bg-elevated p-5"
        data-testid="today-indication-loading"
      >
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-muted">
          {t("today.indication")}
        </h2>
        <p className="text-sm text-fg-secondary">{t("today.reading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl border border-danger/40 bg-elevated p-5"
        data-testid="today-indication-error"
      >
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-muted">
          {t("today.indication")}
        </h2>
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (!indication) {
    return null;
  }

  const energy = indication.energy_level as 1 | 2 | 3 | 4 | 5;
  const space = indication.preferred_space;
  const daily = indication.daily_signal;
  const vs = indication.vs_yesterday || [];
  const caption =
    indication.conditioning_caption?.trim() || t("today.conditioningCaptionFallback");
  const energyLabel = localizeEnergyLabel(t, energy, indication.energy_label);
  const spaceLabel = localizeSpaceLabel(t, space, indication.preferred_space_label);

  const eyebrowBits = [t("today.indication")];
  if (youLabel) eyebrowBits.push(youLabel);
  if (asOfLabel) eyebrowBits.push(asOfLabel);

  return (
    <div
      className="rounded-2xl border border-border bg-elevated p-5 shadow-soft"
      data-testid="today-indication"
    >
      <div className="mb-3">
        <h2
          className="text-sm font-semibold uppercase tracking-wide text-fg-muted"
          data-testid="indication-eyebrow"
        >
          {eyebrowBits.join(" · ")}
        </h2>
        <p
          className="mt-1 text-sm text-fg-secondary"
          data-testid="indication-disclaimer"
        >
          {indication.disclaimer || t("today.disclaimerFallback")}
        </p>
      </div>

      {daily ? (
        <div className="mb-4" data-testid="daily-signal">
          <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-energy-ink">
            <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t("today.newSignal")}
          </p>
          <h3
            className="text-lg font-semibold text-fg"
            data-testid="daily-signal-headline"
          >
            {daily.headline}
          </h3>
          <p className="mt-1 text-sm text-fg-secondary" data-testid="daily-signal-body">
            {daily.body}
          </p>
        </div>
      ) : null}

      {vs.length > 0 ? (
        <div className="mb-4" data-testid="vs-yesterday">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-muted">
            {t("today.vsYesterday")}
          </p>
          <div className="flex flex-wrap gap-2" role="list" aria-label={t("today.vsYesterday")}>
            {vs.map((d) => (
              <span
                key={`${d.field}-${d.from}-${d.to}`}
                role="listitem"
                className="inline-flex min-h-9 items-center rounded-full border border-border bg-sunken px-3 py-1.5 text-xs text-fg-secondary"
                data-testid={`vs-${d.field}`}
              >
                {vsPillLabel(d, t)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className="mb-4 rounded-xl border border-growth/25 bg-canvas p-4 shadow-soft ring-1 ring-growth/10"
        data-testid="main-action"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-growth">
              {t("today.mainAction")}
            </h3>
            <p className="text-sm font-medium text-fg" data-testid="main-action-text">
              {indication.main_action_text}
            </p>
            {indication.main_action_why || indication.main_action_micro || indication.drivers?.length ? (
              <details className="mt-2 group" data-testid="main-action-why-details">
                <summary className="mt-1 inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg border border-border bg-sunken/70 px-3 py-2 text-xs font-semibold text-fg transition hover:border-growth/40 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-growth/40 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden
                    className="inline-block text-fg-muted transition-transform group-open:rotate-90"
                  >
                    ▸
                  </span>
                  <span>{t("today.why")}</span>
                  <span className="font-normal text-fg-muted">· {t("today.whyHint")}</span>
                </summary>
                {indication.main_action_micro ? (
                  <p
                    className="mt-2 text-sm text-fg-secondary"
                    data-testid="main-action-micro"
                  >
                    {indication.main_action_micro}
                  </p>
                ) : null}
                {indication.main_action_why ? (
                  <p className="mt-2 text-sm text-fg-secondary" data-testid="main-action-why">
                    {indication.main_action_why}
                  </p>
                ) : null}
                {indication.drivers?.length ? (
                  <div className="mt-2" data-testid="indication-drivers">
                    <p className="text-xs font-medium uppercase tracking-wide text-fg-secondary">
                      {t("today.chartNotes")}
                    </p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-fg-secondary">
                      {indication.drivers.slice(0, 4).map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </details>
            ) : null}
            {indication.save_chart_cta ? (
              <Link
                href="/profile"
                className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep"
                data-testid="indication-save-chart-cta"
              >
                {t("today.saveNatal")}
              </Link>
            ) : (
              <Link
                href="/biohack"
                className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep"
                data-testid="open-protocols-secondary"
              >
                {t("protocols.openProtocols")}
              </Link>
            )}
          </div>
          <aside
            className="flex w-full shrink-0 flex-row flex-wrap gap-2 sm:w-44 sm:flex-col"
            data-testid="main-action-status"
            aria-label={t("today.stillConditioning")}
          >
            <div className="min-w-[9rem] flex-1 rounded-lg border border-border bg-elevated px-3 py-2 sm:flex-none">
              <p className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
                <BatteryMedium className="h-3 w-3" aria-hidden />
                {t("today.energy")}
              </p>
              <span className="inline-flex items-center rounded-md border border-growth/40 bg-growth-soft px-2 py-0.5 text-xs font-semibold text-growth-ink">
                {energyLabel}
              </span>
            </div>
            <div className="min-w-[9rem] flex-1 rounded-lg border border-border bg-elevated px-3 py-2 sm:flex-none">
              <p className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
                <MapPin className="h-3 w-3" aria-hidden />
                {t("today.space")}
              </p>
              <span className="inline-flex items-center rounded-md border border-energy/40 bg-energy-soft px-2 py-0.5 text-xs font-semibold text-energy-ink">
                {spaceLabel}
              </span>
            </div>
          </aside>
        </div>
      </div>


      {(() => {
        const { fact, dayKey } = hdFactForDay();
        return (
          <aside
            className="mb-4 rounded-xl border border-border bg-sunken/50 px-4 py-3"
            data-testid="hd-fact-of-the-day"
            data-day-key={dayKey}
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-fg-muted">
              {t("today.hdFactLabel")}
            </p>
            <p className="text-sm text-fg-secondary">{fact}</p>
          </aside>
        );
      })()}

      <div
        className="rounded-xl border border-border bg-sunken/40 p-4"
        data-testid="still-conditioning"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          {t("today.stillConditioning")}
        </p>

        <div className="mb-3">
          <p className="mb-2 text-sm font-medium text-fg">{t("today.energy")}</p>
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
            role="status"
            aria-label={`Energy today: ${energyLabel}`}
            data-testid="energy-chips"
          >
            <span
              data-testid={`energy-${energy}`}
              data-active="true"
              className="inline-flex items-center rounded-md border border-growth/40 bg-growth-soft px-2.5 py-1 text-xs font-semibold text-growth-ink cursor-default select-none"
            >
              {energyLabel}
            </span>
            <span className="text-[11px] text-fg-muted cursor-default select-none">
              {ENERGY_LEVELS.filter((lvl) => lvl !== energy)
                .map((lvl) => localizeEnergyLabel(t, lvl))
                .join(" · ")}
            </span>
          </div>
        </div>

        <div className="mb-3">
          <p className="mb-2 text-sm font-medium text-fg">{t("today.space")}</p>
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
            role="status"
            aria-label={`Preferred space: ${spaceLabel}`}
            data-testid="space-chips"
          >
            <span
              data-testid={`space-${space}`}
              data-active="true"
              className="inline-flex items-center rounded-md border border-energy/40 bg-energy-soft px-2.5 py-1 text-xs font-semibold text-energy-ink cursor-default select-none"
            >
              {spaceLabel}
            </span>
            <span className="text-[11px] text-fg-muted cursor-default select-none">
              {SPACE_VALUES.filter((v) => v !== space)
                .map((v) => localizeSpaceLabel(t, v))
                .join(" · ")}
            </span>
          </div>
        </div>

        <p className="text-xs text-fg-muted" data-testid="conditioning-caption">
          {caption}
        </p>
      </div>
    </div>
  );
}
