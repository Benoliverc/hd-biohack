"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Hexagon } from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, type SavedChartRow } from "@/lib/api";
import {
  useApp,
  type NatalChartSummary,
} from "@/lib/store";
import { displayCenter, formatGateLine } from "@/lib/hdCopy";
import { formatResetsIn } from "@/lib/timezone";
import TodayIndication from "@/components/TodayIndication";
import LiteracyCoach from "@/components/LiteracyCoach";
import { useLiteracyHowToReadOptional } from "@/components/LiteracyHowToReadContext";
import type { TodayIndicationPayload } from "@/lib/api";
import { youChipLabel } from "@/lib/youChipLabel";
import { ShareBaselineButton } from "@/components/share/ShareBaselineButton";
import { graphFromChart, typeFromChart } from "@/lib/share/graphFromChart";

function isSelfRow(row: { slot_kind?: string }): boolean {
  return row.slot_kind !== "friend";
}

function summaryFromSelf(row: SavedChartRow): NatalChartSummary {
  return {
    id: row.id,
    label: row.label || "Me",
    birth_city: row.birth_city || "",
    birth_date: row.birth_date,
    birth_time: row.birth_time,
    time_unknown: row.time_unknown === true,
    timezone: row.timezone ?? null,
    slot_kind: row.slot_kind ?? "self",
  };
}

/** Prefer store id only when that row is self; else first self; else null. */
function resolveYouChart(
  rows: SavedChartRow[],
  stickyId: number | null
): SavedChartRow | null {
  if (stickyId != null) {
    const match = rows.find((r) => r.id === stickyId);
    if (match && isSelfRow(match)) return match;
  }
  return rows.find((r) => isSelfRow(r)) ?? null;
}

export default function TransitsPage() {
  const { t } = useI18n();
  const { user, natalChartId, natalBindingLoading, setNatalChart, previewAsFree, biohackingUnlocked } = useApp();
  const howToRead = useLiteracyHowToReadOptional();
  const [youChart, setYouChart] = useState<NatalChartSummary | null>(null);
  /** Full natal chart_json for share card BodyGraph (no PII on the image). */
  const [youChartPayload, setYouChartPayload] = useState<Record<string, unknown> | null>(null);
  const [youReady, setYouReady] = useState(false);
  const [data, setData] = useState<{
    transit: Record<string, unknown>;
    overlay: Record<string, unknown> | null;
    indication: TodayIndicationPayload | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [inventoryStatus, setInventoryStatus] = useState<"unknown" | "ready" | "error">("unknown");
  const todayReq = useRef(0);
  const inventoryStatusRef = useRef(inventoryStatus);
  inventoryStatusRef.current = inventoryStatus;

  // Resolve You natal independently of friend sticky; never pass a friend id to the API.
  useEffect(() => {
    if (!user) {
      setYouChart(null);
      setYouChartPayload(null);
      setYouReady(false);
      return;
    }
    if (natalBindingLoading) {
      setYouReady(false);
      return;
    }
    let cancelled = false;
    setYouReady(false);
    api
      .charts(user.id)
      .then((rows) => {
        if (cancelled) return;
        const selfRow = resolveYouChart(rows, natalChartId);
        const summary = selfRow ? summaryFromSelf(selfRow) : null;
        setYouChart(summary);
        setYouChartPayload(
          selfRow?.chart && typeof selfRow.chart === "object"
            ? (selfRow.chart as Record<string, unknown>)
            : null
        );
        setYouReady(true);
        // Nudge sticky back to self when entering Today (aligns Protocols too).
        if (summary && natalChartId !== summary.id) {
          setNatalChart(summary);
        } else if (!summary && natalChartId != null) {
          // No You chart — clear friend sticky so Today stays sky-only.
          setNatalChart(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setYouChart(null);
          setYouChartPayload(null);
          setYouReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, natalBindingLoading, natalChartId, setNatalChart]);

  const fetchToday = useCallback(
    async (opts?: { quiet?: boolean }) => {
      if (!youChart) return;
      const req = ++todayReq.current;
      const quiet = Boolean(opts?.quiet);
      if (!quiet) {
        setLoading(true);
        setError(null);
        setData(null);
        setInventoryStatus("unknown");
      }
      const todayPromise = api.transitsToday(youChart.id, {
        userId: user?.id,
        previewAsFree,
      });
      const invPromise =
        user?.id != null ? api.inventory(user.id) : Promise.resolve([]);
      const [todayResult, invResult] = await Promise.allSettled([
        todayPromise,
        invPromise,
      ]);
      if (req !== todayReq.current) return;
      if (todayResult.status === "fulfilled") {
        setData(todayResult.value);
        setError(null);
      } else {
        const reason = todayResult.reason;
        setError(reason instanceof Error ? reason.message : String(reason));
        if (!quiet) setData(null);
      }
      if (invResult.status === "fulfilled") {
        setInventoryCount(invResult.value.length);
        setInventoryStatus("ready");
      } else if (!quiet || inventoryStatusRef.current !== "ready") {
        // Quiet refetch must not wipe a known shelf; initial load stays unknown/error.
        setInventoryStatus("error");
      }
      if (!quiet) setLoading(false);
    },
    [youChart, user?.id, previewAsFree]
  );

  useEffect(() => {
    if (natalBindingLoading || !youReady) {
      setLoading(true);
      setData(null);
      setInventoryStatus("unknown");
      return;
    }
    // No Me natal → empty Today. Do not call sky/Move API (avoids painting a fake filled day).
    if (!youChart) {
      setLoading(false);
      setData(null);
      setError(null);
      setInventoryCount(0);
      setInventoryStatus("ready");
      return;
    }
    void fetchToday();
    return () => {
      todayReq.current += 1;
    };
  }, [youChart, youReady, natalBindingLoading, fetchToday]);

  // If a Today fetch already went out against a stale zone, reload after a successful TZ sync.
  const lastTodayTz = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    lastTodayTz.current = undefined;
  }, [user?.id]);
  useEffect(() => {
    const tz = user?.preferred_timezone ?? null;
    if (lastTodayTz.current === undefined) {
      lastTodayTz.current = tz;
      return;
    }
    if (lastTodayTz.current === tz) return;
    lastTodayTz.current = tz;
    if (natalBindingLoading || !youReady || !youChart) return;
    void fetchToday({ quiet: true });
  }, [user?.preferred_timezone, natalBindingLoading, youReady, youChart, fetchToday]);

  const addToKit = useCallback(
    async (name: string) => {
      if (!user) {
        throw new Error("not signed in");
      }
      const res = await api.addInventory(user.id, name);
      await fetchToday({ quiet: true });
      if (!res.duplicate) {
        setInventoryCount((n) => Math.max(n, 1));
        setInventoryStatus("ready");
      }
      return { name: res.name, duplicate: Boolean(res.duplicate) };
    },
    [user, fetchToday]
  );

  const retryInventory = useCallback(() => {
    if (!youChart) return;
    setInventoryStatus("unknown");
    void fetchToday({ quiet: true });
  }, [youChart, fetchToday]);

  const activations =
    ((data?.transit?.activations as Array<Record<string, unknown>>) || []);
  const sunEarth = data?.transit?.sun_earth as
    | { sun: Record<string, unknown>; earth: Record<string, unknown> }
    | undefined;
  const overlay = data?.overlay;
  const asOfLabel = formatResetsIn(new Date(), user?.preferred_timezone, t);
  const resolvingYou = natalBindingLoading || !youReady;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Modest H1 for a11y; visual weight lives on You + Move */}
          <h1 className="text-sm font-semibold uppercase tracking-wide text-fg-secondary">
            {t("page.today.h1")}
          </h1>
          {resolvingYou ? (
            <p className="mt-1 type-meta">{t("page.today.lookingUp")}</p>
          ) : youChart ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 text-xs font-medium text-fg"
                title={t("page.today.alwaysUsesChart")}
                data-testid="today-you-chip"
              >
                {youChipLabel(youChart)}
              </span>
              {asOfLabel ? (
                <p className="type-caption text-fg-secondary">{asOfLabel}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-1 type-meta">
              {t("page.today.savePrompt")}
            </p>
          )}
          {!youChart && asOfLabel ? (
            <p className="mt-1 type-caption text-fg-secondary">{asOfLabel}</p>
          ) : null}
        </div>
        {data?.indication?.main_action_text && youChartPayload ? (
          <ShareBaselineButton
            variant="today"
            moveText={data.indication.main_action_text}
            typeLabel={typeFromChart(youChartPayload)}
            graph={graphFromChart(youChartPayload)}
            className="shrink-0"
          />
        ) : null}
      </div>

      {resolvingYou && (
        <div className="rounded-xl border border-border bg-elevated px-4 py-3">
          <p className="type-meta">{t("page.today.lookingUp")}</p>
        </div>
      )}

      {!resolvingYou && !youChart && (
        <div
          className="rounded-2xl border border-dashed border-border bg-elevated/60 px-5 py-8 text-center"
          data-testid="today-empty-no-you"
        >
          <p className="text-base font-semibold text-fg">{t("page.today.emptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-fg-secondary">
            {t("page.today.emptyBody")}
          </p>
          <Link
            href="/profile"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse"
            data-testid="today-empty-open-chart"
          >
            {t("page.today.openChart")}
          </Link>
        </div>
      )}

      {error && youChart ? <p className="text-sm text-danger">{error}</p> : null}

      {youChart ? (
        <TodayIndication
          indication={data?.indication}
          loading={loading && !data}
          error={error}
          bindingLoading={resolvingYou}
          userId={user?.id ?? null}
          chartId={youChart?.id ?? null}
          preferredTimezone={user?.preferred_timezone ?? null}
          natalType={typeFromChart(youChartPayload)}
          timeUnknown={youChart.time_unknown === true}
          protocolsUnlocked={biohackingUnlocked}
          inventoryStatus={inventoryStatus}
          inventoryCount={inventoryCount}
          onAddToKit={addToKit}
          onRetryInventory={retryInventory}
          onHowToRead={(stepId, returnFocus) =>
            howToRead?.open({ stepId, returnFocus })
          }
        />
      ) : null}

      {youChart ? <LiteracyCoach variant="today" /> : null}

      {youChart && sunEarth && (
        <div
          id="today-sun-earth"
          className="scroll-mt-[calc(var(--app-header-h,4.5rem)+0.75rem)] rounded-2xl border border-energy/40 bg-energy/10 p-5"
        >
          <h2 className="mb-1 text-sm uppercase tracking-wide text-energy-ink">{t("page.today.sunEarth")}</h2>
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

      {youChart && overlay && (
        <div className="grid gap-4 md:grid-cols-2">
          <div
            id="today-bridged-channels"
            className="scroll-mt-[calc(var(--app-header-h,4.5rem)+0.75rem)] rounded-2xl border border-border bg-elevated p-4 shadow-soft"
          >
            <h2 className="mb-2 font-semibold">{t("page.today.bridgedChannels")}</h2>
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
          <div
            id="today-newly-defined"
            className="scroll-mt-[calc(var(--app-header-h,4.5rem)+0.75rem)] rounded-2xl border border-border bg-elevated p-4 shadow-soft"
          >
            <h2 className="mb-2 inline-flex items-center gap-1.5 font-semibold">
              <Hexagon className="h-4 w-4 shrink-0 text-energy-ink" aria-hidden />
              {t("page.today.newlyDefined")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {((overlay.newly_defined_centers as string[]) || []).length === 0 && (
                <span className="text-sm text-fg-muted">No temporary definitions</span>
              )}
              {((overlay.newly_defined_centers as string[]) || []).map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-full border border-energy/30 bg-energy/15 px-3 py-1.5 text-xs font-medium text-energy-ink"
                >
                  <Hexagon className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
                  {displayCenter(c)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {youChart ? (
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
      ) : null}
    </div>
  );
}
