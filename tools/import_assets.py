"""Import an animation asset pack (the "independent animation assets" format, v3) into the site.

Run from the repo root:
    python3 tools/import_assets.py <unzipped pack folder>

Every frame is rebuilt from the pack's 4x master (512 px cell) into a 1:1 cell of 128 px, in one
high-quality reduction. Along the way, a few corrections (all listed in FIXES below):
  - ink: one pen for everything. Every character's line is brought to the drawing's own line
    (house and trees, measured on art/trees/background.png): the same mean ink darkness
    and the same stroke width, with one tone curve per character, then each frame levelled to the
    same darkness so no frame looks paler than its neighbours.
  - owl: it is the invitation's own owl, cut out of the invite (see invite_owl): as it is when
    perched, and in place of the pack's bird between the pack's wings when it flies.
  - register: in the deer's walk cycle the body slides ±7 px back and forth (the frames are
    aligned on the feet), which makes the walk judder. Those frames are re-centred on the body.
  - scale: three couple frames (lean in, kiss, smile) drawn ~4 % smaller are brought back to size.
  - scale: Nayan 96 px (instead of 106), so he is not taller than Nóri & Max (Max 104 px, Nóri
    ~97 px; the doorway opening is 113 px), and the children a little smaller so he still stands
    clearly above them (boy 68 px, girl 54 px).

It also copies the door leaves and the trees' leaf atlas + rig, and keeps the 4x masters and the
pack's notes in art/characters/ (source files, not served).
"""
import json
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

FIXES = {
    "deer":   {"register": range(4, 12)},
    # the children a little smaller, so Nayan (96) clearly stands above them while staying below
    # Nóri (~97) and Max (104): girl 54 px (5 years old), boy 68 px (7)
    "girl":   {"scale": 54 / 56},
    "boy":    {"scale": 68 / 75},
    "nayan":  {"scale": 96 / 106},
    # the lean-in, kiss and smile frames are drawn ~4 % smaller than the rest (Max's head drops
    # 4 px even standing upright, their feet are narrower): back to the common size
    "couple": {"scale_frames": {9: 1.03, 10: 1.04, 11: 1.04}},
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


PAPER = 254.0        # the drawing's paper
INK = 0.35           # a pixel counts as ink above this darkness (0 paper … 1 black)


def darkness(px):
    """Darkness of each pixel as it looks on the paper (0 paper … 1 black)."""
    px = px.astype(float)
    return np.clip(1 - px[..., :3].mean(-1) / PAPER, 0, 1) * px[..., 3] / 255


def line(ds):
    """The pen of a set of darkness maps: (mean darkness of the ink, stroke width in px).
    The width is twice the ink area over its outline length."""
    area = edge = total = 0
    for d in ds:
        ink = d > INK
        p = np.pad(ink, 1)
        inside = p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:]
        area += ink.sum()
        edge += (ink & ~inside).sum()
        total += d[ink].sum()
    return total / max(area, 1), 2 * area / max(edge, 1)


def curve(d, k, gamma):
    """The tone curve: gamma thins or thickens the stroke (it moves the soft edge), k darkens it."""
    return np.clip(k * d ** gamma, 0, 1)


def gain_for(ds, gamma, dark):
    """The k that gives these darkness maps the wanted mean ink darkness, for a given gamma."""
    lo, hi = 0.3, 30.0
    for _ in range(30):
        k = (lo + hi) / 2
        lo, hi = (k, hi) if line([curve(d, k, gamma) for d in ds])[0] < dark else (lo, k)
    return (lo + hi) / 2


def repen(frames, dark, width):
    """Redraw frames with the drawing's pen: same mean ink darkness, same stroke width."""
    ds = [darkness(f) for f in frames]
    best = None
    for gamma in np.arange(0.5, 3.01, 0.05):
        k = gain_for(ds, gamma, dark)
        miss = abs(line([curve(d, k, gamma) for d in ds])[1] - width)
        if best is None or miss < best[0]:
            best = (miss, gamma, k)
    _, gamma, k = best
    out = []
    for f, d in zip(frames, ds):
        d2 = curve(d, gain_for([d], gamma, dark), gamma)       # each frame levelled to the same darkness
        alpha = np.maximum(f[..., 3] / 255, d2)                # (a line may need more than its soft edge held)
        grey = PAPER * (1 - np.divide(d2, alpha, out=np.zeros_like(d2), where=alpha > 0))
        px = np.dstack([grey, grey, grey, alpha * 255])
        out.append(px.round().astype(np.uint8))
    return out, gamma, k


def invite_owl(blink=False):
    """The owl as it is drawn on the invitation (ear tufts, facing us), cut out of the invite as a
    128 px cell with its feet on the anchor: the perched owl is then the very same one people see
    on the still drawing while the page loads. Paper white inside, transparent outside.
    blink: the two eye dots replaced by two short closed-eye strokes."""
    FEET, ANCHOR = (315, 301), (64, 100)                # where it sits in the drawing; the cell's anchor
    x0, y0 = FEET[0] - ANCHOR[0], FEET[1] - ANCHOR[1]
    box = (x0, y0, x0 + CELL, y0 + CELL)
    inv = np.asarray(Image.open(site / "public/assets/invite-original.webp").convert("RGBA").crop(box))
    bg = np.asarray(Image.open(DRAWING).convert("RGBA").crop(box))
    # the owl's own ink: what the invite has that the owl-less background doesn't, around the owl
    d = np.clip(darkness(inv) - darkness(bg), 0, 1)
    keep = np.zeros_like(d, bool)
    keep[266 - y0:306 - y0, 301 - x0:330 - x0] = True
    d[~keep] = 0
    # its silhouette: the outline closed (the pen lifts here and there), and everything inside it
    line_ = Image.fromarray(((d > 0.2) * 255).astype(np.uint8))
    closed = line_.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    flood = closed.copy()
    ImageDraw.floodfill(flood, (0, 0), 128)
    inside = np.asarray(flood) != 128
    # its feet grip the branch, whose line the background has too: there, take the invite's ink as it is
    feet = np.zeros_like(inside)
    feet[295 - y0:306 - y0] = True
    d = np.where(inside & feet, darkness(inv), d)
    if blink:
        eyes = [(313, 275), (319, 275)]
        for ex, ey in eyes:
            d[ey - y0 - 2:ey - y0 + 3, ex - x0 - 2:ex - x0 + 3] = 0
        for ex, ey in eyes:                              # a short stroke, a touch lower at its ends
            d[ey - y0, ex - x0 - 1:ex - x0 + 2] = 0.8
            d[ey - y0 + 1, [ex - x0 - 2, ex - x0 + 2]] = 0.45
    alpha = np.maximum(inside.astype(float), d)
    grey = PAPER * (1 - np.divide(d, alpha, out=np.zeros_like(d), where=alpha > 0))
    return np.dstack([grey, grey, grey, alpha * 255]).round().astype(np.uint8)


def erased(px, cx, cy, rx, ry):
    """The frame with an ellipse cleared (to take the pack's bird out from between its wings)."""
    yy, xx = np.mgrid[0:px.shape[0], 0:px.shape[1]]
    out = px.copy()
    out[((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1] = 0
    return out


def over(px, piece, x, y):
    """The frame with a piece drawn over it at (x, y)."""
    im = Image.fromarray(px)
    im.alpha_composite(piece, (x, y))
    return np.asarray(im)


# the drawing's own pen: what every character is matched to
DRAWING = site / "art/trees/background.png"      # the drawing without the owl (served as a WebP)
PEN = line([darkness(np.asarray(Image.open(DRAWING).convert("RGBA")))])
print(f"the drawing: ink {PEN[0]:.3f}, stroke {PEN[1]:.2f} px")

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

    # scale around the feet anchor (in the master, before the one reduction): the whole set, or
    # single frames drawn at the wrong size
    def scaled(m, k):
        big = m.resize((round(MCELL * k), round(MCELL * k)), Image.LANCZOS)
        ox, oy = round(anchor[0] * k - anchor[0]), round(anchor[1] * k - anchor[1])
        return big.crop((ox, oy, ox + MCELL, oy + MCELL))
    for i, k in fx.get("scale_frames", {}).items():
        masters[i] = scaled(masters[i], k)
    if "scale" in fx:
        masters = [scaled(m, fx["scale"]) for m in masters]

    frames = [np.asarray(m.resize((CELL, CELL), Image.LANCZOS)) for m in masters]

    before = line([darkness(f) for f in frames])
    frames, gamma, k = repen(frames, *PEN)
    after = line([darkness(f) for f in frames])
    print(f"{name}: ink {before[0]:.3f} → {after[0]:.3f}, stroke {before[1]:.2f} → {after[1]:.2f} px "
          f"(curve x{k:.2f}, gamma {gamma:.2f})")

    if name == "owl":
        # It is the invitation's own owl in every frame (the pack's was a different bird: round head, in
        # profile). Perched (0 at rest, 1 blinking, 15 just settled): the invite's owl as it is.
        rest = invite_owl()
        frames[0], frames[1], frames[15] = rest, invite_owl(blink=True), rest
        # Taking off and landing (3, 14): the pack's wings, the invite's owl standing in front of them.
        # Crouching before take-off (2): the invite's owl, a little squashed onto its feet.
        for i, hole in {3: (71, 84, 12, 16), 14: (65, 84, 9, 16)}.items():
            frames[i] = over(erased(erased(frames[i], *hole), 82, 76, 9, 11) if i == 3 else erased(frames[i], *hole),
                             Image.fromarray(rest), 0, 0)
        squat = Image.fromarray(rest).convert("RGBa").resize((CELL, round(CELL * .9)), Image.LANCZOS).convert("RGBA")
        frames[2] = repen([np.asarray(over(np.zeros_like(rest), squat, 0, 100 - round(100 * .9)))], *PEN)[0][0]
        # Flying and gliding (4 – 12): the pack's wings, with the invite's owl (head and body, without
        # its feet, at its own size and in its own line) in place of the pack's little round bird.
        body = Image.new("RGBA", (28, 36), (0, 0, 0, 0))
        body.paste(Image.fromarray(rest).crop((50, 64, 78, 97)), (0, 0))
        # (without its feet the outline is open underneath: closed with one shallow pen stroke)
        ink_ = np.nonzero(darkness(np.asarray(body))[32] > INK)[0]
        belly = Image.new("RGBA", (28 * 4, 36 * 4), (0, 0, 0, 0))
        ImageDraw.Draw(belly).arc((ink_.min() * 4, 26 * 4, ink_.max() * 4 + 4, 34 * 4 + 2), 12, 168, fill=(60, 60, 60, 235), width=6)
        body.alpha_composite(belly.convert("RGBa").resize(body.size, Image.LANCZOS).convert("RGBA"))
        CENTRES = {4: (65, 64), 5: (63, 64), 6: (64, 63), 7: (69, 58), 8: (62, 54), 9: (61, 57),
                   10: (64, 63), 11: (64, 64), 12: (64, 63)}        # where the pack's bird is, in each cell
        for i, (cx, cy) in CENTRES.items():
            frames[i] = over(erased(frames[i], cx, cy + 1, 10, 12), body, cx - body.width // 2, cy - 11)

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
same = (art / "masters-4x").exists() and (pack / "masters-4x").samefile(art / "masters-4x")
if not same:   # (never delete the kept masters when they are the pack being imported)
    if (art / "masters-4x").exists():
        shutil.rmtree(art / "masters-4x")
    shutil.copytree(pack / "masters-4x", art / "masters-4x")
    for f in ("README.md", "ART-NOTES.md", "ASSET-BRIEF-v2.md", "verification.json", "export-quality.json"):
        if (pack / f).exists():
            shutil.copy2(pack / f, art / f)
print("imported", ", ".join(f"{n} ({a['frameCount']})" for n, a in assets.items()))
