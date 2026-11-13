import { noveltyDayKey } from "@/lib/timezone";
import type { DailySignal, VsYesterdayDelta } from "@/lib/api";
import type { MessageKey } from "@/lib/i18n/messages";

/** Short rotating Human Design facts (EN-first). One per novelty day (07:00 in the account timezone). */
export const HD_FACT_KEYS = [
  "today.fact.0",
  "today.fact.1",
  "today.fact.2",
  "today.fact.3",
  "today.fact.4",
  "today.fact.5",
  "today.fact.6",
  "today.fact.7",
  "today.fact.8",
  "today.fact.9",
  "today.fact.10",
  "today.fact.11",
] as const satisfies readonly MessageKey[];

export const SKY_FACT_KEYS = {
  moon: "today.skyFact.moon",
  sun: "today.skyFact.sun",
  hanging_pressure: "today.skyFact.hanging_pressure",
  bridge: "today.skyFact.bridge",
  newly_defined: "today.skyFact.newly_defined",
} as const satisfies Record<string, MessageKey>;

export const HD_FACTS_OF_THE_DAY: readonly string[] = [
  "Your Type describes how your energy engages the world — not a personality quiz.",
  "Authority is how decisions land for you; strategy is how you meet invitations.",
  "Defined centers are consistent in you; open centers take in others and amplify.",
  "A channel is two gates talking — a reliable theme when both ends are defined.",
  "Hanging gates wait for someone (or the sky) to complete the channel.",
  "The sky's transits temporarily light gates — today's weather on your chart.",
  "Generators wait for a sacral response; Manifestors inform before they initiate.",
  "Projectors wait for recognition; Reflectors wait a lunar cycle on big decisions.",
  "Profile lines colour how your Type shows up — the costume, not the engine.",
  "Conditioning isn't failure; it's open centers sampling life until you choose.",
  "Not-self themes are pressure to act out of open centers — pause and check Authority.",
  "Aura is the field you walk in — Soul maps how two charts wire together.",
] as const;

/** One short educational sentence keyed to today's live sky (shorter than Sky Story lines). */
export const SKY_LITERACY_FACTS = {
  moon: "The Moon changes gate every few days — today's lunar colour on your chart.",
  sun: "The Sun holds one gate about six days — a weekly theme behind the Move.",
  hanging_pressure:
    "A hanging gate waits for the sky to bring the missing end — pressure is information, not a to-do.",
  bridge:
    "A bridge is a temporary channel the sky completes — borrowed circuitry, not a Type change.",
  newly_defined:
    "A newly defined center is temporary weather on an open center — not a change to Type.",
} as const;

export type SkyLiteracyField =
  | "moon"
  | "sun"
  | "hanging_pressure"
  | "bridge"
  | "newly_defined";

/** Priority for vs_yesterday literacy key (skip energy/space unless nothing else). */
const VS_LITERACY_PRIORITY: readonly SkyLiteracyField[] = [
  "moon",
  "sun",
  "hanging_pressure",
  "bridge",
  "newly_defined",
] as const;

/** How to read Today step ids that match a literacy field. */
export const LITERACY_JUMP_BY_FIELD: Record<SkyLiteracyField, string> = {
  moon: "today-new-signal",
  sun: "today-sun-earth",
  hanging_pressure: "today-new-signal",
  bridge: "today-bridged-channels",
  newly_defined: "today-newly-defined",
};

function hashDayKey(dayKey: string): number {
  let h = 0;
  for (let i = 0; i < dayKey.length; i++) {
    h = (h * 31 + dayKey.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function hdFactForDay(now: Date = new Date(), timeZone?: string | null): {
  dayKey: string;
  index: number;
  fact: string;
  factKey: MessageKey;
} {
  const dayKey = noveltyDayKey(timeZone, now);
  const index = hashDayKey(dayKey) % HD_FACTS_OF_THE_DAY.length;
  return {
    dayKey,
    index,
    fact: HD_FACTS_OF_THE_DAY[index]!,
    factKey: HD_FACT_KEYS[index]!,
  };
}

function isRealSkyDelta(d: VsYesterdayDelta): boolean {
  // Continuity filler uses field "moon" with from "same conditioning" — not a Moon move.
  if (d.field === "moon" && d.from === "same conditioning") return false;
  return (VS_LITERACY_PRIORITY as readonly string[]).includes(d.field);
}

/**
 * Pick the literacy key from vs_yesterday (sky fields only), else daily_signal.source,
 * else null (caller falls back to the rotating bank).
 */
export function pickLiteracyField(args: {
  vsYesterday?: readonly VsYesterdayDelta[] | null;
  dailySignal?: DailySignal | null;
}): SkyLiteracyField | null {
  const vs = args.vsYesterday || [];
  for (const field of VS_LITERACY_PRIORITY) {
    if (vs.some((d) => d.field === field && isRealSkyDelta(d))) {
      return field;
    }
  }

  const source = args.dailySignal?.source;
  const key = args.dailySignal?.key || "";
  if (source === "moon_gate" || source === "moon_line") return "moon";
  if (source === "sun_gate" || source === "sun_line") return "sun";
  if (source === "hanging_pressure") return "hanging_pressure";
  if (source === "conditioning") {
    if (key.startsWith("newly:")) return "newly_defined";
    return "bridge";
  }
  if (source === "continuity") return "sun";

  return null;
}

export type ContextualHdFact = {
  dayKey: string;
  fact: string;
  factKey: MessageKey;
  /** Sky-keyed when true; rotating bank when false. */
  skyKeyed: boolean;
  field: SkyLiteracyField | null;
  /** Optional How to read Today target id. */
  howToReadTargetId: string | null;
};

/**
 * Contextual Literacy Pulse: one short educational sentence keyed to today's sky,
 * with fallback to the existing rotating bank so the aside is never empty.
 */
export function contextualHdFact(args: {
  vsYesterday?: readonly VsYesterdayDelta[] | null;
  dailySignal?: DailySignal | null;
  now?: Date;
  timeZone?: string | null;
}): ContextualHdFact {
  const dayKey = noveltyDayKey(args.timeZone, args.now ?? new Date());
  const field = pickLiteracyField({
    vsYesterday: args.vsYesterday,
    dailySignal: args.dailySignal,
  });
  if (field) {
    return {
      dayKey,
      fact: SKY_LITERACY_FACTS[field],
      factKey: SKY_FACT_KEYS[field],
      skyKeyed: true,
      field,
      howToReadTargetId: LITERACY_JUMP_BY_FIELD[field],
    };
  }
  const bank = hdFactForDay(args.now ?? new Date(), args.timeZone);
  return {
    dayKey: bank.dayKey,
    fact: bank.fact,
    factKey: bank.factKey,
    skyKeyed: false,
    field: null,
    howToReadTargetId: null,
  };
}
