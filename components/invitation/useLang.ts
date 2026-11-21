"use client";

import { useEffect, useState } from "react";
import { LANGS, type Lang } from "./i18n";

// The visitor's language: English by default, remembered in this browser once they pick one.
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved && (LANGS as readonly string[]).includes(saved)) setLang(saved as Lang);
    } catch { /* storage unavailable: stay in English */ }
  }, []);
  const choose = (l: Lang) => {
    setLang(l);
    try { localStorage.setItem("lang", l); } catch { /* fine */ }
  };
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return [lang, choose];
}
