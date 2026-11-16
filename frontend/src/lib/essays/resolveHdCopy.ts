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
  AUTHORITY_COPY as AUTHORITY_COPY_ES,
  AUTHORITY_PLAIN as AUTHORITY_PLAIN_ES,
  CENTER_COPY as CENTER_COPY_ES,
  DEFINITION_COPY as DEFINITION_COPY_ES,
  OPEN_CENTER_WATCH as OPEN_CENTER_WATCH_ES,
  PROFILE_LINES as PROFILE_LINES_ES,
  STRATEGY_COPY as STRATEGY_COPY_ES,
  TYPE_BATTERY as TYPE_BATTERY_ES,
  TYPE_COPY as TYPE_COPY_ES,
  centersToWatch as centersToWatchEs,
  channelMeaning as channelMeaningEs,
  profileLearnMore as profileLearnMoreEs,
  profilePlainLine as profilePlainLineEs,
} from "@/lib/essays/hdCopy.es";

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

const ES: HdCopyBundle = {
  TYPE_COPY: TYPE_COPY_ES,
  STRATEGY_COPY: STRATEGY_COPY_ES,
  AUTHORITY_COPY: AUTHORITY_COPY_ES,
  DEFINITION_COPY: DEFINITION_COPY_ES,
  PROFILE_LINES: PROFILE_LINES_ES,
  CENTER_COPY: CENTER_COPY_ES,
  TYPE_BATTERY: TYPE_BATTERY_ES,
  AUTHORITY_PLAIN: AUTHORITY_PLAIN_ES,
  OPEN_CENTER_WATCH: OPEN_CENTER_WATCH_ES,
  profileLearnMore: profileLearnMoreEs,
  profilePlainLine: profilePlainLineEs,
  centersToWatch: centersToWatchEs,
  channelMeaning: channelMeaningEs,
};

export function resolveHdCopy(locale: Locale): HdCopyBundle {
  return locale === "es" ? ES : EN;
}

export function useHdCopy(): HdCopyBundle {
  const { locale } = useI18n();
  return resolveHdCopy(locale);
}
