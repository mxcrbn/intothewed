"use client";

import { LANGS, LANG_NAMES, TEXT, type Lang } from "./i18n";

// Magyar · English · Français, top left; the current one is underlined.
export default function LangSwitch({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <nav className="langs" aria-label={TEXT[lang].languages}>
      {LANGS.map((l, i) => (
        <span key={l}>
          {i > 0 && <span className="langs__dot" aria-hidden="true">·</span>}
          <button
            type="button"
            lang={l}
            className="langs__item"
            aria-current={l === lang ? "true" : undefined}
            onClick={() => onChange(l)}
          >
            {LANG_NAMES[l]}
          </button>
        </span>
      ))}
    </nav>
  );
}
