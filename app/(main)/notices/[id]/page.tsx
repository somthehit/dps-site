import NoticeDetailClient from "@/components/pages/NoticeDetailClient";

export default async function NoticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoticeDetailClient id={id} />;
}
