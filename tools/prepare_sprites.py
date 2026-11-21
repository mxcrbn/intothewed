"""Prepare the character sprite sheets from the animation kit.

Run from the repo root:  python3 tools/prepare_sprites.py

Input : assets/kit-source/spritesheets/<name>.png  (4x4 grid of 512px frames, from the illustrator's kit)
Output: assets/sprites/<name>.webp                 (same grid, smaller, pencil-toned)

The kit's lines are cleaner and darker than the invitation's soft grey pencil. Each sheet is
brought to the invite's look:
  - lines slightly thickened where they would vanish at their small on-screen size (grow),
  - their darkness scaled down to the invite's mid-grey (ink),
  - a slow random "pressure" variation along the strokes, so they read as pencil, not vector,
  - a touch of softening,
  - the inside of each figure filled with paper white, so branches and trunks behind it
    don't show through (the kit only has the lines, on transparency).
"""
from PIL import Image, ImageFilter, ImageDraw
import numpy as np

#  name       grow (odd px at 512)  ink (darkness scale)  output sheet size
SHEETS = {
    "owl":      (3, 0.85, 1024),
    "deer":     (1, 1.00, 1024),   # no thickening: a finer line
    "teenager": (3, 0.85, 1536),
    "girl":     (3, 0.88, 1024),
    "boy":      (3, 0.85, 1024),
}
PRESSURE = (0.7, 1.0)   # range of the pencil-pressure variation
GRAIN = 14               # size of a pressure "blob", in kit px
PAPER = 254 / 255        # the page's #fefefe
CLOSE = 9                # gap in an outline (kit px) still treated as closed when filling


def silhouette(alpha):
    """Mask of everything inside each figure's outline, frame by frame (4x4 grid)."""
    h, w = alpha.shape
    cell = w // 4
    out = np.zeros_like(alpha, dtype=bool)
    lines = Image.fromarray(((alpha > 0.15) * 255).astype(np.uint8))
    closed = lines.filter(ImageFilter.MaxFilter(CLOSE))   # bridge small gaps in the outline
    for r in range(4):
        for c in range(4):
            box = (c * cell, r * cell, (c + 1) * cell, (r + 1) * cell)
            m = closed.crop(box)
            for seed in [(0, 0), (cell - 1, 0), (0, cell - 1), (cell - 1, cell - 1)]:
                if m.getpixel(seed) == 0:
                    ImageDraw.floodfill(m, seed, 128)          # the outside
            inside = Image.fromarray(((np.asarray(m) != 128) * 255).astype(np.uint8))
            inside = inside.filter(ImageFilter.MinFilter(CLOSE))  # undo the bridging growth
            out[box[1]:box[3], box[0]:box[2]] = np.asarray(inside) > 0
    return out


def pressure_field(h, w, seed):
    rng = np.random.default_rng(seed)
    small = rng.random((h // GRAIN + 2, w // GRAIN + 2)).astype(np.float32)
    img = Image.fromarray((small * 255).astype(np.uint8)).resize((w + 2 * GRAIN, h + 2 * GRAIN), Image.BICUBIC)
    f = np.asarray(img).astype(np.float32)[GRAIN:GRAIN + h, GRAIN:GRAIN + w] / 255.0
    lo, hi = PRESSURE
    return lo + (hi - lo) * f


for i, (name, (grow, ink, size)) in enumerate(SHEETS.items()):
    src = Image.open(f"assets/kit-source/spritesheets/{name}.png").convert("RGBA")
    a = np.array(src).astype(np.float32) / 255.0
    rgb, alpha = a[..., :3], a[..., 3]
    tone = rgb.mean(-1)
    tone = np.where(alpha > 0.02, tone, 1.0)          # transparent pixels count as paper
    fill = silhouette(alpha)
    tone_img = Image.fromarray((tone * 255).astype(np.uint8))
    alpha_img = Image.fromarray((alpha * 255).astype(np.uint8))
    if grow > 1:
        tone_img = tone_img.filter(ImageFilter.MinFilter(grow))
        alpha_img = alpha_img.filter(ImageFilter.MaxFilter(grow))
    tone = np.asarray(tone_img).astype(np.float32) / 255.0
    alpha = np.asarray(alpha_img).astype(np.float32) / 255.0
    dark = (1.0 - tone) * ink * pressure_field(*tone.shape, seed=7 + i)
    tone = np.minimum(1.0 - dark, PAPER)
    alpha = np.where(fill, 1.0, alpha)                # paper-white inside the figure
    out = np.dstack([tone, tone, tone, alpha])
    img = Image.fromarray((out * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.4))
    img = img.resize((size, size), Image.LANCZOS)
    img.save(f"assets/sprites/{name}.webp", quality=88, method=6)
    print(name, size)
