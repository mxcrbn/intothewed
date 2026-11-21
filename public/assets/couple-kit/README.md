# Nóri & Max — the doorway moment

For Claude implementation, begin with `START-HERE-CLAUDE.md`. The pack includes a ready-to-embed transparent `kissing-loop.webp`, lossless `kissing-loop.apng`, reduced-motion `kissing-poster.png`, a standalone `kissing-scene.js` renderer and an offline `kiss-preview.html`.

The updated couple in the family's delicate black-pen style, plus door layers and a working open / kiss / close animation. Nóri has her current fringe, a closer facial likeness, and a more bridal summer dress with softly flared half sleeves and a crossed V bodice. Max retains the approved polo, tailored shorts and loafers.

## Open the preview

Open `preview.html` directly in a browser. It is self-contained and works offline. It starts with a close-up of the doorway. Select Full scene to see the couple at the house's scale; the canopy views show the stronger breeze. Expand Updated character reference for a larger view of the clothing and faces. Replay the moment starts the scene again.

## Included assets

- `characters/nori.png`, `characters/max.png`: separate full-length transparent character assets.
- `characters/couple-standing.png`: the larger shared model reference.
- `frames/couple/00.png` through `15.png`: 16 aligned paired animation poses, 512 × 512 PNGs.
- `spritesheets/couple.png`: the same poses in a 4 × 4, 2048 × 2048 transparent atlas.
- `couple-rig.json`: pose names, dimensions, common anchor, door coordinates and timing ranges.
- `scene/original/` and `scene/owl-free/`: the original closed house, a separate open-door background, and the two original door leaves. Original artwork is preserved; these are additional animation layers.
- `couple-door.js`: dependency-free Canvas renderer, door perspective projection and sequence sampler.
- `wind/`: the stronger v2 wind renderer with matching backgrounds and atlases. The full separate wind pack also contains the individual twig/leaf fragments.
- `door-kiss-preview.gif`: a short close-up preview of the doorway sequence.

The exterior of the characters is transparent and their interiors are white, so background lines do not show through faces and clothing. The pair is one animation unit so their hands and faces remain aligned during the kiss. The two doors are separate layers and move smoothly at the browser's frame rate.

## Sequence

The couple reaches for the handles, opens the double doors, steps out, turns inward, embraces, kisses, smiles, returns through the doorway and closes the doors. The sequence uses a small set of hand-drawn key poses with animated positioning, scale and door projection. It is a storybook-style animation, not a fully rigged cinematic walk cycle. Set `loop: false` to play once; the default preview has a 14-second cycle including a closed-door pause.

## Integration with the house and wind

```js
import { ForestWind } from './wind/forest-wind.js';
import { CoupleDoor } from './couple-door.js';

const canvas = document.querySelector('#wedding-house');
canvas.width = 1536;
canvas.height = 1024;
const ctx = canvas.getContext('2d');
const wind = await ForestWind.load('./wind/owl-free/');
const couple = await CoupleDoor.load('./', 'owl-free');

const start = performance.now();
function render(now) {
  const t = (now - start) / 1000;
  wind.render(ctx, t, { intensity: 1 });
  couple.render(ctx, t, { drawBackground: false, loop: true });
  // Draw the separate flying owl, deer and children here as appropriate.
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

Use `original` if retaining the stationary owl; use `owl-free` when adding the existing flying-owl asset. Keep each background with its matching door leaves and wind atlas. The doorway coordinates are calibrated for the supplied 1536 × 1024 house. For responsive display, scale the entire canvas uniformly rather than positioning the doors separately in CSS.

The wind is substantially stronger than the first version: 4.2× angular gain and 1.35× changing-gust speed, with protected house/garden pixels. It still uses evolving gusts rather than a short repeating leaf cycle. The wind clock and couple's scene clock are independent.

Reduced-motion preferences are honoured by default. For an explicit opt-in preview, `forceMotion: true` may be passed. For a guest-facing site, a click-to-play doorway moment is preferable to an incessantly repeated kiss. Pause rendering when the page is hidden and clean up your animation frame on unmount. No reference photographs are included in this pack.
