import { db } from "@/db";
import { gallery } from "@/db/schema";
import GalleryManager, { GalleryItem } from "@/components/admin/GalleryManager";
import { desc } from "drizzle-orm";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

export default async function AdminGalleryPage() {
  const images = await db.select().from(gallery).orderBy(desc(gallery.createdAt));
  
  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gallery Management</h1>
          <p className="text-slate-500 mt-1">Upload and manage site photos and categories</p>
        </div>
        <GalleryManager initialImages={images as unknown as GalleryItem[]} />
      </div>
    </AuthenticatedLayout>
  );
}
