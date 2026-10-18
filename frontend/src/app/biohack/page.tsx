"use client";

import { useState } from "react";
import { BiohackingEntitlementGate } from "@/components/BiohackingEntitlementGate";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";

export default function BiohackPage() {
  const { user, natalChartId } = useApp();
  const [protocol, setProtocol] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invName, setInvName] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.protocol(user.id, natalChartId ?? undefined);
      setProtocol(res.protocol);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const addInv = async () => {
    if (!user || !invName.trim()) return;
    await api.addInventory(user.id, invName.trim());
    setInvName("");
    await load();
  };

  const morning = (protocol?.morning_stack as Array<Record<string, string>>) || [];
  const midday = (protocol?.midday_stack as Array<Record<string, string>>) || [];
  const evening = (protocol?.evening_stack as Array<Record<string, string>>) || [];
  const adjusts = (protocol?.what_to_adjust_this_week as string[]) || [];

  const content = (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
        For informational and energetic optimization purposes only; not medical advice. Consult a
        qualified clinician before changing supplements or lifestyle protocols.
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || !user}
          onClick={load}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Building…" : "Generate weekly + daily protocol"}
        </button>
        <div className="flex gap-2">
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Add supplement you own"
            value={invName}
            onChange={(e) => setInvName(e.target.value)}
          />
          <button
            type="button"
            onClick={addInv}
            className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:border-violet-500"
          >
            Add to inventory
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      {protocol && (
        <>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <h2 className="mb-2 font-semibold">Daily directive</h2>
            <p className="text-sm text-slate-300">{String(protocol.daily_directive)}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 p-5">
            <h2 className="mb-2 font-semibold">What to adjust this week</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
              {adjusts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Stack title="Morning" items={morning} />
            <Stack title="Midday / Workout" items={midday} />
            <Stack title="Evening wind-down" items={evening} />
          </div>

          {protocol.coaching_copy && (
            <div className="rounded-2xl border border-violet-500/30 p-5 text-sm text-slate-300">
              <h2 className="mb-2 font-semibold text-violet-200">LLM coaching</h2>
              <p className="whitespace-pre-wrap">{String(protocol.coaching_copy)}</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Biohacking &amp; Supplement Protocols</h1>
      <p className="text-sm text-slate-400">
        Deterministic center/transit rules first. Optional LLM via <code>LLM_API_KEY</code>. Save a
        chart on Profile first.
      </p>
      <BiohackingEntitlementGate blurredPreview={content}>{content}</BiohackingEntitlementGate>
    </div>
  );
}

function Stack({ title, items }: { title: string; items: Array<Record<string, string>> }) {
  return (
    <div className="rounded-2xl border border-slate-800 p-4">
      <h3 className="mb-3 font-semibold text-violet-200">{title}</h3>
      {items.length === 0 && <p className="text-sm text-slate-500">No items</p>}
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.name} className="rounded-lg bg-slate-900/60 px-3 py-2 text-sm">
            <div className="font-medium">{it.name}</div>
            <div className="text-xs text-slate-400">{it.note}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
