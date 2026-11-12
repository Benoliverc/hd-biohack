"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  type Ref,
} from "react";
import { api, type ProtocolCompletionRow } from "@/lib/api";
import {
  parseEveningCloseLabel,
  type EveningAnswerKey,
} from "@/lib/eveningSignatureClose";
import { useI18n, type MessageKey } from "@/lib/i18n";
import {
  filterHistoryRows,
  groupHistoryByWeek,
  historyWeekHeading,
  isEveningCloseItemId,
  isTodayKitItemId,
  priorHistoryRange,
  type HistoryScope,
  type HistorySourceRow,
  type HistoryWeekGroup,
} from "@/lib/earlierWeeksHistory";
import {
  formatWeekDayLabel,
  loadDayCompletions,
  mergeServerCompletions,
  resolveProtocolsTz,
  saveDayCompletions,
  weekDayKeysInZone,
  type DayCompletions,
} from "@/lib/protocolCompletions";

type Props = {
  testId: "today-history" | "week-history";
  userId: number;
  chartId: number;
  timeZone?: string | null;
  scope: HistoryScope;
  includeEveningClose?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function eveningAnswerKey(answer: EveningAnswerKey): MessageKey {
  if (answer === "yes") return "today.eveningClose.yes";
  if (answer === "no") return "today.eveningClose.no";
  if (answer === "recognized") return "today.eveningClose.recognized";
  return "today.eveningClose.rest";
}

function rowsFromDayMap(day: string, map: DayCompletions): HistorySourceRow[] {
  return Object.entries(map).map(([id, item]) => ({
    item_id: id,
    day,
    kind: item.kind,
    label: item.label,
    done: item.done,
    note: item.note,
  }));
}

function collectWindowRows(args: {
  userId: number;
  chartId: number;
  from: string;
  to: string;
  weekKeys: string[];
  currentWeekKeys: ReadonlySet<string>;
  serverItems: ProtocolCompletionRow[];
  persist: boolean;
}): HistorySourceRow[] {
  const byDay = new Map<string, ProtocolCompletionRow[]>();
  for (const row of args.serverItems) {
    if (!row.day) continue;
    const list = byDay.get(row.day) || [];
    list.push(row);
    byDay.set(row.day, list);
  }
  const days = Array.from(new Set<string>([...args.weekKeys, ...Array.from(byDay.keys())]));
  const rows: HistorySourceRow[] = [];
  for (const day of days) {
    if (day < args.from || day > args.to) continue;
    if (args.currentWeekKeys.has(day)) continue;
    const base = loadDayCompletions(args.userId, args.chartId, day);
    const merged = mergeServerCompletions(base, byDay.get(day) || []);
    if (args.persist) saveDayCompletions(args.userId, args.chartId, day, merged);
    rows.push(...rowsFromDayMap(day, merged));
  }
  return rows;
}

const EarlierWeeksHistory = forwardRef(function EarlierWeeksHistory(
  {
    testId,
    userId,
    chartId,
    timeZone,
    scope,
    includeEveningClose = true,
    open,
    onOpenChange,
  }: Props,
  ref: Ref<HTMLDetailsElement>
) {
  const { t } = useI18n();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [weeks, setWeeks] = useState<HistoryWeekGroup[]>([]);

  const load = useCallback(async () => {
    const range = priorHistoryRange(timeZone);
    const currentWeekKeys = new Set(weekDayKeysInZone(resolveProtocolsTz(timeZone)));
    const weekKeys = range.weeks.flat();
    const localRows = collectWindowRows({
      userId,
      chartId,
      from: range.from,
      to: range.to,
      weekKeys,
      currentWeekKeys,
      serverItems: [],
      persist: false,
    });
    const localWeeks = groupHistoryByWeek(
      filterHistoryRows(localRows, {
        scope,
        includeEveningClose,
        from: range.from,
        to: range.to,
      })
    );
    if (localWeeks.length > 0) setWeeks(localWeeks);
    setStatus("loading");
    try {
      const res = await api.listProtocolCompletions(userId, chartId, {
        from: range.from,
        to: range.to,
      });
      const mergedRows = collectWindowRows({
        userId,
        chartId,
        from: range.from,
        to: range.to,
        weekKeys,
        currentWeekKeys,
        serverItems: res.items || [],
        persist: true,
      });
      setWeeks(
        groupHistoryByWeek(
          filterHistoryRows(mergedRows, {
            scope,
            includeEveningClose,
            from: range.from,
            to: range.to,
          })
        )
      );
      setStatus("ready");
    } catch {
      setWeeks(localWeeks);
      setStatus("error");
    }
  }, [userId, chartId, timeZone, scope, includeEveningClose]);

  useEffect(() => {
    void load();
  }, [load]);

  const isControlled = open !== undefined;

  return (
    <details
      ref={ref}
      className="scroll-mt-[calc(var(--app-header-h,4.5rem)+0.75rem)] rounded-xl border border-border bg-sunken/40 px-3 py-2.5"
      data-testid={testId}
      {...(isControlled ? { open } : {})}
      onToggle={(e) => onOpenChange?.(e.currentTarget.open)}
    >
      <summary className="cursor-pointer list-none type-caption text-fg-secondary marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="underline-offset-2 hover:underline">{t("history.earlierWeeks")}</span>
      </summary>
      <div className="mt-2">
        {status === "loading" && weeks.length === 0 ? (
          <p className="type-body text-fg-secondary" data-testid={`${testId}-wait`}>
            {t("history.waiting")}
          </p>
        ) : null}
        {status === "error" ? (
          <div
            className="mb-2 flex flex-wrap items-center gap-2"
            data-testid={`${testId}-error`}
          >
            <p className="type-body text-fg-secondary">{t("history.error")}</p>
            <button
              type="button"
              data-testid={`${testId}-retry`}
              onClick={() => void load()}
              className="type-caption text-fg underline-offset-2 hover:underline"
            >
              {t("history.retry")}
            </button>
          </div>
        ) : null}
        {status === "ready" && weeks.length === 0 ? (
          <p className="type-body text-fg-secondary" data-testid={`${testId}-empty`}>
            {t("history.empty")}
          </p>
        ) : null}
        {weeks.length > 0 ? (
          <div className="space-y-3" data-testid={`${testId}-list`}>
            {weeks.map((week) => (
              <section key={week.weekStart} data-testid={`${testId}-week`} data-week={week.weekStart}>
                <h3 className="type-caption font-medium text-fg-secondary">
                  {historyWeekHeading(week.weekKeys)}
                </h3>
                <ul className="mt-1.5 space-y-1.5">
                  {week.days.map((day) =>
                    day.items.map((item) => {
                      const evening = isEveningCloseItemId(item.id) || item.kind === "evening";
                      const parsed = evening ? parseEveningCloseLabel(item.label) : null;
                      const title = evening
                        ? t("today.eveningClose.label")
                        : item.label;
                      const answer = parsed ? t(eveningAnswerKey(parsed.answer)) : null;
                      return (
                        <li
                          key={`${day.day}:${item.id}`}
                          className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-fg-secondary"
                          data-testid={`${testId}-item`}
                          data-day={day.day}
                          data-item={item.id}
                          data-kind={item.kind}
                        >
                          <span className="shrink-0 type-caption font-medium text-fg-secondary">
                            {formatWeekDayLabel(day.day)}
                          </span>
                          <span className={item.kind === "baseline" ? "text-fg-muted" : "text-fg"}>
                            {title}
                          </span>
                          {answer ? (
                            <span className="text-fg">{answer}</span>
                          ) : null}
                          {item.kind === "baseline" ? (
                            <span className="rounded-full bg-sunken px-1.5 py-0.5 type-caption text-fg-secondary">
                              baseline
                            </span>
                          ) : null}
                          {item.kind === "kit" || isTodayKitItemId(item.id) ? (
                            <span className="rounded-full bg-sunken px-1.5 py-0.5 type-caption text-fg-secondary">
                              kit
                            </span>
                          ) : null}
                          {item.note ? (
                            <span className="w-full type-caption italic text-fg-secondary sm:w-auto">
                              — {item.note}
                            </span>
                          ) : null}
                        </li>
                      );
                    })
                  )}
                </ul>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </details>
  );
});

export default EarlierWeeksHistory;
