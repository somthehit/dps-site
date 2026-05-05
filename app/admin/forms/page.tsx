import { db } from "@/db";
import { forms, formSubmissions } from "@/db/forms-schema";
import { isNull, desc, eq, count } from "drizzle-orm";
import Link from "next/link";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";
import {
  Plus, FileText, Eye, Copy, Archive, Trash2,
  Settings, BarChart2, CheckCircle, Clock, XCircle,
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  loan: "Loan / ऋण",
  savings: "Savings / बचत",
  fertilizer: "Fertilizer / मल",
  member_services: "Member Services / सदस्य सेवा",
  complaint: "Complaint / गुनासो",
  hr: "HR",
  share: "Share / शेयर",
  custom: "Custom / अन्य",
};

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-100 text-emerald-700",
  unpublished: "bg-amber-100 text-amber-700",
  archived: "bg-red-100 text-red-700",
};

export default async function AdminFormsPage() {
  const allForms = await db
    .select()
    .from(forms)
    .where(isNull(forms.deletedAt))
    .orderBy(desc(forms.createdAt));

  const submissionCounts = await db
    .select({ formId: formSubmissions.formId, c: count() })
    .from(formSubmissions)
    .groupBy(formSubmissions.formId);
  const countMap = Object.fromEntries(submissionCounts.map((r) => [r.formId, r.c]));

  const stats = {
    total: allForms.length,
    published: allForms.filter((f) => f.status === "published").length,
    draft: allForms.filter((f) => f.status === "draft").length,
    archived: allForms.filter((f) => f.isArchived).length,
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Form Builder</h1>
            <p className="text-slate-500 mt-1">Create and manage dynamic forms / गतिशील फाराम व्यवस्थापन</p>
          </div>
          <Link
            href="/admin/forms/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Form
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Forms", value: stats.total, icon: FileText, color: "bg-blue-50 text-blue-600" },
            { label: "Published", value: stats.published, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
            { label: "Drafts", value: stats.draft, icon: Clock, color: "bg-amber-50 text-amber-600" },
            { label: "Archived", value: stats.archived, icon: Archive, color: "bg-slate-50 text-slate-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Forms Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">All Forms</h2>
            <Link href="/admin/forms/analytics" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
              <BarChart2 className="w-4 h-4" /> Analytics
            </Link>
          </div>

          {allForms.length === 0 ? (
            <div className="py-20 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No forms yet</p>
              <p className="text-slate-400 text-sm mt-1">Create your first form to get started</p>
              <Link href="/admin/forms/new"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all">
                <Plus className="w-4 h-4" /> Create Form
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {allForms.map((form) => (
                <div key={form.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 truncate">{form.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_STYLE[form.status] ?? STATUS_STYLE.draft}`}>
                        {form.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      /{form.slug} · {CATEGORY_LABELS[form.category] ?? form.category}
                      · {countMap[form.id] ?? 0} submissions
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/admin/forms/${form.id}/builder`}
                      title="Builder"
                      className="p-2 hover:bg-emerald-50 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors">
                      <Settings className="w-4 h-4" />
                    </Link>
                    <Link href={`/admin/forms/${form.id}/preview`}
                      title="Preview"
                      className="p-2 hover:bg-blue-50 rounded-lg text-slate-500 hover:text-blue-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link href={`/admin/forms/${form.id}/submissions`}
                      title="Submissions"
                      className="p-2 hover:bg-violet-50 rounded-lg text-slate-500 hover:text-violet-600 transition-colors">
                      <BarChart2 className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
