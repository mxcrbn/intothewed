"""Import an animation asset pack (the "independent animation assets" format, v3) into the site.

Run from the repo root:
    python3 tools/import_assets.py <unzipped pack folder>

What it does:
  - characters: copies the 1:1 sheets (3 x 2 cells of 128 px) and animations.json into
    public/assets/characters/. Frames are used exactly as delivered: no resizing, no restyling.
  - fixes the one inconsistency in the v3 pack: the children's two peek frames (16, 17) are drawn
    about 30 % lighter than their other frames, so their ink is darkened to match.
  - doors: copies the two closed door leaves (29 x 113 px) into public/assets/doors/.
  - trees: copies the leaf/twig atlas (transparent) and wind-rig.json into public/assets/trees/.
    The still background (the invitation without the moving pieces) is kept as it is.
  - keeps the 4x masters and the pack's notes in art/characters/ (source files, not served).
"""
import json
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image

if len(sys.argv) != 2:
    sys.exit(__doc__)
pack = Path(sys.argv[1])
if (pack / "nori-and-max-independent-assets").is_dir():
    pack = pack / "nori-and-max-independent-assets"
site = Path(__file__).resolve().parent.parent
chars = site / "public/assets/characters"
doors = site / "public/assets/doors"
trees = site / "public/assets/trees"
art = site / "art/characters"
for d in (chars, doors, trees, art):
    d.mkdir(parents=True, exist_ok=True)

spec = json.loads((pack / "animations.json").read_text())
assets = spec.get("assets") or spec.get("characters")
cell = spec["cellSize"][0]
cols = spec["grid"]["columns"]
per_sheet = cols * spec["grid"]["rows"]

# characters
for name, a in assets.items():
    for s in a["sheets"]:
        shutil.copy2(pack / s, chars / Path(s).name)
shutil.copy2(pack / "animations.json", chars / "animations.json")


# the children's peek frames: same ink darkness as their other frames
def ink_level(img, box):
    a = np.asarray(img.crop(box).convert("RGBA")).astype(float)
    ink = (255 - a[..., :3].mean(-1)) * a[..., 3] / 255
    return np.percentile(ink[ink > 40], 90)


def box_of(index):
    c = index % per_sheet
    x, y = (c % cols) * cell, (c // cols) * cell
    return (x, y, x + cell, y + cell)


for name in ("girl", "boy"):
    a = assets[name]
    clips = a.get("clips") or a["animations"]
    peeks = clips["peek"]["frames"] + clips["peekGrin"]["frames"]
    ref_sheet = Image.open(chars / Path(a["sheets"][0]).name)
    ref = np.mean([ink_level(ref_sheet, box_of(i)) for i in (0, 1, 3)])
    for i in sorted(set(peeks)):
        path = chars / Path(a["sheets"][i // per_sheet]).name
        sheet = Image.open(path).convert("RGBA")
        box = box_of(i)
        k = ref / ink_level(sheet, box)
        px = np.asarray(sheet.crop(box)).astype(float)
        px[..., :3] = 255 - np.clip((255 - px[..., :3]) * k, 0, 255)
        sheet.paste(Image.fromarray(px.round().astype(np.uint8)), box[:2])
        sheet.save(path)
        print(f"{name} frame {i}: ink x{k:.2f}")

# doors
for side in ("left", "right"):
    shutil.copy2(pack / f"doors/{side}.png", doors / f"{side}.png")

# trees
shutil.copy2(pack / "trees/branches-atlas.png", trees / "branches-atlas.png")
shutil.copy2(pack / "trees/wind-rig.json", trees / "wind-rig.json")

# source files, kept out of the served folder
if (art / "masters-4x").exists():
    shutil.rmtree(art / "masters-4x")
shutil.copytree(pack / "masters-4x", art / "masters-4x")
for f in ("README.md", "ART-NOTES.md", "ASSET-BRIEF-v2.md", "verification.json", "export-quality.json"):
    if (pack / f).exists():
        shutil.copy2(pack / f, art / f)
print("imported", ", ".join(f"{n} ({a['frameCount']})" for n, a in assets.items()))
