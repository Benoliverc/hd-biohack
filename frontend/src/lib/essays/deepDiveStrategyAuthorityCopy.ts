/**
 * Deep dive Strategy and Authority voice.
 * No name: today's self essays from resolveHdCopy.
 * Name: other-person catalogs, `{name}` inserted with a function replacer.
 * Anything other than Dutch resolves to English, same as Type.
 */
import type { Locale } from "@/lib/i18n/types";
import { resolveHdCopy } from "./resolveHdCopy";
import { AUTHORITY_OTHER_EN, STRATEGY_OTHER_EN, type DeepDiveEssay } from "./deepDiveStrategyAuthority.en";
import { AUTHORITY_OTHER_NL, STRATEGY_OTHER_NL } from "./deepDiveStrategyAuthority.nl";

const STRATEGY_OTHER = { en: STRATEGY_OTHER_EN, nl: STRATEGY_OTHER_NL };
const AUTHORITY_OTHER = { en: AUTHORITY_OTHER_EN, nl: AUTHORITY_OTHER_NL };

function essayLocale(locale: Locale): "en" | "nl" {
  return locale === "nl" ? "nl" : "en";
}

function withName(essay: DeepDiveEssay, name: string): DeepDiveEssay {
  return {
    summary: essay.summary.replaceAll("{name}", () => name),
    learnMore: essay.learnMore.replaceAll("{name}", () => name),
  };
}

function otherEssay(
  catalog: Record<"en" | "nl", Record<string, DeepDiveEssay>>,
  key: string,
  locale: Locale,
  personName: string,
): DeepDiveEssay | undefined {
  const essay = catalog[essayLocale(locale)][key];
  return essay ? withName(essay, personName) : undefined;
}

export function deepDiveStrategyCopy(
  strategy: string,
  locale: Locale,
  personName?: string,
): DeepDiveEssay | undefined {
  const self = resolveHdCopy(essayLocale(locale)).STRATEGY_COPY[strategy];
  if (!personName) return self;
  return otherEssay(STRATEGY_OTHER, strategy, locale, personName);
}

export function deepDiveAuthorityCopy(
  authority: string,
  locale: Locale,
  personName?: string,
): DeepDiveEssay | undefined {
  const self = resolveHdCopy(essayLocale(locale)).AUTHORITY_COPY[authority];
  if (!personName) return self;
  return otherEssay(AUTHORITY_OTHER, authority, locale, personName);
}
