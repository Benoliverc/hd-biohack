/** Educational Human Design copy for expand/collapse Profile UI (generic, not medical). */

export const CENTER_ORDER = [
  "Head",
  "Ajna",
  "Throat",
  "G",
  "Heart",
  "Solar_Plexus",
  "Sacral",
  "Spleen",
  "Root",
] as const;

export type CenterKey = (typeof CENTER_ORDER)[number];

export function displayCenter(key: string): string {
  const map: Record<string, string> = {
    Solar_Plexus: "Solar Plexus",
    Heart: "Ego / Heart",
    G: "G / Identity",
  };
  return map[key] || key;
}

export const TYPE_COPY: Record<
  string,
  { summary: string; learnMore: string }
> = {
  Generator: {
    summary: "Sacral energy builders who thrive by responding to life.",
    learnMore:
      "Generators have a defined Sacral and no motor-to-Throat. Your Strategy is to wait to respond (sounds, people, opportunities) rather than initiate from the mind. Satisfaction is your signature; frustration signals you're forcing or saying yes incorrectly.",
  },
  "Manifesting Generator": {
    summary: "Sacral responders with a motor connected to the Throat — multi-passionate builders.",
    learnMore:
      "Manifesting Generators respond first (Sacral), then inform others before acting. You can move quickly once the Sacral lights up, but skipping response creates resistance. Satisfaction + success when aligned; frustration + anger when not.",
  },
  Manifestor: {
    summary: "Initiators with motor-to-Throat — designed to start and inform.",
    learnMore:
      "Manifestors initiate from an inner urge, then inform those impacted. You are not here to wait for sacral response. Peace is the signature; anger appears when controlled or when you skip informing.",
  },
  Projector: {
    summary: "Guides and systems-seers without consistent Sacral — wait for recognition.",
    learnMore:
      "Projectors wait for the invitation (especially for work, love, and big sharing). Recognition of your seeing is fuel. Success is the signature; bitterness appears when you chase or give advice unasked.",
  },
  Reflector: {
    summary: "Lunar mirrors with no defined centers — sample environments over a cycle.",
    learnMore:
      "Reflectors wait ~28 days for major decisions. You reflect the health of people and places around you. Surprise / delight when in the right environment; disappointment when not.",
  },
};

export const STRATEGY_COPY: Record<string, string> = {
  "To Respond":
    "Engage when something in the outside world lights up your Sacral (gut response), not when the mind invents a plan.",
  "To Respond (then inform)":
    "Respond with the Sacral first, then inform people who will be affected before you act or change course.",
  "To Inform":
    "Before you initiate, tell the relevant people what you're about to do — it reduces resistance without needing permission.",
  "Wait for the Invitation":
    "Hold your guidance until you are recognized and invited into roles, relationships, and advice-giving.",
  "Wait a Lunar Cycle":
    "For big decisions, sample the environment across a full lunar month so clarity can settle.",
};

export const AUTHORITY_COPY: Record<string, string> = {
  "Emotional (Solar Plexus)":
    "Ride the emotional wave — no truth in the moment. Sleep on it; clarity comes over time, not in the peak or valley.",
  Sacral:
    "Trust gut sounds / visceral yes-no in the now. If it's not a clear yes, it's a no (or not yet).",
  Splenic:
    "Quiet, instinctive, in-the-moment knowing about health, safety, and timing — easy to override with the mind.",
  "Ego / Heart":
    "Decisions through willpower and honest commitments — what you can sustainably promise and stand behind.",
  "Self-Projected":
    "Talk it out; hear your own voice and identity direction. The right environment and listeners matter.",
  Lunar:
    "Reflector authority — give major choices a lunar cycle of sampling before locking in.",
  "Mental / Environmental (Outer Authority)":
    "No inner motor authority — use trusted sounding boards and healthy environments; the mind is for reflection, not deciding alone.",
};

export const DEFINITION_COPY: Record<string, string> = {
  "None (Reflector)":
    "No consistent definition — you sample and reflect everything around you.",
  Single:
    "All defined centers are connected in one continuous circuitry — energy flows as one stream.",
  Split:
    "Two separate areas of definition. Bridging gates (yours or others') can feel magnetic; notice who/what bridges your split.",
  "Triple Split":
    "Three separate areas of definition — you often need varied people and places to feel complete processing.",
  "Quadruple Split":
    "Four separate areas — highly modular energy; environments and timing matter a lot for feeling whole.",
};

/** Per-line profile themes. briefs are ~3× the old one-liners for Profile UI. */
export const PROFILE_LINES: Record<
  number,
  { name: string; brief: string }
> = {
  1: {
    name: "Investigator",
    brief:
      "Needs a solid foundation — research, study, and feel secure before trusting the ground. Line 1 digs for the base: facts, frameworks, and lived proof that something is safe enough to stand on. When the foundation feels thin, anxiety and over-preparation show up; when it feels solid, you teach and share with quiet authority. You are here to know enough that others can lean on what you have investigated.",
  },
  2: {
    name: "Hermit",
    brief:
      "Natural gifts others call out; needs alone time and to be called (not forced) into sharing. Line 2 carries talent that often feels effortless from the outside and mysterious to you — people notice what you do without trying. Solitude recharges the gift; performance on demand drains it. The healthy pattern is hermit time plus sincere calls that invite you out, not pressure that pushes you into every room.",
  },
  3: {
    name: "Martyr",
    brief:
      "Learns by trial and error — bonds made and broken; discovery through lived experience. Line 3 is designed to bump into life, test what works, and revise the map after contact with reality. Mistakes are data, not proof of failure; resilience comes from bouncing and telling the truth about what actually happened. You mature by collecting experiments until your lived wisdom becomes useful to others navigating the same terrain.",
  },
  4: {
    name: "Opportunist",
    brief:
      "Network and friendships open doors; influence travels through known people. Line 4 thrives in familiar circles — opportunities arrive through people who already know and trust you, not through cold outreach. Quality of network matters more than size: the right friends, colleagues, and communities become the bridge. When you force stranger-to-stranger launching, doors stick; when you nurture bonds, life opens sideways.",
  },
  5: {
    name: "Heretic",
    brief:
      "Projected problem-solver — others see practical solutions in you; manage projections consciously. Line 5 is cast into the role of fixer: people project that you have the answer for the crisis of the moment. That can be powerful when you truly have a universal, practical solution — and exhausting when you absorb every hope and blame. Clarity about which problems are yours to solve (and which are projections) keeps the heretic honest and effective.",
  },
  6: {
    name: "Role Model",
    brief:
      "Three-part life process (trial → withdrawal → embodiment); becomes a living example over time. Roughly the first third of life often feels like a line-3 experiment — trying, failing, and collecting scars. Then a roof / observer phase arrives where you step back, watch, and integrate before jumping into every fight. Later you step down as a role model: not preaching theory, but embodying what you have lived so others can see a credible path.",
  },
};

export function profileLearnMore(profile: string): string {
  const m = /^(\d)\s*\/\s*(\d)$/.exec(profile.trim());
  if (!m) {
    return "Profile is Personality Sun line / Design Sun line — how you meet the world and how you digest it.";
  }
  const a = Number(m[1]);
  const b = Number(m[2]);
  const pa = PROFILE_LINES[a];
  const pb = PROFILE_LINES[b];
  return (
    `Conscious (Personality) Line ${a} — ${pa?.name}:\n${pa?.brief || ""}\n\n` +
    `Unconscious (Design) Line ${b} — ${pb?.name}:\n${pb?.brief || ""}\n\n` +
    `Together ${a}/${b} is a two-story house: line ${a} is how others first meet you and how you consciously show up; ` +
    `line ${b} is the deeper process underneath that colors your digestion of experience. ` +
    `Neither line is better — the art is letting the outward style and the inner process work as a pair instead of fighting each other.`
  );
}

export const CENTER_COPY: Record<
  CenterKey,
  { defined: string; open: string; bodyHint: string }
> = {
  Head: {
    defined: "Consistent mental pressure and inspiration — questions arise from within on a reliable theme.",
    open: "Takes in others' questions and inspiration — amplify wisely; not every question is yours to solve.",
    bodyHint: "Inspiration pressure, pineal/pituitary axis themes, mental stimulation load.",
  },
  Ajna: {
    defined: "Fixed ways of thinking / conceptualizing — reliable mental processing style.",
    open: "Flexible mind that samples many perspectives — watch over-analysis and certainty addiction.",
    bodyHint: "Visualization, analysis, neurotransmitter / cognitive load themes.",
  },
  Throat: {
    defined: "Consistent expression and manifestation voice — energy wants to be said or done.",
    open: "Amplifies how/when to speak — wait for timing from Strategy & Authority before forcing output.",
    bodyHint: "Voice, thyroid/expression output, metabolic pacing of communication.",
  },
  G: {
    defined: "Consistent identity, direction, and love of self/place — a relatively fixed sense of who you are.",
    open: "Fluid identity — environment and people strongly color direction; seek places that feel like home.",
    bodyHint: "Identity, direction, liver/blood themes in traditional HD body mapping.",
  },
  Heart: {
    defined: "Consistent willpower and ego resource — can make and keep promises from the Heart.",
    open: "Willpower is inconsistent — don't prove worth through overwork; rest when will drops.",
    bodyHint: "Will, stomach/heart/gall themes, proving / self-worth pressure when open.",
  },
  Solar_Plexus: {
    defined: "Emotional wave authority — clarity over time, not in the moment.",
    open: "Amplifies others' emotions — take time to feel what is yours vs absorbed.",
    bodyHint: "Nervous system / emotional wave, gut-brain axis sensitivity.",
  },
  Sacral: {
    defined: "Sustainable life-force and work energy when responding correctly — gut response.",
    open: "No consistent sacral motor — don't live as a Generator; rest and invitations matter more.",
    bodyHint: "Vitality, sexuality, work capacity, reproductive / gut energy themes.",
  },
  Spleen: {
    defined: "Consistent instinct, intuition, and immune awareness in the now.",
    open: "Takes in others' fears and instincts — discern spontaneous fear from true splenic hit.",
    bodyHint: "Immune intuition, fear awareness, in-the-moment survival sensing.",
  },
  Root: {
    defined: "Consistent pressure to move / adrenaline pulse on fixed themes.",
    open: "Amplifies hurry and stress from others — release adrenal pressure deliberately.",
    bodyHint: "Adrenal pressure, stress chemistry, start/stop drive.",
  },
};

/** Spell gate.line as "Gate N · line L" (accepts "32.6", gate+line, or partial). */
export function formatGateLine(
  gateOrLabel: string | number | null | undefined,
  line?: string | number | null
): string {
  if (gateOrLabel == null || gateOrLabel === "") return "—";
  if (line != null && line !== "") {
    return `Gate ${gateOrLabel} · line ${line}`;
  }
  const s = String(gateOrLabel).trim();
  const m = /^(\d+)\s*[.\/]\s*(\d+)$/.exec(s);
  if (m) return `Gate ${m[1]} · line ${m[2]}`;
  const n = /^(\d+)$/.exec(s);
  if (n) return `Gate ${n[1]}`;
  return s;
}

/** Innerify-style battery / OS paragraph for chart explain. */
export const TYPE_BATTERY: Record<string, string> = {
  Generator:
    "Your operating system runs on Sacral response. Think of it as a battery that fills when something outside you lights up a gut yes — and drains when you force starts from the mind. Satisfaction is the green light; frustration means you're pushing the wrong rock.",
  "Manifesting Generator":
    "Your OS is respond → inform → move. You can multi-track once the Sacral says yes, but skipping the gut check (or forgetting to tell people) creates resistance. Your battery likes speed after clarity, not before.",
  Manifestor:
    "Your OS initiates. You get urges to start — the skill is informing the people impacted so the world doesn't slam the brakes. Your battery wants protected initiation windows, not constant availability. Peace is the green light; anger is the warning light.",
  Projector:
    "Your OS is guidance, not Sacral stamina. You see systems and people clearly — but your battery fills through recognition and invitations, and through real rest. Success is the green light; bitterness means you chased or over-gave.",
  Reflector:
    "Your OS is environmental. With no consistent centers, you sample the room — people and places become your 'stack'. Big decisions want a lunar-sized sample window. Surprise/delight in the right place; disappointment in the wrong one.",
};

export const AUTHORITY_PLAIN: Record<string, string> = {
  "Emotional (Solar Plexus)":
    "Your body's yes is a wave, not a moment. Sleep on it. No truth at the peak or the crash.",
  Sacral:
    "Your body's yes is a gut sound or visceral pull in the now. Not a clear yes? It's a no (or not yet).",
  Splenic:
    "Your body's yes is a quiet instinct about safety and timing — easy to talk yourself out of.",
  "Ego / Heart":
    "Your body's yes is what you can honestly will and sustain — promises you can keep.",
  "Self-Projected":
    "Your body's yes shows up when you hear yourself talk it out in the right company.",
  Lunar:
    "Your body's yes needs time — sample across a lunar cycle before locking big choices.",
  "Mental / Environmental (Outer Authority)":
    "You decide with trusted sounding boards and healthy rooms — the mind reflects, it doesn't boss alone.",
};

/** Open-center "energy leak" watch list in plain English. */
export const OPEN_CENTER_WATCH: Record<string, string> = {
  Head: "You can soak up other people's questions — not every puzzle is yours to solve.",
  Ajna: "You can sample every opinion — watch overthinking and certainty addiction.",
  Throat: "You can feel pressure to speak or perform — wait for correct timing.",
  G: "Direction can shift with the room — change place before forcing purpose.",
  Heart: "Willpower can feel inconsistent — don't prove worth by overcommitting.",
  Solar_Plexus: "You amplify emotions around you — check what's yours before deciding.",
  Sacral: "You don't have a consistent work motor — rest is strategy, not failure.",
  Spleen: "You can pick up fear vibes — pause before health-scare rabbit holes.",
  Root: "You amplify hurry — other people's deadlines aren't automatically yours.",
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
  if (!m) return "Your profile is how you meet the world and how you digest experience.";
  const a = Number(m[1]);
  const b = Number(m[2]);
  const pa = PROFILE_LINES[a];
  const pb = PROFILE_LINES[b];
  return (
    `${a}/${b} — ${pa?.name || "?"} / ${pb?.name || "?"}.\n\n` +
    `Outward (line ${a}): ${pa?.brief || ""}\n\n` +
    `Underneath (line ${b}): ${pb?.brief || ""}`
  );
}

/**
 * Educational meanings for the 36 defined channels.
 * Keys are sorted gate pairs as "A-B" (e.g. "19-49").
 */
export const CHANNEL_COPY: Record<string, string> = {
  "1-8":
    "Inspiration (G ↔ Throat) is creative self-expression that wants a contribution others can hear. When defined, you have a consistent stream of unique creative voice — not borrowing someone else's style, but offering what only you see. The channel thrives when you contribute without forcing applause; inspiration lands as example and invitation, not performance for validation.",
  "2-14":
    "The Beat (G ↔ Sacral) is the pulse of directed life-force — knowing where your energy wants to go and having the sacral fuel to stay on that beat. When defined, direction and work capacity lock together: you can sustain progress on a path that feels like yours. The gift is rhythmic forward motion; the trap is pouring sacral power into a direction that is not actually yours.",
  "3-60":
    "Mutation (Sacral ↔ Root) is pressure to innovate through limit — format energy that breaks old patterns when the timing is right. When defined, you carry a consistent pulse of change: melancholy or restlessness can signal that something wants to mutate. This is not constant reinvention for its own sake; it is sacral-root energy waiting for the correct moment to crack the format and birth the next form.",
  "4-63":
    "Logic (Ajna ↔ Head) is mental pressure applied to doubt and answers — the need to prove patterns through questioning. When defined, you consistently run a logic loop: doubt → hypothesis → verification. Useful for science, systems, and spotting what does not add up; draining when every social moment becomes a debate that must be solved in your head.",
  "5-15":
    "Rhythm (Sacral ↔ G) is fixed patterns in time and space — your natural tempo and how you occupy the flow of life. When defined, you have a consistent daily/seasonal rhythm and a way of being in the world that others feel as your pace. Honoring that beat (instead of forcing someone else's schedule) keeps the sacral healthy and your presence magnetic.",
  "6-59":
    "Intimacy (Solar Plexus ↔ Sacral) is emotional-sacral bonding — the chemistry of closeness, fertility, and letting another person past the walls. When defined, you have consistent energy for deep personal connection (and for the emotional weather that comes with it). This channel is about who gets access, not about being open to everyone; clarity over time matters as much as attraction in the moment.",
  "7-31":
    "The Alpha (G ↔ Throat) is elected leadership — influence that works when others recognize and choose you. When defined, you carry a consistent voice of direction for the group, but it lands best through democratic trust, not force. Leading without the invitation or the need of the circle creates resistance; leading when called becomes natural guidance.",
  "9-52":
    "Concentration (Sacral ↔ Root) is focused attention under pressure — the capacity to sit still and dig into detail. When defined, you can apply sacral energy to one thing with root drive behind it: deep work, fine detail, getting to the bottom. Scattered multitasking fights this channel; protected focus windows let it shine.",
  "10-20":
    "Awakening (G ↔ Throat) is self-aware expression in the now — being yourself out loud as life happens. When defined, identity and voice meet in present-moment authenticity: you say and do what matches who you are. The channel supports embodied integrity; performing a false self for approval pulls it off track.",
  "10-34":
    "Exploration (G ↔ Sacral) is following your own behavior and convictions with sacral power — self-love in motion. When defined, you have consistent energy to live by your own code and to explore life as yourself rather than as a role. It is integration energy: conviction plus life-force, not aggression for its own sake.",
  "10-57":
    "Perfected Form (G ↔ Spleen) is intuitive survival of the self — knowing in the body how to stay true and safe as you. When defined, identity and splenic instinct fuse: you get quiet hits about what form, posture, or choice keeps you intact. Ignoring those whispers to please others is the main way this channel gets overridden.",
  "11-56":
    "Curiosity (Ajna ↔ Throat) is ideas seeking a story — the seeker who turns concepts into tales others can follow. When defined, you consistently gather and share what fascinates you; teaching and storytelling are natural outlets. The edge is knowing when an idea is ripe to speak versus when it is still a private rabbit hole.",
  "12-22":
    "Openness (Throat ↔ Solar Plexus) is emotional expression timed by mood — social eloquence when the wave allows. When defined, you have a consistent channel for passionate, articulate sharing, but only when emotionally ready. Forcing charming output on a low wave feels false; waiting for the open mood makes your voice magnetic.",
  "13-33":
    "The Prodigal (G ↔ Throat) is the witness who leaves, learns, and returns with the story. When defined, you hold a consistent capacity to listen to experience (yours and others'), withdraw to integrate, and later speak the distilled narrative. It is memory and meaning for the tribe — not gossip, but the tale that helps people know where they have been.",
  "16-48":
    "The Wavelength (Throat ↔ Spleen) is talent meeting depth — skillful expression grounded in intuitive mastery. When defined, you can practice toward excellence and then perform or teach from an embodied knowing of what works. Superficial flash without depth, or endless practice with no expression, both starve this channel.",
  "17-62":
    "Acceptance (Ajna ↔ Throat) is opinions organized into detail — naming what you see so others can work with it. When defined, you have a consistent voice for structuring opinions into concrete, shareable facts and formulas. Useful in planning and critique; abrasive when every opinion must be spoken as absolute truth.",
  "18-58":
    "Judgment (Spleen ↔ Root) is the drive to correct and improve — joy through making things better. When defined, you feel consistent pressure to fix what is imperfect, from systems to standards. Aimed at service and vital joy, it elevates; aimed as chronic fault-finding toward self or others, it becomes harsh judgment without love.",
  "19-49":
    "Synthesis (Root ↔ Solar Plexus) is the channel of sensitivity and principles around needs, resources, and belonging. When defined, you feel consistent pressure about who is in or out, what the group needs, and whether the principles of care and fairness are being honored. It is tribal/emotional energy for revolution or reform when needs are unmet — and for deep loyalty when the principles feel right. Practically: you notice exclusion, hunger (literal or social), and emotional bargains; your clarity comes from riding the emotional wave before rewriting the rules of relationship or community.",
  "20-34":
    "Charisma (Throat ↔ Sacral) is busy power in the now — sacral energy that can speak and act immediately. When defined, you have a motor to the Throat: presence that gets things moving when you are correctly engaged. Busy-ness without sacral yes becomes burnout theater; response-based action becomes contagious charisma.",
  "20-57":
    "The Brain Wave (Throat ↔ Spleen) is intuitive knowing spoken in the moment — acoustic, spontaneous awareness. When defined, you get quiet splenic hits that want voice now, not after a committee meeting. Trusting the whisper and saying it cleanly is the gift; second-guessing it into silence (or dramatizing it) muddies the signal.",
  "21-45":
    "The Money Line (Heart ↔ Throat) is material stewardship voiced — control of resources and the right to decide how the tribe's wealth is used. When defined, willpower and voice meet around possession, leadership of resources, and fair exchange. Healthy expression is responsible kingship/queenship; unhealthy is control battles or proving worth through what you own.",
  "23-43":
    "Structuring (Ajna ↔ Throat) is insight that needs the right timing and words to land as genius instead of weird. When defined, you have a consistent individual mind-to-voice link: breakthrough knowing that wants to be explained in a structure others can follow. Speak too soon or without translation and people hear oddness; wait for recognition and frame the insight clearly and you sound ahead of the curve. Practically: protect incubation time, then package the download so the group can actually use it.",
  "24-61":
    "Awareness (Ajna ↔ Head) is the pressure to know the mystery — inner acoustic thinking that turns silence into insight. When defined, you live with a consistent mental pressure to resolve what does not yet make sense, often in quiet or solitude. Answers arrive as knowing rather than linear proof; forcing them with caffeine and overtalk usually delays the click.",
  "25-51":
    "Initiation (G ↔ Heart) is the leap into the unknown — competitive courage that initiates self and others. When defined, willpower meets identity as a shock or initiation energy: you can push through fear into new territory. Aimed at universal love and initiation of spirit, it awakens; aimed only at winning, it becomes bruising competition.",
  "26-44":
    "Surrender (Heart ↔ Spleen) is the transmitter — instinctive salesmanship and memory of what works in the tribe. When defined, you sense what people will buy into (ideas, products, stories) and have ego fuel to push it. Integrity matters: the channel is healthy when you stand behind what you transmit, not when you sell what you do not trust.",
  "27-50":
    "Preservation (Sacral ↔ Spleen) is caretaker energy — nourishment and values that protect what matters. When defined, you have consistent drive to feed, guard, and uphold standards for those in your care (people, projects, principles). Martyrdom is the shadow; sustainable care with clear values is the design.",
  "28-38":
    "Struggle (Root ↔ Spleen) is the search for meaning through challenge — knowing which fights are worth your life force. When defined, you feel consistent pressure to wrestle with purpose: pointless struggle drains you, meaningful struggle sharpens you. This is individual/sensing circuit energy — you are not here to suffer for sport, but to discover what is existentially worth standing for. Practically: before you dig in, ask whether the conflict connects to purpose; if yes, your stubborn courage is on-chart; if no, walk away and save the spleen.",
  "29-46":
    "Discovery (Sacral ↔ G) is saying yes to the experience — commitment that lets the body find success through immersion. When defined, sacral perseverence meets embodied identity: when you truly commit, life shows you things you cannot learn from the sidelines. Half-yes commitments create frustration; whole-body yes (per Strategy) becomes discovery.",
  "30-41":
    "Recognition (Solar Plexus ↔ Root) is feeling + hunger for experience — the wave of desire that starts new stories. When defined, you carry consistent emotional pressure to feel deeply and to hunger for what is next. Fantasies and feelings are fuel for experience cycles; clarity waits for the wave, not for the first rush of want.",
  "32-54":
    "Transformation (Spleen ↔ Root) is ambition guided by instinct — the drive to rise without abandoning what endures. When defined, you feel pressure to transform your material or social position, tempered by splenic knowing about what will last. Climbing without instinct becomes brittle striving; instinct without drive stalls potential.",
  "34-57":
    "Power (Sacral ↔ Spleen) is archetype energy of vital, intuitive power — strength that knows when to act. When defined, sacral life-force and splenic awareness fuse into a formidable presence in the now. Used with awareness, it protects and empowers; used blindly, it can steamroll. Integration circuit: this power is about being fully yourself in the body.",
  "35-36":
    "Transitoriness (Throat ↔ Solar Plexus) is the channel of experience — craving and telling the story of change. When defined, you have consistent emotional-throat energy for seeking new experiences and then articulating what they meant. Restlessness is part of the design; wisdom comes from completing emotional cycles, not from collecting thrills without digestion.",
  "37-40":
    "Community (Solar Plexus ↔ Heart) is the bargain of the tribe — loyalty, family deals, and honest exchange of work and care. When defined, emotional clarity and willpower meet around belonging: who owes what, who is family, what the deal is. Healthy community bargains feel warm and fair; unspoken or unfair bargains breed resentment.",
  "39-55":
    "Emoting (Root ↔ Solar Plexus) is mood as fuel — pressure that provocatively tests spirit and emotional depth. When defined, you generate emotional weather that can provoke yourself and others toward honesty of spirit. Melancholy and passion are both on the menu; the gift is emotional creativity, not dumping mood as blame.",
  "42-53":
    "Maturation (Sacral ↔ Root) is cycles begun and completed — format energy for starting and finishing growth processes. When defined, you feel consistent pressure to begin cycles and sacral capacity to stay until maturation. Jumping mid-cycle or never starting both frustrate this channel; honoring beginnings and endings brings satisfaction.",
  "47-64":
    "Abstraction (Ajna ↔ Head) is mental pressure to make sense of confusion — realizing meaning from the past's fragments. When defined, you live with a consistent stream of images, memories, and confusing downloads that want a realization. Forcing the epiphany rarely works; giving the mind space (and not identifying with every confused state) lets the abstract click into meaning.",
};

/** Look up educational meaning for an active channel by gate pair and/or name. */
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
  return "A defined channel is a consistent energetic pathway between two centers — a reliable theme in how your energy moves and expresses.";
}
