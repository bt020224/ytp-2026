"use client";

import { useEffect, useState } from "react";
import type { Lang } from "./i18n";

const KEY = "tfl_lang";

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY) as Lang | null;
      if (v === "zh" || v === "en" || v === "ja" || v === "ko") {
        setLangState(v);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  };

  return [lang, setLang];
}
