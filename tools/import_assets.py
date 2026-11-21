"""Import an animation asset pack (the "independent animation assets" format, v3) into the site.

Run from the repo root:
    python3 tools/import_assets.py <unzipped pack folder>

Every frame is rebuilt from the pack's 4x master (512 px cell) into a 1:1 cell of 128 px, in one
high-quality reduction. Along the way, a few corrections (all listed in FIXES below):
  - ink: the owl and the deer are drawn lighter than the invitation's pen (they sit right next to
    the heavy tree trunks), so their ink is darkened. The children's two peek frames are lighter
    than their other frames and are darkened to match them.
  - register: in the deer's walk cycle the body slides ±7 px back and forth (the frames are
    aligned on the feet), which makes the walk judder. Those frames are re-centred on the body.
  - scale: Nayan a little smaller (96 px instead of 106), so he is not taller than Nóri & Max
    (Max 104 px, Nóri ~97 px; the doorway opening is 113 px).

It also copies the door leaves and the trees' leaf atlas + rig, and keeps the 4x masters and the
pack's notes in art/characters/ (source files, not served).
"""
import json
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image

FIXES = {
    "owl":    {"ink_p90": 165},
    "deer":   {"ink_p90": 165, "register": range(4, 12)},
    "girl":   {"match_ink": [16, 17]},
    "boy":    {"match_ink": [16, 17]},
    "nayan":  {"scale": 96 / 106},
}

if len(sys.argv) != 2:
    sys.exit(__doc__)
pack = Path(sys.argv[1])
if (pack / "nori-and-max-independent-assets").is_dir():
    pack = pack / "nori-and-max-independent-assets"
site = Path(__file__).resolve().parent.parent
chars, doors, trees, art = (site / p for p in (
    "public/assets/characters", "public/assets/doors", "public/assets/trees", "art/characters"))
for d in (chars, doors, trees, art):
    d.mkdir(parents=True, exist_ok=True)

spec = json.loads((pack / "animations.json").read_text())
assets = spec.get("characters") or spec.get("assets")
CELL, MCELL = spec["cellSize"][0], spec["masterCellSize"][0]
COLS, ROWS = spec["grid"]["columns"], spec["grid"]["rows"]
PER = COLS * ROWS
F = MCELL // CELL                      # 4


def cell_box(i, size):
    c = i % PER
    return ((c % COLS) * size, (c // COLS) * size, (c % COLS + 1) * size, (c // COLS + 1) * size)


def ink(px):
    """Darkness of each pixel (0 paper … 255 black), alpha-weighted."""
    px = px.astype(float)
    return (255 - px[..., :3].mean(-1)) * px[..., 3] / 255


def p90(px):
    d = ink(px)
    return np.percentile(d[d > 40], 90)


def darken(px, k):
    px = px.astype(float)
    px[..., :3] = 255 - np.clip((255 - px[..., :3]) * k, 0, 255)
    return px.round().astype(np.uint8)


for name, a in assets.items():
    fx = FIXES.get(name, {})
    anchor = a.get("masterAnchor") or a.get("anchor4x") or [a["anchor"][0] * F, a["anchor"][1] * F]
    msheets = [Image.open(pack / s).convert("RGBA") for s in a["masterSheets"]]
    masters = [msheets[i // PER].crop(cell_box(i, MCELL)) for i in range(a["frameCount"])]

    # register: same body (torso band) centre in every frame of a cycle
    if "register" in fx:
        centres = {}
        for i in fx["register"]:
            al = np.asarray(masters[i])[..., 3] > 40
            ys, _ = np.nonzero(al)
            top, h = ys.min(), ys.max() - ys.min()
            _, bx = np.nonzero(al[top + int(h * .40): top + int(h * .55)])
            centres[i] = (bx.min() + bx.max()) / 2
        mean = np.mean(list(centres.values()))
        for i, cx in centres.items():
            dx = int(round(mean - cx))
            m = Image.new("RGBA", masters[i].size, (0, 0, 0, 0))
            m.paste(masters[i], (dx, 0))
            masters[i] = m
        print(f"{name}: re-centred frames {list(fx['register'])} by "
              f"{[round((mean - centres[i]) / F, 1) for i in fx['register']]} px")

    # scale around the feet anchor (in the master, before the one reduction)
    if "scale" in fx:
        k = fx["scale"]
        for i, m in enumerate(masters):
            big = m.resize((round(MCELL * k), round(MCELL * k)), Image.LANCZOS)
            ox, oy = round(anchor[0] * k - anchor[0]), round(anchor[1] * k - anchor[1])
            masters[i] = big.crop((ox, oy, ox + MCELL, oy + MCELL))

    frames = [np.asarray(m.resize((CELL, CELL), Image.LANCZOS)) for m in masters]

    if "ink_p90" in fx:
        k = fx["ink_p90"] / np.median([p90(f) for f in frames])
        frames = [darken(f, k) for f in frames]
        print(f"{name}: ink x{k:.2f}")
    if "match_ink" in fx:
        ref = np.mean([p90(frames[i]) for i in (0, 1, 3)])
        for i in fx["match_ink"]:
            k = ref / p90(frames[i])
            frames[i] = darken(frames[i], k)
            print(f"{name} frame {i}: ink x{k:.2f}")

    for s, sheet_path in enumerate(a["sheets"]):
        sheet = Image.new("RGBA", (COLS * CELL, ROWS * CELL), (0, 0, 0, 0))
        for i in range(s * PER, min((s + 1) * PER, a["frameCount"])):
            sheet.paste(Image.fromarray(frames[i]), cell_box(i, CELL)[:2])
        sheet.save(chars / Path(sheet_path).name, optimize=True)

shutil.copy2(pack / "animations.json", chars / "animations.json")

# doors, trees
for side in ("left", "right"):
    shutil.copy2(pack / f"doors/{side}.png", doors / f"{side}.png")
shutil.copy2(pack / "trees/branches-atlas.png", trees / "branches-atlas.png")
shutil.copy2(pack / "trees/wind-rig.json", trees / "wind-rig.json")

# source files, kept out of the served folder
if (art / "masters-4x").resolve() != (pack / "masters-4x").resolve():
    if (art / "masters-4x").exists():
        shutil.rmtree(art / "masters-4x")
    shutil.copytree(pack / "masters-4x", art / "masters-4x")
    for f in ("README.md", "ART-NOTES.md", "ASSET-BRIEF-v2.md", "verification.json", "export-quality.json"):
        if (pack / f).exists():
            shutil.copy2(pack / f, art / f)
print("imported", ", ".join(f"{n} ({a['frameCount']})" for n, a in assets.items()))
