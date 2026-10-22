"use client";

import Link from "next/link";
import type { TodayIndicationPayload } from "@/lib/api";

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

type Props = {
  indication: TodayIndicationPayload | null | undefined;
  loading?: boolean;
  error?: string | null;
  bindingLoading?: boolean;
};

export default function TodayIndication({
  indication,
  loading = false,
  error = null,
  bindingLoading = false,
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
        <p className="text-sm text-fg-muted">Reading your chart weather…</p>
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

  return (
    <div
      className="rounded-2xl border border-border bg-elevated p-5"
      data-testid="today-indication"
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
            Today&apos;s indication
          </h2>
          <p className="mt-1 text-xs text-fg-muted" data-testid="indication-disclaimer">
            {indication.disclaimer ||
              "Chart weather from your design × today's sky — not biometric or medical advice."}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-fg">Energy today</p>
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
                    : "border-border bg-sunken text-fg-muted"
                }`}
              >
                {c.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-fg">Space the chart points to</p>
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
                    ? "border-energy bg-energy/30 font-semibold text-energy-ink ring-2 ring-energy/40"
                    : "border-border bg-sunken text-fg-muted"
                }`}
              >
                {c.label}
              </span>
            );
          })}
        </div>
      </div>

      <div
        className="rounded-xl border border-growth/30 bg-growth-soft p-4"
        data-testid="main-action"
      >
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-growth">
          Main action
        </h3>
        <p className="text-sm font-medium text-fg" data-testid="main-action-text">
          {indication.main_action_text}
        </p>
        {indication.main_action_micro ? (
          <p
            className="mt-1.5 text-sm text-fg-secondary"
            data-testid="main-action-micro"
          >
            {indication.main_action_micro}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-fg-muted" data-testid="main-action-why">
          {indication.main_action_why}
        </p>
        {indication.drivers?.length ? (
          <ul
            className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-fg-muted"
            data-testid="indication-drivers"
          >
            {indication.drivers.slice(0, 4).map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        ) : null}
        {indication.save_chart_cta ? (
          <Link
            href="/profile"
            className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep"
            data-testid="indication-save-chart-cta"
          >
            Save natal chart
          </Link>
        ) : (
          <Link
            href="/biohack"
            className="mt-3 inline-flex text-xs font-medium text-growth underline-offset-2 hover:underline"
            data-testid="open-protocols-secondary"
          >
            Open Protocols
          </Link>
        )}
      </div>
    </div>
  );
}
