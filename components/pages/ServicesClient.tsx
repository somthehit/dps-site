"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Link from "next/link";
import { Banknote, Sprout, Tractor, ArrowRight, ShieldCheck, Package } from "lucide-react";

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

export default function ServicesClient() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        setServices(data || []);
      })
      .catch(() => {});
  }, []);

  const displayServices = services.length > 0 ? services : [
    {
      id: "savings",
      titleEn: t.servicesPage.savingsTitle,
      titleNe: t.servicesPage.savingsTitle, // using fallback from translation
      descEn: t.servicesPage.savingsDesc,
      descNe: t.servicesPage.savingsDesc,
      icon: "Banknote",
      category: "savings",
      featuresEn: ["Daily Savings", "Recurring Deposits", "Senior Citizen Savings", "Child Education Plan"],
      featuresNe: ["दैनिक बचत", "आवधिक बचत", "ज्येष्ठ नागरिक बचत", "बाल शिक्षा योजना"]
    },
    {
      id: "loans",
      titleEn: t.servicesPage.loansTitle,
      titleNe: t.servicesPage.loansTitle,
      descEn: t.servicesPage.loansDesc,
      descNe: t.servicesPage.loansDesc,
      icon: "Sprout",
      category: "loans",
      featuresEn: ["Agricultural Loans", "Micro-enterprise Loans", "Livestock Financing", "Equipment Loans"],
      featuresNe: ["कृषि ऋण", "लघु उद्यम ऋण", "पशुपालन वित्तपोषण", "उपकरण ऋण"]
    },
    {
      id: "agri",
      titleEn: t.servicesPage.agriTitle,
      titleNe: t.servicesPage.agriTitle,
      descEn: t.servicesPage.agriDesc,
      descNe: t.servicesPage.agriDesc,
      icon: "Tractor",
      category: "agriculture",
      featuresEn: ["Seed Distribution", "Fertilizer Support", "Soil Testing", "Market Linkage"],
      featuresNe: ["बीउ वितरण", "मल सहयोग", "माटो परीक्षण", "बजार लिङ्केज"]
    }
  ];

  return (
    <div className="animate-[fadeUp_0.4s_ease] min-h-screen bg-slate-50">
      <div className="bg-brand-900 px-10 pt-20 pb-[60px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px), repeating-linear-gradient(90deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px)' }}></div>
        <div className="container mx-auto">
          <div className="text-[11px] font-semibold text-brand-300 tracking-[2px] uppercase mb-4 relative">{t.servicesPage.title}</div>
          <h1 className="font-sans text-[42px] md:text-[54px] font-bold text-white leading-[1.1] tracking-[-0.8px] relative max-w-[700px] mb-6">
            {t.servicesPage.header}
          </h1>
          <p className="text-brand-100 text-lg md:text-xl max-w-2xl relative">
            {t.servicesPage.subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {displayServices.map((s, i) => {
            const IconComponent = (function() {
              switch(s.icon) {
                case "Sprout": return Sprout;
                case "Banknote": return Banknote;
                case "Tractor": return Tractor;
                case "ShieldCheck": return ShieldCheck;
                default: return Package;
              }
            })();

            const features = locale === 'ne' ? (s.featuresNe || []) : (s.featuresEn || []);

            return (
              <div key={s.id || i} className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-xl shadow-brand-900/5 transition-all hover:border-brand-300 hover:-translate-y-2 group">
                <div className={`w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {locale === 'ne' ? (s.titleNe || s.titleEn) : s.titleEn}
                </h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  {locale === 'ne' ? (s.descNe || s.descEn) : s.descEn}
                </p>
                <ul className="space-y-3 mb-10">
                  {features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-400"></div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/services/${s.category}`}>
                  <button className="flex items-center gap-2 text-brand-700 font-bold text-sm hover:gap-3 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="bg-brand-900 rounded-[40px] p-8 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to grow with us?</h2>
            <p className="text-brand-100 text-lg mb-10">
              Join thousands of farmers and community members who are already benefiting from our services.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <button className="px-8 py-4 bg-white text-brand-900 font-bold rounded-2xl hover:bg-slate-100 transition-colors">
                  Apply for Membership
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-colors">
                  Contact Support
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
