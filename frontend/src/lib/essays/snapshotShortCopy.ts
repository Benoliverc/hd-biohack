/**
 * Snapshot-only short copy for Chart #snapshot (Baseline Snapshot clarity pass, 25 Nov 2026).
 * Locked strings from the build brief; all five locales, no English fallback.
 * Deep dive keeps STRATEGY_COPY / DEFINITION_COPY (summary + learnMore) unchanged.
 * Budget: each body <= 80 words and <= 500 characters.
 */
import type { Locale } from "@/lib/i18n";

export const SNAPSHOT_COPY_MAX_WORDS = 80;
export const SNAPSHOT_COPY_MAX_CHARS = 500;

type ByLocale = Record<Locale, string>;

export const SNAPSHOT_STRATEGY_COPY: Record<string, ByLocale> = {
  "To Respond": {
    en: "Wait for something real to answer — a person, a question, or an opportunity — before you start. Your body answers with a gut yes or a no. A gut yes beats a clever plan. If it is not a clear yes, treat it as a no or a not yet.",
    de: "Warte auf etwas Echtes, das du beantworten kannst — eine Person, eine Frage oder eine Gelegenheit — bevor du anfängst. Dein Körper antwortet mit einem Ja aus dem Bauch oder einem Nein. Ein Ja aus dem Bauch schlägt einen klugen Plan. Ist es kein klares Ja, behandle es als Nein oder als noch nicht.",
    es: "Espera algo real a lo que responder — una persona, una pregunta o una oportunidad — antes de empezar. Tu cuerpo responde con un sí del cuerpo o un no. Un sí del cuerpo gana a un plan ingenioso. Si no es un sí claro, trátalo como un no o un todavía no.",
    fr: "Attends quelque chose de réel à quoi répondre — une personne, une question ou une opportunité — avant de commencer. Ton corps répond par un oui du corps ou un non. Un oui du corps l’emporte sur un plan malin. Si ce n’est pas un oui clair, traite-le comme un non ou un pas encore.",
    nl: "Wacht op iets echts om op te antwoorden — een persoon, een vraag of een kans — voordat je begint. Je lichaam antwoordt met een ja vanuit je buik of een nee. Een ja vanuit je buik wint het van een slim plan. Is het geen duidelijk ja, behandel het dan als een nee of een nog-niet.",
  },
  "To Respond (then inform)": {
    en: "Wait for a gut yes before you move. A person, a question, or an opportunity shows up, and your body answers first. After a real yes, tell the people it will affect what you are about to do — courtesy, not permission — then go. Speed comes after that sequence, not before.",
    de: "Warte auf ein Ja aus dem Bauch, bevor du loslegst. Eine Person, eine Frage oder eine Gelegenheit erscheint, und dein Körper antwortet zuerst. Nach einem echten Ja sag den Betroffenen, was du vorhast — Höflichkeit, keine Erlaubnis — und dann geh. Tempo kommt nach dieser Reihenfolge, nicht davor.",
    es: "Espera un sí del cuerpo antes de moverte. Aparece una persona, una pregunta o una oportunidad, y tu cuerpo responde primero. Después de un sí de verdad, avisa a las personas a las que va a afectar lo que estás a punto de hacer — cortesía, no permiso — y entonces sigue. La velocidad viene después de esa secuencia, no antes.",
    fr: "Attends un oui du corps avant d’avancer. Une personne, une question ou une opportunité apparaît, et ton corps répond d’abord. Après un vrai oui, préviens les personnes concernées de ce que tu t’apprêtes à faire — courtoisie, pas permission — puis vas-y. La vitesse vient après cette séquence, pas avant.",
    nl: "Wacht op een ja vanuit je buik voordat je beweegt. Er verschijnt een persoon, een vraag of een kans, en je lichaam antwoordt eerst. Na een echt ja, vertel de mensen die het raakt wat je op het punt staat te doen — beleefdheid, geen toestemming — en ga dan. Snelheid komt na die volgorde, niet ervoor.",
  },
  "To Inform": {
    en: "You are designed to start, but tell the people it will touch before you act. Informing is courtesy, not permission. A short heads-up lowers resistance so your initiation can move. Skipping that step is when the world slams on the brakes.",
    de: "Du bist dafür gemacht anzufangen, aber sag den Menschen Bescheid, die es berührt, bevor du handelst. Informieren ist Höflichkeit, keine Erlaubnis. Ein kurzer Hinweis senkt den Widerstand, damit dein Impuls laufen kann. Wenn du diesen Schritt überspringst, tritt die Welt oft auf die Bremse.",
    es: "Estás aquí para empezar, pero avisa a las personas a las que va a tocar antes de actuar. Informar es cortesía, no permiso. Un aviso breve baja la resistencia para que tu impulso pueda moverse. Saltar ese paso es cuando el mundo pisa el freno.",
    fr: "Tu es là pour commencer, mais préviens les personnes que ça va toucher avant d’agir. Informer, c’est de la courtoisie, pas une permission. Un court préavis baisse la résistance pour que ton élan puisse avancer. Sauter cette étape, c’est souvent le moment où le monde freine.",
    nl: "Je bent gemaakt om te beginnen, maar vertel het de mensen die het raakt voordat je handelt. Informeren is beleefdheid, geen toestemming. Een kort seintje verlaagt de weerstand zodat jouw initiatief kan bewegen. Die stap overslaan is het moment waarop de wereld op de rem trapt.",
  },
  "Wait for the Invitation": {
    en: "Share your guidance where you are recognized and asked in. You are not here to chase or prove. The right invitation lands in the right room; forcing it drains you. Wait to be asked, then offer what you see.",
    de: "Teile deine Führung dort, wo du erkannt und hereingebeten wirst. Du bist nicht dafür da zu rennen oder dich zu beweisen. Die richtige Einladung landet im richtigen Raum; sie zu erzwingen, zehrt dich aus. Warte, bis du gefragt wirst, und biete dann an, was du siehst.",
    es: "Comparte tu guía donde te reconocen y te piden que entres. No estás aquí para perseguir ni para demostrar. La invitación correcta aterriza en la sala correcta; forzarla te drena. Espera a que te lo pidan, y entonces ofrece lo que ves.",
    fr: "Partage ta guidance là où tu es reconnu et invité à entrer. Tu n’es pas là pour courir après ou pour prouver. La bonne invitation arrive dans la bonne pièce ; la forcer t’épuise. Attends d’être demandé, puis offre ce que tu vois.",
    nl: "Deel je begeleiding waar je wordt herkend en naar binnen wordt gevraagd. Je bent hier niet om achteraan te jagen of je te bewijzen. De juiste uitnodiging landt in de juiste ruimte; haar forceren put je uit. Wacht tot je gevraagd wordt, en bied dan aan wat je ziet.",
  },
  "Wait a Lunar Cycle": {
    en: "For big choices, sample across about a month so clarity can settle. You take in people and places; rushing a decision often reflects the room you were just in, not you. Give important calls this time before you lock them.",
    de: "Bei großen Entscheidungen koste etwa einen Monat, damit Klarheit sich setzen kann. Du nimmst Menschen und Orte auf; eine eilige Entscheidung spiegelt oft den Raum, in dem du gerade warst, nicht dich. Gib wichtigen Entscheidungen diese Zeit, bevor du sie festmachst.",
    es: "Para las decisiones grandes, prueba a lo largo de un mes para que la claridad pueda asentarse. Tomas a las personas y los lugares; decidir de prisa a menudo refleja la sala en la que acabas de estar, no a ti. Dale a las llamadas importantes ese tiempo antes de fijarlas.",
    fr: "Pour les grands choix, goûte pendant environ un mois pour que la clarté puisse se poser. Tu prends les personnes et les lieux ; une décision précipitée reflète souvent la pièce où tu viens d’être, pas toi. Laisse ce temps aux appels importants avant de les verrouiller.",
    nl: "Proef grote keuzes ongeveer een maand, zodat helderheid kan landen. Je neemt mensen en plekken in je op; een haastig besluit weerspiegelt vaak de ruimte waar je net was, niet jou. Geef belangrijke keuzes die tijd voordat je ze vastzet.",
  },
};

export const SNAPSHOT_DEFINITION_COPY: Record<string, ByLocale> = {
  "None (Reflector)": {
    en: "Nothing in you stays always-on in the same way. You sample and reflect the people and places around you, so environment matters more than a fixed inner weather. Choose rooms that feel like you; that openness is not a missing piece.",
    de: "In dir bleibt nichts auf dieselbe Weise immer an. Du kostest und spiegelst die Menschen und Orte um dich, darum zählt die Umgebung mehr als ein festes Innenwetter. Wähle Räume, die sich nach dir anfühlen; diese Offenheit ist kein fehlendes Stück.",
    es: "Nada en ti se queda siempre encendido de la misma manera. Pruebas y reflejas a las personas y los lugares a tu alrededor, así que el entorno importa más que un clima interior fijo. Elige salas que se sientan como tú; esa apertura no es una pieza que te falte.",
    fr: "Rien en toi ne reste allumé de la même façon. Tu goûtes et tu reflètes les personnes et les lieux autour de toi, donc l’environnement compte plus qu’un climat intérieur fixe. Choisis des pièces qui te ressemblent ; cette ouverture n’est pas une pièce manquante.",
    nl: "Niets in jou blijft op dezelfde manier altijd aan. Je proeft en weerspiegelt de mensen en plekken om je heen, dus omgeving telt meer dan een vast binnenweer. Kies ruimtes die als jij aanvoelen; die openheid is geen ontbrekend stuk.",
  },
  "Single": {
    en: "Your always-on themes link as one stream, so you can often think and act without waiting for someone to bridge a gap. That can feel self-contained. Other people still matter — just not as wiring you lack.",
    de: "Deine immer-an Themen sind ein Strom, darum kannst du oft denken und handeln, ohne darauf zu warten, dass jemand eine Lücke überbrückt. Das kann in sich geschlossen wirken. Andere Menschen bleiben wichtig — nur nicht als Verkabelung, die dir fehlt.",
    es: "Tus temas siempre encendidos se enlazan en un solo flujo, así que a menudo puedes pensar y actuar sin esperar a que alguien puentee un hueco. Eso puede sentirse autónomo. Las demás personas siguen importando — solo no como un cableado que te falta.",
    fr: "Tes thèmes toujours allumés s’enchaînent en un seul flux, donc tu peux souvent penser et agir sans attendre que quelqu’un comble un écart. Cela peut donner une impression d’autonomie. Les autres comptent encore — simplement pas comme un câblage qui te manquerait.",
    nl: "Je altijd-aan thema’s lopen als één stroom, dus je kunt vaak denken en handelen zonder te wachten tot iemand een gat overbrugt. Dat kan in zichzelf besloten voelen. Andere mensen blijven ertoe doen — alleen niet als bedrading die je mist.",
  },
  "Split": {
    en: "You run in two steady clusters that do not fully connect on their own. Some people or places feel oddly completing — they temporarily bridge the gap. Notice the magnet, then still decide as you. You do not have to fuse with every person who bridges you.",
    de: "Du läufst in zwei stetigen Clustern, die sich von selbst nicht ganz verbinden. Manche Menschen oder Orte fühlen sich merkwürdig vervollständigend an — sie überbrücken die Lücke vorübergehend. Spüre den Magneten, und entscheide trotzdem selbst. Du musst dich nicht mit jeder Person verschmelzen, die dich überbrückt.",
    es: "Funcionas en dos grupos estables que no se conectan del todo por sí solos. Algunas personas o lugares se sienten, de forma extraña, completadores — puentean el hueco un tiempo. Nota el imán, y aun así decide como tú. No tienes que fusionarte con cada persona que te puentea.",
    fr: "Tu fonctionnes en deux ensembles stables qui ne se relient pas tout seuls. Certaines personnes ou certains lieux donnent bizarrement une impression de complétude — ils comblent l’écart un moment. Remarque l’aimant, puis décide quand même comme toi. Tu n’as pas à fusionner avec chaque personne qui te relie.",
    nl: "Je loopt in twee gestage clusters die vanzelf niet helemaal verbinden. Sommige mensen of plekken voelen vreemd compleet — zij overbruggen tijdelijk het gat. Merk de magneet op, en besluit toch als jezelf. Je hoeft niet samen te smelten met iedereen die je overbrugt.",
  },
  "Triple Split": {
    en: "You have three separate clusters that do not all link through your own channels. Varied people and places often help you finish processing. One sealed room is rarely enough. Give yourself circulation and a bit of time, then let the pieces settle.",
    de: "Du hast drei getrennte Cluster, die sich nicht alle über deine eigenen Kanäle verbinden. Verschiedene Menschen und Orte helfen dir oft, das Verarbeiten abzuschließen. Ein abgeschotteter Raum reicht selten. Gönn dir Bewegung und ein wenig Zeit, und lass die Teile dann zur Ruhe kommen.",
    es: "Tienes tres grupos separados que no se enlazan todos por tus propios canales. La variedad de personas y lugares a menudo te ayuda a terminar de procesar. Una sola sala cerrada rara vez basta. Date circulación y un poco de tiempo, y deja que las piezas se asienten.",
    fr: "Tu as trois ensembles séparés qui ne se relient pas tous par tes propres canaux. Des personnes et des lieux variés t’aident souvent à finir de traiter. Une seule pièce fermée suffit rarement. Offre-toi de la circulation et un peu de temps, puis laisse les morceaux se poser.",
    nl: "Je hebt drie aparte clusters die niet allemaal via je eigen kanalen verbinden. Verschillende mensen en plekken helpen je vaak het verwerken af te ronden. Eén afgesloten ruimte is zelden genoeg. Geef jezelf beweging en een beetje tijd, en laat de stukken dan landen.",
  },
  "Quadruple Split": {
    en: "You have four separate clusters, which is uncommon. Feeling whole often depends on environment and timing. Variety is functional, not a flaw. Measure wholeness across a day or a week rather than in one frozen moment.",
    de: "Du hast vier getrennte Cluster, was ungewöhnlich ist. Dich ganz zu fühlen hängt oft von Umgebung und Timing ab. Vielfalt ist funktional, kein Fehler. Miss Ganzheit über einen Tag oder eine Woche, nicht in einem eingefrorenen Moment.",
    es: "Tienes cuatro grupos separados, lo cual es poco frecuente. Sentirte entero suele depender del entorno y del momento. La variedad es funcional, no un defecto. Mide la integridad a lo largo de un día o una semana, no en un instante congelado.",
    fr: "Tu as quatre ensembles séparés, ce qui est peu courant. Te sentir entier dépend souvent de l’environnement et du moment. La variété est fonctionnelle, pas un défaut. Mesure l’entièreté sur une journée ou une semaine, plutôt que dans un instant figé.",
    nl: "Je hebt vier aparte clusters, wat ongewoon is. Je heel voelen hangt vaak af van omgeving en timing. Variatie is functioneel, geen fout. Meet heelheid over een dag of een week, niet in één bevroren moment.",
  },
};

/** Default 5: only for To Respond / To Respond (then inform) with Emotional (Solar Plexus) authority. */
export const SNAPSHOT_EMOTIONAL_RESPOND_CONNECTOR: ByLocale = {
  en: "A gut yes is only the first signal. Let the emotional wave settle before you lock a big call.",
  de: "Ein Ja aus dem Bauch ist nur das erste Signal. Lass die emotionale Welle sich setzen, bevor du eine große Entscheidung festmachst.",
  es: "Un sí del cuerpo es solo la primera señal. Deja que la ola emocional se asiente antes de fijar una decisión grande.",
  fr: "Un oui du corps n’est que le premier signal. Laisse la vague émotionnelle se poser avant de verrouiller un grand choix.",
  nl: "Een ja vanuit je buik is alleen het eerste signaal. Laat de emotionele golf landen voordat je een grote keuze vastzet.",
};

const RESPOND_STRATEGIES = new Set(["To Respond", "To Respond (then inform)"]);

export function needsEmotionalRespondConnector(strategy: string, authority: string): boolean {
  return RESPOND_STRATEGIES.has(strategy) && /emotional|solar plexus/i.test(authority);
}

export function snapshotStrategyCopy(strategy: string, locale: Locale): string | undefined {
  return SNAPSHOT_STRATEGY_COPY[strategy]?.[locale];
}

export function snapshotDefinitionCopy(definition: string, locale: Locale): string | undefined {
  return SNAPSHOT_DEFINITION_COPY[definition]?.[locale];
}
