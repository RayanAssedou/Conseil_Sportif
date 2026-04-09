"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Locale, translate, isRTL } from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "he",
  setLocale: () => {},
  t: (key) => key,
  isRtl: true,
});

const LS_KEY = "site-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("he");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY) as Locale | null;
      if (saved && ["en", "he", "ar", "ru"].includes(saved)) {
        setLocaleState(saved);
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const rtl = isRTL(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [locale, mounted]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LS_KEY, newLocale);
    } catch {}
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRtl: isRTL(locale) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);
