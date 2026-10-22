"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  api,
  type UsageEvent,
  type UsageStatsDay,
  type UsageStatsMonth,
  type UsageStatsWeek,
} from "@/lib/api";
import { useApp } from "@/lib/store";

type Period = "day" | "week" | "month";

const EVENT_LABELS: Record<string, string> = {
  login: "Login",
  chart_generated: "Chart",
  protocol_generated: "Protocol",
};

function isAdminUser(user: { email?: string; is_admin?: boolean } | null): boolean {
  if (!user) return false;
  if (user.is_admin) return true;
  const allow = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0) return false;
  return allow.includes((user.email || "").toLowerCase());
}

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`);
    return d.toLocaleString("en-HK", {
      timeZone: "Asia/Hong_Kong",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function notesFor(ev: UsageEvent): string {
  const m = ev.metadata || {};
  const bits: string[] = [];
  if (m.saved === true) bits.push("saved");
  if (m.saved === false) bits.push("unsaved");
  if (m.slot_kind) bits.push(String(m.slot_kind));
  if (m.natal_chart_id != null) bits.push(`chart #${m.natal_chart_id}`);
  if (m.protocol_id != null) bits.push(`protocol #${m.protocol_id}`);
  if (m.backfill) bits.push("backfill");
  return bits.join(" · ") || "—";
}

export default function AdminPage() {
  const router = useRouter();
  const { user, sessionReady } = useApp();
  const allowed = isAdminUser(user);

  const [period, setPeriod] = useState<Period>("day");
  const [daily, setDaily] = useState<UsageStatsDay[]>([]);
  const [weekly, setWeekly] = useState<UsageStatsWeek[]>([]);
  const [monthly, setMonthly] = useState<UsageStatsMonth[]>([]);
  const [events, setEvents] = useState<UsageEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 50;
  const [eventFilter, setEventFilter] = useState<string>("");
  const [dayFilter, setDayFilter] = useState<string>("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!sessionReady) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!allowed) {
      setForbidden(true);
    }
  }, [sessionReady, user, allowed, router]);

  const loadStats = useCallback(async () => {
    if (!user || !allowed) return;
    setLoadingStats(true);
    setError(null);
    try {
      if (period === "day") {
        setDaily(await api.adminUsageStatsDaily(user.id));
      } else if (period === "week") {
        setWeekly(await api.adminUsageStatsWeekly(user.id, 12));
      } else {
        setMonthly(await api.adminUsageStatsMonthly(user.id, 12));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/admin only|403/i.test(msg)) setForbidden(true);
      else setError(msg);
    } finally {
      setLoadingStats(false);
    }
  }, [user, allowed, period]);

  const loadEvents = useCallback(async () => {
    if (!user || !allowed) return;
    setLoadingEvents(true);
    setError(null);
    try {
      const page = await api.adminUsageEvents(user.id, {
        limit,
        offset,
        day: dayFilter || undefined,
        event_type: eventFilter || undefined,
      });
      setEvents(page.items);
      setTotal(page.total);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/admin only|403/i.test(msg)) setForbidden(true);
      else setError(msg);
    } finally {
      setLoadingEvents(false);
    }
  }, [user, allowed, offset, dayFilter, eventFilter]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const cards = useMemo(() => {
    if (period === "day") {
      const today = daily[daily.length - 1];
      return {
        label: today?.day ? `Day ${today.day} (UTC)` : "Today (UTC)",
        unique: today?.unique_users_logged_in ?? 0,
        charts: today?.charts_generated ?? 0,
        protocols: today?.protocols_generated ?? 0,
        logins: today?.logins ?? 0,
        series: daily,
      };
    }
    if (period === "week") {
      const last = weekly[weekly.length - 1];
      return {
        label: last?.week ? `Week ${last.week}` : "This week",
        unique: last?.unique_users_logged_in ?? 0,
        charts: last?.charts_generated ?? 0,
        protocols: last?.protocols_generated ?? 0,
        logins: last?.logins ?? 0,
        series: weekly,
      };
    }
    const last = monthly[monthly.length - 1];
    return {
      label: last?.month ? `Month ${last.month}` : "This month",
      unique: last?.unique_users_logged_in ?? 0,
      charts: last?.charts_generated ?? 0,
      protocols: last?.protocols_generated ?? 0,
      logins: last?.logins ?? 0,
      series: monthly,
    };
  }, [period, daily, weekly, monthly]);

  if (!sessionReady) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-sm text-fg-muted">Loading…</main>
    );
  }

  if (forbidden || (user && !allowed)) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-fg">Not allowed</h1>
        <p className="mt-2 text-sm text-fg-secondary">
          This page is only for allowlisted admin accounts.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-growth px-4 text-sm text-fg-inverse"
        >
          Back home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">Admin</p>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Usage</h1>
          <p className="mt-1 text-sm text-fg-secondary">
            Logins, charts, and protocols — UTC days. Times shown in Asia/Hong_Kong.
          </p>
        </div>
        <div
          className="inline-flex rounded-xl border border-border bg-elevated p-1"
          role="tablist"
          aria-label="Period"
        >
          {(["day", "week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={period === p}
              className={`min-h-10 rounded-lg px-3 text-sm capitalize ${
                period === p
                  ? "bg-growth/20 text-growth"
                  : "text-fg-muted hover:text-fg"
              }`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-danger/40 bg-energy/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Unique logins", value: cards.unique, hint: cards.label },
          { label: "Charts generated", value: cards.charts, hint: cards.label },
          { label: "Protocols generated", value: cards.protocols, hint: cards.label },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-border bg-elevated p-4 shadow-soft"
          >
            <p className="text-xs text-fg-muted">{c.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-growth">
              {loadingStats ? "—" : c.value}
            </p>
            <p className="mt-1 text-xs text-fg-secondary">{c.hint}</p>
          </div>
        ))}
      </section>

      {period === "day" && (
        <section className="mt-4 overflow-hidden rounded-2xl border border-border">
          <div className="border-b border-border bg-elevated px-4 py-2 text-sm font-semibold">
            Last 14 days (UTC)
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-sunken/60 text-xs text-fg-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Day</th>
                  <th className="px-3 py-2 font-medium">Logins</th>
                  <th className="px-3 py-2 font-medium">Unique</th>
                  <th className="px-3 py-2 font-medium">Charts</th>
                  <th className="px-3 py-2 font-medium">Protocols</th>
                </tr>
              </thead>
              <tbody>
                {loadingStats ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-fg-muted">
                      Loading…
                    </td>
                  </tr>
                ) : daily.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-fg-muted">
                      No days yet.
                    </td>
                  </tr>
                ) : (
                  [...daily].reverse().map((row) => (
                    <tr key={row.day} className="border-t border-border">
                      <td className="px-3 py-2 tabular-nums">{row.day}</td>
                      <td className="px-3 py-2 tabular-nums">{row.logins}</td>
                      <td className="px-3 py-2 tabular-nums">{row.unique_users_logged_in}</td>
                      <td className="px-3 py-2 tabular-nums">{row.charts_generated}</td>
                      <td className="px-3 py-2 tabular-nums">{row.protocols_generated}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-fg">Logbook</h2>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-xl border border-border bg-elevated p-1">
              {[
                { id: "", label: "All" },
                { id: "login", label: "Login" },
                { id: "chart_generated", label: "Chart" },
                { id: "protocol_generated", label: "Protocol" },
              ].map((f) => (
                <button
                  key={f.id || "all"}
                  type="button"
                  className={`min-h-10 rounded-lg px-2.5 text-xs sm:text-sm ${
                    eventFilter === f.id
                      ? "bg-growth/20 text-growth"
                      : "text-fg-muted hover:text-fg"
                  }`}
                  onClick={() => {
                    setOffset(0);
                    setEventFilter(f.id);
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="flex min-h-10 items-center gap-2 rounded-xl border border-border bg-elevated px-3 text-xs text-fg-secondary">
              Day (UTC)
              <input
                type="date"
                className="min-h-10 bg-transparent text-sm text-fg outline-none"
                value={dayFilter}
                onChange={(e) => {
                  setOffset(0);
                  setDayFilter(e.target.value);
                }}
              />
            </label>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-elevated text-xs text-fg-muted">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Time</th>
                  <th className="px-3 py-2.5 font-medium">User</th>
                  <th className="px-3 py-2.5 font-medium">Event</th>
                  <th className="px-3 py-2.5 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {loadingEvents ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-fg-muted">
                      Loading…
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-fg-muted">
                      No events yet — logins, charts, and protocols will show up here.
                    </td>
                  </tr>
                ) : (
                  events.map((ev) => (
                    <tr key={ev.id} className="border-t border-border">
                      <td className="whitespace-nowrap px-3 py-2.5 text-fg-secondary tabular-nums">
                        {formatWhen(ev.created_at)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-fg">
                          {ev.display_name || ev.username || "—"}
                        </div>
                        <div className="text-xs text-fg-muted">{ev.email}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-full bg-growth/15 px-2 py-0.5 text-xs text-growth">
                          {EVENT_LABELS[ev.event_type] || ev.event_type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-fg-secondary">{notesFor(ev)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border bg-elevated px-3 py-2 text-sm">
            <span className="text-fg-muted">
              {total === 0 ? "0 events" : `${offset + 1}–${Math.min(offset + limit, total)} of ${total}`}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="min-h-10 rounded-lg border border-border px-3 disabled:opacity-40"
                disabled={offset <= 0}
                onClick={() => setOffset((o) => Math.max(0, o - limit))}
              >
                Prev
              </button>
              <button
                type="button"
                className="min-h-10 rounded-lg border border-border px-3 disabled:opacity-40"
                disabled={offset + limit >= total}
                onClick={() => setOffset((o) => o + limit)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
