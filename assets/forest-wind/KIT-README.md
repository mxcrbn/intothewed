# Nóri & Max — a quiet forest breeze

An animation-ready canopy asset made from the original invitation's ink fragments. There is no whole-image deformation and no regenerated tree drawing. The house, trunks, fence and garden stay stationary.

## Open the preview

Open `preview.html` directly in a browser. It is self-contained and works offline. Use the two canopy close-ups to see the small movements. "Show original" gives the untouched drawing for comparison. The default is a light breeze; the slider lets you tune it.

## What is included

- `forest-wind.js`: dependency-free Canvas 2D renderer and continuous wind function.
- `original/`: original house with its perched owl, a stationary background, an atlas of small moving leaf/twig fragments, individual PNGs and the placement/anchor data.
- `owl-free/`: the same preparation applied to the owl-free background from your animation pack. Choose this version when adding the flying owl.
- `wind-rig.json` in each folder: source coordinates, atlas coordinates, pivot, amplitude, phase, depth and response delay for every piece.

The original source PNGs are unchanged. Reassembling the stationary background and fragments at rest reconstructs the source pixel-for-pixel. The PNG fragments contain white paper within their small masks; **use the supplied multiply blending**, rather than treating each rectangular crop as a conventional opaque sticker. The renderer handles this automatically. White paper remains white, and the fragile original ink edges are retained.

## Website integration

```js
import { ForestWind } from './forest-wind/forest-wind.js';

const canvas = document.querySelector('#forest');
canvas.width = 1536;
canvas.height = 1024;
const wind = await ForestWind.load('./forest-wind/owl-free/');
const stop = wind.start(canvas, { intensity: 0.9 });
// Call stop() when removing the canvas from the page.
```

When combining it with the owl, deer and children player:

```js
const wind = await ForestWind.load('./forest-wind/owl-free/');

function render(seconds) {
  wind.render(ctx, seconds, { intensity: 0.9 });
  // Draw the owl, deer and children using their existing animation assets.
}
```

For finer scene layering, call `wind.drawBackground(ctx)` and `wind.drawBranches(ctx, seconds)` separately. Draw animals behind the appropriate static foreground trunks when needed. These wind fragments are entirely in the upper canopy, so the lower house, garden and fence remain unchanged.

## Why the motion is less repetitive

The renderer combines smooth, seeded gusts at several timescales. A shared gust travels through the canopy; each fragment has its own delay, angle limit and gentle local flutter. Quintic interpolation makes the motion and its first two derivatives continuous at noise transitions. The live effect does not wrap a short sprite cycle or reset a sine wave. Each drawing fragment rotates rigidly around an attachment point, so the ink does not stretch like rubber.

The default displacement is only a few source pixels. Start around `intensity: 0.7` to `1.0` for the wedding site. The larger slider settings are for inspection. Avoid increasing the strength to compensate for a very small mobile rendering; quiet movement is intentional.

## Accessibility and performance

`prefers-reduced-motion` is honoured by default. Pass `forceMotion: true` only for an explicit opt-in preview. `start()` pauses time advancement while the tab is hidden and clamps long frame delays. Call `stop()` on cleanup. The renderer reuses one small atlas, so it does not redraw or resample the entire illustration through a deforming mesh.

## Important notes

This is an additional asset pack; it does not replace the printed invitation or your existing owl/deer/children files. The original and owl-free variants are separate because their ink pixels differ slightly. Use each background with its matching atlas and rig. A different drawing needs its own extraction; do not mix a background from one variant with fragments from the other.
