"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";

export default function TransitsPage() {
  const { natalChartId } = useApp();
  const [data, setData] = useState<{
    transit: Record<string, unknown>;
    overlay: Record<string, unknown> | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .transitsToday(natalChartId ?? undefined)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [natalChartId]);

  const activations =
    ((data?.transit?.activations as Array<Record<string, unknown>>) || []);
  const sunEarth = data?.transit?.sun_earth as
    | { sun: Record<string, unknown>; earth: Record<string, unknown> }
    | undefined;
  const overlay = data?.overlay;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Live Daily Transits</h1>
          <p className="text-sm text-slate-400">
            {natalChartId
              ? `Overlaying natal chart #${natalChartId}`
              : "Save a natal chart on Profile to see personal conditioning overlays."}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      {sunEarth && (
        <div className="rounded-2xl border border-violet-500/30 bg-violet-950/30 p-5">
          <h2 className="mb-1 text-sm uppercase tracking-wide text-violet-300">Weekly macro theme</h2>
          <p className="text-lg">
            Sun {String(sunEarth.sun.label)} · Earth {String(sunEarth.earth.label)}
          </p>
        </div>
      )}

      {overlay && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 p-4">
            <h2 className="mb-2 font-semibold">Bridged channels (conditioning)</h2>
            <ul className="space-y-1 text-sm text-slate-300">
              {((overlay.bridged_channels as Array<Record<string, unknown>>) || []).length === 0 && (
                <li className="text-slate-500">None right now</li>
              )}
              {((overlay.bridged_channels as Array<Record<string, unknown>>) || []).map((c) => (
                <li key={JSON.stringify(c.gates)}>
                  {(c.gates as number[]).join("–")} — {String(c.name)} ({(c.centers as string[]).join(", ")})
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 p-4">
            <h2 className="mb-2 font-semibold">Newly defined centers today</h2>
            <div className="flex flex-wrap gap-2">
              {((overlay.newly_defined_centers as string[]) || []).length === 0 && (
                <span className="text-sm text-slate-500">No temporary definitions</span>
              )}
              {((overlay.newly_defined_centers as string[]) || []).map((c) => (
                <span key={c} className="rounded-full bg-amber-900/40 px-3 py-1 text-xs text-amber-200">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-2 text-sm font-semibold">
          Current planetary gates
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2">Planet</th>
              <th className="px-4 py-2">Gate.Line</th>
              <th className="px-4 py-2">Lon°</th>
            </tr>
          </thead>
          <tbody>
            {activations.map((r) => (
              <tr key={String(r.planet)} className="border-t border-slate-800/80">
                <td className="px-4 py-1.5">{String(r.planet)}</td>
                <td className="px-4 py-1.5 text-violet-300">{String(r.label)}</td>
                <td className="px-4 py-1.5 text-slate-500">{Number(r.longitude).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
