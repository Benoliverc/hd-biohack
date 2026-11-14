import type { BridgedChannel, TransitPlanet } from "@/lib/api";
import type { MessageKey } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/types";

export const BRIDGE_MEANING_FALLBACK_KEY = "page.today.bridgeMeaningFallback" as const;

const CHANNEL_PAIRS = [
  [1, 8],
  [2, 14],
  [3, 60],
  [4, 63],
  [5, 15],
  [6, 59],
  [7, 31],
  [9, 52],
  [10, 20],
  [10, 34],
  [10, 57],
  [11, 56],
  [12, 22],
  [13, 33],
  [16, 48],
  [17, 62],
  [18, 58],
  [19, 49],
  [20, 34],
  [20, 57],
  [21, 45],
  [23, 43],
  [24, 61],
  [25, 51],
  [26, 44],
  [27, 50],
  [28, 38],
  [29, 46],
  [30, 41],
  [32, 54],
  [34, 57],
  [35, 36],
  [37, 40],
  [39, 55],
  [42, 53],
  [47, 64],
] as const;

export const BRIDGE_MEANING_KEYS: Record<string, MessageKey> = Object.fromEntries(
  CHANNEL_PAIRS.map(([a, b]) => {
    const slug = `${a}-${b}`;
    return [slug, `page.today.bridgeMeaning.${slug}` as MessageKey];
  })
) as Record<string, MessageKey>;

export function sortedGatePair(gates: number[] | undefined | null): number[] {
  return [...(gates || [])].map((g) => Number(g)).filter((g) => Number.isFinite(g)).sort((a, b) => a - b);
}

export function bridgeChannelSlug(gates: number[] | undefined | null): string {
  return sortedGatePair(gates).join("-");
}

export function bridgeChannelTestId(gates: number[] | undefined | null): string {
  return `today-bridged-channel-${bridgeChannelSlug(gates)}`;
}

export function bridgeMeaningKey(gates: number[] | undefined | null): MessageKey | null {
  const slug = bridgeChannelSlug(gates);
  return BRIDGE_MEANING_KEYS[slug] ?? null;
}

const LOCALE_TAGS: Record<Locale, string> = {
  en: "en-GB",
  de: "de",
  es: "es",
  fr: "fr",
  nl: "nl",
};

export function parseIsoDate(iso: string | null | undefined): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map((n) => Number(n));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function isoYear(iso: string): number {
  return Number(iso.slice(0, 4));
}

/** Whether to print a year on start/end, per the locked brief. */
export function bridgeDateYearFlags(
  start: string | null | undefined,
  end: string | null | undefined,
  noveltyYear: number
): { startYear: boolean; endYear: boolean } {
  const hasStart = Boolean(start && parseIsoDate(start));
  const hasEnd = Boolean(end && parseIsoDate(end));
  if (hasStart && hasEnd) {
    const sy = isoYear(start as string);
    const ey = isoYear(end as string);
    if (sy !== ey) return { startYear: true, endYear: true };
    if (sy === noveltyYear && ey === noveltyYear) return { startYear: false, endYear: true };
    return { startYear: true, endYear: true };
  }
  return {
    startYear: hasStart ? isoYear(start as string) !== noveltyYear : false,
    endYear: hasEnd, // lone end always includes the year
  };
}

export function formatBridgeDate(iso: string, locale: Locale, withYear: boolean): string {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale] || "en-GB", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(d);
}

export function skyDetailsSummaryKey(count: number): MessageKey {
  if (count <= 0) return "page.today.skyDetails";
  if (count === 1) return "page.today.skyDetailsBorrowedOne";
  return "page.today.skyDetailsBorrowedMany";
}

type TFn = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function bridgeMeaningText(
  channel: Pick<BridgedChannel, "gates" | "name">,
  t: TFn
): string {
  const key = bridgeMeaningKey(channel.gates);
  if (key) return t(key);
  const name = (channel.name || "").trim();
  const fallback = t(BRIDGE_MEANING_FALLBACK_KEY);
  return name ? `${name}. ${fallback}` : fallback;
}

export function formatTransitPlanets(planets: TransitPlanet[] | undefined): string {
  const names = (planets || []).map((p) => p.name).filter(Boolean);
  // Unique, preserve order
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const n of names) {
    if (seen.has(n)) continue;
    seen.add(n);
    unique.push(n);
  }
  return unique.join(", ");
}

export function bridgeOwnershipText(channel: BridgedChannel, t: TFn): string {
  if (channel.kind === "transit_transit") {
    return t("page.today.bridgeSkyHoldsBoth");
  }
  const natal = channel.natal_gates || [];
  const sky = channel.transit_gates || [];
  const n = natal[0];
  const m = sky[0];
  if (n == null || m == null) {
    // Don't invent an end. If kind is hanging but payload is incomplete, stay quiet.
    return t("page.today.bridgeSkyHoldsBoth");
  }
  const planet = formatTransitPlanets(channel.transit_planets);
  return t("page.today.bridgeYouHold", { n, m, planet });
}

export function bridgeWindowText(
  channel: Pick<BridgedChannel, "window_start" | "window_end">,
  t: TFn,
  locale: Locale,
  noveltyYear: number
): string {
  const start = channel.window_start ?? null;
  const end = channel.window_end ?? null;
  const hasStart = Boolean(start && parseIsoDate(start));
  const hasEnd = Boolean(end && parseIsoDate(end));
  const flags = bridgeDateYearFlags(hasStart ? start : null, hasEnd ? end : null, noveltyYear);
  if (hasStart && hasEnd) {
    return t("page.today.bridgeOnSinceThrough", {
      start: formatBridgeDate(start as string, locale, flags.startYear),
      end: formatBridgeDate(end as string, locale, flags.endYear),
    });
  }
  if (!hasStart && hasEnd) {
    return t("page.today.bridgeOnLongStretchThrough", {
      end: formatBridgeDate(end as string, locale, flags.endYear),
    });
  }
  if (hasStart && !hasEnd) {
    return t("page.today.bridgeOnSinceNoEnd", {
      start: formatBridgeDate(start as string, locale, flags.startYear),
    });
  }
  return t("page.today.bridgeOnLongStretch");
}

export function bridgeWindowCaption(
  channel: Pick<BridgedChannel, "window_start" | "window_end">,
  noveltyDay: string | null | undefined,
  t: TFn
): string | null {
  if (!noveltyDay || !parseIsoDate(noveltyDay)) return null;
  if (channel.window_start === noveltyDay) return t("page.today.bridgeCompletesToday");
  if (channel.window_end === noveltyDay) return t("page.today.bridgeLastDay");
  return null;
}
