/**
 * Partner-only Aura Signature presentation map.
 * Scoring / ids stay in soul_sync SIGNATURES; friend path keeps alchemy voice.
 */

export type PartnerSignatureCopy = {
  title: string;
  hook: string;
  body: string;
  why: string;
  /** Magnetic only — shown instead of "Highest signature". */
  chip?: string;
};

export const PARTNER_SIGNATURE_COPY: Record<string, PartnerSignatureCopy> = {
  magnetic_alchemy: {
    title: "The charge between you",
    hook: "Have you noticed how the air changes when you're in the same room?",
    body:
      "Closeness arrives fast here — and so does intensity. Pace that heat: say when you need the room, and don't make big calls in the middle of it.",
    why: "Electromagnetic completion, Intimacy channel 59-6, or a mutual Split-to-Single bridge.",
    chip: "Strong charge",
  },
  integrated_flow: {
    title: "When you become one current",
    hook: "Apart, you each run your own rhythm. Together, something else starts.",
    body:
      "Thoughts, direction, and action begin to loop as one. That's a gift for building a life — and a reason to step out of each other's field often, so you still know your own north.",
    why: "Split definitions resolving toward Single; Integration triad 10-20-34.",
  },
  harmonic_sanctuary: {
    title: "The quiet fit",
    hook: "Some pairs need a meeting to share a Sunday. This one often doesn't.",
    body:
      "The bond can feel familiar before either of you explains why. Name needs early anyway — \"we just get it\" is lovely until it becomes assumed consent.",
    why: "Companionship channels and shared authority class.",
  },
  catalytic_growth: {
    title: "Heat that grows you",
    hook: "This isn't the easy pairing — it's the one that keeps pushing you both forward.",
    body:
      "Power and pace collide often, who leads and who adapts, and that friction is part of how you grow. Plan rest as seriously as the push, or the heat turns into burnout.",
    why: "Dense composite (8–9 centers) plus compromise or dominance density.",
  },
  spacious_explorers: {
    title: "A wide-open field",
    hook: "If fusion isn't your chemistry, that isn't a missing piece.",
    body:
      "Love here thrives on novelty, movement, and chosen closeness. Space is how you stay interested — design dates and rest around something new when you want more spark.",
    why: "A relatively open composite; chemistry from novelty rather than locked circuitry.",
  },
};

export function partnerSignatureForId(
  id: string | null | undefined,
): PartnerSignatureCopy | null {
  if (!id) return null;
  return PARTNER_SIGNATURE_COPY[id] ?? null;
}
