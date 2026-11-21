# Nóri & Max — wedding-ring favicon

Two interlocking plain wedding bands adapted from the invitation. The primary favicon uses a stronger charcoal ink silhouette so the tiny 16–32 px version stays readable. The original-style fine sketch is included as `rings-sketch-transparent.png` for larger use.

Copy `favicon.ico`, `favicon-32x32.png` and `apple-touch-icon.png` into the website's public/root directory, then add:

```html
<link rel="icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

The ICO contains 16, 32, 48 and 64 px images. Matching PNGs are included at 16, 32, 48, 64, 96, 192 and 512 px. The primary exports have a paper-white background to retain contrast in light and dark browser interfaces.

`rings-transparent.png` is the 512 px transparent strong mark. Its ring holes and exterior are transparent. `rings-sketch-transparent.png` is the finer 512 px outline illustration, with white band faces and transparent holes/exterior.

Give this folder to Claude and ask it to install the primary favicon files and head links in the existing website. No deployment, website edits or changes to the invitation are included in this package.
