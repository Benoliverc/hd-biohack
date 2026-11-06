/** Educational Human Design copy for expand/collapse Profile UI (generic, not medical). */

import { PROFILE_COMBO_ESSAYS } from "./hdProfileCombos";
import { CHANNEL_COPY as CHANNEL_COPY_DATA } from "./hdChannelCopy";

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
      "You have a consistent Sacral — a defined life-force motor that hums when you are correctly engaged and goes dull when you are not. You are here to build and respond to what life puts in front of you, not to invent the next move in your head and push it into the world.\n\nYour Strategy is to wait to respond. A person, a question, a sound, or an opportunity appears, and your body answers with a yes, a no, or a not-yet, often before you can explain why. That gut response is more trustworthy than a clever plan.\n\nSatisfaction is the feeling that you are on track — the work or the day lights you up from the inside. Frustration is the warning light: you initiated from pressure, said yes to please someone, or stayed in something your Sacral never agreed to. Give your gut something real to answer, then follow what you actually feel, not the story about what you should want.",
  },
  "Manifesting Generator": {
    summary: "Sacral responders with a motor connected to the Throat — multi-passionate builders.",
    learnMore:
      "You have a defined Sacral and a motor connected to your Throat, so once something is a true yes you can move fast, skip steps, and hold more than one interest at a time. That speed is not a license to launch from the mind. You still respond first — the same gut yes or no as a Generator — and then you inform the people who will be affected before you change course. Informing is not asking permission; it is reducing friction so your momentum does not surprise anyone.\n\nSatisfaction mixed with a sense of success shows up when the Sacral is lit and others are not left in the dark. Frustration mixed with anger shows up when you skip the response, jump too soon, or feel boxed into one linear path. Multi-passionate is not flaky when each move was a real yes; it becomes draining when you chase every idea to avoid the pause that would tell you which one is actually yours.",
  },
  Manifestor: {
    summary: "Initiators with motor-to-Throat — designed to start and inform.",
    learnMore:
      "You are designed to initiate — to feel an inner urge and start something without waiting for the world to ask first. A motor connected to your Throat gives you impact: people feel you coming. That impact is why informing matters. Before you act, tell the people who will be affected what you are about to do. Informing is not asking permission or a committee vote; it is courtesy that lowers resistance so your urge can move.\n\nPeace is the signature of a Manifestor who is free to start and who remembers to inform. Anger rises when others try to control your pace, or when you disappear into action and everyone else has to guess. You are not here to wait for a Sacral response the way Generators are. Protect enough quiet to hear the urge, then move — and let the right people know, so your independence does not have to fight unnecessary battles.",
  },
  Projector: {
    summary: "Guides and systems-seers without consistent Sacral — wait for recognition.",
    learnMore:
      "You see people and systems with unusual clarity, and you are here to guide rather than grind. You do not have a consistent Sacral motor, so you are not designed for the same all-day doing energy as Generators. Your battery fills through recognition — being seen for what you actually notice — and through real rest.\n\nYour Strategy is to wait for the invitation, especially for work, love, and any big sharing of your advice. An invitation is someone who has recognized your seeing and asked you in. It is not you knocking until the door opens, and it is not offering a diagnosis no one requested. Recognition of your seeing is fuel; without it, even brilliant advice drains you.\n\nSuccess is the signature: the right people pull you into the right rooms and your guidance lands. Bitterness appears when you chase, prove, or give advice that was never asked for. That bitterness is useful information, not a character flaw — it usually means you spent energy without recognition. Protect your rest, share where you have been invited, and let \"not yet\" be a complete answer.",
  },
  Reflector: {
    summary: "Lunar mirrors with no defined centers — sample environments over a cycle.",
    learnMore:
      "You have no defined centers, which means you sample and reflect the people and places around you rather than running one fixed inner weather. That is a gift of discernment: you can feel the health of a room, a town, or a relationship more honestly than most. It is also why environment matters so much. The right community leaves you feeling surprisingly like yourself; the wrong one leaves you carrying everyone else’s mood.\n\nFor major decisions, wait about a lunar cycle — roughly twenty-eight days — so you can sample the choice from many inner weathers instead of locking in on one charged day. You are not here to be \"indecisive\"; you are here to be thorough. Clarity that survives a full cycle is yours.\n\nSurprise and delight are the signature of a Reflector in a healthy place. Disappointment arrives when you decide too fast or stay somewhere that does not love you back. Treat environment as the main lever, and notice who you become beside different people, rather than forcing a personality that was never meant to stay the same in every room.",
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
  const raw = profile.trim();
  const m = /^(\d)\s*\/\s*(\d)$/.exec(raw);
  if (!m) {
    return "Profile is Personality Sun line / Design Sun line — how you meet the world and how you digest it.";
  }
  const key = `${m[1]}/${m[2]}`;
  const combo = PROFILE_COMBO_ESSAYS[key];
  if (combo) return combo;

  const a = Number(m[1]);
  const b = Number(m[2]);
  const pa = PROFILE_LINES[a];
  const pb = PROFILE_LINES[b];
  return (
    `Conscious (Personality) Line ${a} — ${pa?.name}:\n${pa?.brief || ""}\n\n` +
    `Unconscious (Design) Line ${b} — ${pb?.name}:\n${pb?.brief || ""}\n\n` +
    `Together ${a}/${b} is a two-storey house: line ${a} is how others first meet you and how you consciously show up; ` +
    `line ${b} is the deeper process underneath that colours your digestion of experience. ` +
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

/** Re-export expanded Deep Dive channel essays (sorted gate-pair keys). */
export const CHANNEL_COPY: Record<string, string> = CHANNEL_COPY_DATA;

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

/* -------------------------------------------------------------------------- */
/* Literacy coach (Opt 1) — Chart /profile + Soul /soul + Today /transits     */
/* -------------------------------------------------------------------------- */

export type LiteracyDeepDiveTab = "core" | "centers" | "channels" | "planets";

export type LiteracyJumpMeta = {
  deepDiveTab?: LiteracyDeepDiveTab;
};

export type LiteracyStep = {
  id: string;
  title: string;
  body: string;
  /** Jump chip label shown to the user */
  jumpLabel: string;
  /** Element id to smooth-scroll to (without #) */
  targetId: string;
  /** Optional Chart deep-dive tab switch when jumping */
  deepDiveTab?: LiteracyDeepDiveTab;
};

/** localStorage: set to "1" when user dismisses (Got it). Absent = first visit expanded. */
export const LITERACY_STORAGE_KEYS = {
  chart: "baseline.literacy.chart.v1",
  soul: "baseline.literacy.soul.v1",
  today: "baseline.literacy.today.v1",
} as const;

export const CHART_LITERACY_STEPS: LiteracyStep[] = [
  {
    id: "defined-open",
    title: "Defined vs Open centers",
    body:
      "Colored shapes are Defined — think of them as a steady battery you always carry. That energy is yours day to day, so people feel a consistent you there. Pale (white) shapes are Open — places you soak up rooms and other people, amplify what's around you, and can feel drained if you stay plugged in too long. Start by noticing which is which on your map.",
    jumpLabel: "Bodygraph",
    targetId: "bodygraph",
  },
  {
    id: "channels-hanging",
    title: "Channels & hanging gates",
    body:
      "A channel is a full wire: both ends of a path between two centers are lit, so that circuit runs reliably in you. A hanging gate is a half-wire — one end is active and naturally seeks the other half in someone else or in the day's sky. That's why certain people feel magnetic: they complete a wire you've been carrying open.",
    jumpLabel: "Bodygraph",
    targetId: "bodygraph",
  },
  {
    id: "conscious-somatic",
    title: "Conscious · Somatic · Integrated",
    body:
      "The legend under your Bodygraph splits how each activation shows up. Darker chips are Conscious — what your mind notices and can talk about (Personality). Warmer chips are Somatic — what your body knows before words (Design). A ringed or dual mark means Integrated: both stories light the same place. You don't need to memorize jargon; just match the colors to the legend.",
    jumpLabel: "Legend",
    targetId: "bodygraph-legend",
  },
  {
    id: "type-strategy-authority",
    title: "Type → Strategy → Authority",
    body:
      "These three are your operating loop. Type is the kind of energy engine you run (how you move through a day). Strategy is the low-friction way life tends to invite you — following it usually means less push-and-resist. Authority is your body's yes: the quiet signal that a choice is right for you, before the mind stacks pros and cons. Snapshot puts all three in one place.",
    jumpLabel: "Snapshot",
    targetId: "snapshot",
  },
  {
    id: "centers-to-watch",
    title: "Centers to watch",
    body:
      "Open centers are where conditioning lands first — other people, weather, and the daily sky can pull your baseline off-center here. Snapshot lists the ones that matter most for you so you can notice the pull early instead of fighting symptoms later. Treat them as early-warning dials, not flaws.",
    jumpLabel: "Centers to watch",
    targetId: "snapshot-centers",
  },
  {
    id: "deep-dive",
    title: "Deep dive when you want more",
    body:
      "When the summary isn't enough, Deep dive opens the same map in finer grain: Core, Centers, Channels, and Planets. Same language as above — just the exact gates and lines under your Snapshot. Open it when you're curious; skip it when you only need the headline.",
    jumpLabel: "Deep dive",
    targetId: "deep-dive",
    deepDiveTab: "core",
  },
];


/** Order matches Soul DOM after Signature: Spectrums → Somatic → Power → Wire → Spark. */
export const SOUL_LITERACY_STEPS: LiteracyStep[] = [
  {
    id: "signature-not-score",
    title: "Aura Signature first",
    body:
      "The big label at the top describes how your two charts tend to lock together — the architecture of the bond across work, life, and play. It is not a grade, not a dating score, and not 'how good' you are for each other. Secondary badges only appear when something rare lights up; start with the Signature as the shape of the relationship, not a rating.",
    jumpLabel: "Signature",
    targetId: "soul-hero",
  },
  {
    id: "spectrums-not-fit",
    title: "Charge · continuity · pacing",
    body:
      "The three bars map relative charge (how much voltage you stir in each other), continuity (how steady the shared field feels), and pacing (how fast or slow you prefer to move together). High charge can mean high energy that needs clear protocols — it is not a bad match. Read them as rhythm dials, never as a fit percentage.",
    jumpLabel: "Spectrums",
    targetId: "soul-spectrums",
  },
  {
    id: "wire-somatic",
    title: "Somatic playbook + Wire",
    body:
      "The Tailored Somatic Playbook is body-first: simple co-regulation moves for this pair in the context you picked (work, life, or play). How You Wire Together names the circuit bridges between you — where a hanging half finds its other side. The centers strip shows who brings which defined baseline. Use these when you want something to try, not just a label.",
    jumpLabel: "Somatic playbook",
    targetId: "soul-card-somatic_playbook",
  },
  {
    id: "power-dynamics",
    title: "Power Dynamics to Tune",
    body:
      "Some channels show up as compromise: one of you holds a full channel while the other holds only a hanging gate on the same path. That can feel like fighting over the thermostat — same room, different set points. Each card below names who holds the fuller set point for that theme and gives a plain what-to-do. These are high-awareness zones to tune together; they are not a verdict that one person is 'in charge.'",
    jumpLabel: "Power Dynamics",
    targetId: "soul-card-power_dynamics",
  },
  {
    id: "spark-bedrock-dominance",
    title: "Spark, Bedrock, Dominance",
    body:
      "In Spark & Glue, three everyday patterns show up. Spark is when each of you holds one half of a channel — the click of ignition when you meet. Bedrock is when you both already have the full channel — a shared baseline you can lean on without drama. Dominance is when one person fully holds a channel the other doesn't — a steady gift to borrow from, not a power trip. Read the cards with those pictures in mind.",
    jumpLabel: "Spark & Glue",
    targetId: "soul-card-spark_glue",
  },
];

/** Order matches Today DOM after Move: new signal → Sun/Earth → bridged channels → newly defined. */
export const TODAY_LITERACY_STEPS: LiteracyStep[] = [
  {
    id: "today-new-signal",
    title: "Today's new signal",
    body:
      "This headline is the one change in the sky compared with yesterday. Baseline picks it in a fixed order: the Moon moving into a new gate or line, then a shift in the Sun's line or gate, then new pressure on a hanging gate you already carry, then a change in today's bridges or temporary centers. If none of those moved, you will see a continuity note — another day of the same theme, not a new assignment.\n\nThe Move above is the one thing to do with that weather. Read the signal as the \"what changed\" context for why this Move showed up, not as a second to-do. A Moon or Sun shift colors the day or week the Move sits inside. A conditioning update usually lines up with the bridges and temporary centers below, which also shape your Energy, Space, and the Move itself.",
    jumpLabel: "Today's new signal",
    targetId: "today-new-signal",
  },
  {
    id: "today-sun-earth",
    title: "Sun / Earth theme",
    body:
      "The Sun and Earth are always opposite each other in the sky. The Sun gate is the week's broader theme — what life is highlighting — and the Earth gate is the ground under it, the balancing place to stand. This pair moves slowly (the Sun stays in one gate for about six days), so it is a chapter, not an hourly weather report.\n\nThe Move is daily and practical. Sun / Earth is the longer background that Move belongs to. You do not need to act on the gate numbers separately, and they are not a second protocol. If you want a reason the week feels like it has a flavor, look here; if you want what to do today, stay with the Move.",
    jumpLabel: "Sun / Earth",
    targetId: "today-sun-earth",
  },
  {
    id: "today-bridged-channels",
    title: "Bridged channels (conditioning)",
    body:
      "A channel is a full wire between two centers. You may already hold one end (a hanging gate). Today's sky can bring the other end — or both ends — and temporarily complete a channel that is not part of your natal chart. That completed wire is a bridge. It is called conditioning because it is borrowed circuitry: it can feel vivid and magnetic, and it is not a permanent change to your Type or Strategy.\n\nBridges are one of the main inputs to today's Energy and Space, and therefore to the Move. A motor bridge can leave you feeling more charged than usual; a mind or identity bridge can pull you toward focus or a change of place. The Move often translates that as \"treat the energy as borrowed\" or \"one yes, then pause.\" Notice who or what feels suddenly complete today — that chemistry is often the other half of the wire, not a life verdict.",
    jumpLabel: "Bridged channels",
    targetId: "today-bridged-channels",
  },
  {
    id: "today-newly-defined",
    title: "Newly defined centers today",
    body:
      "Your natal chart has defined centers (steady, always-on) and open ones (where you sample life). When today's sky completes enough channels to light an open center, that center shows up here as temporarily defined. It can feel like unusual pressure, fuel, emotion, or willpower that was not yours yesterday. It is a weather event, not a new personality.\n\nThese temporary centers are one of the strongest reasons the Move reads the way it does. A borrowed Sacral or Heart can raise Energy and produce a \"use the charge once, then stop\" Move — it does not make you a Generator. Fresh mind centers (Head or Ajna) often ask for a quieter focus corner. If this list is empty, the sky is not lighting new centers today, and the Move leans more on your usual Type strategy. Do not over-identify with a center that will fade when the transit moves on.",
    jumpLabel: "Newly defined centers",
    targetId: "today-newly-defined",
  },
];
