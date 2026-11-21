# Nóri & Max — independent animation assets

These are separate trees, animals and characters, with no assembled scene or website choreography.

Every animal and character retains all 16 core poses. Extra peeks and couple waves bring the total to 106 distinct exported poses. Each asset is split into sheets of six cells: 6 + 6 + 4 for a 16-pose set. Unused cells on the last sheet stay transparent.

## Files

- `frames/`: final 128 × 128 transparent PNG frames, at the invitation's native pixel scale.
- `spritesheets/`: final 384 × 256 PNG sheets, a 3 × 2 grid of 128 px cells.
- `masters-4x/frames/`: aligned 512 × 512 master frames.
- `masters-4x/spritesheets/`: 1536 × 1024 master sheets, six 512 px cells each.
- `animations.json`: clip frame indices, anchors, dimensions and multi-sheet mapping.
- `sprite-player.js`: independent pose player with no automatic resizing or travel paths.
- `trees/`: transparent tree-only static/rest layers, 97 separate leaf/twig cutouts, atlas, pivots and the stronger wind function. No house, fence, owl or people are painted by this layer.
- `doors/`: original closed door leaves, each 29 × 113 px, plus hinge metadata. Matching 4× PNGs are in `masters-4x/doors/`.
- `previews/`: isolated native-size WebP animation previews and a native-size comparison lineup.
- `preview.html`: an offline asset browser. It shows each asset independently.
- `ASSET-BRIEF-v2.md`: updated specification using the latest size system.

Use the final PNGs directly at 1:1 with the 1536 × 1024 invitation. Scale the complete invitation layout uniformly for responsive display. Do not run the old nominal-height or depth-scaling pass on these final files.

All regular figures use feet anchor `(64, 120)`, or `(256, 480)` in the masters. Owl perched/landing feet use `(64, 100)`; owl flight/glide uses body centre `(64, 64)`. These exceptions are recorded in the clips. Trees use their own pivots, not a feet anchor.

For Claude: read `ASSET-BRIEF-v2.md`, then `animations.json`. Load all sheets listed for each asset. A global frame index is resolved with `sheet = floor(index / 6)` and `cell = index % 6`; it is not a single 4 × 4 atlas anymore. `teenager` is an alias for `nayan`.

The source photographs and the whole-scene prototype are excluded. The art remains hand-drawn key poses; the website controls continuous paths, timing, occlusion and playback.

## Independent playback helpers

```js
import { loadAsset, drawAnimation } from './sprite-player.js';
const { definition, sheets } = await loadAsset('./', 'girl');
drawAnimation(ctx, sheets, definition, 'run', seconds, footX, footY);
// Draws a native 128 px cell, with no character scale adjustment.
```

For a transparent tree-only canvas, load `TreeWind` from `trees/tree-wind.js` and call `render(ctx, seconds)`. If your website already redraws the original invitation each frame, use `overlay(ctx, seconds)` instead: its supplied `rest-erase-mask.png` clears the original stationary leaf/twig marks before moving replacements are drawn. This avoids duplicate leaves. Keep the overlay on the same native 1536 × 1024 coordinate grid and use your existing owl-free background when animating the separate owl. No replacement scene is supplied.
