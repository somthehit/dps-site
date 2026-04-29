"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getPublicUrl } from "@/utils/supabase/storage";

type GalleryItem = {
  id: number;
  titleEn: string;
  titleNe: string;
  category: string;
  imageKey: string;
};

export default function GalleryClient() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("all");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const filters = [
    { label: t.gallery.filters.all, value: "all" },
    { label: "Agriculture", value: "agriculture" },
    { label: "Events", value: "events" },
    { label: "Office", value: "office" },
    { label: "Members", value: "members" }
  ];

  useEffect(() => {
    fetch("/api/gallery")
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  const filteredItems = activeFilter === "all" 
    ? items 
    : items.filter(item => item.category === activeFilter);

  return (
    <div className="animate-[fadeUp_0.4s_ease] bg-slate-50 min-h-screen">
      <div className="bg-slate-950 px-10 pt-32 pb-24 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
        <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-brand-400 uppercase tracking-[0.2em] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping"></div>
            {t.gallery.title}
          </div>
          <h1 className="font-sans text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-[-0.04em] max-w-[800px] mb-6 drop-shadow-2xl">
            {locale === 'en' ? 'Capturing moments from our' : 'हाम्रो समुदायका केही'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-400 italic">community</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
            {locale === 'en' 
              ? 'A visual journey through our collective growth, agricultural milestones, and community celebrations.' 
              : 'हाम्रो सामूहिक वृद्धि, कृषि कोशेढुङ्गा र सामुदायिक उत्सवहरूको एक दृश्य यात्रा।'}
          </p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap px-10 py-6 border-b border-slate-200 bg-white/70 backdrop-blur-xl sticky top-0 z-20">
        {filters.map(filter => (
          <button 
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-6 py-2 rounded-full text-[13px] font-bold border transition-all duration-300 transform active:scale-95 ${
              activeFilter === filter.value 
                ? "bg-brand-600 text-white border-brand-700 shadow-lg shadow-brand-900/20" 
                : "bg-white/50 text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="px-10 py-12 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {filteredItems.map((item, i) => (
          <div 
            key={item.id} 
            className="break-inside-avoid group relative rounded-[32px] overflow-hidden bg-white hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] transition-all duration-500 cursor-pointer border border-slate-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={getPublicUrl(item.imageKey)} 
              alt={locale === 'en' ? item.titleEn : item.titleNe} 
              className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                i % 3 === 0 ? 'aspect-[3/4]' : i % 2 === 0 ? 'aspect-square' : 'aspect-[4/3]'
              }`}
              loading="lazy"
            />
            
            {/* Elegant Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
               <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                 <div className="inline-block px-3 py-1 bg-brand-500/20 backdrop-blur-md border border-brand-400/30 rounded-full text-brand-300 text-[10px] font-bold uppercase tracking-widest mb-3">
                   {item.category}
                 </div>
                 <div className="text-white font-black text-2xl leading-tight tracking-tight mb-2 drop-shadow-md">
                   {locale === 'en' ? item.titleEn : item.titleNe}
                 </div>
                 <div className="w-10 h-1 bg-brand-500 rounded-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100"></div>
               </div>
            </div>

            {/* Subtle border shine on hover */}
            <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-[32px] transition-colors duration-500 pointer-events-none"></div>
          </div>
        ))}
        {filteredItems.length === 0 && !loading && (
          <div className="col-span-full py-32 text-center">
             <div className="text-slate-300 font-bold text-lg mb-2">No photos captured here yet.</div>
             <div className="text-slate-400 text-sm italic">Stay tuned for more updates from our community.</div>
          </div>
        )}
      </div>
    </div>
  );
}
