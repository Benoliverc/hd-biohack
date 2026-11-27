/**
 * Snapshot Profile line briefs open with "You…" / "Je…" or the person's name.
 * English and Dutch only. Retired de/fr/es resolve to the English leads.
 * Brief 17353706…. Names are inserted with a function replacer so "$&" stays literal.
 */
import type { Locale } from "@/lib/i18n";
import { resolveHdCopy } from "@/lib/essays/resolveHdCopy";
import { snapshotProfileOtherLine } from "@/lib/essays/snapshotOtherPersonCopy";

type LineNo = 1 | 2 | 3 | 4 | 5 | 6;
type LeadLocale = "en" | "nl";

export const PROFILE_LEAD_SELF: Record<LeadLocale, Record<LineNo, string>> = {
  en: {
    1: "You need a solid foundation — you research, study, and feel secure before you trust the ground.",
    2: "You carry natural gifts that others call out; you need alone time and to be called (not forced) into sharing.",
    3: "You learn by trial and error — bonds made and broken, discovery through lived experience.",
    4: "Your network and friendships open doors; your influence travels through people you already know.",
    5: "You are a projected problem-solver — others see practical solutions in you, so manage those projections consciously.",
    6: "You live a three-part process (trial → withdrawal → embodiment) and become a living example over time.",
  },
  nl: {
    1: "Je hebt een stevige basis nodig — onderzoeken, studeren en je veilig voelen voordat je de grond vertrouwt.",
    2: "Je hebt natuurlijke gaven die anderen aanwijzen; je hebt tijd alleen nodig en wilt geroepen (niet gedwongen) worden om te delen.",
    3: "Je leert door vallen en opstaan — banden die ontstaan en breken, ontdekking via geleefde ervaring.",
    4: "Je netwerk en je vriendschappen openen deuren; je invloed reist via mensen die je al kent.",
    5: "Je bent een geprojecteerde probleemoplosser — anderen zien praktische oplossingen in jou, dus beheer die projecties bewust.",
    6: "Je doorloopt een levensproces in drie delen (proef → terugtrekking → belichaming) en wordt met de tijd een levend voorbeeld.",
  },
};

export const PROFILE_LEAD_OTHER: Record<LeadLocale, Record<LineNo, string>> = {
  en: {
    1: "{name} needs a solid foundation — research, study, and feeling secure before trusting the ground.",
    2: "{name} carries natural gifts that others call out, and needs alone time and to be called (not forced) into sharing.",
    3: "{name} learns by trial and error — bonds made and broken, discovery through lived experience.",
    4: "{name} opens doors through network and friendships; influence travels through people they already know.",
    5: "{name} is a projected problem-solver — others see practical solutions in {name}, and those projections need to be managed consciously.",
    6: "{name} lives a three-part process (trial → withdrawal → embodiment) and becomes a living example over time.",
  },
  nl: {
    1: "{name} heeft een stevige basis nodig — onderzoeken, studeren en zich veilig voelen voordat de grond vertrouwd wordt.",
    2: "{name} heeft natuurlijke gaven die anderen aanwijzen; {name} heeft tijd alleen nodig en wil geroepen (niet gedwongen) worden om te delen.",
    3: "{name} leert door vallen en opstaan — banden die ontstaan en breken, ontdekking via geleefde ervaring.",
    4: "{name} opent deuren via netwerk en vriendschappen; invloed reist via mensen die {name} al kennen.",
    5: "{name} is een geprojecteerde probleemoplosser — anderen zien praktische oplossingen in {name}; projecties vragen bewust beheer.",
    6: "{name} doorloopt een levensproces in drie delen (proef → terugtrekking → belichaming) en wordt met de tijd een levend voorbeeld.",
  },
};

function leadLocale(locale: Locale): LeadLocale {
  return locale === "nl" ? "nl" : "en";
}

function insertName(template: string, name: string): string {
  return template.replaceAll("{name}", () => name);
}

/** Replace the brief's first sentence (through the first ". ") and keep the rest. */
function withLead(paragraph: string, lead: string): string {
  const colon = paragraph.indexOf(": ");
  if (colon < 0) return paragraph;
  const label = paragraph.slice(0, colon + 2);
  const brief = paragraph.slice(colon + 2);
  const cut = brief.indexOf(". ");
  if (cut < 0) return paragraph;
  return `${label}${lead} ${brief.slice(cut + 2)}`;
}

export function snapshotProfileLine(profile: string, locale: Locale, name?: string): string {
  const active = leadLocale(locale);
  const match = /^(\d)\s*\/\s*(\d)$/.exec(profile.trim());
  if (!match) {
    if (!name) return resolveHdCopy(active).profilePlainLine(profile);
    return insertName(snapshotProfileOtherLine(profile, active, "{name}"), name);
  }

  const outward = Number(match[1]) as LineNo;
  const underneath = Number(match[2]) as LineNo;
  const leads = name ? PROFILE_LEAD_OTHER[active] : PROFILE_LEAD_SELF[active];
  const base = name
    ? snapshotProfileOtherLine(profile, active, "{name}")
    : resolveHdCopy(active).profilePlainLine(profile);
  const parts = base.split("\n\n");
  if (parts.length >= 3 && leads[outward] && leads[underneath]) {
    parts[1] = withLead(parts[1], leads[outward]);
    parts[2] = withLead(parts[2], leads[underneath]);
  }
  const joined = parts.join("\n\n");
  return name ? insertName(joined, name) : joined;
}
