import HeroManagerClient from "./HeroManagerClient";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

export default function HeroAdminPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hero Slides</h1>
          <p className="text-slate-500 font-medium">Manage the homepage background slider and call-to-action content.</p>
        </div>
        
        <HeroManagerClient />
      </div>
    </AuthenticatedLayout>
  );
}
