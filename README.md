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

After the first kiss, a small hand-drawn arrow appears at the bottom: scrolling (or tapping it)
dissolves the drawing into the paper and brings up the **invitation card**, which uses the printed
invite's own lettering and rings (which, every few seconds, gently rock together with two tiny pencil glints): Nóri & Max, Cegléd, Hungary, August 2027 (the exact venue and date
stay on the printed card), and an RSVP button. The card speaks Magyar, English (the default) or
Français, switched at the top left and remembered in the browser. The RSVP button opens a short form (name, yes/no, how many, children, other names, allergies,
email, a note); answers go to a Google Sheet and are emailed to both of you through a small Google
Apps Script in your own account (one-time setup: `docs/RSVP-SETUP.md`). Until it's connected, the
button says the form is coming soon.

On a phone held upright, the drawing only fills a band, so the page simply stacks: the drawing at
the top (with all its animations), the language switch under it, then the card, on one screen with
no arrow. Turned sideways (and on computers) it's the two screens with the arrow and the dissolve.

All the motion is slow and discreet, so the page still feels like the drawing. With reduced motion
turned on, it stays still, and without JavaScript it shows the plain drawing.

## Run it

It's a Next.js app (App Router):

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Publish

Every push to `main` publishes the site at **https://noriandmax.com** (GitHub Pages):
`.github/workflows/pages.yml` runs `npm run build`, which exports the site as plain files to `out/`
(`output: "export"` in `next.config.ts`), and deploys them. The domain is set by `public/CNAME`.
Static export means no server code: when the RSVP needs to store answers, it will use a form
service that the static page posts to. (This is a personal site: it stays on GitHub Pages.)

Handy URL parameters for working on it:

| parameter | what it does |
|---|---|
| `?t=40` | start 40 s in (shows a clock, no fade-in); `?t=30` deer, `?t=56` couple, `?t=62` the arrow |
| `?fly=0.5` | with `?t=`, put the owl halfway through a flight |
| `?focus=1300,700,4` | zoom ×4 on a point of the drawing |
| `?wind=0.6&windSpeed=0.8` | try other wind settings (defaults 1 and 1) |

## How it's made

- **The drawing:** `public/assets/invite-original.webp`, the invitation itself, is the source of
  truth. Every position in the code is in its pixels (1536 × 1024).
- **The trees:** 97 leaf and twig fragments cut from the illustrator's¹ drawing
  (`public/assets/trees/`), each rotating around where it is attached, in front of the still
  drawing.
- **The characters:** lovingly hand-drawn² frames (`public/assets/characters/`). Every frame is
  128 × 128 px at the drawing's own scale, so it is used exactly as delivered, never resized. That
  way the lines match the house and the trees on any screen. New asset packs come in with
  `python3 tools/import_assets.py <pack folder>`; the 4× masters and the pack's notes are kept in
  `art/characters/`.
- **The page:** a Next.js app. The home page (`app/page.tsx`) is the scene component
  (`components/scene/Scene.tsx`), which starts the animation engine
  (`components/scene/animation.js`, plain JavaScript with no dependencies). Two canvases: one for
  the trees in the wind, one for the characters. All the choreography (paths, timing, clips) is in
  plain settings at the top of `animation.js`. More pages (RSVP, programme, venue…) go in
  `app/<name>/page.tsx`.
- **Animation scripts:** `ANIMATION-SCRIPTS.md` scripts every animation beat by beat and lists the
  frames to draw. Use it to regenerate better assets.

<sub>¹ The illustrator is ChatGPT. ² The hand was also ChatGPT's. The love is ours.</sub>

## Files

```
app/layout.tsx, app/globals.css       the page shell
app/page.tsx                          the home page: the drawing, then the card
components/Home.tsx                   the two screens and the scroll dissolve (stacked when upright)
components/invitation/                the card, the language switch, all texts (i18n.ts)
tools/rsvp/Code.gs                    the RSVP endpoint (Google Apps Script: sheet + emails)
docs/RSVP-SETUP.md                    how to set it up
app/favicon.ico, icon.png, apple-icon.png  the wedding-rings favicon
components/scene/Scene.tsx            the scene (canvases + fallback drawing)
components/scene/animation.js         the animation engine and all its tuning
ANIMATION-SCRIPTS.md                  beat-by-beat scripts for regenerating the animations
public/assets/invite-original.webp    the invitation drawing
public/assets/trees/                  still drawing, leaf/twig atlas and wind rig
public/assets/characters/             owl, deer, kids, Nayan, Nóri & Max: 1:1 sheets + animations.json
public/assets/doors/                  the two front-door leaves
art/characters/                       4× masters and notes of the current asset pack
tools/import_assets.py                brings a new asset pack into the site
tools/extract_invite.py               cuts the names out of the invite card (art/invite/)
public/assets/rings/                  the rings, animated by components/invitation/Rings.tsx (art/rings-animation/)
tools/make_favicon.py                 builds the favicon (transparent rings, light halo) from art/favicon/
```
