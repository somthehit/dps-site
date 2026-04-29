import { db } from "@/db";
import { newsTicker } from "@/db/schema";
import { asc } from "drizzle-orm";
import TickerManager from "@/components/admin/TickerManager";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

export default async function NewsTickerPage() {
  const items = await db.select().from(newsTicker).orderBy(asc(newsTicker.sortOrder));
  
  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">News Ticker</h1>
          <p className="text-slate-500">Manage the scrolling announcements at the top of the homepage.</p>
        </div>
        
        <TickerManager initialItems={items} />
      </div>
    </AuthenticatedLayout>
  );
}
