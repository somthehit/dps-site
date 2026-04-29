import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings, socialLinks, navLinks } from "@/db/schema";
import { defaultSettings } from "@/lib/data/site-config";

import { verifyAdmin } from "@/lib/admin-auth";

const DEFAULT_NAV_LINKS = [
  { labelEn: "Home", labelNe: "गृहपृष्ठ", href: "/", isActive: true, sortOrder: 0 },
  { labelEn: "About Us", labelNe: "हाम्रो बारेमा", href: "/about", isActive: true, sortOrder: 1 },
  { labelEn: "Our Team", labelNe: "हाम्रो टोली", href: "/team", isActive: true, sortOrder: 2 },
  { labelEn: "Services", labelNe: "सेवाहरू", href: "/services", isActive: true, sortOrder: 3 },
  { labelEn: "Gallery", labelNe: "ग्यालरी", href: "/gallery", isActive: true, sortOrder: 4 },
  { labelEn: "Downloads", labelNe: "डाउनलोड", href: "/downloads", isActive: true, sortOrder: 5 },
  { labelEn: "Notices", labelNe: "सूचनाहरू", href: "/notices", isActive: true, sortOrder: 6 },
  { labelEn: "Contact", labelNe: "सम्पर्क", href: "/contact", isActive: true, sortOrder: 7 },
];

const DEFAULT_SOCIAL_LINKS = [
  { platform: "facebook", url: "#", isActive: true, sortOrder: 0 },
  { platform: "twitter", url: "#", isActive: true, sortOrder: 1 },
  { platform: "youtube", url: "#", isActive: true, sortOrder: 2 },
  { platform: "linkedin", url: "#", isActive: true, sortOrder: 3 },
  { platform: "tiktok", url: "#", isActive: true, sortOrder: 4 },
];

const SETTING_META: Record<string, { label: string; group: string }> = {
  phone: { label: "Phone Number", group: "contact" },
  email: { label: "Email Address", group: "contact" },
  address_en: { label: "Address (English)", group: "contact" },
  address_ne: { label: "Address (Nepali)", group: "contact" },
  office_hours: { label: "Office Hours", group: "office_hours" },
  estb_year: { label: "Establishment Year (BS)", group: "branding" },
  slogan_en: { label: "Slogan (English)", group: "branding" },
  slogan_ne: { label: "Slogan (Nepali)", group: "branding" },
  site_title_en: { label: "Site Title (English)", group: "branding" },
  site_title_ne: { label: "Site Title (Nepali)", group: "branding" },
  about_en: { label: "About Text (English)", group: "branding" },
  about_ne: { label: "About Text (Nepali)", group: "branding" },
};

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Seed site settings
  for (const [key, value] of Object.entries(defaultSettings)) {
    const meta = SETTING_META[key] ?? { label: key, group: "contact" };
    await db
      .insert(siteSettings)
      .values({ key, value, label: meta.label, group: meta.group })
      .onConflictDoNothing();
  }

  // Seed social links
  for (const link of DEFAULT_SOCIAL_LINKS) {
    await db.insert(socialLinks).values(link).onConflictDoNothing();
  }

  // Seed nav links
  for (const link of DEFAULT_NAV_LINKS) {
    await db.insert(navLinks).values(link).onConflictDoNothing();
  }

  return NextResponse.json({ ok: true, message: "Database seeded successfully" });
}
