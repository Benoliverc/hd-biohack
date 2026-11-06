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
  /** Subtle linen-family spotlight behind the hero graph (no neon). */
  graphSpotlight: "rgba(255, 255, 255, 0.55)",
} as const;

export type ShareAspect = "story" | "feed";

export const SHARE_SIZES: Record<ShareAspect, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: "9:16" },
  feed: { w: 1080, h: 1350, label: "4:5" },
};

/**
 * Layout padding for the share card content column.
 *
 * Story: ~4% sides; soft top/bottom so critical text can start ~10% from top
 * and finish above ~22% from bottom. Feed: ~5–6% pad — never inherits Story
 * 14/35/6 chrome as an empty content box.
 *
 * BodyGraph size is computed from FULL canvas %, not from this pad box.
 */
export function shareLayoutPad(aspect: ShareAspect, w: number, h: number) {
  if (aspect === "feed") {
    return {
      top: Math.round(h * 0.055),
      bottom: Math.round(h * 0.07),
      side: Math.round(w * 0.055),
    };
  }
  return {
    top: Math.round(h * 0.1),
    bottom: Math.round(h * 0.22),
    side: Math.round(w * 0.04),
  };
}

/**
 * Text-safe bands (critical type / wordmark only). Soft washes and the
 * BodyGraph may enter Story lower third; Type/Profile/Strategy/wordmark stay
 * above the bottom danger. Replaces former shareSafeInsets (14/35/6 empty box).
 */
export function shareTextSafeInsets(aspect: ShareAspect, w: number, h: number) {
  return shareLayoutPad(aspect, w, h);
}

/** Hero graph height as a fraction of full canvas height. */
export function shareGraphHeightFrac(
  variant: "natal" | "today",
  aspect: ShareAspect
): number {
  if (variant === "natal") {
    return aspect === "feed" ? 0.5 : 0.46;
  }
  return aspect === "feed" ? 0.38 : 0.34;
}

/** Gap between graph and identity type (lockup glue). */
export function shareGraphTypeGapPx(aspect: ShareAspect): number {
  return aspect === "feed" ? 18 : 20;
}

/** BodyGraph aspect: width:height = 240:360 → H = W × 1.5. */
export const SHARE_GRAPH_ASPECT = 360 / 240;
