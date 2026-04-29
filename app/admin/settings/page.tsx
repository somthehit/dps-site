import { getSiteSettings } from "@/lib/data/site-config";
import SettingsTabs from "@/components/admin/SettingsTabs";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AuthenticatedLayout>
      <div className="space-y-8 max-w-[1200px]">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Site Settings</h1>
          <p className="text-slate-500 mt-1">Update contact info, branding, office hours, and the hero experience.</p>
        </div>
        <SettingsTabs initialSettings={settings} />
      </div>
    </AuthenticatedLayout>
  );
}
