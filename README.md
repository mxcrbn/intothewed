# Wedding site — N + M

A single full-screen page showing the invitation drawing (the house in the woods), with discreet life in it:

- **Trees** sway slowly and continuously (WebGL shader on the original drawing; trunks anchored at the
  ground, crowns move most). The house, fence, gate and garden never move.
- **The owl** (illustrator's kit) sits on its branch, blinks, and ~12 s after opening takes off, flies
  across the scene and lands on the big tree on the right. It flies back after ~28 s, and so on.
- **The deer** comes out of the woods on the right (~22 s, then once a minute), passing behind the big
  trunk, stops beside the house to look around, then wanders off into the forest.
- **The three children** run in front of the fence (~5 s, then every 75 s), play, hop and wave, then run
  off. They come in from the left, then from the right on the next visit.
- Respects `prefers-reduced-motion` (static drawing with the owl perched), and falls back to the plain
  image without WebGL/JS.

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
- `tools/prepare_assets.py` — rebuilds `assets/scene.webp` (drawing without the owl) and
  `assets/mask.png` (white = parts that never move). Needs Pillow + numpy.
