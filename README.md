# Into the Wed

Our wedding website. The little house in the woods on our invitation is the special place where
we'll marry, and here it gently comes to life: our 3 monsters, an owl, a deer, and the two of us
waiting for our families and friends 🌲

It opens full screen on the drawing, and if you stay a moment, things start to happen:

- **The wind** moves through the trees: leaves and twigs sway, in calm, changing gusts.
- **An owl** sits on a branch, blinks, and now and then flies across to the big tree on the right, and back.
- **Our 3 monsters** hide behind the big tree. Two little heads peek out on either side, the girl
  bolts, the boy chases her across the lawn, and **Nayan** strolls out to lean against the trunk and
  watch. They wave at you, then all slip away behind the house.
- **A deer** steps out of the woods on the left, walks into the garden, looks at you once, and
  wanders back into the forest.
- **Nóri & Max** open the front door, step out, wave hello, kiss, and go back inside.

All the motion is slow and discreet, so the page still feels like the drawing. With reduced motion
turned on, it stays still, and without JavaScript it shows the plain drawing.

## Run it

It's a static page with no build step:

```bash
python3 -m http.server 8417
```

Then open http://localhost:8417.

Handy URL parameters for working on it:

| parameter | what it does |
|---|---|
| `?t=40` | start 40 s in (shows a clock, no fade-in); `?t=27` deer, `?t=55` couple |
| `?fly=0.5` | with `?t=`, put the owl halfway through a flight |
| `?focus=1300,700,4` | zoom ×4 on a point of the drawing |
| `?wind=2&windSpeed=1` | try other wind settings (defaults 7 and 2.2) |

## How it's made

- **The drawing:** `assets/invite-original.webp`, the invitation itself, is the source of truth.
  Every position in the code is in its pixels (1536 × 1024).
- **The trees:** the illustrator's forest-wind kit (`assets/forest-wind/`). It has 97 fragments cut
  from the drawing, each rotating around where it is attached.
- **The characters:** hand-drawn sprite sheets (`assets/kit-source/`, `assets/couple-kit/`).
  `tools/prepare_sprites.py` restyles them to match the invitation's pen (fine grey ink, slight
  wobble, white inside) and writes `assets/sprites/`.
- **The page:** `index.html`, `style.css` and `main.js`, with no dependencies. Two canvases: one
  for the trees in the wind, one for the characters. All the choreography (paths, timing, sizes) is
  in plain settings at the top of `main.js`.
- **Animation scripts:** `ANIMATION-SCRIPTS.md` scripts every animation beat by beat and lists the
  frames to draw. Use it to regenerate better assets.

## Files

```
index.html, style.css, main.js    the page
ANIMATION-SCRIPTS.md              beat-by-beat scripts for regenerating the animations
assets/invite-original.webp       the invitation drawing
assets/forest-wind/               wind kit: background, fragment atlas, rig
assets/kit-source/                owl, deer, children sprite sheets as delivered
assets/couple-kit/                Nóri & Max sprite sheets, rig and door leaves
assets/sprites/                   web-ready sprites (generated)
tools/prepare_sprites.py          builds assets/sprites/ from the kits
tools/make_couple_wave.py         makes the couple's waving poses
```
