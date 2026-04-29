import NoticeDetailClient from "@/components/pages/NoticeDetailClient";
import { db } from "@/db";
import { notices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const notice = await db.query.notices.findFirst({
    where: eq(notices.id, id)
  });

  if (!notice) return { title: "Notice Not Found" };

  return {
    title: `${notice.titleEn} | Notice`,
    description: notice.descEn,
  };
}

export default async function NoticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoticeDetailClient id={id} />;
}
