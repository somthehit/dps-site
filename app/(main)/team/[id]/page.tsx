import { Metadata } from "next";
import TeamDetailClient from "@/components/pages/TeamDetailClient";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
  const member = result[0];

  return {
    title: `${member?.nameEn || "Team Member"} | Our Team | Dipshikha Sahakari`,
    description: member?.bioEn?.slice(0, 160),
  };
}

export default async function TeamMemberPage({ params }: Props) {
  const { id } = await params;
  return <TeamDetailClient id={id} />;
}
