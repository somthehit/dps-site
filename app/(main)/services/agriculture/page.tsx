import { Metadata } from "next";
export const revalidate = 0;
import AgricultureClient from "../../../../components/pages/AgricultureClient";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const service = await db.query.services.findFirst({
    where: eq(services.category, "agriculture")
  });

  if (!service) return { title: "Technical Agricultural Support | Dipshikha Sahakari" };

  return {
    title: `${service.titleEn} | Dipshikha Sahakari`,
    description: service.descEn,
  };
}

export default async function AgriculturePage() {
  const serviceData = await db.query.services.findFirst({
    where: eq(services.category, "agriculture")
  });

  console.log("AgriculturePage: Fetched service data", {
    id: serviceData?.id,
    title: serviceData?.titleEn,
    featuresCount: serviceData?.featuresEn?.length
  });

  if (!serviceData) {
    notFound();
  }

  return <AgricultureClient service={serviceData} />;
}
