import { checkAdminAuth } from "@/lib/admin-auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  await checkAdminAuth();
  return (
    <div className="min-h-screen bg-slate-50 print:bg-white flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 print:ml-0 p-8 print:p-0">
        {children}
      </main>
    </div>
  );
}
