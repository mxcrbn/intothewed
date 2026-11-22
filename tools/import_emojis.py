"""Import the hand-drawn emojis used in the RSVP form (art/emojis/1024, from the emoji pack) into
public/assets/emoji, cropped to the drawing, 128 px tall.

The pack's pen lines are very fine (about 14 px wide in the 1024 px heart hands, 7 px in the hug, which
is also drawn at about 60 % opacity): shrunk to text size (~35 CSS px) they would be under half a pixel
and look grey. Each emoji's strokes are thickened to about 28 px and brought up to full charcoal before
reducing it, so the lines match the drawing's ink beside the text.

Run from the repo root:  python3 tools/import_emojis.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

site = Path(__file__).resolve().parent.parent
SRC, OUT = site / "art/emojis/1024", site / "public/assets/emoji"
INK = (28, 28, 28)                       # the drawing's charcoal, #1c1c1c
EMOJIS = {                               # name: stroke thickening in the 1024 px drawing (odd, px)
    "heart-hands": 15,                   # 14 px strokes -> ~28
    "hugging": 21,                       # 7 px strokes -> ~27
    "smiling-hearts": 21,                # 🥰, for the thank-you
}
HEIGHT = 128                             # px; the emojis show at ~13–20 CSS px tall: crisp on 3x screens
PAD = 0.03                               # clear margin kept around the drawing, as a share of its size

OUT.mkdir(parents=True, exist_ok=True)
for name, grow in EMOJIS.items():
    im = Image.open(SRC / f"{name}.png").convert("RGBA")
    alpha = im.getchannel("A")
    if grow:
        alpha = alpha.filter(ImageFilter.MaxFilter(grow))
    a = np.asarray(alpha).astype(float)
    p90 = np.percentile(a[a > 20], 90)
    a = np.clip(a * 250 / p90, 0, 255)   # the strokes' cores at full ink, soft edges kept
    ink = Image.new("RGBA", im.size, INK + (0,))
    ink.putalpha(Image.fromarray(a.astype(np.uint8)))
    # crop to the drawing itself (the pack's square canvas has wide blank margins), so the page can
    # size and align the emoji on its ink rather than on empty space
    x0, y0, x1, y1 = ink.getchannel("A").point(lambda v: 255 if v > 12 else 0).getbbox()
    pad = round(PAD * max(x1 - x0, y1 - y0))
    ink = ink.crop((max(x0 - pad, 0), max(y0 - pad, 0), min(x1 + pad, ink.width), min(y1 + pad, ink.height)))
    w = round(ink.width * HEIGHT / ink.height)
    small = ink.convert("RGBa").resize((w, HEIGHT), Image.LANCZOS).convert("RGBA")
    small.save(OUT / f"{name}.png", optimize=True)
    print(f"{name}: ink p90 {p90:.0f} -> 250, grow {grow}  ->  {OUT.relative_to(site)}/{name}.png  {w}x{HEIGHT}")
