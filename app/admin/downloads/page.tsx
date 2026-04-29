import { db } from "@/db";
import { downloads } from "@/db/schema";
import DownloadsManager from "@/components/admin/DownloadsManager";
import { desc } from "drizzle-orm";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

export default async function AdminDownloadsPage() {
  const allDownloads = await db.select().from(downloads).orderBy(desc(downloads.createdAt));
  
  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Downloads Management</h1>
          <p className="text-slate-500 mt-1">Upload forms, reports, and bylaws for members</p>
        </div>
        <DownloadsManager initialDownloads={allDownloads} />
      </div>
    </AuthenticatedLayout>
  );
}
