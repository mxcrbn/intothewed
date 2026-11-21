# Wedding site — N + M

A single full-screen page showing the invitation drawing (the house in the woods), with discreet life in it:

- **Wind in the trees**: the illustrator's forest-wind kit — 97 small leaf and twig fragments cut from
  the drawing, each rotating around its attachment point, with staggered timing and slowly changing
  gusts. The kit's default strength only moves pieces 1–2 screen pixels, so the site runs it at
  intensity 7 and 2.2× tempo (`WIND` in `main.js`; try others with `?wind=2&windSpeed=1`). The house,
  trunks, fence and garden never move.
- **The owl** (illustrator's kit) sits on its branch, blinks, and ~12 s after opening takes off, flies
  across the scene and lands on the big tree on the right. It flies back after ~28 s, and so on.
- **The deer** comes out of the woods on the left (~22 s, then once a minute), passing behind the big
  trunks, walks into the left garden just past the first window, looks around (and once at us), then turns back and wanders
  off into the forest.
- **The three children** (~5 s, then every 75 s) hide behind the big tree on the right. The girl leans
  her head out on one side, the boy on the other (one long peek); the girl bolts and the boy chases
  her across the front lawn. A few seconds in, Nayan (the teenager) strolls out and leans back
  against the trunk, hands in pockets, one knee bent. The kids run back to him, wave, and slip away
  behind the house; then Nayan straightens up, waves, and follows them. Sizes follow the house and
  shrink with depth.
- **Nóri & Max** (their own kit): right after each deer visit (~52 s, then once a minute) the front
  doors open, they step out onto the steps, pause, open their arms to welcome everyone in, look at
  each other, kiss, go back in and close the doors.
  Sizes are shared by everyone: Max is ~104 px on the steps (the doorway opening is 113 px), a little
  taller than the teenager; the deer's ears reach about two-thirds of his height.
- Respects `prefers-reduced-motion` (still drawing with the owl perched), and falls back to the plain
  image without JavaScript.

## Run locally

```bash
python3 -m http.server 8417
```

Then open http://localhost:8417

Tuning helpers: `?t=40` starts the scene 40 s in (shows a red clock, no fade-in; `?t=53` for the couple), `?t=30&fly=0.5` puts the owl
halfway through a flight, `?focus=1300,700,4` zooms on a point of the drawing, `?wind=` / `?windSpeed=` try other wind settings.

## Files

- `index.html`, `style.css`, `main.js` — the page. All tuning (wind, owl perches and timing, deer path,
  the children's little choreography) is at the top of `main.js`.
- `assets/invite-original.webp` — the drawing from the invite (source of truth).
- `assets/kit-source/` — the illustrator's animation kit as delivered (sprite sheets + `animations.json`).
- `assets/sprites/` — web versions of the kit sheets, built by `tools/prepare_sprites.py`: lines
  restyled to the invite's pen at the size each figure has in the scene (same ~1.5 px dark-grey ink,
  a slight wobble, uneven pressure and a faint overdraw), white inside.
- `assets/couple-kit/` — Nóri & Max kit as delivered: paired-pose atlas, rig, door leaves, its README
  and reference renderer (`couple-door.reference.js`, reproduced in `main.js`).
- `assets/forest-wind/` — the forest-wind kit, owl-free variant: still background, fragment atlas and
  `wind-rig.json` (pivot, amplitude, phase, depth, lag per fragment). Its wind function is reproduced in
  `main.js`; the kit's own renderer and README are kept alongside for reference.
