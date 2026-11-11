export const STARTER_SUPPLEMENTS = [
  "Magnesium Glycinate",
  "Omega-3",
  "Vitamin D3",
  "Creatine",
  "Ashwagandha",
] as const;

/** Slug for Today starter testids, e.g. magnesium-glycinate. */
export function starterSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
