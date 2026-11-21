"""Build the favicon from the rings mark: transparent background, with a thin light halo so the
charcoal rings stay visible on dark browser tabs (on light tabs the halo disappears).

Run from the repo root:  python3 tools/make_favicon.py

Input : art/favicon/rings-transparent.png  (512 px, charcoal rings, transparent holes and outside)
Output: app/favicon.ico  (16, 32, 48, 64 px)
        app/icon.png     (512 px)
        app/apple-icon.png stays as delivered: iOS home screens need an opaque (white) tile.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

site = Path(__file__).resolve().parent.parent
mark = Image.open(site / "art/favicon/rings-transparent.png").convert("RGBA")

FILL = 0.86          # the rings fill 86 % of the width, leaving room for the halo
HALO_ALPHA = 0.92    # the halo is near-white paper (#fefefe), very slightly see-through


def icon(n):
    """One n × n icon, drawn at 4× and reduced once."""
    big = 4 * n
    a = np.asarray(mark)[..., 3] > 0
    ys, xs = np.nonzero(a)
    crop = mark.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    w = round(big * FILL)
    h = round(crop.height * w / crop.width)
    rings = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    rings.paste(crop.resize((w, h), Image.LANCZOS), ((big - w) // 2, (big - h) // 2))

    # halo: the rings' shape grown by a fraction of a pixel at 16 px (more would fill the ring
    # holes), about 1 px at 32 px, a little more on bigger icons
    width = {16: 0.45, 32: 0.9, 48: 1.2, 64: 1.5}.get(n, n / 40) * 4      # in the 4× drawing
    # grow the shape with a blur and a steep curve (fast, and gives a soft edge)
    spread = rings.getchannel("A").filter(ImageFilter.GaussianBlur(width * 0.6))
    grown = spread.point(lambda v: min(255, v * 5))
    halo = Image.new("RGBA", (big, big), (254, 254, 254, 0))
    halo.putalpha(grown.point(lambda v: round(v * HALO_ALPHA)))
    halo.alpha_composite(rings)
    return halo.resize((n, n), Image.LANCZOS)


sizes = [16, 32, 48, 64]
icons = [icon(n) for n in sizes]
icons[-1].save(site / "app/favicon.ico", sizes=[(n, n) for n in sizes], append_images=icons[:-1])
icon(512).save(site / "app/icon.png", optimize=True)
print("wrote app/favicon.ico", sizes, "and app/icon.png 512")
