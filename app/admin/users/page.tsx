import { db } from "@/db";
import { systemUsers } from "@/db/schema";
import UsersManager from "@/components/admin/UsersManager";
import { desc } from "drizzle-orm";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

export default async function AdminUsersPage() {
  const allUsers = await db.select().from(systemUsers).orderBy(desc(systemUsers.createdAt));
  
  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Users</h1>
          <p className="text-slate-500 mt-1">Manage Admin and Staff access to the control panel</p>
        </div>
        <UsersManager initialUsers={allUsers} />
      </div>
    </AuthenticatedLayout>
  );
}
