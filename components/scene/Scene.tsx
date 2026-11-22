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
          {/* "scroll", written by hand above the arrow once the couple has kissed: a loose, slanted
              hand with looped l's, uneven like a real one, roughened by the pencil filter (Home.tsx) */}
          <svg className="scroll-cue__word" viewBox="0 0 112 46" aria-hidden="true">
            <g fill="none" stroke="#1c1c1c" strokeLinecap="round" strokeLinejoin="round" transform="skewX(-9) translate(8 0)">
              <g strokeWidth="1.9">
                <path d="M14.5 25.5C10.5 21 3.6 23 4.8 27.2 5.9 31 14.4 30 13.8 35.2 13.2 40 5.2 39.8 2.6 35.6" />
                <path d="M33.6 27C30 21.4 20.6 23.4 20.9 31.4 21.2 39.6 29.6 40.8 35 35.2" />
                <path d="M41 23.2C42 28.6 40.4 34.2 41.3 39.6M41.2 30.4C42.8 25.6 47.4 22.4 52.6 24.8" />
                <path d="M65.4 23.6C59.4 22.2 55.6 26.6 56.2 32 56.8 37.4 60.4 40.4 64.8 39.6 69.4 38.8 71.8 34.8 71 30 70.2 25.4 67 22.6 62 24.6" />
                <path d="M77.6 40.2C84.4 31 89.6 17.4 86.4 8.2 84.4 2.8 79.6 6 79.3 13 78.8 22.4 80 31.6 81.8 37 83 40.4 86.2 40 88.6 36.8" />
                <path d="M91.2 40.8C97.6 31.8 102.2 19 99.6 10 97.8 4.4 93.2 7.4 92.9 14.2 92.5 23.2 93.4 32 95.2 37.4 96.4 40.8 100 40.2 103.6 35.4" />
              </g>
              {/* the pen pressing harder here and there */}
              <path d="M5.2 27.6c1.6 2.4 6 2.6 8 5M21.4 29c-.6 4.6 1.2 8 4.4 9.4M56.6 30c-.2 4 1.4 7.4 4.4 8.8M79.4 14c-.4 7 .4 14 1.6 20M93 15c-.4 6.4.2 13 1.4 18.8" strokeWidth="2.6" strokeOpacity=".5" />
            </g>
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/ui/scroll-arrow.png" width={192} height={256} alt="" loading="lazy" />
        </span>
      </a>
    </main>
  );
}
