import type { CenterKey } from "../hdCopy";
import { CHANNEL_COPY } from "./hdChannelCopy.es";
import { PROFILE_COMBO_ESSAYS } from "./hdProfileCombos.es";

export const TYPE_COPY: Record<string, { summary: string; learnMore: string }> =
{
    Generator: {
      summary: 'Construyes mejor cuando algo real enciende un sí del cuerpo. (Type: Generator)',
      learnMore: `Tienes una energía de trabajo constante que se enciende cuando la vida te da algo a lo que responder — en Human Design ese motor se llama el Sacral. Zumba cuando estás bien ocupado y se apaga cuando no. Estás aquí para construir y responder a lo que la vida pone delante, no para inventar el siguiente paso en la cabeza y empujarlo al mundo.

Tu Strategy es esperar a responder. Aparece una persona, una pregunta, un sonido o una oportunidad, y tu cuerpo contesta con un sí, un no o un todavía-no, a menudo antes de que puedas explicar por qué. Esa respuesta del cuerpo es más fiable que un plan ingenioso.

La satisfacción es la sensación de que vas bien encaminado — el trabajo o el día te encienden por dentro. La frustración es la luz de aviso: iniciaste desde la presión, dijiste sí para agradar a alguien, o te quedaste en algo a lo que tu Sacral nunca accedió. Dale a tu cuerpo algo real a lo que responder, y sigue lo que de verdad sientes, no la historia de lo que deberías querer.`,
    },
    "Manifesting Generator": {
      summary: 'Te mueves rápido cuando algo es un sí de verdad — y avisas a la gente antes de cambiar de rumbo. (Type: Manifesting Generator)',
      learnMore: `Tienes una energía de trabajo constante que se enciende cuando la vida te da algo a lo que responder — en Human Design ese motor se llama el Sacral — y un camino a tu Throat, así que cuando algo es un sí verdadero puedes moverte rápido, saltarte pasos y sostener más de un interés a la vez. Esa velocidad no es una licencia para lanzarte desde la mente. Sigues respondiendo primero — el mismo sí o no del cuerpo que un Generator — y luego informas a las personas a las que va a afectar antes de cambiar de rumbo. Informar no es pedir permiso; es reducir la fricción para que tu impulso no sorprenda a nadie.

La satisfacción mezclada con una sensación de éxito aparece cuando el Sacral está encendido y los demás no se quedan a oscuras. La frustración mezclada con ira aparece cuando te saltas la respuesta, saltas demasiado pronto, o te sientes encajonado en un solo camino lineal. Ser multi-apasionado no es ser informal cuando cada paso fue un sí real; se vuelve agotador cuando persigues cada idea para evitar la pausa que te diría cuál es de verdad tuya.`,
    },
    Manifestor: {
      summary: 'Estás aquí para empezar — y para avisar a las personas a las que va a afectar antes de moverte. (Type: Manifestor)',
      learnMore: `Estás aquí para empezar — para sentir un impulso interior y comenzar sin esperar a que el mundo te lo pida primero. En Human Design, un motor conectado a tu Throat te da impacto: la gente te siente llegar. Ese impacto es la razón por la que informar importa. Antes de actuar, di a las personas a las que va a afectar lo que estás a punto de hacer. Informar no es pedir permiso ni someter el impulso a votación; es una cortesía que baja la resistencia para que tu impulso pueda moverse.

La paz es la seña de un Manifestor que es libre de empezar y que se acuerda de informar. La ira sube cuando otros intentan controlar tu ritmo, o cuando desapareces en la acción y todos los demás tienen que adivinar. No estás aquí para esperar una respuesta Sacral como los Generators. Protege suficiente silencio para oír el impulso, y entonces muévete — y deja que las personas adecuadas lo sepan, para que tu independencia no tenga que pelear batallas innecesarias.`,
    },
    Projector: {
      summary: 'Ves los sistemas con claridad — comparte esa mirada donde te invitan a entrar. (Type: Projector)',
      learnMore: `Ves a las personas y los sistemas con una claridad poco habitual, y estás aquí para guiar, no para deslomarte. No tienes un motor Sacral constante, así que no estás aquí para la misma energía de hacer todo el día que los Generators. Tu energía se llena a través del reconocimiento — que vean lo que de verdad notas — y a través de un descanso real.

Tu Strategy es esperar la invitación, sobre todo para el trabajo, el amor y cualquier consejo importante que quieras compartir. Una invitación es alguien que ha reconocido tu mirada y te ha pedido que entres. No es que tú llames hasta que se abra la puerta, ni ofrecer un diagnóstico que nadie pidió. El reconocimiento de tu mirada es combustible; sin él, incluso un consejo brillante te vacía.

El éxito es la seña: las personas adecuadas te llevan a las salas adecuadas y tu guía aterriza. La amargura aparece cuando persigues, demuestras o das un consejo que nadie pidió. Esa amargura es información útil, no un defecto de carácter — casi siempre significa que gastaste energía sin reconocimiento. Protege tu descanso, comparte donde te han invitado, y deja que «todavía no» sea una respuesta completa.`,
    },
    Reflector: {
      summary: 'Pruebas personas y lugares — la claridad grande suele querer un ciclo lunar completo. (Type: Reflector)',
      learnMore: `No tienes centros definidos, lo que significa que pruebas y reflejas a las personas y los lugares que te rodean en vez de llevar un solo clima interior fijo. Ese es un don de discernimiento: puedes sentir la salud de una sala, un pueblo o una relación con más honestidad que la mayoría. También es por eso que el entorno importa tanto. La comunidad correcta te deja sintiéndote, de forma sorprendente, como tú; la equivocada te deja cargando el humor de todos los demás.

Para las decisiones mayores, espera alrededor de un ciclo lunar — unos veintiocho días — para poder probar la elección desde muchos climas interiores, en vez de cerrarla en un solo día cargado. No estás aquí para ser «indeciso»; estás aquí para ser minucioso. La claridad que sobrevive un ciclo completo es tuya.

La sorpresa y el deleite son la seña de un Reflector en un lugar sano. La decepción llega cuando decides demasiado rápido o te quedas en un sitio que no te quiere de vuelta. Trata el entorno como la palanca principal, y fíjate en quién te vuelves al lado de distintas personas, en vez de forzar una personalidad que nunca estuvo pensada para ser la misma en todas las salas.`,
    },
  };

export const STRATEGY_COPY: Record<string, { summary: string; learnMore: string }> =
{
    "To Respond": {
      summary: 'Espera algo real a lo que responder — un sí del cuerpo gana a un plan ingenioso. (Strategy: To Respond)',
      learnMore: `Estás aquí para entrar después de que la vida te da algo a lo que responder — una persona, una pregunta, una invitación, un sonido o una oportunidad que aparece fuera de tu cabeza. Tu Sacral es una respuesta constante del cuerpo: se enciende con un sí, se apaga con un no, o se queda poco claro cuando el momento todavía no es. Esa respuesta es más rápida y más honesta que un plan ingenioso. Esperar a responder no es pasividad. Es dejar que el mundo empiece la conversación para que tu energía pueda encontrarse con algo real.

En la práctica, esto se ve como pausar antes de presentarte voluntario, postularte o inventar el siguiente paso. Dale a tu cuerpo algo concreto a lo que reaccionar. Un sí a menudo se siente como calor, expansión o un ajá inconfundible. Un no se siente plano, pesado, o como si tuvieras que convencerte. Si no es un sí claro, trátalo como un no o un todavía no, no como un enigma que tu mente tiene que resolver.

Cuando respondes de forma correcta, el trabajo y las relaciones suelen tener más flujo y menos desgaste — eso es satisfacción. Cuando inicias desde la presión, el querer agradar o una historia de lo que deberías querer, la frustración crece. Usa la frustración como información: probablemente dijiste sí sin un sí sacral, o estás empujando un plan que nadie puso de verdad delante de ti.`,
    },
    "To Respond (then inform)": {
      summary: 'Siente primero el sí del cuerpo, y luego avisa a las personas a las que va a afectar antes de moverte. (Strategy: To Respond, then inform)',
      learnMore: `Sigues esperando a responder antes de moverte. Aparece una persona, una pregunta o una oportunidad, y tu Sacral contesta con un sí, un no o un todavía no. Esa comprobación del cuerpo es la misma que la de un Generator — la velocidad no es una licencia para lanzarte desde la mente. Después de un sí verdadero, di a las personas a las que va a afectar lo que estás a punto de hacer, o que vas a cambiar de rumbo. Informar no es pedir permiso. Es reducir la fricción para que tu energía rápida, que se salta pasos, no deje a los demás improvisando.

Día a día, la secuencia es: espera algo real, siente la respuesta del cuerpo, y luego di el siguiente paso antes de desaparecer en él. Un «voy a tomar esto y soltar aquello» breve a menudo evita la resistencia que se siente como si el mundo pisara el freno. Si el Sacral está callado, no llenes el silencio con un plan solo porque puedes ejecutarlo rápido.

Cuando esta Strategy funciona, puedes moverte a tu ritmo natural sin estar todo el rato reparando sorpresas. Cuando te saltas la respuesta o te olvidas de informar, suelen seguir la frustración y un destello de ira — o porque te comprometiste sin un sí, o porque la gente intenta controlar un cambio del que nunca se enteró. Reduce la velocidad solo lo suficiente para responder e informar; luego déjate ir rápido.`,
    },
    "To Inform": {
      summary: 'Antes de empezar, avisa a las personas a las que va a tocar — cortesía, no permiso. (Strategy: To Inform)',
      learnMore: `Estás aquí para empezar desde un impulso interior, no para esperar a que el mundo te lo pida primero. La Strategy que hace que esa iniciación funcione es informar: antes de actuar, di a las personas relevantes lo que estás a punto de hacer. Informar no es pedir permiso ni poner tu impulso a votación. Es una cortesía que baja la resistencia, porque la gente siente llegar el impacto de un Manifestor y se tensa cuando tiene que adivinar.

En la práctica, elige a las personas a las que de verdad va a afectar — una pareja, un equipo, una casa — y dales un aviso claro. No necesitas una justificación larga. «Empiezo esto» o «necesito la tarde sin interrupciones» basta. Y entonces muévete. Esperar a que todo el mundo esté cómodo a menudo deja el impulso sin alimento; desaparecer sin decir nada a menudo crea justo el control y el empujón que querías evitar.

La paz es lo que se siente cuando eres libre de empezar y te acordaste de informar. La ira sube cuando otros intentan gestionar tu ritmo, o cuando te evaporas en la acción y todos los demás se quedan arreglando la sorpresa. Protege suficiente silencio para oír el impulso, informa a las personas adecuadas, y sigue — para que tu independencia no tenga que pelear batallas innecesarias.`,
    },
    "Wait for the Invitation": {
      summary: 'Comparte tu guía donde te reconocen y te piden que entres. (Strategy: Wait for the Invitation)',
      learnMore: `Tu forma correcta de entrar es esperar hasta que te reconozcan e inviten — sobre todo para el trabajo, el amor y cualquier consejo importante que quieras compartir. Una invitación es alguien que ha visto lo que de verdad notas y te ha pedido que entres. No es que tú llames hasta que se abra la puerta, ni ofrecer un diagnóstico que nadie pidió. El reconocimiento de tu mirada es combustible; sin él, incluso una guía brillante te vacía.

En el día a día esto puede parecer más lento que la cultura que te rodea. Todavía puedes vivir, aprender y ser visible; la Strategy trata de no forzar las puertas grandes. Comparte tu mirada donde te la han pedido. Deja que los reconocimientos más pequeños se acumulen. Si te pillas demostrando lo útil que eres, suele ser la mente intentando crear una invitación que todavía no ha llegado.

El éxito es la sensación de que las personas adecuadas te llevaron a las salas adecuadas y tu guía aterrizó. La amargura aparece cuando persigues, das de más, o aconsejas sin que te lo pidan. Esa amargura es información útil, no un defecto de carácter — casi siempre significa que gastaste energía sin reconocimiento. Protege tu descanso, espera la petición, y deja que «todavía no» sea una respuesta completa.`,
    },
    "Wait a Lunar Cycle": {
      summary: 'Para las decisiones grandes, prueba a lo largo de un mes para que la claridad pueda asentarse. (Strategy: Wait a Lunar Cycle)',
      learnMore: `Para las decisiones mayores, tu Strategy es probar a lo largo de un ciclo lunar completo — unos veintiocho días — en vez de cerrarlas en un solo día cargado. No tienes centros definidos, así que tomas a las personas y los lugares que te rodean. Una sola conversación o un solo humor puede sentirse como certeza cuando en realidad es sobre todo la sala hablando. El tiempo te deja sentir la misma elección desde muchos climas interiores hasta que queda algo estable.

Esto no significa que no puedas elegir el almuerzo o responder un correo sencillo. Significa que los compromisos grandes — dónde vivir, con quién asociarte, un trabajo, una mudanza — quieren una prueba más larga. Habla con distintas personas, visita el lugar más de una vez, y fíjate en quién te vuelves al lado de esa opción, en vez de forzar una personalidad que se queda igual en todas las salas. No estás siendo indeciso; estás siendo minucioso.

La sorpresa y el deleite aparecen cuando una elección sigue sintiéndose tuya después de un ciclo completo, sobre todo en un entorno que te quiere de vuelta. La decepción llega cuando decides demasiado rápido o te quedas en un sitio que solo se sintió bien un día. Trata el tiempo y el entorno como las palancas principales, y confía en la claridad que sobrevive el mes.`,
    },
  };

export const AUTHORITY_COPY: Record<string, { summary: string; learnMore: string }> =
{
    "Emotional (Solar Plexus)": {
      summary: 'Las respuestas claras llegan después de que los sentimientos se mueven — deja dormir las decisiones grandes. (Authority: Emotional)',
      learnMore: `Tus respuestas claras llegan después de que los sentimientos se mueven, no en el alto ni en el bajo. En Human Design esto es Emotional authority (Solar Plexus). Deja dormir las decisiones grandes. Los sentimientos se mueven, no llegan como un veredicto único y permanente. Un alto puede hacer que casi cualquier cosa parezca un sí para siempre. Un bajo puede hacer que algo bueno parezca imposible. La claridad llega después de haber sentido más de un punto de la ola — a menudo después de una noche de sueño, y a veces después de varios días.

En la práctica, no firmes, no te comprometas ni declares tu respuesta final en la cresta ni en el valle. Puedes notar el primer sentimiento y aun así esperar. «Necesito quedarme con esto» es una respuesta completa. Habla si te ayuda a sentir la ola, pero no dejes que una conversación persuasiva se convierta en la decisión. La mente intentará congelar un humor en una historia; tu trabajo es dejar que el clima cambie y ver qué queda.

Cuando honras la ola, las decisiones suelen sentirse asentadas más que dramáticas — simplemente lo sabes, sin el mismo calor. Cuando decides en un pico o en una caída, suelen seguir el arrepentimiento y las dudas, no porque seas informal, sino porque trataste un parte meteorológico como si fuera el clima. Dale tiempo a las elecciones importantes, y confía en la respuesta que sigue siendo verdad después de que la ola se ha movido.`,
    },
    Sacral: {
      summary: 'Confía en el sí o no del cuerpo en el ahora — si no es claro, es un no o un todavía no. (Authority: Sacral)',
      learnMore: `Tu Authority es sacral: en el ahora, tu cuerpo responde con un sí o un no visceral — a menudo un sonido, un tirón hacia algo, o una planicie fácil de pasar por alto si estás ocupado explicando. Esto no es un plan a cinco años. Es una respuesta a lo que tienes delante ahora mismo. Si no es un sí claro, es un no, o un todavía no. Un «tal vez» que tienes que justificar suele ser la mente intentando pasar por encima del cuerpo.

En la práctica, haz preguntas que el cuerpo pueda responder, no ensayos. «¿Quiero esto?» «¿Es un sí para el martes?» Escucha la expansión, la animación o un ajá, frente a la tensión, la apatía o tener que convencerte. Otras personas pueden presentar opciones; no pueden sentir tu Sacral por ti. Si necesitas tiempo, puede ser porque todavía no hay nada concreto a lo que responder — consigue una oferta más clara en vez de forzar una decisión mental.

Cuando sigues el cuerpo, la energía suele quedarse disponible para aquello a lo que dijiste sí. Cuando lo pasas por alto para ser educado, impresionar o ser coherente con un plan viejo, la frustración crece y el cuerpo a menudo se arrastra. Confía en la respuesta del momento aunque todavía no puedas explicarla, y deja que las explicaciones vengan después del sí o del no, no antes.`,
    },
    Splenic: {
      summary: 'Un instinto silencioso sobre la seguridad y el momento, en el ahora — fácil de tapar con la mente. (Authority: Splenic)',
      learnMore: `Tu Authority es splenic: un saber instintivo y silencioso, en el momento, sobre la salud, la seguridad y el momento. El Spleen habla una vez, en voz baja, y no discute. Puede sentirse como un «esto está bien» o un «márchate ahora» súbito, sin un discurso detrás. La mente es mucho más alta, así que es fácil convencerte de lo contrario unos segundos después y llamar sabiduría a ese razonamiento.

En la práctica, fíjate en el primer parpadeo — una sensación de bienestar, un tic de cautela, la impresión de que el momento es el correcto o no — y dale más peso que a la historia que viene después. Los golpes splenic son del ahora, no de demostrar un caso para el mes que viene. Puede que no recibas un segundo aviso con las mismas palabras. Escribir después puede ayudarte a aprender el sabor de tu instinto, pero la decisión en sí ocurre en el momento, no en una hoja de cálculo.

Cuando confías en él, la vida a menudo se siente más simple y más segura, aunque no puedas justificar cada elección ante los demás. Cuando lo pasas por alto, más tarde puedes decir «ya lo sabía» — esa frase suele ser el Spleen que ignoraste. No confundas las espirales de ansiedad o el miedo de otras personas con un golpe splenic verdadero; el de verdad es breve, silencioso y específico de este momento.`,
    },
    "Ego / Heart": {
      summary: 'Decide por lo que puedes querer de verdad y sostener como promesa. (Authority: Ego / Heart)',
      learnMore: `Tu Authority es ego, o heart: decides a través de la voluntad y del compromiso honesto — lo que puedes prometer de forma sostenible y sostener de verdad. Esto no va de demostrar que eres lo bastante fuerte para hacerlo todo. Va de si tu corazón está de verdad en la promesa, y de si tienes la voluntad de llevarla hasta el final sin abandonarte.

En la práctica, pregunta «¿Puedo comprometerme con esto?» y «¿Seguiré respetándome si mantengo esta promesa?» en vez de «¿Esto impresionaría a la gente?». Un sí correcto tiene la calidad de un «lo haré» — una disposición a poner tu nombre. Un no puede ser igual de limpio: no vas a negociar tu voluntad solo para parecer fiable. Hacer menos compromisos, y más verdaderos, suele funcionar mejor que apilar obligaciones que luego tienes que sacar a la fuerza.

Cuando se honra esta Authority, tu palabra significa algo para ti y para los demás, y el esfuerzo se siente elegido, no extraído. Cuando dices sí para demostrar tu valía, o no por miedo a que te vean como egoísta, el Heart se cansa y llega el resentimiento. Decide desde lo que puedes querer de verdad, y entonces cumple esas promesas — eso es la Authority funcionando, no el tamaño de la carga.`,
    },
    "Self-Projected": {
      summary: 'Habla en voz alta — oyes tu dirección en tu propia voz. (Authority: Self-Projected)',
      learnMore: `Tu Authority es self-projected: oyes tu dirección al decirla. La claridad vive en tu voz y en tu identidad — en oírte hablar de la elección — no en analizar en silencio cada ángulo. Importan los oyentes correctos y el entorno correcto. No buscas que ellos decidan por ti; buscas un espacio donde tus propias palabras puedan mostrarte quién eres en relación con esa opción.

En la práctica, háblalo con personas que sepan escuchar sin arreglarte enseguida ni reclutarte. Fíjate en lo que te oyes decir, y en cómo cambia tu tono cuando describes un camino u otro. Una dirección verdadera a menudo suena como reconocerte a ti mismo: las palabras tienen vida. Si te quedas callado, te pisan la palabra, o empiezas a interpretar la respuesta que crees que quieren, cambia de sala y habla otra vez.

Cuando esto funciona, sales de la conversación sabiendo más que cuando entraste, aunque la otra persona apenas te haya aconsejado. Cuando decides solo en la cabeza, o en una sala que distorsiona quién eres, puedes sentirte perdido o como si hubieras aceptado la identidad de otra persona. Date voces y lugares que te dejen oírte, y entonces sigue lo que te oíste decir.`,
    },
    Lunar: {
      summary: 'Dale a las decisiones mayores alrededor de un mes de prueba antes de cerrarlas. (Authority: Lunar)',
      learnMore: `Tu Authority es lunar, que va con ser Reflector: las decisiones mayores necesitan un ciclo lunar completo de prueba antes de cerrarlas. Como no tienes centros definidos, cada día puede colorear la elección de forma distinta. Una conversación puede sentirse como destino; una semana después, la misma opción se siente vacía. El tiempo aquí no es demora — es la forma en que se construye tu claridad.

En la práctica, toma las decisiones grandes a lo largo del mes. Visita el lugar más de una vez, habla con distintas personas, y apunta cómo se siente la elección en varios días, en vez de confiar en un solo alto o un solo bajo. Las decisiones diarias más pequeñas no necesitan todas veintiocho días; reserva la prueba larga para lo que cambia tu entorno, tu trabajo o tus relaciones. No eres indeciso; tu diseño es ser minucioso.

La sorpresa y el deleite son señales de que esperaste lo suficiente en un lugar que te sienta bien. La decepción a menudo significa que congelaste un reflejo temporal en un sí permanente, o que te quedaste en un sitio que nunca llegó a sentirse como tú. Deja que el ciclo se complete, y entonces elige lo que sigue siendo verdad.`,
    },
    "Mental / Environmental (Outer Authority)": {
      summary: 'Usa personas de confianza y salas sanas — la mente refleja; no manda sola. (Authority: Mental / Environmental)',
      learnMore: `No tienes una Authority interior de motor que decida desde una ola emocional constante, una respuesta sacral, un Spleen o una voluntad del Heart. Tu mente es excelente reflejando, comparando y hablando las cosas — y no está pensada para mandar sola. La claridad llega de entornos sanos y de cajas de resonancia de confianza: las salas correctas y las personas correctas te ayudan a ver, mientras que las equivocadas te dejan dando vueltas en la cabeza.

En la práctica, no cierres una decisión grande en soledad ni en un espacio estresado. Llévate la pregunta a caminar, siéntate con personas que escuchan bien, y fíjate en cómo se siente la misma opción en distintos sitios. Buscas lo que se vuelve claro cuando el entorno sostiene, no un argumento más alto en tu cabeza. Las otras personas son espejos y cajas de resonancia; no deberían convertirse en un comité que decide por ti.

Cuando esto funciona, las decisiones se sienten más quietas y más obvias después de buena compañía y un buen lugar — como si la respuesta se hubiera organizado sola. Cuando fuerzas un veredicto mental en solitario bajo presión, la duda suele volver enseguida. Cambia de sala, háblalo, y deja que la mente haga lo que mejor sabe: reflejar, no mandar.`,
    },
  };

export const DEFINITION_COPY: Record<string, { summary: string; learnMore: string }> =
{
    "None (Reflector)": {
      summary: 'Nada se queda siempre encendido dentro — pruebas y reflejas la sala. (Definition: None)',
      learnMore: `No tienes una definition constante — no hay centros que estén siempre «encendidos» de la misma manera. Eso significa que pruebas y reflejas a las personas, los lugares y los humores que te rodean, en vez de llevar un solo clima interior fijo. Este es un don de discernimiento: puedes sentir la salud de una sala con más honestidad que la mayoría. También es por eso que el entorno no es un detalle secundario para ti; es la condición principal de cómo te sientes tú mismo.

En el día a día puedes notar que te vuelves una persona un poco distinta al lado de distintas personas, y eso no es falso. La comunidad correcta te deja sintiéndote, de forma sorprendente, como tú. La equivocada te deja cargando el clima de todos los demás, y luego preguntándote por qué no encuentras una personalidad estable a la que agarrarte. Mover el cuerpo a un lugar mejor a menudo ayuda más que intentar pensar tu camino hacia una identidad más firme.

Como nada está enganchado de forma permanente dentro, estás aquí para probar la vida en ciclos, no para forzar una sola salida constante. Trata esa apertura como una sensibilidad con propósito, no como una pieza que falta. Elige salas que te quieran de vuelta, y date tiempo para notar quién eres después de la prueba, en vez de exigir una definition que nunca te tocó tener.`,
    },
    Single: {
      summary: 'Tus temas siempre encendidos se enlazan en un solo flujo — a menudo puedes procesar sin esperar un puente. (Definition: Single)',
      learnMore: `Tus temas siempre encendidos se enlazan en un solo flujo, así que lo que piensas, dices y haces está más enganchado que en una split definition. Eso puede sentirse estable y contenido en sí mismo: no sueles necesitar a otra persona que «puentee» dos partes separadas de ti antes de poder procesar algo hasta el final.

En la práctica, puedes notar que llegas a las cosas en tu propio tiempo y que tu chart tiene una especie de completitud interior. Las otras personas siguen importando — para la relación, la colaboración y la perspectiva — pero no suelen completar un hueco entre dos zonas desconectadas de tu diseño. El don es la coherencia. La sombra es volverte tan contenido en ti mismo que olvidas cuánto sigues tomando a través de los centros abiertos.

Cuando la single definition funciona, te sientes una sola persona por dentro: el proceso empieza y puede terminar sin esperar un eslabón que falta. Si te sientes atascado, suele tener más que ver con el entorno, el Type o la Authority que con necesitar a alguien que te puentee. Confía en el flujo unificado, y usa a las otras personas para la conexión, no como un cableado que te falta.`,
    },
    Split: {
      summary: 'Funcionas en dos grupos estables que no se conectan del todo por sí solos. Algunas personas se sienten, de forma extraña, completadoras — puentean el hueco un tiempo. (Definition: Split)',
      learnMore: `Funcionas en dos grupos estables de temas siempre encendidos que no se conectan del todo a través de tus propios canales. La energía no fluye automáticamente de una parte de ti a la otra. El espacio entre ellas es el split. Las puertas colgantes — activaciones que no tienes, y que otras personas o el cielo pueden traer — a menudo se sienten magnéticos, porque enganchan las dos partes un tiempo.

En el día a día puedes notar que ciertas personas te hacen sentir, de forma extraña, completo, articulado o capaz de procesar algo que estaba atascado. Esa química suele ser el puente, no la prueba de que son tu destino. Puede ser maravillosa, y también puede crear dependencia si dejas tu sensación de entierza en quienquiera que llene el hueco. Fíjate en quién o qué te puentee: una persona, un lugar, una conversación, incluso un rato a solas después de la estimulación.

El don de un split es la perspectiva: ves más de una manera de ser dentro de ti, y las relaciones pueden ayudarte de verdad a pensar o a actuar hasta el final. El trabajo es permanecer consciente del imán sin abandonar tu propia Authority. No tienes que fusionarte con cada persona que te puentee. Deja que las personas traigan conexión, y aun así decide como tú.`,
    },
    "Triple Split": {
      summary: 'Tres grupos separados — la variedad de personas y lugares a menudo te ayuda a terminar de procesar. (Definition: Triple Split)',
      learnMore: `Tienes tres zonas separadas de definition — tres grupos que no se enlazan todos a través de tus propios canales. El procesamiento suele ocurrir por partes. Puede que necesites más variedad de personas y lugares que una single o una split definition simple, no porque estés desenfocado, sino porque distintos entornos enganchan distintas piezas de tu circuito.

En la práctica, una conversación o una sola sala rara vez basta para sentirte del todo procesado. Moverte a lo largo del día — distintas personas, un paseo entre reuniones, un cambio de escenario — puede hacer más que quedarte con una sola caja de resonancia hasta forzar una conclusión. No estás roto por necesitar circulación; tu chart es modular. La presión de «decide de una vez» en un entorno cerrado a menudo sale mal.

Cuando esto funciona, un cuadro más completo se arma después de haber probado unos cuantos contextos, y te sientes más entero sin necesitar que una sola persona te complete. Cuando no, puedes sentirte fragmentado, impaciente contigo, o demasiado apegado a quien enlazó un momento dos de las tres partes. Date contacto variado y un poco de tiempo, y entonces deja que las piezas se asienten en una decisión.`,
    },
    "Quadruple Split": {
      summary: 'Cuatro grupos separados — el entorno y el momento importan mucho para sentirte entero. (Definition: Quadruple Split)',
      learnMore: `Tienes cuatro zonas separadas de definition, lo cual es poco habitual y muy modular. Tu energía constante llega en piezas distintas, no en uno o dos flujos. Sentirte entero a menudo depende más del entorno y del momento que para la mayoría — no porque te falte algo esencial, sino porque los puentes entre esas piezas no vienen construidos en ti.

En el día a día puede que necesites todavía más circulación: distintas personas, distintos lugares, y tiempo suficiente para que las partes se encuentren. Una sola relación intensa o un solo día de trabajo cerrado puede dejar parte de ti fuera de línea. Aquí la variedad es funcional. También lo es la paciencia. No estás aquí para sentirte como una sola corriente fundida todo el tiempo.

El don es la flexibilidad y una mirada de gran angular; puedes sostener varios modos sin colapsarlos en uno. La tensión llega si exiges una unidad interior constante o si te enganchas a quien conecta las piezas un momento. Muévete por entornos, deja que el momento ayude, y mide la entierza a lo largo de un día o una semana, no en un instante congelado.`,
    },
  };

export const PROFILE_LINES: Record<number, { name: string; brief: string }> =
{
  1: {
    name: 'Investigator',
    brief:
      'Necesita una base sólida — investigar, estudiar y sentirse seguro antes de confiar en el suelo. La línea 1 cava en busca de la base: hechos, marcos y prueba vivida de que algo es lo bastante seguro como para sostenerse. Cuando la base se siente delgada, aparecen la ansiedad y la sobrepreparación; cuando se siente sólida, enseñas y compartes con una autoridad callada. Estás aquí para saber lo bastante para que otros puedan apoyarse en lo que has investigado.',
  },
  2: {
    name: 'Hermit',
    brief:
      'Dones naturales que otros señalan; necesita tiempo a solas y que le llamen (no que le fuercen) a compartir. La línea 2 lleva un talento que a menudo se siente fácil desde fuera y misterioso para ti — la gente nota lo que haces sin intentarlo. La soledad recarga el don; actuar bajo demanda lo vacía. El patrón sano es tiempo de ermitaño más llamadas sinceras que te invitan a salir, no una presión que te empuja a todas las salas.',
  },
  3: {
    name: 'Martyr',
    brief:
      'Aprende por prueba y error — vínculos que se hacen y se rompen; descubrimiento a través de la experiencia vivida. La línea 3 está hecha para encontrarse con la vida, probar qué funciona y revisar el mapa después del contacto con la realidad. Los errores son datos, no la prueba de un fracaso; la resiliencia viene de rebotar y decir la verdad de lo que de verdad pasó. Maduras al reunir experimentos hasta que tu sabiduría vivida les sirve a otros que cruzan el mismo terreno.',
  },
  4: {
    name: 'Opportunist',
    brief:
      'La red y las amistades abren puertas; la influencia viaja a través de personas ya conocidas. La línea 4 crece en círculos familiares — las oportunidades llegan a través de personas que ya te conocen y te confían, no a través del acercamiento en frío. La calidad de la red importa más que el tamaño: los amigos, colegas y comunidades correctos se vuelven el puente. Cuando fuerzas un lanzamiento de desconocido a desconocido, las puertas se traban; cuando cuidas los vínculos, la vida se abre de lado.',
  },
  5: {
    name: 'Heretic',
    brief:
      'Resolvedor de problemas proyectado — otros ven en ti soluciones prácticas; gestiona las proyecciones con conciencia. La línea 5 queda colocada en el rol de quien arregla: la gente proyecta que tienes la respuesta para la crisis del momento. Eso puede ser poderoso cuando de verdad tienes una solución universal y práctica — y agotador cuando absorbes cada esperanza y cada culpa. La claridad sobre qué problemas te toca resolver (y cuáles son proyecciones) mantiene honesto y eficaz al Heretic.',
  },
  6: {
    name: 'Role Model',
    brief:
      'Proceso de vida en tres partes (prueba → retirada → encarnación); se vuelve un ejemplo vivo con el tiempo. Más o menos el primer tercio de la vida a menudo se siente como un experimento de línea 3 — probar, fallar y reunir cicatrices. Luego llega una fase de tejado / observador en la que das un paso atrás, miras e integras antes de saltar a cada pelea. Más tarde bajas como role model: no predicando teoría, sino encarnando lo que has vivido para que otros puedan ver un camino creíble.',
  },
};

export function profileLearnMore(profile: string): string {
  const raw = profile.trim();
  const m = /^(\d)\s*\/\s*(\d)$/.exec(raw);
  if (!m) {
    return "El Profile es la línea del Sol de Personality / la línea del Sol de Design — cómo sales al mundo y cómo lo digieres.";
  }
  const key = `${m[1]}/${m[2]}`;
  const combo = PROFILE_COMBO_ESSAYS[key];
  if (combo) return combo;

  const a = Number(m[1]);
  const b = Number(m[2]);
  const pa = PROFILE_LINES[a];
  const pb = PROFILE_LINES[b];
  return (
    `Línea consciente (Personality) ${a} — ${pa?.name}:\n${pa?.brief || ""}\n\n` +
    `Línea inconsciente (Design) ${b} — ${pb?.name}:\n${pb?.brief || ""}\n\n` +
    `Juntas, ${a}/${b} es una casa de dos plantas: la línea ${a} es cómo te encuentran primero los demás y cómo apareces de forma consciente; ` +
    `la línea ${b} es el proceso más hondo que hay debajo y que colorea cómo digieres la experiencia. ` +
    `Ninguna línea es mejor — el arte es dejar que el estilo de fuera y el proceso de dentro trabajen como un par, en vez de pelearse.`
  );
}

export const CENTER_COPY: Record<CenterKey, { defined: string; open: string; bodyHint: string }> =
{
    Head: {
      defined: 'Presión mental e inspiración siempre encendidas — las preguntas surgen desde dentro en un tema fiable. (Defined Head)',
      open: 'Tomas las preguntas y la inspiración de la sala — no cada enigma te toca resolverlo. (Open Head)',
      bodyHint: 'Presión de inspiración, temas del eje pineal/pituitario, carga de estimulación mental.',
    },
    Ajna: {
      defined: 'Formas de pensar siempre encendidas — un estilo fiable de procesamiento mental. (Defined Ajna)',
      open: 'Tomas muchas perspectivas — vigila el sobreanálisis y la adicción a la certeza. (Open Ajna)',
      bodyHint: 'Visualización, análisis, temas de neurotransmisores y de carga cognitiva.',
    },
    Throat: {
      defined: 'Expresión siempre encendida — la energía quiere ser dicha o hecha. (Defined Throat)',
      open: 'Tomas la presión de hablar — espera el momento de tu cuerpo antes de forzar la salida. (Open Throat)',
      bodyHint: 'Voz, salida de tiroides/expresión, ritmo metabólico de la comunicación.',
    },
    G: {
      defined: 'Identidad y dirección siempre encendidas — un sentido más estable de quién eres. (Defined G)',
      open: 'Tomas la dirección de la sala — busca lugares que se sientan como casa. (Open G)',
      bodyHint: 'Identidad, dirección, temas de hígado/sangre en el mapeo corporal tradicional de HD.',
    },
    Heart: {
      defined: 'Voluntad siempre encendida — puedes hacer y cumplir promesas desde el Heart. (Defined Heart)',
      open: 'La voluntad va y viene — no demuestres tu valía a base de sobrecarga; descansa cuando baja la voluntad. (Open Heart)',
      bodyHint: 'Voluntad, temas de estómago/corazón/vesícula, presión de demostrar / autoestima cuando está abierto.',
    },
    Solar_Plexus: {
      defined: 'Ola emocional siempre encendida — la claridad con el tiempo, no en el momento. (Defined Solar Plexus)',
      open: 'Tomas las emociones de los demás — tómate tiempo para sentir qué es tuyo. (Open Solar Plexus)',
      bodyHint: 'Sistema nervioso / ola emocional, sensibilidad del eje intestino-cerebro.',
    },
    Sacral: {
      defined: 'Energía de trabajo y de vida siempre encendida cuando respondes — el sí o no del cuerpo. (Defined Sacral)',
      open: 'No hay un motor de trabajo siempre encendido — importan más el descanso y las invitaciones reales. (Open Sacral)',
      bodyHint: 'Vitalidad, sexualidad, capacidad de trabajo, temas de energía reproductiva / intestinal.',
    },
    Spleen: {
      defined: 'Instinto siempre encendido en el ahora — golpes silenciosos sobre la seguridad y el momento. (Defined Spleen)',
      open: 'Tomas los miedos e instintos de los demás — distingue el ruido de un golpe verdadero. (Open Spleen)',
      bodyHint: 'Intuición inmune, conciencia del miedo, percepción de supervivencia en el momento.',
    },
    Root: {
      defined: 'Presión siempre encendida de moverte en temas fijos. (Defined Root)',
      open: 'Tomas la prisa y el estrés de los demás — suéltalos a propósito. (Open Root)',
      bodyHint: 'Presión adrenal, química del estrés, impulso de arranque y parada.',
    },
  } as Record<CenterKey, { defined: string; open: string; bodyHint: string }>;

export const TYPE_BATTERY: Record<string, string> =
{
    Generator: 'Construyes cuando algo fuera de ti enciende un sí del cuerpo — y te vacías cuando fuerzas arranques desde la mente. La satisfacción es la luz verde; la frustración significa que estás empujando la roca equivocada. (Type: Generator)',
    "Manifesting Generator": 'Responde, luego avisa, luego muévete. Puedes llevar varias pistas cuando el cuerpo dice sí, pero saltarte esa comprobación (o olvidarte de informar) crea resistencia. Velocidad después de la claridad, no antes. (Type: Manifesting Generator)',
    Manifestor: 'Te llegan impulsos de empezar — la habilidad es avisar a las personas afectadas para que el mundo no pise el freno. Protege las ventanas de iniciación; no estás aquí para estar disponible todo el rato. La paz es la luz verde; la ira es la luz de aviso. (Type: Manifestor)',
    Projector: 'Estás aquí para guiar, no para deslomarte todo el día. El reconocimiento y las invitaciones reales te llenan; perseguir te vacía. El éxito es la luz verde; la amargura significa que diste de más. (Type: Projector)',
    Reflector: 'Pruebas la sala — las personas y los lugares colorean cómo te sientes. Las decisiones grandes quieren alrededor de un mes lunar de prueba. Sorpresa y deleite en el lugar correcto; decepción en el equivocado. (Type: Reflector)',
  };

export const AUTHORITY_PLAIN: Record<string, string> =
{
    "Emotional (Solar Plexus)": 'Tus respuestas claras llegan después de que los sentimientos se mueven — deja dormir las decisiones grandes.',
    Sacral: 'El sí de tu cuerpo es un sonido del vientre o un tirón visceral en el ahora. ¿No es un sí claro? Es un no (o todavía no).',
    Splenic: 'El sí de tu cuerpo es un instinto silencioso sobre la seguridad y el momento — fácil de convencerte de lo contrario.',
    "Ego / Heart": 'El sí de tu cuerpo es lo que puedes querer de verdad y sostener — promesas que puedes cumplir.',
    "Self-Projected": 'El sí de tu cuerpo aparece cuando te oyes hablarlo en la compañía correcta.',
    Lunar: 'El sí de tu cuerpo necesita tiempo — prueba a lo largo de un ciclo lunar antes de cerrar las decisiones grandes.',
    "Mental / Environmental (Outer Authority)": 'Decides con cajas de resonancia de confianza y salas sanas — la mente refleja, no manda sola.',
  };

export const OPEN_CENTER_WATCH: Record<string, string> =
{
    Head: 'Puedes absorber las preguntas de otras personas — no cada enigma te toca resolverlo.',
    Ajna: 'Puedes probar todas las opiniones — vigila el pensar de más y la adicción a la certeza.',
    Throat: 'Puedes sentir presión de hablar o de actuar — espera el momento correcto.',
    G: 'La dirección puede cambiar con la sala — cambia de lugar antes de forzar un propósito.',
    Heart: 'La voluntad puede sentirse inconsistente — no demuestres tu valía sobrecargándote de compromisos.',
    Solar_Plexus: 'Amplificas las emociones que te rodean — comprueba qué es tuyo antes de decidir.',
    Sacral: 'No tienes un motor de trabajo constante — el descanso es Strategy, no un fracaso.',
    Spleen: 'Puedes recoger vibraciones de miedo — pausa antes de los agujeros de conejo de la alarma de salud.',
    Root: 'Amplificas la prisa — los plazos de otras personas no son automáticamente tuyos.',
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
  if (!m) return "Tu Profile es cómo sales al mundo y cómo digieres la experiencia.";
  const a = Number(m[1]);
  const b = Number(m[2]);
  const pa = PROFILE_LINES[a];
  const pb = PROFILE_LINES[b];
  return (
    `${a}/${b} — ${pa?.name || "?"} / ${pb?.name || "?"}.\n\n` +
    `Hacia fuera (línea ${a}): ${pa?.brief || ""}\n\n` +
    `Por debajo (línea ${b}): ${pb?.brief || ""}`
  );
}

export const CHANNEL_COPY_ES: Record<string, string> = CHANNEL_COPY;

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
  return "Un canal definido es un tema constante entre dos centros — un sabor fiable en cómo se mueve y se expresa tu energía.";
}
