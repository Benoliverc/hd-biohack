import type { MessageKey } from "./messages";

type TFn = (key: MessageKey, vars?: Record<string, string | number>) => string;

const ENERGY_LEVEL_KEYS: Record<number, MessageKey> = {
  1: "energy.drained",
  2: "energy.low",
  3: "energy.steady",
  4: "energy.charged",
  5: "energy.hyper",
};

const ENERGY_EN_KEYS: Record<string, MessageKey> = {
  Drained: "energy.drained",
  Low: "energy.low",
  Steady: "energy.steady",
  Charged: "energy.charged",
  Hyper: "energy.hyper",
};

const SPACE_VALUE_KEYS: Record<string, MessageKey> = {
  people: "space.people",
  alone: "space.alone",
  nature: "space.nature",
  focus: "space.focus",
  out: "space.out",
};

const SPACE_EN_KEYS: Record<string, MessageKey> = {
  People: "space.people",
  Alone: "space.alone",
  Nature: "space.nature",
  "Focus corner": "space.focus",
  "Out & about": "space.out",
};

export function localizeEnergyLabel(
  t: TFn,
  level?: number | null,
  apiLabel?: string | null
): string {
  if (level != null && ENERGY_LEVEL_KEYS[level]) return t(ENERGY_LEVEL_KEYS[level]);
  if (apiLabel && ENERGY_EN_KEYS[apiLabel]) return t(ENERGY_EN_KEYS[apiLabel]);
  return apiLabel || "";
}

export function localizeSpaceLabel(
  t: TFn,
  value?: string | null,
  apiLabel?: string | null
): string {
  if (value && SPACE_VALUE_KEYS[value]) return t(SPACE_VALUE_KEYS[value]);
  if (apiLabel && SPACE_EN_KEYS[apiLabel]) return t(SPACE_EN_KEYS[apiLabel]);
  return apiLabel || value || "";
}


const WEATHER_STANCE_KEYS: Record<number, MessageKey> = {
  1: "today.weatherStance.drained",
  2: "today.weatherStance.low",
  3: "today.weatherStance.steady",
  4: "today.weatherStance.charged",
  5: "today.weatherStance.hyper",
};

const WEATHER_SPACE_KEYS: Record<string, MessageKey> = {
  nature: "today.weatherSpace.nature",
  people: "today.weatherSpace.people",
  alone: "today.weatherSpace.alone",
  focus: "today.weatherSpace.focus",
  out: "today.weatherSpace.out",
};

export function weatherMeaningLine(
  t: TFn,
  energy?: number | null,
  space?: string | null
): string {
  const stanceKey = energy != null ? WEATHER_STANCE_KEYS[energy] : undefined;
  const spaceKey = space ? WEATHER_SPACE_KEYS[space] : undefined;
  if (!stanceKey || !spaceKey) return "";
  return `${t(stanceKey)}, ${t(spaceKey)}`;
}

export const ENERGY_LEVELS = [1, 2, 3, 4, 5] as const;
export const SPACE_VALUES = ["people", "alone", "nature", "focus", "out"] as const;
