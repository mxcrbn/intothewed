# Nóri & Max — a little nudge and a twinkle

Two hand-drawn wedding bands gently rock together, settle, then rest. Two tiny uneven pencil crosses appear one after the other. The 8-second loop has about 3 seconds of motion, followed by a long quiet pause. The bands stay interlocked throughout. No sound.

## Give this to Claude

Copy this directory to `public/wedding-rings/`. Load `/wedding-rings/rings.css`. Replace the existing still rings element in the information section with `component.html`; keep the surrounding names, venue, date and other live text as they are.

Import and mount the supplied controller once for each element:

```js
import { mountWeddingRings } from '/wedding-rings/rings.js';
const rings = mountWeddingRings(document.querySelector('[data-wedding-rings]'));
// Optional: rings.replay(); rings.setPaused(true); rings.setPaused(false);
// On component unmount: rings.destroy();
```

For React, put the markup in a component, use a ref, mount in `useEffect`, and call `destroy()` in its cleanup. Convert `class` to `className`. Keep the effect cleanup so development Strict Mode cannot create duplicate observers.

The controller starts the motion as the rings scroll into view, pauses it outside the viewport or while the tab is hidden, and resumes it on return. The website's existing motion toggle can call `setPaused()` or use the existing `wedding-motion-paused` ancestor class. No third-party animation library is needed. Without JavaScript, the rings remain visible and still.

The base drawings preserve fine uneven ink and white band faces; the holes and outer canvas are transparent. The whole pair moves as one piece, retaining a coherent crossing. Text and page layout remain separate from the art. The rings are decorative (`aria-hidden`); do not give the illustration a focus stop or make it a button.

## Sizing

The aligned native canvas is 384 × 240. The 4× master is 1536 × 960. The visible drawing spans roughly 312 × 166 native pixels within the canvas. CSS defaults to a 360 px canvas, so the visible rings are about 293 px wide, close to the invitation. Adjust `--rings-width`, for example `style="--rings-width: 320px"`. `max-width:100%` prevents overflow on phones. Keep the canvas aspect ratio at 8:5 and its transparent margins: they give the rocking motion room.

## Files

- `assets/rings.png`: native transparent still.
- `masters-4x/rings.png`: high-resolution transparent still used by the component.
- `rings.css`, `rings.js`, `component.html`: continuous web animation and viewport activation.
- `assets/rings-delicate-loop.webp`: optional transparent animated fallback, 8 seconds. Use CSS/controller for pause and reduced-motion support rather than autoplaying this file for everyone.
- `preview.html`: self-contained working preview; open it directly in a browser.
- `preview.gif`: animation proof on a plain background.
- `assets.json`: dimensions, timing and source notes.

The supplied CSS honours `prefers-reduced-motion`: the pair stays still and twinkles are hidden. Animation changes only transform and opacity, avoids layout movement, and has no strobe or rapid flashes. No website deployment or RSVP form is included.

Suggested instruction:

> Replace the still rings on the information/RSVP side with this supplied rings component. Keep its original location and all text. Use the 4× PNG and CSS, mount the controller, and connect its pause API to our existing motion control. Start when it scrolls into view. Preserve the quiet rest between each nudge, the reduced-motion state and the transparent spacing.
