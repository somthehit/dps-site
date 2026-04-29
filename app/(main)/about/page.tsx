import { Metadata } from "next";
import AboutClient from "@/components/pages/AboutClient";
import { getSiteSettings, getSiteStats } from "@/lib/data/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const estbYear = settings.estb_year || "2069";
  return {
    title: "About Us",
    description: `Learn about the history, mission, and vision of Dipshikha Krishi Sahakari Sanstha Ltd. since its establishment in ${estbYear} B.S.`,
  };
}

export default async function AboutPage() {
  const [settings, stats] = await Promise.all([
    getSiteSettings(),
    getSiteStats()
  ]);
  
  return <AboutClient settings={settings} stats={stats} />;
}
