"""Cut the names and the rings out of the invitation card, as transparent ink.

Run from the repo root:  python3 tools/extract_invite.py
Input : art/invite/invite-card.webp (1536 × 1024, black ink on white)
Output: public/assets/invite/names.png — the invite's own lettering, so the second screen of the
        site matches the card exactly. (The rings come from their own animated asset pack,
        public/assets/rings/, made from the same drawing.)
"""
import numpy as np
from PIL import Image

INK = (28, 28, 28)          # #1c1c1c, the drawing's ink
card = np.asarray(Image.open("art/invite/invite-card.webp").convert("L")).astype(float)


def cut(box, name, pad=6):
    x0, y0, x1, y1 = box
    g = card[y0 - pad:y1 + pad, x0 - pad:x1 + pad]
    # paper → transparent, ink keeps its anti-aliasing; faint paper grain is dropped
    alpha = np.clip((250 - g) / (250 - 40), 0, 1)
    out = np.zeros(g.shape + (4,), np.uint8)
    out[..., :3] = INK
    out[..., 3] = (alpha * 255).round()
    Image.fromarray(out).save(f"public/assets/invite/{name}.png", optimize=True)
    print(name, out.shape[1], "×", out.shape[0])


cut((292, 175, 1251, 311), "names")
