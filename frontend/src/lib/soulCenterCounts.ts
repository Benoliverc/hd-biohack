import { displayCenter } from "@/lib/hdCopy";

/** One row of the Soul conditioning strip. */
export type ConditioningRow = {
  center: string;
  self: string;
  friend: string;
  direction: string;
};

/** Composite center facts already on the Soul sync payload. */
export type CompositeCenters = {
  defined_count?: number | null;
  open_count?: number | null;
  defined_centers?: readonly string[] | null;
};

export type SoulCenterCounts = {
  unionDefined: number;
  bothOpen: number;
  compositeDefined: number;
  compositeOpen: number;
  /** both_open centers the composite defines, as displayCenter names, strip order. */
  emCenters: string[];
  /** both_open centers the composite leaves open, as displayCenter names, strip order. */
  stillOpenCenters: string[];
  emCenterKeys: string[];
  stillOpenCenterKeys: string[];
};

export type TogetherCountKey =
  | "soul.partner.togetherCount.sameNone"
  | "soul.partner.togetherCount.sameOne"
  | "soul.partner.togetherCount.sameMany"
  | "soul.partner.togetherCount.splitOneEmOneOpen"
  | "soul.partner.togetherCount.split";

function fail(message: string): never {
  throw new Error(`soulCenterCounts: ${message}`);
}

/**
 * Natal union / open-for-both, plus the composite picture.
 * Returns null when composite is missing so the UI does not invent a count.
 * Throws when a present composite breaks the 9-center invariants.
 */
export function soulCenterCounts(
  strip: readonly ConditioningRow[] | null | undefined,
  composite: CompositeCenters | null | undefined,
): SoulCenterCounts | null {
  if (composite == null) return null;
  const definedList = composite.defined_centers;
  const hasCenters = Array.isArray(definedList);
  const hasCount = typeof composite.defined_count === "number";
  if (!hasCenters && !hasCount) return null;
  if (!Array.isArray(strip)) {
    fail("conditioning strip is required when composite is present");
  }

  const definedSet = new Set(hasCenters ? definedList : []);
  let unionDefined = 0;
  let bothOpen = 0;
  const emCenterKeys: string[] = [];
  const stillOpenCenterKeys: string[] = [];

  for (const row of strip) {
    if (row.self === "defined" || row.friend === "defined") unionDefined += 1;
    if (row.direction === "both_open") {
      bothOpen += 1;
      if (definedSet.has(row.center)) emCenterKeys.push(row.center);
      else stillOpenCenterKeys.push(row.center);
    }
  }

  const compositeDefined = hasCount ? composite.defined_count! : definedList!.length;
  const compositeOpen =
    typeof composite.open_count === "number" ? composite.open_count : 9 - compositeDefined;

  const counts: SoulCenterCounts = {
    unionDefined,
    bothOpen,
    compositeDefined,
    compositeOpen,
    emCenters: emCenterKeys.map((key) => displayCenter(key)),
    stillOpenCenters: stillOpenCenterKeys.map((key) => displayCenter(key)),
    emCenterKeys,
    stillOpenCenterKeys,
  };

  if (counts.unionDefined + counts.bothOpen !== 9) {
    fail(`unionDefined + bothOpen must be 9 (${counts.unionDefined} + ${counts.bothOpen})`);
  }
  if (counts.compositeDefined + counts.compositeOpen !== 9) {
    fail(
      `compositeDefined + compositeOpen must be 9 (${counts.compositeDefined} + ${counts.compositeOpen})`,
    );
  }
  if (counts.bothOpen !== counts.emCenterKeys.length + counts.stillOpenCenterKeys.length) {
    fail("bothOpen must equal electromagnetic centers plus centers still open");
  }
  if (counts.compositeDefined !== counts.unionDefined + counts.emCenterKeys.length) {
    fail(
      `compositeDefined must equal unionDefined + electromagnetic centers (${counts.compositeDefined} vs ${counts.unionDefined} + ${counts.emCenterKeys.length})`,
    );
  }
  return counts;
}

export function joinCenterNames(names: readonly string[], locale: "en" | "nl"): string {
  if (names.length <= 1) return names[0] ?? "";
  const conj = locale === "nl" ? "en" : "and";
  if (names.length === 2) return `${names[0]} ${conj} ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, ${conj} ${names[names.length - 1]}`;
}

export function togetherCountMessage(
  counts: SoulCenterCounts,
  locale: "en" | "nl",
): { key: TogetherCountKey; params: Record<string, string | number> } {
  if (counts.emCenters.length === 0) {
    if (counts.compositeOpen === 0) {
      return { key: "soul.partner.togetherCount.sameNone", params: {} };
    }
    if (counts.compositeOpen === 1) {
      return {
        key: "soul.partner.togetherCount.sameOne",
        params: { defined: counts.compositeDefined },
      };
    }
    return {
      key: "soul.partner.togetherCount.sameMany",
      params: { defined: counts.compositeDefined, open: counts.compositeOpen },
    };
  }

  const oneEm = counts.emCenters.length === 1;
  const emVerb = oneEm ? "defines" : "define";
  const emVerbNl = oneEm ? "definieert" : "definiëren";
  const openVerb = counts.compositeOpen === 1 ? "stays" : "stay";
  const openVerbNl = counts.compositeOpen === 1 ? "blijft" : "blijven";

  if (oneEm && counts.compositeOpen === 1) {
    return {
      key: "soul.partner.togetherCount.splitOneEmOneOpen",
      params: {
        unionDefined: counts.unionDefined,
        bothOpen: counts.bothOpen,
        center: counts.emCenters[0],
        compositeDefined: counts.compositeDefined,
      },
    };
  }

  return {
    key: "soul.partner.togetherCount.split",
    params: {
      unionDefined: counts.unionDefined,
      bothOpen: counts.bothOpen,
      emList: joinCenterNames(counts.emCenters, locale),
      emVerb,
      emVerbNl,
      compositeDefined: counts.compositeDefined,
      compositeOpen: counts.compositeOpen,
      openVerb,
      openVerbNl,
    },
  };
}

/** Collapse whitespace so a repeated hook and the_current can be compared. */
export function normalizeLoveWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Skip the_current when it is empty, equal to the hook, or either string
 * is a prefix of the other after whitespace is normalised.
 */
export function shouldSkipTheCurrent(hook: string, current: string): boolean {
  const normalizedHook = normalizeLoveWhitespace(hook || "");
  const normalizedCurrent = normalizeLoveWhitespace(current || "");
  if (!normalizedCurrent) return true;
  if (normalizedHook === normalizedCurrent) return true;
  if (
    normalizedHook &&
    (normalizedCurrent.startsWith(normalizedHook) || normalizedHook.startsWith(normalizedCurrent))
  ) {
    return true;
  }
  return false;
}

/** both_open row whose center the composite defines. Missing composite stays false. */
export function bothOpenDefinedTogether(
  direction: string,
  center: string,
  definedCenters: readonly string[] | null | undefined,
): boolean {
  if (!definedCenters) return false;
  return direction === "both_open" && definedCenters.includes(center);
}

/** Guidance item id `center-{Center}` when that center is composite-defined. */
export function definedTogetherCenterKey(
  itemId: string,
  definedCenters: readonly string[] | null | undefined,
): string | null {
  if (!definedCenters || !itemId.startsWith("center-")) return null;
  const center = itemId.slice("center-".length);
  if (!center || !definedCenters.includes(center)) return null;
  return center;
}
