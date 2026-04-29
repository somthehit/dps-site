import { db } from "@/db";
import { newsTicker } from "@/db/schema";

async function seedTicker() {
  console.log("Seeding News Ticker...");
  
  const items = [
    {
      contentEn: "13th Annual General Meeting to be held on Baisakh 2, 2083 (April 15, 2026). All members are requested to attend.",
      contentNe: "१३औं वार्षिक साधारण सभा वैशाख २, २०८३ (अप्रिल १५, २०२६) मा हुनेछ। सबै सदस्यहरूलाई उपस्थित हुन अनुरोध गरिन्छ।",
      sortOrder: 1
    },
    {
      contentEn: "Seed Distribution Program: Spring seeds are available at all branch offices.",
      contentNe: "बीउ वितरण कार्यक्रम: वसन्त ऋतुका बीउहरू सबै शाखा कार्यालयहरूमा उपलब्ध छन्।",
      sortOrder: 2
    },
    {
      contentEn: "New loan interest rates effective from next month. Contact your branch for details.",
      contentNe: "अर्को महिनादेखि नयाँ कर्जा ब्याज दरहरू लागू हुनेछन्। विवरणका लागि आफ्नो शाखामा सम्पर्क गर्नुहोस्।",
      sortOrder: 3
    }
  ];

  for (const item of items) {
    await db.insert(newsTicker).values(item).onConflictDoNothing();
  }

  console.log("Seeding complete!");
}

seedTicker().catch(console.error);
