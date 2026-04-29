import PublicUsersManager from "@/components/admin/PublicUsersManager";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

export const metadata = {
  title: "Registration Applications | Admin",
};

export default function PublicUsersAdminPage() {
  return (
    <AuthenticatedLayout>
      <PublicUsersManager />
    </AuthenticatedLayout>
  );
}
