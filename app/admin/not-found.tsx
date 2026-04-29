import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

export default function AdminNotFound() {
  return (
    <AuthenticatedLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mb-8">
          <FileQuestion className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Page Not Found</h1>
        <p className="text-slate-500 max-w-md mb-10">
          The administrative page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/admin">
          <Button className="bg-brand-700 hover:bg-brand-800 gap-2 px-8 py-6 rounded-2xl font-bold">
            <Home className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </AuthenticatedLayout>
  );
}
