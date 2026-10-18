"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";

type Chart = Record<string, unknown>;

export default function ProfilePage() {
  const { user, setNatalChartId, natalChartId } = useApp();
  const [birthDate, setBirthDate] = useState("1948-04-09");
  const [birthTime, setBirthTime] = useState("00:05");
  const [birthCity, setBirthCity] = useState("Montreal, Canada");
  const [chart, setChart] = useState<Chart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (save: boolean) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.calculateChart({
        birth_date: birthDate,
        birth_time: birthTime,
        birth_city: birthCity,
        user_id: user.id,
        save,
      });
      setChart(res.chart);
      if (res.natal_chart_id) setNatalChartId(res.natal_chart_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const personality = (chart?.personality as Array<Record<string, unknown>>) || [];
  const design = (chart?.design as Array<Record<string, unknown>>) || [];
  const channels = (chart?.channels as Array<Record<string, unknown>>) || [];
  const defined = (chart?.defined_centers as string[]) || [];
  const undefinedCenters = (chart?.undefined_centers as string[]) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">General Profile — Natal Blueprint</h1>

      <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block text-slate-400">Birth date</span>
          <input
            type="date"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-400">Birth time</span>
          <input
            type="time"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
          />
        </label>
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block text-slate-400">Birth city</span>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            value={birthCity}
            onChange={(e) => setBirthCity(e.target.value)}
            placeholder="City, Country"
          />
        </label>
        <div className="flex gap-2 md:col-span-4">
          <button
            type="button"
            disabled={loading || !user}
            onClick={() => submit(false)}
            className="rounded-xl bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600 disabled:opacity-50"
          >
            Preview
          </button>
          <button
            type="button"
            disabled={loading || !user}
            onClick={() => submit(true)}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm hover:bg-violet-500 disabled:opacity-50"
          >
            Calculate &amp; Save
          </button>
          {natalChartId && (
            <span className="self-center text-xs text-emerald-400">Saved chart #{natalChartId}</span>
          )}
        </div>
        {error && <p className="md:col-span-4 text-sm text-rose-400">{error}</p>}
      </div>

      {chart && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Type", chart.type],
              ["Profile", chart.profile],
              ["Authority", chart.authority],
              ["Strategy", chart.strategy],
              ["Definition", chart.definition],
            ].map(([k, v]) => (
              <div key={String(k)} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">{String(k)}</div>
                <div className="mt-1 font-semibold text-violet-200">{String(v)}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 p-4">
              <h2 className="mb-3 font-semibold text-slate-200">Defined centers</h2>
              <div className="flex flex-wrap gap-2">
                {defined.map((c) => (
                  <span key={c} className="rounded-full bg-violet-900/50 px-3 py-1 text-xs text-violet-200">
                    {c}
                  </span>
                ))}
              </div>
              <h2 className="mb-2 mt-4 font-semibold text-slate-200">Open centers</h2>
              <div className="flex flex-wrap gap-2">
                {undefinedCenters.map((c) => (
                  <span key={c} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 p-4">
              <h2 className="mb-3 font-semibold">Active channels</h2>
              <ul className="space-y-1 text-sm text-slate-300">
                {channels.map((ch) => (
                  <li key={String(ch.name) + JSON.stringify(ch.gates)}>
                    {(ch.gates as number[]).join("–")} — {String(ch.name)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ActivationTable title="Personality (Black)" rows={personality} />
            <ActivationTable title="Design (Red)" rows={design} />
          </div>
        </>
      )}
    </div>
  );
}

function ActivationTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<Record<string, unknown>>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-2 text-sm font-semibold">{title}</div>
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-slate-500">
          <tr>
            <th className="px-4 py-2">Planet</th>
            <th className="px-4 py-2">Gate.Line</th>
            <th className="px-4 py-2">Lon°</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.planet)} className="border-t border-slate-800/80">
              <td className="px-4 py-1.5">{String(r.planet)}</td>
              <td className="px-4 py-1.5 text-violet-300">{String(r.label)}</td>
              <td className="px-4 py-1.5 text-slate-500">{Number(r.longitude).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
