"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-md border border-slate-200/50">
      <button
        onClick={() => setLocale("en")}
        className={`px-3 py-1 text-[11px] font-bold rounded transition-all ${locale === "en"
            ? "bg-brand-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-200"
          }`}
      >
        ENG
      </button>
      <button
        onClick={() => setLocale("ne")}
        className={`px-3 py-1 text-[11px] font-bold rounded transition-all ${locale === "ne"
            ? "bg-brand-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-200"
          }`}
      >
        नेपा
      </button>
    </div>
  );
}
