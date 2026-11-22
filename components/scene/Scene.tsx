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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/ui/scroll-arrow.png" width={192} height={256} alt="" loading="lazy" />
        </span>
      </a>
    </main>
  );
}
