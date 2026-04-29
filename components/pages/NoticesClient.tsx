"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Calendar, ArrowRight, Megaphone, Bell } from "lucide-react";
import Link from "next/link";

type Notice = {
  id: number;
  titleEn: string;
  titleNe: string;
  descEn: string;
  descNe: string;
  tagEn: string;
  tagNe: string;
  category: string;
  date: string;
};

export default function NoticesClient() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notices")
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  const categories = [
    t.notices.categories_list.all,
    t.notices.categories_list.urgent,
    t.notices.categories_list.events,
    t.notices.categories_list.financial,
    t.notices.categories_list.general,
  ];

  return (
    <div className="animate-[fadeUp_0.4s_ease] min-h-screen bg-slate-50">
      <div className="bg-brand-900 px-10 pt-20 pb-[60px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px), repeating-linear-gradient(90deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px)' }}></div>
        <div className="container mx-auto">
          <div className="text-[11px] font-semibold text-brand-300 tracking-[2px] uppercase mb-4 relative">{t.notices.title}</div>
          <h1 className="font-sans text-[42px] md:text-[54px] font-bold text-white leading-[1.1] tracking-[-0.8px] relative max-w-[700px] mb-6">
            {t.notices.header}
          </h1>
          <p className="text-brand-100 text-lg md:text-xl max-w-2xl relative">
            {t.notices.subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-16">
          
          <div className="space-y-8">
            {items.map((notice) => (
              <Link 
                key={notice.id} 
                href={`/notices/${notice.id}`}
                className="block bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-brand-300 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                      notice.tagEn === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'
                    }`}>
                      {locale === 'en' ? notice.tagEn : notice.tagNe}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(notice.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">
                    {notice.category}
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 group-hover:text-brand-700 transition-colors leading-tight">
                  {locale === 'en' ? notice.titleEn : notice.titleNe}
                </h3>
                <p className="text-slate-500 leading-relaxed mb-8 text-lg">
                  {locale === 'en' ? notice.descEn : notice.descNe}
                </p>
                <div className="flex items-center gap-2 text-brand-700 font-bold text-sm">
                  {t.notices.viewDetail} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            ))}
            {items.length === 0 && !loading && (
              <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
                <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No notices currently available.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Bell className="w-6 h-6 text-brand-600" /> Categories
              </h4>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button key={cat} className="w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-all border border-transparent hover:border-brand-100">
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-brand-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-800 rounded-bl-full opacity-50"></div>
              <Megaphone className="w-12 h-12 text-brand-400 mb-6" />
              <h4 className="text-2xl font-bold mb-4">{locale === 'en' ? 'Join Newsletter' : 'न्युजलेटरमा सामेल हुनुहोस्'}</h4>
              <p className="text-brand-200 text-sm mb-8 leading-relaxed font-medium">
                {locale === 'en' ? 'Stay updated with the latest news directly in your inbox.' : 'आफ्नो इनबक्समा सिधै पछिल्लो समाचारको साथ अपडेट रहनुहोस्।'}
              </p>
              <div className="space-y-4">
                <input type="email" placeholder={locale === 'en' ? 'Email address' : 'इमेल ठेगाना'} className="w-full h-14 px-6 rounded-2xl bg-white/10 border border-white/20 text-white text-sm outline-none focus:bg-white/20 transition-all placeholder:text-brand-300" />
                <button className="w-full h-14 bg-white text-brand-900 font-bold rounded-2xl hover:bg-brand-100 transition-all active:scale-95 shadow-xl shadow-black/20">
                  {locale === 'en' ? 'Subscribe Now' : 'सब्सक्राइब गर्नुहोस्'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
