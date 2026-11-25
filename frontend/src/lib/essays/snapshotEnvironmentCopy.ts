/**
 * Snapshot Environment line (Baseline, 25 Nov 2026): locked short copy, approximate caveat and
 * title marker from the build brief. All five locales, no English fallback.
 * Environment = Human Design Color (1–6) of the Design Nodes, computed by the backend.
 * Feature name and the six values stay English in every locale. Color 3 displays as Workshops
 * (Baseline's name for the traditional HD Environment 'Kitchens').
 * Budget (short copy only; the caveat is extra): <= 80 words and <= 500 characters.
 */
import type { Locale } from "@/lib/i18n";

export { SNAPSHOT_COPY_MAX_CHARS, SNAPSHOT_COPY_MAX_WORDS } from "./snapshotShortCopy";

type ByLocale = Record<Locale, string>;

export const ENVIRONMENT_NAMES = ["Caves", "Markets", "Workshops", "Mountains", "Valleys", "Shores"] as const;
export type EnvironmentName = (typeof ENVIRONMENT_NAMES)[number];

export const SNAPSHOT_ENVIRONMENT_COPY: Record<EnvironmentName, ByLocale> = {
  // Color 1
  Caves: {
    en: "You think and rest best in a small, contained place — a quiet room, a corner, a space with a door you control. Too much open traffic can scatter you. Give yourself a cave you can withdraw into, even on a busy day.",
    de: "Du denkst und ruhst am besten in einem kleinen, geschützten Ort — einem stillen Zimmer, einer Ecke, einem Raum mit einer Tür, die du kontrollierst. Zu viel offener Betrieb kann dich zerstreuen. Gönn dir eine Caves, in die du dich zurückziehen kannst, auch an einem vollen Tag.",
    es: "Piensas y descansas mejor en un lugar pequeño y contenido — una habitación quieta, un rincón, un espacio con una puerta que controlas. Demasiado tráfico abierto puede dispersarte. Date una Caves a la que puedas retirarte, incluso en un día ocupado.",
    fr: "Tu penses et tu te reposes mieux dans un petit lieu contenu — une pièce calme, un coin, un espace avec une porte que tu contrôles. Trop de passage ouvert peut te disperser. Offre-toi une Caves où tu peux te retirer, même lors d’une journée chargée.",
    nl: "Je denkt en rust het best in een kleine, besloten plek — een stille kamer, een hoek, een ruimte met een deur die jij bepaalt. Te veel open verkeer kan je verstrooien. Geef jezelf een Caves waar je je in kunt terugtrekken, ook op een drukke dag.",
  },
  // Color 2
  Markets: {
    en: "You come alive where people and goods move — shops, streets, busy rooms, the flow of exchange. A sealed-off quiet can leave you stale. Spend regular time in that human traffic, then go home.",
    de: "Du wirst lebendig, wo Menschen und Dinge sich bewegen — Läden, Straßen, belebte Räume, der Fluss des Austauschs. Eine abgeriegelte Stille kann dich fade werden lassen. Verbring regelmäßig Zeit in diesem menschlichen Verkehr, und geh dann nach Hause.",
    es: "Cobras vida donde se mueven las personas y las cosas — tiendas, calles, salas con movimiento, el flujo del intercambio. Un silencio cerrado puede dejarte estancado. Pasa tiempo con regularidad en ese tráfico humano, y entonces vete a casa.",
    fr: "Tu t’animes là où les personnes et les biens circulent — boutiques, rues, pièces animées, le flux de l’échange. Un calme trop fermé peut te laisser ternir. Passe régulièrement du temps dans ce trafic humain, puis rentre.",
    nl: "Je komt tot leven waar mensen en goederen bewegen — winkels, straten, drukke ruimtes, de stroom van uitwisseling. Een afgesloten stilte kan je mat maken. Breng regelmatig tijd door in dat menselijke verkeer, en ga dan naar huis.",
  },
  // Color 3
  Workshops: {
    en: "You do best in a warm, informal working space — a workshop, a studio, somewhere things are being made and shared. Stiff or purely formal rooms can feel wrong. Look for spaces that are lived-in and in use.",
    de: "Du bist am besten in einem warmen, informellen Arbeitsraum — in Workshops, einer Werkstatt, irgendwo, wo Dinge gemacht und geteilt werden. Steife oder rein formelle Räume können sich falsch anfühlen. Such Räume, die bewohnt und in Gebrauch sind.",
    es: "Estás mejor en un espacio de trabajo cálido e informal — Workshops, un taller, un sitio donde se hacen y se comparten cosas. Las salas rígidas o solo formales pueden sentirse mal. Busca espacios habitados y en uso.",
    fr: "Tu es au mieux dans un espace de travail chaud et informel — Workshops, un atelier, quelque part où l’on fabrique et l’on partage. Les pièces raides ou uniquement formelles peuvent sonner faux. Cherche des espaces habités et en usage.",
    nl: "Je doet het het best in een warme, informele werkruimte — in Workshops, een werkplaats, ergens waar dingen worden gemaakt en gedeeld. Stijve of puur formele kamers kunnen verkeerd voelen. Zoek ruimtes die bewoond zijn en in gebruik.",
  },
  // Color 4
  Mountains: {
    en: "You think best with some height and distance — a view, an upper floor, a place a little above the crowd. Being packed in the middle of everything can blur you. Give yourself perspective, then come back down.",
    de: "Du denkst am besten mit etwas Höhe und Abstand — einem Blick, einem oberen Stockwerk, einem Ort ein wenig über der Menge. Mitten in allem gedrängt zu sein, kann dich unscharf machen. Gönn dir Überblick, und komm dann wieder herunter.",
    es: "Piensas mejor con algo de altura y distancia — una vista, un piso alto, un lugar un poco por encima del gentío. Estar metido en medio de todo puede nublarte. Date perspectiva, y entonces baja de nuevo.",
    fr: "Tu penses mieux avec un peu de hauteur et de distance — une vue, un étage élevé, un lieu un peu au-dessus de la foule. Être tassé au milieu de tout peut te brouiller. Offre-toi de la perspective, puis redescends.",
    nl: "Je denkt het best met wat hoogte en afstand — een uitzicht, een bovenverdieping, een plek iets boven de menigte. In het midden van alles staan kan je vertroebelen. Geef jezelf overzicht, en kom dan weer naar beneden.",
  },
  // Color 5
  Valleys: {
    en: "You settle best on low ground, where people and news flow past — a ground floor, a busy street, a courtyard at a crossroads. High, isolated perches can leave you out of the current. Stay where life moves by, not above it.",
    de: "Du kommst am besten auf niedrigem Grund zur Ruhe, wo Menschen und Nachrichten vorbeiziehen — einem Erdgeschoss, einer belebten Straße, einem Hof an einer Kreuzung. Hohe, isolierte Sitze können dich aus der Strömung halten. Bleib, wo das Leben vorbeizieht, nicht darüber.",
    es: "Te asientas mejor en tierra baja, donde pasan las personas y las noticias — una planta baja, una calle con movimiento, un patio en un cruce. Los miradores altos y aislados pueden dejarte fuera de la corriente. Quédate donde la vida pasa, no por encima de ella.",
    fr: "Tu t’installes mieux en terrain bas, là où les personnes et les nouvelles passent — un rez-de-chaussée, une rue animée, une cour à un carrefour. Les perchoirs hauts et isolés peuvent te laisser hors du courant. Reste là où la vie défile, pas au-dessus.",
    nl: "Je komt het best tot rust op laag terrein, waar mensen en nieuws voorbijstromen — een begane grond, een drukke straat, een binnenplaats op een kruising. Hoge, afgezonderde plekken kunnen je buiten de stroom laten. Blijf waar het leven voorbijgaat, niet erboven.",
  },
  // Color 6
  Shores: {
    en: "You thrive on a threshold — by water, at the edge of a room, where two places meet. Being stuck far inland, with no edge in sight, can dull you. Give yourself a shoreline, even a window onto one.",
    de: "Du blühst an einer Schwelle auf — am Wasser, am Rand eines Raums, wo zwei Orte sich treffen. Weit im Inland festzusitzen, ohne einen Rand in Sicht, kann dich stumpf machen. Gönn dir eine Shores, auch nur ein Fenster dorthin.",
    es: "Prosperas en un umbral — junto al agua, al borde de una sala, donde dos lugares se encuentran. Quedarte tierra adentro, sin un borde a la vista, puede apagarte. Date una Shores, aunque sea una ventana hacia una.",
    fr: "Tu t’épanouis sur un seuil — près de l’eau, au bord d’une pièce, là où deux lieux se rencontrent. Rester coincé loin à l’intérieur, sans aucun bord en vue, peut t’émousser. Offre-toi une Shores, même seulement une fenêtre sur une.",
    nl: "Je floreert op een drempel — bij water, aan de rand van een kamer, waar twee plekken elkaar ontmoeten. Ver landinwaarts vastzitten, zonder een rand in zicht, kan je dof maken. Geef jezelf een Shores, al is het maar een raam ernaartoe.",
  },
};

/** One-line caveat at the top of the open body when time_unknown is true. Not in the copy budget. */
export const SNAPSHOT_ENVIRONMENT_APPROX_CAVEAT: ByLocale = {
  en: "Birth time is unknown, so this Environment is approximate. If the true time is far from noon, it may be the adjacent place.",
  de: "Die Geburtszeit ist unbekannt, darum ist dieses Environment ungefähr. Wenn die echte Zeit weit von Mittag liegt, kann es der benachbarte Ort sein.",
  es: "La hora de nacimiento es desconocida, así que este Environment es aproximado. Si la hora real está lejos del mediodía, puede ser el lugar de al lado.",
  fr: "L’heure de naissance est inconnue, donc cet Environment est approximatif. Si l’heure réelle est loin de midi, ça peut être le lieu d’à côté.",
  nl: "De geboortetijd is onbekend, dus dit Environment is ongeveer. Als de echte tijd ver van 12:00 ligt, kan het de naastgelegen plek zijn.",
};

/** Title tag: `Environment: {Value} ({marker})` when time_unknown is true. */
export const SNAPSHOT_ENVIRONMENT_APPROX_MARKER: ByLocale = {
  en: "approximate",
  de: "ungefähr",
  es: "aproximado",
  fr: "approximatif",
  nl: "ongeveer",
};

export function isEnvironmentName(value: unknown): value is EnvironmentName {
  return typeof value === "string" && (ENVIRONMENT_NAMES as readonly string[]).includes(value);
}

/** Collapsed title value: the English Environment name, plus the locale marker when time is unknown. */
export function snapshotEnvironmentValue(name: EnvironmentName, locale: Locale, timeUnknown: boolean): string {
  return timeUnknown ? `${name} (${SNAPSHOT_ENVIRONMENT_APPROX_MARKER[locale]})` : name;
}

export function snapshotEnvironmentCopy(name: EnvironmentName, locale: Locale): string {
  return SNAPSHOT_ENVIRONMENT_COPY[name][locale];
}
