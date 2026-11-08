/**
 * Friend-mode Aura Signature presentation map.
 * Scoring / ids stay in soul_sync SIGNATURES; partner path uses partnerSignatureCopy.
 * Display only — never show old productized titles or "Highest signature".
 */

export type FriendSignatureCopy = {
  title: string;
  body: string;
  why: string;
  /** Magnetic only — shown instead of "Highest signature". */
  chip?: string;
};

export const FRIEND_SIGNATURE_COPY: Record<string, FriendSignatureCopy> = {
  magnetic_alchemy: {
    title: "Strong pull between you",
    body:
      "You light each other up fast. Say when you need space, and wait to decide until you both feel steadier.",
    why: "Electromagnetic completion, Intimacy 59-6, or a mutual Split-to-Single bridge.",
    chip: "Strong pull",
  },
  integrated_flow: {
    title: "When you become one current",
    body:
      "Thoughts, direction, and action begin to loop as one. That's a gift for building together — and a reason to step out of each other's field often, so you still know your own north.",
    why: "Split definitions resolving toward Single; Integration triad 10-20-34.",
  },
  harmonic_sanctuary: {
    title: "The quiet fit",
    body:
      "The bond can feel familiar before either of you explains why. Name needs early anyway — \"we just get it\" is lovely until it becomes assumed consent.",
    why: "Companionship channels and shared authority class.",
  },
  catalytic_growth: {
    title: "Heat that grows you",
    body:
      "Power and pace collide often, who leads and who adapts, and that friction is part of how you grow. Plan rest as seriously as the push, or the heat turns into burnout.",
    why: "Dense composite (8–9 centers) plus compromise or dominance density.",
  },
  spacious_explorers: {
    title: "A wide-open field",
    body:
      "If fusion isn't your chemistry, that isn't a missing piece. This field thrives on novelty, movement, and chosen closeness — design hangouts around something new when you want more spark.",
    why: "A relatively open composite; chemistry from novelty rather than locked circuitry.",
  },
};

export function friendSignatureForId(
  id: string | null | undefined,
): FriendSignatureCopy | null {
  if (!id) return null;
  return FRIEND_SIGNATURE_COPY[id] ?? null;
}
