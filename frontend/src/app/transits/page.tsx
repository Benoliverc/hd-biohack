"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatNatalOverlayLabel, useApp } from "@/lib/store";
import { displayCenter, formatGateLine } from "@/lib/hdCopy";
import { formatAsOfInZone } from "@/lib/timezone";
import TodayCheckIn from "@/components/TodayCheckIn";

export default function TransitsPage() {
  const { natalChartId, natalChart, natalBindingLoading } = useApp();
  const [data, setData] = useState<{
    transit: Record<string, unknown>;
    overlay: Record<string, unknown> | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (natalBindingLoading) {
      setLoading(true);
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    api
      .transitsToday(natalChartId ?? undefined)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [natalChartId, natalBindingLoading]);

  const activations =
    ((data?.transit?.activations as Array<Record<string, unknown>>) || []);
  const sunEarth = data?.transit?.sun_earth as
    | { sun: Record<string, unknown>; earth: Record<string, unknown> }
    | undefined;
  const overlay = data?.overlay;
  const atUtc = data?.transit?.at_utc as string | undefined;
  const asOfLabel = formatAsOfInZone(atUtc, natalChart?.timezone);

  const bridged = ((overlay?.bridged_channels as Array<Record<string, unknown>>) || []);
  const newlyDefined = ((overlay?.newly_defined_centers as string[]) || []);
  const todayBullets: string[] = [];
  if (sunEarth) {
    const sunGate = formatGateLine(
      (sunEarth.sun.gate as number | undefined) ?? String(sunEarth.sun.label ?? ""),
      sunEarth.sun.line as number | undefined
    );
    todayBullets.push(`Notice the Sun theme (${sunGate}) — let it color your day without forcing it.`);
  }
  if (newlyDefined.length > 0) {
    todayBullets.push(
      `Temporary energy in ${newlyDefined.map(displayCenter).join(", ")} — expect unfamiliar pressure; don't over-identify.`
    );
  } else if (bridged.length > 0) {
    const first = bridged[0];
    todayBullets.push(
      `A bridge may be active (${String(first.name)}) — watch who/what feels magnetic today.`
    );
  }
  if (todayBullets.length === 0 && !loading) {
    todayBullets.push("No strong personal overlay yet — save a natal chart for conditioning tips.");
    todayBullets.push("Skim today's planetary gates below, then open Protocols for stack tweaks.");
  } else if (todayBullets.length === 1) {
    todayBullets.push("When ready, open Protocols for natal baseline + this week's transit adjustments.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-sm text-fg-muted">
            {natalBindingLoading
              ? "Looking up your natal chart…"
              : natalChart
                ? `Overlaying ${formatNatalOverlayLabel(natalChart)}`
                : "Save a natal chart on Chart to see personal conditioning overlays."}
          </p>
          {asOfLabel && (
            <p className="mt-1 text-xs text-fg-muted">{asOfLabel}</p>
          )}
        </div>
      </div>

      {natalBindingLoading && (
        <div className="rounded-xl border border-border bg-elevated px-4 py-3">
          <p className="text-sm text-fg-muted">Looking up your natal chart…</p>
        </div>
      )}

      {!natalBindingLoading && !natalChartId && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-growth/30 bg-growth-soft px-4 py-3">
          <p className="text-sm text-growth-ink">
            No natal chart selected — planetary gates still load, but personal overlay needs a saved chart.
          </p>
          <Link
            href="/profile"
            className="inline-flex min-h-10 items-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep"
          >
            Save natal chart
          </Link>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading && !data && (
        <p className="text-sm text-fg-muted">Loading today&apos;s gates…</p>
      )}

      <TodayCheckIn />

      {!loading && todayBullets.length > 0 && (
        <div className="rounded-2xl border border-border bg-elevated p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-muted">
            What to do today
          </h2>
          <p className="mb-2 text-xs text-fg-muted">Sky cues (secondary to your check-in)</p>
          <ul className="mb-3 list-disc space-y-1.5 pl-5 text-sm text-fg-secondary">
            {todayBullets.slice(0, 3).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <Link
            href="/biohack"
            data-testid="open-protocol-adjustments"
            className="inline-flex min-h-9 items-center text-sm font-medium text-growth underline-offset-2 hover:underline"
          >
            Open Protocols
          </Link>
        </div>
      )}

      {sunEarth && (
        <div className="rounded-2xl border border-energy/40 bg-energy/10 p-5">
          <h2 className="mb-1 text-sm uppercase tracking-wide text-energy-ink">Weekly macro theme</h2>
          <p className="text-lg">
            Sun{" "}
            {formatGateLine(
              (sunEarth.sun.gate as number | undefined) ?? String(sunEarth.sun.label ?? ""),
              sunEarth.sun.line as number | undefined
            )}{" "}
            · Earth{" "}
            {formatGateLine(
              (sunEarth.earth.gate as number | undefined) ?? String(sunEarth.earth.label ?? ""),
              sunEarth.earth.line as number | undefined
            )}
          </p>
        </div>
      )}

      {overlay && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-4">
            <h2 className="mb-2 font-semibold">Bridged channels (conditioning)</h2>
            <ul className="space-y-1 text-sm text-fg-secondary">
              {((overlay.bridged_channels as Array<Record<string, unknown>>) || []).length === 0 && (
                <li className="text-fg-muted">None right now</li>
              )}
              {((overlay.bridged_channels as Array<Record<string, unknown>>) || []).map((c) => (
                <li key={JSON.stringify(c.gates)}>
                  {(c.gates as number[]).join("–")} — {String(c.name)} (
                  {((c.centers as string[]) || []).map(displayCenter).join(", ")})
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <h2 className="mb-2 font-semibold">Newly defined centers today</h2>
            <div className="flex flex-wrap gap-2">
              {((overlay.newly_defined_centers as string[]) || []).length === 0 && (
                <span className="text-sm text-fg-muted">No temporary definitions</span>
              )}
              {((overlay.newly_defined_centers as string[]) || []).map((c) => (
                <span key={c} className="rounded-full bg-energy/15 px-3 py-1 text-xs text-energy-ink">
                  {displayCenter(c)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="border-b border-border bg-elevated px-4 py-2 text-sm font-semibold">
          Current planetary gates
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-fg-muted">
            <tr>
              <th className="px-4 py-2">Planet</th>
              <th className="px-4 py-2">Gate · line</th>
            </tr>
          </thead>
          <tbody>
            {loading && activations.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-fg-muted">
                  Loading today&apos;s gates…
                </td>
              </tr>
            )}
            {!loading && activations.length === 0 && !error && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-fg-muted">
                  No planetary activations returned.
                </td>
              </tr>
            )}
            {activations.map((r) => (
              <tr key={String(r.planet)} className="border-t border-border">
                <td className="px-4 py-1.5">{String(r.planet)}</td>
                <td className="px-4 py-1.5 text-energy-ink">
                  {formatGateLine(
                    (r.gate as number | undefined) ?? String(r.label ?? ""),
                    r.line as number | undefined
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
