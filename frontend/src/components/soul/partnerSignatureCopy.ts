/**
 * Partner-only Aura Signature presentation map.
 * Scoring / ids stay in soul_sync SIGNATURES; friend path keeps alchemy voice.
 */

import type { MessageKey } from "@/lib/i18n";

export type PartnerSignatureCopy = {
  title: string;
  hook: string;
  body: string;
  why: string;
  /** Magnetic only — shown instead of "Highest signature". */
  chip?: string;
};

const PARTNER_SIGNATURE_KEYS = {
  magnetic_alchemy: {
    title: "soul.sig.magnetic_alchemy.title",
    hook: "soul.sig.partner.magnetic_alchemy.hook",
    body: "soul.sig.partner.magnetic_alchemy.body",
    why: "soul.sig.why.magnetic_alchemy",
    chip: "soul.sig.magnetic_alchemy.chip",
  },
  integrated_flow: {
    title: "soul.sig.integrated_flow.title",
    hook: "soul.sig.partner.integrated_flow.hook",
    body: "soul.sig.partner.integrated_flow.body",
    why: "soul.sig.why.integrated_flow",
  },
  harmonic_sanctuary: {
    title: "soul.sig.harmonic_sanctuary.title",
    hook: "soul.sig.partner.harmonic_sanctuary.hook",
    body: "soul.sig.partner.harmonic_sanctuary.body",
    why: "soul.sig.why.harmonic_sanctuary",
  },
  catalytic_growth: {
    title: "soul.sig.catalytic_growth.title",
    hook: "soul.sig.partner.catalytic_growth.hook",
    body: "soul.sig.partner.catalytic_growth.body",
    why: "soul.sig.why.catalytic_growth",
  },
  spacious_explorers: {
    title: "soul.sig.spacious_explorers.title",
    hook: "soul.sig.partner.spacious_explorers.hook",
    body: "soul.sig.partner.spacious_explorers.body",
    why: "soul.sig.why.spacious_explorers",
  },
} as const satisfies Record<
  string,
  { title: MessageKey; hook: MessageKey; body: MessageKey; why: MessageKey; chip?: MessageKey }
>;

export function partnerSignatureForId(
  id: string | null | undefined,
  t: (key: MessageKey) => string,
): PartnerSignatureCopy | null {
  if (!id) return null;
  const keys = PARTNER_SIGNATURE_KEYS[id as keyof typeof PARTNER_SIGNATURE_KEYS];
  if (!keys) return null;
  return {
    title: t(keys.title),
    hook: t(keys.hook),
    body: t(keys.body),
    why: t(keys.why),
    chip: "chip" in keys && keys.chip ? t(keys.chip) : undefined,
  };
}
