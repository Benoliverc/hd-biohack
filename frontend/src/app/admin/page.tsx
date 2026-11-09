"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  api,
  type AdminInsights,
  type AdminOverviewPulse,
  type AdminUserDetail,
  type AdminUserListItem,
  type PageVisitsStats,
  type UsageEvent,
  type UsageStatsDay,
  type UsageStatsMonth,
  type UsageStatsWeek,
} from "@/lib/api";
import { useApp } from "@/lib/store";
import { isAdminUser } from "@/lib/admin";
import { useI18n } from "@/lib/i18n";

type Period = "day" | "week" | "month";
type AdminTab = "overview" | "insights" | "people";
type InsightsPeriod = 7 | 30 | 90;

const EVENT_LABELS: Record<string, string> = {
  login: "Login",
  signup: "Signup",
  chart_generated: "Chart",
  protocol_generated: "Protocol",
  page_view: "Page",
};

const PAGE_LABELS: Record<keyof PageVisitsStats, string> = {
  home: "Home",
  protocols: "Protocols",
  today: "Today",
  chart: "Chart",
  soul: "Soul",
};

const PAGE_CARD_ORDER: { key: keyof PageVisitsStats; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "protocols", label: "Protocols" },
  { key: "today", label: "Today" },
  { key: "chart", label: "Chart" },
  { key: "soul", label: "Soul" },
];

const EMPTY_PAGE_VISITS: PageVisitsStats = {
  home: { views: 0, unique_users: 0 },
  today: { views: 0, unique_users: 0 },
  chart: { views: 0, unique_users: 0 },
  protocols: { views: 0, unique_users: 0 },
  soul: { views: 0, unique_users: 0 },
};

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
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

function formatDay(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`);
    return d.toLocaleDateString("en-HK", {
      timeZone: "Asia/Hong_Kong",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function notesFor(ev: UsageEvent): string {
  const m = ev.metadata || {};
  if (ev.event_type === "page_view") {
    const page = typeof m.page === "string" ? m.page : "";
    const label =
      page in PAGE_LABELS ? PAGE_LABELS[page as keyof PageVisitsStats] : "";
    return label || (typeof m.path === "string" ? m.path : "—");
  }
  if (ev.event_type === "signup") return "New account";
  const bits: string[] = [];
  if (m.saved === true) bits.push("saved");
  if (m.saved === false) bits.push("unsaved");
  if (m.slot_kind) bits.push(String(m.slot_kind));
  if (m.natal_chart_id != null) bits.push(`chart #${m.natal_chart_id}`);
  if (m.protocol_id != null) bits.push(`protocol #${m.protocol_id}`);
  if (m.backfill) bits.push("backfill");
  return bits.join(" · ") || "—";
}

function pct(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  return `${v}%`;
}

function MetricCard({
  label,
  value,
  hint,
  loading,
}: {
  label: string;
  value: string | number;
  hint?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-elevated p-4 shadow-soft">
      <p className="text-xs text-fg-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-growth">
        {loading ? "—" : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-fg-secondary">{hint}</p> : null}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user, sessionReady, mergeUser } = useApp();
  const { t } = useI18n();
  const allowed = isAdminUser(user);

  const [tab, setTab] = useState<AdminTab>("overview");
  const [period, setPeriod] = useState<Period>("day");
  const [planBusy, setPlanBusy] = useState(false);
  const [planFeedback, setPlanFeedback] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
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

  const [pulse, setPulse] = useState<AdminOverviewPulse | null>(null);
  const [loadingPulse, setLoadingPulse] = useState(false);

  const [insightsPeriod, setInsightsPeriod] = useState<InsightsPeriod>(30);
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const [peopleQ, setPeopleQ] = useState("");
  const [peopleQDebounced, setPeopleQDebounced] = useState("");
  const [people, setPeople] = useState<AdminUserListItem[]>([]);
  const [peopleTotal, setPeopleTotal] = useState(0);
  const [peopleOffset, setPeopleOffset] = useState(0);
  const peopleLimit = 50;
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  useEffect(() => {
    const tmr = setTimeout(() => setPeopleQDebounced(peopleQ.trim()), 250);
    return () => clearTimeout(tmr);
  }, [peopleQ]);

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

  const loadPulse = useCallback(async () => {
    if (!user || !allowed) return;
    setLoadingPulse(true);
    try {
      setPulse(await api.adminOverviewPulse(user.id));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/admin only|403/i.test(msg)) setForbidden(true);
      else setError(msg);
    } finally {
      setLoadingPulse(false);
    }
  }, [user, allowed]);

  const loadInsights = useCallback(async () => {
    if (!user || !allowed) return;
    setLoadingInsights(true);
    try {
      setInsights(await api.adminInsights(user.id, insightsPeriod));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/admin only|403/i.test(msg)) setForbidden(true);
      else setError(msg);
    } finally {
      setLoadingInsights(false);
    }
  }, [user, allowed, insightsPeriod]);

  const loadPeople = useCallback(async () => {
    if (!user || !allowed) return;
    setLoadingPeople(true);
    try {
      const page = await api.adminUsers(user.id, {
        q: peopleQDebounced || undefined,
        limit: peopleLimit,
        offset: peopleOffset,
        sort: "joined_desc",
      });
      setPeople(page.items);
      setPeopleTotal(page.total);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/admin only|403/i.test(msg)) setForbidden(true);
      else setError(msg);
    } finally {
      setLoadingPeople(false);
    }
  }, [user, allowed, peopleQDebounced, peopleOffset]);

  const loadDetail = useCallback(
    async (id: number) => {
      if (!user || !allowed) return;
      setLoadingDetail(true);
      try {
        setDetail(await api.adminUserDetail(user.id, id));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/admin only|403/i.test(msg)) setForbidden(true);
        else setError(msg);
      } finally {
        setLoadingDetail(false);
      }
    },
    [user, allowed]
  );

  useEffect(() => {
    if (tab === "overview") {
      void loadStats();
      void loadEvents();
      void loadPulse();
    }
  }, [tab, loadStats, loadEvents, loadPulse]);

  useEffect(() => {
    if (tab === "insights") void loadInsights();
  }, [tab, loadInsights]);

  useEffect(() => {
    if (tab === "people") void loadPeople();
  }, [tab, loadPeople]);

  useEffect(() => {
    if (selectedId != null) void loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

  const cards = useMemo(() => {
    if (period === "day") {
      const today = daily[daily.length - 1];
      return {
        label: today?.day ? `Day ${today.day} (UTC)` : "Today (UTC)",
        unique: today?.unique_users_logged_in ?? 0,
        charts: today?.charts_generated ?? 0,
        protocols: today?.protocols_generated ?? 0,
        logins: today?.logins ?? 0,
        pageVisits: today?.page_visits ?? EMPTY_PAGE_VISITS,
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
        pageVisits: last?.page_visits ?? EMPTY_PAGE_VISITS,
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
      pageVisits: last?.page_visits ?? EMPTY_PAGE_VISITS,
      series: monthly,
    };
  }, [period, daily, weekly, monthly]);

  const currentTier =
    user?.subscription_tier === "biohacker_pro" || user?.biohacking_enabled
      ? "biohacker_pro"
      : "free";

  const setPlan = useCallback(
    async (tier: "free" | "biohacker_pro") => {
      if (!user || !allowed) return;
      if (tier === currentTier) return;
      setPlanBusy(true);
      setPlanError(null);
      setPlanFeedback(null);
      try {
        const updated = await api.setTier(user.id, tier, user.id);
        mergeUser(updated);
        const label = tier === "biohacker_pro" ? t("admin.planPro") : t("admin.planFree");
        setPlanFeedback(t("admin.planSaved", { tier: label }));
      } catch (e) {
        setPlanError(e instanceof Error ? e.message : t("admin.planError"));
      } finally {
        setPlanBusy(false);
      }
    },
    [user, allowed, currentTier, mergeUser, t]
  );

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

  const spark =
    pulse == null
      ? ""
      : pulse.week_spark_delta === 0
        ? "flat vs last week"
        : pulse.week_spark_delta > 0
          ? `+${pulse.week_spark_delta} vs last week`
          : `${pulse.week_spark_delta} vs last week`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">Admin</p>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Baseline</h1>
          <p className="mt-1 text-sm text-fg-secondary">
            Usage, insights, and people — times in Asia/Hong_Kong (HKT).
          </p>
        </div>
        <div
          className="inline-flex rounded-xl border border-border bg-elevated p-1"
          role="tablist"
          aria-label="Admin sections"
        >
          {(
            [
              { id: "overview" as const, label: "Overview" },
              { id: "insights" as const, label: "Insights" },
              { id: "people" as const, label: "People" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`min-h-10 rounded-lg px-3 text-sm ${
                tab === item.id ? "bg-growth/20 text-growth" : "text-fg-muted hover:text-fg"
              }`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-danger/40 bg-energy/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {tab === "overview" && (
        <>
          {pulse && pulse.signups_last_24h.length > 0 && (
            <div className="mt-4 rounded-xl border border-growth/30 bg-growth/10 px-4 py-3 text-sm text-fg">
              <span className="font-medium text-growth">New in last 24h — </span>
              {pulse.signups_last_24h.slice(0, 5).map((s, i) => (
                <span key={`${s.user_id}-${s.created_at}`}>
                  {i > 0 ? " · " : ""}
                  {s.display_name || s.email || "Someone"} ({formatWhen(s.created_at)})
                </span>
              ))}
            </div>
          )}

          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="New today (HKT)"
              value={pulse?.new_today_count ?? 0}
              hint={
                pulse && pulse.new_today.length
                  ? pulse.new_today
                      .slice(0, 3)
                      .map((u) => u.display_name || u.email)
                      .join(", ")
                  : "No signups yet today"
              }
              loading={loadingPulse}
            />
            <MetricCard
              label="New this week"
              value={pulse?.new_this_week ?? 0}
              hint={spark}
              loading={loadingPulse}
            />
            <MetricCard
              label="Total accounts"
              value={pulse?.total_accounts ?? 0}
              hint={
                pulse
                  ? `Excludes seed/dev (.local); ${pulse.total_accounts_including_seed} incl.`
                  : undefined
              }
              loading={loadingPulse}
            />
          </section>

          <section className="mt-6 rounded-2xl border border-border bg-elevated p-4 shadow-soft sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                  {t("admin.planEyebrow")}
                </p>
                <h2 className="text-lg font-semibold text-fg">{t("admin.planTitle")}</h2>
                <p className="mt-1 text-sm text-fg-secondary">{t("admin.planHelp")}</p>
                <p className="mt-2 text-sm text-fg">
                  {t("admin.planCurrent", {
                    tier:
                      currentTier === "biohacker_pro" ? t("admin.planPro") : t("admin.planFree"),
                  })}
                </p>
              </div>
              <div
                className="inline-flex rounded-xl border border-border bg-canvas p-1"
                role="group"
                aria-label={t("admin.planTitle")}
              >
                {(
                  [
                    { id: "free" as const, label: t("admin.planFree") },
                    { id: "biohacker_pro" as const, label: t("admin.planPro") },
                  ]
                ).map((opt) => {
                  const active = currentTier === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={planBusy}
                      aria-pressed={active}
                      className={`min-h-10 rounded-lg px-4 text-sm disabled:opacity-60 ${
                        active
                          ? "bg-growth-soft border border-growth/40 font-medium text-growth"
                          : "border border-transparent text-fg-muted hover:text-fg"
                      }`}
                      onClick={() => void setPlan(opt.id)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {planBusy && (
              <p className="mt-3 text-sm text-fg-muted" role="status">
                {t("admin.planSaving")}
              </p>
            )}
            {planFeedback && !planBusy && (
              <p className="mt-3 text-sm text-growth" role="status">
                {planFeedback}
              </p>
            )}
            {planError && (
              <p className="mt-3 text-sm text-danger" role="alert">
                {planError}
              </p>
            )}
          </section>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-fg">Usage</h2>
              <p className="mt-1 text-sm text-fg-secondary">
                Logins, charts, protocols, and page visits — UTC days.
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
                    period === p ? "bg-growth/20 text-growth" : "text-fg-muted hover:text-fg"
                  }`}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <section className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Unique logins", value: cards.unique, hint: cards.label },
              { label: "Charts generated", value: cards.charts, hint: cards.label },
              { label: "Protocols generated", value: cards.protocols, hint: cards.label },
            ].map((c) => (
              <MetricCard
                key={c.label}
                label={c.label}
                value={c.value}
                hint={c.hint}
                loading={loadingStats}
              />
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
              <div>
                <h2 className="text-lg font-semibold text-fg">Page visits</h2>
                <p className="mt-1 text-xs text-fg-muted">
                  Page visits start from when this shipped — earlier days stay at 0.
                </p>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {PAGE_CARD_ORDER.map((p) => {
                const stat = cards.pageVisits?.[p.key] ?? { views: 0, unique_users: 0 };
                return (
                  <div
                    key={p.key}
                    className="rounded-2xl border border-border bg-elevated p-4 shadow-soft"
                  >
                    <p className="text-xs text-fg-muted">{p.label}</p>
                    <p className="mt-1 text-3xl font-semibold tabular-nums text-growth">
                      {loadingStats ? "—" : stat.views}
                    </p>
                    <p className="mt-1 text-xs text-fg-secondary">
                      {loadingStats ? "—" : `${stat.unique_users} unique visitors`}
                    </p>
                    <p className="mt-1 text-xs text-fg-muted">{cards.label}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {period === "day" && (
            <section className="mt-4 overflow-hidden rounded-2xl border border-border">
              <div className="border-b border-border bg-elevated px-4 py-2 text-sm font-semibold">
                Page visits — last 14 days (UTC)
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-sunken/60 text-xs text-fg-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium">Day</th>
                      <th className="px-3 py-2 font-medium">Home</th>
                      <th className="px-3 py-2 font-medium">Protocols</th>
                      <th className="px-3 py-2 font-medium">Today</th>
                      <th className="px-3 py-2 font-medium">Chart</th>
                      <th className="px-3 py-2 font-medium">Soul</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingStats ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-fg-muted">
                          Loading…
                        </td>
                      </tr>
                    ) : daily.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-fg-muted">
                          No days yet.
                        </td>
                      </tr>
                    ) : (
                      [...daily].reverse().map((row) => {
                        const pv = row.page_visits ?? EMPTY_PAGE_VISITS;
                        return (
                          <tr key={`pv-${row.day}`} className="border-t border-border">
                            <td className="px-3 py-2 tabular-nums">{row.day}</td>
                            <td className="px-3 py-2 tabular-nums">{pv.home?.views ?? 0}</td>
                            <td className="px-3 py-2 tabular-nums">{pv.protocols?.views ?? 0}</td>
                            <td className="px-3 py-2 tabular-nums">{pv.today?.views ?? 0}</td>
                            <td className="px-3 py-2 tabular-nums">{pv.chart?.views ?? 0}</td>
                            <td className="px-3 py-2 tabular-nums">{pv.soul?.views ?? 0}</td>
                          </tr>
                        );
                      })
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
                    { id: "signup", label: "Signups" },
                    { id: "login", label: "Login" },
                    { id: "chart_generated", label: "Chart" },
                    { id: "protocol_generated", label: "Protocol" },
                    { id: "page_view", label: "Pages" },
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
                          No events yet — signups, logins, charts, and protocols will show up here.
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
                  {total === 0
                    ? "0 events"
                    : `${offset + 1}–${Math.min(offset + limit, total)} of ${total}`}
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
        </>
      )}

      {tab === "insights" && (
        <section className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-fg">Insights</h2>
              <p className="mt-1 text-sm text-fg-secondary">
                Averages over active users in the period (unless noted).
              </p>
            </div>
            <div
              className="inline-flex rounded-xl border border-border bg-elevated p-1"
              role="tablist"
              aria-label="Insights period"
            >
              {([7, 30, 90] as InsightsPeriod[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  role="tab"
                  aria-selected={insightsPeriod === d}
                  className={`min-h-10 rounded-lg px-3 text-sm ${
                    insightsPeriod === d
                      ? "bg-growth/20 text-growth"
                      : "text-fg-muted hover:text-fg"
                  }`}
                  onClick={() => setInsightsPeriod(d)}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              label="Active users"
              value={insights?.active_users ?? 0}
              hint={`≥1 login in last ${insightsPeriod}d`}
              loading={loadingInsights}
            />
            <MetricCard
              label="New users"
              value={insights?.new_users ?? 0}
              hint="created_at in period"
              loading={loadingInsights}
            />
            <MetricCard
              label="Avg logins / active"
              value={insights?.avg_logins_per_active ?? 0}
              loading={loadingInsights}
            />
            <MetricCard
              label="Median days since last login"
              value={
                insights?.median_days_since_last_login != null
                  ? insights.median_days_since_last_login
                  : "—"
              }
              hint="All accounts with a login"
              loading={loadingInsights}
            />
            <MetricCard
              label="Activation % (Me natal ≤7d)"
              value={pct(insights?.activation_pct)}
              hint={
                insights
                  ? `${insights.activation_count} of ${insights.new_users} new users`
                  : undefined
              }
              loading={loadingInsights}
            />
            <MetricCard
              label="Today engagement %"
              value={pct(insights?.today_engagement_pct)}
              hint="% of active with ≥1 Today page view"
              loading={loadingInsights}
            />
            <MetricCard
              label="Charts / active"
              value={insights?.avg_charts_per_active ?? 0}
              loading={loadingInsights}
            />
            <MetricCard
              label="Protocols / active"
              value={insights?.avg_protocols_per_active ?? 0}
              loading={loadingInsights}
            />
            <MetricCard
              label="Return D1 / D7"
              value={
                loadingInsights
                  ? "—"
                  : `${pct(insights?.return_d1_pct)} / ${pct(insights?.return_d7_pct)}`
              }
              hint="% of new users who logged in on day 1 / day 7"
            />
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-fg">Avg page visits / active user</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {PAGE_CARD_ORDER.map((p) => (
                <MetricCard
                  key={p.key}
                  label={p.label}
                  value={insights?.avg_page_visits_per_active?.[p.key] ?? 0}
                  loading={loadingInsights}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "people" && (
        <section className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-fg">People</h2>
              <p className="mt-1 text-sm text-fg-secondary">
                Every account — click a row for detail. No passwords, birth data, or natal dumps.
              </p>
            </div>
            <label className="flex min-h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-border bg-elevated px-3 text-sm">
              <span className="text-fg-muted">Search</span>
              <input
                type="search"
                className="min-h-10 w-full bg-transparent text-fg outline-none"
                placeholder="Name, email, username"
                value={peopleQ}
                onChange={(e) => {
                  setPeopleOffset(0);
                  setPeopleQ(e.target.value);
                }}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-elevated text-xs text-fg-muted">
                    <tr>
                      <th className="px-3 py-2.5 font-medium">User</th>
                      <th className="px-3 py-2.5 font-medium">Joined</th>
                      <th className="px-3 py-2.5 font-medium">Last login</th>
                      <th className="px-3 py-2.5 font-medium">#</th>
                      <th className="px-3 py-2.5 font-medium">Tier</th>
                      <th className="px-3 py-2.5 font-medium">Me</th>
                      <th className="px-3 py-2.5 font-medium">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPeople ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-fg-muted">
                          Loading…
                        </td>
                      </tr>
                    ) : people.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-fg-muted">
                          No users match.
                        </td>
                      </tr>
                    ) : (
                      people.map((row) => {
                        const selected = selectedId === row.id;
                        return (
                          <tr
                            key={row.id}
                            className={`cursor-pointer border-t border-border ${
                              selected ? "bg-growth/10" : "hover:bg-sunken/40"
                            }`}
                            onClick={() => setSelectedId(row.id)}
                          >
                            <td className="px-3 py-2.5">
                              <div className="font-medium text-fg">
                                {row.display_name || row.username || "—"}
                              </div>
                              <div className="text-xs text-fg-muted">{row.email}</div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-fg-secondary">
                              {formatDay(row.created_at)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-fg-secondary">
                              {formatWhen(row.last_login_at)}
                            </td>
                            <td className="px-3 py-2.5 tabular-nums">{row.login_count}</td>
                            <td className="px-3 py-2.5">
                              <span className="rounded-full bg-sunken px-2 py-0.5 text-xs">
                                {row.subscription_tier === "biohacker_pro" ? "Pro" : "Free"}
                              </span>
                              {row.beta_full_access ? (
                                <span className="ml-1 rounded-full bg-growth/15 px-2 py-0.5 text-xs text-growth">
                                  Beta
                                </span>
                              ) : null}
                            </td>
                            <td className="px-3 py-2.5">{row.has_me_natal ? "Yes" : "—"}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-fg-secondary">
                              {formatWhen(row.last_active_at)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-elevated px-3 py-2 text-sm">
                <span className="text-fg-muted">
                  {peopleTotal === 0
                    ? "0 users"
                    : `${peopleOffset + 1}–${Math.min(
                        peopleOffset + peopleLimit,
                        peopleTotal
                      )} of ${peopleTotal}`}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="min-h-10 rounded-lg border border-border px-3 disabled:opacity-40"
                    disabled={peopleOffset <= 0}
                    onClick={() => setPeopleOffset((o) => Math.max(0, o - peopleLimit))}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="min-h-10 rounded-lg border border-border px-3 disabled:opacity-40"
                    disabled={peopleOffset + peopleLimit >= peopleTotal}
                    onClick={() => setPeopleOffset((o) => o + peopleLimit)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            <aside className="rounded-2xl border border-border bg-elevated p-4 shadow-soft">
              {!selectedId ? (
                <p className="text-sm text-fg-muted">Select a person to see detail.</p>
              ) : loadingDetail || !detail ? (
                <p className="text-sm text-fg-muted">Loading…</p>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-fg">
                        {detail.display_name || detail.username || detail.email}
                      </h3>
                      <p className="text-xs text-fg-muted">{detail.email}</p>
                      {detail.username ? (
                        <p className="text-xs text-fg-secondary">@{detail.username}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-fg-muted">id {detail.id}</p>
                    </div>
                    <button
                      type="button"
                      className="min-h-10 rounded-lg border border-border px-2 text-xs text-fg-muted"
                      onClick={() => setSelectedId(null)}
                    >
                      Close
                    </button>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                      Access
                    </p>
                    <p className="mt-1 text-fg">
                      {detail.subscription_tier === "biohacker_pro" ? "Pro" : "Free"}
                      {detail.beta_full_access ? " · Beta Pro grant" : ""}
                      {detail.biohacking_enabled ? " · biohacking flag on" : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                      Session
                    </p>
                    <ul className="mt-1 space-y-0.5 text-fg-secondary">
                      <li>Logins: {detail.login_count}</li>
                      <li>First: {formatWhen(detail.first_login_at)}</li>
                      <li>Last: {formatWhen(detail.last_login_at)}</li>
                      <li>
                        Days since last:{" "}
                        {detail.days_since_last_login != null
                          ? detail.days_since_last_login
                          : "—"}
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                      Activation
                    </p>
                    <ul className="mt-1 space-y-0.5 text-fg-secondary">
                      <li>Me natal: {detail.has_me_natal ? "Yes" : "No"}</li>
                      <li>People charts: {detail.people_count}</li>
                      <li>Partner tagged: {detail.partner_tagged ? "Yes" : "No"}</li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                      Usage totals
                    </p>
                    <ul className="mt-1 space-y-0.5 text-fg-secondary">
                      <li>Charts generated: {detail.charts_generated}</li>
                      <li>Protocols generated: {detail.protocols_generated}</li>
                      {PAGE_CARD_ORDER.map((p) => (
                        <li key={p.key}>
                          {p.label} views: {detail.page_views?.[p.key] ?? 0}
                        </li>
                      ))}
                      <li>Kit items (active): {detail.kit_items_active}</li>
                      <li>Move completions: {detail.move_completions}</li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                      Recent activity
                    </p>
                    <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto">
                      {detail.recent_events.length === 0 ? (
                        <li className="text-fg-muted">No events yet.</li>
                      ) : (
                        detail.recent_events.map((ev) => (
                          <li key={ev.id} className="border-t border-border pt-2 first:border-0 first:pt-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-growth/15 px-2 py-0.5 text-xs text-growth">
                                {EVENT_LABELS[ev.event_type] || ev.event_type}
                              </span>
                              <span className="text-xs tabular-nums text-fg-muted">
                                {formatWhen(ev.created_at)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-fg-secondary">{notesFor(ev)}</p>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      )}
    </main>
  );
}
