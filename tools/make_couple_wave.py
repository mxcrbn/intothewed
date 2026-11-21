"""Make Nóri & Max's waving poses (the couple kit has none).

Run from the repo root:  python3 tools/make_couple_wave.py   (then tools/prepare_sprites.py)

Takes the kit's "hold-open" pose (both outer arms held out) and swings each outer forearm up
around its elbow (the end of the sleeve), like a hello wave. Writes a 4x4 sheet in the kit's
format, public/assets/couple-kit/spritesheets/couple-wave.png:
  cell 0  arms half raised
  cell 1  wave, hands leaning out
  cell 2  wave, hands leaning in
This is a stopgap: see ANIMATION-SCRIPTS.md for the poses to have drawn properly.
"""
from PIL import Image, ImageDraw

SRC = "public/assets/couple-kit/spritesheets/couple.png"
OUT = "public/assets/couple-kit/spritesheets/couple-wave.png"
CELL = 512
HOLD_OPEN = 3   # kit pose index

# forearm outlines (frame px) and elbow pivots, measured on the hold-open pose
def frame(pts):   # measured on a 3x zoom of the frame crop starting at (100, 150)
    return [(100 + x / 3, 150 + y / 3) for x, y in pts]

ARMS = {
    "nori": {"poly": frame([(40, 380), (130, 372), (192, 338), (226, 366), (242, 392), (130, 448), (40, 448)]),
             "pivot": (170, 275), "angles": [-45, -73, -98]},     # her left arm, screen left
    "max":  {"poly": frame([(690, 288), (722, 298), (830, 378), (895, 382), (895, 470), (770, 470), (684, 350)]),
             "pivot": (330, 252), "angles": [45, 89, 114]},       # his right arm, screen right
}

sheet = Image.open(SRC).convert("RGBA")
base = sheet.crop(((HOLD_OPEN % 4) * CELL, (HOLD_OPEN // 4) * CELL,
                   (HOLD_OPEN % 4 + 1) * CELL, (HOLD_OPEN // 4 + 1) * CELL))

out = Image.new("RGBA", (CELL * 4, CELL * 4), (0, 0, 0, 0))
for i in range(3):
    body = base.copy()
    arms = []
    for arm in ARMS.values():
        mask = Image.new("L", base.size, 0)
        ImageDraw.Draw(mask).polygon(arm["poly"], fill=255)
        piece = Image.new("RGBA", base.size, (0, 0, 0, 0))
        piece.paste(base, (0, 0), mask)
        body.paste((0, 0, 0, 0), (0, 0), mask)          # take the arm off
        arms.append(piece.rotate(arm["angles"][i], resample=Image.BICUBIC, center=arm["pivot"]))
    for a in arms:
        body.alpha_composite(a)
    out.paste(body, ((i % 4) * CELL, (i // 4) * CELL))
out.save(OUT)
print("wrote", OUT)
