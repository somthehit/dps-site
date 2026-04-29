import { db } from "@/db";
import { siteSettings, socialLinks, navLinks, siteStats } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SiteSetting = typeof siteSettings.$inferSelect;
export type SocialLink = typeof socialLinks.$inferSelect;
export type NavLink = typeof navLinks.$inferSelect;
export type SiteStat = typeof siteStats.$inferSelect;

export interface SiteConfig {
  settings: Record<string, string>;
  socialLinks: SocialLink[];
  navLinks: NavLink[];
}

// ─── Fallback defaults (used if DB is empty) ──────────────────────────────────

export const defaultSettings: Record<string, string> = {
  phone: "+977-9805791785",
  email: "dps.cop724@gmail.com",
  address_en: "Gauriganga Nagarpalika - 01, Kailali",
  address_ne: "गौरीगंगा नगरपालिका - ०१, कैलाली",
  latitude: "28.7649",
  longitude: "80.7426",
  google_maps_url: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3324.428834911988!2d80.742594!3d28.764900000000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjjCsDQ1JzUzLjYiTiA4MMKwNDQnMzMuMyJF!5e1!3m2!1sen!2snp!4v1777373538150!5m2!1sen!2snp",
  office_hours: "Sun - Fri: 10:00 AM - 5:00 PM",
  estb_year: "2069",
  slogan_en: "Together for Sustainable Growth",
  slogan_ne: "दिगो वृद्धिको लागि सहकार्य",
  site_title_en: "Dipshikha Krishi Sahakari Sanstha Ltd.",
  site_title_ne: "दिपशिखा कृषि सहकारी संस्था लि.",
  about_en: "Empowering our community through sustainable agriculture and inclusive financial services since 2069 B.S.",
  about_ne: "२०६९ सालदेखि दिगो कृषि र समावेशी वित्तीय सेवाहरू मार्फत हाम्रो समुदायलाई सशक्त बनाउँदै।",
};

export const defaultSocialLinks: SocialLink[] = [
  { id: "00000000-0000-0000-0000-000000000001", platform: "facebook", url: "#", isActive: true, sortOrder: 0, updatedAt: new Date() },
  { id: "00000000-0000-0000-0000-000000000002", platform: "twitter", url: "#", isActive: true, sortOrder: 1, updatedAt: new Date() },
  { id: "00000000-0000-0000-0000-000000000003", platform: "youtube", url: "#", isActive: true, sortOrder: 2, updatedAt: new Date() },
  { id: "00000000-0000-0000-0000-000000000004", platform: "linkedin", url: "#", isActive: true, sortOrder: 3, updatedAt: new Date() },
  { id: "00000000-0000-0000-0000-000000000005", platform: "tiktok", url: "#", isActive: true, sortOrder: 4, updatedAt: new Date() },
];

// ─── Fetchers ─────────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const rows = await db.select().from(siteSettings);
    if (!rows.length) return defaultSettings;
    const map: Record<string, string> = { ...defaultSettings };
    rows.forEach((r) => { map[r.key] = r.value; });
    return map;
  } catch {
    return defaultSettings;
  }
}

export async function getActiveSocialLinks(): Promise<SocialLink[]> {
  try {
    const rows = await db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.isActive, true))
      .orderBy(asc(socialLinks.sortOrder));
    return rows.length ? rows : defaultSocialLinks;
  } catch {
    return defaultSocialLinks;
  }
}

export async function getAllSocialLinks(): Promise<SocialLink[]> {
  try {
    const rows = await db
      .select()
      .from(socialLinks)
      .orderBy(asc(socialLinks.sortOrder));
    return rows.length ? rows : defaultSocialLinks;
  } catch {
    return defaultSocialLinks;
  }
}

export async function getActiveNavLinks(): Promise<NavLink[]> {
  try {
    const rows = await db
      .select()
      .from(navLinks)
      .where(eq(navLinks.isActive, true))
      .orderBy(asc(navLinks.sortOrder));
    return rows;
  } catch {
    return [];
  }
}

export async function getAllNavLinks(): Promise<NavLink[]> {
  try {
    return await db.select().from(navLinks).orderBy(asc(navLinks.sortOrder));
  } catch {
    return [];
  }
}

export async function getSiteStats(): Promise<SiteStat[]> {
  try {
    return await db.select().from(siteStats).orderBy(asc(siteStats.sortOrder));
  } catch {
    return [];
  }
}
