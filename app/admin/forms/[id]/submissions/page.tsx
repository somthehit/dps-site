import { db } from "@/db";
import { forms, formSubmissions, formFields } from "@/db/forms-schema";
import { publicUsers } from "@/db/schema";
import { eq, desc, count, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";
import SubmissionStatus from "@/components/forms/SubmissionStatus";
import { ArrowLeft, Download, Eye, BarChart2 } from "lucide-react";

const STATUS_COUNTS = ["submitted", "pending", "approved", "rejected", "processing", "completed"];

export default async function FormSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [form] = await db.select().from(forms).where(eq(forms.id, id));
  if (!form || form.deletedAt) notFound();

  const submissions = await db
    .select({
      id: formSubmissions.id,
      submissionCode: formSubmissions.submissionCode,
      status: formSubmissions.status,
      submittedAt: formSubmissions.submittedAt,
      createdAt: formSubmissions.createdAt,
      dueAt: formSubmissions.dueAt,
      memberId: formSubmissions.memberId,
    })
    .from(formSubmissions)
    .where(eq(formSubmissions.formId, id))
    .orderBy(desc(formSubmissions.createdAt));

  const statusCounts = STATUS_COUNTS.reduce((acc, s) => {
    acc[s] = submissions.filter((sub) => sub.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const totalSubmissions = submissions.length;
  const pendingApprovals = submissions.filter((s) => ["submitted", "pending"].includes(s.status)).length;
  const overdueCount = submissions.filter((s) =>
    s.dueAt && new Date(s.dueAt) < new Date() && !["approved", "completed", "rejected"].includes(s.status)
  ).length;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/forms" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{form.name}</h1>
              <p className="text-slate-400 text-sm">/{form.slug} · Submissions</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`/api/submissions/export?formId=${id}&format=csv`}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all"
            >
              <Download className="w-4 h-4" /> Export CSV
            </a>
            <Link href={`/admin/forms/${id}/builder`}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all">
              Edit Form
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", value: totalSubmissions, color: "text-slate-700" },
            { label: "Pending Review", value: pendingApprovals, color: "text-amber-600" },
            { label: "Approved", value: statusCounts.approved ?? 0, color: "text-emerald-600" },
            { label: "Overdue", value: overdueCount, color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Submissions table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Submissions ({totalSubmissions})</h2>
          </div>

          {submissions.length === 0 ? (
            <div className="py-16 text-center">
              <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No submissions yet</p>
              <p className="text-slate-400 text-sm mt-1">Share the form with members to start receiving submissions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Code</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Submitted</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Due</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {submissions.map((sub) => {
                    const isOverdue = sub.dueAt && new Date(sub.dueAt) < new Date() &&
                      !["approved", "completed", "rejected"].includes(sub.status);
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3">
                          <span className="font-mono text-sm font-bold text-slate-800">{sub.submissionCode}</span>
                        </td>
                        <td className="px-4 py-3">
                          <SubmissionStatus status={sub.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString("ne-NP") : "Draft"}
                        </td>
                        <td className="px-4 py-3">
                          {sub.dueAt ? (
                            <span className={isOverdue ? "text-red-600 font-semibold text-xs" : "text-slate-400 text-xs"}>
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
