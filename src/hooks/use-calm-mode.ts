import { useEffect, useState } from "react";

const KEY = "civil.calmMode";

export function useCalmMode() {
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" && window.localStorage.getItem(KEY) === "1";
    const prefersReduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const v = stored || prefersReduced;
    setCalm(v);
    document.documentElement.classList.toggle("calm-mode", v);
  }, []);

  const toggle = () => {
    setCalm((c) => {
      const next = !c;
      document.documentElement.classList.toggle("calm-mode", next);
      try { window.localStorage.setItem(KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  return { calm, toggle };
}

const LANG_KEY = "civil.lang";
const LANGS = ["EN", "ES", "FR", "PT", "DE"] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_OPTIONS = LANGS;

export function useLang() {
  const [lang, setLangState] = useState<Lang>("EN");
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY);
      if (stored && (LANGS as readonly string[]).includes(stored)) setLangState(stored as Lang);
    } catch {}
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem(LANG_KEY, l); } catch {}
  };
  return { lang, setLang };
}
