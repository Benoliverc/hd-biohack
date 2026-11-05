import { noveltyDayKeyHkt } from "@/lib/timezone";

/** Short rotating Human Design facts (EN-first). One per novelty day (07:00 HKT). */
export const HD_FACTS_OF_THE_DAY: readonly string[] = [
  "Your Type describes how your energy engages the world — not a personality quiz.",
  "Authority is how decisions land for you; strategy is how you meet invitations.",
  "Defined centers are consistent in you; open centers take in others and amplify.",
  "A channel is two gates talking — a reliable theme when both ends are defined.",
  "Hanging gates wait for someone (or the sky) to complete the channel.",
  "The sky’s transits temporarily light gates — today’s weather on your chart.",
  "Generators wait for a sacral response; Manifestors inform before they initiate.",
  "Projectors wait for recognition; Reflectors wait a lunar cycle on big decisions.",
  "Profile lines colour how your Type shows up — the costume, not the engine.",
  "Conditioning isn’t failure; it’s open centers sampling life until you choose.",
  "Not-self themes are pressure to act out of open centers — pause and check Authority.",
  "Aura is the field you walk in — Soul maps how two charts wire together.",
] as const;

function hashDayKey(dayKey: string): number {
  let h = 0;
  for (let i = 0; i < dayKey.length; i++) {
    h = (h * 31 + dayKey.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function hdFactForDay(now: Date = new Date()): {
  dayKey: string;
  index: number;
  fact: string;
} {
  const dayKey = noveltyDayKeyHkt(now);
  const index = hashDayKey(dayKey) % HD_FACTS_OF_THE_DAY.length;
  return { dayKey, index, fact: HD_FACTS_OF_THE_DAY[index]! };
}
