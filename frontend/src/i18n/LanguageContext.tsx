import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { translations, TranslationKey } from "./translations";

export type SiteLang = "mn" | "en";

// Англи орчуулга бүрэн болтол хэл солих товчийг түр нуусан.
// Дахин нээх бол true болгоход товч гарч ирж, хэрэглэгчийн сонголт хадгалагдана.
export const LANGUAGE_SWITCH_ENABLED = false;

type LanguageContextValue = {
  lang: SiteLang;
  setLang: (lang: SiteLang) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitialLang(): SiteLang {
  if (typeof window === "undefined" || !LANGUAGE_SWITCH_ENABLED) return "mn";
  try {
    return window.localStorage.getItem("digit_lang") === "en" ? "en" : "mn";
  } catch {
    return "mn";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SiteLang>(readInitialLang);

  const setLang = useCallback((next: SiteLang) => {
    const value: SiteLang = LANGUAGE_SWITCH_ENABLED ? next : "mn";
    setLangState(value);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("digit_lang", value);
      } catch {
        // хадгалах боломжгүй орчинд алгасна
      }
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[lang] || entry.mn;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }
  return context;
}
