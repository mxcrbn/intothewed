"""Build the web assets from the invitation drawing.

Run from the repo root:  python3 tools/prepare_assets.py

Inputs : assets/invite-original.webp   (1536x1024 line drawing)
Outputs: assets/scene.webp  drawing with the owl erased (the kit owl is animated on top)
         assets/mask.png    white = static (house, fence, ground), black = trees that sway
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

SRC = "assets/invite-original.webp"
img = Image.open(SRC).convert("RGB")
W, H = img.size
gray = np.array(img.convert("L"))

# --- scene without the owl ---------------------------------------------------
scene = img.copy()
d = ImageDraw.Draw(scene)
paper = (254, 254, 254)
d.rectangle((302, 265, 328, 296), fill=paper)
# remove the feet bumps on the branch and redraw that short piece of branch
d.rectangle((305, 295, 322, 303), fill=paper)
d.line([(303, 298.5), (313, 299.5), (324, 300.8)], fill=(40, 40, 40), width=2)
scene.save("assets/scene.webp", quality=96, method=6)

# --- static mask ----------------------------------------------------------
mask = Image.new("L", (W, H), 0)
m = ImageDraw.Draw(mask)
# everything near the ground: fence, gate, plants, steps, garden
m.rectangle((0, 738, W, H), fill=255)
# roof (with a little margin) and house body
m.polygon([(282, 590), (468, 492), (748, 488), (812, 440), (882, 488),
           (1182, 492), (1256, 590)], fill=255)
m.rectangle((294, 570, 1242, 760), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(3))
mask.save("assets/mask.png")

print("ok", W, H)
