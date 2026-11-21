# Nóri & Max — forest animation assets

Five characters in the invitation's fine black-pen sketch style: owl, deer, teenager, little girl and younger boy.

## Files

- `frames/<character>/00.png` … `15.png`: **80 individual transparent PNG frames**, each 512 × 512.
- `spritesheets/<character>.png`: five aligned 4 × 4 PNG atlases, each 2048 × 2048.
- `animations.json`: frame indices, frame rate, loop behaviour, anchors and relative character heights.
- `player.js`: small dependency-free Canvas player for the website.
- `preview.html`: self-contained interactive preview; open directly in a browser. No server, installation or internet connection required.
- `motion-preview.gif`: quick looping preview of the main movement cycles.
- `scene/house-original.png`: the original approved house sketch.
- `scene/house-animation.png`: a separate animation background with the static owl removed so it is not duplicated when the owl moves.

These are frame-based drawings. The manifest supplies animation sequences; the website supplies the travel paths, scale, timing and tree occlusion. The preview demonstrates these together. The sample scene is an integration example, not a change to the printed invitation.

## Available motions

| Character | Frames | Sequences |
|---|---|---|
| Owl | 00–15 | Perched/blink, takeoff, eight-frame wingbeat loop, glide, landing |
| Deer | 00–15 | Idle/ear movement/look, eight-frame right-facing walk, four-frame walk away into the forest |
| Each child | 00–15 | Idle, wave, playful pose, eight-frame right-facing trot/run, anticipation/jump/landing |

Mirror the sprite at runtime to travel left. Do not stretch individual frames. Keep the frame box and use the anchors in the manifest; transparent padding is deliberate. The owl's flight clips use a body anchor, while its perched and landing clips use a foot anchor.

The children have their own gestures and proportions: the teenager is restrained, the little girl lively, and the younger boy quietly mischievous. `relativeHeight` gives starting proportions of 1.00 / 0.52 / 0.68 for teenager / girl / boy. Adjust display size to fit the scene.

The exterior of each sprite is transparent. The character interiors retain white fill so background branches do not show through faces and bodies. Fine antialiased ink edges remain partially transparent. These are hand-drawn frame sequences with intentional small line variations, not a rigid vector rig.

## Website example

```js
import { loadSketchPack, drawSketch } from './player.js';

const { manifest, images } = await loadSketchPack('./assets/wedding/');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const start = performance.now();

function animate(now) {
  const seconds = (now - start) / 1000;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // x and y are the character's anchor in your scene; height is its display height.
  drawSketch(ctx, images.owl, manifest.characters.owl,
    'fly', seconds, 140 + seconds * 25, 100, 24);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

Use `requestAnimationFrame` for motion along a curve and the clip's frame rate for pose changes. For the deer, transition from `walk` to `walkAway`, reduce scale with distance and place the relevant tree trunks in front. For the children, alternate `run`, `play`, `wave` and `hop` instead of looping every action continuously. Keep movement slow and discreet for the wedding site, and honour reduced-motion preferences.

## Frame order

All sheets read left to right, top to bottom, zero-based. The authoritative sequence lists are in `animations.json`. Ground characters retain the source's natural foot-lift and body movement; do not crop away transparent padding. The little girl's raised jump pose includes its full hair and hands. Original reference photographs are not part of this package.
