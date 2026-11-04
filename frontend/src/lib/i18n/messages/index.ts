import type { Locale } from "../types";
import { messages as en, type MessageKey } from "./en";
import { messages as nl } from "./nl";
import { messages as de } from "./de";
import { messages as fr } from "./fr";
import { messages as es } from "./es";

export type { MessageKey };

export const catalogs: Record<Locale, Record<MessageKey, string>> = {
  en,
  nl: nl as Record<MessageKey, string>,
  de: de as Record<MessageKey, string>,
  fr: fr as Record<MessageKey, string>,
  es: es as Record<MessageKey, string>,
};
