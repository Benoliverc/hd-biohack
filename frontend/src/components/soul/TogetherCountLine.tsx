"use client";

import { useI18n } from "@/lib/i18n";
import { togetherCountMessage, type SoulCenterCounts } from "@/lib/soulCenterCounts";

/** Same helper output and the same locale keys for Love guidance and Centers. */
export function useTogetherCountText(counts: SoulCenterCounts | null): string | null {
  const { t, locale } = useI18n();
  if (!counts) return null;
  const { key, params } = togetherCountMessage(counts, locale);
  return t(key, params);
}
