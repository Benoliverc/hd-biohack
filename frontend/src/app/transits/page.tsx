import { useI18n } from "@/lib/i18n";
"use client";

import { useEffect, useState } from "react";
import { api, type SavedChartRow } from "@/lib/api";
import {
  formatNatalOverlayLabel,
  useApp,
  type NatalChartSummary,
} from "@/lib/store";
import { displayCenter, formatGateLine } from "@/lib/hdCopy";
import { formatResetsInHkt } from "@/lib/timezone";
import TodayIndication from "@/components/TodayIndication";
import type { TodayIndicationPayload } from "@/lib/api";
import { youChipLabel } from "@/lib/youChipLabel";

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
  const { user, natalChartId, natalBindingLoading, setNatalChart } = useApp();
  const [youChart, setYouChart] = useState<NatalChartSummary | null>(null);
  const [youReady, setYouReady] = useState(false);
  const [data, setData] = useState<{
    transit: Record<string, unknown>;
    overlay: Record<string, unknown> | null;
    indication: TodayIndicationPayload | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolve You natal independently of friend sticky; never pass a friend id to the API.
  useEffect(() => {
    if (!user) {
      setYouChart(null);
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
          setYouReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, natalBindingLoading, natalChartId, setNatalChart]);

  useEffect(() => {
    if (natalBindingLoading || !youReady) {
      setLoading(true);
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    api
      .transitsToday(youChart?.id)
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
  }, [youChart?.id, youReady, natalBindingLoading]);

  const activations =
    ((data?.transit?.activations as Array<Record<string, unknown>>) || []);
  const sunEarth = data?.transit?.sun_earth as
    | { sun: Record<string, unknown>; earth: Record<string, unknown> }
    | undefined;
  const overlay = data?.overlay;
  const asOfLabel = formatResetsInHkt();
  const resolvingYou = natalBindingLoading || !youReady;

  const bridged = ((overlay?.bridged_channels as Array<Record<string, unknown>>) || []);
  const newlyDefined = ((overlay?.newly_defined_centers as string[]) || []);
  // Overlay tips only — Main action owns the primary do-statement (TodayIndication).
  // Never parallel Main action with a competing do-list section.
  const conditioningNotes: string[] = [];
  if (newlyDefined.length > 0) {
    conditioningNotes.push(
      `Temporary energy in ${newlyDefined.map(displayCenter).join(", ")} — expect unfamiliar pressure; don't over-identify.`
    );
  } else if (bridged.length > 0) {
    const first = bridged[0];
    conditioningNotes.push(
      `A bridge may be active (${String(first.name)}) — watch who/what feels magnetic today.`
    );
  }
  if (conditioningNotes.length === 0 && !loading) {
    conditioningNotes.push(
      youChart
        ? t("page.today.noSpike")
        : t("page.today.skyOnly")
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("page.today.h1")}</h1>
          {resolvingYou ? (
            <p className="text-sm text-fg-muted">{t("page.today.lookingUp")}</p>
          ) : youChart ? (
            <div className="mt-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 text-xs font-medium text-fg"
                  title={t("page.today.alwaysUsesChart")}
                  data-testid="today-you-chip"
                >
                  {youChipLabel(youChart)}
                </span>
              </div>
              <p className="text-xs text-fg-muted">{t("page.today.friendsStay")}</p>
              <p className="text-xs text-fg-muted">
                Overlaying {formatNatalOverlayLabel(youChart)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-fg-muted">
              {t("page.today.savePrompt")}
            </p>
          )}
          {asOfLabel && (
            <p className="mt-1 text-xs text-fg-muted">{asOfLabel}</p>
          )}
        </div>
      </div>

      {resolvingYou && (
        <div className="rounded-xl border border-border bg-elevated px-4 py-3">
          <p className="text-sm text-fg-muted">{t("page.today.lookingUp")}</p>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <TodayIndication
        indication={data?.indication}
        loading={loading && !data}
        error={error}
        bindingLoading={resolvingYou}
        youLabel={youChart ? youChipLabel(youChart) : null}
        asOfLabel={asOfLabel}
      />

      {!loading && conditioningNotes.length > 0 && (
        <div
          className="rounded-2xl border border-border bg-elevated/70 p-5"
          data-testid="conditioning-notes"
        >
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-muted">
            {t("page.today.conditioningNotes")}
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-fg-secondary">
            {conditioningNotes.slice(0, 3).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {sunEarth && (
        <div className="rounded-2xl border border-energy/40 bg-energy/10 p-5">
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

      {overlay && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-4">
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
          <div className="rounded-2xl border border-border p-4">
            <h2 className="mb-2 font-semibold">{t("page.today.newlyDefined")}</h2>
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
