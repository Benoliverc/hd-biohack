import type { CenterKey } from "../hdCopy";
import { CHANNEL_COPY } from "./hdChannelCopy.nl";
import { PROFILE_COMBO_ESSAYS } from "./hdProfileCombos.nl";

export const TYPE_COPY: Record<string, { summary: string; learnMore: string }> =
{
  Generator: {
    summary: "Je bouwt het best wanneer iets echts een ja vanuit je buik aansteekt. (Type: Generator)",
    learnMore: `Je hebt een gestage werkenergie die aangaat wanneer het leven je iets geeft om op te antwoorden — in Human Design heet die motor de Sacral. Hij zoemt wanneer je goed betrokken bent, en wordt dof wanneer dat niet zo is. Je bent hier om te bouwen en te antwoorden op wat het leven voor je neerzet, niet om de volgende stap in je hoofd te bedenken en die de wereld in te duwen.

Je Strategy is wachten om te antwoorden. Er verschijnt een persoon, een vraag, een geluid of een kans, en je lichaam antwoordt met een ja, een nee, of een nog-niet, vaak voordat je kunt uitleggen waarom. Die reactie vanuit je buik is betrouwbaarder dan een slim plan.

Voldoening is het gevoel dat je op koers bent — het werk of de dag steekt je vanbinnen aan. Frustratie is het waarschuwingslampje: je begon vanuit druk, zei ja om iemand te plezieren, of bleef in iets waar je Sacral nooit mee had ingestemd. Geef je buik iets echts om op te antwoorden, en volg wat je écht voelt, niet het verhaal over wat je zou moeten willen.`,
  },
  "Manifesting Generator": {
    summary: "Je beweegt snel zodra iets een echt ja is — en je vertelt het de mensen voordat je van koers verandert. (Type: Manifesting Generator)",
    learnMore: `Je hebt een gestage werkenergie die aangaat wanneer het leven je iets geeft om op te antwoorden — in Human Design heet die motor de Sacral — en een pad naar je Throat, zodat je, zodra iets een echt ja is, snel kunt bewegen, stappen kunt overslaan, en meer dan één interesse tegelijk kunt vasthouden. Die snelheid is geen vrijbrief om vanuit je hoofd te lanceren. Je antwoordt nog steeds eerst — hetzelfde ja of nee vanuit je buik als een Generator — en daarna informeer je de mensen die het raakt voordat je van koers verandert. Informeren is geen toestemming vragen; het is wrijving verminderen, zodat je vaart niemand verrast.

Voldoening gemengd met een gevoel van succes verschijnt wanneer de Sacral aanstaat en anderen niet in het duister worden gelaten. Frustratie gemengd met woede verschijnt wanneer je het antwoorden overslaat, te vroeg springt, of je opgesloten voelt in één lineair pad. Meerdere passies zijn niet wispelturig wanneer elke stap een echt ja was; het wordt uitputtend wanneer je elk idee achternazit om de pauze te vermijden die je zou vertellen welke er écht van jou is.`,
  },
  Manifestor: {
    summary: "Jij bent er om te beginnen — en om de mensen die het raakt te vertellen voordat je beweegt. (Type: Manifestor)",
    learnMore: `Jij bent er om te beginnen — om een innerlijke aandrang te voelen en te starten zonder te wachten tot de wereld het eerst vraagt. In Human Design geeft een motor die met je Throat is verbonden je impact: mensen voelen je aankomen. Die impact is waarom informeren ertoe doet. Vertel, voordat je handelt, de mensen die het raakt wat je op het punt staat te doen. Informeren is geen toestemming vragen en geen stemming in een commissie; het is beleefdheid die de weerstand verlaagt, zodat je aandrang kan bewegen.

Vrede is het kenmerk van een Manifestor die vrij is om te beginnen en die zich herinnert te informeren. Woede stijgt wanneer anderen je tempo proberen te beheersen, of wanneer je in actie verdwijnt en iedereen anders moet gokken. Je bent niet hier om op een Sacral-antwoord te wachten zoals Generators. Bescherm genoeg stilte om de aandrang te horen, beweeg dan — en laat de juiste mensen het weten, zodat je onafhankelijkheid geen onnodige gevechten hoeft te voeren.`,
  },
  Projector: {
    summary: "Je ziet systemen helder — deel die blik waar je wordt uitgenodigd. (Type: Projector)",
    learnMore: `Je ziet mensen en systemen met een bijzondere helderheid, en je bent hier om te begeleiden, niet om je kapot te werken. Je hebt geen gestage Sacral-motor, dus je bent niet gebouwd voor dezelfde hele-dag-doen-energie als Generators. Je energie vult zich door herkenning — gezien worden om wat je écht opmerkt — en door échte rust.

Je Strategy is wachten op de uitnodiging, vooral voor werk, liefde, en elk groot delen van je advies. Een uitnodiging is iemand die jouw kijken heeft herkend en je naar binnen heeft gevraagd. Het is niet blijven kloppen tot de deur opengaat, en het is geen diagnose aanbieden die niemand heeft gevraagd. Herkenning van je blik is brandstof; zonder die herkenning put zelfs briljant advies je uit.

Succes is het kenmerk: de juiste mensen trekken je de juiste ruimtes in en je begeleiding landt. Bitterheid verschijnt wanneer je achtervolgt, jezelf bewijst, of advies geeft dat nooit is gevraagd. Die bitterheid is nuttige informatie, geen karakterfout — ze betekent meestal dat je energie hebt uitgegeven zonder herkenning. Bescherm je rust, deel waar je bent uitgenodigd, en laat "nog niet" een volledig antwoord zijn.`,
  },
  Reflector: {
    summary: "Je proeft mensen en plekken — grote helderheid wil vaak een volle maancyclus. (Type: Reflector)",
    learnMore: `Je hebt geen gedefinieerde centers, wat betekent dat je de mensen en plekken om je heen proeft en weerspiegelt, in plaats van één vast binnenweer te draaien. Dat is een gave van onderscheidingsvermogen: je voelt de gezondheid van een ruimte, een stad of een relatie eerlijker dan de meeste mensen. Daarom doet omgeving er zoveel toe. De juiste gemeenschap laat je verrassend als jezelf voelen; de verkeerde laat je ieders stemming meedragen.

Voor grote beslissingen, wacht ongeveer een maancyclus — ruwweg achtentwintig dagen — zodat je de keuze vanuit veel innerlijk weer kunt proeven, in plaats van vast te zetten op één geladen dag. Je bent niet hier om "besluiteloos" te zijn; je bent hier om grondig te zijn. Helderheid die een volle cyclus overleeft, is van jou.

Verrassing en vreugde zijn het kenmerk van een Reflector op een gezonde plek. Teleurstelling komt wanneer je te snel besluit of ergens blijft dat je niet terugliefheeft. Behandel omgeving als de belangrijkste hefboom, en let op wie je wordt naast verschillende mensen, in plaats van een persoonlijkheid af te dwingen die nooit bedoeld was om in elke ruimte hetzelfde te blijven.`,
  },
};

export const STRATEGY_COPY: Record<string, { summary: string; learnMore: string }> =
{
  "To Respond": {
    summary: "Wacht op iets echts om op te antwoorden — een ja vanuit je buik wint het van een slim plan. (Strategy: To Respond)",
    learnMore: `Je bent ontworpen om in beweging te komen nadat het leven je iets geeft om op te antwoorden — een persoon, een vraag, een uitnodiging, een geluid, of een kans die buiten je hoofd verschijnt. Je Sacral is een gestage reactie vanuit je buik: hij licht op bij een ja, wordt dof bij een nee, of blijft onduidelijk wanneer de timing nog niet is. Die reactie is sneller en eerlijker dan een slim plan. Wachten om te antwoorden is geen passiviteit. Het is de wereld het gesprek laten beginnen, zodat je energie iets echts kan ontmoeten.

In de praktijk ziet dit eruit als pauzeren voordat je jezelf aanbiedt, solliciteert, of de volgende stap verzint. Geef je lichaam iets concreets om op te reageren. Een ja voelt vaak als warmte, uitzetting, of een onmiskenbaar mmm-ja. Een nee voelt vlak, zwaar, of alsof je jezelf erin zou moeten praten. Als het geen duidelijk ja is, behandel het als een nee of een nog-niet, niet als een puzzel die je hoofd moet oplossen.

Wanneer je correct antwoordt, hebben werk en relaties meestal meer flow en minder geploeter — dat is voldoening. Wanneer je vanuit druk begint, anderen wilt behagen, of een verhaal volgt over wat je zou moeten willen, bouwt frustratie op. Gebruik frustratie als informatie: je zei waarschijnlijk ja zonder een sacral ja, of je duwt een plan dat niemand écht voor je heeft neergelegd.`,
  },
  "To Respond (then inform)": {
    summary: "Voel eerst het ja vanuit je buik, en vertel het daarna de mensen die het raakt voordat je beweegt. (Strategy: To Respond, then inform)",
    learnMore: `Je wacht nog steeds om te antwoorden voordat je beweegt. Er verschijnt een persoon, een vraag of een kans, en je Sacral antwoordt met een ja, een nee, of een nog-niet. Die check vanuit je buik is dezelfde als die van een Generator — snelheid is geen vrijbrief om vanuit je hoofd te lanceren. Na een echt ja, vertel de mensen die het raakt wat je op het punt staat te doen, of dat je van koers verandert. Informeren is geen toestemming vragen. Het is wrijving verminderen, zodat je snelle, stappen-overslaande energie anderen niet laat rennen.

Van dag tot dag is de volgorde: wacht op iets echts, voel het lichaam antwoorden, en zeg de volgende stap voordat je erin verdwijnt. Een korte "Ik ga dit doen en dat laten vallen" voorkomt vaak de weerstand die voelt alsof de wereld op de rem trapt. Als de Sacral stil is, vul de stilte dan niet met een plan alleen omdat je het snel kunt uitvoeren.

Wanneer deze strategy werkt, kun je in je natuurlijke tempo bewegen zonder voortdurend verrassing te moeten repareren. Wanneer je het antwoorden overslaat of vergeet te informeren, volgen meestal frustratie en een vlaag woede — omdat je je zonder ja hebt vastgelegd, of omdat mensen een verandering proberen te beheersen waar ze nooit van hebben gehoord. Vertraag alleen lang genoeg om te antwoorden en te informeren; laat jezelf daarna snel gaan.`,
  },
  "To Inform": {
    summary: "Vertel, voordat je begint, de mensen die het raakt — beleefdheid, geen toestemming. (Strategy: To Inform)",
    learnMore: `Je bent ontworpen om te beginnen vanuit een innerlijke aandrang, niet om te wachten tot de wereld het eerst vraagt. De strategy die die start laat werken, is informeren: vertel de betrokken mensen, voordat je handelt, wat je op het punt staat te doen. Informeren is geen toestemming vragen en je aandrang niet ter stemming brengen. Het is beleefdheid die de weerstand verlaagt, omdat mensen de impact van een Manifestor voelen aankomen en ze zich aanspannen wanneer ze moeten gokken.

In de praktijk kies je de mensen die er écht door worden geraakt — een partner, een team, een huishouden — en geef je hen een duidelijke vooraankondiging. Je hebt geen lange rechtvaardiging nodig. "Ik begin hiermee" of "Ik heb de middag ononderbroken nodig" is genoeg. Beweeg dan. Wachten tot iedereen zich prettig voelt, laat de aandrang vaak verhongeren; zonder een woord verdwijnen schept vaak precies de controle en de tegendruk die je probeerde te vermijden.

Vrede is hoe het voelt wanneer je vrij bent om te beginnen en je je herinnerde te informeren. Woede stijgt wanneer anderen je tempo proberen te sturen, of wanneer je in actie verdwijnt en iedereen anders de verrassing moet opruimen. Bescherm genoeg stilte om de aandrang te horen, informeer de juiste mensen, en ga — zodat je onafhankelijkheid geen onnodige gevechten hoeft te voeren.`,
  },
  "Wait for the Invitation": {
    summary: "Deel je begeleiding waar je wordt herkend en naar binnen wordt gevraagd. (Strategy: Wait for the Invitation)",
    learnMore: `Je juiste ingang is wachten tot je wordt herkend en uitgenodigd — vooral voor werk, liefde, en elk groot delen van je advies. Een uitnodiging is iemand die heeft gezien wat jij écht opmerkt en je naar binnen heeft gevraagd. Het is niet blijven kloppen tot de deur opengaat, en het is geen diagnose aanbieden die niemand heeft gevraagd. Herkenning van je blik is brandstof; zonder die herkenning put zelfs briljante begeleiding je uit.

In het dagelijks leven kan dit trager lijken dan de cultuur om je heen. Je kunt nog steeds leven, leren en zichtbaar zijn; de strategy gaat erover de grote deuren niet open te forceren. Deel je blik waar erom is gevraagd. Laat kleinere herkenningen zich opstapelen. Als je jezelf betrapt op bewijzen hoe nuttig je bent, is dat meestal je hoofd dat een uitnodiging probeert te maken die nog niet is gekomen.

Succes is het gevoel dat de juiste mensen je de juiste ruimtes in trokken en je begeleiding landde. Bitterheid verschijnt wanneer je achtervolgt, te veel geeft, of adviseert zonder dat het is gevraagd. Die bitterheid is nuttige informatie, geen karakterfout — ze betekent meestal dat je energie hebt uitgegeven zonder herkenning. Bescherm je rust, wacht op de vraag, en laat "nog niet" een volledig antwoord zijn.`,
  },
  "Wait a Lunar Cycle": {
    summary: "Proef grote keuzes ongeveer een maand, zodat helderheid kan landen. (Strategy: Wait a Lunar Cycle)",
    learnMore: `Voor grote beslissingen is je strategy om een volle maancyclus te proeven — ongeveer achtentwintig dagen — in plaats van vast te zetten op één geladen dag. Je hebt geen gedefinieerde centers, dus je neemt de mensen en plekken om je heen in. Eén gesprek of één stemming kan voelen als zekerheid, terwijl het vooral de ruimte is die praat. Tijd laat je dezelfde keuze vanuit veel innerlijk weer voelen, tot er iets blijvends overblijft.

Dit betekent niet dat je geen lunch kunt kiezen of een eenvoudige mail kunt beantwoorden. Het betekent dat de grote toezeggingen — waar je woont, met wie je een band aangaat, een baan, een verhuizing — een langere proef willen. Praat met verschillende mensen, bezoek de plek meer dan eens, en let op wie je wordt naast de optie, in plaats van een persoonlijkheid af te dwingen die in elke ruimte hetzelfde blijft. Je bent niet besluiteloos; je bent grondig.

Verrassing en vreugde verschijnen wanneer een keuze na een volle cyclus nog steeds van jou voelt, vooral in een omgeving die je terugliefheeft. Teleurstelling komt wanneer je te snel besluit of ergens blijft dat alleen op één dag goed voelde. Behandel tijd en omgeving als de belangrijkste hefbomen, en vertrouw de helderheid die de maand overleeft.`,
  },
};

export const AUTHORITY_COPY: Record<string, { summary: string; learnMore: string }> =
{
  "Emotional (Solar Plexus)": {
    summary: "Heldere antwoorden komen nadat gevoelens zijn bewogen — slaap een nacht over grote keuzes. (Authority: Emotional)",
    learnMore: `Je heldere antwoorden komen nadat gevoelens zijn bewogen, niet op het hoogtepunt of het dieptepunt. In Human Design is dit Emotional authority (Solar Plexus). Slaap een nacht over grote keuzes. Gevoelens bewegen, in plaats van binnen te komen als één blijvend vonnis. Een hoogtepunt kan bijna alles laten lijken op een ja voor altijd. Een dieptepunt kan iets goeds onmogelijk laten lijken. Helderheid komt nadat je meer dan één punt op de golf hebt gevoeld — vaak na een nacht slapen, en soms na een paar dagen.

In de praktijk teken, zeg of verklaar je je definitieve antwoord niet op de top of in het dal. Je kunt het eerste gevoel opmerken en toch wachten. "Ik moet hier even mee zitten" is een volledig antwoord. Praat als dat helpt om de golf te voelen, maar laat een overtuigend gesprek niet de beslissing worden. Je hoofd zal proberen één stemming tot een verhaal te bevriezen; jouw werk is het weer te laten veranderen en te zien wat blijft.

Wanneer je de golf eert, voelen beslissingen meestal gesetteld eerder dan dramatisch — je weet het gewoon, zonder dezelfde hitte. Wanneer je besluit in een piek of een val, volgen meestal spijt en twijfel, niet omdat je wispelturig bent, maar omdat je een weerbericht als klimaat hebt behandeld. Geef belangrijke keuzes tijd, en vertrouw het antwoord dat nog waar is nadat de golf is bewogen.`,
  },
  Sacral: {
    summary: "Vertrouw het ja-of-nee vanuit je buik in het nu — is het niet duidelijk, dan is het een nee of nog-niet. (Authority: Sacral)",
    learnMore: `Je authority is sacral: in het nu antwoordt je lichaam visceraal met ja of nee — vaak een geluid, een trek naar iets toe, of een vlakheid die je makkelijk mist als je druk bezig bent met uitleggen. Dit is geen vijfjarenplan. Het is een antwoord op wat er nú voor je ligt. Als het geen duidelijk ja is, is het een nee, of een nog-niet. Een misschien dat je moet rechtvaardigen, is meestal je hoofd dat de buik probeert te overrulen.

In de praktijk stel je vragen die het lichaam kan beantwoorden, geen essays. "Wil ik dit?" "Is dit een ja voor dinsdag?" Luister naar uitzetting, levendigheid, of een mmm-ja versus strakheid, dofheid, of het gevoel dat je jezelf erin moet praten. Andere mensen kunnen opties voorleggen; ze kunnen je Sacral niet voor je voelen. Als je tijd nodig hebt, komt dat misschien omdat er nog niets concreets is om op te antwoorden — vraag een duidelijker aanbod, in plaats van een mentale beslissing te forceren.

Wanneer je je buik volgt, blijft energie meestal beschikbaar voor waar je ja tegen zei. Wanneer je het overrult om beleefd, indrukwekkend of trouw aan een oud plan te zijn, bouwt frustratie op en sleept het lichaam vaak. Vertrouw de reactie in het moment, ook als je die nog niet kunt uitleggen, en laat de uitleg ná het ja of nee komen, niet ervoor.`,
  },
  Splenic: {
    summary: "Een stil instinct over veiligheid en timing in het moment — makkelijk voor je hoofd om plat te praten. (Authority: Splenic)",
    learnMore: `Je authority is splenic: een stil, instinctief weten in het moment over gezondheid, veiligheid en timing. De Spleen spreekt één keer, zacht, en discussieert niet. Het kan voelen als een plotseling "dit is oké" of "ga nu weg", zonder een toespraak erbij. Je hoofd is veel luider, dus het is makkelijk om jezelf een paar seconden later uit die tik te praten en dat redeneren vervolgens wijsheid te noemen.

In de praktijk merkt je de eerste flikkering op — een gevoel van welzijn, een trekking van voorzichtigheid, het gevoel dat de timing klopt of niet — en geef je die meer gewicht dan het verhaal dat volgt. Splenic tikken gaan over het nu, niet over een dossier bewijzen voor volgende maand. Je krijgt misschien geen tweede waarschuwing in dezelfde woorden. Achteraf opschrijven kan je helpen je eigen smaak van instinct te leren, maar de beslissing zelf gebeurt in het moment, niet in een spreadsheet.

Wanneer je het vertrouwt, voelt het leven vaak eenvoudiger en veiliger, ook als je niet elke keuze aan anderen kunt uitleggen. Wanneer je het overrult, zeg je later misschien "ik wist het" — die zin is meestal de spleen die je negeerde. Verwar angstspiralen of de angst van anderen niet met een echte splenic tik; de echte is kort, stil, en specifiek voor dit moment.`,
  },
  "Ego / Heart": {
    summary: "Besluit vanuit wat je eerlijk wilt en kunt blijven beloven. (Authority: Ego / Heart)",
    learnMore: `Je authority is ego, of heart: je besluit via wilskracht en eerlijke toewijding — wat je duurzaam kunt beloven en écht kunt dragen. Dit gaat er niet over te bewijzen dat je sterk genoeg bent om alles te doen. Het gaat erom of je hart écht in de belofte zit, en of je de wil hebt om het vol te houden zonder jezelf in de steek te laten.

In de praktijk vraag je "Kan ik me hieraan verbinden?" en "Respecteer ik mezelf nog als ik deze belofte houd?" in plaats van "Zou dit indruk maken?" Een juist ja heeft de kwaliteit van "ik wil dit" — de bereidheid om er je naam onder te zetten. Een nee kan even schoon zijn: je gaat je wil niet weggeven alleen om betrouwbaar te lijken. Minder, terechtere toezeggingen werken meestal beter dan verplichtingen stapelen die je vervolgens door moet bijten.

Wanneer deze authority wordt geëerd, betekent je woord iets voor jou en voor anderen, en voelt inspanning als gekozen in plaats van afgedwongen. Wanneer je ja zegt om je waarde te bewijzen, of nee uit angst om egoïstisch gezien te worden, wordt het hart moe en volgt wrok. Besluit vanuit wat je eerlijk wilt, en houd die beloften — dat is de authority die werkt, niet de omvang van de werkdruk.`,
  },
  "Self-Projected": {
    summary: "Praat het uit — je hoort je richting in je eigen stem. (Authority: Self-Projected)",
    learnMore: `Je authority is self-projected: je hoort je richting door haar uit te spreken. Helderheid leeft in je stem en je identiteit — in jezelf horen praten over de keuze — niet in stille analyse van elke hoek. De juiste luisteraars en de juiste omgeving doen ertoe. Je zoekt er niet naar dat zij voor je beslissen; je zoekt een ruimte waarin je eigen woorden je kunnen laten zien wie je bent in relatie tot de optie.

In de praktijk praat je het uit met mensen die kunnen luisteren zonder meteen te fiksen of je te ronselen. Let op wat je jezelf hoort zeggen, en hoe je toon verandert wanneer je het ene pad beschrijft versus het andere. Een echte richting klinkt vaak alsof je jezelf herkent: de woorden hebben leven. Als je stilvalt, overstemd wordt, of het antwoord gaat opvoeren waarvan je denkt dat zij het willen, verander dan van ruimte en spreek opnieuw.

Wanneer dit werkt, verlaat je het gesprek met meer weten dan toen je binnenkwam, zelfs als de ander je amper adviseerde. Wanneer je alleen in je hoofd besluit, of in een ruimte die vervormt wie je bent, kun je je verdwaald voelen of alsof je met andermans identiteit hebt ingestemd. Geef jezelf stemmen en plekken die je jou laten horen, en volg dan wat je jezelf hoorde zeggen.`,
  },
  Lunar: {
    summary: "Geef grote keuzes ongeveer een maand om te proeven voordat je ze vastzet. (Authority: Lunar)",
    learnMore: `Je authority is lunar, wat hoort bij een Reflector zijn: grote keuzes hebben een volle maancyclus van proeven nodig voordat je ze vastzet. Omdat je geen gedefinieerde centers hebt, kan elke dag de keuze anders kleuren. Eén gesprek kan voelen als lotsbestemming; een week later voelt dezelfde optie leeg. Tijd is hier geen uitstel — het is de manier waarop je helderheid wordt opgebouwd.

In de praktijk neem je grote beslissingen over de maand heen. Bezoek de plek meer dan eens, spreek met verschillende mensen, en schrijf op hoe de keuze op meerdere dagen voelt, in plaats van één hoogtepunt of dieptepunt te vertrouwen. Kleinere dagelijkse keuzes hebben niet allemaal achtentwintig dagen nodig; bewaar de lange proef voor dingen die je omgeving, werk of relaties veranderen. Je bent niet besluiteloos; je bent ontworpen om grondig te zijn.

Verrassing en vreugde zijn tekenen dat je lang genoeg hebt gewacht op een plek die bij je past. Teleurstelling betekent vaak dat je een tijdelijke weerspiegeling tot een blijvend ja hebt bevroren, of dat je ergens bleef dat nooit tot "dit ben ik" is gaan voelen. Laat de cyclus afronden, en kies dan wat nog steeds waar is.`,
  },
  "Mental / Environmental (Outer Authority)": {
    summary: "Gebruik vertrouwde mensen en gezonde ruimtes — het hoofd weerspiegelt; het baas niet in z’n eentje. (Authority: Mental / Environmental)",
    learnMore: `Je hebt geen innerlijke motor-authority die beslissingen neemt vanuit een gestage emotionele golf, een sacral antwoord, de spleen, of hartswil. Je hoofd is uitstekend in weerspiegelen, vergelijken en dingen uitspreken — en het is niet bedoeld om in z’n eentje de baas te zijn. Helderheid komt uit gezonde omgevingen en vertrouwde klankborden: de juiste ruimtes en de juiste mensen helpen je zien, terwijl de verkeerde je mentaal laten tollen.

In de praktijk zet je een grote keuze niet vast in isolatie of in een stressvolle ruimte. Neem de vraag mee een stuk wandelen, zit bij mensen die goed luisteren, en let op hoe dezelfde optie in verschillende settings voelt. Je zoekt wat helder wordt wanneer de omgeving steunend is, niet naar een luider argument in je hoofd. Andere mensen zijn spiegels en klankborden; ze moeten geen commissie worden die voor je besluit.

Wanneer dit werkt, voelen beslissingen stiller en vanzelfsprekender na goed gezelschap en een goede plek — alsof het antwoord zichzelf ordende. Wanneer je onder druk een eenzame mentaal vonnis forceert, kaatst twijfel meestal meteen terug. Verander van ruimte, praat het uit, en laat het hoofd doen wat het het beste doet: weerspiegelen, niet commanderen.`,
  },
};

export const DEFINITION_COPY: Record<string, { summary: string; learnMore: string }> =
{
  "None (Reflector)": {
    summary: "Niets blijft vanbinnen altijd aan — je proeft en weerspiegelt de ruimte. (Definition: None)",
    learnMore: `Je hebt geen gestage definition — geen centers die altijd op dezelfde manier "aan" staan. Dat betekent dat je de mensen, plekken en stemmingen om je heen proeft en weerspiegelt, in plaats van één vast binnenweer te draaien. Dit is een gave van onderscheidingsvermogen: je voelt de gezondheid van een ruimte eerlijker dan de meeste mensen. Daarom is omgeving voor jou geen bijzaak; het is de hoofdvoorwaarde voor hoe je jezelf voelt.

In het dagelijks leven merk je misschien dat je naast verschillende mensen een iets ander mens wordt, en dat is niet nep. De juiste gemeenschap laat je verrassend als jezelf voelen. De verkeerde laat je ieders weer meedragen, waarna je je afvraagt waarom je geen stabiele persoonlijkheid kunt vasthouden. Je lichaam naar een betere plek brengen helpt vaak meer dan proberen jezelf naar een vastere identiteit te denken.

Omdat er vanbinnen niets blijvend is vastgehaakt, ben je ontworpen om het leven in cycli te proeven, niet om één gestage output af te dwingen. Behandel die openheid als gevoeligheid met een doel, niet als een ontbrekend stuk. Kies ruimtes die je terugliefhebben, en geef jezelf tijd om op te merken wie je bent ná het proeven, in plaats van een definition te eisen die je nooit bedoeld was te hebben.`,
  },
  Single: {
    summary: "Je altijd-aan thema’s lopen als één stroom — je kunt vaak verwerken zonder op een brug te wachten. (Definition: Single)",
    learnMore: `Je altijd-aan thema’s lopen als één stroom, zodat wat je denkt, zegt en doet meer met elkaar is verbonden dan bij een split definition. Dat kan gestaag en op zichzelf staand voelen: je hebt meestal geen ander mens nodig om twee aparte delen van je te "overbruggen" voordat je iets helemaal kunt verwerken.

In de praktijk merk je misschien dat je dingen op je eigen tijdlijn tot je kunt nemen, en dat je chart een soort innerlijke volledigheid heeft. Andere mensen doen er nog steeds toe — voor relatie, samenwerking en perspectief — maar zij maken meestal geen gat dicht tussen twee losse gebieden van je design. De gave is samenhang. De schaduw is zó op jezelf gericht raken dat je vergeet hoeveel je nog binnenkrijgt via open centers.

Wanneer single definition werkt, voel je je vanbinnen als één persoon: het proces begint en kan eindigen zonder op een ontbrekende schakel te wachten. Als je vastzit, gaat het vaker over omgeving, type of authority dan over iemand nodig hebben om je te overbruggen. Vertrouw de eengemaakte stroom, en gebruik andere mensen voor verbinding, niet als bedrading die je mist.`,
  },
  Split: {
    summary: "Je loopt in twee gestage clusters die vanzelf niet helemaal verbinden. Sommige mensen voelen vreemd compleet — zij overbruggen tijdelijk het gat. (Definition: Split)",
    learnMore: `Je loopt in twee gestage clusters van altijd-aan thema’s die niet via je eigen kanalen helemaal verbinden. Energie stroomt niet vanzelf van het ene deel van je naar het andere. De ruimte ertussen is de split. Bridging gates — activaties die jij niet hebt, en die andere mensen of transits kunnen brengen — voelen vaak magnetisch, omdat ze de twee delen tijdelijk aan elkaar haken.

In het dagelijks leven merk je misschien dat bepaalde mensen je vreemd compleet, verwoord of in staat laten voelen om iets te verwerken dat vastzat. Die chemie is vaak de brug, geen bewijs dat zij je lotsbestemming zijn. Het kan prachtig zijn, en het kan ook afhankelijkheid scheppen als je je gevoel van heelheid uitbesteedt aan wie toevallig het gat vult. Let op wie of wat je overbrugt: een persoon, een plek, een gesprek, zelfs een beetje tijd alleen na stimulatie.

De gave van een split is perspectief: je ziet meer dan één manier van zijn in jezelf, en relaties kunnen je letterlijk helpen om iets helemaal door te denken of te doen. Het werk is bewust te blijven van de magneet zonder je eigen authority op te geven. Je hoeft niet samen te smelten met iedereen die je overbrugt. Laat mensen verbinding brengen, en besluit daarna nog steeds als jezelf.`,
  },
  "Triple Split": {
    summary: "Drie aparte clusters — verschillende mensen en plekken helpen je vaak het verwerken af te ronden. (Definition: Triple Split)",
    learnMore: `Je hebt drie aparte gebieden van definition — drie clusters die niet allemaal via je eigen kanalen verbinden. Verwerken gebeurt vaak in delen. Je hebt misschien meer afwisseling in mensen en plekken nodig dan bij een single of eenvoudige split definition, niet omdat je onsamenhangend bent, maar omdat verschillende omgevingen verschillende stukken van je circuit aanhaken.

In de praktijk is één gesprek of één ruimte zelden genoeg om je helemaal verwerkt te voelen. Door je dag bewegen — verschillende mensen, een wandeling tussen afspraken, een andere setting — kan meer doen dan bij één klankbord blijven zitten tot je een conclusie forceert. Je bent niet kapot omdat je circulatie nodig hebt; je chart is modulair. Druk om "gewoon al te beslissen" in één afgesloten omgeving werkt vaak averechts.

Wanneer dit werkt, voegt een voller beeld zich samen nadat je een paar contexten hebt geproefd, en voel je je heel zonder dat één persoon je hoeft te completeren. Wanneer het niet werkt, kun je je versnipperd voelen, ongeduldig met jezelf, of te gehecht aan wie even twee van de drie delen verbond. Geef jezelf afwisselend contact en een beetje tijd, en laat de stukken daarna in één besluit landen.`,
  },
  "Quadruple Split": {
    summary: "Vier aparte clusters — omgeving en timing doen er veel toe om je heel te voelen. (Definition: Quadruple Split)",
    learnMore: `Je hebt vier aparte gebieden van definition, wat ongewoon is en sterk modulair. Je gestage energie komt in onderscheiden stukken, niet in één of twee stromen. Je heel voelen hangt voor jou vaker af van omgeving en timing dan voor de meeste mensen — niet omdat je iets wezenlijks mist, maar omdat de bruggen tussen die stukken niet in jou zijn ingebouwd.

In het dagelijks leven heb je misschien nóg meer circulatie nodig: verschillende mensen, verschillende plekken, en genoeg tijd zodat de delen elkaar kunnen ontmoeten. Eén intensieve relatie of één afgesloten werkdag kan een deel van je offline laten. Afwisseling is hier functioneel. Geduld ook. Je bent niet bedoeld om jezelf de hele tijd als één samengesmolten stroom te voelen.

De gave is flexibiliteit en een wijde blik; je kunt meerdere modi vasthouden zonder ze tot één in te laten storten. De spanning komt als je constante innerlijke eenheid eist, of als je je vastklampt aan wie de stukken even verbindt. Beweeg door omgevingen, laat timing helpen, en meet heelheid over een dag of een week, niet in één bevroren moment.`,
  },
};

export const PROFILE_LINES: Record<number, { name: string; brief: string }> =
{
  1: {
    name: "Investigator",
    brief: "Heeft een stevige basis nodig — onderzoeken, studeren, en zich veilig voelen voordat het de grond vertrouwt. Lijn 1 graaft naar de fundering: feiten, kaders, en geleefd bewijs dat iets veilig genoeg is om op te staan. Wanneer de basis dun voelt, verschijnen angst en overvoorbereiding; wanneer hij stevig voelt, onderwijzen en delen met stille autoriteit. Je bent hier om genoeg te weten zodat anderen kunnen leunen op wat jij hebt onderzocht.",
  },
  2: {
    name: "Hermit",
    brief: "Natuurlijke gaven die anderen aanwijzen; heeft tijd alleen nodig en wil geroepen (niet gedwongen) worden om te delen. Lijn 2 draagt talent dat vanbuiten vaak moeiteloos voelt en voor jou mysterieus — mensen merken wat je doet zonder dat je het probeert. Eenzaamheid laadt de gave opnieuw op; presteren op verzoek put haar uit. Het gezonde patroon is kluizenaarstijd plus oprechte roepingen die je naar buiten vragen, geen druk die je elke ruimte in duwt.",
  },
  3: {
    name: "Martyr",
    brief: "Leert door vallen en opstaan — banden die ontstaan en breken; ontdekking via geleefde ervaring. Lijn 3 is ontworpen om tegen het leven aan te botsen, te testen wat werkt, en de kaart te herzien na contact met de werkelijkheid. Fouten zijn data, geen bewijs van falen; veerkracht komt van opnieuw opstaan en de waarheid vertellen over wat er écht gebeurde. Je rijpt door experimenten te verzamelen tot je geleefde wijsheid nuttig wordt voor anderen die hetzelfde terrein oversteken.",
  },
  4: {
    name: "Opportunist",
    brief: "Netwerk en vriendschappen openen deuren; invloed reist via mensen die je al kent. Lijn 4 floreert in vertrouwde kringen — kansen komen via mensen die je al kennen en vertrouwen, niet via koud benaderen. De kwaliteit van het netwerk telt meer dan de omvang: de juiste vrienden, collega’s en gemeenschappen worden de brug. Wanneer je een lancering van onbekende naar onbekende forceert, blijven deuren hangen; wanneer je banden verzorgt, opent het leven zich zijwaarts.",
  },
  5: {
    name: "Heretic",
    brief: "Geprojecteerde probleemoplosser — anderen zien praktische oplossingen in je; beheer projecties bewust. Lijn 5 wordt in de rol van fixer gezet: mensen projecteren dat jij het antwoord hebt op de crisis van het moment. Dat kan krachtig zijn wanneer je écht een universele, praktische oplossing hebt — en uitputtend wanneer je elke hoop en elke blaam opneemt. Helderheid over welke problemen van jou zijn om op te lossen (en welke projecties zijn) houdt de Heretic eerlijk en effectief.",
  },
  6: {
    name: "Role Model",
    brief: "Levensproces in drie delen (proef → terugtrekking → belichaming); wordt met de tijd een levend voorbeeld. Grofweg het eerste derde van het leven voelt vaak als een experiment van lijn 3 — proberen, falen, en littekens verzamelen. Daarna komt een dak- / waarnemersfase waarin je een stap terugdoet, toekijkt en integreert voordat je in elk gevecht springt. Later kom je naar beneden als role model: niet door theorie te preken, maar door te belichamen wat je hebt geleefd, zodat anderen een geloofwaardig pad kunnen zien.",
  },
};

export function profileLearnMore(profile: string): string {
  const raw = profile.trim();
  const m = /^(\d)\s*\/\s*(\d)$/.exec(raw);
  if (!m) {
    return "Het Profile is de lijn van de Personality Sun / de lijn van de Design Sun — hoe je de wereld ontmoet en hoe je haar verteert.";
  }
  const key = `${m[1]}/${m[2]}`;
  const combo = PROFILE_COMBO_ESSAYS[key];
  if (combo) return combo;

  const a = Number(m[1]);
  const b = Number(m[2]);
  const pa = PROFILE_LINES[a];
  const pb = PROFILE_LINES[b];
  return (
    `Bewuste lijn (Personality) ${a} — ${pa?.name}:\n${pa?.brief || ""}\n\n` +
    `Onbewuste lijn (Design) ${b} — ${pb?.name}:\n${pb?.brief || ""}\n\n` +
    `Samen is ${a}/${b} een huis met twee verdiepingen: lijn ${a} is hoe anderen je eerst ontmoeten en hoe je bewust verschijnt; ` +
    `lijn ${b} is het diepere proces daaronder dat kleurt hoe je ervaring verteert. ` +
    `Geen van beide lijnen is beter — de kunst is het uiterlijke stijl en het innerlijke proces als een paar te laten werken, in plaats van tegen elkaar te vechten.`
  );
}

export const CENTER_COPY: Record<CenterKey, { defined: string; open: string; bodyHint: string }> =
{
  Head: {
    defined: "Altijd-aan mentale druk en inspiratie — vragen komen vanbinnen op een betrouwbaar thema. (Defined Head)",
    open: "Je neemt de vragen en inspiratie van de ruimte over — niet elke puzzel is van jou om op te lossen. (Open Head)",
    bodyHint: "Inspiratiedruk, thema’s van de pijnappelklier/hypofyse-as, belasting door mentale stimulatie.",
  },
  Ajna: {
    defined: "Altijd-aan manieren van denken — een betrouwbare stijl van mentaal verwerken. (Defined Ajna)",
    open: "Je neemt veel perspectieven over — let op over-analyse en verslaving aan zekerheid. (Open Ajna)",
    bodyHint: "Visualisatie, analyse, thema’s van neurotransmitter- / cognitieve belasting.",
  },
  Throat: {
    defined: "Altijd-aan expressie — energie wil gezegd of gedaan worden. (Defined Throat)",
    open: "Je neemt de druk over om te spreken — wacht op de timing van je lichaam voordat je output forceert. (Open Throat)",
    bodyHint: "Stem, schildklier-/expressie-output, metabolisch tempo van communicatie.",
  },
  G: {
    defined: "Altijd-aan identiteit en richting — een gestager gevoel van wie je bent. (Defined G)",
    open: "Je neemt de richting van de ruimte over — zoek plekken die als thuis voelen. (Open G)",
    bodyHint: "Identiteit, richting, lever-/bloedthema’s in de traditionele HD-lichaamskaart.",
  },
  Heart: {
    defined: "Altijd-aan wil — je kunt beloften maken en houden vanuit het Heart. (Defined Heart)",
    open: "Wil komt en gaat — bewijs je waarde niet door overwerk; rust wanneer de wil inzakt. (Open Heart)",
    bodyHint: "Wil, maag-/hart-/galthema’s, druk om jezelf te bewijzen / eigenwaarde wanneer open.",
  },
  Solar_Plexus: {
    defined: "Altijd-aan emotionele golf — helderheid in de tijd, niet in het moment. (Defined Solar Plexus)",
    open: "Je neemt de emoties van anderen over — neem de tijd om te voelen wat van jou is. (Open Solar Plexus)",
    bodyHint: "Zenuwstelsel / emotionele golf, gevoeligheid van de darm-brein-as.",
  },
  Sacral: {
    defined: "Altijd-aan werk-en-leven-energie wanneer je antwoordt — ja/nee vanuit je buik. (Defined Sacral)",
    open: "Geen altijd-aan werk-motor — rust en echte uitnodigingen doen er meer toe. (Open Sacral)",
    bodyHint: "Vitaliteit, seksualiteit, werkvermogen, thema’s van voortplanting / darmenergie.",
  },
  Spleen: {
    defined: "Altijd-aan instinct in het nu — stille tikken over veiligheid en timing. (Defined Spleen)",
    open: "Je neemt de angsten en instincten van anderen over — onderscheid ruis van een echte tik. (Open Spleen)",
    bodyHint: "Immuun-intuïtie, bewustzijn van angst, overlevingssensing in het moment.",
  },
  Root: {
    defined: "Altijd-aan druk om te bewegen op vaste thema’s. (Defined Root)",
    open: "Je neemt haast en stress van anderen over — laat die bewust weer los. (Open Root)",
    bodyHint: "Bijnierdruk, stresschemie, start/stop-drive.",
  },
};

export const TYPE_BATTERY: Record<string, string> =
{
  Generator: "Je bouwt wanneer iets buiten je een ja vanuit je buik aansteekt — en je raakt leeg wanneer je starts vanuit je hoofd forceert. Voldoening is het groene licht; frustratie betekent dat je de verkeerde steen duwt. (Type: Generator)",
  "Manifesting Generator": "Antwoord, vertel het de mensen, en beweeg dan. Je kunt meerdere sporen tegelijk volgen zodra je buik ja zegt, maar die check overslaan (of vergeten te informeren) schept weerstand. Snelheid ná helderheid, niet ervoor. (Type: Manifesting Generator)",
  Manifestor: "Je krijgt aandrang om te beginnen — de vaardigheid is de mensen te vertellen die het raakt, zodat de wereld niet op de rem trapt. Bescherm startvensters; je bent niet gebouwd voor constante beschikbaarheid. Vrede is het groene licht; woede is het waarschuwingslampje. (Type: Manifestor)",
  Projector: "Je bent er om te begeleiden, niet om de hele dag te ploeteren. Herkenning en echte uitnodigingen vullen je; achtervolgen put je uit. Succes is het groene licht; bitterheid betekent dat je te veel hebt gegeven. (Type: Projector)",
  Reflector: "Je proeft de ruimte — mensen en plekken kleuren hoe je je voelt. Grote beslissingen willen ongeveer een maanmaand van proeven. Verrassing en vreugde op de juiste plek; teleurstelling op de verkeerde. (Type: Reflector)",
};

export const AUTHORITY_PLAIN: Record<string, string> =
{
  "Emotional (Solar Plexus)": "Je heldere antwoorden komen nadat gevoelens zijn bewogen — slaap een nacht over grote keuzes.",
  Sacral: "Het ja van je lichaam is een geluid vanuit je buik of een viscerale trek in het nu. Geen duidelijk ja? Dan is het een nee (of nog-niet).",
  Splenic: "Het ja van je lichaam is een stil instinct over veiligheid en timing — makkelijk om jezelf eruit te praten.",
  "Ego / Heart": "Het ja van je lichaam is wat je eerlijk wilt en kunt volhouden — beloften die je kunt houden.",
  "Self-Projected": "Het ja van je lichaam verschijnt wanneer je jezelf hoort praten in het juiste gezelschap.",
  Lunar: "Het ja van je lichaam heeft tijd nodig — proef over een maancyclus voordat je grote keuzes vastzet.",
  "Mental / Environmental (Outer Authority)": "Je besluit met vertrouwde klankborden en gezonde ruimtes — het hoofd weerspiegelt, het baas niet in z’n eentje.",
};

export const OPEN_CENTER_WATCH: Record<string, string> =
{
  Head: "Je kunt de vragen van andere mensen opzuigen — niet elke puzzel is van jou om op te lossen.",
  Ajna: "Je kunt elke mening proeven — let op overdenken en verslaving aan zekerheid.",
  Throat: "Je kunt druk voelen om te spreken of op te treden — wacht op de juiste timing.",
  G: "Richting kan meebewegen met de ruimte — verander van plek voordat je een doel forceert.",
  Heart: "Wilskracht kan wisselend voelen — bewijs je waarde niet door te veel toe te zeggen.",
  Solar_Plexus: "Je versterkt de emoties om je heen — check wat van jou is voordat je besluit.",
  Sacral: "Je hebt geen gestage werk-motor — rust is strategy, geen falen.",
  Spleen: "Je kunt angstvibes oppikken — pauzeer voordat je gezondheidsschrik-konijnenholen in duikt.",
  Root: "Je versterkt haast — de deadlines van andere mensen zijn niet automatisch de jouwe.",
};

export function centersToWatch(undefinedCenters: string[], limit = 3): Array<{ center: string; tip: string }> {
  const order = ["Root", "Solar_Plexus", "Head", "Ajna", "Sacral", "Heart", "G", "Throat", "Spleen"];
  const open = new Set(undefinedCenters);
  const out: Array<{ center: string; tip: string }> = [];
  for (const c of order) {
    if (open.has(c) && OPEN_CENTER_WATCH[c]) {
      out.push({ center: c, tip: OPEN_CENTER_WATCH[c] });
    }
    if (out.length >= limit) break;
  }
  return out;
}

export function profilePlainLine(profile: string): string {
  const m = /^(\d)\s*\/\s*(\d)$/.exec(profile.trim());
  if (!m) return "Je Profile is hoe je de wereld ontmoet en hoe je ervaring verteert.";
  const a = Number(m[1]);
  const b = Number(m[2]);
  const pa = PROFILE_LINES[a];
  const pb = PROFILE_LINES[b];
  return (
    `${a}/${b} — ${pa?.name || "?"} / ${pb?.name || "?"}.\n\n` +
    `Naar buiten (lijn ${a}): ${pa?.brief || ""}\n\n` +
    `Daaronder (lijn ${b}): ${pb?.brief || ""}`
  );
}

export const CHANNEL_COPY_NL: Record<string, string> = CHANNEL_COPY;

export function channelMeaning(gates: number[], name?: string): string {
  if (gates.length >= 2) {
    const key = [...gates].map(Number).sort((a, b) => a - b).join("-");
    if (CHANNEL_COPY[key]) return CHANNEL_COPY[key];
  }
  if (name) {
    const hit = Object.entries(CHANNEL_COPY).find(([, text]) =>
      text.toLowerCase().startsWith(name.toLowerCase() + " ")
    );
    if (hit) return hit[1];
  }
  return "Een gedefinieerd kanaal is een gestaag thema tussen twee centers — een betrouwbare smaak in hoe je energie beweegt en zich uit.";
}
