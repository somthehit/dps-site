import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";
import MemberForm from "@/components/admin/MemberForm";

export default function NewMemberPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">New Member Registration</h1>
          <p className="text-slate-500 mt-2 font-medium">Please fill out all the required information to register a new member.</p>
        </div>

        <MemberForm />
      </div>
    </AuthenticatedLayout>
  );
}
