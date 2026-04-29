"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { getPublicUrl } from "@/utils/supabase/storage";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

type Service = {
  id: string;
  titleEn: string;
  titleNe: string;
  descEn: string;
  descNe: string;
  category: string;
  icon: string;
  imageKey?: string | null;
  featuresEn: string[] | null;
  featuresNe: string[] | null;
};

const ServiceIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  if (iconName.includes('/')) {
    return (
      <div className={`relative ${className}`}>
        <Image src={getPublicUrl(iconName)} alt="icon" fill className="object-contain" />
      </div>
    );
  }
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName] || LucideIcons.Package;
  return <Icon className={className} />;
};

export default function AgricultureClient({ service }: { service: Service }) {
  const { locale } = useTranslation();

  const title = locale === "ne" ? service.titleNe : service.titleEn;
  const desc = locale === "ne" ? service.descNe : service.descEn;
  const features = locale === "ne" ? (service.featuresNe || []) : (service.featuresEn || []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <div className="relative bg-brand-900 pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image 
            src={service.imageKey ? (service.imageKey.startsWith('http') ? service.imageKey : getPublicUrl(service.imageKey)) : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80"}
            alt="Agriculture background"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-400/20 text-brand-300 text-sm font-bold uppercase tracking-wider mb-6 border border-brand-400/30">
            <ServiceIcon iconName={service.icon} className="w-4 h-4" />
            {locale === 'ne' ? 'प्राविधिक सहयोग' : 'Technical Support'}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-brand-100 text-lg md:text-xl max-w-2xl mx-auto">
            {desc}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-xl shadow-brand-900/5 hover:border-brand-300 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ServiceIcon iconName={service.icon} className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature}</h3>
              <p className="text-slate-500 leading-relaxed">
                {locale === 'ne' ? 'हामी यस क्षेत्रमा उच्च गुणस्तर र भरपर्दो सेवा प्रदान गर्दछौं।' : 'We provide high-quality and reliable services in this area.'}
              </p>
            </div>
          ))}
        </div>

        {/* Vision Section */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-[40px] overflow-hidden shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80"
              alt="Farming together"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              {locale === 'ne' ? 'स्थानीय किसानहरूका लागि हाम्रो दृष्टिकोण' : 'Our Vision for Local Farmers'}
            </h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              {locale === 'ne' 
                ? 'हामी विश्वास गर्छौं कि हाम्रो समुदायको मेरुदण्ड यसका किसानहरू हुन्। सही उपकरण र ज्ञान प्रदान गरेर, हामी दिगो खेती अभ्यासहरू सुनिश्चित गर्दै उत्पादकता बढाउने लक्ष्य राख्छौं।' 
                : 'We believe that the backbone of our community is its farmers. By providing the right tools and knowledge, we aim to increase productivity while ensuring sustainable farming practices.'}
            </p>
            <ul className="space-y-4">
              {(locale === 'ne' ? [
                "दिगो जैविक खेतीमा संक्रमण",
                "प्रविधि मार्फत प्रति एकर उत्पादन वृद्धि",
                "बिचौलियाहरूमाथिको निर्भरता घटाउने",
                "हाम्रो समुदायको लागि खाद्य सुरक्षा सुनिश्चित गर्ने"
              ] : [
                "Transitioning to sustainable organic farming",
                "Increasing per-acre yield through technology",
                "Reducing dependency on middlemen",
                "Ensuring food security for our community"
              ]).map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
