import { createElement } from "react";
import {
  ShareBaselineCard,
  type ShareBaselineCardProps,
} from "@/components/share/ShareBaselineCard";
import { SHARE_SIZES, type ShareAspect } from "./palette";
import { rasterizeOffscreenCard } from "./rasterizeCard";
import { shareCardImage } from "./shareCardImage";

export async function captureAndShareBaseline(
  props: ShareBaselineCardProps,
  opts?: { title?: string; filenameStem?: string }
): Promise<"shared" | "downloaded" | "clipboard"> {
  const aspect: ShareAspect = props.aspect;
  const size = SHARE_SIZES[aspect];
  const element = createElement(ShareBaselineCard, props);
  const blob = await rasterizeOffscreenCard(element, size);

  const stem =
    opts?.filenameStem ||
    (props.variant === "natal" ? "baseline-natal" : "baseline-today");
  const filename = `${stem}-${aspect}-${size.w}x${size.h}.png`;
  const title =
    opts?.title ||
    (props.variant === "natal" ? "My Baseline" : "My Baseline · today");

  // Privacy: never put chart IDs, emails, or kit contents in share text.
  return shareCardImage(blob, filename, title);
}
