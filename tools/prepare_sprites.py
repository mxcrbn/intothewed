"""Prepare the character sprite sheets from the animation kit.

Run from the repo root:  python3 tools/prepare_sprites.py

Input : assets/kit-source/spritesheets/<name>.png  (4x4 grid of 512px frames, from the illustrator's kit)
Output: assets/sprites/<name>.webp                 (same grid, smaller, restyled)

The kit's lines are clean, even vector-like strokes. The invitation is drawn with a fine pen:
neutral dark-grey ink about 2 px wide (in drawing pixels), slightly wobbly, with uneven
pressure, small breaks and the odd doubled stroke. Each sheet is restyled to match *at the size
the figure has in the scene* (SCALE = drawing px per kit px):
  - strokes thickened to ~STROKE drawing px,
  - a gentle wobble (smooth displacement of the line),
  - uneven pressure, down to near-breaks,
  - a faint second, slightly offset pass (pencil overdraw),
  - ink set to the invite's neutral grey,
  - the inside of each figure filled with paper white (the kit only has lines, on transparency).
"""
from PIL import Image, ImageFilter, ImageDraw
import numpy as np

#  name       SCALE (drawing px per kit px, typical in-scene size)   output sheet size
SHEETS = {
    "owl":      (30 / 136,  1024),
    "deer":     (90 / 237,  1024),
    "teenager": (105 / 281, 1536),
    "girl":     (56 / 283,  1024),
    "boy":      (74 / 288,  1024),
    # the couple (separate kit): keep the drawn faces exactly, so no wobble / overdraw
    "couple":   (104 / 287, 1536, "assets/couple-kit/spritesheets/couple.png", False),
}
STROKE = 1.25         # target line width, drawing px (the invite: ~1.5–2, but the figures are tiny)
WOBBLE = 0.45         # line wobble amplitude, drawing px
WOBBLE_GRAIN = 9      # wobble wavelength, drawing px
PRESSURE = (0.5, 1.0)
PRESSURE_GRAIN = 6    # drawing px
OVERDRAW = 0.35       # strength of the second pass
INK = 0.9             # darkness of a full-pressure stroke core (invite cores ≈ 0.85–0.9)
PAPER = 254 / 255     # the page's #fefefe
CLOSE = 9             # outline gap (kit px) still treated as closed when filling


def noise(h, w, grain, rng):
    """Smooth noise in [0, 1], blobs about `grain` px across."""
    g = max(2, int(grain))
    small = rng.random((h // g + 3, w // g + 3)).astype(np.float32)
    img = Image.fromarray((small * 255).astype(np.uint8)).resize(((w // g + 3) * g, (h // g + 3) * g), Image.BICUBIC)
    return np.asarray(img).astype(np.float32)[g:g + h, g:g + w] / 255.0


def warp(img, dx, dy):
    """Move each pixel of a float image by (dx, dy) (nearest sampling)."""
    h, w = img.shape
    yy, xx = np.mgrid[0:h, 0:w]
    sx = np.clip(np.round(xx + dx).astype(int), 0, w - 1)
    sy = np.clip(np.round(yy + dy).astype(int), 0, h - 1)
    return img[sy, sx]


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


def stroke_width(mask):
    """Rough mean stroke width (px) of a binary line mask."""
    m = Image.fromarray((mask * 255).astype(np.uint8))
    eroded = np.asarray(m.filter(ImageFilter.MinFilter(3))) > 0
    area, edge = mask.sum(), max(mask.sum() - eroded.sum(), 1)
    return 2 * area / edge      # one erosion strips both sides of a stroke


def to_img(f):
    return Image.fromarray((np.clip(f, 0, 1) * 255).astype(np.uint8))


def to_arr(img):
    return np.asarray(img).astype(np.float32) / 255.0


for i, (name, spec) in enumerate(SHEETS.items()):
    scale, size = spec[0], spec[1]
    path = spec[2] if len(spec) > 2 else f"assets/kit-source/spritesheets/{name}.png"
    sketchy = spec[3] if len(spec) > 3 else True
    rng = np.random.default_rng(11 + i)
    src = Image.open(path).convert("RGBA")
    a = np.array(src).astype(np.float32) / 255.0
    rgb, alpha = a[..., :3], a[..., 3]
    h, w = alpha.shape
    line = alpha * np.clip(1.0 - rgb.mean(-1) / 0.97, 0, 1)   # ink only (the kit figures are white inside)
    line = np.clip(line / max(np.percentile(line[line > 0.05], 90), 1e-3), 0, 1)
    fill = silhouette(alpha)

    # thicken to the target width
    have = stroke_width(line > 0.4)
    want = STROKE / scale
    grow = want - have
    if grow >= 0.8:
        k = 2 * max(1, round(grow / 2)) + 1          # odd filter size
        line = to_arr(to_img(line).filter(ImageFilter.MaxFilter(k)))
    line = to_arr(to_img(line).filter(ImageFilter.GaussianBlur(0.25 / scale)))

    # wobble + pressure, and a faint offset second pass
    amp, grain = (WOBBLE if sketchy else 0) / scale, WOBBLE_GRAIN / scale
    dx = (noise(h, w, grain, rng) - 0.5) * 2 * amp
    dy = (noise(h, w, grain, rng) - 0.5) * 2 * amp
    lo, hi = PRESSURE
    press = lo + (hi - lo) * np.clip(noise(h, w, PRESSURE_GRAIN / scale, rng) * 1.3, 0, 1)
    first = warp(line, dx, dy) * press
    dx2 = (noise(h, w, grain, rng) - 0.5) * 2 * amp * 2.2
    dy2 = (noise(h, w, grain, rng) - 0.5) * 2 * amp * 2.2
    second = warp(line, dx2, dy2) * (OVERDRAW if sketchy else 0) * noise(h, w, PRESSURE_GRAIN * 2 / scale, rng)
    cover = np.clip(np.maximum(first, second), 0, 1)

    tone = np.minimum(1.0 - cover * INK, PAPER)
    out_alpha = np.where(fill, 1.0, np.clip(cover * 1.4, 0, 1))
    out = np.dstack([tone, tone, tone, out_alpha])
    img = Image.fromarray((out * 255).astype(np.uint8)).resize((size, size), Image.LANCZOS)
    img.save(f"assets/sprites/{name}.webp", quality=90, method=6)
    print(f"{name}: kit stroke ≈{have:.1f}px, want {want:.1f}px (grow {grow:.1f})")
