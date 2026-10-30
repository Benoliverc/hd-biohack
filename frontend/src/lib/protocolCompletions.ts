/**
 * Protocols completion store — local cache + server sync.
 *
 * Day/week boundaries use the account preferred timezone (fallback Asia/Hong_Kong).
 * Daily Novelty buckets stay HKT — see timezone.ts; do not retarget novelty here.
 *
 * Day key (v2): hd-biohack:protocol-done:v2:{userId}:{chartId}:{YYYY-MM-DD}
 * Migrates boolean maps from v1 keys on first read.
 *
 * Note: existing v2 keys written under HKT may orphan mid-day when the user
 * switches timezone — acceptable for v1 (no migration).
 */

export type CompletionKind = "move" | "baseline";

export type CompletionItem = {
  done: boolean;
  label: string;
  kind: CompletionKind;
  note?: string;
};

export type DayCompletions = Record<string, CompletionItem>;

export type WeekCompletedRow = {
  id: string;
  label: string;
  kind: CompletionKind;
  note?: string;
  day: string; // YYYY-MM-DD in account TZ
};

const V1_PREFIX = "hd-biohack:protocol-done:v1:";
const V2_PREFIX = "hd-biohack:protocol-done:v2:";

/** Fallback when preferred_timezone is unset — matches prior HKT behaviour. */
export const DEFAULT_PROTOCOLS_TZ = "Asia/Hong_Kong";

export function resolveProtocolsTz(tz?: string | null): string {
  const cleaned = (tz || "").trim();
  return cleaned || DEFAULT_PROTOCOLS_TZ;
}

/** Calendar day key (YYYY-MM-DD) in an IANA timezone. */
export function dayKeyInZone(timeZone: string, d = new Date()): string {
  const zone = resolveProtocolsTz(timeZone);
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: DEFAULT_PROTOCOLS_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  }
}

/** @deprecated Prefer dayKeyInZone — kept for Daily Novelty / lead-fingerprint HKT keys. */
export function hkDayKey(d = new Date()): string {
  return dayKeyInZone(DEFAULT_PROTOCOLS_TZ, d);
}

function weekdayInZone(timeZone: string, d: Date): number {
  const zone = resolveProtocolsTz(timeZone);
  try {
    const wd = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      weekday: "short",
    }).format(d);
    const map: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    return map[wd] ?? 0;
  } catch {
    return d.getUTCDay();
  }
}

/** Monday–Sunday date keys for the calendar week containing `d` in `timeZone`. */
export function weekDayKeysInZone(timeZone: string, d = new Date()): string[] {
  const zone = resolveProtocolsTz(timeZone);
  const weekday = weekdayInZone(zone, d);
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const keys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const t = new Date(d.getTime() + (mondayOffset + i) * 86_400_000);
    keys.push(dayKeyInZone(zone, t));
  }
  return keys;
}

/** @deprecated Prefer weekDayKeysInZone. */
export function hkWeekDayKeys(d = new Date()): string[] {
  return weekDayKeysInZone(DEFAULT_PROTOCOLS_TZ, d);
}

/** Week rollup label — never claims HKT when account TZ ≠ HKT. */
export function weekRangeLabel(timeZone?: string | null): string {
  const zone = resolveProtocolsTz(timeZone);
  if (zone === DEFAULT_PROTOCOLS_TZ) return "Mon–Sun HKT";
  return `Mon–Sun · ${zone}`;
}

export function dayStorageKey(userId: number, chartId: number, day: string): string {
  return `${V2_PREFIX}${userId}:${chartId}:${day}`;
}

function v1StorageKey(userId: number, chartId: number, day: string): string {
  return `${V1_PREFIX}${userId}:${chartId}:${day}`;
}

function isCompletionItem(v: unknown): v is CompletionItem {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return typeof o.done === "boolean" && typeof o.label === "string";
}

/** Normalize any stored payload into DayCompletions. */
export function parseDayCompletions(raw: string | null): DayCompletions {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const root = parsed as Record<string, unknown>;
    const source =
      root.items && typeof root.items === "object"
        ? (root.items as Record<string, unknown>)
        : (parsed as Record<string, unknown>);
    const out: DayCompletions = {};
    for (const [id, val] of Object.entries(source)) {
      if (typeof val === "boolean") {
        out[id] = {
          done: val,
          label: id,
          kind: id.startsWith("baseline:") ? "baseline" : "move",
        };
      } else if (isCompletionItem(val)) {
        out[id] = {
          done: Boolean(val.done),
          label: String(val.label || id),
          kind: val.kind === "baseline" ? "baseline" : "move",
          note: typeof val.note === "string" && val.note.trim() ? val.note.trim() : undefined,
        };
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function loadDayCompletions(
  userId: number,
  chartId: number,
  day: string
): DayCompletions {
  if (typeof window === "undefined") return {};
  try {
    const v2 = window.localStorage.getItem(dayStorageKey(userId, chartId, day));
    if (v2) return parseDayCompletions(v2);
    const v1 = window.localStorage.getItem(v1StorageKey(userId, chartId, day));
    if (v1) {
      const migrated = parseDayCompletions(v1);
      saveDayCompletions(userId, chartId, day, migrated);
      return migrated;
    }
    return {};
  } catch {
    return {};
  }
}

export function saveDayCompletions(
  userId: number,
  chartId: number,
  day: string,
  map: DayCompletions
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      dayStorageKey(userId, chartId, day),
      JSON.stringify({ items: map })
    );
  } catch {
    /* quota */
  }
}

/** Merge server rows into a day map (server wins on conflict). */
export function mergeServerCompletions(
  local: DayCompletions,
  serverItems: Array<{
    item_id: string;
    kind?: string;
    label?: string;
    done: boolean;
    note?: string | null;
  }>
): DayCompletions {
  const next: DayCompletions = { ...local };
  for (const row of serverItems) {
    next[row.item_id] = {
      done: Boolean(row.done),
      label: String(row.label || row.item_id),
      kind: row.kind === "baseline" ? "baseline" : "move",
      note:
        typeof row.note === "string" && row.note.trim() ? row.note.trim() : undefined,
    };
  }
  return next;
}

export function toggleCompletion(
  map: DayCompletions,
  id: string,
  meta: { label: string; kind: CompletionKind }
): DayCompletions {
  const prev = map[id];
  const nextDone = !(prev?.done);
  const next: CompletionItem = {
    done: nextDone,
    label: meta.label || prev?.label || id,
    kind: meta.kind,
  };
  if (nextDone && prev?.note) next.note = prev.note;
  return { ...map, [id]: next };
}

export function setCompletionNote(
  map: DayCompletions,
  id: string,
  note: string
): DayCompletions {
  const prev = map[id];
  if (!prev) return map;
  const trimmed = note.trim();
  return {
    ...map,
    [id]: {
      ...prev,
      note: trimmed ? trimmed.slice(0, 120) : undefined,
    },
  };
}

export function doneMapFromCompletions(map: DayCompletions): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const [id, item] of Object.entries(map)) {
    if (item.done) out[id] = true;
  }
  return out;
}

/** Completed rows for the week containing `now` in `timeZone`, Mon→Sun order. */
export function loadWeekCompleted(
  userId: number,
  chartId: number,
  now = new Date(),
  timeZone?: string | null
): WeekCompletedRow[] {
  const zone = resolveProtocolsTz(timeZone);
  const rows: WeekCompletedRow[] = [];
  for (const day of weekDayKeysInZone(zone, now)) {
    const map = loadDayCompletions(userId, chartId, day);
    for (const [id, item] of Object.entries(map)) {
      if (!item.done) continue;
      rows.push({
        id,
        label: item.label || id,
        kind: item.kind,
        note: item.note,
        day,
      });
    }
  }
  return rows;
}

export function formatWeekDayLabel(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  if (!y || !m || !d) return day;
  // Date-only key → format as calendar date in UTC (weekday matches the YYYY-MM-DD).
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(utc);
  } catch {
    return day;
  }
}

export function progressPct(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}
