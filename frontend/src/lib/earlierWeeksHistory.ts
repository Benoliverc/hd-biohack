/**
 * Earlier-weeks review (Executive Brief item 10).
 *
 * Bounded lookback of the three Monday–Sunday weeks before the current one.
 * Day keys use the account timezone (fallback Asia/Hong_Kong) — not the novelty clock.
 * Past Moves are any done today-move:* row on that stored day, not today's moment id.
 */

import { EVENING_CLOSE_ITEM_ID } from "@/lib/eveningSignatureClose";
import {
  resolveProtocolsTz,
  weekDayKeysInZone,
  type CompletionKind,
} from "@/lib/protocolCompletions";

export type HistoryScope = "today" | "protocols";

export type HistorySourceRow = {
  item_id: string;
  day: string;
  kind?: string;
  label?: string;
  done: boolean;
  note?: string | null;
};

export type HistoryItem = {
  id: string;
  day: string;
  kind: CompletionKind;
  label: string;
  note?: string;
};

export type HistoryDayGroup = {
  day: string;
  items: HistoryItem[];
};

export type HistoryWeekGroup = {
  weekStart: string;
  weekKeys: string[];
  days: HistoryDayGroup[];
};

export function isLifestyleMoveItemId(id: string): boolean {
  return id === "today-move" || id.startsWith("today-move:");
}

export function isTodayKitItemId(id: string): boolean {
  return id.startsWith("today-kit:");
}

export function isEveningCloseItemId(id: string): boolean {
  return id === EVENING_CLOSE_ITEM_ID;
}

function normalizeKind(kind: unknown, id: string): CompletionKind {
  if (isEveningCloseItemId(id) || kind === "evening") return "evening";
  if (kind === "baseline") return "baseline";
  return "move";
}

/** Three Mon–Sun weeks before the week containing `now`. Oldest week first. */
export function priorWeekKeysInZone(
  timeZone?: string | null,
  now = new Date()
): string[][] {
  const zone = resolveProtocolsTz(timeZone);
  const weeks: string[][] = [];
  for (let w = 3; w >= 1; w -= 1) {
    weeks.push(weekDayKeysInZone(zone, new Date(now.getTime() - w * 7 * 86_400_000)));
  }
  return weeks;
}

/** Inclusive `from`/`to` for the existing completions list endpoint. */
export function priorHistoryRange(
  timeZone?: string | null,
  now = new Date()
): { from: string; to: string; weeks: string[][] } {
  const weeks = priorWeekKeysInZone(timeZone, now);
  const from = weeks[0][0];
  const to = weeks[weeks.length - 1][6];
  return { from, to, weeks };
}

export function mondayOfDayKey(day: string): string | null {
  const [y, m, d] = day.split("-").map(Number);
  if (!y || !m || !d) return null;
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const wd = utc.getUTCDay();
  utc.setUTCDate(utc.getUTCDate() + (wd === 0 ? -6 : 1 - wd));
  const yyyy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function weekKeysFromMonday(monday: string): string[] {
  const [y, m, d] = monday.split("-").map(Number);
  if (!y || !m || !d) return [];
  const keys: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const utc = new Date(Date.UTC(y, m - 1, d + i, 12, 0, 0));
    const yyyy = utc.getUTCFullYear();
    const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(utc.getUTCDate()).padStart(2, "0");
    keys.push(`${yyyy}-${mm}-${dd}`);
  }
  return keys;
}

function itemRank(id: string, kind: CompletionKind): number {
  if (isLifestyleMoveItemId(id)) return 0;
  if (isTodayKitItemId(id)) return 1;
  if (isEveningCloseItemId(id) || kind === "evening") return 2;
  if (kind === "baseline") return 3;
  return 4;
}

/** Keep only done rows that belong on this surface. Never include auto-seeded offered Moves. */
export function filterHistoryRows(
  rows: HistorySourceRow[],
  opts: { scope: HistoryScope; includeEveningClose?: boolean; from?: string; to?: string }
): HistoryItem[] {
  const includeEvening = opts.includeEveningClose !== false;
  const out: HistoryItem[] = [];
  for (const row of rows) {
    if (!row.done) continue;
    const day = String(row.day || "");
    if (!day) continue;
    if (opts.from && day < opts.from) continue;
    if (opts.to && day > opts.to) continue;
    const id = row.item_id;
    if (!id) continue;
    if (opts.scope === "today") {
      const isMoveOrKit = isLifestyleMoveItemId(id) || isTodayKitItemId(id);
      const isEvening = isEveningCloseItemId(id) || row.kind === "evening";
      if (isMoveOrKit) {
        /* include */
      } else if (isEvening) {
        if (!includeEvening) continue;
      } else {
        continue;
      }
    }
    const note =
      typeof row.note === "string" && row.note.trim() ? row.note.trim() : undefined;
    out.push({
      id,
      day,
      kind: normalizeKind(row.kind, id),
      label: String(row.label || id),
      note,
    });
  }
  return out;
}

/**
 * Group done rows by stored day, then by that day's Monday–Sunday week.
 * Newest week first; days newest first. Empty weeks and days are omitted
 * (no invented misses before the first done row).
 */
export function groupHistoryByWeek(items: HistoryItem[]): HistoryWeekGroup[] {
  const byDay = new Map<string, HistoryItem[]>();
  for (const item of items) {
    const list = byDay.get(item.day) || [];
    list.push(item);
    byDay.set(item.day, list);
  }
  const days: HistoryDayGroup[] = Array.from(byDay.entries()).map(([day, dayItems]) => ({
    day,
    items: dayItems.slice().sort((a, b) => {
      const rank = itemRank(a.id, a.kind) - itemRank(b.id, b.kind);
      return rank !== 0 ? rank : a.id.localeCompare(b.id);
    }),
  }));
  const byWeek = new Map<string, HistoryDayGroup[]>();
  for (const day of days) {
    const monday = mondayOfDayKey(day.day);
    if (!monday) continue;
    const list = byWeek.get(monday) || [];
    list.push(day);
    byWeek.set(monday, list);
  }
  const weeks: HistoryWeekGroup[] = Array.from(byWeek.entries()).map(
    ([weekStart, weekDays]) => ({
      weekStart,
      weekKeys: weekKeysFromMonday(weekStart),
      days: weekDays.slice().sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0)),
    })
  );
  weeks.sort((a, b) => (a.weekStart < b.weekStart ? 1 : a.weekStart > b.weekStart ? -1 : 0));
  return weeks;
}

export function historyWeekHeading(weekKeys: string[]): string {
  if (weekKeys.length < 2) return weekKeys[0] || "";
  const start = weekKeys[0];
  const end = weekKeys[weekKeys.length - 1];
  const fmt = (day: string) => {
    const [y, m, d] = day.split("-").map(Number);
    if (!y || !m || !d) return day;
    const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    try {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: "UTC",
        day: "numeric",
        month: "short",
      }).format(utc);
    } catch {
      return day;
    }
  };
  return `${fmt(start)}–${fmt(end)}`;
}
