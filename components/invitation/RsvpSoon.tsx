"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import LangSwitch from "./LangSwitch";
import { TEXT } from "./i18n";
import { useLang } from "./useLang";

// Placeholder until the RSVP form exists, in the card's style and language.
export default function RsvpSoon() {
  const [lang, setLang] = useLang();
  const t = TEXT[lang];
  return (
    <div className="page">
      <LangSwitch lang={lang} onChange={setLang} />
      <div className="card card--page">
        <div className="card__body">
          <h1 className="card__names card__names--small">
            <img src="/assets/invite/names.png" width={971} height={148} alt="Nóri & Max" />
          </h1>
          <img className="card__rings card__rings--small" src="/assets/invite/rings.png" width={306} height={162} alt="" />
          <p className="card__line">{t.soon}</p>
        </div>
        <Link className="sketch-button" href="/#invitation">{t.back}</Link>
      </div>
    </div>
  );
}
