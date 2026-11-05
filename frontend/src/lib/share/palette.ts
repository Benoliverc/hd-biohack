/** Grounded Vitality tokens — match BodyGraph.tsx (not Co-Star monochrome). */
export const SHARE_PALETTE = {
  linen: "#F7F6F2",
  sage: "#3F624D",
  terracotta: "#C45B38",
  obsidian: "#1A1A1A",
  alabaster: "#F5F2EB",
  muted: "#6B6560",
  softSage: "rgba(63, 98, 77, 0.12)",
  softTerracotta: "rgba(196, 91, 56, 0.14)",
} as const;

export type ShareAspect = "story" | "feed";

export const SHARE_SIZES: Record<ShareAspect, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: "9:16" },
  feed: { w: 1080, h: 1350, label: "4:5" },
};

/** Meta Story safe zone ≈ 14% top / 35% bottom / 6% sides. */
export function shareSafeInsets(w: number, h: number) {
  return {
    top: Math.round(h * 0.14),
    bottom: Math.round(h * 0.35),
    side: Math.round(w * 0.06),
  };
}
