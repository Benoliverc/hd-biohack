import type { MessageKey } from "@/lib/i18n";

/** Format IANA timezone + UTC offset for a given local birth moment. */
export function formatTimezoneLabel(
  timeZone: string | null | undefined,
  birthDate?: string | null,
  birthTime?: string | null
): string | null {
  if (!timeZone) return null;
  const at = birthInstant(birthDate, birthTime) ?? new Date();
  const offset = utcOffsetLabel(timeZone, at);
  return offset ? `${timeZone} (${offset})` : timeZone;
}

function birthInstant(birthDate?: string | null, birthTime?: string | null): Date | null {
  if (!birthDate) return null;
  const t = (birthTime || "00:00").slice(0, 8);
  const hhmmss = t.length === 5 ? `${t}:00` : t;
  // Interpret as UTC wall-clock just for offset lookup; Intl uses the zone.
  const d = new Date(`${birthDate}T${hhmmss}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function utcOffsetLabel(timeZone: string, at: Date): string | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(at);
    const raw = parts.find((p) => p.type === "timeZoneName")?.value;
    if (!raw) return null;
    // GMT-4 / GMT+8 / GMT → UTC−4 / UTC+8 / UTC+0
    if (raw === "GMT" || raw === "UTC") return "UTC+0";
    return raw.replace(/^GMT/, "UTC").replace("-", "−");
  } catch {
    return null;
  }
}

/** Normalize API HH:MM:SS → HTML time input HH:MM */
export function toTimeInputValue(t: string | null | undefined): string {
  if (!t) return "";
  const m = t.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return t.slice(0, 5);
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

/** Format an ISO instant in a natal IANA zone (or UTC fallback). */
export function formatAsOfInZone(
  isoUtc: string | null | undefined,
  timeZone?: string | null
): string | null {
  if (!isoUtc) return null;
  const at = new Date(isoUtc);
  if (Number.isNaN(at.getTime())) return null;
  const zone = timeZone?.trim() || "UTC";
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(at);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value ?? "";
    const wall = `${get("day")} ${get("month")} ${get("year")}, ${get("hour")}:${get("minute")}`;
    const offset = utcOffsetLabel(zone, at);
    const zoneLabel = zone === "UTC" ? "UTC" : zone;
    return offset
      ? `As of ${wall} · ${zoneLabel} (${offset})`
      : `As of ${wall} · ${zoneLabel}`;
  } catch {
    return `As of ${at.toISOString()} · UTC`;
  }
}

/** Novelty day bucket hour in the account timezone (matches backend BUCKET_HOUR). */
export const NOVELTY_BUCKET_HOUR = 7;
/** @deprecated Use NOVELTY_BUCKET_HOUR — kept so older tests can migrate in this pass. */
export const NOVELTY_BUCKET_HOUR_HKT = NOVELTY_BUCKET_HOUR;

export const DEFAULT_NOVELTY_TZ = "Asia/Hong_Kong";

/** Resolve a preferred IANA zone; invalid or empty falls back to Asia/Hong_Kong. */
export function resolveAccountTz(timeZone?: string | null): string {
  const cleaned = (timeZone || "").trim();
  if (!cleaned) return DEFAULT_NOVELTY_TZ;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: cleaned }).format(new Date());
    return cleaned;
  } catch {
    return DEFAULT_NOVELTY_TZ;
  }
}

type ZoneParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function partsInZone(timeZone: string, now: Date): ZoneParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const map: Record<string, string> = {};
  for (const part of fmt.formatToParts(now)) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

/** Instant for a wall-clock time in a zone (DST-safe; no fixed UTC offset). */
export function zonedWallTime(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
  second = 0
): Date {
  const zone = resolveAccountTz(timeZone);
  let utc = Date.UTC(year, month - 1, day, hour, minute, second);
  for (let i = 0; i < 4; i++) {
    const p = partsInZone(zone, new Date(utc));
    const got = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    const wanted = Date.UTC(year, month - 1, day, hour, minute, second);
    const delta = wanted - got;
    if (delta === 0) break;
    utc += delta;
  }
  return new Date(utc);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatYmd(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/**
 * Novelty calendar day (YYYY-MM-DD) in the account timezone, flipping at 07:00.
 * Before 07:00, this is the previous calendar date in that zone.
 */
export function noveltyDayKey(timeZone?: string | null, now: Date = new Date()): string {
  const zone = resolveAccountTz(timeZone);
  const p = partsInZone(zone, now);
  if (p.hour >= NOVELTY_BUCKET_HOUR) {
    return formatYmd(p.year, p.month, p.day);
  }
  const todayNoon = zonedWallTime(zone, p.year, p.month, p.day, 12);
  const prev = new Date(todayNoon.getTime() - 24 * 60 * 60 * 1000);
  const q = partsInZone(zone, prev);
  return formatYmd(q.year, q.month, q.day);
}

/** @deprecated Use noveltyDayKey(undefined, now) — HKT fallback. */
export function noveltyDayKeyHkt(now: Date = new Date()): string {
  return noveltyDayKey(DEFAULT_NOVELTY_TZ, now);
}

/** Previous novelty day key (the 07:00 bucket before the current one). */
export function prevNoveltyDayKey(timeZone?: string | null, now: Date = new Date()): string {
  const zone = resolveAccountTz(timeZone);
  const key = noveltyDayKey(zone, now);
  const [y, mo, d] = key.split("-").map(Number);
  const noon = zonedWallTime(zone, y, mo, d, 12);
  const prev = new Date(noon.getTime() - 24 * 60 * 60 * 1000);
  const q = partsInZone(zone, prev);
  return formatYmd(q.year, q.month, q.day);
}

/**
 * Next Daily Novelty reset instant: next 07:00 in the account timezone.
 * If `now` is at or after today's 07:00, returns tomorrow's 07:00 in that zone.
 */
export function nextNoveltyReset(timeZone?: string | null, now: Date = new Date()): Date {
  const zone = resolveAccountTz(timeZone);
  const p = partsInZone(zone, now);
  let reset = zonedWallTime(zone, p.year, p.month, p.day, NOVELTY_BUCKET_HOUR);
  if (now.getTime() >= reset.getTime()) {
    const todayNoon = zonedWallTime(zone, p.year, p.month, p.day, 12);
    const next = new Date(todayNoon.getTime() + 24 * 60 * 60 * 1000);
    const q = partsInZone(zone, next);
    reset = zonedWallTime(zone, q.year, q.month, q.day, NOVELTY_BUCKET_HOUR);
  }
  return reset;
}

/** @deprecated Use nextNoveltyReset. */
export function nextNoveltyResetHkt(now: Date = new Date()): Date {
  return nextNoveltyReset(DEFAULT_NOVELTY_TZ, now);
}

export type ResetsInParts =
  | { kind: "soon" }
  | { kind: "minutes"; n: number }
  | { kind: "aboutAnHour" }
  | { kind: "hours"; n: number };

export function resetsInParts(
  now: Date = new Date(),
  timeZone?: string | null
): ResetsInParts {
  const ms = nextNoveltyReset(timeZone, now).getTime() - now.getTime();
  if (ms < 60_000) return { kind: "soon" };
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return { kind: "minutes", n: minutes };
  if (minutes < 120) return { kind: "aboutAnHour" };
  const hours = Math.round(ms / 3_600_000);
  return { kind: "hours", n: hours };
}

const RESETS_KEYS = {
  soon: "today.resetsSoon",
  oneMinute: "today.resetsInOneMinute",
  minutes: "today.resetsInMinutes",
  aboutAnHour: "today.resetsInAboutAnHour",
  oneHour: "today.resetsInOneHour",
  hours: "today.resetsInHours",
} as const;

type ResetsTFn = (key: MessageKey, vars?: Record<string, string | number>) => string;

function resetsInEnglish(parts: ResetsInParts): string {
  if (parts.kind === "soon") return "Resets soon";
  if (parts.kind === "minutes") {
    return parts.n === 1 ? "Resets in ~1 minute" : `Resets in ~${parts.n} minutes`;
  }
  if (parts.kind === "aboutAnHour") return "Resets in about an hour";
  return parts.n === 1 ? "Resets in ~1 hour" : `Resets in ~${parts.n} hours`;
}

/**
 * Warm relative countdown to the next Daily Novelty reset (07:00 in the account timezone).
 * Approximate on purpose. When `t` is provided, uses keyed copy; otherwise English.
 */
export function formatResetsIn(
  now: Date = new Date(),
  timeZone?: string | null,
  t?: ResetsTFn
): string {
  const parts = resetsInParts(now, timeZone);
  if (!t) return resetsInEnglish(parts);
  if (parts.kind === "soon") return t(RESETS_KEYS.soon);
  if (parts.kind === "minutes") {
    return parts.n === 1 ? t(RESETS_KEYS.oneMinute) : t(RESETS_KEYS.minutes, { n: parts.n });
  }
  if (parts.kind === "aboutAnHour") return t(RESETS_KEYS.aboutAnHour);
  return parts.n === 1 ? t(RESETS_KEYS.oneHour) : t(RESETS_KEYS.hours, { n: parts.n });
}

/** @deprecated Use formatResetsIn(now, timeZone). */
export function formatResetsInHkt(now: Date = new Date()): string {
  return formatResetsIn(now, DEFAULT_NOVELTY_TZ);
}
