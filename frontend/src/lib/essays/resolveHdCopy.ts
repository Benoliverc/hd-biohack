import { useI18n, type Locale } from "@/lib/i18n";
import {
  AUTHORITY_COPY as AUTHORITY_COPY_EN,
  AUTHORITY_PLAIN as AUTHORITY_PLAIN_EN,
  CENTER_COPY as CENTER_COPY_EN,
  DEFINITION_COPY as DEFINITION_COPY_EN,
  OPEN_CENTER_WATCH as OPEN_CENTER_WATCH_EN,
  PROFILE_LINES as PROFILE_LINES_EN,
  STRATEGY_COPY as STRATEGY_COPY_EN,
  TYPE_BATTERY as TYPE_BATTERY_EN,
  TYPE_COPY as TYPE_COPY_EN,
  centersToWatch as centersToWatchEn,
  channelMeaning as channelMeaningEn,
  profileLearnMore as profileLearnMoreEn,
  profilePlainLine as profilePlainLineEn,
} from "@/lib/hdCopy";
import {
  AUTHORITY_COPY as AUTHORITY_COPY_NL,
  AUTHORITY_PLAIN as AUTHORITY_PLAIN_NL,
  CENTER_COPY as CENTER_COPY_NL,
  DEFINITION_COPY as DEFINITION_COPY_NL,
  OPEN_CENTER_WATCH as OPEN_CENTER_WATCH_NL,
  PROFILE_LINES as PROFILE_LINES_NL,
  STRATEGY_COPY as STRATEGY_COPY_NL,
  TYPE_BATTERY as TYPE_BATTERY_NL,
  TYPE_COPY as TYPE_COPY_NL,
  centersToWatch as centersToWatchNl,
  channelMeaning as channelMeaningNl,
  profileLearnMore as profileLearnMoreNl,
  profilePlainLine as profilePlainLineNl,
} from "@/lib/essays/hdCopy.nl";

export type HdCopyBundle = {
  TYPE_COPY: typeof TYPE_COPY_EN;
  STRATEGY_COPY: typeof STRATEGY_COPY_EN;
  AUTHORITY_COPY: typeof AUTHORITY_COPY_EN;
  DEFINITION_COPY: typeof DEFINITION_COPY_EN;
  PROFILE_LINES: typeof PROFILE_LINES_EN;
  CENTER_COPY: typeof CENTER_COPY_EN;
  TYPE_BATTERY: typeof TYPE_BATTERY_EN;
  AUTHORITY_PLAIN: typeof AUTHORITY_PLAIN_EN;
  OPEN_CENTER_WATCH: typeof OPEN_CENTER_WATCH_EN;
  profileLearnMore: typeof profileLearnMoreEn;
  profilePlainLine: typeof profilePlainLineEn;
  centersToWatch: typeof centersToWatchEn;
  channelMeaning: typeof channelMeaningEn;
};

const EN: HdCopyBundle = {
  TYPE_COPY: TYPE_COPY_EN,
  STRATEGY_COPY: STRATEGY_COPY_EN,
  AUTHORITY_COPY: AUTHORITY_COPY_EN,
  DEFINITION_COPY: DEFINITION_COPY_EN,
  PROFILE_LINES: PROFILE_LINES_EN,
  CENTER_COPY: CENTER_COPY_EN,
  TYPE_BATTERY: TYPE_BATTERY_EN,
  AUTHORITY_PLAIN: AUTHORITY_PLAIN_EN,
  OPEN_CENTER_WATCH: OPEN_CENTER_WATCH_EN,
  profileLearnMore: profileLearnMoreEn,
  profilePlainLine: profilePlainLineEn,
  centersToWatch: centersToWatchEn,
  channelMeaning: channelMeaningEn,
};

const NL: HdCopyBundle = {
  TYPE_COPY: TYPE_COPY_NL,
  STRATEGY_COPY: STRATEGY_COPY_NL,
  AUTHORITY_COPY: AUTHORITY_COPY_NL,
  DEFINITION_COPY: DEFINITION_COPY_NL,
  PROFILE_LINES: PROFILE_LINES_NL,
  CENTER_COPY: CENTER_COPY_NL,
  TYPE_BATTERY: TYPE_BATTERY_NL,
  AUTHORITY_PLAIN: AUTHORITY_PLAIN_NL,
  OPEN_CENTER_WATCH: OPEN_CENTER_WATCH_NL,
  profileLearnMore: profileLearnMoreNl,
  profilePlainLine: profilePlainLineNl,
  centersToWatch: centersToWatchNl,
  channelMeaning: channelMeaningNl,
};

export function resolveHdCopy(locale: Locale): HdCopyBundle {
  if (locale === "nl") return NL;
  return EN;
}

export function useHdCopy(): HdCopyBundle {
  const { locale } = useI18n();
  return resolveHdCopy(locale);
}
