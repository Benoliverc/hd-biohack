import { createRoot, type Root } from "react-dom/client";
import { type ReactElement } from "react";
import { toBlob } from "html-to-image";
import html2canvas from "html2canvas";
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
 * styles, then rasterize the mounted `[data-share-card]` node to a PNG blob
 * (sRGB). Never captures live app chrome / nav / Why drawer.
 *
 * Raster path:
 * 1. Flatten nested BodyGraph SVGs to PNG `<img>`s (pure SVG → canvas — no
 *    foreignObject, so Chromium does not taint on that step).
 * 2. Prefer `html-to-image` `toBlob` on the mounted card node.
 * 3. If Chromium still taints (foreignObject internals), fall back to
 *    `html2canvas` with `foreignObjectRendering: false` on that same node.
 *
 * Avoids the old hand-rolled SVG+foreignObject → Image → canvas SecurityError.
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

    // Nested SVG inside foreignObject taints Chromium canvases. Rasterize
    // BodyGraph (and any other) SVGs to PNG imgs first, then capture the node.
    await replaceSvgsWithPngImages(card);
    await waitFrames(1);

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
 * Pure SVG (no foreignObject) → canvas → PNG data URL → replace `<svg>` with
 * `<img>`. Safe to read pixels; Chromium does not taint on pure SVG drawImage.
 */
async function replaceSvgsWithPngImages(root: HTMLElement): Promise<void> {
  const svgs = Array.from(root.querySelectorAll("svg"));
  for (const svg of svgs) {
    const rect = svg.getBoundingClientRect();
    const attrW = Number(svg.getAttribute("width")) || 0;
    const attrH = Number(svg.getAttribute("height")) || 0;
    const width = Math.max(
      1,
      Math.round(rect.width || attrW || svg.clientWidth || 1)
    );
    const height = Math.max(
      1,
      Math.round(rect.height || attrH || svg.clientHeight || 1)
    );

    const clone = svg.cloneNode(true) as SVGSVGElement;
    if (!clone.getAttribute("xmlns")) {
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));

    const xml = new XMLSerializer().serializeToString(clone);
    const url = URL.createObjectURL(
      new Blob([xml], { type: "image/svg+xml;charset=utf-8" })
    );
    try {
      const img = new Image();
      img.decoding = "sync";
      img.src = url;
      await img.decode();

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", {
        colorSpace: "srgb",
      } as CanvasRenderingContext2DSettings);
      if (!ctx) throw new Error("Canvas 2D unavailable");
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/png");

      const replacement = document.createElement("img");
      replacement.src = dataUrl;
      replacement.width = width;
      replacement.height = height;
      replacement.alt = "";
      replacement.setAttribute("data-share-svg-raster", "true");
      const prior = (svg as SVGElement).getAttribute("style") || "";
      replacement.style.cssText =
        prior ||
        `width:${width}px;height:${height}px;display:block;max-width:none;`;
      svg.replaceWith(replacement);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png"
    );
  });
}

/**
 * Rasterize the already-mounted off-screen card node.
 * Prefer html-to-image; on tainted-canvas SecurityError fall back to
 * html2canvas (foreignObjectRendering: false) on the same node only.
 */
async function elementToPngBlob(
  el: HTMLElement,
  width: number,
  height: number
): Promise<Blob> {
  if (!el.style.backgroundColor) {
    el.style.backgroundColor = "#F7F6F2";
  }
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  el.style.boxSizing = "border-box";
  el.style.margin = "0";

  try {
    const blob = await toBlob(el, {
      width,
      height,
      canvasWidth: width,
      canvasHeight: height,
      pixelRatio: 1,
      backgroundColor: "#F7F6F2",
      cacheBust: true,
      skipAutoScale: true,
    });
    if (!blob || blob.size < 32) {
      throw new Error("html-to-image toBlob returned empty PNG");
    }
    return blob;
  } catch (err) {
    // Chromium may still taint html-to-image's internal foreignObject path
    // (even after SVG flatten). html2canvas with foreignObjectRendering:false
    // redraws the DOM on this same node and does not taint.
    void err;
    const canvas = await html2canvas(el, {
      width,
      height,
      scale: 1,
      backgroundColor: "#F7F6F2",
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: false,
      logging: false,
      imageTimeout: 15_000,
    });
    if (canvas.width !== width || canvas.height !== height) {
      // Normalize to exact export pixels if the library rounded.
      const normalized = document.createElement("canvas");
      normalized.width = width;
      normalized.height = height;
      const ctx = normalized.getContext("2d", {
        colorSpace: "srgb",
      } as CanvasRenderingContext2DSettings);
      if (!ctx) throw new Error("Canvas 2D unavailable");
      ctx.fillStyle = "#F7F6F2";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(canvas, 0, 0, width, height);
      return canvasToPngBlob(normalized);
    }
    return canvasToPngBlob(canvas);
  }
}
