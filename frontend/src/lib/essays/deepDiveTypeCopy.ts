import type { Locale } from "@/lib/i18n/types";
import en from "./deepDiveType.en.json";
import de from "./deepDiveType.de.json";
import es from "./deepDiveType.es.json";
import fr from "./deepDiveType.fr.json";
import nl from "./deepDiveType.nl.json";

const TYPE_ESSAYS = { en, de, es, fr, nl } satisfies Record<Locale, typeof en>;
export type DeepDiveType = keyof typeof en.self;

function isDeepDiveType(value: string): value is DeepDiveType {
  return Object.hasOwn(en.self, value);
}

/** A missing/unknown Type has no essay; never substitute another Type or language. */
export function deepDiveTypeSections(type: string, locale: Locale, personName?: string) {
  if (!isDeepDiveType(type)) return [];
  const sections = TYPE_ESSAYS[locale][personName ? "other" : "self"][type];
  return sections.map(({ heading, body }) => ({
    heading,
    body: personName ? body.replaceAll("{name}", () => personName) : body,
  }));
}
