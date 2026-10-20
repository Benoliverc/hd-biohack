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

export const PROFILE_LINES: Record<
  number,
  { name: string; brief: string }
> = {
  1: {
    name: "Investigator",
    brief: "Needs a solid foundation — research, study, and feel secure before trusting the ground.",
  },
  2: {
    name: "Hermit",
    brief: "Natural gifts others call out; needs alone time and to be called (not forced) into sharing.",
  },
  3: {
    name: "Martyr",
    brief: "Learns by trial and error — bonds made and broken; discovery through lived experience.",
  },
  4: {
    name: "Opportunist",
    brief: "Network and friendships open doors; influence travels through known people.",
  },
  5: {
    name: "Heretic",
    brief: "Projected problem-solver — others see practical solutions in you; manage projections consciously.",
  },
  6: {
    name: "Role Model",
    brief: "Three-part life process (trial → withdrawal → embodiment); becomes a living example over time.",
  },
};

export function profileLearnMore(profile: string): string {
  const m = /^(\d)\s*\/\s*(\d)$/.exec(profile.trim());
  if (!m) return "Profile is Personality Sun line / Design Sun line — how you meet the world and how you digest it.";
  const a = Number(m[1]);
  const b = Number(m[2]);
  const pa = PROFILE_LINES[a];
  const pb = PROFILE_LINES[b];
  return `Conscious (Personality) Line ${a} — ${pa?.name}: ${pa?.brief}\n\nUnconscious (Design) Line ${b} — ${pb?.name}: ${pb?.brief}\n\nTogether ${a}/${b} is how others meet you (line ${a}) and the deeper process underneath (line ${b}).`;
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
  return `${a}/${b} — ${pa?.name || "?"} / ${pb?.name || "?"}. Outward: ${pa?.brief || ""} Underneath: ${pb?.brief || ""}`;
}
