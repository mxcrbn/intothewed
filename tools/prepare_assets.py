"""Build the web assets from the invitation drawing.

Run from the repo root:  python3 tools/prepare_assets.py

Inputs : assets/invite-original.webp   (1536x1024 line drawing)
Outputs: assets/scene.webp  drawing with the owl erased (the owl is animated separately)
         assets/mask.png    white = static (house, fence, ground), black = trees that sway
         assets/owl.png     the perched owl, cut out of the drawing, ink on transparent
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

SRC = "assets/invite-original.webp"
img = Image.open(SRC).convert("RGB")
W, H = img.size
gray = np.array(img.convert("L"))

# --- perched owl -------------------------------------------------------------
# Owl body occupies x 302..328, y 266..296; its feet merge with the branch at y 297.
OWL_BOX = (300, 264, 330, 297)  # left, top, right, bottom (exclusive)
x0, y0, x1, y1 = OWL_BOX
crop = gray[y0:y1, x0:x1].astype(float)
ink = np.clip((250.0 - crop) / 200.0, 0, 1)  # darkness -> alpha
# add the two little feet that sit on the branch (2 rows below the body)
feet = np.zeros((3, x1 - x0))
for fx in (307, 308, 318, 319):
    feet[:, fx - x0] = 0.9
alpha = np.vstack([ink, feet])
rgba = np.zeros(alpha.shape + (4,), dtype=np.uint8)
rgba[..., 3] = (alpha * 255).astype(np.uint8)
Image.fromarray(rgba).save("assets/owl.png")

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

print("ok", W, H, "owl sprite", rgba.shape[1], "x", rgba.shape[0])
