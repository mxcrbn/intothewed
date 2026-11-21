# Nóri & Max — kissing scene implementation handoff

Use these supplied illustrations as the art. Do not redraw the couple, morph their faces, add colour, or warp the house. Nóri has her current fringe and an airy wedding dress with two loose elbow-length sleeves; Max wears a polo, tailored shorts and loafers. Keep the delicate monochrome lines, transparent exterior and opaque white figure interiors.

## Choose the implementation

1. **Standalone kiss:** `kissing-loop.webp` is a ready-to-use transparent animated image. `kissing-loop.apng` is a lossless version. Show `kissing-poster.png` for reduced motion. Use the PNG frames and `kissing-scene.js` when playback control is needed.
2. **At the house:** use `couple-door.js`, `couple-rig.json`, the atlas and the matching `scene/` layers. The included sequence opens the house's doors, brings the couple out, kisses, returns and closes the doors.

Open `preview.html` for the full scene. Open `kiss-preview.html` for the isolated kiss. Both previews work without a build step or internet access. `door-kiss-preview.gif` is a visual reference, not the transparent production asset.

## Fastest standalone embed

Copy the files from this folder into `/public/wedding-kiss/` (or equivalent). Use your app's actual public URL prefix:

```html
<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="/wedding-kiss/kissing-poster.png">
  <img src="/wedding-kiss/kissing-loop.webp" width="640" height="640"
       alt="Nóri and Max share a kiss" style="width:100%;height:auto;object-fit:contain">
</picture>
```

The animated image repeats. For click-to-play or one-shot playback, use the renderer below instead.

## Controlled standalone kiss

```js
import { KissingScene } from '/wedding-kiss/kissing-scene.js';
const canvas = document.querySelector('#couple-kiss');
canvas.width = canvas.height = 640;
const ctx = canvas.getContext('2d');
const kiss = await KissingScene.load('/wedding-kiss/');
let raf;
function playKiss() {
  cancelAnimationFrame(raf);
  const start = performance.now();
  function draw(now) {
    const t = Math.min((now - start) / 1000, 5.2);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    kiss.render(ctx, t, { loop: false });
    if (t < 5.2) raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
}
// Run on an accessible button or interaction. Cancel raf on unmount.
```

## Full door scene

```js
import { CoupleDoor } from '/wedding-kiss/couple-door.js';
const canvas = document.querySelector('#wedding-house');
canvas.width = 1536;
canvas.height = 1024;
const ctx = canvas.getContext('2d');
const scene = await CoupleDoor.load('/wedding-kiss/', 'original');
scene.render(ctx, 0, { loop: false }); // still, doors shut
let raf;
function playDoorScene() {
  cancelAnimationFrame(raf);
  const start = performance.now();
  function draw(now) {
    const t = Math.min((now - start) / 1000, 14);
    scene.render(ctx, t, { loop: false });
    if (t < 14) raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
}
```

Use `owl-free` instead of `original` only if adding the separate flying owl. Keep each background and its door leaves together. The default full scene has its stationary owl intact.

The canvas drawing coordinates are 1536 × 1024. Scale the entire canvas uniformly with CSS (`width:100%;height:auto`); don't independently resize or position the doors. The real opening is x784, y619, width58, height113. The paired sprite's shared foot anchor is [256,448] in each 512 × 512 atlas cell; the nominal adult height is 287 pixels. Its small scale in the wide forest scene is intentional.

With the optional `wind/forest-wind.js` renderer, draw the wind first, then call `scene.render(ctx,t,{drawBackground:false,loop:false})`. Keep wind time running independently of the doorway sequence. This pack includes the stronger v2 wind; do not also animate the complete house with a deformation effect.

## Timing and art limitations

The kiss-only scene is 5.2 seconds: embrace, lean in, two held kiss poses, smile, rest. The full story is 14 seconds; kiss runs from 4.8 to 6.4 seconds. Sixteen hand-drawn paired key poses are supplied. These are storybook pose changes, not a fully rigged character walk. Door rotation and placement animate at the website's frame rate; preserve the drawn poses rather than inventing interpolated faces.

Renderers respect `prefers-reduced-motion` by default. Suspend requestAnimationFrame while the page is hidden; cancel it on component unmount. Do not add external scripts, analytics, image-generation dependencies, or source photo downloads. No reference photographs are part of this handoff.

Suggested request to Claude:

> Implement this supplied Nóri & Max wedding animation in my website. Read START-HERE-CLAUDE.md. Use the provided art and renderer without redrawing or distorting the figures. Add the open–kiss–close scene to the house, triggered once when the house enters the viewport or through an accessible play button. Keep the stronger wind on its own continuous clock, preserve responsive aspect ratio, respect reduced motion, and clean up animation frames on unmount. Show the supplied still until all assets load. Use the isolated kissing-loop.webp only where a standalone couple vignette is wanted.
