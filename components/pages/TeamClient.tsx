"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Users, Heart, ChevronRight, ShieldCheck, Briefcase, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";
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
  sortOrder: number;
};

export default function TeamClient() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCommittee, setActiveCommittee] = useState<string>("board");
  const [floatingMembers, setFloatingMembers] = useState<{ id: string; x: number; y: number; delay: number; scale: number; image: string; variant: string }[]>([]);

  const committees = [
    { id: "board", en: "Board of Directors", ne: "सञ्चालक समिति", icon: ShieldCheck, color: "from-brand-800 to-brand-950" },
    { id: "management", en: "Senior Management", ne: "उच्च व्यवस्थापन", icon: Briefcase, color: "from-slate-800 to-slate-950" },
    { id: "finance", en: "Finance & Accounts", ne: "वित्त तथा लेखा", icon: Briefcase, color: "from-blue-800 to-blue-950" },
    { id: "agriculture", en: "Agriculture & Livestock", ne: "कृषि तथा पशुपालन", icon: Users, color: "from-emerald-800 to-emerald-950" },
    { id: "technology", en: "IT & Technology", ne: "प्राविधिक तथा आईटी", icon: Globe, color: "from-indigo-800 to-indigo-950" },
    { id: "operations", en: "Operations & Service", ne: "सञ्चालन तथा सेवा", icon: Heart, color: "from-rose-800 to-rose-950" },
    { id: "audit", en: "Audit Committee", ne: "लेखा सुपरिवेक्षण समिति", icon: Briefcase, color: "from-slate-700 to-slate-900" },
    { id: "credit", en: "Credit Committee", ne: "ऋण उपसमिति", icon: Users, color: "from-blue-700 to-blue-900" },
    { id: "savings", en: "Savings Committee", ne: "बचत तथा निक्षेप उपसमिति", icon: Heart, color: "from-emerald-700 to-emerald-900" },
    { id: "education", en: "Education & Training", ne: "शिक्षा तथा तालिम समिति", icon: Users, color: "from-amber-700 to-amber-900" },
    { id: "staff", en: "Office & Field Staff", ne: "कार्यालय तथा फिल्ड कर्मचारी", icon: Users, color: "from-slate-600 to-slate-800" },
  ];

  useEffect(() => {
    fetch("/api/team")
      .then(res => res.json())
      .then((data: Array<Record<string, string | number>>) => {
        const mappedData = data.map((item: Record<string, string | number>) => ({
          id: item.id as string,
          nameEn: (item.nameEn || item.name_en) as string,
          nameNe: (item.nameNe || item.name_ne) as string,
          roleEn: (item.roleEn || item.role_en) as string,
          roleNe: (item.roleNe || item.role_ne) as string,
          department: (item.department as string)?.toLowerCase(),
          imageKey: (item.imageKey || item.image_key) as string,
          bioEn: (item.bioEn || item.bio_en) as string,
          bioNe: (item.bioNe || item.bio_ne) as string,
          sortOrder: (item.sortOrder || item.sort_order) as number,
        }));
        setMembers(mappedData);
        setIsLoading(false);

        // Initialize floating members after data is loaded
        if (mappedData.length > 0) {
          const initial = Array.from({ length: 12 }).map((_, i) => ({
            id: Math.random().toString(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: i * 0.8,
            scale: 0.3 + Math.random() * 0.7,
            variant: Math.random() > 0.5 ? 'primary' : 'secondary',
            image: getPublicUrl(mappedData[Math.floor(Math.random() * mappedData.length)].imageKey)
          }));
          setFloatingMembers(initial);
        }
      })
      .catch(err => {
        console.error("Failed to fetch team:", err);
        setIsLoading(false);
      });
  }, []);

  // Continuously re-randomize positions for a truly dynamic feel
  useEffect(() => {
    if (members.length === 0) return;

    const interval = setInterval(() => {
      setFloatingMembers(prev => {
        return prev.map(fm => {
          // 20% chance to teleport a member to a new spot each tick
          if (Math.random() > 0.8) {
            return {
              ...fm,
              x: Math.random() * 100,
              y: Math.random() * 100,
              image: getPublicUrl(members[Math.floor(Math.random() * members.length)].imageKey)
            };
          }
          return fm;
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [members]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveCommittee(entry.target.id);
        }
      });
    }, { threshold: 0.3, rootMargin: "-20% 0px -60% 0px" });

    const sections = document.querySelectorAll('.committee-section');
    sections.forEach(section => observer.observe(section));

    return () => sections.forEach(section => observer.unobserve(section));
  }, [isLoading]);

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const handleImageError = (id: string) => setImageErrors(prev => ({ ...prev, [id]: true }));
  const getInitials = (name: string) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Premium Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] bg-brand-950 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(22,163,74,0.15),transparent)] pointer-events-none" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
        
        {/* Random Floating Avatars */}
        {!isLoading && floatingMembers.map((fm) => (
          <div 
            key={fm.id}
            className={`absolute w-24 h-24 rounded-full overflow-hidden border border-white/5 opacity-0 grayscale pointer-events-none hover:pointer-events-auto hover:grayscale-0 hover:opacity-100 transition-all duration-700 ${
              fm.variant === 'primary' ? 'animate-float-fast' : 'animate-float-fast-alt'
            }`}
            style={{ 
              left: `${fm.x}%`, 
              top: `${fm.y}%`, 
              animationDelay: `${fm.delay}s`,
              transform: `scale(${fm.scale})`
            }}
          >
            <Image src={fm.image} alt="" fill className="object-cover" sizes="96px" priority />
          </div>
        ))}

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-400 text-xs font-bold tracking-[3px] uppercase mb-8 backdrop-blur-sm animate-fadeUp">
            <Users className="w-4 h-4" /> {t.team.title}
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tighter animate-fadeUp [animation-delay:0.2s]">
            {locale === 'en' ? 'Our Expert Team' : 'हाम्रो विज्ञ टोली'}
          </h1>
          <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed animate-fadeUp [animation-delay:0.4s]">
            {t.team.subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-24">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* Left Sidebar - Sticky Navigation */}
          <aside className="lg:w-80 shrink-0">
            <div className="sticky top-32 space-y-10">
              <div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[3px] mb-8 px-4 opacity-50">
                  {locale === 'en' ? 'Departments' : 'विभागहरू'}
                </h3>
                <nav className="space-y-2">
                  {committees.map((c) => {
                    const count = members.filter(m => m.department === c.id).length;
                    if (count === 0 && !isLoading) return null;
                    
                    return (
                      <button
                        key={c.id}
                        onClick={() => document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-[24px] text-left transition-all duration-500 group ${
                          activeCommittee === c.id 
                            ? 'bg-white shadow-xl shadow-brand-900/5 text-brand-700' 
                            : 'text-slate-500 hover:bg-white/60 hover:text-slate-900'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl transition-all duration-500 ${
                          activeCommittee === c.id ? 'bg-brand-50 text-brand-600 scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:scale-105'
                        }`}>
                          <c.icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[13px] tracking-tight flex-1">{locale === 'en' ? c.en : c.ne}</span>
                        {activeCommittee === c.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-8 bg-brand-900 rounded-[40px] text-white relative overflow-hidden group shadow-2xl shadow-brand-900/20">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl group-hover:bg-brand-500/30 transition-all duration-700" />
                <h4 className="text-xs font-bold text-brand-300 uppercase tracking-widest mb-3">{locale === 'en' ? 'Core Strength' : 'मुख्य शक्ति'}</h4>
                <div className="text-5xl font-black mb-4 tracking-tighter">{members.length}</div>
                <p className="text-sm text-brand-100/60 leading-relaxed font-medium">
                  {locale === 'en' ? 'A diverse team of professionals committed to excellence.' : 'उत्कृष्टताको लागि प्रतिबद्ध पेशेवरहरूको एक विविध टोली।'}
                </p>
              </div>
            </div>
          </aside>

          {/* Right Column - Sections with Scroll Animation */}
          <main className="flex-1 space-y-40">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 bg-white rounded-[40px] animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : (
              committees.map((committee) => {
                const committeeMembers = members.filter(m => m.department === committee.id);
                if (committeeMembers.length === 0) return null;

                return (
                  <section 
                    key={committee.id} 
                    id={committee.id} 
                    className="committee-section scroll-mt-32 transition-all duration-1000 opacity-0 translate-y-20 data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0"
                    ref={(el) => {
                      if (el) {
                        const observer = new IntersectionObserver(([entry]) => {
                          if (entry.isIntersecting) {
                            el.setAttribute('data-visible', 'true');
                          }
                        }, { threshold: 0.1 });
                        observer.observe(el);
                      }
                    }}
                  >
                    <div className="flex items-center gap-8 mb-16 px-4">
                      <div className={`w-20 h-20 rounded-[28px] bg-gradient-to-br ${committee.color} flex items-center justify-center text-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                        <committee.icon className="w-10 h-10" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">
                          {locale === 'en' ? committee.en : committee.ne}
                        </h2>
                        <div className="h-1.5 w-20 bg-brand-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                      {committeeMembers.map((member) => (
                        <Link 
                          href={`/team/${member.id}`} 
                          key={member.id}
                          className="group relative flex flex-col sm:flex-row items-center gap-8 p-6 bg-white rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-brand-900/10 hover:border-brand-100 transition-all duration-700 hover:-translate-y-2"
                        >
                          <div className="relative w-44 h-44 shrink-0 overflow-hidden rounded-[32px] bg-slate-50 shadow-inner">
                            {member.imageKey && !imageErrors[member.id] ? (
                              <Image
                                src={getPublicUrl(member.imageKey)}
                                alt={locale === 'en' ? member.nameEn : member.nameNe}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                sizes="(max-width: 768px) 176px, 176px"
                                priority={member.sortOrder <= 2}
                                onError={() => handleImageError(member.id)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-200">
                                {getInitials(locale === 'en' ? member.nameEn : member.nameNe)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 py-4 text-center sm:text-left">
                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-brand-700 transition-colors tracking-tight mb-2">
                              {locale === 'en' ? member.nameEn : member.nameNe}
                            </h3>
                            <div className="inline-block px-3 py-1 rounded-lg bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest mb-4">
                              {locale === 'en' ? member.roleEn : member.roleNe}
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 italic mb-6 opacity-80">
                              &quot;{locale === 'en' ? member.bioEn : member.bioNe}&quot;
                            </p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-slate-400 group-hover:text-brand-500 transition-all duration-500">
                              <span className="tracking-widest uppercase">{locale === 'en' ? 'Profile' : 'प्रोफाइल'}</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </main>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translate(0, 0) scale(var(--tw-scale-x)); opacity: 0; filter: blur(8px); }
          20% { opacity: 0.2; filter: blur(2px); }
          50% { transform: translate(40px, -40px) scale(calc(var(--tw-scale-x) + 0.2)); opacity: 0.4; filter: blur(0px); }
          80% { opacity: 0.1; filter: blur(4px); }
        }
        @keyframes floatFastAlt {
          0%, 100% { transform: translate(0, 0) scale(var(--tw-scale-x)); opacity: 0; filter: blur(10px); }
          30% { opacity: 0.3; filter: blur(0px); }
          60% { transform: translate(-50px, 30px) scale(calc(var(--tw-scale-x) - 0.1)); opacity: 0.1; filter: blur(5px); }
        }
        .animate-fadeUp {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-float-fast {
          animation: floatFast 8s ease-in-out infinite;
        }
        .animate-float-fast-alt {
          animation: floatFastAlt 11s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
