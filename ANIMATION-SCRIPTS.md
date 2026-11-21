# Animation scripts — N + M wedding site

> **Status:** the current assets (v3 pack, `art/characters/`, imported with
> `tools/import_assets.py`) follow this brief: every frame is used at 1:1. Two things were fixed on
> import or in the code: the children's peek frames were drawn lighter and are darkened to match,
> and the hop lift values were in the old 512 px units (scaled down in `animation.js`).

A brief for regenerating the animation assets. It covers the owl, the deer, the children with Nayan,
and Nóri & Max. Each section has:

1. the story, beat by beat, with timing and positions in the scene;
2. the frames to draw, one by one;
3. what is wrong with the current assets and has to be fixed.

All positions are in the pixels of the invitation drawing (`public/assets/invite-original.webp`, 1536 × 1024).
x goes from left to right and y from top to bottom. The point (x, y) of a character is always where
its feet touch the ground. The site is built from these numbers (`components/scene/animation.js`), so assets that follow
them drop straight in.

---

## 0. Rules for every asset

### Size: draw everything at its final size (1 : 1 with the invitation)

The site never resizes the characters. **One pixel of an asset is one pixel of the invitation
drawing** (`public/assets/invite-original.webp`, 1536 × 1024). On any screen the browser scales the
characters by exactly the same factor as the house and the trees, so the lines stay identical: same
thickness, same softness, same grain.

So each figure is drawn at the exact height it has in the scene, with the same pen as the invite:

Every frame, for every character, is the same **128 × 128 px cell**, and a sheet is 4 × 4 cells
(512 × 512 px). The feet always sit at **(64, 120)** in the cell. Only the figure's height changes:

| asset | figure height (top of head / ears → feet) | ground point in the cell |
|---|---|---|
| owl, perched / take-off / landing | **30 px** (head → feet) | (64, 100), feet |
| owl, flying / gliding | same owl, body ≈ 22 px long, wingspan ≈ 80 px | (64, 64), body centre |
| deer | **82 px** (ear tips → hooves), body ≈ 80 px long | (64, 120), hooves |
| deer, walking away (frames 12–15) | **72 px** (it is further away) | (64, 120) |
| girl | **56 px** | (64, 120) |
| boy | **75 px** | (64, 120) |
| Nayan | **106 px** | (64, 120) |
| Nóri & Max (pair) | **104 px** (Max's head → feet), pair ≈ 60 px wide side by side, ≤ 110 px with arms out | (64, 120), between their feet |
| door leaves (left, right) | 29 × 113 px each, the size of the doorway | two PNGs |

When generating with an image model, draw at **exactly 4×** (512 px cells, everything × 4). The only resize is then one exact ÷ 4 reduction.

- **Where these sizes come from:** each is the figure's height at the spot where it spends most of
  its time. The deer stands at (445, 792), the children and Nayan are at the big tree (y ≈ 788), and
  the couple is on the bottom step (y 760). The site draws them at that size all the time. Moving a
  few pixels forward or back on the lawn changes the "true" size by less than 5 %, which nobody sees,
  and resampling would cost more than it gains. The only size change left is the deer walking away,
  which is drawn smaller (72 px) and fades out.
- **Leave margin in each cell:** at least 6 px around the figure, and the figure must never touch
  the cell edge, so nothing gets cut during a wave, a jump or a stride.
- **Ground point:** in every frame of a character, the feet sit exactly on its ground point, at
  whole-pixel coordinates. A figure that stands still must not drift or jitter by even one pixel from
  frame to frame. Only the parts that move should change.
- **Do not resize after drawing.** Working larger and shrinking at the end is fine, as long as the
  delivered file is final and at the sizes above. Check it at 100 % zoom right next to the invite: the
  lines should be indistinguishable from the house's.
- **No @2x version:** the invite itself is 1536 px wide, so a sharper character would not match it.
  If a 2× invite is ever made (3072 × 2048), deliver everything at exactly 2× these numbers.

### Format

- **Sprite sheet:** a 4 × 4 grid of 128 × 128 cells (512 × 512), RGBA PNG. A character that needs more than
  16 frames gets a second sheet with the same cell size.
- **Background:** transparent outside the figure, **paper white (#fefefe) inside** it. The inside is
  the skin, the clothes and the fur, everything within the outline. A tree trunk or a house line must
  never show through a figure.
- **Facing:** every figure faces right (the site mirrors it to face left). Separate frames exist only
  where the drawing is not symmetric, for example a head turned to the camera, or a back view.
- **Exports:** also export each frame as a separate PNG (`frames/<name>/00.png` …), plus an
  `animations.json` in the current kit's format (clips: frames, fps, loop), with the cell size, the
  ground point and the figure height.

### Line style: match the invitation

The house and the trees are drawn with a fine pen:

- **Ink:** neutral dark grey, not black. A full-pressure stroke is about #1c1c1c; light strokes go
  down to about #6a6a6a.
- **Thickness:** at the 1 : 1 size, the **same pen as the invite, about 1.25 to 1.75 px**, never more
  than 2 px. Lines are soft and anti-aliased, not hard pixel lines.
- **Thin and uneven:** the pressure varies along each line, with small breaks, slightly wobbly
  strokes and an occasional doubled stroke. Lines are not clean and even like vector art.
- **Shading:** none, and no solid black areas. Hair is made of a few loose strokes, not filled in.
  Eyes are small dots or short dashes.
- **Detail level:** these figures are small, the girl just 56 px tall. Anything under about 2 px
  (fingers, buttons, fabric folds) turns into a grey smudge, so leave it out or keep it to one stroke.
  Faces in particular are 8–12 px tall (Nóri & Max) and need a few strong, readable marks, not fine
  detail.

With assets made this way, the restyling the site used to do (`tools/prepare_sprites.py`) is no longer
needed: the files are used exactly as delivered.

### Sizes relative to each other

For reference: the doorway opening is 113 px tall, Max is 104 px on the bottom step, Nayan 106 px at
the tree (the same as Max, standing a bit further forward), the boy 75, the girl 56, and the deer 82
(the tip of its ears reaches about four-fifths of Max's height, because it stands further forward in
the garden). The owl is 30.

---

## 1. The owl

### Story (repeats forever)

| time | what happens |
|---|---|
| 0 – 12 s | The owl sits on the branch of the left tree, feet at (315, 301), looking right towards the big tree. It blinks now and then. |
| 12 s | **Take-off** (0.2 s): it crouches, opens its wings and pushes off. |
| 12.2 – 17.7 s | **Flight** (5.5 s): it climbs a little off the branch, then makes a long, gentle swoop just above the roof line, about 50 px above the branches at its highest and dipping about 80 px at the lowest, and rises again to the big right tree. It flaps for the first 40 % of the flight, glides from 40 to 62 %, then flaps again. |
| 17.7 s | **Landing** (0.45 s): it flares up with wings spread forward and tail down, grips the branch at (1289, 280) and folds its wings. |
| then | It sits facing the way it flew for about 28 s, then flies back to the left tree facing left (the same frames mirrored). |

### Frames (one sheet, 16 frames of 128 × 128, owl 30 px tall, facing right)

| # | pose |
|---|---|
| 0 | Perched, at rest: upright, wings folded, eyes open, head facing right in three-quarter view. **White inside.** |
| 1 | Perched, blinking: the same pose with the eyes closed (two short curved strokes). Nothing else moves. |
| 2 | Take-off 1: crouched, the head pulled down, wings starting to lift away from the body. |
| 3 | Take-off 2: legs pushing off, wings raised high, body leaning forward. |
| 4 – 11 | **Flapping cycle, 8 frames, loops at 10 fps.** Body horizontal, head forward, legs tucked. Wings: 4 high (fully up), 5 up, 6 level, 7 down, 8 fully down (tips below the body), 9 coming up folded, 10 level, 11 up. The body rises slightly on the downstroke (about 4 px in the frame). Same body height in every frame. |
| 12 | Glide: wings fully spread and flat, primaries slightly fanned, tail fanned. |
| 13 | Landing 1: body tilted up, wings spread forward to brake, legs out in front with talons open. |
| 14 | Landing 2: talons on the branch, wings half folded, slightly raised. |
| 15 | Landing 3: almost settled, wings nearly folded, tail down. |
| 16 (2nd sheet, optional) | Perched, head turned to look at the camera, for an occasional look at the viewer. |

Ground point: feet at (64, 100) for perched, take-off and landing. The body centre is at (64, 64)
for flapping and gliding, so the flying owl turns around its body. At 30 px, the whole owl is
about 15 pen strokes; draw it like the invite's original perched owl, which is the reference.

### Fix in the next version

- Lines too thick and too dark compared with the trees. The inside must be white everywhere,
  including inside the open wings.
- In flight, the line between the wings and the body must stay readable at 30 px: one wing outline
  and two or three feather strokes, not hatching.

---

## 2. The deer

### Story (first at 22 s, then once a minute)

| time (from its start) | what happens | position (feet) |
|---|---|---|
| 0 – 4.7 s | **Walks out of the woods** on the left, facing right, at a calm pace (50 px/s). It is still in the woods, so the far-left trunk (x 70 – 160) passes in front of it. | from (−90, 745) to (140, 780) |
| 4.7 – 10.8 s | **Walks into the garden** in front of the second trunk (x 182 – 262) and stops just past the house's first window, which ends at x ≈ 466. | to (445, 792) |
| 10.8 – 17.3 s | **Stops and looks around** (6.5 s): profile, ears flick, then **once**, from about 2.5 to 4 s, it turns its head to look straight at the camera. Back to profile, a small head dip (sniffing the air), stillness. | (445, 792) |
| 17.3 – 21.5 s | **Turns back and walks towards the trees**, facing left. | to (240, 748) |
| 21.5 – 27.5 s | **Walks off into the forest between the two trunks**, moving away from us with its **head still turned left** (towards the forest, not back at us). It gets smaller (×0.75) and fades out. The second trunk passes in front of it. | to (172, 690) |

### Frames (128 × 128 cells, deer 82 px tall, 72 px for 12–15, facing right)

| # | pose |
|---|---|
| 0 | Standing, profile, head up, ears up. The rest pose. |
| 1 | Same pose, ears turned back or one ear flicked. Only the ears change. |
| 2 | Same body, **head turned towards the camera** (both eyes and both ears visible, muzzle facing us). The body does not move at all. |
| 3 | Same body, head lowered a little (sniffing) or tilted. |
| 4 – 11 | **Walk cycle, 8 frames, loops at 8 fps** (one full stride = 8 frames). A slow walk, legs moved in diagonal pairs, the head bobbing a little. The body stays at the same height and the hooves stay on the ground line (y 120 in the frame). The hooves must not slide: plant a hoof and keep it in place while the body moves forward 50 ÷ 8 ≈ 6 drawing px per frame. |
| 12 – 15 | **Walking away, 4 frames, loops at 6 fps.** Three-quarter back view (we see the rump and the back), moving into the picture towards the upper left (it is mirrored, so draw it heading upper right), **head turned to the side in profile, towards its direction of travel**. Do not turn the head back to the camera. |
| new (optional) | **Turn-around, 3 frames.** From standing profile facing right, through a three-quarter front view, to standing profile facing left. Right now it just flips from one frame to the next. |

### Fix in the next version

- The line should be fine and grey. The current kit is too heavy at the deer's small size.
- Frames 12 – 15 have the head looking back over the shoulder, which reads as "turning back to us".
  Redraw them with the head in profile, in the direction it is walking (see above).
- Frame 2 (looking at us) has to be on exactly the same body as frame 0, so only the head moves.

---

## 3. The children and Nayan, around the big right tree

### Cast and sizes (all facing right)

| | height (1 : 1) | cell | look |
|---|---|---|---|
| Girl (about 5 years old) | 56 px | 128 × 128 | dress, hair down |
| Boy (about 7 years old) | 75 px | 128 × 128 | t-shirt, shorts |
| Nayan (teenager, about 15) | 106 px | 128 × 128 | open shirt over a t-shirt, jeans, sneakers |

The big right trunk runs from x 1352 to 1450 at its base (y 795). A child behind it is hidden by
it. Once they pass behind the house (y < 730) they disappear behind the wall.

### Story (first at 5 s, then every 75 s)

| time | girl | boy | Nayan |
|---|---|---|---|
| 0 – 1 s | hidden behind the trunk | hidden behind the trunk | hidden |
| 1 – 4.4 s | **Peeks once** on the left side of the trunk: only her head and shoulder lean out, held for about 2 s, then she ducks back. | | |
| 1.8 – 5.2 s | | **Peeks once** on the right side of the trunk, the same way, a beat after her. | |
| 6.2 s | **Bolts** out to the left, running. | | |
| 6.9 s | | **Chases her**, running. | |
| 6.2 – 13.6 s | Both run a loop across the front lawn: (1290, 795) → (1150, 800) → (1060, 770) → (1170, 752) → (1300, 762), then back to the tree. Girl at (1262, 776), boy at (1215, 782). Speed 105 px/s, about 9 frames per stride. | | |
| 9 s | | | **Strolls out** from behind the trunk, walking (80 px/s), to (1350, 790). |
| ≈ 9.6 – 21.9 s | | | **Leans back against the trunk**, relaxed: see the "Nayan's lean" description below. |
| 13.6 – 19.8 s | turns to face right, **hops** up and down (excited), then **waves** to us | turns to face right, **waves** to us | (still leaning) |
| 19.8 s | runs off behind the house: (1250, 724) → (1110, 706) | the same, just behind her | |
| 21.9 s | | | **Pushes off the tree and straightens up** (0.6 s). |
| 22.5 s | | | **Waves once** to us (about 2 s). |
| 24.8 s | | | **Jogs after the kids** behind the house: (1262, 728) → (1150, 710), at 90 px/s. |

### Frames, girl and boy (one sheet each, the same layout as now)

| # | pose |
|---|---|
| 0 | Standing, front three-quarter view, arms down. The rest pose. |
| 1 | Waving, arm up, hand open. |
| 2 | Waving, hand tilted the other way, for the back-and-forth of a wave. |
| 3 | Playing / pointing (spare). |
| 4 – 11 | **Run cycle, 8 frames, loops at 9 fps**, profile facing right. A child's run: arms pumping, knees high, and both feet in the air in two of the frames. Same height throughout. |
| 12 – 15 | **Hop:** crouch, push off, top of the jump with arms up, land. The site lifts the figure itself (0, −2, −5, −1 px for the girl; 0, −2, −6, −1 for the boy), so draw the feet at the ground point in every frame. |
| new: **peek** (2 frames) | **Leaning out from behind a tree**: the figure stands upright, but the upper body is bent sideways from the hips (about 35° for the girl and 25° for the boy), head tilted. The legs are drawn straight and vertical, because they stay hidden behind the trunk. One frame with a neutral face, one with a big grin. Today the site fakes this by tilting the whole figure, feet included. |

### Frames, Nayan (one sheet)

| # | pose |
|---|---|
| 0 | Standing, front three-quarter view, arms down. |
| 1 | Waving, arm up, hand open (the arm raised from the elbow, a casual wave). |
| 2 | Waving, hand tilted the other way. |
| 3 | **The lean** (see below). The most important frame. |
| 4 – 11 | Run / jog cycle, profile facing right, 8 frames. A teenager's relaxed jog, not a sprint. |
| 12 – 13 | **Push off the tree:** 12 = still leaning, weight moving forward, one hand out of his pocket; 13 = upright, taking a first step. |
| 14 – 15 | **Walk** (2 key frames, or 4 with frames 12 – 15 of a second sheet) for the stroll out to the tree. |

### Nayan's lean (frame 3): what it should look like

The current frame is a standing pose with hands in pockets that the site tilts by 6°. That's why it
looks wrong: the whole body tilts as a stiff plank, the feet tilt off the ground, and his back never
actually touches the bark.

Draw it as a real lean against a trunk:

- **View:** front three-quarter view, the body turned slightly towards the camera, the trunk on the
  right of the frame. Draw a few strokes of the trunk only as a guide layer, not in the export. The
  site faces him left, mirrored, with the tree behind his right shoulder.
- **Contact:** the shoulder blades and the back of the head almost touching the bark, which is a
  vertical line about 14 px to the right of the ground point. The upper body is tilted back about 8 – 10° from vertical,
  leaning **into** the trunk. Draw that tilt, rather than having the site rotate the figure.
- **Hips:** pushed slightly forward, away from the trunk, about 5 px. His weight
  is between the trunk and his standing foot.
- **Legs:** the standing leg is straight, slightly angled, foot flat on the ground about 10 px in front
  of the trunk line. The other leg is bent at the knee, with the **sole of that foot flat against the
  trunk** at about knee height, or alternatively crossed in front of the standing leg with the toe on
  the ground. Both feet must be on the ground line or on the trunk, never floating.
- **Arms:** both hands deep in the front jeans pockets, elbows relaxed outwards; or arms loosely
  crossed. The open shirt hangs a little open.
- **Head:** tilted slightly to one side, chin a little down, looking out at the lawn where the kids
  run (to the left in the scene), with a small amused smile.
- **Feeling:** "chilling, watching the little ones". It should look relaxed and believable at about
  100 px tall.
- Optional extras: **3b**, the same lean with the head turned to follow the kids, and **3c**, the
  same lean with one ankle crossed, to switch between every few seconds.
- **The ground point** stays at the standing foot (64, 120) so the site can place him at
  (1350, 790) against the trunk without tilting him.

### Fix in the next version

- Lines: thinner and greyer, especially on the small girl. White inside.
- Run cycles: feet must not slide. Plant one foot per stride and move the body about 105 ÷ 9 ≈ 12
  px per frame.

---

## 4. Nóri & Max at the front door

They are drawn together in each frame, as a pair (as in the current kit), so their arms and their
kiss line up.

### Size and place

- The doorway opening is (784, 619), 58 × 113 px. The two door leaves are hinged on its left and
  right edges and split at x 813.
- Max is 104 px on the bottom step at (815, 760), and about 99 px standing in the doorway at
  (813, 733). The pair fits within the 58 px opening when they stand side by side close together.
- Nóri is on the left and Max on the right (as seen by us), Max a head taller.

### Story (first at 52 s, right after the deer has gone; then once a minute)

| time | what happens | pose |
|---|---|---|
| 0 – 1 s | Doors shut. | — |
| 1 – 1.4 s | Behind the doors, they reach for the handles. | reach-handles |
| 1.4 – 2.2 s | They **push both doors open** inwards together. | push → hold-open |
| 2.2 – 3.2 s | They **step out** of the doorway and down onto the steps, side by side, holding hands. | step A / step B, alternating |
| 3.2 – 3.7 s | **Pause** on the bottom step, facing us, smiling (0.5 s). | neutral |
| 3.7 – 5.2 s | **They wave hello to everyone**: Nóri with her left hand, Max with his right, the outer hands raised from the elbow at about head height, two back-and-forth waves, then the arms come down. Their inner hands stay joined. | wave raise → wave A → wave B → A → B → A → raise → neutral |
| 5.2 – 5.6 s | **They glance at each other.** | glance |
| 5.6 – 5.9 s | They turn towards each other. | turn-inward |
| 5.9 – 6.4 s | Embrace: her hands on his chest, his arm around her waist. | embrace |
| 6.4 – 6.9 s | They lean in. | lean-in |
| 6.9 – 8.5 s | **Kiss**, then hold the kiss. | kiss → kiss-hold |
| 8.5 – 9.1 s | They separate, smiling at each other. | separate |
| 9.1 – 9.6 s | They turn back to the door. | turn-back |
| 9.6 – 10.7 s | They **walk back inside**, seen from behind, holding hands. | turn-back → step-inside |
| 10.7 – 11.7 s | They **pull the doors shut** from inside. | pull-shut |

### Frames (2 sheets of 128 × 128 cells, pair 104 px tall, ground point (64, 120))

The current kit's 16 poses (0 neutral, 1 reach-handles, 2 push, 3 hold-open, 4 – 5 step forward,
6 glance, 7 turn-inward, 8 embrace, 9 lean-in, 10 kiss, 11 kiss-hold, 12 separate, 13 turn-back,
14 step-inside, 15 pull-shut) are kept. These are added on a second sheet:

| # | pose |
|---|---|
| 16 | **Wave, raising:** standing side by side facing us, inner hands holding. Outer forearms halfway up (elbow at waist height, hand at shoulder height). |
| 17 | **Wave A:** outer hands fully up, open palm facing us at about head height, elbows bent at about 90°, upper arms slightly out from the body. Hands tilted outwards. Big smiles. |
| 18 | **Wave B:** the same, hands tilted inwards (the back-and-forth of the wave). Only the forearms and hands change from 17. |
| 19 | (Optional) wave A with heads tilted towards each other, for a warmer last wave. |
| 20 – 21 | (Optional) **Walk down the steps**, 2 frames, front view going down a step, holding hands. Today they glide down from the doorway to the step using the step-forward frames. |

Poses 16 – 18 are currently **made by the site** from pose 3 (hold-open) by rotating the outer
forearms upwards (`tools/make_couple_wave.py`). It works, but the elbows are stiff and the sleeves do
not follow the arm. Properly drawn wave poses will look much better.

### Fix in the next version

- **Faces:** they are the most important thing and are only about 10–12 px tall. Draw them
  with a few strong, recognisable marks (Nóri's fringe and smile, Max's curls and beard) rather than
  fine detail, which turns grey at that size.
- **Same line style** as the rest of the drawing (thin and grey, see section 0). The current kit is
  clean and even and has shading in the hair. Keep the white inside.
- Keep both figures' feet on the same ground line, with the pair's anchor at the midpoint between
  them.
- **Door leaves:** 29 × 113 px each, drawn in the invite's style, front view, closed. The site
  projects them when they swing open.

---

## 5. Delivery checklist

For each character:

- [ ] `spritesheets/<name>.png`: 4 × 4 cells at the 1 : 1 sizes of section 0, transparent
  outside, white inside, facing right. Use a second sheet `<name>-2.png` if more than 16 frames.
- [ ] `frames/<name>/NN.png`: the same frames as separate files.
- [ ] `animations.json`: the clips (frames, fps, loop), the cell size, the ground point and the figure height.
- [ ] The line style from section 0 (grey, 1.25–1.75 px, uneven, no shading), checked at 100 % zoom
  next to the invite.
- [ ] Feet on the anchor in every frame, no jitter on frames that stand still, no sliding feet in walk
  and run cycles.

When a new pack arrives, run `python3 tools/import_assets.py <unzipped pack folder>`: the site
draws the frames 1 : 1 with no resampling or restyling.