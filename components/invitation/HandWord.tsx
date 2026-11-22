// A word written by hand: capital letters drawn stroke by stroke in the drawing's pen (the same
// hand as the "SCROLL" above the arrow), instead of set in type. Used for the few short display
// words (the language names, the RSVP button); everything people read at length stays in Marcellus.
// Each letter is [width, path]: caps run from y 5 to y 21. A letter is never placed twice the same:
// its place in the word tilts, lifts and widens it a touch, as a hand would.
const GLYPHS: Record<string, [number, string]> = {
  A: [15, "M1 21C3.4 15.6 5.6 10.2 7.6 4.9 9.8 10.1 11.9 15.5 14.2 20.8M4.2 14.9C6.5 14.5 8.9 14.6 11.2 14.8"],
  C: [14, "M12.6 7.6C9.8 3.7 1.2 5.6 1.5 13 1.8 20.1 9.6 21.5 12.9 17.3"],
  E: [11.5, "M10.4 5.3C7.5 4.9 4.6 5.4 1.7 5 2.2 10.3 1.3 15.6 1.8 20.8 4.8 20.4 7.8 20.9 10.7 20.5M2 12.7C4.4 12.4 6.8 12.6 9 12.5"],
  F: [11, "M10.5 5.2C7.6 4.9 4.6 5.4 1.7 5 2.2 10.3 1.4 15.7 1.8 21M2 12.8C4.3 12.5 6.6 12.7 8.8 12.5"],
  G: [15, "M12.8 7.6C10 3.7 1.3 5.6 1.5 13 1.7 20.1 9.8 21.6 13.2 17.4 13.4 15.9 13.3 14.5 13.2 13.2M8.6 13.4C10.2 13.2 11.8 13.3 13.4 13.1"],
  H: [14, "M1.7 5C2.2 10.3 1.3 15.7 1.8 21M12.2 4.8C12.6 10.2 11.9 15.6 12.4 20.9M2 12.9C5.4 12.5 8.9 12.8 12.2 12.6"],
  I: [4, "M2 5C2.5 10.3 1.6 15.7 2.1 21"],
  J: [10, "M8.2 4.9C8.6 9 8.1 13.2 8.3 17.2 8.1 21.4 2.6 21.9 1 18.2"],
  L: [11.5, "M1.5 4.8C2 10.2 1.2 15.6 1.7 20.8 4.6 20.3 7.6 20.9 10.5 20.4"],
  M: [18, "M1.5 21C1.9 15.7 1.4 10.3 1.9 5 4.4 9.7 6.6 14.1 9 18.6 11.3 14.2 13.6 9.6 16.1 4.9 16.5 10.2 15.9 15.6 16.4 20.9"],
  N: [14.5, "M1.7 21C2.1 15.7 1.4 10.3 1.9 5 5.5 10.2 9 15.5 12.7 20.8 13.1 15.5 12.5 10.2 12.9 4.8"],
  O: [17, "M9.1 4.9C4.1 4.4 1.2 8.3 1.4 13 1.6 18.2 4.7 21.3 8.8 21.1 13.4 20.9 15.8 17.2 15.6 12.4 15.4 7.9 12.8 4.6 7.8 5.3"],
  P: [12.5, "M1.9 21C1.3 15.5 2.1 10.1 1.5 5M1.6 5.5C6.9 3.7 11.6 6 11.2 9.6 10.8 13 6.2 14 2.1 13.4"],
  R: [14, "M1.9 20.9C1.3 15.4 2.1 10 1.5 5M1.6 5.5C6.9 3.7 12 5.8 11.6 9.3 11.2 12.6 6.2 13.5 2.1 13M5.8 13.3C8 15.9 10.2 18.5 12.9 21.1"],
  S: [12, "M11.2 7.1C8.4 3.9 2.3 4.4 2.1 8.4 1.9 12.5 10.9 11.9 10.7 16.6 10.5 20.9 3.4 21 .8 17.6"],
  V: [14.5, "M1 5C3.2 10.3 5.3 15.6 7.2 20.9 9.2 15.6 11.2 10.2 13.4 4.8"],
  Y: [14, "M1 5C3 7.9 5 10.6 7.1 13.4 9.1 10.6 11.2 7.8 13.2 4.8M7.1 13.4C7.4 15.9 6.9 18.5 7.2 21"],
  Z: [13, "M1.6 5.3C5 4.9 8.5 5.4 11.8 5 8.3 10.3 4.9 15.5 1.3 20.8 4.8 20.4 8.4 20.9 12 20.5"],
};
GLYPHS["Ç"] = [GLYPHS.C[0], GLYPHS.C[1] + "M7.2 21.5C8.8 22.5 8.5 24.7 6 24.4"];      // cedilla
GLYPHS["É"] = [GLYPHS.E[0], GLYPHS.E[1] + "M4.6 2.9C5.7 2.1 6.8 1.2 7.8 .2"];          // acute accent
const GAP = 4.6, SPACE = 9, TOP = -1, HEIGHT = 27;

export default function HandWord({ text, className }: { text: string; className?: string }) {
  let x = 1;
  const letters: { d: string; transform: string }[] = [];
  Array.from(text.toUpperCase()).forEach((ch, i) => {
    const g = GLYPHS[ch];
    if (!g) { x += SPACE; return; }
    const h = (ch.codePointAt(0)! * 31 + i * 17) % 97;          // the same word is always drawn the same
    const tilt = ((h % 7) - 3) * 1.3, lift = (((h >> 2) % 5) - 2) * 0.45, wide = 1 + (((h >> 4) % 3) - 1) * 0.06;
    const tall = 1 + (((h >> 1) % 5) - 2) * 0.035;      // some letters a little bigger than their neighbours
    letters.push({ d: g[1], transform: `translate(${x.toFixed(2)} ${lift.toFixed(2)}) rotate(${tilt.toFixed(1)} ${g[0] / 2} 13) translate(0 ${(21 * (1 - tall)).toFixed(2)}) scale(${wide} ${tall})` });
    x += g[0] * wide + GAP + (((h >> 3) % 3) - 1) * 0.7;
  });
  const width = x - GAP + 5;
  return (
    <svg className={`hand ${className ?? ""}`} viewBox={`0 ${TOP} ${width.toFixed(1)} ${HEIGHT}`} aria-hidden="true"
         style={{ aspectRatio: `${width.toFixed(1)} / ${HEIGHT}` }}>
      <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" transform="skewX(-8) translate(3.5 0)">
        {letters.map((l, i) => <path key={i} d={l.d} transform={l.transform} />)}
      </g>
    </svg>
  );
}
