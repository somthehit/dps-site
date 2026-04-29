"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  ShieldCheck, Target, History, Tractor, Sprout, Leaf, Shovel, Trees,
  TrendingUp, Users, Landmark, Wheat, Banknote, HandCoins, BarChart2,
  Star, Home, BookOpen, Award, Globe, Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STAT_ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp, Users, Landmark, Wheat, Banknote, HandCoins,
  BarChart2, ShieldCheck, Star, Sprout, Home, Tractor, BookOpen, Award, Globe, Layers,
};

interface Stat {
  id: string;
  value: string;
  labelEn: string;
  labelNe: string;
  sortOrder: number;
  icon?: string | null;
  color?: string | null;
}

interface AboutClientProps {
  settings?: Record<string, string>;
  stats?: Stat[];
}

export default function AboutClient({ settings = {}, stats = [] }: AboutClientProps) {
  const { t, locale } = useTranslation();
  
  const estbYear = settings.estb_year ?? "2069";
  const enToNeMap: Record<string, string> = { "0": "०", "1": "१", "2": "२", "3": "३", "4": "४", "5": "५", "6": "६", "7": "७", "8": "८", "9": "९" };
  const estbYearNe = estbYear.replace(/\d/g, (match) => enToNeMap[match] || match);
  const displayYear = locale === "ne" ? estbYearNe : estbYear;
  
  const replaceYear = (text: string) => {
    if (!text) return "";
    return text
      .replace(/2069/g, estbYear)
      .replace(/२०६९/g, estbYearNe)
      .replace(/2069/g, estbYear)
      .replace(/२०६९/g, estbYearNe);
  };

  const getContent = (keyEn: string, keyNe: string, fallback: string) => {
    const val = locale === 'ne' ? settings[keyNe] : settings[keyEn];
    return val || fallback;
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease] min-h-screen bg-slate-50">
      <div className="bg-brand-900 px-10 pt-20 pb-[60px] relative overflow-hidden text-center lg:text-left">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px), repeating-linear-gradient(90deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px)' }}></div>
        
        {settings.about_bg_image ? (
          <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url(${settings.about_bg_image})`, opacity: 0.15 }}></div>
        ) : (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* 3D Floating Icons Container */}
            <div className="absolute top-[15%] left-[5%] animate-float opacity-10 blur-[1px]">
              <Tractor className="w-32 h-32 text-white -rotate-12 drop-shadow-2xl" />
            </div>
            <div className="absolute top-[20%] right-[10%] animate-float opacity-10 [animation-delay:2s]">
              <Sprout className="w-24 h-24 text-white rotate-12 drop-shadow-2xl" />
            </div>
            <div className="absolute bottom-[10%] left-[20%] animate-float opacity-[0.07] [animation-delay:4s] blur-[2px]">
              <Shovel className="w-40 h-40 text-white -rotate-45 drop-shadow-2xl" />
            </div>
            <div className="absolute bottom-[20%] right-[5%] animate-float opacity-10 [animation-delay:1s]">
              <Trees className="w-28 h-28 text-white drop-shadow-2xl" />
            </div>
            <div className="absolute top-[50%] left-[45%] animate-float opacity-[0.05] [animation-delay:3s] blur-[3px]">
              <Leaf className="w-56 h-56 text-white rotate-90 drop-shadow-2xl" />
            </div>
          </div>
        )}

        <div className="container mx-auto relative z-10">
          <div className="text-[11px] font-semibold text-brand-300 tracking-[2px] uppercase mb-4 relative">{t.about.title}</div>
          <h1 className="font-sans text-[42px] md:text-[54px] font-bold text-white leading-[1.1] tracking-[-0.8px] relative max-w-[700px] mb-6">
            {getContent("about_header_en", "about_header_ne", replaceYear(t.about.header))}
          </h1>
          <p className="text-brand-100 text-lg md:text-xl max-w-2xl relative">
            {replaceYear(t.about.subtitle)}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">{t.about.vision}</h2>
            <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
              {getContent("about_vision_en", "about_vision_ne", t.about.visionText)}
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">{t.about.mission}</h2>
            <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
              {getContent("about_mission_en", "about_mission_ne", t.about.missionText)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 md:p-16 border border-slate-200 shadow-xl shadow-brand-900/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-6">
                <History className="w-4 h-4" /> {t.about.history}
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-8">{getContent("about_header_en", "about_header_ne", replaceYear(t.about.header))}</h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p className="whitespace-pre-line">{getContent("about_history_en", "about_history_ne", replaceYear(t.about.historyText))}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-900 rounded-3xl p-8 text-center text-white">
                <div className="text-3xl font-bold mb-1">{displayYear}</div>
                <div className="text-[10px] text-brand-300 uppercase tracking-widest font-bold">Established</div>
              </div>
              
              {stats.map((stat, idx) => {
                const StatIcon = STAT_ICON_MAP[stat.icon ?? ""] ?? TrendingUp;
                const cardColor = stat.color ?? "#1a6b3c";
                return (
                  <div
                    key={stat.id || idx}
                    className="rounded-3xl p-8 text-center border"
                    style={{
                      backgroundColor: cardColor + "18",
                      borderColor: cardColor + "33",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: cardColor + "30", color: cardColor }}
                    >
                      <StatIcon className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-bold mb-1" style={{ color: cardColor }}>{stat.value}</div>
                    <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: cardColor + "cc" }}>
                      {locale === 'ne' ? stat.labelNe : stat.labelEn}
                    </div>
                  </div>
                );
              })}

              {stats.length === 0 && (
                <>
                  <div className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-200">
                    <div className="text-3xl font-bold text-slate-900 mb-1">3K+</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Members</div>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-200">
                    <div className="text-3xl font-bold text-slate-900 mb-1">12Cr+</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Assets</div>
                  </div>
                  <div className="bg-brand-600 rounded-3xl p-8 text-center text-white">
                    <div className="text-3xl font-bold mb-1">20+</div>
                    <div className="text-[10px] text-brand-100 uppercase tracking-widest font-bold">Staff</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
