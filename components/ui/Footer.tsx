"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { FacebookIcon, TwitterIcon, YoutubeIcon, LinkedinIcon, TiktokIcon, InstagramIcon, WhatsappIcon } from "./SocialIcons";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { SocialLink } from "@/lib/data/site-config";
import { formatExternalUrl } from "@/lib/utils";
import React from "react";

const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedinIcon,
  whatsapp: WhatsappIcon,
  tiktok: TiktokIcon,
};

interface FooterProps {
  settings?: Record<string, string>;
  socialLinks?: SocialLink[];
}

export default function Footer({ settings = {}, socialLinks = [] }: FooterProps) {
  const { t, locale } = useTranslation();

  const phone = settings.phone ?? "+977-9805791785";
  const email = settings.email ?? "dps.cop724@gmail.com";
  const address = (locale === "ne" ? settings.address_ne : settings.address_en) || t.nav.address;
  const slogan = (locale === "ne" ? settings.slogan_ne : settings.slogan_en) || t.nav.slogan;
  const about = (locale === "ne" ? settings.about_ne : settings.about_en) || t.footer.about;
  const siteTitle = (locale === "ne" ? settings.site_title_ne : settings.site_title_en) || t.hero.title;

  return (
    <footer className="bg-brand-950 text-slate-300">

      {/* Top Footer Section */}
      <div className="bg-brand-900 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

            {/* Logo & About */}
            <div className="lg:col-span-5 space-y-6">
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
                  <div className="text-xl md:text-2xl font-bold text-white leading-tight uppercase tracking-tight">
                    {siteTitle.replace(" Ltd.", "").replace(" लि.", "")}
                  </div>
                  <div className="text-[10px] font-semibold text-brand-400 uppercase tracking-widest">
                    {slogan}
                  </div>
                </div>
              </Link>
              <p className="text-brand-100/70 max-w-sm text-lg leading-relaxed italic">
                {about}
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-4 pt-2">
                {socialLinks.length > 0 ? (
                  socialLinks.map((link) => {
                    const Icon = SOCIAL_ICON_MAP[link.platform];
                    if (!Icon) return null;
                    return (
                      <Link
                        key={link.id}
                        href={formatExternalUrl(link.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        prefetch={false}
                        className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-brand-300 hover:bg-brand-700 hover:text-white transition-all"
                      >
                        <Icon className="w-5 h-5" />
                      </Link>
                    );
                  })
                ) : (
                  // Fallback static icons
                  <>
                    {[FacebookIcon, TwitterIcon, YoutubeIcon, LinkedinIcon, TiktokIcon].map((Icon, i) => (
                      <Link key={i} href="#" className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-brand-300 hover:bg-brand-700 hover:text-white transition-all">
                        <Icon className="w-5 h-5" />
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-8 uppercase tracking-wider border-l-4 border-brand-500 pl-4">{t.footer.company}</h3>
              <ul className="space-y-4">
                {[
                  { name: t.nav.home, href: "/" },
                  { name: t.nav.about, href: "/about" },
                  { name: t.nav.team, href: "/team" },
                  { name: t.nav.services, href: "/services" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="hover:text-white hover:translate-x-1 inline-block transition-all text-brand-100/60">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-8 uppercase tracking-wider border-l-4 border-brand-500 pl-4">{t.footer.links}</h3>
              <ul className="space-y-4">
                {[
                  { name: t.nav.gallery, href: "/gallery" },
                  { name: t.nav.downloads, href: "/downloads" },
                  { name: t.nav.notice, href: "/notices" },
                  { name: t.nav.contact, href: "/contact" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="hover:text-white hover:translate-x-1 inline-block transition-all text-brand-100/60">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-3">
              <h3 className="text-white font-bold text-lg mb-8 uppercase tracking-wider border-l-4 border-brand-500 pl-4">{t.footer.contact}</h3>
              <ul className="space-y-5">
                <li className="flex gap-4 text-brand-100/60">
                  <MapPin className="w-6 h-6 text-brand-400 shrink-0" />
                  <span>{address}</span>
                </li>
                <li className="flex items-center gap-4 text-brand-100/60">
                  <Phone className="w-6 h-6 text-brand-400 shrink-0" />
                  <span>{phone}</span>
                </li>
                <li className="flex items-center gap-4 text-brand-100/60">
                  <Mail className="w-6 h-6 text-brand-400 shrink-0" />
                  <span>{email}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-brand-950 py-8 border-t border-brand-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-brand-100/40">
              © {new Date().getFullYear()} {siteTitle} {t.footer.rights}
            </p>
            <div className="flex items-center gap-6 text-sm text-brand-100/40">
              <Link href="/admin" className="hover:text-brand-300 transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
