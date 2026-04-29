import { db } from "@/db";
import { notices } from "@/db/schema";
import { desc } from "drizzle-orm";
import NoticesManager, { Notice } from "@/components/admin/NoticesManager";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

export default async function AdminNoticesPage() {
  const allNotices = await db.select().from(notices).orderBy(desc(notices.date));
  
  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notices & Updates</h1>
          <p className="text-slate-500 mt-1">Manage public notices, announcements, and news</p>
        </div>
        
        <NoticesManager initialNotices={allNotices as unknown as Notice[]} />
      </div>
    </AuthenticatedLayout>
  );
}
