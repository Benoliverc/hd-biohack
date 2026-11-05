import { createRoot, type Root } from "react-dom/client";
import { type ReactElement } from "react";
import { inlineSvgStyles } from "./inlineSvgStyles";

function waitFrames(n = 2): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) => {
      if (left <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(() => step(left - 1));
    };
    step(n);
  });
}

/**
 * Mount an off-screen card at target CSS pixels, wait for fonts, inline SVG
 * styles, then rasterize to a PNG blob (sRGB via canvas).
 * Never captures live app chrome.
 */
export async function rasterizeOffscreenCard(
  element: ReactElement,
  size: { w: number; h: number }
): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("rasterizeOffscreenCard requires a browser document");
  }

  const host = document.createElement("div");
  host.setAttribute("data-share-host", "true");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "width:" + size.w + "px",
    "height:" + size.h + "px",
    "overflow:hidden",
    "pointer-events:none",
    "z-index:-1",
    "opacity:1",
  ].join(";");
  document.body.appendChild(host);

  let root: Root | null = createRoot(host);
  try {
    await new Promise<void>((resolve, reject) => {
      try {
        root!.render(element);
        // Give React a commit + layout pass.
        requestAnimationFrame(() => resolve());
      } catch (e) {
        reject(e);
      }
    });

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await waitFrames(2);

    const card =
      (host.querySelector("[data-share-card]") as HTMLElement | null) ||
      (host.firstElementChild as HTMLElement | null);
    if (!card) {
      throw new Error("Share card did not mount");
    }

    // Ensure laid out at target pixels.
    card.style.width = `${size.w}px`;
    card.style.height = `${size.h}px`;
    await waitFrames(1);

    inlineSvgStyles(card);

    const blob = await elementToPngBlob(card, size.w, size.h);
    return blob;
  } finally {
    try {
      root?.unmount();
    } catch {
      /* ignore */
    }
    root = null;
    host.remove();
  }
}

/**
 * HTML → PNG via SVG foreignObject. Card must use inline styles (no Tailwind
 * dependency) so Mobile Safari paints fills without stylesheets.
 */
async function elementToPngBlob(
  el: HTMLElement,
  width: number,
  height: number
): Promise<Blob> {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  // Solid linen fallback behind transparent bits.
  if (!clone.style.backgroundColor) {
    clone.style.backgroundColor = "#F7F6F2";
  }
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.boxSizing = "border-box";
  clone.style.margin = "0";

  const serialized = new XMLSerializer().serializeToString(clone);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<foreignObject width="100%" height="100%">` +
    serialized +
    `</foreignObject></svg>`;

  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.decoding = "sync";
    img.src = url;
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { colorSpace: "srgb" } as CanvasRenderingContext2DSettings);
    if (!ctx) throw new Error("Canvas 2D unavailable");
    ctx.fillStyle = "#F7F6F2";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
        "image/png"
      );
    });
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

