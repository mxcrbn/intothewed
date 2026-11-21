"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Rings from "./Rings";
import { TEXT, type Lang } from "./i18n";

// The invitation card: the invite's own lettering and its rings (gently animated), then the place
// and month (the exact venue and date stay on the printed card), and the RSVP button at the bottom.
// Until the RSVP form exists, the button says so just under itself, without moving anything else.
export default function Card({ lang, shown }: { lang: Lang; shown: boolean }) {
  const t = TEXT[lang];
  const [soon, setSoon] = useState(false);
  return (
    <div className="card">
      <div className="card__body">
        <h1 className="card__names">
          <img src="/assets/invite/names.png" width={971} height={148} alt="Nóri & Max" />
        </h1>
        <Rings className="card__rings" active={shown} />
        <p className="card__line">{t.place}</p>
        <p className="card__line card__date">{t.date}</p>
      </div>
      <div className="rsvp">
        <button type="button" className="sketch-button" onClick={() => setSoon(true)}>{t.rsvp}</button>
        <p className={`rsvp__soon${soon ? " is-shown" : ""}`} aria-live="polite">{soon ? t.soon : ""}</p>
      </div>
    </div>
  );
}
