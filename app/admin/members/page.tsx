import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";
import MemberManager from "@/components/admin/MemberManager";

export default async function AdminMembersPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cooperative Members</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage and view all registered members of the sanstha.</p>
        </div>

        <MemberManager />
      </div>
    </AuthenticatedLayout>
  );
}
