"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ArrowLeft, Globe, Mail, Award, GraduationCap, Briefcase, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicUrl } from "@/utils/supabase/storage";

type TeamMember = {
  id: string;
  nameEn: string;
  nameNe: string;
  roleEn: string;
  roleNe: string;
  department: string;
  imageKey: string;
  bioEn: string;
  bioNe: string;
  educationEn: string | null;
  educationNe: string | null;
  experienceEn: string[] | null;
  experienceNe: string[] | null;
  expertiseEn: string[] | null;
  expertiseNe: string[] | null;
};

interface StructuredItem {
  skill?: string;
  name?: string;
  title?: string;
  role?: string;
  desc?: string;
}

export default function TeamDetailClient({ id }: { id: string }) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [otherMembers, setOtherMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    // Fetch individual member
    fetch(`/api/team/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        const mapped = {
          id: data.id,
          nameEn: data.nameEn || data.name_en,
          nameNe: data.nameNe || data.name_ne,
          roleEn: data.roleEn || data.role_en,
          roleNe: data.roleNe || data.role_ne,
          department: data.department,
          imageKey: data.imageKey || data.image_key,
          bioEn: data.bioEn || data.bio_en,
          bioNe: data.bioNe || data.bio_ne,
          educationEn: data.educationEn || data.education_ne,
          educationNe: data.educationNe || data.education_ne,
          experienceEn: data.experienceEn || data.experience_en || [],
          experienceNe: data.experienceNe || data.experience_ne || [],
          expertiseEn: data.expertiseEn || data.expertise_en || [],
          expertiseNe: data.expertiseNe || data.expertise_ne || [],
        };
        setMember(mapped);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(true);
        setIsLoading(false);
      });

    // Fetch others for sidebar
    fetch("/api/team")
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((item: Record<string, string | number>) => ({
          id: item.id as string,
          nameEn: (item.nameEn || item.name_en) as string,
          nameNe: (item.nameNe || item.name_ne) as string,
          roleEn: (item.roleEn || item.role_en) as string,
          roleNe: (item.roleNe || item.role_ne) as string,
          imageKey: (item.imageKey || item.image_key) as string,
        })).filter((m: Partial<TeamMember>) => m.id !== id).slice(0, 3);
        setOtherMembers(mapped as TeamMember[]);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !member) {
    notFound();
    return null;
  }

  const name = locale === 'en' ? member.nameEn : member.nameNe;
  const role = locale === 'en' ? member.roleEn : member.roleNe;
  const bio = locale === 'en' ? member.bioEn : member.bioNe;
  const education = locale === 'en' ? member.educationEn : member.educationNe;
  const experience = (locale === 'en' ? member.experienceEn : member.experienceNe) || [];
  const expertise = (locale === 'en' ? member.expertiseEn : member.expertiseNe) || [];

  return (
    <div className="animate-[fadeUp_0.4s_ease] min-h-screen bg-slate-50">
      <div className="bg-brand-900 px-10 pt-20 pb-[100px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px), repeating-linear-gradient(90deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px)' }}></div>
        <div className="container mx-auto">
          <Link href="/team" className="inline-flex items-center gap-2 text-brand-300 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t.teamDetails.backToTeam}
          </Link>
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-end">
             <div className="w-[200px] h-[200px] rounded-[40px] border-4 border-white/20 overflow-hidden drop-shadow-2xl bg-white/10 shrink-0 relative z-10 flex items-center justify-center">
               {member.imageKey && !imageErrors[member.id] ? (
                 <Image src={getPublicUrl(member.imageKey)} alt={name} fill unoptimized className="object-cover" sizes="200px" onError={() => handleImageError(member.id)} />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-brand-800 text-white font-serif italic text-6xl">
                   {name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                 </div>
               )}
             </div>
             <div className="relative z-10 text-center md:text-left">
               <div className="text-[11px] font-semibold text-brand-300 tracking-[2px] uppercase mb-4">{role}</div>
               <h1 className="font-sans text-[42px] md:text-[54px] font-bold text-white leading-tight tracking-[-1px] mb-4">
                 {name}
               </h1>
               <div className="flex justify-center md:justify-start gap-4">
                 <button 
                   onClick={() => {
                     navigator.clipboard.writeText(window.location.href);
                     alert(locale === 'en' ? "Link copied!" : "लिङ्क प्रतिलिपि गरियो!");
                   }}
                   className="px-6 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white text-sm font-bold transition-all flex items-center gap-2 backdrop-blur-sm"
                 >
                   <Globe className="w-4 h-4" /> {locale === 'en' ? 'Copy Link' : 'लिङ्क कोपी'}
                 </button>
                 <button className="px-6 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white text-sm font-bold transition-all flex items-center gap-2 backdrop-blur-sm">
                   <Mail className="w-4 h-4" /> {t.teamDetails.sendMessage}
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-[40px] relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-8">
            <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 italic font-serif">i</div>
                {t.teamDetails.bioTitle}
              </h2>
              <div className="text-slate-600 text-lg leading-relaxed space-y-6">
                <p>{String(bio)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
                 <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                   <GraduationCap className="w-6 h-6 text-brand-600" /> {t.teamDetails.education}
                 </h3>
                 <div className="text-slate-700 font-medium">
                   {education ? String(education) : (locale === 'en' ? 'No education data' : 'शिक्षा डेटा छैन')}
                 </div>
               </div>
               <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
                 <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                   <Award className="w-6 h-6 text-brand-600" /> {t.teamDetails.expertise}
                 </h3>
                 <div className="flex flex-wrap gap-2">
                    {expertise.length > 0 ? expertise.map((exp: string | Record<string, unknown>, i: number) => {
                      const val = typeof exp === 'object' ? ((exp as StructuredItem).skill || (exp as StructuredItem).name || JSON.stringify(exp)) : exp;
                      return (
                        <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-sm font-medium">
                          {String(val)}
                        </span>
                      );
                    }) : (
                     <span className="text-slate-400 text-sm italic">{locale === 'en' ? 'None listed' : 'सूचीवद्ध छैन'}</span>
                   )}
                 </div>
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-brand-600" /> {t.teamDetails.careerHighlights}
              </h3>
              <div className="space-y-6">
                 {experience.length > 0 ? experience.map((exp: string | Record<string, unknown>, i: number) => {
                   const val = typeof exp === 'object' ? ((exp as StructuredItem).title || (exp as StructuredItem).role || (exp as StructuredItem).desc || JSON.stringify(exp)) : exp;
                   return (
                     <div key={i} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-brand-500 after:absolute after:left-[2.5px] after:top-5 after:bottom-[-24px] after:w-[1px] after:bg-slate-100 last:after:hidden pb-4">
                       <div className="text-slate-700 text-sm font-medium leading-relaxed">{String(val)}</div>
                     </div>
                   );
                 }) : (
                  <div className="text-slate-400 text-sm italic">{locale === 'en' ? 'No highlights' : 'मुख्य विशेषताहरू छैनन्'}</div>
                )}
              </div>
            </div>

            <div className="bg-brand-900 rounded-[40px] p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
               <h3 className="text-2xl font-bold mb-4">{t.teamDetails.contactTitle} {name.split(" ")[0]}</h3>
               <p className="text-brand-100 text-sm mb-8 leading-relaxed">
                 {t.teamDetails.contactSubtitle}
               </p>
               <Link href="/contact">
                 <button className="w-full h-14 bg-white text-brand-900 font-bold rounded-2xl hover:bg-slate-100 transition-colors">
                   {t.teamDetails.sendMessage}
                 </button>
               </Link>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-2xl font-bold text-slate-900 mb-10 text-center">{t.teamDetails.otherMembers}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherMembers.map((other, i) => (
              <Link key={i} href={`/team/${other.id}`} className="group bg-white p-6 rounded-[32px] border border-slate-200 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5 transition-all flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative flex items-center justify-center">
                  {other.imageKey ? (
                    <Image src={getPublicUrl(other.imageKey)} alt={locale === 'en' ? other.nameEn : other.nameNe} fill unoptimized className="object-cover" sizes="64px" />
                  ) : (
                    <User className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition-colors">{locale === 'en' ? other.nameEn : other.nameNe}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{locale === 'en' ? other.roleEn : other.roleNe}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-all group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
