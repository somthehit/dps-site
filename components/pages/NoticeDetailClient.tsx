"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Calendar, Clock, ArrowLeft, Share2, Printer, Tag, Download, FileText, ImageIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getPublicUrl } from "@/utils/supabase/storage";

type Notice = {
  id: string;
  titleEn: string;
  titleNe: string;
  descEn: string;
  descNe: string;
  contentEn: string;
  contentNe: string;
  tagEn: string;
  tagNe: string;
  category: string;
  date: string;
  imageKey: string | null;
};

export default function NoticeDetailClient({ id }: { id: string }) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch current notice
    fetch(`/api/notices/${id}`)
      .then(res => {
        if (res.status === 404) return null;
        return res.json();
      })
      .then(data => {
        setNotice(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    // Fetch recent notices
    fetch("/api/notices")
      .then(res => res.json())
      .then(data => setRecentNotices(data.filter((n: Notice) => n.id !== id).slice(0, 3)));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!notice) {
    notFound();
  }

  const isPDF = notice.imageKey?.toLowerCase().endsWith(".pdf");
  const fileUrl = notice.imageKey ? getPublicUrl(notice.imageKey) : null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="container mx-auto px-6">
        {/* Back Button */}
        <Link 
          href="/notices"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-700 font-medium mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {locale === 'en' ? 'Back to Notices' : 'सूचनाहरूमा फर्कनुहोस्'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          {/* Main Content */}
          <article className="space-y-12">
            <div className="bg-white rounded-[40px] p-6 md:p-12 border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider bg-brand-50 text-brand-700">
                  {locale === 'en' ? notice.tagEn : notice.tagNe}
                </span>
                <div className="flex items-center gap-6 text-sm text-slate-400 font-medium">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {new Date(notice.date).toLocaleDateString(locale === 'ne' ? 'ne-NP' : 'en-US')}
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
                {locale === 'en' ? notice.titleEn : notice.titleNe}
              </h1>

              <div className="prose prose-slate prose-lg max-w-none">
                <p className="text-xl text-slate-600 leading-relaxed mb-8 font-medium italic border-l-4 border-brand-200 pl-6 bg-slate-50 py-4 rounded-r-2xl">
                  {locale === 'en' ? notice.descEn : notice.descNe}
                </p>
                
                <div className="text-slate-700 leading-loose space-y-6 text-lg whitespace-pre-wrap">
                  {locale === 'en' ? notice.contentEn : notice.contentNe}
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-all font-bold text-sm border border-slate-100">
                    <Share2 className="w-4 h-4" /> {locale === 'en' ? 'Share' : 'साझा गर्नुहोस्'}
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-all font-bold text-sm border border-slate-100"
                  >
                    <Printer className="w-4 h-4" /> {locale === 'en' ? 'Print' : 'प्रिन्ट गर्नुहोस्'}
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                  <Tag className="w-4 h-4 text-brand-500" />
                  <span>{notice.category}</span>
                </div>
              </div>
            </div>

            {/* File Preview Section */}
            {fileUrl && (
              <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700">
                      {isPDF ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">{locale === 'en' ? 'Document Preview' : 'दस्तावेज पूर्वावलोकन'}</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{isPDF ? 'PDF Document' : 'Image File'}</p>
                    </div>
                  </div>
                  <a 
                    href={fileUrl} 
                    download 
                    target="_blank"
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-700 text-white font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-200"
                  >
                    <Download className="w-4 h-4" /> {locale === 'en' ? 'Download' : 'डाउनलोड'}
                  </a>
                </div>
                
                <div className="p-4 md:p-8 bg-slate-100/50">
                  <div className="bg-white rounded-3xl shadow-inner border border-slate-200 overflow-hidden min-h-[400px] flex items-center justify-center relative">
                    {isPDF ? (
                      <iframe 
                        src={`${fileUrl}#toolbar=0`} 
                        className="w-full h-[600px] border-none"
                        title="Notice PDF Preview"
                      />
                    ) : (
                      <div className="relative w-full h-[500px]">
                        <Image 
                          src={fileUrl} 
                          alt="Notice Attachment" 
                          fill 
                          className="object-contain"
                          sizes="(max-width: 1200px) 100vw, 800px"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="bg-brand-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-brand-900/20 group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>
              <h4 className="text-2xl font-black mb-6 relative">{locale === 'en' ? 'Need Help?' : 'सहयोग चाहिन्छ?'}</h4>
              <p className="text-brand-100 text-sm leading-relaxed mb-10 relative font-medium">
                {locale === 'en' 
                  ? 'If you have any questions regarding this notice or need technical assistance, please contact our support team.' 
                  : 'यस सूचनाको बारेमा कुनै प्रश्नहरू भएमा वा प्राविधिक सहयोग चाहिएमा, कृपया हाम्रो सहयोग टोलीलाई सम्पर्क गर्नुहोस्।'}
              </p>
              <Link 
                href="/contact"
                className="w-full py-5 bg-white text-brand-900 rounded-[20px] font-black flex items-center justify-center hover:bg-brand-50 transition-all shadow-xl relative active:scale-95"
              >
                {t.nav.contact}
              </Link>
            </div>

            <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm">
              <h4 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <Clock className="w-5 h-5 text-brand-600" />
                {locale === 'en' ? 'Recent Notices' : 'हालैका सूचनाहरू'}
              </h4>
              <div className="space-y-8">
                {recentNotices.length > 0 ? (
                  recentNotices.map(n => (
                    <Link key={n.id} href={`/notices/${n.id}`} className="group block">
                      <div className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-2">
                        {new Date(n.date).toLocaleDateString(locale === 'ne' ? 'ne-NP' : 'en-US')}
                      </div>
                      <h5 className="font-bold text-slate-800 group-hover:text-brand-700 transition-colors line-clamp-2 leading-snug">
                        {locale === 'en' ? n.titleEn : n.titleNe}
                      </h5>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No other notices yet.</p>
                )}
              </div>
              
              <Link 
                href="/notices"
                className="mt-10 pt-10 border-t border-slate-100 block text-center text-xs font-black text-brand-600 uppercase tracking-widest hover:text-brand-800 transition-colors"
              >
                View All Notices
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
