/**
 * Copy computed fills/strokes onto SVG presentational attributes so rasterization
 * does not depend on cross-origin stylesheets (Mobile Safari).
 */
const PRESENTATIONAL = [
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "stroke-dashoffset",
  "opacity",
  "fill-opacity",
  "stroke-opacity",
  "font-size",
  "font-weight",
  "font-family",
  "text-anchor",
  "dominant-baseline",
] as const;

export function inlineSvgStyles(root: ParentNode): void {
  const nodes = root.querySelectorAll("svg, svg *");
  nodes.forEach((node) => {
    if (!(node instanceof SVGElement)) return;
    const cs = window.getComputedStyle(node);
    for (const prop of PRESENTATIONAL) {
      const value = cs.getPropertyValue(prop);
      if (!value || value === "normal" || value === "none") {
        // Keep explicit "none" fills when already set as attribute.
        if (prop === "fill" || prop === "stroke") {
          if (!node.getAttribute(prop)) continue;
        } else {
          continue;
        }
      }
      // Prefer existing attribute (BodyGraph already inlines); only fill gaps.
      if (!node.getAttribute(prop) && value && value !== "none") {
        node.setAttribute(prop, value);
      }
    }
  });
}
