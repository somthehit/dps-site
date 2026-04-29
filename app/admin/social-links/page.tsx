import { getAllSocialLinks } from "@/lib/data/site-config";
import SocialLinksManager from "@/components/admin/SocialLinksManager";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

export default async function AdminSocialLinksPage() {
  const links = await getAllSocialLinks();
  return (
    <AuthenticatedLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Social Links</h1>
          <p className="text-slate-500 mt-1">Toggle visibility, update URLs, and reorder your social profiles</p>
        </div>
        <SocialLinksManager initialLinks={links} />
      </div>
    </AuthenticatedLayout>
  );
}
