import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";
import NewFormClient from "./NewFormClient";

export default function NewFormPage() {
  return (
    <AuthenticatedLayout>
      <NewFormClient />
    </AuthenticatedLayout>
  );
}
