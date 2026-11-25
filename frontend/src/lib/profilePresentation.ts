import { PROFILE_LINES } from "@/lib/hdCopy";

/** Read the legacy serialized briefs only at this presentation boundary. */
export function profilePresentation(profile: string, existingCopy = "") {
  const match = /^([1-6])\s*\/\s*([1-6])$/.exec(profile.trim());
  if (!match) return { value: profile, sections: [] };
  const first = PROFILE_LINES[Number(match[1])];
  const second = PROFILE_LINES[Number(match[2])];
  const value = `${match[1]}/${match[2]} — ${first.name} / ${second.name}`;
  const [, firstBrief, secondBrief] = existingCopy.split("\n\n");
  const stripLegacyLabel = (text: string) => text.slice(text.indexOf(": ") + 2);
  const sections = firstBrief && secondBrief
    ? [
        { name: first.name, brief: stripLegacyLabel(firstBrief) },
        { name: second.name, brief: stripLegacyLabel(secondBrief) },
      ]
    : [];
  return { value, sections };
}
