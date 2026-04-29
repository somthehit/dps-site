"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Sprout, ShieldCheck, Tractor, Banknote, Phone, Mail, MapPin, Calendar, Clock,
  TrendingUp, Package, Users, Landmark, Wheat, HandCoins, BarChart2, Star, Home, BookOpen, Award, Globe, Layers,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STAT_ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp, Users, Landmark, Wheat, Banknote, HandCoins,
  BarChart2, ShieldCheck, Star, Sprout, Home, Tractor, BookOpen, Award, Globe, Layers,
};
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import HeroSlider, { HeroSlide } from "@/components/ui/HeroSlider";
import NewsletterForm from "@/components/ui/NewsletterForm";

type SiteStat = {
  id: number;
  value: string;
  labelEn: string;
  labelNe: string;
  icon?: string | null;
  color?: string | null;
};

type Notice = {
  id: number;
  titleEn: string;
  titleNe: string;
  descEn: string;
  descNe: string;
  tagEn: string;
  tagNe: string;
  date: string;
};

type Service = {
  id: string;
  titleEn: string;
  titleNe: string;
  descEn: string;
  descNe: string;
  category: string;
  icon: string;
  featuresEn: string[] | null;
  featuresNe: string[] | null;
};

export default function HomeClient() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [tickerItems, setTickerItems] = useState<{ contentEn: string; contentNe: string }[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then(res => res.json()),
      fetch("/api/notices").then(res => res.json()),
      fetch("/api/settings").then(res => res.json()),
      fetch("/api/news-ticker").then(res => res.json()),
      fetch("/api/hero-slides/public").then(res => res.json()),
      fetch("/api/services").then(res => res.json())
    ]).then(([statsData, noticesData, settingsData, tickerData, heroData, servicesData]) => {
      setStats(statsData);
      setNotices(noticesData);
      setSettings(settingsData);
      setTickerItems(tickerData);
      setHeroSlides(heroData || []);
      setServices(servicesData || []);
    });
  }, []);

  const latestNotices = notices.slice(0, 2);
  const boardNotices = notices.slice(0, 5);

  const displayStats = stats.length > 0 ? stats : [
    { id: 1, value: "3,247+", labelEn: "Total Members", labelNe: "कुल सदस्य" },
    { id: 2, value: "Rs. 4.2Cr", labelEn: "Share Capital", labelNe: "शेयर पुँजी" },
    { id: 3, value: "Rs. 12.8Cr", labelEn: "Total Assets", labelNe: "कुल सम्पत्ति" },
    { id: 4, value: "13 Years", labelEn: "Service Years", labelNe: "सेवा वर्ष" },
  ];

  const activeTickerItems = tickerItems.length > 0
    ? tickerItems.map(item => locale === 'en' ? item.contentEn : item.contentNe)
    : (locale === 'en'
      ? [settings.ticker_agm_en || t.ticker.agm, settings.ticker_loan_en || t.ticker.loan, settings.ticker_seeds_en || t.ticker.seeds]
      : [settings.ticker_agm_ne || t.ticker.agm, settings.ticker_loan_ne || t.ticker.loan, settings.ticker_seeds_ne || t.ticker.seeds]
    );

  return (
    <main className="flex flex-col min-h-screen bg-white">

      {/* News Ticker */}
      <div className="news-ticker">
        <div className="news-ticker-content">
          {activeTickerItems.map((item, i) => <span key={i}>• {item}</span>)}
          {activeTickerItems.map((item, i) => <span key={`dup-${i}`}>• {item}</span>)}
        </div>
      </div>

      {/* Hero Banner Section */}
      <HeroSlider slides={heroSlides} settings={settings} />

      {/* Core Statistics Bar */}
      <div className="relative z-20 -mt-16 container mx-auto px-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-10 md:p-14 overflow-hidden relative group/container">
          {/* Decorative Background Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50/50 rounded-full -mr-32 -mt-32 blur-3xl group-hover/container:bg-brand-100/50 transition-colors duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/50 rounded-full -ml-32 -mb-32 blur-3xl group-hover/container:bg-emerald-100/50 transition-colors duration-700"></div>

          <div
            className="grid gap-6 md:gap-8 relative z-10"
            style={{ gridTemplateColumns: `repeat(${displayStats.length}, 1fr)` }}
          >
            {displayStats.map((stat) => {
              const StatIcon = STAT_ICON_MAP[stat.icon ?? ""] ?? TrendingUp;
              const iconColor = stat.color ?? "#1a6b3c";

              return (
                <div key={stat.id} className="flex flex-col items-center text-center group/item">
                  <div className="relative mb-4">
                    <div
                      className="absolute inset-0 rounded-[20px] opacity-0 group-hover/item:opacity-30 group-hover/item:scale-150 transition-all duration-700 blur-xl"
                      style={{ backgroundColor: iconColor }}
                    ></div>
                    <div
                      className="w-12 h-12 rounded-[20px] flex items-center justify-center relative z-10 border shadow-sm group-hover/item:rotate-[15deg] group-hover/item:scale-110 transition-all duration-500"
                      style={{
                        backgroundColor: iconColor + "18",
                        color: iconColor,
                        borderColor: iconColor + "33",
                      }}
                    >
                      <StatIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter group-hover/item:text-brand-700 transition-colors duration-300">
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.15em] group-hover/item:text-slate-600 transition-colors duration-300">
                      {locale === 'en' ? stat.labelEn : stat.labelNe}
                    </div>
                  </div>
                  <div className="w-0 h-1 rounded-full mt-6 group-hover/item:w-8 transition-all duration-500" style={{ backgroundColor: iconColor }}></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <div className="text-brand-600 font-bold text-sm uppercase tracking-[0.2em] mb-4">Our Expertise</div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                {t.services.title}
              </h2>
            </div>
            <p className="text-lg text-slate-500 leading-relaxed max-w-md">
              {t.services.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {services.length > 0 ? (
              services.slice(0, 3).map((service) => {
                const IconComponent = (function () {
                  switch (service.icon) {
                    case "Sprout": return Sprout;
                    case "Banknote": return Banknote;
                    case "Tractor": return Tractor;
                    case "ShieldCheck": return ShieldCheck;
                    default: return Package;
                  }
                })();

                return (
                  <div key={service.id} className="group relative bg-white p-10 rounded-[32px] border border-slate-100 hover:border-brand-200 hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-10 group-hover:bg-brand-50 transition-colors"></div>
                    <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mb-8 group-hover:bg-brand-700 group-hover:text-white transition-all duration-300">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      {locale === 'en' ? service.titleEn : service.titleNe}
                    </h3>
                    <p className="text-slate-600 mb-8 leading-relaxed flex-grow text-[15px]">
                      {locale === 'en' ? service.descEn : service.descNe}
                    </p>
                    <Link href={`/services/${service.category}`} className="flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-brand-700 transition-all active:scale-95">
                      {t.common.readMore} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })
            ) : (
              [
                {
                  icon: Banknote,
                  title: t.services.saving.title,
                  desc: t.services.saving.desc,
                  href: "/services/savings",
                  features: ["Daily Savings", "Fixed Deposit", "Recurring Savings"],
                },
                {
                  icon: Sprout,
                  title: t.services.loan.title,
                  desc: t.services.loan.desc,
                  href: "/services/loans",
                  features: ["Micro-Loans", "Business Loans", "Equipment Finance"],
                },
                {
                  icon: Tractor,
                  title: t.services.tech.title,
                  desc: t.services.tech.desc,
                  href: "/services/agriculture",
                  features: ["Soil Testing", "Vet Services", "Marketing Help"],
                }
              ].map((service, i) => (
                <div key={i} className="group relative bg-white p-10 rounded-[32px] border border-slate-100 hover:border-brand-200 hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-10 group-hover:bg-brand-50 transition-colors"></div>
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mb-8 group-hover:bg-brand-700 group-hover:text-white transition-all duration-300">
                    <service.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                  <p className="text-slate-600 mb-8 leading-relaxed flex-grow text-[15px]">{service.desc}</p>
                  <div className="space-y-4 mb-10">
                    {service.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm text-slate-700 font-semibold bg-slate-50/50 p-2 rounded-xl group-hover:bg-white transition-colors">
                        <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link href={service.href} className="flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-brand-700 transition-all active:scale-95">
                    {t.common.readMore} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Notices and News Section */}
      <section className="py-32 bg-slate-50/50 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20">

            {/* News Section */}
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <div className="text-brand-600 font-bold text-xs uppercase tracking-widest mb-2">Updates</div>
                  <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">{locale === 'en' ? 'Latest News' : 'पछिल्लो समाचार'}</h2>
                </div>
                <Link href="/notices" className="group flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-brand-700 font-bold text-sm hover:border-brand-600 transition-all">
                  {t.common.viewAll} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                {latestNotices.map((notice) => (
                  <Link key={notice.id} href={`/notices/${notice.id}`} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 group block hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="aspect-[16/10] bg-slate-200 relative overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-brand-50 to-brand-100 group-hover:scale-110 transition-transform duration-700"></div>
                      <div className="absolute top-6 left-6 bg-brand-600/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 uppercase rounded-full tracking-widest shadow-lg">
                        {locale === 'en' ? notice.tagEn : notice.tagNe}
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-4 text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-4">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(notice.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 10:30 AM</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-brand-700 transition-colors leading-tight">
                        {locale === 'en' ? notice.titleEn : notice.titleNe}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                        {locale === 'en' ? notice.descEn : notice.descNe}
                      </p>
                      <div className="flex items-center gap-2 text-brand-700 text-sm font-bold">
                        {t.common.readMore} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Notice Board */}
            <div className="lg:w-1/3">
              <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm h-full flex flex-col">
                <div className="bg-slate-900 text-white p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-6 h-6 text-brand-400" />
                    <h2 className="text-xl font-bold uppercase tracking-tight">{locale === 'en' ? 'Notice Board' : 'सूचना पाटी'}</h2>
                  </div>
                  <p className="text-slate-400 text-xs">Official announcements and circulars</p>
                </div>
                <div className="p-4 flex-grow">
                  {boardNotices.map((notice) => (
                    <Link key={notice.id} href={`/notices/${notice.id}`} className="p-6 hover:bg-brand-50 rounded-2xl border-b border-slate-50 last:border-0 block transition-all group">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${notice.tagEn === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'
                          }`}>
                          {locale === 'en' ? notice.tagEn : notice.tagNe}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(notice.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-[15px] font-bold text-slate-800 group-hover:text-brand-700 transition-colors line-clamp-2 leading-relaxed">
                        {locale === 'en' ? notice.titleEn : notice.titleNe}
                      </h4>
                    </Link>
                  ))}
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <Link href="/notices" className="flex items-center justify-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800 transition-colors">
                    {t.common.viewAll} {t.nav.notice} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="lg:w-1/2">
              <div className="text-brand-600 font-bold text-sm uppercase tracking-[0.2em] mb-4">Stay Connected</div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-8">
                Get the latest updates from our cooperative
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed mb-12">
                Join our community of over 3,000 members and receive important notices, agricultural tips, and financial news directly in your inbox.
              </p>
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-slate-700">Official News</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Bell className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-slate-700">Instant Alerts</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 w-full">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Quick Section */}
      <section className="py-32 bg-brand-900 text-white relative overflow-hidden">
        {/* Curved wave decoration - touches top edge with crests */}
        <div className="absolute -top-24 left-0 w-full overflow-hidden leading-none h-[140px] md:h-[180px]">
          <svg className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-flow" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,20 Q90,100 180,60 T360,40 T540,80 T720,20 T900,60 T1080,40 T1260,80 T1440,20 L1440,320 L0,320 Z" fill="#ffffff" opacity=".06"></path>
          </svg>
          <svg className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-flow-reverse" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,60 Q120,0 240,40 T480,60 T720,20 T960,60 T1200,40 T1440,60 L1440,320 L0,320 Z" fill="#ffffff" opacity=".04"></path>
          </svg>
        </div>
        <style jsx>{`
          @keyframes waveFlow {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes waveFlowReverse {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-wave-flow {
            animation: waveFlow 20s linear infinite;
          }
          .animate-wave-flow-reverse {
            animation: waveFlowReverse 15s linear infinite;
          }
        `}</style>
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
            <div className="max-w-2xl">
              <div className="w-16 h-1.5 bg-brand-500 mb-8"></div>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tight">{t.footer.needInfo}</h2>
              <p className="text-brand-200 text-xl mb-12 leading-relaxed">
                {t.footer.desc}
              </p>
              <div className="grid sm:grid-cols-2 gap-8 md:gap-12">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center group-hover:bg-brand-500 transition-all">
                    <Phone className="w-8 h-8 text-brand-300" />
                  </div>
                  <div>
                    <div className="text-brand-400 text-sm font-bold uppercase tracking-widest mb-1">{t.nav.callUs}</div>
                    <div className="text-2xl font-bold">
                      {settings.phone || "+977-9805791785"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-brand-300" />
                  </div>
                  <div>
                    <div className="text-brand-400 text-sm font-bold uppercase tracking-widest mb-1">{t.nav.emailUs}</div>
                    <div className="text-2xl font-bold truncate">
                      {settings.email || "dps.cop724@gmail.com"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/3 w-full">
              <div className="bg-white p-10 rounded-tl-[60px] rounded-tr-[40px] rounded-br-[60px] rounded-bl-[40px] text-slate-900 shadow-2xl relative">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-brand-500 rounded-3xl -z-10 animate-pulse"></div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <MapPin className="text-brand-600 w-7 h-7" /> {t.footer.location}
                </h3>
                <p className="text-slate-600 mb-10 text-lg leading-relaxed">
                  {locale === 'en' ? (settings.address_en || t.nav.address) : (settings.address_ne || t.nav.address)}
                </p>
                <Link href="/contact" className="block">
                  <Button className="w-full bg-slate-900 hover:bg-brand-700 h-16 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/10 transition-all active:scale-95">
                    {t.footer.branches}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
