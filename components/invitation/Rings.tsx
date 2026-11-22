"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import { mountWeddingRings, type WeddingRings } from "./ring-motion";
import "./ring-motion.css";

// The two rings from the invitation: every 8 s they gently rock together and settle, and two tiny
// pencil glints appear. `active` starts the loop from its beginning (when the card has come in,
// so people see the nudge as they arrive) and pauses it otherwise.
export default function Rings({ active, className }: { active: boolean; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const ctl = useRef<WeddingRings | null>(null);

  useEffect(() => {
    ctl.current = mountWeddingRings(el.current);
    return () => { ctl.current?.destroy(); ctl.current = null; };
  }, []);

  useEffect(() => {
    if (!ctl.current) return;
    if (active) ctl.current.replay();
    ctl.current.setPaused(!active);
  }, [active]);

  return (
    <span className={`wedding-rings ${className ?? ""}`} ref={el} aria-hidden="true">
      <span className="wedding-rings__art">
        <img className="wedding-rings__image" src="/assets/rings/rings.png" width={768} height={480} alt="" decoding="async" loading="lazy" />
        <span className="wedding-rings__twinkle wedding-rings__twinkle--a" />
        <span className="wedding-rings__twinkle wedding-rings__twinkle--b" />
      </span>
    </span>
  );
}
