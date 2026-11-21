"use client";

import { useEffect, useRef } from "react";
import { startScene } from "./animation";

// The invitation drawing, full screen, gently coming to life.
// Without JavaScript (or while loading) the plain drawing shows.
export default function Scene() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current) return;
    return startScene(root.current);
  }, []);

  return (
    <main
      id="scene"
      ref={root}
      aria-label="Dessin de la maison dans les bois : une chouette vole de branche en branche, une biche passe dans les arbres, trois enfants jouent dans le jardin, et Nóri & Max sortent sur le perron"
    >
      {/* static fallback, hidden once the animated scene is ready */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img id="fallback" src="/assets/invite-original.webp" alt="" width={1536} height={1024} />
      {/* the drawing, with leaves and twigs moving in the wind */}
      <canvas id="trees" aria-hidden="true" />
      {/* the owl, the deer, the children and the couple, in the drawing's own coordinates */}
      <canvas id="life" aria-hidden="true" />
    </main>
  );
}
