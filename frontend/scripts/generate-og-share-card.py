#!/usr/bin/env python3
"""Optional, offline generator for frontend/public/og/share-1200x630.png.

Not a required runtime or CI step. Rebuilds the tighter Baseline share / Open
Graph card at 1200×630 from Inter and the shipped Growth B mark (icon.svg),
with the same linen + paper-grain language as the live #129 card.

Requires (box-local): Python 3 with Pillow and NumPy, Google Chrome, and
the Inter variable font used below.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FRONTEND = Path(__file__).resolve().parents[1]
FONT = Path("/usr/share/fonts/truetype/sand-box/google/Inter/Inter-VariableFont_opsz,wght.ttf")
ICON_SVG = FRONTEND / "src/app/icon.svg"
GRAIN_PNG = FRONTEND / "public/paper-grain.png"
OUT_PNG = FRONTEND / "public/og/share-1200x630.png"
WORK = Path("/tmp/og-share-card-gen")

LINEN = (247, 246, 242)  # #f7f6f2
INK = (47, 70, 54)  # #2f4636
W, H = 1200, 630

# Locked mock composition (badge 24.3% larger than the #129 144px mark).
BADGE_SIZE = 179
BADGE_XY = (246, 225)
GRAIN_ALPHA = 0.074  # multiply over linen, 256px tile — matches the #129 card

WORDMARK = "Baseline"
FEATURES = "Chart · Today · Protocols · Soul"

# Live #129 typography, scaled by 179/144. Wordmark is Inter semibold, tight
# tracking. The feature line is a smaller, lighter cut of Inter.
WORDMARK_SIZE = "calc(80px * 179 / 144)"
WORDMARK_TRACK = "-0.03em"
WORDMARK_WGHT = 600
WORDMARK_OPSZ = 18
WORDMARK_INK = (478, 246)  # ink-bbox top-left on the locked mock

FEATURES_SIZE = "calc(26px * 179 / 144)"
FEATURES_TRACK = "0.01em"
FEATURES_WGHT = 450
FEATURES_OPSZ = 14
FEATURES_INK = (473, 352)


def chrome_shot(html: str, name: str, width: int, height: int) -> Image.Image:
    WORK.mkdir(parents=True, exist_ok=True)
    hp = WORK / f"{name}.html"
    sp = WORK / f"{name}.png"
    hp.write_text(html)
    cmd = [
        "google-chrome",
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"--window-size={width},{height}",
        "--default-background-color=00000000",
        f"--screenshot={sp}",
        f"file://{hp}",
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    im = Image.open(sp)
    if im.size != (width, height):
        if im.size[0] >= width and im.size[1] >= height:
            im = im.crop((0, 0, width, height))
        else:
            im = im.resize((width, height), Image.Resampling.LANCZOS)
    return im


def render_badge(size: int) -> Image.Image:
    """Same Growth B path as icon.svg; 8× Chrome render, Lanczos down (as #129)."""
    svg = ICON_SVG.read_text()
    hi = size * 8
    html = f"""<!doctype html>
<meta charset="utf-8">
<style>
  html,body{{margin:0;padding:0;width:{hi}px;height:{hi}px;background:#3a5642;overflow:hidden;}}
  svg{{display:block;width:{hi}px;height:{hi}px;}}
</style>
{svg}
"""
    shot = chrome_shot(html, f"badge-hi-{hi}", hi, hi).convert("RGB")
    return shot.resize((size, size), Image.Resampling.LANCZOS)


def render_text(text: str, size_css: str, tracking: str, wght: int, opsz: int, name: str) -> Image.Image:
    cw, ch = 900, 200
    html = f"""<!doctype html>
<meta charset="utf-8">
<style>
@font-face {{
  font-family: InterVar;
  src: url("file://{FONT}") format("truetype");
  font-weight: 100 900;
  font-style: normal;
  font-display: block;
}}
html,body {{
  margin:0; padding:0; width:{cw}px; height:{ch}px;
  background:transparent; overflow:hidden;
}}
.t {{
  position:absolute; left:16px; top:24px;
  color:#2f4636;
  font-family: InterVar, Inter, sans-serif;
  font-weight: {wght};
  font-size: {size_css};
  letter-spacing: {tracking};
  font-optical-sizing: none;
  font-variation-settings: "wght" {wght}, "opsz" {opsz};
  line-height: 1;
  white-space: nowrap;
}}
</style>
<div class="t">{text}</div>
"""
    return chrome_shot(html, name, cw, ch)


def linen_grain() -> Image.Image:
    grain = np.array(Image.open(GRAIN_PNG).convert("L"))
    gh, gw = grain.shape
    ys = (np.arange(H) % gh)[:, None]
    xs = (np.arange(W) % gw)[None, :]
    g = grain[ys, xs].astype(np.float64)
    linen = np.array(LINEN, dtype=np.float64)
    a = GRAIN_ALPHA
    pred = linen * (1 - a + a * (g / 255.0))[:, :, None]
    pred = np.clip(np.round(pred), 0, 255).astype(np.uint8)
    return Image.fromarray(pred, "RGB")


def ink_bbox(im: Image.Image, thr: int = 160):
    arr = np.array(im.convert("RGBA") if im.mode == "RGBA" else im.convert("RGB"))
    if arr.shape[2] == 4:
        a = arr[:, :, 3]
        lum = arr[:, :, :3].mean(-1)
        mask = (a > 8) & (lum < thr)
    else:
        lum = arr.mean(-1)
        mask = lum < thr
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return None, arr
    return (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())), arr


def composite_text(canvas: Image.Image, text_im: Image.Image, ink_target_xy: tuple[int, int]):
    bbox, arr = ink_bbox(text_im)
    if not bbox:
        raise RuntimeError("no ink in text render")
    x0, y0, x1, y1 = bbox
    crop = arr[y0 : y1 + 1, x0 : x1 + 1]
    tx, ty = ink_target_xy
    canvas_arr = np.array(canvas.convert("RGB"))
    th, tw = crop.shape[0], crop.shape[1]
    dest = canvas_arr[ty : ty + th, tx : tx + tw].astype(np.float64)
    if crop.shape[2] == 4:
        rgb = crop[:, :, :3].astype(np.float64)
        alpha = crop[:, :, 3].astype(np.float64) / 255.0
        out = (1 - alpha[:, :, None]) * dest + alpha[:, :, None] * rgb
    else:
        linen = np.array(LINEN, dtype=np.float64)
        ink = np.array(INK, dtype=np.float64)
        rgb = crop.astype(np.float64)
        denom = np.where(np.abs(linen - ink) < 1e-6, 1, linen - ink)
        a = np.clip(((linen - rgb) / denom).mean(-1), 0, 1)
        out = (1 - a[:, :, None]) * dest + a[:, :, None] * ink
    canvas_arr[ty : ty + th, tx : tx + tw] = np.clip(np.round(out), 0, 255).astype(np.uint8)
    return Image.fromarray(canvas_arr, "RGB")


def main() -> int:
    if not FONT.is_file():
        print(f"missing Inter variable font: {FONT}", file=sys.stderr)
        return 1
    if not ICON_SVG.is_file() or not GRAIN_PNG.is_file():
        print("missing icon.svg or paper-grain.png", file=sys.stderr)
        return 1
    canvas = linen_grain()
    canvas.paste(render_badge(BADGE_SIZE), BADGE_XY)
    wm = render_text(WORDMARK, WORDMARK_SIZE, WORDMARK_TRACK, WORDMARK_WGHT, WORDMARK_OPSZ, "wm")
    canvas = composite_text(canvas, wm, WORDMARK_INK)
    ft = render_text(FEATURES, FEATURES_SIZE, FEATURES_TRACK, FEATURES_WGHT, FEATURES_OPSZ, "feat")
    canvas = composite_text(canvas, ft, FEATURES_INK)
    if canvas.size != (W, H) or canvas.mode != "RGB":
        raise RuntimeError(f"expected {W}x{H} RGB, got {canvas.size} {canvas.mode}")
    OUT_PNG.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT_PNG, "PNG")
    print(f"wrote {OUT_PNG.relative_to(ROOT)} ({W}x{H} {canvas.mode})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
