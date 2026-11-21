"""Prepare the character sprite sheets from the animation kit.

Run from the repo root:  python3 tools/prepare_sprites.py

Input : assets/kit-source/spritesheets/<name>.png  (4x4 grid of 512px frames, from the illustrator's kit)
Output: assets/sprites/<name>.webp                 (same grid, smaller, ink thickened/darkened)

The kit's pen lines are finer and greyer than the invitation's. Shown at the small size they have
in the scene, they would almost disappear, so each sheet gets its lines thickened (min filter on the
ink, max filter on the coverage) and darkened (gamma on the tone) before being scaled down.
"""
from PIL import Image, ImageFilter
import numpy as np

#  name       grow (px at 512)  gamma  output sheet size
SHEETS = {
    "owl":      (5, 2.0, 1024),
    "deer":     (5, 2.0, 1024),
    "teenager": (3, 1.6, 1536),
    "girl":     (3, 1.4, 1024),
    "boy":      (3, 1.5, 1024),
}

for name, (grow, gamma, size) in SHEETS.items():
    src = Image.open(f"assets/kit-source/spritesheets/{name}.png").convert("RGBA")
    a = np.array(src).astype(np.float32) / 255.0
    rgb, alpha = a[..., :3], a[..., 3]
    tone = rgb.mean(-1)
    tone = np.where(alpha > 0.02, tone, 1.0)          # transparent pixels count as paper
    tone_img = Image.fromarray((tone * 255).astype(np.uint8))
    alpha_img = Image.fromarray((alpha * 255).astype(np.uint8))
    if grow > 1:
        tone_img = tone_img.filter(ImageFilter.MinFilter(grow))
        alpha_img = alpha_img.filter(ImageFilter.MaxFilter(grow))
    tone = np.array(tone_img).astype(np.float32) / 255.0
    tone = np.power(tone, gamma)
    out = np.dstack([tone, tone, tone, np.array(alpha_img) / 255.0])
    img = Image.fromarray((out * 255).astype(np.uint8)).resize((size, size), Image.LANCZOS)
    img.save(f"assets/sprites/{name}.webp", quality=88, method=6)
    print(name, size)
