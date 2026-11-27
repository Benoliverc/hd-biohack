/**
 * Snapshot-only short copy for Chart #snapshot (Baseline Snapshot clarity pass, 25 Nov 2026).
 * Locked strings from the build brief; all five locales, no English fallback.
 * Deep dive keeps STRATEGY_COPY / DEFINITION_COPY (summary + learnMore) unchanged.
 * Budget: each body <= 80 words and <= 500 characters.
 */
import type { Locale, LocaleCopy } from "@/lib/i18n/types";

export const SNAPSHOT_COPY_MAX_WORDS = 80;
export const SNAPSHOT_COPY_MAX_CHARS = 500;

type ByLocale = LocaleCopy;

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

/**
 * Other-person Snapshot copy (Snapshot panel fixes, 25 Nov 2026). Locked strings from the build brief,
 * shown when the chart belongs to someone else (same gate as the Type box `personName`).
 * `{name}` is the person's display name; English uses singular they/them, other locales stay name-forward.
 * Same 80-word / 500-character budget as the you-voice maps above.
 */
export const SNAPSHOT_STRATEGY_OTHER_COPY: Record<string, ByLocale> = {
  "To Respond": {
    en: "Something real to answer — a person, a question, or an opportunity — wants to show up before {name} starts. Their body answers with a gut yes or a no. A gut yes beats a clever plan. If it is not a clear yes, it is a no or a not yet.",
    de: "Etwas Echtes zum Antworten — eine Person, eine Frage oder eine Gelegenheit — darf erscheinen, bevor {name} anfängt. Der Körper von {name} antwortet mit einem Ja aus dem Bauch oder einem Nein. Ein Ja aus dem Bauch schlägt einen klugen Plan. Ist es kein klares Ja, ist es ein Nein oder ein noch nicht.",
    es: "Algo real a lo que responder — una persona, una pregunta o una oportunidad — conviene que aparezca antes de que {name} empiece. El cuerpo de {name} responde con un sí del cuerpo o un no. Un sí del cuerpo gana a un plan ingenioso. Si no es un sí claro, es un no o un todavía no.",
    fr: "Quelque chose de réel à quoi répondre — une personne, une question ou une opportunité — a besoin d’apparaître avant que {name} commence. Le corps de {name} répond par un oui du corps ou un non. Un oui du corps l’emporte sur un plan malin. Si ce n’est pas un oui clair, c’est un non ou un pas encore.",
    nl: "Iets echts om op te antwoorden — een persoon, een vraag of een kans — wil verschijnen voordat {name} begint. Hun lichaam antwoordt met een ja vanuit de buik of een nee. Een ja vanuit de buik wint het van een slim plan. Is het geen duidelijk ja, dan is het een nee of een nog-niet.",
  },
  "To Respond (then inform)": {
    en: "A gut yes wants to come before {name} moves. A person, a question, or an opportunity shows up, and their body answers first. After a real yes, they tell the people it will affect what they are about to do — courtesy, not permission — then go. Speed comes after that sequence, not before.",
    de: "Ein Ja aus dem Bauch darf kommen, bevor {name} loslegt. Eine Person, eine Frage oder eine Gelegenheit erscheint, und der Körper antwortet zuerst. Nach einem echten Ja sagt {name} den Betroffenen, was als Nächstes kommt — Höflichkeit, keine Erlaubnis — und dann geht es los. Tempo kommt nach dieser Reihenfolge, nicht davor.",
    es: "Un sí del cuerpo conviene que llegue antes de que {name} se mueva. Aparece una persona, una pregunta o una oportunidad, y el cuerpo de {name} responde primero. Después de un sí de verdad, {name} avisa a las personas a las que va a afectar lo que está a punto de hacer — cortesía, no permiso — y entonces sigue. La velocidad viene después de esa secuencia, no antes.",
    fr: "Un oui du corps a besoin d’arriver avant que {name} avance. Une personne, une question ou une opportunité apparaît, et le corps de {name} répond d’abord. Après un vrai oui, {name} prévient les personnes concernées de ce qui s’apprête à se faire — courtoisie, pas permission — puis avance. La vitesse vient après cette séquence, pas avant.",
    nl: "Een ja vanuit de buik wil er zijn voordat {name} beweegt. Er verschijnt een persoon, een vraag of een kans, en hun lichaam antwoordt eerst. Na een echt ja vertelt {name} de mensen die het raakt wat er staat te gebeuren — beleefdheid, geen toestemming — en gaat dan. Snelheid komt na die volgorde, niet ervoor.",
  },
  "To Inform": {
    en: "{name} is designed to start, but to tell the people it will touch before acting. Informing is courtesy, not permission. A short heads-up lowers resistance so their initiation can move. Skipping that step is when the world slams on the brakes.",
    de: "{name} ist dafür gemacht anzufangen, aber den Betroffenen vorher zu sagen, was kommt. Informieren ist Höflichkeit, keine Erlaubnis. Ein kurzer Hinweis senkt den Widerstand, damit die Initiation laufen kann. Wird dieser Schritt übersprungen, bremst die Welt abrupt.",
    es: "{name} tiene el diseño de empezar, pero de avisar a las personas a las que va a tocar antes de actuar. Informar es cortesía, no permiso. Un aviso breve baja la resistencia para que la iniciación pueda moverse. Saltar ese paso es cuando el mundo pisa el freno.",
    fr: "{name} a le design de commencer, mais de prévenir les personnes concernées avant d’agir. Informer est une courtoisie, pas une permission. Un court préavis abaisse la résistance pour que l’initiation puisse avancer. Sauter cette étape, c’est alors que le monde donne un coup de frein.",
    nl: "{name} is gemaakt om te starten, maar om de mensen die het raakt te vertellen vóór het handelen. Informeren is beleefdheid, geen toestemming. Een korte vooraankondiging verlaagt weerstand zodat hun initiatie kan bewegen. Die stap overslaan is wanneer de wereld op de rem gaat.",
  },
  "Wait for the Invitation": {
    en: "{name}'s guidance belongs where they are recognized and asked in. They are not here to chase or prove. The right invitation lands in the right room; forcing it drains them. The useful pattern is to wait to be asked, then offer what they see.",
    de: "Die Führung von {name} gehört dorthin, wo {name} erkannt und hineingebeten wird. {name} ist nicht hier, um hinterherzulaufen oder sich zu beweisen. Die richtige Einladung landet im richtigen Raum; sie zu erzwingen, zehrt aus. Das sinnvolle Muster: warten, bis man {name} fragt, und dann anbieten, was {name} sieht.",
    es: "La guía de {name} encaja donde hay reconocimiento y una invitación a entrar. {name} no está aquí para perseguir o demostrar. La invitación correcta aterriza en la sala correcta; forzarla agota a {name}. El patrón útil es esperar a que se lo pidan, y entonces ofrecer lo que {name} ve.",
    fr: "Le regard de {name} est à sa place dans les pièces où une reconnaissance et une invitation arrivent. {name} n’est pas là pour courir après ou faire ses preuves. La bonne invitation arrive dans la bonne pièce ; la forcer épuise {name}. Le schéma utile est d’attendre qu’on demande, puis d’offrir ce que {name} voit.",
    nl: "Het inzicht van {name} hoort daar waar {name} herkend en binnengevraagd wordt. {name} is er niet om achterna te jagen of iets te bewijzen. De juiste uitnodiging landt in de juiste ruimte; het forceren put {name} uit. Het nuttige patroon is wachten tot er gevraagd wordt, en dan aanbieden wat {name} ziet.",
  },
  "Wait a Lunar Cycle": {
    en: "For big choices, {name} does best sampling across about a month so clarity can settle. They take in people and places; rushing a decision often reflects the room they were just in, not them. Important calls need this time before they are locked.",
    de: "Bei großen Entscheidungen ist {name} am besten, wenn über etwa einen Monat gesampelt wird, damit Klarheit sich setzen kann. {name} nimmt Menschen und Orte auf; eine überstürzte Entscheidung spiegelt oft den Raum, in dem {name} gerade war, nicht {name} selbst. Wichtige Entscheidungen brauchen diese Zeit, bevor sie festgemacht werden.",
    es: "Para las decisiones grandes, {name} acierta más si prueba a lo largo de un mes, para que la claridad se asiente. {name} toma a las personas y los lugares; precipitarse suele reflejar la sala en la que {name} acaba de estar, no a {name}. Las llamadas importantes necesitan este tiempo antes de fijarse.",
    fr: "Pour les grands choix, {name} s’en sort mieux en échantillonnant sur environ un mois, pour que la clarté puisse se poser. {name} absorbe les personnes et les lieux ; une décision précipitée reflète souvent la pièce d’où {name} vient, pas {name}. Les appels importants ont besoin de ce temps avant d’être verrouillés.",
    nl: "Bij grote keuzes doet {name} het het best door ongeveer een maand te proeven, zodat helderheid kan landen. {name} neemt mensen en plekken in zich op; te snel beslissen weerspiegelt vaak de ruimte waar {name} net was, niet {name} zelf. Belangrijke keuzes hebben deze tijd nodig voordat ze worden vastgezet.",
  },
};

export const SNAPSHOT_DEFINITION_OTHER_COPY: Record<string, ByLocale> = {
  "None (Reflector)": {
    en: "Nothing in {name} stays always-on in the same way. They sample and reflect the people and places around them, so environment matters more than a fixed inner weather. Rooms that feel like them help; that openness is not a missing piece.",
    de: "In {name} bleibt nichts auf dieselbe Weise immer an. {name} nimmt Menschen und Orte auf und spiegelt sie, darum zählt die Umgebung mehr als ein festes inneres Wetter. Räume, die sich nach {name} anfühlen, helfen; diese Offenheit ist kein fehlendes Stück.",
    es: "En {name} nada se queda siempre encendido de la misma manera. {name} prueba y refleja a las personas y los lugares de alrededor, así que el entorno importa más que un clima interior fijo. Las salas que se sienten como {name} ayudan; esa apertura no es una pieza que falte.",
    fr: "Rien chez {name} ne reste toujours allumé de la même façon. {name} échantillonne et reflète les personnes et les lieux autour, donc l’environnement compte plus qu’un climat intérieur fixe. Les pièces qui ressemblent à {name} aident ; cette ouverture n’est pas une pièce manquante.",
    nl: "In {name} blijft niets op dezelfde manier altijd aan. {name} proeft en weerspiegelt de mensen en plekken eromheen, dus omgeving telt meer dan een vast innerlijk weer. Ruimtes die voelen als {name} helpen; die openheid is geen ontbrekend stuk.",
  },
  "Single": {
    en: "{name}'s always-on themes link as one stream, so they can often think and act without waiting for someone to bridge a gap. That can feel self-contained. Other people still matter — just not as wiring they lack.",
    de: "Die immer-an Themen von {name} sind als ein Strom verbunden, darum kann {name} oft denken und handeln, ohne auf eine Brücke von außen zu warten. Das kann in sich geschlossen wirken. Andere Menschen zählen trotzdem — nur nicht als fehlende Verdrahtung.",
    es: "Los temas siempre encendidos de {name} se enlazan en un solo flujo, así que {name} puede pensar y actuar a menudo sin esperar a que alguien cubra un hueco. Eso puede sentirse autónomo. Las otras personas siguen importando — solo que no como un cableado que a {name} le falte.",
    fr: "Les thèmes toujours allumés de {name} forment un seul flux, donc {name} peut souvent penser et agir sans attendre que quelqu’un comble un écart. Cela peut sembler autonome. Les autres personnes comptent encore — juste pas comme un câblage qui manquerait à {name}.",
    nl: "De altijd-aan thema's van {name} hangen als één stroom samen, dus {name} kan vaak denken en handelen zonder te wachten tot iemand een gat overbrugt. Dat kan op zichzelf staand voelen. Andere mensen blijven ertoe doen — alleen niet als bedrading die {name} zou missen.",
  },
  "Split": {
    en: "{name} runs in two steady clusters that do not fully connect on their own. Some people or places feel oddly completing — they temporarily bridge the gap. Notice the magnet, then still decide as {name}. They do not have to fuse with every person who bridges them.",
    de: "{name} läuft in zwei stetigen Clustern, die sich nicht von allein vollständig verbinden. Manche Menschen oder Orte fühlen sich merkwürdig vervollständigend an — sie überbrücken die Lücke vorübergehend. Den Magneten bemerken, und trotzdem als {name} entscheiden. {name} muss nicht mit jeder Person verschmelzen, die eine Brücke baut.",
    es: "{name} funciona en dos grupos estables que no se conectan del todo por sí solos. Algunas personas o lugares se sienten extrañamente completadores — cubren el hueco un tiempo. Conviene notar el imán, y aun así decidir como {name}. {name} no tiene que fusionarse con cada persona que le hace de puente.",
    fr: "{name} fonctionne en deux grappes stables qui ne se relient pas complètement toutes seules. Certaines personnes ou certains lieux semblent étrangement compléter — elles comblent l’écart un moment. Repérer l’aimant, puis quand même décider en tant que {name}. {name} n’a pas à fusionner avec chaque personne qui fait le pont.",
    nl: "{name} loopt in twee vaste clusters die niet vanzelf helemaal verbinden. Sommige mensen of plekken voelen vreemd compleet makend — ze overbruggen het gat tijdelijk. Merk de magneet op, en besluit toch als {name}. {name} hoeft niet samen te smelten met iedereen die een brug slaat.",
  },
  "Triple Split": {
    en: "{name} has three separate clusters that do not all link through their own channels. Varied people and places often help them finish processing. One sealed room is rarely enough. Circulation and a bit of time help the pieces settle.",
    de: "{name} hat drei getrennte Cluster, die nicht alle über die eigenen Kanäle verbunden sind. Verschiedene Menschen und Orte helfen oft, die Verarbeitung abzuschließen. Ein einziger geschlossener Raum reicht selten. Bewegung und etwas Zeit helfen den Teilen, sich zu setzen.",
    es: "{name} tiene tres grupos separados que no se enlazan todos por sus propios canales. Personas y lugares variados suelen ayudar a {name} a terminar de procesar. Una sola sala cerrada rara vez basta. Circulación y un poco de tiempo ayudan a que las piezas se asienten.",
    fr: "{name} a trois grappes séparées qui ne se relient pas toutes par ses propres canaux. Des personnes et des lieux variés aident souvent {name} à finir de traiter. Une seule pièce fermée suffit rarement. De la circulation et un peu de temps aident les morceaux à se poser.",
    nl: "{name} heeft drie aparte clusters die niet allemaal via de eigen kanalen verbinden. Wisselende mensen en plekken helpen {name} vaak het verwerken af te ronden. Eén afgesloten kamer is zelden genoeg. Circulatie en een beetje tijd helpen de stukken te landen.",
  },
  "Quadruple Split": {
    en: "{name} has four separate clusters, which is uncommon. Feeling whole often depends on environment and timing. Variety is functional, not a flaw. Wholeness measures better across a day or a week than in one frozen moment.",
    de: "{name} hat vier getrennte Cluster, was ungewöhnlich ist. Sich ganz zu fühlen hängt oft von Umgebung und Timing ab. Vielfalt ist funktional, kein Fehler. Ganzheit misst man besser über einen Tag oder eine Woche als in einem eingefrorenen Moment.",
    es: "{name} tiene cuatro grupos separados, lo cual es poco frecuente. Sentirse completo suele depender del entorno y del momento. La variedad es funcional, no un defecto. La integridad se mide mejor a lo largo de un día o una semana que en un instante congelado.",
    fr: "{name} a quatre grappes séparées, ce qui est peu courant. Se sentir entier dépend souvent de l’environnement et du timing. La variété est fonctionnelle, pas un défaut. L’unité se mesure mieux sur un jour ou une semaine que dans un instant figé.",
    nl: "{name} heeft vier aparte clusters, wat ongewoon is. Heel voelen hangt vaak af van omgeving en timing. Variatie is functioneel, geen fout. Heelheid meet je beter over een dag of een week dan in één bevroren moment.",
  },
};

/** Other-person Emotional + respond connector (same gate as the you-voice connector). */
export const SNAPSHOT_EMOTIONAL_RESPOND_CONNECTOR_OTHER: ByLocale = {
  en: "A gut yes is only the first signal. The emotional wave needs to settle before a big call is locked.",
  de: "Ein Ja aus dem Bauch ist nur das erste Signal. Die emotionale Welle muss sich setzen, bevor eine große Entscheidung festgemacht wird.",
  es: "Un sí del cuerpo es solo la primera señal. La ola emocional necesita asentarse antes de fijar una decisión grande.",
  fr: "Un oui du corps n’est que le premier signal. La vague émotionnelle a besoin de se poser avant qu’un grand choix soit verrouillé.",
  nl: "Een ja vanuit de buik is alleen het eerste signaal. De emotionele golf moet landen voordat een grote keuze wordt vastgezet.",
};

/** Fill `{name}` in an other-person template. */
export function withPersonName(template: string, name: string): string {
  return template.replaceAll("{name}", name);
}

export function snapshotStrategyOtherCopy(strategy: string, locale: Locale, name: string): string | undefined {
  const template = SNAPSHOT_STRATEGY_OTHER_COPY[strategy]?.[locale];
  return template === undefined ? undefined : withPersonName(template, name);
}

export function snapshotDefinitionOtherCopy(definition: string, locale: Locale, name: string): string | undefined {
  const template = SNAPSHOT_DEFINITION_OTHER_COPY[definition]?.[locale];
  return template === undefined ? undefined : withPersonName(template, name);
}
