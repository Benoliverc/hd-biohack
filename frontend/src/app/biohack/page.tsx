"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BiohackingEntitlementGate } from "@/components/BiohackingEntitlementGate";
import { api, type SavedChartRow, type TodayIndicationPayload } from "@/lib/api";
import { useApp, type NatalChartSummary } from "@/lib/store";
import { displayCenter } from "@/lib/hdCopy";
import { formatResetsInHkt } from "@/lib/timezone";
import { youChipLabel } from "@/lib/youChipLabel";

type InvItem = { id: number; name: string; notes: string };

type PlanItem = {
  when: string;
  item: string;
  dose_hint?: string;
  why?: string;
  in_inventory?: boolean;
  priority?: number;
};

type StackItem = {
  name: string;
  note: string;
  action?: string;
  center?: string;
  center_status?: string;
  in_inventory?: boolean;
};

const STARTER_SUPPLEMENTS = [
  "Magnesium Glycinate",
  "Omega-3",
  "Vitamin D3",
  "Creatine",
  "Ashwagandha",
] as const;

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

function hkDayKey(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function completionsKey(userId: number, chartId: number, day: string): string {
  return `hd-biohack:protocol-done:v1:${userId}:${chartId}:${day}`;
}

function loadCompletions(key: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveCompletions(key: string, map: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

type CheckItem = {
  id: string;
  label: string;
  sub?: string;
  why?: string;
  inInventory?: boolean;
};

type TimedLeadSnap = { id: string; item: string; inInventory?: boolean };

function sanitizeWhy(why: string | undefined, inInventory: boolean | undefined): string | undefined {
  if (!why) return undefined;
  // Never claim shelf ownership on unowned / behavior rows without a kit badge.
  if (inInventory) return why;
  const cleaned = why
    .replace(/\s*You already own something like this[^.]*\.\s*/gi, " ")
    .replace(/\s*[Pp]refer what you already own[^.]*\.?\s*/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return cleaned || undefined;
}

function snapTimedLeads(proto: Record<string, unknown> | null): TimedLeadSnap[] {
  if (!proto) return [];
  const daily = (proto.daily_plan as Record<string, unknown>) || null;
  if (!daily) return [];
  const out: TimedLeadSnap[] = [];
  for (const slot of ["morning", "midday", "evening"] as const) {
    const row = ((daily[slot] as PlanItem[]) || [])[0];
    if (!row) continue;
    out.push({ id: slot, item: row.item, inInventory: row.in_inventory });
  }
  return out;
}

function slotTitle(id: string): string {
  if (id === "morning") return "Morning";
  if (id === "midday") return "Midday";
  if (id === "evening") return "Evening";
  return id;
}

function bareItemName(item: string): string {
  return item.replace(/\s*\(consider adding\)\s*$/i, "").trim();
}

function announceKitChange(
  before: TimedLeadSnap[],
  after: TimedLeadSnap[],
  kind: "add" | "remove",
  name: string
): string {
  for (const slot of ["morning", "midday", "evening"]) {
    const b = before.find((x) => x.id === slot);
    const a = after.find((x) => x.id === slot);
    if (!a) continue;
    const itemChanged = !b || b.item !== a.item;
    const invChanged = !b || Boolean(b.inInventory) !== Boolean(a.inInventory);
    if (itemChanged || invChanged) {
      if (a.inInventory) {
        return `Plan updated · ${slotTitle(slot)} now uses ${bareItemName(a.item)} (from your kit)`;
      }
      return `Plan updated · ${slotTitle(slot)} now uses ${a.item}`;
    }
  }
  if (kind === "remove") {
    return `Removed ${name} · plan refreshed`;
  }
  return `Kit updated · Today's Move unchanged for this weather`;
}


export default function BiohackPage() {
  const { user, natalChartId, natalBindingLoading, biohackingUnlocked, setNatalChart } = useApp();
  const [youChart, setYouChart] = useState<NatalChartSummary | null>(null);
  const [youReady, setYouReady] = useState(false);
  const [protocol, setProtocol] = useState<Record<string, unknown> | null>(null);
  const [indication, setIndication] = useState<TodayIndicationPayload | null>(null);
  const [inventory, setInventory] = useState<InvItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invName, setInvName] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoTried, setAutoTried] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [invFeedback, setInvFeedback] = useState<string | null>(null);
  const [kitStatus, setKitStatus] = useState<string | null>(null);
  const [focusInvId, setFocusInvId] = useState<number | null>(null);
  const [natalOpen, setNatalOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [baselineKitOpen, setBaselineKitOpen] = useState(false);
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});
  const inventoryRef = useRef<HTMLDivElement | null>(null);
  const dayKey = hkDayKey();

  const refreshInventory = useCallback(async () => {
    if (!user) {
      setInventory([]);
      return;
    }
    const list = await api.inventory(user.id);
    setInventory(list);
  }, [user]);

  // Resolve You natal independently of friend sticky.
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
        if (summary && natalChartId !== summary.id) {
          setNatalChart(summary);
        } else if (!summary && natalChartId != null) {
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
    setProtocol(null);
    setIndication(null);
    setError(null);
    setNatalOpen(false);
    setAutoTried(false);
    setKitStatus(null);
  }, [user?.id, youChart?.id]);

  useEffect(() => {
    let cancelled = false;
    setInventory([]);
    setInvName("");
    setInvFeedback(null);
    setFocusInvId(null);
    setRemovingId(null);
    if (!user) {
      setInventoryLoading(false);
      return;
    }
    setInventoryLoading(true);
    (async () => {
      try {
        const list = await api.inventory(user.id);
        if (!cancelled) setInventory(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setInventoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    // Collapse natal when a new protocol arrives — never yank kit panel shut mid-edit.
    if (protocol) {
      setNatalOpen(false);
    }
  }, [protocol]);

  // Persist completions per user+chart+HKT day
  useEffect(() => {
    if (!user || !youChart) {
      setDoneMap({});
      return;
    }
    setDoneMap(loadCompletions(completionsKey(user.id, youChart.id, dayKey)));
  }, [user?.id, youChart?.id, dayKey]);

  const toggleDone = useCallback(
    (id: string) => {
      if (!user || !youChart) return;
      setDoneMap((prev) => {
        const next = { ...prev, [id]: !prev[id] };
        saveCompletions(completionsKey(user.id, youChart.id, dayKey), next);
        return next;
      });
    },
    [user, youChart, dayKey]
  );

  const loadProtocol = useCallback(
    async (opts?: { rebuild?: boolean }) => {
      if (!user || !youChart) return null;
      setLoading(true);
      setError(null);
      try {
        const [protoRes, transitRes] = await Promise.all([
          api.protocol(user.id, youChart.id),
          api.transitsToday(youChart.id),
        ]);
        setProtocol(protoRes.protocol);
        // Prefer shared derive from /transits/today for weather strip parity with Today
        setIndication(transitRes.indication ?? protoRes.indication ?? null);
        setNatalOpen(false);
        await refreshInventory();
        if (opts?.rebuild) {
          /* explicit refresh — same path */
        }
        return protoRes.protocol as Record<string, unknown>;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, youChart, refreshInventory]
  );

  // Auto-load today's protocol on enter (no Generate ritual)
  useEffect(() => {
    if (!biohackingUnlocked) return;
    if (natalBindingLoading || !youReady) return;
    if (!user || !youChart) {
      setAutoTried(true);
      return;
    }
    if (protocol || loading || autoTried) return;
    setAutoTried(true);
    void loadProtocol();
  }, [
    biohackingUnlocked,
    natalBindingLoading,
    youReady,
    user,
    youChart,
    protocol,
    loading,
    autoTried,
    loadProtocol,
  ]);

  const addInv = async (preset?: string) => {
    if (!user) return;
    const name = (preset ?? invName).trim();
    if (!name) return;
    setAdding(true);
    setError(null);
    setInvFeedback(null);
    setKitStatus(null);
    const before = snapTimedLeads(protocol);
    try {
      const res = await api.addInventory(user.id, name);
      await refreshInventory();
      setInvName("");
      setFocusInvId(res.id);
      setInvFeedback(res.duplicate ? `Already in kit: ${res.name}` : `Added ${res.name}`);
      setInventoryOpen(true);
      if (protocol) {
        const next = await loadProtocol({ rebuild: true });
        if (!res.duplicate) {
          setKitStatus(announceKitChange(before, snapTimedLeads(next), "add", res.name));
        }
      } else if (!res.duplicate) {
        setKitStatus(`Added ${res.name} to your kit`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAdding(false);
    }
  };

  const removeInv = async (item: InvItem) => {
    if (!user) return;
    setRemovingId(item.id);
    setError(null);
    setKitStatus(null);
    const before = snapTimedLeads(protocol);
    try {
      await api.removeInventory(user.id, item.id);
      await refreshInventory();
      if (focusInvId === item.id) setFocusInvId(null);
      if (protocol) {
        const next = await loadProtocol({ rebuild: true });
        setKitStatus(announceKitChange(before, snapTimedLeads(next), "remove", item.name));
      } else {
        setKitStatus(`Removed ${item.name} · plan refreshed`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRemovingId(null);
    }
  };

  const openInventory = () => {
    setInventoryOpen(true);
    requestAnimationFrame(() => {
      inventoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const summary = (protocol?.summary as Record<string, unknown>) || null;
  const daily = (protocol?.daily_plan as Record<string, unknown>) || null;
  const weekly = (protocol?.weekly_plan as Record<string, unknown>) || null;
  const baseline = (protocol?.natal_baseline as Record<string, unknown>) || null;
  const labels = (protocol?.labels as Record<string, string>) || {};
  const weeklyThemeObj = (protocol?.weekly_theme as Record<string, unknown>) || null;

  const asOfLabel = formatResetsInHkt();
  const resolvingYou = natalBindingLoading || !youReady;

  const checkItems = useMemo(() => {
    if (!daily || !summary) return [] as CheckItem[];
    const heroTitle = String(
      (daily.hero as { title?: string } | undefined)?.title || summary.headline || "Today's move"
    );
    const heroWhy = String(
      (daily.hero as { why?: string } | undefined)?.why || summary.in_short || ""
    );
    const heroMicro = String(
      (daily.hero as { micro?: string } | undefined)?.micro || summary.micro || ""
    );
    const items: CheckItem[] = [
      {
        id: "hero",
        label: heroTitle,
        sub: heroMicro || undefined,
        why: heroWhy || undefined,
      },
    ];
    for (const slot of ["morning", "midday", "evening"] as const) {
      const row = ((daily[slot] as PlanItem[]) || [])[0];
      if (!row) continue;
      const slotLabel = slot === "morning" ? "Morning" : slot === "midday" ? "Midday" : "Evening";
      const inInv = Boolean(row.in_inventory);
      items.push({
        id: slot,
        label: `${slotLabel}: ${row.item}`,
        sub: row.when || undefined,
        why: sanitizeWhy(row.why, inInv),
        inInventory: inInv,
      });
    }
    return items;
  }, [daily, summary]);

  const timedLeadsAllBehavior = useMemo(() => {
    const timed = checkItems.filter((it) => it.id !== "hero");
    return timed.length > 0 && timed.every((it) => !it.inInventory);
  }, [checkItems]);

  const doneCount = checkItems.filter((it) => doneMap[it.id]).length;

  const refreshDisabled =
    loading || adding || !user || resolvingYou || !youChart || !biohackingUnlocked;

  const unlockedBody = (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <button
          type="button"
          data-testid="refresh-protocol"
          disabled={refreshDisabled}
          onClick={() => void loadProtocol({ rebuild: true })}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-elevated px-4 py-2.5 text-sm font-medium text-fg hover:border-growth disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Building…" : "Refresh"}
        </button>
      </div>
      {kitStatus && (
        <div
          className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-growth/40 bg-growth-soft px-3 py-2.5 text-sm text-growth-ink"
          data-testid="kit-status"
          role="status"
        >
          <span>{kitStatus}</span>
          <button
            type="button"
            className="shrink-0 text-xs text-fg-muted underline-offset-2 hover:underline"
            onClick={() => setKitStatus(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      {error && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-danger">
          <span>{error}</span>
          <button
            type="button"
            disabled={loading}
            onClick={() => void loadProtocol({ rebuild: true })}
            className="underline underline-offset-2 disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      )}

      {resolvingYou && (
        <p className="text-sm text-fg-muted" data-testid="protocols-resolving-you">
          Looking up your natal chart…
        </p>
      )}

      {!resolvingYou && !youChart && (
        <div
          className="rounded-2xl border border-dashed border-border bg-elevated/60 px-5 py-8 text-center"
          data-testid="protocol-empty-no-you"
        >
          <p className="text-base font-semibold text-fg">Save your chart first</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-fg-secondary">
            Protocols is for you only — friends stay on Chart &amp; Soul.
          </p>
          <Link
            href="/profile"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse"
          >
            Open Chart
          </Link>
        </div>
      )}

      {youChart && loading && !protocol && (
        <div className="space-y-3" data-testid="protocol-skeleton" aria-busy>
          <div className="h-16 animate-pulse rounded-2xl bg-sunken" />
          <div className="h-40 animate-pulse rounded-2xl bg-sunken" />
          <div className="h-24 animate-pulse rounded-2xl bg-sunken" />
        </div>
      )}

      {protocol && indication && (
        <WeatherStrip
          indication={indication}
          asOfLabel={asOfLabel}
          weeklyTheme={weeklyThemeObj}
          skyNote={String(
            (weekly as { sky_note?: string } | null)?.sky_note ||
              protocol.daily_directive ||
              ""
          )}
        />
      )}

      {(protocol || youChart) && (
        <KitStrip
          count={inventory.length}
          loading={inventoryLoading}
          onEdit={openInventory}
          onAddStarter={(name) => void addInv(name)}
          adding={adding}
          disabled={!user || adding || inventoryLoading || resolvingYou}
        />
      )}

      {protocol && daily && (
        <TodaysMoveCard
          items={checkItems}
          doneMap={doneMap}
          onToggle={toggleDone}
          doneCount={doneCount}
          doList={(daily.do as string[]) || []}
          dontList={(daily.dont as string[]) || []}
          baselineKit={(daily.baseline_kit as PlanItem[]) || []}
          baselineKitOpen={baselineKitOpen}
          onToggleBaseline={() => setBaselineKitOpen((v) => !v)}
          showNoKitFootnote={timedLeadsAllBehavior && inventory.length > 0}
        />
      )}

      {protocol && weekly && (
        <WeekSkyCard
          theme={String(weekly.theme || "")}
          skyNote={String(weekly.sky_note || protocol.daily_directive || "")}
        />
      )}

      {protocol && (
        <NatalBaselineCard
          open={natalOpen}
          onToggle={() => setNatalOpen((v) => !v)}
          baseline={baseline}
          labels={labels}
        />
      )}

      <div ref={inventoryRef}>
        <InventoryPanel
          open={inventoryOpen}
          onToggle={() => setInventoryOpen((v) => !v)}
          inventory={inventory}
          inventoryLoading={inventoryLoading}
          natalBindingLoading={resolvingYou}
          invName={invName}
          setInvName={setInvName}
          adding={adding}
          removingId={removingId}
          invFeedback={invFeedback}
          focusInvId={focusInvId}
          user={Boolean(user)}
          addInv={addInv}
          removeInv={removeInv}
        />
      </div>

      <p className="text-xs text-energy-ink/90">
        For informational and energetic optimization purposes only; not medical advice. Consult a
        qualified clinician before changing supplements or lifestyle protocols.
      </p>
    </div>
  );

  return (
    <div className="space-y-5">
      <ProtocolsHeader
        youChart={youChart}
        resolvingYou={resolvingYou}
        biohackingUnlocked={biohackingUnlocked}
        asOfLabel={asOfLabel}
      />

      <BiohackingEntitlementGate blurredPreview={<LockedPaywallMock />}>
        {unlockedBody}
      </BiohackingEntitlementGate>
    </div>
  );
}

/* ─── Header ────────────────────────────────────────────────────────────── */

function ProtocolsHeader({
  youChart,
  resolvingYou,
  biohackingUnlocked,
  asOfLabel,
}: {
  youChart: NatalChartSummary | null;
  resolvingYou: boolean;
  biohackingUnlocked: boolean;
  asOfLabel: string | null;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-fg">Protocols</h1>
        {asOfLabel && <p className="mt-1 text-xs text-fg-muted">{asOfLabel}</p>}
        <p className="mt-1 text-sm text-fg-muted">Do the sky — timed plan for today.</p>
      </div>
      <div className="flex flex-col items-start gap-1.5 sm:items-end">
        {resolvingYou ? (
          <div
            className="inline-flex h-10 min-w-[10rem] animate-pulse items-center rounded-full border border-border bg-sunken px-3"
            aria-hidden
          />
        ) : youChart ? (
          <>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 text-xs font-medium text-fg"
              title="Protocols always uses your chart"
              data-testid="protocols-you-chip"
            >
              {youChipLabel(youChart)}
            </span>
          </>
        ) : (
          <div
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-elevated px-3 py-1.5 text-sm text-fg-muted shadow-soft"
            data-testid="protocols-you-empty"
          >
            <span>No You chart</span>
            <Link href="/profile" className="font-medium text-growth underline-offset-2 hover:underline">
              Save on Chart
            </Link>
          </div>
        )}
      </div>
      {!biohackingUnlocked && (
        <p className="w-full text-xs text-fg-muted sm:order-last">
          Pro unlocks Today&apos;s Move, this week, and your kit.
        </p>
      )}
    </header>
  );
}

/* ─── Weather strip ─────────────────────────────────────────────────────── */

function WeatherStrip({
  indication,
  asOfLabel,
  weeklyTheme,
  skyNote,
}: {
  indication: TodayIndicationPayload;
  asOfLabel: string | null;
  weeklyTheme: Record<string, unknown> | null;
  skyNote: string;
}) {
  const sunEarth =
    weeklyTheme && (weeklyTheme.summary || weeklyTheme.sun_gate)
      ? String(weeklyTheme.summary || `Sun ${weeklyTheme.sun_gate} / Earth ${weeklyTheme.earth_gate}`)
      : null;
  const bridgeBit = skyNote.includes("Channel")
    ? skyNote.split(".")[0]
    : skyNote.slice(0, 120);

  return (
    <section
      className="rounded-2xl border border-energy/40 bg-energy/10 px-4 py-3"
      data-testid="protocols-weather"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-energy/50 bg-elevated px-2.5 py-0.5 text-xs font-semibold text-energy-ink">
          {indication.energy_label}
        </span>
        <span className="rounded-full border border-border bg-elevated px-2.5 py-0.5 text-xs font-medium text-fg">
          {indication.preferred_space_label}
        </span>
        {asOfLabel && <span className="text-[11px] text-fg-muted">{asOfLabel}</span>}
      </div>
      {sunEarth && <p className="mt-2 text-sm text-fg">{sunEarth}</p>}
      {bridgeBit && <p className="mt-1 text-xs text-fg-muted">{bridgeBit}</p>}
      <p className="mt-2 text-[11px] text-fg-muted">
        Same Energy / Space as{" "}
        <Link href="/transits" className="text-growth underline-offset-2 hover:underline">
          Today
        </Link>
        .
      </p>
    </section>
  );
}

/* ─── Today's Move ──────────────────────────────────────────────────────── */

function TodaysMoveCard({
  items,
  doneMap,
  onToggle,
  doneCount,
  doList,
  dontList,
  baselineKit,
  baselineKitOpen,
  onToggleBaseline,
  showNoKitFootnote,
}: {
  items: CheckItem[];
  doneMap: Record<string, boolean>;
  onToggle: (id: string) => void;
  doneCount: number;
  doList: string[];
  dontList: string[];
  baselineKit: PlanItem[];
  baselineKitOpen: boolean;
  onToggleBaseline: () => void;
  showNoKitFootnote?: boolean;
}) {
  return (
    <section
      className="space-y-4 rounded-2xl border border-growth/40 bg-growth-soft p-5"
      data-testid="todays-move"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-growth-ink">Today&apos;s Move</h2>
        {items.length > 0 && (
          <span className="text-xs text-fg-muted" data-testid="protocol-done-count">
            {doneCount}/{items.length} done
          </span>
        )}
      </div>

      <ul className="space-y-2">
        {items.map((it, idx) => {
          const checked = Boolean(doneMap[it.id]);
          return (
            <li key={it.id}>
              <label
                className={`flex cursor-pointer gap-3 rounded-xl border px-3 py-2.5 ${
                  checked
                    ? "border-growth/50 bg-elevated/60 opacity-80"
                    : "border-growth/30 bg-elevated/90"
                } ${idx === 0 ? "shadow-soft" : ""}`}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--growth,theme(colors.emerald.600))]"
                  checked={checked}
                  onChange={() => onToggle(it.id)}
                  data-testid={`protocol-check-${it.id}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm ${idx === 0 ? "font-semibold text-growth-ink" : "font-medium text-fg"} ${
                        checked ? "line-through" : ""
                      }`}
                    >
                      {it.label}
                    </span>
                    {it.inInventory && (
                      <span
                        className="inline-flex items-center rounded-full bg-growth-soft px-2 py-0.5 text-[12px] font-medium text-growth-ink ring-1 ring-growth/30"
                        data-testid={`from-kit-badge-${it.id}`}
                      >
                        From your kit
                      </span>
                    )}
                  </span>
                  {it.sub && <span className="mt-0.5 block text-[11px] text-fg-muted">{it.sub}</span>}
                  {it.why && <span className="mt-1 block text-xs text-fg-secondary">{it.why}</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {showNoKitFootnote && (
        <p className="text-xs text-fg-muted" data-testid="no-kit-match-footnote">
          No kit item matched today&apos;s weather
        </p>
      )}

      {(doList.length > 0 || dontList.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-growth/30 bg-elevated/70 p-3">
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-growth-ink">
              Do
            </h3>
            <ul className="list-disc space-y-1 pl-4 text-sm text-fg-secondary">
              {doList.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-energy/40 bg-energy/10 p-3">
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-energy-ink">
              Don&apos;t
            </h3>
            <ul className="list-disc space-y-1 pl-4 text-sm text-fg-secondary">
              {dontList.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {baselineKit.length > 0 && (
        <div className="rounded-xl border border-border/80 bg-elevated/50" data-testid="baseline-kit">
          <button
            type="button"
            onClick={onToggleBaseline}
            className="flex min-h-10 w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-fg-muted"
            aria-expanded={baselineKitOpen}
          >
            <span>Baseline kit (always-on defaults)</span>
            <span>{baselineKitOpen ? "Hide" : "Show"}</span>
          </button>
          {baselineKitOpen && (
            <ul className="space-y-2 border-t border-border px-3 pb-3 pt-2">
              {baselineKit.map((it, i) => (
                <li key={`${it.item}-${i}`} className="text-sm text-fg-secondary">
                  <span className="font-medium text-fg">{it.item}</span>
                  {it.when && <span className="text-fg-muted"> · {it.when}</span>}
                  {it.why && <p className="text-xs text-fg-muted">{it.why}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}


/* ─── Kit strip (above-fold) ─────────────────────────────────────────────── */

function KitStrip({
  count,
  loading,
  onEdit,
  onAddStarter,
  adding,
  disabled,
}: {
  count: number;
  loading: boolean;
  onEdit: () => void;
  onAddStarter: (name: string) => void;
  adding: boolean;
  disabled: boolean;
}) {
  const empty = !loading && count === 0;
  return (
    <div
      className="rounded-2xl border border-border bg-elevated px-4 py-3"
      data-testid="kit-strip"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-fg">
          <span className="font-semibold">Your kit</span>
          <span className="text-fg-muted"> · {loading ? "…" : count}</span>
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="min-h-9 rounded-lg border border-border bg-sunken px-3 py-1.5 text-xs font-medium text-fg hover:border-growth"
          data-testid="kit-strip-edit"
        >
          {empty ? "Add items" : "Edit"}
        </button>
      </div>
      {empty && (
        <div className="mt-2 space-y-2" data-testid="kit-strip-empty">
          <p className="text-xs text-fg-secondary">
            Add what you own — timed supports prefer your shelf
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_SUPPLEMENTS.map((name) => (
              <button
                key={name}
                type="button"
                disabled={disabled || adding}
                onClick={() => onAddStarter(name)}
                className="rounded-full border border-border bg-sunken px-2.5 py-1 text-[11px] text-fg-secondary hover:border-growth disabled:opacity-50"
                data-testid={`kit-starter-${name}`}
              >
                +{name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Week: theme + sky only ────────────────────────────────────────────── */

function WeekSkyCard({ theme, skyNote }: { theme: string; skyNote: string }) {
  return (
    <section
      className="space-y-2 rounded-2xl border border-border bg-elevated p-5"
      data-testid="week-plan"
    >
      <h2 className="text-lg font-semibold text-energy-ink">This week</h2>
      {theme && (
        <p className="text-sm text-fg" data-testid="week-theme">
          {theme}
        </p>
      )}
      {skyNote && (
        <div
          className="rounded-xl border border-energy/40 bg-energy/10 px-4 py-3"
          data-testid="week-sky-note"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-energy-ink">
            Sky · this week
          </p>
          <p className="mt-1.5 text-sm text-fg-secondary">{skyNote}</p>
        </div>
      )}
    </section>
  );
}

/* ─── Natal baseline (collapsed) ────────────────────────────────────────── */

function NatalBaselineCard({
  open,
  onToggle,
  baseline,
  labels,
}: {
  open: boolean;
  onToggle: () => void;
  baseline: Record<string, unknown> | null;
  labels: Record<string, string>;
}) {
  return (
    <div
      className="rounded-2xl border border-growth/40 bg-growth-soft/40"
      data-testid="natal-baseline-card"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block text-sm font-semibold text-growth-ink">Natal baseline</span>
          <span className="block text-xs text-fg-muted">Always-on for this chart</span>
        </span>
        <span className="shrink-0 text-xs text-fg-muted">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-growth/30 px-4 pb-4 pt-3">
          {baseline ? (
            <>
              <h3 className="text-base font-semibold text-growth-ink">
                {labels.natal_baseline || String(baseline.label || "Standard care for your chart")}
              </h3>
              <p className="text-sm text-fg-secondary">{String(baseline.description || "")}</p>
              <div className="grid gap-3 md:grid-cols-3">
                <BaselineColumn
                  title="Emphasize"
                  tone="growth"
                  items={(baseline.emphasize as StackItem[]) || []}
                />
                <BaselineColumn
                  title="Increase"
                  tone="recovery"
                  items={(baseline.increase as StackItem[]) || []}
                />
                <BaselineColumn
                  title="Decrease or pause"
                  tone="energy"
                  items={(baseline.decrease_or_pause as StackItem[]) || []}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-fg-muted">No natal baseline in this protocol.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Inventory ─────────────────────────────────────────────────────────── */

function InventoryPanel({
  open,
  onToggle,
  inventory,
  inventoryLoading,
  natalBindingLoading,
  invName,
  setInvName,
  adding,
  removingId,
  invFeedback,
  focusInvId,
  user,
  addInv,
  removeInv,
}: {
  open: boolean;
  onToggle: () => void;
  inventory: InvItem[];
  inventoryLoading: boolean;
  natalBindingLoading: boolean;
  invName: string;
  setInvName: (v: string) => void;
  adding: boolean;
  removingId: number | null;
  invFeedback: string | null;
  focusInvId: number | null;
  user: boolean;
  addInv: (name?: string) => Promise<unknown>;
  removeInv: (item: InvItem) => Promise<void>;
}) {
  const count = inventory.length;
  return (
    <div className="rounded-2xl border border-border bg-elevated" data-testid="inventory-panel">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-fg">
          Your kit{count > 0 ? ` (${count})` : ""}
        </span>
        <span className="text-xs text-fg-muted">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="mb-3 text-xs text-fg-muted">
            Items in your kit are preferred in today&apos;s timed supports.
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            <input
              className="min-w-[12rem] flex-1 rounded-lg border border-border bg-sunken px-3 py-2 text-sm"
              placeholder="Add supplement you own"
              value={invName}
              disabled={!user || adding || inventoryLoading || natalBindingLoading}
              onChange={(e) => setInvName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void addInv();
                }
              }}
            />
            <button
              type="button"
              disabled={!user || adding || inventoryLoading || natalBindingLoading || !invName.trim()}
              onClick={() => void addInv()}
              className="min-h-10 rounded-xl border border-border px-3 py-2 text-sm hover:border-growth disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add to kit"}
            </button>
          </div>
          {invFeedback && (
            <p className="mb-2 text-xs text-growth" role="status">
              {invFeedback}
            </p>
          )}
          {!inventoryLoading && !natalBindingLoading && inventory.length === 0 && (
            <div className="mb-3">
              <p className="mb-2 text-sm text-fg-muted">No supplements saved yet — tap a starter:</p>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_SUPPLEMENTS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    disabled={!user || adding}
                    data-testid={`starter-${name.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => void addInv(name)}
                    className="min-h-10 rounded-full border border-growth/40 bg-growth-soft px-3 py-2 text-xs text-growth hover:border-growth disabled:opacity-50"
                  >
                    + {name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {inventoryLoading || natalBindingLoading ? (
            <p className="text-sm text-fg-muted">Loading kit…</p>
          ) : inventory.length === 0 ? null : (
            <ul className="flex flex-wrap gap-2">
              {inventory.map((it) => (
                <li
                  key={it.id}
                  className={`inline-flex items-center gap-1 rounded-full border bg-sunken py-1 pl-3 pr-1 text-xs text-fg ${
                    focusInvId === it.id
                      ? "border-growth ring-2 ring-growth/40"
                      : "border-border"
                  }`}
                >
                  <span>{it.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${it.name}`}
                    disabled={removingId === it.id || adding}
                    onClick={() => void removeInv(it)}
                    className="inline-flex h-6 w-6 min-h-6 items-center justify-center rounded-full text-fg-muted hover:bg-sunken hover:text-danger disabled:opacity-50"
                  >
                    {removingId === it.id ? "…" : "×"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Locked preview ────────────────────────────────────────────────────── */

function LockedPaywallMock() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="rounded-2xl border border-energy/40 bg-energy/10 p-4">
        <p className="text-sm font-semibold text-energy-ink">Weather · Energy · Space</p>
        <div className="mt-2 h-8 rounded-lg bg-elevated/60" />
      </div>
      <div className="rounded-2xl border border-growth/40 bg-growth-soft p-5">
        <p className="text-lg font-semibold text-growth-ink">Today&apos;s Move</p>
        <p className="mt-2 text-sm text-fg-secondary">Main action + Morning · Midday · Evening</p>
        <div className="mt-3 space-y-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-10 rounded-xl border border-border bg-elevated/80" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-elevated p-5">
        <p className="text-lg font-semibold text-energy-ink">This week</p>
        <p className="mt-2 text-sm text-fg-secondary">Sun/Earth theme + one sky note</p>
      </div>
    </div>
  );
}

function BaselineColumn({
  title,
  items,
  tone,
}: {
  title: string;
  items: StackItem[];
  tone: "growth" | "recovery" | "energy";
}) {
  const border =
    tone === "growth"
      ? "border-growth/40"
      : tone === "recovery"
        ? "border-recovery/50"
        : "border-energy/40";
  return (
    <div className={`rounded-xl border ${border} bg-sunken/70 p-3`}>
      <h3 className="mb-2 text-sm font-semibold text-fg">{title}</h3>
      {items.length === 0 && <p className="text-xs text-fg-muted">None for this chart slice.</p>}
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={`${it.name}-${it.center}`} className="rounded-lg bg-elevated px-3 py-2 text-sm">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="min-w-0 font-medium text-fg">{it.name}</span>
              {it.in_inventory && (
                <span className="shrink-0 whitespace-nowrap text-[10px] font-medium tracking-wide text-growth">
                  From your kit
                </span>
              )}
            </div>
            {it.center && (
              <div className="mt-0.5 text-xs tracking-wide text-fg-muted">
                {it.center === "Type"
                  ? `Type · ${it.center_status}`
                  : `${displayCenter(it.center)} · ${it.center_status}`}
              </div>
            )}
            <div className="text-xs text-fg-muted">{it.note}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
