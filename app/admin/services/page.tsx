import { db } from "@/db";
import { services } from "@/db/schema";
import ServicesManager from "@/components/admin/ServicesManager";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

type Service = {
  id: string;
  titleEn: string;
  titleNe: string;
  descEn: string;
  descNe: string;
  category: string;
  icon: string;
  imageKey?: string | null;
  featuresEn: string[] | null;
  featuresNe: string[] | null;
};

export default async function AdminServicesPage() {
  let allServices: Service[] = [];
  let error = null;
  
  try {
    allServices = await db.select().from(services);
  } catch (e) {
    console.error("Failed to fetch services:", e);
    error = "Could not load services from database.";
  }
  
  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Services Management</h1>
          <p className="text-slate-500 mt-1">Manage savings, loans, and agricultural services</p>
        </div>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
            {error}
          </div>
        )}
        <ServicesManager initialServices={allServices} />
      </div>
    </AuthenticatedLayout>
  );
}
