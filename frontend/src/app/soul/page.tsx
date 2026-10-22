"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import {
  api,
  type SavedChartRow,
  type SoulContext,
  type SoulSyncResult,
} from "@/lib/api";
import { useApp } from "@/lib/store";
import { displayCenter } from "@/lib/hdCopy";

const CONTEXTS: {
  id: SoulContext;
  label: string;
  aliases: string;
}[] = [
  { id: "work", label: "Work & Co-Creation", aliases: "Co-Founder / Work" },
  { id: "life", label: "Life & Intimacy", aliases: "Partner / Sleep" },
  { id: "play", label: "Play & Performance", aliases: "Friend / Teammate" },
];

const VECTOR_GLOSS: Record<string, string> = {
  voltage: "How much spark and novelty the connection generates.",
  flow: "How easily structure and roles settle between you.",
  ease: "How gentle the connection is on the nervous system.",
};

function Meter({
  label,
  value,
  gloss,
  testId,
}: {
  label: string;
  value: number;
  gloss: string;
  testId: string;
}) {
  return (
    <div data-testid={testId} className="rounded-xl border border-border bg-sunken/40 p-4">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-fg">{label}</span>
        <span className="text-lg font-bold tabular-nums text-growth">{value}</span>
      </div>
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full bg-growth/70 transition-[width]"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <p className="text-xs text-fg-muted">{gloss}</p>
    </div>
  );
}

function pickDefaultSelf(rows: SavedChartRow[], natalId: number | null): number | null {
  if (natalId != null && rows.some((r) => r.id === natalId)) return natalId;
  const self = rows.find((r) => r.slot_kind === "self");
  if (self) return self.id;
  return rows[0]?.id ?? null;
}

function pickDefaultFriend(rows: SavedChartRow[], selfId: number | null): number | null {
  const friends = rows.filter((r) => r.id !== selfId);
  const prefer = friends.find((r) => r.slot_kind === "friend");
  return (prefer ?? friends[0])?.id ?? null;
}

export default function SoulPage() {
  const { user, natalChartId, sessionReady } = useApp();
  const [charts, setCharts] = useState<SavedChartRow[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [chartsError, setChartsError] = useState<string | null>(null);

  const [selfId, setSelfId] = useState<number | null>(null);
  const [friendId, setFriendId] = useState<number | null>(null);
  const [context, setContext] = useState<SoulContext>("work");
  const [protocols, setProtocols] = useState<string[]>([]);

  const [result, setResult] = useState<SoulSyncResult | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [apiMissing, setApiMissing] = useState(false);

  const loadCharts = useCallback(async () => {
    if (!user?.id) {
      setCharts([]);
      setChartsLoading(false);
      return;
    }
    setChartsLoading(true);
    setChartsError(null);
    try {
      const rows = await api.charts(user.id);
      setCharts(rows);
      setSelfId((prev) => {
        if (prev != null && rows.some((r) => r.id === prev)) return prev;
        return pickDefaultSelf(rows, natalChartId);
      });
    } catch (e) {
      setChartsError(e instanceof Error ? e.message : String(e));
      setCharts([]);
    } finally {
      setChartsLoading(false);
    }
  }, [user?.id, natalChartId]);

  useEffect(() => {
    if (!sessionReady) return;
    void loadCharts();
  }, [sessionReady, loadCharts]);

  useEffect(() => {
    if (!charts.length) {
      setFriendId(null);
      return;
    }
    setFriendId((prev) => {
      if (prev != null && prev !== selfId && charts.some((r) => r.id === prev)) return prev;
      return pickDefaultFriend(charts, selfId);
    });
  }, [charts, selfId]);

  useEffect(() => {
    if (!user?.id || selfId == null || friendId == null || selfId === friendId) {
      setResult(null);
      return;
    }
    let cancelled = false;
    setSyncLoading(true);
    setSyncError(null);
    setApiMissing(false);
    api
      .soulSync({
        user_id: user.id,
        self_chart_id: selfId,
        friend_chart_id: friendId,
        context,
        protocols,
      })
      .then((res) => {
        if (!cancelled) setResult(res);
      })
      .catch((e) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        const missing =
          /not found|404|method not allowed|soul sync needs/i.test(msg) ||
          msg.trim() === "" ||
          /\/soul\/sync/i.test(msg);
        // FastAPI 404 detail is often "Not Found"
        if (/^not found$/i.test(msg.trim()) || missing) {
          setApiMissing(true);
          setSyncError(null);
        } else {
          setSyncError(msg);
        }
        setResult(null);
      })
      .finally(() => {
        if (!cancelled) setSyncLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, selfId, friendId, context, protocols]);

  const activeContext = CONTEXTS.find((c) => c.id === context) ?? CONTEXTS[0];
  const enoughPeople = charts.length >= 2;

  const applicableProtocols = useMemo(
    () => (result?.available_protocols || []).filter((p) => p.applicable),
    [result]
  );

  const toggleProtocol = (id: string) => {
    setProtocols((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const regulatedActive = protocols.length > 0;

  return (
    <div className="space-y-6" data-testid="soul-page">
      <div>
        <h1 className="text-2xl font-bold">Soul</h1>
        <p className="text-sm text-fg-muted">
          Bio-Sync between you and someone you&apos;ve charted.
        </p>
      </div>

      {!sessionReady || chartsLoading ? (
        <div
          className="rounded-2xl border border-border bg-elevated p-5"
          data-testid="soul-loading"
        >
          <p className="text-sm text-fg-muted">Loading saved charts…</p>
        </div>
      ) : chartsError ? (
        <p className="text-sm text-danger" data-testid="soul-charts-error">
          {chartsError}
        </p>
      ) : !enoughPeople ? (
        <div
          className="rounded-2xl border border-border bg-elevated p-5"
          data-testid="soul-empty"
        >
          <p className="mb-3 text-sm text-fg-secondary">
            Soul needs at least two saved people — you and a friend — before Bio-Sync can run.
          </p>
          <Link
            href="/profile"
            className="inline-flex min-h-11 items-center rounded-xl bg-growth/20 px-4 py-2.5 text-sm font-medium text-growth hover:bg-growth/30"
            data-testid="soul-cta-chart"
          >
            Open Chart to add someone
          </Link>
        </div>
      ) : (
        <>
          <div
            className="flex flex-col gap-3 rounded-2xl border border-border bg-elevated p-4 sm:flex-row sm:items-end sm:gap-4"
            data-testid="soul-pickers"
          >
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-fg-muted">
              You
              <select
                className="min-h-11 rounded-lg border border-border bg-canvas px-3 text-sm text-fg"
                value={selfId ?? ""}
                onChange={(e) => setSelfId(Number(e.target.value))}
                data-testid="soul-self-select"
              >
                {charts.map((r) => (
                  <option key={r.id} value={r.id} disabled={r.id === friendId}>
                    {r.label || "Me"} · {r.type || "—"} · {r.profile || "—"}
                  </option>
                ))}
              </select>
            </label>
            <div className="hidden pb-2 text-fg-muted sm:block" aria-hidden>
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-fg-muted">
              Friend
              <select
                className="min-h-11 rounded-lg border border-border bg-canvas px-3 text-sm text-fg"
                value={friendId ?? ""}
                onChange={(e) => setFriendId(Number(e.target.value))}
                data-testid="soul-friend-select"
              >
                {charts.map((r) => (
                  <option key={r.id} value={r.id} disabled={r.id === selfId}>
                    {r.label || "Friend"} · {r.type || "—"} · {r.profile || "—"}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div data-testid="soul-context">
            <p className="mb-2 text-sm font-medium text-fg">Context lens</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Context lens">
              {CONTEXTS.map((c) => {
                const active = context === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    data-testid={`soul-context-${c.id}`}
                    aria-pressed={active}
                    onClick={() => setContext(c.id)}
                    className={`inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-xs sm:text-sm ${
                      active
                        ? "border-growth bg-growth/15 font-semibold text-growth"
                        : "border-border bg-sunken text-fg-secondary hover:border-growth/40"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-fg-muted">
              Also reads as: {activeContext.aliases}
            </p>
          </div>

          {apiMissing && (
            <div
              className="rounded-2xl border border-energy/40 bg-energy/10 p-5"
              data-testid="soul-api-missing"
            >
              <p className="text-sm text-energy-ink">
                Soul sync needs an API update. The page is ready; production API may still be on an
                older build (Railway deploy pause). Locally, restart the backend on this branch.
              </p>
            </div>
          )}

          {syncError && (
            <p className="text-sm text-danger" data-testid="soul-sync-error">
              {syncError}
            </p>
          )}

          {syncLoading && !result && (
            <div
              className="rounded-2xl border border-border bg-elevated p-5"
              data-testid="soul-sync-loading"
            >
              <p className="text-sm text-fg-muted">Calculating Bio-Sync…</p>
            </div>
          )}

          {result && (
            <>
              <div
                className="rounded-2xl border border-border bg-elevated p-5"
                data-testid="soul-hero"
              >
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-fg-muted">Natural Fit</p>
                    <p
                      className="text-4xl font-bold tabular-nums text-growth"
                      data-testid="soul-natural-fit"
                    >
                      {result.natural_fit}
                      <span className="text-lg font-semibold text-fg-muted">%</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-fg-muted">Regulated Fit</p>
                    <p
                      className={`text-3xl font-bold tabular-nums ${
                        regulatedActive ? "text-growth" : "text-fg-muted"
                      }`}
                      data-testid="soul-regulated-fit"
                    >
                      {result.regulated_fit}
                      <span className="text-base font-semibold">%</span>
                    </p>
                    {!regulatedActive && (
                      <p className="text-xs text-fg-muted">Enable a co-regulation toggle below</p>
                    )}
                  </div>
                  <div
                    className="rounded-xl border border-growth/30 bg-growth/10 px-3 py-2"
                    data-testid="soul-archetype"
                  >
                    <p className="text-sm font-semibold text-growth">{result.archetype.label}</p>
                    <p className="mt-0.5 max-w-xs text-xs text-fg-secondary">
                      {result.archetype.blurb}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-fg-muted" data-testid="soul-disclaimer">
                  {result.disclaimer}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3" data-testid="soul-vectors">
                <Meter
                  label="Voltage"
                  value={result.vectors.voltage}
                  gloss={VECTOR_GLOSS.voltage}
                  testId="soul-voltage"
                />
                <Meter
                  label="Flow"
                  value={result.vectors.flow}
                  gloss={VECTOR_GLOSS.flow}
                  testId="soul-flow"
                />
                <Meter
                  label="Somatic Ease"
                  value={result.vectors.ease}
                  gloss={VECTOR_GLOSS.ease}
                  testId="soul-ease"
                />
              </div>

              {result.split_bridges.length > 0 && (
                <div
                  className="rounded-2xl border border-border bg-elevated p-5"
                  data-testid="soul-split-bridges"
                >
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-muted">
                    Split-Bridge
                  </h2>
                  <p className="mb-3 text-sm text-fg-secondary">
                    They complete a hanging gate in your chart — a natural pull point in the field.
                  </p>
                  <ul className="space-y-1.5 text-sm text-fg">
                    {result.split_bridges.map((b) => (
                      <li key={`${b.gate}-${b.channel}`}>
                        Gate {b.gate} · {b.channel || "channel"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                className="rounded-2xl border border-border bg-elevated p-5"
                data-testid="soul-conditioning"
              >
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fg-muted">
                  Directional conditioning
                </h2>
                <ul className="space-y-2">
                  {result.conditioning_strip.map((row) => {
                    const arrow =
                      row.direction === "friend_to_self"
                        ? "Friend → You"
                        : row.direction === "self_to_friend"
                          ? "You → Friend"
                          : row.direction === "both_defined"
                            ? "Both defined"
                            : "Both open";
                    return (
                      <li
                        key={row.center}
                        className="rounded-lg border border-border/70 bg-canvas/50 px-3 py-2 text-sm"
                        data-testid={`soul-center-${row.center}`}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-medium text-fg">{displayCenter(row.center)}</span>
                          <span className="text-xs text-fg-muted">{arrow}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-fg-secondary">
                          You: {row.self} · Friend: {row.friend}
                        </p>
                        {row.hint ? (
                          <p className="mt-1 text-xs text-fg-muted">{row.hint}</p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {applicableProtocols.length > 0 && (
                <div
                  className="rounded-2xl border border-border bg-elevated p-5"
                  data-testid="soul-protocols"
                >
                  <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-fg-muted">
                    Co-regulation (preview)
                  </h2>
                  <p className="mb-3 text-xs text-fg-muted">
                    Thin preview — toggles bump Somatic Ease into Regulated Fit. Not saved.
                  </p>
                  <ul className="space-y-2">
                    {applicableProtocols.map((p) => (
                      <li key={p.id}>
                        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-fg">
                          <input
                            type="checkbox"
                            checked={protocols.includes(p.id)}
                            onChange={() => toggleProtocol(p.id)}
                            data-testid={`soul-protocol-${p.id}`}
                          />
                          {p.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <details className="rounded-2xl border border-border bg-elevated p-5">
                <summary className="cursor-pointer text-sm font-semibold text-fg">
                  How this is calculated
                </summary>
                <div className="mt-3 space-y-2 text-sm text-fg-secondary">
                  <p>
                    Natural Fit blends three vectors for the active lens ({result.context_label}):
                    Voltage (spark), Flow (shared structure), and Somatic Ease (nervous-system
                    friction). Weights for this lens: Voltage {Math.round(result.weights.voltage * 100)}
                    %, Flow {Math.round(result.weights.flow * 100)}%, Ease{" "}
                    {Math.round(result.weights.ease * 100)}%.
                  </p>
                  <p>
                    Drivers come from electromagnetic / companionship / dominance / compromise
                    channels, hanging-gate bridges, shared centers, profile geometry, authority
                    timing, and type sacral asymmetry. Regulated Fit only changes Ease via the
                    toggles above.
                  </p>
                </div>
              </details>
            </>
          )}
        </>
      )}
    </div>
  );
}
