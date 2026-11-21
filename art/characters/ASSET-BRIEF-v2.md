# Independent animation asset brief — updated size system

## Scope

Deliver independent trees, owl, deer, girl, boy, Nayan, Nóri & Max, and two door leaves. Supply drawings, transparency, registration and clip metadata. Keep scene composition, travel paths, event scheduling and website implementation in the existing site.

## Exact export format

| Export | Frame cell | Sheet | Grid | General feet anchor |
|---|---:|---:|---|---|
| Final, invitation scale | 128 × 128 | 384 × 256 | 3 columns × 2 rows | (64, 120) |
| 4× master | 512 × 512 | 1536 × 1024 | 3 columns × 2 rows | (256, 480) |

Each animal or character has all 16 core poses, across 6 + 6 + 4 cells. The last two cells on that final sheet are transparent. Additional poses continue on subsequent cells/sheets. Never replace missing poses with repeated images merely to fill a sheet.

Normalize and align the generated artwork in the 4× masters, then perform one exact quarter-size reduction for final exports. The delivered master dimensions and cell coordinates are authoritative; raw image-generation output is not a precision layout guarantee.

## Proportions

| Asset | Final target | 4× target | Anchor at 4× |
|---|---|---|---|
| Owl perched | 30 px tall | 120 px | feet (256, 400) |
| Owl flight | body about 22 px long, spread wings about 80 px | body about 88 px, wings about 320 px | body centre (256, 256) |
| Deer standing/walking | 82 px, ears to hooves | 328 px | feet (256, 480) |
| Deer walking away | 72 px | 288 px | feet (256, 480) |
| Girl | 56 px standing | 224 px | feet (256, 480) |
| Boy | 75 px standing | 300 px | feet (256, 480) |
| Nayan | 106 px standing | 424 px | supporting foot (256, 480) |
| Nóri & Max | Max 104 px, Nóri shorter | Max 416 px, Nóri about 370 px | midpoint between feet (256, 480) |
| Each closed door leaf | 29 × 113 px | 116 × 452 px | outer top hinge |

The owl anchors are explicit exceptions to the general feet rule. At final scale, perched feet are (64, 100) and the flight body centre is (64, 64). A flying owl does not use a ground point.

The whole invitation is 1536 × 1024. One final asset pixel is one invitation pixel. Scale the entire composition as a unit for responsive display. Remove the earlier runtime nominal-height scaling and depth formula. Perspective changes should use explicitly sized frames, such as the deer's 72 px walk-away set. If another size is needed, export a named variant rather than silently rescaling individual characters.

For doorway poses, the opening is only 58 px wide. A strict fully visible side-by-side pose should fit within 232 px at 4×; a 240 px pair is 60 px wide. The site should clip figures behind the actual opening while they are inside, and show the wider waves only outside. Use the frame bounds in `export-quality.json` when checking fit; don't squeeze the pair horizontally.

## Drawing and transparency

Neutral dark grey around #1c1c1c, lighter pressure marks around #6a6a6a. Aim for irregular 5–7 px pen marks in the 4× artwork, maximum 8 px, which become about 1.25–1.75 px in the final image. Preserve small breaks and occasional doubled strokes. Sparse expressions remain readable at the final size. Avoid dense hair fills, shading and microscopic details.

The outside is transparent. Skin, clothing, fur and open owl wings retain opaque paper-white interiors around #fefefe. Antialiasing is allowed at the contour. Background branches must not show through a face or dress. Export gutters and unused cells as transparent, with no ground lines or cast shadows.

## Core frames retained

### Owl, 0–15

0 perched/open eyes; 1 blink; 2 crouch/takeoff; 3 push-off/wings up; 4–11 eight wingbeat phases; 12 glide; 13 landing flare; 14 talons down/half fold; 15 settled. Flight and glide use the body-centre anchor. The owl faces right; the site can mirror it for the return flight.

### Deer, 0–15

0 rest/profile; 1 ear flick; 2 head toward camera; 3 head dip; 4–11 eight walk phases; 12–15 three-quarter rear walk away. In the walk-away frames, the head looks forward along its direction of travel, not back at the viewer. The away set is intentionally smaller.

### Girl and boy, 0–15 plus 16–17

0 rest; 1 wave A; 2 wave B; 3 playful/pointing; 4–11 eight running phases; 12 crouch; 13 push-off; 14 hop peak; 15 landing. The site supplies hop lift, recorded as native drawing-pixel offsets in the clip.

16 curious peek and 17 grinning peek are additional poses. Their legs stay vertical; the upper body bends sideways from the hips, rather than tilting the entire character. Girl wears her simple dress with loose curly hair; boy wears T-shirt, shorts and sneakers.

### Nayan, 0–15

0 rest; 1 wave A; 2 wave B; 3 proper relaxed lean; 4–11 relaxed jog; 12–13 push off and straighten; 14–15 walking keys. The lean is drawn into the body: shoulder/back against an invisible trunk to the right, hips forward, supporting foot flat, other knee bent with the sole against the invisible trunk, hands in pockets. Do not rotate the whole figure to fake the lean. No trunk is painted into his PNG.

### Nóri & Max, 0–15 plus 16–21

Core order: neutral, reach handles, push, hold open, step A, step B, glance, turn inward, embrace, lean in, kiss, kiss hold, separate, turn back, step inside, pull shut.

Additional: 16 wave raise; 17 wave A; 18 wave B; 19 warmer final wave; 20–21 step-down keys. Inner hands remain joined during waves. Her fringe and wedding dress, and his curls, beard, polo and tailored shorts remain recognisable. They are drawn as one pair so the kiss and joined hands align.

## Tree assets

Trees are an exception to the 128 px character cell. Their transparent layers preserve the invitation's native 1536 × 1024 registration, with no house or other scene subjects. Individual leaf/twig cutouts retain native-size bounds and world pivots in `trees/wind-rig.json`.

Use `trees/tree-wind.js` on a transparent canvas, or use the cutouts and pivots in another renderer. The static trunks stay still while separate fragments sway with the stronger evolving v3 wind. These are true ink/alpha layers with normal source-over blending, not white rectangular stickers. No whole-image deformation is required.

## File and loader changes

`animations.json` lists all sheets, six frames per sheet, native anchors and clip indices. Resolve a global frame index with `floor(index / 6)` for the sheet and `index % 6` for the cell. The old four-column/single-atlas assumption must be updated.

Use final `frames/` and `spritesheets/` directly. `masters-4x/` is for authoring and inspection. Avoid running the earlier resizing/restyling script unchanged, as it would apply the old scale and anchor assumptions again. The included `sprite-player.js` reads the new mapping without adding travel paths or scale changes.
