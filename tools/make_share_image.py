"""Build the picture shown when the site's link is shared (messages, WhatsApp, social networks):
the invitation drawing, cropped to the house in its woods, 1200 x 630.

Run from the repo root:  python3 tools/make_share_image.py
"""
from pathlib import Path

from PIL import Image

site = Path(__file__).resolve().parent.parent
drawing = Image.open(site / "public/assets/invite-original.webp").convert("RGB")
# the same crop as the page (x 100 -> 1450), from above the owl's branch down to the fence
W, H = 1200, 630
w = 1350
h = round(w * H / W)
box = (100, 1010 - h, 100 + w, 1010)
out = site / "public/share.jpg"
drawing.crop(box).resize((W, H), Image.LANCZOS).save(out, quality=86, optimize=True, progressive=True)
print(f"{out.relative_to(site)}: {W} x {H}, {out.stat().st_size // 1024} kB")
