"use client";

import { useLanguage } from "./LanguageContext";
import { Translations } from "./translations";

export function useTranslation() {
  const { t, locale, setLocale } = useLanguage();
  
  return {
    t: t as Translations,
    locale,
    setLocale,
  };
}
