import NewsletterManager from "@/components/admin/NewsletterManager";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

export const metadata = {
  title: "Newsletter Management | Admin",
};

export default function NewsletterAdminPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Newsletter Subscribers</h1>
          <p className="text-slate-500 mt-1">Manage your email newsletter list and broadcast notices</p>
        </div>
        <NewsletterManager />
      </div>
    </AuthenticatedLayout>
  );
}
