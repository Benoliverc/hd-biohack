/**
 * Evening Signature Close — Type-keyed felt-sense tap at day's end.
 * Deterministic copy keys only; no scores, no LLM.
 */

import { resolveProtocolsTz, DEFAULT_PROTOCOLS_TZ } from "@/lib/protocolCompletions";

export const EVENING_CLOSE_ITEM_ID = "today-evening-close";

export type HdTypeKey =
  | "Generator"
  | "Manifesting Generator"
  | "Projector"
  | "Manifestor"
  | "Reflector";

export type EveningAnswerKey = "yes" | "no" | "recognized" | "rest";

export type EveningClosePayload = {
  typeKey: HdTypeKey;
  answer: EveningAnswerKey;
};

/** Stable completion item id for today evening close. */
export function eveningCloseItemId(): string {
  return EVENING_CLOSE_ITEM_ID;
}

export function normalizeHdType(raw: string | null | undefined): HdTypeKey | null {
  const t = String(raw || "").trim();
  if (!t) return null;
  const lower = t.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (lower === "generator") return "Generator";
  if (
    lower === "manifesting generator" ||
    lower === "manifestinggenerator" ||
    lower === "mg"
  ) {
    return "Manifesting Generator";
  }
  if (lower === "projector") return "Projector";
  if (lower === "manifestor") return "Manifestor";
  if (lower === "reflector") return "Reflector";
  return null;
}

/** Question i18n key for a natal Type (Generator + MG share). */
export function eveningQuestionKey(
  typeKey: HdTypeKey
):
  | "today.eveningClose.q.generator"
  | "today.eveningClose.q.manifestor"
  | "today.eveningClose.q.projector"
  | "today.eveningClose.q.reflector" {
  if (typeKey === "Generator" || typeKey === "Manifesting Generator") {
    return "today.eveningClose.q.generator";
  }
  if (typeKey === "Manifestor") return "today.eveningClose.q.manifestor";
  if (typeKey === "Projector") return "today.eveningClose.q.projector";
  return "today.eveningClose.q.reflector";
}

/** Calm answer choices for the Type question. */
export function eveningAnswerOptions(
  typeKey: HdTypeKey
): Array<{ answer: EveningAnswerKey; labelKey: "today.eveningClose.yes" | "today.eveningClose.no" | "today.eveningClose.recognized" | "today.eveningClose.rest" }> {
  if (typeKey === "Projector") {
    return [
      { answer: "recognized", labelKey: "today.eveningClose.recognized" },
      { answer: "rest", labelKey: "today.eveningClose.rest" },
    ];
  }
  return [
    { answer: "yes", labelKey: "today.eveningClose.yes" },
    { answer: "no", labelKey: "today.eveningClose.no" },
  ];
}

/** Encode Type + answer into completion label for Pro history. */
export function encodeEveningCloseLabel(payload: EveningClosePayload): string {
  return `${payload.typeKey}|${payload.answer}`;
}

export function parseEveningCloseLabel(
  label: string | null | undefined
): EveningClosePayload | null {
  const raw = String(label || "").trim();
  if (!raw) return null;
  const pipe = raw.indexOf("|");
  if (pipe <= 0) return null;
  const typeKey = normalizeHdType(raw.slice(0, pipe));
  const answer = raw.slice(pipe + 1).trim() as EveningAnswerKey;
  if (!typeKey) return null;
  if (
    answer !== "yes" &&
    answer !== "no" &&
    answer !== "recognized" &&
    answer !== "rest"
  ) {
    return null;
  }
  const opts = eveningAnswerOptions(typeKey).map((o) => o.answer);
  if (!opts.includes(answer)) return null;
  return { typeKey, answer };
}

export function hourInZone(timeZone: string, now = new Date()): number | null {
  const zone = resolveProtocolsTz(timeZone);
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour: "numeric",
      hourCycle: "h23",
    }).formatToParts(now);
    const raw = parts.find((p) => p.type === "hour")?.value;
    const hour = raw == null ? NaN : Number(raw);
    return Number.isFinite(hour) ? hour : null;
  } catch {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: DEFAULT_PROTOCOLS_TZ,
        hour: "numeric",
        hourCycle: "h23",
      }).formatToParts(now);
      const raw = parts.find((p) => p.type === "hour")?.value;
      const hour = raw == null ? NaN : Number(raw);
      return Number.isFinite(hour) ? hour : null;
    } catch {
      return null;
    }
  }
}

/**
 * Show the evening close after 17:00 local (preferred TZ), or when the
 * indication when_slot is already evening. Keep visible if already answered today.
 */
export function isEveningCloseVisible(args: {
  timeZone?: string | null;
  whenSlot?: string | null;
  now?: Date;
  alreadyDone?: boolean;
}): boolean {
  if (args.alreadyDone) return true;
  if (args.whenSlot === "evening") return true;
  const hour = hourInZone(args.timeZone || DEFAULT_PROTOCOLS_TZ, args.now);
  return hour != null && hour >= 17;
}
