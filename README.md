# Wedding site — N + M

First iteration: a single full-screen page showing the invitation drawing (the house in the woods),
with a discreet animation:

- **Trees** sway slowly and continuously (WebGL shader; trunks are anchored at the ground, crowns move most).
  The house, fence, gate and garden never move.
- **The owl** sits on its branch as on the invite, and ~12 s after opening flies across to the big tree on
  the right. It flies back after ~28 s, and so on.
- Respects `prefers-reduced-motion` (static drawing), and falls back to the plain image without WebGL/JS.

## Run locally

```bash
python3 -m http.server 8417
```

Then open http://localhost:8417

## Files

- `index.html`, `style.css`, `main.js` — the page. Tuning constants (wind strength, owl timings, perches) are at the top of `main.js`.
- `assets/invite-original.webp` — the drawing from the invite (source of truth).
- `tools/prepare_assets.py` — rebuilds `assets/scene.webp` (drawing without the owl), `assets/mask.png`
  (white = static parts) and `assets/owl.png` (perched owl sprite) from the original. Needs Pillow + numpy.
