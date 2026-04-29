import { Metadata } from "next";
import ContactClient from "@/components/pages/ContactClient";
import { getSiteSettings } from "@/lib/data/site-config";

export const metadata: Metadata = {
  title: "Contact Us | Dipshikha Sahakari",
  description: "Get in touch with Dipshikha Krishi Sahakari Sanstha Ltd. Send us a message for inquiries, support, or feedback.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return <ContactClient settings={settings} />;
}
