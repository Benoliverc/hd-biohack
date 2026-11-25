/**
 * Snapshot-only other-person overlay for Profile, Authority plain and Centers tips (Snapshot panel
 * fixes, 25 Nov 2026). Deep dive and the frozen hdCopy bundles are untouched.
 * English strings are locked in the build brief; ES/NL carry the same meaning, name-forward.
 * DE/FR follow today's you-voice coverage: their Profile / Authority / Centers bundles are English,
 * so other-person uses the English strings there too (translation is out of scope).
 * `{name}` is the person's display name (friendChipLabel, same as the Type box).
 */
import type { Locale } from "@/lib/i18n";
import { withPersonName } from "./snapshotShortCopy";

type BundleLocale = "en" | "es" | "nl";

/** Which hdCopy bundle a UI locale reads (mirrors resolveHdCopy: de/fr use the English bundle). */
export function snapshotBundleLocale(locale: Locale): BundleLocale {
  return locale === "es" || locale === "nl" ? locale : "en";
}

export const SNAPSHOT_AUTHORITY_PLAIN_OTHER: Record<BundleLocale, Record<string, string>> = {
  en: {
    "Emotional (Solar Plexus)": "{name}'s clear answers arrive after feelings move — big calls need a night's sleep.",
    Sacral: "{name}'s yes is a gut sound or visceral pull in the now. Not a clear yes? It's a no (or not yet).",
    Splenic: "{name}'s yes is a quiet instinct about safety and timing — easy to talk themselves out of.",
    "Ego / Heart": "{name}'s yes is what they can honestly will and sustain — promises they can keep.",
    "Self-Projected": "{name}'s yes shows up when they hear themselves talk it out in the right company.",
    Lunar: "{name}'s yes needs time — sampling across a lunar cycle before locking big choices.",
    "Mental / Environmental (Outer Authority)": "{name} decides with trusted sounding boards and healthy rooms — the mind reflects, it doesn't boss alone.",
  },
  es: {
    "Emotional (Solar Plexus)": "Las respuestas claras de {name} llegan después de que los sentimientos se mueven — las decisiones grandes necesitan una noche de sueño.",
    Sacral: "El sí de {name} es un sonido del vientre o un tirón visceral en el ahora. ¿No es un sí claro? Es un no (o todavía no).",
    Splenic: "El sí de {name} es un instinto silencioso sobre la seguridad y el momento — a {name} le resulta fácil convencerse de lo contrario.",
    "Ego / Heart": "El sí de {name} es lo que puede querer de verdad y sostener — promesas que puede cumplir.",
    "Self-Projected": "El sí de {name} aparece cuando se oye hablarlo en la compañía correcta.",
    Lunar: "El sí de {name} necesita tiempo — probar a lo largo de un ciclo lunar antes de cerrar las decisiones grandes.",
    "Mental / Environmental (Outer Authority)": "{name} decide con cajas de resonancia de confianza y salas sanas — la mente refleja, no manda sola.",
  },
  nl: {
    "Emotional (Solar Plexus)": "De heldere antwoorden van {name} komen nadat gevoelens zijn bewogen — grote keuzes hebben een nacht slaap nodig.",
    Sacral: "Het ja van {name} is een geluid vanuit de buik of een viscerale trek in het nu. Geen duidelijk ja? Dan is het een nee (of nog-niet).",
    Splenic: "Het ja van {name} is een stil instinct over veiligheid en timing — makkelijk om weg te praten.",
    "Ego / Heart": "Het ja van {name} is wat {name} eerlijk wil en kan volhouden — beloften die {name} kan houden.",
    "Self-Projected": "Het ja van {name} verschijnt wanneer {name} zichzelf hoort praten in het juiste gezelschap.",
    Lunar: "Het ja van {name} heeft tijd nodig — proeven over een maancyclus voordat grote keuzes worden vastgezet.",
    "Mental / Environmental (Outer Authority)": "{name} besluit met vertrouwde klankborden en gezonde ruimtes — het hoofd weerspiegelt, het baas niet in z’n eentje.",
  },
};

export const SNAPSHOT_OPEN_CENTER_WATCH_OTHER: Record<BundleLocale, Record<string, string>> = {
  en: {
    Head: "{name} can soak up other people's questions — not every puzzle is theirs to solve.",
    Ajna: "{name} can sample every opinion — watch overthinking and certainty addiction.",
    Throat: "{name} can feel pressure to speak or perform — correct timing matters before pushing output.",
    G: "Direction can shift with the room — a change of place helps {name} before forcing purpose.",
    Heart: "Willpower can feel inconsistent — worth does not have to be proved by overcommitting.",
    Solar_Plexus: "{name} amplifies emotions around them — check what is theirs before deciding.",
    Sacral: "{name} does not have a consistent work motor — rest is strategy, not failure.",
    Spleen: "{name} can pick up fear vibes — a pause helps before health-scare rabbit holes.",
    Root: "{name} amplifies hurry — other people's deadlines are not automatically theirs.",
  },
  es: {
    Head: "{name} puede absorber las preguntas de otras personas — no cada enigma le toca resolverlo a {name}.",
    Ajna: "{name} puede probar todas las opiniones — vigila el pensar de más y la adicción a la certeza.",
    Throat: "{name} puede sentir presión de hablar o de actuar — el momento correcto importa antes de empujar.",
    G: "La dirección puede cambiar con la sala — un cambio de lugar ayuda a {name} antes de forzar un propósito.",
    Heart: "La voluntad puede sentirse inconsistente — la valía no tiene que demostrarse sobrecargándose de compromisos.",
    Solar_Plexus: "{name} amplifica las emociones de alrededor — conviene comprobar qué es de {name} antes de decidir.",
    Sacral: "{name} no tiene un motor de trabajo constante — el descanso es Strategy, no un fracaso.",
    Spleen: "{name} puede recoger vibraciones de miedo — una pausa ayuda antes de los agujeros de conejo de la alarma de salud.",
    Root: "{name} amplifica la prisa — los plazos de otras personas no son automáticamente de {name}.",
  },
  nl: {
    Head: "{name} kan de vragen van andere mensen opzuigen — niet elke puzzel is aan {name} om op te lossen.",
    Ajna: "{name} kan elke mening proeven — let op overdenken en verslaving aan zekerheid.",
    Throat: "{name} kan druk voelen om te spreken of op te treden — de juiste timing telt voordat er output wordt doorgedrukt.",
    G: "Richting kan meebewegen met de ruimte — een andere plek helpt {name} voordat een doel wordt geforceerd.",
    Heart: "Wilskracht kan wisselend voelen — waarde hoeft niet bewezen te worden door te veel toe te zeggen.",
    Solar_Plexus: "{name} versterkt de emoties eromheen — check wat van {name} is voordat er besloten wordt.",
    Sacral: "{name} heeft geen gestage werk-motor — rust is strategy, geen falen.",
    Spleen: "{name} kan angstvibes oppikken — een pauze helpt voordat de gezondheidsschrik-konijnenholen beginnen.",
    Root: "{name} versterkt haast — de deadlines van andere mensen zijn niet automatisch die van {name}.",
  },
};

/** Other-person Profile line briefs (same structure and meaning as PROFILE_LINES, second person swapped). */
export const SNAPSHOT_PROFILE_LINES_OTHER: Record<BundleLocale, Record<number, string>> = {
  en: {
    1: "{name} needs a solid foundation — research, study, and feeling secure before trusting the ground. Line 1 digs for the base: facts, frameworks, and lived proof that something is safe enough to stand on. When the foundation feels thin, anxiety and over-preparation show up; when it feels solid, they teach and share with quiet authority. They are here to know enough that others can lean on what they have investigated.",
    2: "Natural gifts others call out; needs alone time and to be called (not forced) into sharing. Line 2 carries talent that often feels effortless from the outside and mysterious to them — people notice what they do without trying. Solitude recharges the gift; performance on demand drains it. The healthy pattern is hermit time plus sincere calls that invite them out, not pressure that pushes them into every room.",
    3: "Learns by trial and error — bonds made and broken; discovery through lived experience. Line 3 is designed to bump into life, test what works, and revise the map after contact with reality. Mistakes are data, not proof of failure; resilience comes from bouncing and telling the truth about what actually happened. {name} matures by collecting experiments until that lived wisdom becomes useful to others navigating the same terrain.",
    4: "Network and friendships open doors; influence travels through known people. Line 4 thrives in familiar circles — opportunities arrive through people who already know and trust {name}, not through cold outreach. Quality of network matters more than size: the right friends, colleagues, and communities become the bridge. When they force stranger-to-stranger launching, doors stick; when they nurture bonds, life opens sideways.",
    5: "Projected problem-solver — others see practical solutions in {name}; projections need to be managed consciously. Line 5 is cast into the role of fixer: people project that they have the answer for the crisis of the moment. That can be powerful when they truly have a universal, practical solution — and exhausting when they absorb every hope and blame. Clarity about which problems are theirs to solve (and which are projections) keeps the heretic honest and effective.",
    6: "Three-part life process (trial → withdrawal → embodiment); becomes a living example over time. Roughly the first third of life often feels like a line-3 experiment — trying, failing, and collecting scars. Then a roof / observer phase arrives where they step back, watch, and integrate before jumping into every fight. Later they step down as a role model: not preaching theory, but embodying what they have lived so others can see a credible path.",
  },
  es: {
    1: "{name} necesita una base sólida — investigar, estudiar y sentir seguridad antes de confiar en el suelo. La línea 1 cava en busca de la base: hechos, marcos y prueba vivida de que algo es lo bastante seguro como para sostenerse. Cuando la base se siente delgada, aparecen la ansiedad y la sobrepreparación; cuando se siente sólida, {name} enseña y comparte con una autoridad callada. {name} está aquí para saber lo bastante para que otros puedan apoyarse en lo que ha investigado.",
    2: "Dones naturales que otros señalan; necesita tiempo a solas y que le llamen (no que le fuercen) a compartir. La línea 2 lleva un talento que a menudo se siente fácil desde fuera y misterioso para {name} — la gente nota lo que hace sin intentarlo. La soledad recarga el don; actuar bajo demanda lo vacía. El patrón sano es tiempo de ermitaño más llamadas sinceras que invitan a {name} a salir, no una presión que empuja a {name} a todas las salas.",
    3: "Aprende por prueba y error — vínculos que se hacen y se rompen; descubrimiento a través de la experiencia vivida. La línea 3 está hecha para encontrarse con la vida, probar qué funciona y revisar el mapa después del contacto con la realidad. Los errores son datos, no la prueba de un fracaso; la resiliencia viene de rebotar y decir la verdad de lo que de verdad pasó. {name} madura al reunir experimentos hasta que esa sabiduría vivida les sirve a otros que cruzan el mismo terreno.",
    4: "La red y las amistades abren puertas; la influencia viaja a través de personas ya conocidas. La línea 4 crece en círculos familiares — las oportunidades llegan a través de personas que ya conocen a {name} y confían en {name}, no a través del acercamiento en frío. La calidad de la red importa más que el tamaño: los amigos, colegas y comunidades correctos se vuelven el puente. Cuando {name} fuerza un lanzamiento de desconocido a desconocido, las puertas se traban; cuando cuida los vínculos, la vida se abre de lado.",
    5: "Resolvedor de problemas proyectado — otros ven en {name} soluciones prácticas; las proyecciones necesitan gestionarse con conciencia. La línea 5 queda colocada en el rol de quien arregla: la gente proyecta que {name} tiene la respuesta para la crisis del momento. Eso puede ser poderoso cuando de verdad tiene una solución universal y práctica — y agotador cuando absorbe cada esperanza y cada culpa. La claridad sobre qué problemas le toca resolver a {name} (y cuáles son proyecciones) mantiene honesto y eficaz al Heretic.",
    6: "Proceso de vida en tres partes (prueba → retirada → encarnación); se vuelve un ejemplo vivo con el tiempo. Más o menos el primer tercio de la vida a menudo se siente como un experimento de línea 3 — probar, fallar y reunir cicatrices. Luego llega una fase de tejado / observador en la que {name} da un paso atrás, mira e integra antes de saltar a cada pelea. Más tarde {name} baja como role model: no predicando teoría, sino encarnando lo que ha vivido para que otros puedan ver un camino creíble.",
  },
  nl: {
    1: "{name} heeft een stevige basis nodig — onderzoeken, studeren, en zich veilig voelen voordat de grond vertrouwd wordt. Lijn 1 graaft naar de fundering: feiten, kaders, en geleefd bewijs dat iets veilig genoeg is om op te staan. Wanneer de basis dun voelt, verschijnen angst en overvoorbereiding; wanneer hij stevig voelt, onderwijst en deelt {name} met stille autoriteit. {name} is hier om genoeg te weten zodat anderen kunnen leunen op wat {name} heeft onderzocht.",
    2: "Natuurlijke gaven die anderen aanwijzen; heeft tijd alleen nodig en wil geroepen (niet gedwongen) worden om te delen. Lijn 2 draagt talent dat vanbuiten vaak moeiteloos voelt en voor {name} mysterieus — mensen merken wat {name} doet zonder het te proberen. Eenzaamheid laadt de gave opnieuw op; presteren op verzoek put haar uit. Het gezonde patroon is kluizenaarstijd plus oprechte roepingen die {name} naar buiten vragen, geen druk die {name} elke ruimte in duwt.",
    3: "Leert door vallen en opstaan — banden die ontstaan en breken; ontdekking via geleefde ervaring. Lijn 3 is ontworpen om tegen het leven aan te botsen, te testen wat werkt, en de kaart te herzien na contact met de werkelijkheid. Fouten zijn data, geen bewijs van falen; veerkracht komt van opnieuw opstaan en de waarheid vertellen over wat er écht gebeurde. {name} rijpt door experimenten te verzamelen tot die geleefde wijsheid nuttig wordt voor anderen die hetzelfde terrein oversteken.",
    4: "Netwerk en vriendschappen openen deuren; invloed reist via bekende mensen. Lijn 4 floreert in vertrouwde kringen — kansen komen via mensen die {name} al kennen en vertrouwen, niet via koud benaderen. De kwaliteit van het netwerk telt meer dan de omvang: de juiste vrienden, collega’s en gemeenschappen worden de brug. Wanneer {name} een lancering van onbekende naar onbekende forceert, blijven deuren hangen; wanneer {name} banden verzorgt, opent het leven zich zijwaarts.",
    5: "Geprojecteerde probleemoplosser — anderen zien praktische oplossingen in {name}; projecties vragen bewust beheer. Lijn 5 wordt in de rol van fixer gezet: mensen projecteren dat {name} het antwoord heeft op de crisis van het moment. Dat kan krachtig zijn wanneer {name} écht een universele, praktische oplossing heeft — en uitputtend wanneer {name} elke hoop en elke blaam opneemt. Helderheid over welke problemen aan {name} zijn om op te lossen (en welke projecties zijn) houdt de Heretic eerlijk en effectief.",
    6: "Levensproces in drie delen (proef → terugtrekking → belichaming); wordt met de tijd een levend voorbeeld. Grofweg het eerste derde van het leven voelt vaak als een experiment van lijn 3 — proberen, falen, en littekens verzamelen. Daarna komt een dak- / waarnemersfase waarin {name} een stap terugdoet, toekijkt en integreert voordat {name} in elk gevecht springt. Later komt {name} naar beneden als role model: niet door theorie te preken, maar door te belichamen wat {name} heeft geleefd, zodat anderen een geloofwaardig pad kunnen zien.",
  },
};

export const SNAPSHOT_PROFILE_FALLBACK_OTHER: Record<BundleLocale, string> = {
  en: "{name}'s profile is how they meet the world and how they digest experience.",
  es: "El Profile de {name} es cómo sale al mundo y cómo digiere la experiencia.",
  nl: "Het Profile van {name} is hoe {name} de wereld ontmoet en ervaring verteert.",
};

/** Line names stay English (feature names); section labels match each bundle's profilePlainLine. */
const PROFILE_LINE_NAMES: Record<number, string> = {
  1: "Investigator",
  2: "Hermit",
  3: "Martyr",
  4: "Opportunist",
  5: "Heretic",
  6: "Role Model",
};
const PROFILE_LABELS: Record<BundleLocale, { outward: string; underneath: string }> = {
  en: { outward: "Outward (line {n})", underneath: "Underneath (line {n})" },
  es: { outward: "Hacia fuera (línea {n})", underneath: "Por debajo (línea {n})" },
  nl: { outward: "Naar buiten (lijn {n})", underneath: "Daaronder (lijn {n})" },
};

/** Other-person twin of profilePlainLine: same `{profile} — {nameA} / {nameB}.` + Outward / Underneath shape. */
export function snapshotProfileOtherLine(profile: string, locale: Locale, name: string): string {
  const bundle = snapshotBundleLocale(locale);
  const m = /^(\d)\s*\/\s*(\d)$/.exec(profile.trim());
  if (!m) return withPersonName(SNAPSHOT_PROFILE_FALLBACK_OTHER[bundle], name);
  const a = Number(m[1]);
  const b = Number(m[2]);
  const lines = SNAPSHOT_PROFILE_LINES_OTHER[bundle];
  const labels = PROFILE_LABELS[bundle];
  return withPersonName(
    `${a}/${b} — ${PROFILE_LINE_NAMES[a] || "?"} / ${PROFILE_LINE_NAMES[b] || "?"}.\n\n` +
      `${labels.outward.replace("{n}", String(a))}: ${lines[a] || ""}\n\n` +
      `${labels.underneath.replace("{n}", String(b))}: ${lines[b] || ""}`,
    name,
  );
}

export function snapshotAuthorityOtherPlain(authority: string, locale: Locale, name: string): string | undefined {
  const template = SNAPSHOT_AUTHORITY_PLAIN_OTHER[snapshotBundleLocale(locale)][authority];
  return template === undefined ? undefined : withPersonName(template, name);
}

export function snapshotCenterOtherTip(center: string, locale: Locale, name: string): string | undefined {
  const template = SNAPSHOT_OPEN_CENTER_WATCH_OTHER[snapshotBundleLocale(locale)][center];
  return template === undefined ? undefined : withPersonName(template, name);
}
