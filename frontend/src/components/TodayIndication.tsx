"use client";

import Link from "next/link";
import type { TodayIndicationPayload, VsYesterdayDelta } from "@/lib/api";

const ENERGY_CHIPS: { level: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { level: 1, label: "Drained" },
  { level: 2, label: "Low" },
  { level: 3, label: "Steady" },
  { level: 4, label: "Charged" },
  { level: 5, label: "Hyper" },
];

const SPACE_CHIPS: {
  value: "people" | "alone" | "nature" | "focus" | "out";
  label: string;
}[] = [
  { value: "people", label: "People" },
  { value: "alone", label: "Alone" },
  { value: "nature", label: "Nature" },
  { value: "focus", label: "Focus corner" },
  { value: "out", label: "Out & about" },
];

const DEFAULT_CONDITIONING_CAPTION =
  "These update when bridges or temporary centers shift — often every few days.";

function vsPillLabel(d: VsYesterdayDelta): string {
  if (d.field === "moon") return `Moon ${d.from} → ${d.to}`;
  if (d.field === "sun") return `Sun ${d.from} → ${d.to}`;
  if (d.field === "hanging_pressure") return `Hanging ${d.from} → ${d.to}`;
  if (d.field === "bridge") return `Bridge ${d.from} → ${d.to}`;
  if (d.field === "newly_defined") return `Centers ${d.from} → ${d.to}`;
  if (d.field === "energy") return `Energy ${d.from} → ${d.to}`;
  if (d.field === "space") return `Space ${d.from} → ${d.to}`;
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
  if (bindingLoading || loading) {
    return (
      <div
        className="rounded-2xl border border-border bg-elevated p-5"
        data-testid="today-indication-loading"
      >
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-muted">
          Today&apos;s indication
        </h2>
        <p className="text-sm text-fg-secondary">Reading your chart weather…</p>
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
          Today&apos;s indication
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
    indication.conditioning_caption?.trim() || DEFAULT_CONDITIONING_CAPTION;

  const eyebrowBits = ["Today's indication"];
  if (youLabel) eyebrowBits.push(youLabel);
  if (asOfLabel) eyebrowBits.push(asOfLabel);

  return (
    <div
      className="rounded-2xl border border-border bg-elevated p-5"
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
          {indication.disclaimer ||
            "Chart weather from your design × today's sky — not biometric or medical advice."}
        </p>
      </div>

      {daily ? (
        <div className="mb-4" data-testid="daily-signal">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-energy-ink">
            Today&apos;s new signal
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
            Vs yesterday
          </p>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Vs yesterday">
            {vs.map((d) => (
              <span
                key={`${d.field}-${d.from}-${d.to}`}
                role="listitem"
                className="inline-flex min-h-9 items-center rounded-full border border-border bg-sunken px-3 py-1.5 text-xs text-fg-secondary"
                data-testid={`vs-${d.field}`}
              >
                {vsPillLabel(d)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className="mb-4 rounded-xl border border-growth/30 bg-growth-soft p-4"
        data-testid="main-action"
      >
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-growth">
          Main action
        </h3>
        <p className="text-sm font-medium text-fg" data-testid="main-action-text">
          {indication.main_action_text}
        </p>
        <p className="mt-2 text-sm text-fg-secondary" data-testid="main-action-why">
          {indication.main_action_why}
        </p>
        {indication.main_action_micro ? (
          <p
            className="mt-1.5 text-sm text-fg-secondary"
            data-testid="main-action-micro"
          >
            {indication.main_action_micro}
          </p>
        ) : null}
        {indication.drivers?.length ? (
          <div className="mt-2" data-testid="indication-drivers">
            <p className="text-xs font-medium uppercase tracking-wide text-fg-secondary">
              Chart notes
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-fg-secondary">
              {indication.drivers.slice(0, 4).map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {indication.save_chart_cta ? (
          <Link
            href="/profile"
            className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep"
            data-testid="indication-save-chart-cta"
          >
            Save natal chart
          </Link>
        ) : (
          <Link
            href="/biohack"
            className="mt-3 inline-flex min-h-11 items-center rounded-xl px-3 py-2.5 text-sm font-medium text-growth underline-offset-2 hover:underline"
            data-testid="open-protocols-secondary"
          >
            Open Protocols
          </Link>
        )}
      </div>

      <div
        className="rounded-xl border border-border bg-sunken/40 p-4"
        data-testid="still-conditioning"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Still conditioning
        </p>

        <div className="mb-3">
          <p className="mb-2 text-sm font-medium text-fg">Energy</p>
          <div
            className="flex flex-wrap gap-2"
            role="list"
            aria-label="Energy today"
            data-testid="energy-chips"
          >
            {ENERGY_CHIPS.map((c) => {
              const active = energy === c.level;
              return (
                <span
                  key={c.level}
                  role="listitem"
                  aria-current={active ? "true" : undefined}
                  data-testid={`energy-${c.level}`}
                  data-active={active ? "true" : "false"}
                  className={`inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-xs sm:text-sm ${
                    active
                      ? "border-growth bg-growth-soft font-semibold text-growth-ink ring-2 ring-growth/30"
                      : "border-border bg-elevated text-fg-secondary"
                  }`}
                >
                  {c.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mb-3">
          <p className="mb-2 text-sm font-medium text-fg">Space</p>
          <div
            className="flex flex-wrap gap-2"
            role="list"
            aria-label="Preferred space"
            data-testid="space-chips"
          >
            {SPACE_CHIPS.map((c) => {
              const active = space === c.value;
              return (
                <span
                  key={c.value}
                  role="listitem"
                  aria-current={active ? "true" : undefined}
                  data-testid={`space-${c.value}`}
                  data-active={active ? "true" : "false"}
                  className={`inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-xs sm:text-sm ${
                    active
                      ? "border-energy bg-energy-soft font-semibold text-energy-ink ring-2 ring-energy/30"
                      : "border-border bg-elevated text-fg-secondary"
                  }`}
                >
                  {c.label}
                </span>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-fg-muted" data-testid="conditioning-caption">
          {caption}
        </p>
      </div>
    </div>
  );
}
