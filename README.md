# Wedding site — N + M

A single full-screen page showing the invitation drawing (the house in the woods), with discreet life in it:

- **Wind in the trees**: the illustrator's forest-wind kit — 97 small leaf and twig fragments cut from
  the drawing, each rotating around its attachment point, with staggered timing and slowly changing
  gusts. The house, trunks, fence and garden never move.
- **The owl** (illustrator's kit) sits on its branch, blinks, and ~12 s after opening takes off, flies
  across the scene and lands on the big tree on the right. It flies back after ~28 s, and so on.
- **The deer** comes out of the woods on the right (~22 s, then once a minute), passing behind the big
  trunk, stops beside the house to look around, then wanders off into the forest.
- **The three children** (~5 s, then every 75 s) run along the fence and come in through the gate. On the
  garden path the boy chases the girl while the teenager watches and waves, then the three play together
  by the steps and leave through the gate. Every other visit is mirrored (they come from the right).
  Sizes follow the house (a teenager by the steps is a bit shorter than the door) and shrink with depth.
- Respects `prefers-reduced-motion` (still drawing with the owl perched), and falls back to the plain
  image without JavaScript.

## Run locally

```bash
python3 -m http.server 8417
```

Then open http://localhost:8417

Tuning helpers: `?t=40` starts the scene 40 s in (shows a red clock), `?t=30&fly=0.5` puts the owl
halfway through a flight, `?focus=1300,700,4` zooms on a point of the drawing.

## Files

- `index.html`, `style.css`, `main.js` — the page. All tuning (wind, owl perches and timing, deer path,
  the children's little choreography) is at the top of `main.js`.
- `assets/invite-original.webp` — the drawing from the invite (source of truth).
- `assets/kit-source/` — the illustrator's animation kit as delivered (sprite sheets + `animations.json`).
- `assets/sprites/` — web versions of the kit sheets, built by `tools/prepare_sprites.py` (lines
  thickened and darkened to match the invite's pen at the size they appear in the scene).
- `assets/forest-wind/` — the forest-wind kit, owl-free variant: still background, fragment atlas and
  `wind-rig.json` (pivot, amplitude, phase, depth, lag per fragment). Its wind function is reproduced in
  `main.js`; the kit's own renderer and README are kept alongside for reference.
