/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { TEXT, type Lang } from "./i18n";

// The invitation card: the invite's own lettering and rings, then the place and month (the exact
// venue and date stay on the printed card), and the RSVP button at the bottom.
export default function Card({ lang }: { lang: Lang }) {
  const t = TEXT[lang];
  return (
    <div className="card">
      <div className="card__body">
        <h1 className="card__names">
          <img src="/assets/invite/names.png" width={971} height={148} alt="Nóri & Max" />
        </h1>
        <img className="card__rings" src="/assets/invite/rings.png" width={306} height={162} alt="" />
        <p className="card__line">{t.place}</p>
        <p className="card__line card__date">{t.date}</p>
      </div>
      <Link className="sketch-button" href="/rsvp/">{t.rsvp}</Link>
    </div>
  );
}
