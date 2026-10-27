/**
 * Local-only Protocols completion store (HKT day + week rollup).
 * No server sync — Prove-it checklist (proposal C).
 *
 * Day key (v2): hd-biohack:protocol-done:v2:{userId}:{chartId}:{YYYY-MM-DD}
 * Migrates boolean maps from v1 keys on first read.
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
  day: string; // YYYY-MM-DD HKT
};

const V1_PREFIX = "hd-biohack:protocol-done:v1:";
const V2_PREFIX = "hd-biohack:protocol-done:v2:";

export function hkDayKey(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Monday–Sunday date keys for the HKT calendar week containing `d`. */
export function hkWeekDayKeys(d = new Date()): string[] {
  const today = hkDayKey(d);
  const [y, m, day] = today.split("-").map(Number);
  // 04:00 UTC = 12:00 HKT same calendar day (HKT is fixed UTC+8).
  const noonUtc = Date.UTC(y, m - 1, day, 4, 0, 0);
  const weekday = new Date(noonUtc).getUTCDay(); // 0=Sun … 6=Sat
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const keys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const t = new Date(noonUtc + (mondayOffset + i) * 86_400_000);
    const yy = t.getUTCFullYear();
    const mm = String(t.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(t.getUTCDate()).padStart(2, "0");
    keys.push(`${yy}-${mm}-${dd}`);
  }
  return keys;
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

/** Completed rows for the HKT week containing `now`, Mon→Sun order. */
export function loadWeekCompleted(
  userId: number,
  chartId: number,
  now = new Date()
): WeekCompletedRow[] {
  const rows: WeekCompletedRow[] = [];
  for (const day of hkWeekDayKeys(now)) {
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
  const utc = new Date(Date.UTC(y, m - 1, d, 4, 0, 0));
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Hong_Kong",
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
