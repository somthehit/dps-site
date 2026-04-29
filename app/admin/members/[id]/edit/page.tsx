import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";
import MemberForm from "@/components/admin/MemberForm";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface EditMemberPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { id } = await params;

  const member = await db.query.members.findFirst({
    where: eq(members.id, id),
  });

  if (!member) {
    notFound();
  }

  // Sanitize nulls for React Hook Form (converts null to empty string)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitizedMember = Object.fromEntries(
    Object.entries(member).map(([key, value]) => [key, value === null ? "" : value])
  ) as any;

  return (
    <AuthenticatedLayout>
      <div className="space-y-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit Member</h1>
          <p className="text-slate-500 mt-2 font-medium">Updating information for {member.firstName} {member.lastName}</p>
        </div>

        <MemberForm initialData={sanitizedMember} />
      </div>
    </AuthenticatedLayout>
  );
}
