"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Search, Download, FileText } from "lucide-react";
import { getPublicUrl } from "@/utils/supabase/storage";

type DownloadItem = {
  id: number;
  titleEn: string;
  titleNe: string;
  category: string;
  fileKey: string;
  createdAt: string;
};

export default function DownloadsClient() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/downloads")
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  const categories = [
    { id: "all", name: t.downloads.categories_list.all, icon: "📁" },
    { id: "forms", name: t.downloads.categories_list.forms, icon: "📝" },
    { id: "reports", name: t.downloads.categories_list.reports, icon: "📊" },
    { id: "bylaws", name: t.downloads.categories_list.bylaws, icon: "⚖️" },
    { id: "other", name: "Other Documents", icon: "📄" },
  ];

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategoryId === "all" || item.category === activeCategoryId;
    const matchesSearch = item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.titleNe.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const getFileExtension = (url?: string) => {
    if (!url) return "FILE";
    return url.split('.').pop()?.toUpperCase() || "FILE";
  };

  const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!url) return;

    const ext = url.split('.').pop()?.split('?')[0] || '';
    const fullFilename = ext ? `${filename}.${ext}` : filename;

    if (url.includes('supabase.co') || url.includes('/storage/v1/object/public/')) {
      const downloadUrl = url.includes('?') 
        ? `${url}&download=${encodeURIComponent(fullFilename)}` 
        : `${url}?download=${encodeURIComponent(fullFilename)}`;
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fullFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fullFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download fallback triggered:", error);
      // If fetch fails (CORS etc), fallback to opening in new tab
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        window.location.assign(url);
      }
    }
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease] min-h-screen bg-slate-50">
      <div className="bg-brand-900 px-10 pt-20 pb-[60px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px), repeating-linear-gradient(90deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px)' }}></div>
        <div className="text-[11px] font-semibold text-brand-300 tracking-[2px] uppercase mb-4 relative">{t.downloads.title}</div>
        <div className="font-sans text-[54px] font-bold text-white leading-[1.1] tracking-[-0.8px] relative max-w-[560px] mb-4">
          {locale === 'en' ? 'Get all your' : 'तपाईंको सबै'}<br /><em className="text-brand-300 italic">official</em> documents
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-[600px] border-b border-slate-200">
        <div className="border-r border-slate-200 py-7 bg-white md:sticky md:top-0 self-start h-full">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-[1px] px-5 mb-4">{t.downloads.categories}</div>
          <div className="flex flex-col">
            {categories.map(cat => (
              <div 
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`flex items-center gap-3 px-6 py-4 text-sm cursor-pointer border-r-4 transition-all duration-150 ${
                  activeCategoryId === cat.id 
                    ? "text-brand-700 bg-brand-50 border-brand-700 font-bold" 
                    : "text-slate-600 border-transparent font-medium hover:text-brand-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                {cat.name}
                <span className="ml-auto text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-400">
                  {cat.id === 'all' ? items.length : items.filter(i => i.category === cat.id).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-10 py-8 bg-slate-50/50">
          <div className="flex items-center gap-4 mb-8 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm focus-within:border-brand-400 transition-all">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.downloads.search} 
              className="border-none outline-none text-sm text-slate-900 flex-1 font-sans bg-transparent placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xl font-bold text-slate-900">
                {categories.find(c => c.id === activeCategoryId)?.name}
              </div>
              <div className="text-[13px] text-slate-500">
                {filteredItems.length} {locale === 'en' ? 'files found' : 'फाइलहरू भेटिए'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredItems.map((dl) => (
              <div 
                key={dl.id} 
                onClick={() => window.open(getPublicUrl(dl.fileKey), '_blank')}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-[24px] p-5 cursor-pointer transition-all duration-200 hover:border-brand-300 hover:shadow-xl group"
              >
                <div className="w-14 h-14 rounded-2xl shrink-0 flex flex-col items-center justify-center bg-brand-50 text-brand-700 group-hover:bg-brand-700 group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                  <span className="text-[8px] font-bold mt-0.5 uppercase">{getFileExtension(dl.fileKey)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-slate-900 mb-1 truncate">
                    {locale === 'en' ? dl.titleEn : dl.titleNe}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="uppercase font-semibold text-brand-600/70">{dl.category}</span>
                    <span>•</span>
                    <span>{new Date(dl.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDownload(e, getPublicUrl(dl.fileKey), locale === 'en' ? dl.titleEn : dl.titleNe)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 text-brand-700 text-xs font-bold transition-all hover:bg-brand-700 hover:text-white"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.downloads.download}</span>
                </button>
              </div>
            ))}
            {filteredItems.length === 0 && !loading && (
              <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-slate-300">
                 <div className="text-4xl mb-4">📂</div>
                 <p className="text-slate-500 font-medium">No documents found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
