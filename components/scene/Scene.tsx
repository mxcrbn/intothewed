"use client";

import { useEffect, useRef } from "react";
import { startScene } from "./animation";

// The invitation drawing, full screen, gently coming to life.
// Without JavaScript (or while loading) the plain drawing shows.
// After the first kiss, a hand-drawn arrow at the bottom invites people to scroll to the card.
export default function Scene({ label, cueLabel }: { label: string; cueLabel: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current) return;
    return startScene(root.current);
  }, []);

  return (
    <main id="scene" ref={root} aria-label={label}>
      {/* static fallback, hidden once the animated scene is ready */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img id="fallback" src="/assets/invite-original.webp" alt="" width={1536} height={1024} />
      {/* the drawing, with leaves and twigs moving in the wind */}
      <canvas id="trees" aria-hidden="true" />
      {/* the owl, the deer, the children and the couple, in the drawing's own coordinates */}
      <canvas id="life" aria-hidden="true" />
      <a className="scroll-cue" href="#invitation" aria-label={cueLabel}>
        <span className="scroll-cue__fade">
          {/* "SCROLL", written by hand above the arrow once the couple has kissed: six letters in the
              arrow's own pen, each stroke a little unsteady, with a faint second pass here and there */}
          <svg className="scroll-cue__word" viewBox="0 0 124 26" aria-hidden="true">
            <g fill="none" stroke="#1c1c1c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
              <path d="M16.2 7.1C13.4 3.9 7.3 4.4 7.1 8.4 6.9 12.5 15.9 11.9 15.7 16.6 15.5 20.9 8.4 21 5.8 17.6" />
              <path d="M38.6 7.6C35.8 3.7 27.2 5.6 27.5 13 27.8 20.1 35.6 21.5 38.9 17.3" />
              <path d="M48.9 20.9C48.3 15.4 49.1 10 48.5 5M48.6 5.5C53.9 3.7 59 5.8 58.6 9.3 58.2 12.6 53.2 13.5 49.1 13" />
              <path d="M52.8 13.3C55 15.9 57.2 18.5 59.9 21.1" />
              <path d="M75.6 4.9C70.6 4.4 67.7 8.3 67.9 13 68.1 18.2 71.2 21.3 75.3 21.1 79.9 20.9 82.3 17.2 82.1 12.4 81.9 7.9 79.3 4.6 74.3 5.3" />
              <path d="M91.5 4.8C92 10.2 91.2 15.6 91.7 20.8 94.6 20.3 97.6 20.9 100.5 20.4" />
              <path d="M108.6 5.2C108.3 10.4 109 15.8 108.5 21 111.5 20.6 114.5 20.6 117.6 20.9" />
              <path d="M9.4 5.6c2.1-.7 4.3-.3 6 1M70.4 18.6c1.3 1.6 3 2.4 4.9 2.3M93.4 20.6c1.9-.2 3.7-.1 5.5 0" strokeOpacity=".35" strokeWidth="1" />
            </g>
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/ui/scroll-arrow.png" width={192} height={256} alt="" loading="lazy" />
        </span>
      </a>
    </main>
  );
}
