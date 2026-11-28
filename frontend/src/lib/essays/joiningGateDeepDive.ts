import type { Locale } from "@/lib/i18n/types";

/**
 * Joining-gate Deep dive copy. Feature names (Joining gate, Gate, Definition,
 * center names) stay English. Visible strings are locked; {name} uses the
 * same curly apostrophe as chart.v9.eyebrowNamed.
 */
const COPY = {
  en: {
    whatYou:
      "A joining gate is the missing end of a path between two separate areas of your chart. You already hold one side; that one gate would hook the areas together.",
    whatOther:
      "A joining gate is the missing end of a path between two separate areas of {name}\u2019s chart. {name} already holds one side; that one gate would hook the areas together.",
    specificYou:
      "On your chart, Gate {gate} would join {areaA} with {areaB}. Another person who holds Gate {gate}, or the sky lighting that gate, can complete the link for a while.",
    specificOther:
      "On {name}\u2019s chart, Gate {gate} would join {areaA} with {areaB}. Another person who holds Gate {gate}, or the sky lighting that gate, can complete the link for a while.",
    whyYou:
      "This matters because that missing link can feel magnetic. The right person, or the right sky day, can make those two areas work as one for a while \u2014 it can feel like relief or chemistry, not a change of your definition.",
    whyOther:
      "This matters because that missing link can feel magnetic. The right person, or the right sky day, can make those two areas work as one for a while \u2014 it can feel like relief or chemistry, not a change of {name}\u2019s definition.",
    linkName: "Gate {gate}, opens Deep dive Definition",
  },
  nl: {
    whatYou:
      "Een joining gate is het ontbrekende uiteinde van een pad tussen twee aparte gebieden van je grafiek. Jij houdt al \u00e9\u00e9n kant vast; die ene poort zou de gebieden aan elkaar haken.",
    whatOther:
      "Een joining gate is het ontbrekende uiteinde van een pad tussen twee aparte gebieden van de grafiek van {name}. {name} houdt al \u00e9\u00e9n kant vast; die ene poort zou de gebieden aan elkaar haken.",
    specificYou:
      "Op jouw grafiek zou Gate {gate} {areaA} met {areaB} verbinden. Een ander persoon die Gate {gate} vasthoudt, of de hemel die die poort belicht, kan de verbinding een tijdje compleet maken.",
    specificOther:
      "Op de grafiek van {name} zou Gate {gate} {areaA} met {areaB} verbinden. Een ander persoon die Gate {gate} vasthoudt, of de hemel die die poort belicht, kan de verbinding een tijdje compleet maken.",
    whyYou:
      "Dit is belangrijk omdat die ontbrekende schakel magnetisch kan aanvoelen. De juiste persoon, of een dag waarop de hemel die poort belicht, kan die twee gebieden een tijdje als \u00e9\u00e9n laten werken \u2014 het kan voelen als opluchting of chemie, niet als een verandering van je definition.",
    whyOther:
      "Dit is belangrijk omdat die ontbrekende schakel magnetisch kan aanvoelen. De juiste persoon, of een dag waarop de hemel die poort belicht, kan die twee gebieden een tijdje als \u00e9\u00e9n laten werken \u2014 het kan voelen als opluchting of chemie, niet als een verandering van de definition van {name}.",
    linkName: "Poort {gate}, opent Deep dive Definition",
  },
} as const satisfies Record<Locale, Record<string, string>>;

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] != null ? String(vars[name]) : `{${name}}`,
  );
}

export type JoiningGateSpec = { gate: number; areaA: string; areaB: string };

export function joiningGateDeepDiveCopy(
  locale: Locale,
  personName: string | undefined,
  gates: JoiningGateSpec[],
): { what: string; specifics: string[]; why: string } {
  const name = (personName || "").trim();
  const other = name.length > 0;
  const pack = COPY[locale] ?? COPY.en;
  const who = { name };
  return {
    what: fill(other ? pack.whatOther : pack.whatYou, who),
    specifics: gates.map((gate) =>
      fill(other ? pack.specificOther : pack.specificYou, {
        name,
        gate: gate.gate,
        areaA: gate.areaA,
        areaB: gate.areaB,
      }),
    ),
    why: fill(other ? pack.whyOther : pack.whyYou, who),
  };
}

export function joiningGateLinkLabel(locale: Locale, gate: number): string {
  const pack = COPY[locale] ?? COPY.en;
  return fill(pack.linkName, { gate });
}
