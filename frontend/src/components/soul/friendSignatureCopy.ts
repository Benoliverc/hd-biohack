/**
 * Friend-mode Aura Signature presentation map.
 * Scoring / ids stay in soul_sync SIGNATURES; partner path uses partnerSignatureCopy.
 * Display only — never show old productized titles or "Highest signature".
 */

import type { MessageKey } from "@/lib/i18n";

export type FriendSignatureCopy = {
  title: string;
  body: string;
  why: string;
  /** Magnetic only — shown instead of "Highest signature". */
  chip?: string;
};

const FRIEND_SIGNATURE_KEYS = {
  magnetic_alchemy: {
    title: "soul.sig.magnetic_alchemy.title",
    body: "soul.sig.friend.magnetic_alchemy.body",
    why: "soul.sig.why.magnetic_alchemy",
    chip: "soul.sig.magnetic_alchemy.chip",
  },
  integrated_flow: {
    title: "soul.sig.integrated_flow.title",
    body: "soul.sig.friend.integrated_flow.body",
    why: "soul.sig.why.integrated_flow",
  },
  harmonic_sanctuary: {
    title: "soul.sig.harmonic_sanctuary.title",
    body: "soul.sig.friend.harmonic_sanctuary.body",
    why: "soul.sig.why.harmonic_sanctuary",
  },
  catalytic_growth: {
    title: "soul.sig.catalytic_growth.title",
    body: "soul.sig.friend.catalytic_growth.body",
    why: "soul.sig.why.catalytic_growth",
  },
  spacious_explorers: {
    title: "soul.sig.spacious_explorers.title",
    body: "soul.sig.friend.spacious_explorers.body",
    why: "soul.sig.why.spacious_explorers",
  },
} as const satisfies Record<
  string,
  { title: MessageKey; body: MessageKey; why: MessageKey; chip?: MessageKey }
>;

export function friendSignatureForId(
  id: string | null | undefined,
  t: (key: MessageKey) => string,
): FriendSignatureCopy | null {
  if (!id) return null;
  const keys = FRIEND_SIGNATURE_KEYS[id as keyof typeof FRIEND_SIGNATURE_KEYS];
  if (!keys) return null;
  return {
    title: t(keys.title),
    body: t(keys.body),
    why: t(keys.why),
    chip: "chip" in keys && keys.chip ? t(keys.chip) : undefined,
  };
}
