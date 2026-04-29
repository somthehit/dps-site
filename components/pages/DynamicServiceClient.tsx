"use client";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getPublicUrl } from "@/utils/supabase/storage";
import Link from "next/link";
import Image from "next/image";
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
  // If it's a storage key, show as image
  if (iconName.includes('/')) {
    return (
      <div className={`relative ${className}`}>
        <Image 
          src={getPublicUrl(iconName)} 
          alt="icon" 
          fill
          className="object-contain"
        />
      </div>
    );
  }
  
  // Otherwise try to render from Lucide
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName] || LucideIcons.Package;
  return <Icon className={className} />;
};

export default function DynamicServiceClient({ service }: { service: Service }) {
  const { locale } = useTranslation();
  
  const title = locale === "ne" ? service.titleNe : service.titleEn;
  const desc = locale === "ne" ? service.descNe : service.descEn;
  const features = locale === "ne" ? service.featuresNe : service.featuresEn;
  
  return (
    <div className="animate-[fadeUp_0.4s_ease] min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-brand-900 px-10 pt-20 pb-[60px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px), repeating-linear-gradient(90deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px)' }}></div>
        {service.imageKey && (
          <div className="absolute inset-0 opacity-20">
             <Image 
               src={service.imageKey.startsWith('http') ? service.imageKey : getPublicUrl(service.imageKey)} 
               alt="Hero" 
               fill 
               className="object-cover" 
             />
          </div>
        )}
        <div className="container mx-auto">
          <Link href="/services" className="inline-flex items-center gap-2 text-brand-300 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {locale === 'ne' ? 'सेवाहरूमा फर्कनुहोस्' : 'Back to Services'}
          </Link>
          <div className="text-[11px] font-semibold text-brand-300 tracking-[2px] uppercase mb-4 relative">{locale === 'ne' ? 'हाम्रा सेवाहरू' : 'Our Services'}</div>
          <h1 className="font-sans text-[42px] md:text-[54px] font-bold text-white leading-[1.1] tracking-[-0.8px] relative max-w-[700px] mb-6">
            {title}
          </h1>
          <p className="text-brand-100 text-lg md:text-xl max-w-2xl relative">
            {desc}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
          <div className="space-y-12">
            {/* Features/Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features?.map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:border-brand-300 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                    <ServiceIcon iconName={service.icon} className="w-6 h-6" />
                  </div>
                  <p className="text-slate-800 font-bold text-lg">{feature}</p>
                </div>
              ))}
            </div>

            {/* Static Content / Info */}
            <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200">
               <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                 <ShieldCheck className="w-8 h-8 text-brand-600" /> {locale === 'ne' ? 'हामीलाई किन रोज्ने?' : 'Why choose us?'}
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900">{locale === 'ne' ? 'सुरक्षित र भरपर्दो' : 'Safe & Secure'}</h4>
                    <p className="text-slate-600 text-sm">{locale === 'ne' ? 'हामी सहकारीका सिद्धान्तहरूमा आधारित भएर पूर्ण सुरक्षा प्रदान गर्दछौं।' : 'We provide full security based on cooperative principles.'}</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900">{locale === 'ne' ? 'सहज पहुँच' : 'Easy Access'}</h4>
                    <p className="text-slate-600 text-sm">{locale === 'ne' ? 'हाम्रा सेवाहरू सबैका लागि सरल र सुलभ छन्।' : 'Our services are simple and accessible to everyone.'}</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-8">
             <div className="bg-brand-900 rounded-[32px] p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
               <ServiceIcon iconName={service.icon} className="w-12 h-12 text-brand-300 mb-6" />
               <h3 className="text-2xl font-bold mb-4">{locale === 'ne' ? 'अहिले नै सुरु गर्नुहोस्' : 'Get Started Today'}</h3>
               <p className="text-brand-100 text-sm mb-8 leading-relaxed">
                 {locale === 'ne' ? 'आजै हाम्रो सदस्य बन्नुहोस् र फाइदा लिनुहोस्।' : 'Become a member today and start benefiting from our services.'}
               </p>
               <Link href="/contact">
                 <button className="w-full h-14 bg-white text-brand-900 font-bold rounded-2xl hover:bg-slate-100 transition-colors">
                   {locale === 'ne' ? 'सम्पर्क गर्नुहोस्' : 'Contact Us'}
                 </button>
               </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
