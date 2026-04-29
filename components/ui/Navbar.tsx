"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Menu, X, Phone, Mail, 
  MapPin, Clock, Search, User,
  Calendar
} from "lucide-react";
import { Button } from "./button";
import { cn, formatExternalUrl } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";
import LanguageSwitcher from "./LanguageSwitcher";
import { FacebookIcon, TwitterIcon, YoutubeIcon, LinkedinIcon, TiktokIcon, InstagramIcon, WhatsappIcon } from "./SocialIcons";
import type { SocialLink } from "@/lib/data/site-config";

const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedinIcon,
  whatsapp: WhatsappIcon,
  tiktok: TiktokIcon,
};

function CurrentDateTime() {
  const [mounted, setMounted] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const mountTimer = setTimeout(() => setMounted(true), 0);
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => {
      clearTimeout(mountTimer);
      clearInterval(timer);
    };
  }, []);

  if (!mounted) return <div className="w-32 h-4 bg-white/10 animate-pulse rounded" />;

  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };

  return (
    <span className="flex items-center gap-1.5 text-brand-200">
      <Calendar className="w-3.5 h-3.5" />
      {dateTime.toLocaleDateString('en-US', options)}
    </span>
  );
}

interface NavbarProps {
  settings?: Record<string, string>;
  socialLinks?: SocialLink[];
}

export default function Navbar({ settings = {}, socialLinks = [] }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t, locale } = useTranslation();

  const phone = settings.phone ?? "+977-9805791785";
  const email = settings.email ?? "dps.cop724@gmail.com";
  const address = (locale === "ne" ? settings.address_ne : settings.address_en) || t.nav.address;
  const officeHours = settings.office_hours ?? "Sun - Fri: 10:00 AM - 5:00 PM";
  const estbYear = settings.estb_year ?? "2069";
  const slogan = (locale === "ne" ? settings.slogan_ne : settings.slogan_en) || t.nav.slogan;
  const siteTitle = (locale === "ne" ? settings.site_title_ne : settings.site_title_en) || t.hero.title;

  const NavLinks = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.about, href: "/about" },
    { name: t.nav.team, href: "/team" },
    { name: t.nav.services, href: "/services" },
    { name: t.nav.gallery, href: "/gallery" },
    { name: t.nav.downloads, href: "/downloads" },
    { name: t.nav.notice, href: "/notices" },
    { name: t.nav.contact, href: "/contact" },
  ];

  return (
    <header className="w-full flex flex-col z-50">
      
      {/* 1. Top Utility Bar */}
      <div className="bg-brand-900 text-white py-2 text-[12px] font-medium border-b border-white/10">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-300" />
              {officeHours}
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-300" />
              {address}
            </span>
            <span className="hidden lg:flex items-center gap-1.5 ml-2 pl-4 border-l border-white/20">
              <Clock className="w-3.5 h-3.5 text-brand-300" />
              Estb: {estbYear}
            </span>
            <div className="hidden xl:flex items-center ml-2 pl-4 border-l border-white/20">
              <CurrentDateTime />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4 pr-4 border-r border-white/20 text-brand-300">
                {socialLinks.map((link) => {
                  const Icon = SOCIAL_ICON_MAP[link.platform];
                  if (!Icon) return null;
                  return (
                    <Link key={link.id} href={formatExternalUrl(link.url)} target="_blank" rel="noopener noreferrer" prefetch={false} className="hover:text-white transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </Link>
                  );
                })}
              </div>
            )}
            <Link href="/login" className="flex items-center gap-1.5 hover:text-brand-300 transition-colors">
              <User className="w-3.5 h-3.5" />
              {t.nav.memberLogin}
            </Link>
            <div className="ml-2 pl-4 border-l border-white/20">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Branding Header */}
      <div className="bg-white py-5">
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-4">
            <div className="w-16 h-16 relative">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill 
                className="object-contain"
                sizes="40px"
              />
            </div>
            <div className="flex flex-col">
              <div className="text-xl md:text-2xl font-bold text-brand-800 leading-tight uppercase tracking-tight">
                {siteTitle.replace(" Ltd.", "").replace(" लि.", "")}
              </div>
              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[2px] italic">
                {slogan}
              </div>
            </div>
          </Link>

          {/* Contact Details (Right side) */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-700">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.nav.callUs}</div>
                <div className="text-sm font-bold text-slate-800">{phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-700">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.nav.emailUs}</div>
                <div className="text-sm font-bold text-slate-800">{email}</div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-slate-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* 3. Primary Nav Bar (Green Bar) */}
      <nav className="bg-brand-700 text-white sticky top-0 shadow-lg">
        <div className="container mx-auto px-6 flex justify-between items-center h-14">
          <div className="hidden lg:flex items-center h-full">
            {NavLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={cn(
                  "h-full px-6 flex items-center text-[13px] font-bold uppercase tracking-wide transition-all hover:bg-brand-800",
                  pathname === link.href ? "bg-brand-900 border-b-4 border-white" : ""
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 h-full">
            <button className="h-full px-4 hover:bg-brand-800 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/membership-request">
              <Button size="sm" className="bg-white text-brand-800 hover:bg-slate-100 font-bold px-5">
                {t.nav.joinNow}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-2xl absolute top-[140px] left-0 right-0 z-50">
          <div className="flex flex-col p-4">
            {NavLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="py-4 px-4 text-sm font-bold text-slate-800 border-b border-slate-50 uppercase tracking-wide hover:bg-brand-50"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}

    </header>
  );
}
