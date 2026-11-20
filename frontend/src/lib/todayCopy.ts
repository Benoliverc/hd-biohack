import type { CopyPart, DailySignal, TodayIndicationPayload } from "@/lib/api";
import { catalogs, type MessageKey } from "@/lib/i18n/messages";

type TFn = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function isMessageKey(key: string | null | undefined): key is MessageKey {
  return Boolean(key && Object.prototype.hasOwnProperty.call(catalogs.en, key));
}

export function resolveCopy(t: TFn, part?: CopyPart | null, fallback = ""): string {
  if (!part?.key) return fallback;
  if (!isMessageKey(part.key)) return fallback;
  return t(part.key, part.params);
}

export function resolveKey(
  t: TFn,
  key: string | null | undefined,
  params?: Record<string, string | number>,
  fallback = ""
): string {
  if (!isMessageKey(key)) return fallback;
  return t(key, params);
}

function resolveBattery(t: TFn, params?: Record<string, string | number>): Record<string, string | number> {
  const next: Record<string, string | number> = { ...(params || {}) };
  const batteryKey = next.battery_key;
  if (typeof batteryKey === "string" && isMessageKey(batteryKey)) {
    next.battery = t(batteryKey);
    delete next.battery_key;
  }
  return next;
}

function formatSunMoon(t: TFn, params?: Record<string, string | number>): string {
  const p = params || {};
  const parts: string[] = [];
  const sunPlanet = t("today.planet.Sun");
  const moonPlanet = t("today.planet.Moon");
  if (p.sun_gate != null && p.sun_gate !== "") {
    parts.push(p.sun_line != null && p.sun_line !== "" ? `${sunPlanet} ${p.sun_gate}.${p.sun_line}` : `${sunPlanet} ${p.sun_gate}`);
  }
  if (p.moon_gate != null && p.moon_gate !== "") {
    parts.push(p.moon_line != null && p.moon_line !== "" ? `${moonPlanet} ${p.moon_gate}.${p.moon_line}` : `${moonPlanet} ${p.moon_gate}`);
  }
  return parts.join(" / ");
}

export function localizeMove(indication: TodayIndicationPayload, t: TFn): string {
  const key = indication.main_action_key;
  // Cached protocol text is not a catalog sentence — keep the API wording.
  if (key === "today.move.steady.cached") return indication.main_action_text;
  return resolveKey(t, key, indication.main_action_params, indication.main_action_text);
}

/** Collapse "acceleration.. Notice" / ". ." produced when a perioded {battery} is re-terminated. */
export function collapseDuplicateSentencePunctuation(text: string): string {
  return String(text || "")
    .replace(/[.]{2,}/g, ".")
    .replace(/([.!?])\s+[.]/g, "$1 ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function localizeWhy(indication: TodayIndicationPayload, t: TFn): string {
  const parts = indication.main_action_why_parts;
  if (!parts?.length) {
    return collapseDuplicateSentencePunctuation(indication.main_action_why || "");
  }
  const sentences = parts
    .map((part) => {
      if (!isMessageKey(part.key)) return "";
      const params =
        part.key === "today.why.noticeSunMoon"
          ? { ...part.params, sunMoon: formatSunMoon(t, part.params) }
          : resolveBattery(t, part.params);
      return t(part.key, params);
    })
    .filter(Boolean);
  const joined = sentences.length ? sentences.join(" ") : indication.main_action_why;
  return collapseDuplicateSentencePunctuation(joined || "");
}

export function localizeMicro(indication: TodayIndicationPayload, t: TFn): string {
  return resolveKey(t, indication.main_action_micro_key, undefined, indication.main_action_micro);
}

export function localizeDrivers(indication: TodayIndicationPayload, t: TFn): string[] {
  const parts = indication.driver_parts;
  if (parts?.length) {
    return parts.slice(0, 4).map((part, i) => resolveCopy(t, part, indication.drivers?.[i] || ""));
  }
  return (indication.drivers || []).slice(0, 4);
}

export function localizeDisclaimer(indication: TodayIndicationPayload, t: TFn): string {
  if (indication.has_natal === false) return t("today.disclaimer.noNatal");
  return t("today.disclaimerFallback");
}

export type ChangeLineLead = {
  text: string;
  quiet: boolean;
  source: string;
};

export function changeLineLead(
  indication: TodayIndicationPayload,
  t: TFn
): ChangeLineLead | null {
  const hasMove = Boolean(indication.main_action_text || indication.main_action_key);
  if (!hasMove) return null;
  if (indication.has_previous_indication === false) {
    return { text: t("today.changeLine.firstFilled"), quiet: false, source: "first_filled" };
  }
  const daily = indication.daily_signal;
  if (!daily) return null;
  const source = daily.source;
  if (source === "continuity") {
    const n = daily.continuity_day ?? 1;
    return { text: t("today.changeLine.continuity", { n }), quiet: true, source };
  }
  if (source === "moon_gate") return { text: t("today.changeLine.moonGate"), quiet: false, source };
  if (source === "moon_line") return { text: t("today.changeLine.moonLine"), quiet: false, source };
  if (source === "sun_line") return { text: t("today.changeLine.sunLine"), quiet: false, source };
  if (source === "sun_gate") return { text: t("today.changeLine.sunGate"), quiet: false, source };
  if (source === "hanging_pressure") {
    const on = daily.phase !== "clear";
    return {
      text: t(on ? "today.changeLine.hangingOn" : "today.changeLine.hangingClear"),
      quiet: false,
      source,
    };
  }
  if (source === "conditioning") {
    const on = daily.phase !== "clear";
    return {
      text: t(on ? "today.changeLine.conditioningOn" : "today.changeLine.conditioningClear"),
      quiet: false,
      source,
    };
  }
  return null;
}

export function termSecondCaption(
  daily: DailySignal | null | undefined,
  t: TFn
): string {
  if (!daily) return "";
  const planetRaw = daily.planet;
  const planet =
    planetRaw === "Moon"
      ? t("today.planet.Moon")
      : planetRaw === "Sun"
        ? t("today.planet.Sun")
        : planetRaw || "";
  const gateLabel = t("today.term.gate");
  const lineLabel = t("today.term.line");
  const gate = daily.gate;
  const line = daily.line;
  if (planet && gate != null && line != null) {
    return t("today.termCaption.full", { planet, gateLabel, gate, lineLabel, line });
  }
  if (planet && gate != null) {
    return t("today.termCaption.planetGate", { planet, gateLabel, gate });
  }
  if (gate != null && line != null) {
    return t("today.termCaption.gateLine", { gateLabel, gate, lineLabel, line });
  }
  if (gate != null) {
    return t("today.termCaption.gate", { gateLabel, gate });
  }
  return "";
}

export function localizeCueBody(daily: DailySignal | null | undefined, t: TFn): string {
  if (!daily) return "";
  if (daily.body_part) return resolveCopy(t, daily.body_part, daily.body);
  if (daily.cue_gate != null && isMessageKey(`today.gateCue.${daily.cue_gate}`)) {
    return t(`today.gateCue.${daily.cue_gate}` as MessageKey);
  }
  return daily.body;
}

export function localizeSkyLines(
  indication: TodayIndicationPayload,
  t: TFn
): string[] {
  const story = indication.sky_story;
  if (!story) return [];
  if (story.line_parts?.length) {
    return story.line_parts.map((part, i) => resolveCopy(t, part, story.lines[i] || ""));
  }
  return story.lines.slice(0, 4);
}

export function localizeTomorrow(
  indication: TodayIndicationPayload,
  t: TFn
): string {
  const kind = indication.sky_story?.tomorrow?.kind;
  if (!kind) return "";
  if (kind === "moon_leaves") return t("today.tomorrow.moonLeaves");
  if (kind === "moon_holds") return t("today.tomorrow.moonHolds");
  if (kind === "sun_theme_leaves") return t("today.tomorrow.sunThemeLeaves");
  return t("today.tomorrow.sunThemeHolds");
}

export const TODAY_LITERACY_I18N: {
  id: string;
  titleKey: MessageKey;
  bodyKey: MessageKey;
  jumpKey: MessageKey;
  targetId: string;
}[] = [
  {
    id: "today-move",
    titleKey: "today.literacy.move.title",
    bodyKey: "today.literacy.move.body",
    jumpKey: "today.literacy.move.jump",
    targetId: "main-action",
  },
  {
    id: "today-energy-space",
    titleKey: "today.literacy.energySpace.title",
    bodyKey: "today.literacy.energySpace.body",
    jumpKey: "today.literacy.energySpace.jump",
    targetId: "main-action-status",
  },
  {
    id: "today-sky-details",
    titleKey: "today.literacy.skyDetails.title",
    bodyKey: "today.literacy.skyDetails.body",
    jumpKey: "today.literacy.skyDetails.jump",
    targetId: "today-sky-details",
  },
];
