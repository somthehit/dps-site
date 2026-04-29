"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale, translations, Translations } from "./translations";

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    // Push to next tick to avoid cascading render warning while fixing hydration
    const timer = setTimeout(() => {
      const savedLocale = localStorage.getItem("locale") as Locale;
      if (savedLocale === "en" || savedLocale === "ne") {
        setLocaleState(savedLocale);
      }
      setMounted(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Sync localStorage if it's not already set
    if (!localStorage.getItem("locale")) {
      localStorage.setItem("locale", locale);
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  const t = translations[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {/* 
        We wrap children in a div that suppresses hydration warnings 
        only if we're not mounted, though children themselves will 
        handle their own text mismatches safely.
      */}
      <div suppressHydrationWarning={!mounted}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
