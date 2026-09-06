import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLang } from "./use-calm-mode";
import { getTranslations } from "@/lib/i18n.functions";

type Dict = Record<string, string>;
const I18nCtx = createContext<{ t: (k: string, fallback?: string) => string; dict: Dict }>({
  t: (k, f) => f ?? k,
  dict: {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const { lang } = useLang();
  const [dict, setDict] = useState<Dict>({});

  useEffect(() => {
    let cancelled = false;
    getTranslations({ data: { locale: lang.toLowerCase() } })
      .then((d) => { if (!cancelled) setDict(d); })
      .catch(() => { if (!cancelled) setDict({}); });
    return () => { cancelled = true; };
  }, [lang]);

  const t = (k: string, fallback?: string) => dict[k] ?? fallback ?? k;
  return <I18nCtx.Provider value={{ t, dict }}>{children}</I18nCtx.Provider>;
}

export const useT = () => useContext(I18nCtx);
