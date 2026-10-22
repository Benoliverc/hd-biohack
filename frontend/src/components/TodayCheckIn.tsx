"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { api, type DailyCheckin } from "@/lib/api";
import { useApp } from "@/lib/store";

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

function localDateInZone(timeZone?: string | null): string {
  const zone = timeZone?.trim() || undefined;
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    if (y && m && d) return `${y}-${m}-${d}`;
  } catch {
    /* fall through */
  }
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export default function TodayCheckIn() {
  const { user, sessionReady, natalChartId, natalChart } = useApp();
  const tz = natalChart?.timezone?.trim() || browserTimeZone();
  const localDate = useMemo(() => localDateInZone(tz), [tz]);

  const [energy, setEnergy] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [space, setSpace] = useState<(typeof SPACE_CHIPS)[number]["value"] | null>(null);
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveSeq = useRef(0);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setCheckin(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const row = await api.getCheckinToday(user.id, localDate);
      setCheckin(row);
      if (row) {
        setEnergy(row.energy_level as 1 | 2 | 3 | 4 | 5);
        setSpace(row.preferred_space as (typeof SPACE_CHIPS)[number]["value"]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [user, localDate]);

  useEffect(() => {
    if (!sessionReady) return;
    void load();
  }, [sessionReady, load]);

  const persist = useCallback(
    async (
      nextEnergy: 1 | 2 | 3 | 4 | 5,
      nextSpace: (typeof SPACE_CHIPS)[number]["value"]
    ) => {
      if (!user) return;
      const seq = ++saveSeq.current;
      setSaving(true);
      setError(null);
      try {
        const row = await api.upsertCheckin({
          user_id: user.id,
          local_date: localDate,
          energy_level: nextEnergy,
          preferred_space: nextSpace,
          timezone: tz,
          natal_chart_id: natalChartId ?? null,
        });
        if (seq === saveSeq.current) setCheckin(row);
      } catch (e) {
        if (seq === saveSeq.current) {
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (seq === saveSeq.current) setSaving(false);
      }
    },
    [user, localDate, tz, natalChartId]
  );

  const onEnergy = (level: 1 | 2 | 3 | 4 | 5) => {
    setEnergy(level);
    if (space) void persist(level, space);
  };

  const onSpace = (value: (typeof SPACE_CHIPS)[number]["value"]) => {
    setSpace(value);
    if (energy) void persist(energy, value);
  };

  const bothSet = energy != null && space != null;
  const showMain = bothSet && checkin && checkin.energy_level === energy && checkin.preferred_space === space;

  if (!sessionReady) {
    return (
      <div className="rounded-2xl border border-border bg-elevated p-5">
        <p className="text-sm text-fg-muted">Loading check-in…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-elevated p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-growth">
          Check-in
        </h2>
        <p className="text-sm text-fg-secondary">
          Sign in to save today&apos;s energy and preferred space.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-growth/40 bg-elevated p-5 shadow-soft"
      data-testid="today-checkin"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-growth">
            Check-in
          </h2>
          <p className="mt-0.5 text-xs text-fg-muted">
            ~30 seconds · informational only · free for everyone
          </p>
        </div>
        {saving && (
          <span className="shrink-0 text-xs text-fg-muted" data-testid="checkin-saving">
            Saving…
          </span>
        )}
      </div>

      {loading && !checkin && (
        <p className="mb-3 text-sm text-fg-muted">Loading today&apos;s check-in…</p>
      )}

      <fieldset className="mb-4">
        <legend className="mb-2 text-sm font-medium text-fg">How&apos;s your energy?</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Energy">
          {ENERGY_CHIPS.map((c) => {
            const active = energy === c.level;
            return (
              <button
                key={c.level}
                type="button"
                role="radio"
                aria-checked={active}
                data-testid={`energy-${c.level}`}
                onClick={() => onEnergy(c.level)}
                className={`min-h-10 rounded-full border px-3 py-2 text-xs transition sm:text-sm ${
                  active
                    ? "border-growth bg-growth-soft font-semibold text-growth-ink ring-2 ring-growth/30"
                    : "border-border bg-sunken text-fg-secondary hover:border-growth/50 hover:text-fg"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mb-4">
        <legend className="mb-2 text-sm font-medium text-fg">Where do you want to be?</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Preferred space">
          {SPACE_CHIPS.map((c) => {
            const active = space === c.value;
            return (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={active}
                data-testid={`space-${c.value}`}
                onClick={() => onSpace(c.value)}
                className={`min-h-10 rounded-full border px-3 py-2 text-xs transition sm:text-sm ${
                  active
                    ? "border-energy bg-energy/15 font-semibold text-energy-ink ring-2 ring-energy/30"
                    : "border-border bg-sunken text-fg-secondary hover:border-energy/50 hover:text-fg"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {!bothSet && (
        <p className="text-sm text-fg-muted" data-testid="checkin-empty-hint">
          Pick energy and preferred space to reveal today&apos;s main action.
        </p>
      )}

      {error && (
        <div className="mt-3 flex flex-wrap items-center gap-2" data-testid="checkin-error">
          <p className="text-sm text-danger">{error}</p>
          <button
            type="button"
            className="min-h-9 rounded-xl border border-border px-3 py-1.5 text-xs text-fg hover:bg-sunken"
            onClick={() => {
              if (energy && space) void persist(energy, space);
              else void load();
            }}
          >
            Retry
          </button>
        </div>
      )}

      {showMain && checkin && (
        <div
          className="mt-4 rounded-xl border border-growth/30 bg-growth-soft p-4"
          data-testid="main-action"
        >
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-growth">
            Main action
          </h3>
          <p className="text-sm font-medium text-fg" data-testid="main-action-text">
            {checkin.main_action_text}
          </p>
          <p className="mt-2 text-xs text-fg-secondary" data-testid="main-action-why">
            {checkin.main_action_why}
          </p>
          <Link
            href="/biohack"
            className="mt-3 inline-flex text-xs font-medium text-growth underline-offset-2 hover:underline"
            data-testid="open-protocols-secondary"
          >
            Open Protocols
          </Link>
        </div>
      )}

      {bothSet && !showMain && !error && saving && (
        <p className="mt-3 text-sm text-fg-muted">Updating main action…</p>
      )}
    </div>
  );
}
