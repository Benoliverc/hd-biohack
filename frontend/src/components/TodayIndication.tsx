"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Zap, BatteryMedium, MapPin, Check } from "lucide-react";
import { api, type TodayIndicationPayload, type UpcomingSkyPayload, type VsYesterdayDelta } from "@/lib/api";
import { contextualHdFact } from "@/lib/hdFactOfTheDay";
import { STARTER_SUPPLEMENTS, starterSlug } from "@/components/protocols/constants";
import {
  readKitSetupDismissed,
  writeKitSetupDismissed,
} from "@/lib/kitSetupDismiss";
import {
  computeMoveShowUpWeek,
  dayKeyInZone,
  DEFAULT_PROTOCOLS_TZ,
  loadDayCompletions,
  loadMoveCompletedDaysInWeek,
  mergeServerCompletions,
  saveDayCompletions,
  setCompletionNote,
  toggleCompletion,
  weekDayKeysInZone,
  type DayCompletions,
} from "@/lib/protocolCompletions";
import {
  encodeEveningCloseLabel,
  eveningAnswerOptions,
  eveningCloseItemId,
  eveningQuestionKey,
  isEveningCloseVisible,
  normalizeHdType,
  parseEveningCloseLabel,
  type EveningAnswerKey,
} from "@/lib/eveningSignatureClose";
import { buildUpcomingRows, weekdayOf, type UpcomingChangeKind } from "@/lib/upcomingSky";
import EarlierWeeksHistory from "@/components/EarlierWeeksHistory";
import {
  useI18n,
  localizeEnergyLabel,
  localizeSpaceLabel,
  type MessageKey,
} from "@/lib/i18n";

type TFn = (key: MessageKey, vars?: Record<string, string | number>) => string;

function vsPillLabel(d: VsYesterdayDelta, t: TFn): string {
  const vars = { from: d.from, to: d.to };
  if (d.field === "moon") return t("vs.moon", vars);
  if (d.field === "sun") return t("vs.sun", vars);
  if (d.field === "hanging_pressure") return t("vs.hanging", vars);
  if (d.field === "bridge") return t("vs.bridge", vars);
  if (d.field === "newly_defined") return t("vs.centers", vars);
  if (d.field === "energy") return t("vs.energy", vars);
  if (d.field === "space") return t("vs.space", vars);
  return `${d.from} → ${d.to}`;
}

function upcomingLeadSentence(kind: UpcomingChangeKind, weekday: string, t: TFn): string {
  if (kind === "sun_theme_turns") return t("today.upcoming.sunThemeTurns", { weekday });
  if (kind === "bridge_on") return t("today.upcoming.bridgeOn", { weekday });
  if (kind === "bridge_clears") return t("today.upcoming.bridgeClears", { weekday });
  return t("today.upcoming.moonLeaves", { weekday });
}

type Props = {
  indication: TodayIndicationPayload | null | undefined;
  loading?: boolean;
  error?: string | null;
  bindingLoading?: boolean;
  /** For I-did-it persistence (same HKT/account day key as Protocols). */
  userId?: number | null;
  chartId?: number | null;
  preferredTimezone?: string | null;
  /** Natal Type of Me only (People never drive Today). */
  natalType?: string | null;
  /** True when the loaded You natal was saved with an unknown birth time. */
  timeUnknown?: boolean;
  /** Protocols unlocked (Pro or beta full access). Omit the stack handoff when locked. */
  protocolsUnlocked?: boolean;
  /** GET /inventory status — unknown while the first fetch is in flight. */
  inventoryStatus?: "unknown" | "ready" | "error";
  /** Active inventory length from GET /inventory (not kit_placeholder). */
  inventoryCount?: number;
  /** Add a starter or typed name, then refetch inventory + GET /transits/today. */
  onAddToKit?: (name: string) => Promise<{ name: string; duplicate?: boolean }>;
  onRetryInventory?: () => void;
  /** Open How to read Today at this literacy step id (pulse). */
  onHowToRead?: (stepId: string, returnFocus?: HTMLElement | null) => void;
};

function whenLabel(slot: string | null | undefined, t: TFn): string {
  if (slot === "morning") return t("today.when.morning");
  if (slot === "midday") return t("today.when.midday");
  if (slot === "evening") return t("today.when.evening");
  return t("today.when.morning");
}

export default function TodayIndication({
  indication,
  loading = false,
  error = null,
  bindingLoading = false,
  userId = null,
  chartId = null,
  preferredTimezone = null,
  natalType = null,
  timeUnknown = false,
  protocolsUnlocked = false,
  inventoryStatus = "unknown",
  inventoryCount = 0,
  onAddToKit,
  onRetryInventory,
  onHowToRead,
}: Props) {
  const { t, locale } = useI18n();
  const dayKey = dayKeyInZone(preferredTimezone || DEFAULT_PROTOCOLS_TZ);
  const [completions, setCompletions] = useState<DayCompletions>({});

  const protocolsTz = preferredTimezone || DEFAULT_PROTOCOLS_TZ;
  const weekKeys = weekDayKeysInZone(protocolsTz);
  const weekKeysSig = weekKeys.join("|");
  const [showUpRevision, setShowUpRevision] = useState(0);
  const [kitSetupDismissed, setKitSetupDismissed] = useState(false);
  const [kitName, setKitName] = useState("");
  const [kitAdding, setKitAdding] = useState(false);
  const [kitFeedback, setKitFeedback] = useState<string | null>(null);
  const [kitAddError, setKitAddError] = useState(false);
  const [upcomingOpen, setUpcomingOpen] = useState(false);
  const [upcomingStatus, setUpcomingStatus] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [upcomingPayload, setUpcomingPayload] = useState<UpcomingSkyPayload | null>(null);
  const upcomingReq = useRef(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (userId == null) {
      setKitSetupDismissed(false);
      return;
    }
    setKitSetupDismissed(readKitSetupDismissed(userId));
  }, [userId]);

  const addKitItem = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed || !onAddToKit || kitAdding) return;
      setKitAdding(true);
      setKitAddError(false);
      setKitFeedback(null);
      try {
        const res = await onAddToKit(trimmed);
        setKitName("");
        setKitFeedback(
          res.duplicate
            ? t("today.kitSetupAlready", { name: res.name })
            : t("today.kitSetupAdded", { name: res.name })
        );
      } catch {
        setKitAddError(true);
      } finally {
        setKitAdding(false);
      }
    },
    [onAddToKit, kitAdding, t]
  );

  const skipKitSetup = useCallback(() => {
    if (userId != null) writeKitSetupDismissed(userId);
    setKitSetupDismissed(true);
  }, [userId]);

  const loadUpcoming = useCallback(async () => {
    const req = ++upcomingReq.current;
    setUpcomingStatus("loading");
    try {
      const res = await api.transitsUpcoming(chartId ?? undefined, {
        userId: userId ?? undefined,
      });
      if (req !== upcomingReq.current) return;
      setUpcomingPayload(res);
      setUpcomingStatus("ready");
    } catch {
      if (req !== upcomingReq.current) return;
      setUpcomingStatus("error");
    }
  }, [chartId, userId]);

  const toggleUpcoming = useCallback(() => {
    setUpcomingOpen((open) => !open);
  }, []);

  useEffect(() => {
    if (upcomingOpen && upcomingStatus === "idle") {
      void loadUpcoming();
    }
  }, [upcomingOpen, upcomingStatus, loadUpcoming]);

  useEffect(() => {
    upcomingReq.current += 1;
    setUpcomingPayload(null);
    setUpcomingStatus("idle");
    setUpcomingOpen(false);
  }, [chartId, userId]);

  const upcomingRows = useMemo(() => {
    if (!upcomingPayload?.days?.length) return [];
    return buildUpcomingRows(upcomingPayload.days, (iso) => weekdayOf(iso, locale));
  }, [upcomingPayload, locale]);

  useEffect(() => {
    if (!userId || !chartId) {
      setCompletions({});
      return;
    }
    let cancelled = false;
    const local = loadDayCompletions(userId, chartId, dayKey);
    setCompletions(local);
    const from = weekKeys[0];
    const to = weekKeys[6];
    (async () => {
      try {
        const [dayRes, weekRes] = await Promise.all([
          api.listProtocolCompletions(userId, chartId, { day: dayKey }),
          api.listProtocolCompletions(userId, chartId, { from, to }),
        ]);
        if (cancelled) return;
        const merged = mergeServerCompletions(local, dayRes.items || []);
        setCompletions(merged);
        saveDayCompletions(userId, chartId, dayKey, merged);

        const byDay = new Map<string, typeof weekRes.items>();
        for (const row of weekRes.items || []) {
          const list = byDay.get(row.day) || [];
          list.push(row);
          byDay.set(row.day, list);
        }
        for (const [d, rows] of Array.from(byDay.entries())) {
          const base = d === dayKey ? merged : loadDayCompletions(userId, chartId, d);
          const m = mergeServerCompletions(base, rows);
          saveDayCompletions(userId, chartId, d, m);
        }
        setShowUpRevision((n) => n + 1);
      } catch {
        /* local cache still valid */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, chartId, dayKey, weekKeysSig]);

  const persistToggle = useCallback(
    (itemId: string, label: string, kind: "move" | "baseline" | "evening" | "kit" = "move") => {
      if (!userId || !chartId || !itemId) return;
      setCompletions((prev) => {
        const next = toggleCompletion(prev, itemId, { label, kind });
        saveDayCompletions(userId, chartId, dayKey, next);
        const row = next[itemId];
        void api
          .putProtocolCompletion(userId, {
            chart_id: chartId,
            day: dayKey,
            item_id: itemId,
            kind,
            label: row?.label || label,
            done: Boolean(row?.done),
            note: row?.note ?? null,
          })
          .catch(() => {
            /* offline — local cache keeps the tap */
          });
        return next;
      });
      setShowUpRevision((n) => n + 1);
    },
    [userId, chartId, dayKey]
  );

  const persistNote = useCallback(
    (itemId: string, note: string) => {
      if (!userId || !chartId || !itemId) return;
      setCompletions((prev) => {
        const next = setCompletionNote(prev, itemId, note);
        saveDayCompletions(userId, chartId, dayKey, next);
        const row = next[itemId];
        if (!row) return next;
        void api
          .putProtocolCompletion(userId, {
            chart_id: chartId,
            day: dayKey,
            item_id: itemId,
            kind: row.kind,
            label: row.label,
            done: Boolean(row.done),
            note: row.note ?? null,
          })
          .catch(() => {
            /* offline — local cache keeps the note */
          });
        return next;
      });
    },
    [userId, chartId, dayKey]
  );

  const persistEveningClose = useCallback(
    (answer: EveningAnswerKey, typeKey: NonNullable<ReturnType<typeof normalizeHdType>>) => {
      if (!userId || !chartId) return;
      const itemId = eveningCloseItemId();
      const label = encodeEveningCloseLabel({ typeKey, answer });
      setCompletions((prev) => {
        const prevRow = prev[itemId];
        const next = {
          ...prev,
          [itemId]: {
            done: true,
            label,
            kind: "evening" as const,
            note: prevRow?.note,
          },
        };
        saveDayCompletions(userId, chartId, dayKey, next);
        void api
          .putProtocolCompletion(userId, {
            chart_id: chartId,
            day: dayKey,
            item_id: itemId,
            kind: "evening",
            label,
            done: true,
            note: next[itemId]?.note ?? null,
          })
          .catch(() => {
            /* offline — local cache keeps the close */
          });
        return next;
      });
    },
    [userId, chartId, dayKey]
  );

  if (bindingLoading || loading) {
    return (
      <div
        className="rounded-2xl border border-border bg-elevated p-5"
        data-testid="today-indication-loading"
      >
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-muted">
          {t("today.indication")}
        </h2>
        <p className="text-sm text-fg-secondary">{t("today.reading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl border border-danger/40 bg-elevated p-5"
        data-testid="today-indication-error"
      >
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-muted">
          {t("today.indication")}
        </h2>
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (!indication) {
    return null;
  }

  // Defense: never paint a filled Move cockpit without a Me natal.
  // (Transits page also gates the fetch/mount; this covers any other caller.)
  if (!indication.has_natal) {
    return (
      <div
        className="rounded-2xl border border-dashed border-border bg-elevated/60 px-5 py-8 text-center"
        data-testid="today-indication-needs-natal"
      >
        <p className="text-base font-semibold text-fg">{t("page.today.emptyTitle")}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-secondary">
          {t("page.today.emptyBody")}
        </p>
        <Link
          href="/profile"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep"
          data-testid="indication-save-chart-cta"
        >
          {t("today.saveNatal")}
        </Link>
      </div>
    );
  }

  const energy = indication.energy_level as 1 | 2 | 3 | 4 | 5;
  const space = indication.preferred_space;
  const daily = indication.daily_signal;
  const vs = indication.vs_yesterday || [];
  const caption = indication.conditioning_caption?.trim() || "";
  const energyLabel = localizeEnergyLabel(t, energy, indication.energy_label);
  const spaceLabel = localizeSpaceLabel(t, space, indication.preferred_space_label);
  const moveId = indication.move_item_id || "today-move";
  const moveDone = Boolean(completions[moveId]?.done);
  const moveNote = completions[moveId]?.note || "";
  const hasFilledKitTease = Boolean(indication.kit_item && !indication.kit_placeholder);
  const hasKitStackHandoff =
    hasFilledKitTease ||
    (protocolsUnlocked &&
      !hasFilledKitTease &&
      inventoryStatus === "ready" &&
      inventoryCount > 0);

  return (
    <div
      className="rounded-2xl border border-border bg-elevated p-5 shadow-soft"
      data-testid="today-indication"
    >
      {/* 1. Move hero first */}
      <div
        className={`mb-4 rounded-xl border border-growth/25 p-4 shadow-soft ring-1 ring-growth/10 transition-[background-color,background-image] duration-300 ease-out ${
          moveDone ? "today-move-achieved" : "bg-canvas"
        }`}
        data-testid="main-action"
        data-achieved={moveDone ? "true" : "false"}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-growth">
              {t("today.move")}
            </h3>
            {(() => {
              const canTap = Boolean(userId && chartId);
              return (
                <div>
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      disabled={!canTap}
                      aria-pressed={moveDone}
                      aria-label={t("today.iDidIt")}
                      data-testid="today-move-done"
                      onClick={() =>
                        persistToggle(moveId, indication.main_action_text || t("today.move"))
                      }
                      className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-growth/40 ${
                        moveDone
                          ? "border-growth bg-growth text-fg-inverse"
                          : "border-border bg-elevated text-fg-muted hover:border-growth/50"
                      } ${!canTap ? "opacity-50" : ""}`}
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <p
                      className={`type-body font-medium text-fg ${moveDone ? "line-through opacity-80" : ""}`}
                      data-testid="main-action-text"
                    >
                      {indication.main_action_text}
                    </p>
                  </div>

                  {moveDone ? (
                    <div
                      className="mt-3 rounded-xl border border-growth/40 bg-elevated px-3 py-2.5"
                      data-testid="today-move-closure"
                      role="status"
                    >
                      <p
                        className="type-body font-medium text-growth-ink"
                        data-testid="today-move-receipt"
                      >
                        {t("today.moveComplete")}
                      </p>
                      <label
                        className="mt-2 block type-caption text-fg-secondary"
                        htmlFor={`today-move-note-${moveId}`}
                      >
                        {t("today.moveNoteLabel")}
                      </label>
                      <input
                        id={`today-move-note-${moveId}`}
                        type="text"
                        maxLength={120}
                        defaultValue={moveNote}
                        placeholder={t("today.moveNotePlaceholder")}
                        disabled={!canTap}
                        className="mt-0.5 w-full rounded-lg border border-border bg-sunken px-2.5 py-1.5 text-xs text-fg placeholder:text-fg-muted disabled:opacity-50"
                        data-testid="today-move-note"
                        onBlur={(e) => {
                          if (e.target.value.trim() !== (moveNote || "").trim()) {
                            persistNote(moveId, e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })()}

            {(() => {
              void showUpRevision; // recompute when completions / week hydrate
              if (!userId || !chartId) return null;
              const moveId = indication.move_item_id || "today-move";
              const completedMoveDays = loadMoveCompletedDaysInWeek({
                userId,
                chartId,
                moveItemId: moveId,
                weekKeys,
                todayKey: dayKey,
                todayMap: completions,
              });
              const { days: showUpDays, hadMiss } = computeMoveShowUpWeek({
                weekKeys,
                todayKey: dayKey,
                completedMoveDays,
                allowGrace: true,
              });
              const weekdayLabel = (day: string) => {
                const [y, m, d] = day.split("-").map(Number);
                if (!y || !m || !d) return day;
                const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
                try {
                  return new Intl.DateTimeFormat(undefined, {
                    timeZone: "UTC",
                    weekday: "short",
                  }).format(utc);
                } catch {
                  return day.slice(5);
                }
              };
              const dotClass = (status: string) => {
                if (status === "filled") {
                  return "border-growth bg-growth";
                }
                if (status === "empty") {
                  return "border-border bg-elevated";
                }
                if (status === "future") {
                  return "border-border/50 bg-transparent opacity-50";
                }
                // missed + grace: muted only (not warning colors)
                return "border-border bg-fg-muted/30";
              };
              return (
                <div
                  className="mt-3"
                  data-testid="today-show-up"
                  aria-label={t("today.showUpLabel")}
                >
                  <p className="mb-1 type-caption text-fg-secondary">
                    {t("today.showUpLabel")}
                  </p>
                  <ol className="flex flex-wrap items-center gap-1.5" data-testid="today-show-up-dots">
                    {showUpDays.map((d) => (
                      <li
                        key={d.day}
                        className="flex flex-col items-center gap-1"
                        data-testid={`today-show-up-day-${d.day}`}
                        data-status={d.status}
                      >
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full border ${dotClass(d.status)}`}
                          aria-hidden
                        />
                        <span className="type-caption text-fg-secondary">
                          {weekdayLabel(d.day)}
                        </span>
                        <span className="sr-only">
                          {d.day}: {d.status}
                        </span>
                      </li>
                    ))}
                  </ol>
                  {hadMiss ? (
                    <p
                      className="mt-2 text-xs text-fg-muted"
                      data-testid="today-show-up-kind"
                    >
                      {t("today.showUpStill")}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    data-testid="today-history-link"
                    className="mt-2 type-caption text-fg-secondary underline-offset-2 hover:underline"
                    onClick={() => {
                      setHistoryOpen(true);
                      requestAnimationFrame(() => {
                        historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      });
                    }}
                  >
                    {t("history.earlierWeeks")}
                  </button>
                </div>
              );
            })()}


            {/* Today's kit pick — setup, compact tease, or leftover (never hidden) */}
            {indication.kit_item && !indication.kit_placeholder ? (
              (() => {
                const kit = indication.kit_item;
                return (
                  <Link
                    href="/biohack#stack"
                    className="mt-3 flex min-h-11 items-start rounded-lg border border-border bg-elevated/80 px-3 py-2 text-fg transition hover:border-growth/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                    data-testid="today-kit-line"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="type-chip uppercase tracking-wide text-fg">
                        {t("today.kitPick")}
                      </p>
                      <p className="type-body font-medium text-fg">
                        {kit.name}
                        {kit.dose ? (
                          <span className="ml-1.5 font-normal text-fg">· {kit.dose}</span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 type-body text-fg">{t("today.kitPickCta")}</p>
                      {kitFeedback ? (
                        <p className="mt-1 type-caption text-fg" role="status">
                          {kitFeedback}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                );
              })()
            ) : !protocolsUnlocked ? (
              <Link
                href="/biohack"
                className="mt-3 flex min-h-11 items-start gap-2 rounded-lg border border-dashed border-border/80 bg-sunken/40 px-3 py-2 text-sm text-fg transition hover:border-growth/30 hover:text-fg-secondary"
                data-testid="today-kit-placeholder"
              >
                <span className="font-medium text-fg">{t("today.kitPick")}:</span>
                <span className="type-body text-fg">{t("today.kitSetupEmpty")}</span>
              </Link>
            ) : inventoryStatus === "unknown" ? (
              <div
                className="mt-3 rounded-lg border border-border bg-elevated/80 px-3 py-2"
                data-testid="today-kit-setup-wait"
              >
                <p className="type-chip uppercase tracking-wide text-fg">{t("today.kitPick")}</p>
                <p className="mt-1 type-body text-fg">{t("today.kitSetupWait")}</p>
              </div>
            ) : inventoryStatus === "error" ? (
              <div
                className="mt-3 rounded-lg border border-border bg-elevated/80 px-3 py-2"
                data-testid="today-kit-setup-error"
              >
                <p className="type-chip uppercase tracking-wide text-fg">{t("today.kitPick")}</p>
                <p className="mt-1 type-body text-fg">{t("today.kitSetupLoadError")}</p>
                {onRetryInventory ? (
                  <button
                    type="button"
                    onClick={onRetryInventory}
                    className="mt-2 inline-flex min-h-9 items-center type-body text-fg underline-offset-2 hover:underline"
                    data-testid="today-kit-setup-retry"
                  >
                    {t("today.kitSetupRetry")}
                  </button>
                ) : null}
              </div>
            ) : inventoryCount === 0 && userId && !kitSetupDismissed && onAddToKit ? (
              <div
                className="mt-3 rounded-lg border border-border bg-elevated/80 px-3 py-2"
                data-testid="today-kit-setup"
              >
                <p className="type-chip uppercase tracking-wide text-fg">{t("today.kitPick")}</p>
                <p className="mt-1 type-body text-fg">{t("today.kitSetupLead")}</p>
                <p className="mt-1.5 type-body text-fg">{t("today.kitSetupHint")}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {STARTER_SUPPLEMENTS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      disabled={kitAdding}
                      onClick={() => void addKitItem(name)}
                      className="type-chip rounded-full border border-border bg-sunken px-2.5 py-1 text-fg hover:border-fg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                      data-testid={`today-kit-starter-${starterSlug(name)}`}
                    >
                      + {name}
                    </button>
                  ))}
                </div>
                <form
                  className="mt-1.5 flex flex-wrap items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!kitName.trim()) return;
                    void addKitItem(kitName);
                  }}
                >
                  <input
                    type="text"
                    value={kitName}
                    onChange={(e) => setKitName(e.target.value)}
                    placeholder={t("today.kitSetupInputPlaceholder")}
                    disabled={kitAdding}
                    autoComplete="off"
                    data-testid="today-kit-setup-input"
                    className="min-h-9 min-w-[12rem] flex-1 rounded-lg border border-border bg-sunken px-2.5 py-1.5 type-body text-fg placeholder:text-fg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                  />
                  <button
                    type="submit"
                    disabled={kitAdding || !kitName.trim()}
                    data-testid="today-kit-setup-add"
                    className="inline-flex min-h-9 items-center rounded-lg border border-border bg-sunken px-3 py-1.5 type-body text-fg hover:border-fg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                  >
                    {kitAdding ? t("today.kitSetupAdding") : t("today.kitSetupAdd")}
                  </button>
                </form>
                {kitFeedback ? (
                  <p className="mt-1.5 type-caption text-fg" role="status">
                    {kitFeedback}
                  </p>
                ) : null}
                {kitAddError ? (
                  <p className="mt-1.5 type-body text-fg" role="alert">
                    {t("today.kitSetupAddError")}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={skipKitSetup}
                  data-testid="today-kit-setup-skip"
                  className="mt-1.5 inline-flex min-h-9 items-center type-body text-fg underline-offset-2 hover:underline"
                >
                  {t("today.kitSetupSkip")}
                </button>
              </div>
            ) : (
              <Link
                href={inventoryCount > 0 ? "/biohack#stack" : "/biohack#shelf"}
                className="mt-3 flex min-h-11 items-start gap-2 rounded-lg border border-dashed border-border/80 bg-sunken/40 px-3 py-2 text-sm text-fg transition hover:border-growth/30 hover:text-fg-secondary"
                data-testid="today-kit-placeholder"
              >
                <span className="font-medium text-fg">{t("today.kitPick")}:</span>
                <span className="type-body text-fg">
                  {inventoryCount > 0 ? t("today.kitSetupNoMatch") : t("today.kitSetupEmpty")}
                </span>
              </Link>
            )}

            {indication.when_slot ? (
              <p
                className="mt-3 text-xs font-medium uppercase tracking-wide text-fg-muted"
                data-testid="today-when"
              >
                {t("today.when")}:{" "}
                <span className="text-fg-secondary normal-case tracking-normal">
                  {whenLabel(indication.when_slot, t)}
                </span>
              </p>
            ) : null}

            {indication.main_action_why || indication.main_action_micro || indication.drivers?.length ? (
              <details className="mt-2 group" data-testid="main-action-why-details">
                <summary className="mt-1 inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg border border-border bg-sunken/70 px-3 py-2 text-xs font-semibold text-fg transition hover:border-growth/40 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-growth/40 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden
                    className="inline-block text-fg-muted transition-transform group-open:rotate-90"
                  >
                    ▸
                  </span>
                  <span>{t("today.why")}</span>
                  <span className="font-normal text-fg-muted">· {t("today.whyHint")}</span>
                </summary>
                {indication.main_action_micro ? (
                  <p
                    className="mt-2 text-sm text-fg-secondary"
                    data-testid="main-action-micro"
                  >
                    {indication.main_action_micro}
                  </p>
                ) : null}
                {indication.main_action_why ? (
                  <p className="mt-2 text-sm text-fg-secondary" data-testid="main-action-why">
                    {indication.main_action_why}
                  </p>
                ) : null}
                {indication.drivers?.length ? (
                  <div className="mt-2" data-testid="indication-drivers">
                    <p className="text-xs font-medium uppercase tracking-wide text-fg-secondary">
                      {t("today.chartNotes")}
                    </p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-fg-secondary">
                      {indication.drivers.slice(0, 4).map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </details>
            ) : null}
            {timeUnknown ? (
              <p
                className="mt-3 type-body text-fg-secondary"
                data-testid="today-time-unknown-caveat"
              >
                {t("chart.timeUnknownCaveat")}{" "}
                <Link
                  href="/profile"
                  className="type-body text-fg-secondary underline-offset-2 hover:underline"
                >
                  {t("chart.timeUnknownEdit")}
                </Link>
              </p>
            ) : null}
            {indication.save_chart_cta ? (
              <Link
                href="/profile"
                className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep"
                data-testid="indication-save-chart-cta"
              >
                {t("today.saveNatal")}
              </Link>
            ) : null}
          </div>
          <aside
            className="flex w-full shrink-0 flex-row flex-wrap gap-2 sm:w-44 sm:flex-col"
            data-testid="main-action-status"
            aria-label={`${t("today.energy")} · ${t("today.space")}`}
          >
            <div className="min-w-[9rem] flex-1 rounded-lg border border-border bg-elevated px-3 py-2 sm:flex-none">
              <p className="mb-1 inline-flex items-center gap-1 type-chip uppercase tracking-wide text-fg-secondary">
                <BatteryMedium className="h-3 w-3" aria-hidden />
                {t("today.energy")}
              </p>
              <span className="inline-flex items-center rounded-md border border-growth/40 bg-growth-soft px-2 py-0.5 text-xs font-semibold text-growth-ink">
                {energyLabel}
              </span>
            </div>
            <div className="min-w-[9rem] flex-1 rounded-lg border border-border bg-elevated px-3 py-2 sm:flex-none">
              <p className="mb-1 inline-flex items-center gap-1 type-chip uppercase tracking-wide text-fg-secondary">
                <MapPin className="h-3 w-3" aria-hidden />
                {t("today.space")}
              </p>
              <span className="inline-flex items-center rounded-md border border-energy/40 bg-energy-soft px-2 py-0.5 text-xs font-semibold text-energy-ink">
                {spaceLabel}
              </span>
            </div>
          </aside>
        </div>
      </div>

      {protocolsUnlocked && !hasKitStackHandoff ? (
        <p className="mb-4">
          <Link
            href="/biohack"
            data-testid="open-protocols-secondary"
            className="inline-flex min-h-10 items-center type-body text-fg underline-offset-2 hover:underline"
          >
            {t("today.tickStack")}
          </Link>
        </p>
      ) : null}

      {/* Evening Close — own block under Move hero, above sky */}
      {(() => {
        const typeKey = normalizeHdType(natalType);
        if (!typeKey || !userId || !chartId) return null;
        const itemId = eveningCloseItemId();
        const row = completions[itemId];
        const alreadyDone = Boolean(row?.done);
        const visible = isEveningCloseVisible({
          timeZone: protocolsTz,
          whenSlot: indication.when_slot,
          alreadyDone,
        });
        if (!visible) return null;
        const saved = parseEveningCloseLabel(row?.label);
        const qKey = eveningQuestionKey(typeKey);
        const options = eveningAnswerOptions(typeKey);
        const canTap = Boolean(userId && chartId);
        const note = row?.note || "";
        return (
          <div
            className="mb-4 rounded-xl border border-border bg-sunken/40 px-3 py-2.5"
            data-testid="today-evening-close"
            data-type={typeKey}
            data-answer={saved?.answer || undefined}
          >
            <p className="mb-1 type-chip uppercase tracking-wide text-fg-secondary">
              {t("today.eveningClose.label")}
            </p>
            <p
              className="type-body font-medium text-fg"
              data-testid="today-evening-close-question"
            >
              {t(qKey)}
            </p>
            <div
              className="mt-2 flex flex-wrap gap-2"
              data-testid="today-evening-close-choices"
            >
              {options.map((opt) => {
                const selected = saved?.answer === opt.answer;
                return (
                  <button
                    key={opt.answer}
                    type="button"
                    disabled={!canTap}
                    aria-pressed={selected}
                    data-testid={`today-evening-close-${opt.answer}`}
                    onClick={() => persistEveningClose(opt.answer, typeKey)}
                    className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-growth/40 ${
                      selected
                        ? "border-growth bg-growth-soft text-growth-ink"
                        : "border-border bg-elevated text-fg-secondary hover:border-growth/40"
                    } ${!canTap ? "opacity-50" : ""}`}
                  >
                    {t(opt.labelKey)}
                  </button>
                );
              })}
            </div>
            {alreadyDone ? (
              <div className="mt-2" data-testid="today-evening-close-receipt">
                <p className="text-xs text-fg-muted">{t("today.eveningClose.saved")}</p>
                <label
                  className="mt-2 block type-caption text-fg-secondary"
                  htmlFor={`today-evening-note-${itemId}`}
                >
                  {t("today.eveningClose.noteLabel")}
                </label>
                <input
                  id={`today-evening-note-${itemId}`}
                  type="text"
                  maxLength={120}
                  defaultValue={note}
                  placeholder={t("today.eveningClose.notePlaceholder")}
                  disabled={!canTap}
                  className="mt-0.5 w-full rounded-lg border border-border bg-elevated px-2.5 py-1.5 text-xs text-fg placeholder:text-fg-muted disabled:opacity-50"
                  data-testid="today-evening-close-note"
                  onBlur={(e) => {
                    if (e.target.value.trim() !== (note || "").trim()) {
                      persistNote(itemId, e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                />
              </div>
            ) : null}
          </div>
        );
      })()}

      {userId && chartId ? (
        <div className="mb-4">
          <EarlierWeeksHistory
            ref={historyRef}
            testId="today-history"
            userId={userId}
            chartId={chartId}
            timeZone={protocolsTz}
            scope="today"
            includeEveningClose={Boolean(normalizeHdType(natalType))}
            open={historyOpen}
            onOpenChange={setHistoryOpen}
          />
        </div>
      ) : null}

      {/* 2. Sky under the Move: new signal + Sky Story chapter + collapsed vs yesterday */}
      {daily || indication.sky_story ? (
        <div
          className="mb-3"
          data-testid="today-sky-block"
        >
          {daily ? (
            <div
              id="today-new-signal"
              className="scroll-mt-[calc(var(--app-header-h,4.5rem)+0.75rem)]"
              data-testid="daily-signal"
            >
              <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-energy-ink">
                <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {t("today.newSignal")}
              </p>
              <h3
                className="text-lg font-semibold text-fg"
                data-testid="daily-signal-headline"
              >
                {daily.headline}
              </h3>
              <p className="mt-1 text-sm text-fg-secondary" data-testid="daily-signal-body">
                {daily.body}
              </p>
            </div>
          ) : null}

          {indication.sky_story?.lines?.length ? (
            <div
              className="mt-3 space-y-1.5"
              data-testid="sky-story"
              aria-label={t("today.skyStory")}
            >
              {indication.sky_story.lines.slice(0, 4).map((line, i) => (
                <p
                  key={`${i}-${line.slice(0, 24)}`}
                  className="text-sm leading-relaxed text-fg-secondary"
                  data-testid="sky-story-line"
                >
                  {line}
                </p>
              ))}
            </div>
          ) : null}

          {vs.length > 0 ? (
            <details className="mt-3 group" data-testid="vs-yesterday">
              <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-lg px-0 py-1 text-xs font-semibold uppercase tracking-wide text-fg-muted transition hover:text-fg marker:content-none [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden
                  className="inline-block text-fg-muted transition-transform group-open:rotate-90"
                >
                  ▸
                </span>
                <span>{t("today.vsYesterday")}</span>
              </summary>
              <div
                className="mt-2 flex flex-wrap gap-2"
                role="list"
                aria-label={t("today.vsYesterday")}
              >
                {vs.map((d) => (
                  <span
                    key={`${d.field}-${d.from}-${d.to}`}
                    role="listitem"
                    className="inline-flex min-h-9 items-center rounded-full border border-border bg-sunken px-3 py-1.5 text-xs text-fg-secondary"
                    data-testid={`vs-${d.field}`}
                  >
                    {vsPillLabel(d, t)}
                  </span>
                ))}
              </div>
            </details>
          ) : null}

          {indication.sky_story?.tomorrow?.text && !upcomingOpen ? (
            <p
              className="mt-3 text-xs text-fg-muted"
              data-testid="sky-story-tomorrow"
            >
              {indication.sky_story.tomorrow.text}
            </p>
          ) : null}

          <div className={indication.sky_story?.tomorrow?.text && !upcomingOpen ? "mt-1" : "mt-3"}>
            <button
              type="button"
              aria-expanded={upcomingOpen}
              onClick={toggleUpcoming}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg px-0 py-1 text-xs font-semibold uppercase tracking-wide text-fg-muted transition hover:text-fg"
              data-testid="today-upcoming-toggle"
            >
              <span
                aria-hidden
                className={`inline-block text-fg-muted transition-transform ${upcomingOpen ? "rotate-90" : ""}`}
              >
                ▸
              </span>
              <span>{t("today.upcoming.toggle")}</span>
            </button>
            {upcomingOpen ? (
              <div className="mt-2 space-y-1.5" data-testid="today-upcoming">
                {upcomingStatus === "loading" || upcomingStatus === "idle" ? (
                  <p className="text-xs text-fg-muted" data-testid="today-upcoming-loading">
                    {t("today.upcoming.loading")}
                  </p>
                ) : upcomingStatus === "error" ? (
                  <div data-testid="today-upcoming-error">
                    <p className="text-xs text-fg-muted">{t("today.upcoming.error")}</p>
                    <button
                      type="button"
                      onClick={() => void loadUpcoming()}
                      className="mt-1 inline-flex min-h-9 items-center text-xs text-fg underline-offset-2 hover:underline"
                      data-testid="today-upcoming-retry"
                    >
                      {t("today.upcoming.retry")}
                    </button>
                  </div>
                ) : upcomingRows.length === 0 ? (
                  <p className="text-xs text-fg-muted">{t("today.upcoming.empty")}</p>
                ) : (
                  upcomingRows.map((row) =>
                    row.type === "hold" ? (
                      <p
                        key={`hold-${row.throughDay}`}
                        className="text-sm leading-relaxed text-fg-secondary"
                        data-testid="today-upcoming-row"
                      >
                        {t("today.upcoming.sunThemeHoldsThrough", { weekday: row.weekday })}
                      </p>
                    ) : (
                      <div
                        key={row.day}
                        className="space-y-0.5"
                        data-testid="today-upcoming-row"
                      >
                        {row.leads.map((lead, i) => (
                          <div key={`${row.day}-${lead.kind}-${i}`}>
                            <p className="text-sm leading-relaxed text-fg-secondary">
                              {upcomingLeadSentence(lead.kind, lead.weekday, t)}
                            </p>
                            {lead.label ? (
                              <p className="text-xs text-fg-muted">{lead.label}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )
                  )
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : vs.length > 0 ? (
        <details className="mb-3 group" data-testid="vs-yesterday">
          <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-lg px-0 py-1 text-xs font-semibold uppercase tracking-wide text-fg-muted transition hover:text-fg marker:content-none [&::-webkit-details-marker]:hidden">
            <span
              aria-hidden
              className="inline-block text-fg-muted transition-transform group-open:rotate-90"
            >
              ▸
            </span>
            <span>{t("today.vsYesterday")}</span>
          </summary>
          <div
            className="mt-2 flex flex-wrap gap-2"
            role="list"
            aria-label={t("today.vsYesterday")}
          >
            {vs.map((d) => (
              <span
                key={`${d.field}-${d.from}-${d.to}`}
                role="listitem"
                className="inline-flex min-h-9 items-center rounded-full border border-border bg-sunken px-3 py-1.5 text-xs text-fg-secondary"
                data-testid={`vs-${d.field}`}
              >
                {vsPillLabel(d, t)}
              </span>
            ))}
          </div>
        </details>
      ) : null}

      {caption ? (
        <p className="mb-3 text-xs text-fg-muted" data-testid="conditioning-caption">
          {caption}
        </p>
      ) : null}

      {/* 3. Contextual literacy pulse — below Move + sky, above disclaimer */}
      {(() => {
        const pulse = contextualHdFact({
          vsYesterday: vs,
          dailySignal: daily,
          timeZone: preferredTimezone,
        });
        return (
          <aside
            className="mb-4 rounded-xl border border-border bg-sunken/50 px-4 py-3"
            data-testid="hd-fact-of-the-day"
            data-day-key={pulse.dayKey}
            data-sky-keyed={pulse.skyKeyed ? "true" : "false"}
            data-literacy-field={pulse.field || undefined}
          >
            <p className="mb-1 type-chip uppercase tracking-wide text-fg-secondary">
              {t("today.hdFactLabel")}
            </p>
            <p className="text-sm text-fg-secondary" data-testid="hd-fact-text">
              {pulse.fact}
            </p>
            {pulse.howToReadTargetId ? (
              <button
                type="button"
                onClick={(e) =>
                  onHowToRead?.(pulse.howToReadTargetId as string, e.currentTarget)
                }
                className="mt-2 inline-flex text-xs font-medium text-growth-ink underline-offset-2 hover:underline"
                data-testid="hd-fact-how-to-read"
              >
                {t("today.howToReadJump")}
              </button>
            ) : null}
          </aside>
        );
      })()}

      {/* 4. Quiet disclaimer footer */}
      <p
        className="type-caption leading-relaxed text-fg-secondary"
        data-testid="indication-disclaimer"
      >
        {indication.disclaimer || t("today.disclaimerFallback")}
      </p>
    </div>
  );
}
