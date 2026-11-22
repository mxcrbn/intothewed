# Nóri & Max — four hand-drawn emojis

Four separate charcoal line drawings with transparent backgrounds and interiors:

| Emoji | Filename |
| --- | --- |
| 🫶 | heart-hands.png |
| 🤗 | hugging.png |
| 🤩 | star-struck.png |
| 🥰 | smiling-hearts.png |

Folders contain matching PNGs at 32, 48, 64, 128, 256 and 1024 pixels square. Use a 128 px file for a crisp inline icon around 32–48 CSS px. The 1024 px originals are for larger use. Each icon has transparent breathing room and an imperfect hand-drawn contour.

Copy the folder into the website's public assets and add the included `emojis.css`:

```html
<img class="wedding-emoji"
     src="/wedding-emojis/128/heart-hands.png"
     width="128" height="128" alt="Love">
```

Use a meaningful alt label if the icon adds meaning. If the same meaning is already in the adjacent text, use `alt=""` so screen readers do not repeat it. Adjust the CSS size and vertical alignment to the actual text. The fine charcoal strokes are intended for the website's pale background.

No animation or website replacement is needed; these are independent text illustrations.
