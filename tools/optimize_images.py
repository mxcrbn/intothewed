"""Build the two big images the site serves from their masters in art/, at the weight they need.

Run from the repo root:  python3 tools/optimize_images.py

  - the drawing behind the animation: art/trees/background.png (1536 x 1024, 1 MB) is saved as a
    lossless WebP, pixel for pixel the same, a third lighter;
  - the rings: art/rings-animation/rings-4x.png (1536 x 960, 0.5 MB) is shown at most 260 CSS px
    wide, so it is reduced once to 768 x 480 (still sharp on 3x phone screens).
"""
from pathlib import Path

import numpy as np
from PIL import Image

site = Path(__file__).resolve().parent.parent

src = site / "art/trees/background.png"
out = site / "public/assets/trees/background.webp"
bg = Image.open(src).convert("RGB")
bg.save(out, "WEBP", lossless=True, quality=100, method=6)
assert np.array_equal(np.asarray(Image.open(out).convert("RGB")), np.asarray(bg)), "not lossless"
print(f"background: {src.stat().st_size // 1024} kB -> {out.stat().st_size // 1024} kB (lossless)")

src = site / "art/rings-animation/rings-4x.png"
out = site / "public/assets/rings/rings.png"
rings = Image.open(src).convert("RGBA")
small = rings.convert("RGBa").resize((768, 480), Image.LANCZOS).convert("RGBA")
small.save(out, optimize=True)
print(f"rings: {src.stat().st_size // 1024} kB -> {out.stat().st_size // 1024} kB ({small.width} x {small.height})")
