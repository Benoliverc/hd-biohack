import type { Locale } from "../types";
import { messages as en, type MessageKey } from "./en";
import { messages as nl } from "./nl";

export type { MessageKey };

export const catalogs: Record<Locale, Record<MessageKey, string>> = {
  en,
  nl: nl as Record<MessageKey, string>,
};
