"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BiohackingEntitlementGate } from "@/components/BiohackingEntitlementGate";
import { api } from "@/lib/api";
import { formatNatalOverlayLabel, useApp, type NatalChartSummary } from "@/lib/store";
import { displayCenter } from "@/lib/hdCopy";

type InvItem = { id: number; name: string; notes: string };

type StackItem = {
  name: string;
  note: string;
  action?: string;
  center?: string;
  center_status?: string;
  in_inventory?: boolean;
};

type PlanItem = {
  when: string;
  item: string;
  dose_hint?: string;
  why?: string;
  in_inventory?: boolean;
  priority?: number;
};

type HabitItem = {
  cadence: string;
  action: string;
  why?: string;
};

const STARTER_SUPPLEMENTS = [
  "Magnesium Glycinate",
  "Omega-3",
  "Vitamin D3",
  "Creatine",
  "Ashwagandha",
] as const;

export default function BiohackPage() {
  const { user, natalChartId, natalChart, natalBindingLoading, biohackingUnlocked } = useApp();
  const [protocol, setProtocol] = useState<Record<string, unknown> | null>(null);
  const [inventory, setInventory] = useState<InvItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invName, setInvName] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [invFeedback, setInvFeedback] = useState<string | null>(null);
  const [focusInvId, setFocusInvId] = useState<number | null>(null);
  const [natalOpen, setNatalOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const inventoryRef = useRef<HTMLDivElement | null>(null);

  const refreshInventory = useCallback(async () => {
    if (!user) {
      setInventory([]);
      return;
    }
    const list = await api.inventory(user.id);
    setInventory(list);
  }, [user]);

  useEffect(() => {
    setProtocol(null);
    setError(null);
    setNatalOpen(false);
  }, [user?.id, natalChartId]);

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

  // Accordion default: collapsed when a plan exists; open when inventory empty and no plan.
  useEffect(() => {
    if (protocol) {
      setInventoryOpen(false);
    } else if (!inventoryLoading && inventory.length === 0) {
      setInventoryOpen(false);
    }
  }, [protocol, inventoryLoading, inventory.length]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.protocol(user.id, natalChartId ?? undefined);
      setProtocol(res.protocol);
      setNatalOpen(false);
      await refreshInventory();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const flashFocus = (id: number, message: string) => {
    setFocusInvId(id);
    setInvFeedback(message);
    window.setTimeout(() => {
      setFocusInvId((cur) => (cur === id ? null : cur));
      setInvFeedback((cur) => (cur === message ? null : cur));
    }, 2200);
  };

  const addInv = async (overrideName?: string) => {
    if (!user) return;
    const name = (overrideName ?? invName).trim();
    if (!name) return;
    const existing = inventory.find((it) => it.name.trim().toLowerCase() === name.toLowerCase());
    if (existing) {
      setInvName("");
      flashFocus(existing.id, `Already in inventory: ${existing.name}`);
      return existing;
    }
    setAdding(true);
    setError(null);
    setInvFeedback(null);
    try {
      const res = await api.addInventory(user.id, name);
      setInvName("");
      await refreshInventory();
      if (res.duplicate) {
        flashFocus(res.id, `Already in inventory: ${res.name}`);
      } else {
        flashFocus(res.id, `Added ${res.name}`);
      }
      return res;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setAdding(false);
    }
  };

  const generateProtocol = async () => {
    if (!user) return;
    const draft = invName.trim();
    if (draft) {
      await addInv(draft);
    }
    await load();
  };

  const removeInv = async (item: InvItem) => {
    if (!user) return;
    setRemovingId(item.id);
    setError(null);
    setInvFeedback(null);
    try {
      await api.removeInventory(user.id, item.id);
      setInventory((prev) => prev.filter((it) => it.id !== item.id));
      setInvFeedback(`Removed ${item.name}`);
      window.setTimeout(() => {
        setInvFeedback((cur) => (cur === `Removed ${item.name}` ? null : cur));
      }, 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRemovingId(null);
    }
  };

  const openInventory = () => {
    setInventoryOpen(true);
    window.requestAnimationFrame(() => {
      inventoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const summary = (protocol?.summary as Record<string, unknown>) || null;
  const daily = (protocol?.daily_plan as Record<string, unknown>) || null;
  const weekly = (protocol?.weekly_plan as Record<string, unknown>) || null;
  const morning = (protocol?.morning_stack as StackItem[]) || [];
  const midday = (protocol?.midday_stack as StackItem[]) || [];
  const evening = (protocol?.evening_stack as StackItem[]) || [];
  const adjusts = (protocol?.what_to_adjust_this_week as string[]) || [];
  const baseline = (protocol?.natal_baseline as Record<string, unknown>) || null;
  const labels = (protocol?.labels as Record<string, string>) || {};

  const chartName =
    natalChart?.label?.trim() ||
    (natalChart ? formatNatalOverlayLabel(natalChart).split(" · ")[0] : "your chart");
  const generateDisabled =
    loading || adding || !user || natalBindingLoading || !natalChart;
  const showStickyGenerate = Boolean(biohackingUnlocked && !protocol);

  const generateButton = (
    <button
      type="button"
      data-testid="generate-protocol"
      disabled={generateDisabled}
      onClick={() => void generateProtocol()}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep disabled:opacity-50 sm:w-auto"
    >
      {loading ? "Building…" : protocol ? "Refresh protocol" : "Generate protocol"}
    </button>
  );

  const unlockedBody = (
    <div className={`space-y-4 ${showStickyGenerate ? "pb-24 md:pb-0" : ""}`}>
      <ProtocolActions
        generateButton={generateButton}
        onEditInventory={openInventory}
        helper={
          invName.trim()
            ? "Draft in the inventory box will be added first"
            : natalChart
              ? `Practical day + week plan for ${chartName}`
              : "Pick a chart on Chart first"
        }
        error={error}
        onRetry={error ? () => void generateProtocol() : undefined}
        loading={loading}
      />

      {!protocol && !loading && (
        <ProtocolEmpty chartName={chartName} hasChart={Boolean(natalChart)} />
      )}

      {protocol && (
        <div className="space-y-4">
          {summary && <ProtocolLead summary={summary} />}
          {daily && (
            <TodayPlan
              daily={daily}
              chartLabel={natalChart ? formatNatalOverlayLabel(natalChart) : undefined}
            />
          )}
          {weekly && (
            <WeekPlan
              weekly={weekly}
              dailyDirective={String(protocol.daily_directive || "")}
              adjusts={adjusts}
              morning={morning}
              midday={midday}
              evening={evening}
              daily={daily}
            />
          )}
          <NatalBaselineCard
            open={natalOpen}
            onToggle={() => setNatalOpen((v) => !v)}
            baseline={baseline}
            labels={labels}
          />
        </div>
      )}

      <div ref={inventoryRef}>
        <InventoryPanel
          open={inventoryOpen}
          onToggle={() => setInventoryOpen((v) => !v)}
          inventory={inventory}
          inventoryLoading={inventoryLoading}
          natalBindingLoading={natalBindingLoading}
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
        natalChart={natalChart}
        natalBindingLoading={natalBindingLoading}
        biohackingUnlocked={biohackingUnlocked}
      />

      <BiohackingEntitlementGate blurredPreview={<LockedPaywallMock />}>
        {unlockedBody}
      </BiohackingEntitlementGate>

      {showStickyGenerate && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-canvas/95 px-4 pt-3 shadow-soft backdrop-blur md:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {generateButton}
        </div>
      )}
    </div>
  );
}

/* ─── A. Header + ChartChip ─────────────────────────────────────────────── */

function ProtocolsHeader({
  natalChart,
  natalBindingLoading,
  biohackingUnlocked,
}: {
  natalChart: NatalChartSummary | null;
  natalBindingLoading: boolean;
  biohackingUnlocked: boolean;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold text-fg">Protocols</h1>
      <ChartChip chart={natalChart} loading={natalBindingLoading} />
      {!biohackingUnlocked && (
        <p className="w-full text-xs text-fg-muted sm:order-last">
          Pro unlocks today&apos;s plan, this week, and inventory.
        </p>
      )}
    </header>
  );
}

function ChartChip({
  chart,
  loading,
}: {
  chart: NatalChartSummary | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div
        className="inline-flex h-10 min-w-[12rem] animate-pulse items-center rounded-full border border-border bg-sunken px-3"
        aria-hidden
        data-testid="chart-chip-skeleton"
      />
    );
  }
  if (!chart) {
    return (
      <div
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-elevated px-3 py-1.5 text-sm text-fg-muted shadow-soft"
        data-testid="chart-chip-empty"
      >
        <span>No chart selected</span>
        <Link href="/profile" className="font-medium text-growth underline-offset-2 hover:underline">
          Pick one on Chart
        </Link>
      </div>
    );
  }
  const who = chart.label?.trim() || "Chart";
  const city = chart.birth_city?.trim();
  const date = chart.birth_date?.trim();
  return (
    <div
      className="inline-flex max-w-full items-start gap-2 rounded-2xl border border-border bg-elevated py-1.5 pl-3 pr-2 text-sm text-fg shadow-soft sm:items-center"
      data-testid="chart-chip"
    >
      <div className="min-w-0 flex-1">
        <div className="font-medium leading-snug text-fg">
          {who}{" "}
          <span className="font-normal text-fg-muted">#{chart.id}</span>
        </div>
        {(city || date) && (
          <div className="mt-0.5 text-xs leading-snug text-fg-muted">
            {city ? <span className="break-words">{city}</span> : null}
            {city && date ? " · " : null}
            {date ? <span className="whitespace-nowrap">{date}</span> : null}
          </div>
        )}
      </div>
      <Link
        href="/profile"
        className="shrink-0 self-center rounded-full px-2 py-1 text-xs font-medium text-growth hover:bg-growth-soft"
      >
        Change
      </Link>
    </div>
  );
}

/* ─── B. Actions ────────────────────────────────────────────────────────── */

function ProtocolActions({
  generateButton,
  onEditInventory,
  helper,
  error,
  onRetry,
  loading,
}: {
  generateButton: React.ReactNode;
  onEditInventory: () => void;
  helper: string;
  error: string | null;
  onRetry?: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-2">
      {/* Stacked on narrow screens so Generate/Refresh is never md-only-hidden */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {generateButton}
        <button
          type="button"
          onClick={onEditInventory}
          className="min-h-10 self-start text-sm text-fg-muted underline-offset-2 hover:text-fg hover:underline"
        >
          Edit inventory
        </button>
      </div>
      <p className="text-xs text-fg-muted">{helper}</p>
      {error && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-danger">
          <span>{error}</span>
          {onRetry && (
            <button
              type="button"
              disabled={loading}
              onClick={onRetry}
              className="underline underline-offset-2 disabled:opacity-50"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── C. Empty ──────────────────────────────────────────────────────────── */

function ProtocolEmpty({ chartName, hasChart }: { chartName: string; hasChart: boolean }) {
  return (
    <div
      className="rounded-2xl border border-dashed border-border bg-elevated/60 px-5 py-8 text-center"
      data-testid="protocol-empty"
    >
      <p className="text-base font-semibold text-fg">No plan yet</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-fg-secondary">
        {hasChart
          ? `Generate a practical day + week plan for ${chartName}.`
          : "Save a chart on Chart, then generate today’s plan."}
      </p>
    </div>
  );
}

/* ─── D. Plan body ──────────────────────────────────────────────────────── */

function ProtocolLead({ summary }: { summary: Record<string, unknown> }) {
  const actions = ((summary.top_actions as string[]) || []).slice(0, 5);
  const extra = ((summary.top_actions as string[]) || []).length - actions.length;
  return (
    <section className="rounded-2xl border border-growth/40 bg-growth-soft p-5" data-testid="protocol-lead">
      <p className="text-lg font-semibold text-growth-ink">
        {String(summary.headline || "Today’s plan")}
      </p>
      <p className="mt-2 text-sm text-fg">{String(summary.in_short || "")}</p>
      {actions.length > 0 && (
        <ul className="mt-4 space-y-2">
          {actions.map((a) => (
            <li
              key={a}
              className="flex gap-2 rounded-lg border border-growth/30 bg-elevated/80 px-3 py-2 text-sm text-fg"
            >
              <span className="mt-0.5 text-growth" aria-hidden>
                ☐
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      )}
      {extra > 0 && <p className="mt-2 text-xs text-fg-muted">+{extra} more in Today</p>}
    </section>
  );
}

function TodayPlan({
  daily,
  chartLabel,
}: {
  daily: Record<string, unknown>;
  chartLabel?: string;
}) {
  return (
    <section
      className="space-y-3 rounded-2xl border border-border bg-elevated p-5"
      data-testid="today-plan"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-fg">Today</h2>
        {chartLabel && <span className="text-xs text-fg-muted">{chartLabel}</span>}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <DayColumn title="Morning" items={(daily.morning as PlanItem[]) || []} />
        <DayColumn title="Midday" items={(daily.midday as PlanItem[]) || []} />
        <DayColumn title="Evening" items={(daily.evening as PlanItem[]) || []} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-growth/30 bg-growth-soft/50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-growth-ink">Do</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-fg-secondary">
            {((daily.do as string[]) || []).map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-energy/40 bg-energy/10 p-4">
          <h3 className="mb-2 text-sm font-semibold text-energy-ink">Don&apos;t</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-fg-secondary">
            {((daily.dont as string[]) || []).map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function normKey(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** True if candidate is the same as, or fully contained in, any known string (or vice versa). */
function isNearDuplicate(candidate: string, known: Set<string>): boolean {
  const c = normKey(candidate);
  if (!c) return true;
  if (known.has(c)) return true;
  for (const k of Array.from(known)) {
    if (!k) continue;
    if (c.includes(k) || k.includes(c)) return true;
  }
  return false;
}

function collectTodayKnown(daily: Record<string, unknown> | null, habits: HabitItem[]): Set<string> {
  const known = new Set<string>();
  const add = (s: string) => {
    const k = normKey(s);
    if (k) known.add(k);
  };
  if (daily) {
    for (const slot of ["morning", "midday", "evening"] as const) {
      for (const it of (daily[slot] as PlanItem[]) || []) {
        add(it.item);
        if (it.why) add(it.why);
      }
    }
    for (const d of (daily.do as string[]) || []) add(d);
    for (const d of (daily.dont as string[]) || []) add(d);
  }
  for (const h of habits) {
    add(h.action);
    if (h.why) add(h.why);
  }
  return known;
}

function filterAdjusts(adjusts: string[], known: Set<string>): string[] {
  return adjusts.filter((a) => !isNearDuplicate(a, known));
}

function filterStackItems(items: StackItem[], known: Set<string>): StackItem[] {
  return items.filter((it) => {
    if (isNearDuplicate(it.name, known)) return false;
    if (it.note && isNearDuplicate(it.note, known)) return false;
    return true;
  });
}

function WeekPlan({
  weekly,
  dailyDirective,
  adjusts,
  morning,
  midday,
  evening,
  daily,
}: {
  weekly: Record<string, unknown>;
  dailyDirective: string;
  adjusts: string[];
  morning: StackItem[];
  midday: StackItem[];
  evening: StackItem[];
  daily: Record<string, unknown> | null;
}) {
  const habits = (weekly.habits as HabitItem[]) || [];
  const known = collectTodayKnown(daily, habits);
  const filteredAdjusts = filterAdjusts(adjusts, known);
  const m = filterStackItems(morning, known);
  const mid = filterStackItems(midday, known);
  const eve = filterStackItems(evening, known);
  const showStacks = m.length + mid.length + eve.length > 0;

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-elevated p-5" data-testid="week-plan">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-energy-ink">This week</h2>
        <span className="rounded-full border border-energy/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-energy-ink">
          Habits
        </span>
      </div>

      {(dailyDirective || filteredAdjusts.length > 0) && (
        <div
          className="rounded-xl border border-energy/40 bg-energy/10 px-4 py-3"
          data-testid="week-sky-note"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-energy-ink">
            Sky · this week
          </p>
          {dailyDirective && (
            <p className="mt-1.5 text-sm text-fg-secondary">{dailyDirective}</p>
          )}
          {filteredAdjusts.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-secondary">
              {filteredAdjusts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="text-sm text-fg">{String(weekly.theme || "")}</p>
      <ul className="space-y-2">
        {habits.map((h) => (
          <li
            key={`${h.cadence}-${h.action}`}
            className="rounded-xl border border-border bg-sunken/60 px-3 py-2.5 text-sm"
          >
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="rounded-full bg-energy/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-energy-ink">
                {h.cadence}
              </span>
              <span className="font-medium text-fg">{h.action}</span>
            </div>
            {h.why && <p className="mt-1 text-xs text-fg-muted">{h.why}</p>}
          </li>
        ))}
      </ul>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Emphasize
          </h3>
          <ul className="space-y-1 text-sm text-fg-secondary">
            {((weekly.supplements_to_emphasize as string[]) || []).map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Pause or reduce
          </h3>
          <ul className="space-y-1 text-sm text-fg-secondary">
            {((weekly.supplements_to_pause_or_reduce as string[]) || []).map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
      </div>

      {showStacks && (
        <details className="rounded-xl border border-border bg-sunken/40" data-testid="week-transit-stacks">
          <summary className="cursor-pointer px-3 py-2.5 text-sm font-medium text-fg-muted">
            Transit stacks
          </summary>
          <div className="grid gap-3 border-t border-border p-3 md:grid-cols-3">
            {m.length > 0 && <Stack title="Morning" items={m} />}
            {mid.length > 0 && <Stack title="Midday" items={mid} />}
            {eve.length > 0 && <Stack title="Evening" items={eve} />}
          </div>
        </details>
      )}
    </section>
  );
}

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

/* ─── E. Inventory accordion ────────────────────────────────────────────── */

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
    <div
      className="rounded-2xl border border-border bg-elevated"
      data-testid="inventory-panel"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-fg">
          Your inventory{count > 0 ? ` (${count})` : ""}
        </span>
        <span className="text-xs text-fg-muted">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="mb-3 text-xs text-fg-muted">
            Owned items are prioritized in today&apos;s plan and weekly habits.
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
              {adding ? "Adding…" : "Add to inventory"}
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
            <p className="text-sm text-fg-muted">Loading inventory…</p>
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
      <div className="rounded-2xl border border-growth/40 bg-growth-soft p-5">
        <p className="text-lg font-semibold text-growth-ink">Today&apos;s plan</p>
        <p className="mt-2 text-sm text-fg-secondary">
          Morning · Midday · Evening checklist for your chart
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {["Morning", "Midday", "Evening"].map((t) => (
            <div key={t} className="h-16 rounded-xl border border-border bg-elevated/80" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-energy/40 bg-energy/10 p-5">
        <p className="text-lg font-semibold text-energy-ink">This week</p>
        <p className="mt-2 text-sm text-fg-secondary">Theme, habits, and what to emphasize or pause</p>
        <div className="mt-3 h-12 rounded-xl border border-border bg-elevated/60" />
      </div>
    </div>
  );
}

function DayColumn({ title, items }: { title: string; items: PlanItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-sunken/60 p-3">
      <h3 className="mb-2 text-sm font-semibold text-fg">{title}</h3>
      {items.length === 0 && <p className="text-xs text-fg-muted">Nothing queued.</p>}
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={`${it.item}-${i}`} className="rounded-lg bg-elevated px-3 py-2 text-sm">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-medium text-fg">{it.item}</span>
              {it.in_inventory && (
                <span className="shrink-0 whitespace-nowrap text-[10px] uppercase tracking-wide text-growth">
                  in inventory
                </span>
              )}
            </div>
            {it.when && <div className="text-[11px] text-fg-muted">{it.when}</div>}
            {it.dose_hint && <div className="text-[11px] text-fg-secondary">{it.dose_hint}</div>}
            {it.why && <div className="mt-0.5 text-xs text-fg-muted">{it.why}</div>}
          </li>
        ))}
      </ul>
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
                <span className="shrink-0 whitespace-nowrap text-[10px] uppercase tracking-wide text-growth">
                  in inventory
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

function Stack({ title, items }: { title: string; items: StackItem[] }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <h3 className="mb-3 font-semibold text-energy-ink">{title}</h3>
      {items.length === 0 && <p className="text-sm text-fg-muted">No items</p>}
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.name} className="rounded-lg bg-elevated px-3 py-2 text-sm">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="min-w-0 font-medium">{it.name}</span>
              {it.in_inventory && (
                <span className="shrink-0 whitespace-nowrap text-[10px] uppercase tracking-wide text-growth">
                  in inventory
                </span>
              )}
            </div>
            <div className="text-xs text-fg-muted">{it.note}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
