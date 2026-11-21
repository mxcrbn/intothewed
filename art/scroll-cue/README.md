# Nóri & Max — sun and scroll cue

Two independent transparent overlays, matching the invitation's imperfect grey pen lines.

- Sun: top centre, a fixed circular centre with two groups of rays gently brightening and expanding. One full cycle is 5.2 seconds. It has no face or added colour.
- Arrow: bottom centre, a gentle 6 px downward invitation, returning softly with a short rest. One cycle is 2.6 seconds. The whole hit area stays still and links to the information / RSVP section.

## Add to the existing website

Copy this folder to `public/wedding-extras/` (or the equivalent public assets folder). Load `sun-scroll.css`. Add the markup from `component.html` inside the existing image/canvas wrapper and give that wrapper the class `wedding-hero-art`. The supplied CSS includes a small ink-edge reinforcement for readability at browser size.

The existing information and RSVP section should have `id="wedding-info"`, or update the link's `href` to the site's real target. The arrow uses a regular anchor, works with keyboard input, and needs no extra JavaScript or scroll library.

The sun sits at 50% across and 9% down the illustration. At the 1536 × 1024 reference size its centre is approximately (768, 92), and the layered canvas is 128 px wide. The arrow is centred at the bottom of the existing hero. Tune `--sun-top` and `--scroll-bottom` if the site's hero has a different crop. Keep the overlays positioned relative to the artwork, not the whole browser window.

For responsive layouts, the sun follows the artwork's scale with a 42 px minimum layer canvas for small screens. The arrow retains a readable icon and a stationary 64 × 72 px hit area. Its visible mark moves inside that hit area, so tapping and focusing remain easy.

## Included files

- `assets/`: native transparent PNGs: sun 128 × 128, arrow 48 × 64.
- `masters-4x/`: matching higher-resolution PNGs for crisp display.
- `sun-core.png`, `sun-rays-a.png`, `sun-rays-b.png`: same aligned canvas; stack them exactly. Use `sun.png` for a static sun.
- `assets/sun-shine.webp`, `assets/scroll-arrow-bob.webp`: optional isolated transparent animated previews.
- `component.html` and `sun-scroll.css`: independent overlay markup and continuous animation.
- `preview.html`: self-contained placement preview with a working scroll link.
- `placement-preview.png` and `placement-preview.gif`: visual placement references only.
- `assets.json`: dimensions and reference placement.

The CSS respects reduced motion: the drawings stay visible and still, and anchor scrolling becomes immediate. Apply `wedding-motion-paused` to an ancestor when the website's existing motion control is paused. The sun is decorative; the arrow has an accessible link label and a keyboard focus outline.

The existing house and other animations are separate. This pack does not include a new RSVP form or replace the current website implementation.

Suggested request to Claude:

> Add these two supplied overlays to the existing wedding hero. Use component.html and sun-scroll.css, preserving the current illustration and animations. Place the sun at the top centre with its steady centre and gently pulsing rays. Put the bobbing arrow at the bottom centre and link it to the existing information and RSVP section. Keep responsive positioning, the stable tap target, keyboard focus and reduced-motion support.
