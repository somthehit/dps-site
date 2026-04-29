import { db } from "@/db";
export const revalidate = 0;
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import DynamicServiceClient from "@/components/pages/DynamicServiceClient";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const service = await db.query.services.findFirst({
    where: eq(services.category, category)
  });

  if (!service) return { title: "Service Not Found" };

  return {
    title: `${service.titleEn} | Dipshikha Sahakari`,
    description: service.descEn,
  };
}

export default async function DynamicServicePage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const serviceData = await db.query.services.findFirst({
    where: eq(services.category, category)
  });

  if (!serviceData) {
    notFound();
  }

  return <DynamicServiceClient service={serviceData} />;
}
