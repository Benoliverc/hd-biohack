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
    summary: "You build best when something real lights up a gut yes. (Type: Generator)",
    learnMore:
      "You have steady work energy that turns on when life gives you something to answer — in Human Design that motor is called the Sacral. It hums when you are correctly engaged and goes dull when you are not. You are here to build and respond to what life puts in front of you, not to invent the next move in your head and push it into the world.\n\nYour Strategy is to wait to respond. A person, a question, a sound, or an opportunity appears, and your body answers with a yes, a no, or a not-yet, often before you can explain why. That gut response is more trustworthy than a clever plan.\n\nSatisfaction is the feeling that you are on track — the work or the day lights you up from the inside. Frustration is the warning light: you initiated from pressure, said yes to please someone, or stayed in something your Sacral never agreed to. Give your gut something real to answer, then follow what you actually feel, not the story about what you should want.",
  },
  "Manifesting Generator": {
    summary: "You move fast once something is a real yes — and you tell people before you pivot. (Type: Manifesting Generator)",
    learnMore:
      "You have steady work energy that turns on when life gives you something to answer — in Human Design that motor is called the Sacral — and a path to your Throat, so once something is a true yes you can move fast, skip steps, and hold more than one interest at a time. That speed is not a license to launch from the mind. You still respond first — the same gut yes or no as a Generator — and then you inform the people who will be affected before you change course. Informing is not asking permission; it is reducing friction so your momentum does not surprise anyone.\n\nSatisfaction mixed with a sense of success shows up when the Sacral is lit and others are not left in the dark. Frustration mixed with anger shows up when you skip the response, jump too soon, or feel boxed into one linear path. Multi-passionate is not flaky when each move was a real yes; it becomes draining when you chase every idea to avoid the pause that would tell you which one is actually yours.",
  },
  Manifestor: {
    summary: "You're built to start — and to tell the people it'll affect before you move. (Type: Manifestor)",
    learnMore:
      "You're built to start — to feel an inner urge and begin without waiting for the world to ask first. In Human Design, a motor connected to your Throat gives you impact: people feel you coming. That impact is why informing matters. Before you act, tell the people who will be affected what you are about to do. Informing is not asking permission or a committee vote; it is courtesy that lowers resistance so your urge can move.\n\nPeace is the signature of a Manifestor who is free to start and who remembers to inform. Anger rises when others try to control your pace, or when you disappear into action and everyone else has to guess. You are not here to wait for a Sacral response the way Generators are. Protect enough quiet to hear the urge, then move — and let the right people know, so your independence does not have to fight unnecessary battles.",
  },
  Projector: {
    summary: "You see systems clearly — share that sight where you are invited in. (Type: Projector)",
    learnMore:
      "You see people and systems with unusual clarity, and you are here to guide rather than grind. You do not have a consistent Sacral motor, so you are not built for the same all-day doing energy as Generators. Your energy fills through recognition — being seen for what you actually notice — and through real rest.\n\nYour Strategy is to wait for the invitation, especially for work, love, and any big sharing of your advice. An invitation is someone who has recognized your seeing and asked you in. It is not you knocking until the door opens, and it is not offering a diagnosis no one requested. Recognition of your seeing is fuel; without it, even brilliant advice drains you.\n\nSuccess is the signature: the right people pull you into the right rooms and your guidance lands. Bitterness appears when you chase, prove, or give advice that was never asked for. That bitterness is useful information, not a character flaw — it usually means you spent energy without recognition. Protect your rest, share where you have been invited, and let \"not yet\" be a complete answer.",
  },
  Reflector: {
    summary: "You sample people and places — big clarity often wants a full lunar cycle. (Type: Reflector)",
    learnMore:
      "You have no defined centers, which means you sample and reflect the people and places around you rather than running one fixed inner weather. That is a gift of discernment: you can feel the health of a room, a town, or a relationship more honestly than most. It is also why environment matters so much. The right community leaves you feeling surprisingly like yourself; the wrong one leaves you carrying everyone else's mood.\n\nFor major decisions, wait about a lunar cycle — roughly twenty-eight days — so you can sample the choice from many inner weathers instead of locking in on one charged day. You are not here to be \"indecisive\"; you are here to be thorough. Clarity that survives a full cycle is yours.\n\nSurprise and delight are the signature of a Reflector in a healthy place. Disappointment arrives when you decide too fast or stay somewhere that does not love you back. Treat environment as the main lever, and notice who you become beside different people, rather than forcing a personality that was never meant to stay the same in every room.",
  },
};

export const STRATEGY_COPY: Record<
  string,
  { summary: string; learnMore: string }
> = {
  "To Respond": {
    summary:
      "Wait for something real to answer — a gut yes beats a clever plan. (Strategy: To Respond)",
    learnMore:
      "You are designed to engage after life gives you something to answer — a person, a question, an invitation, a sound, or an opportunity that shows up outside your head. Your Sacral is a consistent gut response: it lights up with a yes, goes dull with a no, or stays unclear when the timing is not yet. That response is faster and more honest than a clever plan. Waiting to respond is not passivity. It is letting the world start the conversation so your energy can meet something real.\n\nIn practice this looks like pausing before you volunteer, apply, or invent the next move. Give your body something concrete to react to. A yes often feels like warmth, expansion, or an unmistakable uh-huh. A no feels flat, heavy, or like you would have to talk yourself into it. If it is not a clear yes, treat it as a no or a not yet rather than a puzzle your mind has to solve.\n\nWhen you respond correctly, work and relationships tend to have more flow and less grind — that is satisfaction. When you initiate from pressure, people-pleasing, or a story about what you should want, frustration builds. Use frustration as information: you probably said yes without a sacral yes, or you are pushing a plan no one actually placed in front of you.",
  },
  "To Respond (then inform)": {
    summary:
      "Feel the gut yes first, then tell the people it'll affect before you move. (Strategy: To Respond, then inform)",
    learnMore:
      "You still wait to respond before you move. A person, a question, or an opportunity appears, and your Sacral answers with a yes, a no, or a not yet. That gut check is the same as a Generator's — speed is not a license to launch from the mind. After a true yes, tell the people who will be affected what you are about to do, or that you are changing course. Informing is not asking permission. It is reducing friction so your fast, skipping-steps energy does not leave others scrambling.\n\nDay to day, the sequence is: wait for something real, feel the body answer, then speak the next move before you disappear into it. A short \"I'm going to take this and drop that\" often prevents the resistance that feels like the world is slamming on the brakes. If the Sacral is quiet, do not fill the silence with a plan just because you can execute quickly.\n\nWhen this strategy is working, you get to move at your natural pace without constantly repairing surprise. When you skip the response or forget to inform, frustration and a flash of anger usually follow — either because you committed without a yes, or because people try to control a change they never heard about. Slow down only long enough to respond and inform; then let yourself go fast.",
  },
  "To Inform": {
    summary:
      "Before you start, tell the people it'll touch — courtesy, not permission. (Strategy: To Inform)",
    learnMore:
      "You are designed to start from an inner urge, not to wait for the world to ask first. The strategy that makes that initiation work is informing: before you act, tell the relevant people what you are about to do. Informing is not asking permission or putting your urge up for a vote. It is a courtesy that lowers resistance, because people feel a Manifestor's impact coming and they tense up when they have to guess.\n\nIn practice, pick the people who will actually be affected — a partner, a team, a household — and give them a clear heads-up. You do not need a long justification. \"I'm starting this\" or \"I need the afternoon uninterrupted\" is enough. Then move. Waiting until everyone is comfortable often starves the urge; disappearing without a word often creates the very control and pushback you were trying to avoid.\n\nPeace is what it feels like when you are free to start and you remembered to inform. Anger rises when others try to manage your pace, or when you vanish into action and everyone else is left cleaning up the surprise. Protect enough quiet to hear the urge, inform the right people, and go — so your independence does not have to fight unnecessary battles.",
  },
  "Wait for the Invitation": {
    summary:
      "Share your guidance where you are recognized and asked in. (Strategy: Wait for the Invitation)",
    learnMore:
      "Your correct way in is to wait until you are recognized and invited — especially for work, love, and any big sharing of your advice. An invitation is someone who has seen what you actually notice and asked you in. It is not you knocking until the door opens, and it is not offering a diagnosis no one requested. Recognition of your seeing is fuel; without it, even brilliant guidance drains you.\n\nIn daily life this can look slower than the culture around you. You can still live, learn, and be visible; the strategy is about not forcing the big doors. Share your seeing where it has been asked for. Let smaller recognitions accumulate. If you catch yourself proving how useful you are, that is usually the mind trying to create an invitation that has not arrived yet.\n\nSuccess is the feeling that the right people pulled you into the right rooms and your guidance landed. Bitterness appears when you chase, over-give, or advise without being asked. That bitterness is useful information, not a character flaw — it usually means you spent energy without recognition. Protect your rest, wait for the ask, and let \"not yet\" be a complete answer.",
  },
  "Wait a Lunar Cycle": {
    summary:
      "For big choices, sample across about a month so clarity can settle. (Strategy: Wait a Lunar Cycle)",
    learnMore:
      "For major decisions, your strategy is to sample across a full lunar cycle — about twenty-eight days — instead of locking in on one charged day. You have no defined centers, so you take in the people and places around you. A single conversation or a single mood can feel like certainty when it is mostly the room talking. Time lets you feel the same choice from many inner weathers until something stable remains.\n\nThis does not mean you cannot choose lunch or answer a simple email. It means the big commitments — where to live, whom to partner with, a job, a move — want a longer sample. Talk to different people, visit the place more than once, and notice who you become beside the option rather than forcing a personality that stays the same in every room. You are not being indecisive; you are being thorough.\n\nSurprise and delight show up when a choice still feels like yours after a full cycle, especially in an environment that loves you back. Disappointment arrives when you decide too fast or stay somewhere that only felt right on one day. Treat time and environment as the main levers, and trust clarity that survives the month.",
  },
};

export const AUTHORITY_COPY: Record<
  string,
  { summary: string; learnMore: string }
> = {
  "Emotional (Solar Plexus)": {
    summary:
      "Clear answers arrive after feelings move — sleep on big calls. (Authority: Emotional)",
    learnMore:
      "Your clear answers arrive after feelings move, not at the high or the low. In Human Design this is Emotional authority (Solar Plexus). Sleep on big calls. Feelings move rather than arriving as a single permanent verdict. A high can make almost anything look like a forever yes. A low can make a good thing look impossible. Clarity comes after you have felt more than one point on the wave — often after a night of sleep, and sometimes after several days.\n\nIn practice, do not sign, commit, or declare your final answer at the crest or the dip. You can notice the first feeling and still wait. \"I need to sit with this\" is a complete response. Talk if it helps you feel the wave, but do not let a persuasive conversation become the decision. The mind will try to freeze one mood into a story; your job is to let the weather change and see what remains.\n\nWhen you honor the wave, decisions tend to feel settled rather than dramatic — you just know, without the same heat. When you decide in a spike or a crash, regret and second-guessing usually follow, not because you are flaky, but because you treated a weather report as climate. Give important choices time, and trust the answer that is still true after the wave has moved.",
  },
  Sacral: {
    summary:
      "Trust the gut yes-or-no in the now — if it's not clear, it's a no or not yet. (Authority: Sacral)",
    learnMore:
      "Your authority is sacral: in the now, your body answers with a visceral yes or no — often a sound, a pull toward something, or a flatness that is easy to miss if you are busy explaining. This is not a five-year plan. It is a response to what is in front of you right now. If it is not a clear yes, it is a no, or a not yet. A maybe you have to justify is usually the mind trying to override the gut.\n\nIn practice, ask questions that can be answered with the body, not essays. \"Do I want this?\" \"Is this a yes for Tuesday?\" Listen for expansion, animation, or an uh-huh versus tightness, dullness, or having to talk yourself into it. Other people can present options; they cannot feel your Sacral for you. If you need time, it may be because there is nothing concrete to respond to yet — get a clearer offer rather than forcing a mental decision.\n\nWhen you follow the gut, energy tends to stay available for what you said yes to. When you override it to be polite, impressive, or consistent with an old plan, frustration builds and the body often drags. Trust the in-the-moment response even when you cannot yet explain it, and let explanations come after the yes or no, not before.",
  },
  Splenic: {
    summary:
      "A quiet instinct about safety and timing in the moment — easy for the mind to talk over. (Authority: Splenic)",
    learnMore:
      "Your authority is splenic: a quiet, instinctive knowing in the moment about health, safety, and timing. The Spleen speaks once, softly, and does not argue. It can feel like a sudden \"this is okay\" or \"leave now\" without a speech attached. The mind is much louder, so it is easy to talk yourself out of the hit a few seconds later and then call that reasoning wisdom.\n\nIn practice, notice the first flicker — a sense of well-being, a twitch of caution, a feeling that the timing is right or off — and give it more weight than the story that follows. Splenic hits are about the now, not about proving a case for next month. You may not get a second warning in the same words. Journaling after the fact can help you learn your own flavor of instinct, but the decision itself happens in the moment, not in a spreadsheet.\n\nWhen you trust it, life often feels simpler and safer, even if you cannot justify every choice to other people. When you override it, you may later say \"I knew\" — that phrase is usually the spleen you ignored. Do not confuse anxiety spirals or other people's fear with a true splenic hit; the real one is brief, quiet, and specific to this moment.",
  },
  "Ego / Heart": {
    summary:
      "Decide by what you can honestly will and keep promising. (Authority: Ego / Heart)",
    learnMore:
      "Your authority is ego, or heart: you decide through willpower and honest commitment — what you can sustainably promise and actually stand behind. This is not about proving you are strong enough to do everything. It is about whether your heart is truly in the promise, and whether you have the will to see it through without abandoning yourself.\n\nIn practice, ask \"Can I commit to this?\" and \"Will I still respect myself if I keep this promise?\" rather than \"Would this impress people?\" A correct yes has a quality of \"I will\" — a willingness to put your name on it. A no can be equally clean: you will not bargain your will just to look reliable. Making fewer, truer commitments usually works better than stacking obligations you then have to muscle through.\n\nWhen this authority is honored, your word means something to you and to others, and effort feels chosen rather than extracted. When you say yes to prove worth, or no out of fear of being seen as selfish, the heart gets tired and resentment follows. Decide from what you can honestly will, then keep those promises — that is the authority working, not the size of the workload.",
  },
  "Self-Projected": {
    summary:
      "Talk it out — you hear your direction in your own voice. (Authority: Self-Projected)",
    learnMore:
      "Your authority is self-projected: you hear your direction by speaking it. Clarity lives in your voice and identity — in hearing yourself talk about the choice — not in silently analyzing every angle. The right listeners and the right environment matter. You are not looking for them to decide for you; you are looking for a space where your own words can show you who you are in relation to the option.\n\nIn practice, talk it out with people who can listen without immediately fixing or recruiting you. Notice what you hear yourself say, and how your tone changes when you describe one path versus another. A true direction often sounds like you recognizing yourself: the words have life. If you go quiet, get talked over, or start performing the answer you think they want, change the room and speak again.\n\nWhen this is working, you leave the conversation knowing more than when you entered, even if the other person barely advised you. When you decide only in your head, or in a room that distorts who you are, you can feel lost or like you agreed to someone else's identity. Give yourself voices and places that let you hear you, then follow what you heard yourself say.",
  },
  Lunar: {
    summary:
      "Give major choices about a month of sampling before you lock in. (Authority: Lunar)",
    learnMore:
      "Your authority is lunar, which goes with being a Reflector: major choices need a full lunar cycle of sampling before you lock them in. Because you have no defined centers, each day can color the choice differently. One conversation might feel like destiny; a week later the same option feels empty. Time is not delay here — it is the way your clarity is built.\n\nIn practice, take big decisions around the month. Visit the place more than once, speak with different people, and write down how the choice feels on several days rather than trusting a single high or low. Smaller daily choices do not all need twenty-eight days; save the long sample for things that change your environment, work, or relationships. You are not indecisive; you are designed to be thorough.\n\nSurprise and delight are signs you waited long enough in a place that suits you. Disappointment often means you froze a temporary reflection into a permanent yes, or you stayed somewhere that never settled into feeling like you. Let the cycle complete, then choose what is still true.",
  },
  "Mental / Environmental (Outer Authority)": {
    summary:
      "Use trusted people and healthy rooms — the mind reflects; it does not boss alone. (Authority: Mental / Environmental)",
    learnMore:
      "You do not have an inner motor authority making decisions from a consistent emotional wave, sacral response, spleen, or heart will. Your mind is excellent at reflecting, comparing, and talking things through — and it is not meant to boss alone. Clarity comes from healthy environments and trusted sounding boards: the right rooms and the right people help you see, while the wrong ones leave you mentally spinning.\n\nIn practice, do not lock a big choice in isolation or in a stressful space. Take the question for a walk, sit with people who listen well, and notice how the same option feels in different settings. You are looking for what becomes clear when the environment is supportive, not for a louder argument in your head. Other people are mirrors and sounding boards; they should not become a committee that decides for you.\n\nWhen this works, decisions feel quieter and more obvious after good company and a good place — as if the answer organized itself. When you force a solo mental verdict under pressure, doubt tends to bounce back immediately. Change the room, talk it out, and let the mind do what it does best: reflect, rather than command.",
  },
};

export const DEFINITION_COPY: Record<
  string,
  { summary: string; learnMore: string }
> = {
  "None (Reflector)": {
    summary: "Nothing stays always-on inside — you sample and reflect the room. (Definition: None)",
    learnMore:
      "You have no consistent definition — no centers that are always \"on\" in the same way. That means you sample and reflect the people, places, and moods around you rather than running one fixed inner weather. This is a gift of discernment: you can feel the health of a room more honestly than most. It is also why environment is not a side detail for you; it is the main condition of how you feel like yourself.\n\nIn daily life you may notice you become a slightly different person beside different people, and that is not fake. The right community leaves you feeling surprisingly like you. The wrong one leaves you carrying everyone else's weather, then wondering why you cannot find a stable personality to hold onto. Moving your body into a better place often helps more than trying to think your way into a firmer identity.\n\nBecause nothing is permanently hooked up inside, you are designed to taste life in cycles rather than force a single consistent output. Treat that openness as sensitivity with a purpose, not as a missing piece. Choose rooms that love you back, and give yourself time to notice who you are after the sampling, instead of demanding a definition you were never meant to have.",
  },
  Single: {
    summary:
      "Your always-on themes link as one stream — you can often process without waiting for a bridge. (Definition: Single)",
    learnMore:
      "Your always-on themes link as one stream, so what you think, say, and do is more hooked together than in a split definition. That can feel steady and self-contained: you do not usually need another person to \"bridge\" two separate parts of you before you can process something all the way through.\n\nIn practice, you may notice you can come to things on your own timeline and that your chart has a kind of internal completeness. Other people still matter — for relationship, collaboration, and perspective — but they are not usually completing a gap between two disconnected areas of your design. The gift is coherence. The shadow is becoming so self-contained that you forget how much you still take in through open centers.\n\nWhen single definition is working, you feel like one person from the inside: the process starts and can finish without waiting for a missing link. If you feel stuck, it is more often about environment, type, or authority than about needing someone to bridge you. Trust the unified stream, and use other people for connection rather than as wiring you lack.",
  },
  Split: {
    summary:
      "You run in two steady clusters that don't fully connect on their own. Some people feel oddly completing — they temporarily bridge the gap. (Definition: Split)",
    learnMore:
      "You run in two steady clusters of always-on themes that don't fully connect through your own channels. Energy does not automatically flow from one part of you to the other. The space between them is the split. Bridging gates — activations you do not have, which other people or transits can bring — often feel magnetic, because they temporarily hook the two parts together.\n\nIn daily life you may notice that certain people make you feel strangely complete, articulate, or able to process something that was stuck. That chemistry is often the bridge, not proof that they are your destiny. It can be wonderful, and it can also create dependency if you outsource your sense of wholeness to whoever happens to fill the gap. Notice who or what bridges you: a person, a place, a conversation, even a bit of time alone after stimulation.\n\nThe gift of a split is perspective: you see more than one way of being inside yourself, and relationships can literally help you think or act all the way through. The work is staying aware of the magnet without abandoning your own authority. You do not have to fuse with every person who bridges you. Let people bring connection, then still decide as you.",
  },
  "Triple Split": {
    summary:
      "Three separate clusters — varied people and places often help you finish processing. (Definition: Triple Split)",
    learnMore:
      "You have three separate areas of definition — three clusters that do not all link up through your own channels. Processing often happens in parts. You may need more variety in people and places than a single or simple split definition, not because you are unfocused, but because different environments hook up different pieces of your circuitry.\n\nIn practice, one conversation or one room is rarely enough to feel fully processed. Moving through your day — different people, a walk between meetings, a change of setting — can do more than sitting with a single sounding board until you force a conclusion. You are not broken for needing circulation; your chart is modular. Pressure to \"just decide already\" in one sealed environment often backfires.\n\nWhen this is working, a fuller picture assembles after you have sampled a few contexts, and you feel more whole without needing any one person to complete you. When it is not, you can feel fragmented, impatient with yourself, or overly attached to whoever briefly linked two of the three parts. Give yourself varied contact and a bit of time, then let the pieces settle into one decision.",
  },
  "Quadruple Split": {
    summary:
      "Four separate clusters — environment and timing matter a lot for feeling whole. (Definition: Quadruple Split)",
    learnMore:
      "You have four separate areas of definition, which is uncommon and highly modular. Your consistent energy comes in distinct pieces rather than one or two streams. Feeling whole often depends more on environment and timing than it does for most people — not because you lack anything essential, but because the bridges between those pieces are not built into you.\n\nIn daily life you may need even more circulation: different people, different places, and enough time for the parts to meet. A single intense relationship or a single sealed workday can leave some of you offline. Variety is functional here. So is patience. You are not meant to feel like one fused current all the time.\n\nThe gift is flexibility and a wide-angle view; you can hold several modes without collapsing them into one. The strain comes if you demand constant internal unity or if you latch onto whoever momentarily connects the pieces. Move through environments, let timing help, and measure wholeness across a day or a week rather than in one frozen moment.",
  },
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
    defined: "Always-on mental pressure and inspiration — questions arise from within on a reliable theme. (Defined Head)",
    open: "You pick up the room's questions and inspiration — not every puzzle is yours to solve. (Open Head)",
    bodyHint: "Inspiration pressure, pineal/pituitary axis themes, mental stimulation load.",
  },
  Ajna: {
    defined: "Always-on ways of thinking — a reliable mental processing style. (Defined Ajna)",
    open: "You pick up many perspectives — watch over-analysis and certainty addiction. (Open Ajna)",
    bodyHint: "Visualization, analysis, neurotransmitter / cognitive load themes.",
  },
  Throat: {
    defined: "Always-on expression — energy wants to be said or done. (Defined Throat)",
    open: "You pick up pressure to speak — wait for your body's timing before forcing output. (Open Throat)",
    bodyHint: "Voice, thyroid/expression output, metabolic pacing of communication.",
  },
  G: {
    defined: "Always-on identity and direction — a steadier sense of who you are. (Defined G)",
    open: "You pick up the room's direction — seek places that feel like home. (Open G)",
    bodyHint: "Identity, direction, liver/blood themes in traditional HD body mapping.",
  },
  Heart: {
    defined: "Always-on will — you can make and keep promises from the Heart. (Defined Heart)",
    open: "Will comes and goes — don't prove worth through overwork; rest when will drops. (Open Heart)",
    bodyHint: "Will, stomach/heart/gall themes, proving / self-worth pressure when open.",
  },
  Solar_Plexus: {
    defined: "Always-on emotional wave — clarity over time, not in the moment. (Defined Solar Plexus)",
    open: "You pick up others' emotions — take time to feel what is yours. (Open Solar Plexus)",
    bodyHint: "Nervous system / emotional wave, gut-brain axis sensitivity.",
  },
  Sacral: {
    defined: "Always-on work-and-life energy when you respond — gut yes/no. (Defined Sacral)",
    open: "No always-on work motor — rest and real invitations matter more. (Open Sacral)",
    bodyHint: "Vitality, sexuality, work capacity, reproductive / gut energy themes.",
  },
  Spleen: {
    defined: "Always-on instinct in the now — quiet hits about safety and timing. (Defined Spleen)",
    open: "You pick up others' fears and instincts — discern noise from a true hit. (Open Spleen)",
    bodyHint: "Immune intuition, fear awareness, in-the-moment survival sensing.",
  },
  Root: {
    defined: "Always-on pressure to move on fixed themes. (Defined Root)",
    open: "You pick up hurry and stress from others — release it on purpose. (Open Root)",
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
    "You build when something outside you lights up a gut yes — and you drain when you force starts from the mind. Satisfaction is the green light; frustration means you're pushing the wrong rock. (Type: Generator)",
  "Manifesting Generator":
    "Respond, then tell people, then move. You can multi-track once the gut says yes, but skipping that check (or forgetting to inform) creates resistance. Speed after clarity, not before. (Type: Manifesting Generator)",
  Manifestor:
    "You get urges to start — the skill is telling the people impacted so the world doesn't slam the brakes. Protect initiation windows; you are not built for constant availability. Peace is the green light; anger is the warning light. (Type: Manifestor)",
  Projector:
    "You are built to guide, not to grind all day. Recognition and real invitations fill you; chasing drains you. Success is the green light; bitterness means you over-gave. (Type: Projector)",
  Reflector:
    "You sample the room — people and places color how you feel. Big decisions want about a lunar month of sampling. Surprise and delight in the right place; disappointment in the wrong one. (Type: Reflector)",
};

export const AUTHORITY_PLAIN: Record<string, string> = {
  "Emotional (Solar Plexus)":
    "Your clear answers arrive after feelings move — sleep on big calls.",
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
  return "A defined channel is a steady theme between two centers — a reliable flavour in how your energy moves and expresses.";
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
      "Colored shapes are Defined — always-on for you. Pale shapes are Open — you pick up the room there and can tire if you stay plugged in too long.",
    jumpLabel: "Bodygraph",
    targetId: "bodygraph",
  },
  {
    id: "channels-hanging",
    title: "Channels & hanging gates",
    body:
      "A channel is a full wire: both ends of a path between two centers are lit, so that theme runs reliably in you. A hanging gate means you hold one end of a wire. Certain people (or certain days) can feel magnetic because they bring the other end.",
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
      "Open centers are where other people and places can pull your baseline off-center first. Snapshot lists the ones that matter most for you so you can notice the pull early instead of fighting symptoms later. Treat them as early-warning dials, not flaws.",
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
    title: "Pace · steadiness · intensity",
    body:
      "The three bars map relative intensity (how much you stir in each other), steadiness (how continuous the shared field feels), and pace (how fast or slow you prefer to move together). High intensity can mean high energy that needs clear protocols — it is not a bad match. Read them as rhythm dials, never as a fit percentage.",
    jumpLabel: "Spectrums",
    targetId: "soul-spectrums",
  },
  {
    id: "wire-somatic",
    title: "Somatic playbook + Wire",
    body:
      "The playbook is body-first: simple co-regulation moves for this pair in the context you picked (work, life, or play). How You Wire Together names where a half-wire meets its other side. The centers strip shows who brings which always-on theme. Use these when you want something to try, not just a label.",
    jumpLabel: "Somatic playbook",
    targetId: "soul-card-somatic_playbook",
  },
  {
    id: "power-dynamics",
    title: "Power Dynamics to Tune",
    body:
      "Sometimes one of you holds the full theme; the other holds only half. That can feel like fighting over the thermostat — same room, different set points. Each card below names who holds the fuller set point for that theme and gives a plain what-to-do. These are high-awareness zones to tune together; they are not a verdict that one person is 'in charge.'",
    jumpLabel: "Power Dynamics",
    targetId: "soul-card-power_dynamics",
  },
  {
    id: "spark-bedrock-dominance",
    title: "Spark, Bedrock, Dominance",
    body:
      "In Spark & Glue, three everyday patterns show up. Spark is ignition when you meet — each of you holds one half of a wire. Bedrock is shared themes you both already hold — a baseline you can lean on without drama. Dominance is when one person fully holds a theme the other doesn't — a steady gift to borrow from, not a power trip. Role names live in Learn more.",
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
