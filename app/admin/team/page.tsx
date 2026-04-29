import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import TeamManager from "@/components/admin/TeamManager";
import { asc } from "drizzle-orm";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

export default async function AdminTeamPage() {
  const members = await db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder));
  
  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-500 mt-1">Manage board of directors, management, and field staff</p>
        </div>
          <TeamManager initialMembers={members} />
      </div>
    </AuthenticatedLayout>
  );
}
