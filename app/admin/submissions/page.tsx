import { db } from "@/db";
import { formSubmissions, forms } from "@/db/forms-schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";
import SubmissionStatus from "@/components/forms/SubmissionStatus";
import { Eye, Download, ClipboardList } from "lucide-react";

export default async function AllSubmissionsPage() {
  const submissions = await db
    .select({
      id: formSubmissions.id,
      submissionCode: formSubmissions.submissionCode,
      status: formSubmissions.status,
      submittedAt: formSubmissions.submittedAt,
      dueAt: formSubmissions.dueAt,
      formId: formSubmissions.formId,
      formName: forms.name,
      formCategory: forms.category,
    })
    .from(formSubmissions)
    .leftJoin(forms, eq(formSubmissions.formId, forms.id))
    .orderBy(desc(formSubmissions.createdAt))
    .limit(200);

  const pending = submissions.filter((s) => ["submitted", "pending"].includes(s.status)).length;
  const overdue = submissions.filter((s) =>
    s.dueAt && new Date(s.dueAt) < new Date() && !["approved", "completed", "rejected"].includes(s.status)
  ).length;

  const CATEGORY_PREFIX: Record<string, string> = {
    loan: "LOAN", savings: "SAV", fertilizer: "FER",
    member_services: "MEM", complaint: "CMP", hr: "HR", share: "SHR", custom: "GEN",
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">All Submissions</h1>
            <p className="text-slate-500 mt-1">Manage all form submissions across the system</p>
          </div>
          <div className="flex gap-2">
            {pending > 0 && (
              <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-bold rounded-xl">
                {pending} pending review
              </span>
            )}
            {overdue > 0 && (
              <span className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-bold rounded-xl">
                ⚠ {overdue} overdue
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Submissions ({submissions.length})</h2>
            <Link href="/admin/forms" className="text-sm text-emerald-600 hover:text-emerald-800 font-medium">
              Manage Forms →
            </Link>
          </div>

          {submissions.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Form</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Due</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {submissions.map((sub) => {
                    const isOverdue = sub.dueAt && new Date(sub.dueAt) < new Date() &&
                      !["approved", "completed", "rejected"].includes(sub.status);
                    return (
                      <tr key={sub.id} className={`hover:bg-slate-50 transition-colors ${isOverdue ? "bg-red-50/30" : ""}`}>
                        <td className="px-6 py-3">
                          <span className="font-mono text-sm font-bold text-slate-800">{sub.submissionCode}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-700 text-sm truncate max-w-[150px]">{sub.formName ?? "Unknown"}</p>
                          <p className="text-xs text-slate-400">{sub.formCategory}</p>
                        </td>
                        <td className="px-4 py-3">
                          <SubmissionStatus status={sub.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString("ne-NP") : "Draft"}
                        </td>
                        <td className="px-4 py-3">
                          {sub.dueAt ? (
                            <span className={`text-xs ${isOverdue ? "text-red-600 font-bold" : "text-slate-400"}`}>
                              {isOverdue ? "⚠ " : ""}{new Date(sub.dueAt).toLocaleDateString("ne-NP")}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/submissions/${sub.id}`}
                            className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 font-medium">
                            <Eye className="w-3.5 h-3.5" /> View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
