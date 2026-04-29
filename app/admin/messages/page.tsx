import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";
import MessageManager from "@/components/admin/MessageManager";

export default async function AdminMessagesPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Messages</h1>
        <p className="text-slate-500 mt-2 font-medium">View and manage contact form submissions from the website.</p>
      </div>
        <MessageManager />
      </div>
    </AuthenticatedLayout>
  );
}
