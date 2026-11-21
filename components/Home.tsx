"use client";

import { useEffect, useRef, useState } from "react";
import Scene from "./scene/Scene";
import Card from "./invitation/Card";
import LangSwitch from "./invitation/LangSwitch";
import { TEXT } from "./invitation/i18n";
import { useLang } from "./invitation/useLang";

// Wide screens (landscape): two screens, the drawing then the invitation card. Scrolling from one
// to the other is a slow dissolve: the drawing fades into the paper (and gently draws closer)
// while the card rises in. The scroll position drives it through the --p custom property
// (0 = drawing, 1 = card).
// Upright screens (portrait phones): the drawing only fills a band, so the card simply sits under
// it, all on one screen: no arrow, no dissolve (the CSS does the layout, under the same query).
const STACKED = "(orientation: portrait)";
export default function Home() {
  const [lang, setLang] = useLang();
  const card = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [cardShown, setCardShown] = useState(false);   // the card has (almost) fully come in

  useEffect(() => {
    const root = document.documentElement;
    const stacked = window.matchMedia(STACKED);
    let queued = false;
    const update = () => {
      queued = false;
      if (stacked.matches) {
        root.style.setProperty("--p", "0");
        root.dataset.stage = "drawing";
        if (overlay.current) overlay.current.inert = false;
        setCardShown(true);
        return;
      }
      const end = card.current?.offsetTop || window.innerHeight;
      const p = Math.min(Math.max(window.scrollY / end, 0), 1);
      root.style.setProperty("--p", p.toFixed(4));
      root.dataset.stage = p > 0.995 ? "card" : p < 0.005 ? "drawing" : "between";
      // the card's links only work (and take keyboard focus) once it is mostly there
      if (overlay.current) overlay.current.inert = p < 0.6;
      setCardShown(p > 0.9);   // re-renders only when it flips
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    stacked.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      stacked.removeEventListener("change", onScroll);
    };
  }, []);

  return (
    <>
      <Scene label={TEXT[lang].scene} cueLabel={TEXT[lang].scroll} />
      <div className="card-layer" ref={overlay}>
        <LangSwitch lang={lang} onChange={setLang} />
        <Card lang={lang} shown={cardShown} />
      </div>
      {/* the two scroll stops; the content itself is in the fixed layers above */}
      <div className="stops" aria-hidden="true">
        <section className="stop" />
        <section className="stop" id="invitation" ref={card} />
      </div>
    </>
  );
}
